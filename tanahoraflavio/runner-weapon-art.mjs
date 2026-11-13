// Complete, resolution-independent weapon bodies. Width scales uniformly;
// height changes the actual construction (cords, handles, sheet arrangements),
// never stretches a finished image or its lettering along one axis.
const INK='#30283c',WHITE='#fff5df';
export const COMPLETE_WEAPONS=Object.freeze(['hammer','mandado','microphone','handcuffs','barrier','stamp','message','lhand','receipts','paper-gate','budget-sheets','parachute-cross','cloroquina-prop','ivermectina-prop','rolling-case','falling-case','case','popcorn','wind']);
function grad(c,x1,y1,x2,y2,colors){const g=c.createLinearGradient?.(x1,y1,x2,y2);if(!g||typeof g.addColorStop!=='function')return colors[1]||colors[0];colors.forEach((v,i)=>g.addColorStop(i/(colors.length-1),v));return g;}
function shape(c,draw,color,stroke=INK,width=1.5){c.beginPath();draw();c.closePath();c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function line(c,pts,color,width=1.2){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();}
function box(c,x,y,w,h,color,r=2,stroke=INK){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.3;c.stroke();}}
function oval(c,x,y,rx,ry,color,stroke=null,width=1){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function label(c,s,x,y,size,color=INK){c.font='900 '+size+'px system-ui';c.textAlign='center';c.fillStyle=color;c.fillText(s,x,y);}
function paper(c,x,y,w,h,bend,{title='',budget=false}={}){
 shape(c,()=>{c.moveTo(x,y);c.quadraticCurveTo(x+w*.5,y+bend,x+w,y+1);c.lineTo(x+w+bend*.2,y+h-5);c.quadraticCurveTo(x+w*.65,y+h+bend,x,y+h);c.quadraticCurveTo(x-2+bend*.2,y+h*.5,x,y);},grad(c,x,y,x+w,y+h,['#ffffff','#f5ead0','#c6c9c4']),'#625c72',1.1);
 shape(c,()=>{c.moveTo(x+w-8,y+1);c.quadraticCurveTo(x+w-4,y+4+bend*.3,x+w,y+8);c.lineTo(x+w-7,y+7+bend*.4);},'#d9dedc','#8c8992',.8);
 if(title)label(c,title,x+w*.48,y+10,Math.min(6.6,w*.19),'#47465f');
 for(let i=0;i<3;i++){const yy=y+14+i*(h-20)/3;line(c,[[x+5,yy],[x+w-5,yy+bend*.12]],budget?'#77949b':'#8f8a94',.9);}
 if(budget){for(let i=0;i<3;i++)box(c,x+6+i*5,y+h-5-(i+1)*3,3,(i+1)*3,['#83b8b8','#4093a6','#bad0ae'][i],.5,null);}
 else{shape(c,()=>{c.moveTo(x+w-10,y+h-9);c.lineTo(x+w-13,y+h-1);c.lineTo(x+w-8,y+h-4);c.lineTo(x+w-4,y+h-1);c.lineTo(x+w-5,y+h-10);},'#9b3d55',null);oval(c,x+w-8,y+h-8,4.5,4.2,'#ba4b5b','#783748',.7);line(c,[[x+5,y+h-7],[x+w-15,y+h-7]],'#a75769',1.3);}
}
function ring(c,x,y,angle,f){
 c.save();c.translate(x,y);c.rotate(angle);
 c.beginPath();c.ellipse(0,0,11,12,0,0,Math.PI*2);c.ellipse(0,0,6.2,7.6,0,0,Math.PI*2);
 c.fillStyle=grad(c,-11,-12,11,12,['#edf9ff','#95b4c7','#3c617c']);c.fill('evenodd');c.strokeStyle='#314f67';c.lineWidth=1.4;c.stroke();
 // Hinged ratchet, exposed teeth and the moving latch are separate pieces.
 shape(c,()=>{c.moveTo(-9,-7);c.quadraticCurveTo(-6,-14,2,-11);c.lineTo(3+f,-8);c.quadraticCurveTo(-2,-12,-6,-5);},'#eaf6fc','#36576c',.9);
 box(c,7,-3,5,7,'#526d80',1,'#2f4c61');oval(c,9.6,.2,1,1.5,'#172b3c');
 line(c,[[-7,-8],[-4,-10]],'#ffffff',1.6);c.restore();
}
function bottle(c,H,f,g,isC){
 const top=-H+10,bottom=-3,liquid=-H*.46+f*2;
 box(c,-13,-H+1,26,9,grad(c,-13,0,13,0,['#c9c0df',isC?'#91649c':'#63879f','#3d4e6f']),2);
 for(let x=-10;x<=10;x+=4)line(c,[[x,-H+2],[x,-H+7]],'#e8e3f1',.7);
 shape(c,()=>{c.moveTo(-9,top);c.lineTo(9,top);c.quadraticCurveTo(11,top+4,17,top+8);c.lineTo(18,bottom-5);c.quadraticCurveTo(17,bottom,-14,bottom);c.quadraticCurveTo(-18,bottom,-18,bottom-6);c.lineTo(-17,top+8);c.quadraticCurveTo(-10,top+4,-9,top);},grad(c,-18,top,18,bottom,['#f3ffff',isC?'#eeddbb':'#c0e7ee','#7699b0']),'#4d5874',1.6);
 shape(c,()=>{c.moveTo(-15,liquid);c.bezierCurveTo(-5,liquid-3-g*2,6,liquid+3+g*2,15,liquid-f*2);c.lineTo(15,bottom-4);c.quadraticCurveTo(0,bottom+1,-15,bottom-4);},isC?'#d2ac507f':'#3188b278',null);
 for(let i=0;i<3;i++)oval(c,-8+i*8,Math.max(top+7,liquid-5-(g+1)*(i+1)*2),1.6,2.1,'#f2ffffc0',null);
 const ly=-H*.49+3;box(c,-16,ly,32,Math.min(14,H*.3),isC?'#93618c':'#337b9b',2,null);
 label(c,isC?'CLOROQ.':'IVERM.',0,ly+9,6.3,'#ffffff');
 line(c,[[-12,top+8],[-12,liquid-3]],'#ffffffc0',2.5);line(c,[[12,top+12],[13,top+22]],'#ffffff90',1.6);
}
function hand(c,H,f,g){
 const handBase=44-H,palmTop=handBase-37,wristTop=handBase-17;
 shape(c,()=>{c.moveTo(-10,-2);c.lineTo(-12,wristTop);c.quadraticCurveTo(-22,palmTop+15,-18,palmTop+11);c.quadraticCurveTo(-16,palmTop+7,-10,palmTop+14);c.lineTo(-8,palmTop+17);c.lineTo(-8,-H+7+f*2);c.bezierCurveTo(-8,-H-2,4,-H-2,5,-H+7+f*2);c.lineTo(5,palmTop+16);c.lineTo(17+g*2,palmTop+13);c.bezierCurveTo(28+g*2,palmTop+12,28+g*2,palmTop+25,18,palmTop+24);c.lineTo(8,palmTop+25);c.lineTo(8,-2);c.quadraticCurveTo(-1,2,-10,-2);},grad(c,-19,-H,19,0,['#ffe0ae','#eeb080','#a95f4d']),'#673d3b',1.8);
 shape(c,()=>{c.moveTo(-15,palmTop+15);c.quadraticCurveTo(-9,palmTop+17,-5,palmTop+27);c.lineTo(-8,-3);c.lineTo(-13,-5);},'#cf8764',null);
 shape(c,()=>{c.moveTo(-4,-H+7+f*2);c.quadraticCurveTo(-3,-H+1,1,-H+7+f*2);c.lineTo(0,palmTop+10);c.lineTo(-3,palmTop+12);},'#ffe7c3',null);
 line(c,[[8,palmTop+19],[20+g*2,palmTop+17]],'#ffe8c4',1.5);
 line(c,[[-11,palmTop+21],[-5,palmTop+23],[-3,palmTop+28]],'#a4604d',1.1);
 oval(c,-1,-H+7+f*2,2.9,4,'#f8d1b3','#c48a76',.65);
 line(c,[[-4,wristTop+7],[3,wristTop+5]],'#a96252',1);line(c,[[-5,wristTop+11],[4,wristTop+9]],'#efc7a2',1.2);
}
export function drawCompleteWeapon(c,{type,width=46,height=44,phase=0,reducedMotion=false}={}){
 if(!COMPLETE_WEAPONS.includes(type)||!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)return false;
 const scale=width/46,H=Math.max(28,height/scale),t=reducedMotion?0:Number(phase)||0,f=reducedMotion?0:Math.sin(t*.43),g=reducedMotion?0:Math.sin(t*.67);
 c.save();c.scale(scale,scale);
 if(type==='hammer'){
  const head=-H+12;box(c,-4,head+4,8,H-17,grad(c,-4,0,4,0,['#dcac72','#a36943','#684638']),2,'#513d3c');
  for(let i=0;i<4;i++)line(c,[[-3,-7-i*4],[3,-9-i*4]],'#684638',1);
  c.save();c.translate(0,head);c.rotate(f*.22);
  box(c,-22,-9,44,18,grad(c,-22,-9,22,9,['#dfe5ec','#7e8ba1','#39495d']),3,'#32374c');
  box(c,-24,-6,5,13,'#4c5970',1);box(c,19,-6,5,13,'#4c5970',1);
  box(c,-17,-7,34,4,'#e5edf5',1,null);box(c,-4,-4,8,11,'#9aabc0',1,'#4b5d77');
  line(c,[[-16,-1],[-5,-1]],'#bfcfdd',1.2);c.restore();
 }else if(type==='mandado'){
  paper(c,-17,-H+2,34,H-4,f*4,{title:'MANDADO'});
 }else if(['receipts','paper-gate','budget-sheets'].includes(type)){
  const budget=type==='budget-sheets',pageH=Math.max(26,H-13);
  c.save();c.translate(8,-H+8+g*2);c.rotate(.15+f*.08);paper(c,-11,0,25,pageH-3,g*3,{budget});c.restore();
  c.save();c.translate(-7,-H+2-f*2);c.rotate(-.12+g*.08);paper(c,-12,0,26,pageH,f*4,{title:budget?'BRL':'TAXA',budget});c.restore();
  paper(c,-1,-H+12+f*2,23,H-14,g*4,{budget});
 }else if(type==='handcuffs'){
  const a={x:-10-f*2,y:-H+14},b={x:10+f*2,y:-13};
  c.beginPath();c.moveTo(a.x+7,a.y+7);c.bezierCurveTo(-6+g*6,-H*.45,9-g*6,-H*.45,b.x-6,b.y-8);c.strokeStyle='#3c5a70';c.lineWidth=3.5;c.stroke();
  for(let i=0;i<3;i++){const q=(i+1)/4;oval(c,-5+q*11+g*(1-Math.abs(q-.5))*4,a.y+8+(b.y-a.y-16)*q,3.2,2.5,'#c9e2ed','#46677b',1.1);}
  ring(c,a.x,a.y,-.24+f*.14,g);ring(c,b.x,b.y,.24-g*.14,f);
 }else if(type==='cloroquina-prop'||type==='ivermectina-prop'){
  bottle(c,H,f,g,type==='cloroquina-prop');
 }else if(type==='lhand'){
  hand(c,H,f,g);
 }else if(type==='message'){
  const phoneH=Math.min(H-2,46);box(c,-15,-phoneH,30,phoneH-1,grad(c,-15,-phoneH,15,0,['#8795ad','#303d5b','#141d35']),4,'#20243a');
  box(c,-12,-phoneH+5,24,phoneH-10,grad(c,-12,-phoneH,12,0,['#e4f3f0','#b8d9dc','#7caebd']),2,'#293f59');
  box(c,-4,-phoneH+1.8,8,1.5,'#20263e',.6,null);oval(c,0,-4,1.5,1.4,'#d2dce5');
  const bubbleY=-H+Math.min(12,H*.2)+f*2;
  box(c,-22,bubbleY,33,17,'#fff2de',4,'#7e334c');
  shape(c,()=>{c.moveTo(-10,bubbleY+14);c.lineTo(-8,bubbleY+22);c.lineTo(-2,bubbleY+16);},'#fff2de','#7e334c',1);
  for(let i=0;i<3;i++)oval(c,-14+i*7,bubbleY+8+(i===1?g*2:0),1.8,1.8,'#bd4f6a');
  line(c,[[3,-phoneH+27],[9,-phoneH+27]],'#528b9c',1.4);label(c,'URGENTE',0,-phoneH*.27,4.6,'#8e354d');
 }else if(type==='microphone'){
  const headY=-H+12;
  c.beginPath();c.moveTo(-9,-2);c.bezierCurveTo(-20-f*4,8,3+g*5,11,13,4);c.strokeStyle='#5b4e70';c.lineWidth=2;c.stroke();
  box(c,-10,headY+8,10,H-20,grad(c,-10,0,0,0,['#a3a2b2','#4a4960','#25283d']),3,'#25283d');
  box(c,-9,-9,8,5,'#8c7794',1);box(c,-8,-8,3,2,'#c2abc7',.5,null);
  oval(c,-1,headY,13,12,grad(c,-13,headY-12,12,headY+12,['#ddd4e2','#7e7d98','#393f59']),'#302b44',1.5);
  for(let i=-2;i<=2;i++){line(c,[[-10,headY+i*3],[8,headY+i*3+f*.4]],'#404358',.8);line(c,[[-7+i*3,headY-9],[-7+i*3,headY+9]],'#bac2cf',.6);}
  oval(c,-5,headY-5,3.5,2,'#f0e5ec70');
 }else if(type==='stamp'){
  const compress=f*3,handleTop=-H+6+compress;
  box(c,-21,-13,42,11,grad(c,-21,-13,21,-2,['#e9838c','#b43a57','#6c2949']),2,'#57293f');
  box(c,-18,-5,36,3,'#563243',1,null);label(c,'TAXA',0,-6,7,WHITE);
  box(c,-7,handleTop+5,14,Math.max(4,-17-handleTop),grad(c,-7,0,7,0,['#ddb68a','#a36e51','#634332']),2);
  oval(c,0,handleTop,13,7,grad(c,-13,handleTop-7,13,handleTop+7,['#d9a37d','#9d634c','#5c3d38']),'#523b40',1.3);
  oval(c,-4,handleTop-2,5,1.8,'#eac5a1');
 }else if(type==='barrier'){
  const barY=-H+10+f*2;
  for(const sign of [-1,1]){
   shape(c,()=>{c.moveTo(sign*15-3,barY+6);c.lineTo(sign*15+3,barY+6);c.lineTo(sign*19+3,-2);c.lineTo(sign*19-4,-2);},grad(c,sign*15-3,barY,sign*19+3,0,['#b4c9d1','#6d8494','#374c60']),'#33445a',1.2);
   box(c,sign*19-6,-4,12,4,'#364255',1);
  }
  box(c,-22,barY,44,13,grad(c,-22,barY,22,barY+13,['#ffe49a','#e9b456','#a4773e']),2,'#605041');
  for(const x of [-15,0,15])shape(c,()=>{c.moveTo(x-5,barY+2);c.lineTo(x,barY+2);c.lineTo(x+7,barY+11);c.lineTo(x+2,barY+11);},'#353c4d',null);
  for(const x of [-18,18])oval(c,x,barY+6.5,1.4,1.4,'#f0f2db','#6a654e',.6);
  oval(c,0,barY-4,4,4,grad(c,-4,barY-8,4,barY,['#fff9bd',f>0?'#ffb85c':'#d98745','#a45d3a']),'#87543d');
 }else if(type==='parachute-cross'){
  const canopyY=-H+H*.41,inflate=f*3;
  shape(c,()=>{c.moveTo(-22,canopyY);c.bezierCurveTo(-22,-H+2-inflate,22,-H+2-inflate,22,canopyY);c.quadraticCurveTo(11,canopyY-5,0,canopyY);c.quadraticCurveTo(-11,canopyY-5,-22,canopyY);},grad(c,0,-H,0,canopyY,['#ffffff','#dcebdc','#8bb5b6']),'#476d79',1.4);
  for(const sign of [-1,1]){shape(c,()=>{c.moveTo(sign*3,-H+5-inflate*.6);c.bezierCurveTo(sign*12,-H+8,sign*13,canopyY-10,sign*9,canopyY-2);c.quadraticCurveTo(sign*15,canopyY-6,sign*21,canopyY-1);c.bezierCurveTo(sign*20,-H+14,sign*10,-H+5,sign*3,-H+5-inflate*.6);},sign<0?'#c0dad3':'#eaf5e8',null);c.beginPath();c.moveTo(sign*3,-H+5-inflate*.6);c.bezierCurveTo(sign*12,-H+10,sign*11,canopyY-8,sign*9,canopyY-2);c.strokeStyle='#9abdbb';c.lineWidth=1.2;c.stroke();}
  const crossY=-13;for(const x of [-21,0,21])line(c,[[x,canopyY],[x*.35,crossY-5]],'#537b86',1.1);
  shape(c,()=>{c.moveTo(-4,crossY-8);c.lineTo(4,crossY-8);c.lineTo(4,crossY-2);c.lineTo(11,crossY-2);c.lineTo(11,crossY+5);c.lineTo(4,crossY+5);c.lineTo(4,-1);c.lineTo(-4,-1);c.lineTo(-4,crossY+5);c.lineTo(-11,crossY+5);c.lineTo(-11,crossY-2);c.lineTo(-4,crossY-2);},grad(c,-10,crossY-8,10,0,['#fff0a2','#d5ad55','#926f3d']),'#735440',1.2);
  line(c,[[-2,crossY-6],[-2,-4]],'#fff4b7',1.5);
 }else if(['case','falling-case','rolling-case'].includes(type)){
  const rolling=type==='rolling-case',top=-H+9;
  box(c,-7,-H+2-f*2,14,9+f*2,'#8f6b83',2,'#49384f');box(c,-4,-H+5-f*2,8,4+f*2,'#ead5be',1,null);
  box(c,-21,top,42,H-12,grad(c,-21,top,21,0,['#b28bae','#815e91','#47384f']),5,'#3e3149');
  box(c,-18,top+3,36,H-18,'#9a75a3',3,'#bd95ba');
  for(const x of [-12,12]){box(c,x-2,top+1,4,H-14,grad(c,x-2,top,x+2,0,['#edd0ad','#bc966f','#8d6a51']),1,'#674c47');box(c,x-3,top+8+g,6,5,'#e5c695',1,'#795b45');}
  line(c,[[-6,top+5],[6,top+5]],'#ceb1cc',1.2);box(c,-5,top+H*.4,10,5,'#c8b4c3',1,'#58475d');
  if(rolling)for(const x of [-12,12]){oval(c,x,-2,4.8,4.4,'#2e2b40','#c5b5ac',1.3);const a=t*.7;line(c,[[x-Math.cos(a)*3,-2-Math.sin(a)*3],[x+Math.cos(a)*3,-2+Math.sin(a)*3]],'#e2c899',1);}
 }else if(type==='popcorn'){
  const top=-H+13;
  shape(c,()=>{c.moveTo(-20,top);c.lineTo(20,top);c.lineTo(14,-2);c.quadraticCurveTo(0,2,-14,-2);},grad(c,-20,top,20,0,['#fa8c82','#d64f65','#8d3458']),'#783447',1.4);
  for(const x of [-11,0,11])shape(c,()=>{c.moveTo(x-3,top+2);c.lineTo(x+3,top+2);c.lineTo(x*.7+2,-3);c.lineTo(x*.7-2,-3);},'#fff0d1',null);
  for(let i=0;i<6;i++){const x=-17+i*7,yy=top-3-(i%2)*4+Math.sin(reducedMotion?0:t*.4+i)*2;oval(c,x,yy,5.6,4.7,grad(c,x-5,yy-5,x+5,yy+5,['#fff9db','#f0d99b','#c89a61']),'#947248',.7);oval(c,x+1,yy-1,2,1.3,'#ffffffa0');}
 }else if(type==='wind'){
  shape(c,()=>{c.moveTo(-21,-H+5);c.bezierCurveTo(-28-f*2,-H*.73,-7+g*2,-H*.6,-16,-H*.43);c.bezierCurveTo(-18,-H*.24,-4-f*2,-H*.17,-7,-2);c.quadraticCurveTo(1,3,7,-2);c.bezierCurveTo(3,-H*.21,18,-H*.29,12,-H*.45);c.bezierCurveTo(7,-H*.6,30+g*2,-H*.75,21,-H+5);c.quadraticCurveTo(0,-H-2,-21,-H+5);},grad(c,-21,-H,17,0,['#c0eef07c','#65b4c083','#39869b68']),null);
  for(let i=0;i<5;i++){
   const yy=-H+7+i*(H-10)/5,sway=Math.sin(reducedMotion?i:t*.38+i)*3,w=20-i*2;
   shape(c,()=>{c.moveTo(-w,yy+sway);c.bezierCurveTo(-w-5,yy-7,w+8,yy-7,w,yy+2);c.bezierCurveTo(w-1,yy+7,-w+6,yy+7,-w+3,yy+2);c.bezierCurveTo(-w+4,yy-2,w-4,yy-2,w-1,yy+1);c.bezierCurveTo(w-1,yy-4,-w+1,yy-4,-w,yy+sway);},grad(c,-w,yy-5,w,yy+6,['#c0eef0','#4fabbf','#247589']),null);
   line(c,[[-w+3,yy-2],[w-4,yy-2+g]],'#e8fcf1',1.1);
  }
 }
 c.restore();return true;
}
