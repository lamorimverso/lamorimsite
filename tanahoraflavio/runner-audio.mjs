import {createVoiceSelector} from './runner-voice-selector.mjs?v=ad3200a88cd4';
import {getMovementSoundBank} from './runner-movement-audio.mjs?v=3b96b07ed6e3';
import {createGameSoundtrack} from './runner-soundtrack.mjs?v=eef47a2a323c';
import {getCastSoundBank} from './runner-cast-sounds.mjs?v=9638174cbd26';
import {getEnemyShotBank} from './runner-shot-sounds.mjs?v=fd84e4e83e32';
import {ARCHIVE_VOICES} from './runner-voice-data.mjs?v=d5e017561fd6';
// Efeitos locais e recorte de arquivo identificado; nenhuma imitação de voz.
export function createGameAudio({onVoice=()=>{},voiceSelector=createVoiceSelector()}={}) {
 let enabled=true,context=null,nodes=[],primed=false,recording=null,recordingName=null,raidVoice=false,raidPrepared=false,music=null,voicePriority=0,alertUntil=0;
 const raidLines=['joice','extra-joice-1','extra-joice-2','extra-joice-3'];let raidChoice=null;
 const shotVariants=new Map();let nextPresenceAt=0;const presencePlayed=new Map();
 const entranceNodes=new Map();let pendingEntrance=null;
 const cancelEntrance=()=>{
  pendingEntrance=null;
  for(const [node,release] of entranceNodes){try{node.stop();}catch{/* Nota já encerrada. */}release();}
 };
 const preferenceKey='tanahoraflavio.runner.sound.v1';
 try{enabled=window.localStorage?.getItem(preferenceKey)!=='off';}catch{/* Armazenamento é opcional. */}
 const stopRecording=()=>{
  if(recording){try{recording.pause();recording.currentTime=0;}catch{/* A mídia pode já ter sido liberada. */}}
  recording=null;recordingName=null;voicePriority=0;onVoice(null);
 };
 const stop=()=>{
  cancelEntrance();
  raidVoice=false;raidPrepared=false;raidChoice=null;alertUntil=0;
  stopRecording();music?.stop();
  for(const node of nodes){try{node.stop();}catch{/* Nó já encerrado. */}}nodes=[];
 };
 const prime=()=>{
  if(!enabled)return;
  primed=true;
  try{const Audio=window.AudioContext||window.webkitAudioContext;if(Audio&&!context){context=new Audio();music=createGameSoundtrack(context);}
   if(context?.state==='suspended')context.resume().catch(()=>{});
  }catch{context=null;}
 };
 const voice=(name,{priority=2,loop=false,replace=false,onFailure=()=>{}}={})=>{
  const clip=ARCHIVE_VOICES[name];
  if(!clip||!enabled||!primed||typeof window.Audio!=='function')return false;
  // Não cortar uma fala de prioridade igual com outra chegada no mesmo instante.
  if(recording&&(priority<voicePriority||priority===voicePriority&&!replace))return false;
  stopRecording();
  try{
   const url=new URL(clip.file,import.meta.url);url.searchParams.set('v',clip.sha256.slice(0,12));
   const player=new window.Audio(url.href);recording=player;recordingName=name;voicePriority=priority;player.volume=(context?.currentTime||0)<alertUntil?.28:.68;player.loop=loop===true;player.preload='none';
   onVoice(clip);player.onended=()=>{if(recording===player){recording=null;recordingName=null;voicePriority=0;onVoice(null);}};
   const failed=()=>{if(recording===player){stopRecording();raidVoice=false;onFailure();}};
   player.onerror=failed;player.play()?.catch?.(failed);
   return true;
  }catch{stopRecording();return false;}
 };
 const raidSpeech=()=>{
  if(!raidChoice||!voiceSelector.current(raidChoice))raidChoice=voiceSelector.select('joice',raidLines,{preferred:'joice'});
  const choice=raidChoice,accepted=voice(choice.clip,{priority:3,onFailure:()=>voiceSelector.rollback(choice)});
  if(accepted)voiceSelector.commit(choice);return accepted;
 };
 const knocks=()=>{
  if(!enabled||!context||context.state!=='running'||nodes.length+3>12)return;
  try{
   for(let i=0;i<3;i++){const oscillator=context.createOscillator(),gain=context.createGain(),t=context.currentTime+i*.28;
    oscillator.type='triangle';oscillator.frequency.setValueAtTime(95,t);oscillator.frequency.exponentialRampToValueAtTime(38,t+.09);
    gain.gain.setValueAtTime(.001,t);gain.gain.exponentialRampToValueAtTime(.16,t+.008);gain.gain.exponentialRampToValueAtTime(.001,t+.12);
    oscillator.connect(gain);gain.connect(context.destination);oscillator.start(t);oscillator.stop(t+.13);nodes.push(oscillator);
    oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();nodes=nodes.filter(n=>n!==oscillator);};
   }
  }catch{/* O evento também funciona sem som. */}
 };
 // Efeitos curtos e originais: gerados no navegador, sem arquivos musicais.
 // Tocar apenas após o gesto inicial, respeitando Som ligado/desligado.
 const effect=(name,{alert=true}={})=>{
  if(!enabled||!context||context.state!=='running')return;
  const sounds={
   jump:[420,660,.105,'sine',.065],
   attack:[240,115,.16,'sawtooth',.085],
   hit:[125,44,.24,'triangle',.12],
   pickup:[660,880,.1,'sine',.07],
   boss:[165,85,.25,'triangle',.105],
   victory:[440,780,.23,'sine',.085],
   stage:[380,550,.23,'triangle',.075],
   transform:[320,105,.36,'triangle',.105],
   restore:[260,690,.23,'sine',.08],
   high:[880,610,.13,'sine',.065],low:[150,100,.13,'triangle',.075],
   wind:[240,720,.23,'sine',.078],
   papers:[870,460,.13,'triangle',.068],
   metal:[1050,330,.17,'square',.058],
   magic:[480,940,.19,'sine',.072],
   rear:[980,360,.18,'triangle',.07],drop:[660,220,.22,'square',.075],ally:[700,1100,.14,'sine',.065]
  };
  const spec=sounds[name];if(!spec||nodes.length>=12)return;
  try{
   const [start,end,length,wave,volume]=spec,t=context.currentTime;
   if(alert&&['high','low','rear','drop','attack','boss','hit','wind','papers','metal','magic'].includes(name)){
    alertUntil=Math.max(alertUntil,t+length+.1);if(recording)recording.volume=.28;
   }
   const osc=context.createOscillator(),gain=context.createGain();
   osc.type=wave;osc.frequency.setValueAtTime(start,t);
   osc.frequency.exponentialRampToValueAtTime(end,t+length);
   gain.gain.setValueAtTime(.001,t);
   gain.gain.linearRampToValueAtTime(volume,t+.015);
   gain.gain.exponentialRampToValueAtTime(.001,t+length);
   osc.connect(gain);gain.connect(context.destination);osc.start(t);osc.stop(t+length+.015);
   nodes.push(osc);
   osc.onended=()=>{osc.disconnect();gain.disconnect();nodes=nodes.filter(n=>n!==osc);};
  }catch{/* Efeitos não podem interromper o jogo. */}
 };
 // Disparos do jogador são feedback da ação, nunca aviso de perigo inimigo.
 const heroShot=(name='magic')=>effect(name,{alert:false});
 // Executado pelo lançamento real do projétil, nunca pela aparição do ator.
 // Ciclo local por timbre: não altera nem consulta a aleatoriedade da corrida.
 const playBank=(bank,{alert=true,entrance=false}={})=>{
  if(!enabled||!primed||!context||context.state!=='running'||!bank)return false;
  const variant=shotVariants.get(bank.id)||0,notes=bank.variants[variant];
  // Reserva o padrão inteiro: não emite meia notificação ao esgotar os canais.
  if(nodes.length+notes.length>12)return false;
  const created=[],t=context.currentTime;
  try{
   for(const note of notes){
    const osc=context.createOscillator();let gain;
    const release=()=>{try{osc.disconnect();gain?.disconnect();}catch{/* Já desconectado. */}nodes=nodes.filter(n=>n!==osc);entranceNodes.delete(osc);};
    // Registrar antes de configurar garante limpeza também se a API falhar.
    created.push({osc,release});gain=context.createGain();
    const at=t+note.delay;
    osc.type=note.wave;osc.frequency.setValueAtTime(note.start,at);
    osc.frequency.exponentialRampToValueAtTime(note.end,at+note.length);
    gain.gain.setValueAtTime(.001,at);
    gain.gain.linearRampToValueAtTime(note.volume,at+note.attack);
    gain.gain.exponentialRampToValueAtTime(.001,at+note.length);
    osc.connect(gain);gain.connect(context.destination);osc.onended=release;
    nodes.push(osc);if(entrance)entranceNodes.set(osc,release);osc.start(at);osc.stop(at+note.length+.015);
   }
   shotVariants.set(bank.id,(variant+1)%bank.variants.length);
   if(alert){alertUntil=Math.max(alertUntil,t+Math.max(...notes.map(n=>n.delay+n.length))+.1);
    if(recording)recording.volume=.28;}
   return true;
  }catch{
   for(const {osc,release} of created){try{osc.stop();}catch{/* Início bloqueado. */}release();}
   return false;
  }
 };
 const enemyShot=(actor,weapon)=>{
  const bank=getEnemyShotBank(actor,weapon);if(!bank)return false;
  // O lançamento real tem precedência sobre o som de chegada, inclusive no
  // orçamento de canais. A chegada ainda pendente aguarda o fim desse aviso.
  for(const [node,release] of entranceNodes){try{node.stop();}catch{/* Já encerrado. */}release();}
  return playBank(bank);
 };
 const flushEntrance=()=>{
  if(!pendingEntrance)return;
  if(!enabled||!primed||!context||context.state!=='running'||context.currentTime>pendingEntrance.expires){pendingEntrance=null;return;}
  const {bank}=pendingEntrance,t=context.currentTime;
  const notes=bank.variants[shotVariants.get(bank.id)||0];
  if(t<alertUntil||nodes.length+notes.length>12)return;
  pendingEntrance.attempts++;
  if(playBank(bank,{alert:false,entrance:true})||pendingEntrance.attempts>=3)pendingEntrance=null;
 };
 const enemyEntrance=actor=>{
  cancelEntrance();
  const cast=getCastSoundBank(actor);
  if(!cast||!enabled||!primed||!context||context.state!=='running')return false;
  // Identidade original de cada personagem, mais clara que a presença discreta;
  // não é disparo nem substitui a gravação. Histórico separado das presenças.
  const bank={id:'entrance-'+cast.id,variants:cast.variants.map(notes=>notes.map(note=>({...note,volume:note.volume*2})))};
  pendingEntrance={bank,expires:context.currentTime+1.5,attempts:0};
  flushEntrance();return true;
 };
 const actorCue=actor=>{
  const bank=getCastSoundBank(actor),t=context?.currentTime||0;
  if(!bank||t<nextPresenceAt||t<(presencePlayed.get(bank.id)||0)||t<alertUntil||recording)return false;
  if(!playBank(bank,{alert:false}))return false;
  nextPresenceAt=t+1.2;presencePlayed.set(bank.id,t+7);return true;
 };
 // Não há sintetizador de voz: só trechos identificados e efeitos originais.
 // Ausência de clipe não é preenchida por uma voz inventada.
 return {get enabled(){return enabled;},prime,stop,effect,heroShot,enemyShot,enemyEntrance,actorCue,voice,voiceSelector,movement:name=>playBank(getMovementSoundBank(name),{alert:false}),
  background(state={}){
   if(state.active===false){stop();return;}
   if(!enabled||!primed)return;
   flushEntrance();
   const alert=(context?.currentTime||0)<alertUntil;
   if(recording)recording.volume=alert?.28:.68;
   music?.update({...state,ducked:!!recording||alert||entranceNodes.size>0});
  },
  toggle(){enabled=!enabled;try{window.localStorage?.setItem(preferenceKey,enabled?'on':'off');}catch{/* A escolha vale nesta sessão. */}if(!enabled)stop();else prime();return enabled;},
  event(phase,fact){
   if(!enabled)return;
   if(phase==='warning'){if(raidPrepared&&raidVoice)return;if(!raidPrepared)raidChoice=null;raidPrepared=true;stopRecording();raidVoice=raidSpeech();if(!raidVoice)knocks();}
   else if(phase==='active'){if(!raidVoice){if(!raidPrepared)raidChoice=null;raidPrepared=true;raidVoice=raidSpeech();if(!raidVoice)knocks();}}
   // Recovery mantém a frase final. Fim natural também permite terminar uma
   // reprodução que iniciou tarde; cancelamento/mute/foco/derrota chamam stop.
   else if(phase==='recovery')return;
   else if(phase==='end'){raidPrepared=false;raidVoice=false;if(recordingName!=='joice'&&ARCHIVE_VOICES[recordingName]?.actor!=='joice')stopRecording();}
   else {raidPrepared=false;raidVoice=false;stopRecording();}
  }};
}
