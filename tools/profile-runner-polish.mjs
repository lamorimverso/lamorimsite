import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=new URL('../',import.meta.url),args=process.argv.slice(2);
const option=(name,fallback)=>args.includes(name)?args[args.indexOf(name)+1]:fallback;
const baselineRef=option('--baseline-ref','681cacd'),candidate=option('--candidate-source',null);
const frames=Number(option('--frames',360)),rounds=Number(option('--rounds',3));
if(!Number.isInteger(frames)||frames<30||!Number.isInteger(rounds)||rounds<1)throw new Error('Use at least 30 frames and one round.');
const baselineFiles=new Map(['runner.mjs','runner-combat-hud.mjs'].map(name=>[name,execFileSync('git',['show',`${baselineRef}:tanahoraflavio/${name}`],{cwd:fileURLToPath(root),encoding:'utf8'})]));

// Instrument only intercepted test responses. The shipped runner exposes no
// profiling hooks, synthetic scene controls or debug UI.
function instrumentRunner(source){
 source="import {nextStoryBossDistance as __bossDistance} from './runner-bosses.mjs';\n"+source;
 source=source.replace('function initRunner() {','function initRunner() {\n  const __samples={ui:[],draw:[]};');
 source=source.replace('const controlLabels=()=>Object.fromEntries(', 'const controlLabels=()=>__profileFromEntries(');
 source=source.replace('function updateUI() {','function __present() {').replace('function draw() {','function __draw() {');
 const wrappers=`
  function __profileFromEntries(values){window.__profileCounts.labelObjects++;return Object.fromEntries(values);}
  function updateUI(){const t=performance.now();try{return __present();}finally{__samples.ui.push(performance.now()-t);}}
  function draw(){const t=performance.now();try{return __draw();}finally{__samples.draw.push(performance.now()-t);}}
  window.__runnerProfile={samples:__samples,frame,present:updateUI,run:()=>run,
    scene(type){
      preferences.effects='reduce';
      run=createRun({mode:'story',assisted:true,seed:417});startRun(run);
      run.supportAvailable=supportReady;resizeRun(run,virtualWidth);
      for(const name of ['nextRaid','nextAllyAt','nextSupportAt','nextPower','nextPassport'])run[name]=Infinity;
      run.shieldFor=999;run.player.hp=run.player.maxHp=100;
      if(type==='boss'){
        run.bossesDefeated=9;run.distance=run.routeDistance=__bossDistance(9);run.nextBossAt=0;
        advanceRun(run,1/120);
        if(!run.boss)throw new Error('Profile arena did not start');
      }else run.nextBossAt=Infinity;
      lastStatus='';lastStage=-1;resetFrameClock(frameClock,0);updateUI();draw();
    }
  };
`;
 const marker='  updateUI();resize();draw();prepareSprites();';
 if(!source.includes(marker)||!source.includes('function __present() {')||!source.includes('function __draw() {'))throw new Error('Runner profiling insertion points changed');
 return source.replace(marker,wrappers+marker);
}

