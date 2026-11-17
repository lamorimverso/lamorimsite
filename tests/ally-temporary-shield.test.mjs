import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
import {ALLIES,collectAlly} from '../tanahoraflavio/runner-allies.mjs';
import {nextStoryBossDistance} from '../tanahoraflavio/runner-bosses.mjs';
const DT=1/120;
function isolated(mode='endless'){
 const r=core.createRun({mode,seed:417});core.startRun(r);
 for(const key of ['nextBossAt','nextRaid','nextObstacle','nextAllyAt','nextSupportAt','nextPower','nextPassport','nextPickup'])r[key]=Infinity;
 r.terrain.nextAt=Infinity;return r;
}
function step(r,seconds){for(let i=0;i<Math.round(seconds/DT)&&r.status==='running';i++)core.advanceRun(r,DT);}
const collide=r=>{r.obstacles=[{type:'pf',x:r.player.x+5,width:34,height:44,speed:0}];core.advanceRun(r,DT);};

test('each valid ally item grants three seconds plus its own aid, ammunition and exactly one reserve part',()=>{
 for(const ally of ALLIES){
  const r=isolated();r.ammo=0;r.pickups=[{type:'ally',allyId:ally.id,x:r.player.x+17,y:20,speed:0}];
  core.advanceRun(r,DT);
  assert.equal(r.allyShieldFor,3,ally.id);assert.equal(r.shieldFor,3,ally.id);
  assert.equal(r.aid.id,ally.id);assert.equal(r.aid.remaining,ally.duration);
  assert.equal(r.ammo,3);assert.equal(r.allyShieldProgress,1);assert.equal(r.reserveShields,0);assert.equal(r.allyHelpCount,1);
 }
});
test('unknown, inactive and cooldown-blocked ally pickups grant no temporary shield or rewards',()=>{
 const unknown=isolated();assert.equal(collectAlly(unknown,'missing'),false);assert.equal(unknown.shieldFor,0);assert.equal(unknown.allyHelpCount,0);
 const ready=core.createRun();assert.equal(collectAlly(ready,'jair'),false);assert.equal(ready.shieldFor,0);
 const r=isolated();collectAlly(r,'vorcaro');step(r,3.1);
 const before={ammo:r.ammo,parts:r.allyShieldProgress,helps:r.allyHelpCount};
 assert.equal(collectAlly(r,'vorcaro'),false);assert.equal(r.allyShieldFor,0);assert.equal(r.shieldFor,0);
 assert.deepEqual({ammo:r.ammo,parts:r.allyShieldProgress,helps:r.allyHelpCount},before);
});
test('the pickup shield counts down once and blocks normal collision only for its three-second window',()=>{
 const r=isolated();collectAlly(r,'jair');step(r,.5);
 assert.ok(Math.abs(r.allyShieldFor-2.5)<1e-8);assert.ok(Math.abs(r.shieldFor-2.5)<1e-8);
 step(r,2.4);collide(r);assert.equal(r.status,'running');assert.equal(r.lives,1);
 r.obstacles=[];step(r,.15);assert.equal(r.allyShieldFor,0);assert.equal(r.shieldFor,0);
 collide(r);assert.equal(r.status,'running');assert.equal(r.player.hp,1);assert.equal(r.lastHit.type,'pf');
});
test('boss damage is blocked during ally protection and resumes after expiry',()=>{
 const r=isolated('story');r.bossesDefeated=1;r.distance=r.routeDistance=nextStoryBossDistance(1);r.nextBossAt=0;core.advanceRun(r,DT);
 assert.ok(r.boss.combat);r.boss.phase='recover';r.boss.phaseFor=r.boss.nextAttack=1000;r.boss.volleyShots=[];
 const bossHit=()=>{
  r.obstacles=[{type:'receipts',owner:r.boss.type,bossAttack:true,projectile:true,launched:true,x:r.player.x+5,width:28,height:30,speed:0,y:24}];
  core.advanceRun(r,DT);
 };
 collectAlly(r,'michelle');const hp=r.player.hp;bossHit();assert.equal(r.player.hp,hp);
 r.obstacles=[];step(r,3.1);bossHit();assert.equal(r.player.hp,hp-1);assert.equal(r.status,'running');
});
test('another ally refreshes three seconds without stacking or shortening a longer manual shield',()=>{
 const r=isolated();collectAlly(r,'jair');step(r,2);collectAlly(r,'michelle');
 assert.equal(r.allyShieldFor,3);assert.equal(r.shieldFor,3);step(r,3.1);assert.equal(r.shieldFor,0);assert.equal(r.allyShieldFor,0);
 r.reserveShields=2;assert.equal(core.activateReserveShield(r),true);collectAlly(r,'silas');
 assert.equal(r.shieldFor,6);assert.equal(r.allyShieldFor,3);assert.equal(r.reserveShields,1);
 step(r,3.1);assert.equal(r.allyShieldFor,0);assert.ok(r.shieldFor>2.8&&r.shieldFor<3);
});
test('falling into a terrain gap remains fatal while the ally shield is active',()=>{
 const r=isolated();r.routeDistance=2*core.SCENE_DISTANCE+1000;r.terrain.nextAt=0;r.terrain.nextKind='gap-platform';r.nextObstacle=0;core.advanceRun(r,DT);r.nextObstacle=Infinity;
 assert.equal(r.terrain.active.kind,'gap-platform');
 let collected=false;
 for(let i=0;i<600&&r.status==='running';i++){
  if(!collected&&r.player.y<0){assert.equal(collectAlly(r,'jair'),true);collected=true;}
  core.advanceRun(r,DT);
 }
 assert.equal(collected,true);assert.equal(r.status,'over');assert.equal(r.lastHit.type,'terrain-gap');assert.ok(r.allyShieldFor>0);assert.ok(r.shieldFor>0);
});
