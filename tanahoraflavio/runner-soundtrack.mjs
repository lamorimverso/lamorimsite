// Recriação instrumental chiptune do solo de "Solinho do Fora PT" (Prismah).
// Referência/créditos em assets/audio/README.md. Sem voz ou samples da gravação.
const BPM=123,CYCLE=64;
// Contorno do solo, transposto uma oitava para o lead quadrado. Duração em semicolcheias.
const phrase=[
 [81,2],[76,1],[77,1],[79,2],[77,1],[76,1],
 [74,3],[77,1],[81,2],[79,1],[77,1],[76,3],[77,1],[79,2],[81,2],
 [77,2],[81,2],[74,4],[82,3],[84,1],[86,2],[84,1],[82,1],
 [81,3],[77,1],[81,2],[79,1],[77,1],[76,3],[77,1],[79,2],[81,2],
 [84,2],[81,2],[74,4]
];
// Só a primeira opção possui arranjo no repositório. As demais permanecem
// indisponíveis até receber referência, arranjo e autorização verificáveis.
export const SOUNDTRACK_CATALOG=Object.freeze([
 Object.freeze({id:'solinho-fora-pt',title:'Solinho do Fora PT',available:true,bpm:BPM,steps:CYCLE,phrase:Object.freeze(phrase.map(n=>Object.freeze(n))),roots:Object.freeze([38,38,46,45]),licenseStatus:'authorization-not-documented',source:'https://music.apple.com/us/album/solinho-do-fora-pt-single/6817769503'}),
 Object.freeze({id:'tan-na-hora-do-jair',title:'Tá na hora do Jair já ir embora',requestedTitle:'Tan na Hora do Jair',available:false,referenceStatus:'candidate',source:'https://www.youtube.com/watch?v=gilUNUWcCc0',reason:'Referência exata do pedido, arranjo e autorização de uso pendentes.'}),
 Object.freeze({id:'tariflavio',title:'Tariflávio',available:false,reason:'Referência exata, arranjo e autorização de uso pendentes.'})
]);
export function createTrackShuffle(tracks,{random=Math.random}={}){
 const unique=[...new Map(tracks.map(track=>[track.id,track])).values()];
 let bag=[],last=null;
 return {next(){
  if(!bag.length){
   bag=unique.slice();
   for(let i=bag.length-1;i>0;i--){const j=Math.min(i,Math.max(0,Math.floor(random()*(i+1))));[bag[i],bag[j]]=[bag[j],bag[i]];}
   if(bag.length>1&&bag[0].id===last)[bag[0],bag[1]]=[bag[1],bag[0]];
  }
  const track=bag.shift()||null;if(track)last=track.id;return track;
 }};
}
const frequency=midi=>440*2**((midi-69)/12);
// Agendamento curto pelo frame do jogo: não há relógio musical em segundo plano.
export function createGameSoundtrack(context,{tracks=SOUNDTRACK_CATALOG,cyclesPerTrack=4,random=Math.random}={}){
 const bus=context.createGain();bus.gain.setValueAtTime(0,context.currentTime);bus.connect(context.destination);
 const available=tracks.filter(track=>track.available&&track.phrase?.length&&track.bpm>0&&track.steps>0);
 const shuffle=createTrackShuffle(available,{random}),cycles=Math.max(1,Math.floor(cyclesPerTrack)||1);
 const live=new Set();let running=false,nextBeat=0,beat=0,track=null,melody=new Map(),step=0,trackStart=0,trackEnd=Infinity;
 function select(t){
  const selected=shuffle.next();if(!selected)return false;
  track=selected;step=60/track.bpm/4;beat=0;trackStart=t;trackEnd=available.length>1?t+track.steps*step*cycles:Infinity;
  melody=new Map();let cursor=0;
  for(const [midi,length] of track.phrase){melody.set(cursor,{midi:midi-12,length});cursor+=length;}
  return true;
 }
 function note(hz,t,length,wave,volume,end=hz){
  length=Math.min(length,trackEnd-t-.016);if(length<=.006)return;
  const osc=context.createOscillator(),gain=context.createGain();
  osc.type=wave;osc.frequency.setValueAtTime(hz,t);
  if(end!==hz)osc.frequency.exponentialRampToValueAtTime(end,t+length);
  gain.gain.setValueAtTime(.001,t);gain.gain.linearRampToValueAtTime(volume,t+.006);
  gain.gain.exponentialRampToValueAtTime(.001,t+length);
  osc.connect(gain);gain.connect(bus);live.add(osc);osc.start(t);osc.stop(t+length+.015);
  osc.onended=()=>{live.delete(osc);osc.disconnect();gain.disconnect();};
 }
 const stop=()=>{
  running=false;bus.gain.cancelScheduledValues?.(context.currentTime);bus.gain.setValueAtTime(0,context.currentTime);
  for(const osc of live){try{osc.stop();}catch{/* Nota já encerrada. */}}live.clear();
 };
 return {stop,update({active=true,pressure=0,boss=false,raid=false,ducked=false}={}){
  if(!active||context.state!=='running'){stop();return;}
  const now=context.currentTime,q=Math.max(0,Math.min(1,Number(pressure)||0));
  if(!running){if(!select(now))return;running=true;nextBeat=now;}
  else if(nextBeat<now-.2){nextBeat=now;trackStart=now-beat*step;trackEnd=available.length>1?now+(track.steps*cycles-beat)*step:Infinity;}
  const transition=available.length>1?Math.max(0,Math.min(1,(now-trackStart)/.10,(trackEnd-now)/.10)):1;
  bus.gain.setTargetAtTime((ducked ? .045 : .18)*transition,now,.025);
  // O andamento não muda nos encontros: varia só a percussão de apoio.
  // Um frame atrasado não tenta executar música perdida.
  for(let scheduled=0;nextBeat<now+.12&&scheduled<3;scheduled++,beat++,nextBeat+=step){
   if(beat>=track.steps*cycles&&available.length>1)select(nextBeat);
   const position=beat%track.steps,sixteenth=position%16,lead=melody.get(position);
   if(lead)note(frequency(lead.midi),nextBeat,lead.length*step*.9,'square',.14);
   const root=track.roots?.[Math.floor(position/16)%track.roots.length]??38;
   if([0,3,6,8,11,14].includes(sixteenth)){
    note(frequency(root+(sixteenth===6?12:sixteenth===14?7:0)),nextBeat,step*.8,'triangle',.30);
    note(96,nextBeat,.085,'triangle',.26,37);
   }
   if([4,12].includes(sixteenth))note(3200,nextBeat,.045,'square',.05,2100);
   if(sixteenth%2===0)note(4400,nextBeat,.018,'square',.018);
   if([7,15].includes(sixteenth))note(2200,nextBeat,.028,'square',.032,1400);
   if((boss||raid||q>.65)&&[2,10].includes(sixteenth))note(180,nextBeat,.065,'triangle',raid ? .12 : .08,110);
  }
 }};
}
