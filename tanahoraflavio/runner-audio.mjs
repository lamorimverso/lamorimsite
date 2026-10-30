import {createGameSoundtrack} from './runner-soundtrack.mjs?v=49d440710b77';
import {ARCHIVE_VOICES} from './runner-voice-data.mjs?v=e04644dd1f8f';
// Efeitos locais e recorte de arquivo identificado; nenhuma imitação de voz.
export function createGameAudio({onVoice=()=>{}}={}) {
 let enabled=true,context=null,utterance=null,nodes=[],primed=false,recording=null,raidVoice=false,music=null,voicePriority=0;
 const preferenceKey='tanahoraflavio.runner.sound.v1';
 try{enabled=window.localStorage?.getItem(preferenceKey)!=='off';}catch{/* Armazenamento é opcional. */}
 const stopRecording=()=>{
  if(recording){try{recording.pause();recording.currentTime=0;}catch{/* A mídia pode já ter sido liberada. */}}
  recording=null;voicePriority=0;onVoice(null);
 };
 const stop=()=>{
  raidVoice=false;
  stopRecording();music?.stop();
  for(const node of nodes){try{node.stop();}catch{/* Nó já encerrado. */}}nodes=[];
  if(utterance&&'speechSynthesis' in window){try{window.speechSynthesis.cancel();}catch{/* Legenda permanece. */}}
  utterance=null;
 };
 const prime=()=>{
  if(!enabled)return;
  primed=true;
  try{const Audio=window.AudioContext||window.webkitAudioContext;if(Audio&&!context){context=new Audio();music=createGameSoundtrack(context);}
   if(context?.state==='suspended')context.resume().catch(()=>{});
  }catch{context=null;}
 };
 const voice=(name,{priority=2}={})=>{
  const clip=ARCHIVE_VOICES[name];
  if(!clip||!enabled||!primed||typeof window.Audio!=='function')return false;
  if(recording&&priority<voicePriority)return false;
  stopRecording();
  try{
   const url=new URL(clip.file,import.meta.url);url.searchParams.set('v',clip.sha256.slice(0,12));
   const player=new window.Audio(url.href);recording=player;voicePriority=priority;player.volume=.68;player.preload='none';
   onVoice(clip);player.onended=()=>{if(recording===player){recording=null;voicePriority=0;onVoice(null);}};
   player.play()?.catch?.(()=>{if(recording===player)stopRecording();});
   return true;
  }catch{stopRecording();return false;}
 };
 const knocks=()=>{
  if(!enabled||!context)return;
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
   high:[880,610,.13,'sine',.065],low:[150,100,.13,'triangle',.075]
  };
  const spec=sounds[name];if(!spec||nodes.length>=12)return;
  try{
   const [start,end,length,wave,volume]=spec,t=context.currentTime;
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
 const speak=text=>{
  if(!enabled||!('speechSynthesis' in window)||!window.SpeechSynthesisUtterance)return;
  try{const voices=window.speechSynthesis.getVoices();
   const pt=voices.find(v=>/^pt[-_]BR$/i.test(v.lang)&&v.localService===true);
   if(!pt)return;
   utterance=new window.SpeechSynthesisUtterance(text);utterance.lang='pt-BR';utterance.rate=1.2;utterance.volume=.8;utterance.voice=pt;
   window.speechSynthesis.speak(utterance);
  }catch{utterance=null;}
 };
 return {get enabled(){return enabled;},prime,stop,effect,voice,
  background(state){if(enabled&&primed)music?.update({...state,ducked:!!recording});},
  toggle(){enabled=!enabled;try{window.localStorage?.setItem(preferenceKey,enabled?'on':'off');}catch{/* A escolha vale nesta sessão. */}if(!enabled)stop();else prime();return enabled;},
  event(phase,fact){
   if(!enabled)return;
   if(phase==='warning'){stopRecording();raidVoice=voice('joice',{priority:3});if(!raidVoice)knocks();}
   else if(phase==='active'){if(!raidVoice){stopRecording();speak('Toc, toc, toc! É a Polícia Federal! '+(fact?.text||''));}}
   else stopRecording();
  }};
}
