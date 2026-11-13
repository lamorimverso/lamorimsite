import {combatGeometryFor} from './runner-combat-geometry.mjs?v=69851726fc55';
// Essential action timing shared by the hero renderer and physical launch.
export const HERO_SHOT_DURATION=.22;
export function heroShotPose({age=0,crouching=false,airborne=false,facing=1}={}){
 const t=Math.max(0,Math.min(HERO_SHOT_DURATION,Number(age)||0));
 const state=t<.065?'release':t<.13?'recoil':'recover';
 const kick=state==='release'?Math.sin(t/.065*Math.PI)*3.5:state==='recoil'?3.5*(1-(t-.065)/.065):0;
 const settle=state==='recover'?Math.min(1,(t-.13)/.09):0;
 const height=crouching?18:38;
 return {state,kick,settle,facing:facing<0?-1:1,waist:crouching?-13:-28,
  neck:{x:-9-kick*.4,y:crouching?-26:-49},headSize:crouching?23:40,
  shoulder:{x:-8-kick*.4,y:crouching?-26:-44},
  elbow:{x:1-kick-settle*8,y:-height+1+settle*6},
  hand:{x:10-kick-settle*12,y:-height+settle*9},
  muzzle:combatGeometryFor(crouching?'flavio-slide-shot':airborne?'flavio-air-shot':'flavio',{frame:2,scale:.95,facing}).muzzle};
}
