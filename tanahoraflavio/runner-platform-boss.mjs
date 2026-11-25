// Ground movement adapted from Mega Man Labs' Thunder Man jump/dash/move
// states, Copyright (c) 2019 Molten Gears, MIT. See third-party/megaman-labs.LICENSE.txt.
// Ported to this engine's y-up coordinates and narrow-screen reaction corridor.
const clamp=n=>Math.max(0,Math.min(1,n));
const smooth=n=>{const u=clamp(n);return u*u*(3-2*u);};
function hash(text,seed){for(const ch of text)seed=(Math.imul(seed,31)+ch.charCodeAt(0))>>>0;return seed;}
// Each fighter has an individual cadence and committed movement vocabulary.
// [cycle seconds, first move, second move, leap height, first start, second start].
const movement=Object.freeze({
 pf:[3.7,'dash','jump',68,.48,1.92],army:[3.6,'step','jump',72,.45,1.85],
 janones:[3.05,'feint','jump',68,.36,1.67],joice:[3.5,'jump','step',82,.45,1.94],
 soraya:[3.9,'jump','jump',90,.42,2.05],boulos:[3.2,'dash','jump',67,.40,1.78],
 haddad:[3.8,'step','jump',80,.48,2.12],simone:[3.7,'feint','jump',76,.52,1.97],
 dino:[3.85,'jump','dash',86,.47,2.08],xandao:[3.45,'jump','dash',84,.46,1.84],
 lula:[3.55,'feint','jump',83,.42,1.95],dilma:[3.6,'jump','feint',89,.38,1.86],
 bossonari:[3.25,'dash','jump',77,.39,1.76],'meme-army':[3.3,'jump','feint',85,.40,1.79],
 'ana-elisa':[3.65,'step','jump',76,.52,1.99],rick:[3.15,'jump','feint',70,.42,1.78],
 sofia:[3.3,'feint','jump',79,.42,1.83],guilherme:[3.4,'dash','jump',74,.43,1.91],
 erika:[3.95,'jump','step',92,.48,2.14],'renato-freitas':[3.45,'step','jump',75,.46,1.88],
 jones:[3.5,'feint','jump',87,.43,1.93],maestro:[3.2,'jump','feint',81,.41,1.81],
 capita:[3.75,'jump','dash',88,.41,2.02]
});
const fallback=[3.7,'jump','dash',76,.48,2.0];
function maneuver(kind,time,height){
 if(time<0||time>=1)return {x:0,y:0,state:'idle'};
 if(kind==='jump')return {x:-42*Math.sin(Math.PI*time)**2,y:4*height*time*(1-time),state:'jump'};
 if(kind==='step')return {x:-42*Math.sin(Math.PI*time)**2,y:0,state:'move'};
 if(kind==='feint'){
  const pulse=Math.sin(Math.PI*time)**2;
  return {x:-42*pulse*(.72+.28*Math.sin(Math.PI*time*2)**2),y:0,state:'move'};
 }
 // Committed dash and recovery; no mid-attack retargeting.
 const offset=time<.18?smooth(time/.18):1-smooth((time-.18)/.82);
 return {x:-42*offset,y:0,state:time<.18?'dash':'move'};
}
export function platformBossPose(boss,width=900){
 const age=Math.max(0,Number(boss.age)||0),arrival=boss.phase==='intro'?Math.max(0,1-age/1.1)**3*150:0;
 if(boss.reducedMotion)return {x:width-88+arrival,platformY:0,state:'idle'};
 const [duration,first,second,height,firstAt,secondAt]=movement[boss.type]||fallback;
 const clock=Math.max(0,age-1.1),cycle=Math.floor(clock/duration),time=clock-cycle*duration;
 // Alternate move order using the encounter seed, keeping each actor's own moves.
 const swap=(hash(boss.type||'',Number(boss.flightSeed)||0)+cycle)%2!==0;
 const a=maneuver(swap?second:first,time-firstAt,height),b=maneuver(swap?first:second,time-secondAt,height);
 const active=a.state!=='idle'?a:b;
 // Slow patrol between committed moves, smoothly within the original safe corridor.
 const patrol=-4*(1-Math.cos(2*Math.PI*time/duration));
 const x=patrol+active.x*(1+patrol/42);
 return {x:width-88+x+arrival,platformY:active.y,state:active.state==='idle'&&time>0?'move':active.state};
}
