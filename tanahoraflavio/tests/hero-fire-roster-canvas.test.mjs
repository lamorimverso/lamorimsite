import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {readFileSync} from 'node:fs';
import {PURSUERS} from '../runner-core.mjs';
const require=createRequire(import.meta.url);let canvas;try{canvas=require('@napi-rs/canvas');}catch{if(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES)try{canvas=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/@napi-rs/canvas');}catch{}}
async function artwork(t){
 const {Image}=canvas,prior=Object.getOwnPropertyDescriptor(globalThis,'Image');globalThis.Image=class extends Image{set src(v){this.url=v;super.src=fileURLToPath(v);}get src(){return this.url;}get naturalWidth(){return this.width;}get naturalHeight(){return this.height;}};t.after(()=>prior?Object.defineProperty(globalThis,'Image',prior):delete globalThis.Image);
 const url=new URL('../runner-art.mjs',import.meta.url),source=readFileSync(url,'utf8'),spec=source.match(/from ["']([^"']*runner-sprites[^"']*)["']/)[1];await (await import(new URL(spec,url))).loadSprites();return import(url);
}
const opaque=data=>data.reduce((n,v,i)=>n+(i%4===3&&v>80?1:0),0);
test('cada perseguidor de solo possui corpo visível e quatro passadas distintas',{skip:!canvas},async t=>{
 const art=await artwork(t),missing=[],still=[];
 for(const {type,width,height} of PURSUERS.filter(p=>!['barrier','case'].includes(p.type))){
  const legs=[];
  for(let phase=0;phase<4;phase++){
   const c=canvas.createCanvas(260,180).getContext('2d');art.drawThreat(c,{type,x:110,width,height,action:'jump'},150,phase,{reducedMotion:true});
   if(opaque(c.getImageData(0,0,260,180).data)<150)missing.push(type);
   legs.push(Buffer.from(c.getImageData(40,115,180,42).data).toString('base64'));
  }
  if(new Set(legs).size<3)still.push(type);
 }
 assert.deepEqual({missing:[...new Set(missing)],still},{missing:[],still:[]},'corpos visíveis e passadas essenciais, inclusive com efeitos reduzidos');
});
test('tiro do herói tem corpo próprio com soltura, recuo e retorno, de pé, no salto e slide',{skip:!canvas},async t=>{
 const art=await artwork(t);assert.equal(typeof art.drawHeroShot,'function','animação corporal de disparo deve existir');
 for(const crouching of [false,true])for(const airborne of [false,true]){
  const poses=[];for(const age of [0,.08,.18]){
   const c=canvas.createCanvas(260,180).getContext('2d');assert.equal(art.drawHeroShot(c,{x:130,y:150,phase:2,age,crouching,airborne,facing:1}),true);
   const data=c.getImageData(0,0,260,180).data;assert.ok(opaque(data)>300,'corpo desenhado');poses.push(data);
  }
  assert.notDeepEqual(poses[0],poses[1],'recuo muda braço/torso');assert.notDeepEqual(poses[1],poses[2],'recuperação não fica congelada');
 }
});
test('todos os apoios e as duas formas do herói possuem desenhos animados próprios',{skip:!canvas},async t=>{
 const art=await artwork(t),{ALLIES}=await import('../runner-allies.mjs');
 for(const type of ['flavio','ze-gotinha','jacare','joice',...ALLIES.map(a=>a.id)]){
  const poses=[];for(let phase=0;phase<4;phase++){
   const c=canvas.createCanvas(260,180).getContext('2d');assert.equal(art.drawActor(c,{type,x:130,y:150,phase,scale:.95}),true,type+' possui arte');
   const data=c.getImageData(0,0,260,180).data;assert.ok(opaque(data)>150,type+' tem pixels visíveis');poses.push(Buffer.from(data).toString('base64'));
  }assert.ok(new Set(poses).size>=3,type+' não fica preso em um quadro');
 }
});
test('os vinte encontros desenham cabeça e corpo e articulam carga e soltura',{skip:!canvas},async t=>{
 await artwork(t);const {storyBossAt}=await import('../runner-bosses.mjs'),{drawHoverEnemy}=await import('../runner-boss-art.mjs');
 for(let i=0;i<20;i++){
  const boss=storyBossAt(i),poses=[];for(const flags of [{preparing:true,progress:.8},{attacking:true,progress:.7},{recovering:true,progress:.5}]){
   const c=canvas.createCanvas(260,210).getContext('2d');drawHoverEnemy(c,{type:boss.type,classId:boss.classId,x:130,y:160,phase:2,...flags});
   assert.ok(opaque(c.getImageData(65,38,125,65).data)>150,boss.id+' cabeça visível');
   const data=c.getImageData(30,30,200,132).data;assert.ok(opaque(data)>500,boss.id+' corpo completo');poses.push(data);
  }assert.notDeepEqual(poses[0],poses[1],boss.id+' prepara e dispara');assert.notDeepEqual(poses[1],poses[2],boss.id+' recupera');
 }
});
test('boca visual do tiro espelha junto com o braço e coincide com o disparo físico',{skip:!canvas},async t=>{
 const art=await artwork(t),core=await import('../runner-core.mjs');
 for(const crouching of [false,true])for(const facing of [-1,1]){
  const r=core.createRun();r.player.x=113;r.player.y=12;r.player.crouching=crouching;
  const muzzle=core.heroMuzzleFor(r,facing);assert.equal(muzzle.x,130+facing*15);assert.equal(muzzle.y,12+(crouching?18:38));
  const c=canvas.createCanvas(260,180).getContext('2d');art.drawHeroShot(c,{x:130,y:150,phase:0,age:0,crouching,facing});
  const d=c.getImageData(130+facing*27-3,150-(crouching?18:38)-4,7,9).data;
  assert.ok(d.some((v,i)=>i%4===0&&v>230&&d[i+1]>150&&d[i+2]<220&&d[i+3]>100),'clarão junto à mão no lado '+facing);
 }
});
