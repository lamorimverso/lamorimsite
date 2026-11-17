// Optional visual review using the actual game renderer and physical surfaces.
import {chromium} from 'playwright';
import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const server=http.createServer(async(req,res)=>{try{
 let file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!file.startsWith(root+path.sep))throw Error('outside');
 if((await stat(file)).isDirectory())file=path.join(file,'index.html');
 res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png'})[path.extname(file)]||'application/octet-stream');res.end(await readFile(file));
}catch{res.writeHead(404);res.end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
try{
 for(const viewport of [{width:390,height:844},{width:1365,height:650}]){
  const page=await browser.newPage({viewport});
  await page.route(/^https:\/\//,route=>route.abort());
  const source=await readFile(path.join(root,'tanahoraflavio/runner-core.mjs'),'utf8');
  await page.route('**/runner-core.mjs*',route=>route.fulfill({contentType:'text/javascript',body:source+'\nconst originalCreateRun=createRun;createRun=(...args)=>{const r=originalCreateRun(...args);globalThis.__previewRun=r;return r;};'}));
  const runner=await readFile(path.join(root,'tanahoraflavio/runner.mjs'),'utf8');
  await page.route('**/runner.mjs*',route=>route.fulfill({contentType:'text/javascript',body:runner.replace('  updateUI();resize();draw();prepareSprites();','  globalThis.__previewFrame=()=>{cancelAnimationFrame(frameId);frameId=0;updateUI();draw();};updateUI();resize();draw();prepareSprites();')}));
  await page.goto(`http://127.0.0.1:${server.address().port}/tanahoraflavio/`);
  await page.getByRole('button',{name:'Começar corrida',exact:true}).click();
  for(const kind of ['deslize','apoio','salto','escudo']){
   await page.evaluate(kind=>{
    const r=__previewRun;for(const key of ['nextObstacle','nextRaid','nextBossAt','nextAllyAt','nextSupportAt','nextPassport','nextPower'])r[key]=Infinity;
    r.obstacles=[];r.pickups=[];r.terrain.nextAt=Infinity;r.allyShieldFor=kind==='escudo'?3:0;r.shieldFor=r.allyShieldFor;
    r.terrain.active={kind:'gap-platform',age:2,speed:270,warningFor:2.3,ceilings:[],gaps:[{x:145,width:125}],platforms:[{x:235,width:140,y:28}]};
    if(kind==='escudo'||kind==='deslize')r.terrain.active=null;
    Object.assign(r.player,{x:kind==='deslize'?215:kind==='apoio'?270:190,y:kind==='apoio'?28:kind==='salto'?75:0,velocity:kind==='salto'?20:0,grounded:kind!=='salto',supportY:kind==='apoio'?28:kind==='salto'?null:0,crouchHeld:kind==='deslize',crouching:kind==='deslize',sliding:kind==='deslize',slideRemaining:.7,slideLatched:true,moveHeld:kind==='deslize'?1:kind==='escudo'?-1:0});
    __previewFrame();
   },kind);
   await page.locator('#runner-canvas').screenshot({path:path.join(root,`tanahoraflavio/docs/travessia-${viewport.width}-${kind}-2026-11-16.png`)});
  }
  await page.close();
 }
 console.log('Saved actual game slide, elevated support and gap jump at mobile and desktop sizes.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
