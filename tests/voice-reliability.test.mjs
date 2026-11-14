import test from 'node:test';
import assert from 'node:assert/strict';
import {createVoiceDirector} from '../tanahoraflavio/runner-voice-director.mjs';
import {createGameAudio} from '../tanahoraflavio/runner-audio.mjs';

const bossRun=()=>({status:'running',elapsed:1,raid:null,boss:{type:'lula'}});
for(const replacement of [null,{type:'lula'},{type:'haddad'}]){
 test('fala pendente não sobrevive à saída/substituição do chefão: '+JSON.stringify(replacement),()=>{
  const played=[],d=createVoiceDirector({play:id=>(played.push(id),true)}),run=bossRun();
  d.event('boss',run);d.update(run,{safe:false});run.boss=replacement;run.elapsed=2;
  d.update(run,{safe:true});assert.deepEqual(played,[]);
 });
}
test('chefão Joice usa o recorte de arquivo existente',()=>{
 const played=[],d=createVoiceDirector({random:()=>0,play:(id,options)=>(played.push({id,priority:options.priority}),true)}),run=bossRun();
 run.boss.type='joice';d.event('boss',run);d.update(run,{safe:true});
 assert.deepEqual(played,[{id:'joice',priority:2}]);
});

async function withAudio(fn){
 const previous=globalThis.window,tracks=[];
 globalThis.window={Audio:class{
  constructor(src){this.src=src;this.currentTime=0;tracks.push(this);}
  play(){return new Promise((resolve,reject)=>{this.resolve=resolve;this.reject=reject;});}
  pause(){this.paused=true;}
 }};
 const audio=createGameAudio();audio.prime();
 const d=createVoiceDirector({play:(id,options)=>audio.voice(id,options),random:()=>0});
 try{await fn({audio,d,tracks,run:bossRun()});}finally{audio.stop();if(previous===undefined)delete globalThis.window;else globalThis.window=previous;}
}
test('falha assíncrona permite uma repetição e sucesso preserva cooldown',()=>withAudio(async({d,tracks,run})=>{
 d.event('boss',run);d.update(run,{safe:true});tracks[0].reject(new Error('load failed'));await Promise.resolve();
 run.elapsed=1.5;d.update(run,{safe:true});assert.equal(tracks.length,2);
 tracks[1].resolve();await Promise.resolve();tracks[1].onended();
 run.elapsed=3;d.event('boss',run);d.update(run,{safe:true});assert.equal(tracks.length,2,'sucesso mantém cooldown');
}));
test('erro persistente não tenta a cada frame nem consome cooldown de sucesso',()=>withAudio(async({d,tracks,run})=>{
 d.event('boss',run);d.update(run,{safe:true});tracks[0].onerror();
 run.elapsed=1.5;d.update(run,{safe:true});assert.equal(tracks.length,2);tracks[1].onerror();
 for(let i=0;i<20;i++){run.elapsed+=.1;d.update(run,{safe:true});}
 assert.equal(tracks.length,2,'no máximo duas tentativas por evento');
 d.event('boss',run);d.update(run,{safe:true});assert.equal(tracks.length,3,'novo evento pode tocar após falhas');
}));
for(const reason of ['reset','scene','expired','mute','raid']){
 test('falha tardia não revive fala após '+reason,()=>withAudio(async({audio,d,tracks,run})=>{
  d.event('boss',run);d.update(run,{safe:true});
  if(reason==='reset')d.reset();
  if(reason==='scene')run.boss={type:'lula'};
  if(reason==='expired')run.elapsed=10;
  if(reason==='mute')audio.toggle();
  if(reason==='raid'){run.raid={phase:'warning'};audio.event('warning');}
  const count=tracks.length;tracks[0].reject(new Error('late failure'));await Promise.resolve();
  d.update(run,{safe:true});assert.equal(tracks.length,count);
 }));
}
test('callback de erro antigo não altera canal prioritário nem altera retorno booleano',()=>withAudio(async({audio,tracks})=>{
 let failures=0;
 assert.equal(audio.voice('haddad',{priority:2,onFailure:()=>failures++}),true);
 assert.equal(audio.voice('joice',{priority:3}),true);
 tracks[0].reject(new Error('superseded'));await Promise.resolve();assert.equal(failures,0);
 assert.equal(audio.voice('haddad',{priority:2}),false);assert.notEqual(tracks[1].paused,true);
}));
