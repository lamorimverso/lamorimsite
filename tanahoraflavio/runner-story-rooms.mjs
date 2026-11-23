// Fases autorais de plataforma do Corre, Flávio; não usa arte nem código do Mega Man Maker.
export const ROOM_SIZE=1040;
const plans=[
 {platforms:[[250,150,40],[470,180,70],[735,165,48]],hazards:[]},
 {platforms:[[255,170,53],[490,150,83],[740,170,55]],hazards:[[625,62,'spikes']]},
 {platforms:[[270,160,36],[500,190,67],[775,150,84]],hazards:[[650,62,'pulse']]},
 {platforms:[[265,155,52],[495,165,77],[750,170,44]],hazards:[[690,50,'spikes']]},
 {platforms:[[225,175,45],[480,160,78],[730,175,57]],hazards:[[680,60,'pulse']]},
 {platforms:[[275,165,60],[520,180,90],[780,145,62]],hazards:[[710,70,'spikes']]},
 {platforms:[[255,160,38],[465,170,68],[720,185,88]],hazards:[[635,64,'pulse']]},
 {platforms:[[230,170,50],[475,175,83],[750,165,48]],hazards:[[650,65,'spikes']]}
];
const palettes=[
 ['#374d77','#a4d7f4','#f6cc77'],
 ['#664a69','#e3bbd5','#f1de8c'],
 ['#355e64','#aee4d8','#e1cb7b'],
 ['#60556e','#c6b5ed','#e5d4ac'],
 ['#3e6266','#bfe8d7','#f4d386'],
 ['#6c514d','#f2c3a6','#efdb87'],
 ['#4d4f79','#b4c2ed','#edb5da'],
 ['#426775','#b3dfec','#e3d187']
];
const sourceFor=n=>plans[((n%plans.length)+plans.length)%plans.length];
export const createStoryRoomState=()=>({seen:{},defeated:{},opened:{},keys:{},maxDistance:0,room:0,retries:3,
 checkpoint:{room:0,distance:0,routeDistance:0,maxDistance:0},checkpointRoom:0,flashFor:0,transitionFor:0,blockedFor:0});
const stateFor=r=>{
 const s=r.storyRooms??(r.storyRooms=createStoryRoomState());
 s.defeated??={};s.opened??={};s.keys??={};s.retries??=3;s.room??=0;s.maxDistance??=0;
 return s;
};
export const roomActive=r=>!!r?.manualStory&&!r.practice&&!r.boss&&!r.raid&&!r.arenaExit&&!r.terrain?.active&&
 (!Number.isFinite(r.nextBossAt)||r.routeDistance<r.nextBossAt-900);
