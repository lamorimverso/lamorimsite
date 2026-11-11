import {drawSpriteHead} from './runner-sprites.mjs?v=7f111bd8189a';
import {drawMemeArmy} from './runner-art.mjs?v=42af91493a7e';

// Standing bosses: original atlas heads, original articulated Canvas bodies.
// Coordinates are logical game pixels; y always remains the top of the deck.
const INK='#292337',CREAM='#fff4dc';
const SUITS={
 haddad:['#235c7a','#12344c','#efcc6b'],lula:['#853747','#491d35','#ffd36a'],bossonari:['#414267','#292b46','#d3565f'],
 xandao:['#35303f','#191b29','#b485e4'],janones:['#263b60','#172740','#ed6976'],pf:['#243747','#14212c','#e7cb62'],
 army:['#6f7941','#36452a','#d7c779'],joice:['#344b70','#182d4c','#f0cb6a'],
 dilma:['#a63d4d','#63273b','#f3d7bb'],simone:['#286c83','#174258','#ecb15e'],soraya:['#304c6e','#192a45','#bf9de2'],
 'ze-gotinha':['#eff7ed','#a6cbd1','#418db4'],vorcaro:['#31425d','#1a2539','#ece6d8'],
 jair:['#26374a','#152533','#62a783'],michelle:['#39425e','#20283e','#ead1a6'],eduardo:['#33466b','#1c2b48','#b6cde4'],
 carlos:['#414854','#252c38','#9eafcc'],renan:['#334763','#1a2d46','#c2d9ed'],silas:['#44434b','#272532','#ca5c65'],magno:['#66384f','#352334','#eabd8b'],
 nikolas:['#2d405b','#182a41','#cbdbea'],tarcisio:['#364f6b','#203348','#a5cfe1'],damares:['#306b54','#194033','#e3c079'],bia:['#743449','#482235','#e3b065'],
 trump:['#304563','#1b2b46','#d74d55'],milei:['#2d3c5b','#152640','#84bce1'],bolsominion:['#d9b93c','#36653e','#f7ec8c'],jacare:['#4d7c45','#29452f','#c5df63'],flavio:['#644281','#372950','#f4cf70'],boulos:['#68503f','#3c3029','#ce5551'],dino:['#304562','#1c2a42','#eb7874']
};
const CLASS_ALIASES={sentinela:'sentinel',artilheiro:'gunner',conjurador:'caster',soberano:'sovereign'};
function canonicalClass(value){return CLASS_ALIASES[value]||value||'sentinel';}
function oval(c,x,y,rx,ry,fill,stroke=INK,width=1.6){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function polygon(c,points,fill,stroke=INK,width=1.6){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function line(c,points,color=INK,width=2){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.lineCap='round';c.lineJoin='round';c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function joint(x,y){return {x,y};}

/** Pure standing rig. Feet stay planted through breathing, charging and recoil. */
export function standingEnemyPose({phase=0,preparing=false,attacking=false,hurt=false,reducedMotion=false,classId='sentinel'}={}){
 const t=reducedMotion?0:(Number.isFinite(phase)?phase:0),breath=reducedMotion?0:Math.sin(t*.32),kind=canonicalClass(classId);
 const state=hurt?'recoil':attacking?'release':preparing?'charge':'idle';
 const lean=state==='recoil'?5:state==='release'?-3:state==='charge'?2:breath*.55;
 const bob=breath*.65,shoulders=joint(lean,-63+bob),neck=joint(lean,-69+bob);
 const left={hip:joint(-9+lean*.25,-34+bob),knee:joint(-11,-17),foot:joint(-13,0)};
 const right={hip:joint(9+lean*.25,-34+bob),knee:joint(12,-17),foot:joint(15,0)};
 let endpoints;
 if(state==='charge')endpoints=[[-29,-72],[-21,-91],[30,-56],[37,-76]];
 else if(state==='release')endpoints=[[-38,-61],[-59,-65],[24,-67],[12,-79]];
 else if(state==='recoil')endpoints=[[-22,-55],[-4,-64],[31,-49],[27,-31]];
 else if(kind==='sovereign')endpoints=[[-31,-57],[-38,-72],[32,-54],[40,-63]];
 else if(kind==='caster')endpoints=[[-27,-60],[-32,-74],[29,-48],[34,-57]];
 else if(kind==='gunner')endpoints=[[-28,-55],[-35,-51],[22,-48],[3,-49]];
 else endpoints=[[-26,-48],[-23,-34],[26,-48],[23,-32]];
 const arms={};for(const [i,side] of ['left','right'].entries()){
  const sign=i?1:-1,elbow=endpoints[i*2],hand=endpoints[i*2+1],sway=state==='idle'?breath*(i?-.8:.8):0;
  arms[side]={shoulder:joint(sign*17+lean,-61+bob),elbow:joint(elbow[0]+lean,elbow[1]+bob+sway),hand:joint(hand[0]+lean,hand[1]+bob+sway),open:state==='charge'||state==='release'||kind==='caster'||kind==='sovereign'};
 }
 return {state,bob,lean,neck,shoulders,left,right,arms,headTilt:state==='recoil'?.12:state==='release'?-.06:breath*.025,motor:reducedMotion?0:(1+Math.sin(t*1.8))*.5};
}

function drawShip(c,p,accent,preparing,attacking,hurt){
 // Motors are below the hull; the top ellipse is an exposed walkable deck.
 for(const side of [-1,1]){
  const mx=side*31,plume=8+p.motor*7;
  polygon(c,[[mx-8,18],[mx+8,18],[mx+5,23+plume],[mx,28+plume],[mx-5,23+plume]],'#5ee0e4',null);
  polygon(c,[[mx-3,19],[mx+3,19],[mx,25+plume*.65]],CREAM,null);
  oval(c,mx,19,10,5,'#263a54');line(c,[[mx-5,20],[mx+5,20]],'#8de9ec',2);
 }
 oval(c,0,14,50,14,'#263448');
 oval(c,0,10,56,11,hurt?'#9e6571':'#52687c');
 oval(c,0,6,53,8,'#bfd8d8');
 oval(c,0,4,37,4,'#526b7d');
 // Deck y=0 beneath both boot soles. Rim and windows stay visible around them.
 line(c,[[-35,1],[35,1]],'#edf4d8',2);
 for(const dx of [-38,-19,0,19,38])oval(c,dx,14,3.5,2.3,attacking?'#ffdda0':preparing?accent:'#8ae3e3',INK,1);
 line(c,[[-48,9],[-40,15]],accent,2);line(c,[[40,15],[48,9]],accent,2);
}
function drawLeg(c,leg,suit,dark){
 const points=[[leg.hip.x,leg.hip.y],[leg.knee.x,leg.knee.y],[leg.foot.x,-4]];
 line(c,points,INK,13);line(c,points,dark,9);line(c,[[leg.hip.x-2,leg.hip.y+3],[leg.knee.x-2,leg.knee.y],[leg.foot.x-2,-6]],suit,2);
 const x=leg.foot.x;polygon(c,[[x-5,-7],[x+4,-7],[x+5,-3],[x+7,-2],[x+7,0],[x-9,0],[x-9,-3]],'#242738');
 line(c,[[x-7,-1],[x+5,-1]],'#a8a8ab',1);
}
function drawArm(c,arm,suit,accent,side,skin){
 const a=arm.shoulder,b=arm.elbow,h=arm.hand;
 line(c,[[a.x,a.y],[b.x,b.y],[h.x,h.y]],INK,12);
 line(c,[[a.x,a.y],[b.x,b.y],[h.x,h.y]],suit,8.5);
 oval(c,b.x,b.y,4.3,4.3,suit,null);
 const dx=h.x-b.x,dy=h.y-b.y,norm=Math.hypot(dx,dy)||1,ux=dx/norm,uy=dy/norm;
 line(c,[[h.x-ux*4-uy*3,h.y-uy*4+ux*3],[h.x-ux*4+uy*3,h.y-uy*4-ux*3]],CREAM,3);
 c.save();c.translate(h.x,h.y);c.rotate(Math.atan2(dy,dx));
 oval(c,0,0,4.7,4,skin,INK,1.2);
 if(arm.open){
  // Fingers extend from the palm separately; thumb opens on the opposite side.
  for(let i=0;i<4;i++)line(c,[[1,-3+i*1.7],[5+(i===1?2:0),-4.5+i*2],[8+(i===1?1:0),-5+i*2.8]],skin,2.2);
  line(c,[[-1,2],[2,6],[5,6.5]],skin,2.6);
 }else line(c,[[0,-2],[3,-2],[3,1]],'#ae7868',.8);
 c.restore();
 // Small class/identity cuff independent from the hand articulation.
 if(side==='right')oval(c,a.x,a.y,2,2,accent,null);
}
function drawMagic(c,p,accent,preparing,attacking){
 if(!preparing&&!attacking)return;
 const h=p.arms.left.hand;
 c.save();c.translate(h.x-7,h.y);
 if(preparing){
  oval(c,0,0,13,13,accent+'28',accent,1.5);oval(c,0,0,5,5,CREAM,accent,1.5);
  for(let i=0;i<4;i++){const a=i*Math.PI/2+.4;line(c,[[Math.cos(a)*16,Math.sin(a)*16],[Math.cos(a)*20,Math.sin(a)*20]],accent,2);}
 }else{
  polygon(c,[[-28,0],[-17,-3],[-19,-10],[-10,-6],[-9,-15],[-3,-6],[5,-8],[2,0],[5,8],[-5,5],[-11,13],[-12,5]],CREAM,accent,2);
  line(c,[[-34,-7],[-43,-10]],accent,2);line(c,[[-36,5],[-47,8]],accent,2);
 }
 c.restore();
}
function fallbackHead(c,type,accent){
 // Loading fallback is a neutral silhouette; it never borrows another identity.
 oval(c,0,-87,13,17,'#536173',INK,1.5);oval(c,-4,-89,1.3,1.3,CREAM,null);oval(c,4,-89,1.3,1.3,CREAM,null);
 line(c,[[-5,-78],[5,-78]],accent,1.5);
}
function drawBossonariHead(c){
 // Same human face/hair as the existing drawBossOfBosses vector, at the neck.
 oval(c,0,-19,18,21,'#e7b68e','#583c4b',2);
 polygon(c,[[-18,-28],[-9,-42],[9,-42],[18,-30],[10,-33],[-10,-33]],'#302f43');
 oval(c,-6,-20,2,2,'#302f43',null);oval(c,6,-20,2,2,'#302f43',null);
}

export function drawHoverEnemy(c,{type='haddad',x=0,y=0,scale=1,phase=0,preparing=false,attacking=false,hurt=false,reducedMotion=false,classId='sentinel'}={}){
 if(!Number.isFinite(x)||!Number.isFinite(y)||!Number.isFinite(scale)||scale<=0)return;
 const p=standingEnemyPose({phase,preparing,attacking,hurt,reducedMotion,classId}),[suit,dark,accent]=SUITS[type]||['#4d4d70','#292c49','#dbc778'];
 c.save();c.translate(x,y);c.scale(scale,scale);
 drawShip(c,p,accent,preparing,attacking,hurt);
 if(type==='meme-army'){
  // Preserve the existing red three-point hat and long-legged silhouette.
  // No skeleton, no substitute head, no running animation in the boss rig.
  oval(c,0,-48,45,57,'#ae83bd20',null);
  drawMemeArmy(c,{x:7,y:-8,scale:1.85,phase:0,reducedMotion:true});
  if(preparing||attacking){
   oval(c,0,-46,50,56,'#be579414',attacking?'#db5475':'#eec66a',2);
   for(const side of [-1,1]){const xx=side*(attacking?56:44),yy=preparing?-69:-45;oval(c,xx,yy,preparing?8:12,preparing?8:12,'#f5d7a088','#d95a85',2);line(c,[[side*35,-58],[xx,yy]],'#d795bb',3);}
  }
  if(hurt){line(c,[[-38,-91],[-29,-97]],CREAM,3);line(c,[[30,-100],[39,-94]],CREAM,3);}
  c.restore();return;
 }
 drawLeg(c,p.right,suit,dark);drawLeg(c,p.left,suit,dark);
 const kind=canonicalClass(classId),bodyX=p.lean,bodyY=p.bob;
 if(kind==='sovereign'||type==='xandao')polygon(c,[[bodyX-19,-65+bodyY],[bodyX+18,-65+bodyY],[bodyX+28,-27+bodyY],[bodyX+4,-31+bodyY],[bodyX-26,-27+bodyY]],dark,INK,1.5);
 drawArm(c,p.arms.right,suit,accent,'right',type==='ze-gotinha'?'#f1f5e9':'#e8b58e');
 polygon(c,[[bodyX-17,-64+bodyY],[bodyX-7,-69+bodyY],[bodyX+7,-69+bodyY],[bodyX+18,-62+bodyY],[bodyX+15,-33+bodyY],[bodyX-15,-33+bodyY]],suit);
 polygon(c,[[bodyX-7,-65+bodyY],[bodyX+7,-65+bodyY],[bodyX+5,-35+bodyY],[bodyX-4,-35+bodyY]],CREAM,null);
 polygon(c,[[bodyX-17,-63+bodyY],[bodyX-5,-68+bodyY],[bodyX-1,-52+bodyY],[bodyX-8,-56+bodyY]],dark,INK,1);
 polygon(c,[[bodyX+16,-63+bodyY],[bodyX+5,-68+bodyY],[bodyX+1,-52+bodyY],[bodyX+8,-56+bodyY]],dark,INK,1);
 if(type==='pf'||type==='army'){
  polygon(c,[[bodyX-15,-61+bodyY],[bodyX+15,-61+bodyY],[bodyX+14,-34+bodyY],[bodyX-14,-34+bodyY]],dark);
  line(c,[[bodyX,-57+bodyY],[bodyX,-36+bodyY]],suit,2);
  for(const sx of [-9,9])polygon(c,[[bodyX+sx-4,-47+bodyY],[bodyX+sx+4,-47+bodyY],[bodyX+sx+4,-38+bodyY],[bodyX+sx-4,-38+bodyY]],suit,INK,1);
  if(type==='pf'){c.font='900 7px system-ui';c.textAlign='center';c.fillStyle=accent;c.fillText('PF',bodyX+1,-51+bodyY);}
 }else if(type==='xandao'){
  polygon(c,[[bodyX-6,-61+bodyY],[bodyX+6,-61+bodyY],[bodyX+9,-51+bodyY],[bodyX,-53+bodyY],[bodyX-7,-48+bodyY]],CREAM);
  line(c,[[bodyX-19,-60+bodyY],[bodyX-20,-36+bodyY]],accent,2);
 }else polygon(c,[[bodyX,-63+bodyY],[bodyX+3,-59+bodyY],[bodyX+3,-43+bodyY],[bodyX,-39+bodyY],[bodyX-3,-43+bodyY],[bodyX-2,-59+bodyY]],accent,null);
 oval(c,bodyX+11,-56+bodyY,2,2,accent,null);
 line(c,[[bodyX-14,-34+bodyY],[bodyX+14,-34+bodyY]],'#242637',3);
 drawArm(c,p.arms.left,suit,accent,'left',type==='ze-gotinha'?'#f1f5e9':'#e8b58e');
 // Head pivots independently around the neck; only original atlas head pixels.
 c.save();c.translate(p.neck.x,p.neck.y);c.rotate(p.headTilt);
 if(type==='bossonari')drawBossonariHead(c);
 else if(!drawSpriteHead(c,{type,x:0,y:1,size:type==='ze-gotinha'?43:40,phase:0})){
  c.translate(0,69);fallbackHead(c,type,accent);
 }
 c.restore();
 drawMagic(c,p,accent,preparing&&!hurt,attacking&&!hurt);
 if(hurt){line(c,[[-27,-95],[-34,-99]],CREAM,3);line(c,[[23,-103],[30,-107]],CREAM,3);}
 c.restore();
}

/** Arena markings overlay the existing environment without replacing its scene. */
export function drawBossArena(c,{width=900,ground=246,phase=0,state='idle',stageIndex=0,reducedMotion=false}={}){
 if(!Number.isFinite(width)||width<=0||!Number.isFinite(ground))return;
 const tones=['#b65d4d','#5b7eae','#9674ac','#4d8c86','#bb9153'];
 const accent=tones[((Math.floor(stageIndex)||0)%tones.length+tones.length)%tones.length];
 const mode=typeof state==='string'?state:state?.phase||'idle';
 const enraged=mode==='phase2'||Boolean(state&&typeof state==='object'&&state.enraged);
 const charging=['prepare','preparing','windup','charge','telegraph'].includes(mode),release=['attack','attacking','release'].includes(mode),recovery=['recover','recovery','vulnerable'].includes(mode);
 const t=reducedMotion?0:Math.sin((Number.isFinite(phase)?phase:0)*.35),pulse=.08+(t+1)*.025;
 const marker=release?'#e9a068':charging?'#f0ca72':recovery?'#92d3ba':accent;
 c.save();
 c.fillStyle=release?'#8e314315':charging?'#e9bd6320':'#33334a12';c.fillRect(0,ground-160,width,160);
 // Floor remains visible and bounded, while the runner's background survives.
 c.fillStyle='#29364b48';c.fillRect(0,ground,width,19);
 line(c,[[20,ground+1],[width-20,ground+1]],marker,2);
 for(let xx=26;xx<width-20;xx+=48){line(c,[[xx,ground+6],[xx+16,ground+6]],'#e8d6b770',2);}
 for(const xx of [16,width-16]){
  c.fillStyle=marker;c.globalAlpha*=.65;c.fillRect(xx-2,ground-106,4,106);c.globalAlpha/=.65;
  for(let i=0;i<4;i++)line(c,[[xx-5,ground-18-i*24],[xx+5,ground-24-i*24]],marker,2);
  oval(c,xx,ground-110,5,5,marker,INK,1);
 }
 // Concentric target around the enemy's arena side. Only decoration pulses.
 c.globalAlpha*=pulse;
 oval(c,width*.76,ground+5,Math.min(132,width*.17),14,marker,null);
 c.globalAlpha/=pulse;
 if(charging||release||recovery){
  const center=width*.76;
  line(c,[[center-47,ground-6],[center-38,ground-12],[center-28,ground-6]],marker,2);
  line(c,[[center+28,ground-6],[center+38,ground-12],[center+47,ground-6]],marker,2);
 }
 if(enraged){
  // Persistent second-phase marks supplement the current attack/recovery cue.
  // Static lightning crests and a doubled floor band stay readable without motion.
  const rage='#c64f7b';
  for(const xx of [16,width-16])polygon(c,[[xx+2,ground-151],[xx-8,ground-136],[xx-1,ground-136],[xx-4,ground-124],[xx+9,ground-140],[xx+2,ground-140]],rage,CREAM,1.4);
  line(c,[[width*.60,ground+11],[width*.91,ground+11]],rage,2.5);
  line(c,[[width*.60,ground+16],[width*.91,ground+16]],rage,2.5);
 }
 c.restore();
}
