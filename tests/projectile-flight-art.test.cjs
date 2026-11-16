const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const {readFile}=require('node:fs/promises');
const path=require('node:path');
const {chromium}=require('playwright');
let browser,page;
before(async()=>{
 browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 page=await browser.newPage();
 await page.route('http://flight-art.test/**',async route=>{
  const pathname=new URL(route.request().url()).pathname;
  if(pathname==='/')return route.fulfill({contentType:'text/html',body:'<!doctype html>'});
  if(!/^\/[a-z0-9-]+\.mjs$/.test(pathname))return route.abort();
  return route.fulfill({contentType:'text/javascript',body:await readFile(path.resolve(__dirname,'../tanahoraflavio',pathname.slice(1)),'utf8')});
 });
 await page.goto('http://flight-art.test/');
});
after(async()=>{await browser?.close();});

test('the small IVER bottle articulates its cap and contents during flight and respects reduced motion',async()=>{
 const result=await page.evaluate(async()=>{
  const {drawHeroProjectile}=await import('/runner-hero-shot.mjs');
  const canvas=document.createElement('canvas');canvas.width=120;canvas.height=100;const c=canvas.getContext('2d');
  const capture=(age,reducedMotion=false)=>{
   c.clearRect(0,0,120,100);drawHeroProjectile(c,{powerId:'ivermectina',x:60,y:50,vx:500,vy:0,age},100,{reducedMotion});
   // Crop to the body: the trail and physical translation cannot satisfy this.
   return c.getImageData(50,42,24,16).data;
  };
  const frames=[0,.08,.16,.24].map(age=>capture(age));let changed=0;
  for(let i=0;i<frames[0].length;i+=4)if(frames.some(f=>Math.abs(f[i]-frames[0][i])+Math.abs(f[i+1]-frames[0][i+1])+Math.abs(f[i+2]-frames[0][i+2])+Math.abs(f[i+3]-frames[0][i+3])>120))changed++;
  const a=capture(0,true),b=capture(.24,true);return {changed,stable:a.every((v,i)=>v===b[i])};
 });
 assert.ok(result.changed>15,'IVER bottle body is static, independently of its travel and trail');
 assert.ok(result.stable,'reduced motion keeps the bottle stable');
});

test('projectile bodies articulate within 240ms of flight with effects disabled',async t=>{
 const results=await page.evaluate(async()=>{
  const {drawThreat}=await import('/runner-art.mjs');
  const {COMPLETE_WEAPONS}=await import('/runner-weapon-art.mjs');
  const {CAMPAIGN_PROP_COLORS}=await import('/runner-campaign-art.mjs');
  const canvas=document.createElement('canvas');canvas.width=120;canvas.height=100;const c=canvas.getContext('2d');
  return [...COMPLETE_WEAPONS,...Object.keys(CAMPAIGN_PROP_COLORS)].map(type=>{
   const capture=(age,reducedMotion=false)=>{
    c.clearRect(0,0,120,100);
    // The live cast renderer supplies flightAge * 24; hold physical position
    // fixed and disable effects so only the object's construction can move.
    drawThreat(c,{type,x:37,width:46,height:44},80,age*24,{weaponEffects:false,reducedMotion});
    return c.getImageData(0,0,120,100).data;
   };
   const frames=[0,.08,.16,.24].map(age=>capture(age));
   let filled=0,changed=0;
   for(let i=0;i<frames[0].length;i+=4){
    if(frames[0][i+3]>100)filled++;
    if(frames.some(f=>Math.abs(f[i]-frames[0][i])+Math.abs(f[i+1]-frames[0][i+1])+Math.abs(f[i+2]-frames[0][i+2])+Math.abs(f[i+3]-frames[0][i+3])>120))changed++;
   }
   const a=capture(0,true),b=capture(.24,true);
   return {type,filled,changed,ratio:changed/filled,reducedStable:a.every((v,i)=>v===b[i])};
  });
 });
 await t.test('microphone head and cable move against their fixed handle',()=>{
  const row=results.find(row=>row.type==='microphone');
  assert.ok(row.ratio>.2,`microphone: only ${(row.ratio*100).toFixed(1)}% of pixels move during a short flight`);
 });
 await t.test('bottle caps, liquid and labels move against the glass body',()=>{
  for(const type of ['cloroquina-prop','ivermectina-prop']){
   const row=results.find(row=>row.type===type);
   assert.ok(row.ratio>.15,`${type}: cap and contents look static during a short flight`);
  }
 });
 await t.test('fingers, chain and paper edges change their construction during the short flight',()=>{
  for(const type of ['lhand','handcuffs','mandado','receipts','budget-sheets','parachute-cross']){
   const row=results.find(row=>row.type===type);
   assert.ok(row.ratio>.2,`${type}: articulated material is barely visible`);
  }
 });
 await t.test('every campaign prop and solid weapon has visible movement and a stable reduced-motion pose',()=>{
  for(const row of results){
   assert.ok(row.filled>250,`${row.type}: recognizable filled body`);
   // A solid cup moves its straw; a paper sheet deforms most of its area.
   // Both must animate, without forcing the same area to move in each.
   assert.ok(row.changed>20,`${row.type}: body is static during the actual short flight`);
   assert.ok(row.reducedStable,`${row.type}: reduced motion remains still`);
  }
 });
});
