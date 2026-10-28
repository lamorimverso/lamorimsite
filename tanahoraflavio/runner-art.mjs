// Caricaturas vetoriais originais. Um só estilo e poses articuladas, sem fotos no jogo.
const INK='#292337',SKIN='#edb57d',CREAM='#fff6e5';
function oval(c,x,y,rx,ry,fill,stroke=INK,w=1.8){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=w;c.stroke();}}
function box(c,x,y,w,h,fill,r=3,stroke=INK){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.8;c.stroke();}}
function path(c,points,fill,stroke=INK){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.8;c.stroke();}}
function line(c,points,color=INK,width=2){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();}
function text(c,value,x,y,size=7,color=CREAM){c.fillStyle=color;c.font='900 '+size+'px system-ui';c.textAlign='center';c.fillText(value,x,y);}
const COATS={flavio:'#754595',pf:'#284c70',janones:'#3e6c9c',army:'#68764c',boulos:'#7c558b',dino:'#89634b',xandao:'#393044',haddad:'#286778',lula:'#a33349',joice:'#294d77'};

export function drawActor(c,{type='flavio',x=0,y=0,scale=1,phase=0,airborne=false,attacking=false,hurt=false,alpha=1}={}){
 c.save();c.translate(x,y);c.scale(scale,scale);c.globalAlpha*=alpha;
 const stride=airborne?9:phase===0?0:Math.sin(phase)*11,arm=airborne?-5:phase===0?0:Math.sin(phase)*5;
 const coat=hurt?'#e8b746':COATS[type]||COATS.flavio,wide=type==='lula'?4:type==='xandao'?3:0;
 // Pernas e sapatos em poses opostas; braço de trás precede o tronco.
 line(c,[[-6,-23],[-8+stride*.5,-11],[-9-stride,0]],'#292b3d',7);
 line(c,[[6,-23],[8-stride*.5,-11],[10+stride,0]],'#3d4056',7);
 box(c,-15-stride,-4,14,7,'#292337',3);box(c,6+stride,-4,15,7,'#292337',3);
 line(c,[[-12,-38],[-21,-27+arm],[-25,-31+arm]],coat,7);oval(c,-25,-31+arm,4,4,SKIN);
 if(type==='xandao')path(c,[[-15,-43],[14,-43],[24,-15],[-24,-15]],coat);
 else box(c,-14-wide,-43,28+wide*2,26,coat,7);
 if(!['pf','army'].includes(type)){
  path(c,[[-8,-42],[7,-42],[0,-24]],'#fff4e1');
  path(c,[[-1,-41],[3,-38],[1,-33],[6+arm,-20],[1,-17],[-2,-32]],type==='flavio'?'#e9b93f':type==='lula'?'#e05451':'#66a5b4');
 }else{line(c,[[-9,-41],[9,-20]],'#99a27c',3);box(c,-10,-33,8,7,coat,1);box(c,3,-33,8,7,coat,1);}
 line(c,[[12,-37],[21,-26-arm],[25,-35-arm]],coat,7);oval(c,25,-35-arm,4.5,4.5,SKIN);
 // Cabelo da narradora atrás do rosto.
 if(type==='joice')oval(c,0,-57,23,28,'#dcb755');
 oval(c,0,-57,type==='lula'?20:18,20,SKIN);
 oval(c,-18,-56,3.5,5,SKIN);oval(c,18,-56,3.5,5,SKIN);
 if(type!=='xandao'&&type!=='joice'){
  const hair=type==='lula'?'#e8e7df':type==='haddad'?'#53505b':'#3b3035';
  path(c,[[-18,-62],[-17,-73],[-8,-79],[2,-77],[13,-80],[19,-71],[15,-63],[9,-70],[1,-66],[-8,-69]],hair);
  if(type==='haddad')line(c,[[-12,-73],[-4,-76],[2,-72],[9,-76]],'#c2bbc2',2);
 }
 if(type==='joice'){path(c,[[-21,-64],[-19,-77],[-7,-83],[9,-81],[20,-72],[22,-54],[10,-65],[2,-73],[-6,-65]],'#e9c769');line(c,[[-14,-72],[-18,-60],[-18,-41]],'#fff0a1',2);}
 if(type==='lula'){
  path(c,[[-17,-53],[-11,-51],[-6,-47],[6,-47],[12,-51],[18,-53],[16,-40],[7,-34],[-5,-34],[-16,-41]],'#eee9df');
  line(c,[[-9,-43],[0,-40],[9,-44]],'#c6c4c4',1.4);
 }
 const worried=type==='flavio',pupil=worried?-2:1;
 oval(c,-7,-58,5.8,6,'#fff9ef');oval(c,6,-58,5.8,6,'#fff9ef');
 oval(c,-7+pupil,-57,2,3,INK,null);oval(c,6+pupil,-57,2,3,INK,null);
 line(c,worried?[[-13,-65],[-6,-69],[-2,-66]]:[[-13,-68],[-3,-65]],INK,2.7);
 line(c,worried?[[2,-66],[9,-68],[13,-64]]:[[2,-65],[12,-68]],INK,2.7);
 oval(c,1,-51,3.8,3.5,'#df9a68',null);
 if(type==='flavio'){box(c,-9,-45,17,7,'#fff8e8',3);line(c,[[-5,-44],[-5,-39]],'#d4beb0',1);}
 else line(c,[[-6,-42],[2,-44],[8,-42]],'#873d3b',2);
 if(['haddad','dino'].includes(type)){c.strokeStyle=INK;c.lineWidth=1.6;c.strokeRect(-14,-63,12,10);c.strokeRect(2,-63,12,10);line(c,[[-2,-59],[2,-59]],INK,1.5);}
 // Acessórios e silhuetas identificam cada papel mesmo sem a etiqueta.
 if(type==='pf'){
  box(c,-20,-79,38,12,'#203b5c',5);box(c,-22,-69,44,4,'#244667',2);text(c,'PF',0,-70,8,'#ffd76d');text(c,'PF',0,-26,8,'#ffd76d');
 }
 if(type==='army'){oval(c,0,-73,22,12,'#778957');box(c,-23,-73,46,6,'#65754a');line(c,[[-16,-78],[-3,-82],[9,-78]],'#a6ae7c',3);}
 if(type==='boulos'){box(c,-20,-77,38,9,'#61446d');box(c,-14,-85,28,12,'#755382');}
 if(type==='janones'){box(c,21,-54,11,20,'#23364e',2);box(c,23,-51,7,13,'#a6d9e6',1,null);}
 if(type==='flavio'){c.save();c.translate(24,-35-arm);c.rotate(.2);drawItem(c,{type:'passport',x:0,y:0,scale:.52});c.restore();}
 if(type==='xandao'){
  path(c,[[-10,-43],[-3,-43],[-4,-31],[-12,-35]],CREAM);path(c,[[3,-43],[10,-43],[12,-35],[4,-31]],CREAM);
  const lift=attacking?9:0;line(c,[[-24,-32],[-27,-60-lift]],'#98634b',6);box(c,-38,-76-lift,25,17,'#a8404b');text(c,'§',-25,-63-lift,12,'#ffe7b5');
 }
 if(type==='haddad'){box(c,-34,-39,20,26,'#457576');box(c,-31,-36,14,7,'#ccdfa9',1);for(let i=0;i<6;i++)box(c,-30+(i%3)*4,-26+Math.floor(i/3)*5,2,2,'#e5e6da',.5,null);for(let i=0;i<3;i++)box(c,20+i*2,-38-i*3,15,24,'#fff0d2',1);}
 if(type==='lula'){
  path(c,[[-15,-82],[-18,-96],[-7,-90],[0,-101],[7,-90],[18,-96],[15,-82]],'#e7b945');
  c.save();c.translate(25,-39);c.rotate(attacking?-.3:0);path(c,[[0,-5],[19,-12],[19,12],[0,5]],'#e0504e');oval(c,20,0,5,13,'#f5c3a8');line(c,[[3,6],[3,14]],INK,4);c.restore();
 }
 if(type==='joice'){line(c,[[23,-35],[26,-48]],'#3c3c4b',4);oval(c,27,-52,5,6,'#31354a');box(c,21,-47,12,8,'#e9b447',1);text(c,'J',27,-41,6,INK);}
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
export function drawThreat(c,item,ground,phase){
 const x=item.x+item.width/2;c.save();c.translate(x,ground);
 if(item.type==='barrier'){box(c,-22,-28,44,12,'#f1bd65');for(let i=-15;i<20;i+=14)line(c,[[i,-27],[i+7,-17]],'#543b42',4);line(c,[[-15,-16],[-17,0]],INK,4);line(c,[[15,-16],[17,0]],INK,4);}
 else if(item.type==='case'){box(c,-17,-31,34,28,'#906490');box(c,-6,-37,12,6,'#e1b985',2);line(c,[[-8,-28],[-8,-7]],'#d9b88a',2);line(c,[[8,-28],[8,-7]],'#d9b88a',2);oval(c,-10,0,3,3,INK);oval(c,10,0,3,3,INK);}
 else if(item.type==='stamp'){box(c,-21,-15,42,13,'#a53e54');box(c,-8,-31,16,16,'#81584a');line(c,[[-23,-1],[23,-1]],'#e1a05e',3);}
 else if(item.type==='receipts'){for(let i=0;i<3;i++){box(c,-18+i*10,-34+i*4,20,25,'#fff1cf',2);for(let j=0;j<3;j++)line(c,[[-14+i*10,-28+i*4+j*5],[-3+i*10,-28+i*4+j*5]],'#417884',1.5);}}
 else if(item.type==='sound'){for(let i=0;i<3;i++){c.beginPath();c.ellipse(-13+i*14,-19,7,18,0,-Math.PI/2,Math.PI/2);c.strokeStyle=i===1?'#e8aa50':'#b64354';c.lineWidth=4;c.stroke();}}
 else drawActor(c,{type:item.type,x:0,y:0,scale:item.height/66,phase});
 c.restore();
}
export function drawShot(c,shot,x,y){
 if(shot.type==='biblia'){drawItem(c,{type:'biblia',x,y,scale:.72});return;}
 c.save();c.translate(x,y);c.rotate(-.25);box(c,-14,-6,28,12,CREAM,6);c.beginPath();c.roundRect(-14,-6,14,12,[6,0,0,6]);c.fillStyle='#50b4a3';c.fill();text(c,'IV',6,2.5,6,'#275c60');c.restore();
}
