const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require('playwright');
let browser, server, base;

before(async () => {
  const root = path.resolve(__dirname, '..');
  server = http.createServer(async (req, res) => {
    try {
      let file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
      if (!file.startsWith(root + path.sep)) throw Error('outside root');
      if ((await fs.stat(file)).isDirectory()) file = path.join(file, 'index.html');
      const type = {'.html':'text/html', '.css':'text/css', '.mjs':'text/javascript', '.js':'text/javascript', '.webp':'image/webp', '.png':'image/png'}[path.extname(file)] || 'application/octet-stream';
      res.writeHead(200, {'Content-Type':type}); res.end(await fs.readFile(file));
    } catch { res.writeHead(404); res.end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}/tanahoraflavio/`;
  browser = await chromium.launch({headless:true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? {executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH} : {})});
});
after(async () => { await browser?.close(); await new Promise(resolve => server?.close(resolve)); });

async function open(options = {}, init) {
  const context = await browser.newContext(options);
  // Música indisponível é um caso real: o conteúdo principal deve continuar funcionando.
  await context.route(/^https:\/\//, route => route.abort());
  if (init) await context.addInitScript(init);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(base);
  await page.waitForFunction(() => /^\d+$/.test(document.getElementById('days').textContent));
  return { context, page, errors };
}

// Instrumentação exclusiva do teste: o produto não expõe APIs de depuração.
async function openWithRun(options = {}, init) {
  const context = await browser.newContext(options);
  await context.route(/^https:\/\//, route => route.abort());
  if(init)await context.addInitScript(init);
  const source = await fs.readFile(path.resolve(__dirname, '../tanahoraflavio/runner-core.mjs'), 'utf8');
  await context.route('**/runner-core.mjs*', route => route.fulfill({
    contentType: 'text/javascript',
    body: source + '\nconst oldCreateRun=createRun; createRun=()=>{const run=oldCreateRun();globalThis.__testRun=run;return run;};'
  }));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(base);
  await page.waitForFunction(() => /^\d+$/.test(document.getElementById('days').textContent));
  return {context,page,errors};
}

test('o carregamento dos personagens libera Começar corrida sem erros no fundo',async()=>{
 const {context,page,errors}=await open();
 try{
  await page.waitForFunction(()=>{
   const button=document.getElementById('game-start'),game=document.getElementById('game');
   return button&&!button.disabled&&button.textContent==='Começar corrida'&&game.dataset.art==='loaded';
  },null,{timeout:12000});
  assert.deepEqual(errors,[],'o desenho da paisagem não pode lançar exceção durante o carregamento');
  await page.locator('#game-start').click();
  assert.equal(await page.locator('#game').getAttribute('data-run-state'),'running');
 }finally{await context.close();}
});

test('teclado mantém a corrida sem botão ou atalho de pausa', async () => {
  const {context,page,errors}=await open();
  try {
    await page.getByRole('button',{name:'Começar corrida',exact:true}).click();
    assert.equal(await page.locator('#game-pause').count(),0);
    await page.locator('#runner-canvas').press('KeyP');
    await page.locator('#runner-canvas').press('Escape');
    const before=Number(await page.locator('#game-score').textContent());
    await page.waitForTimeout(320);
    assert.ok(Number(await page.locator('#game-score').textContent())>before);
    assert.equal(await page.locator('#game').getAttribute('data-run-state'),'running');
    await page.locator('#runner-canvas').press('Space');
    assert.equal(await page.locator('#game-jump').isEnabled(),true);
    assert.deepEqual(errors,[]);
  }finally{await context.close();}
});

test('toque funciona em celular sem armazenamento disponível', async () => {
  const {context,page,errors} = await open({viewport:{width:390,height:844},hasTouch:true,isMobile:true}, () => {
    Object.defineProperty(window,'localStorage',{get(){throw new DOMException('blocked','SecurityError')}});
  });
  try {
    await page.locator('#game').scrollIntoViewIfNeeded();
    await page.getByRole('button',{name:'Começar corrida',exact:true}).tap({timeout:1500});
    await page.getByRole('button',{name:'Pular',exact:true}).tap();
    await page.waitForTimeout(250);
    assert.ok(Number(await page.locator('#game-score').textContent()) > 0);
    assert.deepEqual(errors,[]);
  } finally { await context.close(); }
});

test('aba oculta congela sem exibir pausa e retoma automaticamente', async () => {
  const {context,page,errors}=await open();
  try {
    await page.getByRole('button',{name:'Começar corrida',exact:true}).click();
    await page.evaluate(() => {
      Object.defineProperty(document,'hidden',{configurable:true,value:true});
      document.dispatchEvent(new Event('visibilitychange'));
    });
    const score=await page.locator('#game-score').textContent();
    await page.waitForTimeout(240);
    assert.equal(await page.locator('#game-score').textContent(),score);
    assert.equal(await page.locator('#game').getAttribute('data-run-state'),'running');
    await page.evaluate(() => {
      Object.defineProperty(document,'hidden',{configurable:true,value:false});
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForFunction(previous=>Number(document.getElementById('game-score').textContent)>Number(previous),score);
    assert.equal(await page.locator('#game-pause').count(),0);
    assert.deepEqual(errors,[]);
  }finally{await context.close();}
});

test('layout e controles cabem em 320, 390, 768 e 1440 pixels', async () => {
  const {context,page} = await open();
  try {
    for (const width of [320,390,768,1440]) {
      await page.setViewportSize({width,height:1000});
      await page.locator('#runner-canvas').waitFor({state:'visible',timeout:1500});
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),true,`overflow em ${width}px`);
      for (const id of ['days','hours','minutes','seconds']) assert.ok(Number.isFinite(Number(await page.locator('#'+id).textContent())));
      const canvas = await page.locator('#runner-canvas').boundingBox();
      assert.ok(canvas.width <= width && canvas.height >= 150);
    }
    assert.equal(await page.locator('.sources').count(),0);
    assert.equal(await page.locator('.compact-legal a').isVisible(),true);
    await page.getByRole('button',{name:'Começar corrida',exact:true}).hover();
    const contrast = await page.locator('#game-start').evaluate(button => {
      const style=getComputedStyle(button);
      const luminance=color=>color.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
      const fg=luminance(style.color),bg=luminance(style.backgroundColor);
      return (Math.max(fg,bg)+.05)/(Math.min(fg,bg)+.05);
    });
    assert.ok(contrast>=4.5,`Contraste do botão ao passar o mouse: ${contrast}`);
  } finally { await context.close(); }
});

test('o contador encerra sem números negativos após a data final', async () => {
  const {context,page} = await open({}, () => {
    const RealDate=Date;
    window.Date=class extends RealDate { constructor(...args){super(...(args.length?args:['2027-02-01T03:00:01Z']))} static now(){return new RealDate('2027-02-01T03:00:01Z').getTime()} };
  });
  try {
    assert.equal(await page.locator('#finished').isVisible(),true);
    assert.equal(await page.locator('#days').textContent(),'0');
  } finally { await context.close(); }
});

test('sem música na página, a contagem e o jogo continuam disponíveis', async () => {
  const {context,page,errors} = await open();
  try {
    assert.equal(await page.locator('#musicas, #musica, #music-panel, #music-toggle, #music-native, #game-playlist-player').count(),0);
    assert.equal(await page.locator('.site-header nav').count(),0);
    assert.equal(await page.getByRole('button',{name:'Começar corrida',exact:true}).isEnabled(),true);
    assert.ok(Number.isFinite(Number(await page.locator('#days').textContent())));
    assert.deepEqual(errors,[]);
  } finally { await context.close(); }
});

test('uma colisão sem poder encerra e reinício restaura uma vida', async () => {
  const {context,page,errors} = await openWithRun();
  try {
    await page.getByRole('button',{name:'Começar corrida',exact:true}).click();
    await page.evaluate(() => {
      const run=globalThis.__testRun;
      run.lives=1;
      run.graceFor=0;
      run.shieldFor=0;
      run.nextObstacle=run.nextPickup=run.nextPassport=1000;
      run.obstacles=[{x:125,width:34,height:44,type:'pf'}];
    });
    await page.waitForFunction(() => document.getElementById('game').dataset.runState === 'over');
    assert.match(await page.locator('#game-overlay-title').textContent(), /Foi pego pela Polícia Federal!/);
    assert.equal(await page.locator('#game-lives').textContent(),'0');
    await page.getByRole('button',{name:'Tentar de novo',exact:true}).click();
    assert.equal(await page.locator('#game').getAttribute('data-run-state'),'running');
    assert.equal(await page.locator('#game-lives').textContent(),'1');
    assert.equal(await page.locator('#game-passports').textContent(),'0');
    assert.match(await page.locator('#game-threat').textContent(), /Inimigos sorteados/);
    assert.match(await page.locator('#game-power').textContent(), /Sem efeito/);
    assert.equal(await page.locator('#game-ammo').textContent(),'Sem arma');
    assert.deepEqual(errors,[]);
  } finally { await context.close(); }
});

test('invisibilidade congela com aba oculta e retoma sem intervenção', async () => {
  const {context,page,errors}=await openWithRun();
  try {
    await page.getByRole('button',{name:'Começar corrida',exact:true}).click();
    await page.evaluate(() => {
      const run=globalThis.__testRun;
      run.nextObstacle=run.nextPickup=run.nextPassport=1000;
      run.obstacles=[];
      run.pickups.push({x:136,y:35,type:'shield',value:0});
    });
    await page.waitForFunction(()=>/Escudo das Américas/.test(document.getElementById('game-power').textContent));
    await page.evaluate(()=>{
      Object.defineProperty(document,'hidden',{configurable:true,value:true});
      document.dispatchEvent(new Event('visibilitychange'));
    });
    const remaining=await page.locator('#game-power').textContent();
    await page.waitForTimeout(220);
    assert.equal(await page.locator('#game-power').textContent(),remaining);
    await page.evaluate(()=>{
      Object.defineProperty(document,'hidden',{configurable:true,value:false});
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForFunction(()=>globalThis.__testRun.shieldFor<5.5);
    assert.deepEqual(errors,[]);
  }finally{await context.close();}
});

test('100 passaportes concedem +1 vida e a corrida permanece infinita', async () => {
  const {context,page,errors} = await openWithRun();
  try {
    await page.getByRole('button',{name:'Começar corrida',exact:true}).click();
    await page.evaluate(() => {
      const run=globalThis.__testRun;
      run.nextObstacle=run.nextPickup=run.nextPassport=1000;
      run.obstacles=[];
      run.passports=99;
      run.pickups.push({x:136,y:35,type:'passport',value:50});
    });
    await page.waitForFunction(() => document.getElementById('game-passports').textContent === '100');
    assert.equal(await page.locator('#game-lives').textContent(),'2');
    assert.equal(await page.locator('#game-passport-next').textContent(),'100');
    await page.evaluate(() => {
      const run=globalThis.__testRun;
      run.elapsed=85;run.routeDistance=29000;run.nextBossAt=Infinity;
      run.distance=90000;
      run.shieldFor=1000;
      run.obstacles=[];
    });
    await page.waitForFunction(() => document.getElementById('game-stage-name').textContent === 'Casa Branca');
    assert.match(await page.locator('#game-difficulty').textContent(),/Risco/);
    assert.match(await page.locator('#game-phase').textContent(),/Cenário 5 de 5/);
    assert.equal(await page.locator('#game-progress').isVisible(),true);
    assert.equal(await page.locator('#game').getAttribute('data-run-state'),'running');
    assert.deepEqual(errors,[]);
  } finally { await context.close(); }
});

test('contagem compacta preserva retrato, percentual e compartilhamento sem sobreposição', async () => {
  const {context,page,errors} = await open();
  try {
    for (const width of [320,390,768,1440]) {
      await page.setViewportSize({width,height:900});
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `overflow em ${width}px`);
      const counter = await page.locator('.counter').boundingBox();
      const portrait = await page.locator('.progress-ring').boundingBox();
      assert.ok(counter && portrait);
      assert.ok(portrait.x+portrait.width<=counter.x+1 || portrait.y+portrait.height<=counter.y+1, `retrato não cobre a contagem em ${width}px`);
      assert.ok(portrait.width >= 80, `retrato legível em ${width}px`);
      const play = await page.locator('.hero-play').boundingBox();
      assert.ok(play.height >= 44 && play.width >= 44);
      assert.equal(await page.locator('.game-itinerary').evaluate(x => x.open),false);
      assert.equal(await page.locator('.game-help').count(),0);
      const game = await page.locator('#runner-canvas').boundingBox();
      const stage = await page.locator('.game-topline').boundingBox();
      assert.ok(stage.y < game.y, `HUD e cenário devem anteceder a pista em ${width}px`);
    }
    await page.locator('.hero-play').click();
    assert.ok(await page.locator('#game').isVisible());
    await page.waitForFunction(()=>/copiado|compartilhado|Copie/i.test(document.getElementById('share-message').textContent));
    assert.equal(await page.locator('.hero-play').textContent(),'Compartilhar ↗');
    assert.equal(await page.locator('#music-toggle').count(),0);
    assert.equal(await page.locator('#share').count(),1);
    assert.deepEqual(errors,[]);
  } finally { await context.close(); }
});


test('desktop replica a coluna única do celular sem excesso de texto exposto', async () => {
  const {context,page,errors}=await open();
  try {
    for(const width of [320,390,768,1024,1440]){
      await page.setViewportSize({width,height:900});
      // ResizeObserver ajusta a proporção da pista no próximo frame.
      await page.waitForFunction(() => {
        const canvas=document.getElementById('runner-canvas');
        return canvas && canvas.getBoundingClientRect().height>=150;
      });
      const geometry=await page.evaluate(()=>{
        const hero=document.querySelector('.hero').getBoundingClientRect();
        const game=document.getElementById('game').getBoundingClientRect();
        const counter=document.querySelector('.counter').getBoundingClientRect();
        const photo=document.querySelector('.progress-ring').getBoundingClientRect();
        const viewport=document.getElementById('runner-canvas').getBoundingClientRect();
        return {hero:{x:hero.x,width:hero.width},game:{x:game.x,width:game.width},counterY:counter.y,counterX:counter.x,photoRight:photo.right,photoBottom:photo.bottom,viewportWidth:viewport.width,viewportHeight:viewport.height,overflow:document.documentElement.scrollWidth>innerWidth};
      });
      assert.equal(geometry.overflow,false,`overflow na largura ${width}`);
      assert.equal(await page.locator('#titulo').isVisible(),true,`título do site visível em ${width}px`);
      assert.ok(geometry.hero.width <= 540,`hero não deve virar grade desktop em ${width}: ${geometry.hero.width}`);
      assert.ok(geometry.game.width<=900 && geometry.game.width>=geometry.hero.width,`largura útil da pista: ${width}`);
      assert.ok(Math.abs((geometry.hero.x+geometry.hero.width/2)-(geometry.game.x+geometry.game.width/2))<3,`colunas desalinhadas: ${width}`);
      assert.ok(geometry.photoRight<=geometry.counterX+1 || geometry.photoBottom<=geometry.counterY+1,`retrato não deve cobrir a contagem: ${width}`);
      assert.ok(geometry.viewportWidth >= 240 && geometry.viewportHeight >= 150,`pista legível em ${width}: ${JSON.stringify({w:geometry.viewportWidth,h:geometry.viewportHeight})}`);
      assert.equal(await page.locator('.game-itinerary').evaluate(e=>e.open),false);
      assert.equal(await page.locator('.game-help').count(),0);
      assert.equal(await page.locator('.game-guide').count(),0);
    }
    assert.equal(await page.locator('#game').getAttribute('data-ammo'),'none');
    assert.equal(await page.locator('.game-hud .power-chip').isVisible(),false);
    assert.equal(await page.locator('.game-hud .ammo-chip').isVisible(),false);
    assert.equal(await page.locator('#game-stage-name').isVisible(),true);
    assert.equal(await page.locator('#game-lives').isVisible(),true);
    assert.equal(await page.locator('#game-passports').isVisible(),true);
    assert.equal(await page.locator('.site-header nav a').count(),0);
    assert.deepEqual(errors,[]);
  }finally{await context.close();}
});


test('referência minimalista mantém mesma hierarquia no desktop e celular sem blocos coloridos', async () => {
  const {context,page,errors}=await open();
  try {
    for(const width of [320,390,768,1440]){
      await page.setViewportSize({width,height:940});
      const v=await page.evaluate(()=>{
        const rect=sel=>{const r=document.querySelector(sel).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}};
        const computed=sel=>getComputedStyle(document.querySelector(sel));
        return {
          body:computed('body').backgroundColor,
          counterCell:computed('.unit').backgroundColor,
          heroShadow:computed('.hero').boxShadow,
          heroBorder:computed('.hero').borderTopWidth,
          hero:rect('.hero'),game:rect('.game-card'),counter:rect('.counter'),
          portrait:rect('.progress-ring'),button:rect('.hero-play'),
          overflow:document.documentElement.scrollWidth>innerWidth,
          stylesheet:[...document.styleSheets].some(x=>x.href?.includes('game.css'))
        };
      });
      assert.equal(v.body,'rgb(255, 255, 255)', 'fundo branco');
      assert.equal(v.counterCell,'rgba(0, 0, 0, 0)', 'sem cartões coloridos');
      assert.equal(v.heroShadow,'none','sem sombra de cartão');
      assert.equal(v.heroBorder,'0px','sem borda externa');
      assert.equal(v.stylesheet,true,'camada minimalista carregada');
      assert.equal(v.overflow,false,`overflow em ${width}px`);
      assert.ok(v.portrait.x + v.portrait.width <= width, `retrato precisa caber em ${width}px`);
      assert.ok(v.hero.width<=540,`coluna única não deve esticar em ${width}px`);
      assert.ok(Math.abs((v.hero.x+v.hero.width/2)-(v.game.x+v.game.width/2))<3,`seções alinhadas em ${width}px`);
      assert.ok(v.portrait.x+v.portrait.width<=v.counter.x+1 || v.portrait.y+v.portrait.height<=v.counter.y+1,`retrato não cobre a contagem em ${width}px`);
      assert.ok(v.button.height>=44,`CTA tocável em ${width}px`);
    }
    assert.equal(await page.locator('#music-toggle').count(),0);
    assert.equal(await page.locator('#share').count(),1);
    assert.equal(await page.locator('.sources').count(),0);
    assert.equal(await page.locator('.game-help').count(),0);
    assert.deepEqual(errors,[]);
  }finally{await context.close();}
});

test('jogo minimalista mostra só a pista, placar essencial e controles em todas as telas', async () => {
  const {context,page,errors}=await open();
  try {
    for(const width of [320,390,768,1024,1440]){
      await page.setViewportSize({width,height:900});
      await page.locator('#runner-canvas').waitFor({state:'visible'});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`sem rolagem horizontal em ${width}`);
      for(const hidden of [
        '.game-hud','.game-itinerary',
        '.game-guide','.game-duration','.game-instructions'
      ]) assert.equal(await page.locator(hidden).isVisible(),false,`${hidden} oculto em ${width}`);
      for(const visible of ['#game-stage-name','#game-progress','#game-score','#game-lives','#game-passports','#runner-canvas','#game-start']){
        assert.equal(await page.locator(visible).isVisible(),true,`${visible} visível em ${width}`);
      }
      const game=await page.locator('#game').boundingBox(), canvas=await page.locator('#runner-canvas').boundingBox();
      assert.ok(canvas.y>game.y && canvas.height>=150,`pista legível em ${width}`);
    }
    await page.getByRole('button',{name:'Começar corrida',exact:true}).click();
    assert.equal(await page.locator('#game-start').isVisible(),false);
    assert.equal(await page.locator('#game-jump').isEnabled(),true);
    assert.equal(await page.locator('#game-pause').count(),0);
    assert.deepEqual(errors,[]);
  }finally{await context.close();}
});


test("HUD do chefe surge pela distância e some ao vencer sem poluir a pista", async () => {
  const {context,page,errors}=await openWithRun();
  try {
    assert.equal(await page.locator('#game-boss').isVisible(),false);
    await page.getByRole('button',{name:'Começar corrida',exact:true}).click();
    await page.evaluate(()=>{
      const run=globalThis.__testRun;
      run.nextBossAt=0;
      run.nextObstacle=run.nextPickup=run.nextPassport=10000;
      run.graceFor=100;
    });
    await page.waitForFunction(()=>document.getElementById('game-boss').hidden===false);
    assert.match(await page.locator('#game-boss-name').textContent(),/(Xandão|Haddad|Lula).*rodada 1/);
    const total=({xandao:'4',haddad:'5',lula:'6'})[await page.locator('#game').getAttribute('data-boss')];
    assert.equal(await page.locator('#game-boss-health').getAttribute('aria-valuenow'),'0');
    assert.equal(await page.locator('#game-boss-health').getAttribute('aria-valuemax'),total);
    assert.match(await page.locator('.game-boss-heading span').textContent(),/CHEFÃO/);
    assert.equal(await page.locator('.game-help').count(),0);
    assert.equal(await page.locator('#runner-canvas').isVisible(),true);
    await page.evaluate(()=>{
      const run=globalThis.__testRun;
      run.boss.fired=run.boss.total;
      run.boss.remaining=1;
      run.obstacles=[{x:45,width:34,height:44,type:'pf',bossAttack:true,counted:false}];
    });
    await page.waitForFunction(()=>document.getElementById('game-boss').hidden===true);
    assert.equal(await page.locator('#game').getAttribute('data-boss'),'none');
    assert.equal(await page.locator('#game').getAttribute('data-run-state'),'running');
    assert.deepEqual(errors,[]);
  }finally{await context.close();}
});

test('os três chefões possuem HUD próprio e a pista permanece utilizável',async()=>{
 const {context,page,errors}=await openWithRun();
 try{
  await page.getByRole('button',{name:'Começar corrida',exact:true}).click();
  for(const type of ['xandao','haddad','lula']){
   await page.evaluate(type=>{const r=globalThis.__testRun;r.boss=null;r.bossBag=[type];r.raid=null;r.nextRaid=Infinity;r.routeDistance=0;r.nextBossAt=0;r.bossCooldown=0;r.graceFor=100;r.obstacles=[];},type);
   await page.waitForFunction(type=>document.getElementById('game').dataset.boss===type,type);
   assert.equal(await page.locator('#game-boss').isVisible(),true);
   assert.equal(await page.locator('#game-jump').isEnabled(),true);
  }assert.deepEqual(errors,[]);
 }finally{await context.close();}
});

test('Escudo das Américas protege por tempo e expiração não guarda um impacto extra',async()=>{
 const {context,page,errors}=await openWithRun();
 try{
  await page.getByRole('button',{name:'Começar corrida',exact:true}).click();
  await page.evaluate(()=>{const r=globalThis.__testRun;r.nextObstacle=1000;r.obstacles=[{x:125,width:34,height:44,type:'pf'}];r.pickups=[{x:136,y:35,type:'shield',value:0}];});
  await page.waitForFunction(()=>document.getElementById('game').dataset.power==='shield');
  assert.equal(await page.locator('#game-lives').textContent(),'1');
  assert.match(await page.locator('#game-power').textContent(),/Escudo das Américas/);
  await page.evaluate(()=>{const r=globalThis.__testRun;r.shieldFor=0;r.graceFor=0;r.obstacles=[{x:125,width:34,height:44,type:'pf'}];});
  await page.waitForFunction(()=>document.getElementById('game').dataset.runState==='over');
  assert.equal(await page.locator('#game-lives').textContent(),'0');assert.deepEqual(errors,[]);
 }finally{await context.close();}
});

test('uma vida extra coletada permite sobreviver exatamente a mais uma colisão', async () => {
  const {context,page,errors}=await openWithRun();
  try {
    await page.getByRole('button',{name:'Começar corrida',exact:true}).click();
    await page.evaluate(()=>{
      const run=globalThis.__testRun;
      run.nextObstacle=run.nextPickup=run.nextPassport=100000;
      run.obstacles=[];
      run.passports=99;
      run.pickups.push({x:136,y:35,type:'passport',value:50});
    });
    await page.waitForFunction(()=>document.getElementById('game-lives').textContent==='2');
    await page.evaluate(()=>{
      const run=globalThis.__testRun;
      run.obstacles=[{x:125,width:34,height:44,type:'pf'}];
    });
    await page.waitForFunction(()=>document.getElementById('game-lives').textContent==='1');
    assert.equal(await page.locator('#game').getAttribute('data-run-state'),'running');
    await page.evaluate(()=>{
      const run=globalThis.__testRun;
      run.graceFor=0;
      run.obstacles=[{x:125,width:34,height:44,type:'pf'}];
    });
    await page.waitForFunction(()=>document.getElementById('game').dataset.runState==='over');
    assert.equal(await page.locator('#game-lives').textContent(),'0');
    assert.deepEqual(errors,[]);
  } finally {await context.close();}
});


test('escudo aparece somente quando ativo, sem munição nem deslocamento da pista',async()=>{
 const {context,page,errors}=await openWithRun();
 try{
  assert.equal(await page.locator('.game-hud').isVisible(),false);
  await page.getByRole('button',{name:'Começar corrida',exact:true}).click();
  const before=await page.locator('#runner-canvas').boundingBox();
  await page.evaluate(()=>{const r=globalThis.__testRun;r.nextObstacle=1000;r.obstacles=[];r.shieldFor=6;});
  await page.waitForFunction(()=>document.getElementById('game').dataset.power==='shield');
  assert.equal(await page.locator('#game-power').isVisible(),true);assert.equal(await page.locator('#game-ammo').isVisible(),false);
  const after=await page.locator('#runner-canvas').boundingBox();assert.ok(Math.abs(before.y-after.y)<1);
  await page.evaluate(()=>{const r=globalThis.__testRun;r.shieldFor=0;});
  await page.waitForFunction(()=>document.getElementById('game').dataset.power==='none');
  assert.equal(await page.locator('.game-hud').isVisible(),false);assert.deepEqual(errors,[]);
 }finally{await context.close();}
});

test('movimento reduzido retira animações decorativas sem paralisar a corrida', async () => {
  const {context,page,errors} = await openWithRun({reducedMotion:'reduce'});
  try {
    assert.equal(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches), true);
    await page.evaluate(() => {
      const originalSin = Math.sin;
      globalThis.__decorativeSinCalls = 0;
      Math.sin = function (...args) {
        globalThis.__decorativeSinCalls++;
        return originalSin.apply(this,args);
      };
    });
    await page.getByRole('button',{name:'Começar corrida',exact:true}).click();
    await page.evaluate(() => {
      const run = globalThis.__testRun;
      run.nextObstacle=run.nextPickup=run.nextPassport=run.nextPower=10000;
      run.obstacles=[{x:480,width:34,height:44,type:'pf'}];
      run.graceFor=15;
    });
    await page.waitForTimeout(300);
    assert.ok(Number(await page.locator('#game-score').textContent()) > 0);
    assert.equal(await page.evaluate(() => globalThis.__decorativeSinCalls),0,
      'sem movimento senoidal do personagem e adversários');
    await page.evaluate(() => {
      const run=globalThis.__testRun;
      run.nextBossAt=0;
      run.bossCooldown=0;
    });
    await page.waitForFunction(() => document.getElementById('game-boss').hidden === false);
    await page.waitForTimeout(150);
    assert.equal(await page.evaluate(() => globalThis.__decorativeSinCalls),0,
      'o chefe também não oscila em movimento reduzido');
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.waitForFunction(() => globalThis.__decorativeSinCalls > 0);
    assert.equal(await page.locator('#game').getAttribute('data-run-state'),'running');
    assert.deepEqual(errors,[]);
  } finally { await context.close(); }
});

test('Flávio não atira, e o botão Abaixar permite desviar no celular',async()=>{
 const {context,page,errors}=await openWithRun({viewport:{width:390,height:844}});
 try{
  await page.getByRole('button',{name:'Começar corrida',exact:true}).click();
  await page.evaluate(()=>{
   const r=globalThis.__testRun;r.nextBossAt=0;r.nextRaid=Infinity;
   r.nextObstacle=r.nextPickup=r.nextPassport=r.nextPower=1e8;
   r.graceFor=25;
  });
  await page.waitForFunction(()=>document.getElementById('game-boss').hidden===false);
  assert.equal(await page.locator('#game-crouch').isVisible(),true);
  assert.equal(await page.locator('#game-crouch').isEnabled(),true);
  assert.equal(await page.locator('#game-jump').isEnabled(),true);
  assert.equal(await page.locator('#game-ammo').isVisible(),false);
  assert.equal(await page.evaluate(()=>Object.prototype.hasOwnProperty.call(globalThis.__testRun,'shots')),false);
  await page.locator('#game-crouch').dispatchEvent('pointerdown',{button:0,pointerId:1});
  await page.waitForFunction(()=>globalThis.__testRun.player.crouching);
  assert.equal(await page.locator('#game-crouch').getAttribute('aria-pressed'),'true');
  await page.locator('#game-crouch').dispatchEvent('pointerup',{pointerId:1});
  await page.waitForFunction(()=>!globalThis.__testRun.player.crouching);
  assert.equal(await page.locator('#game').getAttribute('data-run-state'),'running');
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});

test('fusão de paisagens e aviso de destino sem perder a jogabilidade', async () => {
  const {context,page,errors}=await openWithRun();
  try {
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.getByRole('button',{name:'Começar corrida',exact:true}).click();
    await page.evaluate(()=>{
      const run=globalThis.__testRun;
      run.nextObstacle=run.nextPickup=run.nextPassport=run.nextPower=1e8;
      run.bossCooldown=1e8;
      run.shieldFor=100;
    });
    const sample=async elapsed=>{
      await page.evaluate(elapsed=>{globalThis.__testRun.routeDistance=elapsed*350;},elapsed);
      await page.waitForTimeout(95);
      return page.evaluate(()=>{
        const c=document.getElementById('runner-canvas');
        const ctx=c.getContext('2d');
        const x=Math.round(c.width*10/Math.min(900,Math.max(480,Math.round(c.getBoundingClientRect().width*1.15))));
        const y=Math.round(c.height*105/300);
        return [...ctx.getImageData(x,y,1,1).data].slice(0,3);
      });
    };
    const argentina=await sample(57.5);
    assert.equal(await page.locator('#game-transition').isVisible(),false);
    const halfway=await sample(60);
    assert.equal(await page.locator('#game-transition').isVisible(),true);
    assert.match(await page.locator('#game-transition-name').textContent(),/Flórida/);
    const transitionWidth=await page.locator('#game-transition-progress').evaluate(el=>parseFloat(el.style.width));
    assert.ok(transitionWidth>=48 && transitionWidth<=65, `transição visível: ${transitionWidth}%`);
    const florida=await sample(62.5);
    assert.equal(await page.locator('#game-transition').isVisible(),false);
    // Uma fusão real da cor do céu entre dois destinos (não uma troca abrupta).
    for(let i=0;i<3;i++){
      const low=Math.min(argentina[i],florida[i]), high=Math.max(argentina[i],florida[i]);
      assert.ok(halfway[i]>=low-2 && halfway[i]<=high+2,
        `canal ${i}: ${argentina}, ${halfway}, ${florida}`);
    }
    assert.notDeepEqual(halfway,argentina);
    assert.notDeepEqual(halfway,florida);
    assert.equal(await page.locator('#game').getAttribute('data-run-state'),'running');
    assert.equal(await page.locator('#game-jump').isEnabled(),true);
    assert.deepEqual(errors,[]);
  } finally {await context.close();}
});

test('movimento reduzido mantém mudança de destino acessível', async () => {
  const {context,page,errors}=await openWithRun({reducedMotion:'reduce'});
  try{
    await page.getByRole('button',{name:'Começar corrida',exact:true}).click();
    await page.evaluate(()=>{
      const run=globalThis.__testRun;
      run.nextObstacle=run.nextPickup=run.nextPassport=run.nextPower=1e8;
      run.bossCooldown=1e8;
      run.shieldFor=100;
      run.routeDistance=4750;run.nextBossAt=run.nextRaid=Infinity;
    });
    await page.waitForFunction(()=>document.getElementById('game-transition').hidden===false);
    assert.match(await page.locator('#game-transition-name').textContent(),/Rio/);
    assert.equal(await page.locator('#game').getAttribute('data-run-state'),'running');
    assert.deepEqual(errors,[]);
  }finally{await context.close();}
});

test('som é opcional e falha de áudio não impede iniciar ou pular',async()=>{
 const {context,page,errors}=await open({},()=>{
  Object.defineProperty(window,'AudioContext',{value:undefined,configurable:true});
  Object.defineProperty(window,'webkitAudioContext',{value:undefined,configurable:true});
  Object.defineProperty(window,'SpeechSynthesisUtterance',{value:undefined,configurable:true});
 });
 try{
  const sound=page.locator('#game-sound');assert.equal(await sound.getAttribute('aria-pressed'),'true');
  await sound.click();assert.equal(await sound.getAttribute('aria-pressed'),'false');
  await sound.click();assert.equal(await sound.getAttribute('aria-pressed'),'true');
  await page.getByRole('button',{name:'Começar corrida',exact:true}).click();
  await page.locator('#game-jump').click();assert.equal(await page.locator('#game-jump').isEnabled(),true);
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});
test('Joice anuncia evento com legenda e fonte, encerra e não muda a posição da pista',async()=>{
 const {context,page,errors}=await openWithRun({viewport:{width:320,height:900},isMobile:true,hasTouch:true});
 try{
  await page.getByRole('button',{name:'Começar corrida',exact:true}).tap();
  const before=await page.locator('#runner-canvas').boundingBox();
  await page.evaluate(()=>{const r=globalThis.__testRun;r.nextRaid=0;r.nextBossAt=Infinity;r.nextObstacle=1000;r.obstacles=[];r.graceFor=100;});
  await page.waitForFunction(()=>document.getElementById('game').dataset.raid==='warning');
  assert.match(await page.locator('#game-raid-source').textContent(),/Joice Hasselmann/);
  assert.match(await page.locator('#game-raid-copy').textContent(),/Toc/);
  await page.evaluate(()=>{globalThis.__testRun.raid.remaining=.01;});
  await page.waitForFunction(()=>document.getElementById('game').dataset.raid==='active');
  assert.match(await page.locator('#game-raid-title').textContent(),/POLÍCIA FEDERAL/);
  assert.match(await page.locator('#game-raid-source').getAttribute('href'),/^https:\/\/(www\.mprj\.mp\.br|portal\.stf\.jus\.br)\//);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  const after=await page.locator('#runner-canvas').boundingBox();assert.ok(Math.abs(before.y-after.y)<1);
  await page.evaluate(()=>{globalThis.__testRun.raid.remaining=.01;});
  await page.waitForFunction(()=>document.getElementById('game').dataset.raid==='recovery');
  await page.evaluate(()=>{globalThis.__testRun.raid.remaining=.01;});
  await page.waitForFunction(()=>document.getElementById('game-raid').hidden);
  assert.equal(await page.locator('#game-jump').isEnabled(),true);assert.deepEqual(errors,[]);
 }finally{await context.close();}
});
test('ocultar a página interrompe a narração da Joice e congela seu evento',async()=>{
 const {context,page,errors}=await openWithRun({},()=>{
  window.__narrationActive=false;
  window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};
  Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{
   getVoices:()=>[{name:'Voz local de teste',lang:'pt-BR',localService:true}],
   speak:()=>{window.__narrationActive=true;},cancel:()=>{window.__narrationActive=false;}
  }});
 });
 try{
  await page.getByRole('button',{name:'Começar corrida',exact:true}).click();
  await page.evaluate(()=>{const r=globalThis.__testRun;r.nextBossAt=Infinity;r.nextObstacle=1000;r.obstacles=[];r.raid={phase:'active',remaining:8,factIndex:0,id:1};});
  await page.waitForFunction(()=>window.__narrationActive);
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
  assert.equal(await page.evaluate(()=>window.__narrationActive),false);
  const remaining=await page.evaluate(()=>globalThis.__testRun.raid.remaining);
  await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>globalThis.__testRun.raid.remaining),remaining);
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});
test('quadros de 300 ms continuam avançando a corrida em aparelho lento',async()=>{
 const {context,page,errors}=await openWithRun({},()=>{
  const native=window.requestAnimationFrame.bind(window);let timestamp=performance.now();
  window.requestAnimationFrame=callback=>native(()=>{timestamp+=300;callback(timestamp);});
 });
 try{
  await page.getByRole('button',{name:'Começar corrida',exact:true}).click();
  await page.waitForFunction(()=>document.getElementById('game-score').textContent!=='0000',null,{timeout:3000});
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});
test('tocar em Pular retoma corrida que perdeu foco sem exigir recarregar',async()=>{
 const {context,page,errors}=await openWithRun();
 try{
  await page.getByRole('button',{name:'Começar corrida',exact:true}).click();
  await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
  const before=Number(await page.locator('#game-score').textContent());
  await page.locator('#game-jump').click();
  await page.waitForFunction(before=>Number(document.getElementById('game-score').textContent)>before,before,{timeout:2500});
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});
test('falha nos desenhos impede partida invisível e oferece nova tentativa',async()=>{
 const {context,page,errors}=await open();
 try{
  await context.route('**/assets/*.webp*',route=>route.abort());
  await page.reload();
  await page.getByRole('button',{name:'Tentar carregar desenhos',exact:true}).waitFor({state:'visible',timeout:10000});
  assert.equal(await page.locator('#game').getAttribute('data-run-state'),'ready');
  assert.match(await page.locator('#game-loading-note').textContent(),/não carregaram/);
  await context.unroute('**/assets/*.webp*');
  await page.getByRole('button',{name:'Tentar carregar desenhos',exact:true}).click();
  await page.getByRole('button',{name:'Começar corrida',exact:true}).waitFor({state:'visible',timeout:10000});
  await page.getByRole('button',{name:'Começar corrida',exact:true}).click();
  assert.equal(await page.locator('#game').getAttribute('data-run-state'),'running');assert.deepEqual(errors,[]);
 }finally{await context.close();}
});
test('um toque não duplica o salto entre pointerdown e click de compatibilidade',async()=>{
 const {context,page,errors}=await openWithRun({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 try{
  await page.getByRole('button',{name:'Começar corrida',exact:true}).tap();
  await page.locator('#game-jump').tap();
  await page.waitForFunction(()=>globalThis.__testRun.player.y>0);
  assert.equal(await page.locator('#game').getAttribute('data-run-state'),'running');
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});

test('cabeçalho simplificado e sem playlist em celular e desktop',async()=>{
 const {context,page,errors}=await open({viewport:{width:320,height:820}});
 try{
  assert.equal(await page.locator('.site-header nav').count(),0);
  assert.equal(await page.locator('#titulo').isVisible(),true);
  assert.equal(await page.locator('#musicas, .music-catalog, .music-collection, .music-memes, #music-native, #music-toggle, #game-playlist-frame, [data-election-track]').count(),0);
  assert.equal(await page.locator('#share').count(),1);
  assert.equal(await page.locator('#game-sound').count(),1,'efeitos do jogo continuam opcionais');
  assert.equal(await page.locator('#runner-canvas').isVisible(),true);
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:820});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`sem rolagem horizontal em ${width}`);
  }
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});
