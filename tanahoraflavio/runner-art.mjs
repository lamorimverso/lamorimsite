import {drawSpriteActor as drawActor} from "./runner-sprites.mjs?v=20261028-fugindo-v1";
// Personagens da prancha em atlas PNG; itens e perigos continuam leves em Canvas.
const INK='#292337',SKIN='#edb57d',CREAM='#fff6e5';
function oval(c,x,y,rx,ry,fill,stroke=INK,w=1.8){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=w;c.stroke();}}
function box(c,x,y,w,h,fill,r=3,stroke=INK){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.8;c.stroke();}}
function path(c,points,fill,stroke=INK){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.8;c.stroke();}}
function line(c,points,color=INK,width=2){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();}
function text(c,value,x,y,size=7,color=CREAM){c.fillStyle=color;c.font='900 '+size+'px system-ui';c.textAlign='center';c.fillText(value,x,y);}
const COATS={flavio:'#754595',pf:'#284c70',janones:'#3e6c9c',army:'#68764c',boulos:'#7c558b',dino:'#89634b',xandao:'#393044',haddad:'#286778',lula:'#a33349',joice:'#294d77'};

export {drawSpriteActor as drawActor,loadSprites,drawSpritePortrait} from "./runner-sprites.mjs?v=20261028-fugindo-v1";
export function drawItem(c,{type,x,y,scale=1}){
 c.save();c.translate(x,y);c.scale(scale,scale);
 if(type==='shield'){
  path(c,[[-15,-17],[0,-22],[15,-17],[13,5],[7,13],[0,19],[-7,13],[-13,5]],'#3d669b');
  path(c,[[-11,-14],[0,-18],[11,-14],[9,3],[0,13],[-9,3]],'#1e426f','#e9c776');
  // Américas estilizadas; referência visual original, não um brasão oficial.
  path(c,[[-7,-11],[-1,-14],[5,-10],[2,-6],[4,-2],[0,0],[-3,-4],[-6,-5]],'#e9c776',null);
  path(c,[[2,0],[7,3],[5,8],[1,12],[-1,7],[0,3]],'#e9c776',null);
  oval(c,0,-17,1.4,1.4,CREAM,null);
 }else{
  const bible=type==='biblia';box(c,-12,-17,24,34,bible?'#70428e':'#274d80',3);box(c,8,-14,3,28,CREAM,1,null);
  if(bible){line(c,[[0,-11],[0,7]],'#f2cf77',3);line(c,[[-6,-5],[6,-5]],'#f2cf77',3);}
  else{oval(c,-1,-2,6.5,6.5,'#274d80','#f2cf77',1.5);line(c,[[-7,-2],[5,-2]],'#f2cf77',1);line(c,[[-1,-8],[-1,4]],'#f2cf77',1);line(c,[[-6,10],[5,10]],'#f2cf77',1.5);}
 }c.restore();
}
// Inimigos com um único quadro ganham passos discretos, sem alterar a
// física da colisão. Com movimento reduzido (phase=0), ficam estáticos.
export function enemyMotionFor(type,phase=0,x=0){
 if(!['pf','janones','army','boulos','dino','xandao','haddad','lula'].includes(type)
   ||!Number.isFinite(phase)||phase<=0)return {bob:0,lean:0};
 const stride=phase*.8+(Math.abs(x)%67)/67*Math.PI*2;
 return {bob:-Math.abs(Math.sin(stride))*2.4,lean:Math.sin(stride)*.034};
}
export function drawThreat(c,item,ground,phase){
 const x=item.x+item.width/2;c.save();c.translate(x,ground);
 if(item.type==='barrier'){box(c,-22,-28,44,12,'#f1bd65');for(let i=-15;i<20;i+=14)line(c,[[i,-27],[i+7,-17]],'#543b42',4);line(c,[[-15,-16],[-17,0]],INK,4);line(c,[[15,-16],[17,0]],INK,4);}
 else if(item.type==='case'){box(c,-17,-31,34,28,'#906490');box(c,-6,-37,12,6,'#e1b985',2);line(c,[[-8,-28],[-8,-7]],'#d9b88a',2);line(c,[[8,-28],[8,-7]],'#d9b88a',2);oval(c,-10,0,3,3,INK);oval(c,10,0,3,3,INK);}
 else if(item.type==='stamp'){box(c,-21,-15,42,13,'#a53e54');box(c,-8,-31,16,16,'#81584a');line(c,[[-23,-1],[23,-1]],'#e1a05e',3);}
 else if(item.type==='receipts'){for(let i=0;i<3;i++){box(c,-18+i*10,-34+i*4,20,25,'#fff1cf',2);for(let j=0;j<3;j++)line(c,[[-14+i*10,-28+i*4+j*5],[-3+i*10,-28+i*4+j*5]],'#417884',1.5);}}
 else if(item.type==='hammer'){
  // Martelo do chefão Xandão: cabo de madeira, cabeça metálica.
  c.save();c.rotate(-.35);
  box(c,-4,-38,9,37,'#9b654b',2);box(c,-23,-43,46,18,'#606575',4);
  box(c,-20,-41,40,6,'#a6acb8',2,null);c.restore();
 }
 else if(item.type==='mandado'){
  // Mandado de papel: legível como objeto arremessado, não uma pessoa.
  c.save();c.rotate(.13);box(c,-17,-40,34,39,'#fffaf0',2,'#816c8c');
  text(c,'MANDADO',0,-29,7,'#40384d');
  for(let i=0;i<3;i++)line(c,[[-11,-22+i*6],[11,-22+i*6]],'#80758b',1.5);
  line(c,[[-8,-6],[8,-6]],'#aa4966',2.6);c.restore();
 }
 else if(item.type==='lhand'){
  // Mão fazendo L (dedão aberto e indicador em pé); gesto satírico estilizado.
  c.save();c.rotate(-.12);
  c.beginPath();c.moveTo(-13,0);c.lineTo(-15,-17);c.lineTo(-10,-20);
  c.lineTo(-5,-17);c.lineTo(-5,-43);c.quadraticCurveTo(0,-49,5,-43);
  c.lineTo(5,-20);c.lineTo(20,-21);c.quadraticCurveTo(28,-19,23,-12);
  c.lineTo(5,-9);c.lineTo(5,1);c.quadraticCurveTo(-5,7,-13,0);c.closePath();
  c.fillStyle='#e6a97b';c.fill();c.strokeStyle=INK;c.lineWidth=2.5;c.stroke();
  line(c,[[-9,-10],[-4,-8]],'#ae6e57',1.5);c.restore();
 }
 else {
  const movement=enemyMotionFor(item.type,phase,x);
  c.translate(0,movement.bob);c.rotate(movement.lean);
  drawActor(c,{type:item.type,x:0,y:0,scale:item.height/66,phase});
 }
 c.restore();
}
export function drawShot(c,shot,x,y){
 if(shot.type==='biblia'){drawItem(c,{type:'biblia',x,y,scale:.72});return;}
 c.save();c.translate(x,y);c.rotate(-.25);box(c,-14,-6,28,12,CREAM,6);c.beginPath();c.roundRect(-14,-6,14,12,[6,0,0,6]);c.fillStyle='#50b4a3';c.fill();text(c,'IV',6,2.5,6,'#275c60');c.restore();
}
