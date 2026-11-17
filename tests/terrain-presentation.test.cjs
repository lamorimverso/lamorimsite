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

test('terrain shows a physical low opening, raised landing surface and visible gap at their shared coordinates',async()=>{
 const result=await page.evaluate(async()=>{
  const {drawTerrain}=await import('/runner-terrain-art.mjs');
  const canvas=document.createElement('canvas');canvas.width=900;canvas.height=300;const c=canvas.getContext('2d');
  const active={kind:'passage',age:2,warningFor:1.1,ceilings:[{x:300,width:110,bottom:46,top:122}],gaps:[],platforms:[]};
  const terrain={active},before=JSON.stringify(terrain);
  drawTerrain(c,{terrain,ground:246,width:900});
  const firstUnmutated=before===JSON.stringify(terrain);
  const pixel=(x,y)=>[...c.getImageData(x,y,1,1).data];
  const passage={roof:pixel(350,180),opening:pixel(350,220)};
  c.clearRect(0,0,900,300);
  active.kind='gap-platform';active.ceilings=[];active.gaps=[{x:300,width:125}];active.platforms=[{x:390,width:140,y:28}];
  const beforeLanding=JSON.stringify(terrain);drawTerrain(c,{terrain,ground:246,width:900});
  const landing={gap:pixel(350,260),top:pixel(450,220),unblocked:pixel(450,205)};
  return {passage,landing,unmutated:firstUnmutated&&beforeLanding===JSON.stringify(terrain)};
 });
 assert.ok(result.passage.roof[3]>220,'solid low ceiling is visible');
 assert.equal(result.passage.opening[3],0,'opening has enough empty room for the 42px crouch');
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
  drawTerrain(c,{width:480,terrain:{active:{kind:'passage',age:0,warningFor:2.3,gaps:[],platforms:[],ceilings:[{x:700,width:110,bottom:46,top:122}]}}});
  const data=c.getImageData(438,150,42,55).data;let filled=0;for(let i=3;i<data.length;i+=4)if(data[i]>100)filled++;return filled;
 });
 assert.ok(count>120,'upcoming low passage has a visible edge cue before its body enters');
});
