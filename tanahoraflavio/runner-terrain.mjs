import {movementProfileFor} from './runner-movement-skills.mjs?v=d0ad734b4838';
// Shared simulation/render geometry. x is logical screen-space; y is height
// above WORLD.ground. Resizing translates shapes with the hero, never stretches
// a jump or replaces an active hole with invisible ground.
export const TERRAIN = Object.freeze({speed:200,warningFor:2.3,slideFor:.85,slideSpeed:310,clearance:46,platformY:28});
export function createTerrain(){return {active:null,nextAt:6,nextKind:'passage',completed:0,spawned:0};}
const BASIC_ROUTE=Object.freeze({id:'basic',gapWidth:125,platformOffset:90,platformWidth:140,platformY:28,requiresDoubleJump:false});
const ADVANCED_ROUTE=Object.freeze({id:'double-jump',gapWidth:190,platformOffset:160,platformWidth:150,platformY:40,requiresDoubleJump:true});
export const terrainProfileFor=run=>movementProfileFor(run).maxAirJumps>0?ADVANCED_ROUTE:BASIC_ROUTE;
export function terrainReservationFor(run){const p=terrainProfileFor(run);return (run.player.x+31+TERRAIN.speed*TERRAIN.warningFor+Math.max(p.gapWidth,p.platformOffset+p.platformWidth))/TERRAIN.speed+.8;}
export function beginTerrain(run){
 const profile=terrainProfileFor(run),state=run.terrain,kind=state.nextKind,x=run.player.x+31+TERRAIN.speed*TERRAIN.warningFor;
 state.active={id:++state.spawned,kind,age:0,speed:TERRAIN.speed,warningFor:TERRAIN.warningFor,clearance:TERRAIN.clearance,requiresDoubleJump:kind==='gap-platform'&&profile.requiresDoubleJump,
  gaps:kind==='gap-platform'?[{x,width:profile.gapWidth}]:[],
  platforms:kind==='gap-platform'?[{x:x+profile.platformOffset,width:profile.platformWidth,y:profile.platformY}]:[],
  ceilings:kind==='passage'?[{x,width:110,bottom:TERRAIN.clearance,top:122}]:[]};
 state.nextKind=kind==='passage'?'gap-platform':'passage';return state.active;
}
export function translateTerrain(run,delta){const a=run.terrain?.active;if(a)for(const shapes of [a.gaps,a.platforms,a.ceilings])for(const s of shapes)s.x+=delta;}
export function terrainSupportAt(run,x,halfWidth=0){
 const a=run.terrain?.active;if(!a)return 0;
 const platform=a.platforms.find(s=>x+halfWidth>=s.x&&x-halfWidth<=s.x+s.width);if(platform)return platform.y;
 return a.gaps.some(s=>x-halfWidth>s.x&&x+halfWidth<s.x+s.width)?null:0;
}
export function advanceSlide(run,dt,allowed){
 const p=run.player,wants=allowed&&p.grounded!==false&&p.velocity===0&&p.crouchHeld&&p.moveHeld>0;
 if(!p.crouchHeld||p.moveHeld<=0)p.slideLatched=false;
 if(!wants){p.sliding=false;p.slideRemaining=0;return;}
 if(!p.sliding&&!p.slideLatched){p.sliding=true;p.slideLatched=true;p.slideRemaining=TERRAIN.slideFor;}
 if(p.sliding){p.slideRemaining=Math.max(0,p.slideRemaining-dt);if(p.slideRemaining<=1e-8)p.sliding=false;}
}
export function advanceTerrain(run,dt){
 const state=run.terrain,a=state?.active;if(!a)return;
 a.age+=dt;translateTerrain(run,-a.speed*dt);
 const last=Math.max(...a.gaps.concat(a.platforms,a.ceilings).map(s=>s.x+s.width));
 // Reserve the complete physical surface, including the final descent from a
 // raised support. Events cannot remove the ground during a committed jump.
 if(last<0&&run.player.grounded&&run.player.y===0){state.active=null;state.completed++;state.nextAt=run.elapsed+18;}
}
export function stepTerrainPlayer(run,dt){
 const p=run.player,a=run.terrain?.active,previous=p.y;
 p.velocity-=1750*dt;p.y+=p.velocity*dt;
 // Land as soon as any part of the physical foot interval crosses a top.
 // Center-only support lets a descending hero tunnel through platform edges.
 const support=terrainSupportAt(run,p.x+18,13);p.supportY=support;p.grounded=false;
 if(support!==null&&previous>=support-1e-8&&p.y<=support&&p.velocity<=0){p.y=support;p.velocity=0;p.grounded=true;}
 if(!p.grounded){p.crouching=false;p.sliding=false;}
 else {p.airJumpsUsed=0;p.crouching=!p.isJacare&&!!p.crouchHeld;}
 const left=p.x+5,right=p.x+31,body=p.sliding?32:p.crouching?42:84;
 if(a){
  if(a.ceilings.some(s=>right>s.x&&left<s.x+s.width&&p.y+body>s.bottom&&p.y<s.top))return {type:'terrain-ceiling',action:'crouch'};
  if(a.platforms.some(s=>right>s.x&&left<s.x+s.width&&p.y<s.y-1e-8&&p.y+body>0))return {type:'terrain-platform',action:'jump'};
 }
 if(p.y< -85)return {type:'terrain-gap',action:'jump'};
 return null;
}
export function recoverTerrain(run){
 const p=run.player;run.terrain.active=null;run.terrain.nextAt=run.elapsed+18;
 p.y=0;p.velocity=0;p.airJumpsUsed=0;p.grounded=true;p.supportY=0;p.sliding=false;p.slideRemaining=0;
}
