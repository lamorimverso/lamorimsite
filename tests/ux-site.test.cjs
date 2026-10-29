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
async function open({instrument=false,instrumentAudio=false,init,blockEntry=false,legacyFirst=false,...options}={}){
 const context=await browser.newContext(options);
 await context.route(/^https:\/\//,route=>route.abort());
 if(init)await context.addInitScript(init);
 if(instrument){
  const source=await fs.readFile(path.resolve(__dirname,'../tanahoraflavio/runner-core.mjs'),'utf8');
  await context.route('**/runner-core.mjs*',route=>route.fulfill({contentType:'text/javascript',body:source+'\nconst originalCreateRun=createRun;createRun=(...args)=>{const run=originalCreateRun(...args);globalThis.__testRun=run;return run;};'}));
 }
 if(instrumentAudio){
  const source=await fs.readFile(path.resolve(__dirname,'../tanahoraflavio/runner-audio.mjs'),'utf8');
  await context.route('**/runner-audio.mjs*',route=>route.fulfill({contentType:'text/javascript',body:source+'\nconst originalAudio=createGameAudio;createGameAudio=(...args)=>{const audio=originalAudio(...args),effect=audio.effect;globalThis.__testEffects=[];audio.effect=(name)=>{__testEffects.push(name);return effect(name);};return audio;};'}));
 }
 if(blockEntry)await context.route('**/runner.mjs*',route=>route.abort());
 if(legacyFirst){
  let first=true;
  await context.route(url=>url.pathname==='/tanahoraflavio/',async route=>{
   if(!first)return route.continue();first=false;
   let html=await fs.readFile(path.resolve(__dirname,'../tanahoraflavio/index.html'),'utf8');
   html=html.replace(/<details class="game-settings"[\s\S]*?<\/details>/,'').replace(/<script defer src="runner-bootstrap[^>]+><\/script>/,'<script type="module" src="./runner.mjs?legacy=1"></script>');
   await route.fulfill({contentType:'text/html',body:html});
  });
 }
 const page=await context.newPage(),errors=[];page.setDefaultTimeout(2500);page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base,{waitUntil:legacyFirst?'commit':'load'});
 return {context,page,errors};
}
async function begin(page){
 await page.locator('#game').scrollIntoViewIfNeeded();
 await page.getByRole('button',{name:'Começar corrida',exact:true}).click();
 await page.evaluate(()=>{if(globalThis.__testRun)__testRun.nextObstacle=1000;});
}

test('primeira visita ensina pular e abaixar sem expor um bloco longo',async()=>{
 const {context,page,errors}=await open({viewport:{width:390,height:844}});
 try{
  await page.getByRole('button',{name:'Começar corrida',exact:true}).waitFor();
  assert.equal(await page.locator('#game-start-hint').isVisible(),true);
  assert.match(await page.locator('#game-start-hint').textContent(),/pular.*abaixar/i);
  assert.equal(await page.locator('#game-settings').evaluate(e=>e.open),false);
  await page.locator('#game-settings summary').click();
  assert.equal(await page.locator('#game-instructions').isVisible(),true);
  assert.match(await page.locator('#game-instructions').textContent(),/Espaço.*S/);
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});

test('toque mantido no ar agacha ao pousar e cancelamento libera a postura',async()=>{
 const {context,page,errors}=await open({instrument:true,viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 try{
  await begin(page);await page.locator('#game-jump').tap();
  await page.waitForFunction(()=>__testRun.player.y>20);
  await page.locator('#game-crouch').dispatchEvent('pointerdown',{button:0,pointerId:7});
  await page.waitForFunction(()=>__testRun.player.y===0);
  assert.equal(await page.evaluate(()=>__testRun.player.crouching),true);
  await page.locator('#game-crouch').dispatchEvent('pointercancel',{pointerId:7});
  assert.equal(await page.evaluate(()=>__testRun.player.crouching),false);
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});

test('alternância de agachamento funciona por toque e preferências sobrevivem ao reload',async()=>{
 const {context,page,errors}=await open({instrument:true,viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 try{
  await page.locator('#game-settings summary').click();
  await page.locator('#game-crouch-mode').selectOption('toggle');
  await page.locator('#game-assist').check();
  await page.locator('#game-effects').selectOption('reduce');
  await page.locator('#game-sound').click();
  await page.reload();
  await page.getByRole('button',{name:'Começar corrida',exact:true}).waitFor();
  assert.equal(await page.locator('#game-crouch-mode').inputValue(),'toggle');
  assert.equal(await page.locator('#game-assist').isChecked(),true);
  assert.equal(await page.locator('#game-effects').inputValue(),'reduce');
  assert.equal(await page.locator('#game-sound').getAttribute('aria-pressed'),'false');
  assert.equal(await page.locator('#game-crouch').getAttribute('aria-label'),'Abaixar','nome acessível não manda segurar no modo alternar');
  await begin(page);await page.locator('#game-crouch').tap();
  assert.equal(await page.evaluate(()=>__testRun.player.crouching),true);
  await page.locator('#game-crouch').tap();
  assert.equal(await page.evaluate(()=>__testRun.player.crouching),false);
  assert.equal(await page.evaluate(()=>__testRun.assisted),true);
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});

test('perda de foco descarta salto que aguardava o pouso',async()=>{
 const {context,page,errors}=await open({instrument:true});
 try{
  await begin(page);
  const state=await page.evaluate(()=>{
   const r=__testRun;r.player.y=2;r.player.velocity=-100;
   const canvas=document.getElementById('runner-canvas');
   canvas.dispatchEvent(new KeyboardEvent('keydown',{code:'Space',bubbles:true}));
   const queued=r.player.jumpBufferedUntil>r.elapsed;
   window.dispatchEvent(new Event('blur'));
   return {queued,deadline:r.player.jumpBufferedUntil,held:r.player.crouchHeld};
  });
  assert.equal(state.queued,true,'o teste realmente pressionou salto no ar');
  assert.equal(state.deadline,0,'voltar à aba não executa uma intenção antiga');
  assert.equal(state.held,false);
  await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  await page.waitForFunction(()=>__testRun.player.y===0);
  assert.equal(await page.evaluate(()=>__testRun.player.velocity),0);
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});

test('salto executado no pouso produz um único efeito de salto',async()=>{
 const {context,page,errors}=await open({instrument:true,instrumentAudio:true});
 try{
  await begin(page);
  await page.evaluate(()=>{
   __testRun.player.y=2;__testRun.player.velocity=-100;
   document.getElementById('runner-canvas').dispatchEvent(new KeyboardEvent('keydown',{code:'Space',bubbles:true}));
  });
  await page.waitForFunction(()=>__testRun.player.y>20);
  assert.equal(await page.evaluate(()=>__testEffects.filter(x=>x==='jump').length),1,'o comando guardado tem o mesmo retorno sonoro do salto imediato');
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});

test('progresso distingue a rota dos metros e chefão mostra a ação correta',async()=>{
 const {context,page,errors}=await open({instrument:true});
 try{
  await begin(page);
  await page.evaluate(()=>{const r=__testRun;r.routeDistance=3500;r.distance=8500;r.nextBossAt=0;r.bossBag=['lula'];r.nextRaid=1000;});
  await page.waitForFunction(()=>document.getElementById('game').dataset.boss==='lula');
  assert.equal(await page.locator('.game-stage-header').isVisible(),true);
  assert.equal(await page.locator('#game-progress').isVisible(),true);
  assert.match(await page.locator('#game-stage-time').textContent(),/ataques|chefão/i);
  assert.match(await page.locator('#game-objective').textContent(),/abaix/i);
  await page.evaluate(()=>{__testRun.boss.fired=1;__testRun.boss.nextAttack=.5;});
  await page.waitForFunction(()=>/pule/i.test(document.getElementById('game-objective').textContent));
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});

test('derrota preserva a frase e explica a evasão do ataque recebido',async()=>{
 const {context,page,errors}=await open({instrument:true});
 try{
  await begin(page);
  await page.evaluate(()=>{__testRun.obstacles=[{x:130,width:46,height:44,type:'hammer',projectile:true,y:29,launchX:150,targetX:137,launchY:29,targetY:29,action:'jump',speed:0}];});
  await page.waitForFunction(()=>__testRun.status==='over');
  assert.equal(await page.locator('#game-overlay-title').textContent(),'Foi pego pela Polícia Federal!');
  assert.equal(await page.locator('#game-overlay-copy').isVisible(),true);
  assert.match(await page.locator('#game-overlay-copy').textContent(),/martelo.*salto/i);
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});

test('ampliar mantém controles na tela e Escape recolhe sem pausar',async()=>{
 const {context,page,errors}=await open({instrument:true,viewport:{width:844,height:390},hasTouch:true,isMobile:true});
 try{
  await page.locator('#game-expand').click();
  assert.equal(await page.locator('#game-expand').getAttribute('aria-pressed'),'true');
  await begin(page);
  const track=await page.locator('#runner-canvas').boundingBox();
  assert.ok(track.height>=175,`ampliação em paisagem mantém uma pista legível: ${track.height}px`);
  for(const id of ['runner-canvas','game-jump','game-crouch']){
   const r=await page.locator('#'+id).boundingBox();assert.ok(r.y>=0&&r.y+r.height<=391,`${id} cabe no modo ampliado: ${JSON.stringify(r)}`);
  }
  await page.locator('#runner-canvas').press('Escape');
  assert.equal(await page.locator('#game-expand').getAttribute('aria-pressed'),'false');
  assert.equal(await page.locator('#game').getAttribute('data-run-state'),'running');
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});

test('falha de módulo oferece recarregar em vez de carregar eternamente',async()=>{
 const {context,page,errors}=await open({blockEntry:true});
 try{
  await page.waitForFunction(()=>document.getElementById('game-start').textContent==='Recarregar jogo',null,{timeout:2500});
  assert.equal(await page.locator('#game-start').isEnabled(),true);
  assert.equal(await page.locator('#game-loading-note').isVisible(),true);
  assert.match(await page.locator('#game-loading-note').textContent(),/carregar|conexão/i);
  assert.match(await page.locator('#days').textContent(),/^\d+$/);
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});

test('controles aguardam a inicialização antes de aceitar mudanças',async()=>{
 const {context,page,errors}=await open({blockEntry:true});
 try{
  for(const id of ['game-sound','game-expand','game-crouch-mode','game-effects','game-assist']){
   assert.equal(await page.locator('#'+id).isEnabled(),false,`${id} não aceita ação que seria perdida antes do módulo`);
  }
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});

test('ajustes e início continuam funcionando com armazenamento bloqueado',async()=>{
 const {context,page,errors}=await open({instrument:true,init:()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('blocked','SecurityError');}})});
 try{
  await page.locator('#game-settings summary').click();
  await page.locator('#game-assist').check();await page.locator('#game-sound').click();
  await begin(page);await page.locator('#game-jump').click();
  assert.equal(await page.locator('#game').getAttribute('data-run-state'),'running');
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});

test('HUD do chefão fica fora da pista e não desloca pista ou controles',async()=>{
 for(const viewport of [{width:320,height:568},{width:844,height:390}]){
  const {context,page,errors}=await open({instrument:true,viewport});
  try{
   if(viewport.width===844)await page.locator('#game-expand').click();
   await begin(page);
   const beforeCanvas=await page.locator('#runner-canvas').boundingBox(),beforeControls=await page.locator('#game-jump').boundingBox();
   await page.evaluate(()=>{__testRun.nextBossAt=0;__testRun.bossBag=['lula'];__testRun.nextRaid=1000;});
   await page.waitForFunction(()=>document.getElementById('game').dataset.boss==='lula');
   const canvas=await page.locator('#runner-canvas').boundingBox(),hud=await page.locator('#game-boss').boundingBox();
   const overlaps=canvas.x<hud.x+hud.width&&hud.x<canvas.x+canvas.width&&canvas.y<hud.y+hud.height&&hud.y<canvas.y+canvas.height;
   assert.equal(overlaps,false,`HUD não pode cobrir herói ou projéteis em ${viewport.width}px`);
   const controls=await page.locator('#game-jump').boundingBox();
   assert.ok(Math.abs(beforeCanvas.y-canvas.y)<1,'entrada do chefe não desloca a pista');
   assert.ok(Math.abs(beforeControls.y-controls.y)<1,'entrada do chefe não desloca os comandos');
   if(viewport.width===844)assert.ok(hud.y+hud.height<=391,`HUD cabe na ampliação: ${JSON.stringify(hud)}`);
   for(const event of ['raid','transition']){
    await page.evaluate(event=>{
     const r=__testRun;r.boss=null;r.nextBossAt=1e9;r.nextRaid=1000;
     r.raid=event==='raid'?{phase:'warning',remaining:2,factIndex:0,id:1}:null;
     r.routeDistance=event==='transition'?6800:1000;
    },event);
    await page.waitForFunction(id=>!document.getElementById(id).hidden,'game-'+event);
    const card=await page.locator('#game-'+event).boundingBox();
    const track=await page.locator('#runner-canvas').boundingBox();
    assert.ok(card.y>=track.y+track.height,`${event} também fica fora da pista`);
    assert.ok(Math.abs(beforeCanvas.y-track.y)<1,`${event} não desloca a pista`);
   }
   assert.deepEqual(errors,[]);
  }finally{await context.close();}
 }
});

test('HTML antigo no cache se atualiza sem travar a inicialização',async()=>{
 const {context,page,errors}=await open({legacyFirst:true});
 try{
  await page.waitForURL(url=>url.searchParams.get('ui')==='20261029-clean', {timeout:4000});
  await page.getByRole('button',{name:'Começar corrida',exact:true}).waitFor();
  assert.equal(await page.locator('#game-settings').count(),1);
  assert.match(await page.locator('#days').textContent(),/^\d+$/);
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});
