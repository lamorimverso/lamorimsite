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
  await page.locator('#game-mode-chooser').getByRole('link',{name:'Modo Batalha',exact:true}).click();
  await page.waitForURL('**/battle/');
  await page.waitForFunction(()=>!document.getElementById('start').disabled,null,{timeout:20000});
  assert.equal(await page.locator('#players button').count(),23);
  assert.equal(await page.locator('#bosses button').count(),22);
  await page.getByRole('button',{name:'Sortear duelo',exact:true}).click();
  const selected=await page.locator('.fighter[aria-pressed="true"]').evaluateAll(nodes=>nodes.map(n=>n.dataset.id));
  assert.equal(selected.length,2);assert.notEqual(selected[0],selected[1]);
  assert.notEqual(selected[1],'flavio');
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

test('Battle keeps aerial movement and reuses its static scenery across frames',async()=>{
 const context=await browser.newContext({viewport:{width:1280,height:900}});
 try{
  const source=await fs.readFile(path.resolve(__dirname,'../tanahoraflavio/battle/battle-core.mjs'),'utf8');
  await context.route('**/battle-core.mjs*',r=>r.fulfill({contentType:'text/javascript',body:source+'\nconst originalCreate=createBattle,originalStep=stepBattle;createBattle=(...args)=>{globalThis.__battle=originalCreate(...args);return globalThis.__battle;};stepBattle=(g,input,dt)=>originalStep(g,input,dt,{cpuInput:{}});'}));
  await context.addInitScript(()=>{
   const prototype=CanvasRenderingContext2D.prototype,draw=prototype.drawImage,gradient=prototype.createLinearGradient,counts=new WeakMap();
   window.__stageFrames=0;window.__stagePaints=()=>counts.get(window.__stageSource)||0;
   prototype.createLinearGradient=function(...args){counts.set(this.canvas,(counts.get(this.canvas)||0)+1);return gradient.apply(this,args);};
   prototype.drawImage=function(image,...args){if(this.canvas.id==='canvas'&&image instanceof HTMLCanvasElement&&image.width===900&&image.height===420){window.__stageSource=image;window.__stageFrames++;}return draw.call(this,image,...args);};
  });
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'battle/');await page.waitForFunction(()=>!document.getElementById('start').disabled,null,{timeout:20000});
  await page.locator('#start').click();await page.waitForFunction(()=>globalThis.__battle?.status==='fight'&&__stageFrames>5);
  const before=await page.evaluate(()=>({frames:__stageFrames,paints:__stagePaints()}));assert.ok(before.paints>0);
  await page.keyboard.down('ArrowRight');await page.keyboard.press('ArrowUp');
  await page.waitForFunction(()=>__battle.fighters[0].y>25);
  const x=await page.evaluate(()=>__battle.fighters[0].x);
  await page.keyboard.press('a');
  await page.waitForFunction(x=>__battle.fighters[0].move?.key==='air'&&__battle.fighters[0].x>x+12,x);
  await page.keyboard.up('ArrowRight');
  await page.waitForFunction(n=>__stageFrames>n+15,before.frames);
  assert.equal(await page.evaluate(()=>__stagePaints()),before.paints);
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});
