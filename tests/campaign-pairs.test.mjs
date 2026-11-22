import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
import {storyBossAt,nextStoryBossDistance} from '../tanahoraflavio/runner-bosses.mjs';
import {pilotCounter} from '../tools/story-pilot.mjs';
import {createCanvas} from '@napi-rs/canvas';
import {drawJourneyScenery} from '../tanahoraflavio/runner-scenery.mjs';
import {drawTerrain} from '../tanahoraflavio/runner-terrain-art.mjs';

function duel(index,width=480){
 const r=core.createRun({mode:'story',seed:17});core.startRun(r);core.resizeRun(r,width);
 for(const key of ['nextRaid','nextObstacle','nextAllyAt','nextSupportAt','nextPower','nextPassport'])r[key]=Infinity;
 r.terrain.nextAt=Infinity;r.bossesDefeated=index;r.distance=r.routeDistance=r.nextBossAt=nextStoryBossDistance(index);
 if(index>0)core.grantBossPower(r,storyBossAt(index-1).type);
 core.advanceRun(r,1/60);return r;
}
test('airborne void removes the road verge as well as the lower road surface',()=>{
 const ctx=createCanvas(480,300).getContext('2d');
 const flight={from:'sao-paulo',to:'argentina',phase:'crossing',progress:.5,traveled:2500,nominalSpeed:400,aircraft:[]};
 drawJourneyScenery(ctx,{width:480,routeDistance:41100,distance:70000,flight});
 drawTerrain(ctx,{width:480,terrain:{active:{kind:'air-transfer',gaps:[{x:100,width:800}],platforms:[],ceilings:[],flight}}});
 for(const y of [234,239,250,280]){
  const [red,,blue,alpha]=ctx.getImageData(350,y,1,1).data;
  assert.ok(blue>red+20&&alpha>220,`y=${y}: the empty span must show sky instead of a leftover verge`);
 }
});
test('a completed pair reserves one hundred thousand physical running metres before the next pair',()=>{
 for(const fps of [30,60,120]){
  const r=duel(1),dt=1/fps;r.boss.hp=0;core.advanceRun(r,dt);
  const start=r.distance;let previous=r.routeDistance;
  while(r.distance-start<99999&&r.status==='running'){
   core.advanceRun(r,dt);if(r.distance-start<100000)assert.equal(r.boss,null,'one hundred kilometres must not be replaced by an eighteen-second cooldown');
   if(!r.boss)assert.ok(r.routeDistance>previous,'the scenery must keep advancing during the leg');previous=r.routeDistance;
  }
  for(let i=0;i<fps*10&&!r.boss;i++)core.advanceRun(r,dt);
  assert.equal(r.boss?.type,'rick');assert.ok(r.distance-start>=100000);
 }
});
test('the first victory keeps its partner next, while the second opens a measured running leg',()=>{
 const first=duel(0);first.boss.hp=0;core.advanceRun(first,1/60);
 assert.equal(first.storyLeg,null);assert.equal(core.stagePlanFor(first).nextBossName,'Xandão');
 const second=duel(1);second.boss.hp=0;core.advanceRun(second,1/60);
 assert.equal(second.storyLeg.requiredDistance,100000);assert.equal(second.storyLeg.groundDistance,0);
 const plan=core.stagePlanFor(second);assert.equal(plan.section,'leg');assert.match(plan.label,/100,0 km/);
 assert.match(plan.goal,/próxima dupla/i);
 second.storyLeg.groundDistance=25000;second.raid={phase:'active',remaining:4};
 assert.equal(core.stagePlanFor(second).progress,.25,'a pursuit must preserve the measured leg progress');
});
test('the final running metres are shown as metres instead of a premature zero-kilometre label',()=>{
 const r=duel(1);r.boss.hp=0;core.advanceRun(r,1/60);
 r.storyLeg.groundDistance=99975;
 const p=core.stagePlanFor(r);assert.equal(p.section,'leg');assert.match(p.label,/25 m até a dupla/);assert.doesNotMatch(p.label,/0,0 km/);
});
test('flight metres cannot satisfy the ground-running interval and a reserved pair cannot interrupt a flight',async()=>{
 const {beginAirTransfer}=await import('../tanahoraflavio/runner-terrain.mjs');
 const r=duel(5);r.boss.hp=0;core.advanceRun(r,1/60);
 const a=beginAirTransfer(r,400,{routeStart:r.routeDistance,routeEnd:r.routeDistance+1400});
 const ground=r.storyLeg.groundDistance;r.nextBossAt=0;
 for(let i=0;i<30;i++){pilotCounter(r);core.advanceRun(r,1/60);assert.equal(r.boss,null);}
 assert.equal(r.storyLeg.groundDistance,ground);assert.ok(a.flight.traveled>150);
});
test('one physical direct hit removes the same HP from a normal boss and a ten-times larger HP fixture',()=>{
 const hits=[];
 for(const hp of [32,320]){
  const r=duel(0),b=r.boss;Object.assign(b,{phase:'recover',phaseFor:10,hp,maxHp:hp});
  core.attackRun(r);
  for(let i=0;i<120&&b.hp===hp;i++)core.advanceRun(r,1/120);
  assert.ok(b.hp<hp);hits.push(hp-b.hp);
 }
 assert.ok(Math.abs(hits[0]-hits[1])<1e-10,'maximum HP must not amplify an ordinary shot');
});
test('the first, map and final bosses survive their opening and play multiple attack patterns with the preceding reward equipped',()=>{
 for(const index of [0,1,2,3,4,5,6,7,9,10,11,12,13,15,16])for(const width of [480,900]){
  const r=duel(index,width),b=r.boss,start=r.elapsed,patterns=new Set();
  for(let i=0;i<60*100&&r.boss===b&&r.status==='running';i++){
   pilotCounter(r);core.advanceRun(r,1/60);if(b.patternIndex>=0)patterns.add(b.patternIndex);
  }
  assert.equal(r.lastBoss,b.type,`${b.type}/${width}: battle must remain winnable using real controls`);
  assert.ok(r.elapsed-start>=15,`${b.type}/${width}: ${r.elapsed-start}s is too short for a battle`);
  assert.ok(patterns.size>=3,`${b.type}/${width}: at least three committed attacks must be played`);
 }
});
