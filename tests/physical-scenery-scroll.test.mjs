import test from 'node:test';
import assert from 'node:assert/strict';
import {createCanvas} from '@napi-rs/canvas';
import {createSceneryScroll,advanceSceneryScroll,journeySceneryGeometry,drawJourneyScenery} from '../tanahoraflavio/runner-scenery.mjs';
const stages=['brasilia','rio','sao-paulo','argentina','paraguai','florida','casa-branca','brasilia-final'];
const make=(state,distance,stageId='brasilia',transition)=>advanceSceneryScroll(state,{distance,stageId,transition});
const geom=(scrollRegions,distance,width=480,extra={})=>journeySceneryGeometry({scrollRegions,distance,width,routeDistance:20000,campaignStages:stages,openingDistance:20800,...extra});
const find=(items,index)=>items.find(s=>s.segmentIndex===index);
test('all three architectural planes and complete landmarks travel left even with frozen route progress',()=>{
 for(const width of [480,900])for(const d of [0,1000,100000,1000000]){
  const state=createSceneryScroll(),a=geom(make(state,d),d,width),b=geom(make(state,d+100),d+100,width);
  assert.deepEqual(a.layers.map(l=>l.scale),[.24,.38,.56]);
  for(let i=0;i<3;i++){
   const visible=a.layers[i].segments.filter(s=>s.x>=0&&s.x<=width);
   assert.ok(visible.length>0);
   for(const old of visible){
    const next=find(b.layers[i].segments,old.segmentIndex);
    assert.ok(next,'visible artwork remains allocated');
    assert.equal(next.stageId,old.stageId);
    assert.ok(Math.abs(old.x-next.x-100*a.layers[i].scale)<1e-7);
   }
  }
  const old=a.landmarks.find(s=>s.x>=0&&s.x<=width);
  assert.ok(old);assert.ok(Math.abs(old.x-find(b.landmarks,old.segmentIndex).x-56)<1e-7);
  assert.ok(a.layers.every(l=>l.segments.length<20),'bounded draw count');
 }
});
test('each new city is queued offscreen and passes left without replacing the visible old art',()=>{
 for(const width of [480,900]){
  const state=createSceneryScroll();make(state,0);
  let start=1000;
  for(let i=1;i<stages.length;i++){
   const previous=stages[i-1],target=stages[i];
   const before=geom(make(state,start,previous),start,width);
   const incoming=geom(make(state,start,previous,{active:true,from:{id:previous},to:{id:target},progress:.2}),start,width);
   for(let layer=0;layer<3;layer++){
    assert.deepEqual(incoming.layers[layer].segments.filter(s=>s.x>=-175&&s.x<=width+175),before.layers[layer].segments.filter(s=>s.x>=-175&&s.x<=width+175));
    assert.ok(incoming.layers[layer].segments.every(s=>s.stageId!==target||s.x>=width+190));
   }
   const later=geom(make(state,start+5000,target),start+5000,width);
   for(const layer of later.layers){
    assert.ok(layer.segments.filter(s=>s.x>=0&&s.x<=width).every(s=>s.stageId===target));
   }
   start+=10000;
  }
  assert.ok(state.regions.length<=3);
 }
});
test('physical scenery pixels change above the floor while nominal route is held',()=>{
 const state=createSceneryScroll(),regions=make(state,0);
 const frame=(distance,reducedMotion=false)=>{
  const c=createCanvas(480,300).getContext('2d');
  drawJourneyScenery(c,{scrollRegions:regions,distance,routeDistance:20000,width:480,reducedMotion,openingDistance:20800,campaignStages:stages});
  return c.getImageData(0,106,480,126).data;
 };
 const a=frame(1000),b=frame(1100);
 let changed=0;for(let i=0;i<a.length;i+=4)if(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])>15)changed++;
 assert.ok(changed>1000,'architecture, not only road stripes, visibly moves: '+changed);
 assert.deepEqual(frame(1000,true),frame(1100,true));
});
test('restarts discard old regions; stationary combat freezes visual coordinates',()=>{
 const state=createSceneryScroll();make(state,0);make(state,4000,'rio');
 const a=geom(make(state,4000,'rio'),4000),b=geom(make(state,4000,'rio'),4000);
 assert.deepEqual(a,b);
 const reset=geom(make(state,0,'brasilia'),0);
 assert.equal(state.regions.length,1);assert.ok(reset.layers.every(l=>l.segments.every(s=>s.stageId==='brasilia')));
});
