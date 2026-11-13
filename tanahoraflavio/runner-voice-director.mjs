import {createVoiceSelector} from './runner-voice-selector.mjs?v=ad3200a88cd4';
import {EXTRA_ARCHIVE_SCENES} from './runner-extra-voices.mjs?v=dcb3792d1a76';
import {ARCHIVE_VOICES} from './runner-voice-data.mjs?v=e89d6a84511d';
import {ARCHIVE_SCENES} from './runner-archive-voices.mjs?v=7c025577c1cc';
// Diretor de falas: cada meme é reservado somente ao personagem/evento correspondente.
// Nunca narra a partida em voz artificial, nem atribui áudio de uma pessoa a outra.
export const MEME_SCENES=Object.freeze({
 janones:Object.freeze(['pessoal-urgente','explode-video']),
 lula:Object.freeze(['bora-pra-rua','picanha','mesmo-mundo','ate-teu-pai','defende-meu-pai','passarinho']),
 haddad:Object.freeze(['haddad']),
 'ze-gotinha':Object.freeze(['cade-ze-gotinha'])
});
const BOSS_ARCHIVE_SCENES=Object.freeze({joice:Object.freeze(['joice'])});
export function createVoiceDirector({play,random=Math.random,selector=createVoiceSelector({random})}){
 let pending=null,lastId='',lastPlayed=new Map(),nextGlobalAt=0,lastAttempt=null,activeBoss=null;
 function queue(actor,priority,run,kind){
  const ids=[...new Set([...(MEME_SCENES[actor]||[]),...(ARCHIVE_SCENES[actor]||[]),...(BOSS_ARCHIVE_SCENES[actor]||[]),...(EXTRA_ARCHIVE_SCENES[actor]||[])])];
  if(!ids.length||run.raid)return;
  const next=lastPlayed.get(actor)||0;
  if(run.elapsed<next)return;
  const candidate={actor,ids,priority,expires:run.elapsed+(kind==='boss'?7:4),kind,boss:run.boss,failures:0};
  if(!pending||priority>pending.priority||priority===pending.priority)pending=candidate;
 }
 return {
  reset(){pending=null;lastId='';lastPlayed=new Map();nextGlobalAt=0;lastAttempt=null;activeBoss=null;},
  event(kind,run,actor){
   if(run.status!=='running')return;
   if(kind==='boss'&&run.boss){activeBoss=run.boss;queue(run.boss.type,2,run,'boss');}
   else if(kind==='actor'&&!run.boss)queue(actor,1,run,'actor');
   else if(kind==='ally')queue(actor||'ze-gotinha',1,run,'ally');
   // Início, escudo, vitórias e metas têm efeitos musicais próprios.
   // Não sorteiam falas de personagens que não estão na cena.
  },
  update(run,{safe=false}={}){
   if(run.status!=='running'||run.raid)return;
   if(!pending&&run.boss===activeBoss&&run.boss&&lastPlayed.has(run.boss.type)&&run.elapsed>=lastPlayed.get(run.boss.type))queue(run.boss.type,2,run,'boss');
   if(!pending)return;
   if(run.elapsed>pending.expires){pending=null;return;}
   if(pending.kind==='boss'&&pending.boss!==run.boss){pending=null;return;}
   if(pending.kind==='actor'&&run.boss){pending=null;return;}
   // A chamada aguardará o perigo imediato em vez de sobrepor áudio ao aviso.
   if(!safe||run.elapsed<nextGlobalAt)return;
   const candidate=pending;
   if(!candidate.selection||!selector.current(candidate.selection))candidate.selection=selector.select(candidate.actor,candidate.ids);
   const selection=candidate.selection,clip=selection.clip;
   const attempt={lastId,nextGlobalAt,previous:lastPlayed.get(candidate.actor)};
   const onFailure=()=>{
    // Uma rejeição tardia não pode restaurar cena/sessão já substituída.
    if(lastAttempt!==attempt)return;
    lastAttempt=null;lastId=attempt.lastId;nextGlobalAt=attempt.nextGlobalAt;
    selector.rollback(selection);
    if(attempt.previous===undefined)lastPlayed.delete(candidate.actor);
    else lastPlayed.set(candidate.actor,attempt.previous);
    // Uma repetição por evento, ainda sujeita à validade e à cena no update.
    if(candidate.failures<1&&(!pending||candidate.priority>pending.priority))pending={...candidate,failures:candidate.failures+1};
   };
   if(!play(clip,{priority:candidate.priority,onFailure}))return;
   lastAttempt=attempt;
   lastId=clip;selector.commit(selection);
   lastPlayed.set(pending.actor,run.elapsed+(pending.kind==='boss'?14:9));
   nextGlobalAt=run.elapsed+Math.max(2.5,(ARCHIVE_VOICES[clip]?.durationSeconds||0)+.3);
   pending=null;
  }
 };
}
