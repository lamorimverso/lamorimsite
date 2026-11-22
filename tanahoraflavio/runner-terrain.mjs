import {playerBodyFor,HERO_SLIDE_SECONDS,HERO_CROUCH_CLEARANCE} from './runner-body.mjs?v=57ec474fca38';
import {movementProfileFor} from './runner-movement-skills.mjs?v=d0ad734b4838';
// Shared simulation/render geometry. x is logical screen-space; y is height
// above WORLD.ground. Resizing translates shapes with the hero, never stretches
// a jump or replaces an active hole with invisible ground.
export const TERRAIN = Object.freeze({speed:270,warningFor:2.3,slideFor:HERO_SLIDE_SECONDS,slideSpeed:310,clearance:46,platformY:28});
export function createTerrain(){return {active:null,preparing:null,nextAt:6,completed:0,spawned:0,lessonCompleted:false,flightCompleted:false,flightsCompleted:0,lastFlightArrival:null};}
const BASIC_ROUTE=Object.freeze({id:'basic',gapTime:.39,platformOffsetTime:.30,platformTime:.54,platformY:28,requiresDoubleJump:false});
// The earned jump is an alternative, never the entry ticket to a compulsory bar.
const ADVANCED_ROUTE=Object.freeze({id:'earned-jump-optional',gapTime:.45,platformOffsetTime:.37,platformTime:.57,platformY:40,requiresDoubleJump:false});
export const terrainProfileFor=(run,speed=TERRAIN.speed)=>{
 const p=movementProfileFor(run).maxAirJumps>0?ADVANCED_ROUTE:BASIC_ROUTE;
 return {...p,gapWidth:speed*p.gapTime,platformOffset:speed*p.platformOffsetTime,platformWidth:speed*p.platformTime};
};
export function terrainReservationFor(run,speed=TERRAIN.speed){
 const p=terrainProfileFor(run,speed);
 return (run.player.x+31+speed*TERRAIN.warningFor+Math.max(p.gapWidth,p.platformOffset+p.platformWidth))/speed+.8;
}
export function beginTerrain(run,speed=TERRAIN.speed){
 const profile=terrainProfileFor(run,speed),state=run.terrain,x=run.player.x+31+speed*TERRAIN.warningFor;
 state.active={id:++state.spawned,kind:'gap-platform',age:0,speed,warningFor:TERRAIN.warningFor,requiresDoubleJump:false,
  gaps:[{x,width:profile.gapWidth}],platforms:[{x:x+profile.platformOffset,width:profile.platformWidth,y:profile.platformY}],ceilings:[]};
 return state.active;
}
// A first bar above solid ground teaches the same edge and jump timing before
// the São Paulo duels and without a lethal hole beneath the lesson.
export function beginGroundLesson(run,speed,{routeStart,routeEnd}){
 const state=run.terrain,width=.80*speed,lead=1.32*speed,x=run.player.x+18+lead;
 state.preparing=null;
 const lesson={routeStart,routeEnd,traveled:0,length:lead+width};
 state.active={id:++state.spawned,kind:'ground-lesson',age:0,speed,warningFor:1.32,requiresDoubleJump:false,
  gaps:[],platforms:[{x,width,y:24}],ceilings:[],lesson};
 return state.active;
}
// An air corridor is one finite span of true void, with independent landing
// surfaces. Widths are distances at the actual departure speed; acceleration
// never changes geometry after takeoff, including during viewport changes.
const AIR_BARS=Object.freeze([[3.6,16],[3.4,34],[3.7,52],[3.4,36],[3.5,16]]);
const STORY_AIR_BARS=Object.freeze([[1.35,16],[1.5,34],[1.4,52],[1.55,70],[1.4,46],[1.5,30],[1.4,16]]);
export function beginAirTransfer(run,speed,{routeStart,routeEnd,from='sao-paulo',to='argentina',fromName='São Paulo',toName='Argentina'}){
 const story=run.mode==='story',state=run.terrain,center=run.player.x+18,first=center+1.6*speed,space=(story?.38:.24)*speed;
 state.preparing=null;
 const platforms=[];let end=first;
 for(const [seconds,y] of story?STORY_AIR_BARS:AIR_BARS){const x=end+space,width=seconds*speed;platforms.push({x,width,y});end=x+width;}
 end+=space;
 const flight={from,to,fromName,toName,phase:'boarding',progress:0,traveled:0,nominalSpeed:speed,bodyScale:playerBodyFor(run.player).scale,
  routeStart,routeEnd,length:end-center,phasesAt:[first-center,platforms[1].x-center,platforms.at(-1).x-center],aircraft:[]};
 // Quiet silhouettes teach the aircraft vocabulary before any armed crossing.
 for(const [kind,barIndex,offset] of [['flyby',0,platforms[0].width*.47],['high',1,platforms[1].width*.50],['lane',2,story?platforms[2].width*.45:platforms[2].width-speed*.21]]){
  const crossAt=platforms[barIndex].x+offset-center;
  const launchAt=crossAt-(kind==='lane'?.50:.33)*speed;
  flight.aircraft.push({kind,barIndex,offset,launchAt,warnAt:launchAt-.95*speed,spent:false});
 }
 state.active={id:++state.spawned,kind:'air-transfer',age:0,speed,warningFor:1.6,clearance:TERRAIN.clearance,requiresDoubleJump:false,
  gaps:[{x:first,width:end-first}],platforms,ramps:[{x:first-speed*.54,width:speed*.54,height:14}],ceilings:[],flight};
 return state.active;
}
// Geometry used by both rendering and hit tests. Every active projectile starts
// exactly at its aircraft origin, while the marked lane never tracks the player.
export function aircraftPoseFor(a,craft){
 const f=a?.flight,bar=a?.platforms[craft.barIndex];if(!f||!bar)return null;
 const x=bar.x+craft.offset,t=(f.traveled-craft.launchAt)/f.nominalSpeed;
 if(f.traveled<craft.warnAt||t>1.05)return null;
 if(craft.kind==='flyby')return {markerX:x,aircraftX:x+92-220*t,aircraftY:bar.y+161,warning:false,shot:null};
 // The high shot clears both bent poses, but still crosses the upright body.
 const lane=craft.kind==='lane',originX=x+(lane?0:84),originY=bar.y+(lane?158:HERO_CROUCH_CLEARANCE*(f.bodyScale??1)+9);
 const warning=t<0,aircraftX=originX+84*t,aircraftY=originY+(lane?0:Math.max(0,-t)*42+Math.max(0,t)*82);
 const shot=t>=0&&t<=(lane?.64:.85)&&!craft.spent?{
  x:originX-(lane?0:220*t),y:lane?Math.max(bar.y+16,originY-355*t):originY,
  width:lane?44:32,height:lane?26:14
 }:null;
 return {markerX:x,barY:bar.y,aircraftX,aircraftY,warning,shot};
}
export function aircraftHitFor(run,body=playerBodyFor(run.player)){
 const a=run.terrain?.active,p=run.player;if(!a?.flight)return null;
 const high=p.y+body.terrainHeight,left=p.x+body.left,right=p.x+body.right;
 for(const craft of a.flight.aircraft){
  const shot=aircraftPoseFor(a,craft)?.shot;if(!shot)continue;
  if(right<=shot.x-shot.width/2||left>=shot.x+shot.width/2||high<=shot.y-shot.height/2||p.y>=shot.y+shot.height/2)continue;
  craft.spent=true;
  return {type:'aircraft-'+craft.kind,action:craft.kind==='high'?'crouch':'jump',source:craft};
 }
 return null;
}
export function translateTerrain(run,delta){const a=run.terrain?.active;if(a)for(const shapes of [a.gaps,a.platforms,a.ceilings,a.ramps||[]])for(const s of shapes)s.x+=delta;}
export function terrainSupportAt(run,x,halfWidth=0){
 const a=run.terrain?.active;if(!a)return 0;
 const platform=a.platforms.find(s=>x+halfWidth>=s.x&&x-halfWidth<=s.x+s.width);if(platform)return platform.y;
 const ramp=a.ramps?.find(g=>x>=g.x&&x<=g.x+g.width);if(ramp)return ramp.height*(x-ramp.x)/ramp.width;
 return a.gaps.some(s=>x-halfWidth>s.x&&x+halfWidth<s.x+s.width)?null:0;
}
export function advanceSlide(run,dt,allowed){
 const p=run.player,duel=!!run.boss&&!run.boss.traversal;
 const moving=duel?p.moveHeld!==0:p.moveHeld>0;
 const wants=allowed&&p.grounded!==false&&p.velocity===0&&p.crouchHeld&&moving;
 if(!p.crouchHeld||!moving)p.slideLatched=false;
 if(!wants){p.sliding=false;p.slideRemaining=0;return;}
 if(!p.sliding&&!p.slideLatched){p.sliding=true;p.slideLatched=true;p.slideRemaining=TERRAIN.slideFor;}
 if(p.sliding){p.slideRemaining=Math.max(0,p.slideRemaining-dt);if(p.slideRemaining<=1e-8)p.sliding=false;}
}
export function advanceTerrain(run,dt,travel){
 const state=run.terrain,a=state?.active;if(!a)return;
 a.age+=dt;a.speed=travel/dt;translateTerrain(run,-travel);
 if(a.flight){
  const f=a.flight;f.traveled+=travel;
  f.progress=Math.min(.999999,f.traveled/f.length);
  f.phase=f.traveled<f.phasesAt[0]?'boarding':f.traveled<f.phasesAt[1]?'ascent':f.traveled<f.phasesAt[2]?'crossing':'landing';
  run.routeDistance=Math.max(run.routeDistance,f.routeStart+(f.routeEnd-f.routeStart)*f.progress);
  // Reaching the route marker is not a landing. The player must physically
  // cross the end of the gap and touch solid ground before combat can resume.
  const end=a.gaps[0].x+a.gaps[0].width;
  if(end<=run.player.x+5&&run.player.grounded&&run.player.y===0){
   f.progress=1;run.routeDistance=f.routeEnd;state.active=null;state.completed++;state.nextAt=run.elapsed+18;
   state.flightCompleted=true;state.flightsCompleted++;state.lastFlightArrival=f.routeEnd;
  }
  return;
 }
 if(a.lesson){
  const lesson=a.lesson;lesson.traveled+=travel;
  const progress=Math.min(.999999,lesson.traveled/lesson.length);
  run.routeDistance=Math.max(run.routeDistance,lesson.routeStart+(lesson.routeEnd-lesson.routeStart)*progress);
  const bar=a.platforms[0];
  if(bar.x+bar.width<=run.player.x+5&&run.player.grounded&&run.player.y===0){
   run.routeDistance=lesson.routeEnd;state.active=null;state.completed++;state.nextAt=run.elapsed+18;state.lessonCompleted=true;
  }
  return;
 }
 const last=Math.max(...a.gaps.concat(a.platforms,a.ceilings).map(s=>s.x+s.width));
 // Reserve the complete physical surface, including the final descent from a
 // raised support. Events cannot remove the ground during a committed jump.
 if(last<0&&run.player.grounded&&run.player.y===0){state.active=null;state.completed++;state.nextAt=run.elapsed+18;}
}
export function stepTerrainPlayer(run,dt){
 const p=run.player,a=run.terrain?.active,previous=p.y,slopeApproach=p.grounded&&p.velocity===0;
 p.velocity-=1750*dt;p.y+=p.velocity*dt;
 // Land as soon as any part of the physical foot interval crosses a top.
 // Center-only support lets a descending hero tunnel through platform edges.
 const feet=playerBodyFor(p),center=p.x+(feet.left+feet.right)/2,halfWidth=(feet.right-feet.left)/2;
 const support=terrainSupportAt(run,center,halfWidth);p.supportY=support;p.grounded=false;
 const slope=a?.ramps?.some(g=>center>=g.x&&center<=g.x+g.width);
 if(support!==null&&(previous>=support-1e-8&&p.y<=support&&p.velocity<=0||slopeApproach&&slope&&support>=previous)){
  p.y=support;p.velocity=0;p.grounded=true;
 }
 if(!p.grounded){p.crouching=false;p.sliding=false;}
 else {p.airJumpsUsed=0;p.crouching=!p.isJacare&&!!p.crouchHeld;}
 if(p.y< -85)return {type:'terrain-gap',action:'jump'};
 const body=playerBodyFor(p),left=p.x+body.left,right=p.x+body.right;
 if(a){
  const ceiling=a.ceilings.find(s=>right>s.x&&left<s.x+s.width&&p.y+body.terrainHeight>s.bottom&&p.y<s.top);
  if(ceiling)return {type:'terrain-ceiling',action:'crouch',source:ceiling};
  const platform=!a.flight&&previous>=0&&a.platforms.find(s=>right>s.x&&left<s.x+s.width&&p.y<s.y-1e-8&&p.y+body.terrainHeight>0);
  if(platform)return {type:'terrain-platform',action:'jump',source:platform};
 }
 return null;
}
export function recoverTerrain(run){
 const p=run.player;run.terrain.active=null;run.terrain.preparing=null;run.terrain.nextAt=run.elapsed+18;
 p.y=0;p.velocity=0;p.airJumpsUsed=0;p.grounded=true;p.supportY=0;p.sliding=false;p.slideRemaining=0;
}
