// The human shrinks about the same foot anchor in art and collision. Terrain
// sees the full posture silhouette, while the threat hurtbox keeps its inset.
export const HURT_BODY_SCALE=.76;
export const HERO_MAX_HP=2;
export function playerBodyFor(p,{full=false}={}){
 if(p.isJacare&&!full)return {left:-15,right:51,height:25,terrainHeight:25,scale:1};
 const scale=!full&&p.hp===1?HURT_BODY_SCALE:1;
 return {left:18-13*scale,right:18+13*scale,
  height:(p.crouching||p.sliding?25:53)*scale,
  terrainHeight:(p.sliding?50:p.crouching?58:84)*scale,scale};
}
