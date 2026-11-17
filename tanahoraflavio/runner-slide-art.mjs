// An articulated forward skid. Face and small details come from the same
// crouch atlas at its native gameplay scale. Coordinates are image pixels.
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

export function drawHeroSlide(c,{image,factor,x,y,scale,phase=0,alpha=1,facing,shot}){
 const push=Math.sin(Math.PI*Math.max(0,Math.min(1,phase))),front=26+4*push,back=-27+3*push;
 const hip=-16-2*push,knee=6+3*push,neck=7+2*push;
 const fire=shot&&shot.state!=='recover',aimX=fire?Math.abs(shot.muzzle.x)/scale-(shot.state==='recoil'?shot.kick*.7:0):22,aimY=fire?shot.muzzle.y/scale:-12;
 const atlasFactor=factor/scale;
 c.save();c.globalAlpha*=alpha;c.imageSmoothingEnabled=true;
 c.translate(x,y);c.scale(facing===-1?-scale:scale,scale);
 // Tucked leg carries weight. The leading heel skims the same support.
 part(c,image,'shoe',back,0,atlasFactor);
 shape(c,shade,p=>{p.moveTo(hip,-14);p.quadraticCurveTo(-28,-16,-30,-10);p.quadraticCurveTo(-30,-4,-19,-4);p.lineTo(-9,-5);p.quadraticCurveTo(-3,-8,-5,-12);});
 line(c,'#543060',1,[-28,-8],[-25,-11],[-21,-10]);
 part(c,image,'shoe',front,0,atlasFactor);
 shape(c,coat,p=>{p.moveTo(hip-2,-13);p.bezierCurveTo(hip+4,-17,knee-5,-11,knee,-9);p.lineTo(front+1,-7);p.lineTo(front-2,-2);p.quadraticCurveTo(knee,-1,knee-7,-4);p.quadraticCurveTo(hip-6,-2,hip-8,-7);p.quadraticCurveTo(hip-9,-10,hip-2,-13);});
 line(c,highlight,1,[hip-2,-11],[knee-1,-7],[front-3,-5]);
 line(c,'#391f45',.75,[knee+1,-6],[knee-2,-5],[knee+1,-4]);
 // The jacket inclines from the hip to the neck. Face, shoe and hand
 // proportions do not change when the silhouette lowers.
 shape(c,coat,p=>{p.moveTo(hip-6,-11);p.quadraticCurveTo(hip-3,-17,-7,-21);p.quadraticCurveTo(-2,-23,neck+2,-15);p.quadraticCurveTo(neck+2,-10,4,-8);p.quadraticCurveTo(-3,-8,hip+1,-5);p.quadraticCurveTo(hip-6,-5,hip-6,-11);});
 shape(c,shade,p=>{p.moveTo(hip+1,-8);p.quadraticCurveTo(-2,-16,-1,-19);p.lineTo(5,-14);p.lineTo(2,-9);p.quadraticCurveTo(-8,-8,hip+1,-8);},null);
 line(c,highlight,1,[hip-3,-11],[-14,-15],[-8,-17]);
 shape(c,'#fff2dc',p=>{p.moveTo(neck-3,-17);p.lineTo(neck+1,-15);p.lineTo(neck-4,-10);p.lineTo(-4,-10);});
 shape(c,'#ffd448',p=>{p.moveTo(neck-1,-14);p.quadraticCurveTo(-1,-14,-5,-12);p.quadraticCurveTo(-10,-11,-17,-13);p.lineTo(-13,-8);p.quadraticCurveTo(0,-9,neck-1,-14);},'#74502a',.65);
 // One elbow trails behind the hip as the forward arm steadies the skid.
 line(c,ink,7,[-7,-18],[-17,-19],[-27,-14]);
 line(c,coat,5.3,[-7,-18],[-17,-19],[-27,-14]);
 line(c,highlight,.9,[-9,-20],[-17,-21],[-25,-17]);
 shape(c,'#f7b487',p=>{p.moveTo(-25,-16);p.quadraticCurveTo(-30,-17,-33,-14);p.quadraticCurveTo(-34,-11,-29,-11);p.lineTo(-25,-13);});
 line(c,ink,7,[neck-1,-14],[12,-9],[aimX-7,aimY+4]);
 line(c,coat,5.3,[neck-1,-14],[12,-9],[aimX-7,aimY+4]);
 line(c,'#f7e9db',2,[aimX-9,aimY+5],[aimX-6,aimY+3]);
 if(shot)part(c,image,'weapon',aimX,aimY,atlasFactor);
 else part(c,image,'passport',aimX,aimY+2,atlasFactor);
 part(c,image,'head',neck,-10,atlasFactor);
 c.restore();return true;
}
