import test from 'node:test';
import assert from 'node:assert/strict';
import {createGameAudio} from '../tanahoraflavio/runner-audio.mjs';

// Web Audio is a browser boundary: capture the actual synthesis schedule emitted
// by createGameAudio, including envelopes, frequency changes and resource release.
function browserAudio(){
 const oscillators=[],gains=[],tracks=[];
 const param=()=>({value:0,events:[],setValueAtTime(value,time){this.value=value;this.events.push(['set',value,time]);},
  linearRampToValueAtTime(value,time){this.value=value;this.events.push(['linear',value,time]);},
  exponentialRampToValueAtTime(value,time){this.value=value;this.events.push(['exponential',value,time]);},
  setTargetAtTime(value,time,constant){this.value=value;this.events.push(['target',value,time,constant]);},cancelScheduledValues(){}});
 const context={currentTime:10,state:'running',destination:{},resume:()=>Promise.resolve(),
  createGain(){const node={gain:param(),connect(){},disconnect(){this.disconnected=true;}};gains.push(node);return node;},
  createOscillator(){const node={type:'sine',frequency:param(),connect(gain){this.gain=gain;},disconnect(){this.disconnected=true;},
   start(time){this.startAt=time;},stop(time){this.stopAt=time;this.stopped=true;}};oscillators.push(node);return node;}};
 const window={AudioContext:class{constructor(){return context;}},Audio:class{
  constructor(src){this.src=src;tracks.push(this);}play(){return Promise.resolve();}pause(){this.paused=true;}}};
 return {window,context,oscillators,gains,tracks,finish(){for(const node of oscillators.filter(n=>!n.disconnected))node.onended?.();}};
}
function withAudio(fn){const old=globalThis.window,fixture=browserAudio();globalThis.window=fixture.window;
 try{fn(createGameAudio(),fixture);}finally{if(old===undefined)delete globalThis.window;else globalThis.window=old;}}
function capture(audio,fixture,actor,weapon){const from=fixture.oscillators.length;assert.equal(audio.enemyShot(actor,weapon),true);
 const notes=fixture.oscillators.slice(from);assert.ok(notes.length>0&&notes.length<=3);
 const signature=JSON.stringify(notes.map(n=>[n.type,n.startAt,n.stopAt,n.frequency.events,n.gain.gain.events]));fixture.finish();return signature;}
const shooters=[['dilma','wind'],['simone','budget-sheets'],['soraya','parachute-cross'],['janones','message'],['lula','lhand'],
 ['haddad','receipts'],['haddad','stamp'],['xandao','hammer'],['xandao','mandado'],['pf','barrier'],['pf','handcuffs'],
 ['joice','handcuffs'],['joice','microphone'],['bossonari','cloroquina-prop'],['bossonari','ivermectina-prop'],
 ['meme-army','meme-ghost'],['dino','falling-case'],['boulos','rolling-case']];
