const {test,before,after}=require('node:test');
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path');
const {chromium}=require('playwright');
let browser,server,base;
before(async()=>{
 const root=path.resolve(__dirname,'..');server=http.createServer(async(req,res)=>{try{
  let file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!file.startsWith(root+path.sep))throw Error('outside');if((await fs.stat(file)).isDirectory())file=path.join(file,'index.html');
  res.setHeader('Content-Type',({'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.mp3':'audio/mpeg'})[path.extname(file)]||'application/octet-stream');res.end(await fs.readFile(file));
 }catch{res.writeHead(404);res.end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));base=`http://127.0.0.1:${server.address().port}/tanahoraflavio/`;
 browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
});
after(async()=>{await browser?.close();await new Promise(r=>server?.close(r));});
async function open(){
 const context=await browser.newContext({viewport:{width:390,height:844}});
 await context.addInitScript(()=>{
  const Native=window.AudioContext;
  window.AudioContext=class extends Native{
   constructor(...args){super(...args);window.__musicContext=this;}
   createGain(){const gain=super.createGain();window.__musicBus??=gain;return gain;}
  };
  const NativeAudio=window.Audio;window.__tracks=[];window.Audio=function(...args){const player=new NativeAudio(...args);window.__tracks.push(player);return player;};
 });
 const source=await fs.readFile(path.resolve(__dirname,'../tanahoraflavio/runner-core.mjs'),'utf8');
 await context.route('**/runner-core.mjs*',route=>route.fulfill({contentType:'text/javascript',body:source+'\nconst original=createRun;createRun=(...a)=>{const r=original(...a);window.__audioRun=r;return r;};'}));
 const page=await context.newPage();page.setDefaultTimeout(5000);const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base);await page.locator('#game-start').getByText('Começar corrida',{exact:true}).waitFor();
 return {context,page,errors};
}
const rms=(page,{tail=false}={})=>page.evaluate(async tail=>{
 if(!window.__analyser){window.__analyser=__musicContext.createAnalyser();__analyser.fftSize=1024;__musicBus.connect(__analyser);}
 let max=0,last=0;for(let i=0;i<16;i++){await new Promise(requestAnimationFrame);const a=new Float32Array(__analyser.fftSize);__analyser.getFloatTimeDomainData(a);last=Math.sqrt(a.reduce((sum,v)=>sum+v*v,0)/a.length);max=Math.max(max,last);}return tail?last:max;
},tail);
test('navegador reproduz voz real e música sem coletas; mute e perda de foco silenciam',async()=>{
 const {context,page,errors}=await open();try{
  assert.equal(await page.evaluate(()=>!!window.__musicContext),false,'não liga áudio antes de jogar');
  await page.locator('#game-start').click();await page.evaluate(()=>{__audioRun.nextObstacle=__audioRun.nextRaid=__audioRun.nextBossAt=Infinity;});
  await page.waitForFunction(()=>window.__tracks.some(p=>!p.paused&&p.currentTime>0));assert.equal(await page.locator('#game-voice-note').isVisible(),true);
  await page.waitForTimeout(700);assert.ok(await rms(page)>.0005,'trilha tem sinal sonoro real fora das coletas');
  await page.locator('#game-sound').click();assert.equal(await page.locator('#game-voice-note').isVisible(),false);assert.equal(await page.evaluate(()=>__tracks.every(p=>p.paused)),true);assert.ok(await rms(page,{tail:true})<.00001);
  await page.locator('#game-sound').click();await page.waitForTimeout(400);assert.ok(await rms(page)>.0005,'religar retoma música sem reiniciar a partida');
  await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await page.waitForFunction(()=>__musicBus.gain.value===0);assert.ok(await rms(page,{tail:true})<.00001,'após a janela de 1024 amostras, não deixa sinal fora do jogo');assert.deepEqual(errors,[]);
 }finally{await context.close();}
});
test('todos os nove memes publicados decodificam no navegador com os arquivos locais',async()=>{
 const {context,page}=await open();try{
  await page.locator('#game-start').click();await page.evaluate(()=>{__audioRun.nextObstacle=__audioRun.nextRaid=__audioRun.nextBossAt=Infinity;});
  const clips=await page.evaluate(async()=>{
   const {MEME_VOICES}=await import('./runner-meme-data.mjs');const result=[];
   for(const [id,clip] of Object.entries(MEME_VOICES)){const response=await fetch(clip.file);const buffer=await __musicContext.decodeAudioData(await response.arrayBuffer());result.push({id,status:response.status,duration:buffer.duration});}return result;
  });assert.equal(clips.length,9);for(const c of clips){assert.equal(c.status,200);assert.ok(c.duration>1&&c.duration<6,c.id);}
 }finally{await context.close();}
});
