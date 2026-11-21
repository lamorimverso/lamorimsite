import {drawCampaignFigure,drawCampaignFigurePortrait} from './runner-sprites.mjs?v=1e1c13c37f69';
// Complete illustrated campaign characters. The original vectors remain a
// loading fallback; encounter props and presentation anchors stay independent.
const INK='#292337',CREAM='#fff5de',RIM='#ffe7bd74';
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
// Torso outlines are authored in local coordinates from the neck. The shapes,
// cuffs and stance read at game size without using the palette as an identifier.
const CHARACTER_DESIGN=Object.freeze({
 'ana-elisa':{outline:[[-12,0],[-24,4],[-23,13],[-15,28],[-12,33],[-20,45],[-6,49],[7,46],[20,42],[12,30],[17,11],[13,1]],leg:[13,10,12,9],arm:11,face:[1.07,.91,1.1],wear:'peplum',
  keys:[[-23,-54,23,-46,1,0,-.03],[-24,-91,37,-74,4,-4,.09],[-51,-56,33,-73,-6,-3,-.12],[-30,-61,15,-43,-2,3,.04]]},
 rick:{outline:[[-13,2],[-24,6],[-28,18],[-24,43],[-15,46],[18,46],[24,39],[25,11],[9,3]],leg:[16,13,14,10],arm:15,face:[1.14,1.05,1.12],wear:'hoodie',
  keys:[[-30,-43,13,-56,3,2,.05],[-15,-63,30,-39,7,3,.17],[-49,-49,34,-51,-9,2,-.21],[-36,-40,6,-53,-4,4,.09]]},
 sofia:{outline:[[-13,0],[-26,6],[-18,24],[-14,34],[-25,51],[-6,47],[13,52],[25,43],[15,31],[18,11],[12,1]],leg:[11,10,10,7],arm:11,face:[.91,1.12,.9],wear:'crosscoat',
  keys:[[-18,-66,29,-41,-2,0,-.02],[-27,-82,5,-67,4,-3,.16],[-57,-61,25,-39,-6,2,-.13],[-34,-68,17,-42,-4,1,-.04]]},
 guilherme:{outline:[[-12,0],[-19,2],[-24,12],[-18,39],[-13,43],[16,43],[21,36],[24,9],[10,1]],leg:[14,11,12,12],arm:13,face:[.92,1.08,1.24],wear:'apron',
  keys:[[-24,-36,27,-38,1,3,.06],[-31,-54,5,-52,4,6,.21],[-55,-49,34,-37,-7,2,-.12],[-21,-35,22,-33,-1,7,.09]]},
 erika:{outline:[[-13,0],[-30,3],[-28,13],[-16,22],[-12,33],[-14,44],[9,43],[22,49],[16,36],[13,24],[23,10],[25,4],[12,0]],leg:[12,11,10,7],arm:12,face:[.9,1.18,.98],wear:'stagecoat',
  keys:[[-12,-52,33,-57,2,0,-.07],[-38,-94,42,-88,0,-5,.01],[-52,-64,48,-62,-4,-5,-.08],[-36,-74,32,-48,3,-2,.13]]},
 'renato-freitas':{outline:[[-15,-1],[-30,4],[-29,17],[-27,42],[-16,48],[10,45],[25,50],[25,35],[30,12],[17,2]],leg:[18,13,14,11],arm:15,face:[1.12,.91,1.24],wear:'blazer',
  keys:[[-28,-42,8,-54,0,1,.03],[-12,-77,31,-58,4,-2,.10],[-48,-54,27,-79,-6,-1,-.12],[-32,-39,12,-52,-3,1,-.05]]},
 jones:{outline:[[-21,2],[-28,8],[-29,35],[-19,54],[-5,53],[11,56],[26,50],[28,22],[26,5],[18,0]],leg:[15,12,15,10],arm:13,face:[1.16,.99,.94],wear:'overcoat',
  keys:[[-15,-54,28,-38,3,1,.07],[-18,-70,26,-52,6,-1,.19],[-49,-52,17,-70,-8,0,-.13],[-25,-52,8,-46,-2,4,.05]]},
 maestro:{outline:[[-12,0],[-20,4],[-21,16],[-15,30],[-16,39],[-24,54],[-13,58],[-3,48],[8,45],[17,56],[24,48],[16,29],[20,9],[12,0]],leg:[12,9,9,10],arm:10,face:[.83,1.13,1.09],wear:'tails',
  keys:[[-25,-67,24,-43,1,-3,-.11],[-26,-103,39,-62,4,-4,.12],[-49,-53,40,-79,-4,0,-.16],[-36,-65,29,-44,-2,1,.07]]},
 capita:{outline:[[-15,0],[-27,4],[-30,10],[-20,18],[-15,28],[-18,47],[2,43],[26,53],[34,46],[26,29],[21,13],[27,5],[14,0]],leg:[15,12,13,12],arm:14,face:[1,1.02,1.05],wear:'cape',
  keys:[[-30,-40,14,-58,2,1,-.07],[-22,-91,42,-49,8,-3,.10],[-51,-57,48,-39,-7,1,-.16],[-40,-60,28,-51,-4,2,-.05]]},
 fiscal:{outline:[[-14,1],[-25,5],[-26,16],[-20,32],[-21,39],[-8,42],[19,41],[24,33],[22,13],[23,6],[12,1]],leg:[17,13,15,14],arm:14,face:[1.06,.99,1.33],wear:'vest',
  keys:[[-26,-49,5,-50,0,0,.03],[-33,-78,15,-56,0,-1,-.03],[-52,-53,11,-59,-4,-1,-.10],[-33,-53,16,-54,2,2,.06]]}
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
 const tone=CAMPAIGN_PROP_COLORS[type],sway=reducedMotion?0:Math.sin((Number(phase)||0)*.72),flutter=reducedMotion?0:Math.sin((Number(phase)||0)*.96);
 c.save();c.translate(x,y);c.scale(width/60,height/48);
 switch(type){
 case 'network-panel':
  for(const [i,n] of [[-1,-7],[0,-14],[1,-6]]){
   const xx=i*17;
   if(i!==0)loop(c,'#527b81',2,()=>{c.moveTo(xx,n+1);c.quadraticCurveTo(xx+flutter*5,-2,0,-2);c.lineTo(0,-14);});
   c.save();c.translate(xx,n+1);c.rotate(i*sway*.2);c.translate(-xx,-n-1);
   box(c,xx-9,n-24,18,25,4,'#294c58');box(c,xx-6,n-21,12,12,2,tone,null);
   for(const dot of [-3,2])oval(c,xx+dot,n-5,1,1,i===0?'#fff2a9':'#b4edd5',null);
   c.restore();
  }
  break;
 case 'signal-pulse':
  for(const w of [29,23,17]){const pulse=w+(w===23?sway*3:-sway*2);oval(c,0,-23,pulse,pulse*.61,w===29?'#f3bb7770':null,w===23?'#fff0cb':tone,w===17?2.5:1.8);}
  poly(c,[[-14,-22],[-6,-22],[-1,-30+flutter*3],[3,-15],[7,-24],[14,-24],[9,-20],[3,-12-flutter*3],[-1,-25],[-5,-19]],CREAM,'#875c48');
  break;
 case 'arrow-panel':
  poly(c,[[-27,-41],[16,-41],[28,-24],[16,-7],[-27,-7],[-19,-24]],'#54436e');
  poly(c,[[-21,-36],[14,-36],[23,-24],[14,-12],[-21,-12],[-14,-24]],tone,'#efd3eb');
  arrow(c,-1+sway*5,-24,'#fff0df');break;
 case 'garden-box':
  poly(c,[[-26,-20],[26,-20],[22,-4],[-22,-4]],'#937152','#59463d');
  box(c,-28,-22,56,6,2,'#c48766','#684d3e');
  for(const [i,yy] of [[-2,-32],[-1,-39],[0,-34],[1,-43],[2,-29]]){
   const xx=i*9;c.save();c.translate(xx,-20);c.rotate((sway+flutter*i*.25)*.22);c.translate(-xx,20);
   line(c,[[xx,-20],[xx-2,yy]],'#486f56',2);
   oval(c,xx-4,yy+4,5,3,tone,'#507250');oval(c,xx+3,yy+1,5,3,'#accc7d','#587754');c.restore();
  }
  break;
 case 'stage-spotlight':
  line(c,[[-18,-32],[-23,-32],[-23,-43],[23,-43],[23,-32],[18,-32]],'#6e566c',2);
  c.save();c.translate(0,-32);c.rotate(sway*.23);c.translate(0,32);
  poly(c,[[-11,-20],[11,-20],[26,-2],[-26,-2]],'#f3cc706f','#d69b53',1);
  box(c,-16,-43,32,23,5,'#4f4057');
  oval(c,0,-28,14,8,tone,'#fff1c5',2);
  line(c,[[-6,-29],[5,-31]],CREAM,2);c.restore();
  break;
 case 'rotating-sign':
  line(c,[[0,-4],[0,-17]],'#645064',4);
  c.save();c.translate(0,-27);c.rotate(sway*.22);poly(c,[[-22,-12],[15,-12],[24,0],[15,12],[-22,12]],tone,'#6e4956');
  line(c,[[-19,-8],[12,-8]],'#ffb994',1.6);arrow(c,-1,0,CREAM);c.restore();break;
 case 'debate-card':
  paint(c,CREAM,()=>{c.moveTo(-26,-41);c.quadraticCurveTo(0,-41+sway*6,19,-41);c.lineTo(26,-34+sway*4);c.lineTo(26,-10+flutter*4);c.quadraticCurveTo(15,-10-flutter*3,2,-10);c.lineTo(-7,-4);c.lineTo(-6,-10);c.lineTo(-26,-10);c.closePath();},'#715158');
  box(c,-23,-37,46,7,2,tone,null);
  line(c,[[-17,-25],[-5,-25+sway*2]],'#945969',2.2);line(c,[[-17,-20],[10,-20+flutter*3]],'#806876',1.8);
  line(c,[[-17,-15],[6,-15+flutter*2]],'#806876',1.8);break;
 case 'baton-wave':
  for(const [i,dy] of [[-1,-8],[0,0],[1,8]])loop(c,i===0?'#f7dfb9':tone,i===0?3.3:2.4,()=>{c.moveTo(-25,-20+dy);c.bezierCurveTo(-11,-33+dy+sway*6,3,-11+dy-flutter*7,24,-24+dy+sway*3);});
  for(const xx of [-16,0,16])oval(c,xx,-33+xx*.2+flutter*2,2,2,tone,null);
  break;
 case 'wind-flag':
  line(c,[[-20,-3],[-20,-43]],'#385c6c',3.2);
  paint(c,tone,()=>{c.moveTo(-18,-40);c.bezierCurveTo(-4,-50,10,-30+sway*4,25,-40+sway*4);c.lineTo(22,-20+sway*4);c.bezierCurveTo(1,-12,-1,-28,-18,-20);c.closePath();},'#426777');
  loop(c,'#caf3ee',2,()=>{c.moveTo(-13,-33);c.bezierCurveTo(-3,-36,7,-26+sway*4,19,-30+sway*4);});
  break;
 case 'inspection-gate':
  for(const xx of [-21,21]){box(c,xx-3,-36,6,34,2,'#6a675b');box(c,xx-6,-5,12,4,1,'#454b4d');}
  c.save();c.translate(0,sway*3);
  box(c,-27,-29,54,11,2,tone,'#6b554a');
  for(const xx of [-21,-7,7,21])line(c,[[xx-3,-20],[xx+3,-27]],'#fff0c4',3.2);
  c.restore();oval(c,-21,-38,3.5,4,'#f5ca76','#8f6648');oval(c,21,-38,3.5,4,'#f5ca76','#8f6648');break;
 case 'crowd-lane':
  poly(c,[[-28,-4],[-17,-30],[17,-30],[28,-4]],'#d0ead8','#477966');
  for(const xx of [-15,0,15])line(c,[[xx-5,-16+sway*3],[xx,-22+sway*3],[xx+5,-16+sway*3]],tone,3);
  line(c,[[-18,-10],[18,-10]],'#fffbdd',2);break;
 }
 c.restore();return true;
}

function curls(c,a,points){
 for(const [x,y,r] of points){oval(c,x,y,r,r*.95,a.hair);line(c,[[x-r*.45,y-r*.4],[x,y-r*.62],[x+r*.34,y-r*.44]],'#ffffff3a',.9);}
}
function head(c,a,features=[1,1,1],expression='idle'){
 const {cut,skin,lit,hair,face,accent}=a,[width,length,nose]=features;
 const intent=expression==='charge'?1:expression==='release'?2:expression==='recoil'?-1:0;
 c.save();c.scale(width,length);
 if(['sleek','parted','scarf'].includes(cut))paint(c,hair,()=>{c.moveTo(-17,-25);c.bezierCurveTo(-21,-41,-3,-49,11,-44);c.bezierCurveTo(25,-40,19,-14,23,1);c.bezierCurveTo(6,6,-6,1,-22,3);c.bezierCurveTo(-18,-7,-20,-14,-17,-25);c.closePath();});
 if(cut==='curls')curls(c,a,[[-16,-22,7],[-16,-31,8],[-11,-39,8],[-2,-42,8],[8,-42,8],[16,-37,8],[18,-27,8],[17,-16,7]]);
 if(cut==='afro'){
  oval(c,0,-34,24,18,hair);
  curls(c,a,[[-19,-35,7],[-16,-44,7],[-5,-48,6],[5,-49,6],[15,-44,8],[21,-36,7],[-22,-28,4],[21,-27,5]]);
 }
 oval(c,-14,-18,2.6,4.5,skin);oval(c,15,-18,4.8,5.6,skin);
 loop(c,'#ffeabd69',1.35,()=>{c.moveTo(16,-21);c.quadraticCurveTo(19,-18,16,-16);});
 paint(c,lit,()=>{c.moveTo(-16,-24);c.quadraticCurveTo(-17,-35,-7,-38);c.bezierCurveTo(4,-41,16,-35,16,-26);c.bezierCurveTo(17,-11,10,-4,2,-2);c.bezierCurveTo(-9,0,-14,-7,-16,-11);c.bezierCurveTo(-19,-18,-17,-19,-16,-24);c.closePath();},INK,1.7);
 loop(c,'#ffe4bc65',1.6,()=>{c.moveTo(-12,-21);c.quadraticCurveTo(-11,-14,-7,-12);});
 paint(c,skin,()=>{c.moveTo(14,-31);c.quadraticCurveTo(18,-21,15,-14);c.quadraticCurveTo(13,-6,4,-3);c.quadraticCurveTo(0,-2,-6,-5);c.quadraticCurveTo(7,-7,9,-19);c.quadraticCurveTo(10,-25,14,-31);c.closePath();},null);
 paint(c,'#ffdcbd58',()=>{c.moveTo(-13,-23);c.bezierCurveTo(-11,-30,-2,-30,1,-25);c.quadraticCurveTo(-8,-24,-10,-15);c.quadraticCurveTo(-14,-17,-13,-23);c.closePath();},null);
 line(c,[[2,-7],[7,-9],[11,-15]],skin,1.35);
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
   box(c,-16,-42,31,13,5,'#85845b');poly(c,[[-17,-33],[15,-32],[20,-29],[10,-27],[-27,-27],[-29,-30]],'#4c523d');box(c,-6,-39,8,6,1,accent,null);
  }
 }else if(cut==='curls')curls(c,a,[[-12,-35,6],[-5,-39,7],[4,-40,6],[11,-37,5]]);
 else if(cut==='afro')curls(c,a,[[-13,-34,5],[-7,-38,6],[1,-39,6],[10,-35,5]]);
 if(face==='stubble'||face==='glasses')paint(c,face==='glasses'?hair:'#986143',()=>{c.moveTo(-14,-15);c.quadraticCurveTo(-12,-11,-8,-9);c.quadraticCurveTo(0,-14,7,-9);c.lineTo(14,-15);c.quadraticCurveTo(12,-1,0,-1);c.quadraticCurveTo(-10,-1,-14,-15);c.closePath();},null);
 for(const side of [-1,1]){
  const x=side<0?-9:3.5,angle=intent>0?side*1.3:intent;
  line(c,[[x-3,-26-angle],[x+1,-27],[x+3,-26+angle]],hair,1.5);
  oval(c,x,-21.2,(face==='liner'?3:2.5)*(side<0?.83:1),intent===1?1.15:intent<0?2.25:1.65,CREAM,null);
  oval(c,x-(intent>0?1:.5),-21.3,1.4,1.5,INK,null);
  if(face==='liner')line(c,[[x-3,-21],[x-2,-23],[x+2,-23]],hair,1.15);
 }
 line(c,[[-3.5,-21],[-4.5-2.4*nose,-16],[-2,-15]],skin,1.8);
 const smile=face==='glasses'||face==='stubble'?CREAM:face==='lip'||face==='liner'?'#8a385c':'#884d50';
 if(intent===2||intent<0)oval(c,-3,-10,3.6,intent<0?2.5:1.7,smile,null);
 else loop(c,smile,1.5,()=>{c.moveTo(-7,-10);c.quadraticCurveTo(-3,-7,2,-10.5);});
 if(face==='glasses'){
  for(const x of [-9,3.8])box(c,x-5.1,-25,10.2,8,2,null,'#f5dccb');line(c,[[-4,-22],[0,-22]],'#f5dccb',1.6);line(c,[[9,-23],[16,-24]],'#f5dccb',1.4);
 }else if(face==='moustache')line(c,[[-10,-13],[-6,-15],[-3,-13],[0,-15],[4,-13]],hair,2.8);
 if(['curls','sleek','parted'].includes(cut))for(const side of [-1,1])oval(c,side*15,-13,1.6,2.4,accent,'#73545e',.65);
 if(face==='liner')for(const side of [-1,1])oval(c,side*15,-10,2.7,3.6,null,'#f8d694',1.35);
 c.restore();
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

