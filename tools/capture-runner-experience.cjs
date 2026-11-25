// Replays full, independent versions of the game in headless Chrome.
// All synthetic stepping is inserted in a response intercepted by this tool.
const {mkdir,readFile,writeFile}=require('node:fs/promises');
const {extname,resolve,sep}=require('node:path');
const {execFileSync}=require('node:child_process');
const assert=require('node:assert/strict');
const app='/tanahoraflavio/',origin='http://corre-flavio-qa.test',seed=17;
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.mp3':'audio/mpeg','.ogg':'audio/ogg','.svg':'image/svg+xml'};
const marker='  updateUI();resize();draw();prepareSprites();';
const instrument=`
  window.__experienceQA={
    replay(scene,pilot,reference){
      run=createRun({mode:'story',seed:${seed}});startRun(run);resizeRun(run,virtualWidth);run.supportAvailable=supportReady;
      let steps=0;const heap=[];
      const sample=()=>{if(performance.memory)heap.push({second:run.elapsed,usedBytes:performance.memory.usedJSHeapSize});};
      sample();
      const matches=()=>scene==='pista'?run.elapsed>=4.25:
        scene==='duelo'?run.boss?.combat&&run.boss.fired>=1:
        reference?routeStageFor(run).id==='sao-paulo'&&campaignRouteDistance(run)%SCENE_DISTANCE>=5800:
        run.terrain.active?.kind==='air-transfer'&&run.terrain.active.flight?.phase==='crossing';
      while(steps++<120*1800&&run.status==='running'&&!matches()){
        pilot(run);if(run.reserveShields&&run.shieldFor<=0)activateReserveShield(run);advanceRun(run,1/120);
        if(steps%(120*60)===0)sample();
      }
      updateUI();draw();sample();
      return {heap,reached:!!matches(),status:run.status,elapsed:run.elapsed,distance:run.distance,health:run.player.hp,scene:routeStageFor(run).id,boss:run.boss?.id??run.boss?.type??null,terrain:run.terrain.active?.kind??null};
    },
    measure(rate,pilot){
      const ns=[],clock=createFrameClock(0),start=run.elapsed,initialStatus=run.status;
      for(let i=1;i<=rate;i++){
        const tick=performance.now(),timing=advanceFrameClock(clock,i*1000/rate);
        for(let n=0;n<timing.steps&&run.status==='running';n++){pilot(run);advanceRun(run,timing.step);}
        updateUI();draw();ns.push(performance.now()-tick);
      }
      ns.sort((a,b)=>a-b);
      return {rate,frames:ns.length,simulationSeconds:run.elapsed-start,initialStatus,status:run.status,p95Ms:ns[Math.floor((ns.length-1)*.95)],peakMs:ns.at(-1)};
    }
  };
`;
// Only the current candidate is a release gate; the historical baseline is diagnostic.
function validateCandidateReport(report){
 const failures=[];
 for(const width of [390,1440])for(const scene of ['pista','duelo','viagem']){
  const label=width+'px/'+scene;
  const runs=report.runs.filter(run=>run.version==='candidato'&&run.width===width&&run.scene===scene);
  if(runs.length!==1||runs[0].reached!==true){failures.push(label+': checkpoint ausente, duplicado ou não alcançado');continue;}
  const timing=runs[0].timing||[];
  for(const rate of [30,60,120]){
   const samples=timing.filter(sample=>sample.rate===rate);
   const sample=samples[0];
   if(samples.length!==1||sample.reached!==true||sample.frames!==rate||
      !Number.isFinite(sample.p95Ms)||!Number.isFinite(sample.peakMs)||
      sample.p95Ms<0||sample.peakMs<sample.p95Ms){
    failures.push(label+'/'+rate+'Hz: medição ausente ou inválida');
   }
  }
 }
 assert.equal(failures.length,0,'Replay obrigatório incompleto: '+failures.join('; '));
}
async function main(){
 const {chromium}=require('playwright');
 const [baseline,candidate,out]=process.argv.slice(2);
 assert.ok(baseline&&candidate&&out,'Uso: node tools/capture-runner-experience.cjs BASE CANDIDATO SAIDA');
 await mkdir(out,{recursive:true});
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||'/usr/bin/google-chrome'});
 const report={seed,browser:browser.version(),note:'Tempo síncrono JS + chamadas Canvas, sem FPS de compositor ou equivalência a aparelho físico. Heap do Chrome é aproximado, não demonstra vazamento.',runs:[]};
 try{
  for(const [version,checkout] of [['base',baseline],['candidato',candidate]])for(const [width,height] of [[390,844],[1440,900]]){
   const context=await browser.newContext({viewport:{width,height},hasTouch:width===390});
   try{
    await context.addInitScript(()=>{window.requestAnimationFrame=()=>1;window.cancelAnimationFrame=()=>{};});
    await context.route('**/*',async route=>{
     const url=new URL(route.request().url());if(url.origin!==origin)return route.abort();
     const name=url.pathname.endsWith('/')?url.pathname+'index.html':url.pathname;
     const file=resolve(checkout,'.'+name);if(!file.startsWith(resolve(checkout)+sep)||!(name.startsWith(app)||name.startsWith('/tools/')))return route.abort();
     try{
      let body=await readFile(file);
      if(name===app+'runner.mjs'){
       const source=body.toString();assert.ok(source.includes(marker),'Ponto de instrumentação não encontrado');
       body=source.replace(marker,instrument+marker);
      }
      await route.fulfill({body,contentType:types[extname(file)]||'application/octet-stream'});
     }catch{await route.fulfill({status:404,body:'Não disponível neste replay'});}
    });
    const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(origin+app);
    await page.waitForFunction(()=>window.__experienceQA&&document.getElementById('game').dataset.art==='loaded',null,{polling:25,timeout:16000});
    await page.getByRole('button',{name:'Começar corrida',exact:true}).click({timeout:8000});
    assert.equal(await page.locator('#game').getAttribute('data-run-state'),'running','O botão real precisa iniciar a partida');
    for(const scene of ['pista','duelo','viagem']){
     const result=await page.evaluate(async({scene,reference})=>{
      const {pilotCounter}=await import('/tools/story-pilot.mjs');
      document.getElementById('runner-canvas').scrollIntoView({block:'center'});
      return window.__experienceQA.replay(scene,pilotCounter,reference);
     },{scene,reference:version==='base'});
     report.runs.push({version,width,...result,routeScene:result.scene,scene});
     if(!result.reached){process.stderr.write(`${version} ${width} ${scene} não alcançado (${JSON.stringify(result)})\n`);continue;}
     await page.screenshot({path:resolve(out,`prompt-${version}-${width}-${scene}.png`),animations:'disabled'});
     report.runs.at(-1).timing=await page.evaluate(async({scene,reference})=>{
      const {pilotCounter}=await import('/tools/story-pilot.mjs');
      return [30,60,120].map(rate=>{const replay=window.__experienceQA.replay(scene,pilotCounter,reference);return replay.reached?{...window.__experienceQA.measure(rate,pilotCounter),reached:true}:{rate,reached:false};});
     },{scene,reference:version==='base'});
    }
    assert.deepEqual(errors,[],`${version} ${width}`);
   }finally{await context.close();}
  }
 }finally{await browser.close();}
 report.revisions=Object.fromEntries([['base',baseline],['candidato',candidate]].map(([name,cwd])=>[name,execFileSync('git',['rev-parse','HEAD'],{cwd,encoding:'utf8'}).trim()]));
 await writeFile(resolve(out,'prompt-experiencia.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report));
 validateCandidateReport(report);
}
module.exports={validateCandidateReport};
if(require.main===module)main().catch(error=>{console.error(error);process.exitCode=1;});
