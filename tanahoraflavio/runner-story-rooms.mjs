// Plataformas e inimigos de fase originais do Corre, Flávio.
// Coordenadas de mundo persistem ao mover a câmera; sem sprites de terceiros.
export const ROOM_SIZE=1040;
const layouts=[
 [[250,150,40],[470,180,70],[735,165,48]],
 [[255,170,53],[490,150,83],[740,170,55]],
 [[270,160,36],[500,190,67],[775,150,84]],
 [[265,155,52],[495,165,77],[750,170,44]]
];
const paints=[['#374d77','#a4d7f4','#f6cc77'],['#664a69','#e3bbd5','#f1de8c'],['#355e64','#aee4d8','#e1cb7b'],['#60556e','#c6b5ed','#e5d4ac']];
export const roomActive=r=>!!r?.manualStory&&!r.practice&&!r.boss&&!r.raid&&!r.arenaExit&&!r.terrain?.active&&
 (!Number.isFinite(r.nextBossAt)||r.routeDistance<r.nextBossAt-900);
export function stagePlatforms(r){
 if(!roomActive(r))return [];
 const d=r.distance||0,w=r.viewportWidth||900,first=Math.max(0,Math.floor(d/ROOM_SIZE)-1),last=Math.floor((d+w+100)/ROOM_SIZE)+1,all=[];
 for(let k=first;k<=last;k++)for(const [j,shape] of layouts[k%4].entries()){
  const [offset,width,y]=shape,worldX=k*ROOM_SIZE+offset,x=worldX-d;
  if(x+width>-30&&x<w+30)all.push({x,width,y,worldX,room:k,index:j});
 }
 return all;
}
export function stagePlatformSupport(r,x,half=0){
 if(!roomActive(r))return null;
 const below=stagePlatforms(r).filter(p=>x+half>p.x&&x-half<p.x+p.width&&(r.player.y||0)>=p.y-1e-8);
 return below.length?Math.max(...below.map(p=>p.y)):null;
}
export function spawnStageEnemies(r){
 if(!roomActive(r)||r.status!=='running')return;
 const d=r.distance||0,w=r.viewportWidth||900,first=Math.max(0,Math.floor(d/ROOM_SIZE)-1),last=Math.floor((d+w+50)/ROOM_SIZE)+1;
 const seen=(r.storyRooms??={seen:{},maxDistance:0}).seen;
 for(let k=first;k<=last;k++){
  const ledge=layouts[k%4][0],actors=[
   {at:ledge[0]+100,platformY:ledge[2],type:['pf','janones','boulos','dino'][k%4],width:34,height:38},
   {at:950,platformY:0,type:['route-scout','terminal-guard','lula-runner','orla-runner'][k%4],width:34,height:43}
  ];
  for(let i=0;i<actors.length;i++){
   const id=k+':'+i,a=actors[i],worldX=k*ROOM_SIZE+a.at,x=worldX-d;
   if(seen[id]||x>w+35||x< -a.width-15)continue;
   seen[id]=true;r.obstacles.push({...a,x,storyWorldX:worldX,speed:0,waitFor:0,action:'jump',approach:'platform',passed:false,counted:false});
   r.spawnedObstacles++;
  }
 }
}
export function paintStagePlatforms(c,{run:r,ground=246,width=900}={}){
 if(!roomActive(r))return;
 const d=r.distance||0;c.save();
 for(let k=Math.max(0,Math.floor(d/ROOM_SIZE)-1);k<=Math.floor((d+width)/ROOM_SIZE)+1;k++){
  const origin=k*ROOM_SIZE-d,[dark,light,gold]=paints[k%4];
  c.globalAlpha=.35;
  for(let offset=70;offset<ROOM_SIZE;offset+=190){
   const x=Math.round(origin+offset);if(x< -80||x>width+80)continue;
   c.fillStyle=dark;c.fillRect(x,ground-170,76,9);c.fillRect(x+12,ground-161,10,44);c.fillRect(x+55,ground-161,10,44);
   c.fillStyle=light;c.fillRect(x+27,ground-144,25,5);
  }
  c.globalAlpha=.8;c.fillStyle=dark;c.fillRect(origin,ground-180,6,181);c.fillStyle=gold;c.fillRect(origin+1,ground-177,4,8);
 }
 c.globalAlpha=1;
 for(let x=Math.floor(d/24)*24-d;x<width;x+=24){
  c.fillStyle='#405c71';c.fillRect(x,ground+2,23,16);
  c.fillStyle='#b4d0d5';c.fillRect(x,ground+2,23,3);
 }
 for(const p of stagePlatforms(r)){
  const [dark,light,gold]=paints[p.room%4],x=Math.round(p.x),y=Math.round(ground-p.y);
  c.fillStyle='#27384a';c.fillRect(x-2,y-2,p.width+4,21);
  c.fillStyle=dark;c.fillRect(x,y,p.width,17);
  c.fillStyle=light;c.fillRect(x,y,p.width,5);
  for(let j=22;j<p.width;j+=24){c.fillStyle='#1f3142';c.fillRect(x+j,y+5,2,11);}
  c.fillStyle=gold;c.fillRect(x+6,y-5,9,4);c.fillRect(x+p.width-15,y-5,9,4);
 }
 c.restore();
}
