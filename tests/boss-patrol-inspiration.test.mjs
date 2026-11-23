import test from 'node:test';
import assert from 'node:assert/strict';
import {platformBossPose} from '../tanahoraflavio/runner-platform-boss.mjs';
import * as core from '../tanahoraflavio/runner-core.mjs';
import {nextStoryBossDistance} from '../tanahoraflavio/runner-bosses.mjs';

function duel(width=480){
 const run=core.createRun({mode:'story',manualStory:true,seed:32});
 core.startRun(run);core.resizeRun(run,width);
 for(const key of ['nextRaid','nextObstacle','nextAllyAt','nextSupportAt','nextPower','nextPassport'])run[key]=Infinity;
 run.terrain.nextAt=Infinity;run.distance=run.routeDistance=run.nextBossAt=nextStoryBossDistance(0);
 core.advanceRun(run,1/120);
 assert.equal(run.boss?.type,'ana-elisa');
 return run;
}

test('ground bosses patrol on nearly every beat instead of standing for multiple seconds',()=>{
 const b={type:'ana-elisa',classId:'sentinel',flightSeed:32,phase:'charge',age:1.1};
 const poses=Array.from({length:600},(_,i)=>platformBossPose({...b,age:1.1+i/120},480));
 const moves=poses.slice(1).filter((p,i)=>Math.abs(p.x-poses[i].x)>.2);
 assert.ok(moves.length>450,'boss should visibly move on most frames');
 assert.ok(Math.max(...poses.map(p=>p.x))-Math.min(...poses.map(p=>p.x))>=70);
 assert.ok(Math.max(...poses.map(p=>p.platformY))>=60,'boss still jumps over the ground');
 assert.equal(Math.min(...poses.map(p=>p.platformY)),0,'boss still lands');
 for(let i=1;i<poses.length;i++){
  const previous=poses[i-1],current=poses[i];
  assert.ok(Math.hypot(current.x-previous.x,current.platformY-previous.platformY)<5,'boss must not teleport');
 }
});

test('the patrol keeps a reaction lane on mobile and desktop, including during attacks',()=>{
 for(const width of [480,900]){
  const b={type:'ana-elisa',classId:'sentinel',flightSeed:32,age:3.4,phase:'attack'};
  for(let i=0;i<1000;i++){
   const p=platformBossPose({...b,age:1.1+i/120},width);
   assert.ok(p.x>=width-132&&p.x<=width-56);
   assert.ok(p.platformY>=0&&p.platformY<=96);
  }
  b.reducedMotion=true;
  assert.deepEqual(platformBossPose({...b,age:2},width),platformBossPose({...b,age:9},width),'reduced-motion pose must be stable');
 }
});

test('Ana Elisa still releases physical projectiles while patrolling',()=>{
 const run=duel();
 let fired=false,moved=false;
 let previous=core.bossArenaPose(run.boss,480).x;
 for(let i=0;i<120*10&&run.status==='running';i++){
  core.advanceRun(run,1/120);
  if(!run.boss)break;
  const now=core.bossArenaPose(run.boss,480).x;
  if(Math.abs(now-previous)>.1)moved=true;
  previous=now;
  if(run.boss.fired>0||run.obstacles.some(o=>o.bossAttack))fired=true;
  if(fired&&moved)break;
 }
 assert.equal(moved,true);
 assert.equal(fired,true);
});
