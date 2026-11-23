import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';

const dt=1/120;
function isolated(mode,manualStory=false){
 const run=core.createRun({mode,manualStory,seed:17});
 core.startRun(run);
 for(const key of ['nextObstacle','nextPickup','nextPassport','nextPower','nextRaid','nextAllyAt','nextSupportAt','nextBossAt'])run[key]=Infinity;
 run.terrain.nextAt=Infinity;
 return run;
}
function step(run,count){
 for(let i=0;i<count&&run.status==='running';i++)core.advanceRun(run,dt);
}

test('History manual movement keeps the route still until the player walks right',()=>{
 const run=isolated('story',true);
 const startX=run.player.x;
 step(run,90);
 assert.equal(run.distance,0);
 assert.equal(run.routeDistance,0);
 assert.equal(run.player.x,startX);
 assert.equal(run.player.manualTravel,0);
 core.moveRun(run,1);
 step(run,180);
 assert.ok(run.player.x>startX,'walking must move the player within the screen');
 assert.ok(run.player.manualTravel>0,'manual walking drives the stride');
 assert.ok(run.distance>0,'following the camera anchor must scroll the route');
 assert.ok(run.routeDistance>0,'manual progression must advance the map');
 const travel=run.distance,route=run.routeDistance;
 core.moveRun(run,0);
 step(run,30);
 assert.equal(run.distance,travel,'releasing right stops the scenery');
 assert.equal(run.routeDistance,route,'releasing right stops route progression');
});

test('manual retreat changes player position without going backwards across completed stages',()=>{
 const run=isolated('story',true);
 core.moveRun(run,1);step(run,180);
 const distance=run.distance,route=run.routeDistance,x=run.player.x;
 core.moveRun(run,-1);step(run,30);
 assert.ok(run.player.x<x,'left key must retreat');
 assert.equal(run.distance,distance);
 assert.equal(run.routeDistance,route);
});

test('endless and legacy simulation remain automatic; Story practice does not inherit the manual flag',()=>{
 const endless=isolated('endless');
 step(endless,30);
 assert.ok(endless.distance>0);
 const legacy=isolated('story');
 step(legacy,30);
 assert.ok(legacy.distance>0);
 assert.equal(legacy.manualStory,false);
 const practice=core.createRun({mode:'story',practiceId:'haddad',manualStory:false});
 assert.equal(practice.manualStory,false);
});
