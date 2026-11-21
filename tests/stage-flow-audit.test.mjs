import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
import {pilotCounter} from '../tools/story-pilot.mjs';

test('pursuits fit before boss approaches instead of holding the scenery at the arena checkpoint',()=>{
 for(const [seed,width,fps,assisted] of [[1,480,60,false],[17,900,60,true]]){
  const r=core.createRun({mode:'story',seed,assisted});core.startRun(r);core.resizeRun(r,width);
  let previous=r.routeDistance,stall=0,maxStall=0,oldRaid=null;const raidEntrances=[];
  for(let i=0;i<fps*1500&&r.status==='running';i++){
   pilotCounter(r);core.advanceRun(r,1/fps);
   if(r.raid&&r.raid!==oldRaid)raidEntrances.push({route:r.routeDistance,next:r.nextBossAt,stage:core.routeStageFor(r).id});
   oldRaid=r.raid;
   if(r.routeDistance===previous&&!r.boss&&!r.terrain.active)stall+=1/fps;else stall=0;
   maxStall=Math.max(maxStall,stall);previous=r.routeDistance;
  }
  assert.equal(r.status,'ballot');
  assert.ok(maxStall<.15,'running scenery must not stay at one route coordinate for '+maxStall+' seconds');
  assert.ok(raidEntrances.length>=8);
  assert.ok(raidEntrances.every(e=>e.next-e.route>400),'a pursuit must start before the boss safe approach');
 }
});

test('each campaign map exposes its own next objective and bounded stage progress',()=>{
 assert.equal(typeof core.stagePlanFor,'function');
 for(const [index,stageId,name] of [[0,'brasilia','Ana Elisa'],[2,'rio','Rick Azevedo'],[4,'sao-paulo','Guilherme Cortez'],[6,'argentina','Soraya'],[8,'paraguai','Fiscal da Ponte'],[10,'florida','Boulos'],[12,'casa-branca','Dino'],[14,'brasilia-final','O Povo Brasileiro']]){
  const r=core.createRun({mode:'story'});core.startRun(r);r.bossesDefeated=index;
  const stage=Math.floor(index/2);r.routeDistance=core.STORY_OPENING_DISTANCE+stage*7000+50;
  const plan=core.stagePlanFor(r);
  assert.equal(plan.stageId,stageId);assert.equal(plan.nextBossName,name);
  assert.ok(plan.progress>=0&&plan.progress<=1);assert.ok(plan.goal.includes(name));
 }
});

test('stage objectives follow active pursuit, aerial traversal and boss combat without stale labels',()=>{
 assert.equal(typeof core.stagePlanFor,'function');
 const r=core.createRun({mode:'story'});core.startRun(r);r.routeDistance=core.STORY_OPENING_DISTANCE+14000+400;
 r.raid={phase:'active',remaining:5};assert.equal(core.stagePlanFor(r).section,'pursuit');
 r.raid=null;r.terrain.active={flight:{toName:'Argentina',progress:.4}};
 assert.equal(core.stagePlanFor(r).section,'transfer');assert.match(core.stagePlanFor(r).goal,/Argentina/);
 r.terrain.active=null;r.boss={type:'guilherme',name:'Guilherme Cortez',combat:true,maxHp:22,hp:11,role:'subboss'};
 assert.equal(core.stagePlanFor(r).section,'arena');assert.match(core.stagePlanFor(r).label,/Guilherme/);
 r.boss=null;r.player.isJacare=true;assert.equal(core.stagePlanFor(r).section,'jacare');
});

test('endless stage progress restarts per map on later laps',()=>{
 assert.equal(typeof core.stagePlanFor,'function');
 const r=core.createRun({mode:'endless'});r.routeDistance=59500;
 const plan=core.stagePlanFor(r);assert.equal(plan.stageId,'argentina');assert.equal(plan.progress,.5);
});

test('a due pursuit waits for terrain preparation, then remains available rather than being discarded',()=>{
 const r=core.createRun({mode:'story',seed:1});core.startRun(r);
 r.elapsed=40;r.routeDistance=r.distance=35500;r.nextBossAt=Infinity;r.nextObstacle=Infinity;r.nextRaid=-1;r.terrain.nextAt=Infinity;
 r.terrain.preparing={kind:'ground-lesson',at:35560};
 core.advanceRun(r,1/120);assert.equal(r.raid,null,'a pursuit cannot replace an announced boarding/lesson preparation');
 r.terrain.preparing=null;core.advanceRun(r,1/120);assert.equal(r.raid?.phase,'warning');
});

test('endless running keeps scenery moving while Jacare reserves the pending local pursuit',()=>{
 for(const fps of [30,60,120]){
  const r=core.createRun({mode:'endless',seed:1});core.startRun(r);core.resizeRun(r,480);
  r.elapsed=200;r.distance=r.routeDistance=5900;r.nextBossAt=Infinity;r.nextRaid=999;
  r.player.isJacare=true;r.player.jacareAge=0;r.shieldFor=Infinity;
  let previous=r.routeDistance;
  for(let i=0;i<fps*5;i++){
   pilotCounter(r);core.advanceRun(r,1/fps);
   assert.ok(r.routeDistance>previous,'endless route progress must not freeze at the reserved pursuit point');previous=r.routeDistance;
   assert.equal(core.routeStageFor(r).id,'brasilia');assert.equal(r.raid,null);
  }
 }
});

test('boarding preparation cannot preempt the nearer boss rehearsal',()=>{
 const r=core.createRun({mode:'story',seed:1});core.startRun(r);r.elapsed=100;
 r.routeDistance=r.distance=39500;r.bossesDefeated=5;r.nextBossAt=40100;r.nextRaid=Infinity;
 r.nextObstacle=r.nextAllyAt=r.nextSupportAt=Infinity;r.terrain.lessonCompleted=true;
 core.advanceRun(r,1/120);
 assert.equal(r.terrain.preparing,null,'Erika must come before the São Paulo departure');
 assert.ok(r.obstacles.some(o=>o.rehearsal),'the existing boss teaching window must remain visible');
});
