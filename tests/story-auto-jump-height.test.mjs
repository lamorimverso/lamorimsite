import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';

function isolated(mode,width){
 const r=core.createRun({mode,seed:27,manualStory:false});core.startRun(r);core.resizeRun(r,width);
 for(const key of ['nextBossAt','nextRaid','nextObstacle','nextPickup','nextPower','nextSupportAt','nextAllyAt','nextPassport'])r[key]=Infinity;
 r.terrain.nextAt=Infinity;return r;
}
function jumpPeak(mode,width,release,fps){
 const r=isolated(mode,width),start=r.distance,dt=1/fps;assert.ok(core.jumpRun(r));core.advanceRun(r,dt);
 const cut=release?core.releaseJumpRun(r):false;let peak=r.player.y;
 for(let i=0;i<fps;i++){core.advanceRun(r,dt);peak=Math.max(peak,r.player.y);}
 assert.equal(r.status,'running');assert.ok(r.distance>start+100);assert.equal(r.manualStory,false);assert.equal(r.player.grounded,true);
 return {peak,cut};
}
test('automatic Story short and held jumps have distinct measured heights without stopping the road',()=>{
 for(const width of [480,900])for(const fps of [30,60,120]){
  const full=jumpPeak('story',width,false,fps),short=jumpPeak('story',width,true,fps);
  assert.equal(short.cut,true);assert.ok(short.peak>50,'short jump retains clearance for low obstacles');
  assert.ok(full.peak-short.peak>20,'held jump reaches higher surfaces');
 }
});
test('Endless route retains the original full-height jump on release',()=>{
 for(const width of [480,900]){
  const full=jumpPeak('endless',width,false,120),released=jumpPeak('endless',width,true,120);
  assert.equal(released.cut,false);assert.equal(released.peak,full.peak);
 }
});
