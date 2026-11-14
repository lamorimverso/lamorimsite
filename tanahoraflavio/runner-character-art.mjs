import {soldierVariantFor} from './runner-soldier-variants.mjs?v=4bf435291c82';
import {drawSpriteActor,drawCombatSprite} from './runner-sprites.mjs?v=94bad35aaa14';
import {heroShotPose} from './runner-hero-shot.mjs?v=8ecaa9d24db1';
const INK='#292337';
function line(c,points,color,width){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.lineCap='round';c.lineJoin='round';c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function oval(c,x,y,rx,ry,fill,stroke=INK,width=1.5){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function polygon(c,points,fill,stroke=INK,width=1.5){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
export function drawBossonariHead(c){
 // Original fictional identity: same oval face and navy hair silhouette,
 // now with complete ears, eyes, brows, nose, mouth and material shading.
 oval(c,-17,-18,4.3,7,'#cf9577','#704b50',1.1);oval(c,17,-18,4.3,7,'#cf9577','#704b50',1.1);
 const g=c.createLinearGradient?.(-16,-35,17,-2);if(g&&typeof g.addColorStop==='function'){g.addColorStop(0,'#ffe0b1');g.addColorStop(.52,'#e7b68e');g.addColorStop(1,'#b17a66');}
 oval(c,0,-19,18,21,g&&typeof g.addColorStop==='function'?g:'#e7b68e','#583c4b',2);
 polygon(c,[[-18,-28],[-9,-42],[9,-42],[18,-30],[10,-33],[-10,-33]],'#302f43');
 line(c,[[-12,-33],[-7,-38],[5,-38],[11,-34]],'#646174',1.5);
 for(const x of [-6,6]){oval(c,x,-20,3.4,3,'#fff7e5','#65484c',.8);oval(c,x-.8,-20,1.8,2.3,'#3a3545');oval(c,x-1.4,-20.8,.65,.7,'#ffffff');}
 line(c,[[-11,-25],[-6,-27],[-2,-24]],'#38313f',2);line(c,[[3,-24],[8,-26],[12,-24]],'#38313f',2);
 c.beginPath();c.moveTo(-1,-19);c.bezierCurveTo(-2,-16,-5,-13,-1,-12);c.quadraticCurveTo(2,-11,4,-13);c.strokeStyle='#aa735e';c.lineWidth=1.2;c.stroke();
 c.beginPath();c.moveTo(-8,-7);c.quadraticCurveTo(-1,-3,8,-8);c.quadraticCurveTo(3,-.5,-2,-2);c.quadraticCurveTo(-6,-2,-8,-7);c.closePath();c.fillStyle='#70404d';c.fill();
 line(c,[[-5,-6],[1,-5.4],[5,-6.4]],'#fff0db',1.4);line(c,[[-4,-.8],[3,-1.3]],'#edc8a5',1.2);
}
/** Firing uses complete illustrated keyframes; complete slide stays below high attacks. */
export function drawHeroShot(c,{x=0,y=0,phase=0,age=0,crouching=false,airborne=false,falling=false,facing=1,alpha=1}={}){
 const p=heroShotPose({age,crouching,airborne,facing});
 const type=crouching?'flavio-slide-shot':airborne?'flavio-air-shot':'flavio';
 const frame=p.state==='release'?2:p.state==='recoil'?1:p.settle<.8?3:0;
 const ready=drawCombatSprite(c,{type,x,y,scale:.95,frame,facing,alpha})||
  drawSpriteActor(c,{type:'flavio',x,y,phase,airborne,falling,landing:crouching,facing,alpha});
 if(ready&&p.state==='release'){
  c.save();c.translate(x+p.muzzle.x,y+p.muzzle.y);c.scale(p.facing,1);c.globalAlpha*=alpha;
  polygon(c,[[0,0],[5,-3],[4,-7],[10,-3],[17,0],[10,3],[4,7],[5,2]],'#fff4bc','#e6a24b',1.1);c.restore();
 }
 return ready;
}
export function specialRunnerPose(phase=0){
 const t=(Number.isFinite(phase)?phase:0)*Math.PI/2,s=Math.sin(t),co=Math.cos(t);
 return {left:{hip:[-8,-32],knee:[-8+s*10,-17-Math.max(0,co)*5],foot:[-8+s*18,-Math.max(0,-co)*8]},
  right:{hip:[8,-32],knee:[8-s*10,-17-Math.max(0,-co)*5],foot:[8-s*18,-Math.max(0,co)*8]},swing:s};
}
/** Only identities without a complete atlas run cycle take this route. */
export function drawSpecialRunner(c,{type,x=0,y=0,scale=.95,phase=0,facing=-1,armyVariant='brasilia'}={}){
 if(!['army','bossonari'].includes(type))return false;
 return drawCombatSprite(c,{type:type==='army'?soldierVariantFor(armyVariant).actor:type+'-run',x,y,scale,frame:Math.floor(Math.max(0,phase))%4,facing});
}
