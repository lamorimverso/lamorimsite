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
  let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname));
  if(!file.startsWith(root+path.sep))throw Error('bad path');
  if((await fs.stat(file)).isDirectory())file=path.join(file,'index.html');
  res.setHeader('Content-Type',({'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png'})[path.extname(file)]||'application/octet-stream');
  res.end(await fs.readFile(file));
 }catch{res.writeHead(404);res.end();}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 base='http://127.0.0.1:'+server.address().port+'/tanahoraflavio/';
 browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
});
after(async()=>{await browser?.close();await new Promise(resolve=>server?.close(resolve));});
for(const width of [390,900])test('Story rooms render and manual play responds in browser '+width,async()=>{
 const context=await browser.newContext({viewport:{width,height:760},reducedMotion:'reduce'});
 const errors=[];const page=await context.newPage();page.on('pageerror',err=>errors.push(err.message));
 try{
  await context.route(/^https:\/\//,r=>r.abort());
  const core=await fs.readFile(path.resolve(__dirname,'../tanahoraflavio/runner-core.mjs'),'utf8');
  await context.route('**/runner-core.mjs*',route=>route.fulfill({contentType:'text/javascript',
   body:core+'\nconst previousMakerRun=createRun;createRun=(...args)=>{const run=previousMakerRun(...args);globalThis.__makerRun=run;return run;};'}));
  await page.goto(base);
  await page.waitForFunction(()=>document.querySelector('#game-start')?.disabled===false,null,{timeout:15000});
  await page.locator('#game-mode-story').check();
  await page.locator('#game').scrollIntoViewIfNeeded();
  await page.locator('#game-start').click();
  await page.waitForFunction(()=>globalThis.__makerRun?.status==='running');
  await page.waitForTimeout(280);
  const initial=await page.evaluate(()=>({d:__makerRun.distance,rooms:__makerRun.storyRooms,actors:__makerRun.obstacles.filter(o=>o.storyEnemyId).length}));
  assert.equal(initial.d,0,'Story must not advance by itself');
  assert.ok(initial.actors>0,'room enemies must be placed on the map');
  assert.ok(initial.rooms&&initial.rooms.retries===3);
  await page.keyboard.down('ArrowRight');
  await page.waitForFunction(()=>__makerRun.distance>0,null,{timeout:6000});
  await page.keyboard.up('ArrowRight');
  const moved=await page.evaluate(()=>__makerRun.distance);assert.ok(moved>0);
  await page.keyboard.down('KeyJ');
  await page.waitForFunction(()=>__makerRun.shotsFired>0,null,{timeout:2500});
  await page.keyboard.up('KeyJ');
  assert.equal(await page.locator('#game').getAttribute('data-run-state'),'running');
  assert.deepEqual(errors,[],'no unhandled browser error during gameplay');
 }finally{await context.close();}
});
