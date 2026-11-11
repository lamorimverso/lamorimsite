// Validação automática: somente comandos públicos; sem alterar HP, vidas, perigos ou relógios.
import * as core from '../tanahoraflavio/runner-core.mjs';
function pilot(r){
 const local=r.obstacles.find(o=>(o.falling||o.groundHazard)&&o.age<o.warningFor+(o.fallFor??o.activeFor));
 let evade=0;
 if(local){
  const bounds=core.playerBounds(r),toLeft=local.x-12-(r.player.x+31),toRight=local.x+local.width+12-(r.player.x+5);
  const leftPossible=r.player.x+toLeft>=bounds.min,rightPossible=r.player.x+toRight<=bounds.max;
  if(!(r.player.x+31<local.x-10||r.player.x+5>local.x+local.width+10))evade=leftPossible&&(!rightPossible||Math.abs(toLeft)<Math.abs(toRight))?-1:1;
 }
 if(r.player.isJacare)core.jumpRun(r);
 const danger=r.obstacles.filter(o=>!o.falling&&!o.groundHazard&&!o.passed&&!o.counted&&
  (o.approach==='rear'?o.x<r.player.x+31:o.x+o.width-3>r.player.x+5))
  .sort((a,b)=>core.threatTimeToContact(r,a)-core.threatTimeToContact(r,b))[0];
 const until=danger?core.threatTimeToContact(r,danger):Infinity,speed=Math.abs(danger?.speed||270);
 // O aviso local é agendado após o ataque em voo: primeiro concluir sua
 // evasão, depois usar os .82s reservados para sair do ponto de impacto.
 const localEta=local?core.threatTimeToContact(r,local):Infinity;
 core.moveRun(r,local&&r.player.y===0&&(!danger||until>localEta+.2)?evade:0);
 core.crouchRun(r,danger?.action==='crouch'&&until<.65);
 const jumpAhead=danger?.approach==='rear'?.22:.35-((danger?.width||40)+20)/(2*speed);
 if(danger?.action==='jump'&&until<=jumpAhead&&until>-.1)core.jumpRun(r);
}
const results=[];
for(const width of [480,900])for(let seed=1;seed<=10;seed++){
 const r=core.createRun({mode:'story',seed});core.startRun(r);core.resizeRun(r,width);
 const rehearsals=new Set();let transforms=0,prior=false;
 for(let i=0;i<120*900&&r.status==='running';i++){
  pilot(r);
  if(r.player.isJacare){
   const zones=r.obstacles.filter(o=>o.owner==='pfizer'&&o.age<o.warningFor+o.fallFor),bounds=core.playerBounds(r),left=-15,right=core.PLAYER.width+17;
   const candidates=[r.player.x,bounds.min,bounds.max,...zones.flatMap(o=>[o.x-right-12,o.x+o.width-left+12])].filter(x=>x>=bounds.min&&x<=bounds.max&&zones.every(o=>x+right<o.x-8||x+left>o.x+o.width+8));
   candidates.sort((a,b)=>Math.abs(a-r.player.x)-Math.abs(b-r.player.x));
   const target=candidates[0]??r.player.x;core.moveRun(r,Math.abs(target-r.player.x)<2?0:Math.sign(target-r.player.x));
  }
  core.setAttackRun(r,true);core.advanceRun(r,1/120);
  if(r.rehearsedBoss)rehearsals.add(r.rehearsedBoss);
  if(r.player.isJacare&&!prior)transforms++;prior=r.player.isJacare;
 }
 results.push({width,seed,status:r.status,bosses:r.bossesDefeated,seconds:Math.round(r.elapsed),rehearsals:rehearsals.size,transforms,raids:r.raids,lastHit:r.lastHit});
}
if(results.some(r=>r.status!=='ballot'))process.exitCode=1;
console.log(JSON.stringify({completed:results.filter(r=>r.status==='ballot').length,total:results.length,failed:results.filter(r=>r.status!=='ballot'),rehearsalCounts:[...new Set(results.map(r=>r.rehearsals))],raids:results.reduce((s,r)=>s+r.raids,0),transforms:results.reduce((s,r)=>s+r.transforms,0)},null,2));
