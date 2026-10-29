import test from 'node:test';
import assert from 'node:assert/strict';
import {createGameAudio} from '../tanahoraflavio/runner-audio.mjs';

// Boundary fixture: Node has no browser speech engine. Assert the utterance this
// component emits, not browser internals or an imitation of the implementation.
function browserSpeech(voices) {
 const emitted=[];let speaking=false;
 const window={SpeechSynthesisUtterance:class{constructor(text){this.text=text;}},
  speechSynthesis:{getVoices:()=>voices,speak:u=>{emitted.push(u);speaking=true;},cancel:()=>{speaking=false;}}};
 return {window,emitted,get speaking(){return speaking;}};
}
function withBrowser(fixture,fn){const previous=globalThis.window;globalThis.window=fixture.window;try{fn();}finally{if(previous===undefined)delete globalThis.window;else globalThis.window=previous;}}
test('narração usa voz pt-BR local mesmo quando uma voz remota vem primeiro',()=>{
 const fixture=browserSpeech([{name:'Remota',lang:'pt-BR',localService:false},{name:'Local',lang:'pt-BR',localService:true}]);
 withBrowser(fixture,()=>{createGameAudio().event('active',{text:'Notícia histórica com fonte.'});assert.equal(fixture.emitted.length,1);assert.equal(fixture.emitted[0].voice.name,'Local');});
});
test('sem voz local não envia texto ao sintetizador remoto',()=>{
 const fixture=browserSpeech([{name:'Remota',lang:'pt-BR',localService:false}]);
 withBrowser(fixture,()=>{createGameAudio().event('active',{text:'Notícia histórica com fonte.'});assert.equal(fixture.emitted.length,0);});
});
test('desligar som cancela narração em curso e impede novas falas',()=>{
 const fixture=browserSpeech([{name:'Local',lang:'pt-BR',localService:true}]);
 withBrowser(fixture,()=>{const audio=createGameAudio();audio.event('active',{text:'Notícia.'});assert.equal(fixture.speaking,true);audio.toggle();assert.equal(fixture.speaking,false);audio.event('active',{text:'Outra notícia.'});assert.equal(fixture.emitted.length,1);});
});
test('escolha de som desligado permanece ao criar uma nova sessão',()=>{
 const fixture=browserSpeech([]),saved=new Map();
 fixture.window.localStorage={getItem:k=>saved.get(k)??null,setItem:(k,v)=>saved.set(k,v)};
 withBrowser(fixture,()=>{const first=createGameAudio();assert.equal(first.enabled,true);first.toggle();assert.equal(createGameAudio().enabled,false);});
});
test('preferência de som bloqueada não impede ativar ou desativar efeitos',()=>{
 const fixture=browserSpeech([]);Object.defineProperty(fixture.window,'localStorage',{get(){throw new Error('blocked');}});
 withBrowser(fixture,()=>{const audio=createGameAudio();assert.equal(audio.enabled,true);assert.equal(audio.toggle(),false);assert.equal(audio.toggle(),true);});
});

function recordedAudio(){
 const tracks=[];
 const fixture=browserSpeech([]);
 fixture.window.Audio=class{
  constructor(src){this.src=src;this.played=0;this.paused=0;this.currentTime=0;tracks.push(this);}
  play(){this.played++;return Promise.resolve();}
  pause(){this.paused++;}
 };
 return {...fixture,tracks};
}
test('recorte de arquivo só toca depois do gesto inicial e com som ligado',()=>{
 const fixture=recordedAudio();
 withBrowser(fixture,()=>{
  const audio=createGameAudio();
  assert.equal(audio.voice('haddad'),false);assert.equal(fixture.tracks.length,0);
  audio.prime();assert.equal(audio.voice('haddad'),true);
  assert.equal(fixture.tracks.length,1);assert.equal(fixture.tracks[0].played,1);
  assert.match(fixture.tracks[0].src,/assets\/audio\/haddad-direction-v1\.mp3\?v=5b4c45e73434$/);
  audio.toggle();assert.equal(audio.voice('haddad'),false);assert.equal(fixture.tracks.length,1);
 });
});
test('parar o jogo interrompe o recorte e falha de áudio não interrompe a corrida',()=>{
 const fixture=recordedAudio();
 withBrowser(fixture,()=>{
  const audio=createGameAudio();audio.prime();audio.voice('haddad');
  fixture.tracks[0].currentTime=1;audio.stop();
  assert.equal(fixture.tracks[0].paused,1);assert.equal(fixture.tracks[0].currentTime,0);
  fixture.window.Audio=class{constructor(){throw new Error('media blocked');}};
  assert.equal(audio.voice('haddad'),false);assert.equal(audio.voice('xandao'),false);
 });
});
test('chegada da Joice toca o meme original uma vez e atravessa o aviso sem narração sobreposta',()=>{
 const fixture=recordedAudio();
 withBrowser(fixture,()=>{
  const audio=createGameAudio();audio.prime();audio.event('warning',{text:'Fato histórico.'});
  assert.equal(fixture.tracks.length,1,'chegada toca gravação, não só batidas sintéticas');
  const clip=fixture.tracks[0];assert.match(clip.src,/joice-toc-toc-v1\.mp3\?v=[a-f0-9]{12}$/);
  clip.currentTime=1.2;audio.event('active',{text:'Fato histórico.'});
  assert.equal(clip.paused,0,'fase ativa não corta a fala que começou no aviso');assert.equal(fixture.tracks.length,1);
  assert.equal(fixture.emitted.length,0,'nenhuma imitação/narração mistura com a gravação');
  audio.event('recovery',{text:''});assert.equal(clip.paused,1);assert.equal(clip.currentTime,0);
 });
});
test('meme da Joice respeita gesto inicial, som desligado e cancelamento ao parar',()=>{
 const fixture=recordedAudio();
 withBrowser(fixture,()=>{
  const audio=createGameAudio();audio.event('warning',{});assert.equal(fixture.tracks.length,0);
  audio.prime();audio.event('warning',{});assert.equal(fixture.tracks.length,1);
  audio.stop();assert.equal(fixture.tracks[0].paused,1);
  audio.toggle();audio.event('warning',{});assert.equal(fixture.tracks.length,1);
 });
});