// Same deck-relative fallback emission used by bossProjectileOrigin in runner-core.
export const CAMPAIGN_CAST_POINT=Object.freeze({x:-48,y:-52});
const clamp01=n=>Math.max(0,Math.min(1,n));
const smooth=n=>n*n*(3-2*n);
const mix=(a,b,t)=>a.map((value,i)=>value+(b[i]-value)*t);

/** Presentation only. The deck, player and projectile keep the engine's anchors. */
export function campaignBossPoseFor(type,p,{phase=0,action='jump',progress,reducedMotion=false}={}){
 const d=CHARACTER_DESIGN[type];if(!Object.hasOwn(CHARACTER_DESIGN,type)||!p)return null;
 const t=Number.isFinite(phase)?phase:0;
 const breath=reducedMotion?0:Math.sin(t*.31),u=Number.isFinite(progress)?clamp01(progress):1;
 const [ready,windup,release,settle]=d.keys;
 const [frontX,frontY,backX,backY,lean,lift,tilt]=p.state==='charge'?mix(ready,windup,smooth(u)):
  p.state==='release'?mix(windup,release,smooth(Math.min(1,u/.32))):
  p.state==='recover'?(u<.50?mix(release,settle,smooth(u/.50)):mix(settle,ready,smooth((u-.50)/.50))):
  p.state==='recoil'?mix(ready,settle,.6).map((n,i)=>n+[-1,5,-8,7,5,3,.17][i]):ready;
 const bob=lift+breath*.8,active=p.state==='charge'||p.state==='release',projectile=action==='jump'||action==='crouch';
 const signalWeight=p.state==='charge'?u:p.state==='release'?1:projectile&&p.state==='recover'?1-smooth(clamp01(u/.5)):0;
 const signal=(action==='crouch'?-5:action==='move'?3:2)*signalWeight;
 // Bring the palm in late, hold it during the first frames of flight, and
 // release back into the unique gesture. Marked zones keep their own pose.
 const guide=!projectile?0:p.state==='charge'?smooth(clamp01((u-.72)/.28)):
  p.state==='release'?1-smooth(clamp01((u-.12)/.43)):0;
 const origin={x:lean,y:-69+bob},angle=tilt+breath*.019;
 const arms={};
 for(const [side,x,y,sign] of [['left',frontX,frontY+signal,-1],['right',backX,backY+signal*.28,1]]){
  const shoulder={x:lean+sign*(d.arm*.42+10),y:origin.y+12};
  const hand={x:x+breath*(sign===-1?1.6:-1),y:y+bob*.23+breath*1.25};
  if(side==='left'&&guide){
   hand.x+=(CAMPAIGN_CAST_POINT.x-hand.x)*guide;
   hand.y+=(CAMPAIGN_CAST_POINT.y-hand.y)*guide;
  }
  const elbow={x:shoulder.x+(hand.x-shoulder.x)*.45+sign*8,y:shoulder.y+(hand.y-shoulder.y)*.48+(hand.y<shoulder.y?7:4)};
  arms[side]={shoulder,elbow,hand,open:active&&(d.wear!=='tails'||side==='right')};
 }
 return {...p,arms,origin,angle,campaignPose:true,phase:t,progress:u,reducedMotion};
}

