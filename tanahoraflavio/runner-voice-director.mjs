// O sorteio escolhe uma fala pertinente; a janela de silêncio protege as decisões.
const groups={start:['bora-pra-rua','pessoal-urgente'],shield:['defende-meu-pai','mesmo-mundo'],
 janones:['pessoal-urgente'],ally:['cade-ze-gotinha','passarinho'],milestone:['picanha','explode-video'],victory:['ate-teu-pai','picanha'],
 ambient:['passarinho','mesmo-mundo','explode-video']};
export function createVoiceDirector({play,random=Math.random}){
 let nextAt=0,lastId='',pending=null;
 const select=ids=>{const choices=ids.filter(id=>id!==lastId);const pool=choices.length?choices:ids;return pool[Math.min(pool.length-1,Math.floor(Math.max(0,Number(random())||0)*pool.length))];};
 const emit=(ids,priority,elapsed)=>{
  const id=select(ids),played=play(id,{priority});
  nextAt=elapsed+14+Math.max(0,Math.min(1,Number(random())||0))*8;
  if(played)lastId=id;
  return played;
 };
 return {
  reset(){nextAt=0;lastId='';pending=null;},
  event(kind,run){
   if(run.status!=='running')return;
   const bossVoices={haddad:['haddad'],lula:['ate-teu-pai'],xandao:['pessoal-urgente']};
   const ids=kind==='boss'?bossVoices[run.boss?.type]:groups[kind];if(!ids)return;
   const priority=kind==='boss'||kind==='victory'?2:1;
   if(kind==='start'){emit(ids,priority,run.elapsed);return;}
   if(!pending||priority>=pending.priority)pending={ids,priority,boss:kind==='boss',expires:run.elapsed+10};
  },
  update(run,{safe=false}={}){
   if(run.status!=='running'||run.raid)return;
   if(pending&&run.elapsed>pending.expires)pending=null;
   if(run.elapsed<nextAt||!safe)return;
   if(run.boss&&!pending?.boss)return;
   const selected=pending||{ids:groups.ambient,priority:1};pending=null;
   emit(selected.ids,selected.priority,run.elapsed);
  }
 };
}
