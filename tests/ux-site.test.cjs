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
async function open({instrument=false,instrumentAudio=false,instrumentSprites=false,init,blockEntry=false,blockSupports=false,legacyFirst=false,...options}={}){
 const context=await browser.newContext(options);
 await context.route(/^https:\/\//,route=>route.abort());
 if(blockSupports)await context.route(url=>/\/assets\/(?:allies-motion-|pursuers-motion-)/.test(url.pathname),route=>route.abort());
 if(init)await context.addInitScript(init);
 if(instrument){
  const source=await fs.readFile(path.resolve(__dirname,'../tanahoraflavio/runner-core.mjs'),'utf8');
  await context.route('**/runner-core.mjs*',route=>route.fulfill({contentType:'text/javascript',body:source+'\nconst originalCreateRun=createRun;createRun=(...args)=>{const run=originalCreateRun(...args);globalThis.__testRun=run;return run;};'}));
 }
 if(instrumentSprites){
  const source=await fs.readFile(path.resolve(__dirname,'../tanahoraflavio/runner-sprites.mjs'),'utf8');
  await context.route('**/runner-sprites.mjs*',route=>route.fulfill({contentType:'text/javascript',body:source+"\nconst drawOriginal=drawSpriteActor;drawSpriteActor=(c,args)=>{const rows=(globalThis.__actorMotion??=[]);rows.push({type:args.type,facing:args.facing,frame:spriteFrameFor(args.type,args)?.index});if(rows.length>1000)rows.shift();return drawOriginal(c,args);};"}));
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

test('jacaré mantém dez segundos sem depender de teclado e permite esquiva lateral',async()=>{
 const {context,page,errors}=await open({instrument:true,viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 try{
  await begin(page);
  await page.evaluate(()=>{const r=__testRun;for(const k of ['nextBossAt','nextRaid','nextObstacle','nextAllyAt','nextPower','nextPassport'])r[k]=Infinity;r.obstacles=[];r.player.isJacare=true;r.player.jacareAge=0;r.shieldFor=Infinity;});
  const canvas=page.locator('#runner-canvas');await canvas.focus();
  await page.waitForFunction(()=>document.getElementById('game-jacare-seconds').textContent==='10 s');
  await page.keyboard.press('ArrowUp');
  await canvas.dispatchEvent('pointerdown',{button:0,pointerId:80,pointerType:'touch',isPrimary:true,clientX:100,clientY:100});
  await canvas.dispatchEvent('pointerup',{pointerId:80,pointerType:'touch',clientX:100,clientY:100});
  assert.equal(await page.evaluate(()=>__testRun.player.isJacare),true);
  const before=await page.evaluate(()=>__testRun.player.x);
  await page.keyboard.down('ArrowRight');
  await page.waitForFunction(x=>__testRun.player.x>x,before);
  await page.keyboard.up('ArrowRight');
  await page.evaluate(()=>{__testRun.player.jacareAge=9.9;});
  await page.waitForFunction(()=>__testRun.player.isJacare===false);
  assert.equal(await page.locator('#game-jacare-progress').isVisible(),false);
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});

test('corrida conserva avisos funcionais sem legendas de música, ação ou transição',async()=>{
 const {context,page,errors}=await open({instrument:true,viewport:{width:1440,height:900}});
 try{
  await begin(page);
  await page.evaluate(()=>{const r=__testRun;r.obstacles=[];r.nextObstacle=Infinity;r.routeDistance=6800;r.cameo={type:'simone',remaining:4};r.raid={id:71,phase:'warning',remaining:1.2,factIndex:0};});
  await page.waitForFunction(()=>document.querySelector('#game').dataset.raid==='warning');
  assert.equal(await page.locator('#game-transition').isVisible(),false);
  assert.equal(await page.locator('#game-voice-note').evaluate(e=>e.classList.contains('sr-only')),true);
  assert.equal(await page.locator('#game-raid-copy').evaluate(e=>e.classList.contains('sr-only')),true);
  assert.equal(await page.locator('#game-score').isVisible(),true);
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});

for(const viewport of [{width:390,height:844},{width:1440,height:900}])test(`teclado atravessa toda a largura útil da pista em ${viewport.width}px`,async()=>{
 const {context,page,errors}=await open({instrument:true,viewport});
 try{
  await page.locator('#game-mode-infinite').check();await begin(page);
  await page.evaluate(()=>{const r=__testRun;for(const k of ['nextBossAt','nextRaid','nextObstacle','nextAllyAt','nextPower','nextPassport'])r[k]=Infinity;r.obstacles=[];});
  await page.locator('#runner-canvas').focus();const before=await page.evaluate(()=>__testRun.distance);await page.keyboard.down('ArrowRight');
  await page.waitForFunction(()=>__testRun.player.x===__testRun.viewportWidth-75,{},{timeout:6000});
  await page.keyboard.up('ArrowRight');
  const advanced=await page.evaluate(()=>__testRun.distance);assert.ok(advanced>before);
  assert.ok(await page.evaluate(()=>__testRun.player.x>__testRun.viewportWidth*.8));
  await page.keyboard.down('ArrowLeft');await page.waitForFunction(()=>__testRun.player.x===26,{},{timeout:6000});
  await page.keyboard.up('ArrowLeft');
  assert.ok(await page.evaluate(previous=>__testRun.distance>previous,advanced),'a corrida e os metros continuam em cada sentido');
  assert.equal(await page.evaluate(()=>__testRun.status),'running');assert.deepEqual(errors,[]);
 }finally{await context.close();}
});

test('mudar foco limpa teclas sem interromper o cronômetro do jacaré',async()=>{
 const {context,page,errors}=await open({instrument:true,viewport:{width:1440,height:900}});
 try{
  await begin(page);await page.evaluate(()=>{const r=__testRun;r.nextObstacle=r.nextRaid=r.nextBossAt=Infinity;r.obstacles=[];r.player.isJacare=true;r.player.jacareAge=1;r.shieldFor=Infinity;});
  const c=page.locator('#runner-canvas');await c.focus();await page.keyboard.down('ArrowUp');await page.keyboard.down('ArrowRight');
  await page.evaluate(()=>document.getElementById('share').focus({preventScroll:true}));
  assert.equal(await page.evaluate(()=>__testRun.player.moveHeld),0);
  await page.keyboard.up('ArrowUp');await page.keyboard.up('ArrowRight');await c.focus();await page.keyboard.press('ArrowUp');
  assert.equal(await page.evaluate(()=>__testRun.player.isJacare),true);
  assert.ok(await page.evaluate(()=>__testRun.player.jacareAge)>=1);
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});

test('soltar uma fonte de agachamento preserva dedo ou outra tecla ainda pressionada',async()=>{
 const {context,page,errors}=await open({instrument:true,viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 try{
  await begin(page);await page.evaluate(()=>{__testRun.nextObstacle=__testRun.nextBossAt=__testRun.nextRaid=Infinity;__testRun.obstacles=[];});
  const c=page.locator('#runner-canvas');await c.focus();
  await swipeDown(page,96);await page.keyboard.down('ArrowDown');await page.keyboard.up('ArrowDown');
  assert.equal(await page.evaluate(()=>__testRun.player.crouchHeld),true,'dedo ainda segura');
  await page.keyboard.down('ArrowDown');await c.dispatchEvent('pointerup',{pointerId:96,pointerType:'touch'});
  assert.equal(await page.evaluate(()=>__testRun.player.crouchHeld),true,'tecla ainda segura');
  await page.keyboard.down('KeyS');await page.keyboard.up('ArrowDown');
  assert.equal(await page.evaluate(()=>__testRun.player.crouchHeld),true,'S ainda segura');
  await page.keyboard.up('KeyS');assert.equal(await page.evaluate(()=>__testRun.player.crouchHeld),false);
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});


async function swipeDown(page,id=7){
 const track=page.locator('#runner-canvas');
 await track.dispatchEvent('pointerdown',{button:0,pointerId:id,pointerType:'touch',isPrimary:true,clientX:100,clientY:100});
 await track.dispatchEvent('pointermove',{pointerId:id,pointerType:'touch',clientX:100,clientY:135});
}
test('falha de apoios mantém largada funcional e oferece nova tentativa dentro da ajuda',async()=>{
 const {context,page,errors}=await open({instrument:true,blockSupports:true,viewport:{width:390,height:844}});
 try{
  await begin(page);await page.waitForFunction(()=>__testRun.elapsed>.1);assert.equal(await page.evaluate(()=>__testRun.status),'running');
  assert.equal(await page.evaluate(()=>__testRun.supportAvailable),false);
  await page.locator('#game-options-panel summary').click();assert.equal(await page.getByRole('button',{name:'Carregar apoios',exact:true}).isVisible(),true);
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});

test('eixo lateral no teclado coexiste com salto e limpa a direção ao perder foco',async()=>{
 const {context,page,errors}=await open({instrument:true,viewport:{width:390,height:844}});
 try{
  await begin(page);await page.locator('#runner-canvas').focus();await page.keyboard.down('ArrowRight');
  await page.waitForFunction(()=>__testRun.player.x>180);await page.keyboard.press('Space');
  await page.waitForFunction(()=>__testRun.player.y>30&&__testRun.player.x>180);
  await page.keyboard.up('ArrowRight');await page.waitForFunction(()=>__testRun.player.moveHeld===0);
  await page.keyboard.down('KeyA');await page.waitForFunction(()=>__testRun.player.moveHeld===-1);
  await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
  assert.equal(await page.evaluate(()=>__testRun.player.moveHeld),0);assert.deepEqual(errors,[]);
 }finally{await context.close();}
});
test('deslize lateral e segundo dedo para salto mantêm comandos independentes',async()=>{
 const {context,page,errors}=await open({instrument:true,viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 try{
  await begin(page);const c=page.locator('#runner-canvas');
  await c.dispatchEvent('pointerdown',{button:0,pointerId:21,pointerType:'touch',isPrimary:true,clientX:100,clientY:100});
  await c.dispatchEvent('pointermove',{pointerId:21,pointerType:'touch',clientX:145,clientY:102});
  await page.waitForFunction(()=>__testRun.player.x>145);
  await c.dispatchEvent('pointerdown',{button:0,pointerId:22,pointerType:'touch',isPrimary:false,clientX:200,clientY:110});
  await c.dispatchEvent('pointerup',{pointerId:22,pointerType:'touch',clientX:200,clientY:110});
  await page.waitForFunction(()=>__testRun.player.y>20&&__testRun.player.moveHeld===1);
  await c.dispatchEvent('pointerup',{pointerId:21,pointerType:'touch',clientX:145,clientY:102});
  assert.equal(await page.evaluate(()=>__testRun.player.moveHeld),0);assert.deepEqual(errors,[]);
 }finally{await context.close();}
});

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
  await begin(page);await page.locator('#runner-canvas').tap();
  await page.waitForFunction(()=>__testRun.player.y>20);
  await swipeDown(page,7);
  await page.waitForFunction(()=>__testRun.player.y===0);
  assert.equal(await page.evaluate(()=>__testRun.player.crouching),true);
  await page.locator('#runner-canvas').dispatchEvent('pointercancel',{pointerId:7});
  assert.equal(await page.evaluate(()=>__testRun.player.crouching),false);
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});

test('alternância de agachamento funciona por toque e preferências sobrevivem ao reload',async()=>{
 const {context,page,errors}=await open({instrument:true,viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 try{
  await page.locator('#game-settings summary').click();
  await page.locator('#game-crouch-mode').selectOption('toggle');
  await page.locator('#game-options-panel summary').click();
  await page.locator('#game-assist').check();
  await page.locator('#game-effects').selectOption('reduce');
  await page.locator('#game-sound').click();
  await page.reload();
  await page.getByRole('button',{name:'Começar corrida',exact:true}).waitFor();
  assert.equal(await page.locator('#game-crouch-mode').inputValue(),'toggle');
  assert.equal(await page.locator('#game-assist').isChecked(),true);
  assert.equal(await page.locator('#game-effects').inputValue(),'reduce');
  assert.equal(await page.locator('#game-sound').getAttribute('aria-pressed'),'false');
  assert.equal(await page.locator('#runner-canvas').getAttribute('aria-describedby'),'game-instructions');
  await begin(page);await swipeDown(page,7);await page.locator('#runner-canvas').dispatchEvent('pointerup',{pointerId:7,pointerType:'touch'});
  assert.equal(await page.evaluate(()=>__testRun.player.crouching),true);
  await swipeDown(page,7);await page.locator('#runner-canvas').dispatchEvent('pointerup',{pointerId:7,pointerType:'touch'});
  assert.equal(await page.evaluate(()=>__testRun.player.crouching),false);
  assert.equal(await page.evaluate(()=>__testRun.player.crouchHeld),false,'segundo deslize desativa a postura');
  assert.equal(await page.evaluate(()=>__testRun.player.velocity),0,'levantar não dispara um salto');
  assert.equal(await page.evaluate(()=>__testRun.assisted),true);
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});

for(const target of ['centro','direita'])test(`segurar Abaixar com um dedo permite saltar com outro em ${target}`,async()=>{
 const {context,page,errors}=await open({instrument:true,viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 let touch;
 try{
  await begin(page);
  const crouch=await page.locator('#runner-canvas').boundingBox(),jump=crouch;
  const first={id:1,x:crouch.x+crouch.width/2,y:crouch.y+crouch.height/2};
  const second={id:2,x:jump.x+jump.width*(target==='centro'?.4:.8),y:jump.y+jump.height*.3};
  touch=await context.newCDPSession(page);
  await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[first]});
  first.y+=30;await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[first]});
  assert.equal(await page.evaluate(()=>__testRun.player.crouching),true,'o primeiro dedo desliza e mantém a postura baixa');
  await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[second]});
  assert.equal(await page.evaluate(()=>__testRun.player.velocity>0),true,'o segundo dedo inicia o salto sem soltar Abaixar');
  // Chromium encerra os contatos informados; manter o dedo de Abaixar ativo.
  await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[second]});
  await page.waitForFunction(()=>__testRun.player.y===0);
  assert.equal(await page.evaluate(()=>__testRun.player.crouching),true,'ao pousar o primeiro dedo continua abaixando');
  assert.equal(await page.evaluate(()=>__testRun.player.jumpBufferedUntil),0,'o mesmo toque não deixa outro salto pendente');
  await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[first]});
  assert.equal(await page.evaluate(()=>__testRun.player.crouchHeld),false,'soltar o primeiro dedo libera a postura');
  assert.deepEqual(errors,[]);
 }finally{await touch?.detach();await context.close();}
});

test('salto continua ignorando botão secundário e caneta não primária',async()=>{
 const {context,page,errors}=await open({instrument:true});
 try{
  await begin(page);
  for(const event of [{button:2,pointerType:'mouse',isPrimary:true},{button:2,pointerType:'touch',isPrimary:false},{button:0,pointerType:'pen',isPrimary:false}]){
   await page.locator('#runner-canvas').dispatchEvent('pointerdown',event);
   assert.equal(await page.evaluate(()=>__testRun.player.velocity),0,'entrada filtrada não aciona salto');
   assert.equal(await page.evaluate(()=>__testRun.player.jumpBufferedUntil),0,'entrada filtrada não guarda intenção');
  }
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
  await page.locator('#game-mode-infinite').check();await begin(page);
  await page.evaluate(()=>{const r=__testRun;r.routeDistance=3500;r.distance=8500;r.nextBossAt=0;r.bossBag=['lula'];r.nextRaid=1000;});
  await page.waitForFunction(()=>document.getElementById('game').dataset.boss==='lula');
  assert.equal(await page.locator('.game-stage-header').isVisible(),true);
  assert.equal(await page.locator('#game-progress').count(),0);
  assert.match(await page.locator('#game-stage-time').textContent(),/ataques|chefão/i);
  assert.match(await page.locator('#game-objective').textContent(),/pule/i);
  await page.evaluate(()=>{__testRun.boss.fired=1;__testRun.boss.nextAttack=.5;});
  await page.waitForFunction(()=>/abaix/i.test(document.getElementById('game-objective').textContent));
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
  for(const id of ['runner-canvas']){
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
  await page.locator('#game-options-panel summary').click();
  await page.locator('#game-assist').check();await page.locator('#game-sound').click();
  await begin(page);await page.locator('#runner-canvas').click();
  assert.equal(await page.locator('#game').getAttribute('data-run-state'),'running');
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});

test('HUD do chefão fica fora da pista e não desloca pista ou controles',async()=>{
 for(const viewport of [{width:320,height:568},{width:844,height:390}]){
  const {context,page,errors}=await open({instrument:true,viewport});
  try{
   if(viewport.width===844)await page.locator('#game-expand').click();
   await page.locator('#game-mode-infinite').check();await begin(page);
   const beforeCanvas=await page.locator('#runner-canvas').boundingBox(),beforeControls=await page.locator('#runner-canvas').boundingBox();
   await page.evaluate(()=>{__testRun.nextBossAt=0;__testRun.bossBag=['lula'];__testRun.nextRaid=1000;});
   await page.waitForFunction(()=>document.getElementById('game').dataset.boss==='lula');
   const canvas=await page.locator('#runner-canvas').boundingBox(),hud=await page.locator('#game-boss').boundingBox();
   const overlaps=canvas.x<hud.x+hud.width&&hud.x<canvas.x+canvas.width&&canvas.y<hud.y+hud.height&&hud.y<canvas.y+canvas.height;
   assert.equal(overlaps,false,`HUD não pode cobrir herói ou projéteis em ${viewport.width}px`);
   const controls=await page.locator('#runner-canvas').boundingBox();
   assert.ok(Math.abs(beforeCanvas.y-canvas.y)<1,'entrada do chefe não desloca a pista');
   assert.ok(Math.abs(beforeControls.y-controls.y)<1,'entrada do chefe não desloca os comandos');
   if(viewport.width===844)assert.ok(hud.y+hud.height<=391,`HUD cabe na ampliação: ${JSON.stringify(hud)}`);
   for(const event of ['raid','transition']){
    await page.evaluate(event=>{
     const r=__testRun;r.boss=null;r.nextBossAt=1e9;r.nextRaid=1000;
     r.raid=event==='raid'?{phase:'warning',remaining:2,factIndex:0,id:1}:null;
     r.routeDistance=event==='transition'?6800:1000;
    },event);
    if(event==='transition'){
     await page.waitForFunction(()=>document.getElementById('game-transition-name').textContent==='Rio de Janeiro');
     assert.equal(await page.locator('#game-transition').isVisible(),false,'a transição acontece no cenário, sem legenda');
    }else{
     await page.waitForFunction(()=>!document.getElementById('game-raid').hidden);
     assert.equal(await page.locator('#game-raid').evaluate(e=>e.classList.contains('sr-only')),true);
    }
    const track=await page.locator('#runner-canvas').boundingBox();
    assert.ok(Math.abs(beforeCanvas.y-track.y)<1,`${event} não desloca a pista`);
   }
   assert.deepEqual(errors,[]);
  }finally{await context.close();}
 }
});

test('HTML antigo no cache se atualiza sem travar a inicialização',async()=>{
 const {context,page,errors}=await open({legacyFirst:true});
 try{
  await page.waitForURL(url=>url.searchParams.get('ui')==='20261111-run-controls', {timeout:4000});
  await page.getByRole('button',{name:'Começar corrida',exact:true}).waitFor();
  assert.equal(await page.locator('#game-settings').count(),1);
  assert.match(await page.locator('#days').textContent(),/^\d+$/);
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});

test('seletor oferece dois modos jogáveis, finaliza História e permite reiniciar no Infinito',async()=>{
 const {context,page,errors}=await open({instrument:true,viewport:{width:390,height:844}});
 try{
  assert.equal(await page.locator('#game-mode-story').isChecked(),true);
  await page.locator('#game-mode-story').check();
  await begin(page);
  assert.equal(await page.evaluate(()=>__testRun.mode),'story');
  assert.equal(await page.locator('#game-mode-chooser').isVisible(),false);
  await page.evaluate(()=>{
   const r=__testRun;
   r.bossesDefeated=19;
   r.nextRaid=r.nextObstacle=r.nextBossAt=Infinity;
   r.shieldFor=Infinity;
   r.boss={type:'bossonari',name:'Bossonari',color:'#7a4f8d',total:1,remaining:1,
    fired:1,nextAttack:100,attackFlashFor:0,hitFlashFor:0,plannedFor:1,
    plannedAttack:{type:'cloroquina-prop',action:'jump'},goalKind:'phantoms',objective:'Desvie do frasco'};
   r.obstacles=[{x:-100,width:38,height:38,type:'cloroquina-prop',action:'jump',bossAttack:true,counted:false,speed:250,y:23}];
  });
  await page.locator('#game-ballot').waitFor({state:'visible'});
  await page.locator('[data-urna-digit="1"]').click();
  await page.locator('[data-urna-digit="3"]').click();
  await page.locator('#game-urna-confirm').click();
  await page.waitForFunction(()=>document.getElementById('game-overlay-title').textContent==='História concluída!',null,{timeout:3000});
  assert.equal(await page.evaluate(()=>__testRun.status),'won');
  await page.locator('#game-mode-infinite').check();
  await page.getByRole('button',{name:'Jogar novamente'}).click();
  assert.equal(await page.evaluate(()=>__testRun.mode),'endless');
  assert.equal(await page.locator('#game').getAttribute('data-run-state'),'running');
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});

test('os avisos das armas aparecem visualmente no celular, com nome e esquiva correta',async()=>{
 const {context,page,errors}=await open({instrument:true,viewport:{width:390,height:844}});
 try{
  await page.locator('#game-mode-infinite').check();await begin(page);
  await page.evaluate(()=>{
   const r=__testRun;
   r.nextObstacle=r.nextBossAt=r.nextRaid=r.nextSupportAt=Infinity;
   r.obstacles=[{x:r.player.x+170,width:46,height:72,type:'wind',sourceActor:'dilma',
    action:'crouch',projectile:true,y:84,launchX:r.player.x+193,targetX:r.player.x+17,
    launchY:84,targetY:84,speed:150}];
   r.cameo={type:'dilma',remaining:3};
  });
  await page.waitForFunction(()=>{
   const e=document.getElementById('game-objective');
   return !e.hidden&&/Abaixe/.test(e.textContent)&&/Vendaval da Dilma/.test(e.textContent);
  },null,{timeout:3000});
  assert.equal(await page.locator('#game-objective').isVisible(),true,'a mensagem era ocultada pelo CSS');
  await page.evaluate(()=>{
   const r=__testRun;r.obstacles=[];r.cameo=null;r.nextBossAt=0;r.bossBag=['xandao'];
   r.shieldFor=Infinity;r.nextRaid=Infinity;
  });
  await page.waitForFunction(()=>document.getElementById('game').dataset.boss==='xandao',null,{timeout:3000});
  await page.waitForFunction(()=>/Martelo de Xandão/.test(document.getElementById('game-boss-weapon').textContent),null,{timeout:3000});
  assert.equal(await page.locator('#game-objective').isVisible(),true);
  assert.match(await page.locator('#game-objective').textContent(),/Martelo de Xandão/);
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});

test('urna 22 mostra prisão e recomeça História automaticamente',async()=>{
 const {context,page,errors}=await open({instrument:true,viewport:{width:390,height:844}});
 try{
  await page.locator('#game-mode-story').check();await begin(page);
  await page.evaluate(()=>{
   const r=__testRun;r.bossesDefeated=19;r.nextRaid=r.nextObstacle=r.nextBossAt=Infinity;r.shieldFor=Infinity;
   r.boss={type:'bossonari',name:'Bossonari',color:'#7a4f8d',total:1,remaining:1,fired:1,nextAttack:100,attackFlashFor:0,hitFlashFor:0,plannedFor:1,plannedAttack:{type:'cloroquina-prop',action:'jump'},goalKind:'phantoms',objective:'Desvie'};
   r.obstacles=[{x:-100,width:38,height:38,type:'cloroquina-prop',action:'jump',bossAttack:true,counted:false,speed:250,y:23}];
  });
  await page.locator('#game-ballot').waitFor({state:'visible'});
  await page.keyboard.press('9');await page.keyboard.press('9');await page.keyboard.press('Enter');
  assert.match(await page.locator('#game-ballot-message').textContent(),/inválido/);
  await page.locator('#game-urna-clear').click();
  await page.locator('[data-urna-digit="2"]').click();await page.locator('[data-urna-digit="2"]').click();
  await page.locator('#game-urna-confirm').click();
  assert.equal(await page.locator('#game').getAttribute('data-run-state'),'prison');
  assert.equal(await page.locator('#game-overlay-title').textContent(),'Flávio foi preso!');
  await page.waitForFunction(()=>__testRun.status==='running'&&__testRun.mode==='story'&&__testRun.bossesDefeated===0,null,{timeout:6000});
  assert.equal(await page.locator('#game-ballot').isVisible(),false);assert.deepEqual(errors,[]);
 }finally{await context.close();}
});

test('chefão final redesenhado aparece com investida do fantasma em celular e desktop',async()=>{
 for(const viewport of [{width:390,height:844},{width:900,height:720}]){
  const {context,page,errors}=await open({instrument:true,viewport,init:()=>{
   const labels=[];globalThis.__drawnBossLabels=labels;
   const orig=CanvasRenderingContext2D.prototype.fillText;
   CanvasRenderingContext2D.prototype.fillText=function(value,...args){
    if(String(value).includes('FANTASMA DO COMUNISMO'))labels.push(String(value));
    return orig.call(this,value,...args);
   };
  }});
  try{
   await page.locator('#game-mode-story').check();await begin(page);
   await page.evaluate(()=>{
    const r=__testRun;r.bossesDefeated=19;r.distance=r.routeDistance=55100;r.nextRaid=r.nextObstacle=Infinity;
    r.nextBossAt=0;r.shieldFor=Infinity;
   });
   await page.waitForFunction(()=>document.getElementById('game').dataset.boss==='meme-army');
   assert.match(await page.locator('#game-boss-name').textContent(),/Fantasma do Comunismo/);
   await page.evaluate(()=>{
    const r=__testRun;r.boss.fired=4;r.boss.plannedFor=4;
    r.boss.plannedAttack={type:'meme-ghost',action:'jump',approach:'drop'};
    r.boss.phase='attack';r.boss.phaseFor=Infinity;r.boss.volleyLeft=1;r.boss.nextAttack=0;
   });
   await page.waitForFunction(()=>__testRun.obstacles.some(o=>o.type==='meme-ghost'&&o.bossAttack));
   assert.deepEqual(errors,[]);
  }finally{await context.close();}
 }
});

for(const viewport of [{width:390,height:844},{width:1440,height:900}])test(`arena de combate ${viewport.width}px mostra classe, energia e disparo funcional`,async()=>{
 const {context,page,errors}=await open({instrument:true,viewport,hasTouch:viewport.width<500,isMobile:viewport.width<500});
 try{
  await page.locator('#game-mode-story').check();await begin(page);
  await page.evaluate(()=>{
   const r=__testRun;r.nextRaid=r.nextObstacle=r.nextPower=r.nextPassport=Infinity;r.shieldFor=Infinity;
   r.routeDistance=22000;r.nextBossAt=0;r.obstacles=[];r.pickups=[];
  });
  await page.waitForFunction(()=>__testRun.boss?.combat===true);
  assert.match(await page.locator('#game-boss-name').textContent(),/Sentinela.*Patrulha/);
  assert.match(await page.locator('#game-power').textContent(),/Energia 5\/5/);
  assert.equal(await page.locator('#game-attack').isVisible(),true);
  const hp=await page.evaluate(()=>__testRun.boss.hp);
  if(viewport.width<500){
   await page.locator('#game-attack').dispatchEvent('pointerdown',{button:0,pointerId:91,pointerType:'touch'});
  }else{
   await page.locator('#runner-canvas').focus();await page.keyboard.down('j');
  }
  await page.waitForFunction(previous=>__testRun.boss.hp<previous,hp,{timeout:6000});
  assert.ok(await page.evaluate(()=>__testRun.shotsFired>0));
  assert.ok(Number(await page.locator('#game-boss-health').getAttribute('aria-valuenow'))<hp);
  if(viewport.width<500)await page.locator('#game-attack').dispatchEvent('pointercancel',{pointerId:91,pointerType:'touch'});
  else await page.keyboard.up('j');
  assert.equal(await page.evaluate(()=>__testRun.player.attackHeld),false);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await fs.mkdir(path.resolve(__dirname,'../ux-captures'),{recursive:true});
  await page.locator('#game').screenshot({path:path.resolve(__dirname,'../ux-captures/arena-'+viewport.width+'.png')});
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});

test('perda de foco cancela disparo mantido e a corrida pode retomar sem tiros presos',async()=>{
 const {context,page,errors}=await open({instrument:true,viewport:{width:900,height:720}});
 try{
  await page.locator('#game-mode-story').check();await begin(page);
  await page.evaluate(()=>{const r=__testRun;r.nextRaid=r.nextObstacle=Infinity;r.routeDistance=22000;r.nextBossAt=0;r.shieldFor=Infinity;});
  await page.waitForFunction(()=>!!__testRun.boss);await page.locator('#runner-canvas').focus();await page.keyboard.down('z');
  assert.equal(await page.evaluate(()=>__testRun.player.attackHeld),true);
  await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
  assert.equal(await page.evaluate(()=>__testRun.player.attackHeld),false);
  await page.keyboard.up('z');await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  assert.equal(await page.evaluate(()=>__testRun.player.attackHeld),false);
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});

test('J/Z funcionam com Disparar focado e o Infinito mostra dano na vida do chefe',async()=>{
 const {context,page,errors}=await open({instrument:true,viewport:{width:900,height:720}});
 try{
  await page.locator('#game-mode-infinite').check();await begin(page);
  await page.evaluate(()=>{const r=__testRun;r.nextRaid=r.nextObstacle=r.nextPower=Infinity;r.routeDistance=r.distance=22000;r.nextBossAt=0;r.shieldFor=Infinity;r.obstacles=[];});
  await page.waitForFunction(()=>!!__testRun.boss);
  const hp=await page.evaluate(()=>__testRun.boss.hp),button=page.locator('#game-attack');
  await button.focus();await page.keyboard.down('j');
  await page.waitForFunction(previous=>__testRun.boss.hp<previous,hp,{timeout:6000});
  await page.keyboard.up('j');
  assert.equal(await button.evaluate(e=>e===document.activeElement),true);
  assert.match(await page.locator('#game-boss-weapon').textContent(),/PV \d+\/18/);
  assert.equal(await page.evaluate(()=>__testRun.player.attackHeld),false);
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});


test('campanha abre sem trocar o modo e alcança a primeira arena da História',async()=>{
 const {context,page,errors}=await open({instrument:true,viewport:{width:390,height:844}});
 try{
  assert.equal(await page.locator('#game-mode-story').isChecked(),true);await begin(page);
  assert.equal(await page.evaluate(()=>__testRun.mode),'story');
  await page.evaluate(()=>{const r=__testRun;r.routeDistance=21998;r.obstacles=[];r.pickups=[];r.nextRaid=Infinity;r.shieldFor=Infinity;});
  await page.waitForFunction(()=>__testRun.boss?.combat===true);
  assert.match(await page.locator('#game-boss-name').textContent(),/Haddad.*Sentinela.*Patrulha/);
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});

test('quadros de preparação e lançamento mudam no Canvas real nas quatro classes e no Fantasma',async()=>{
 const {context,page,errors}=await open({viewport:{width:1440,height:1000}});
 try{
  await page.locator('#game-start').getByText('Começar corrida',{exact:true}).waitFor();
  const evidence=await page.evaluate(async()=>{
   const {drawHoverEnemy}=await import('./runner-boss-art.mjs');
   const types=['haddad','janones','pf','xandao','meme-army'],classes=['sentinel','gunner','caster','sovereign','sovereign'];
   const sheet=document.createElement('canvas');sheet.id='combat-filmstrip';sheet.width=1000;sheet.height=1100;
   const c=sheet.getContext('2d');c.fillStyle='#eaf1f7';c.fillRect(0,0,1000,1100);c.font='bold 15px sans-serif';
   const result=[];
   for(let row=0;row<types.length;row++){
    const hashes=[];
    for(let col=0;col<4;col++){
     const flags=col<2?{preparing:true,progress:col?.9:.1}:{attacking:true,progress:col===2?.1:.7};
     c.fillStyle='#292337';c.fillText(types[row]+' · '+(col<2?'preparação':'lançamento')+' '+flags.progress,col*250+12,row*220+22);
     drawHoverEnemy(c,{type:types[row],classId:classes[row],action:row===2?'move':row===1?'crouch':'jump',x:col*250+140,y:row*220+165,phase:5,...flags});
     // Compare only the articulated body above the hull, without labels/motor.
     const data=c.getImageData(col*250+60,row*220+35,170,120).data;
     let hash=0;for(const value of data)hash=(Math.imul(hash,31)+value)|0;hashes.push(hash);
    }
    result.push(hashes);
   }
   document.body.prepend(sheet);for(const node of document.body.children)if(node!==sheet)node.style.display='none';document.body.style.margin='0';return result;
  });
  for(const row of evidence){assert.notEqual(row[0],row[1],'preparação muda no tempo');assert.notEqual(row[2],row[3],'lançamento muda no tempo');}
  await fs.mkdir(path.resolve(__dirname,'../ux-captures'),{recursive:true});
  await page.locator('#combat-filmstrip').screenshot({path:path.resolve(__dirname,'../ux-captures/combat-filmstrip.png')});
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});

test('disparo fica visível, respeita a tecla configurada, cancela troca mantida e persiste ajustes',async()=>{
 const {context,page,errors}=await open({instrument:true,viewport:{width:390,height:844}});
 try{
  await page.locator('#game-settings summary').click();
  await page.locator('#game-crouch-mode').selectOption('toggle');
  await page.locator('#game-fire-key').selectOption('KeyF');
  await begin(page);
  assert.equal(await page.locator('#game-attack').isVisible(),true);
  assert.equal(await page.locator('#game-attack').isDisabled(),true);
  assert.match(await page.locator('#game-attack').getAttribute('title'),/confrontos/);
  await page.evaluate(()=>{const r=__testRun;r.nextRaid=r.nextObstacle=r.nextPower=r.nextPassport=Infinity;r.routeDistance=r.distance=21998;r.obstacles=[];r.pickups=[];r.shieldFor=Infinity;});
  await page.waitForFunction(()=>__testRun.boss?.phase==='charge');
  assert.equal(await page.locator('#game-attack').isEnabled(),true);
  assert.match(await page.locator('#game-attack').getAttribute('aria-label'),/tecla F/);
  await page.locator('#game-attack').focus();await page.keyboard.down('f');
  await page.waitForFunction(()=>__testRun.shotsFired>0);await page.keyboard.up('f');
  const fired=await page.evaluate(()=>__testRun.shotsFired);await page.keyboard.press('j');
  assert.equal(await page.evaluate(()=>__testRun.shotsFired),fired,'atalho antigo deixa de disparar');
  await page.keyboard.down('f');await page.waitForFunction(n=>__testRun.shotsFired>n,fired);
  await page.locator('#game-settings summary').click();await page.locator('#game-fire-key').selectOption('KeyK');
  assert.equal(await page.evaluate(()=>__testRun.player.attackHeld),false);
  const changed=await page.evaluate(()=>__testRun.shotsFired);await page.waitForTimeout(350);
  assert.equal(await page.evaluate(()=>__testRun.shotsFired),changed,'troca cancela o tiro mantido');
  await page.keyboard.up('f');await page.locator('#game-settings summary').click();
  await page.locator('#runner-canvas').scrollIntoViewIfNeeded();await page.locator('#runner-canvas').focus();
  await page.keyboard.down('k');await page.waitForFunction(n=>__testRun.shotsFired>n,changed);await page.keyboard.up('k');
  assert.equal(await page.evaluate(()=>__testRun.player.attackHeld),false);
  await page.reload();await page.locator('#game-settings summary').click();
  assert.equal(await page.locator('#game-fire-key').inputValue(),'KeyK');
  assert.equal(await page.locator('#game-crouch-mode').inputValue(),'toggle');
  await fs.mkdir(path.resolve(__dirname,'../ux-captures'),{recursive:true});
  await page.locator('#game-settings').screenshot({path:path.resolve(__dirname,'../ux-captures/fire-controls-390.png')});
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});

test('engrenagem contém só comandos, com opções e créditos separados',async()=>{
 const {context,page,errors}=await open({viewport:{width:390,height:844}});
 try{
  await page.locator('#game-settings summary').click();
  assert.deepEqual(await page.locator('#game-settings select').evaluateAll(rows=>rows.map(e=>e.id)),['game-crouch-mode','game-fire-key']);
  assert.equal(await page.locator('#game-settings a').count(),0);
  assert.match(await page.locator('#game-instructions').textContent(),/W.*Espaço.*A\/D.*S/);
  const box=await page.locator('#game-settings').boundingBox();assert.ok(box.height<420,'painel de comandos compacto');
  assert.equal(await page.locator('#game-options-panel').evaluate(e=>e.open),false);
  assert.equal(await page.locator('#game-help').evaluate(e=>e.open),false);
  await fs.mkdir(path.resolve(__dirname,'../ux-captures'),{recursive:true});
  await page.locator('#game-settings').screenshot({path:path.resolve(__dirname,'../ux-captures/compact-controls-390.png')});
  await page.locator('#game-help summary').click();assert.ok(await page.locator('#game-help a').count()>2,'fontes e créditos preservados');
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});

test('WASD anima recuo, retorno, salto e perseguidores de solo sem prancha',async()=>{
 const {context,page,errors}=await open({instrument:true,instrumentSprites:true,viewport:{width:900,height:720}});
 try{
  await begin(page);await page.evaluate(()=>{const r=__testRun;for(const k of ['nextBossAt','nextRaid','nextObstacle','nextAllyAt','nextSupportAt','nextPower','nextPassport'])r[k]=Infinity;r.obstacles=[{type:'pf',x:460,width:34,height:44,action:'jump',speed:0}];r.shieldFor=Infinity;globalThis.__actorMotion=[];});
  const canvas=page.locator('#runner-canvas');await canvas.focus();
  const before=await page.evaluate(()=>__testRun.player.x);await page.keyboard.down('a');
  await page.waitForFunction(x=>__testRun.player.x<x-20,before);
  assert.equal(await page.evaluate(()=>__actorMotion.filter(x=>x.type==='flavio').at(-1).facing),-1);
  await page.keyboard.up('a');await page.waitForFunction(()=>__actorMotion.filter(x=>x.type==='flavio').at(-1).facing===1);
  await page.keyboard.down('w');await page.waitForFunction(()=>__testRun.player.y>10);
  await page.waitForFunction(()=>__testRun.player.y===0);await page.keyboard.down('w');
  assert.equal(await page.evaluate(()=>__testRun.player.y),0,'segurar W não gera salto repetido');
  await page.keyboard.up('w');await page.keyboard.press('w');await page.waitForFunction(()=>__testRun.player.y>10);
  await page.waitForFunction(()=>__testRun.player.y===0);
  await page.keyboard.down('s');await page.waitForFunction(()=>__testRun.player.crouching);await page.keyboard.up('s');await page.waitForFunction(()=>!__testRun.player.crouching);
  const left=await page.evaluate(()=>__testRun.player.x);await page.keyboard.down('d');await page.waitForFunction(x=>__testRun.player.x>x+20,left);await page.keyboard.up('d');
  await page.waitForFunction(()=>new Set(__actorMotion.filter(x=>x.type==='pf').map(x=>x.frame)).size>=2);
  assert.ok(await page.evaluate(()=>__actorMotion.filter(x=>x.type==='pf').every(x=>x.facing===-1)));
  assert.equal(await page.evaluate(()=>__testRun.status),'running');
  await fs.mkdir(path.resolve(__dirname,'../ux-captures'),{recursive:true});await page.locator('#game').screenshot({path:path.resolve(__dirname,'../ux-captures/running-ground-900.png')});
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});