function drawBoot(c,x,width,side,a,long){
 const y=long?-13:-8;
 poly(c,[[x-width*.31,y],[x+width*.40,y],[x+width*.42,-5],[x+width*.55,-4],[x+width*.49,-.6],[x-width*.79,-.6],[x-width*.87,-3],[x-width*.61,-5],[x-width*.33,-5]],side>0?a.shade:a.suit,INK,1.55);
 poly(c,[[x-width*.7,-3.8],[x-width*.42,-5],[x-width*.12,-4.2],[x-width*.33,-2.9],[x-width*.63,-2.8]],RIM,null);
 line(c,[[x-width*.64,-1.9],[x+width*.38,-1.9]],a.accent+'9c',1.1);
 if(long)line(c,[[x-width*.4,-8],[x+width*.35,-8]],a.accent+'70',1.25);
}

function drawBossLegs(c,p,a,d){
 const [span,width,shoe,knee]=d.leg,long=['vest','cape','apron'].includes(d.wear);
 for(const side of [1,-1]){
  const x=side*span,hip=side*(span*.67)+p.origin.x*.4,guide=x+side*1.5;
  const tone=side<0?a.suit:a.shade;
  poly(c,[[hip-width*.58,-33],[hip+width*.58,-34],[guide+width*.48,-knee],[x+width*.4,-6],[x-width*.46,-6],[guide-width*.5,-knee]],tone,INK,1.7);
  poly(c,[[hip+width*.39,-30],[guide+width*.39,-knee],[x+width*.28,-7],[x+.8,-7],[guide+.4,-knee],[hip+width*.12,-23]],side<0?a.shade:'#18132469',null);
  line(c,[[hip-width*.23,-29],[guide-width*.22,-knee-3],[x-width*.19,-9]],a.accent+'67',1.25);
  drawBoot(c,x,shoe,side,a,long);
 }
}

