// Recriação instrumental chiptune do solo de "Solinho do Fora PT" (Prismah).
// Referência/créditos em assets/audio/README.md. Sem voz ou samples da gravação.
const BPM=123,STEP=60/BPM/4,CYCLE=64;
// Contorno do solo, transposto uma oitava para o lead quadrado. Duração em semicolcheias.
const phrase=[
 [81,2],[76,1],[77,1],[79,2],[77,1],[76,1],
 [74,3],[77,1],[81,2],[79,1],[77,1],[76,3],[77,1],[79,2],[81,2],
 [77,2],[81,2],[74,4],[82,3],[84,1],[86,2],[84,1],[82,1],
 [81,3],[77,1],[81,2],[79,1],[77,1],[76,3],[77,1],[79,2],[81,2],
 [84,2],[81,2],[74,4]
];
const melody=new Map();let cursor=0;
for(const [midi,length] of phrase){melody.set(cursor,{midi:midi-12,length});cursor+=length;}
const frequency=midi=>440*2**((midi-69)/12);
// Agendamento curto pelo frame do jogo: não há relógio musical em segundo plano.
export function createGameSoundtrack(context){
 const bus=context.createGain();bus.gain.setValueAtTime(0,context.currentTime);bus.connect(context.destination);
 const live=new Set();let running=false,nextBeat=0,beat=0;
 function note(hz,t,length,wave,volume,end=hz){
  const osc=context.createOscillator(),gain=context.createGain();
  osc.type=wave;osc.frequency.setValueAtTime(hz,t);
  if(end!==hz)osc.frequency.exponentialRampToValueAtTime(end,t+length);
  gain.gain.setValueAtTime(.001,t);gain.gain.linearRampToValueAtTime(volume,t+.006);
  gain.gain.exponentialRampToValueAtTime(.001,t+length);
  osc.connect(gain);gain.connect(bus);live.add(osc);osc.start(t);osc.stop(t+length+.015);
  osc.onended=()=>{live.delete(osc);osc.disconnect();gain.disconnect();};
 }
 const stop=()=>{
  running=false;bus.gain.setValueAtTime(0,context.currentTime);
  for(const osc of live){try{osc.stop();}catch{/* Nota já encerrada. */}}live.clear();
 };
 return {stop,update({active=true,pressure=0,boss=false,raid=false,ducked=false}={}){
  if(!active||context.state!=='running'){stop();return;}
  const now=context.currentTime,q=Math.max(0,Math.min(1,Number(pressure)||0));
  if(!running){running=true;nextBeat=now;beat=0;}
  else if(nextBeat<now-.2)nextBeat=now;
  bus.gain.setTargetAtTime(ducked ? .045 : .18,now,.045);
  // O andamento não muda nos encontros: varia só a percussão de apoio.
  // Um frame atrasado não tenta executar música perdida.
  for(let scheduled=0;nextBeat<now+.12&&scheduled<3;scheduled++,beat++,nextBeat+=STEP){
   const position=beat%CYCLE,sixteenth=position%16,lead=melody.get(position);
   if(lead)note(frequency(lead.midi),nextBeat,lead.length*STEP*.9,'square',.14);
   const root=[38,38,46,45][Math.floor(position/16)];
   if([0,3,6,8,11,14].includes(sixteenth)){
    note(frequency(root+(sixteenth===6?12:sixteenth===14?7:0)),nextBeat,STEP*.8,'triangle',.30);
    note(96,nextBeat,.085,'triangle',.26,37);
   }
   if([4,12].includes(sixteenth))note(3200,nextBeat,.045,'square',.05,2100);
   if(sixteenth%2===0)note(4400,nextBeat,.018,'square',.018);
   if([7,15].includes(sixteenth))note(2200,nextBeat,.028,'square',.032,1400);
   if((boss||raid||q>.65)&&[2,10].includes(sixteenth))note(180,nextBeat,.065,'triangle',raid ? .12 : .08,110);
  }
 }};
}
