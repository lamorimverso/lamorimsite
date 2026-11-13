import {drawCharacterBody} from './runner-body-art.mjs?v=67badae0df52';
import {drawSpriteActor,drawSpriteHead} from './runner-sprites.mjs?v=aa3ca259afdd';
import {heroShotPose} from './runner-hero-shot.mjs?v=4447edaa9d9a';
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
/** Complete action body; the existing atlas supplies identity and running legs. */
export function drawHeroShot(c,{x=0,y=0,phase=0,age=0,crouching=false,airborne=false,falling=false,facing=1,alpha=1}={}){
 const p=heroShotPose({age,crouching,facing});
 c.save();c.translate(x,y);c.scale(p.facing,1);c.globalAlpha*=alpha;
 // Preserve real running/jumping/slide legs instead of freezing the whole sprite.
 c.save();c.beginPath();c.rect(-100,p.waist,200,120);c.clip();
 const ready=drawSpriteActor(c,{type:'flavio',x:0,y:0,scale:.95,phase,airborne,falling,landing:crouching,facing:1});c.restore();
 if(!ready){c.restore();return false;}
 const neck=p.neck,s=p.shoulder,lean=-p.kick*.4,waist=p.waist;
 const point=([x,y])=>({x,y});
 const firingRig={neck,left:{hip:{x:-8+lean,y:waist-3}},right:{hip:{x:8+lean,y:waist-3}},arms:{
  right:{shoulder:point([-13+lean,s.y+2]),elbow:point([-22+lean,s.y+14]),hand:point([-14+lean,waist+1]),open:false},
  left:{shoulder:s,elbow:p.elbow,hand:p.hand,open:false}
 }};
 drawCharacterBody(c,firingRig,{type:'flavio',phase,legs:false});
 c.save();c.translate(p.hand.x,p.hand.y);c.rotate(p.settle*.65);
 polygon(c,[[0,-5],[6,-5],[7,5],[0,5]],'#288fc0');line(c,[[1,-3],[4,-3]],'#ace8e9',1.5);oval(c,6,0,1.8,2.1,'#83e1ec',INK,1);c.restore();
 c.save();c.translate(neck.x,neck.y);c.rotate(-p.kick*.012+p.settle*.025);
 const head=drawSpriteHead(c,{type:'flavio',x:0,y:1,size:p.headSize});c.restore();
 if(p.state==='release'){
  c.save();c.translate(15,p.muzzle.y); // outer transform handles left-facing shots
  polygon(c,[[2,0],[9,-3],[6,-8],[13,-3],[19,0],[12,3],[7,8],[9,2]],'#fff4bc','#e6a24b',1.3);c.restore();
 }
 c.restore();return head;
}
export function specialRunnerPose(phase=0){
 const t=(Number.isFinite(phase)?phase:0)*Math.PI/2,s=Math.sin(t),co=Math.cos(t);
 return {left:{hip:[-8,-32],knee:[-8+s*10,-17-Math.max(0,co)*5],foot:[-8+s*18,-Math.max(0,-co)*8]},
  right:{hip:[8,-32],knee:[8-s*10,-17-Math.max(0,-co)*5],foot:[8-s*18,-Math.max(0,co)*8]},swing:s};
}
/** Only identities without a complete atlas run cycle take this route. */
export function drawSpecialRunner(c,{type,x=0,y=0,scale=.95,phase=0,facing=-1}={}){
 if(!['army','bossonari'].includes(type))return false;
 const p=specialRunnerPose(phase);
 c.save();c.translate(x,y);c.scale(facing>0?-scale:scale,scale);
 const point=([x,y])=>({x,y});
 const part=l=>({hip:point(l.hip),knee:point(l.knee),foot:point(l.foot)});
 const rig={left:part(p.left),right:part(p.right),neck:{x:0,y:-56},arms:{
  right:{shoulder:point([13,-53]),elbow:point([18+p.swing*9,-40]),hand:point([7+p.swing*16,-34]),open:false},
  left:{shoulder:point([-12,-53]),elbow:point([-20-p.swing*9,-40]),hand:point([-8-p.swing*16,-35]),open:false}
 }};
 drawCharacterBody(c,rig,{type,phase});
 if(type==='army')drawSpriteHead(c,{type,x:0,y:-51,size:40});
 else{c.save();c.translate(0,-51);drawBossonariHead(c);c.restore();}
 c.restore();return true;
}
