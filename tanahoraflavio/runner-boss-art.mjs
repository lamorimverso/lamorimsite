import {drawCharacterBody,drawCharacterArm} from './runner-body-art.mjs?v=67badae0df52';
import {drawBossonariHead} from './runner-character-art.mjs?v=a731db370533';
import {standingEnemyPose} from './runner-cast-pose.mjs?v=ad9beaec5ae2';
export {standingEnemyPose} from './runner-cast-pose.mjs?v=ad9beaec5ae2';
import {drawCombatSprite,drawSpriteHead} from './runner-sprites.mjs?v=8daa308ff1ae';
import {combatGeometryFor} from './runner-combat-geometry.mjs?v=6da54cb343f5';
import {drawMemeArmy} from './runner-art.mjs?v=b0ea83e8b081';
import {regionalEmitterFor} from './runner-stage-roster.mjs?v=3f963f6dd2ce';

import {CAMPAIGN_CAST_POINT,campaignAccentFor,campaignBossPoseFor,drawCampaignBoss,drawCampaignCrowd} from './runner-campaign-art.mjs?v=396addb29e7f';

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
  oval(c,0,0,10,10,accent+'19',accent,1.2);oval(c,0,0,3,3,CREAM,null);
  line(c,[[-15,-3],[-12,-2]],accent,1.5);line(c,[[11,4],[14,5]],accent,1.5);
 }else{
  // A short release accent keeps the silhouette and actual object readable.
  // The old large repeated star covered the cuff chain and firing hand.
  polygon(c,[[-17,0],[-8,-3],[2,-2],[4,0],[1,2],[-8,3]],CREAM,accent,1.2);
  line(c,[[-21,-4],[-27,-5]],accent,1.4);line(c,[[-20,4],[-25,5]],accent,1.4);
 }
 c.restore();
}
function fallbackHead(c,type,accent){
 // Loading fallback is a neutral silhouette; it never borrows another identity.
 oval(c,0,-87,13,17,'#536173',INK,1.5);oval(c,-4,-89,1.3,1.3,CREAM,null);oval(c,4,-89,1.3,1.3,CREAM,null);
 line(c,[[-5,-78],[5,-78]],accent,1.5);
}

export function drawHoverEnemy(c,{type='haddad',x=0,y=0,scale=1,phase=0,preparing=false,attacking=false,recovering=false,hurt=false,reducedMotion=false,classId='sentinel',action='jump',progress,armyVariant,stageId='brasilia',enraged=false}={}){
 if(!Number.isFinite(x)||!Number.isFinite(y)||!Number.isFinite(scale)||scale<=0)return;
 const visual=regionalEmitterFor(type,stageId);type=visual.type;armyVariant??=visual.armyVariant;
 if(type==='povo'){drawCampaignCrowd(c,{x,y,scale,phase,reducedMotion,preparing,attacking,recovering,progress});return;}
 const p=standingEnemyPose({phase,preparing,attacking,recovering,hurt,reducedMotion,classId,action,progress}),accent=campaignAccentFor(type)??SUITS[type]?.[2]??'#dbc778';
 c.save();c.translate(x,y);c.scale(scale,scale);
 drawShip(c,p,accent,preparing,attacking,hurt);
 const campaignPose=campaignBossPoseFor(type,p,{phase,reducedMotion,action,progress});
 if(campaignPose&&drawCampaignBoss(c,{type,pose:campaignPose})){
  // The launch spark matches the unchanged engine origin. A marked lane does
  // not fire from the hand, so its accent stays beside the visual gesture.
  const cue=attacking&&action!=='move'?{arms:{left:{hand:{x:CAMPAIGN_CAST_POINT.x+7,y:CAMPAIGN_CAST_POINT.y}}}}:campaignPose;
  drawMagic(c,cue,accent,preparing&&!hurt,attacking&&!hurt);
  if(hurt)line(c,[[22,-105],[30,-110]],CREAM,3);
  c.restore();return;
 }
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

/** Keep the stage itself and only a faint combat line on the road. */
export function drawBossArena(c,{width=900,ground=246,state='idle'}={}){
 if(!Number.isFinite(width)||width<=0||!Number.isFinite(ground))return;
 const phase=typeof state==='string'?state:state?.phase;
 const intense=phase==='phase2'||!!state?.enraged;
 const color=phase==='charge'?'#b38d48':phase==='attack'?'#a9535e':phase==='recover'?'#599888':intense?'#a56076':'#627f8b';
 c.save();line(c,[[16,ground+1],[width-16,ground+1]],color+(intense?'8c':'55'),1.5);c.restore();
}
