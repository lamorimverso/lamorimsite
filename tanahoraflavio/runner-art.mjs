import {drawSpriteActor as drawActor} from "./runner-sprites.mjs?v=2d33118db0c5";
// Personagens em atlas WebP; itens e perigos continuam vetoriais em Canvas.
const INK='#292337',CREAM='#fff6e5';
function oval(c,x,y,rx,ry,fill,stroke=INK,w=1.8){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=w;c.stroke();}}
function box(c,x,y,w,h,fill,r=3,stroke=INK){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.8;c.stroke();}}
function path(c,points,fill,stroke=INK){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.8;c.stroke();}}
function line(c,points,color=INK,width=2){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();}
function text(c,value,x,y,size=7,color=CREAM){c.fillStyle=color;c.font='900 '+size+'px system-ui';c.textAlign='center';c.fillText(value,x,y);}

export {drawSpriteActor as drawActor,loadSprites,drawSpritePortrait,SPRITE_SHEET_COUNT} from "./runner-sprites.mjs?v=2d33118db0c5";
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

 // Jacaré cartunesco original: representação satírica, sem efeito médico real.
// Jacaré vetorial animado; o volume fica dentro da hitbox do motor.
// 'age' controla a metamorfose, sem transformar isso em um segundo salto.
export function drawJacare(c,{x,y,phase=0,age=1,reducedMotion=false}={}){
 c.save();c.translate(x,y);
 const motion=reducedMotion?0:Math.sin(phase*.95);
 const morph=reducedMotion?1:Math.min(1,.82+Math.max(0,age)/.30*.18);
 c.translate(0,-Math.abs(motion)*1.15);
 c.scale(morph,morph);
 const tailWave=reducedMotion?0:Math.sin(phase*.70)*3;
 path(c,[[-16,-12],[-34,-18-tailWave],[-32,-9+tailWave],[-17,-4]],'#438957','#22523c');
 oval(c,0,-13,23,11,'#4c9b61','#22523c',2.2);
 oval(c,18,-8,17,6,'#70b66d','#22523c',1.7);
 for(let i=0;i<3;i++)path(c,[[-13+i*11,-20],[-8+i*11,-27],[-2+i*11,-20]],'#36754c',null);
 // Os pés se alternam em vez de acompanhar um desenho rígido deslizando.
 for(let i=0;i<2;i++){
  const px=i===0?-12:12,stride=reducedMotion?0:Math.sin(phase*1.6+i*Math.PI)*3.2;
  oval(c,px+stride,-2.4,5.5,3.5,'#326b4b',null);
  line(c,[[px+stride-3,-.7],[px+stride+4,-.7]],'#22523c',1.5);
 }
 oval(c,-11,-23,5,6,'#69b86d','#22523c',1.5);oval(c,-11,-24,2,2,'#171e24',null);
 oval(c,8,-23,5,6,'#69b86d','#22523c',1.5);oval(c,8,-24,2,2,'#171e24',null);
 line(c,[[7,-5],[31,-5]],'#255337',1.8);
 for(let i=0;i<3;i++)path(c,[[10+i*6,-5],[13+i*6,-2],[15+i*6,-5]],CREAM,null);
 c.restore();
}

