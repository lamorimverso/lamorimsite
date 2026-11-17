// One cue per screen edge, only while the threatening silhouette is off-screen.
const WARNING_HORIZON=1.6;
export function edgeThreatsFor(obstacles,width,timeToContact){
 let left=null,right=null,leftTime=Infinity,rightTime=Infinity;
 for(const item of obstacles){
  if(item.passed||item.counted||item.destroyed||item.reflected||item.returning||item.falling||item.groundHazard||!Number.isFinite(item.x)||!Number.isFinite(item.width))continue;
  const side=item.approach==='rear'&&item.speed<0&&item.x+item.width<=0?'left':
   item.approach!=='rear'&&item.speed>0&&item.x>=width?'right':null;
  if(!side)continue;
  const eta=timeToContact(item);
  if(!Number.isFinite(eta)||eta<0||eta>WARNING_HORIZON)continue;
  const action=item.action==='crouch'?'crouch':item.action==='move'?'move':'jump';
  if(side==='left'&&eta<leftTime){left={side,action};leftTime=eta;}
  if(side==='right'&&eta<rightTime){right={side,action};rightTime=eta;}
 }
 return [left,right].filter(Boolean);
}

export function drawEdgeThreats(c,cues,{width,ground}){
 if(!cues.length)return;
 c.save();
 for(const {side,action} of cues){
  const sign=side==='left'?-1:1,x=side==='left'?20:width-20,y=ground-111;
  // Two different symbols carry the meaning without colour or audio. The
  // edge arrow points to the source; the centre glyph is the action to take.
  c.beginPath();c.roundRect(x-13,y-13,26,26,5);c.fillStyle='#592b40';c.fill();
  c.lineWidth=1.3;c.strokeStyle='#ffe9d1';c.stroke();
  c.beginPath();c.moveTo(x+sign*12,y-5);c.lineTo(x+sign*18,y);c.lineTo(x+sign*12,y+5);c.closePath();c.fill();
  c.textAlign='center';c.textBaseline='middle';c.font='900 16px system-ui';c.fillStyle='#fff6e7';
  c.fillText(action==='crouch'?'↓':action==='move'?'↔':'↑',x,y-1);
 }
 c.restore();
}
