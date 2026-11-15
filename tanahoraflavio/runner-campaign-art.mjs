// Original vector caricatures for the campaign. Neutral props communicate each
// encounter's rhythm, with the same outline style as the runner's art atlas.
const INK='#292337',CREAM='#fff5de';
const CAST=Object.freeze({
 'ana-elisa':{suit:'#386c72',shade:'#285056',accent:'#87e0c3',skin:'#a76448',lit:'#d69068',hair:'#2f2534',cut:'curls',emblem:'network'},
 rick:{suit:'#315479',shade:'#223a57',accent:'#ffd083',skin:'#b97552',lit:'#e6a471',hair:'#392a34',cut:'short',face:'stubble',emblem:'pulse'},
 sofia:{suit:'#655388',shade:'#443960',accent:'#e8b6df',skin:'#d29981',lit:'#f6baa0',hair:'#583745',cut:'parted',face:'lip',emblem:'arrow'},
 guilherme:{suit:'#285975',shade:'#27445e',accent:'#89c998',skin:'#d19974',lit:'#f0ba91',hair:'#47303a',cut:'quiff',face:'tie',emblem:'leaf'},
 erika:{suit:'#664055',shade:'#492a47',accent:'#f2ca77',skin:'#98543c',lit:'#c77a56',hair:'#231f35',cut:'sleek',face:'liner',emblem:'spot'},
 'renato-freitas':{suit:'#35465c',shade:'#273046',accent:'#e98779',skin:'#805039',lit:'#b67155',hair:'#2d252e',cut:'afro',face:'tie',emblem:'sign'},
 jones:{suit:'#425b60',shade:'#273d45',accent:'#ffbc92',skin:'#a56645',lit:'#cd8d64',hair:'#2f2630',cut:'buzz',face:'glasses',emblem:'book'},
 maestro:{suit:'#4b3c77',shade:'#382d57',accent:'#c8b6ed',skin:'#956040',lit:'#ca8c56',hair:'#e8d9c3',cut:'wisps',face:'bow',emblem:'note'},
 capita:{suit:'#286986',shade:'#254a61',accent:'#93e0e4',skin:'#b56b4b',lit:'#e49c72',hair:'#3a2e48',cut:'scarf',emblem:'flag'},
 fiscal:{suit:'#62623c',shade:'#414936',accent:'#ffe08d',skin:'#b67b50',lit:'#e3ac7e',hair:'#38353e',cut:'cap',face:'moustache',emblem:'check'}
});
export const CAMPAIGN_PROP_COLORS=Object.freeze({
 'network-panel':'#54ab9b','signal-pulse':'#d19354','arrow-panel':'#bb77c1','garden-box':'#83ae75',
 'stage-spotlight':'#d9aa64','rotating-sign':'#d27c70','debate-card':'#be8970','baton-wave':'#9c88c7',
 'wind-flag':'#59aac0','inspection-gate':'#c59a54','crowd-lane':'#75af9a'
});
function paint(c,fill,draw,stroke=INK,w=1.45){c.beginPath();draw();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=w;c.stroke();}}
function oval(c,x,y,rx,ry,fill,stroke=INK,w=1.35){paint(c,fill,()=>c.ellipse(x,y,rx,ry,0,0,Math.PI*2),stroke,w);}
function box(c,x,y,w,h,r,fill,stroke=INK){paint(c,fill,()=>c.roundRect(x,y,w,h,r),stroke);}
function poly(c,pts,fill,stroke=INK,w=1.35){paint(c,fill,()=>{pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();},stroke,w);}
function line(c,pts,color=INK,w=1.5){c.lineCap='round';c.lineJoin='round';paint(c,null,()=>pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y)),color,w);}
function loop(c,color,w,draw){c.lineCap='round';paint(c,null,draw,color,w);}
function arrow(c,x,y,hue,sign=1){line(c,[[x-11*sign,y],[x+10*sign,y]],hue,3);line(c,[[x+3*sign,y-7],[x+10*sign,y],[x+3*sign,y+7]],hue,3);}

