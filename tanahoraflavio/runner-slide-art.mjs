// The same outlined head and limbs are used at every bend of the rig.
// The body lowers by moving joints, never by scaling the whole posture.
const parts={
 head:{box:[132,77,197,180],anchor:[243,250],mask:[[130,77],[308,77],[321,126],[313,174],[327,203],[318,223],[299,237],[268,250],[219,253],[192,246],[181,232],[151,225],[130,195]]},
 shoe:{box:[258,352,125,61],anchor:[286,410],mask:[[258,367],[285,351],[310,355],[333,366],[358,370],[382,383],[382,410],[254,413]]},
 passport:{box:[303,208,90,104],anchor:[327,300],mask:[[303,273],[337,207],[395,229],[383,271],[382,292],[363,312],[319,307]]},
 weapon:{box:[1186,656,121,116],anchor:[1301,696],mask:[[1194,662],[1247,656],[1264,678],[1307,675],[1307,712],[1261,716],[1250,746],[1236,769],[1207,769],[1187,755],[1186,728],[1206,715]]}
};
function part(c,image,kind,x,y,factor){
 const {box,anchor:[ax,ay],mask}=parts[kind];
 c.save();c.translate(x,y);c.scale(factor,factor);c.translate(-ax,-ay);c.beginPath();
 for(let i=0;i<mask.length;i++){const [px,py]=mask[i];if(i)c.lineTo(px,py);else c.moveTo(px,py);}
 c.closePath();c.clip();c.drawImage(image,...box,...box);c.restore();
}
function shape(c,fill,path,stroke='#211523',width=.9){
 c.beginPath();path(c);c.closePath();c.fillStyle=fill;c.fill();
 if(stroke){c.lineJoin='round';c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}
}
function line(c,color,width,...points){
 c.beginPath();for(let i=0;i<points.length;i++){const [x,y]=points[i];if(i)c.lineTo(x,y);else c.moveTo(x,y);}
 c.lineCap='round';c.lineJoin='round';c.strokeStyle=color;c.lineWidth=width;c.stroke();
}
const coat='#592a69',highlight='#7c4692',shade='#371d47',ink='#211523';

// Interpolate joints between upright, bent knees and the extended skid.
// Both shoe soles keep the same height as the actual collision support.
export function drawHeroLowPose(c,{image,factor,x,y,scale,pose=1,slide=0,phase=0,alpha=1,facing,shot}){
 const clamp=t=>Math.max(0,Math.min(1,t)),skid=clamp(slide),bend=Math.max(clamp(pose),skid);
 const blend=(a,b,t)=>a+(b-a)*t,mix=(a,b,d)=>blend(blend(a,b,bend),d,skid);
 const push=Math.sin(Math.PI*clamp(phase));
 const hip=[mix(-5,-11,-18),mix(-29,-13,-10)],neck=[mix(1,8,12+push),mix(-49,-20,-10)];
 const shoulder=[neck[0]-mix(4,4,10),neck[1]+mix(2,2,-3)];
 const rearFoot=mix(-14,-16,-29),frontFoot=mix(10,12,27+5*push);
 const rearKnee=[mix(-13,-21,-28),mix(-16,-11,-10)],frontKnee=[mix(5,16,8+4*push),mix(-16,-13,-8)];
 const elbow=[shoulder[0]-mix(13,13,19),shoulder[1]+mix(5,5,-1)],hand=[shoulder[0]-mix(17,17,31),shoulder[1]+mix(14,14,4)];
 const atlasFactor=factor/scale;
 const fire=shot&&shot.state!=='recover',aimX=fire?Math.abs(shot.muzzle.x)/scale-(shot.state==='recoil'?shot.kick*.7:0):mix(23,27,27),aimY=fire?shot.muzzle.y/scale:mix(-35,-22,-13);
 c.save();c.globalAlpha*=alpha;c.imageSmoothingEnabled=true;
 c.translate(x,y);c.scale(facing===-1?-scale:scale,scale);
 for(const [foot,knee,fill] of [[rearFoot,rearKnee,shade],[frontFoot,frontKnee,coat]]){
  part(c,image,'shoe',foot,0,atlasFactor*1.28);
  line(c,ink,11,hip,knee,[foot,-6]);
  line(c,fill,8.5,hip,knee,[foot,-6]);
  line(c,highlight,1.15,[hip[0]+2,hip[1]-2],[knee[0]+2,knee[1]-2],[foot+2,-7]);
 }
 shape(c,coat,p=>{p.moveTo(hip[0]-8,hip[1]+3);p.quadraticCurveTo(hip[0]-12,hip[1]-8,shoulder[0]-6,shoulder[1]-3);p.quadraticCurveTo(shoulder[0]+1,shoulder[1]-7,neck[0]+6,neck[1]+3);p.quadraticCurveTo(neck[0]+10,neck[1]+12,hip[0]+8,hip[1]+4);p.quadraticCurveTo(hip[0]+1,hip[1]+8,hip[0]-8,hip[1]+3);});
 line(c,ink,8,shoulder,elbow,hand);
 line(c,shade,6.4,shoulder,elbow,hand);
 const [hx,hy]=hand;
 shape(c,'#f5a56b',p=>{p.moveTo(hx+3,hy-3);p.quadraticCurveTo(hx+5,hy-1,hx+3,hy+1);p.quadraticCurveTo(hx+2,hy+4,hx,hy+4);p.quadraticCurveTo(hx-4,hy+4,hx-4,hy+1);p.quadraticCurveTo(hx-5,hy-2,hx-2,hy-3);p.quadraticCurveTo(hx,hy-5,hx+3,hy-3);},ink,.75);
 line(c,'#a45e38',.6,[hx-2.6,hy+.5],[hx-1.7,hy+2],[hx,hy+2.2]);
 line(c,'#ffd3a2',.9,[hx-2,hy-2],[hx-.6,hy-2.7],[hx+1,hy-2.4]);
 shape(c,'#fff2dc',p=>{p.moveTo(neck[0]-3,neck[1]-2);p.lineTo(neck[0]+5,neck[1]+3);p.lineTo(hip[0]+5,hip[1]+2);p.lineTo(neck[0]-3,neck[1]+5);});
 shape(c,'#ffd448',p=>{p.moveTo(neck[0]-1,neck[1]+3);p.lineTo(neck[0]+1,neck[1]+7);p.quadraticCurveTo(hip[0]+7,hip[1]+2,hip[0]-1,hip[1]+6);p.quadraticCurveTo(hip[0]+2,hip[1]+1,neck[0]-1,neck[1]+3);},'#74502a',.6);
 const forearm=[neck[0]+6,neck[1]+mix(11,11,1)];
 line(c,ink,8,[neck[0]+2,neck[1]+4],forearm,[aimX-7,aimY+4]);
 line(c,coat,6,[neck[0]+2,neck[1]+4],forearm,[aimX-7,aimY+4]);
 if(shot)part(c,image,'weapon',aimX,aimY,atlasFactor*1.27);
 else part(c,image,'passport',aimX,aimY,atlasFactor*1.35);
 part(c,image,'head',neck[0],neck[1],atlasFactor*1.70);
 c.restore();return true;
}
