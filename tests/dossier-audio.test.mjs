import test from 'node:test';
import assert from 'node:assert/strict';
import {createGameAudio} from '../tanahoraflavio/runner-audio.mjs';
function fixture(){
 const gains=[],tracks=[],param=()=>({peak:0,setValueAtTime(){},linearRampToValueAtTime(v){this.peak=Math.max(this.peak,v);},exponentialRampToValueAtTime(){},setTargetAtTime(){},cancelScheduledValues(){}});
 const context={currentTime:0,state:'running',destination:{},createGain(){const g={gain:param(),connect(){},disconnect(){}};gains.push(g);return g;},createOscillator(){return{frequency:param(),connect(){},disconnect(){},start(){},stop(){}};}};
 return {context,gains,tracks,window:{AudioContext:class{constructor(){return context;}},Audio:class{constructor(){this.currentTime=0;tracks.push(this);}play(){return Promise.resolve();}pause(){this.paused=true;}}}};
}
function inBrowser(f,fn){const old=globalThis.window;globalThis.window=f.window;try{fn();}finally{if(old===undefined)delete globalThis.window;else globalThis.window=old;}}
test('alerta de perigo mantém volume e abaixa a fala temporariamente, recuperando depois',()=>{
 const f=fixture();inBrowser(f,()=>{
  const a=createGameAudio();a.prime();a.effect('high');const peak=f.gains.at(-1).gain.peak;
  f.context.currentTime=1;a.voice('joice',{priority:3});const normal=f.tracks[0].volume;a.effect('high');
  assert.equal(f.gains.at(-1).gain.peak,peak,'alerta não fica abafado sob uma voz');assert.ok(f.tracks[0].volume<normal);
  f.context.currentTime=2;a.background({active:true,raid:true});assert.equal(f.tracks[0].volume,normal);a.stop();
 });
});
test('Joice toca uma vez por evento e retoma uma única fonte após stop ou mute',()=>{
 const f=fixture();inBrowser(f,()=>{
  const a=createGameAudio();a.prime();a.event('warning',{});a.event('warning',{});a.event('active',{});
  assert.equal(f.tracks.length,1);assert.equal(f.tracks[0].loop,false);a.stop();assert.equal(f.tracks[0].paused,true);
  a.event('active',{});assert.equal(f.tracks.length,2);assert.equal(f.tracks[1].loop,false);
  a.toggle();assert.equal(f.tracks[1].paused,true);a.event('active',{});assert.equal(f.tracks.length,2);
  a.toggle();a.event('active',{});assert.equal(f.tracks.length,3);a.event('recovery',{});assert.notEqual(f.tracks[2].paused,true);a.event('cancelled');assert.equal(f.tracks[2].paused,true);a.stop();
 });
});
