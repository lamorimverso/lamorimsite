import {combatGeometryFor} from './runner-combat-geometry.mjs?v=69851726fc55';
// Pure rig shared by rendering and regular projectile launch coordinates.
const CLASS_ALIASES={sentinela:'sentinel',artilheiro:'gunner',conjurador:'caster',soberano:'sovereign'};
const canonicalClass=value=>CLASS_ALIASES[value]||value||'sentinel';
function joint(x,y){return {x,y};}

/** Pure standing rig. Feet stay planted through breathing, charging and recoil. */
export function standingEnemyPose({phase=0,preparing=false,attacking=false,recovering=false,hurt=false,reducedMotion=false,classId='sentinel',action='jump',progress}={}){
 const t=reducedMotion?0:(Number.isFinite(phase)?phase:0),breath=reducedMotion?0:Math.sin(t*.32),kind=canonicalClass(classId);
 const state=hurt?'recoil':attacking?'release':preparing?'charge':recovering?'recover':'idle';
 const u=Math.max(0,Math.min(1,Number.isFinite(progress)?progress:reducedMotion?1:(1+Math.sin(t*.65))*.5));
 const ease=u*u*(3-2*u);
 const idle=kind==='sovereign'?[[-31,-57],[-38,-72],[32,-54],[40,-63]]:
  kind==='caster'?[[-27,-60],[-32,-74],[29,-48],[34,-57]]:
  kind==='gunner'?[[-28,-55],[-35,-51],[22,-48],[3,-49]]:[[-26,-48],[-23,-34],[26,-48],[23,-32]];
 // Low throw / high sweep / overhead summon: each describes its danger.
 const windups={jump:[[-24,-50],[-9,-63],[29,-54],[39,-64]],
  crouch:[[-25,-76],[-15,-94],[27,-70],[35,-88]],
  move:[[-30,-72],[-32,-98],[31,-72],[36,-99]]};
 const releases={jump:[[-39,-51],[-59,-44],[24,-58],[12,-65]],
  crouch:[[-39,-76],[-60,-83],[25,-70],[14,-83]],
  move:[[-33,-53],[-47,-36],[32,-53],[44,-36]]};
 const shape=(points,release=false)=>points.map(([x,y],i)=>{
  if(kind==='gunner')return [x+(i>1?-9:0),y+(i>1?-5:4)];
  if(kind==='caster')return [x+(i<2?-6:6),y-(i%2?9:5)];
  if(kind==='sovereign')return [x+(i<2?(release?-8:5):8),y+(i<2?-5:5)];
  return [x,y];
 });
 const charge=shape(windups[action]||windups.jump),release=shape(releases[action]||releases.jump,true);
 const mix=(a,b,k)=>a.map((v,i)=>[v[0]+(b[i][0]-v[0])*k,v[1]+(b[i][1]-v[1])*k]);
 let endpoints=idle,lean=breath*.8;
 if(state==='charge'){endpoints=mix(idle,charge,ease);lean=2+ease*3;}
 else if(state==='release'){
  // Fast extension, then follow-through. Every release remains a movement.
  const k=u<.4?u/.4:1-(u-.4)*.27;endpoints=mix(charge,release,k);lean=3-k*7;
 }else if(state==='recover'){endpoints=mix(release,idle,ease);lean=-4*(1-ease);}
 else if(state==='recoil'){endpoints=[[-22,-55],[-4,-64],[31,-49],[27,-31]];lean=5;}
 const bob=breath*.9-(state==='charge'?ease*1.5:0),shoulders=joint(lean,-63+bob),neck=joint(lean,-69+bob);
 const left={hip:joint(-9+lean*.25,-34+bob),knee:joint(-11+lean*.35,-17),foot:joint(-13,0)};
 const right={hip:joint(9+lean*.25,-34+bob),knee:joint(12+lean*.35,-17),foot:joint(15,0)};
 const arms={};for(const [i,side] of ['left','right'].entries()){
  const sign=i?1:-1,elbow=endpoints[i*2],hand=endpoints[i*2+1],sway=state==='idle'?breath*(i?-1.8:1.8):0;
  arms[side]={shoulder:joint(sign*17+lean,-61+bob),elbow:joint(elbow[0]+lean,elbow[1]+bob+sway),hand:joint(hand[0]+lean,hand[1]+bob+sway),open:state==='charge'||state==='release'||kind==='caster'||kind==='sovereign'};
 }
 return {state,bob,lean,neck,shoulders,left,right,arms,headTilt:state==='recoil'?.12:state==='release'?-.06:breath*.025,motor:reducedMotion?0:(1+Math.sin(t*1.8))*.5};
}


export function regularEmitterPose(type,width=900,ground=246){return {x:width-58,y:ground-134,scale:.92};}
export function regularCastPresentation(shot){
 const cast=shot?.cast;if(!cast)return {preparing:false,attacking:false,recovering:false,progress:0,action:'crouch',classId:'caster'};
 const age=cast.flightAge||0,pending=!shot.launched;
 return {preparing:pending,attacking:!pending&&age<.26,recovering:!pending&&age>=.26,
  progress:pending?Math.max(0,Math.min(1,1-shot.waitFor/cast.windupFor)):age<.26?age/.26:Math.min(1,(age-.26)/.5),action:shot.action,classId:'caster'};
}
export function regularCastMuzzle(type,width=900,ground=246,phase=0){
 const pose=regularEmitterPose(type,width,ground),hand=combatGeometryFor(type,{frame:2,scale:pose.scale})?.muzzle;
 if(!hand)return {x:pose.x-40*pose.scale,y:ground-pose.y+45*pose.scale};
 return {x:pose.x+hand.x,y:ground-pose.y-hand.y};
}

// Exit only during the final recovery: the projectile already committed its
// launch origin before the emitter leaves. Core lifetime remains unchanged.
export function regularEmitterExitPose(type,width=900,ground=246,remaining=1){
 const pose=regularEmitterPose(type,width,ground),exit=Math.max(0,Math.min(1,1-remaining/.3));
 return {...pose,x:pose.x+200*exit*exit};
}
