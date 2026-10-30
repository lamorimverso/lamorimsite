// O sorteio escolhe uma fala pertinente; a janela de silêncio protege as decisões.
const groups={start:['bora-pra-rua','pessoal-urgente'],shield:['defende-meu-pai','mesmo-mundo'],
 janones:['pessoal-urgente'],ally:['cade-ze-gotinha','passarinho'],milestone:['picanha','explode-video'],victory:['ate-teu-pai','picanha'],
 ambient:['passarinho','mesmo-mundo','explode-video']};
// Só há falas atribuídas quando já existe arquivo de áudio no catálogo.
const actorClips={janones:['pessoal-urgente','explode-video'],lula:['bora-pra-rua','picanha'],haddad:['haddad']};
export function createVoiceDirector({play,random=Math.random}){
 let nextAt=0,lastId='',pending=null,actorPending=null,nextActorAt=0;
 const select=ids=>{const choices=ids.filter(id=>id!==lastId);const pool=choices.length?choices:ids;return pool[Math.min(pool.length-1,Math.floor(Math.max(0,Number(random())||0)*pool.length))];};
 const emit=(ids,priority,elapsed)=>{
  const id=select(ids),played=play(id,{priority});
  nextAt=elapsed+14+Math.max(0,Math.min(1,Number(random())||0))*8;
  if(played)lastId=id;
  return played;
 };
 return {
  reset(){nextAt=0;lastId='';pending=null;actorPending=null;nextActorAt=0;},
  event(kind,run,actor){
   if(run.status!=='running')return;
   if(kind==='actor'){
    // O personagem é anunciado perto da entrada, não após desaparecer da pista.
    const ids=actorClips[actor];
    if(ids&&!run.raid&&!run.boss&&run.elapsed>=nextActorAt)
     actorPending={ids,expires:run.elapsed+3};
    return;
   }
   const bossVoices={haddad:['haddad'],lula:['ate-teu-pai'],xandao:['pessoal-urgente']};
   const ids=kind==='boss'?bossVoices[run.boss?.type]:groups[kind];if(!ids)return;
   const priority=kind==='boss'||kind==='victory'?2:1;
   if(kind==='start'){emit(ids,priority,run.elapsed);return;}
   if(!pending||priority>=pending.priority)pending={ids,priority,boss:kind==='boss',expires:run.elapsed+10};
  },
  update(run,{safe=false}={}){
   if(run.status!=='running'||run.raid)return;
   if(pending&&run.elapsed>pending.expires)pending=null;
   if(actorPending&&run.elapsed>actorPending.expires)actorPending=null;
   if(!safe)return;
   if(actorPending&&!run.boss&&run.elapsed>=nextActorAt){
    const id=select(actorPending.ids);
    if(play(id,{priority:1})){
     lastId=id;nextActorAt=run.elapsed+7;
     nextAt=Math.max(nextAt,run.elapsed+5);
     actorPending=null;
    }
    return;
   }
   if(run.elapsed<nextAt)return;
   if(run.boss&&!pending?.boss)return;
   const selected=pending||{ids:groups.ambient,priority:1};pending=null;
   emit(selected.ids,selected.priority,run.elapsed);
  }
 };
}