// Spans approximately -30..30 by -48..0. The baseline has the same meaning
// as drawCompleteWeapon, so the silhouette follows the actual hitbox.
export function drawCampaignProp(c,{type,x=0,y=0,width=60,height=48,phase=0,reducedMotion=false}={}){
 if(!Object.hasOwn(CAMPAIGN_PROP_COLORS,type)||![x,y,width,height].every(Number.isFinite)||width<=0||height<=0)return false;
 const tone=CAMPAIGN_PROP_COLORS[type],sway=reducedMotion?0:Math.sin((Number(phase)||0)*.34);
 c.save();c.translate(x,y);c.scale(width/60,height/48);
 switch(type){
 case 'network-panel':
  for(const [i,n] of [[-1,-7],[0,-14],[1,-6]]){
   const xx=i*17;box(c,xx-9,n-24,18,25,4,'#294c58');box(c,xx-6,n-21,12,12,2,tone,null);
   for(const dot of [-3,2])oval(c,xx+dot,n-5,1,1,i===0?'#fff2a9':'#b4edd5',null);
   if(i!==0)line(c,[[xx,n+1],[xx,-2],[0,-2],[0,-14]],'#527b81',2);
  }
  break;
 case 'signal-pulse':
  for(const w of [29,23,17])oval(c,0,-23,w,w*.61,w===29?'#f3bb7770':null,w===23?'#fff0cb':tone,w===17?2.5:1.8);
  poly(c,[[-14,-22],[-6,-22],[-1,-30],[3,-15],[7,-24],[14,-24],[9,-20],[3,-12],[-1,-25],[-5,-19]],CREAM,'#875c48');
  break;
 case 'arrow-panel':
  poly(c,[[-27,-41],[16,-41],[28,-24],[16,-7],[-27,-7],[-19,-24]],'#54436e');
  poly(c,[[-21,-36],[14,-36],[23,-24],[14,-12],[-21,-12],[-14,-24]],tone,'#efd3eb');
  arrow(c,-1,-24,'#fff0df');break;
 case 'garden-box':
  poly(c,[[-26,-20],[26,-20],[22,-4],[-22,-4]],'#937152','#59463d');
  box(c,-28,-22,56,6,2,'#c48766','#684d3e');
  for(const [i,yy] of [[-2,-32],[-1,-39],[0,-34],[1,-43],[2,-29]]){
   const xx=i*9;line(c,[[xx,-20],[xx-2,yy]],'#486f56',2);
   oval(c,xx-4,yy+4,5,3,tone,'#507250');oval(c,xx+3,yy+1,5,3,'#accc7d','#587754');
  }
  break;
 case 'stage-spotlight':
  poly(c,[[-11,-20],[11,-20],[26,-2],[-26,-2]],'#f3cc706f','#d69b53',1);
  box(c,-16,-43,32,23,5,'#4f4057');
  oval(c,0,-28,14,8,tone,'#fff1c5',2);
  line(c,[[-6,-29],[5,-31]],CREAM,2);line(c,[[-18,-32],[-23,-32],[-23,-43],[23,-43],[23,-32],[18,-32]],'#6e566c',2);
  break;
 case 'rotating-sign':
  line(c,[[0,-4],[0,-17]],'#645064',4);
  c.save();c.translate(0,-27);c.rotate(sway*.12);poly(c,[[-22,-12],[15,-12],[24,0],[15,12],[-22,12]],tone,'#6e4956');
  line(c,[[-19,-8],[12,-8]],'#ffb994',1.6);arrow(c,-1,0,CREAM);c.restore();break;
 case 'debate-card':
  poly(c,[[-26,-41],[19,-41],[26,-34],[26,-10],[2,-10],[-7,-4],[-6,-10],[-26,-10]],CREAM,'#715158');
  box(c,-23,-37,46,7,2,tone,null);
  line(c,[[-17,-25],[-5,-25]],'#945969',2.2);line(c,[[-17,-20],[10,-20]],'#806876',1.8);
  line(c,[[-17,-15],[6,-15]],'#806876',1.8);break;
 case 'baton-wave':
  for(const [i,dy] of [[-1,-8],[0,0],[1,8]])loop(c,i===0?'#f7dfb9':tone,i===0?3.3:2.4,()=>{c.moveTo(-25,-20+dy);c.bezierCurveTo(-11,-33+dy,3,-11+dy,24,-24+dy);});
  for(const xx of [-16,0,16])oval(c,xx,-33+xx*.2,2,2,tone,null);
  break;
 case 'wind-flag':
  line(c,[[-20,-3],[-20,-43]],'#385c6c',3.2);
  paint(c,tone,()=>{c.moveTo(-18,-40);c.bezierCurveTo(-4,-50,10,-30+sway*4,25,-40+sway*4);c.lineTo(22,-20+sway*4);c.bezierCurveTo(1,-12,-1,-28,-18,-20);c.closePath();},'#426777');
  loop(c,'#caf3ee',2,()=>{c.moveTo(-13,-33);c.bezierCurveTo(-3,-36,7,-26+sway*4,19,-30+sway*4);});
  break;
 case 'inspection-gate':
  for(const xx of [-21,21]){box(c,xx-3,-36,6,34,2,'#6a675b');box(c,xx-6,-5,12,4,1,'#454b4d');}
  box(c,-27,-29,54,11,2,tone,'#6b554a');
  for(const xx of [-21,-7,7,21])line(c,[[xx-3,-20],[xx+3,-27]],'#fff0c4',3.2);
  oval(c,-21,-38,3.5,4,'#f5ca76','#8f6648');oval(c,21,-38,3.5,4,'#f5ca76','#8f6648');break;
 case 'crowd-lane':
  poly(c,[[-28,-4],[-17,-30],[17,-30],[28,-4]],'#d0ead8','#477966');
  for(const xx of [-15,0,15])line(c,[[xx-5,-16],[xx,-22],[xx+5,-16]],tone,3);
  line(c,[[-18,-10],[18,-10]],'#fffbdd',2);break;
 }
 c.restore();return true;
}

