import test from 'node:test';
import assert from 'node:assert/strict';
import {drawJourneyScenery,journeySceneryGeometry,raidMoodFor} from '../tanahoraflavio/runner-scenery.mjs';

test('a luz volta gradualmente em toda a duração da recuperação de Joice',()=>{
 const recoveryFor=2.5;
 assert.equal(raidMoodFor({phase:'recovery',remaining:recoveryFor,recoveryFor}),1);
 assert.equal(raidMoodFor({phase:'recovery',remaining:recoveryFor/2,recoveryFor}),.5);
 assert.equal(raidMoodFor({phase:'recovery',remaining:0,recoveryFor}),0);
});

// Record the renderer's Canvas boundary without depending on an installed browser.
// Pixel continuity remains covered by journey-scenery.test.mjs in browser CI.
function canvasTrace(){
 const operations=[],stack=[];
 const c={globalAlpha:1,fillStyle:'#123456',strokeStyle:'#654321',lineWidth:7,lineJoin:'miter',transform:[1,1,0,0],path:[],
  save(){stack.push({globalAlpha:this.globalAlpha,fillStyle:this.fillStyle,strokeStyle:this.strokeStyle,lineWidth:this.lineWidth,lineJoin:this.lineJoin,transform:[...this.transform]});},
  restore(){assert.ok(stack.length,'balanced Canvas state');Object.assign(this,stack.pop());},
  translate(x,y){this.transform[2]+=x;this.transform[3]+=y;},scale(x,y){this.transform[0]*=x;this.transform[1]*=y;},
  beginPath(){this.path=[];},
  fill(){operations.push({kind:'fill',style:this.fillStyle,alpha:this.globalAlpha,path:[...this.path]});},
  stroke(){operations.push({kind:'stroke',style:this.strokeStyle,alpha:this.globalAlpha,path:[...this.path]});},
  fillRect(x,y,width,height){operations.push({kind:'rect',x,y,width,height,style:this.fillStyle,alpha:this.globalAlpha});},
  createLinearGradient(...points){return gradient('linear',points);},
  createRadialGradient(...points){return gradient('radial',points);}
 };
 for(const method of ['moveTo','lineTo','bezierCurveTo','quadraticCurveTo','ellipse','rect','roundRect','closePath']){
  c[method]=(...args)=>{assert.ok(args.every(Number.isFinite),`${method} receives finite coordinates`);c.path.push([method,...args]);};
 }
 function gradient(kind,points){
  assert.ok(points.every(Number.isFinite),'gradient coordinates stay finite');
  return {kind,points,stops:[],addColorStop(offset,color){assert.ok(offset>=0&&offset<=1);this.stops.push({offset,color});}};
 }
 return {c,operations,stack};
}
function render(options={},alpha=1){
 const trace=canvasTrace();trace.c.globalAlpha=alpha;
 drawJourneyScenery(trace.c,{routeDistance:2500,distance:2500,width:480,...options});
 return trace;
}
const verticalWash=operations=>operations.find(op=>op.kind==='rect'&&op.y===0&&op.height===246&&op.style.kind==='linear');
const horizonVeil=operations=>operations.find(op=>op.kind==='rect'&&op.y>=100&&op.y<200&&op.y+op.height<=246&&op.style.kind==='linear');
const flag=operations=>operations.find(op=>op.kind==='fill'&&op.path[0]?.[0]==='moveTo'&&op.path[0][2]===192&&op.path.some(command=>command[0]==='quadraticCurveTo'));

test('daylight adapts to destinations instead of bleaching every horizon the same white',()=>{
 const rio=verticalWash(render({routeDistance:9500}).operations);
 const florida=verticalWash(render({routeDistance:23500}).operations);
 assert.ok(rio&&florida);
 assert.notDeepEqual(rio.style.stops,florida.style.stops,'the cool coast and warm coast keep distinct ambient light');
});

test('a transparent horizon veil separates distant architecture from the nearer scenery',()=>{
 for(const width of [360,900]){
  const {operations}=render({width});
  const veil=horizonVeil(operations);
  assert.ok(veil,'distant silhouettes need a shallow atmospheric veil');
  assert.equal(veil.width,width);
  assert.match(veil.style.stops[0].color,/,0\)$/,'the upper edge fades rather than forming a wall');
  const index=operations.indexOf(veil);
  assert.ok(operations.slice(0,index).some(op=>op.kind==='fill'&&op.alpha>0&&op.alpha<1),'distant shapes are behind the veil');
  assert.ok(operations.slice(index+1).some(op=>op.kind==='fill'&&op.alpha>0&&op.alpha<1),'nearer shapes remain in front');
 }
});

