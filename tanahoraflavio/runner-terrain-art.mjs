import {aircraftPoseFor} from './runner-terrain.mjs?v=31b5bc51e6b0';
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
 if(!quiet){rect(c,x+5,y-1,7,5,'#fff2c4','#583d37',1);line(c,x-27,y+4,x-33,y+4,'#583d37',2);}
}
function drawAirTerrain(c,a,ground,width){
 const gap=a.gaps[0],f=a.flight;
 const left=Math.max(-2,gap.x),right=Math.min(width+2,gap.x+gap.width);
 if(right>left){
  // The void replaces the road only where the physical support is absent.
  const sky=c.createLinearGradient(0,ground-1,0,303);sky.addColorStop(0,'#94b8d3');sky.addColorStop(1,'#dceaf3');
  c.fillStyle=sky;c.fillRect(left,ground-1,right-left,303-ground);
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
  c.font='700 9px system-ui';c.textAlign='center';c.fillStyle='#29475e';c.fillText('ARGENTINA',gap.x+gap.width+52,ground+24);
 }
 for(const p of a.platforms){
  const y=ground-p.y,edge=p.x+p.width;if(edge<-10||p.x>width+16)continue;
  const x=Math.max(-6,p.x),right=Math.min(edge,width+6),w=right-x;if(w<1)continue;
  rect(c,x,y,w,10,'#7c96a3','#375068',2);line(c,x+2,y+1,right-2,y+1,'#eef7e6',2.5);
  for(let k=Math.max(0,Math.ceil((-p.x)/28));k<Math.floor((right-p.x-7)/28);k++)line(c,p.x+8+k*28,y+7,p.x+15+k*28,y+4,'#4f6c80',1.1);
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
  c.font='700 10px system-ui';c.textAlign='center';c.fillStyle='#314e63';c.fillText('SÃO PAULO → ARGENTINA',width/2,ground+26);
 }
}
export function drawTerrain(c,{terrain,ground=246,width=900}={}){
 const active=terrain?.active;if(!active)return;
 c.save();
 if(active.flight){drawAirTerrain(c,active,ground,width);c.restore();return;}
 const upcoming=active.ceilings?.[0]||active.gaps?.[0]||(active.lesson?active.platforms?.[0]:null);
 if(upcoming&&upcoming.x>width-18){
  const action=active.kind==='passage'?'slide':'jump',x=width-22,y=ground-70;
  routeMarker(c,x,y,action,1);
  c.font='700 9px system-ui';c.textAlign='right';c.fillStyle='#38586a';
  c.fillText(action==='slide'?'DESLIZE':'PULE',width-8,y+25);
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
  line(c,x+3,y+2,x+w-3,y+2,EDGE,2.5);
  line(c,x+6,y+9,x+w-6,y+9,SHADE,1);
  for(let dx=14;dx<w-6;dx+=30){line(c,x+dx,y+12,x+dx-5,y+Math.min(23,platform.y-3),'#708786');}
  for(const dx of [7,w-7]){c.beginPath();c.arc(x+dx,y+15,1.5,0,Math.PI*2);c.fillStyle='#dbe0c9';c.fill();}
 }
 for(const ceiling of active.ceilings||[]){
  const x=ceiling.x,w=ceiling.width,top=ground-ceiling.top,bottom=ground-ceiling.bottom;
  if(x>width+12||x+w< -12)continue;
  // Recessed backwork belongs above the opening, never across the walkable lane.
  rect(c,x,top,w,bottom-top,'#82979a',INK,3);
  rect(c,x+5,top+6,w-10,Math.max(8,bottom-top-16),'#98aca9',null,2);
  line(c,x+7,top+8,x+w-7,top+8,'#dce0cf',2);
  for(let dx=13;dx<w-10;dx+=27){line(c,x+dx,top+18,x+dx+10,bottom-15,'#738c8f',1);}
  rect(c,x-3,bottom-9,w+6,9,'#e1c17c',INK,1);
  for(let dx=0;dx<w-8;dx+=17)polygon(c,[[x+dx,bottom-8],[x+dx+6,bottom-8],[x+dx+12,bottom-2],[x+dx+6,bottom-2]],'#46515a',null);
  line(c,x+2,bottom+1,x+w-2,bottom+1,'#d3ded030',2);
  routeMarker(c,x-28,bottom-8,'slide',1);
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
