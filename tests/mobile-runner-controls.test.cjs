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
async function beginMobile(viewport,{mode='story'}={}){
 const context=await browser.newContext({viewport,hasTouch:true,isMobile:true});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await context.route(/^https:\/\//,route=>route.abort());
 const source=await fs.readFile(path.resolve(__dirname,'../tanahoraflavio/runner-core.mjs'),'utf8');
 await context.route('**/runner-core.mjs*',route=>route.fulfill({contentType:'text/javascript',body:source+'\nconst oldCreateRun=createRun;createRun=(...args)=>{const r=oldCreateRun(...args);globalThis.__touchRun=r;return r;};'}));
 await page.goto(base);
 await page.waitForFunction(()=>document.getElementById('game-start')?.disabled===false,null,{timeout:12000});
 if(mode==='endless')await page.locator('#game-mode-infinite').check();
 await page.locator('#game-start').tap();
 await page.waitForFunction(()=>globalThis.__touchRun?.status==='running');
 await page.evaluate(()=>{
  const r=__touchRun;
  for(const k of ['nextBossAt','nextRaid','nextObstacle','nextPickup','nextPower','nextSupportAt','nextAllyAt','nextPassport'])r[k]=Infinity;
  r.terrain.nextAt=Infinity;r.obstacles=[];r.shieldFor=Infinity;r.graceFor=Infinity;
 });
 return {context,page,errors};
}
async function touch(page,type,pointerId,{primary=true,x=110,y=120}={}){
 await page.locator('#runner-canvas').dispatchEvent(type,{button:0,pointerType:'touch',pointerId,isPrimary:primary,clientX:x,clientY:y});
}
function verifyErrors(errors){assert.deepEqual(errors,[]);}
for(const viewport of [{width:320,height:568},{width:390,height:844},{width:844,height:390}])
test('celular usa gestos sem controles sobrepostos: '+viewport.width+'x'+viewport.height,async()=>{
 const {context,page,errors}=await beginMobile(viewport);
 try{
  assert.equal(await page.locator('#game-mobile-controls').count(),0,'four old buttons must not exist');
  assert.equal(await page.locator('#game-mode-label').count(),0,'decorative story/automatic-run badge is removed');
  assert.equal(await page.locator('#game-attack').isVisible(),false,'shooting uses second finger on mobile');
  assert.equal(await page.locator('#game-fullscreen').count(),1,'fullscreen is available in settings');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'no horizontal overflow');
  await touch(page,'pointerdown',101);
  await touch(page,'pointerup',101);
  await page.waitForFunction(()=>__touchRun.player.y>0);
  await page.waitForFunction(()=>__touchRun.player.grounded);
  await touch(page,'pointerdown',102,{x:100,y:100});
  await touch(page,'pointermove',102,{x:160,y:100});
  await page.waitForFunction(()=>__touchRun.player.moveHeld===1);
  await touch(page,'pointerup',102);
  assert.equal(await page.evaluate(()=>__touchRun.player.moveHeld),0);
  await touch(page,'pointerdown',103,{x:120,y:100});
  await touch(page,'pointermove',103,{x:120,y:140});
  await page.waitForFunction(()=>__touchRun.player.crouchHeld);
  await touch(page,'pointercancel',103);
  assert.equal(await page.evaluate(()=>__touchRun.player.crouchHeld),false);
  const d=await page.evaluate(()=>__touchRun.distance);
  await page.waitForFunction(before=>__touchRun.distance>before,d);
  assert.equal(await page.evaluate(()=>__touchRun.manualStory),false);
  verifyErrors(errors);
 }finally{await context.close();}
});
for(const viewport of [{width:320,height:568},{width:390,height:844},{width:844,height:390}])
test('tela cheia funciona e pode ser fechada sem perder a partida: '+viewport.width+'x'+viewport.height,async()=>{
 const {context,page,errors}=await beginMobile(viewport);
 try{
  // Simulate iPhone Safari where element.requestFullscreen is unsupported.
  await page.evaluate(()=>{document.getElementById('game').requestFullscreen=undefined;});
  await page.locator('#game-settings summary').tap();
  const button=page.locator('#game-fullscreen');
  assert.equal(await button.isEnabled(),true);
  await button.tap();
  await page.waitForFunction(()=>document.getElementById('game').dataset.mobileFullscreen==='true');
  assert.equal(await page.locator('#game-settings').evaluate(x=>x.open),false,'settings close on entry');
  assert.equal(await button.getAttribute('aria-pressed'),'true');
  const layout=await page.evaluate(()=>{
   const game=document.getElementById('game').getBoundingClientRect();
   const canvas=document.getElementById('runner-canvas').getBoundingClientRect();
   const pane=document.querySelector('.game-viewport').getBoundingClientRect();
   return {viewport:{w:innerWidth,h:innerHeight},game:{x:game.x,y:game.y,w:game.width,h:game.height},
       canvas:{x:canvas.x,y:canvas.y,w:canvas.width,h:canvas.height},
       pane:{x:pane.x,y:pane.y,w:pane.width,h:pane.height},
       bodyLocked:document.body.classList.contains('runner-fullscreen-fallback')};
  });
  assert.ok(layout.bodyLocked,'fallback locks the background');
  assert.ok(Math.abs(layout.game.x)<2&&Math.abs(layout.game.y)<2);
  assert.ok(Math.abs(layout.game.w-layout.viewport.w)<2&&Math.abs(layout.game.h-layout.viewport.h)<2,'fullscreen uses all available view dimensions: '+JSON.stringify(layout));
  assert.ok(layout.canvas.w>=300&&layout.canvas.h>=170);
  assert.ok(layout.canvas.y>=0&&layout.canvas.y+layout.canvas.h<=layout.viewport.h+1,'canvas entirely visible: '+JSON.stringify(layout));
  assert.equal(await page.locator('#game-attack').isVisible(),false);
  await page.locator('#game-settings summary').tap();
  assert.equal(await button.getAttribute('aria-pressed'),'true');
  await button.tap();
  assert.equal(await page.locator('#game').getAttribute('data-mobile-fullscreen'),'false');
  assert.equal(await page.locator('#game-settings').evaluate(x=>x.open),false);
  assert.equal(await page.evaluate(()=>document.body.classList.contains('runner-fullscreen-fallback')),false);
  assert.equal(await page.locator('#game').getAttribute('data-run-state'),'running');
  verifyErrors(errors);
 }finally{await context.close();}
});
test('fullscreen request rejection safely falls back and settings retain gesture instructions',async()=>{
 const {context,page,errors}=await beginMobile({width:390,height:844});
 try{
  await page.evaluate(()=>{document.getElementById('game').requestFullscreen=()=>Promise.reject(new DOMException('Blocked','NotAllowedError'));});
  await page.locator('#game-settings summary').tap();
  const text=await page.locator('#game-instructions').textContent();
  assert.match(text,/deslize para os lados/i);
  assert.match(text,/segure um dedo na pista e toque com outro/i);
  await page.locator('#game-fullscreen').tap();
  assert.equal(await page.locator('#game').getAttribute('data-mobile-fullscreen'),'true');
  assert.match(await page.locator('#game-fullscreen-note').textContent(),/barras do navegador podem permanecer/i);
  verifyErrors(errors);
 }finally{await context.close();}
});
test('real fullscreen event synchronizes the setting when browser exits',async()=>{
 const {context,page,errors}=await beginMobile({width:390,height:844});
 try{
  await page.locator('#game-settings summary').tap();
  await page.locator('#game-fullscreen').tap();
  const mode=await page.evaluate(()=>({native:document.fullscreenElement===document.getElementById('game'),fallback:document.getElementById('game').dataset.mobileFullscreen==='true'}));
  assert.ok(mode.native||mode.fallback,'fullscreen activation must be observable');
  if(mode.native){
   await page.evaluate(()=>document.exitFullscreen());
   await page.waitForFunction(()=>document.getElementById('game-fullscreen').getAttribute('aria-pressed')==='false');
  }else{
   await page.locator('#game-settings summary').tap();
   await page.locator('#game-fullscreen').tap();
  }
  assert.equal(await page.locator('#game-fullscreen').getAttribute('aria-pressed'),'false');
  verifyErrors(errors);
 }finally{await context.close();}
});
test('second finger fires in boss encounter, releasing it does not interrupt first finger',async()=>{
 const {context,page,errors}=await beginMobile({width:390,height:844},{mode:'endless'});
 try{
  await page.evaluate(()=>{__touchRun.nextBossAt=0;__touchRun.bossBag=['lula'];});
  await page.waitForFunction(()=>__touchRun.boss?.type==='lula');
  await touch(page,'pointerdown',501);
  await touch(page,'pointerdown',502,{primary:false,x:160,y:125});
  assert.equal(await page.evaluate(()=>__touchRun.player.attackHeld),true,'second simultaneous touch fires');
  await touch(page,'pointerup',502,{primary:false,x:160,y:125});
  assert.equal(await page.evaluate(()=>__touchRun.player.attackHeld),false,'firing stops on release');
  await touch(page,'pointerup',501);
  verifyErrors(errors);
 }finally{await context.close();}
});
test('desktop preserves original keyboard controls and no mobile buttons appear',async()=>{
 const context=await browser.newContext({viewport:{width:900,height:720}});
 try{
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base);
  assert.equal(await page.locator('#game-mobile-controls').count(),0);
  await page.getByRole('button',{name:'Começar corrida',exact:true}).waitFor();
  assert.equal(await page.locator('#game-fullscreen').count(),1);
  verifyErrors(errors);
 }finally{await context.close();}
});