function curls(c,a,points){
 for(const [x,y,r] of points){oval(c,x,y,r,r*.95,a.hair);line(c,[[x-r*.45,y-r*.4],[x,y-r*.62],[x+r*.34,y-r*.44]],'#ffffff3a',.9);}
}
function head(c,a){
 const {cut,skin,lit,hair,face,accent}=a;
 if(['sleek','parted','scarf'].includes(cut))paint(c,hair,()=>{c.moveTo(-17,-25);c.bezierCurveTo(-21,-41,-3,-49,11,-44);c.bezierCurveTo(25,-40,19,-14,23,1);c.bezierCurveTo(6,6,-6,1,-22,3);c.bezierCurveTo(-18,-7,-20,-14,-17,-25);c.closePath();});
 if(cut==='curls')curls(c,a,[[-16,-22,7],[-16,-31,8],[-11,-39,8],[-2,-42,8],[8,-42,8],[16,-37,8],[18,-27,8],[17,-16,7]]);
 if(cut==='afro'){
  oval(c,0,-34,24,18,hair);
  curls(c,a,[[-19,-35,7],[-16,-44,7],[-5,-48,6],[5,-49,6],[15,-44,8],[21,-36,7],[-22,-28,4],[21,-27,5]]);
 }
 oval(c,-15,-18,4,5,skin);oval(c,15,-18,4,5,skin);
 paint(c,lit,()=>{c.moveTo(-15,-23);c.quadraticCurveTo(-17,-35,-7,-38);c.bezierCurveTo(4,-41,16,-35,16,-26);c.bezierCurveTo(17,-11,10,-4,4,-2);c.bezierCurveTo(-6,0,-14,-7,-15,-23);c.closePath();});
 paint(c,skin,()=>{c.moveTo(15,-28);c.quadraticCurveTo(19,-12,6,-4);c.quadraticCurveTo(1,-1,-5,-4);c.quadraticCurveTo(9,-6,10,-19);c.quadraticCurveTo(10,-24,15,-28);c.closePath();},null);
 if(cut==='quiff'||cut==='short'||cut==='buzz'||cut==='wisps'){
  const peak=cut==='quiff'?-49:cut==='wisps'?-47:cut==='buzz'?-39:-43;
  paint(c,hair,()=>{c.moveTo(-16,-24);c.bezierCurveTo(-18,-36,-14,peak+4,-5,peak+3);c.lineTo(cut==='quiff'?1:-1,peak);c.bezierCurveTo(12,peak-2,18,-38,16,-26);c.lineTo(10,-31);c.quadraticCurveTo(-1,-37,-11,-32);c.lineTo(-13,-24);c.closePath();});
  line(c,[[-11,-36],[-2,peak+6],[7,peak+5],[12,-36]],cut==='wisps'?'#fff5dd':'#ffffff4a',1.4);
 }else if(cut==='parted'||cut==='sleek'){
  paint(c,hair,()=>{c.moveTo(-16,-17);c.bezierCurveTo(-23,-37,-15,-46,-3,-44);c.bezierCurveTo(12,-47,21,-35,18,-19);c.quadraticCurveTo(10,-23,8,-37);c.quadraticCurveTo(-3,-25,-11,-29);c.closePath();});
  loop(c,'#ffffff58',1.2,()=>{c.moveTo(-12,-32);c.quadraticCurveTo(-2,-33,5,-41);});
  loop(c,'#ffffff3f',1.2,()=>{c.moveTo(12,-35);c.quadraticCurveTo(16,-19,19,-6);});
 }else if(cut==='scarf'||cut==='cap'){
  if(cut==='scarf'){
   poly(c,[[10,-31],[21,-32],[26,-22],[19,-18],[12,-25]],accent);
   box(c,-17,-38,34,12,5,'#357997');line(c,[[-15,-29],[14,-29]],accent,2.8);
   oval(c,0,-33,2.8,2.8,CREAM,null);
  }else{
   box(c,-16,-42,31,12,5,'#85845b');poly(c,[[-18,-31],[17,-31],[24,-27],[13,-25],[-18,-26]],'#4c523d');box(c,-4,-39,8,6,1,accent,null);
  }
 }else if(cut==='curls')curls(c,a,[[-12,-35,6],[-5,-39,7],[4,-40,6],[11,-37,5]]);
 else if(cut==='afro')curls(c,a,[[-13,-34,5],[-7,-38,6],[1,-39,6],[10,-35,5]]);
 if(face==='stubble'||face==='glasses')paint(c,face==='glasses'?hair:'#986143',()=>{c.moveTo(-14,-15);c.quadraticCurveTo(-12,-11,-8,-9);c.quadraticCurveTo(0,-14,7,-9);c.lineTo(14,-15);c.quadraticCurveTo(12,-1,0,-1);c.quadraticCurveTo(-10,-1,-14,-15);c.closePath();},null);
 for(const side of [-1,1]){
  const x=side*6.4;line(c,[[x-3,-26],[x+1,-27],[x+3,-26]],hair,1.4);
  oval(c,x,-21.2,face==='liner'?3:2.5,1.65,CREAM,null);oval(c,x-.7,-21.3,1.4,1.5,INK,null);
  if(face==='liner')line(c,[[x-3,-21],[x-2,-23],[x+2,-23]],hair,1.15);
 }
 line(c,[[0,-21],[-1,-16],[2,-15]],skin,1.8);
 const smile=face==='glasses'||face==='stubble'?CREAM:face==='lip'||face==='liner'?'#8a385c':'#884d50';
 loop(c,smile,1.5,()=>{c.moveTo(-4,-10);c.quadraticCurveTo(0,-7,4,-10.5);});
 if(face==='glasses'){
  for(const x of [-7,7])box(c,x-5.5,-25,11,8,2,null,'#f5dccb');line(c,[[-1,-22],[1,-22]],'#f5dccb',1.6);
 }else if(face==='moustache')line(c,[[-7,-13],[-3,-15],[0,-13],[3,-15],[7,-13]],hair,2.8);
 if(['curls','sleek','parted'].includes(cut))for(const side of [-1,1])oval(c,side*15,-13,1.6,2.4,accent,'#73545e',.65);
 if(face==='liner')for(const side of [-1,1])oval(c,side*15,-10,2.7,3.6,null,'#f8d694',1.35);
}
function emblem(c,kind,x,y,tone){
 c.save();c.translate(x,y);
 if(kind==='network'){line(c,[[-4,2],[0,-3],[4,2]],tone,1.1);for(const [xx,yy] of [[-4,2],[0,-3],[4,2]])oval(c,xx,yy,1.45,1.45,CREAM,null);}
 else if(kind==='pulse')line(c,[[-5,0],[-2,0],[0,-3],[2,2],[5,0]],tone,1.7);
 else if(kind==='arrow'){line(c,[[-5,0],[5,0],[2,-3],[5,0],[2,3]],tone,1.6);}
 else if(kind==='leaf'){oval(c,1,-2,3,4,tone,null);line(c,[[-3,3],[0,1],[3,-3]],CREAM,1);}
 else if(kind==='spot'){oval(c,0,0,3,3,tone,null);for(const d of [-1,1])line(c,[[d*4,-3],[d*6,-5]],tone,1.1);}
 else if(kind==='sign'){box(c,-4,-4,8,6,1,tone,null);line(c,[[0,2],[0,5]],tone,1.5);}
 else if(kind==='book'){poly(c,[[-5,-3],[-1,-3],[0,-2],[1,-3],[5,-3],[5,3],[1,3],[0,4],[-1,3],[-5,3]],tone,null);}
 else if(kind==='note'){line(c,[[1,2],[1,-5],[4,-3]],tone,1.6);oval(c,-1,2,2.4,1.5,tone,null);}
 else if(kind==='flag'){line(c,[[-3,4],[-3,-4],[5,-2],[-3,0]],tone,1.6);}
 else if(kind==='check')line(c,[[-4,0],[-1,3],[5,-3]],tone,2);
 c.restore();
}

