// Per-game shared history for boss, cameo and raid speech channels.
export function createVoiceSelector({random=Math.random}={}){
 const actors=new Map();
 const stateFor=actor=>actors.get(actor)||{remaining:[],last:null,revision:0};
 return {
  select(actor,ids,{preferred}={}){
   const previous=stateFor(actor),existing=previous.remaining.filter(id=>ids.includes(id)),remaining=existing.length?existing:[...ids];
   const available=remaining.length>1?remaining.filter(id=>id!==previous.last):remaining,pool=available.length?available:remaining;
   const r=Math.max(0,Math.min(.999999,Number(random())||0));
   const clip=previous.last===null&&preferred&&pool.includes(preferred)?preferred:pool[Math.floor(r*pool.length)];
   return {actor,clip,remaining:remaining.filter(id=>id!==clip),previous,revision:previous.revision};
  },
  current(selection){return stateFor(selection.actor).revision===selection.revision;},
  commit(selection){
   if(!this.current(selection))return false;
   selection.committed=selection.revision+1;actors.set(selection.actor,{remaining:selection.remaining,last:selection.clip,revision:selection.committed});return true;
  },
  rollback(selection){
   if(stateFor(selection.actor).revision!==selection.committed)return;
   actors.set(selection.actor,{...selection.previous,revision:selection.committed+1});
  }
 };
}
