// Validação automática: somente comandos públicos; sem alterar HP, vidas, perigos ou relógios.
import * as core from '../tanahoraflavio/runner-core.mjs';
import {pilotCounter} from './story-pilot.mjs';
const results=[];
for(const width of [480,900])for(let seed=1;seed<=10;seed++){
 const r=core.createRun({mode:'story',seed});core.startRun(r);core.resizeRun(r,width);
 const rehearsals=new Set();let transforms=0,prior=false;
 for(let i=0;i<120*900&&r.status==='running';i++){
  pilotCounter(r);
  if(r.reserveShields&&r.shieldFor<=0)core.activateReserveShield(r);core.advanceRun(r,1/120);
  if(r.rehearsedBoss)rehearsals.add(r.rehearsedBoss);
  if(r.player.isJacare&&!prior)transforms++;prior=r.player.isJacare;
 }
 results.push({width,seed,status:r.status,bosses:r.bossesDefeated,seconds:Math.round(r.elapsed),rehearsals:rehearsals.size,transforms,raids:r.raids,raidsByStage:r.raidStages,missingJoiceStages:core.STORY_STAGES.filter(stage=>!(r.raidStages[stage.id]>0)).map(stage=>stage.id),lastHit:r.lastHit});
}
if(results.some(r=>r.status!=='ballot'||r.missingJoiceStages.length))process.exitCode=1;
console.log(JSON.stringify({completed:results.filter(r=>r.status==='ballot').length,total:results.length,failed:results.filter(r=>r.status!=='ballot'||r.missingJoiceStages.length),joiceByStage:Object.fromEntries(core.STORY_STAGES.map(stage=>{const counts=results.map(r=>r.raidsByStage[stage.id]||0);return [stage.id,{min:Math.min(...counts),max:Math.max(...counts)}];})),rehearsalCounts:[...new Set(results.map(r=>r.rehearsals))],raids:results.reduce((s,r)=>s+r.raids,0),transforms:results.reduce((s,r)=>s+r.transforms,0)},null,2));
