// Original nonverbal movement Foley. A whole pattern is played once per physical transition.
const note=(delay,start,end,length,wave,volume=.04)=>({delay,start,end,length,wave,volume,attack:.006});
const specs={
 jump:[160,730,.14,'sine',.055],land:[120,48,.11,'triangle',.065],
 'run-start':[180,360,.075,'triangle',.045],'run-back':[310,140,.09,'triangle',.04],
 brake:[700,120,.13,'sawtooth',.025],slide:[1550,280,.22,'sawtooth',.028],
 'slide-stop':[400,850,.09,'triangle',.03],'slide-drag':[1100,430,.10,'sawtooth',.018]
};
const banks=Object.fromEntries(Object.entries(specs).map(([id,[start,end,length,wave,volume]])=>[id,{id:'movement-'+id,variants:Array.from({length:3},(_,i)=>[
 note(0,start*(1+i*.07),end*(1-i*.045),length*(1+i*.06),wave,volume),
 note(length*.45,start*.43*(1+i*.06),end*.55,length*.45,'sine',volume*.38)
])}]));
export const getMovementSoundBank=id=>banks[id]||null;
export function createMovementSoundDirector({play}){
 let previous=null,lastStart=0,nextDrag=0;
 const snapshot=r=>({x:r.player.x,y:r.player.y,airborne:r.player.y>0||r.player.velocity>0,crouching:r.player.crouching,jacare:r.player.isJacare,moving:false,time:r.elapsed});
 return {
  reset(run){previous=run?snapshot(run):null;lastStart=0;nextDrag=0;},
  update(run,{bufferedTakeoff=false}={}){
   if(run.status!=='running'){previous=null;return;}
   const current=snapshot(run),p=run.player;
   if(!previous||p.isJacare||previous.jacare){previous=current;return;}
   if(bufferedTakeoff||!previous.airborne&&current.airborne)play('jump');
   if(previous.airborne&&!current.airborne)play('land');
   if(!previous.crouching&&p.crouching&&!current.airborne){play('slide');nextDrag=run.elapsed+.35;}
   else if(previous.crouching&&!p.crouching&&!current.airborne)play('slide-stop');
   const dx=p.x-previous.x,moving=Math.abs(dx)>.03&&p.moveHeld!==0;
   if(moving&&!current.airborne&&!p.crouching&&!previous.moving){play(dx>0?'run-start':'run-back');lastStart=run.elapsed;}
   if(!moving&&previous.moving&&!current.airborne&&!p.crouching&&run.elapsed-lastStart>=.1)play('brake');
   if(moving&&p.crouching&&run.elapsed>=nextDrag){play('slide-drag');nextDrag=run.elapsed+.35;}
   previous={...current,moving};
  }
 };
}
