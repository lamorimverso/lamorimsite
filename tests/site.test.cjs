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

test('teclado inicia, pausa, retoma e contador continua funcionando', async () => {
  const {context,page,errors} = await open();
  try {
    const start = page.getByRole('button', {name:'Começar corrida',exact:true});
    await start.waitFor({state:'visible',timeout:1500});
    await start.click();
    await page.waitForTimeout(350);
    assert.ok(Number(await page.locator('#game-score').textContent()) > 0);
    await page.locator('#runner-canvas').press('KeyP');
    await page.getByRole('button',{name:'Continuar corrida',exact:true}).waitFor();
    const score = await page.locator('#game-score').textContent();
    await page.waitForTimeout(250);
    assert.equal(await page.locator('#game-score').textContent(),score);
    await page.getByRole('button',{name:'Continuar corrida',exact:true}).click();
    await page.locator('#runner-canvas').press('Space');
    assert.equal(await page.getByRole('button',{name:'Pausar corrida',exact:true}).isEnabled(),true);
    assert.equal(await page.locator('.sources summary').isVisible(),true);
    assert.equal(await page.locator('#music-toggle').isVisible(),true);
    assert.deepEqual(errors,[]);
  } finally { await context.close(); }
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

test('sair da aba pausa a partida e exige retomada explícita', async () => {
  const {context,page} = await open();
  try {
    await page.getByRole('button',{name:'Começar corrida',exact:true}).click({timeout:1500});
    await page.evaluate(() => {
      Object.defineProperty(document,'hidden',{configurable:true,value:true});
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.getByRole('button',{name:'Continuar corrida',exact:true}).waitFor();
    const score = await page.locator('#game-score').textContent();
    await page.waitForTimeout(200);
    assert.equal(await page.locator('#game-score').textContent(),score);
  } finally { await context.close(); }
});

test('Espaço abre as instruções expansíveis sem iniciar nem reiniciar a corrida', async () => {
  const {context,page} = await open();
  try {
    await page.locator('.game-guide summary').focus();
    await page.locator('.game-guide summary').press('Space');
    assert.equal(await page.locator('.game-guide').getAttribute('open'),'');
    assert.equal(await page.locator('#game').getAttribute('data-run-state'),'ready');
    await page.getByRole('button',{name:'Começar corrida',exact:true}).click();
    await page.getByRole('button',{name:'Pausar corrida',exact:true}).click();
    const score=await page.locator('#game-score').textContent();
    await page.locator('.game-guide summary').press('Space');
    assert.equal(await page.locator('#game').getAttribute('data-run-state'),'paused');
    assert.equal(await page.locator('#game-score').textContent(),score);
  } finally { await context.close(); }
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
    await page.waitForFunction(() => document.getElementById('audio-status').textContent.includes('Não foi possível carregar'));
    assert.equal(await page.locator('#music-panel').isVisible(),false);
    assert.equal(await page.locator('#music-toggle').isDisabled(),true);
    assert.equal(await page.locator('#music-toggle').textContent(),'Música indisponível');
    assert.equal(await page.getByRole('button',{name:'Começar corrida',exact:true}).isEnabled(),true);
    assert.deepEqual(errors,[]);
  } finally { await context.close(); }
});

test('captura pela PF encerra a corrida e reinício limpa o placar e vantagens', async () => {
  const {context,page,errors} = await open();
  try {
    await page.getByRole('button',{name:'Começar corrida',exact:true}).click();
    await page.waitForFunction(() => document.getElementById('game').dataset.runState === 'over', undefined, {timeout:8000});
    assert.match(await page.locator('#game-overlay-title').textContent(), /Pego pela Polícia Federal/);
    assert.equal(await page.getByRole('button',{name:'Pular',exact:true}).isDisabled(),true);
    await page.getByRole('button',{name:'Tentar de novo',exact:true}).click();
    assert.equal(await page.locator('#game').getAttribute('data-run-state'),'running');
    assert.match(await page.locator('#game-threat').textContent(), /Polícia Federal/);
    assert.match(await page.locator('#game-power').textContent(), /Sem efeito/);
    assert.match(await page.locator('#game-chance').textContent(), /0/);
    assert.deepEqual(errors,[]);
  } finally { await context.close(); }
});

test('coletar invisibilidade atualiza o HUD e pausa conserva seu tempo', async () => {
  // A semente fixa controla itens/intervalos; o motor, a física e os controles são reais.
  const {context,page,errors} = await open({}, () => { Math.random = () => .5; });
  try {
    await page.locator('#game').scrollIntoViewIfNeeded();
    const clockStart = new Date('2026-10-27T16:00:00Z');
    await page.clock.install({time:clockStart});
    await page.clock.pauseAt(new Date(clockStart.getTime()+1000));
    await page.getByRole('button',{name:'Começar corrida',exact:true}).click();
    // Com esta semente, os oponentes cruzam o jogador em ~4,2 s e ~6 s.
    await page.clock.runFor(3900);
    await page.locator('#runner-canvas').press('Space');
    await page.clock.runFor(1750);
    await page.locator('#runner-canvas').press('Space');
    await page.clock.runFor(1200);
    // A segunda coleta (invisibilidade) chega perto de 7,2 s.
    await page.locator('#runner-canvas').press('Space');
    await page.clock.runFor(500);
    assert.match(await page.locator('#game-power').textContent(), /Invisível/, await page.locator('#game-status').textContent());
    await page.locator('#runner-canvas').press('KeyP');
    const remaining = await page.locator('#game-power').textContent();
    await page.clock.runFor(4000);
    assert.equal(await page.locator('#game-power').textContent(),remaining);
    assert.deepEqual(errors,[]);
  } finally { await context.close(); }
});
