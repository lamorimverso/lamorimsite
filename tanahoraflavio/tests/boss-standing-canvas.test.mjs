import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {readFileSync} from 'node:fs';

const require=createRequire(import.meta.url);
let canvas;
try{canvas=require('@napi-rs/canvas');}catch{if(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES){try{canvas=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/@napi-rs/canvas');}catch{}}}

test('real Canvas draws complete illustrated figures with planted feet, visible ship and distinct combat frames',{skip:!canvas&&'Native Canvas is optional for local pixel QA'},async t=>{
 const {createCanvas,Image}=canvas,previous=Object.getOwnPropertyDescriptor(globalThis,'Image');
 globalThis.Image=class extends Image{set src(value){this.sourceURL=value;super.src=fileURLToPath(value);}get src(){return this.sourceURL;}get naturalWidth(){return this.width;}get naturalHeight(){return this.height;}};
 t.after(()=>previous?Object.defineProperty(globalThis,'Image',previous):delete globalThis.Image);
 const artURL=new URL('../runner-boss-art.mjs',import.meta.url);
 const spriteSpecifier=readFileSync(artURL,'utf8').match(/from '([^']*runner-sprites[^']*)'/)[1];
 const sprites=await import(new URL(spriteSpecifier,artURL));await sprites.loadSprites();
 const {drawHoverEnemy,drawBossArena}=await import('../runner-boss-art.mjs');
 function render(type,flags={}){const img=createCanvas(260,230),c=img.getContext('2d');drawHoverEnemy(c,{type,x:140,y:160,scale:1,phase:5,...flags});return {c,pixels:c.getImageData(0,0,260,230).data};}
 for(const type of ['haddad','lula','xandao','janones','pf','bossonari','meme-army']){
  const {c,pixels}=render(type),charge=render(type,{preparing:true}).pixels,release=render(type,{attacking:true}).pixels;
  assert.ok(c.getImageData(130,157,20,7).data.some((v,i)=>i%4===3&&v>128),'feet and platform are visible together');
  assert.ok(c.getImageData(95,170,90,22).data.some((v,i)=>i%4===3&&v>128),'hull and motor pixels below feet');
  assert.ok(c.getImageData(118,48,50,42).data.some((v,i)=>i%4===3&&v>128),'head/hat visible above standing torso');
  assert.notDeepEqual(pixels,charge);assert.notDeepEqual(charge,release);
  assert.deepEqual(render(type,{phase:0,reducedMotion:true}).pixels,render(type,{phase:90,reducedMotion:true}).pixels);
  assert.equal(c.globalAlpha,1);assert.deepEqual(c.getTransform(),createCanvas(1,1).getContext('2d').getTransform());
 }
 // Complete ghost drawings may change shoe shape, but their support baseline stays on the deck.
 const {combatGeometryFor}=await import('../runner-combat-geometry.mjs');
 for(const frame of [0,1,2,3]){const g=combatGeometryFor('meme-army',{frame});assert.ok(Math.abs(g.rect.y+g.rect.height)<2,'sole remains on deck');}
 const identities=['flavio','haddad','lula','xandao','janones','pf','army','joice','dilma','simone','soraya','ze-gotinha','vorcaro','jair','michelle','eduardo','carlos','renan','silas','magno','nikolas','tarcisio','damares','bia','trump','milei','bolsominion','jacare','boulos','dino'];
 for(const type of identities){const c=createCanvas(150,80).getContext('2d');assert.equal(sprites.drawSpriteHead(c,{type,x:65,y:65,size:45}),true);const data=c.getImageData(0,0,150,80).data;assert.ok(data.some((v,i)=>i%4===3&&v>200),`${type} contains real visible atlas pixels`);}
 const a=createCanvas(900,300).getContext('2d'),b=createCanvas(900,300).getContext('2d');drawBossArena(a,{phase:0,reducedMotion:true});drawBossArena(b,{phase:80,reducedMotion:true});assert.deepEqual(a.getImageData(0,0,900,300).data,b.getImageData(0,0,900,300).data);
 function arenaPixels(state,phase=0){const c=createCanvas(900,300).getContext('2d');drawBossArena(c,{state,phase,reducedMotion:true});return c.getImageData(0,0,900,300).data;}
 assert.notDeepEqual(arenaPixels('phase2'),arenaPixels('idle'),'phase-two marks produce visible pixels with reduced motion');
 assert.deepEqual(arenaPixels('phase2'),arenaPixels('phase2',90));
 for(const phase of ['charge','attack','recover'])assert.notDeepEqual(arenaPixels({phase,enraged:true}),arenaPixels({phase,enraged:false}));
});
