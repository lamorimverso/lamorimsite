import test from 'node:test';
import assert from 'node:assert/strict';
import {createCanvas} from '@napi-rs/canvas';
import {createSceneryScroll,advanceSceneryScroll,journeySceneryGeometry,drawJourneyScenery,sampleSceneryDistance} from '../tanahoraflavio/runner-scenery.mjs';
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

test('scenery interpolation never predicts movement or rewinds on UI redraws',()=>{
 assert.equal(sampleSceneryDistance(100,104,0),100);
 assert.equal(sampleSceneryDistance(100,104,.5),102);
 assert.equal(sampleSceneryDistance(100,104,1),104);
 assert.equal(sampleSceneryDistance(100,104,2),104);
 assert.equal(sampleSceneryDistance(100,104,.5,104),104);
 assert.equal(sampleSceneryDistance(100,104,.5,120),104);
 assert.equal(sampleSceneryDistance(104,0,.5,104),0);
 assert.equal(sampleSceneryDistance(100,104,NaN),104);
 assert.equal(sampleSceneryDistance(104,104,.25),104);
});
test('interpolated scroll follows a 120 Hz simulation evenly on common display refresh rates',()=>{
 for(const hz of [30,60,90,120,144,165]){
  const speed=360,tick=speed/120;
  let last=0;
  for(let frame=1;frame<=hz*2;frame++){
   const elapsed=frame/hz,steps=Math.floor(elapsed*120+1e-8),current=steps*tick;
   const alpha=Math.max(0,Math.min(1,elapsed*120-steps));
   const visual=sampleSceneryDistance(Math.max(0,current-tick),current,alpha,last);
   assert.ok(visual>=last&&visual<=current);
   assert.ok(Math.abs(visual-Math.max(0,elapsed*speed-tick))<1e-7);
   last=visual;
  }
 }
});
test('day and night progress by physical distance in full scroll with unchanged geography',()=>{
 const state=createSceneryScroll(),scrollRegions=make(state,0);
 function sample(distance){
  const c=createCanvas(480,300).getContext('2d');
  drawJourneyScenery(c,{scrollRegions,distance,routeDistance:20000,width:480,campaignStages:stages});
  return {sky:[...c.getImageData(9,7,1,1).data],road:[...c.getImageData(9,252,1,1).data]};
 }
 const day=sample(7500),night=sample(13500),brightness=a=>a[0]+a[1]+a[2];
 assert.ok(brightness(day.sky)>brightness(night.sky)+55);
 assert.ok(day.road.every((v,i)=>Math.abs(v-night.road[i])<=2));
});

test('automatic reduced effects preserve all physical scenery planes while decorative clouds stay still',()=>{
 for(const width of [480,900]){
  const state=createSceneryScroll(),regions=make(state,1000);
  const options={reducedMotion:true,scrollWorld:true};
  const a=geom(regions,1000,width,options),b=geom(regions,1100,width,options);
  assert.equal(a.scrollDistance,1000);assert.equal(b.scrollDistance,1100);
  for(let i=0;i<3;i++){
   const visible=a.layers[i].segments.filter(seg=>seg.x>=0&&seg.x<=width);
   assert.ok(visible.length>0);
   for(const segment of visible){
    const next=find(b.layers[i].segments,segment.segmentIndex);
    assert.ok(next);assert.equal(next.stageId,segment.stageId);
    assert.ok(Math.abs(segment.x-next.x-100*a.layers[i].scale)<1e-7);
   }
  }
  assert.deepEqual(a.clouds,b.clouds,'optional cloud drift remains reduced');
  assert.notEqual(a.roadOffset,b.roadOffset,'road moves with the physical journey');
  assert.deepEqual(b,geom(regions,1100,width,options),'no time-based drift at rest');
  const frame=distance=>{
   const c=createCanvas(width,300).getContext('2d');
   drawJourneyScenery(c,{scrollRegions:regions,distance,routeDistance:20000,width,...options});
   return c.getImageData(0,106,width,126).data;
  };
  const before=frame(1000),after=frame(1100);let changed=0;
  for(let i=0;i<before.length;i+=4)if(Math.abs(before[i]-after[i])+Math.abs(before[i+1]-after[i+1])+Math.abs(before[i+2]-after[i+2])>15)changed++;
  assert.ok(changed>1000,'buildings and monuments, not only road marks, move with automatic reduced effects: '+changed);
 }
});