function overlap(a,b){
 return a.left<b.right-1&&b.left<a.right-1&&a.top<b.bottom-1&&b.top<a.bottom-1;
}
async function cleanDashboardMetrics(page){
 return page.evaluate(()=>{
  const box=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height};};
  return {
   title:box('.game-dashboard .game-heading'),
   board:box('.game-dashboard .game-scoreboard'),
   sound:box('.game-dashboard .game-actions'),
   settings:box('#game-settings summary'),
   stage:box('.game-dashboard .game-stage-header'),
   canvas:box('#runner-canvas'),
   game:box('#game'),
   viewportWidth:innerWidth,
   overflow:document.documentElement.scrollWidth>innerWidth,
   tinyLabels:[...document.querySelectorAll('.game-dashboard .game-scoreboard>div>span:not([hidden])')]
     .filter(el=>getComputedStyle(el).display!=='none')
     .map(el=>({label:el.textContent,tooWide:el.scrollWidth>el.clientWidth+2})),
   stageProgress:box('#game-stage-progress')
  };
 });
}
for(const viewport of [{width:320,height:568},{width:390,height:844},{width:844,height:390},{width:1162,height:720}])
test('clean dashboard avoids overlap and preserves readable stats: '+viewport.width+'x'+viewport.height,async()=>{
 const {context,page,errors}=await beginMobile(viewport);
 try{
  const r=await cleanDashboardMetrics(page);
  assert.equal(r.overflow,false,'no horizontal page overflow: '+JSON.stringify(r));
  for(const [a,b] of [['title','board'],['title','sound'],['board','sound'],['sound','settings'],['board','settings']]){
   assert.equal(overlap(r[a],r[b]),false,a+' and '+b+' must not overlap: '+JSON.stringify(r));
  }
  assert.ok(r.board.bottom<=r.stage.top+2,'stats remain above stage line: '+JSON.stringify(r));
  assert.ok(r.stage.bottom<=r.canvas.top+2,'stage and progress do not cover the track: '+JSON.stringify(r));
  assert.ok(r.settings.right<=r.game.right+2,'settings remains inside game card: '+JSON.stringify(r));
  assert.ok(r.stageProgress.left>=r.stage.left-1&&r.stageProgress.right<=r.stage.right+1,'progress stays within stage');
  assert.deepEqual(r.tinyLabels.filter(x=>x.tooWide),[],'all scoreboard labels remain readable');
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});
test('clean fullscreen header stays separate from canvas and keeps gear accessible',async()=>{
 const {context,page,errors}=await beginMobile({width:390,height:844});
 try{
  await page.evaluate(()=>{document.getElementById('game').requestFullscreen=undefined;});
  await page.locator('#game-settings summary').tap();
  await page.locator('#game-fullscreen').tap();
  const r=await cleanDashboardMetrics(page);
  assert.ok(r.title.bottom<=r.canvas.top+2,'brand does not cover fullscreen track: '+JSON.stringify(r));
  assert.equal(overlap(r.title,r.settings),false);
  assert.equal(overlap(r.sound,r.settings),false);
  assert.ok(r.settings.right<=r.viewportWidth+1);
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});
