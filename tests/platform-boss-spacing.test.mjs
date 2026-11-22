import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
import {storyBossAt,nextStoryBossDistance} from '../tanahoraflavio/runner-bosses.mjs';
import {createCanvas,Image} from '@napi-rs/canvas';
import {fileURLToPath} from 'node:url';

function scene(index=0,width=480,seed=32){
 const r=core.createRun({mode:'story',seed});core.startRun(r);core.resizeRun(r,width);
 for(const key of ['nextRaid','nextObstacle','nextAllyAt','nextSupportAt','nextPower','nextPassport'])r[key]=Infinity;
 r.terrain.nextAt=Infinity;r.bossesDefeated=index;r.distance=r.routeDistance=r.nextBossAt=nextStoryBossDistance(index);
 core.advanceRun(r,1/120);return r;
}

test('campaign fighters use their own identities in a ground arena with jumps and short advances',()=>{
 for(const index of [0,1,2,5,7,16]){
  const r=scene(index),b=r.boss;b.phase='recover';b.phaseFor=100;
  assert.equal(b.platformer,true);assert.equal(b.type,storyBossAt(index).type);
  const poses=Array.from({length:1200},(_,i)=>core.bossArenaPose({...b,age:1.1+i/120},480));
  assert.equal(Math.min(...poses.map(p=>p.platformY)),0,'feet must return to the actual road');
  assert.ok(Math.max(...poses.map(p=>p.platformY))>=60,'a real leap replaces decorative hovering');
  assert.ok(Math.max(...poses.map(p=>p.x))-Math.min(...poses.map(p=>p.x))>=40);
  for(let i=0;i<poses.length;i++){
   const p=poses[i];assert.ok(p.x>=348&&p.x<=428);assert.ok(p.platformY>=0&&p.platformY<=96);
   if(i)assert.ok(Math.hypot(p.x-poses[i-1].x,p.platformY-poses[i-1].platformY)<8,'no teleport between states');
  }
 }
});

test('ground bosses still take physical direct shots from the existing Flavio weapon',()=>{
 for(const width of [480,900]){
  const r=scene(0,width);while(r.boss.phase==='intro')core.advanceRun(r,1/120);
  const b=r.boss,hp=b.hp;core.attackRun(r);
  for(let i=0;i<120&&b.hp===hp;i++)core.advanceRun(r,1/120);
  assert.ok(b.hp<hp);assert.equal(r.shotsFired,1);
 }
});

test('even the shortest campaign gap gives eighteen seconds of running, with scenery progress rather than a frozen checkpoint',()=>{
 for(const dt of [1/30,1/60,1/120])for(const index of [0,14,15]){
  const r=scene(index);r.boss.hp=0;core.advanceRun(r,dt);assert.equal(r.boss,null);
  const next=r.bossesDefeated,physical=r.distance,route=r.routeDistance;
  let previous=route;
  for(let t=0;t<17.8-dt/2;t+=dt){
   core.advanceRun(r,dt);
   assert.equal(r.boss,null,'a new encounter must not interrupt the running interval');
   assert.ok(r.routeDistance>previous,'nominal stage progress stays live');previous=r.routeDistance;
  }
  assert.ok(r.distance>physical+3000);assert.ok(r.routeDistance>route);
  for(let i=0;i<30/dt&&!r.boss;i++)core.advanceRun(r,dt);
  assert.equal(r.boss?.type,storyBossAt(next).type);assert.equal(r.routeDistance,nextStoryBossDistance(next));
 }
});

test('traversal and the first approach preserve their own behavior and do not become ground duels',()=>{
 for(const index of [8,14]){const r=scene(index);assert.equal(r.boss.platformer,false);const d=r.distance;core.advanceRun(r,.05);assert.ok(r.distance>d);}
 const r=core.createRun({mode:'story'});core.startRun(r);r.distance=r.routeDistance=21999;r.nextRaid=Infinity;
 core.advanceRun(r,.05,()=>.5);assert.equal(r.boss.type,'ana-elisa');assert.equal(r.routeDistance,22000);
});

test('the ground renderer keeps distinct Corre Flavio bodies and removes the floating deck and flames',async t=>{
 const previous=Object.getOwnPropertyDescriptor(globalThis,'Image');
 globalThis.Image=class extends Image{set src(v){super.src=fileURLToPath(v)}get naturalWidth(){return this.width}get naturalHeight(){return this.height}};
 t.after(()=>previous?Object.defineProperty(globalThis,'Image',previous):delete globalThis.Image);
 const {loadSprites}=await import('../tanahoraflavio/runner-art.mjs');await loadSprites();
 const {drawHoverEnemy}=await import('../tanahoraflavio/runner-boss-art.mjs');
 const bodies=[];
 for(const type of ['ana-elisa','xandao','erika','lula']){
  const render=platform=>{const c=createCanvas(280,230).getContext('2d');drawHoverEnemy(c,{type,x:140,y:170,platform,phase:3});return c;};
  const ground=render(false),air=render(true);
  const below=c=>c.getImageData(0,178,280,52).data.filter((_,i)=>i%4===3).reduce((n,a)=>n+(a>128),0);
  assert.ok(below(ground)<10,type+' must have no ship or flames below the feet');
  assert.ok(below(air)>100,'legacy hovering presentation remains available');
  const body=ground.getImageData(0,0,280,178).data;assert.ok(body.filter((_,i)=>i%4===3&&body[i]>128).length>1000);
  bodies.push(body);
 }
 for(let i=1;i<bodies.length;i++)assert.notDeepEqual(bodies[i],bodies[0],'boss identities must not reuse one placeholder');
});
