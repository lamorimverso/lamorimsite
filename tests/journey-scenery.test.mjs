import test, {before, after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import * as scenery from '../tanahoraflavio/runner-scenery.mjs';

const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const stageIds=['brasilia','rio','argentina','paraguai','florida','casa-branca'];
let browser,page;
before(async()=>{
 browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 page=await browser.newPage();
 const source=await readFile(new URL('../tanahoraflavio/runner-scenery.mjs',import.meta.url),'utf8');
 await page.evaluate(async source=>{window.scenery=await import(URL.createObjectURL(new Blob([source],{type:'text/javascript'})));},source);
});
after(async()=>{await browser?.close();});

function geometry(options){
 assert.equal(typeof scenery.journeySceneryGeometry,'function','continuous scenery needs its pure geometry API');
 return scenery.journeySceneryGeometry(options);
}
function landmark(g,index){return g.landmarks.find(item=>item.segmentIndex===index);}
function flattenColors(g){return g.paletteStops.flatMap(stop=>Object.values(stop.palette).flat());}

// The old skyline assigned globalAlpha=.55, making a fully transparent caller visible.
test('legacy scenery respects caller transparency and restores Canvas state',async()=>{
 const result=await page.evaluate(()=>{
  const canvas=document.createElement('canvas');canvas.width=480;canvas.height=300;
  const c=canvas.getContext('2d');c.globalAlpha=0;c.fillStyle='#123456';c.lineWidth=7;c.translate(2,3);
  scenery.drawScenery(c,{stage:{id:'rio'},width:480,distance:7000});
  const pixels=c.getImageData(0,0,480,300).data;
  return {visible:pixels.some((v,i)=>i%4===3&&v!==0),alpha:c.globalAlpha,fill:c.fillStyle,lineWidth:c.lineWidth,transform:[c.getTransform().e,c.getTransform().f]};
 });
 assert.equal(result.visible,false,'a transparent caller must leave every pixel transparent');
 assert.deepEqual(result,{visible:false,alpha:0,fill:'#123456',lineWidth:7,transform:[2,3]});
});

test('journey renderer exports the integration API',()=>{
 assert.equal(typeof scenery.drawJourneyScenery,'function');
});

for(const width of [480,900]){
 test(`all six landmarks arrive, pass and leave in a continuing route at ${width}px`,()=>{
  for(let index=0;index<stageIds.length*2;index++){
   const start=landmark(geometry({routeDistance:index*7000,width}),index);
   const passing=landmark(geometry({routeDistance:index*7000+2500,width}),index);
   const end=landmark(geometry({routeDistance:index*7000+6500,width}),index);
   assert.ok(start&&passing&&end,'offscreen geometry retains the same destination occurrence');
   assert.equal(passing.stageId,stageIds[index%stageIds.length]);
   assert.ok(start.x>width-170,'a landmark approaches from the right');
   assert.ok(passing.x>0&&passing.x<width*.6,'the landmark passes the runner');
   assert.ok(end.x<-170,'the landmark exits to the left');
   assert.equal(passing.alpha,1);
  }
 });

 test(`three geographic planes advance from the right without resets at ${width}px`,()=>{
  for(let index=1;index<=stageIds.length*2;index++){
   const before=geometry({routeDistance:index*7000-1000,width});
   const after=geometry({routeDistance:index*7000+1000,width});
   assert.equal(before.layers.length,3);
   assert.ok(before.layers[0].scale<before.layers[1].scale&&before.layers[1].scale<before.layers[2].scale,'planes have distinct parallax');
   for(let layer=0;layer<3;layer++){
    const incoming=before.layers[layer].segments.find(s=>s.segmentIndex===index);
    const advanced=after.layers[layer].segments.find(s=>s.segmentIndex===index);
    assert.equal(incoming.stageId,stageIds[index%stageIds.length]);
    assert.ok(incoming.x>width*.5&&incoming.x<width,'new geography first occupies the right side');
    assert.ok(advanced.x<width*.5,'the same geographic border passes left');
    assert.ok(advanced.x<incoming.x);
   }
  }
 });

 test(`every 7 km border and the 42 km loop are continuous at ${width}px`,()=>{
  for(const boundary of [7000,14000,21000,28000,35000,42000,84000]){
   const before=geometry({routeDistance:boundary-.001,distance:boundary-.001,width});
   const after=geometry({routeDistance:boundary+.001,distance:boundary+.001,width});
   for(let layer=0;layer<3;layer++){
    for(const old of before.layers[layer].segments){
     const next=after.layers[layer].segments.find(s=>s.segmentIndex===old.segmentIndex);
     if(!next){assert.ok(old.x+old.width<-180,'only fully departed strips can leave the geometry');continue;}
     assert.ok(Math.abs(next.x-old.x)<.001,'geographic strips never snap to their start');
    }
   }
   for(const old of before.landmarks){
    const next=landmark(after,old.segmentIndex);
    if(!next){assert.ok(old.x<-180,'only fully departed landmarks can leave the geometry');continue;}
    assert.ok(Math.abs(next.x-old.x)<.001,'landmarks do not jump at destination or lap changes');
   }
   const colorsBefore=flattenColors(before),colorsAfter=flattenColors(after);
   assert.equal(colorsBefore.length,colorsAfter.length);
   assert.ok(colorsBefore.every((value,i)=>Math.abs(value-colorsAfter[i])<.01),'every sky/ground palette channel is continuous');
  }
 });
}

test('physical distance only moves decoration while stopped route geography stays put',()=>{
 const a=geometry({routeDistance:2500,distance:2500,width:900});
 const b=geometry({routeDistance:2500,distance:2600,width:900});
 assert.deepEqual(a.layers,b.layers);
 assert.deepEqual(a.landmarks,b.landmarks);
 assert.deepEqual(a.paletteStops,b.paletteStops);
 assert.notEqual(a.roadOffset,b.roadOffset);
});

test('reduced motion freezes decorative positions but blends destination identity before each border',()=>{
 const a=geometry({routeDistance:1000,distance:1000,width:900,reducedMotion:true});
 const b=geometry({routeDistance:2500,distance:9500,width:900,reducedMotion:true});
 assert.deepEqual(a.layers,b.layers);
 assert.deepEqual(a.landmarks,b.landmarks);
 assert.deepEqual(a.clouds,b.clouds);
 assert.equal(a.roadOffset,0);assert.equal(b.roadOffset,0);
 for(const boundary of [7000,14000,21000,28000,35000,42000,84000]){
  const middle=geometry({routeDistance:boundary-500,width:900,reducedMotion:true});
  const before=geometry({routeDistance:boundary-.001,width:900,reducedMotion:true});
  const after=geometry({routeDistance:boundary+.001,width:900,reducedMotion:true});
  const incoming=landmark(middle,boundary/7000);
  assert.ok(incoming.alpha>0&&incoming.alpha<1,'destination changes through a gradual blend');
  assert.equal(incoming.x,landmark(after,boundary/7000).x,'the landmark itself remains stationary');
  assert.ok(Math.abs(landmark(before,boundary/7000).alpha-landmark(after,boundary/7000).alpha)<.00001);
  const colorsBefore=flattenColors(before),colorsAfter=flattenColors(after);
  assert.ok(colorsBefore.every((value,i)=>Math.abs(value-colorsAfter[i])<.01));
 }
});

test('Canvas pixels stay continuous at all borders and form a soft spatial sky transition',async()=>{
 const results=await page.evaluate(()=>{
  const results=[];
  for(const width of [480,900])for(const reducedMotion of [false,true]){
   const canvas=document.createElement('canvas');canvas.width=width;canvas.height=300;const c=canvas.getContext('2d');
   function render(routeDistance){c.clearRect(0,0,width,300);scenery.drawJourneyScenery(c,{routeDistance,distance:routeDistance,width,reducedMotion});return c.getImageData(0,0,width,300).data;}
   for(const boundary of [7000,14000,21000,28000,35000,42000,84000]){
    const a=render(boundary-.001),b=render(boundary+.001);let delta=0;
    for(let i=0;i<a.length;i++)delta+=Math.abs(a[i]-b[i]);
    render(boundary);const row=c.getImageData(0,8,width,1).data;let wall=0;
    for(let x=1;x<width;x++)for(let channel=0;channel<3;channel++)wall=Math.max(wall,Math.abs(row[x*4+channel]-row[(x-1)*4+channel]));
    results.push({width,reducedMotion,boundary,mean:delta/a.length,wall,spatial:Math.abs(row[0]-row[(width-1)*4])+Math.abs(row[1]-row[(width-1)*4+1])+Math.abs(row[2]-row[(width-1)*4+2])});
   }
  }
  return results;
 });
 for(const result of results){
  assert.ok(result.mean<.05,`border pixels change continuously: ${JSON.stringify(result)}`);
  // Two composited 8-bit gradients can dither adjacent channels by up to four levels.
  assert.ok(result.wall<=4,`no hard vertical sky wall: ${JSON.stringify(result)}`);
  if(!result.reducedMotion)assert.ok(result.spatial>=4,`destination colors arrive across the screen: ${JSON.stringify(result)}`);
 }
});

test('journey painting preserves caller alpha/style/transform and a flat shared road',async()=>{
 const results=await page.evaluate(()=>{
  const results=[];
  for(const width of [480,900])for(const routeDistance of [0,7000,14000,21000,28000,42000]){
   const canvas=document.createElement('canvas');canvas.width=width;canvas.height=300;const c=canvas.getContext('2d');
   c.globalAlpha=0;c.fillStyle='#123456';c.lineWidth=7;c.translate(2,3);
   scenery.drawJourneyScenery(c,{routeDistance,width});
   const invisible=!c.getImageData(0,0,width,300).data.some((v,i)=>i%4===3&&v!==0);
   const retained={alpha:c.globalAlpha,fill:c.fillStyle,lineWidth:c.lineWidth,x:c.getTransform().e,y:c.getTransform().f};
   c.resetTransform();c.globalAlpha=1;scenery.drawJourneyScenery(c,{routeDistance,width});
   const road=c.getImageData(0,252,width,1).data;let roadDelta=0;
   for(let x=1;x<width;x++)for(let channel=0;channel<4;channel++)roadDelta=Math.max(roadDelta,Math.abs(road[x*4+channel]-road[channel]));
   results.push({invisible,retained,roadDelta});
  }
  return results;
 });
 for(const result of results){
  assert.equal(result.invisible,true,'no layer overwrites caller alpha');
  assert.deepEqual(result.retained,{alpha:0,fill:'#123456',lineWidth:7,x:2,y:3});
  assert.ok(result.roadDelta<=2,'shared road stays uninterrupted; vertical gradient dithering is at most2/255');
 }
});


test('a longa corrida progride de manhã para tarde e noite sem depender do relógio real',()=>{
 const at=metres=>scenery.timeOfDayFor(metres);
 assert.equal(scenery.DAY_PHASE_METRES,6000);
 for(const [metres,expected] of [[0,'manhã'],[3000,'manhã'],[6000,'tarde'],[9000,'tarde'],[12000,'noite'],[14000,'noite'],[18000,'manhã'],[24000,'tarde'],[30000,'noite'],[36000,'manhã']]){
  assert.equal(at(metres).phase,expected,'período em '+metres+' metros');
 }
 assert.equal(at(-50).phase,'manhã');
 assert.equal(at(Number.NaN).phase,'manhã');
 assert.ok(at(5200).blend>.49&&at(5200).blend<.51,'a transição do período é suave');
 assert.equal(at(4400).blend,0);
 assert.equal(at(6000).blend,0);
 assert.equal(at(12000).night,1);
 assert.equal(at(13800).night,1);
 assert.equal(at(18000).night,0);
});

test('as transições de luz não exibem saltos nem no retorno da madrugada',()=>{
 for(const boundary of [6000,12000,18000,24000,30000,36000,54000,72000,90000]){
  const before=scenery.timeOfDayFor(boundary-.001),after=scenery.timeOfDayFor(boundary+.001);
  assert.ok(Math.abs(before.night-after.night)<.000001,'a escuridão é contínua em '+boundary);
  assert.ok(Math.abs(before.morning-after.morning)<.000001,'a luz da manhã é contínua em '+boundary);
 }
});

test('céu noturno escurece sem escurecer o piso ou alterar a física da pista',async()=>{
 const samples=await page.evaluate(()=>{
  const width=480,canvas=document.createElement('canvas');canvas.width=width;canvas.height=300;
  const c=canvas.getContext('2d');
  function sample(distance,reducedMotion=false){
   c.clearRect(0,0,width,300);
   scenery.drawJourneyScenery(c,{routeDistance:distance,distance,width,reducedMotion});
   const top=c.getImageData(9,7,1,1).data;
   const road=c.getImageData(9,252,1,1).data;
   return {sky:[...top],road:[...road]};
  }
  return {morning:sample(1500),afternoon:sample(7500),night:sample(13500),morningAgain:sample(19500),nightReduced:sample(13500,true)};
 });
 const brightness=rgba=>rgba[0]+rgba[1]+rgba[2];
 assert.ok(brightness(samples.night.sky)+55<brightness(samples.afternoon.sky),
  'night should be visibly darker than afternoon: '+JSON.stringify(samples));
 assert.ok(brightness(samples.nightReduced.sky)+55<brightness(samples.afternoon.sky),
  'reduced-motion still gets daytime progression');
 assert.ok(brightness(samples.morningAgain.sky)>brightness(samples.night.sky)+55,'morning returns after a night');
 const ground=samples.morning.road;
 for(const [key,scene] of Object.entries(samples))
  assert.ok(scene.road.every((value,i)=>Math.abs(value-ground[i])<=2),
   'visual day/night effects never darken the playfield floor: '+key);
});

test('cores do céu e estrelas atravessam divisas e períodos sem cortes em pixels',async()=>{
 const results=await page.evaluate(()=>{
  const results=[];
  const width=480,c=document.createElement('canvas');c.width=width;c.height=300;
  const ctx=c.getContext('2d');
  function render(metres){
   ctx.clearRect(0,0,width,300);
   scenery.drawJourneyScenery(ctx,{routeDistance:metres,distance:metres,width});
   return ctx.getImageData(0,0,width,300).data;
  }
  for(const boundary of [6000,12000,18000,24000,30000,36000]){
   const a=render(boundary-.001),b=render(boundary+.001);let sum=0;
   for(let i=0;i<a.length;i++)sum+=Math.abs(a[i]-b[i]);
   results.push({boundary,mean:sum/a.length});
  }
  return results;
 });
 for(const result of results)assert.ok(result.mean<.06,'no visible discontinuity: '+JSON.stringify(result));
});