test('quiet mode also lowers decorative flags so gameplay cues retain contrast',()=>{
 const normal=flag(render().operations),quiet=flag(render({quiet:1}).operations);
 assert.ok(normal&&quiet,'the same route occurrence retains its flag');
 assert.ok(quiet.alpha<normal.alpha*.75,'ambient decoration participates in quiet mode');
});

test('lighting and route geometry stay continuous across every destination and the returning lap',()=>{
 for(const boundary of [7000,14000,21000,28000,35000,70000]){
  const a=journeySceneryGeometry({routeDistance:boundary-.001,width:480});
  const b=journeySceneryGeometry({routeDistance:boundary+.001,width:480});
  for(let layer=0;layer<3;layer++)for(const item of a.layers[layer].segments){
   const next=b.layers[layer].segments.find(segment=>segment.segmentIndex===item.segmentIndex);
   if(next)assert.ok(Math.abs(item.x-next.x)<.001,'no spatial snap at a 7 km border');
  }
  for(const reducedMotion of [false,true]){
   const before=render({routeDistance:boundary-.001,distance:boundary,width:480,reducedMotion}).operations;
   const after=render({routeDistance:boundary+.001,distance:boundary,width:480,reducedMotion}).operations;
   for(const select of [verticalWash,horizonVeil]){
    const previous=select(before),next=select(after);assert.ok(previous&&next);
    const channels=op=>op.style.stops.flatMap(stop=>stop.color.match(/[\d.]+/g).map(Number));
    assert.ok(channels(previous).every((value,i)=>Math.abs(value-channels(next)[i])<.01),'atmospheric channels blend continuously');
   }
  }
 }
});

test('the six destinations retain their 7 km journey and distinct parallax speeds',()=>{
 const places=['brasilia','rio','argentina','paraguai','florida','casa-branca'];
 for(let index=0;index<12;index++){
  const routeDistance=index*7000+2500;
  const a=journeySceneryGeometry({routeDistance,width:480});
  const b=journeySceneryGeometry({routeDistance:routeDistance+100,width:480});
  assert.equal(a.landmarks.find(item=>item.segmentIndex===index).stageId,places[index%places.length]);
  assert.equal(a.landmarks.find(item=>item.segmentIndex===index).x,168);
  for(const [layer,delta] of [[0,14],[1,18],[2,22]]){
   const previous=a.layers[layer].segments.find(item=>item.segmentIndex===index);
   const next=b.layers[layer].segments.find(item=>item.segmentIndex===index);
   assert.ok(Math.abs(previous.x-next.x-delta)<.00001,'nearer planes pass faster');
  }
 }
});

test('a paused route keeps its scenery while reduced motion freezes every decorative stroke',()=>{
 const a=journeySceneryGeometry({routeDistance:2500,distance:2500,width:480});
 const b=journeySceneryGeometry({routeDistance:2500,distance:8000,width:480});
 assert.deepEqual(a.layers,b.layers);assert.deepEqual(a.landmarks,b.landmarks);assert.deepEqual(a.paletteStops,b.paletteStops);
 const fixed=render({reducedMotion:true}).operations;
 assert.equal(JSON.stringify(fixed),JSON.stringify(render({reducedMotion:true,distance:8000}).operations));
});

test('mobile scenery has bounded work, no text and preserves the caller Canvas state',()=>{
 for(const width of [360,900])for(const routeDistance of [2500,9500,16500,23500,30500,35000]){
  const {c,stack,operations}=render({width,routeDistance},.4);
  assert.equal(stack.length,0);assert.equal(c.globalAlpha,.4);assert.equal(c.fillStyle,'#123456');assert.equal(c.lineWidth,7);
  assert.deepEqual(c.transform,[1,1,0,0]);
  assert.ok(operations.length<230,`bounded vector work at ${width}px: ${operations.length} draws`);
  assert.ok(operations.every(op=>op.alpha>=0&&op.alpha<=.4),'no decorative layer overrides caller transparency');
  assert.ok(operations.filter(op=>op.kind==='rect'&&op.y>=246).every(op=>op.y+op.height<=300),'ground stays within the existing arena');
 }
});
