import {aircraftPoseFor} from './runner-terrain.mjs?v=d75123c1af20';
import {drawTileSurface} from './runner-platform-room-art.mjs?v=344dcf5c7c31';
// Shapes use the same logical x and height-above-ground as traversal physics.
// No collision state is changed here, and no asset allocation is needed per frame.
const INK='#303747',STONE='#aebbb9',EDGE='#e7e8d8',SHADE='#657985';
function polygon(c,points,fill,stroke=INK,width=1.5){
 c.beginPath();for(let i=0;i<points.length;i++){const [x,y]=points[i];if(i)c.lineTo(x,y);else c.moveTo(x,y);}c.closePath();
 c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}
}
function rect(c,x,y,w,h,fill,stroke=INK,r=2){
 c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.4;c.stroke();}
}
function line(c,x,y,x2,y2,color,width=1.4){c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.stroke();}
function routeMarker(c,x,y,action,alpha){
 c.save();c.globalAlpha*=alpha;
 rect(c,x-12,y-13,24,25,'#f9f3d8','#746b57',5);
 const down=action==='slide',sign=down?1:-1;
 line(c,x,y-sign*6,x,y+sign*6,'#38586a',2.2);
 line(c,x,y+sign*6,x-4,y+sign*2,'#38586a',2.2);line(c,x,y+sign*6,x+4,y+sign*2,'#38586a',2.2);
 if(down)line(c,x-6,y+9,x+6,y+9,'#38586a',1.8);
 c.restore();
}
function drawPlane(c,x,y,kind){
 const quiet=kind==='flyby',paint=quiet?'#47758f':'#bd8050',shield=quiet?'#b6d4e0':'#fff2c4';
 polygon(c,[[x-27,y],[x-17,y-4],[x+16,y-4],[x+27,y-9],[x+31,y-7],[x+25,y+4],[x-18,y+5]],paint);
 polygon(c,[[x-8,y+1],[x+6,y-14],[x+14,y-12],[x+7,y+2],[x+14,y+12],[x+3,y+13]],paint);
 polygon(c,[[x-21,y-2],[x-10,y-7],[x-5,y-3]],shield,'#31485b',1);
 c.beginPath();c.arc(x-12,y-4.7,1.8,0,2*Math.PI);c.fillStyle='#31485b';c.fill();
 if(!quiet){rect(c,x+5,y-1,7,5,'#fff2c4','#583d37',1);line(c,x-27,y+4,x-33,y+4,'#583d37',2);}
}
function drawAirTerrain(c,a,ground,width){
 const gap=a.gaps[0],f=a.flight;
 const left=Math.max(-2,gap.x),right=Math.min(width+2,gap.x+gap.width);
 if(right>left){
  // Remove the 12 px verge too: a continuous band above the void looks like
  // a safe floor even though only the independent platforms supply support.
  const top=ground-13,sky=c.createLinearGradient(0,top,0,303);sky.addColorStop(0,'#94b8d3');sky.addColorStop(1,'#dceaf3');
  c.fillStyle=sky;c.fillRect(left,top,right-left,303-top);
 }
 for(const ramp of a.ramps||[]){
  const x=ramp.x,edge=x+ramp.width;if(edge<0||x>width)continue;
  polygon(c,[[x,ground],[edge,ground-ramp.height],[edge,ground+6],[x,ground+6]],'#788891','#42516a',1.2);
  line(c,x,ground,edge,ground-ramp.height,'#f8efd0',2.2);
 }
 if(f.phase==='boarding'&&gap.x>=width+15){
  routeMarker(c,width-23,ground-63,'jump',1);
 }else if(gap.x>=-15&&gap.x<width+15){
  line(c,gap.x-8,ground-1,gap.x,ground-1,'#fff5ce',3);
  routeMarker(c,gap.x-27,ground-37,'jump',.95);
 }
 if(gap.x+gap.width>=-15&&gap.x+gap.width<width+15){
  line(c,gap.x+gap.width,ground-1,gap.x+gap.width+30,ground-1,'#fff5ce',4);
  rect(c,gap.x+gap.width+16,ground+11,72,20,'#eef1df','#426176',2);
  c.font='700 9px system-ui';c.textAlign='center';c.fillStyle='#29475e';c.fillText((f.toName??'Argentina').toUpperCase(),gap.x+gap.width+52,ground+24,66);
 }
 for(const p of a.platforms){
  const y=ground-p.y,edge=p.x+p.width;if(edge<-10||p.x>width+16)continue;
  const x=Math.max(-6,p.x),right=Math.min(edge,width+6),w=right-x;if(w<1)continue;
  drawTileSurface(c,{x,y,width:w,height:10,originX:p.x});
  if(edge>=0&&edge<width+12)routeMarker(c,edge-25,y-30,'jump',.9);
 }
 for(const craft of f.aircraft){
  const pose=aircraftPoseFor(a,craft);if(!pose)continue;
  const {markerX,aircraftX,aircraftY,barY,warning,shot}=pose;
  if(warning&&craft.kind!=='flyby'){
   // A visible chevron at the edge also covers telegraphs beyond the viewport.
   const x=Math.min(width-19,Math.max(19,markerX)),y=ground-barY;
   c.save();c.globalAlpha*=.85;
   if(craft.kind==='lane'){
    rect(c,x-21,y-3,42,5,'#f4c877','#624334',1);
    for(let j=-17;j<20;j+=8)line(c,x+j,y-2,x+j+5,y-11,'#7c4c39',1.4);
    line(c,x,y-20,x,y-63,'#7c4c39',1.5);
   }
   routeMarker(c,x,y-49,craft.kind==='high'?'slide':'jump',1);
   c.restore();
  }
  if(aircraftX>=-40&&aircraftX<=width+40)drawPlane(c,aircraftX,ground-aircraftY,craft.kind);
  if(shot&&shot.x>=-25&&shot.x<=width+25){
   const y=ground-shot.y;
   polygon(c,[[shot.x-shot.width/2,y],[shot.x+2,y-shot.height/2],[shot.x+shot.width/2,y],[shot.x+2,y+shot.height/2]],'#f4cf77','#8a4e35',1.7);
  }
 }
 if(f.phase==='boarding'&&f.traveled<f.nominalSpeed*.9){
  rect(c,width/2-93,ground+12,186,21,'#f6f0dc','#557184',4);
  const route=(f.fromName??'São Paulo')+' → '+(f.toName??'Argentina');
  c.font='700 10px system-ui';c.textAlign='center';c.fillStyle='#314e63';c.fillText(route.toUpperCase(),width/2,ground+26,174);
 }
}
export function drawTerrain(c,{terrain,ground=246,width=900}={}){
 const active=terrain?.active;if(!active)return;
 c.save();
 if(active.flight){drawAirTerrain(c,active,ground,width);c.restore();return;}
 const upcoming=active.gaps?.[0]||(active.lesson?active.platforms?.[0]:null);
 if(upcoming&&upcoming.x>width-18){
  const x=width-22,y=ground-70;
  routeMarker(c,x,y,'jump',1);
  c.font='700 9px system-ui';c.textAlign='right';c.fillStyle='#38586a';
  c.fillText('PULE',width-8,y+25);
 }
 for(const gap of active.gaps||[]){
  const x=gap.x,w=gap.width;if(x>width+12||x+w< -12)continue;
  // The cut removes road markings too. Light rims show exactly where support ends.
  rect(c,x,ground-1,w,300-ground+3,'#243745',null,0);
  polygon(c,[[x,ground],[x+9,ground+8],[x+9,300],[x,300]],'#728588',null);
  polygon(c,[[x+w,ground],[x+w-10,ground+8],[x+w-10,300],[x+w,300]],'#405b69',null);
  line(c,x,ground-1,x+1,ground+14,'#d5d9c6',3);
  line(c,x+w,ground-1,x+w-1,ground+14,'#b2c7bc',3);
  line(c,x+14,ground+21,x+w-15,ground+21,'#172b3a',2);
  routeMarker(c,x-31,ground-46,'jump',1);
 }
 for(const platform of active.platforms||[]){
  const x=platform.x,w=platform.width,y=ground-platform.y;
  if(x>width+12||x+w< -12)continue;
  if(active.lesson)routeMarker(c,x-30,y-27,'jump',.95);
  rect(c,x,y,w,Math.max(5,platform.y),STONE,INK,2);
  rect(c,x+3,y+6,w-6,Math.max(5,platform.y-8),'#899e9e',null,1);
  drawTileSurface(c,{x,y,width:w,height:Math.max(5,platform.y),face:STONE,edge:'#526c78'});
  line(c,x+3,y+2,x+w-3,y+2,EDGE,2.5);
  line(c,x+6,y+9,x+w-6,y+9,SHADE,1);
  for(let dx=14;dx<w-6;dx+=30){line(c,x+dx,y+12,x+dx-5,y+Math.min(23,platform.y-3),'#708786');}
  for(const dx of [7,w-7]){c.beginPath();c.arc(x+dx,y+15,1.5,0,Math.PI*2);c.fillStyle='#dbe0c9';c.fill();}
 }
 c.restore();
}

export function drawSlideContact(c,{x,y,age=0,reducedMotion=false}={}){
 if(reducedMotion)return;
 const phase=age*15;
 c.save();c.globalAlpha*=.5;
 for(let i=0;i<3;i++){
  const offset=(phase+i*5)%17;
  line(c,x-16-offset,y-1-i*1.7,x-9-offset,y-1-i*1.7,i===1?'#f3ecd2':'#77908f',1.3);
 }
 c.restore();
}
