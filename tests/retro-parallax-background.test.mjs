import test from 'node:test';
import assert from 'node:assert/strict';
import {createCanvas} from '@napi-rs/canvas';
import {drawJourneyScenery,journeySceneryGeometry} from '../tanahoraflavio/runner-scenery.mjs';

function frame(routeDistance,{width=480,reducedMotion=false,distance=routeDistance,campaignStages}={}){
 const c=createCanvas(width,300),ctx=c.getContext('2d');
 drawJourneyScenery(ctx,{routeDistance,distance,width,reducedMotion,campaignStages});
 return ctx.getImageData(0,0,width,300).data;
}
function sample(p,width,x,y){
 const n=(y*width+x)*4;return Array.from(p.slice(n,n+3));
}

test('original retro Brasília backdrop has detailed illuminated skyline but keeps playable ground flat',()=>{
 const width=480,buffer=frame(2500);
 const colors=new Set();
 for(let y=175;y<232;y+=2)for(let x=8;x<width-8;x+=3){
  const p=(y*width+x)*4;
  colors.add(String(buffer[p])+','+buffer[p+1]+','+buffer[p+2]);
 }
 assert.ok(colors.size>120,'the skyline must have color, architectural and lighting depth');
 assert.notDeepEqual(sample(buffer,width,40,10),sample(buffer,width,40,208),
  'the retro dusk sky and civic silhouette must have visible contrast');
 const pavement=sample(buffer,width,100,252);
 for(const x of [12,50,210,365,470])assert.deepEqual(sample(buffer,width,x,252),pavement,
  'the scenery must not paint new hazards or seams in the collision lane');
});

test('every destination has its own atmospheric colors without importing artwork',()=>{
 const stages=['brasilia','rio','sao-paulo','argentina','paraguai','florida','casa-branca','brasilia-final'];
 const tops=stages.map((id,i)=>sample(frame(2500,{campaignStages:[id]}),480,30,18).join(','));
 assert.equal(new Set(tops).size,stages.length,'all eight city environments have distinct atmospheres');
});

test('background follows simulated route geometry and respects reduced motion',()=>{
 const options={routeDistance:2500,width:480};
 const g=journeySceneryGeometry(options),next=journeySceneryGeometry({...options,routeDistance:2700});
 for(const [i,scale] of [.14,.18,.22].entries()){
  const same=g.layers[i].segments.find(s=>s.segmentIndex===0);
  const moved=next.layers[i].segments.find(s=>s.segmentIndex===0);
  assert.ok(Math.abs(same.x-moved.x-200*scale)<.001);
 }
 assert.deepEqual(frame(2500,{reducedMotion:true,distance:2500}),frame(2500,{reducedMotion:true,distance:8000}),
  'reduced motion must freeze decorative animation and scrolling');
 assert.notDeepEqual(frame(2500),frame(2700),
  'route progress must move architecture instead of leaving a static illustration');
});
