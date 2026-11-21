// Ground movement adapted from Mega Man Labs' Thunder Man jump/dash/move
// states, Copyright (c) 2019 Molten Gears, MIT. See third-party/megaman-labs.LICENSE.txt.
// Ported to this engine's y-up coordinates and narrow-screen reaction corridor.
const clamp=n=>Math.max(0,Math.min(1,n));
const smooth=n=>{const u=clamp(n);return u*u*(3-2*u);};
function hash(text,seed){for(const ch of text)seed=(Math.imul(seed,31)+ch.charCodeAt(0))>>>0;return seed;}
function maneuver(kind,time,height){
 if(time<0||time>=1)return {x:0,y:0,state:'idle'};
 if(kind==='jump')return {x:-40*Math.sin(Math.PI*time)**2,y:4*height*time*(1-time),state:'jump'};
 // A short committed dash, followed by walking back; no retargeting mid-dash.
 const offset=time<.15?smooth(time/.15):1-smooth((time-.15)/.85);
 return {x:-42*offset,y:0,state:time<.15?'dash':'move'};
}
export function platformBossPose(boss,width=900){
 const age=Math.max(0,Number(boss.age)||0),arrival=boss.phase==='intro'?Math.max(0,1-age/1.1)**3*150:0;
 if(boss.reducedMotion)return {x:width-88+arrival,platformY:0,state:'idle'};
 const clock=Math.max(0,age-1.1),cycle=Math.floor(clock/4.8),time=clock-cycle*4.8;
 const variant=(hash(boss.type||'',Number(boss.flightSeed)||0)+cycle)%3;
 const order=variant===0?['jump','dash']:variant===1?['dash','jump']:['jump','jump'];
 const height=({sentinel:72,gunner:78,caster:86,sovereign:82})[boss.classId]||76;
 const a=maneuver(order[0],time-.55,height),b=maneuver(order[1],time-2.05,height);
 const active=a.state!=='idle'?a:b;
 return {x:width-88+active.x+arrival,platformY:active.y,state:active.state};
}