// Objeto à frente do braço: não envolve o corpo nem muda sua opacidade/colisão.
export function drawProtection(c,{x,y,crouching=false,remaining=0,foreground=false}){
 if(remaining<=0||!foreground)return;
 c.save();
 c.globalAlpha*=Math.min(1,remaining/.65);
 const cx=x+(crouching?49:44),cy=y-(crouching?24:29);
 line(c,[[cx-22,cy+4],[cx-8,cy+2]],'#754e3b',5);
 drawItem(c,{type:'shield',x:cx,y:cy,scale:crouching?1.1:1.4});
 c.restore();
}
// As poses de corrida são essenciais; reduzir efeitos só retira balanço e poeira.
// Animação visual contínua do agachamento (0 em pé, 1 totalmente abaixado).
// Estado físico/agachamento continua sob controle do motor para colisões exatas.
export function crouchAnimationStep(pose,target,seconds,reducedMotion=false){
 const to=target?1:0;
 if(reducedMotion)return to;
 const current=Number.isFinite(pose)?Math.min(1,Math.max(0,pose)):0;
 const dt=Number.isFinite(seconds)?Math.min(.05,Math.max(0,seconds)):0;
 const amount=Math.min(1,dt/.13);
 const next=current+(to-current)*amount;
 return Math.abs(to-next)<.002?to:next;
}
export function enemyMotionFor(type,phase=0,x=0){
 if(!['pf','janones','army','boulos','dino','xandao','haddad','lula'].includes(type)
   ||!Number.isFinite(phase)||phase<=0)return {bob:0,lean:0};
 const stride=phase*.8+(Math.abs(x)%67)/67*Math.PI*2;
 return {bob:-Math.abs(Math.sin(stride))*2.4,lean:Math.sin(stride)*.034};
}
export function drawThreat(c,item,ground,phase,{reducedMotion=false}={}){
 const x=item.x+item.width/2;c.save();c.translate(x,ground);
 if(item.action==='crouch'){
  // A coluna inteira é o perigo alto: não existe colisão invisível acima do ícone.
  const h=item.height||72,w=item.width||46;
  box(c,-w/2,-h,w,h,item.type==='wind'?'#b6e0ec':'#f3d7be',7,'#80527d');
  line(c,[[-w/2+5,-h+6],[w/2-5,-h+6]],'#fff4e7',2);
  c.translate(0,-(h-40)/2);
 }

 if(item.type==='falling-case'){
  // Mala em queda oblíqua, com silhueta de impacto claramente distinguível.
  c.save();if(!reducedMotion)c.rotate(Math.sin(phase*.23)*.16);
  box(c,-15,-33,30,30,'#9c5b83',5);box(c,-7,-39,14,7,'#e5ba88',2);
  line(c,[[-10,-24],[-10,-8]],'#e8c6e7',2.5);line(c,[[10,-24],[10,-8]],'#e8c6e7',2.5);
  c.restore();
 }
 else if(item.type==='rolling-case'){
  // Obstáculo de solo com movimento de rotação, não uma simples imagem estática.
  c.save();if(!reducedMotion)c.rotate(Math.sin(phase*.65)*.11);
  box(c,-18,-29,36,26,'#7f5e96',5);
  for(const wheel of [-11,11])oval(c,wheel,-2,4,4,'#2c2b3c','#f2cf86',1);
  line(c,[[-14,-23],[14,-23]],'#cfacdc',2);c.restore();
 }
 else if(item.type==='barrier'){box(c,-22,-28,44,12,'#f1bd65');for(let i=-15;i<20;i+=14)line(c,[[i,-27],[i+7,-17]],'#543b42',4);line(c,[[-15,-16],[-17,0]],INK,4);line(c,[[15,-16],[17,0]],INK,4);}
 else if(item.type==='wind'){
  for(let i=0;i<3;i++){c.beginPath();c.moveTo(-19,-32+i*12);c.bezierCurveTo(6,-40+i*12,20,-21+i*12,8,-19+i*12);c.strokeStyle='#236a8b';c.lineWidth=3;c.stroke();}
 }
 else if(item.type==='microphone'){
  line(c,[[-9,-3],[8,-23]],'#444056',6);oval(c,10,-27,10,9,'#716a83','#2d283e',2);line(c,[[4,-30],[14,-24]],'#cbc4d5',2);
 }
 else if(item.type==='popcorn'){
  path(c,[[-19,-25],[19,-25],[14,-1],[-14,-1]],'#e15262');for(let i=-9;i<=9;i+=9)line(c,[[i,-22],[i*.7,-4]],'#fff5db',4);
  for(const [px,py] of [[-14,-28],[-6,-32],[3,-30],[12,-31],[17,-25]])oval(c,px,py,6,5,'#fff2bd','#a58049',1);
 }
 else if(item.type==='case'){box(c,-17,-31,34,28,'#906490');box(c,-6,-37,12,6,'#e1b985',2);line(c,[[-8,-28],[-8,-7]],'#d9b88a',2);line(c,[[8,-28],[8,-7]],'#d9b88a',2);oval(c,-10,0,3,3,INK);oval(c,10,0,3,3,INK);}
 else if(item.type==='stamp'){box(c,-21,-15,42,13,'#a53e54');box(c,-8,-31,16,16,'#81584a');line(c,[[-23,-1],[23,-1]],'#e1a05e',3);text(c,'TAXA',0,-5,8,'#fff7e3');}
 else if((item.type==='receipts'||item.type==='paper-gate')){
  for(let i=0;i<3;i++){box(c,-18+i*10,-34+i*4,20,25,'#fff1cf',2);for(let j=0;j<3;j++)line(c,[[-14+i*10,-28+i*4+j*5],[-3+i*10,-28+i*4+j*5]],'#417884',1.5);}
  if(item.owner==='haddad')text(c,'TAXA',2,-35,7,'#a33e52');
 }
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
  const movement=enemyMotionFor(item.type,reducedMotion?0:phase,x);
  c.translate(0,movement.bob);c.rotate(movement.lean);
  drawActor(c,{type:item.type,x:0,y:0,scale:item.height/66,phase});
 }
 c.restore();
}
