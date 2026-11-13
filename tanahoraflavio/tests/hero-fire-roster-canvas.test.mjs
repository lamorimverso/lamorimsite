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
test('os24 encontros desenham cabeça e corpo e articulam carga e soltura',{skip:!canvas},async t=>{
 await artwork(t);const {storyBossAt}=await import('../runner-bosses.mjs'),{drawHoverEnemy}=await import('../runner-boss-art.mjs');
 for(let i=0;i<24;i++){
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
  const {heroShotPose}=await import('../runner-hero-shot.mjs');
  const pose=heroShotPose({crouching,airborne:true,facing}),muzzle=core.heroMuzzleFor(r,facing);
  assert.equal(muzzle.x,130+pose.muzzle.x);assert.equal(muzzle.y,12-pose.muzzle.y);
  const c=canvas.createCanvas(260,180).getContext('2d');art.drawHeroShot(c,{x:130,y:150,phase:0,age:0,crouching,airborne:true,facing});
  const d=c.getImageData(Math.round(130+pose.muzzle.x+facing*8)-4,Math.round(150+pose.muzzle.y)-4,9,9).data;
  assert.ok(d.some((v,i)=>i%4===0&&v>230&&d[i+1]>150&&d[i+2]<220&&d[i+3]>100),'clarão junto ao telefone no lado '+facing);

 }
});

test('cada quadro de combate desenha uma figura inteira em uma única chamada, sem colagem de cabeça',{skip:!canvas},async t=>{
 await artwork(t);
 const url=new URL('../runner-boss-art.mjs',import.meta.url),spec=readFileSync(url,'utf8').match(/from ["']([^"']*runner-sprites[^"']*)["']/)[1];
 const sprites=await import(new URL(spec,url)),{combatActors}=await import('../runner-combat-sprite-data.mjs'),{combatGeometryFor}=await import('../runner-combat-geometry.mjs');
 for(const type of Object.keys(combatActors))for(const frame of [0,1,2,3]){
  const c=canvas.createCanvas(260,200).getContext('2d'),draw=c.drawImage.bind(c),calls=[];
  c.drawImage=(...args)=>{calls.push(args);draw(...args);};
  assert.equal(sprites.drawCombatSprite(c,{type,x:130,y:160,frame}),true,type);
  assert.equal(calls.length,1,'one full figure, no separate head/body layers');
  const g=combatGeometryFor(type,{frame});assert.deepEqual(calls[0].slice(1,5),[g.frame.x,g.frame.y,g.frame.width,g.frame.height]);
  assert.ok(opaque(c.getImageData(0,0,260,200).data)>300,type+' full frame has visible pixels');
 }
});

test('os seis uniformes regionais usam os quadros completos corretos nos dois sentidos',{skip:!canvas},async t=>{
 const art=await artwork(t),{SOLDIER_VARIANTS}=await import('../runner-soldier-variants.mjs'),{combatGeometryFor}=await import('../runner-combat-geometry.mjs');
 const identities=[];
 for(const [armyVariant,variant] of Object.entries(SOLDIER_VARIANTS)){
  const frames=[];
  for(const approach of ['front','rear'])for(let phase=0;phase<4;phase++){
   const c=canvas.createCanvas(260,200).getContext('2d'),draw=c.drawImage.bind(c),calls=[];
   c.drawImage=(...args)=>{calls.push(args);draw(...args);};
   art.drawThreat(c,{type:'army',x:110,width:40,height:47,armyVariant,approach},160,phase,{reducedMotion:true,weaponEffects:false});
   assert.equal(calls.length,1,'uniforme é figura inteira');
   const g=combatGeometryFor(variant.actor,{frame:phase});assert.deepEqual(calls[0].slice(1,5),[g.frame.x,g.frame.y,g.frame.width,g.frame.height]);
   frames.push(Buffer.from(c.getImageData(0,0,260,200).data).toString('base64'));
  }
  assert.equal(new Set(frames).size,8,'quatro passadas próprias e orientação real');identities.push(frames[0]);
 }
 assert.equal(new Set(identities).size,6,'cada cenário tem desenho diferente');
});
