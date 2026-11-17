// Offline reproducible snapshot of normal terrestrial scheduling and boss projectiles.
// Forced entry/isolated encounters measure geometry and cadence, not playtest difficulty.
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const coreURL=process.argv[2]?pathToFileURL(resolve(process.argv[2])):new URL('../tanahoraflavio/runner-core.mjs',import.meta.url);
const core=await import(coreURL),bosses=await import(new URL('./runner-bosses.mjs',coreURL));
const dt=1/120,stageDistance=core.SCENE_DISTANCE,storyStart=core.STORY_OPENING_DISTANCE;
function runFor(seed,width,mode='story'){
 const r=core.createRun({mode,seed});core.resizeRun(r,width);core.startRun(r);
 r.nextBossAt=r.nextRaid=r.nextAllyAt=r.nextSupportAt=r.nextPower=r.nextPassport=Infinity;
 r.shieldFor=Infinity;r.terrain.nextAt=Infinity;r.nextObstacle=.6;
 return r;
}
const average=a=>a.length?Math.round(a.reduce((n,v)=>n+v,0)/a.length*100)/100:null;
const minimum=a=>a.length?Math.round(Math.min(...a)*100)/100:null;
function standingOverlap(r,o){
 if(o.passed||o.counted||o.destroyed||o.projectile&&!o.launched&&o.waitFor>0||
  (o.groundHazard||o.falling)&&o.age<o.warningFor)return false;
 const x=core.playerX(r),p=r.player,left=x+5,right=x+core.PLAYER.width-3;
 const low=p.y+3,high=p.y+core.PLAYER.height-5;
 return right>o.x+3&&left<o.x+o.width-3&&(o.projectile||o.falling?low<o.y+o.height/2&&high>o.y-o.height/2:low<o.height&&high>0);
}
function groundWindow(stageIndex,offset,pressureAge,window=7){
 const approaches={},responses={},counts=[],gaps=[],horizons=[],vis=[],required=[],requiredGaps=[];
 let largestQuietGap=0;
 for(const width of [480,900])for(const edge of ['min','max'])for(let seed=1;seed<=16;seed++){
  const r=runFor(seed,width),stage=core.STORY_STAGES[stageIndex];r.player.x=core.playerBounds(r)[edge];
  r.distance=r.routeDistance=storyStart+stageIndex*stageDistance+offset;r.elapsed=pressureAge;
  if(offset>=2200&&stage.id==='paraguai')r.lastBoss='fiscal';
  if(offset>=2200&&stage.id==='brasilia-final')r.lastBoss='janones';
  let n=0,last=null,contacts=0,lastOverlap=r.elapsed,actual=0;const arrived=new Set(),shown=new Set(),overlaps=new Set();
  for(let i=0;i<window/dt&&core.routeStageFor(r).id===stage.id;i++){
   core.advanceRun(r,dt);
   if(r.spawnedObstacles!==n){
    n=r.spawnedObstacles;const o=r.obstacles.at(-1);
    const name=o.groundHazard?'marker':o.cast?'overhead':o.approach;
    approaches[name]=(approaches[name]||0)+1;
    horizons.push(core.threatTimeToContact(r,o));
   }
   for(const o of r.obstacles){
    if(!overlaps.has(o)&&standingOverlap(r,o)){
     overlaps.add(o);responses[o.action]=(responses[o.action]||0)+1;
     const gap=r.elapsed-lastOverlap;
     if(actual)requiredGaps.push(gap);
     largestQuietGap=Math.max(largestQuietGap,gap);lastOverlap=r.elapsed;actual++;
    }
    if(arrived.has(o))continue;
    const eta=core.threatTimeToContact(r,o);
    if(eta<=0){arrived.add(o);contacts++;if(last!==null)gaps.push(r.elapsed-last);last=r.elapsed;}
    else if((!o.cast||o.launched)&&o.x<width&&o.x+o.width>0&&eta>0&&!shown.has(o)){shown.add(o);vis.push(eta);}
   }
  }
  counts.push(contacts);required.push(actual);largestQuietGap=Math.max(largestQuietGap,r.elapsed-lastOverlap);
 }
 return {contacts:average(counts),contactGap:average(gaps),standingContacts:average(required),standingContactGap:average(requiredGaps),
  largestQuietGap:Number(largestQuietGap.toFixed(2)),minimumScheduledLead:minimum(horizons),minimumVisibleObjectLead:minimum(vis),approaches,responses};
}
function bossWindow(index){
 const def=bosses.storyBossAt(index),rows=[];
 for(const width of [480,900]){
  const r=runFor(11,width);r.bossesDefeated=index;r.routeDistance=r.distance=bosses.nextStoryBossDistance(index);r.nextBossAt=0;
  const spawned=new Set();let first=null,lead=Infinity;
  for(let i=0;i<24/dt;i++){
   core.advanceRun(r,dt);
   for(const o of r.obstacles)if(o.bossAttack&&core.isHostileProjectile(o)&&!spawned.has(o)){
    spawned.add(o);first??=r.elapsed;lead=Math.min(lead,core.threatTimeToContact(r,o));
   }
  }
  rows.push({width,hostileProjectiles:spawned.size,first:average(first===null?[]:[first]),minimumLead:minimum(Number.isFinite(lead)?[lead]:[])});
 }
 return {id:def.type,role:def.role,traversal:def.traversal,rows};
}
const route=core.STORY_STAGES.map((stage,i)=>({id:stage.id,entry:groundWindow(i,50,60),middle:groundWindow(i,2900,150),late:groundWindow(i,3800,220)}));
console.log(JSON.stringify({stepsPerSecond:1/dt,samplesPerStageWindow:64,windowSeconds:7,route,bosses:Array.from({length:bosses.STORY_ENCOUNTERS},(_,i)=>bossWindow(i))},null,2));
