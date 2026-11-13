import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

test('combat uses complete illustrated character frames and foot/muzzle anchors',async()=>{
 const {combatDefinitions,combatActors}=await import('../tanahoraflavio/runner-combat-sprite-data.mjs');
 const {combatFrameFor,combatGeometryFor}=await import('../tanahoraflavio/runner-combat-geometry.mjs');
 assert.equal(Object.keys(combatActors).length,24);
 for(const [type,actor] of Object.entries(combatActors)){
  const sheet=combatDefinitions[actor.sheet],indices=[0,1,2,3].map(frame=>combatFrameFor(type,{frame}).index);
  assert.equal(new Set(indices).size,4,type);
  for(const index of indices){const f=sheet.frames[index];assert.ok(f.height>(type==='flavio-slide-shot'?120:200),'whole body, not detached portrait');assert.ok(f.x>=0&&f.y>=0&&f.x+f.width<=sheet.width&&f.y+f.height<=sheet.height);assert.ok(f.center>f.x&&f.center<f.x+f.width);assert.ok(f.groundY>=f.y+f.height-12);}
  const g=combatGeometryFor(type,{frame:2});assert.ok(g.muzzle.y<0);assert.equal(Math.sign(g.muzzle.x),type.startsWith('flavio')?1:-1,type+' firing direction');
  assert.equal(combatFrameFor(type,{attacking:true,progress:0}).index,indices[2],'first physical release has full release pose');
  assert.equal(combatFrameFor(type,{preparing:true,progress:.8}).index,indices[1]);
  assert.equal(combatFrameFor(type,{recovering:true,progress:.2}).index,indices[3]);
  assert.deepEqual(combatFrameFor(type,{reducedMotion:true,phase:0}),combatFrameFor(type,{reducedMotion:true,phase:99}));
 }
 for(const d of Object.values(combatDefinitions)){const bytes=await readFile(new URL(d.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),d.sha256);}
});

test('all essential emitters fit entirely above their ship inside the playing field',async()=>{
 const {combatGeometryFor}=await import('../tanahoraflavio/runner-combat-geometry.mjs');
 const {regularEmitterPose}=await import('../tanahoraflavio/runner-cast-pose.mjs');
 for(const width of [480,900])for(const type of ['dilma','simone','soraya','joice','meme-army'])for(const frame of [0,1,2,3]){
  const pose=regularEmitterPose(type,width),g=combatGeometryFor(type,{frame,scale:pose.scale});
  assert.ok(pose.y+g.rect.y>=0,type+' head cannot be cropped by top of canvas');
  assert.ok(pose.x+g.rect.x>=0&&pose.x+g.rect.x+g.rect.width<=width,type+' complete figure fits horizontally');
 }
});