const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||'/usr/bin/chromium'});
try{
 const report={seed:417,frames,rounds,baselineRef,note:'Synchronous JS frame/UI/draw samples, not compositor or device FPS; fixed-step real runner with loaded assets. Baseline restores runner/HUD only; simulation, assets and shared drawing modules remain current. Timing is descriptive; mutation, lookup and control-label object counts are deterministic.'};
 for(const mode of ['baseline','candidate']){
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),page=await context.newPage();
  const failures=[];page.on('pageerror',error=>failures.push(error.message));
  await page.addInitScript(()=>{
   window.requestAnimationFrame=()=>1;window.cancelAnimationFrame=()=>{};
   const counts={lookups:0,labelObjects:0},lookup=Document.prototype.getElementById;
   Document.prototype.getElementById=function(...args){counts.lookups++;return lookup.apply(this,args);};
   window.__profileCounts=counts;
  });
  await page.route('http://runner-profile.test/**',async route=>{
   const path=new URL(route.request().url()).pathname;
   if(!path.startsWith('/tanahoraflavio/')||path.includes('..'))return route.abort();
   const relative=path.endsWith('/')?path+'index.html':path,name=relative.split('/').at(-1);
   try{
    let body=mode==='baseline'&&baselineFiles.has(name)?baselineFiles.get(name):await readFile(new URL('.'+relative,root));
    if(name==='runner.mjs')body=instrumentRunner(mode==='candidate'&&candidate?await readFile(candidate,'utf8'):String(body));
    const ext=name.split('.').at(-1),contentType={html:'text/html',js:'text/javascript',mjs:'text/javascript',css:'text/css',webp:'image/webp',png:'image/png',svg:'image/svg+xml',mp3:'audio/mpeg',ogg:'audio/ogg'}[ext]||'application/octet-stream';
    return await route.fulfill({contentType,body});
   }catch{return route.fulfill({status:404,body:''});}
  });
  await page.goto('http://runner-profile.test/tanahoraflavio/');
  try{await page.waitForFunction(()=>window.__runnerProfile&&document.getElementById('game').dataset.art==='loaded',null,{polling:25});}
  catch(error){throw new Error(`${mode}: ${JSON.stringify({failures,state:await page.evaluate(()=>({profile:!!window.__runnerProfile,art:document.getElementById('game')?.dataset.art,note:document.getElementById('game-loading-note')?.textContent}))})}`,{cause:error});}
  await page.waitForTimeout(100);
  report[mode]={};
  for(const scene of ['route','boss']){
   report[mode][scene]=await page.evaluate(({scene,frames,rounds})=>{
    const profiler=window.__runnerProfile,counts=window.__profileCounts;
    const observer=new MutationObserver(()=>{});observer.observe(document.getElementById('game'),{subtree:true,attributes:true,childList:true,characterData:true});
    const totals={mutations:0,lookups:0,labelObjects:0,idleMutations:0},times={frame:[],ui:[],draw:[]};
    let final;
    for(let round=0;round<rounds;round++){
     profiler.scene(scene);
     for(let i=1;i<=60;i++)profiler.frame(i*1000/60);
     observer.takeRecords();counts.lookups=counts.labelObjects=0;profiler.samples.ui.length=profiler.samples.draw.length=0;
     for(let i=61;i<=60+frames;i++){const t=performance.now();profiler.frame(i*1000/60);times.frame.push(performance.now()-t);}
     totals.mutations+=observer.takeRecords().length;totals.lookups+=counts.lookups;totals.labelObjects+=counts.labelObjects;
     times.ui.push(...profiler.samples.ui);times.draw.push(...profiler.samples.draw);
     for(let i=0;i<120;i++)profiler.present();totals.idleMutations+=observer.takeRecords().length;
     const run=profiler.run();final={status:run.status,distance:run.distance,hp:run.player.hp,ammo:run.ammo,boss:run.boss?.type||null,bossHp:run.boss?.hp||null,obstacles:run.obstacles.length};
    }
    observer.disconnect();
    const describe=values=>{values.sort((a,b)=>a-b);return {meanMs:Number((values.reduce((a,b)=>a+b,0)/values.length).toFixed(4)),p50Ms:values[Math.floor(values.length*.5)],p95Ms:values[Math.floor(values.length*.95)]};};
    return {...totals,timing:Object.fromEntries(Object.entries(times).map(([name,values])=>[name,describe(values)])),final};
   },{scene,frames,rounds});
  }
  if(failures.length)throw new Error(failures.join('\n'));
  await context.close();
 }
 console.log(JSON.stringify(report,null,2));
 if(args.includes('--assert'))for(const scene of ['route','boss']){
  const before=report.baseline[scene],after=report.candidate[scene];
  if(after.mutations>before.mutations*.15||after.lookups>before.lookups*.15||after.labelObjects!==0||after.idleMutations!==0)throw new Error(`${scene}: repeated presentation work did not fall below count thresholds`);
  if(JSON.stringify(before.final)!==JSON.stringify(after.final))throw new Error(`${scene}: simulation changed during profiling`);
 }
}finally{await browser.close();}