function drawOutfit(c,p,a,d){
 const {x,y}=p.origin;
 c.save();c.translate(x,y);
 poly(c,d.outline,a.suit,INK,2);
 const [start,end]=[d.outline[0],d.outline.at(-2)];
 poly(c,[[4,3],[end[0]-3,end[1]+4],[end[0]-4,end[1]+11],[8,25],[13,35],[10,40],[5,40],[4,25],[-1,17]],a.shade,null);
 poly(c,[[start[0]-2,4],[-8,5],[-6,12],[-10,21],[-13,18],[-15,11]],a.accent+'2d',null);
 line(c,[[start[0]-2,4],[-13,18],[-10,29]],a.accent+'78',1.7);
 switch(d.wear){
 case 'peplum':
  poly(c,[[-20,37],[-4,31],[10,29],[17,40],[5,43],[-5,43],[-19,47]],a.shade);
  poly(c,[[-13,3],[-2,9],[5,9],[15,3],[6,17],[-3,19]],a.accent);
  emblem(c,a.emblem,8,18,CREAM);break;
 case 'hoodie':
  poly(c,[[-17,4],[0,14],[12,3],[18,8],[12,18],[2,23],[-7,20],[-21,9]],a.shade);
  line(c,[[-6,12],[-8,26]],CREAM,1.4);line(c,[[5,13],[8,24]],CREAM,1.4);
  poly(c,[[-14,33],[-5,29],[8,29],[16,34],[14,40],[-13,40]],a.shade);
  emblem(c,a.emblem,1,34,a.accent);break;
 case 'crosscoat':
  poly(c,[[-16,4],[0,9],[12,4],[5,21],[-12,33],[-17,36],[-9,22]],a.accent);
  line(c,[[-14,36],[12,29]],CREAM,1.5);oval(c,7,26,2,2,a.accent);break;
 case 'apron':
  poly(c,[[-13,3],[-4,3],[-3,16],[7,16],[9,5],[14,5],[11,21],[16,39],[-15,39],[-10,19]],'#806f55');
  box(c,-7,26,14,9,2,a.shade);emblem(c,a.emblem,0,29,a.accent);break;
 case 'stagecoat':
  poly(c,[[-24,6],[-14,4],[-4,13],[-15,19],[-21,14]],a.accent);
  poly(c,[[20,6],[11,4],[5,13],[14,20],[19,15]],a.accent);
  line(c,[[-8,17],[-4,38],[7,41]],'#ffe6af',2);
  emblem(c,a.emblem,9,23,a.accent);break;
 case 'blazer':
  poly(c,[[-15,4],[0,13],[13,4],[7,13],[9,17],[0,35],[-10,18],[-6,13]],CREAM);
  poly(c,[[-1,13],[3,15],[2,31],[0,34],[-4,28]],a.accent);
  box(c,11,24,10,4,1,a.shade);line(c,[[12,24],[19,24]],a.accent,1.3);break;
 case 'overcoat':
  box(c,-12,5,25,7,2,a.shade);
  poly(c,[[-21,10],[-7,13],[-7,21],[1,30],[-11,28],[-18,17]],a.shade);
  poly(c,[[19,10],[8,13],[7,21],[1,30],[12,27],[16,19]],a.shade);
  line(c,[[0,28],[1,48]],INK,1.8);for(const yy of [33,41,47])oval(c,6,yy,1.6,1.6,a.accent,null);break;
 case 'tails':
  poly(c,[[-12,5],[11,5],[6,17],[0,38],[-6,17]],CREAM);
  poly(c,[[-8,6],[-1,9],[7,6],[7,14],[-1,12],[-8,14]],a.accent);
  for(const yy of [19,23,27])oval(c,0,yy,1,1,a.shade,null);
  emblem(c,a.emblem,11,15,a.accent);break;
 case 'cape':
  poly(c,[[8,7],[18,7],[20,18],[22,31],[30,44],[23,46],[12,40],[9,25],[1,14]],a.shade);
  line(c,[[15,14],[16,27],[24,41]],a.accent+'a0',1.9);
  poly(c,[[-24,8],[-16,5],[-7,8],[-9,13],[-20,14]],a.accent);oval(c,7,10,3,3,CREAM);break;
 case 'vest':
  poly(c,[[-15,3],[-4,5],[0,13],[5,6],[14,3],[17,29],[14,36],[-15,36],[-17,26]],'#9d8056');
  line(c,[[-11,14],[-11,29]],a.accent,2.8);line(c,[[12,14],[12,29]],a.accent,2.8);
  line(c,[[-15,31],[14,31]],CREAM,2);emblem(c,a.emblem,7,18,a.accent);break;
 }
 c.restore();
}

