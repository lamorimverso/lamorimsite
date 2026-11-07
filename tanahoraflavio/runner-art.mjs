import {drawSpriteActor as drawActor} from "./runner-sprites.mjs?v=4ff31d443151";
// Personagens em atlas WebP; itens e perigos continuam vetoriais em Canvas.
const INK='#292337',CREAM='#fff6e5';
function oval(c,x,y,rx,ry,fill,stroke=INK,w=1.8){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=w;c.stroke();}}
function box(c,x,y,w,h,fill,r=3,stroke=INK){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.8;c.stroke();}}
function path(c,points,fill,stroke=INK){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.8;c.stroke();}}
function line(c,points,color=INK,width=2){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();}
function text(c,value,x,y,size=7,color=CREAM){c.fillStyle=color;c.font='900 '+size+'px system-ui';c.textAlign='center';c.fillText(value,x,y);}

export {drawSpriteActor as drawActor,loadSprites,drawSpritePortrait,SPRITE_SHEET_COUNT,CORE_SPRITE_SHEET_COUNT} from "./runner-sprites.mjs?v=4ff31d443151";
// Visual de sátira: antagonistas suspensos, sem passos de corrida.
export function drawMemeArmy(c,{x=0,y=0,phase=0,scale=1,reducedMotion=false}={}){
 c.save();c.translate(x,y);c.scale(scale,scale);
 if(!reducedMotion)c.translate(0,Math.sin(phase*.65)*2);
 // Silhueta vetorial original: chapéu e pernas flutuando.
 line(c,[[-9,-18],[-22,-2],[-27,4]],'#7c466d',8);
 line(c,[[6,-18],[17,-4],[23,5]],'#715273',8);
 line(c,[[-22,0],[-28,4]],'#372b44',3);
 line(c,[[19,4],[28,7]],'#372b44',3);
 path(c,[[-21,-31],[-7,-39],[14,-37],[25,-26],[10,-18],[-11,-18]],'#b63b59','#603252');
 oval(c,0,-25,11,13,'#e584a2','#603252',2);
 oval(c,-4,-28,2,3,'#2e2139',null);oval(c,5,-28,2,3,'#2e2139',null);
 path(c,[[-25,-39],[-14,-49],[13,-49],[27,-40],[15,-34],[-13,-34]],'#ac3757','#5c2845');
 line(c,[[-22,-36],[-27,-31]],'#ecb7c5',2);
 line(c,[[14,-39],[21,-36]],'#f5b8bc',2);
 c.restore();
}
export function drawBossOfBosses(c,{x=0,y=0,phase=0,preparing=false,attacking=false,reducedMotion=false}={}){
 c.save();c.translate(x,y);
 if(!reducedMotion)c.translate(0,Math.sin(phase*.42)*2.2);
 oval(c,0,-46,30,39,attacking?'#efd3f4aa':'#d8c4f05c',null);
 path(c,[[-29,-10],[-20,-53],[-8,-67],[11,-67],[23,-49],[27,-10]],'#414267','#292337');
 box(c,-5,-49,11,31,'#ece1e5',2,null);
 path(c,[[-3,-42],[3,-42],[6,-15],[1,-6],[-4,-15]],'#d3565f',null);
 oval(c,0,-73,18,21,'#e7b68e','#583c4b',2);
 path(c,[[-18,-82],[-9,-96],[9,-96],[18,-84],[10,-87],[-10,-87]],'#302f43');
 oval(c,-6,-74,2,2,'#302f43',null);oval(c,6,-74,2,2,'#302f43',null);
 line(c,[[-29,-51],[-40,-30]],'#414267',10);line(c,[[29,-51],[40,-30]],'#414267',10);
 if(preparing||attacking){oval(c,39,-29,8,7,'#cce1ff','#514369',2);text(c,'!',39,-27,12,'#713f5c');}
 text(c,'BOSSONARI',0,-105,11,'#552e53');c.restore();
}
export function drawPhantomCloud(c,{x=0,y=0,phase=0,hitFor=0,reducedMotion=false}={}){
 c.save();c.translate(x,y);
 for(const dx of [-46,0,44]){
  c.save();c.translate(dx,reducedMotion?0:Math.sin(phase*.43+dx)*3);
  c.globalAlpha*=hitFor>0?.3+.5*Math.max(0,1-hitFor/1.3):.72;
  c.fillStyle='#e3ddf4';c.strokeStyle='#756c9b';c.lineWidth=2;
  c.beginPath();c.moveTo(-13,13);c.lineTo(-13,-14);
  c.bezierCurveTo(-13,-32,13,-32,13,-14);c.lineTo(13,13);
  c.lineTo(7,8);c.lineTo(2,13);c.lineTo(-4,8);c.closePath();c.fill();c.stroke();
  oval(c,-5,-12,2,3,'#573e77',null);oval(c,5,-12,2,3,'#573e77',null);
  c.restore();
 }
 c.restore();
}
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
export function jacareBlendFor(player,reducedMotion=false){
 let jacare=player.isJacare?Math.min(1,Math.max(0,Number(player.jacareAge)||0)/.3):Math.min(1,Math.max(0,Number(player.restoreFlashFor)||0)/.48);
 if(reducedMotion)jacare=player.isJacare?1:0;
 return {human:1-jacare,jacare};
}
export function drawJacare(c,{x,y,phase=0,age=1,reducedMotion=false}={}){
 if(drawActor(c,{type:'jacare',x,y,phase,scale:1}))return;
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
export function fallingThreatGeometry(item,ground=246){
 return {centerX:item.x+item.width/2,bodyY:ground-item.y,width:item.width,height:item.height,
  showBody:item.age>=item.warningFor,progress:Math.min(1,Math.max(0,item.age/item.warningFor)),ground};
}
export function manholeThreatGeometry(item,ground=246){
 return {centerX:item.x+item.width/2,ground,width:item.width,
  open:item.age>=item.warningFor&&item.age<item.warningFor+item.activeFor,
  progress:Math.max(0,Math.min(1,item.age/item.warningFor))};
}
export function drawManholeThreat(c,item,ground=246){
 const g=manholeThreatGeometry(item,ground);c.save();
 // A fixed floor marker becomes the opening; it never chases the runner.
 oval(c,g.centerX,ground+1,g.width/2,7,g.open?'#252438':'#9ba6a5','#655548',2);
 if(g.open){
  oval(c,g.centerX,ground+1,g.width/2-7,4,'#15172a',null);
  for(const side of [-1,1])line(c,[[g.centerX+side*(g.width/2+3),ground-4],[g.centerX+side*(g.width/2+10),ground-10]],'#ba6942',3);
 }else{
  for(let dx=-18;dx<=18;dx+=9)line(c,[[g.centerX+dx,ground-2],[g.centerX+dx,ground+3]],'#526567',1.5);
  line(c,[[item.x,ground+12],[item.x+g.width*g.progress,ground+12]],'#bb6841',3);
  text(c,'↔',g.centerX,ground-23,20,'#8b3b3d');
 }
 c.restore();
}
export function drawFallingThreat(c,item,ground=246){
 const g=fallingThreatGeometry(item,ground);c.save();
 box(c,item.x+3,ground+3,item.width-6,5,'#a73e50',2,null);
 line(c,[[item.x+3,ground+11],[item.x+3+(item.width-6)*g.progress,ground+11]],'#da9a63',2);
 if(!g.showBody){
  text(c,'↔',g.centerX,ground-64,23,'#8a3348');
 }else if(item.type==='pfizer-ampoule'){
  // Ampola cenográfica: arte no mesmo alvo e na mesma altura de colisão.
  box(c,g.centerX-13,g.bodyY-24,26,9,'#5b7a88',3,'#31566b');
  box(c,g.centerX-17,g.bodyY-16,34,40,'#e3f7ff',8,'#397f9c');
  box(c,g.centerX-17,g.bodyY-3,34,17,'#288db7',2,null);
  text(c,'Pfizer',g.centerX,g.bodyY+8,9,'#ffffff');
  line(c,[[g.centerX-9,g.bodyY-13],[g.centerX+9,g.bodyY-13]],'#90cadf',2);
 }else{
  box(c,item.x,g.bodyY-item.height/2,item.width,item.height,'#8d557c',5,'#342a46');
  box(c,g.centerX-7,g.bodyY-item.height/2-6,14,6,'#e7c68d',2,'#342a46');
  for(const x of [item.x+11,item.x+item.width-11])line(c,[[x,g.bodyY-14],[x,g.bodyY+14]],'#ead5c7',3);
 }
 c.restore();
}
export function drawThreat(c,item,ground,phase,{reducedMotion=false}={}){
 const x=item.x+item.width/2;c.save();c.translate(x,ground);
 if(item.action==='crouch'){
  // Sem painel retangular: o objeto ocupa a mesma altura de colisão.
  const h=item.height||72;
  c.scale(1,h/44);
 }

 if(item.type==='meme-ghost'){
  drawMemeArmy(c,{phase,reducedMotion,scale:.88});
 }
 else if(item.type==='cloroquina-prop'||item.type==='ivermectina-prop'){
  // Frascos fictícios, jamais indicação de medicamento.
  const isC=item.type==='cloroquina-prop';
  c.save();c.rotate(isC?-.22:.18);
  box(c,-19,-37,38,33,isC?'#f7e2a2':'#c5e5f0',6,'#6a5877');
  box(c,-14,-42,28,7,isC?'#9c6ca7':'#5f88a1',3,'#6a5877');
  box(c,-18,-22,36,12,isC?'#8b628f':'#417e9b',3,null);
  text(c,isC?'CLOROQ.':'IVERM.',0,-13,8,'#ffffff');
  c.restore();
 }
 else if(item.type==='message'){
  box(c,-21,-34,42,33,'#fff5e6',4,'#a23d50');line(c,[[-16,-27],[0,-15],[16,-27]],'#b44758',2);
  text(c,'URGENTE',0,-4,7,'#8d314a');
 }
 else if(item.type==='falling-case'){
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
 else if(item.type==='budget-sheets'){
  // Simone: planilhas de orçamento soltas.
  c.save();c.rotate(-.08);
  box(c,-20,-40,25,38,'#fff7df',2,'#476b7f');
  line(c,[[-15,-34],[-1,-34]],'#527c93',1.5);
  for(let i=0;i<3;i++)line(c,[[-15,-26+i*7],[-2,-26+i*7]],'#8cacae',1);
  box(c,1,-34,21,32,'#f7fbff',2,'#49748c');
  text(c,'BRL',11,-25,7,'#34546a');
  for(let i=0;i<3;i++)box(c,4+i*5,-6-(i+1)*5,3,(i+1)*5,'#64a4ac',1,null);
  c.restore();
 }
 else if(item.type==='parachute-cross'){
  // Soraya: cruz cenográfica suspensa por paraquedas.
  c.save();
  c.beginPath();c.moveTo(-23,-28);c.bezierCurveTo(-19,-49,19,-49,23,-28);
  c.quadraticCurveTo(11,-34,0,-28);c.quadraticCurveTo(-11,-34,-23,-28);
  c.closePath();c.fillStyle='#e6f0e8';c.fill();c.strokeStyle='#537c7e';c.lineWidth=2;c.stroke();
  line(c,[[-23,-28],[-9,-16]],'#63878b',1.4);
  line(c,[[23,-28],[9,-16]],'#63878b',1.4);
  line(c,[[0,-28],[0,-19]],'#63878b',1.4);
  path(c,[[-4,-19],[4,-19],[4,-13],[10,-13],[10,-7],[4,-7],[4,0],[-4,0],[-4,-7],[-10,-7],[-10,-13],[-4,-13]],'#e6ba66','#744e56');
  c.restore();
 }
 else if(item.type==='handcuffs'){
  // Joice e PF: algemas soltas com corrente, sem moldura.
  c.save();c.rotate(.12);
  oval(c,-11,-30,10,11,'#b8ccd7','#486278',2.5);
  oval(c,-11,-30,5.5,6.5,'#e9f4f9','#486278',1.4);
  line(c,[[-4,-23],[5,-17]],'#657d91',4);
  oval(c,11,-10,10,11,'#b8ccd7','#486278',2.5);
  oval(c,11,-10,5.5,6.5,'#e9f4f9','#486278',1.4);
  c.restore();
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
  // O inimigo paira sem ciclar os quadros de corrida do sprite.
  drawActor(c,{type:item.type,x:0,y:0,scale:item.height/66,phase:0});
 }
 c.restore();
}
