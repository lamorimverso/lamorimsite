const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const http=require('node:http');
const path=require('node:path');
const {chromium}=require('playwright');
let server,browser,base;
before(async()=>{
 const root=path.resolve(__dirname,'..');
 server=http.createServer(async(req,res)=>{try{
  let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!file.startsWith(root+path.sep))throw Error('outside root');
  if((await fs.stat(file)).isDirectory())file=path.join(file,'index.html');
  res.setHeader('Content-Type',({'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png'})[path.extname(file)]||'application/octet-stream');
  res.end(await fs.readFile(file));
 }catch{res.writeHead(404);res.end();}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 base='http://127.0.0.1:'+server.address().port+'/tanahoraflavio/';
 browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
});
after(async()=>{await browser?.close();await new Promise(resolve=>server?.close(resolve));});
async function beginMobile(viewport){
 const context=await browser.newContext({viewport,hasTouch:true,isMobile:true});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await context.route(/^https:\/\//,route=>route.abort());
 const source=await fs.readFile(path.resolve(__dirname,'../tanahoraflavio/runner-core.mjs'),'utf8');
 await context.route('**/runner-core.mjs*',route=>route.fulfill({contentType:'text/javascript',body:source+'\nconst oldCreateRun=createRun;createRun=(...args)=>{const r=oldCreateRun(...args);globalThis.__touchRun=r;return r;};'}));
 await page.goto(base);
 await page.waitForFunction(()=>document.getElementById('game-start')?.disabled===false,null,{timeout:12000});
 await page.locator('#game-start').tap();
 await page.waitForFunction(()=>globalThis.__touchRun?.status==='running');
 await page.evaluate(()=>{
  const r=__touchRun;
  for(const k of ['nextBossAt','nextRaid','nextObstacle','nextPickup','nextPower','nextSupportAt','nextAllyAt','nextPassport'])r[k]=Infinity;
  r.terrain.nextAt=Infinity;r.obstacles=[];r.shieldFor=Infinity;r.graceFor=Infinity;
 });
 return {context,page,errors};
}
async function send(page,action,type,pointerId){
 await page.locator('[data-mobile-action="'+action+'"]').dispatchEvent(type,{button:0,pointerType:'touch',pointerId,isPrimary:true});
}
for(const viewport of [{width:320,height:568},{width:390,height:844},{width:844,height:390}])
 test('controles de celular cabem na tela e respondem a dois dedos: '+viewport.width+'x'+viewport.height,async()=>{
  const {context,page,errors}=await beginMobile(viewport);
  try{
   const dock=page.locator('#game-mobile-controls'),canvas=page.locator('#runner-canvas');
   assert.equal(await dock.isVisible(),true,'touch dock visible while running');
   const metrics=await page.evaluate(()=>{
    const dock=document.getElementById('game-mobile-controls'),canvas=document.getElementById('runner-canvas');
    return {overflow:document.documentElement.scrollWidth>innerWidth,
     buttons:[...dock.querySelectorAll('button')].map(x=>({height:x.getBoundingClientRect().height,width:x.getBoundingClientRect().width})),
     touchAction:getComputedStyle(dock.querySelector('button')).touchAction,
     canvasHeight:canvas.getBoundingClientRect().height};
   });
   assert.equal(metrics.overflow,false,'no horizontal overflow');
   assert.equal(metrics.buttons.length,4);
   for(const b of metrics.buttons)assert.ok(b.height>=44&&b.width>=44,'buttons require a touch-size hit area');
   assert.equal(metrics.touchAction,'none');
   assert.ok(metrics.canvasHeight>=170,'track should remain legible');
   await send(page,'right','pointerdown',101);
   await page.waitForFunction(()=>__touchRun.player.moveHeld===1);
   await send(page,'jump','pointerdown',102);
   await page.waitForFunction(()=>__touchRun.player.y>0);
   assert.equal(await page.locator('[data-mobile-action="right"]').getAttribute('aria-pressed'),'true');
   assert.equal(await page.evaluate(()=>__touchRun.player.moveHeld),1,'movement and jump do not cancel each other');
   await send(page,'jump','pointerup',102);
   await send(page,'right','pointercancel',101);
   assert.equal(await page.evaluate(()=>__touchRun.player.moveHeld),0);
   assert.equal(await page.locator('[data-mobile-action="right"]').getAttribute('aria-pressed'),'false');
   await page.waitForFunction(()=>__touchRun.player.grounded);
   await send(page,'crouch','pointerdown',103);
   await page.waitForFunction(()=>__touchRun.player.crouchHeld);
   await send(page,'crouch','pointerup',103);
   await page.waitForFunction(()=>!__touchRun.player.crouchHeld);
   const distance=await page.evaluate(()=>__touchRun.distance);
   await page.waitForFunction(before=>__touchRun.distance>before,distance);
   assert.equal(await page.evaluate(()=>__touchRun.manualStory),false,'runner still advances automatically');
   assert.deepEqual(errors,[]);
  }finally{await context.close();}
 });
test('touch crouch button respects toggle mode and remains held after lifting a finger',async()=>{
 const {context,page,errors}=await beginMobile({width:390,height:844});
 try{
  await page.evaluate(()=>{
   const select=document.getElementById('game-crouch-mode');
   select.value='toggle';select.dispatchEvent(new Event('change',{bubbles:true}));
  });
  const crouchButton=page.locator('[data-mobile-action="crouch"]');
  await send(page,'crouch','pointerdown',301);
  await send(page,'crouch','pointerup',301);
  assert.equal(await page.evaluate(()=>__touchRun.player.crouchHeld),true,'toggle mode must remain active after lifting the finger');
  assert.equal(await crouchButton.getAttribute('aria-pressed'),'true','on-screen state reflects latched crouch');
  await crouchButton.tap();
  assert.equal(await page.evaluate(()=>__touchRun.player.crouchHeld),false,'a real touchscreen tap should deactivate the latched state exactly once');
  assert.equal(await crouchButton.getAttribute('aria-pressed'),'false');
  await crouchButton.tap();
  assert.equal(await page.evaluate(()=>__touchRun.player.crouchHeld),true,'a second real touchscreen tap activates crouch again');
  await send(page,'crouch','pointerdown',302);
  await send(page,'crouch','pointerup',302);
  assert.equal(await page.evaluate(()=>__touchRun.player.crouchHeld),false,'another input method can release a latched crouch');
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});
test('landscape keeps both the track and entire touch dock in the available viewport',async()=>{
 const {context,page,errors}=await beginMobile({width:844,height:390});
 try{
  const rects=await page.evaluate(()=>{
   const canvas=document.getElementById('runner-canvas').getBoundingClientRect();
   const dock=document.getElementById('game-mobile-controls').getBoundingClientRect();
   return {canvas:{top:canvas.top,bottom:canvas.bottom,height:canvas.height},
     dock:{top:dock.top,bottom:dock.bottom,height:dock.height},height:innerHeight};
  });
  assert.ok(rects.canvas.top>=0,'canvas cannot start above the visible screen: '+JSON.stringify(rects));
  assert.ok(rects.canvas.bottom<=rects.height,'canvas cannot end below screen: '+JSON.stringify(rects));
  assert.ok(rects.dock.bottom<=rects.height,'touch dock cannot fall below screen: '+JSON.stringify(rects));
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});
test('blur frees touch movement, keyboard accessibility click works, desktop dock stays hidden',async()=>{
 const {context,page,errors}=await beginMobile({width:390,height:844});
 try{
  await send(page,'left','pointerdown',201);
  assert.equal(await page.evaluate(()=>__touchRun.player.moveHeld),-1);
  await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
  assert.equal(await page.evaluate(()=>__touchRun.player.moveHeld),0);
  assert.equal(await page.locator('[data-mobile-action="left"]').getAttribute('aria-pressed'),'false');
  await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  await page.locator('[data-mobile-action="jump"]').evaluate(el=>el.click());
  assert.equal(await page.evaluate(()=>__touchRun.player.velocity>0),true,'keyboard accessible activation fires jump');
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
 const desktop=await browser.newContext({viewport:{width:900,height:720}});
 try{
  const page=await desktop.newPage();await page.goto(base);
  assert.equal(await page.locator('#game-mobile-controls').isVisible(),false);
 }finally{await desktop.close();}
});
