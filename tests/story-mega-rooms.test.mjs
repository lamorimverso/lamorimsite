import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
import {stagePlatforms,stagePlatformSupport,ROOM_SIZE} from '../tanahoraflavio/runner-story-rooms.mjs';
const ready=()=>{const r=core.createRun({mode:'story',manualStory:true,seed:31});core.startRun(r);
 for(const k of ['nextObstacle','nextRaid','nextPickup','nextPassport','nextPower','nextSupportAt','nextAllyAt','nextBossAt'])r[k]=Infinity;
 r.terrain.nextAt=Infinity;r.graceFor=1000;return r;};
const tick=(r,n)=>{for(let i=0;i<n&&r.status==='running';i++)core.advanceRun(r,1/120);};
test('platforms are real, one-way, and use persistent map coordinates',()=>{
 const r=ready(),p=stagePlatforms(r)[0];assert.ok(p);
 assert.equal(stagePlatformSupport(r,p.x+20,8),null);
 r.player.y=p.y+2;assert.equal(stagePlatformSupport(r,p.x+20,8),p.y);
 r.distance=80;assert.equal(stagePlatforms(r).find(x=>x.worldX===p.worldX).x,p.x-80);
 r.manualStory=false;assert.equal(stagePlatforms(r).length,0);assert.equal(ROOM_SIZE,1040);
});
test('raised static enemies take actual projectile hits',()=>{
 const r=ready();tick(r,2);const e=r.obstacles.find(x=>x.storyWorldX!==undefined&&x.platformY>0);assert.ok(e);
 assert.equal(core.attackRun(r),true);tick(r,90);
 assert.ok(!r.obstacles.includes(e));assert.ok(r.defeatedEnemies>=1);
});
test('camera can return to earlier rooms without gaining route progress twice',()=>{
 const r=ready();core.moveRun(r,1);tick(r,350);const before=r.distance,route=r.routeDistance;assert.ok(before>150);
 core.moveRun(r,-1);tick(r,220);assert.ok(r.distance<before);assert.equal(r.routeDistance,route);
 core.moveRun(r,1);tick(r,100);assert.ok(r.routeDistance<=route+1e-6);
});
