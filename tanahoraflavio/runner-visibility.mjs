// Complete artwork can extend beyond its physical collider. Retain a small
// offscreen margin; never use the player's position as a despawn boundary.
export const THREAT_EXIT_MARGIN=128;
export function retainMovingThreat(item,viewportWidth){
 return item.speed<0?item.x<viewportWidth+THREAT_EXIT_MARGIN:item.x+(item.width||0)>-THREAT_EXIT_MARGIN;
}
