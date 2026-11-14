const {test,before,after}=require('node:test');
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path');
const {chromium}=require('playwright');
let browser,server,base;
before(async()=>{
 const root=path.resolve(__dirname,'..');
 server=http.createServer(async(req,res)=>{try{
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(pathname==='/'){res.setHeader('Content-Type','text/html');res.end('<button id="start">Jogar</button>');return;}
  const file=path.resolve(root,'.'+pathname);if(!file.startsWith(root+path.sep))throw Error('outside');
  res.setHeader('Content-Type','text/javascript');res.end(await fs.readFile(file));
 }catch{res.writeHead(404);res.end();}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base=`http://127.0.0.1:${server.address().port}`;
 browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
});
after(async()=>{await browser?.close();if(server)await new Promise(resolve=>server.close(resolve));});

test('chegada gera sinal no AudioContext real após gesto e stop/mute o silenciam',async()=>{
 const page=await browser.newPage();try{
  await page.goto(base);
  const before=await page.evaluate(async()=>{
   const {createGameAudio}=await import('/tanahoraflavio/runner-audio.mjs');
   const Native=window.AudioContext;window.__contexts=[];
   window.AudioContext=class extends Native{
    constructor(){super();window.__contexts.push(this);this.analyser=this.createAnalyser();this.analyser.fftSize=1024;}
    createGain(){const gain=super.createGain(),connect=gain.connect.bind(gain);gain.connect=(to,...args)=>{const result=connect(to,...args);if(to===this.destination)connect(this.analyser);return result;};return gain;}
   };
   window.__entranceAudio=createGameAudio();document.querySelector('#start').onclick=()=>{__entranceAudio.prime();__entranceAudio.enemyEntrance('haddad');};
   return{accepted:__entranceAudio.enemyEntrance('haddad'),contexts:__contexts.length};
  });
  assert.deepEqual(before,{accepted:false,contexts:0});await page.click('#start');
  const measure=()=>page.evaluate(async()=>{
   let maximum=0;for(let i=0;i<16;i++){await new Promise(requestAnimationFrame);const samples=new Float32Array(__contexts[0].analyser.fftSize);__contexts[0].analyser.getFloatTimeDomainData(samples);maximum=Math.max(maximum,Math.sqrt(samples.reduce((sum,v)=>sum+v*v,0)/samples.length));}return maximum;
  });
  assert.ok(await measure()>.001,'efeito de chegada tem sinal sonoro nativo');
  await page.evaluate(()=>{__entranceAudio.enemyEntrance('lula');__entranceAudio.stop();});
  await page.waitForTimeout(60);assert.ok(await measure()<.00001,'parada cancela também a segunda nota agendada');
  await page.evaluate(()=>{__entranceAudio.enemyEntrance('simone');__entranceAudio.toggle();});
  await page.waitForTimeout(60);assert.ok(await measure()<.00001,'mute silencia a chegada');
  assert.equal(await page.evaluate(()=>__entranceAudio.enemyEntrance('pf')),false);
  await page.evaluate(()=>{__entranceAudio.toggle();__entranceAudio.heroShot();});
  assert.ok(await measure()>.001,'tiro do jogador continua gerando sinal sonoro nativo');
 }finally{await page.close();}
});

test('todos os 14 inimigos renderizam sinais nativos distintos, audíveis e sem saturação',async()=>{
 const page=await browser.newPage();try{
  await page.goto(base);
  const rendered=await page.evaluate(async()=>{
   const {createGameAudio}=await import('/tanahoraflavio/runner-audio.mjs'),Native=window.AudioContext;
   const result=[];
   try{for(const actor of ['pf','army','janones','joice','soraya','boulos','haddad','simone','dino','xandao','lula','dilma','bossonari','meme-army']){
    const offline=new OfflineAudioContext(1,22050,22050);
    const adapter={currentTime:0,state:'running',destination:offline.destination,createGain:()=>offline.createGain(),createOscillator:()=>offline.createOscillator()};
    window.AudioContext=class{constructor(){return adapter;}};
    const audio=createGameAudio();audio.prime();const accepted=audio.enemyEntrance(actor);
    const samples=(await offline.startRendering()).getChannelData(0);let peak=0,sum=0,hash=0;
    for(let i=0;i<samples.length;i++){peak=Math.max(peak,Math.abs(samples[i]));sum+=samples[i]*samples[i];hash=(Math.imul(hash,31)+Math.round(samples[i]*100000))|0;}
    result.push({actor,accepted,peak,rms:Math.sqrt(sum/samples.length),hash});
   }}finally{window.AudioContext=Native;}
   return result;
  });
  assert.equal(rendered.length,14);assert.equal(new Set(rendered.map(row=>row.hash)).size,14);
  for(const row of rendered){assert.equal(row.accepted,true,row.actor);assert.ok(row.rms>.003,row.actor+' audível: '+row.rms);assert.ok(row.peak>.04&&row.peak<.07,row.actor+' reserva volume para avisos');}
 }finally{await page.close();}
});
