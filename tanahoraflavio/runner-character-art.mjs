import {drawSpriteActor,drawSpriteHead} from './runner-sprites.mjs?v=9a9d2bd998a8';
import {heroShotPose} from './runner-hero-shot.mjs?v=4447edaa9d9a';
const INK='#292337',SKIN='#efb386';
function line(c,points,color,width){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.lineCap='round';c.lineJoin='round';c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function oval(c,x,y,rx,ry,fill,stroke=INK,width=1.5){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function polygon(c,points,fill,stroke=INK,width=1.5){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function arm(c,points,suit,width=8){line(c,points,INK,width+3);line(c,points,suit,width);const [x,y]=points.at(-1);oval(c,x,y,3.5,3.2,SKIN);}
export function drawBossonariHead(c){
 oval(c,0,-19,18,21,'#e7b68e','#583c4b',2);
 polygon(c,[[-18,-28],[-9,-42],[9,-42],[18,-30],[10,-33],[-10,-33]],'#302f43');
 oval(c,-6,-20,2,2,'#302f43',null);oval(c,6,-20,2,2,'#302f43',null);
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
 arm(c,[[-13+lean,s.y+2],[-22+lean,s.y+14],[-14+lean,waist+1]],'#66368c',crouching?5:7);
 polygon(c,[[neck.x-7,neck.y+2],[neck.x+8,neck.y+1],[7+lean,waist-1],[1+lean,waist+3],[-14+lean,waist+1],[-17+lean,s.y+5]],'#73459a');
 line(c,[[neck.x+3,neck.y+5],[lean-2,waist]],'#eab857',2.3);
 polygon(c,[[neck.x-9,neck.y+3],[neck.x-1,neck.y+9],[neck.x+8,neck.y+3],[neck.x+4,neck.y-2],[neck.x-6,neck.y-2]],'#9c67b7');
 // The firing arm extends, recoils and lowers; phone/blaster stays in its grip.
 arm(c,[[s.x,s.y],[p.elbow.x,p.elbow.y],[p.hand.x,p.hand.y]],'#7d4aa2',crouching?5:7.5);
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
 const p=specialRunnerPose(phase),suit=type==='army'?'#69754c':'#414267',dark=type==='army'?'#36452e':'#292b46';
 c.save();c.translate(x,y);c.scale(facing>0?-scale:scale,scale);
 for(const leg of [p.right,p.left]){
  line(c,[leg.hip,leg.knee,leg.foot],INK,12);line(c,[leg.hip,leg.knee,leg.foot],dark,8);
  const [xx,yy]=leg.foot;polygon(c,[[xx-9,yy-4],[xx+4,yy-5],[xx+8,yy],[xx+5,yy+2],[xx-10,yy+2]],'#252735');
 }
 arm(c,[[13,-53],[18+p.swing*9,-40],[7+p.swing*16,-34]],suit);
 polygon(c,[[-14,-57],[3,-61],[16,-54],[14,-29],[-15,-29],[-18,-46]],suit);
 if(type==='army'){
  polygon(c,[[-13,-54],[12,-54],[13,-31],[-13,-31]],dark);
  for(const xx of [-8,5])polygon(c,[[xx-4,-45],[xx+4,-45],[xx+4,-36],[xx-4,-36]],suit);
 }else{
  polygon(c,[[-5,-55],[5,-55],[5,-34],[-5,-34]],'#ece1e5',null);
  polygon(c,[[-2,-53],[2,-53],[4,-35],[0,-30],[-3,-35]],'#d3565f',null);
 }
 arm(c,[[-12,-53],[-20-p.swing*9,-40],[-8-p.swing*16,-35]],suit);
 if(type==='army')drawSpriteHead(c,{type,x:0,y:-51,size:40});
 else{c.save();c.translate(0,-51);drawBossonariHead(c);c.restore();}
 c.restore();return true;
}
