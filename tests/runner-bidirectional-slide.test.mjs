import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
import {TERRAIN} from '../tanahoraflavio/runner-terrain.mjs';
import {drawSlideContact} from '../tanahoraflavio/runner-terrain-art.mjs';

const dt=1/120;
function ready(mode,width,assisted){
 const r=core.createRun({mode,seed:37,assisted,manualStory:false});core.startRun(r);core.resizeRun(r,width);
 for(const key of ['nextBossAt','nextRaid','nextObstacle','nextAllyAt','nextSupportAt','nextPower','nextPassport','nextPickup'])r[key]=Infinity;
 r.terrain.nextAt=Infinity;r.terrain.lessonCompleted=true;r.player.x=width/2;return r;
}
function step(r,n){for(let i=0;i<n;i++)core.advanceRun(r,dt);}
for(const mode of ['story','endless'])for(const width of [480,900])for(const assisted of [false,true])
test(`bidirectional slide preserves automatic world travel: ${mode}/${width}/${assisted}`,()=>{
 const neutral=ready(mode,width,assisted),left=ready(mode,width,assisted),right=ready(mode,width,assisted),center=width/2,frames=16;
 for(const [r,direction] of [[left,-1],[right,1]]){
  core.moveRun(r,direction);core.crouchRun(r,true);
 }
 for(const r of [neutral,left,right])step(r,frames);
 for(const [r,d] of [[left,-1],[right,1]]){
  assert.equal(r.player.sliding,true);
  assert.equal(r.player.slideDirection,d);
  assert.ok(Math.abs((r.player.x-center)*d-TERRAIN.slideSpeed*frames*dt)<1e-6);
  assert.equal(r.distance,neutral.distance);
  assert.equal(r.routeDistance,neutral.routeDistance);
  assert.equal(r.status,'running');
  core.crouchRun(r,false);assert.equal(r.player.sliding,false);
 }
 for(const r of [neutral,left,right])step(r,16);
 assert.equal(left.distance,neutral.distance,'retreating without crouch cannot slow the world');
 assert.equal(right.distance,neutral.distance);
 assert.equal(left.routeDistance,neutral.routeDistance);
 assert.ok(neutral.distance>0);
 core.clearRunInput(left);assert.equal(left.player.slideDirection,0);
});
test('reversing an active slide starts a new bounded slide, never an endless latch',()=>{
 const r=ready('story',900,false);
 core.moveRun(r,1);core.crouchRun(r,true);step(r,12);
 assert.equal(r.player.sliding,true);
 const x=r.player.x;core.moveRun(r,-1);step(r,1);
 assert.equal(r.player.sliding,false,'old slide ends on reversal');
 step(r,12);assert.equal(r.player.sliding,true);assert.equal(r.player.slideDirection,-1);assert.ok(r.player.x<x);
 step(r,120);assert.equal(r.player.sliding,false,'holding cannot repeat the dash forever');
 core.crouchRun(r,false);core.crouchRun(r,true);step(r,1);assert.equal(r.player.sliding,true);
 core.clearRunInput(r);assert.equal(r.player.sliding,false);
});
test('slide contact trail mirrors behind the movement direction and respects reduced motion',()=>{
 const record=direction=>{const points=[],c={globalAlpha:1,save(){},restore(){},beginPath(){},moveTo(x,y){points.push([x,y]);},lineTo(x,y){points.push([x,y]);},stroke(){}};
  drawSlideContact(c,{x:100,y:120,age:.3,direction});return points;};
 const right=record(1),left=record(-1);
 assert.equal(right.length,6);
 assert.deepEqual(left,right.map(([x,y])=>[200-x,y]));
 let touched=false;drawSlideContact({save(){touched=true;}},{x:100,y:120,reducedMotion:true,direction:-1});assert.equal(touched,false);
});
