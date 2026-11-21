import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
import {nextStoryBossDistance,storyBossAt} from '../tanahoraflavio/runner-bosses.mjs';
import {heroStridePhase} from '../tanahoraflavio/runner-drawn-motion.mjs';
const dt=1/120;
function scene(index){
 const r=core.createRun({mode:'story',seed:32});core.startRun(r);
 for(const k of ['nextRaid','nextObstacle','nextAllyAt','nextSupportAt','nextPower','nextPassport'])r[k]=Infinity;
 r.bossesDefeated=index;r.distance=r.routeDistance=nextStoryBossDistance(index);r.nextBossAt=0;core.advanceRun(r,dt);return r;
}
test('only actual boss duels stop automatic running; traversal encounters keep the runner moving',()=>{
 for(const index of [0,1,8,14]){
  const r=scene(index),d=r.distance,phase=heroStridePhase(r);
  for(let i=0;i<30;i++)core.advanceRun(r,dt);
  if(storyBossAt(index).traversal){assert.ok(r.distance>d,'traversal must keep physical travel: '+r.boss.type);assert.ok(heroStridePhase(r)>phase);}
  else{assert.equal(r.distance,d);assert.equal(heroStridePhase(r),0);assert.ok(r.boss.age>.2);}
 }
});
test('each ordinary victory resumes running during the cooldown and cannot leave the hero stuck',()=>{
 for(const index of [0,1,2,3,4,5,6,7,9,10,11,12,13,15]){
  const r=scene(index);r.boss.hp=0;
  for(let i=0;i<120*20&&r.boss;i++)core.advanceRun(r,dt);
  assert.equal(r.boss,null);
  assert.equal(r.status,'running');const d=r.distance;
  for(let i=0;i<24;i++)core.advanceRun(r,dt);
  assert.ok(r.distance>d,'running must resume after encounter '+index);assert.ok(heroStridePhase(r)>0);
 }
});
