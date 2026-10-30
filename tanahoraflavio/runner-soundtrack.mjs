// Trilha original de perseguição, sintetizada localmente após o gesto inicial.
// Agendamento curto pelo frame do jogo: não existe relógio musical em segundo plano.
export function createGameSoundtrack(context){
 const bus=context.createGain();bus.gain.setValueAtTime(0,context.currentTime);bus.connect(context.destination);
 const live=new Set(),scale=[146.83,174.61,196,220,261.63,220,196,174.61];
 let running=false,nextBeat=0,beat=0;
 function note(frequency,t,length,wave,volume){
  const osc=context.createOscillator(),gain=context.createGain();
  osc.type=wave;osc.frequency.setValueAtTime(frequency,t);
  gain.gain.setValueAtTime(.001,t);gain.gain.linearRampToValueAtTime(volume,t+.012);
  gain.gain.exponentialRampToValueAtTime(.001,t+length);
  osc.connect(gain);gain.connect(bus);live.add(osc);osc.start(t);osc.stop(t+length+.02);
  osc.onended=()=>{live.delete(osc);osc.disconnect();gain.disconnect();};
 }
 const stop=()=>{
  running=false;bus.gain.setValueAtTime(0,context.currentTime);
  for(const osc of live){try{osc.stop();}catch{/* Nota já encerrada. */}}live.clear();
 };
 return {stop,update({active=true,pressure=0,boss=false,raid=false,ducked=false}={}){
  if(!active||context.state!=='running'){stop();return;}
  const now=context.currentTime,q=Math.max(0,Math.min(1,Number(pressure)||0));
  if(!running||nextBeat<now-.2){running=true;nextBeat=now;}
  bus.gain.setTargetAtTime(ducked ? .045 : .18,now,.045);
  const step=60/(100+28*q+(raid?24:boss?12:0))/2;
  // Um frame atrasado não tenta executar música perdida.
  for(let scheduled=0;nextBeat<now+.12&&scheduled<3;scheduled++,beat++,nextBeat+=step){
   const degree=(beat+(raid?2:0))%scale.length,root=raid?65.41:73.42;
   note(root*(beat%4===2?1.5:1),nextBeat,step*.8,'triangle',.28);
   if(beat%2===0||boss||raid)note(scale[degree]*(beat%16>=8?2:1),nextBeat,step*.65,'triangle',.18);
   note(beat%2===0?52:880,nextBeat,.035,beat%2===0?'sine':'square',beat%2===0 ? .28 : .035);
  }
 }};
}
