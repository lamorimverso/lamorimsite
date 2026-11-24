const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path');
const {chromium}=require('playwright');
let server,browser,base;
before(async()=>{
 const root=path.resolve(__dirname,'..');
 server=http.createServer(async(req,res)=>{try{
  let file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(!file.startsWith(root+path.sep))throw Error('outside');
  if((await fs.stat(file)).isDirectory())file=path.join(file,'index.html');
  res.setHeader('Content-Type',({'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png'})[path.extname(file)]||'application/octet-stream');
  res.end(await fs.readFile(file));
 }catch{res.writeHead(404);res.end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));base='http://127.0.0.1:'+server.address().port+'/tanahoraflavio/';
 browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
});
after(async()=>{await browser?.close();server?.closeAllConnections?.();await new Promise(r=>server?.close(r));});
for(const mobile of [false,true])test('Battle mode selects fighters, renders and accepts '+(mobile?'touch':'keyboard'),async()=>{
 const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1280,height:900},hasTouch:mobile,isMobile:mobile});
 try{
  const source=await fs.readFile(path.resolve(__dirname,'../tanahoraflavio/battle/battle-core.mjs'),'utf8');
  await context.route('**/battle-core.mjs*',r=>r.fulfill({contentType:'text/javascript',body:source+'\nconst original=createBattle;createBattle=(...args)=>{globalThis.__battle=original(...args);return globalThis.__battle;};'}));
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base);
  await page.getByRole('link',{name:'Modo Batalha · 1 × 1',exact:true}).click();
  await page.waitForURL('**/battle/');
  await page.waitForFunction(()=>!document.getElementById('start').disabled,null,{timeout:20000});
  assert.equal(await page.locator('#players button').count(),23);
  assert.equal(await page.locator('#bosses button').count(),22);
  await page.locator('#players').getByRole('button',{name:'Dilma',exact:true}).click();
  await page.locator('#bosses').getByRole('button',{name:'Xandão',exact:true}).click();
  await page.locator('#stage').selectOption('rio');
  await page.locator('#start').click();
  await page.waitForFunction(()=>globalThis.__battle?.status==='fight');
  assert.equal(await page.locator('#pname').textContent(),'Dilma');
  assert.equal(await page.locator('#bname').textContent(),'Xandão');
  if(mobile)await page.getByRole('button',{name:'Especial',exact:true}).tap();else await page.keyboard.press('f');
  await page.waitForFunction(()=>__battle.fighters[0].meter<30);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.ok(await page.locator('#canvas').evaluate(c=>c.getContext('2d').getImageData(450,100,1,1).data[3]===255));
  await page.getByRole('button',{name:'Trocar lutadores',exact:true}).click();
  assert.equal(await page.locator('#select').isVisible(),true);
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});
