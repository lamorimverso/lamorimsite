// Cenários vetoriais: três planos leves, sem texto nem elementos de colisão.
const palettes={
 brasilia:{sky:'#dceefa',haze:'#fcf9ed',far:'#b8d5d7',near:'#80aead',ink:'#577c86',stone:'#f8f6e8',shade:'#c4d8d5',road:'#dce3dc'},
 rio:{sky:'#d3f0f2',haze:'#fff7e0',far:'#a8cfc3',near:'#73b3a0',ink:'#478582',stone:'#f8f5de',shade:'#c7dfc8',road:'#e6ddc8'},
 argentina:{sky:'#dbe7f5',haze:'#fcf4df',far:'#bdcadb',near:'#90abbf',ink:'#647f9a',stone:'#fff6da',shade:'#d7ccb4',road:'#dce0e6'},
 florida:{sky:'#fbe4d5',haze:'#fff9e8',far:'#dfc6cb',near:'#b7bfc8',ink:'#927e8b',stone:'#ffe8d2',shade:'#d6b9ba',road:'#e6dcd1'},
 'casa-branca':{sky:'#e3eafa',haze:'#fcf7e8',far:'#c0ccdf',near:'#94b4a9',ink:'#718898',stone:'#fffff3',shade:'#d6dfe5',road:'#dce3d7'}
};
const wrap=(n,span)=>(n%span+span)%span;
function shape(c,fill,stroke,draw){c.beginPath();draw();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.3;c.stroke();}}
function rect(c,x,y,w,h,fill,stroke,r=0){shape(c,fill,stroke,()=>r?c.roundRect(x,y,w,h,r):c.rect(x,y,w,h));}
function oval(c,x,y,rx,ry,fill){shape(c,fill,null,()=>c.ellipse(x,y,rx,ry,0,0,Math.PI*2));}
function line(c,points,color,width=1.3){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function cloud(c,x,y,s){c.save();c.translate(x,y);c.scale(s,s);shape(c,'#ffffffc9','#ffffff88',()=>{c.moveTo(-36,8);c.bezierCurveTo(-53,4,-45,-10,-29,-9);c.bezierCurveTo(-31,-32,4,-37,13,-16);c.bezierCurveTo(32,-24,48,-8,37,7);c.closePath();});c.restore();}
function palm(c,x,y,p){line(c,[[x,y],[x-4,y-27],[x+2,y-65]],p.ink,4);for(const [dx,dy]of[[-27,-5],[-21,10],[24,-6],[29,12],[-3,-16]]){c.beginPath();c.moveTo(x+2,y-65);c.quadraticCurveTo(x+dx*.7,y-79+dy*.5,x+dx,y-65+dy);c.strokeStyle=p.near;c.lineWidth=5;c.stroke();}}

function skyline(c,stage,p,d,width){
 c.save();c.globalAlpha=.55;
 for(let i=-1;i<Math.ceil(width/190)+2;i++){
  const x=i*190-wrap(d*.027,190);
  if(stage.id==='rio'){
   shape(c,p.far,null,()=>{c.moveTo(x-12,222);c.bezierCurveTo(x+32,194,x+31,150,x+70,151);c.bezierCurveTo(x+111,151,x+114,215,x+194,222);c.closePath();});
  }else{
   rect(c,x+10,189,26,34,p.far,null,2);rect(c,x+44,175+(i%2)*13,35,48,p.far,null,2);rect(c,x+90,197,45,26,p.far,null,2);
  }
 }
 c.restore();
 // Uma faixa verde mantém a arquitetura distante da pista.
 shape(c,p.near+'48',null,()=>{c.moveTo(0,224);for(let x=0;x<=width+150;x+=150)c.quadraticCurveTo(x+75,211,x+150,224);c.lineTo(width,238);c.lineTo(0,238);c.closePath();});
}
function landmark(c,stage,p,width){
 const x=width*.70,base=226;c.save();c.translate(x,base);c.lineJoin='round';
 oval(c,0,4,134,5,p.ink+'18');
 if(stage.id==='brasilia'){
  rect(c,-126,-12,252,12,p.stone,p.ink,2);rect(c,-14,-104,12,92,p.stone,p.ink,1);rect(c,6,-104,12,92,p.stone,p.ink,1);
  rect(c,-10,-100,3,83,p.shade,null);rect(c,10,-100,3,83,p.shade,null);
  shape(c,p.stone,p.ink,()=>{c.moveTo(-111,-13);c.bezierCurveTo(-105,-54,-55,-54,-47,-13);c.closePath();});
  shape(c,p.shade,p.ink,()=>{c.moveTo(45,-42);c.bezierCurveTo(49,-4,102,-4,110,-42);c.closePath();});
  line(c,[[43,-42],[112,-42]],p.stone,4);line(c,[[-116,-7],[116,-7]],p.shade,2);
 }else if(stage.id==='rio'){
  shape(c,p.near,p.ink+'60',()=>{c.moveTo(-174,0);c.bezierCurveTo(-127,-5,-127,-89,-77,-90);c.bezierCurveTo(-32,-91,-30,-7,20,0);c.closePath();});
  shape(c,p.far,p.ink+'60',()=>{c.moveTo(-9,0);c.bezierCurveTo(17,-14,18,-111,67,-111);c.bezierCurveTo(108,-111,108,-18,154,0);c.closePath();});
  shape(c,'#ffffff25',null,()=>{c.moveTo(-122,-12);c.quadraticCurveTo(-107,-77,-77,-88);c.quadraticCurveTo(-86,-54,-82,-15);c.closePath();});
  line(c,[[-79,-91],[-79,-117]],p.stone,5);line(c,[[-94,-108],[-64,-108]],p.stone,5);oval(c,-79,-123,4,5,p.stone);
  line(c,[[-151,3],[151,3]],'#86bfb6',3);
 }else if(stage.id==='argentina'){
  rect(c,-126,-48,49,48,p.stone,p.ink,2);rect(c,76,-61,54,61,p.shade,p.ink,2);
  for(let i=0;i<3;i++)for(let j=0;j<3;j++){rect(c,-118+i*13,-40+j*13,6,7,p.ink+'77');rect(c,84+i*14,-52+j*16,7,9,p.stone);}
  shape(c,p.stone,p.ink,()=>{c.moveTo(-13,0);c.lineTo(-8,-119);c.lineTo(0,-139);c.lineTo(8,-119);c.lineTo(13,0);c.closePath();});
  shape(c,p.shade,null,()=>{c.moveTo(0,-137);c.lineTo(8,-119);c.lineTo(13,0);c.lineTo(0,0);c.closePath();});
  rect(c,-4,-24,5,13,p.ink+'8c');rect(c,-21,0,42,4,p.stone,p.ink,1);
 }else if(stage.id==='florida'){
  rect(c,-94,-64,78,64,'#f2c9bf',p.ink,3);rect(c,-16,-83,26,83,'#f8dfc8',p.ink,3);rect(c,10,-53,69,53,'#d7d1e6',p.ink,3);
  for(let i=0;i<4;i++){rect(c,-83,-53+i*13,55,4,p.stone);rect(c,21,-42+i*11,47,3,p.stone);}
  rect(c,-6,-68,6,52,p.shade);palm(c,-136,0,p);palm(c,124,0,p);
 }else{
  rect(c,-122,-56,244,56,p.stone,p.ink,2);rect(c,-47,-69,94,69,p.shade,p.ink,1);
  shape(c,p.stone,p.ink,()=>{c.moveTo(-57,-68);c.lineTo(0,-99);c.lineTo(57,-68);c.closePath();});
  for(let i=0;i<5;i++){rect(c,-38+i*17,-63,9,62,p.stone,p.ink+'66',1);}
  for(let i=0;i<3;i++){rect(c,-108+i*21,-43,9,16,p.ink+'88',null,1);rect(c,55+i*21,-43,9,16,p.ink+'88',null,1);}
  rect(c,-130,0,260,6,p.shade,p.ink,1);
 }
 c.restore();
}
export function drawScenery(c,{stage,distance=0,width=900,reducedMotion=false}){
 const p=palettes[stage.id]||palettes.brasilia,d=reducedMotion?0:distance;
 const sky=c.createLinearGradient(0,0,0,246);sky.addColorStop(0,p.sky);sky.addColorStop(1,p.haze);
 c.fillStyle=sky;c.fillRect(0,0,width,300);
 oval(c,width-66,55,29,29,'#fff7d838');oval(c,width-66,55,21,21,'#fff9e5d9');
 cloud(c,wrap(145-d*.016,width+140)-50,65,.73);cloud(c,wrap(510-d*.019,width+160)-50,91,.48);
 skyline(c,stage,p,d,width);landmark(c,stage,p,width);
 rect(c,0,234,width,11,p.near+'5c');line(c,[[0,234],[width,234]],p.ink+'55',1);
 rect(c,0,245,width,55,p.road);line(c,[[0,245],[width,245]],p.ink,1.5);line(c,[[0,249],[width,249]],'#ffffffb3',2);
 // Marcas baixas e bem espaçadas dão velocidade sem decorar a zona de perigo.
 for(let x=-wrap(d,98);x<width;x+=98){rect(c,x,275,38,3,'#ffffffa6',null,1);line(c,[[x+18,244],[x+55,244]],p.ink+'26',1);}
 line(c,[[0,296],[width,296]],p.ink+'18',1);
}
