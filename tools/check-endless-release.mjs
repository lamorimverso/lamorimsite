// Reproduz corrida longa só com comandos públicos e o relógio real de frames.
// Os FPS abaixo são cadências de entrada simuladas, não medições de renderização.
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import * as core from '../tanahoraflavio/runner-core.mjs';
import {createFrameClock,advanceFrameClock} from '../tanahoraflavio/runner-clock.mjs';
import {pilotCounter} from './story-pilot.mjs';

const round=(n,digits=3)=>Number(n.toFixed(digits));
const percentile=(values,q)=>values[Math.floor((values.length-1)*q)]??null;

export function replayEndless({width,seed,rate,seconds=2100,profile=false}){
 const run=core.createRun({mode:'endless',seed}),clock=createFrameClock(0);
 core.resizeRun(run,width);core.startRun(run);
 const windows=[0,seconds/2,seconds-30].map(start=>({start,spawns:{},bosses:0})),lateStyles={},stepSamples=[],heap=[];
 let steps=0,hits=0,shields=0,continues=0,firstNearCap=null;
 for(let frame=1;frame<=seconds*rate&&run.status==='running';frame++){
  if(profile&&frame%(rate*300)===0)heap.push({second:round(run.elapsed),heapMiB:round(process.memoryUsage().heapUsed/1048576,2)});
  const timing=advanceFrameClock(clock,frame*1000/rate);
  for(let i=0;i<timing.steps&&run.status==='running';i++){
   pilotCounter(run);
   if(run.reserveShields&&run.shieldFor<=0&&core.activateReserveShield(run))shields++;
   const hp=run.player.hp,spawns=run.spawnedObstacles,boss=run.boss,now=profile&&steps%128===0?performance.now():null;
   core.advanceRun(run,timing.step);steps++;
   if(now!==null)stepSamples.push(performance.now()-now);
   if(run.player.hp<hp)hits++;
   if(run.status==='over'&&core.continueRun(run))continues++;
   const window=windows.find(w=>run.elapsed>=w.start&&run.elapsed<w.start+30);
   if(window&&boss&&!run.boss&&run.lastBoss===boss.type)window.bosses++;
   if(run.spawnedObstacles===spawns||run.boss||run.raid||run.terrain.active)continue;
   const obstacle=run.obstacles.at(-1);
   const style=obstacle?.groundHazard?'marker':obstacle?.cast?'overhead':obstacle?.approach||obstacle?.type;
   if(!style)continue;
   if(window)window.spawns[style]=(window.spawns[style]||0)+1;
   const d=core.difficultyAt(run.distance,run.elapsed);
   if(d.pressure>=.995&&d.endurance>=.99){
    firstNearCap??=round(run.elapsed);lateStyles[style]=(lateStyles[style]||0)+1;
   }
  }
 }
 const speed=core.difficultyAt(run.distance,run.elapsed).speed;
 const state={status:run.status,activeSeconds:round(run.elapsed),steps,distance:round(run.distance),speed:round(speed),
  bosses:run.bossesDefeated,rounds:Math.floor(run.routeDistance/(core.STAGES.length*core.SCENE_DISTANCE)),
  terrain:run.terrain.completed,lessonCompleted:run.terrain.lessonCompleted,flightCompleted:run.terrain.flightCompleted,
  hits,shields,continues,firstNearCap,lateStyles,windows,lastHit:run.lastHit};
 if(profile){stepSamples.sort((a,b)=>a-b);state.kernel={p95ms:round(percentile(stepSamples,.95),4),p99ms:round(percentile(stepSamples,.99),4),heap};}
 return state;
}

export const ENDLESS_RELEASE_CASES=Object.freeze([{width:480,seed:17},{width:900,seed:417}]);

if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
 const runs=ENDLESS_RELEASE_CASES.flatMap(c=>[30,60,120].map(rate=>({...c,rate,...replayEndless({...c,rate,profile:true})})));
 console.log(JSON.stringify({runtime:process.version,note:'Teste de percurso e relógio fixo. Tempos JS amostrados em Node e heap do processo inteiro; não medem FPS, memória do navegador ou percepção humana.',runs},null,2));
}