export const roomIndexFor=r=>Math.max(0,Math.floor(((r.distance||0)+(r.player?.x||120))/ROOM_SIZE));
export const roomDoorFor=(r,n=roomIndexFor(r))=>{
 const s=stateFor(r),k=Math.max(0,n),needsKey=(k+1)%4===0;
 const enemiesLeft=Number(!s.defeated[k+':0'])+Number(!s.defeated[k+':1']);
 const hasKey=!needsKey||!!s.keys[k],open=!!s.opened[k]||(enemiesLeft===0&&hasKey);
 return {room:k,worldX:(k+1)*ROOM_SIZE-48,x:(k+1)*ROOM_SIZE-48-(r.distance||0),
  enemiesLeft,needsKey,hasKey,open};
};
export function stagePlatforms(r){
 if(!roomActive(r))return [];
 const d=r.distance||0,w=r.viewportWidth||900,first=Math.max(0,Math.floor(d/ROOM_SIZE)-1),last=Math.floor((d+w+100)/ROOM_SIZE)+1,all=[];
 for(let k=first;k<=last;k++)for(const [j,shape] of sourceFor(k).platforms.entries()){
  const [at,width,y]=shape,worldX=k*ROOM_SIZE+at,x=worldX-d;
  if(x+width>-30&&x<w+30)all.push({x,width,y,worldX,room:k,index:j});
 }
 return all;
}
export function stagePlatformSupport(r,x,half=0){
 if(!roomActive(r))return null;
 const p=stagePlatforms(r).filter(p=>x+half>p.x&&x-half<p.x+p.width&&(r.player.y||0)>=p.y-1e-8);
 return p.length?Math.max(...p.map(o=>o.y)):null;
}
const actorFor=(k,i)=>{
 const first=sourceFor(k).platforms[0];
 return i===0?{at:first[0]+98,platformY:first[2],type:['pf','janones','boulos','dino'][k%4],width:34,height:38,
  patrolRange:k%3===2?16:0,phase:k*.8}:
  {at:910,platformY:0,type:['route-scout','terminal-guard','lula-runner','orla-runner'][k%4],width:34,height:43,
   patrolRange:k%2===1?26:0,phase:k*1.1};
};
export function spawnStageEnemies(r){
 if(!roomActive(r)||r.status!=='running')return;
 const s=stateFor(r),d=r.distance||0,w=r.viewportWidth||900;
 const first=Math.max(0,Math.floor(d/ROOM_SIZE)-1),last=Math.floor((d+w+55)/ROOM_SIZE)+1;
 for(let k=first;k<=last;k++)for(let i=0;i<2;i++){
  const id=k+':'+i,a=actorFor(k,i),homeWorldX=k*ROOM_SIZE+a.at,x=homeWorldX-d;
  if(s.defeated[id]||r.obstacles.some(o=>o.storyEnemyId===id)||x>w+35||x<-a.width-15)continue;
  r.obstacles.push({...a,x,storyWorldX:homeWorldX,homeWorldX,storyEnemyId:id,storyRoom:k,
   hp:1,patrolFor:0,speed:0,waitFor:0,action:'jump',approach:'platform',passed:false,counted:false});
  r.spawnedObstacles=(r.spawnedObstacles||0)+1;
 }
}
export function stepStageEnemies(r,dt){
 if(!roomActive(r))return;
 for(const o of r.obstacles)if(o.storyEnemyId&&!o.destroyed){
  o.patrolFor=(o.patrolFor||0)+dt;
  o.storyWorldX=o.homeWorldX+Math.sin(o.patrolFor*1.8+(o.phase||0))*(o.patrolRange||0);
  o.x=o.storyWorldX-(r.distance||0);
 }
}
export function constrainStageAdvance(r,travel,body){
 if(!roomActive(r)||r.player.moveHeld<=0)return travel;
 const old=(r.distance||0)+r.player.previousX+(body?.right??28);
 const wanted=(r.distance||0)+r.player.x+travel+(body?.right??28);
 if(wanted<=old)return travel;
 const gateRoom=Math.max(0,Math.floor((old+48)/ROOM_SIZE)),door=roomDoorFor(r,gateRoom);
 if(door.open){stateFor(r).opened[gateRoom]=true;return travel;}
 const limit=door.worldX-8;
 if(old>=limit||wanted<=limit)return travel;
 let excess=wanted-limit;
 if(travel>0){const taken=Math.min(travel,excess);travel-=taken;excess-=taken;}
 if(excess>0)r.player.x=Math.max(r.player.previousX,r.player.x-excess);
 stateFor(r).blockedFor=.35;
 return travel;
}
export function stageHazards(r){
 if(!roomActive(r))return [];
 const d=r.distance||0,w=r.viewportWidth||900,first=Math.max(0,Math.floor(d/ROOM_SIZE)-1),last=Math.floor((d+w+50)/ROOM_SIZE)+1,all=[];
 for(let k=first;k<=last;k++)for(const [at,width,kind] of sourceFor(k).hazards){
  const x=k*ROOM_SIZE+at-d;
  if(x+width< -30||x>w+30)continue;
  const active=kind==='spikes'||Math.sin((r.elapsed||0)*3.3+k)>-.22;
  all.push({room:k,x,width,kind,active,height:kind==='spikes'?16:28});
 }
 return all;
}
export function stageHazardHit(r,body){
 if(!roomActive(r))return null;
 const left=(r.player.x||0)+(body?.left??4),right=(r.player.x||0)+(body?.right??29),
  feet=r.player.y||0;
 return stageHazards(r).find(h=>h.active&&right>h.x+3&&left<h.x+h.width-3&&feet<h.height&&feet+(body?.height??45)>0)?
  {type:'stage-spikes',action:'jump',platformHazard:true}:null;
}
export function stepStoryRooms(r,dt){
 if(!r.manualStory||!r.storyRooms)return;
 const s=stateFor(r);
 s.flashFor=Math.max(0,(s.flashFor||0)-dt);s.transitionFor=Math.max(0,(s.transitionFor||0)-dt);
 s.blockedFor=Math.max(0,(s.blockedFor||0)-dt);
 if(!roomActive(r)||r.status!=='running')return;
 const world=(r.distance||0)+(r.player.x||0),room=Math.max(0,Math.floor(world/ROOM_SIZE));
 if(room!==s.room){s.room=room;s.transitionFor=.65;}
 const door=roomDoorFor(r,room);
 if(door.open)s.opened[room]=true;
 if(door.needsKey&&!s.keys[room]&&Math.abs(world-(room*ROOM_SIZE+590))<21&&(r.player.y||0)<55){
  s.keys[room]=true;s.flashFor=.75;
 }
 if(room>0&&room%3===0&&room>s.checkpointRoom&&world>=room*ROOM_SIZE+84){
  s.checkpointRoom=room;s.checkpoint={room,distance:Math.max(0,room*ROOM_SIZE+100-120),
   routeDistance:r.routeDistance,maxDistance:s.maxDistance};s.flashFor=1.1;
 }
}
export function restoreStoryCheckpoint(r){
 if(!r.manualStory||r.practice)return false;
 const s=stateFor(r),cp=s.checkpoint;
 if(!cp||s.retries<=0)return false;
 s.retries--;
 r.distance=cp.distance;r.routeDistance=cp.routeDistance;s.maxDistance=cp.maxDistance;s.room=cp.room;
 for(const field of ['defeated','opened','keys']){
  for(const id of Object.keys(s[field]))if(Number(id.split(':')[0])>=cp.room)delete s[field][id];
 }
 r.player.x=120;r.player.previousX=120;r.player.y=0;r.player.velocity=0;r.player.supportY=0;
 r.player.grounded=true;r.player.airJumpsUsed=0;r.player.hp=r.player.maxHp;
 r.player.isJacare=false;r.player.jacareAge=0;r.player.jacareProgress=0;r.player.recoveryPending=false;
 r.player.sliding=false;r.player.slideRemaining=0;r.player.terrainContact=null;
 r.obstacles=[];r.pickups=[];r.heroShots=[];r.boss=null;r.raid=null;r.cameo=null;r.arenaExit=null;
 if(r.terrain){r.terrain.active=null;r.terrain.preparing=null;r.terrain.nextAt=r.elapsed+6;}
 r.graceFor=2;r.shieldFor=0;r.cameraLead=0;r.lastHit=null;
 s.flashFor=1.3;s.transitionFor=.6;s.blockedFor=0;
 return true;
}
export function paintStagePlatforms(c,{run:r,ground=246,width=900}={}){
 if(!roomActive(r))return;
 const d=r.distance||0;c.save();
 for(let k=Math.max(0,Math.floor(d/ROOM_SIZE)-1);k<=Math.floor((d+width)/ROOM_SIZE)+1;k++){
  const origin=k*ROOM_SIZE-d,[dark,light,gold]=palettes[k%palettes.length];
  c.globalAlpha=.32;
  for(let at=70;at<ROOM_SIZE;at+=190){
   const x=Math.round(origin+at);if(x<-80||x>width+80)continue;
   c.fillStyle=dark;c.fillRect(x,ground-170,76,9);c.fillRect(x+12,ground-161,10,44);
   c.fillRect(x+55,ground-161,10,44);c.fillStyle=light;c.fillRect(x+27,ground-144,25,5);
  }
  c.globalAlpha=.8;c.fillStyle=dark;c.fillRect(origin,ground-180,6,181);
  c.fillStyle=gold;c.fillRect(origin+1,ground-177,4,8);
 }
 c.globalAlpha=1;
 for(let x=Math.floor(d/24)*24-d;x<width;x+=24){
  c.fillStyle='#405c71';c.fillRect(x,ground+2,23,16);
  c.fillStyle='#b4d0d5';c.fillRect(x,ground+2,23,3);
 }
 for(const p of stagePlatforms(r)){
  const [dark,light,gold]=palettes[p.room%palettes.length],x=Math.round(p.x),y=Math.round(ground-p.y);
  c.fillStyle='#27384a';c.fillRect(x-2,y-2,p.width+4,21);
  c.fillStyle=dark;c.fillRect(x,y,p.width,17);
  c.fillStyle=light;c.fillRect(x,y,p.width,5);
  for(let j=22;j<p.width;j+=24){c.fillStyle='#1f3142';c.fillRect(x+j,y+5,2,11);}
  c.fillStyle=gold;c.fillRect(x+6,y-5,9,4);c.fillRect(x+p.width-15,y-5,9,4);
 }
 for(const hazard of stageHazards(r)){
  const y=ground,h=hazard.height;
  c.save();c.globalAlpha=hazard.active?1:.28;
  c.fillStyle=hazard.kind==='spikes'?'#b64c61':'#69bfe2';
  for(let x=hazard.x;x<hazard.x+hazard.width-1;x+=13){
   c.beginPath();c.moveTo(x,y);c.lineTo(x+6,y-h);c.lineTo(Math.min(hazard.x+hazard.width,x+12),y);c.fill();
  }
  c.fillStyle='#29374b';c.fillRect(hazard.x,y,hazard.width,4);c.restore();
 }
 const s=stateFor(r);
 for(let k=Math.max(0,Math.floor(d/ROOM_SIZE)-1);k<=Math.floor((d+width)/ROOM_SIZE)+1;k++){
  const door=roomDoorFor(r,k),x=Math.round(door.x);
  if(x>=-40&&x<width+40){
   c.save();
   c.fillStyle='#273146';c.fillRect(x-10,ground-102,20,105);
   c.fillStyle=door.open?'#71d6aa':'#e3a75b';
   c.fillRect(x-8,ground-97,16,door.open?7:91);
   c.fillStyle='#f3e5c6';c.fillRect(x-6,ground-107,12,5);
   if(!door.open){c.fillStyle='#6c3448';for(let y=ground-87;y<ground-12;y+=14)c.fillRect(x-5,y,10,4);}
   c.restore();
  }
  if((k+1)%4===0&&!s.keys[k]){
   const keyX=Math.round(k*ROOM_SIZE+590-d);
   if(keyX>=0&&keyX<=width){
    c.fillStyle='#f8e4a6';c.fillRect(keyX-2,ground-30,5,22);
    c.fillRect(keyX+2,ground-13,9,5);
    c.strokeStyle='#9b7738';c.lineWidth=3;c.beginPath();c.arc(keyX,ground-35,8,0,Math.PI*2);c.stroke();
   }
  }
  if(k>0&&k%3===0){
   const cx=Math.round(k*ROOM_SIZE+84-d);
   if(cx>=0&&cx<=width){
    c.fillStyle='#2c4358';c.fillRect(cx,ground-78,4,80);
    c.fillStyle=k<=s.checkpointRoom?'#80e3aa':'#f2ce86';
    c.beginPath();c.moveTo(cx+4,ground-78);c.lineTo(cx+33,ground-64);c.lineTo(cx+4,ground-51);c.fill();
   }
  }
 }
 c.restore();
}
export function paintStoryHUD(c,{run:r,width=900}={}){
 if(!roomActive(r))return;
 const s=stateFor(r),room=roomIndexFor(r),door=roomDoorFor(r,room);
 c.save();c.font='bold 11px monospace';c.textBaseline='middle';
 c.fillStyle='#15263be8';c.fillRect(11,10,Math.min(310,width-22),38);
 c.fillStyle='#e7f1e9';c.fillText('SALA '+String(room+1).padStart(2,'0')+'  ·  '+Math.max(0,s.retries)+' RETENTATIVAS',20,23);
 c.fillStyle=door.open?'#80e8af':'#f7c984';
 const gate=door.open?'PORTA ABERTA':door.needsKey&&!door.hasKey?'ACHE A CHAVE':door.enemiesLeft+' INIMIGOS · PORTA TRANCADA';
 c.fillText(gate,20,39,Math.min(285,width-40));
 if(s.transitionFor>0){
  const a=Math.min(.8,s.transitionFor/.65*.76);c.fillStyle='rgba(12,26,47,'+a+')';
  c.fillRect(0,0,width,300);
  c.fillStyle='#f5e9cd';c.font='bold 22px monospace';c.textAlign='center';
  c.fillText('SALA '+String(room+1).padStart(2,'0'),width/2,146);
 }
 if(s.flashFor>0){
  c.globalAlpha=Math.min(1,s.flashFor*2);c.fillStyle='#e8f4df';c.font='bold 14px monospace';c.textAlign='center';
  c.fillText(s.checkpointRoom===room&&room>0?'CHECKPOINT ATIVADO':door.hasKey?'CHAVE COLETADA':'RETOMADA',width/2,70);
 }
 c.restore();
}
