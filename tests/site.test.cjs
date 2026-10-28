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
      const type = {'.html':'text/html', '.css':'text/css', '.mjs':'text/javascript', '.webp':'image/webp'}[path.extname(file)] || 'application/octet-stream';
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
async function openWithRun(options = {}) {
  const context = await browser.newContext(options);
  await context.route(/^https:\/\//, route => route.abort());
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
    await page.locator('.sources summary').click();
    assert.equal(await page.getByRole('heading',{name:'Atenção: ressalva jurídica'}).isVisible(),true);
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

test('falha da música não deixa um quadro vazio na página', async () => {
  const {context,page,errors} = await open();
  try {
    assert.equal(await page.locator('#music-panel').isVisible(),false);
    await page.getByRole('button',{name:'▶ Tocar música',exact:true}).click();
    await page.waitForFunction(() => document.getElementById('audio-status').textContent.includes('Não foi possível carregar'));
    assert.equal(await page.locator('#music-panel').isVisible(),false);
    assert.equal(await page.locator('#music-toggle').isDisabled(),true);
    assert.equal(await page.locator('#music-toggle').textContent(),'Música indisponível');
    assert.equal(await page.getByRole('button',{name:'Começar corrida',exact:true}).isEnabled(),true);
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
      run.invisibleFor=0;
      run.extraChance=false;
      run.nextObstacle=run.nextPickup=run.nextPassport=1000;
      run.obstacles=[{x:125,width:34,height:44,type:'pf'}];
    });
    await page.waitForFunction(() => document.getElementById('game').dataset.runState === 'over');
    assert.match(await page.locator('#game-overlay-title').textContent(), /Bateu, perdeu!/);
    assert.equal(await page.locator('#game-lives').textContent(),'0');
    await page.getByRole('button',{name:'Tentar de novo',exact:true}).click();
    assert.equal(await page.locator('#game').getAttribute('data-run-state'),'running');
    assert.equal(await page.locator('#game-lives').textContent(),'1');
    assert.equal(await page.locator('#game-passports').textContent(),'0');
    assert.match(await page.locator('#game-threat').textContent(), /Polícia Federal/);
    assert.match(await page.locator('#game-power').textContent(), /Sem efeito/);
    assert.match(await page.locator('#game-chance').textContent(), /0/);
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
      run.pickups.push({x:136,y:35,type:'invisible',value:0});
    });
    await page.waitForFunction(()=>/Invisível/.test(document.getElementById('game-power').textContent));
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
    await page.waitForFunction(()=>globalThis.__testRun.invisibleFor<5.5);
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
      run.elapsed=85;
      run.distance=90000;
      run.invisibleFor=1000;
      run.obstacles=[];
    });
    await page.waitForFunction(() => document.getElementById('game-stage-name').textContent === 'Casa Branca');
    assert.match(await page.locator('#game-difficulty').textContent(),/Risco/);
    assert.equal(await page.locator('#game-phase').textContent(),'Cenário 5 de 5');
    assert.equal(await page.locator('#game-progress').isVisible(),false);
    assert.equal(await page.locator('#game').getAttribute('data-run-state'),'running');
    assert.deepEqual(errors,[]);
  } finally { await context.close(); }
});

