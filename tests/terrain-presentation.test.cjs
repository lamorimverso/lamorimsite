const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const {readFile}=require('node:fs/promises');
const path=require('node:path');
const {chromium}=require('playwright');
let browser,page;
before(async()=>{
 browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 page=await browser.newPage();
 await page.route('http://terrain-art.test/**',async route=>{
  const name=new URL(route.request().url()).pathname.slice(1);
  if(!name)return route.fulfill({contentType:'text/html',body:'<!doctype html>'});
  try{return route.fulfill({contentType:'text/javascript',body:await readFile(path.resolve(__dirname,'../tanahoraflavio',name),'utf8')});}catch{return route.fulfill({status:404,body:''});}
 });
 await page.goto('http://terrain-art.test/');
});
after(async()=>{await browser?.close();});

test('terrain never paints the old hanging panel, but still shows the raised landing and visible gap',async()=>{
 const result=await page.evaluate(async()=>{
  const {drawTerrain}=await import('/runner-terrain-art.mjs');
  const canvas=document.createElement('canvas');canvas.width=900;canvas.height=300;const c=canvas.getContext('2d');
  const active={kind:'passage',age:2,warningFor:1.1,ceilings:[{x:300,width:110,bottom:46,top:122}],gaps:[],platforms:[]};
  const terrain={active},before=JSON.stringify(terrain);
  drawTerrain(c,{terrain,ground:246,width:900});
  const firstUnmutated=before===JSON.stringify(terrain);
  const pixel=(x,y)=>[...c.getImageData(x,y,1,1).data];
  const passage={roof:pixel(350,180),arrow:pixel(272,192)};
  c.clearRect(0,0,900,300);
  active.kind='gap-platform';active.ceilings=[];active.gaps=[{x:300,width:125}];active.platforms=[{x:390,width:140,y:28}];
  const beforeLanding=JSON.stringify(terrain);drawTerrain(c,{terrain,ground:246,width:900});
  const landing={gap:pixel(350,260),top:pixel(450,220),unblocked:pixel(450,205)};
  return {passage,landing,unmutated:firstUnmutated&&beforeLanding===JSON.stringify(terrain)};
 });
 assert.equal(result.passage.roof[3],0,'the removed panel is not drawn');
 assert.equal(result.passage.arrow[3],0,'its down arrow is not drawn');
 assert.ok(result.landing.gap[3]>220,'missing road is visibly cut into the ground');
 assert.ok(result.landing.top[3]>220,'landing platform begins at its physical height');
 assert.equal(result.landing.unblocked[3],0,'space above the landing remains clear');
 assert.ok(result.unmutated);
});

test('a leftward solid projectile has its wake behind the body, without generic streaks in front',async()=>{
 const pixels=await page.evaluate(async()=>{
  const {drawProjectile}=await import('/runner-art.mjs');
  const canvas=document.createElement('canvas');canvas.width=260;canvas.height=160;const c=canvas.getContext('2d');
  drawProjectile(c,{type:'hammer',x:100,y:70,width:46,height:44,projectile:true,launched:true,speed:300,launchX:210,flightStyle:'metal'},160,0);
  const a=c.getImageData(88,63,10,53).data,b=c.getImageData(150,70,18,43).data;
  let front=0,back=0;for(let i=3;i<a.length;i+=4)if(a[i]>10)front++;for(let i=3;i<b.length;i+=4)if(b[i]>10)back++;
  return {front,back};
 });
 assert.equal(pixels.front,0,'no decorative marks ahead of the solid projectile');
 assert.ok(pixels.back>5,'travel direction still has a readable wake');
});

test('a terrain obstacle beyond a narrow screen still has an immediate action cue at the visible edge',async()=>{
 const count=await page.evaluate(async()=>{
  const {drawTerrain}=await import('/runner-terrain-art.mjs');const canvas=document.createElement('canvas');canvas.width=480;canvas.height=300;const c=canvas.getContext('2d');
  drawTerrain(c,{width:480,terrain:{active:{kind:'gap-platform',age:0,warningFor:2.3,gaps:[{x:700,width:145}],platforms:[{x:819,width:180,y:28}],ceilings:[]}}});
  const data=c.getImageData(438,150,42,55).data;let filled=0;for(let i=3;i<data.length;i+=4)if(data[i]>100)filled++;return filled;
 });
 assert.ok(count>120,'upcoming gap has a visible jump cue before it enters');
});


test('air transfer paints the true void, the marked support and the aircraft shot without changing simulation',async()=>{
 const out=await page.evaluate(async()=>{
  const {drawTerrain}=await import('/runner-terrain-art.mjs');
  const {aircraftPoseFor}=await import('/runner-terrain.mjs');
  const canvas=document.createElement('canvas');canvas.width=480;canvas.height=300;const c=canvas.getContext('2d');
  const craft={kind:'lane',barIndex:0,offset:100,launchAt:420,warnAt:100};
  const a={kind:'air-transfer',gaps:[{x:50,width:410}],platforms:[{x:90,width:260,y:42}],ceilings:[],
   flight:{phase:'crossing',traveled:300,nominalSpeed:400,aircraft:[craft]}};
  const render=()=>{const before=JSON.stringify(a);drawTerrain(c,{terrain:{active:a},width:480});return before===JSON.stringify(a);};
  const pixel=(x,y)=>[...c.getImageData(x,y,1,1).data];const okay=render();
  const warning=pixel(190,155),voidBelow=pixel(375,278),verge=pixel(375,239),barTop=pixel(285,205),clear=pixel(375,230);
  c.clearRect(0,0,480,300);a.flight.traveled=craft.launchAt+190;const {shot}=aircraftPoseFor(a,craft);
  const secondOkay=render();return {warning,voidBelow,verge,barTop,clear,shot:pixel(Math.round(shot.x),Math.round(246-shot.y)),okay:okay&&secondOkay};
 });
 assert.ok(out.warning[3]>100,'readable jump marker before the shot');
 assert.ok(out.voidBelow[3]>220&&out.barTop[3]>220,'void finish and platform are visible where physics tests them');
 assert.ok(out.verge[3]>220,'the former road verge cannot remain visible across the void');
 assert.equal(out.clear[3],0,'no false surface at empty air above the background road');
 assert.ok(out.shot[3]>200&&out.okay);
});
