// Original Corre Flávio vector tiles; the Maker reference supplies structure,
// not sprites or executable code. All surfaces keep their simulation extents.
const clamp=n=>Math.max(0,Math.min(1,n));
export function drawTileSurface(c,{x,y,width,height=10,originX=x,face='#7c96a3',edge='#375068',light='#eef7e6'}={}){
 if(!(width>0&&height>0))return;
 c.save();c.beginPath();c.rect(x,y,width,height);c.clip();
 c.fillStyle=face;c.fillRect(x,y,width,height);
 c.fillStyle='#263b4a22';c.fillRect(x,y+height-3,width,3);
 c.beginPath();
 for(let i=Math.floor((x-originX)/24)+1;originX+i*24<x+width;i++){const tx=originX+i*24;c.moveTo(tx,y+3);c.lineTo(tx,y+height);}
 for(let dy=18;dy<height;dy+=18){c.moveTo(x,y+dy);c.lineTo(x+width,y+dy);}
 c.strokeStyle=edge;c.lineWidth=1;c.stroke();
 c.fillStyle=light;c.fillRect(x,y,width,2);
 c.restore();c.save();c.strokeStyle=edge;c.lineWidth=1;c.strokeRect(x,y,width,height);c.restore();
}
export function drawPlatformRoom(c,{width=900,ground=246,state={}}={}){
 if(state?.traversal)return;
 const phase=typeof state==='string'?state:state.phase;
 const exiting=phase==='exit',progress=exiting?clamp((state.age||0)/(state.duration||.65)):0;
 if(exiting&&(state.reducedMotion||progress>=1))return;
 const closed=exiting?1-progress:phase==='intro'&&!state.reducedMotion?clamp((state.age||0)/1.1):1;
 const accent=state.color||'#9577b6';
 c.save();c.globalAlpha*=1-progress;
 drawTileSurface(c,{x:17,y:ground+1,width:Math.max(0,width-34),height:Math.max(0,299-ground),face:'#536b7d',edge:'#35495d',light:'#e8e2cf'});
 c.fillStyle=accent;c.fillRect(18,ground+4,width-36,2);
 for(const x of [1,width-17]){
  const top=ground-124;
  c.fillStyle='#33445d';c.fillRect(x,top-4,16,4);c.fillRect(x,top,3,124);c.fillRect(x+13,top,3,124);
  c.fillStyle='#c1ced2';c.fillRect(x+1,top,1,124);c.fillRect(x+14,top,1,124);
  const height=124*closed;
  if(height>0){
   c.save();c.beginPath();c.rect(x+4,top,8,height);c.clip();
   c.fillStyle='#6e829b';c.fillRect(x+4,top,8,height);
   c.fillStyle='#b7cad6';for(let y=top+4;y<top+height;y+=12)c.fillRect(x+4,y,8,3);
   c.restore();
  }
  c.fillStyle=exiting?'#91d5a4':'#f0cf7b';c.fillRect(x+5,top-7,6,3);
 }
 c.restore();
}
