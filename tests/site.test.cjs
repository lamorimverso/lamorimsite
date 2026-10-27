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

test('a contagem completa aparece na primeira tela do celular', async () => {
  for (const viewport of [{width:320,height:568},{width:390,height:844}]) {
    const {context,page} = await open({viewport,hasTouch:true,isMobile:true});
    try {
      const counter = await page.locator('.counter').boundingBox();
      assert.ok(counter.y + counter.height <= viewport.height, `Contador abaixo da primeira tela em ${viewport.width}px`);
      assert.ok(counter.y >= 0);
    } finally { await context.close(); }
  }
});

test('controles de toque são legíveis e Recomeçar fica abaixo de Pular', async () => {
  const {context,page} = await open({viewport:{width:320,height:700},hasTouch:true,isMobile:true});
  try {
    const start = page.getByRole('button',{name:'Começar corrida',exact:true});
    const startSize = await start.boundingBox();
    assert.ok(startSize.height >= 44);
    assert.ok(await start.evaluate(button => parseFloat(getComputedStyle(button).fontSize)) >= 14);
    await start.tap();
    const jump = page.getByRole('button',{name:'Pular',exact:true});
    const jumpSize = await jump.boundingBox();
    const restartSize = await page.locator('#game-start').boundingBox();
    assert.ok(jumpSize.width >= 44 && jumpSize.height >= 44);
    assert.ok(await jump.evaluate(button => parseFloat(getComputedStyle(button).fontSize)) >= 14);
    assert.ok(jumpSize.y + jumpSize.height <= restartSize.y, 'Recomeçar deve ficar separado da ação de pular');
    await jump.tap();
    assert.equal(await page.locator('#game').getAttribute('data-run-state'),'running');
  } finally { await context.close(); }
});

test('o primeiro Tab permite pular a navegação e alcançar o conteúdo', async () => {
  const {context,page} = await open();
  try {
    await page.keyboard.press('Tab');
    assert.equal(await page.locator(':focus').textContent(),'Ir para o conteúdo');
    await page.keyboard.press('Enter');
    assert.equal(await page.locator(':focus').getAttribute('id'),'conteudo');
  } finally { await context.close(); }
});

test('a corrida troca os cinco cenários sem encerrar nem reiniciar o placar', async () => {
  const context = await browser.newContext();
  await context.route(/^https:\/\//,route=>route.abort());
  // Captura o estado real apenas no teste, sem adicionar uma API de teste ao produto.
  const source = await fs.readFile(path.resolve(__dirname,'../tanahoraflavio/runner-core.mjs'),'utf8');
  await context.route('**/runner-core.mjs*',route=>route.fulfill({contentType:'text/javascript',body:source+'\nconst realCreateRun=createRun; createRun=()=>{const run=realCreateRun();globalThis.__testRun=run;return run;};'}));
  const page = await context.newPage();
  try {
    await page.goto(base);
    await page.locator('#game-stage-name').waitFor({state:'visible',timeout:1500});
    assert.equal(await page.locator('#game-stage-name').textContent(),'Brasília');
    assert.equal(await page.locator('[data-stage]').count(),5);
    await page.getByRole('button',{name:'Começar corrida',exact:true}).click();
    await page.waitForFunction(()=>Number(document.getElementById('game-score').textContent)>0);
    for (const [elapsed,phase,name,next] of [[20.01,'Cenário 2 de 5','Rio de Janeiro','Argentina'],[40.01,'Cenário 3 de 5','Argentina','Flórida'],[60.01,'Cenário 4 de 5','Flórida','Casa Branca'],[80.01,'Cenário 5 de 5','Casa Branca','Corrida contínua'],[120.01,'Cenário 5 de 5','Casa Branca','Corrida contínua']]) {
      await page.evaluate(seconds=>{globalThis.__testRun.elapsed=seconds;globalThis.__testRun.obstacles=[];globalThis.__testRun.nextObstacle=2;},elapsed);
      await page.waitForFunction(expected=>document.getElementById('game-stage-name').textContent===expected,name);
      assert.equal(await page.locator('#game-phase').textContent(),phase);
      assert.ok((await page.locator('#game-stage-time').textContent()).includes(next));
      assert.ok((await page.locator('#game-status').textContent()).includes(phase));
      assert.equal(await page.locator('#game').getAttribute('data-run-state'),'running');
      assert.ok(Number(await page.locator('#game-score').textContent()) > 0);
      assert.equal(await page.locator('#game-progress').isVisible(),elapsed < 80);
    }
  } finally { await context.close(); }
});

test('Espaço e Enter abrem a ajuda sem iniciar o jogo', async () => {
  const {context,page} = await open();
  try {
    const summary = page.locator('.game-help summary');
    await summary.focus();
    await page.keyboard.press('Space');
    assert.equal(await page.locator('.game-help').evaluate(details=>details.open),true);
    assert.equal(await page.locator('#game').getAttribute('data-run-state'),'ready');
    await page.keyboard.press('Space');
    assert.equal(await page.locator('.game-help').evaluate(details=>details.open),false);
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('.game-help').evaluate(details=>details.open),true);
    assert.equal(await page.locator('#game').getAttribute('data-run-state'),'ready');
  } finally { await context.close(); }
});

test('Tab percorre Pular, Pausar e Recomeçar na ordem visual durante a corrida', async () => {
  const {context,page} = await open();
  try {
    await page.getByRole('button',{name:'Começar corrida',exact:true}).click();
    for (const id of ['game-jump','game-pause','game-start']) {
      await page.keyboard.press('Tab');
      assert.equal(await page.locator(':focus').getAttribute('id'),id);
    }
  } finally { await context.close(); }
});
