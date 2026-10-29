const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs/promises');
const path=require('node:path');
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
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 base=`http://127.0.0.1:${server.address().port}/tanahoraflavio/`;
 browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
});
after(async()=>{await browser?.close();await new Promise(r=>server?.close(r));});
async function open(viewport={width:390,height:844},options={}){
 const {instrument=false,...browserOptions}=options;
 const context=await browser.newContext({viewport,...browserOptions});
 if(instrument){
  const core=await fs.readFile(path.resolve(__dirname,'../tanahoraflavio/runner-core.mjs'),'utf8');
  await context.route('**/runner-core.mjs*',route=>route.fulfill({contentType:'text/javascript',body:core+'\nconst original=createRun;createRun=(...a)=>{const r=original(...a);globalThis.__journeyRun=r;return r;};'}));
  const art=await fs.readFile(path.resolve(__dirname,'../tanahoraflavio/runner-sprites.mjs'),'utf8');
  await context.route('**/runner-sprites.mjs*',route=>route.fulfill({contentType:'text/javascript',body:art+'\nconst originalDraw=drawSpriteActor;drawSpriteActor=(c,args)=>{if(args.type===\'flavio\'){globalThis.__heroAlpha=args.alpha;(globalThis.__heroSteps??=[]).push(spriteFrameFor(\'flavio\',args).index);}if(args.type===\'joice\')globalThis.__joiceDrawn={x:args.x,y:args.y};return originalDraw(c,args);};'}));
  const scenery=await fs.readFile(path.resolve(__dirname,'../tanahoraflavio/runner-scenery.mjs'),'utf8');
  await context.route('**/runner-scenery.mjs*',route=>route.fulfill({contentType:'text/javascript',body:scenery+'\nconst originalScene=drawJourneyScenery;drawJourneyScenery=(c,args)=>{globalThis.__sceneGeometry=journeySceneryGeometry(args);return originalScene(c,args);};'}));
 }
 const page=await context.newPage(),errors=[];page.setDefaultTimeout(5000);page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);await page.getByRole('button',{name:'Começar corrida',exact:true}).waitFor();
 return {context,page,errors};
}
const boxes=page=>page.evaluate(()=>{
 const r=selector=>{const x=document.querySelector(selector).getBoundingClientRect();return {x:x.x,y:x.y,width:x.width,height:x.height,right:x.right,bottom:x.bottom};};
 return {portrait:r('.progress-ring'),counter:r('.counter'),share:r('#share'),hero:r('.hero'),game:r('#game'),scroll:scrollY,digit:parseFloat(getComputedStyle(document.getElementById('days')).fontSize),overflow:document.documentElement.scrollWidth>innerWidth};
});
test('prints: nota de foro removida e botão alterna expandido/recolhido sem reiniciar a corrida',async()=>{
 const {context,page,errors}=await open({width:390,height:844},{instrument:true});
 try{
  assert.equal(await page.locator('.compact-legal').count(),0,'retira exatamente a nota do print 1');
  assert.equal(await page.getByRole('link',{name:'Entenda a regra do STF'}).count(),0);
  const button=page.locator('#game-expand');
  assert.match(await button.textContent(),/Expandir/);
  await page.getByRole('button',{name:'Começar corrida',exact:true}).click();
  await page.evaluate(()=>{__journeyRun.nextObstacle=__journeyRun.nextRaid=__journeyRun.nextBossAt=Infinity;});
  const before=await page.evaluate(()=>__journeyRun.distance);
  await button.click();
  assert.equal(await button.getAttribute('aria-expanded'),'true');assert.match(await button.textContent(),/Recolher/);
  assert.equal(await page.locator('#game').evaluate(e=>e.classList.contains('is-expanded')),true);
  await page.keyboard.press('Escape');
  assert.equal(await button.getAttribute('aria-expanded'),'false');assert.match(await button.textContent(),/Expandir/);
  assert.equal(await page.evaluate(()=>__journeyRun.status),'running');
  assert.ok(await page.evaluate(()=>__journeyRun.distance)>before,'mesma partida continua durante a troca');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);
 }finally{await context.close();}
});
test('pista sem botões/barra continua aceitando toque, deslize e cancelamento',async()=>{
 const {context,page,errors}=await open({width:390,height:844},{instrument:true,hasTouch:true,isMobile:true});
 try{
  for(const id of ['game-jump','game-crouch','game-progress'])assert.equal(await page.locator('#'+id).count(),0,'retira controles do print');
  await page.getByRole('button',{name:'Começar corrida',exact:true}).click();
  await page.evaluate(()=>{const r=__journeyRun;r.nextObstacle=r.nextBossAt=r.nextRaid=Infinity;});
  const track=page.locator('#runner-canvas');await track.tap();await page.waitForFunction(()=>__journeyRun.player.y>20);
  assert.equal(await page.evaluate(()=>__journeyRun.player.jumpBufferedUntil),0,'toque não duplica salto');
  await track.dispatchEvent('pointerdown',{button:0,pointerId:7,pointerType:'touch',isPrimary:true,clientX:100,clientY:100});
  await track.dispatchEvent('pointermove',{pointerId:7,pointerType:'touch',clientX:100,clientY:135});
  await page.waitForFunction(()=>__journeyRun.player.y===0);assert.equal(await page.evaluate(()=>__journeyRun.player.crouching),true);
  await track.dispatchEvent('pointercancel',{pointerId:7,pointerType:'touch'});
  assert.equal(await page.evaluate(()=>__journeyRun.player.crouchHeld),false);
  await track.press('Space');await page.waitForFunction(()=>__journeyRun.player.y>20);assert.deepEqual(errors,[]);
 }finally{await context.close();}
});
for(const width of [320,390,1440])test(`topo de ${width}px tem retrato e contagem grandes centralizados`,async()=>{
 const {context,page,errors}=await open({width,height:900});
 try{
  const r=await boxes(page),mid=width/2;
  assert.ok(r.portrait.width>=190,'retrato ganha destaque no topo');
  assert.ok(r.digit>=40,'números grandes e legíveis');
  for(const box of [r.portrait,r.counter,r.share])assert.ok(Math.abs(box.x+box.width/2-mid)<2,'conteúdo centralizado');
  assert.ok(r.portrait.bottom<r.counter.y,'retrato não cobre a contagem');
  assert.ok(r.counter.bottom<r.share.y,'compartilhamento não cobre os números');
  assert.equal(r.overflow,false);assert.deepEqual(errors,[]);
 }finally{await context.close();}
});
test('rolagem transforma o mesmo cabeçalho sem deslocar a posição da pista no documento',async()=>{
 const {context,page,errors}=await open();
 try{
  const initial=await boxes(page),documentY=initial.game.y;
  await page.evaluate(()=>scrollTo(0,83));
  await page.waitForFunction(()=>{const w=document.querySelector('.progress-ring').getBoundingClientRect().width;return w>120&&w<195;});
  const middle=await boxes(page);
  assert.ok(Math.abs(middle.scroll-83)<2,'não oscila nem altera a rolagem do usuário');
  assert.ok(Math.abs(middle.game.y+middle.scroll-documentY)<2,'wrapper não move o jogo no documento');
  await page.evaluate(()=>scrollTo(0,334));
  await page.waitForFunction(()=>document.querySelector('.progress-ring').getBoundingClientRect().width<=110);
  const compact=await boxes(page);
  assert.ok(compact.portrait.right<compact.counter.x,'formato compacto fica lado a lado');
  assert.ok(compact.share.height>=44);
  assert.equal(await page.locator('#share').count(),1,'não duplica contador ou compartilhar');
  await page.evaluate(()=>scrollTo(0,0));
  await page.waitForFunction(()=>document.querySelector('.progress-ring').getBoundingClientRect().width>=190);
  assert.equal((await boxes(page)).overflow,false);assert.deepEqual(errors,[]);
 }finally{await context.close();}
});
test('retratos e números não se sobrepõem nos estados intermediários',async()=>{
 const {context,page,errors}=await open();
 try{
  for(const width of [320,390,1440]){
   await page.setViewportSize({width,height:900});
   for(const top of [0,33,83,167,250,334]){
    await page.evaluate(y=>scrollTo(0,y),top);
    await page.waitForFunction(y=>Math.abs(scrollY-y)<2,top);
    await page.waitForTimeout(35);
    const r=await boxes(page);
    assert.ok(r.portrait.right<=r.counter.x+1||r.portrait.bottom<=r.counter.y+1,`retrato e contagem separados em ${width}/${top}`);
    assert.ok(r.counter.bottom<r.share.y+1,`compartilhar separado dos números em ${width}/${top}`);
    assert.equal(r.overflow,false);
   }
  }
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});
test('começar deixa a contagem compacta e a pista/comandos alinhados na tela',async()=>{
 const {context,page,errors}=await open();
 try{
  await page.getByRole('button',{name:'Começar corrida',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('.progress-ring').getBoundingClientRect().width<=110);
  for(const id of ['runner-canvas']){
   const r=await page.locator('#'+id).boundingBox();assert.ok(r.y>=0&&r.y+r.height<=844,`${id} cabe durante a partida`);
  }
  const r=await boxes(page);assert.ok(Math.abs(r.hero.x+r.hero.width/2-(r.game.x+r.game.width/2))<2);
  assert.equal(await page.locator('#game-settings').evaluate(e=>e.open),false);assert.deepEqual(errors,[]);
 }finally{await context.close();}
});
test('movimento reduzido evita os tamanhos intermediários da transformação',async()=>{
 const {context,page,errors}=await open({width:390,height:844},{reducedMotion:'reduce'});
 try{
  await page.evaluate(()=>scrollTo(0,167));
  await page.waitForTimeout(80);
  const width=(await boxes(page)).portrait.width;
  assert.ok(width>=190||width<=110,'não interpola o retrato quando o usuário reduziu movimento');
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});
test('escudo protege mantendo o corpo de Flávio opaco',async()=>{
 const {context,page,errors}=await open({width:390,height:844},{instrument:true});
 try{
  await page.getByRole('button',{name:'Começar corrida',exact:true}).click();
  await page.evaluate(()=>{const r=__journeyRun;r.nextObstacle=r.nextBossAt=r.nextRaid=Infinity;r.shieldFor=6;});
  await page.waitForFunction(()=>document.getElementById('game').dataset.power==='shield');
  assert.equal(await page.evaluate(()=>__heroAlpha),1,'escudo não torna o personagem invisível');
  assert.match(await page.locator('#game-power').textContent(),/Escudo das Américas/);
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});
for(const reducedMotion of ['no-preference','reduce'])test(`pernas alternam poses durante a corrida com movimento ${reducedMotion}`,async()=>{
 const {context,page}=await open({width:390,height:844},{instrument:true,reducedMotion});
 try{
  await page.getByRole('button',{name:'Começar corrida',exact:true}).click();
  await page.evaluate(()=>{const r=__journeyRun;r.nextObstacle=r.nextBossAt=r.nextRaid=Infinity;globalThis.__heroSteps=[];});
  await page.waitForTimeout(850);
  const frames=await page.evaluate(()=>[...new Set(__heroSteps)]);
  assert.ok(frames.length>=6,'a passada muda de verdade durante a partida, mesmo com efeitos decorativos reduzidos');
  assert.ok(frames.every(i=>i>=0&&i<8),'só usa os oito desenhos de corrida no chão');
 }finally{await context.close();}
});
test('escudo é um objeto sólido à frente do braço nas duas posturas',async()=>{
 const {context,page}=await open();
 try{
  const bounds=await page.evaluate(async()=>{
   const {drawProtection}=await import('./runner-art.mjs');
   return [false,true].map(crouching=>{
    const canvas=document.createElement('canvas');canvas.width=300;canvas.height=200;const c=canvas.getContext('2d');
    drawProtection(c,{x:100,y:150,crouching,remaining:6});drawProtection(c,{x:100,y:150,crouching,remaining:6,foreground:true});
    const pixels=c.getImageData(0,0,300,200).data;let left=300,right=0,top=200,bottom=0,visible=0,solid=0;
    for(let y=0;y<200;y++)for(let x=0;x<300;x++){const alpha=pixels[(y*300+x)*4+3];if(alpha>2){visible++;if(alpha>=220)solid++;left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}}
    return {left,right,top,bottom,ratio:solid/visible,height:bottom-top+1};
   });
  });
  for(const b of bounds){assert.ok(b.left>100,'sem campo/contorno atrás ou em volta do corpo');assert.ok(b.ratio>.8,'material do escudo é opaco');assert.ok(b.bottom<=160,'objeto acompanha a linha dos pés');}
  assert.ok(bounds[0].height>=55&&bounds[0].height<76,'escudo em pé protege o tronco sem cobrir o rosto');
  assert.ok(bounds[1].height>=36&&bounds[1].height<56,'escudo abaixado cabe no slide');
 }finally{await context.close();}
});
test('Joice surge na pista e o fundo realmente se desloca durante a corrida',async()=>{
 const {context,page,errors}=await open({width:320,height:844},{instrument:true});
 try{
  await page.getByRole('button',{name:'Começar corrida',exact:true}).click();
  await page.evaluate(()=>{const r=__journeyRun;r.nextObstacle=r.nextBossAt=r.nextRaid=Infinity;});
  const before=await page.evaluate(()=>__sceneGeometry.layers[0].segments.find(s=>s.segmentIndex===0).x);
  await page.waitForTimeout(450);
  const after=await page.evaluate(()=>__sceneGeometry.layers[0].segments.find(s=>s.segmentIndex===0).x);
  assert.ok(after<before-10,'arquitetura avança da direita para a esquerda, não só a faixa da estrada');
  await page.evaluate(()=>{__journeyRun.nextRaid=0;});
  await page.waitForFunction(()=>document.getElementById('game').dataset.raid==='warning');
  assert.ok(await page.evaluate(()=>!!globalThis.__joiceDrawn),'personagem aparece dentro do Canvas, além do retratinho no painel');
  assert.equal(await page.locator('#game-raid').isVisible(),true);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  const track=await page.locator('#runner-canvas').boundingBox();assert.ok(track.y>=0&&track.y+track.height<=844);
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});
for(const viewport of [{width:320,height:568},{width:844,height:390}])test(`derrota ${viewport.width}px mostra algemas e legenda abaixo, com nova tentativa acessível`,async()=>{
 const {context,page,errors}=await open(viewport,{instrument:true});
 try{
  if(viewport.width>600)await page.locator('#game-expand').click();
  await page.getByRole('button',{name:'Começar corrida',exact:true}).click();
  await page.evaluate(()=>{const r=__journeyRun;r.nextObstacle=r.nextBossAt=r.nextRaid=Infinity;r.obstacles=[{x:125,width:34,height:44,type:'pf',action:'jump',speed:0}];});
  await page.getByRole('button',{name:'Tentar de novo',exact:true}).waitFor();
  const img=page.locator('#game-captured');
  assert.equal(await img.isVisible(),true,'desenho de Flávio algemado aparece na derrota');
  await page.waitForFunction(()=>document.getElementById('game-captured')?.naturalWidth>0);
  const picture=await img.boundingBox(),title=await page.locator('#game-overlay-title').boundingBox(),again=await page.locator('#game-start').boundingBox();
  assert.ok(picture.y+picture.height<=title.y+1,'legenda abaixo do desenho');
  assert.equal(await page.locator('#game-overlay-title').textContent(),'Foi pego pela Polícia Federal!');
  assert.ok(again.y>=0&&again.y+again.height<=viewport.height+1,'nova tentativa cabe sem procurar o botão');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});
