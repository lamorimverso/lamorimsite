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
export function drawTerrain(c,{terrain,ground=246,width=900}={}){
 const active=terrain?.active;if(!active)return;
 c.save();
 const upcoming=active.ceilings?.[0]||active.gaps?.[0];
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