function drawBossArm(c,a,d,arm,back){
 const {shoulder:s,elbow:e,hand:h,open}=arm;
 const tone=back?a.shade:a.suit,width=d.arm*(back?.82:1);
 const length=Math.max(1,Math.hypot(h.x-e.x,h.y-e.y));
 const vx=(h.x-e.x)/length,vy=(h.y-e.y)/length;
 const path=[[s.x,s.y],[e.x,e.y],[h.x,h.y]];
 line(c,path,INK,width+2.3);line(c,path,tone,width);
 loop(c,back?'#17142261':a.shade,width*.28,()=>{c.moveTo(s.x,s.y+width*.23);c.quadraticCurveTo(e.x,e.y+width*.32,h.x-vx*8,h.y-vy*8+width*.24);});
 const cuff=[h.x-vx*5,h.y-vy*5];
 line(c,[[h.x-vx*9,h.y-vy*9],cuff],a.accent,width*.67);
 line(c,[[s.x+1,s.y-2],[e.x+1,e.y-2]],a.accent+'63',1.25);
 c.save();c.translate(h.x,h.y);c.rotate(Math.atan2(vy,vx));
 if(open){
  poly(c,[[-4,-3],[-1,-4],[1,-7],[3,-6],[2,-3],[6,-3],[8,-1],[7,3],[3,5],[-4,3]],a.lit,INK,1.25);
  line(c,[[2,-2],[6,-1]],a.skin,1.1);line(c,[[1,2],[5,2]],a.skin,1.05);
 }else{
  oval(c,1,0,5,4.5,a.lit,INK,1.25);line(c,[[1,-2],[4,-1]],a.skin,1.15);line(c,[[-1,2],[2,2]],a.skin,1);
 }
 c.restore();
}

