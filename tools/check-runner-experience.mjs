// Local, replayable simulation. No production instrumentation or network I/O.
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {arch,platform} from 'node:os';

const NOOP=()=>{};
const emptyCounts=()=>({jump:0,crouch:0,lateral:0,fire:0,recover:0});
const emptyWindow=()=>({sampleSeconds:0,projectedContacts:0,controls:emptyCounts(),decisions:[],warningLead:[],threats:{}});
const round=(n,places=3)=>Number(n.toFixed(places));
function percentile(data,q){
 if(!data.length)return null;
 const sorted=data.slice().sort((a,b)=>a-b);
 return round(sorted[Math.floor((sorted.length-1)*q)]);
}
function summarizeWindow(window){
 const gaps=window.decisions.slice(1).map((t,i)=>t-window.decisions[i]);
 const breaks=[...gaps,window.decisions[0]??window.sampleSeconds,
  window.sampleSeconds-(window.decisions.at(-1)??0)];
 return {sampleSeconds:round(window.sampleSeconds),projectedContacts:window.projectedContacts,controls:window.controls,
  decisionGapMedianS:percentile(gaps,.5),longestDecisionGapS:round(Math.max(...breaks)),
  projectedLeadP10s:percentile(window.warningLead,.1),threats:window.threats};
}
function isForwardThreat(o){return !o.passed&&!o.counted&&!o.destroyed&&!o.reflected;}
function isOnLocalLane(core,run,o){
 if(!(o.falling||o.groundHazard))return true;
 const x=core.playerX(run),p=run.player;
 return x+(p.isJacare?core.PLAYER.width+17:core.PLAYER.width-3)>o.x+3&&x+(p.isJacare?-15:5)<o.x+o.width-3;
}
function recordThreats(core,run,w,firstSeen,known){
 for(const o of run.obstacles){
  if(!isForwardThreat(o))continue;
  const eta=core.threatTimeToContact(run,o);
  if(!Number.isFinite(eta)||eta<0)continue;
  if(!firstSeen.has(o))firstSeen.set(o,{lead:eta,at:run.elapsed});
  if(known.has(o)||eta>.7||!isOnLocalLane(core,run,o))continue;
  known.add(o);w.projectedContacts++;
  const {lead,at}=firstSeen.get(o);
  w.warningLead.push(Math.max(eta,Math.min(lead,eta+run.elapsed-at)));
  const type=o.action||o.approach||o.type;w.threats[type]=(w.threats[type]||0)+1;
 }
}
export function runExperienceAudit(core,pilot=NOOP,{widths=[480,900],seeds=[7,17,417],rates=[120],limit=900,windowSeconds=12}={}){
 const runs=[];
 for(const width of widths)for(const seed of seeds)for(const rate of rates){
  const run=core.createRun({seed,mode:'story',assisted:false}),dt=1/rate;
  core.startRun(run);core.resizeRun(run,width);
  const stages=new Map(),fights=[],air={seconds:0,phases:[],landings:0,signals:0},stepMs=[],heap=[];
  const firstSeen=new WeakMap(),known=new WeakSet(),reflectionSeen=new WeakSet(),airSeen=new WeakSet();
  let lastBoss=null,activeFight=null,lastAir=false;
  for(let i=0;i<Math.round(rate*limit)&&run.status==='running';i++){
   if(i%(60*rate)===0)heap.push({at:round(run.elapsed),usedMiB:round(process.memoryUsage().heapUsed/1048576,2)});
   const p=run.player,terrain=run.terrain?.active,boss=run.boss;
   const stage=core.routeStageFor(run).id;
   if(!stages.has(stage))stages.set(stage,emptyWindow());
   const w=stages.get(stage),isGround=!terrain&&!boss&&!p.isJacare&&!run.obstacles.some(o=>o.type==='pfizer-ampoule');
   const capture=isGround&&w.sampleSeconds<windowSeconds-dt/2;
   if(capture){w.sampleSeconds+=dt;recordThreats(core,run,w,firstSeen,known);}
   if(boss!==lastBoss){
    if(activeFight)activeFight.end=run.elapsed;
    if(boss){activeFight={id:boss.id??boss.type,stage,start:run.elapsed,end:null,opportunities:0,reflections:0};fights.push(activeFight);}else activeFight=null;
   }
   lastBoss=boss;
   if(activeFight)for(const o of run.obstacles){
    if(!o.bossAttack||reflectionSeen.has(o)||!core.isHostileProjectile(o))continue;
    reflectionSeen.add(o);activeFight.opportunities++;
   }
   const flight=terrain?.kind==='air-transfer'?terrain.flight:null;
   if(flight){
    air.seconds+=dt;
    if(air.phases.at(-1)!==flight.phase)air.phases.push(flight.phase);
    for(const aircraft of flight.aircraft??[]){
     if(!airSeen.has(aircraft)&&aircraft.kind!=='flyby'&&Number.isFinite(aircraft.warnAt)&&flight.traveled>=aircraft.warnAt){
      airSeen.add(aircraft);air.signals++;
     }
    }
   }
   const before={grounded:p.grounded,vy:p.velocity,x:p.moveHeld,crouch:p.crouchHeld,shots:run.shotsFired,
    recovery:p.jacareProgress,reflection:activeFight?run.obstacles.filter(o=>o.reflected).length:0};
   pilot(run);
   if(run.reserveShields&&run.shieldFor<=0)core.activateReserveShield(run);
   const controls=capture?{jump:Number(p.velocity>before.vy+100),crouch:Number(p.crouchHeld&&!before.crouch),
    lateral:Number(!!p.moveHeld&&p.moveHeld!==before.x),fire:0,recover:Number(p.jacareProgress>before.recovery)}:null;
   const start=performance.now();core.advanceRun(run,dt);stepMs.push(performance.now()-start);
   if(flight&&!before.grounded&&p.grounded&&p.supportY>0)air.landings++;
   if(lastAir&&!flight&&air.phases.at(-1)!=='fim')air.phases.push('fim');
   lastAir=!!flight;
   if(activeFight)activeFight.reflections+=Math.max(0,run.obstacles.filter(o=>o.reflected).length-before.reflection);
   if(controls){
    controls.fire=run.shotsFired-before.shots;
    for(const k of Object.keys(controls))w.controls[k]+=controls[k];
    if(Object.values(controls).some(Boolean))w.decisions.push(w.sampleSeconds);
   }
  }
  if(activeFight)activeFight.end=run.elapsed;
  runs.push({seed,width,rate,status:run.status,activeSeconds:round(run.elapsed),lastHit:run.lastHit??null,
   bossesDefeated:run.bossesDefeated,stages:Object.fromEntries([...stages].map(([id,w])=>[id,summarizeWindow(w)])),
   fights:fights.map(f=>({id:f.id,stage:f.stage,seconds:round(f.end-f.start),opportunities:f.opportunities,reflections:f.reflections})),
   air:{...air,seconds:round(air.seconds)},kernel:{steps:stepMs.length,stepP95ms:percentile(stepMs,.95),stepP99ms:percentile(stepMs,.99),heap}});
 }
 return {note:'Contatos e avisos projetados pelo motor na rota do piloto, não percepção humana. Tempo do passo JS em Node, não mede FPS, pintura, áudio nem latência de input do navegador. O heap é do processo inteiro, incluindo a instrumentação e aquecimento; não é um teste de vazamento.',
  runtime:{node:process.version,platform:platform(),architecture:arch()},windowSeconds,runs};
}
const root=new URL('../',import.meta.url);
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
 const [path,mode]=process.argv.slice(2);
 const checkout=path?pathToFileURL(resolve(path)+'/'):root;
 const core=await import(new URL('tanahoraflavio/runner-core.mjs',checkout));
 const {pilotCounter}=await import(new URL('tools/story-pilot.mjs',checkout));
 const report=runExperienceAudit(core,pilotCounter,mode==='--rates'?{widths:[480],seeds:[17],rates:[30,60,120]}:{});
 report.revision=execFileSync('git',['rev-parse','HEAD'],{cwd:checkout,encoding:'utf8'}).trim();
 console.log(JSON.stringify(report,null,2));
}
