// Each physical projectile sounds once, at release, independently of render FPS.
export function createShotSoundTracker(play){
 let heard=new WeakSet();
 return {reset(){heard=new WeakSet();},update(obstacles=[],fallbackActor){
  for(const shot of obstacles){
   const released=shot.projectile?shot.launched:shot.falling&&shot.age>=shot.warningFor;
   const actor=shot.sourceActor||shot.owner||fallbackActor;
   if(!released||heard.has(shot))continue;
   heard.add(shot);play(actor,shot.type,shot);
  }
 }};
}
