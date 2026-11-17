// Test/check pilot using only public movement and firing commands.
import * as core from '../tanahoraflavio/runner-core.mjs';
export function pilotJacare(r,{recover=true}={}){
 const zones=r.obstacles.filter(o=>o.type==='pfizer-ampoule'&&o.age<o.warningFor+o.fallFor);
 if(!r.player.isJacare&&!zones.length)return false;
 if(recover&&r.player.isJacare&&r.player.jacareAge>=(r.player.jacareProgress+1)*.2)core.recoverJacareRun(r);
 const {min,max}=core.playerBounds(r),current=r.player.x,front=core.PLAYER.width+20,rear=19;
 const targets=[current,min,max,...zones.flatMap(o=>[o.x-front,o.x+o.width+rear])];
 const safe=targets.filter(x=>x>=min&&x<=max&&zones.every(o=>x<=o.x-front||x>=o.x+o.width+rear));
 safe.sort((a,b)=>Math.abs(a-current)-Math.abs(b-current));
 core.moveRun(r,safe.length?Math.sign(safe[0]-current):0);
 return true;
}
export function pilotDodge(r){
 if(pilotJacare(r))return;
 const terrain=r.terrain?.active;
 if(terrain){
  core.moveRun(r,0);core.crouchRun(r,false);
  if(terrain.kind==='air-transfer'){
   const center=r.player.x+18,voidSpan=terrain.gaps[0];
   const support=r.player.supportY>0?terrain.platforms.find(p=>p.y===r.player.supportY&&center+13>=p.x&&center-13<=p.x+p.width):null;
   const edge=support?support.x+support.width:voidSpan.x;
   const [,high,lane]=terrain.flight.aircraft;
   const overhead=(terrain.flight.traveled-high.warnAt)/terrain.flight.nominalSpeed;
   if(r.player.grounded&&support===terrain.platforms[high.barIndex]&&overhead>=0&&overhead<1.85)core.crouchRun(r,true);
   const laneAhead=support===terrain.platforms[lane.barIndex]&&(support.x+lane.offset-center)/terrain.speed<.20;
   if(r.player.grounded&&(support||center<voidSpan.x)&&(laneAhead||(edge-center)/terrain.speed<.17))core.jumpRun(r);
  }else if(terrain.kind==='ground-lesson'){
   const bar=terrain.platforms[0],eta=(bar.x-r.player.x-18)/terrain.speed;
   if(r.player.grounded&&r.player.supportY===0&&eta<.22&&eta>-.10)core.jumpRun(r);
  }else if(terrain.kind==='passage'){
   const roof=terrain.ceilings[0],eta=(roof.x-(r.player.x+31))/terrain.speed;
   if(roof.x+roof.width>r.player.x+5&&eta<.38){core.crouchRun(r,true);core.moveRun(r,1);}
  }else{
   const gap=terrain.gaps[0],eta=(gap.x-(r.player.x+17))/terrain.speed;
   if(r.player.grounded&&r.player.supportY===0&&eta<.13&&eta>-.06)core.jumpRun(r);
   else if(terrain.requiresDoubleJump&&!r.player.grounded&&r.player.airJumpsUsed===0&&r.player.velocity<=0&&r.player.y>30)core.jumpRun(r);
  }
  return;
 }
 const local=r.obstacles.find(o=>(o.falling||o.groundHazard)&&o.age<o.warningFor+(o.fallFor??o.activeFor));
 let evade=0;
 if(local){
  const bounds=core.playerBounds(r),toLeft=local.x-12-(r.player.x+31),toRight=local.x+local.width+12-(r.player.x+5);
  const leftPossible=r.player.x+toLeft>=bounds.min,rightPossible=r.player.x+toRight<=bounds.max;
  if(!(r.player.x+31<local.x-10||r.player.x+5>local.x+local.width+10))evade=leftPossible&&(!rightPossible||Math.abs(toLeft)<Math.abs(toRight))?-1:1;
 }
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
 if(danger?.action==='jump'&&until<=jumpAhead&&until>-.1&&(!r.movementSkills?.doubleJump||r.player.grounded))core.jumpRun(r);
}
export function pilotCounter(r){
 pilotDodge(r);
 const boss=r.boss;
 const incoming=r.obstacles.find(o=>core.isHostileProjectile(o)&&!o.returning&&core.threatTimeToContact(r,o)>.22);
 core.setAttackRun(r,!!boss&&!boss.traversal&&r.ammo>0&&!!incoming);
}
