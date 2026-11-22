import test from 'node:test';
import assert from 'node:assert/strict';
import {createCanvas} from '@napi-rs/canvas';
import * as core from '../tanahoraflavio/runner-core.mjs';
import {nextStoryBossDistance} from '../tanahoraflavio/runner-bosses.mjs';
import {drawBossArena} from '../tanahoraflavio/runner-boss-art.mjs';
import {drawTileSurface} from '../tanahoraflavio/runner-platform-room-art.mjs';
function duel(width=900){
 const r=core.createRun({mode:'story',seed:17});core.startRun(r);core.resizeRun(r,width);
 for(const k of ['nextRaid','nextObstacle','nextAllyAt','nextSupportAt','nextPower','nextPassport'])r[k]=Infinity;
 r.terrain.nextAt=Infinity;r.distance=r.routeDistance=r.nextBossAt=nextStoryBossDistance(0);
 core.advanceRun(r,1/120);Object.assign(r.boss,{phase:'recover',phaseFor:100,reducedMotion:true});return r;
}
function step(r,time,fps=120){for(let i=0;i<Math.round(time*fps);i++)core.advanceRun(r,1/fps);}
test('releasing jump during an arena ascent gives a lower hop while holding keeps the original full jump',()=>{
 assert.equal(typeof core.releaseJumpRun,'function');
 for(const fps of [30,60,120]){
  const full=duel(),short=duel();core.jumpRun(full);core.jumpRun(short);step(full,.1,fps);step(short,.1,fps);
  assert.equal(core.releaseJumpRun(short),true);assert.ok(short.player.velocity<=260);
  let high=full.player.y,low=short.player.y;
  for(let i=0;i<fps;i++){core.advanceRun(full,1/fps);core.advanceRun(short,1/fps);high=Math.max(high,full.player.y);low=Math.max(low,short.player.y);}
  assert.ok(high>95&&low<high-20);assert.equal(full.player.grounded,true);assert.equal(short.player.grounded,true);
 }
});
test('jump release does not alter running, flights, descending jumps or grounded input',()=>{
 assert.equal(typeof core.releaseJumpRun,'function');
 const road=core.createRun({mode:'story'});core.startRun(road);core.jumpRun(road);
 assert.equal(core.releaseJumpRun(road),false);assert.equal(road.player.velocity,610);
 const r=duel();assert.equal(core.releaseJumpRun(r),false);
 core.jumpRun(r);r.player.velocity=-30;assert.equal(core.releaseJumpRun(r),false);assert.equal(r.player.velocity,-30);
 r.boss.traversal=true;r.player.velocity=500;assert.equal(core.releaseJumpRun(r),false);assert.equal(r.player.velocity,500);
});
test('the basic arena buster keeps at most three physical bullets and a blocked fourth shot costs no ammo',()=>{
 const r=duel();r.player.x=core.playerBounds(r).min;r.ammo=12;
 for(let i=0;i<3;i++){assert.equal(core.attackRun(r),true);step(r,.28);}
 assert.equal(r.heroShots.length,3);const ammo=r.ammo;
 assert.equal(core.attackRun(r),false);assert.equal(r.ammo,ammo);assert.equal(r.heroShots.length,3);
 step(r,.4);assert.ok(r.heroShots.length<3);assert.equal(core.attackRun(r),true);
});
test('victory opens the room while distance and normal running resume immediately',()=>{
 for(const fps of [30,60,120]){
  const r=duel(),distance=r.distance;r.boss.hp=0;core.advanceRun(r,1/fps);
  assert.equal(r.boss,null);assert.ok(r.arenaExit,'a visual opening follows the battle');
  core.advanceRun(r,1/fps);assert.ok(r.distance>distance,'the opening must not freeze the escape');
  step(r,1,fps);assert.equal(r.arenaExit,null);assert.equal(r.status,'running');
 }
});
test('the arena gate closes during entry and disappears when the exit is open without mutating game state',()=>{
 const render=state=>{const c=createCanvas(480,300).getContext('2d'),before=JSON.stringify(state);drawBossArena(c,{width:480,ground:246,state});assert.equal(JSON.stringify(state),before);return c;};
 const empty=render({phase:'intro',age:0}),closed=render({phase:'charge',age:2}),open=render({phase:'exit',age:1,duration:.65});
 assert.ok(closed.getImageData(8,190,1,1).data[3]>200,'the closed gate is visible beside the arena');
 assert.equal(empty.getImageData(8,190,1,1).data[3],0,'the entry shutter starts open');
 assert.equal(open.getImageData(8,190,1,1).data[3],0,'the exit does not leave a closed gate behind');
 const traversal=render({phase:'attack',traversal:true});assert.equal(traversal.getImageData(8,190,1,1).data[3],0);
});
test('tile seams travel with a clipped platform instead of sticking to the viewport edge',()=>{
 const render=originX=>{const c=createCanvas(100,20).getContext('2d');drawTileSurface(c,{x:0,y:0,width:100,height:10,originX});return c;};
 assert.deepEqual(render(0).getImageData(20,3,60,3).data,render(-10).getImageData(10,3,60,3).data);
});
