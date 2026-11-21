import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
import {storyBossAt,nextStoryBossDistance,planArenaAttack} from '../tanahoraflavio/runner-bosses.mjs';
import {heroStridePhase} from '../tanahoraflavio/runner-drawn-motion.mjs';
import {equipHeroPower} from '../tanahoraflavio/runner-earned-powers.mjs';
import {pilotDodge} from '../tools/story-pilot.mjs';

function scene(width=480,seed=32){
 const r=core.createRun({mode:'story',seed});core.startRun(r);core.resizeRun(r,width);
 for(const k of ['nextRaid','nextObstacle','nextAllyAt','nextSupportAt','nextPower','nextPassport'])r[k]=Infinity;
 r.distance=r.routeDistance=nextStoryBossDistance(0);r.nextBossAt=0;core.advanceRun(r,1/120);
 r.shieldFor=Infinity;while(r.boss.phase==='intro')core.advanceRun(r,1/120);
 return r;
}
const step=(r,seconds,dt=1/120)=>{for(let t=0;t<seconds-1e-8;t+=dt)core.advanceRun(r,dt);};

test('mobile duel leaves at least 200px to move, and manual movement animates while the road stays still',()=>{
 const r=scene(),distance=r.distance,route=r.routeDistance;
 assert.ok(core.playerBounds(r).max-core.playerBounds(r).min>=200);
 const idle=heroStridePhase(r);step(r,.1);assert.equal(heroStridePhase(r),idle);
 core.moveRun(r,1);step(r,.25);
 assert.ok(heroStridePhase(r)>idle,'moving feet need an actual stride in the arena');
 assert.equal(r.distance,distance);assert.equal(r.routeDistance,route);
});

test('duel slide works in both directions, travels faster than walking and does not repeat while held',()=>{
 for(const direction of [-1,1]){
  const r=scene(900);r.player.x=270;
  core.moveRun(r,direction);core.crouchRun(r,true);const start=r.player.x;
  step(r,.2);assert.equal(r.player.sliding,true);assert.ok((r.player.x-start)*direction>55);
  step(r,1);assert.equal(r.player.sliding,false);
  step(r,.1);assert.equal(r.player.sliding,false);
  core.crouchRun(r,false);core.crouchRun(r,true);step(r,.02);assert.equal(r.player.sliding,true);
 }
});

test('a boss remains the primary firing target when an unrelated projectile crosses the arena',()=>{
 const r=scene(),b=r.boss;b.phase='recover';b.phaseFor=20;b.reducedMotion=true;
 const hp=b.hp;
 const threat={x:260,y:24,width:40,height:30,type:'network-panel',projectile:true,launched:true,bossAttack:true,
  owner:b.type,action:'jump',speed:160,launchX:280,launchY:24,targetY:24,targetX:112,arcHeight:0,counted:false};
 r.obstacles=[threat];assert.equal(core.attackRun(r),true);
 step(r,.65);
 assert.ok(b.hp<hp,'the shot must physically reach the boss');
 assert.equal(threat.reflected,undefined,'a low off-axis projectile must not steal the aimed shot');
});

test('holding fire builds a larger penetrating shot with a real ammo cost, independently of frame rate',()=>{
 const times=[];
 for(const dt of [1/30,1/60,1/120]){
  const r=scene(900);r.boss.phase='recover';r.boss.phaseFor=20;
  core.setAttackRun(r,true);let charged;
  for(let t=0;t<1.8&&!charged;t+=dt){core.advanceRun(r,dt);charged=r.heroShots.find(s=>s.charged);}
  assert.ok(charged,'holding the existing fire control should produce a charge shot');
  assert.ok(charged.radius>=9);assert.ok(charged.cancels>=1);assert.ok(charged.damage>=2);
  assert.equal(charged.ammoCost,2);assert.ok(r.ammo>=0);
  times.push(r.elapsed);core.setAttackRun(r,false);assert.equal(r.player.chargeFor,0);
 }
 assert.ok(Math.max(...times)-Math.min(...times)<.08);
});

test('cancel, weapon switch and victory clear a pending charge; traversal never charges',()=>{
 for(const cancel of [core.clearRunInput,r=>equipHeroPower(r,'ivermectina'),r=>{r.boss.hp=0;core.advanceRun(r,1/120);}]){
  const r=scene();core.setAttackRun(r,true);step(r,.4);assert.ok(r.player.chargeFor>0);
  cancel(r);assert.equal(r.player.chargeFor,0);
 }
 const r=scene();r.boss.traversal=true;core.setAttackRun(r,true);step(r,.4);assert.equal(r.player.chargeFor,0);
});

test('direct hits reward an earned recovery opening, without changing the random damage sequence',()=>{
 const results=[];
 for(const phase of ['attack','recover']){
  const r=scene();const b=r.boss;b.phase=phase;b.phaseFor=20;b.volleyLeft=0;b.reducedMotion=true;
  b.recover=20.1;b.earnedCounter={delay:0,window:1,damage:4,label:'REDE APAGADA'};
  const pose=core.bossArenaPose(b,480),hp=b.hp;
  r.heroShots=[{x:pose.x-40,y:pose.platformY+48,vx:760,vy:0,age:0,flightFor:1,radius:5,damage:1,powerId:'ivermectina',behavior:'bolt'}];
  step(r,.025);results.push(hp-b.hp);
 }
 assert.ok(results[1]>results[0]*1.5,'the announced opening must affect actual direct damage');
});

test('boss attacks keep the teaching opening then vary their order between runs, never reacting to a posture change',()=>{
 const lists=[];
 for(const seed of [12,34,56]){
  const b={...storyBossAt(0),combat:true,flightSeed:seed,maxHp:16,hp:16};
  const list=[];
  for(let index=0;index<12;index++){
   b.patternIndex=index;
   const a=planArenaAttack(b,{crouching:false}),other=planArenaAttack(b,{crouching:true,y:100});
   assert.deepEqual(a,other);list.push(a.signature);
  }
  lists.push(list);
 }
 assert.equal(new Set(lists.map(a=>a[0])).size,1);
 assert.ok(new Set(lists.map(a=>a.slice(2).join(','))).size>1);
});

test('the front edge preserves reaction space between alternating volleys without projectiles spawning inside a jump',()=>{
 for(const width of [480,900])for(const index of [2,15]){
  const r=core.createRun({mode:'story',seed:32});core.startRun(r);core.resizeRun(r,width);
  for(const k of ['nextRaid','nextObstacle','nextAllyAt','nextSupportAt','nextPower','nextPassport'])r[k]=Infinity;
  r.bossesDefeated=index;r.distance=r.routeDistance=r.nextBossAt=nextStoryBossDistance(index);r.terrain.nextAt=Infinity;
  core.advanceRun(r,1/120);while(r.boss.phase==='intro')core.advanceRun(r,1/120);
  r.player.x=core.playerBounds(r).max;
  for(let i=0;i<120*30&&r.status==='running';i++){pilotDodge(r);core.advanceRun(r,1/120);}
  assert.equal(r.player.hp,r.player.maxHp,`${width}px ${storyBossAt(index).type}: reaction time must survive the wider arena`);
 }
});
