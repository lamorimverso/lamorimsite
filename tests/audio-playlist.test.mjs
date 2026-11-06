import test from 'node:test';
import assert from 'node:assert/strict';
import * as soundtrack from '../tanahoraflavio/runner-soundtrack.mjs';

// Three identifiers exercise the shuffle mechanism only; they are not game assets.
const examples=[{id:'fixture-a'},{id:'fixture-b'},{id:'fixture-c'}];
test('sorteio consome todas as opções uma vez e impede repetição na fronteira de sacolas',()=>{
 assert.equal(typeof soundtrack.createTrackShuffle,'function');
 for(const random of [()=>0,()=>.5,()=>.999999]){
  const shuffle=soundtrack.createTrackShuffle(examples,{random});
  const draws=Array.from({length:60},()=>shuffle.next().id);
  for(let i=0;i<draws.length;i+=3)assert.deepEqual(new Set(draws.slice(i,i+3)),new Set(['fixture-a','fixture-b','fixture-c']));
  assert.ok(draws.every((id,i)=>!i||id!==draws[i-1]));
 }
});
test('catálogo executável contém somente a trilha localizada; títulos pendentes não viram músicas falsas',()=>{
 assert.ok(Array.isArray(soundtrack.SOUNDTRACK_CATALOG));
 const available=soundtrack.SOUNDTRACK_CATALOG.filter(t=>t.available);
 assert.deepEqual(available.map(t=>t.id),['solinho-fora-pt']);
 assert.deepEqual(soundtrack.SOUNDTRACK_CATALOG.filter(t=>!t.available).map(t=>t.id),['tan-na-hora-do-jair','tariflavio']);
 for(const track of available)assert.ok(track.phrase.length>0);
 for(const track of soundtrack.SOUNDTRACK_CATALOG.filter(t=>!t.available))assert.equal(track.phrase,undefined);
 const shuffle=soundtrack.createTrackShuffle(available,{random:()=>.4});
 assert.equal(shuffle.next().id,'solinho-fora-pt');assert.equal(shuffle.next().id,'solinho-fora-pt');
 assert.equal(soundtrack.createTrackShuffle([]).next(),null);
});

function clockContext(){
 const notes=[],buses=[],param=()=>({value:0,targets:[],setValueAtTime(v){this.value=v;},linearRampToValueAtTime(v){this.value=v;},exponentialRampToValueAtTime(v){this.value=v;},setTargetAtTime(v,t){this.value=v;this.targets.push({v,t});},cancelScheduledValues(){}});
 return {notes,buses,currentTime:0,state:'running',destination:{},
  createGain(){const gain={gain:param(),connect(to){this.to=to;},disconnect(){}};buses.push(gain);return gain;},
  createOscillator(){return {type:'sine',frequency:param(),connect(){},disconnect(){},start(t){this.startedAt=t;notes.push(this);},stop(t){this.stoppedAt=t;}};}};
}
// Test-only one-note scores distinguish scheduling. They are not shipped music.
const scores=examples.map((track,i)=>({...track,available:true,bpm:120,steps:4,phrase:[[69+i*2+12,4]],roots:[38]}));
test('sequenciador integra a sacola, sem sobreposição e com um único bus até após várias trocas',()=>{
 const c=clockContext(),music=soundtrack.createGameSoundtrack(c,{tracks:scores,cyclesPerTrack:1,random:()=>.999999});
 for(let i=0;i<360;i++){c.currentTime=i/100;music.update({active:true});}
 const lead=c.notes.filter(n=>n.type==='square'&&n.frequency.value<1000&&n.frequency.value>250);
 assert.ok(new Set(lead.map(n=>Math.round(n.frequency.value))).size===3,'os três scores de teste devem ser agendados');
 assert.deepEqual(lead.slice(0,6).map(n=>Math.round(n.frequency.value)),[440,494,554,440,494,554]);
 assert.ok(lead.every((n,i)=>!i||lead[i-1].stoppedAt<=n.startedAt),'a fonte anterior termina antes da seguinte');
 assert.equal(c.buses.filter(b=>b.to===c.destination).length,1,'uma única saída de música');
 assert.ok(c.buses[0].gain.targets.some(e=>e.v<.15),'volume diminui na transição');
});
test('inatividade e relógio suspenso param a trilha sem agendar backlog na retomada',()=>{
 const c=clockContext(),music=soundtrack.createGameSoundtrack(c,{tracks:scores,cyclesPerTrack:1,random:()=>.999999});
 music.update({active:true});const before=c.notes.length;
 c.state='suspended';c.currentTime=10;music.update({active:true});assert.equal(c.notes.length,before);assert.equal(c.buses[0].gain.value,0);
 c.state='running';c.currentTime=100;music.update({active:true});assert.ok(c.notes.length-before<12);
 music.update({active:false});assert.equal(c.buses[0].gain.value,0);
});
