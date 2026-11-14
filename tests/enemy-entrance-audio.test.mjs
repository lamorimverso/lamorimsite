import test from 'node:test';
import assert from 'node:assert/strict';
import {createGameAudio} from '../tanahoraflavio/runner-audio.mjs';

// Observe the actual Web Audio schedule. Only the browser's audio boundary is
// replaced; music remains connected through its bus, effects to destination.
function fixture(){
 const notes=[],tracks=[],param=()=>({events:[],setValueAtTime(v,t){this.events.push(['set',v,t]);},linearRampToValueAtTime(v,t){this.events.push(['linear',v,t]);},exponentialRampToValueAtTime(v,t){this.events.push(['exponential',v,t]);},setTargetAtTime(){},cancelScheduledValues(){}});
 const context={currentTime:10,state:'running',destination:{},resume:()=>Promise.resolve(),
  createGain(){return{gain:param(),connect(to){this.to=to;},disconnect(){}};},
  createOscillator(){const note={frequency:param(),connect(gain){this.gain=gain;},disconnect(){this.disconnected=true;},start(t){this.at=t;},stop(t){this.until=t;}};notes.push(note);return note;}};
 const window={AudioContext:class{constructor(){return context;}},Audio:class{constructor(src){this.src=src;tracks.push(this);}play(){return Promise.resolve();}pause(){this.paused=true;}}};
 return{window,context,notes,tracks,effects:()=>notes.filter(n=>n.gain?.to===context.destination),finish(){for(const n of notes.filter(n=>!n.disconnected))n.onended?.();}};
}
function withAudio(fn){const before=globalThis.window,f=fixture();globalThis.window=f.window;try{fn(createGameAudio(),f);}finally{if(before===undefined)delete globalThis.window;else globalThis.window=before;}}
const signature=notes=>JSON.stringify(notes.map(n=>[n.type,n.frequency.events.map(e=>e.slice(0,2)),n.gain.gain.events.map(e=>e.slice(0,2))]));
const enemies=['pf','army','janones','joice','soraya','boulos','haddad','simone','dino','xandao','lula','dilma','bossonari','meme-army'];