function drawStageAccessory(c,d,p,a){
 if(d.wear==='tails'){
  const {hand,elbow}=p.arms.left,angle=Math.atan2(hand.y-elbow.y,hand.x-elbow.x);
  c.save();c.translate(hand.x,hand.y);c.rotate(angle-.30);
  line(c,[[0,0],[21,0]],INK,3.1);line(c,[[5,0],[22,0]],CREAM,1.3);c.restore();
 }else if(d.wear==='vest'){
  const {x,y}=p.arms.right.hand;
  c.save();c.translate(x,y);c.rotate(-.21);
  box(c,-4,-11,17,22,2,'#5a4543');box(c,-2,-9,13,17,1,'#e9d8a9',null);
  line(c,[[0,-5],[8,-5]],a.shade,1.3);line(c,[[0,0],[7,0]],a.shade,1.3);c.restore();
 }
}

/** Draws a complete original figure around the same deck anchor as atlas bosses. */
export function drawCampaignBoss(c,{type,pose:p,...options}={}){
 if(!Object.hasOwn(CHARACTER_DESIGN,type)||!p)return false;
 if(drawCampaignFigure(c,{type,state:p.state,phase:p.phase??options.phase,progress:p.progress??options.progress,reducedMotion:p.reducedMotion??options.reducedMotion}))return true;
 const a=CAST[type],d=CHARACTER_DESIGN[type];
 if(!p.campaignPose)p=campaignBossPoseFor(type,p,options);
 c.save();
 drawBossLegs(c,p,a,d);
 drawBossArm(c,a,d,p.arms.right,true);
 drawOutfit(c,p,a,d);
 c.save();c.translate(p.origin.x,p.origin.y+1);c.rotate(p.angle);
 head(c,a,d.face,p.state);c.restore();
 drawBossArm(c,a,d,p.arms.left,false);
 drawStageAccessory(c,d,p,a);
 c.restore();return true;
}

