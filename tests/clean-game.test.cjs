const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs/promises');
const path=require('node:path');
const {chromium}=require('playwright');
let browser,server,base;
before(async()=>{
 const root=path.resolve(__dirname,'..');
 server=http.createServer(async(req,res)=>{try{
  let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!file.startsWith(root+path.sep))throw Error('outside');
  if((await fs.stat(file)).isDirectory())file=path.join(file,'index.html');
  res.setHeader('Content-Type',({'.html':'text/html','.css':'text/css','.mjs':'text/javascript','.js':'text/javascript','.webp':'image/webp','.png':'image/png'})[path.extname(file)]||'application/octet-stream');
  res.end(await fs.readFile(file));
 }catch{res.writeHead(404);res.end();}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 base=`http://127.0.0.1:${server.address().port}/tanahoraflavio/`;
 browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
});
after(async()=>{await browser?.close();await new Promise(resolve=>server?.close(resolve));});
async function open(viewport){
 const context=await browser.newContext({viewport});
 const page=await context.newPage();page.setDefaultTimeout(5000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);await page.getByRole('button',{name:'Começar corrida',exact:true}).waitFor();
 return {context,page,errors};
}

// Depois da contagem central, o mesmo cabeçalho encolhe para abrir espaço à partida.
for(const width of [320,390])test(`ao descer, pista e início cabem em ${width}px sem informações repetidas`,async()=>{
 const {context,page,errors}=await open({width,height:844});
 try{
  await page.evaluate(()=>scrollTo(0,334));
  await page.waitForFunction(()=>document.querySelector('.progress-ring').getBoundingClientRect().width<=110);
  for(const id of ['runner-canvas','game-start']){
   const r=await page.locator('#'+id).boundingBox();
   assert.ok(r.y>=0&&r.y+r.height<=844,`${id} aparece sem rolar: ${JSON.stringify(r)}`);
  }
  assert.equal(await page.locator('#game-objective').isVisible(),false);
  assert.equal(await page.locator('.game-record').isVisible(),false);
  assert.equal(await page.locator('#game-instructions').isVisible(),false);
  assert.equal(await page.locator('#game-start-hint').isVisible(),true);
  assert.equal(await page.locator('#game-settings').evaluate(e=>e.open),false);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});

test('ajuda compacta abre por teclado e não bloqueia começar a corrida',async()=>{
 const {context,page,errors}=await open({width:390,height:844});
 try{
  const summary=page.locator('#game-settings summary');
  const r=await summary.boundingBox();assert.ok(r.width>=40&&r.width<=48&&r.height>=40,'ajuda é um controle compacto e tocável');
  await summary.focus();await summary.press('Enter');
  assert.equal(await page.locator('#game-instructions').isVisible(),true);
  await page.locator('#game-effects').selectOption('reduce');
  await page.getByRole('button',{name:'Começar corrida',exact:true}).click();
  assert.equal(await page.locator('#game-settings').evaluate(e=>e.open),false);
  assert.equal(await page.locator('#game-jump').count(),0);
  assert.equal(await page.locator('#game-crouch').count(),0);
  assert.equal(await page.locator('#game').getAttribute('data-reduced-motion'),'true');
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});
