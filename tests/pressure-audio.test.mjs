import test from 'node:test';
import assert from 'node:assert/strict';
import {createGameAudio} from '../tanahoraflavio/runner-audio.mjs';
const moduleAt=name=>new URL('../tanahoraflavio/'+name,import.meta.url);
function soundContext(){
 const notes=[],gains=[];
 const param=()=>({value:0,setValueAtTime(v){this.value=v;},linearRampToValueAtTime(v){this.value=v;},exponentialRampToValueAtTime(v){this.value=v;},setTargetAtTime(v){this.value=v;},cancelScheduledValues(){}});
 return {notes,gains,currentTime:0,state:'running',destination:{},resume:()=>Promise.resolve(),
  createGain(){const node={gain:param(),connect(){},disconnect(){}};gains.push(node);return node;},
  createOscillator(){const node={frequency:param(),type:'sine',connect(){},disconnect(){},start(t){notes.push({t,node:this});},stop(){this.stopped=true;}};return node;}};
}
test('trilha gera música contínua, abaixa sob fala e para sem acumular notas na retomada',async()=>{
 const module=await import(moduleAt('runner-soundtrack.mjs'));
 const ctx=soundContext(),music=module.createGameSoundtrack(ctx);
 music.update({active:true,pressure:0});const initial=ctx.notes.length;assert.ok(initial>0);
 for(let i=1;i<60;i++){ctx.currentTime=i*.1;music.update({active:true,pressure:.5});}
 assert.ok(ctx.notes.length>initial+20,'música continua sem novas coletas');
 const gain=ctx.gains[0].gain.value;music.update({active:true,pressure:.5,ducked:true});assert.ok(ctx.gains[0].gain.value<gain);
 music.stop();assert.equal(ctx.gains[0].gain.value,0);assert.ok(ctx.notes.every(n=>n.node.stopped));
 const before=ctx.notes.length;ctx.currentTime=600;music.update({active:true,raid:true,pressure:1});assert.ok(ctx.notes.length-before<12,'nenhuma rajada de notas atrasadas');
});
test('diretor escolhe falas contextuais, respeita silêncio, perigo e fim da partida',async()=>{
 const {createVoiceDirector}=await import(moduleAt('runner-voice-director.mjs')),played=[];
 const d=createVoiceDirector({play:(id,options)=>{played.push({id,options});return true;},random:()=>0});
 const r={status:'running',elapsed:0,boss:null,raid:null};d.event('start',r);assert.equal(played.length,1);const first=played[0].id;
 for(let t=1;t<14;t++){r.elapsed=t;d.update(r,{safe:true});}assert.equal(played.length,1);
 r.elapsed=20;d.event('shield',r);d.update(r,{safe:false});assert.equal(played.length,1,'evita distrair numa janela crítica');
 d.update(r,{safe:true});assert.ok(['defende-meu-pai','mesmo-mundo'].includes(played.at(-1).id));
 r.elapsed=50;r.raid={phase:'active'};d.update(r,{safe:true});assert.equal(played.length,2);
 r.raid=null;r.elapsed=75;d.update(r,{safe:true});assert.equal(played.length,3);assert.notEqual(played.at(-1).id,first);
 r.status='over';r.elapsed=150;d.update(r,{safe:true});assert.equal(played.length,3);
 d.reset();r.status='running';r.elapsed=0;d.event('start',r);assert.equal(played.length,4);
});
test('reprodução integra trilha após gesto e respeita prioridade, mute e parada',()=>{
 const previous=globalThis.window,ctx=soundContext(),tracks=[],captions=[];
 globalThis.window={AudioContext:class{constructor(){return ctx;}},Audio:class{constructor(src){this.src=src;tracks.push(this);}play(){return Promise.resolve();}pause(){this.paused=true;}}};
 try{
  const a=createGameAudio({onVoice:clip=>captions.push(clip)});assert.equal(typeof a.background,'function');
  a.background({active:true});assert.equal(ctx.notes.length,0);a.prime();a.background({active:true});assert.ok(ctx.notes.length>0);
  assert.equal(a.voice('joice',{priority:3}),true);assert.equal(a.voice('haddad',{priority:1}),false);assert.equal(tracks.length,1);
  assert.equal(captions.at(-1).speaker,'Joice Hasselmann');tracks[0].onended();assert.equal(captions.at(-1),null);
  a.voice('haddad');a.toggle();assert.ok(tracks.at(-1).paused);assert.equal(ctx.gains[0].gain.value,0);
  const count=ctx.notes.length;ctx.currentTime=3;a.background({active:true});assert.equal(ctx.notes.length,count);a.toggle();a.background({active:true});assert.ok(ctx.notes.length>count);a.stop();
 }finally{if(previous===undefined)delete globalThis.window;else globalThis.window=previous;}
});

test('trecho de Joice permanece em loop durante a raid e para na recuperação e no mute',()=>{
 const previous=globalThis.window,ctx=soundContext(),tracks=[];
 globalThis.window={AudioContext:class{constructor(){return ctx;}},Audio:class{
  constructor(src){this.src=src;this.loop=false;this.paused=false;tracks.push(this);}
  play(){return Promise.resolve();}
  pause(){this.paused=true;}
 }};
 try{
  const a=createGameAudio();a.prime();a.event('warning');
  assert.equal(tracks.length,1);assert.equal(tracks[0].loop,true,'raid mantém gravação de Joice até sua fase final');
  a.event('active');assert.equal(tracks.length,1,'fase ativa não empilha a mesma voz');
  assert.equal(tracks[0].paused,false);
  a.stop();assert.equal(tracks[0].paused,true,'perda de foco interrompe o trecho');
  a.event('active');assert.equal(tracks.length,2,'retomar a aba durante raid reinicia arquivo original');
  assert.equal(tracks[1].loop,true);
  a.event('recovery');assert.equal(tracks[1].paused,true,'recuperação interrompe reprodução');

  a.event('warning');assert.equal(tracks.length,3);assert.equal(tracks[2].loop,true);
  a.toggle();assert.equal(tracks[2].paused,true,'mute interrompe loop imediatamente');
  a.event('active');assert.equal(tracks.length,3,'mute impede novas gravações');
 }finally{if(previous===undefined)delete globalThis.window;else globalThis.window=previous;}
});
