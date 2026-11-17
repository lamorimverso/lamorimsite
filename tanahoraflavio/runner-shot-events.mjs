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

// One anticipation per committed arena volley. The release tracker remains
// independent, so additional projectiles are not mistaken for new windups.
export function createEncounterSoundTracker(play){
 let announced=new WeakMap(),lastBlock=null;
 return {reset(run){announced=new WeakMap();lastBlock=run?.lastTraversalBlock;},update(run){
  const boss=run.boss;
  if(boss?.combat&&boss.phase==='charge'&&announced.get(boss)!==boss.patternIndex){
   announced.set(boss,boss.patternIndex);play('windup',boss.type);
  }
  const blocked=run.lastTraversalBlock;
  if(blocked&&blocked!==lastBlock){lastBlock=blocked;play('blocked',blocked.actor,blocked.type);}
 }};
}
