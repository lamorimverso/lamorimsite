import {heroActionHeights} from './runner-hero-actions-data.mjs?v=6cd4d142b6b6';
// The human shrinks about the same foot anchor in art and collision. Terrain
// sees the full posture silhouette, while the threat hurtbox keeps its inset.
export const HURT_BODY_SCALE=.76;
export const HERO_MAX_HP=2;
export const HERO_SLIDE_SECONDS=.85;
export const HERO_CROUCH_CLEARANCE=Math.ceil(Math.max(...[2,3,8,9].map(i=>heroActionHeights[i])))+1;
function slideClearance(p){
 const phase=Number.isFinite(p.slideRemaining)?Math.max(0,1-p.slideRemaining/HERO_SLIDE_SECONDS):.5;
 const frame=phase<.085?4:phase<.24?5:phase>=.9?7:6;
 const shot=p.attackFor>.09?Math.max(heroActionHeights[10],heroActionHeights[11]):0;
 return Math.ceil(Math.max(heroActionHeights[frame],shot))+1;
}
export function playerBodyFor(p,{full=false}={}){
 if(p.isJacare&&!full)return {left:-15,right:51,height:25,terrainHeight:25,scale:1};
 const scale=!full&&p.hp===1?HURT_BODY_SCALE:1;
 return {left:18-13*scale,right:18+13*scale,
  height:(p.crouching||p.sliding?25:53)*scale,
  terrainHeight:(p.sliding?slideClearance(p):p.crouching?HERO_CROUCH_CLEARANCE:84)*scale,scale};
}
