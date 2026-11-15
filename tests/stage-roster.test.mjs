import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {readFileSync} from 'node:fs';
import {STORY_ROSTERS,stageRosterFor,regionalEmitterFor} from '../tanahoraflavio/runner-stage-roster.mjs';
import {regularEmitterPose,regularCastMuzzle} from '../tanahoraflavio/runner-cast-pose.mjs';
import {combatGeometryFor} from '../tanahoraflavio/runner-combat-geometry.mjs';

const stages=['brasilia','rio','sao-paulo','argentina','paraguai','florida','casa-branca','brasilia-final'];
const ground=[['pf','barrier'],['orla-runner','barrier'],['paulista-runner','arrow-panel'],['route-scout','case'],['army','barrier'],['terminal-guard','case'],['meme-ghost','barrier'],['lula-runner','ze-gotinha-rival']];
const overhead=[['pf','handcuffs'],['orla-runner','signal-flare'],['paulista-runner','arrow-panel'],['route-scout','receipts'],['army','signal-flare'],['terminal-guard','receipts'],['meme-ghost','meme-ghost'],['lula-runner','lhand']];
const visual=[{type:'pf'},{type:'army',armyVariant:'rio'},{type:'pf'},{type:'army',armyVariant:'argentina'},{type:'army',armyVariant:'paraguai'},{type:'army',armyVariant:'florida'},{type:'meme-army'},{type:'lula'}];

test('oito localidades preservam seus perseguidores e suas armas sem misturar chefes',()=>{
 assert.deepEqual(STORY_ROSTERS.map(r=>r.stageId),stages);
 const allowed=new Set(['pf','army','orla-runner','paulista-runner','route-scout','terminal-guard','arrow-panel','lula-runner','ze-gotinha-rival','meme-ghost','barrier','case']);
 for(const [i,stageId] of stages.entries()){
  const r=stageRosterFor(stageId);assert.equal(r,STORY_ROSTERS[i]);assert.deepEqual(r.ground,ground[i]);
  assert.deepEqual(r.overhead,[{actor:overhead[i][0],weapon:overhead[i][1]}]);
  assert.ok(r.ground.every(actor=>allowed.has(actor))&&r.overhead.every(({actor})=>allowed.has(actor)));
  assert.ok(Object.isFrozen(r)&&Object.isFrozen(r.ground)&&Object.isFrozen(r.overhead)&&r.overhead.every(Object.isFrozen));
 }
 assert.ok(Object.isFrozen(STORY_ROSTERS));
 for(const missing of [undefined,null,'unknown','__proto__',7])assert.equal(stageRosterFor(missing),STORY_ROSTERS[0]);
});

test('aliases regionais usam a mesma figura inteira e origem física da soltura em ambas as larguras',()=>{
 for(const [i,stageId] of stages.entries())for(const width of [480,900]){
  const actor=overhead[i][0],resolved=regionalEmitterFor(actor,stageId);assert.deepEqual(resolved,visual[i]);
  const pose=regularEmitterPose(actor,width,246),g=combatGeometryFor(resolved.type,{...resolved,frame:2,scale:pose.scale});
  assert.ok(g,actor+' precisa de quadro de combate completo');
  assert.deepEqual(regularCastMuzzle(actor,width,246,19,stageId),{x:pose.x+g.muzzle.x,y:246-pose.y-g.muzzle.y});
  for(const frame of [0,1,2,3]){
   const box=combatGeometryFor(resolved.type,{...resolved,frame,scale:pose.scale}).rect;
   assert.ok(pose.y+box.y>=0&&pose.x+box.x>=0&&pose.x+box.x+box.width<=width,actor+' figura cabe inteira');
  }
 }
 for(const type of ['joice','janones','lula','army-rio-combat'])assert.deepEqual(regionalEmitterFor(type),{type},'identidades existentes não mudam');
 assert.deepEqual(regionalEmitterFor('ze-gotinha-rival'),{type:'ze-gotinha'});
});

const require=createRequire(import.meta.url);let canvas;
try{canvas=require('@napi-rs/canvas');}catch{if(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES)try{canvas=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/@napi-rs/canvas');}catch{}}
test('cada emissor local desenha um único corpo completo animado com clarão na origem verdadeira',{skip:!canvas},async t=>{
 const previous=Object.getOwnPropertyDescriptor(globalThis,'Image'),{Image,createCanvas}=canvas;
 globalThis.Image=class extends Image{set src(v){this.url=v;super.src=fileURLToPath(v);}get src(){return this.url;}get naturalWidth(){return this.width;}get naturalHeight(){return this.height;}};
 t.after(()=>previous?Object.defineProperty(globalThis,'Image',previous):delete globalThis.Image);
 const artURL=new URL('../tanahoraflavio/runner-boss-art.mjs',import.meta.url),spec=readFileSync(artURL,'utf8').match(/from ['"]([^'"]*runner-sprites[^'"]*)['"]/)[1];
 await (await import(new URL(spec,artURL))).loadSprites();
 const {drawHoverEnemy}=await import(artURL);
 const opaque=data=>data.reduce((n,v,i)=>n+(i%4===3&&v>80?1:0),0);
 for(const [i,stageId] of stages.entries()){
  const actor=overhead[i][0],pose=regularEmitterPose(actor,480,246),frames=[];
  for(const flags of [{preparing:true,progress:.8},{attacking:true,progress:0},{recovering:true,progress:.2}]){
   const c=createCanvas(480,300).getContext('2d'),draw=c.drawImage.bind(c),calls=[];c.drawImage=(...args)=>{calls.push(args);draw(...args);};
   drawHoverEnemy(c,{type:actor,stageId,...pose,phase:19,...flags});
   assert.equal(calls.length,1,actor+' deve desenhar um corpo do atlas, sem cabeça separada');
   const expected=combatGeometryFor(visual[i].type,{...visual[i],...flags});
   assert.deepEqual(calls[0].slice(1,5),[expected.frame.x,expected.frame.y,expected.frame.width,expected.frame.height]);
   assert.ok(opaque(c.getImageData(390,15,90,55).data)>120,actor+' cabeça e chapéu visíveis');
   assert.ok(opaque(c.getImageData(350,15,130,100).data)>500,actor+' corpo inteiro visível');
   if(flags.attacking){
    const muzzle=regularCastMuzzle(actor,480,246,19,stageId),yy=246-muzzle.y;
    const data=c.getImageData(Math.round(muzzle.x)-5,Math.round(yy)-5,11,11).data;
    assert.ok(data.some((v,k)=>k%4===0&&v>220&&data[k+1]>180&&data[k+2]>130&&data[k+3]>100),actor+' clarão acompanha boca real do disparo');
   }
   frames.push(c.getImageData(350,0,130,150).data);
  }
  assert.notDeepEqual(frames[0],frames[1],actor+' prepara e solta');assert.notDeepEqual(frames[1],frames[2],actor+' recupera');
 }
});
