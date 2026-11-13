// Complete illustrated anatomy, shared by standing, running and firing rigs.
// Identity heads stay in the original atlases. Limbs are closed shaded forms,
// never wide strokes; the caller supplies the same joints used by gameplay.
const INK='#292337',PAPER='#fff3df';
const profile=(style,suit,shade,light,inner,accent,extra={})=>Object.freeze({style,suit,shade,light,inner,accent,skin:'#edb38b',skinShade:'#b87159',shoulders:22,waist:17,arm:14,leg:15,...extra});
const profiles=Object.freeze({
 'meme-army':profile('spectral','#946394','#513551','#c39cc0','#d7b7d0','#dfb5a0',{skin:'#dbb5d7',skinShade:'#936a99',arm:15}),
 haddad:profile('tailored','#266b88','#123b56','#57a0ae','#f6eddb','#73aec6',{waist:19}),
 lula:profile('royal','#a53b50','#581d38','#d66a70','#fff1dc','#e8be55',{shoulders:25,waist:22,arm:16}),
 xandao:profile('robe','#343342','#171b2c','#68566c','#fff5e7','#a27bd6',{shoulders:23,waist:22}),
 pf:profile('tactical','#334d69','#172b40','#64809a','#2c3f52','#e5c856',{arm:17,leg:17,gloves:true}),
 army:profile('fatigues','#73844f','#35482c','#a2af6c','#465b36','#d5c178',{arm:16,leg:17,gloves:false}),
 janones:profile('double-breasted','#303f64','#17213c','#627496','#f5eee3','#d84e5e',{shoulders:23,waist:20}),
 joice:profile('blouse','#334c71','#192b49','#6486a5','#fff1dd','#dcb969',{waist:16,shoulders:22}),
 dilma:profile('fitted','#bc354a','#6d1d36','#eb6b72','#fff1e0','#e8c7a1',{shoulders:23,waist:18}),
 simone:profile('fitted','#247b9c','#16465f','#64b8c3','#f7f4e7','#86cad0',{waist:16}),
 soraya:profile('blouse','#32435f','#19283f','#6b7e98','#a37cc3','#dbc193',{shoulders:22,waist:17}),
 boulos:profile('casual','#815f48','#49392f','#b89570','#f0e6d0','#c45e55',{waist:22,shoulders:25,arm:16}),
 dino:profile('tailored','#344d70','#19283e','#6d85a4','#e6edf0','#cc6d71',{shoulders:25,waist:23,arm:16}),
 bossonari:profile('double-breasted','#535b85','#292e4c','#8891b8','#f0e6e4','#ce596b',{shoulders:24,waist:19}),
 flavio:profile('athletic-suit','#76409a','#422457','#b27ec8','#dac6e9','#efbf58',{shoulders:20,waist:16,arm:13}),
 'ze-gotinha':profile('mascot','#edf6ee','#9abfc5','#ffffff','#f8f9ed','#4284b2',{waist:23,shoulders:24,arm:16,leg:17,skin:'#f4f8ed',skinShade:'#a6c8ce'}),
 vorcaro:profile('waistcoat','#33475e','#1b2b40','#7b8da2','#eee8d9','#bba47b',{waist:19}),
 jair:profile('casual','#344e67','#1a2c40','#7f9aa6','#dfe7d9','#6da87c',{waist:20,shoulders:24}),
 michelle:profile('long-jacket','#49546f','#242c48','#8a98b0','#ecdcc4','#c7b590',{waist:16}),
 eduardo:profile('tailored','#3b5c88','#1d3452','#7c9ec4','#f2f1e9','#6f91b7',{shoulders:24}),
 carlos:profile('casual','#555d6b','#292f40','#929aaa','#d9e1e8','#9bb0c8',{waist:21}),
 renan:profile('athletic-suit','#3b5b79','#1b354c','#8baabf','#e6eaf0','#6f91ac',{waist:17,shoulders:21}),
 silas:profile('double-breasted','#52515a','#292634','#97939d','#f4eddf','#ba4e57',{shoulders:25,waist:22}),
 magno:profile('waistcoat','#7d425b','#40233c','#b98191','#f4e4cf','#cba56d',{shoulders:24,waist:22}),
 nikolas:profile('athletic-suit','#3d5272','#1c2f48','#8b9cb7','#eeeade','#b54d58',{shoulders:20,waist:15,arm:12}),
 tarcisio:profile('tailored','#416c89','#203b53','#85b3c6','#e7edf0','#9cc7cc',{shoulders:24,waist:21}),
 damares:profile('long-jacket','#32775c','#194a39','#78b695','#f3e7cd','#d1b36c',{shoulders:23,waist:19}),
 bia:profile('fitted','#8b3d58','#50263d','#c7798c','#f1e4ca','#dfb565',{waist:18}),
 trump:profile('royal','#39597d','#1b314f','#849cb9','#fff1df','#d64750',{shoulders:26,waist:23,arm:16}),
 milei:profile('long-jacket','#354e73','#192e4c','#809bc1','#e9ecdf','#7ab4d6',{shoulders:22,waist:18}),
 bolsominion:profile('casual','#e2c84c','#967638','#fff09a','#44845b','#38774e',{shoulders:23,waist:20})
});
const neutral=profile('tailored','#58647b','#2b334b','#8f9cb5',PAPER,'#d7bd8b');
export function characterBodyProfile(type){return profiles[type]||neutral;}
function gradient(c,x1,y1,x2,y2,colors){
 const g=c.createLinearGradient?.(x1,y1,x2,y2);if(!g||typeof g.addColorStop!=='function')return colors[1]||colors[0];
 colors.forEach((color,i)=>g.addColorStop(i/(colors.length-1),color));return g;
}
function fill(c,draw,color,stroke=INK,width=1.5){c.beginPath();draw();c.closePath();c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function line(c,points,color,width=1.2){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();}
function oval(c,x,y,rx,ry,color,stroke=null,width=1){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function patch(c,x,y,w,h,color,stroke=INK,r=2){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1;c.stroke();}}
function segment(c,a,b,startWidth,endWidth,p,{bare=false,back=false}={}){
 const dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy);if(length<.1)return;
 const color=bare?p.skin:p.suit,dark=bare?p.skinShade:p.shade,light=bare?'#ffd6ae':p.light;
 c.save();c.translate(a.x,a.y);c.rotate(Math.atan2(dy,dx));
 fill(c,()=>{c.moveTo(-2,-startWidth/2);c.bezierCurveTo(length*.30,-startWidth*.67,length*.76,-endWidth*.61,length,-endWidth/2);c.quadraticCurveTo(length+3,0,length,endWidth/2);c.bezierCurveTo(length*.7,endWidth*.70,length*.22,startWidth*.69,-2,startWidth/2);c.quadraticCurveTo(-5,0,-2,-startWidth/2);},gradient(c,0,-startWidth/2,0,startWidth/2,[light,color,dark]),INK,1.7);
 // Light and shadow follow the sleeve/trouser volume, not an outline stroke.
 fill(c,()=>{c.moveTo(0,-startWidth*.27);c.bezierCurveTo(length*.3,-startWidth*.48,length*.7,-endWidth*.4,length-1,-endWidth*.24);c.lineTo(length-2,-endWidth*.07);c.bezierCurveTo(length*.65,-endWidth*.14,length*.25,-startWidth*.18,0,-startWidth*.08);},light+'65',null);
 if(!bare){line(c,[[length*.68,endWidth*.25],[length*.8,0],[length*.92,endWidth*.25]],dark,1);line(c,[[length*.65,-endWidth*.3],[length*.82,-endWidth*.22]],light,1);}
 if(back){c.globalAlpha*=.18;fill(c,()=>{c.moveTo(0,0);c.lineTo(length,0);c.lineTo(length,endWidth/2);c.lineTo(0,startWidth/2);},dark,null);}
 c.restore();
}
function hand(c,arm,p){
 const h=arm.hand,b=arm.elbow,angle=Math.atan2(h.y-b.y,h.x-b.x),skin=p.gloves?'#354357':p.skin,shade=p.gloves?'#172334':p.skinShade;
 c.save();c.translate(h.x,h.y);c.rotate(angle);
 fill(c,()=>{c.moveTo(-5,-3.8);c.bezierCurveTo(-2,-6,4,-6,6,-2.8);c.quadraticCurveTo(8,1,4,4.5);c.bezierCurveTo(0,6,-4,4,-5,2);},gradient(c,-2,-5,3,5,[p.gloves?'#738094':'#ffe0b9',skin,shade]),INK,1.3);
 if(arm.open){
  for(let i=0;i<4;i++){const yy=-3.7+i*2.25,reach=[7,10,9,6][i];fill(c,()=>{c.moveTo(2,yy);c.bezierCurveTo(6,yy-1.1,reach+4,yy-1.1,reach+5,yy);c.quadraticCurveTo(reach+6,yy+1.2,reach+4,yy+1.8);c.lineTo(4,yy+2);},skin,shade,.7);}
  fill(c,()=>{c.moveTo(-1,2);c.bezierCurveTo(2,3,3,7,7,7);c.quadraticCurveTo(9,8,7,9);c.quadraticCurveTo(1,9,-2,5);},skin,shade,.8);
 }else{for(const yy of [-2,.3,2.6])line(c,[[2,yy],[5,yy-.4]],shade,.8);line(c,[[-1,2],[1,0],[4,.5]],shade,.9);}
 oval(c,-1,-2.7,2.2,1.1,p.gloves?'#8292a2':'#ffe5c6');c.restore();
}
export function drawCharacterArm(c,arm,{type='haddad',back=false}={}){
 const p=characterBodyProfile(type),short=p.style==='tactical'||p.style==='fatigues';
 segment(c,arm.shoulder,arm.elbow,p.arm,p.arm*.76,p,{back});
 segment(c,arm.elbow,arm.hand,p.arm*.75,7,p,{bare:short,back});
 const dx=arm.hand.x-arm.elbow.x,dy=arm.hand.y-arm.elbow.y,n=Math.hypot(dx,dy)||1;
 c.save();c.translate(arm.hand.x-dx/n*5,arm.hand.y-dy/n*5);c.rotate(Math.atan2(dy,dx));
 if(!short){patch(c,-2,-4.5,4,9,p.inner,INK,1);line(c,[[-1,-3],[-1,3]],p.light,.8);}
 c.restore();hand(c,arm,p);
}
function leg(c,part,p,back=false){
 const width=p.leg;segment(c,part.hip,part.knee,width,width*.74,p,{back});segment(c,part.knee,{x:part.foot.x,y:part.foot.y-5},width*.74,width*.62,p,{back});
 const x=part.foot.x,y=part.foot.y,mascot=p.style==='mascot';
 fill(c,()=>{c.moveTo(x-6,y-9);c.bezierCurveTo(x-11,y-8,x-15,y-6,x-15,y-3);c.quadraticCurveTo(x-14,y,x-9,y);c.lineTo(x+8,y);c.quadraticCurveTo(x+10,y-4,x+6,y-8);c.lineTo(x+3,y-10);},gradient(c,x,y-10,x,y,[mascot?'#75b7df':'#727486',mascot?'#286fa8':'#303443',mascot?'#184b77':'#161c2b']),INK,1.5);
 line(c,[[x-13,y-1],[x+7,y-1]],mascot?'#f2ecce':'#adb0b8',1.6);line(c,[[x-10,y-6],[x-3,y-7]],mascot?'#d8f6ff':'#8b8e9c',1.4);
 if(p.style==='tactical'||p.style==='fatigues')for(let i=0;i<3;i++)line(c,[[x-1,y-10-i*2],[x+4,y-10-i*2]],'#91a0a7',.8);
}
export function drawCharacterTorso(c,rig,{type='haddad',phase=0,reducedMotion=false}={}){
 const p=characterBodyProfile(type),top=rig.neck.y+3,hips=(rig.left.hip.y+rig.right.hip.y)/2,base=hips+5,cx=rig.neck.x;
 const w=p.shoulders,waist=p.waist,mid=top+(base-top)*.56,fold=reducedMotion?0:Math.sin(phase*.31)*1.2;
 if(p.style==='mascot'){
  fill(c,()=>{c.moveTo(cx-13,top);c.bezierCurveTo(cx-29,top+2,cx-30,base-2,cx-15,base+3);c.quadraticCurveTo(cx,base+9,cx+18,base+2);c.bezierCurveTo(cx+31,base-5,cx+24,top+2,cx+12,top);},gradient(c,cx-w,top,cx+w,base,[p.light,p.suit,p.shade]),INK,1.7);
  line(c,[[cx+4,top+7],[cx+8,mid],[cx+4,base]],'#ffffff',2.5);return;
 }
 fill(c,()=>{c.moveTo(cx-9,top);c.bezierCurveTo(cx-w-3,top+2,cx-w-3,top+9,cx-w+1,mid);c.quadraticCurveTo(cx-waist+2,base-7,cx-waist-3,base);c.quadraticCurveTo(cx-8,base+4,cx-1,base+1);c.quadraticCurveTo(cx+10,base+5,cx+waist+3,base);c.quadraticCurveTo(cx+waist-1,base-8,cx+w,mid);c.bezierCurveTo(cx+w+3,top+7,cx+w,top+2,cx+9,top);},gradient(c,cx-w,top,cx+w,base,[p.light,p.suit,p.shade]),INK,1.8);
 if(p.style==='tactical'||p.style==='fatigues'){
  const vest=p.style==='tactical';
  fill(c,()=>{c.moveTo(cx-13,top+5);c.quadraticCurveTo(cx,top+10,cx+14,top+5);c.lineTo(cx+17,base-3);c.quadraticCurveTo(cx,base+1,cx-17,base-3);},gradient(c,cx-16,top,cx+16,base,[p.suit,p.shade,p.shade]),INK,1.2);
  for(const dx of [-10,9]){patch(c,cx+dx-5,mid-2,10,12,p.suit,INK,2);patch(c,cx+dx-5,mid-3,10,4,p.light,INK,1);line(c,[[cx+dx-3,mid+3],[cx+dx+3,mid+3]],p.shade,1);}
  line(c,[[cx,top+8],[cx,base-4]],p.light,1.4);patch(c,cx-3,base-6,6,4,p.accent,INK,1);
  if(vest){c.fillStyle=p.accent;c.font='900 8px system-ui';c.textAlign='center';c.fillText('PF',cx,top+14);}
  else for(const [xx,yy] of [[-12,8],[8,14],[-3,25]]){oval(c,cx+xx,top+yy,4.5,2,'#334f3288');}
  return;
 }
 const robe=p.style==='robe',fitted=['fitted','blouse','long-jacket'].includes(p.style);
 fill(c,()=>{c.moveTo(cx-8,top);c.lineTo(cx+8,top);c.lineTo(cx+7,base-1);c.quadraticCurveTo(cx,base+1,cx-7,base-1);},gradient(c,cx-7,top,cx+8,base,[PAPER,p.inner,'#d1c7bc']),null);
 if(robe){
  for(const sign of [-1,1])fill(c,()=>{c.moveTo(cx+sign*10,top);c.quadraticCurveTo(cx+sign*26,mid,cx+sign*(29+fold),base+21);c.quadraticCurveTo(cx+sign*12,base+26,cx+sign*4,base+20);c.lineTo(cx+sign*8,top+10);},gradient(c,cx-25,top,cx+25,base,[p.light,p.suit,p.shade]),INK,1.5);
  fill(c,()=>{c.moveTo(cx-7,top+5);c.lineTo(cx+7,top+5);c.lineTo(cx+10,top+16);c.lineTo(cx+1,top+14);c.lineTo(cx-6,top+20);},PAPER,INK,1);
 }else{
  for(const sign of [-1,1]){
   fill(c,()=>{c.moveTo(cx+sign*9,top);c.quadraticCurveTo(cx+sign*17,top+6,cx+sign*13,top+10);c.lineTo(cx+sign*4,mid+5);c.lineTo(cx+sign*2,top+10);},gradient(c,cx-14,top,cx+14,mid,[p.light,p.suit,p.shade]),INK,1.1);
   line(c,[[cx+sign*10,top+5],[cx+sign*6,top+14]],p.light,1.4);
  }
  if(!fitted&&p.style!=='casual'){
   fill(c,()=>{c.moveTo(cx-2.5,top+6);c.lineTo(cx+2.5,top+6);c.lineTo(cx+4,top+10);c.lineTo(cx+1.5,top+12);c.lineTo(cx+4+fold*.3,base-6);c.lineTo(cx,base-2);c.lineTo(cx-3,base-7);c.lineTo(cx-1.5,top+12);c.lineTo(cx-4,top+10);},gradient(c,cx-3,top,cx+4,base,[p.accent,p.accent,p.shade]),INK,.8);
  }else if(p.style==='blouse'){
   fill(c,()=>{c.moveTo(cx-8,top+2);c.quadraticCurveTo(cx,top+15,cx+8,top+2);c.lineTo(cx+5,top+9);c.quadraticCurveTo(cx,top+18,cx-5,top+9);},p.inner,p.shade,1);
  }
  if(p.style==='waistcoat'||p.style==='double-breasted'){
   fill(c,()=>{c.moveTo(cx+12,top+12);c.lineTo(cx+7,base+2);c.lineTo(cx-1,base-1);c.lineTo(cx-6,base+2);c.lineTo(cx-12,top+12);c.lineTo(cx,top+20);},p.style==='waistcoat'?p.shade:p.suit,INK,1);
  }
  for(let i=0;i<(p.style==='double-breasted'?3:2);i++){const yy=mid+2+i*6;oval(c,cx+4,yy,1.4,1.4,p.accent,INK,.5);if(p.style==='double-breasted')oval(c,cx-6,yy,1.4,1.4,p.accent,INK,.5);}
 }
 // Tailoring remains visible on the small body: lapel, pocket, seams, belt.
 line(c,[[cx-waist+2,mid+5],[cx-waist+10,mid+4]],p.shade,2);line(c,[[cx-waist+2,mid+3],[cx-waist+10,mid+2]],p.light,.9);
 line(c,[[cx+waist-8,mid+7],[cx+waist-2,mid+5]],p.light,1);
 line(c,[[cx-waist+3,base-3],[cx-5,base-1]],p.shade,1.1);
 if(p.style==='royal'){for(const sign of [-1,1])line(c,[[cx+sign*15,top+4],[cx+sign*20,mid],[cx+sign*22,base]],p.accent,2);oval(c,cx+15,top+11,3,3,p.accent,INK,.7);}
 if(p.style==='long-jacket')for(const sign of [-1,1]){fill(c,()=>{c.moveTo(cx+sign*waist,base-8);c.quadraticCurveTo(cx+sign*(waist+4),base+6,cx+sign*(waist+5+fold),base+13);c.lineTo(cx+sign*4,base+8);c.lineTo(cx+sign*4,base-3);},p.suit,INK,1.2);}
}
export function drawCharacterBody(c,rig,{type='haddad',phase=0,reducedMotion=false,legs=true}={}){
 const p=characterBodyProfile(type);c.save();
 if(legs){leg(c,rig.right,p,true);leg(c,rig.left,p);}
 drawCharacterArm(c,rig.arms.right,{type,back:true});
 drawCharacterTorso(c,rig,{type,phase,reducedMotion});
 drawCharacterArm(c,rig.arms.left,{type});c.restore();
}