const CROWD=[
 {x:-60,height:54,span:6,shape:[[-10,-1],[-17,7],[-16,27],[-10,34],[11,33],[16,21],[13,0]],suit:'#dba66c',shade:'#9f6d52',accent:'#fff3cb',hair:'#332b3b',skin:'#a9694d',lit:'#d49267',cut:'afro',motion:'welcome'},
 {x:-32,height:65,span:8,shape:[[-11,-3],[-17,2],[-14,33],[13,32],[16,7],[11,-1]],suit:'#6c8f8b',shade:'#527676',accent:'#bee2bb',hair:'#5d3c3c',skin:'#ba7858',lit:'#e1a67d',cut:'short',motion:'placard'},
 {x:0,height:55,span:7,shape:[[-10,-1],[-14,4],[-17,25],[-13,35],[16,34],[16,10],[8,-1]],suit:'#8b7293',shade:'#655977',accent:'#f6d4ac',hair:'#e7dbc0',skin:'#884e43',lit:'#b87a66',cut:'wisps',motion:'wave'},
 {x:27,height:68,span:8,shape:[[-14,-2],[-18,4],[-12,18],[-15,34],[-10,39],[9,37],[15,26],[13,6],[9,-2]],suit:'#b67f79',shade:'#98625e',accent:'#fce0ac',hair:'#40354a',skin:'#c88f73',lit:'#eab397',cut:'parted',motion:'placard'},
 {x:60,height:53,span:7,shape:[[-12,0],[-17,5],[-13,24],[-17,33],[-10,37],[12,36],[18,31],[13,14],[13,0]],suit:'#617e9c',shade:'#4c6880',accent:'#d0dfe2',hair:'#372e3d',skin:'#99624c',lit:'#bd8562',cut:'scarf',motion:'guide'}
];