test('cada inimigo tem chegada original audível, distinta do disparo, sem voz inventada',()=>withAudio((audio,f)=>{
 assert.equal(typeof audio.enemyEntrance,'function');audio.prime();const signatures=[];
 for(const actor of enemies){
  const from=f.effects().length;assert.equal(audio.enemyEntrance({type:actor}),true,actor);
  const entrance=f.effects().slice(from);assert.equal(entrance.length,2,actor);
  assert.ok(entrance.every(n=>n.gain.gain.events.some(e=>e[0]==='linear'&&e[1]>=.045&&e[1]<=.065)),actor);
  signatures.push(signature(entrance));f.finish();
  const shotFrom=f.effects().length;if(audio.enemyShot(actor)){assert.notEqual(signature(f.effects().slice(shotFrom)),signature(entrance));f.finish();}
  f.context.currentTime+=1;
 }
 assert.equal(new Set(signatures).size,14);assert.equal(f.tracks.length,0);
}));
test('chegada não é bloqueada por presença recente nem gravação em andamento',()=>withAudio((audio,f)=>{
 audio.prime();assert.equal(audio.actorCue('lula'),true);audio.voice('joice',{priority:3});
 const from=f.effects().length;assert.equal(audio.enemyEntrance('haddad'),true);assert.equal(f.effects().length-from,2);
 assert.notEqual(f.tracks[0].paused,true,'preserva gravação prioritária');
}));
test('aviso de disparo tem prioridade; chegada aguarda o aviso e toca no próximo frame seguro',()=>withAudio((audio,f)=>{
 audio.prime();audio.enemyShot('janones','message');const from=f.effects().length;
 assert.equal(audio.enemyEntrance('simone'),true);assert.equal(f.effects().length,from);
 f.finish();f.context.currentTime+=.6;audio.background({active:true});assert.equal(f.effects().length-from,2);
}));
test('orçamento cheio adia a chegada inteira e o primeiro espaço disponível a reproduz',()=>withAudio((audio,f)=>{
 audio.prime();for(let i=0;i<12;i++)audio.effect('pickup');
 assert.equal(audio.enemyEntrance('boulos'),true);assert.equal(f.effects().length,12);
 f.finish();audio.background({active:true});assert.equal(f.effects().length,14);
 assert.deepEqual(f.effects().slice(12).map(n=>n.at),[10,10.11]);
}));
for(const cancel of ['stop','mute','inactive','new-entry','expired'])test('chegada pendente não reaparece após '+cancel,()=>withAudio((audio,f)=>{
 audio.prime();for(let i=0;i<12;i++)audio.effect('pickup');audio.enemyEntrance('haddad');
 if(cancel==='stop')audio.stop();if(cancel==='mute')audio.toggle();if(cancel==='inactive')audio.background({active:false});
 if(cancel==='new-entry')audio.enemyEntrance('simone');if(cancel==='expired')f.context.currentTime+=2;
 f.finish();audio.background({active:true});
 assert.equal(f.effects().length,cancel==='new-entry'?14:12);
 if(cancel==='new-entry')assert.equal(f.effects()[12].frequency.events[0][1],499,'somente a nova personagem');
}));
test('sem gesto, com mute ou contexto suspenso não guarda chegada para tocar depois',()=>withAudio((audio,f)=>{
 assert.equal(audio.enemyEntrance?.('lula'),false);audio.prime();audio.background({active:true});assert.equal(f.effects().length,0);
 f.context.state='suspended';assert.equal(audio.enemyEntrance('lula'),false);f.context.state='running';audio.background({active:true});assert.equal(f.effects().length,0);
 audio.toggle();assert.equal(audio.enemyEntrance('lula'),false);audio.toggle();audio.background({active:true});assert.equal(f.effects().length,0);
 assert.equal(audio.enemyEntrance('missing'),false);
}));
test('disparo recupera canais da chegada e continua audível com orçamento cheio',()=>withAudio((audio,f)=>{
 audio.prime();audio.enemyEntrance('lula');const entrance=f.effects().slice();for(let i=0;i<10;i++)audio.effect('pickup');
 assert.equal(audio.enemyShot('xandao','hammer'),true);assert.ok(entrance.every(n=>n.until===undefined&&n.disconnected));
 assert.ok(f.effects().filter(n=>!n.disconnected).length<=12);
}));
test('falha transitória da API repete a chegada inteira; falha persistente tem tentativas limitadas',()=>withAudio((audio,f)=>{
 audio.prime();const create=f.context.createOscillator;let attempts=0;
 f.context.createOscillator=()=>{attempts++;throw Error('resource unavailable');};
 assert.equal(audio.enemyEntrance('pf'),true);f.context.createOscillator=create;audio.background({active:true});assert.equal(f.effects().length,2);
 f.finish();f.context.createOscillator=()=>{attempts++;throw Error('resource unavailable');};audio.enemyEntrance('pf');
 for(let i=0;i<30;i++)audio.background({active:true});assert.equal(attempts,4,'uma falha inicial e até três tentativas no novo evento');
}));

test('fogo amigo contínuo não prolonga alerta inimigo nem faz chegada pendente expirar',()=>withAudio((audio,f)=>{
 audio.prime();audio.enemyShot('janones','message');audio.enemyEntrance('haddad');f.finish();
 // Antes da API própria, o tiro do herói usava effect(), que prolongava o
 // alerta por .29s em disparos a cada .28s e impedia esta chegada para sempre.
 const fire=audio.heroShot?.bind(audio)||audio.effect.bind(audio);
 for(let i=1;i<=6;i++){
  f.context.currentTime=10+i*.28;fire('magic');audio.background({active:true});f.finish();
 }
 const arrivals=f.effects().filter(n=>n.frequency.events[0]?.[1]===296);
 assert.equal(arrivals.length,1,'a chegada toca uma vez mesmo mantendo o botão de ataque');
 assert.ok(arrivals[0].at<11.5,'toca antes de expirar, após o alerta inimigo terminar');
}));

test('tiro do herói é audível sem abaixar fala; aviso do inimigo continua abaixando',()=>withAudio((audio,f)=>{
 assert.equal(typeof audio.heroShot,'function');audio.prime();audio.voice('joice',{priority:3});
 audio.heroShot();assert.equal(f.effects().length,1);assert.equal(f.effects()[0].frequency.events[0][1],480);
 assert.ok(f.effects()[0].gain.gain.events.some(e=>e[0]==='linear'&&e[1]>.04));
 assert.equal(f.tracks[0].volume,.68);audio.background({active:true});assert.equal(f.tracks[0].volume,.68);
 audio.heroShot('metal');assert.equal(f.effects().at(-1).frequency.events[0][1],1050,'aceita timbre do poder');
 audio.enemyShot('xandao','hammer');assert.equal(f.tracks[0].volume,.28,'perigo real conserva prioridade');
}));
