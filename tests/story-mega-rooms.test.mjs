import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
import {stagePlatforms,stagePlatformSupport,stageGapAt,ROOM_SIZE,roomDoorFor,constrainStageAdvance,stepStoryRooms,restoreStoryCheckpoint,stageHazardHit} from '../tanahoraflavio/runner-story-rooms.mjs';
import {terrainSupportAt} from '../tanahoraflavio/runner-terrain.mjs';
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

test('locked gate is solid and cannot be crossed without defeating both enemies',()=>{
 const r=ready(),door=roomDoorFor(r,0);r.distance=door.worldX-r.player.x-70;r.player.previousX=r.player.x;core.moveRun(r,1);
 const blocked=constrainStageAdvance(r,120,{right:29});assert.ok(blocked<120);
 r.storyRooms.defeated['0:0']=true;r.storyRooms.defeated['0:1']=true;
 assert.equal(roomDoorFor(r,0).open,true);
 assert.equal(constrainStageAdvance(r,120,{right:29}),120);
});
test('key door requires both enemy clearance and the stage key',()=>{
 const r=ready();r.storyRooms.defeated['3:0']=true;r.storyRooms.defeated['3:1']=true;
 assert.equal(roomDoorFor(r,3).needsKey,true);
 assert.equal(roomDoorFor(r,3).open,false);
 r.storyRooms.keys[3]=true;assert.equal(roomDoorFor(r,3).open,true);
});
test('unbeaten enemies respawn when a room is revisited, defeated enemies stay defeated',()=>{
 const r=ready();tick(r,2);
 const enemy=r.obstacles.find(o=>o.storyEnemyId==='0:0');assert.ok(enemy);
 r.obstacles=r.obstacles.filter(o=>o!==enemy);tick(r,2);
 assert.ok(r.obstacles.some(o=>o.storyEnemyId==='0:0'));
 r.storyRooms.defeated['0:0']=true;r.obstacles=r.obstacles.filter(o=>o.storyEnemyId!=='0:0');tick(r,2);
 assert.equal(r.obstacles.some(o=>o.storyEnemyId==='0:0'),false);
});
test('checkpoint restores full health and local enemy state after a loss',()=>{
 const r=ready();r.distance=3*ROOM_SIZE+10;r.routeDistance=2100;r.storyRooms.maxDistance=r.distance;
 stepStoryRooms(r,1/60);
 assert.equal(r.storyRooms.checkpointRoom,3);
 const checkpoint=r.storyRooms.checkpoint;r.storyRooms.defeated['3:0']=true;r.player.hp=0;
 assert.equal(restoreStoryCheckpoint(r),true);
 assert.equal(r.distance,checkpoint.distance);assert.equal(r.routeDistance,checkpoint.routeDistance);
 assert.equal(r.player.hp,r.player.maxHp);assert.equal(r.storyRooms.defeated['3:0'],undefined);
 assert.equal(r.storyRooms.retries,2);
});
test('scripted spikes hurt in Story and do not exist in Endless',()=>{
 const r=ready();r.distance=ROOM_SIZE+625-r.player.x;
 assert.ok(stageHazardHit(r,{left:4,right:29,height:48}));
 r.manualStory=false;assert.equal(stageHazardHit(r,{left:4,right:29,height:48}),null);
});

test('locked gate remains closed while the right key is continuously held',()=>{
 const r=ready(),door=roomDoorFor(r,0);
 r.distance=door.worldX-r.player.x-70;r.storyRooms.maxDistance=r.distance;
 core.moveRun(r,1);tick(r,100);
 const right=r.distance+r.player.x+29;
 assert.ok(right<=door.worldX-8+1e-5,'the physical gate cannot be crossed by holding right');
});

test('sculpted floor gaps have matching visible geometry and physical falling support',()=>{
 const r=ready();r.distance=2*ROOM_SIZE+620-r.player.x;
 assert.equal(stageGapAt(r,r.player.x+16,12),true);
 assert.equal(terrainSupportAt(r,r.player.x+16,12),null);
 r.player.y=68;
 assert.equal(terrainSupportAt(r,r.player.x+16,12),67,'upper platform bridges the pit');
 r.manualStory=false;
 assert.equal(stageGapAt(r,r.player.x+16,12),false);
 assert.equal(terrainSupportAt(r,r.player.x+16,12),0);
});
test('the key on the fourth room is collectible only from its raised platform',()=>{
 const r=ready();r.distance=3*ROOM_SIZE+560-r.player.x;
 stepStoryRooms(r,1/60);assert.equal(Boolean(r.storyRooms.keys[3]),false);
 r.player.y=77;stepStoryRooms(r,1/60);
 assert.equal(r.storyRooms.keys[3],true);
});
test('fatal pit drops restore the latest Story checkpoint rather than ending Infinite',()=>{
 const r=ready();r.distance=2*ROOM_SIZE+620-r.player.x;
 r.storyRooms.maxDistance=r.distance;
 tick(r,100);
 assert.equal(r.status,'running');assert.equal(r.storyRooms.retries,2);
 assert.equal(r.distance,0);assert.equal(r.player.hp,r.player.maxHp);
});
test('checkpoint recovery rewinds boss milestones to the checkpoint snapshot',()=>{
 const r=ready();r.distance=3*ROOM_SIZE+10;r.storyRooms.maxDistance=r.distance;
 r.routeDistance=2100;r.bossesDefeated=2;r.nextBossAt=4800;
 stepStoryRooms(r,1/60);
 r.bossesDefeated=3;r.nextBossAt=6000;
 assert.equal(restoreStoryCheckpoint(r),true);
 assert.equal(r.bossesDefeated,2);assert.equal(r.nextBossAt,4800);
});
