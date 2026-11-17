import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
import {pilotDodge} from '../tools/story-pilot.mjs';

function scene({width=900,assisted=false,route=15000,distance=70000,doubleJump=false}={}){
 const run=core.createRun({mode:'endless',seed:73,assisted});core.resizeRun(run,width);core.startRun(run);
 for(const key of ['nextRaid','nextBossAt','nextAllyAt','nextSupportAt','nextPassport','nextPower','nextPickup'])run[key]=Infinity;
 run.distance=distance;run.elapsed=160;run.routeDistance=route;run.terrain.nextAt=0;run.terrain.lessonCompleted=true;run.nextObstacle=0;
 run.movementSkills.doubleJump=doubleJump;
 return run;
}
test('a corrida não gera a placa suspensa nem uma colisão escondida em nenhum modo',()=>{
 for(const mode of ['story','endless'])for(const route of [200,7600,15000]){
  const r=scene({route});r.mode=mode;if(mode==='story')r.routeDistance+=core.STORY_OPENING_DISTANCE;
  r.terrain.nextKind='passage'; // Campo do formato antigo não pode reintroduzir o obstáculo.
  core.advanceRun(r,1/120);
  if(route<14000){assert.equal(r.terrain.active,null);continue;}
  assert.equal(r.terrain.active?.kind,'gap-platform',mode);
  assert.deepEqual(r.terrain.active.ceilings,[]);
  assert.ok(r.terrain.active.platforms.length>0);
  assert.doesNotMatch(r.event,/Passagem baixa/);
 }
});
test('gap and platform move by exactly the distance traveled, even with speed changes and assistance',()=>{
 for(const dt of [1/30,1/60,1/120])for(const width of [480,900])for(const assisted of [false,true]){
  const r=scene({width,assisted});core.advanceRun(r,dt);
  const a=r.terrain.active;assert.equal(a?.kind,'gap-platform');
  const [gap,bar]=[a.gaps[0],a.platforms[0]],before=[gap.x,bar.x],dist=r.distance;
  for(let i=0;i<Math.round(.75/dt);i++)core.advanceRun(r,dt);
  for(const [i,shape] of [gap,bar].entries())assert.ok(Math.abs((before[i]-shape.x)-(r.distance-dist))<1e-8, `${dt}, ${width}, ${assisted}`);
 }
});
test('near-maximum-speed bars still admit a simple jump in all widths and rates after the reward',()=>{
 for(const dt of [1/30,1/60,1/120])for(const width of [480,900])for(const assisted of [false,true])for(const doubleJump of [false,true]){
  const r=scene({width,assisted,distance:400000,doubleJump});core.advanceRun(r,dt);
  let onBar=false;for(let i=0;i<Math.round(6/dt)&&r.status==='running';i++){
   pilotDodge(r);core.advanceRun(r,dt);onBar||=r.player.grounded&&r.player.supportY>0;
   assert.equal(r.player.airJumpsUsed,0);
  }
  assert.ok(onBar&&r.terrain.completed===1&&r.status==='running',`${dt}, ${width}, ${assisted}, ${doubleJump}: ${r.lastHit?.type}`);
 }
});
