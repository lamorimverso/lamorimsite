import {playerX,frontContact} from './runner-run-geometry.mjs?v=e55c2c4eae5e';

export const assistance = run => run.assisted ? .82 : 1;
export const REACTION_GAP = .82;
// A full marked-lane escape can close opposing contacts by almost a second
// at their 180px/s clearance floor, even after the marker itself has ended.
const OPPOSING_ESCAPE_RESERVE=.95;
// A retaguarda se aproxima pela esquerda; outras ameaças continuam pela direita.
export function threatTimeToContact(run,o){
 if(o.cast)return (o.waitFor||0)+o.cast.flightFor-o.cast.flightAge;
 if(o.groundHazard)return o.warningFor-o.age;
 if(o.falling)return o.warningFor+o.fallFor*.7-o.age;
 if(o.approach==='rear')return (o.waitFor||0)+(playerX(run)+5-(o.x+o.width-3))/-o.speed;
 if(o.bossFlight&&!o.returning){
  const distance=o.x-frontContact(run),coast=o.bossFlight.remaining*o.bossFlight.speed;
  if(distance>0&&coast>0)return (o.waitFor||0)+(distance<=coast?distance/o.bossFlight.speed:o.bossFlight.remaining+(distance-coast)/o.speed);
 }
 return (o.waitFor||0)+(o.x-frontContact(run))/o.speed;
}
// Zonas persistentes reservam também sua janela ativa antes da próxima onda.
export const threatReservation = (run,o) => threatTimeToContact(run,o)+(o.groundHazard?o.activeFor:0);

// Uma onda mais rápida nunca alcança a anterior e forma um par impossível.
function threatSpeed(run,x,seconds,visibleX=x){
 if(run.aid?.kind==='telegraph')seconds+=run.aid.warningBonus??.24;
 const contactX=frontContact(run),rearContact=playerX(run)+5;
 const pending=run.obstacles.filter(o=>!o.passed&&(o.cast||o.x>contactX)&&o.speed>0)
  .map(o=>threatReservation(run,o));
 // Opposite directions need room for one body-width of lateral escape
 // after a ground marker; that movement closes their two contact times.
 const rear=run.obstacles.filter(o=>!o.passed&&!o.counted&&o.approach==='rear'&&o.speed<0)
  .map(o=>threatReservation(run,o))
  .filter(t=>t>0).map(t=>t+OPPOSING_ESCAPE_RESERVE);
 const speed=Math.max(1,visibleX-contactX)/seconds*assistance(run);
 const drops=run.obstacles.filter(o=>o.falling||o.groundHazard).map(o=>threatReservation(run,o)).filter(t=>t>0);
 const nextContact=Math.max((x-contactX)/speed,...pending.concat(rear,drops).map(t=>t+REACTION_GAP));
 return Math.max(1,x-contactX)/nextContact;
}
export function threatMotion(run,x,seconds,visibleX=x){
 const requested=threatSpeed(run,x,seconds,visibleX),speed=Math.max(180,requested);
 // O tempo extra vira antecipação visível, sem alongar a travessia física.
 return {speed,waitFor:Math.max(0,(x-frontContact(run))/requested-(x-frontContact(run))/speed)};
}
// Retaguarda usa a mesma janela de leitura, sem disputar o contato com um perigo frontal.
export function rearMotion(run,x,width){
 const contactX=frontContact(run),rearContact=playerX(run)+5;
 const front=run.obstacles.filter(o=>!o.passed&&(o.cast||o.x>contactX)&&o.speed>0).map(o=>threatReservation(run,o)+OPPOSING_ESCAPE_RESERVE);
 const rear=run.obstacles.filter(o=>!o.passed&&!o.counted&&o.approach==='rear'&&o.speed<0).map(o=>threatReservation(run,o));
 const drops=run.obstacles.filter(o=>o.falling||o.groundHazard).map(o=>threatReservation(run,o));
 const seconds=Math.max(run.assisted?1.22:1.06,...front.concat(rear,drops).filter(t=>t>0).map(t=>t+REACTION_GAP));
 const distance=rearContact-(x+width-3),requested=distance/seconds,speed=Math.max(180,requested);
 return {speed:-speed,waitFor:Math.max(0,seconds-distance/speed)};
}
