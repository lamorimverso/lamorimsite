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