for(const [actor,weapon] of shooters)test(`${actor}/${weapon} possui três disparos distintos sem repetição adjacente`,()=>withAudio((audio,fixture)=>{
 assert.equal(typeof audio.enemyShot,'function');audio.prime();
 const signatures=Array.from({length:7},()=>capture(audio,fixture,actor,weapon));
 assert.equal(new Set(signatures.slice(0,3)).size,3);
 for(let i=1;i<signatures.length;i++)assert.notEqual(signatures[i],signatures[i-1]);
 assert.equal(signatures[0],signatures[3]);assert.equal(signatures[1],signatures[4]);
}));
test('atores e armas conservam identidades sonoras próprias e não consomem o RNG do jogo',()=>withAudio((audio,fixture)=>{
 audio.prime();const random=Math.random;Math.random=()=>{throw Error('gameplay RNG consumed');};
 try{const signatures=shooters.map(([actor,weapon])=>capture(audio,fixture,{type:actor},{attackType:weapon}));
  assert.equal(new Set(signatures).size,shooters.length);
 }finally{Math.random=random;}
}));
test('gesto inicial, mute, contexto suspenso e ator desconhecido impedem disparos',()=>withAudio((audio,fixture)=>{
 assert.equal(typeof audio.enemyShot,'function');assert.equal(audio.enemyShot('dilma','wind'),false);audio.prime();
 fixture.context.state='suspended';assert.equal(audio.enemyShot('dilma','wind'),false);fixture.context.state='running';
 assert.equal(audio.enemyShot('inexistente','wind'),false);audio.toggle();assert.equal(audio.enemyShot('dilma','wind'),false);
 assert.equal(fixture.oscillators.length,0);audio.toggle();capture(audio,fixture,'dilma','wind');
}));
test('rajadas compartilham limite de nós com effect e stop cancela notas futuras',()=>withAudio((audio,fixture)=>{
 audio.prime();for(let i=0;i<30;i++)audio.enemyShot('janones','message');audio.effect('hit');
 assert.ok(fixture.oscillators.length<=12);assert.ok(fixture.oscillators.length>=9);
 assert.ok(fixture.oscillators.some(n=>n.startAt>fixture.context.currentTime),'padrões agendados incluem notas futuras');
 const count=fixture.oscillators.length;assert.equal(audio.enemyShot('janones','message'),false);audio.stop();
 assert.ok(fixture.oscillators.every(n=>n.stopped&&n.stopAt===undefined),'stop substitui todos os encerramentos futuros');
 fixture.finish();capture(audio,fixture,'janones','message');assert.ok(fixture.oscillators.length>count);
}));
test('fim de nota libera orçamento e conexões; desativar estado corta todos os disparos',()=>withAudio((audio,fixture)=>{
 audio.prime();for(let i=0;i<20;i++){capture(audio,fixture,'soraya','parachute-cross');}
 assert.ok(fixture.oscillators.every(n=>n.disconnected&&n.gain.disconnected));
 audio.enemyShot('lula','lhand');const current=fixture.oscillators.filter(n=>!n.disconnected);audio.background({active:false});
 assert.ok(current.every(n=>n.stopAt===undefined));
}));
test('disparo reduz música e gravação sem substituir a voz prioritária',()=>withAudio((audio,fixture)=>{
 audio.prime();assert.equal(audio.voice('joice',{priority:3}),true);const clip=fixture.tracks[0];
 audio.enemyShot('xandao','hammer');assert.equal(clip.volume,.28);assert.equal(clip.paused,undefined);
 assert.equal(audio.voice('haddad',{priority:1}),false);audio.background({active:true});
 assert.ok(fixture.gains[0].gain.value<.1,'trilha abaixada sob gravação/disparo');
 fixture.context.currentTime+=1;audio.background({active:true});assert.equal(clip.volume,.68);
 audio.toggle();assert.equal(clip.paused,true);assert.ok(fixture.oscillators.every(n=>n.stopped));
}));
test('falha parcial da API limpa todos os nós e permite repetir o mesmo padrão',()=>withAudio((audio,fixture)=>{
 audio.prime();const makeGain=fixture.context.createGain;let gains=0;
 fixture.context.createGain=()=>{if(++gains===2)throw new Error('resource unavailable');return makeGain();};
 assert.equal(audio.enemyShot('janones','message'),false);
 assert.ok(fixture.oscillators.every(n=>n.stopped&&n.disconnected));
 assert.ok(fixture.gains.slice(1).every(n=>n.disconnected));fixture.context.createGain=makeGain;
 assert.equal(audio.enemyShot('janones','message'),true);
 const notes=fixture.oscillators.slice(2);assert.equal(notes.length,3);assert.equal(notes[0].frequency.events[0][1],880,'tentativa falha não avança o ciclo');
}));
test('batidas de fallback da Joice respeitam o mesmo orçamento máximo dos disparos',()=>withAudio((audio,fixture)=>{
 delete fixture.window.Audio;audio.prime();for(let i=0;i<12;i++)audio.effect('hit');
 audio.event('warning');assert.equal(fixture.oscillators.length,12);audio.stop();fixture.finish();
 audio.event('active');assert.equal(fixture.oscillators.length,15,'batidas voltam após liberar o orçamento');
}));
