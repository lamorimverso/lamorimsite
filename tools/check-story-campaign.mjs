// Validação automática: somente comandos públicos; sem alterar HP, vidas, perigos ou relógios.
import * as core from '../tanahoraflavio/runner-core.mjs';
import {pilotCounter} from './story-pilot.mjs';
const results=[];
for(const width of [480,900])for(let seed=1;seed<=10;seed++){
 const r=core.createRun({mode:'story',seed});core.startRun(r);core.resizeRun(r,width);
 const rehearsals=new Set();let transforms=0,prior=false;
 for(let i=0;i<120*900&&r.status==='running';i++){
  pilotCounter(r);
  if(r.player.isJacare){
   const zones=r.obstacles.filter(o=>o.owner==='pfizer'&&o.age<o.warningFor+o.fallFor),bounds=core.playerBounds(r),left=-15,right=core.PLAYER.width+17;
   const candidates=[r.player.x,bounds.min,bounds.max,...zones.flatMap(o=>[o.x-right-12,o.x+o.width-left+12])].filter(x=>x>=bounds.min&&x<=bounds.max&&zones.every(o=>x+right<o.x-8||x+left>o.x+o.width+8));
   candidates.sort((a,b)=>Math.abs(a-r.player.x)-Math.abs(b-r.player.x));
   const target=candidates[0]??r.player.x;core.moveRun(r,Math.abs(target-r.player.x)<2?0:Math.sign(target-r.player.x));
  }
  if(r.reserveShields&&r.shieldFor<=0)core.activateReserveShield(r);core.advanceRun(r,1/120);
  if(r.rehearsedBoss)rehearsals.add(r.rehearsedBoss);
  if(r.player.isJacare&&!prior)transforms++;prior=r.player.isJacare;
 }
 results.push({width,seed,status:r.status,bosses:r.bossesDefeated,seconds:Math.round(r.elapsed),rehearsals:rehearsals.size,transforms,raids:r.raids,lastHit:r.lastHit});
}
if(results.some(r=>r.status!=='ballot'))process.exitCode=1;
console.log(JSON.stringify({completed:results.filter(r=>r.status==='ballot').length,total:results.length,failed:results.filter(r=>r.status!=='ballot'),rehearsalCounts:[...new Set(results.map(r=>r.rehearsals))],raids:results.reduce((s,r)=>s+r.raids,0),transforms:results.reduce((s,r)=>s+r.transforms,0)},null,2));
