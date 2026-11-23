import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
import {STORY_DASH_RECOVERY_SECONDS} from '../tanahoraflavio/runner-terrain.mjs';

const dt=1/120;
function ready(mode='story',manualStory=true,seed=16){
 const run=core.createRun({mode,manualStory,seed});
 core.startRun(run);
 for(const key of ['nextBossAt','nextRaid','nextObstacle','nextAllyAt','nextSupportAt','nextPower','nextPassport','nextPickup'])run[key]=Infinity;
 run.terrain.nextAt=Infinity;
 return run;
}
function step(run,frames){
 for(let i=0;i<frames&&run.status==='running';i++)core.advanceRun(run,dt);
}

test('manual Story camera looks ahead smoothly without moving the route while idle',()=>{
 for(const width of [480,900]){
  const run=ready();core.resizeRun(run,width);
  step(run,48);
  assert.equal(run.cameraLead,0);
  assert.equal(run.distance,0);
  core.moveRun(run,1);
  step(run,240);
  assert.ok(run.cameraLead>20&&run.cameraLead<=28,'camera must anticipate visible ground ahead');
  assert.ok(run.distance>0);
  const distance=run.distance,route=run.routeDistance;
  core.moveRun(run,0);
  step(run,48);
  assert.equal(run.distance,distance,'release must never keep the road moving');
  assert.equal(run.routeDistance,route);
  assert.ok(run.cameraLead<2,'camera lead returns smoothly at rest');
 }
});

test('manual Story grants a forgiving ledge window without changing Endless physics',()=>{
 function ledge(run){
  run.terrain.active={kind:'gap-platform',speed:0,age:0,
   gaps:[{x:90,width:700}],platforms:[],ceilings:[]};
  step(run,12);
  assert.equal(run.player.grounded,false);
 }
 const story=ready();
 ledge(story);
 assert.equal(core.jumpRun(story),true,'Story coyote jump should work after 100ms');
 assert.equal(story.player.velocity,610);
 const endless=ready('endless',false);
 ledge(endless);
 assert.equal(core.jumpRun(endless),false,'Endless retains the original smaller edge window');
});

test('manual Story buffers a jump just before landing and allows variable jump height',()=>{
 const buffered=ready();
 Object.assign(buffered.player,{y:1,velocity:-210,grounded:false,supportY:0});
 assert.equal(core.jumpRun(buffered),false);
 step(buffered,1);
 assert.equal(buffered.player.velocity,610,'landing should consume the buffered jump');

 const full=ready(),short=ready();
 assert.equal(core.jumpRun(full),true);
 assert.equal(core.jumpRun(short),true);
 step(full,12);step(short,12);
 assert.equal(core.releaseJumpRun(short),true,'short hops work in the manual route, not just duels');
 let high=full.player.y,low=short.player.y;
 for(let i=0;i<120;i++){
  step(full,1);step(short,1);
  high=Math.max(high,full.player.y);low=Math.max(low,short.player.y);
 }
 assert.ok(high>low+20,'holding the jump must still reach higher platforms');
});

test('a Story dash requires a short cooldown and another press to restart',()=>{
 const run=ready();
 assert.equal(STORY_DASH_RECOVERY_SECONDS,.28);
 core.moveRun(run,1);core.crouchRun(run,true);step(run,12);
 assert.equal(run.player.sliding,true);
 core.crouchRun(run,false);
 assert.equal(run.player.sliding,false);
 assert.ok(run.player.slideCooldownFor>=.28-1e-8);
 core.crouchRun(run,true);step(run,12);
 assert.equal(run.player.sliding,false,'instant repeated dash cannot bypass recovery');
 step(run,36);
 assert.equal(run.player.sliding,false,'holding crouch through recovery cannot repeat a dash');
 core.crouchRun(run,false);core.crouchRun(run,true);step(run,1);
 assert.equal(run.player.sliding,true,'a new command after recovery works');
});

test('Endless retains immediate slide reactivation after crouch release',()=>{
 const run=ready('endless',false);
 core.moveRun(run,1);core.crouchRun(run,true);step(run,12);
 assert.equal(run.player.sliding,true);
 core.crouchRun(run,false);
 core.crouchRun(run,true);step(run,1);
 assert.equal(run.player.sliding,true);
 assert.equal(run.player.slideCooldownFor,0);
});
