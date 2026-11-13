import {drawCharacterBody,drawCharacterArm} from './runner-body-art.mjs?v=67badae0df52';
import {drawBossonariHead} from './runner-character-art.mjs?v=a83cbf27d5c5';
import {standingEnemyPose} from './runner-cast-pose.mjs?v=ef9cdbeacd92';
export {standingEnemyPose} from './runner-cast-pose.mjs?v=ef9cdbeacd92';
import {drawCombatSprite,drawSpriteHead} from './runner-sprites.mjs?v=ef90058f6d92';
import {combatGeometryFor} from './runner-combat-geometry.mjs?v=fb27da4c3c50';
import {drawMemeArmy} from './runner-art.mjs?v=35fcedf56da3';

// Full illustrated combat sprites share the original running artwork style.
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
function oval(c,x,y,rx,ry,fill,stroke=INK,width=1.6){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function polygon(c,points,fill,stroke=INK,width=1.6){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function line(c,points,color=INK,width=2){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.lineCap='round';c.lineJoin='round';c.strokeStyle=color;c.lineWidth=width;c.stroke();}

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

export function drawHoverEnemy(c,{type='haddad',x=0,y=0,scale=1,phase=0,preparing=false,attacking=false,recovering=false,hurt=false,reducedMotion=false,classId='sentinel',action='jump',progress,armyVariant,enraged=false}={}){
 if(!Number.isFinite(x)||!Number.isFinite(y)||!Number.isFinite(scale)||scale<=0)return;
 const p=standingEnemyPose({phase,preparing,attacking,recovering,hurt,reducedMotion,classId,action,progress}),[,,accent]=SUITS[type]||['#4d4d70','#292c49','#dbc778'];
 c.save();c.translate(x,y);c.scale(scale,scale);
 drawShip(c,p,accent,preparing,attacking,hurt);
 const spriteOptions={phase,preparing,attacking,recovering,hurt,reducedMotion,progress,armyVariant,enraged};
 if(drawCombatSprite(c,{type,...spriteOptions})){
  const hand=combatGeometryFor(type,spriteOptions).muzzle;
  drawMagic(c,{arms:{left:{hand:{x:hand.x+7,y:hand.y}}}},accent,preparing&&!hurt,attacking&&!hurt);
  c.restore();return;
 }
 // Emergency unloaded-art fallback; required atlases are loaded before play.
 if(type==='meme-army'){
  // Preserve the existing red three-point hat and long-legged silhouette.
  // No skeleton, no substitute head, no running animation in the boss rig.
  oval(c,0,-48,45,57,'#ae83bd20',null);
  // Spectral arms articulate with the same attack cue; the original hat and
  // long-legged silhouette stay intact and do not switch to a running stride.
  for(const side of ['right','left'])drawCharacterArm(c,p.arms[side],{type:'meme-army',back:side==='right'});
  drawMemeArmy(c,{x:7,y:-8,scale:1.85,phase,reducedMotion,standing:true});
  if(preparing||attacking){
   oval(c,0,-46,50,56,'#be579414',attacking?'#db5475':'#eec66a',2);
   for(const side of [-1,1]){const xx=side*(attacking?56:44),yy=preparing?-69:-45;oval(c,xx,yy,preparing?8:12,preparing?8:12,'#f5d7a088','#d95a85',2);line(c,[[side*35,-58],[xx,yy]],'#d795bb',3);}
  }
  if(hurt){line(c,[[-38,-91],[-29,-97]],CREAM,3);line(c,[[30,-100],[39,-94]],CREAM,3);}
  c.restore();return;
 }
 drawCharacterBody(c,p,{type,phase,reducedMotion});
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