test('interface clean destaca retrato e percentual no celular e desktop', async () => {
  const {context,page,errors} = await open();
  try {
    for (const width of [320,390,768,1440]) {
      await page.setViewportSize({width,height:900});
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `overflow em ${width}px`);
      const counter = await page.locator('.counter').boundingBox();
      const portrait = await page.locator('.progress-ring').boundingBox();
      assert.ok(counter && portrait);
      assert.ok(portrait.y < counter.y, `retrato em destaque antes da contagem em ${width}px`);
      assert.ok(portrait.width >= 190, `retrato legível em ${width}px`);
      const play = await page.locator('.hero-play').boundingBox();
      assert.ok(play.height >= 44 && play.width >= 44);
      assert.equal(await page.locator('.game-itinerary').evaluate(x => x.open),false);
      assert.equal(await page.locator('.game-help').evaluate(x => x.open),false);
      const game = await page.locator('#runner-canvas').boundingBox();
      const stage = await page.locator('.game-topline').boundingBox();
      assert.ok(stage.y < game.y, `HUD e cenário devem anteceder a pista em ${width}px`);
    }
    await page.locator('.hero-play').click();
    assert.ok(await page.locator('#game').isVisible());
    assert.equal(await page.locator('#music-toggle').count(),1);
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
        return {hero:{x:hero.x,width:hero.width},game:{x:game.x,width:game.width},counterY:counter.y,photoY:photo.y,viewportWidth:viewport.width,viewportHeight:viewport.height,overflow:document.documentElement.scrollWidth>innerWidth};
      });
      assert.equal(geometry.overflow,false,`overflow na largura ${width}`);
      assert.equal(await page.locator('.site-header .nav-game').isVisible(),true,`link do jogo oculto em ${width}px`);
      assert.ok(geometry.hero.width <= 540,`hero não deve virar grade desktop em ${width}: ${geometry.hero.width}`);
      assert.ok(Math.abs(geometry.hero.width-geometry.game.width)<3,`larguras das seções incoerentes: ${width}`);
      assert.ok(Math.abs(geometry.hero.x-geometry.game.x)<3,`colunas desalinhadas: ${width}`);
      assert.ok(geometry.photoY < geometry.counterY,`retrato deve anteceder contagem: ${width}`);
      assert.ok(geometry.viewportWidth >= 240 && geometry.viewportHeight >= 150,`pista legível em ${width}: ${JSON.stringify({w:geometry.viewportWidth,h:geometry.viewportHeight})}`);
      assert.equal(await page.locator('.game-itinerary').evaluate(e=>e.open),false);
      assert.equal(await page.locator('.game-help').evaluate(e=>e.open),false);
      assert.equal(await page.locator('.game-guide').evaluate(e=>e.open),false);
    }
    assert.equal(await page.locator('#game').getAttribute('data-chance'),'none');
    assert.equal(await page.locator('.game-hud .power-chip').isVisible(),false);
    assert.equal(await page.locator('.game-hud .chance-chip').isVisible(),false);
    assert.equal(await page.locator('#game-stage-name').isVisible(),false);
    assert.equal(await page.locator('#game-lives').isVisible(),true);
    assert.equal(await page.locator('#game-passports').isVisible(),true);
    assert.equal(await page.locator('.sources summary').isVisible(),true);
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
          stylesheet:[...document.styleSheets].some(x=>x.href?.includes('minimal.css'))
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
      assert.ok(Math.abs(v.hero.x-v.game.x)<3,`seções alinhadas em ${width}px`);
      assert.ok(v.portrait.y<v.counter.y,`retrato deve vir primeiro em ${width}px`);
      assert.ok(v.button.height>=44,`CTA tocável em ${width}px`);
    }
    assert.equal(await page.locator('#music-toggle').count(),1);
    assert.equal(await page.locator('#share').count(),1);
    assert.equal(await page.locator('.sources').evaluate(x=>x.open),false);
    assert.equal(await page.locator('.game-help').evaluate(x=>x.open),false);
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
        '.game-stage-header','.game-hud','.game-itinerary','.game-help',
        '.game-guide','.game-duration','.route-meter','.game-instructions'
      ]) assert.equal(await page.locator(hidden).isVisible(),false,`${hidden} oculto em ${width}`);
      for(const visible of ['#game-score','#game-lives','#game-passports','#runner-canvas','#game-start']){
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


test("HUD do chefe surge por pontuação e some ao vencer sem poluir a pista", async () => {
  const {context,page,errors}=await openWithRun();
  try {
    assert.equal(await page.locator('#game-boss').isVisible(),false);
    await page.getByRole('button',{name:'Começar corrida',exact:true}).click();
    await page.evaluate(()=>{
      const run=globalThis.__testRun;
      run.bonus=1500;
      run.nextObstacle=run.nextPickup=run.nextPassport=10000;
      run.graceFor=100;
    });
    await page.waitForFunction(()=>document.getElementById('game-boss').hidden===false);
    assert.match(await page.locator('#game-boss-name').textContent(),/Polícia Federal.*Nível 1/);
    assert.equal(await page.locator('#game-boss-health').getAttribute('aria-valuenow'),'6');
    assert.equal(await page.locator('#game-boss-health').getAttribute('aria-valuemax'),'6');
    assert.equal(await page.locator('.game-help').isVisible(),false);
    assert.equal(await page.locator('#runner-canvas').isVisible(),true);
    await page.evaluate(()=>{
      const run=globalThis.__testRun;
      run.boss.fired=run.boss.total;
      run.boss.remaining=1;
      run.boss.health=0;
      run.shots=[];
      run.obstacles=[{x:45,width:34,height:44,type:'pf',bossAttack:true,counted:false}];
    });
    await page.waitForFunction(()=>document.getElementById('game-boss').hidden===true);
    assert.equal(await page.locator('#game').getAttribute('data-boss'),'none');
    assert.equal(await page.locator('#game').getAttribute('data-run-state'),'running');
    assert.deepEqual(errors,[]);
  }finally{await context.close();}
});

test("os novos chefes aparecem no HUD sem mudar o visual limpo da página", async () => {
  const {context,page,errors}=await openWithRun();
  try {
    await page.getByRole('button',{name:'Começar corrida',exact:true}).click();
    for(const [index,name] of [[4,"Fernando Haddad"],[5,"Guilherme Boulos"],[6,"Flávio Dino"],[7,"Lula"]]){
      await page.evaluate(index=>{
        const run=globalThis.__testRun;
        run.boss=null;
        run.obstacles=[];
        run.bossesDefeated=index;
        run.nextBossScore=(index+1)*1500;
        run.bonus=(index+1)*1500;
        run.bossCooldown=0;
        run.graceFor=500;
        run.nextObstacle=run.nextPickup=run.nextPassport=100000;
      },index);
      await page.waitForFunction(name=>document.getElementById('game-boss-name').textContent.includes(name),name);
      assert.equal(await page.locator('#game-boss').isVisible(),true);
      assert.equal(await page.locator('.game-help').isVisible(),false);
      assert.equal(await page.locator('.game-itinerary').isVisible(),false);
      assert.equal(await page.locator('#runner-canvas').isVisible(),true);
    }
    assert.equal(await page.locator('#game').getAttribute('data-boss'),'lula');
    assert.deepEqual(errors,[]);
  }finally{await context.close();}
});

test('escudo coletado protege da primeira colisão; a segunda encerra o jogo', async () => {
  const {context,page,errors}=await openWithRun();
  try {
    await page.getByRole('button',{name:'Começar corrida',exact:true}).click();
    await page.evaluate(()=>{
      const run=globalThis.__testRun;
      run.nextObstacle=run.nextPickup=run.nextPassport=100000;
      run.obstacles=[{x:125,width:34,height:44,type:'pf'}];
      run.pickups.push({x:136,y:35,type:'chance',value:0});
    });
    await page.waitForFunction(()=>globalThis.__testRun.saves===1);
    assert.equal(await page.locator('#game').getAttribute('data-run-state'),'running');
    assert.equal(await page.locator('#game-lives').textContent(),'1');
    await page.evaluate(()=>{
      const run=globalThis.__testRun;
      run.graceFor=0;
      run.obstacles=[{x:125,width:34,height:44,type:'pf'}];
    });
    await page.waitForFunction(()=>document.getElementById('game').dataset.runState==='over');
    assert.match(await page.locator('#game-overlay-title').textContent(),/Bateu, perdeu!/);
    assert.deepEqual(errors,[]);
  } finally {await context.close();}
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


test('escudo e invisibilidade aparecem somente quando ativos, sem deslocar a pista', async () => {
  const {context,page,errors}=await openWithRun();
  try {
    assert.equal(await page.locator('.game-hud').isVisible(),false);
    await page.getByRole('button',{name:'Começar corrida',exact:true}).click();
    const before=await page.locator('#runner-canvas').boundingBox();
    await page.evaluate(()=>{
      const run=globalThis.__testRun;
      run.nextObstacle=run.nextPassport=run.nextPickup=run.nextPower=10000;
      run.obstacles=[];
      run.extraChance=true;
    });
    await page.waitForFunction(()=>document.getElementById('game').dataset.chance==='held');
    assert.equal(await page.locator('#game-chance').isVisible(),true);
    assert.equal(await page.locator('#game-power').isVisible(),false);
    const after=await page.locator('#runner-canvas').boundingBox();
    assert.ok(Math.abs(before.y-after.y)<1, 'placar de poder não desloca a pista');
    await page.evaluate(()=>{globalThis.__testRun.extraChance=false;globalThis.__testRun.invisibleFor=6;});
    await page.waitForFunction(()=>document.getElementById('game').dataset.power==='invisible');
    assert.equal(await page.locator('#game-power').isVisible(),true);
    assert.equal(await page.locator('#game-chance').isVisible(),false);
    assert.deepEqual(errors,[]);
  } finally {await context.close();}
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
      run.bonus=1500;
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

test('armas caricaturais aparecem durante chefes sem impedir o salto', async () => {
  const {context,page,errors}=await openWithRun();
  try {
    await page.getByRole('button',{name:'Começar corrida',exact:true}).click();
    await page.evaluate(()=>{
      const run=globalThis.__testRun;
      run.bonus=1500;
      run.nextObstacle=run.nextPickup=run.nextPassport=run.nextPower=10000;
      run.graceFor=30;
    });
    await page.waitForFunction(()=>document.getElementById('game-boss').hidden===false);
    assert.equal(await page.locator('#game-pause').count(),0);
    await page.waitForFunction(()=>globalThis.__testRun.boss.shotsFired>=3,null,{timeout:10000});
    assert.match(await page.locator('#game-boss-weapon').textContent(),/Bíblia evangélica/);
    assert.ok(await page.evaluate(()=>globalThis.__testRun.boss.health<globalThis.__testRun.boss.maxHealth));
    assert.equal(await page.locator('#game').getAttribute('data-run-state'),'running');
    assert.deepEqual(errors,[]);
  }finally{await context.close();}
});
