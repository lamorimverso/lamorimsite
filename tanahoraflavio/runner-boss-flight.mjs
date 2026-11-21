// Arcade sorties: patrol, dive, cross and return to formation. Only movement
// varies; the actor's announced weapon and committed projectile keep their lane.
function hash(value){value=Math.imul(value^(value>>>16),0x45d9f3b);return (value^(value>>>16))>>>0;}
export function bossFlightPose(boss,width,identity){
 const age=Math.max(0,Number(boss.age)||0),seed=Number(boss.flightSeed)||0;
 const actor=Array.from(boss.type||'').reduce((n,c)=>Math.imul(n,31)+c.charCodeAt(0),0)>>>0;
 const duration=8.2+(actor%4)*.3,t=Math.max(0,age-1.1),cycle=Math.floor(t/duration),u=t/duration-cycle;
 // A shuffled four-sortie bag prevents consecutive identical routes. All routes
 // join the same moving formation with zero added velocity at their endpoints.
 const variant=(cycle+(hash(seed^actor)%4))%4,direction=variant%2?-1:1;
 const envelope=Math.sin(Math.PI*u)**2,angle=u*Math.PI*2;
 const crossing=direction*82*Math.sin(angle)*Math.sin(Math.PI*u);
 const loop=(variant<2?0:direction*19*Math.sin(angle*2)*envelope);
 const patrol=Math.sin(t*identity.xRate+identity.offset)*10;
 const dive=(variant<2?36:44)*envelope;
 const rise=variant<2?Math.sin(angle)*7:Math.sin(angle*2)*6;
 const arrival=boss.phase==='intro'?Math.max(0,1-age/1.1)**3:0;
 // Reserve the right-hand stage for the enemy; the player now has room for
 // a full left/right slide on narrow screens without passing the muzzle.
 return {x:Math.max(width-132,Math.min(width-52,width-100+(patrol+crossing+loop)*.72))+arrival*155,
  platformY:65+Math.sin(t*identity.yRate+identity.offset)*4+dive+rise*envelope-arrival*20};
}
