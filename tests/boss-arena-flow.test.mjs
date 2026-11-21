import test from 'node:test';
import assert from 'node:assert/strict';
import {createCanvas,Image} from '@napi-rs/canvas';
import {fileURLToPath} from 'node:url';
import {pilotDodge} from '../tools/story-pilot.mjs';
import * as core from '../tanahoraflavio/runner-core.mjs';
import {storyBossAt,nextStoryBossDistance} from '../tanahoraflavio/runner-bosses.mjs';
import {heroStridePhase} from '../tanahoraflavio/runner-drawn-motion.mjs';
import * as art from '../tanahoraflavio/runner-boss-art.mjs';
const dt=1/120;
function scene(seed=32,width=480){
 const r=core.createRun({mode:'story',seed});core.startRun(r);core.resizeRun(r,width);
 for(const k of ['nextRaid','nextObstacle','nextAllyAt','nextSupportAt','nextPower','nextPassport'])r[k]=Infinity;
 r.distance=r.routeDistance=nextStoryBossDistance(0);r.nextBossAt=0;core.advanceRun(r,dt);return r;
}
test('the first boss stops travel and stride while combat time and movement stay live; victory resumes running',()=>{
 const r=scene(),distance=r.distance,route=r.routeDistance,age=r.boss.age,x=r.player.x;
 core.moveRun(r,-1);for(let i=0;i<80;i++)core.advanceRun(r,dt);
 assert.equal(r.distance,distance);assert.equal(r.routeDistance,route);assert.ok(heroStridePhase(r)>0);
 assert.ok(r.boss.age>age);assert.ok(r.player.x<x);assert.equal(core.jumpRun(r),true);
 r.boss.hp=0;core.advanceRun(r,dt);assert.equal(r.boss,null);
 core.advanceRun(r,dt);assert.ok(r.distance>distance);assert.ok(r.routeDistance>route);assert.ok(heroStridePhase(r)>0);
});
test('normal firing can hit Ana Elisa directly before the first hostile projectile exists',()=>{
 for(const width of [480,900]){
  const r=scene(32,width);while(r.boss.phase==='intro')core.advanceRun(r,dt);
  const b=r.boss,hp=b.hp;assert.equal(r.obstacles.length,0);assert.equal(core.attackRun(r),true);
  for(let i=0;i<120&&b.hp===hp;i++)core.advanceRun(r,dt);
  assert.ok(b.hp<hp,'a real shot must reach the moving boss at width '+width);assert.ok(b.lastDamage.amount>0);
  assert.equal(r.shotsFired,1);
 }
});
test('ground bosses vary jumps and advances while preserving the mobile reaction corridor',()=>{
 const paths=[];
 for(const seed of [12,34]){
  const r=scene(seed),b=r.boss;const points=[];
  for(let i=0;i<2400;i++){
   pilotDodge(r);core.advanceRun(r,dt);const p=core.bossArenaPose(b,480);points.push(p);
   if(b.phase!=='intro'){assert.ok(p.x>=260&&p.x<=428);assert.ok(p.platformY>=0&&p.platformY<=96);}
   if(i)assert.ok(Math.hypot(p.x-points[i-1].x,p.platformY-points[i-1].platformY)<5,'no teleport at a movement boundary');
  }
  assert.equal(r.status,'running','the sampled fight remains live across flight boundaries');
  const x=points.slice(150).map(p=>p.x);assert.ok(Math.max(...x)-Math.min(...x)>=40);
  const desktop=core.bossArenaPose(b,900),mobile=core.bossArenaPose(b,480);assert.ok(Math.abs(desktop.x-mobile.x-420)<1e-8);assert.equal(desktop.platformY,mobile.platformY);
  b.reducedMotion=true;const fixed=core.bossArenaPose(b,480);b.age+=5;assert.deepEqual(core.bossArenaPose(b,480),fixed);
  paths.push(points);
 }
 assert.notDeepEqual(paths[0],paths[1],'a new run gets a different movement order');
});
test('ship hull and exhaust animate separately, with stable deck and reduced-motion output',()=>{
 assert.equal(typeof art.drawHoverPlatform,'function');
 const render=(phase,reducedMotion=false)=>{const c=createCanvas(180,100).getContext('2d');c.translate(90,25);art.drawHoverPlatform(c,{phase,reducedMotion,accent:'#dbc778'});return c;};
 const a=render(0),b=render(3);
 assert.notDeepEqual(a.getImageData(35,34,110,14).data,b.getImageData(35,34,110,14).data,'moving hull lights');
 assert.notDeepEqual(a.getImageData(40,49,100,43).data,b.getImageData(40,49,100,43).data,'changing flames');
 assert.deepEqual(a.getImageData(60,24,60,4).data,b.getImageData(60,24,60,4).data,'planted feet keep their deck');
 assert.deepEqual(render(0,true).getImageData(0,0,180,100).data,render(30,true).getImageData(0,0,180,100).data);
});

test('shooting and dodging beats the first boss and returns to the route without changing HP or protection',()=>{
 for(const width of [480,900]){
  const r=scene(32,width);
  for(let i=0;i<120*35&&r.boss&&r.status==='running';i++){
   pilotDodge(r);core.setAttackRun(r,r.ammo>0);core.advanceRun(r,dt);
  }
  assert.equal(r.lastBoss,'ana-elisa');assert.equal(r.status,'running');assert.ok(r.player.hp>0);assert.equal(r.boss,null);
  const at=r.distance;core.advanceRun(r,dt);assert.ok(r.distance>at);
 }
});
test('standing Flávio uses a planted combat drawing and resumes distinct stride drawings',async t=>{
 const previous=Object.getOwnPropertyDescriptor(globalThis,'Image');
 globalThis.Image=class extends Image{set src(v){super.src=fileURLToPath(v)}get naturalWidth(){return this.width}get naturalHeight(){return this.height}};
 t.after(()=>previous?Object.defineProperty(globalThis,'Image',previous):delete globalThis.Image);
 const {loadSprites,drawActor}=await import('../tanahoraflavio/runner-art.mjs');await loadSprites();
 const render=(standing,phase)=>{const c=createCanvas(200,150).getContext('2d');drawActor(c,{type:'flavio',x:90,y:140,standing,phase});return c.getImageData(0,0,200,150).data;};
 assert.deepEqual(render(true,0),render(true,18));assert.notDeepEqual(render(true,0),render(false,0));assert.notDeepEqual(render(false,1),render(false,3));
});
test('reduced-motion platform skips decorative trigonometry rather than evaluating frozen oscillators',()=>{
 const c=createCanvas(180,100).getContext('2d'),original=Math.sin;let calls=0;
 Math.sin=(...args)=>{calls++;return original(...args);};
 try{art.drawHoverPlatform(c,{phase:30,reducedMotion:true});assert.equal(calls,0);}
 finally{Math.sin=original;}
});
