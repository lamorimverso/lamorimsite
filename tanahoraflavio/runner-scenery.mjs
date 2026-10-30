// Cenários vetoriais: três planos leves, sem texto nem elementos de colisão.
const palettes={
 brasilia:{sky:'#dceefa',haze:'#fcf9ed',far:'#b8d5d7',near:'#80aead',ink:'#577c86',stone:'#f8f6e8',shade:'#c4d8d5',road:'#dce3dc'},
 rio:{sky:'#d3f0f2',haze:'#fff7e0',far:'#a8cfc3',near:'#73b3a0',ink:'#478582',stone:'#f8f5de',shade:'#c7dfc8',road:'#e6ddc8'},
 argentina:{sky:'#dbe7f5',haze:'#fcf4df',far:'#bdcadb',near:'#90abbf',ink:'#647f9a',stone:'#fff6da',shade:'#d7ccb4',road:'#dce0e6'},
 florida:{sky:'#fbe4d5',haze:'#fff9e8',far:'#dfc6cb',near:'#b7bfc8',ink:'#927e8b',stone:'#ffe8d2',shade:'#d6b9ba',road:'#e6dcd1'},
 'casa-branca':{sky:'#e3eafa',haze:'#fcf7e8',far:'#c0ccdf',near:'#94b4a9',ink:'#718898',stone:'#fffff3',shade:'#d6dfe5',road:'#dce3d7'}
};
const wrap=(n,span)=>(n%span+span)%span;
function shape(c,fill,stroke,draw){c.beginPath();draw();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.3;c.stroke();}}
function rect(c,x,y,w,h,fill,stroke,r=0){shape(c,fill,stroke,()=>r?c.roundRect(x,y,w,h,r):c.rect(x,y,w,h));}
function oval(c,x,y,rx,ry,fill){shape(c,fill,null,()=>c.ellipse(x,y,rx,ry,0,0,Math.PI*2));}
function line(c,points,color,width=1.3){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function cloud(c,x,y,s){c.save();c.translate(x,y);c.scale(s,s);shape(c,'#ffffffc9','#ffffff88',()=>{c.moveTo(-36,8);c.bezierCurveTo(-53,4,-45,-10,-29,-9);c.bezierCurveTo(-31,-32,4,-37,13,-16);c.bezierCurveTo(32,-24,48,-8,37,7);c.closePath();});c.restore();}
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
 if(stage.id==='brasilia'){
  rect(c,-126,-12,252,12,p.stone,p.ink,2);rect(c,-14,-104,12,92,p.stone,p.ink,1);rect(c,6,-104,12,92,p.stone,p.ink,1);
  rect(c,-10,-100,3,83,p.shade,null);rect(c,10,-100,3,83,p.shade,null);
  shape(c,p.stone,p.ink,()=>{c.moveTo(-111,-13);c.bezierCurveTo(-105,-54,-55,-54,-47,-13);c.closePath();});
  shape(c,p.shade,p.ink,()=>{c.moveTo(45,-42);c.bezierCurveTo(49,-4,102,-4,110,-42);c.closePath();});
  line(c,[[43,-42],[112,-42]],p.stone,4);line(c,[[-116,-7],[116,-7]],p.shade,2);
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

const journeyStages=Object.keys(palettes);
const segmentLength=7000;
const planeScales=[.14,.18,.22];
const smooth=n=>{const t=Math.max(0,Math.min(1,n));return t*t*(3-2*t);};
const stageAt=index=>journeyStages[wrap(index,journeyStages.length)];
const colorChannels=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
const paletteChannels=Object.fromEntries(journeyStages.map(id=>[id,Object.fromEntries(Object.entries(palettes[id]).map(([key,value])=>[key,colorChannels(value)]))]));
function blendPalette(from,to,amount){
 return Object.fromEntries(Object.keys(from).map(key=>[key,from[key].map((value,i)=>value+(to[key][i]-value)*amount)]));
}
function paletteAlongRoute(location){
 // A 2,200 m feather is spatial: its right-hand colors arrive before its left-hand colors.
 const index=Math.floor((location+1100)/segmentLength);
 const amount=smooth((location-index*segmentLength+1100)/2200);
 return blendPalette(paletteChannels[stageAt(index-1)],paletteChannels[stageAt(index)],amount);
}

/**
 * Pure, unbounded route geometry shared by rendering and continuity tests.
 * Each segmentIndex is an occurrence on the journey (never modulo 35 km); only its
 * stageId repeats. Screen x = .35*width + (world metres-routeDistance)*plane.scale.
 * The far/middle/landmark planes use .14/.18/.22 px per route metre. Each place has
 * one landmark at 2,500 m into its 7,000 m segment. A few offscreen neighbours are
 * retained; dropping one cannot reset a visible object. distance moves only clouds
 * and road marks, allowing geography to stop during encounters.
 * Reduced motion fixes every decorative position and softly blends identities in
 * the final 1,000 m of each place, so the route still communicates its next stop.
 * Palette channels are floating RGB triples; paletteStops offsets run from 0 to 1.
 */
export function journeySceneryGeometry({routeDistance=0,distance=routeDistance,width=900,reducedMotion=false}={}){
 const route=Number.isFinite(routeDistance)?Math.max(0,routeDistance):0;
 const travelled=Number.isFinite(distance)?Math.max(0,distance):route;
 const w=Number.isFinite(width)?Math.max(1,width):900;
 const index=Math.floor(route/segmentLength),anchor=w*.35;
 const amount=smooth((route-index*segmentLength-6000)/1000);
 const identities=[{segmentIndex:index,stageId:stageAt(index),alpha:1-amount},{segmentIndex:index+1,stageId:stageAt(index+1),alpha:amount}];
 const layers=planeScales.map((scale,layer)=>({
  id:['far','middle','landmark'][layer],scale,
  segments:reducedMotion?identities.map(identity=>({...identity,x:0,width:w,stationary:true})):
   Array.from({length:5},(_,offset)=>{
    const segmentIndex=index+offset-2;
    return {segmentIndex,stageId:stageAt(segmentIndex),alpha:1,x:anchor+(segmentIndex*segmentLength-route)*scale,width:segmentLength*scale,stationary:false};
   })
 }));
 const landmarks=reducedMotion?identities.map(identity=>({...identity,x:w*.70})):
  layers[2].segments.map(segment=>({segmentIndex:segment.segmentIndex,stageId:segment.stageId,alpha:1,x:segment.x+2500*layers[2].scale}));
 const uniform=reducedMotion?blendPalette(paletteChannels[stageAt(index)],paletteChannels[stageAt(index+1)],amount):null;
 const paletteStops=Array.from({length:25},(_,i)=>({offset:i/24,palette:uniform||paletteAlongRoute(route+(w*i/24-anchor)/planeScales[2])}));
 const decorativeDistance=reducedMotion?0:travelled;
 return {width:w,layers,landmarks,paletteStops,roadOffset:wrap(decorativeDistance,98),clouds:[
  {x:wrap(145-decorativeDistance*.016,w+140)-70,y:65,scale:.73},
  {x:wrap(510-decorativeDistance*.019,w+160)-80,y:91,scale:.48}
 ]};
}

function paletteGradient(c,geometry,key,alpha=1){
 const gradient=c.createLinearGradient(0,0,geometry.width,0);
 for(const stop of geometry.paletteStops){
  const [r,g,b]=stop.palette[key];gradient.addColorStop(stop.offset,`rgba(${r},${g},${b},${alpha})`);
 }
 return gradient;
}
function farBuildings(c,x,p,variant){
 rect(c,x+8,190+variant*5,26,34-variant*5,p.far,null,2);
 rect(c,x+42,176+variant*7,35,48-variant*7,p.far,null,2);
 rect(c,x+88,198,45,26,p.far,null,2);
}
function farFeature(c,x,stageId,p,variant){
 if(stageId==='rio'){
  shape(c,p.far,null,()=>{c.moveTo(x-12,224);c.bezierCurveTo(x+25,200,x+29,155+variant*7,x+66,154+variant*7);c.bezierCurveTo(x+109,151,x+114,215,x+155,224);c.closePath();});
 }else if(stageId==='florida'){
  rect(c,x+10,195,50,29,p.far,null,2);rect(c,x+61,180+variant*6,24,44-variant*6,p.far,null,2);rect(c,x+87,203,44,21,p.far,null,2);
 }else farBuildings(c,x,p,variant);
}
function drawFarPlane(c,layer,width){
 c.save();c.globalAlpha*=.55;
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
 if(stageId==='florida'){
  c.save();c.translate(x+89,234);c.scale(.44,.44);palm(c,0,0,p);c.restore();
 }else if(stageId==='argentina'||stageId==='casa-branca'){
  line(c,[[x+112,234],[x+112,212]],p.ink,2);
  oval(c,x+112,208,stageId==='argentina'?7:13,stageId==='argentina'?18:11,p.near);
 }
}
function drawMiddlePlane(c,layer,width){
 c.save();c.globalAlpha*=.48;
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
  if(seg.stageId==='brasilia'||seg.stageId==='argentina'||seg.stageId==='casa-branca'){
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
  c.restore();
 }
}

/** Draw a continuous journey without changing the caller's Canvas state or alpha. */
export function drawJourneyScenery(c,options={}){
 const geometry=journeySceneryGeometry(options),width=geometry.width;
 c.save();
 try{
  c.fillStyle=paletteGradient(c,geometry,'sky');c.fillRect(0,0,width,300);
  const haze=c.createLinearGradient(0,0,0,246);haze.addColorStop(0,'#fcf9ed00');haze.addColorStop(1,'#fcf9ed');
  c.fillStyle=haze;c.fillRect(0,0,width,246);
  oval(c,width-66,55,29,29,'#fff7d838');oval(c,width-66,55,21,21,'#fff9e5d9');
  for(const item of geometry.clouds)cloud(c,item.x,item.y,item.scale);
  drawFarPlane(c,geometry.layers[0],width);
  drawMiddlePlane(c,geometry.layers[1],width);
  drawAmbientDetails(c,geometry,options);
  for(const item of geometry.landmarks){
   if(item.alpha<=0||item.x<-180||item.x>width+180)continue;
   c.save();c.globalAlpha*=item.alpha;landmark(c,{id:item.stageId},palettes[item.stageId],item.x);c.restore();
  }
  // Geography crosses the verge with a soft color band; the collision floor stays y=246.
  rect(c,0,234,width,12,paletteGradient(c,geometry,'near',.36));
  line(c,[[0,234],[width,234]],paletteGradient(c,geometry,'ink',.33),1);
  const road='#dce3dc',ink='#577c86';
  rect(c,0,246,width,54,road);line(c,[[0,246],[width,246]],ink,1.5);line(c,[[0,249],[width,249]],'#ffffffb3',2);
  for(let x=-geometry.roadOffset;x<width;x+=98)rect(c,x,275,38,3,'#ffffffa6',null,1);
  line(c,[[0,296],[width,296]],ink+'18',1);
 }finally{c.restore();}
}

// Joice muda a atmosfera aos poucos; silhuetas e perigos mantêm contraste.
export function raidMoodFor(raid){
 if(!raid)return 0;
 const smooth=value=>{const t=Math.max(0,Math.min(1,value));return t*t*(3-2*t);};
 return raid.phase==='warning'?smooth((1.2-raid.remaining)/.8):raid.phase==='active'?1:raid.phase==='recovery'?smooth(raid.remaining/2):0;
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