/** Grounded crowd. The optional presentation poses describe a passage, never an attack. */
export function drawCampaignCrowd(c,{x=0,y=0,scale=1,phase=0,reducedMotion=false,preparing=false,attacking=false,recovering=false,progress}={}){
 if(![x,y,scale].every(Number.isFinite)||scale<=0)return false;
 if(drawCampaignFigure(c,{type:'povo',x,y,scale,phase,progress,reducedMotion,state:attacking?'release':preparing?'charge':recovering?'recover':'idle'}))return true;
 const t=reducedMotion?0:(Number.isFinite(phase)?phase:0),u=Number.isFinite(progress)?smooth(clamp01(progress)):1;
 const signal=attacking?.81+u*.19:preparing?u*.70:recovering?(1-u)*.76:0;
 c.save();c.translate(x,y);c.scale(scale,scale);
 oval(c,0,1.2,77,4,'#40536028',null);
 for(const [i,a] of CROWD.entries()){
  const swing=reducedMotion?0:Math.sin(t*(1.4+i*.11)+i*1.2);
  const h=-a.height+swing*.95;
  const spread=(a.x<=0?-1:1)*signal*(i===2?1.2:4.5);
  c.save();c.translate(a.x,0);
  for(const side of [-1,1]){
   const foot=side*a.span;
   poly(c,[[spread+side*7-4,h+25],[spread+side*7+4,h+24],[foot+4,-7],[foot+3,-4],[foot-4,-4],[foot-4,-9]],a.shade,INK,1.3);
   drawBoot(c,foot,i%2===0?8:9,side,a,false);
  }
  c.translate(spread,h);
  const dir=a.x<0?-1:1;
  const wave=a.motion==='wave',sign=a.motion==='placard',guide=a.motion==='guide';
  const reach=signal*(guide?10:wave?8:5);
  for(const side of [-1,1]){
   const active=side===dir;
   const hx=side*(active&&sign?20:active&&guide?24+reach:active?17+reach:15);
   const hy=active&&sign?-14-swing*3-signal*7:active&&wave?5-swing*7-reach:
    active&&guide?11+swing*3-reach*.4:19+swing*(active?3:1)-(active?reach:0);
   const path=[[side*9,5],[side*16,active&&sign?-2:12],[hx,hy]];
   line(c,path,INK,7);line(c,path,side<0?a.suit:a.shade,5);
   oval(c,hx,hy,3.3,active&&wave?4:3.4,a.lit,INK,1);
   if(active&&sign){
    c.save();c.translate(hx,hy);c.rotate(swing*.06-dir*.07);
    line(c,[[0,0],[0,-18]],a.shade,3);
    poly(c,[[-12,-28],[10,-29],[12,-17],[-11,-17]],CREAM,a.shade);
    line(c,[[-7,-22],[6,-22]],a.suit,1.7);
    line(c,[[-7,-25],[2,-25]],a.shade,1.2);
    c.restore();
   }
  }
  poly(c,a.shape,a.suit,INK,1.65);
  poly(c,[[6,1],[10,4],[10,15],[7,30],[1,32],[4,15]],a.shade,null);
  line(c,[[-9,5],[-7,19],[-6,25]],a.accent+'82',1.45);
  if(wave)poly(c,[[-10,0],[12,0],[9,7],[3,8],[-6,6]],a.accent);
  else if(guide)poly(c,[[-14,3],[-9,-1],[5,0],[7,4],[-6,10],[-15,9]],a.accent);
  else if(sign){line(c,[[0,9],[-1,29]],a.accent,1.2);oval(c,6,14,2,2,a.accent);}
  else loop(c,a.accent,1.5,()=>{c.moveTo(-8,3);c.quadraticCurveTo(0,11,7,3);});
  c.save();c.rotate((swing*.033+dir*signal*.06));c.scale(.66,.66);head(c,a);c.restore();c.restore();
 }
 c.restore();return true;
}

/** x = center, y = visible portrait baseline, matching drawSpriteHead. */
export function drawCampaignPortrait(c,{type,x=0,y=0,size=48}={}){
 if(type!=='povo'&&!Object.hasOwn(CAST,type)||![x,y,size].every(Number.isFinite)||size<=0)return false;
 if(drawCampaignFigurePortrait(c,{type,x,y,size}))return true;
 if(type==='povo')return drawCampaignCrowd(c,{x,y,scale:size/122,reducedMotion:true});
 const a=CAST[type];
 c.save();c.translate(x,y-size*.13);c.scale(size/56,size/56);
 poly(c,[[-20,5],[-16,-1],[-6,-3],[5,-3],[17,-1],[21,5],[14,9],[-14,9]],a.suit);
 head(c,a,CHARACTER_DESIGN[type].face);emblem(c,a.emblem,10,4,a.accent);c.restore();return true;
}
