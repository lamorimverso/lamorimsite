import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {redesignDefinitions} from '../tanahoraflavio/runner-redesign-data.mjs';
import {spriteFrameFor,spriteDefinitions} from '../tanahoraflavio/runner-sprites.mjs';
import {combatFrameFor} from '../tanahoraflavio/runner-combat-geometry.mjs';
import {createCanvas,Image} from '@napi-rs/canvas';
import {fileURLToPath} from 'node:url';
import {loadSprites,drawActor} from '../tanahoraflavio/runner-art.mjs';
import {heroStridePhase} from '../tanahoraflavio/runner-drawn-motion.mjs';

test('a passada do Flávio acompanha a distância física, sem saltar ao trocar de mapa ou variar a cadência dos quadros',()=>{
 const sample=(fps,speed)=>{
  const run={status:'running',distance:1234,elapsed:0,routeDistance:7000};
  for(let i=0;i<fps;i++){run.distance+=speed/fps;run.elapsed+=1/fps;if(i===Math.floor(fps/2))run.routeDistance=0;}
  return heroStridePhase(run);
 };
 for(const speed of [210,270,535])for(const fps of [30,60,120])assert.ok(Math.abs(sample(fps,speed)-(1234+speed)/18)<1e-8);
 assert.ok(sample(60,535)>sample(60,270),'acelerar o mundo acelera a passada');
 assert.equal(heroStridePhase({status:'ready',distance:3000}),0);
 assert.equal(heroStridePhase({status:'running',distance:NaN}),0);
 assert.equal(heroStridePhase({status:'running',distance:-1}),0);
});

test('o elenco redesenhado carrega os atlas novos e usa oito desenhos reais por passada',async()=>{
 for(const [name,d] of Object.entries(redesignDefinitions)){
  assert.equal(spriteDefinitions[name].sha256,d.sha256,name+' deve carregar a arte nova');
  assert.equal(createHash('sha256').update(await readFile(new URL(d.url))).digest('hex'),d.sha256);
  assert.ok(d.frames.length===32||d.frames.length===24);
  for(const f of d.frames)assert.ok(f.x>=0&&f.y>=0&&f.x+f.width<=d.width&&f.y+f.height<=d.height);
 }
 for(const type of ['vorcaro','jair','michelle','eduardo','carlos','renan','silas','magno','nikolas','tarcisio','damares','bia','trump','milei','bolsominion','jacare','dilma','simone','soraya','ze-gotinha','haddad','lula','xandao','joice','boulos','dino','janones','pf']){
  const frames=Array.from({length:8},(_,i)=>spriteFrameFor(type,{phase:i/2}));
  assert.equal(new Set(frames.map(f=>f.index)).size,8,type+' oito poses, sem repetir apenas quatro');
 }
});
test('preparo, soltura e recuperação percorrem desenhos intermediários sem alterar as poses de movimento reduzido',()=>{
 for(const type of ['haddad','lula','xandao','janones','joice','dilma','simone','soraya','boulos','dino','bossonari','army','pf']){
  const neutral=combatFrameFor(type,{phase:0}),breath=combatFrameFor(type,{phase:7});
  const early=combatFrameFor(type,{preparing:true,progress:.4}),loaded=combatFrameFor(type,{preparing:true,progress:.9});
  const release=combatFrameFor(type,{attacking:true,progress:0}),follow=combatFrameFor(type,{attacking:true,progress:.4});
  const recoil=combatFrameFor(type,{recovering:true,progress:.2}),settle=combatFrameFor(type,{recovering:true,progress:.9});
  assert.equal(new Set([neutral,breath,early,loaded,release,follow,recoil,settle].map(f=>f.index)).size,8,type);
  assert.deepEqual(combatFrameFor(type,{phase:0,reducedMotion:true}),combatFrameFor(type,{phase:70,reducedMotion:true}));
  assert.equal(combatFrameFor(type,{attacking:true,progress:0,reducedMotion:true}).index,release.index);
 }
});
test('as oito poses chegam ao Canvas e mudam a silhueta das pernas, sem ficar só no seletor',async()=>{
 const previous=globalThis.Image;
 globalThis.Image=class extends Image{set src(value){super.src=fileURLToPath(value);}get naturalWidth(){return this.width;}get naturalHeight(){return this.height;}};
 try{
  await loadSprites();
  for(const type of ['pf','janones','boulos','dino','dilma','simone','soraya','joice','haddad','lula','xandao','vorcaro','jair','michelle','eduardo','carlos','renan','silas','magno','nikolas','tarcisio','damares','bia','trump','milei','bolsominion','jacare']){
   const silhouettes=[];
   for(let i=0;i<8;i++){
    const c=createCanvas(240,180).getContext('2d');
    assert.equal(drawActor(c,{type,x:120,y:150,scale:type==='jacare'?2:1,phase:i/2}),true,type);
    const pixels=c.getImageData(20,type==='jacare'?120:112,200,42).data;
    const mask=Buffer.from(Array.from({length:pixels.length/4},(_,n)=>pixels[n*4+3]>128?255:0));
    silhouettes.push(createHash('sha256').update(mask).digest('hex'));
   }
   assert.ok(new Set(silhouettes).size>=7,type+' precisa de desenhos distintos nas pernas');
  }
 }finally{if(previous)globalThis.Image=previous;else delete globalThis.Image;}
});
