// Som sintetizado localmente; sem gravação nem imitação da voz da pessoa retratada.
export function createGameAudio() {
 let enabled=true,context=null,utterance=null,nodes=[];
 const stop=()=>{
  for(const node of nodes){try{node.stop();}catch{/* Nó já encerrado. */}}nodes=[];
  if(utterance&&'speechSynthesis' in window){try{window.speechSynthesis.cancel();}catch{/* Legenda permanece. */}}
  utterance=null;
 };
 const prime=()=>{
  if(!enabled)return;
  try{const Audio=window.AudioContext||window.webkitAudioContext;if(Audio&&!context)context=new Audio();
   if(context?.state==='suspended')context.resume().catch(()=>{});
  }catch{context=null;}
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
 const speak=text=>{
  if(!enabled||!('speechSynthesis' in window)||!window.SpeechSynthesisUtterance)return;
  try{const voices=window.speechSynthesis.getVoices();
   const pt=voices.find(v=>/^pt[-_]BR$/i.test(v.lang)&&v.localService===true);
   if(!pt)return;
   utterance=new window.SpeechSynthesisUtterance(text);utterance.lang='pt-BR';utterance.rate=1.2;utterance.volume=.8;utterance.voice=pt;
   window.speechSynthesis.speak(utterance);
  }catch{utterance=null;}
 };
 return {get enabled(){return enabled;},prime,stop,
  toggle(){enabled=!enabled;if(!enabled)stop();else prime();return enabled;},
  event(phase,fact){stop();if(!enabled)return;if(phase==='warning')knocks();
   if(phase==='active')speak('Toc, toc, toc! É a Polícia Federal! '+fact.text);
  }};
}