export function campaignAccentFor(type){return Object.hasOwn(CAST,type)?CAST[type].accent:null;}

/** Art only. Draws an articulated boss around the same deck anchor as atlas bosses. */
export function drawCampaignBoss(c,{type,pose:p}={}){
 if(!Object.hasOwn(CAST,type)||!p)return false;
 const a=CAST[type];
 c.save();
 for(const side of ['right','left']){
  const leg=p[side],{hip,knee,foot}=leg;
  const path=[[hip.x,hip.y],[knee.x,knee.y],[foot.x,-4]];
  line(c,path,INK,12);line(c,path,side==='left'?a.suit:a.shade,9);
  box(c,foot.x-8,-6,15,6,2,a.shade);line(c,[[foot.x-6,-2],[foot.x+4,-2]],a.accent+'a6',1);
 }
 const torso=p.shoulders.x,top=p.shoulders.y;
 for(const side of ['right','left']){
  const {shoulder,elbow,hand,open}=p.arms[side];
  const path=[[shoulder.x,shoulder.y],[elbow.x,elbow.y],[hand.x,hand.y]];
  line(c,path,INK,12);line(c,path,side==='left'?a.suit:a.shade,8.7);
  const ratio=.60,cuffX=elbow.x+(hand.x-elbow.x)*ratio,cuffY=elbow.y+(hand.y-elbow.y)*ratio;
  line(c,[[cuffX,cuffY],[hand.x,hand.y]],a.accent,3.8);
  oval(c,hand.x,hand.y,open?5:4.6,open?4.6:4,a.lit);
  line(c,[[hand.x-1.5,hand.y-1.8],[hand.x-3,hand.y]],a.skin,1.2);
 }
 const waist=-33+p.bob;
 poly(c,[[torso-16,top-6],[torso+16,top-6],[torso+21,top+4],[torso+14,waist+2],[torso-14,waist+2],[torso-19,top+4]],a.suit);
 poly(c,[[torso+8,top-4],[torso+17,top-5],[torso+19,top+5],[torso+13,waist],[torso+5,waist+1]],a.shade,null);
 const formal=['tie','bow'].includes(a.face);
 if(formal){
  poly(c,[[torso-9,top-6],[torso+10,top-6],[torso,top+14]],CREAM);
  if(a.face==='bow')poly(c,[[torso-6,top-4],[torso,top-1],[torso+6,top-4],[torso+6,top+3],[torso,top],[torso-6,top+3]],a.accent);
  else poly(c,[[torso,top-4],[torso+3,top],[torso+2,top+11],[torso,top+14],[torso-2,top+9]],a.accent,a.shade,1);
 }else loop(c,a.accent,2.2,()=>{c.moveTo(torso-7,top-5);c.quadraticCurveTo(torso,top+5,torso+7,top-5);});
 emblem(c,a.emblem,torso+10,top+10,a.accent);
 line(c,[[torso-11,waist-2],[torso+11,waist-2]],a.accent+'88',1.4);
 c.save();c.translate(p.neck.x,p.neck.y+1);c.rotate(p.headTilt);head(c,a);c.restore();
 c.restore();return true;
}

