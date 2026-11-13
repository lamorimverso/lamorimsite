import {createGameSoundtrack} from './runner-soundtrack.mjs?v=eef47a2a323c';
import {getEnemyShotBank} from './runner-shot-sounds.mjs?v=e2aab7660085';
import {ARCHIVE_VOICES} from './runner-voice-data.mjs?v=fa9433a61a03';
// Efeitos locais e recorte de arquivo identificado; nenhuma imitação de voz.
export function createGameAudio({onVoice=()=>{}}={}) {
 let enabled=true,context=null,nodes=[],primed=false,recording=null,recordingName=null,raidVoice=false,raidPrepared=false,music=null,voicePriority=0,alertUntil=0;
 const shotVariants=new Map();
 const preferenceKey='tanahoraflavio.runner.sound.v1';
 try{enabled=window.localStorage?.getItem(preferenceKey)!=='off';}catch{/* Armazenamento é opcional. */}
 const stopRecording=()=>{
  if(recording){try{recording.pause();recording.currentTime=0;}catch{/* A mídia pode já ter sido liberada. */}}
  recording=null;recordingName=null;voicePriority=0;onVoice(null);
 };
 const stop=()=>{
  raidVoice=false;raidPrepared=false;alertUntil=0;
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
 const voice=(name,{priority=2,loop=false}={})=>{
  const clip=ARCHIVE_VOICES[name];
  if(!clip||!enabled||!primed||typeof window.Audio!=='function')return false;
  // Não cortar uma fala de prioridade igual com outra chegada no mesmo instante.
  if(recording&&priority<=voicePriority)return false;
  stopRecording();
  try{
   const url=new URL(clip.file,import.meta.url);url.searchParams.set('v',clip.sha256.slice(0,12));
   const player=new window.Audio(url.href);recording=player;recordingName=name;voicePriority=priority;player.volume=(context?.currentTime||0)<alertUntil?.28:.68;player.loop=loop===true;player.preload='none';
   onVoice(clip);player.onended=()=>{if(recording===player){recording=null;recordingName=null;voicePriority=0;onVoice(null);}};
   const failed=()=>{if(recording===player){stopRecording();raidVoice=false;}};
   player.onerror=failed;player.play()?.catch?.(failed);
   return true;
  }catch{stopRecording();return false;}
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
 const effect=name=>{
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
   drop:[660,220,.22,'square',.075],ally:[700,1100,.14,'sine',.065]
  };
  const spec=sounds[name];if(!spec||nodes.length>=12)return;
  try{
   const [start,end,length,wave,volume]=spec,t=context.currentTime;
   if(['high','low','drop','attack','boss','hit','wind','papers','metal','magic'].includes(name)){
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
 // Executado pelo lançamento real do projétil, nunca pela aparição do ator.
 // Ciclo local por timbre: não altera nem consulta a aleatoriedade da corrida.
 const enemyShot=(actor,weapon)=>{
  if(!enabled||!primed||!context||context.state!=='running')return false;
  const bank=getEnemyShotBank(actor,weapon);if(!bank)return false;
  const variant=shotVariants.get(bank.id)||0,notes=bank.variants[variant];
  // Reserva o padrão inteiro: não emite meia notificação ao esgotar os canais.
  if(nodes.length+notes.length>12)return false;
  const created=[],t=context.currentTime;
  try{
   for(const note of notes){
    const osc=context.createOscillator();let gain;
    const release=()=>{try{osc.disconnect();gain?.disconnect();}catch{/* Já desconectado. */}nodes=nodes.filter(n=>n!==osc);};
    // Registrar antes de configurar garante limpeza também se a API falhar.
    created.push({osc,release});gain=context.createGain();
    const at=t+note.delay;
    osc.type=note.wave;osc.frequency.setValueAtTime(note.start,at);
    osc.frequency.exponentialRampToValueAtTime(note.end,at+note.length);
    gain.gain.setValueAtTime(.001,at);
    gain.gain.linearRampToValueAtTime(note.volume,at+note.attack);
    gain.gain.exponentialRampToValueAtTime(.001,at+note.length);
    osc.connect(gain);gain.connect(context.destination);osc.onended=release;
    nodes.push(osc);osc.start(at);osc.stop(at+note.length+.015);
   }
   shotVariants.set(bank.id,(variant+1)%bank.variants.length);
   alertUntil=Math.max(alertUntil,t+Math.max(...notes.map(n=>n.delay+n.length))+.1);
   if(recording)recording.volume=.28;
   return true;
  }catch{
   for(const {osc,release} of created){try{osc.stop();}catch{/* Início bloqueado. */}release();}
   return false;
  }
 };
 // Não há sintetizador de voz: só trechos identificados e efeitos originais.
 // Ausência de clipe não é preenchida por uma voz inventada.
 return {get enabled(){return enabled;},prime,stop,effect,enemyShot,voice,
  background(state={}){
   if(state.active===false){stop();return;}
   if(!enabled||!primed)return;
   const alert=(context?.currentTime||0)<alertUntil;
   if(recording)recording.volume=alert?.28:.68;
   music?.update({...state,ducked:!!recording||alert});
  },
  toggle(){enabled=!enabled;try{window.localStorage?.setItem(preferenceKey,enabled?'on':'off');}catch{/* A escolha vale nesta sessão. */}if(!enabled)stop();else prime();return enabled;},
  event(phase,fact){
   if(!enabled)return;
   if(phase==='warning'){if(raidPrepared&&raidVoice)return;raidPrepared=true;stopRecording();raidVoice=voice('joice',{priority:3});if(!raidVoice)knocks();}
   else if(phase==='active'){if(!raidVoice){raidPrepared=true;raidVoice=voice('joice',{priority:3});if(!raidVoice)knocks();}}
   // Recovery mantém a frase final. Fim natural também permite terminar uma
   // reprodução que iniciou tarde; cancelamento/mute/foco/derrota chamam stop.
   else if(phase==='recovery')return;
   else if(phase==='end'){raidPrepared=false;raidVoice=false;if(recordingName!=='joice')stopRecording();}
   else {raidPrepared=false;raidVoice=false;stopRecording();}
  }};
}
