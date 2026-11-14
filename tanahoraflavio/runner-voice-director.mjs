import {createVoiceSelector} from './runner-voice-selector.mjs?v=ad3200a88cd4';
import {ARCHIVE_VOICES} from './runner-voice-data.mjs?v=d5e017561fd6';
// Diretor de falas: cada meme é reservado somente ao personagem/evento correspondente.
// Nunca narra a partida em voz artificial, nem atribui áudio de uma pessoa a outra.
export const MEME_SCENES=Object.freeze({
 janones:Object.freeze(['pessoal-urgente','explode-video']),
 lula:Object.freeze(['bora-pra-rua','picanha','mesmo-mundo','ate-teu-pai','defende-meu-pai','passarinho']),
 dino:Object.freeze(['meme-dino-vingadores','meme-dino-capitao-america']),
 xandao:Object.freeze(['meme-xandao-liberdade-agressao','meme-xandao-democracia-anarquia']),
 dilma:Object.freeze(['meme-dilma-meta-aberta','meme-dilma-dobrar-meta']),
 soraya:Object.freeze(['meme-soraya-festa-junina']),
 joice:Object.freeze(['joice','extra-joice-1','extra-joice-2','extra-joice-3']),
 'ze-gotinha':Object.freeze(['cade-ze-gotinha'])
});
export function createVoiceDirector({play,random=Math.random,selector=createVoiceSelector({random})}){
 let pending=null,lastId='',lastPlayed=new Map(),nextGlobalAt=0,lastAttempt=null,activeBoss=null;
 function queue(actor,priority,run,kind,introduction=false){
  const ids=MEME_SCENES[actor]||[];
  if(!ids.length||run.raid)return;
  const next=lastPlayed.get(actor)||0;
  if(!introduction&&run.elapsed<next)return;
  const candidate={actor,ids,priority,expires:run.elapsed+(kind==='boss'?7:4),kind,boss:run.boss,failures:0,introduction};
  if(!pending||priority>pending.priority||priority===pending.priority)pending=candidate;
 }
 return {
  reset(){pending=null;lastId='';lastPlayed=new Map();nextGlobalAt=0;lastAttempt=null;activeBoss=null;},
  event(kind,run,actor){
   if(run.status!=='running')return;
   if(kind==='boss'&&run.boss){
    const introduction=activeBoss!==run.boss;
    // A nova cena substitui a fila e invalida erros tardios, mesmo quando o
    // personagem novo não tem bordão identificado no catálogo.
    if(introduction){pending=null;lastAttempt=null;activeBoss=run.boss;}
    queue(run.boss.type,2,run,'boss',introduction);
   }
   else if(kind==='actor'&&!run.boss)queue(actor,1,run,'actor');
   else if(kind==='ally')queue(actor||'ze-gotinha',1,run,'ally');
   // Início, escudo, vitórias e metas têm efeitos musicais próprios.
   // Não sorteiam falas de personagens que não estão na cena.
  },
  update(run,{safe=false}={}){
   if(activeBoss&&run.boss!==activeBoss){activeBoss=null;lastAttempt=null;}
   if(run.status!=='running'||run.raid)return;
   if(!pending&&(MEME_SCENES[run.boss?.type]?.length||0)>1&&run.boss===activeBoss&&run.boss&&lastPlayed.has(run.boss.type)&&run.elapsed>=lastPlayed.get(run.boss.type))queue(run.boss.type,2,run,'boss');
   if(!pending)return;
   if(run.elapsed>pending.expires){pending=null;return;}
   if(pending.kind==='boss'&&pending.boss!==run.boss){pending=null;return;}
   if(pending.kind==='actor'&&run.boss){pending=null;return;}
   // A chamada aguardará o perigo imediato em vez de sobrepor áudio ao aviso.
   if(!safe||!pending.introduction&&run.elapsed<nextGlobalAt)return;
   const candidate=pending;
   if(!candidate.selection||!selector.current(candidate.selection))candidate.selection=selector.select(candidate.actor,candidate.ids);
   const selection=candidate.selection,clip=selection.clip;
   const attempt={lastId,nextGlobalAt,previous:lastPlayed.get(candidate.actor)};
   const onFailure=()=>{
    // Uma rejeição tardia não pode restaurar cena/sessão já substituída.
    if(lastAttempt!==attempt||run.status!=='running'||run.raid||run.elapsed>candidate.expires||candidate.boss!==run.boss)return;
    lastAttempt=null;lastId=attempt.lastId;nextGlobalAt=attempt.nextGlobalAt;
    selector.rollback(selection);
    if(attempt.previous===undefined)lastPlayed.delete(candidate.actor);
    else lastPlayed.set(candidate.actor,attempt.previous);
    // Uma repetição por evento, ainda sujeita à validade e à cena no update.
    if(candidate.failures<1&&(!pending||candidate.priority>pending.priority))pending={...candidate,failures:candidate.failures+1};
   };
   // Só a entrada de um novo chefe substitui a fala de mesma prioridade da
   // cena anterior; vozes prioritárias da perseguição continuam protegidas.
   if(!play(clip,{priority:candidate.priority,replace:candidate.introduction,onFailure}))return;
   lastAttempt=attempt;
   lastId=clip;selector.commit(selection);
   lastPlayed.set(pending.actor,run.elapsed+(pending.kind==='boss'?14:9));
   nextGlobalAt=run.elapsed+Math.max(2.5,(ARCHIVE_VOICES[clip]?.durationSeconds||0)+.3);
   pending=null;
  }
 };
}