const CROWD=[
 {suit:'#dba66c',shade:'#9f6d52',accent:'#fff3cb',hair:'#332b3b',skin:'#a9694d',lit:'#d49267',cut:'afro'},
 {suit:'#6c8f8b',shade:'#527676',accent:'#bee2bb',hair:'#5d3c3c',skin:'#ba7858',lit:'#e1a67d',cut:'short'},
 {suit:'#8b7293',shade:'#655977',accent:'#f6d4ac',hair:'#e7dbc0',skin:'#884e43',lit:'#b87a66',cut:'wisps'},
 {suit:'#b67f79',shade:'#98625e',accent:'#fce0ac',hair:'#40354a',skin:'#c88f73',lit:'#eab397',cut:'parted'},
 {suit:'#617e9c',shade:'#4c6880',accent:'#d0dfe2',hair:'#372e3d',skin:'#99624c',lit:'#bd8562',cut:'scarf'}
];

/** Deliberately no ship, recoil, magic or weapon for the friendly crowd. */
export function drawCampaignCrowd(c,{x=0,y=0,scale=1,phase=0,reducedMotion=false}={}){
 if(![x,y,scale].every(Number.isFinite)||scale<=0)return false;
 c.save();c.translate(x,y);c.scale(scale,scale);
 oval(c,0,1,75,5,'#40536022',null);
 for(const [i,xx,h] of [[0,-58,57],[1,-31,69],[2,0,63],[3,28,71],[4,56,57]]){
  const a=CROWD[i],stride=reducedMotion?0:Math.sin((Number(phase)||0)*.18+i)*1.2;
  c.save();c.translate(xx,-h+stride);
  for(const side of [-1,1]){
   line(c,[[side*7,25],[side*7,h-6]],INK,8);
   line(c,[[side*7,25],[side*7,h-6]],a.shade,5.5);
   box(c,side*7-5,h-6,10,5,2,a.suit);
  }
  box(c,-13,-1,26,29,8,a.suit);
  line(c,[[-8,23],[8,23]],a.accent,1.4);
  if(i===1||i===3){
   const dir=i===1?-1:1;
   line(c,[[dir*10,5],[dir*16,-12],[dir*17,-46]],a.shade,4);
   box(c,dir*17-9,-52,18,11,3,CREAM,a.shade);
   line(c,[[dir*17-5,-46],[dir*17+5,-46]],a.suit,1.5);
  }else for(const side of [-1,1]){line(c,[[side*10,6],[side*16,19]],a.shade,5);oval(c,side*16,20,2.9,3.4,a.lit);}
  c.save();c.scale(.65,.65);head(c,a);c.restore();c.restore();
 }
 c.restore();return true;
}

/** x = center, y = visible portrait baseline, matching drawSpriteHead. */
export function drawCampaignPortrait(c,{type,x=0,y=0,size=48}={}){
 if(type!=='povo'&&!Object.hasOwn(CAST,type)||![x,y,size].every(Number.isFinite)||size<=0)return false;
 if(type==='povo')return drawCampaignCrowd(c,{x,y,scale:size/122,reducedMotion:true});
 const a=CAST[type];
 c.save();c.translate(x,y-size*.13);c.scale(size/56,size/56);
 poly(c,[[-20,5],[-16,-1],[-6,-3],[5,-3],[17,-1],[21,5],[14,9],[-14,9]],a.suit);
 head(c,a);emblem(c,a.emblem,10,4,a.accent);c.restore();return true;
}
