// Test/check pilot using only public movement and firing commands.
import * as core from '../tanahoraflavio/runner-core.mjs';
export function pilotDodge(r){
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
export function pilotCounter(r){
 pilotDodge(r);
 const boss=r.boss;
 const incoming=r.obstacles.find(o=>core.isHostileProjectile(o)&&!o.returning&&core.threatTimeToContact(r,o)>.22);
 core.setAttackRun(r,!!boss&&!boss.traversal&&r.ammo>0&&!!incoming);
}
