// Cenários vetoriais: três planos leves, sem texto nem elementos de colisão.
const palettes={
 brasilia:{sky:'#7799b4',haze:'#f0dfc5',far:'#83a7b7',near:'#619fa1',ink:'#355a71',stone:'#f7efd8',shade:'#bbd1cf',road:'#a4bec5'},
 rio:{sky:'#78b3be',haze:'#f1e1bc',far:'#7db4ad',near:'#5aada2',ink:'#366e75',stone:'#f7ebd0',shade:'#b6d4c8',road:'#a8c8b8'},
 argentina:{sky:'#809dbb',haze:'#eddfd2',far:'#93adc5',near:'#719caf',ink:'#4d6888',stone:'#fff0d4',shade:'#c4cccf',road:'#adbfce'},
 paraguai:{sky:'#bb9ba7',haze:'#f5e0c5',far:'#b69eaa',near:'#87aa9c',ink:'#7b657a',stone:'#fff0da',shade:'#dcc4c0',road:'#c9b8ba'},
 florida:{sky:'#d29cb4',haze:'#ffe4c7',far:'#bea6bd',near:'#98a9bd',ink:'#806d8f',stone:'#ffe8d5',shade:'#dbbdc8',road:'#d1bec6'},
 'casa-branca':{sky:'#89a3c2',haze:'#f1e3d8',far:'#a1b3cb',near:'#83aaa9',ink:'#536b86',stone:'#fff9ea',shade:'#ccd9dc',road:'#b2c7cd'},
 'sao-paulo':{sky:'#718da8',haze:'#e8d8d0',far:'#829cb4',near:'#829c9d',ink:'#48637c',stone:'#e5edea',shade:'#a6bcc6',road:'#b2c0c3'},
 'brasilia-final':{sky:'#858aa6',haze:'#ead1b3',far:'#91a0b2',near:'#78a4a5',ink:'#536b7f',stone:'#fff2d9',shade:'#c2cfd1',road:'#b4c5c5'}
};
const wrap=(n,span)=>(n%span+span)%span;
function shape(c,fill,stroke,draw){c.beginPath();draw();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.3;c.stroke();}}
function rect(c,x,y,w,h,fill,stroke,r=0){shape(c,fill,stroke,()=>r?c.roundRect(x,y,w,h,r):c.rect(x,y,w,h));}
function oval(c,x,y,rx,ry,fill){shape(c,fill,null,()=>c.ellipse(x,y,rx,ry,0,0,Math.PI*2));}
function line(c,points,color,width=1.3){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function cloud(c,x,y,s){
 c.save();c.translate(x,y);c.scale(s,s);
 shape(c,'#ffffffc9','#ffffff88',()=>{c.moveTo(-36,8);c.bezierCurveTo(-53,4,-45,-10,-29,-9);c.bezierCurveTo(-31,-32,4,-37,13,-16);c.bezierCurveTo(32,-24,48,-8,37,7);c.closePath();});
 shape(c,'#aac9d32b',null,()=>{c.moveTo(-36,4);c.quadraticCurveTo(-7,11,37,3);c.lineTo(37,7);c.quadraticCurveTo(0,12,-36,8);c.closePath();});
 c.restore();
}
function palm(c,x,y,p){line(c,[[x,y],[x-4,y-27],[x+2,y-65]],p.ink,4);for(const [dx,dy]of[[-27,-5],[-21,10],[24,-6],[29,12],[-3,-16]]){c.beginPath();c.moveTo(x+2,y-65);c.quadraticCurveTo(x+dx*.7,y-79+dy*.5,x+dx,y-65+dy);c.strokeStyle=p.near;c.lineWidth=5;c.stroke();}}

function skyline(c,stage,p,d,width){
 c.save();c.globalAlpha*=.55;
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
function landmark(c,stage,p,x){
 const base=226;c.save();c.translate(x,base);c.lineJoin='round';
 oval(c,0,4,134,5,p.ink+'18');
 if(stage.id==='brasilia'||stage.id==='brasilia-final'){
  rect(c,-126,-12,252,12,p.stone,p.ink,2);rect(c,-14,-104,12,92,p.stone,p.ink,1);rect(c,6,-104,12,92,p.stone,p.ink,1);
  rect(c,-10,-100,3,83,p.shade,null);rect(c,10,-100,3,83,p.shade,null);
  shape(c,p.stone,p.ink,()=>{c.moveTo(-111,-13);c.bezierCurveTo(-105,-54,-55,-54,-47,-13);c.closePath();});
  shape(c,p.shade,p.ink,()=>{c.moveTo(45,-42);c.bezierCurveTo(49,-4,102,-4,110,-42);c.closePath();});
  line(c,[[43,-42],[112,-42]],p.stone,4);line(c,[[-116,-7],[116,-7]],p.shade,2);
 }else if(stage.id==='sao-paulo'){
  const beam='#ad4c48',light='#c16a5e',shadow='#794e55';
  // Hall suspended above the broad, empty vão livre. All lines remain behind the roadway.
  rect(c,-135,0,270,5,p.stone,p.ink,1);
  rect(c,-109,-83,218,42,'#829eac',p.ink,1);
  rect(c,-100,-77,200,26,'#a7bfcd',p.ink,1);
  for(let x=-96;x<101;x+=16){
   line(c,[[x,-76],[x,-51]],'#668697',1.3);
   line(c,[[x+2,-73],[x+8,-59]],'#d1e3e6',1.2);
  }
  rect(c,-112,-51,224,10,p.shade,p.ink,1);
  rect(c,-122,-91,244,13,beam,shadow,1);
  rect(c,-122,-91,244,3,light);
  for(const x of [-121,110]){rect(c,x,-85,11,85,beam,shadow,1);rect(c,x+1,-78,2,76,light);}
  rect(c,-55,-16,100,2,p.shade);
  line(c,[[-57,1],[-48,-10],[49,-10],[59,1]],p.ink+'78',1.2);
  for(const [x,y,s] of [[-152,-1,.56],[150,-1,.66]]){
   line(c,[[x,y],[x,y-45*s]],p.ink,3);
   oval(c,x,y-47*s,25*s,19*s,p.near);
   oval(c,x-10*s,y-38*s,20*s,16*s,'#77968a');
  }
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
 }else if(stage.id==='paraguai'){
  // Palacio de López, Asunción: arcades, coral roofs and central tower.
  rect(c,-130,-48,260,48,p.stone,p.ink,2);rect(c,-41,-78,82,78,p.stone,p.ink,2);
  shape(c,'#bc655d',p.ink,()=>{c.moveTo(-141,-48);c.lineTo(-126,-64);c.lineTo(126,-64);c.lineTo(141,-48);c.closePath();});
  rect(c,-25,-112,50,45,p.stone,p.ink,1);rect(c,-12,-133,24,21,p.shade,p.ink,1);
  shape(c,'#bd655c',p.ink,()=>{c.moveTo(-18,-133);c.lineTo(0,-147);c.lineTo(18,-133);c.closePath();});
  for(const xx of [-111,-87,-63,53,77,101]){rect(c,xx,-40,12,29,p.shade,p.ink,6);line(c,[[xx-4,-44],[xx-4,-4]],p.stone,4);}
  for(const xx of [-24,-6,12])rect(c,xx,-64,12,23,p.shade,p.ink,5);
  rect(c,-17,-31,34,31,p.shade,p.ink,13);oval(c,0,-93,7,7,'#fffdf0');line(c,[[0,-98],[0,-93],[4,-91]],p.ink,1.3);
  palm(c,-156,0,p);palm(c,151,0,p);
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
 c.save();
 const p=palettes[stage.id]||palettes.brasilia,d=reducedMotion?0:distance;
 const sky=c.createLinearGradient(0,0,0,246);sky.addColorStop(0,p.sky);sky.addColorStop(1,p.haze);
 c.fillStyle=sky;c.fillRect(0,0,width,300);
 oval(c,width-66,55,29,29,'#fff7d838');oval(c,width-66,55,21,21,'#fff9e5d9');
 cloud(c,wrap(145-d*.016,width+140)-50,65,.73);cloud(c,wrap(510-d*.019,width+160)-50,91,.48);
 skyline(c,stage,p,d,width);landmark(c,stage,p,width*.70);
 rect(c,0,234,width,11,p.near+'5c');line(c,[[0,234],[width,234]],p.ink+'55',1);
 rect(c,0,245,width,55,p.road);line(c,[[0,245],[width,245]],p.ink,1.5);line(c,[[0,249],[width,249]],'#ffffffb3',2);
 // Marcas baixas e bem espaçadas dão velocidade sem decorar a zona de perigo.
 for(let x=-wrap(d,98);x<width;x+=98){rect(c,x,275,38,3,'#ffffffa6',null,1);line(c,[[x+18,244],[x+55,244]],p.ink+'26',1);}
 line(c,[[0,296],[width,296]],p.ink+'18',1);
 c.restore();
}

const journeyStages=['brasilia','rio','argentina','paraguai','florida','casa-branca'];
const segmentLength=7000;
const planeScales=[.14,.18,.22];
const smooth=n=>{const t=Math.max(0,Math.min(1,n));return t*t*(3-2*t);};
const stageAt=index=>journeyStages[wrap(index,journeyStages.length)];
const colorChannels=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
const paletteChannels=Object.fromEntries(Object.entries(palettes).map(([id,palette])=>[id,Object.fromEntries(Object.entries(palette).map(([key,value])=>[key,colorChannels(value)]))]));
function blendPalette(from,to,amount){
 return Object.fromEntries(Object.keys(from).map(key=>[key,from[key].map((value,i)=>value+(to[key][i]-value)*amount)]));
}
function paletteAlongRoute(location,stageFor=stageAt){
 // A 2,200 m feather is spatial: its right-hand colors arrive before its left-hand colors.
 const index=Math.floor((location+1100)/segmentLength);
 const amount=smooth((location-index*segmentLength+1100)/2200);
 return blendPalette(paletteChannels[stageFor(index-1)],paletteChannels[stageFor(index)],amount);
}

// A pequena placa mostra o marco do próximo lugar ainda fora do enquadramento.
function routeWaypoint(route,width,stageFor,reducedMotion,flightLift){
 const segmentIndex=Math.round(route/segmentLength),offset=route-segmentIndex*segmentLength;
 const stageId=stageFor(segmentIndex);
 if(segmentIndex<=0||stageId===stageFor(segmentIndex-1))return null;
 const alpha=smooth((offset+1250)/700)*(1-smooth((offset-250)/850))*(1-flightLift);
 if(alpha<=0)return null;
 return {segmentIndex,stageId,alpha,x:width*(reducedMotion?.72:.85-.24*smooth((offset+1250)/2350))};
}
function flightMood(flight,reducedMotion){
 if(!flight||!Object.hasOwn(palettes,flight.from)||!Object.hasOwn(palettes,flight.to)||!Number.isFinite(flight.progress))return null;
 const p=Math.max(0,Math.min(1,flight.progress));
 // Weights depend on the same simulation progress as boarding and landing,
 // not on painting/render frequency or a second animation clock.
 const lift=smooth((p-.09)/.24)*(1-smooth((p-.72)/.28));
 return {lift,shift:reducedMotion?0:42*lift,palette:blendPalette(paletteChannels[flight.from],paletteChannels[flight.to],smooth((p-.18)/.68))};
}
/**
 * Pure, unbounded route geometry shared by rendering and continuity tests.
 * Each segmentIndex is an occurrence on the journey (never modulo a route lap); only its
 * stageId repeats. Screen x = .35*width + (world metres-routeDistance)*plane.scale.
 * The far/middle/landmark planes use .14/.18/.22 px per route metre. Each place has
 * one landmark at 2,500 m into its 7,000 m segment. A few offscreen neighbours are
 * retained; dropping one cannot reset a visible object. distance moves only clouds
 * and road marks, allowing geography to stop during encounters.
 * Reduced motion fixes every decorative position and softly blends identities in
 * the final 1,000 m of each place, so the route still communicates its next stop.
 * Palette channels are floating RGB triples; paletteStops offsets run from 0 to 1.
 */
export function journeySceneryGeometry({routeDistance=0,distance=routeDistance,width=900,reducedMotion=false,openingDistance=0,campaignStages,flight}={}){
 const opening=Number.isFinite(openingDistance)?Math.max(0,openingDistance):0;
 const route=(Number.isFinite(routeDistance)?Math.max(0,routeDistance):0)-opening;
 // Abertura contínua: ocorrências anteriores à campanha também são Brasília.
 // Coordenadas negativas mantêm o parallax, sem congelar nem reiniciar o fundo.
 const campaign=Array.isArray(campaignStages)&&campaignStages.length>0&&campaignStages.every(id=>Object.hasOwn(palettes,id))?campaignStages:null;
 const stageFor=index=>campaign?campaign[Math.max(0,Math.min(campaign.length-1,index))]:stageAt(opening?Math.max(0,index):index);
 const travelled=Number.isFinite(distance)?Math.max(0,distance):route;
 const w=Number.isFinite(width)?Math.max(1,width):900;
 const index=Math.floor(route/segmentLength),anchor=w*.35;
 const amount=smooth((route-index*segmentLength-6000)/1000);
 const identities=[{segmentIndex:index,stageId:stageFor(index),alpha:1-amount},{segmentIndex:index+1,stageId:stageFor(index+1),alpha:amount}];
 const layers=planeScales.map((scale,layer)=>({
  id:['far','middle','landmark'][layer],scale,
  segments:reducedMotion?identities.map(identity=>({...identity,x:0,width:w,stationary:true})):
   Array.from({length:5},(_,offset)=>{
    const segmentIndex=index+offset-2;
    return {segmentIndex,stageId:stageFor(segmentIndex),alpha:1,x:anchor+(segmentIndex*segmentLength-route)*scale,width:segmentLength*scale,stationary:false};
   })
 }));
 const landmarks=reducedMotion?identities.map(identity=>({...identity,x:w*.70})):
  layers[2].segments.map(segment=>({segmentIndex:segment.segmentIndex,stageId:segment.stageId,alpha:1,x:segment.x+2500*layers[2].scale}));
 const uniform=reducedMotion?blendPalette(paletteChannels[stageFor(index)],paletteChannels[stageFor(index+1)],amount):null;
 const mood=flightMood(flight,reducedMotion),flightLift=mood?.lift??0;
 const paletteStops=Array.from({length:25},(_,i)=>{
  const palette=uniform||paletteAlongRoute(route+(w*i/24-anchor)/planeScales[2],stageFor);
  return {offset:i/24,palette:flightLift>0?blendPalette(palette,mood.palette,flightLift):palette};
 });
 const decorativeDistance=reducedMotion?0:travelled;
 return {width:w,layers,landmarks,paletteStops,flight:mood,waypoint:routeWaypoint(route,w,stageFor,reducedMotion,flightLift),roadOffset:wrap(decorativeDistance,98),clouds:[
  {x:wrap(145-decorativeDistance*.016,w+140)-70,y:65,scale:.73},
  {x:wrap(510-decorativeDistance*.019,w+160)-80,y:91,scale:.48},
  {x:wrap(790-decorativeDistance*.011,w+120)-60,y:43,scale:.32}
 ]};
}


// Cada 6.000 metros simulados o período muda: manhã -> tarde -> noite.
// A transição começa antes da divisa e é contínua também no reinício do ciclo.
export const DAY_PHASE_METRES=6000;
const dayBlendMetres=1600;
const lightPhases=[
 {name:'manhã',top:[113,161,196],middle:[239,192,158],horizon:[253,224,194]},
 {name:'tarde',top:[73,152,202],middle:[133,191,213],horizon:[214,230,211]},
 {name:'noite',top:[17,29,64],middle:[36,54,94],horizon:[85,85,121]}
];
export function timeOfDayFor(distance=0){
 const d=Number.isFinite(distance)?Math.max(0,distance):0;
 const index=Math.floor(d/DAY_PHASE_METRES)%3;
 const into=d%DAY_PHASE_METRES,nextIndex=(index+1)%3;
 const blend=smooth((into-(DAY_PHASE_METRES-dayBlendMetres))/dayBlendMetres);
 return {phase:lightPhases[index].name,next:lightPhases[nextIndex].name,
  index,nextIndex,blend,progress:into/DAY_PHASE_METRES,
  night:(index===2?1-blend:0)+(nextIndex===2?blend:0),
  morning:(index===0?1-blend:0)+(nextIndex===0?blend:0)};
}
const lightMix=(a,b,t)=>a.map((v,i)=>Math.round(v+(b[i]-v)*t));
function skyTimeGradient(c,time){
 const current=lightPhases[time.index],next=lightPhases[time.nextIndex];
 const gradient=c.createLinearGradient(0,0,0,246);
 for(const [position,key] of [[0,'top'],[.57,'middle'],[1,'horizon']])
  gradient.addColorStop(position,'rgb('+lightMix(current[key],next[key],time.blend).join(',')+')');
 return gradient;
}
function drawSkyObjects(c,width,time,reducedMotion){
 const body=(index,progress,opacity)=>{
  if(opacity<.005)return;
  const sun=index!==2;
  const x=width*(index===0?.17+.28*progress:index===1?.46+.30*progress:.25+.45*progress);
  const y=index===0?103-51*progress:index===1?53+34*progress:72-84*progress*(1-progress);
  const radius=sun?18:13;
  c.save();c.globalAlpha*=opacity;
  const halo=c.createRadialGradient(x,y,2,x,y,sun?90:66);
  halo.addColorStop(0,sun?'#ffedbc99':'#dee8ff7a');
  halo.addColorStop(.35,sun?'#ffcc8a48':'#c6d7ff2b');
  halo.addColorStop(1,'#ffffff00');
  c.fillStyle=halo;c.fillRect(x-95,y-95,190,190);
  if(sun){
   c.strokeStyle='#fff1ceb8';c.lineWidth=1.5;c.beginPath();
   for(const [dx,dy] of [[1,0],[.7071,.7071],[0,1],[-.7071,.7071],[-1,0],[-.7071,-.7071],[0,-1],[.7071,-.7071]]){
    c.moveTo(x+dx*25,y+dy*25);c.lineTo(x+dx*33,y+dy*33);
   }c.stroke();
   oval(c,x,y,22,22,'#ffda97a6');
   oval(c,x,y,radius,radius,'#fff1c9');
   oval(c,x-5,y-5,5,4,'#fff9efa8');
  }else{
   oval(c,x,y,16,16,'#dfeaff82');
   oval(c,x,y,radius,radius,'#f4f1e9');
   oval(c,x-4,y+3,3,2.5,'#9faac76b');
   oval(c,x+5,y-4,2.5,2,'#a4b6cb55');
  }
  c.restore();
 };
 // Os astros entram e saem por opacidade, sem saltar de lugar na mudança.
 body(time.index,reducedMotion?.5:time.progress,1-time.blend);
 body(time.nextIndex,reducedMotion?.5:0,time.blend);
 if(time.night>.005){
  c.save();c.globalAlpha*=time.night*.85;
  const count=Math.min(38,Math.max(14,Math.ceil(width/24)));
  c.fillStyle='#ecf2fff0';c.beginPath();
  for(let i=0;i<count;i++){
   const x=(i*173+33)%997/997*width,y=17+(i*71+13)%105;
   const radius=i%7===0?1.25:.65;
   c.moveTo(x+radius,y);c.ellipse(x,y,radius,radius,0,0,Math.PI*2);
  }c.fill();
  c.strokeStyle='#f2f4ffc4';c.lineWidth=.7;c.beginPath();
  for(let i=2;i<count;i+=11){
   const x=(i*173+33)%997/997*width,y=17+(i*71+13)%105;
   c.moveTo(x-3,y);c.lineTo(x+3,y);c.moveTo(x,y-3);c.lineTo(x,y+3);
  }c.stroke();c.restore();
 }
}
function drawHighClouds(c,geometry,time,quiet){
 c.save();c.globalAlpha*=1-.4*quiet;
 c.strokeStyle=time.night>.5?'#b4c3df78':'#ffffff94';
 c.lineWidth=1.35;c.lineCap='round';c.beginPath();
 for(const item of geometry.clouds){
  const x=item.x+22,y=item.y+20;
  c.moveTo(x-54,y);c.bezierCurveTo(x-20,y-7,x+25,y+4,x+73,y-3);
  c.moveTo(x-35,y+7);c.bezierCurveTo(x-3,y+3,x+30,y+12,x+56,y+5);
 }c.stroke();
 if(time.night>.005){
  c.globalAlpha*=time.night*.40;c.fillStyle='#405a86';c.beginPath();
  for(const item of geometry.clouds){
   const x=item.x,y=item.y;
   c.moveTo(x-30*item.scale,y+6*item.scale);
   c.ellipse(x,y,40*item.scale,14*item.scale,0,0,Math.PI*2);
  }c.fill();
 }
 c.restore();
}
function drawNightHorizon(c,geometry,night){
 if(night<.005)return;
 const width=geometry.width;
 c.save();c.globalAlpha*=night*.23;c.fillStyle='#111c38';
 c.fillRect(0,160,width,74);c.restore();
 // A mesma malha fixa de janelas acompanha a paisagem sem piscadas.
 c.save();c.globalAlpha*=night*.87;c.fillStyle='#ffe3a2';c.beginPath();
 for(let i=0;i<Math.ceil(width/48)+1;i++){
  const x=i*48+(i*13)%13,y=195+(i*17)%23;
  c.rect(x,y,2.4,3);
  if(i%3===0)c.rect(x+11,y-8,2,3);
 }
 c.fill();c.restore();
}

function paletteGradient(c,geometry,key,alpha=1){
 const gradient=c.createLinearGradient(0,0,geometry.width,0);
 for(const stop of geometry.paletteStops){
  const [r,g,b]=stop.palette[key];gradient.addColorStop(stop.offset,`rgba(${r},${g},${b},${alpha})`);
 }
 return gradient;
}
function daylightGradient(c,geometry,top,bottom,opacity){
 // Reuse the route's blended channels: light must not jump at the 7 km borders.
 const color=geometry.paletteStops[12].palette.haze;
 const gradient=c.createLinearGradient(0,top,0,bottom);
 gradient.addColorStop(0,`rgba(${color[0]},${color[1]},${color[2]},0)`);
 gradient.addColorStop(1,`rgba(${color[0]},${color[1]},${color[2]},${opacity})`);
 return gradient;
}
function farBuildings(c,x,p,variant){
 // Fachadas 16-bit originais: contornos técnicos e janelas no horizonte.
 // Tudo termina no canteiro a y=224, fora da zona de colisão.
 const blocks=[[8,26,34-variant*5],[42,35,48-variant*7],[88,45,26+variant*4]];
 for(const [dx,w,h] of blocks){
  const top=224-h;
  rect(c,x+dx,top,w,h,p.far,p.ink+'50',1);
  if(dx===42)rect(c,x+dx+3,top+4,w-6,2,p.stone+'9c');
  // Janelas em pares (em vez de grade completa): preserva a luz
  // retrofuturista com menos operações no Canvas, sobretudo no celular.
  for(let col=0;col<2;col++){
   const wx=x+dx+7+col*(w-14),wy=top+13+((col+variant)%2)*11;
   if(wy<220)rect(c,wx,wy,4,6,(col+variant)%3===0?'#ffd997a3':p.stone+'ad');
  }
 }
 if(variant===0){
  const roof=x+58;
  line(c,[[roof,176+variant*7],[roof,169+variant*7]],p.ink+'8c',1.4);
  oval(c,roof,167+variant*7,2,2,'#ffd5a1bf');
 }
}
function farFeature(c,x,stageId,p,variant){
 if(stageId==='rio'){
  shape(c,p.far,null,()=>{c.moveTo(x-12,224);c.bezierCurveTo(x+25,200,x+29,155+variant*7,x+66,154+variant*7);c.bezierCurveTo(x+109,151,x+114,215,x+155,224);c.closePath();});
 }else if(stageId==='sao-paulo'){
  const blocks=[[0,26,43],[28,24,74+variant*7],[56,33,101-variant*7],[93,26,65],[122,34,53]];
  for(const [dx,w,h] of blocks){
   rect(c,x+dx,224-h,w,h,p.far,null,1);
   for(let row=224-h+9;row<211;row+=13)line(c,[[x+dx+4,row],[x+dx+w-4,row]],p.stone+'8a',1.7);
  }
 }else if(stageId==='florida'){
  rect(c,x+10,195,50,29,p.far,null,2);rect(c,x+61,180+variant*6,24,44-variant*6,p.far,null,2);rect(c,x+87,203,44,21,p.far,null,2);
 }else farBuildings(c,x,p,variant);
}
function drawFarPlane(c,layer,width){
 c.save();c.globalAlpha*=.73;
 for(const segment of layer.segments){
  if(segment.alpha<=0)continue;
  c.save();c.globalAlpha*=segment.alpha;
  const p=palettes[segment.stageId];
  const count=segment.stationary?Math.ceil(width/154)+1:6;
  for(let i=0;i<count;i++){
   const x=segment.stationary?i*154-30:segment.x+(360+i*1100)*layer.scale;
   if(x+170<0||x-12>width)continue;
   farFeature(c,x,segment.stageId,p,wrap(segment.segmentIndex+i,3));
  }
  c.restore();
 }
 c.restore();
}
function middleFeature(c,x,stageId,p,variant){
 shape(c,p.near,null,()=>{c.moveTo(x-22,237);c.quadraticCurveTo(x+49,208+variant*4,x+131,229);c.quadraticCurveTo(x+167,218,x+222,237);c.closePath();});
 // Viaduto e mobiliário urbano em camada intermediária; estrutura sem
 // colisão, discreta sob os monumentos para deixar os perigos legíveis.
 if(stageId==='brasilia'||stageId==='brasilia-final'||stageId==='sao-paulo'){
  rect(c,x+14,218,166,4,p.ink+'89');
  rect(c,x+19,223,156,2,p.stone+'d1');
  for(const dx of [25,93,161])rect(c,x+dx,221,5,14,p.ink+'68');
  for(let dx=36;dx<162;dx+=56)rect(c,x+dx,213,15,2,'#ffe0a19c');
 }else if(stageId==='argentina'||stageId==='paraguai'||stageId==='casa-branca'){
  rect(c,x+28,223,135,3,p.ink+'7a');
  for(const dx of [43,101,154])line(c,[[x+dx,225],[x+dx,235]],p.ink+'8a',1.5);
 }
 if(stageId==='florida'){
  c.save();c.translate(x+89,234);c.scale(.44,.44);palm(c,0,0,p);c.restore();
 }else if(stageId==='argentina'||stageId==='casa-branca'){
  line(c,[[x+112,234],[x+112,212]],p.ink,2);
  oval(c,x+112,208,stageId==='argentina'?7:13,stageId==='argentina'?18:11,p.near);
 }
}
function drawMiddlePlane(c,layer,width){
 c.save();c.globalAlpha*=.61;
 for(const segment of layer.segments){
  if(segment.alpha<=0)continue;
  c.save();c.globalAlpha*=segment.alpha;
  const p=palettes[segment.stageId];
  const count=segment.stationary?Math.ceil(width/270)+1:5;
  for(let i=0;i<count;i++){
   const x=segment.stationary?i*270-70:segment.x+(100+i*1500)*layer.scale;
   if(x+225<0||x-22>width)continue;
   middleFeature(c,x,segment.stageId,p,wrap(segment.segmentIndex+i,3));
  }
  c.restore();
 }
 c.restore();
}


// Elementos ambientais discretos: sem colisão ou reinício na troca de etapa.
function drawAmbientDetails(c,geometry,{distance=0,reducedMotion=false}={}){
 const sway=reducedMotion?0:Math.sin(Math.max(0,distance)/235)*3;
 for(const seg of geometry.layers[1].segments){
  if(seg.alpha<=0)continue;
  const x=seg.stationary?geometry.width*.6:seg.x+3650*geometry.layers[1].scale;
  if(x<-45||x>geometry.width+45)continue;
  const p=palettes[seg.stageId];c.save();c.globalAlpha*=.48*seg.alpha;
  if(seg.stageId==='brasilia'||seg.stageId==='brasilia-final'||seg.stageId==='argentina'||seg.stageId==='casa-branca'){
   line(c,[[x,227],[x,192]],p.ink,1.8);
   shape(c,p.near,null,()=>{c.moveTo(x+1,192);c.quadraticCurveTo(x+15+sway,187,x+27+sway,194);c.lineTo(x+25+sway,204);c.quadraticCurveTo(x+12+sway,199,x+1,202);c.closePath();});
   line(c,[[x+4,195],[x+19+sway,197]],p.stone,1.5);
  }else if(seg.stageId==='rio'){
   rect(c,x-10,217,28,4,p.ink+'55',null,2);
   line(c,[[x+4,219],[x+4,207]],p.ink,2);
   shape(c,p.far,null,()=>{c.moveTo(x-15,209);c.quadraticCurveTo(x+4,193,x+23,209);c.closePath();});
  }else if(seg.stageId==='florida'){
   c.save();c.translate(x,222);c.scale(.42,.42);palm(c,0,0,p);c.restore();
  }
  // Adereços de fundo detalhados, baixos e sem área de colisão: cada local
  // ganha mobiliário próprio, mantendo o plano de ação livre e contrastado.
  c.globalAlpha*=.7;
  const bx=x-39;
  if(seg.stageId==='rio'){
   rect(c,bx-9,216,18,15,p.stone,p.ink,2);
   line(c,[[bx-7,220],[bx+7,220]],p.ink,1.6);
   line(c,[[bx-6,227],[bx+6,227]],p.near,1.5);
  }else if(seg.stageId==='florida'){
   rect(c,bx-10,219,20,10,p.stone,p.ink,2);
   line(c,[[bx-8,229],[bx-8,234]],p.ink,2);
   line(c,[[bx+8,229],[bx+8,234]],p.ink,2);
   line(c,[[bx-8,222],[bx+8,222]],p.near,1.5);
  }else{
   line(c,[[bx,234],[bx,204]],p.ink,2);
   oval(c,bx,202,5,3,p.stone);
   line(c,[[bx-5,204],[bx+5,204]],p.ink,1.5);
   rect(c,bx-4,229,8,5,p.near,p.ink,1);
  }
  c.restore();
 }
}

function waypointGlyph(c,stageId,x,y){
 const ink='#365664';
 if(stageId==='argentina'){
  shape(c,ink,null,()=>{c.moveTo(x-4,y+8);c.lineTo(x-2,y-11);c.lineTo(x,y-16);c.lineTo(x+2,y-11);c.lineTo(x+4,y+8);c.closePath();});
 }else if(stageId==='rio'){
  shape(c,ink,null,()=>{c.moveTo(x-25,y+8);c.quadraticCurveTo(x-18,y-8,x-11,y-7);c.quadraticCurveTo(x-5,y-7,x,y+8);c.quadraticCurveTo(x+8,y-9,x+14,y-9);c.quadraticCurveTo(x+20,y-8,x+25,y+8);c.closePath();});
  line(c,[[x-11,y-15],[x-11,y-4]],ink,1.7);line(c,[[x-15,y-12],[x-7,y-12]],ink,1.7);
 }else if(stageId==='sao-paulo'){
  rect(c,x-21,y-10,42,9,'#923d38',null,2);rect(c,x-20,y-2,4,10,ink);rect(c,x+16,y-2,4,10,ink);
 }else if(stageId==='brasilia'||stageId==='brasilia-final'){
  rect(c,x-4,y-16,3,24,ink);rect(c,x+1,y-16,3,24,ink);
  shape(c,ink,null,()=>{c.moveTo(x-22,y+8);c.bezierCurveTo(x-20,y-2,x-8,y-2,x-7,y+8);c.closePath();});
  shape(c,ink,null,()=>{c.moveTo(x+7,y+8);c.quadraticCurveTo(x+15,y+2,x+23,y+8);c.closePath();});
 }else if(stageId==='florida'){
  rect(c,x-24,y-3,17,11,ink);rect(c,x-4,y-11,10,19,'#923d38');rect(c,x+9,y-2,17,10,ink);
 }else if(stageId==='paraguai'){
  rect(c,x-22,y-3,44,11,ink);rect(c,x-6,y-10,12,10,ink);
  shape(c,'#923d38',null,()=>{c.moveTo(x-7,y-10);c.lineTo(x,y-16);c.lineTo(x+7,y-10);c.closePath();});
 }else{
  shape(c,ink,null,()=>{c.moveTo(x-22,y-5);c.lineTo(x,y-15);c.lineTo(x+22,y-5);c.closePath();});
  for(const dx of [-15,-7,1,9])rect(c,x+dx,y-3,4,11,ink);
 }
 line(c,[[x-25,y+9],[x+25,y+9]],ink,1.7);
}
function drawWaypoint(c,waypoint,quiet){
 if(!waypoint)return;
 const {x,alpha,stageId}=waypoint,p=palettes[stageId];
 c.save();c.globalAlpha*=alpha*(1-.55*quiet);
 // In the verge, behind threats. Teal/gold and a framed silhouette are
 // deliberately different from the directional danger warnings.
 line(c,[[x-14,233],[x-14,217]],'#365664',2);
 line(c,[[x+14,233],[x+14,217]],'#365664',2);
 rect(c,x-37,180,74,40,'#e8ede2','#365664',5);
 rect(c,x-33,184,66,31,'#f9f5e7',null,4);
 waypointGlyph(c,stageId,x,202);
 line(c,[[x-23,217],[x+23,217]],p.near,1.5);c.restore();
}
function drawFlightHorizon(c,geometry){
 const lift=geometry.flight?.lift??0;
 if(lift<=0)return;
 c.save();c.globalAlpha*=lift;
 const width=geometry.width;
 c.fillStyle=daylightGradient(c,geometry,146,248,.86);c.fillRect(0,146,width,102);
 for(let n=0;n<3;n++){
  const x=width*(.18+n*.32),y=224-(n%2)*19;
  c.save();c.globalAlpha*=.53;cloud(c,x,y,1.08+width/2400);c.restore();
 }
 c.restore();
}

/** Draw a continuous journey without changing the caller's Canvas state or alpha. */
export function drawJourneyScenery(c,options={}){
 const geometry=journeySceneryGeometry(options),width=geometry.width;
 const quiet=Math.max(0,Math.min(1,Number(options.quiet)||0));
 const skyTop=-Math.max(0,Number(options.cameraLift)||0);
 const time=timeOfDayFor(options.routeDistance??options.distance??0);
 c.save();
 try{
  c.fillStyle=paletteGradient(c,geometry,'sky');c.fillRect(0,skyTop,width,300-skyTop);
  // O céu muda com o avanço da rota; o tom próprio de cada cidade segue visível.
  c.save();c.globalAlpha*=.72;c.fillStyle=skyTimeGradient(c,time);
  c.fillRect(0,skyTop,width,246-skyTop);c.restore();
  c.fillStyle=daylightGradient(c,geometry,0,246,.82*(1-.55*time.night));
  c.fillRect(0,skyTop,width,246-skyTop);
  // Faixas horizontais muito leves reforçam o contraste da cidade de
  // fundo sem copiar pixels do Mega Man nem competir com as balas.
  c.save();c.globalAlpha*=.35;
  const stripeColor=paletteGradient(c,geometry,'stone',.24);
  for(const y of [139,154,169])rect(c,0,y,width,1,stripeColor);
  c.restore();
  drawSkyObjects(c,width,time,options.reducedMotion===true);
  for(const item of geometry.clouds)cloud(c,item.x,item.y,item.scale);
  drawHighClouds(c,geometry,time,quiet);
  const flightLift=geometry.flight?.lift??0;
  c.save();c.globalAlpha*=(1-.45*quiet)*(1-flightLift*.92);c.translate(0,geometry.flight?.shift??0);
  drawFarPlane(c,geometry.layers[0],width);
  // One translucent wash separates distant silhouettes from the greener middle
  // plane. It never crosses the arena floor and adds no animated particles.
  c.fillStyle=daylightGradient(c,geometry,132,238,.42);c.fillRect(0,132,width,106);
  // Um filete luminoso de cidade, atrás do plano médio, reforça
  // a profundidade retrofuturista sem criar objetos interativos.
  c.save();c.globalAlpha*=.29;
  rect(c,0,210,width,2,paletteGradient(c,geometry,'stone',.72));
  c.restore();
  drawMiddlePlane(c,geometry.layers[1],width);c.restore();
  if(flightLift<1){
   c.save();c.globalAlpha*=(1-.6*quiet)*(1-flightLift);drawAmbientDetails(c,geometry,options);c.restore();
  }
  if(flightLift<1)for(const item of geometry.landmarks){
   if(item.alpha<=0||item.x<-180||item.x>width+180)continue;
   c.save();c.globalAlpha*=item.alpha*(1-flightLift);landmark(c,{id:item.stageId},palettes[item.stageId],item.x);c.restore();
  }
  drawFlightHorizon(c,geometry);drawWaypoint(c,geometry.waypoint,quiet);
  drawNightHorizon(c,geometry,time.night);
  // Geography crosses the verge with a soft color band; the collision floor stays y=246.
  rect(c,0,234,width,12,paletteGradient(c,geometry,'near',.36));
  line(c,[[0,234],[width,234]],paletteGradient(c,geometry,'ink',.33),1);
  const road='#dce3dc',ink='#577c86';
  const surface=c.createLinearGradient(0,246,0,300);surface.addColorStop(0,'#e4e9e1');surface.addColorStop(1,'#cdd8d2');
  rect(c,0,246,width,54,surface);line(c,[[0,246],[width,246]],ink,1.5);line(c,[[0,249],[width,249]],'#ffffffb3',2);
  for(let x=-geometry.roadOffset;x<width;x+=98)rect(c,x,275,38,3,'#ffffffa6',null,1);
  if(!options.reducedMotion){
   const travel=Number(options.distance??options.routeDistance)||0,first=Math.floor(travel*.32/160)-1;
   c.save();c.globalAlpha*=.32*(1-.6*quiet);
   for(let i=first;i<first+Math.ceil(width/160)+3;i++){const x=i*160-travel*.32;oval(c,x,263,3,1.1,'#6d8a80');line(c,[[x+53,268],[x+58,265],[x+61,268]],'#6d8a80',1);}
   c.restore();
  }
  line(c,[[0,296],[width,296]],ink+'18',1);
 }finally{c.restore();}
}

// Joice muda a atmosfera aos poucos; silhuetas e perigos mantêm contraste.
export function raidMoodFor(raid){
 if(!raid)return 0;
 const smooth=value=>{const t=Math.max(0,Math.min(1,value));return t*t*(3-2*t);};
 if(raid.phase==='warning')return smooth((1.2-raid.remaining)/.8);
 if(raid.phase==='active')return 1;
 if(raid.phase==='recovery')return smooth(raid.remaining/(raid.recoveryFor||2));
 return 0;
}
export function drawRaidAtmosphere(ctx,{strength=0,width=900,distance=0,reducedMotion=false}={}){
 if(strength<=0)return;
 ctx.save();ctx.globalAlpha*=strength;
 const sky=ctx.createLinearGradient(0,0,0,246);
 sky.addColorStop(0,'#450b22f5');sky.addColorStop(.65,'#8d1539c9');sky.addColorStop(1,'#551520a6');
 ctx.fillStyle=sky;ctx.fillRect(0,0,width,246);
 ctx.fillStyle='#350f23a6';ctx.beginPath();ctx.moveTo(0,205);
 for(let x=0;x<width+90;x+=90){ctx.lineTo(x+18,179);ctx.lineTo(x+32,127);ctx.lineTo(x+42,185);ctx.lineTo(x+65,193);}
 ctx.lineTo(width,246);ctx.lineTo(0,246);ctx.closePath();ctx.fill();
 // Brasas estáveis, sem estrobo; o modo reduzido também evita deslocá-las.
 for(let i=0;i<7;i++){
  const x=(i*137+(reducedMotion?0:distance*.07))%(width+30)-15,y=63+i%3*42;
  ctx.fillStyle='#f0a074a6';ctx.beginPath();ctx.ellipse(x,y,2,4,0,0,Math.PI*2);ctx.fill();
 }
 ctx.restore();
}
