import test from 'node:test';
import assert from 'node:assert/strict';
import * as sounds from '../tanahoraflavio/runner-cast-sounds.mjs';
import {ALLIES} from '../tanahoraflavio/runner-allies.mjs';
import {createGameAudio} from '../tanahoraflavio/runner-audio.mjs';
const actors=['flavio','jacare','ze-gotinha','army','haddad','lula','pf','xandao','janones','joice','dilma','simone','soraya','boulos','dino','bossonari','meme-army',...ALLIES.map(a=>a.id)];
test('32 personagens têm identidade sonora própria, três variações e volume limitado',()=>{
 assert.equal(new Set(actors).size,32);
 const signatures=new Set();
 for(const actor of actors){const b=sounds.getCastSoundBank(actor);assert.ok(b,actor);assert.equal(b.variants.length,3);
  const variants=b.variants.map(v=>JSON.stringify(v));assert.equal(new Set(variants).size,3,actor);
  for(const variant of b.variants)for(const n of variant){assert.ok(n.volume>0&&n.volume<=.04);assert.ok(n.length>0&&n.length<=.25);}
  signatures.add(JSON.stringify(b.variants));
 }
 assert.equal(signatures.size,32);assert.equal(sounds.getCastSoundBank('missing'),null);
});
test('presença tem orçamento, intervalo global e mute sem roubar o alerta de perigo',()=>{
 const old=globalThis.window,notes=[],param=()=>({setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){},setTargetAtTime(){},cancelScheduledValues(){}});
 const ctx={currentTime:0,state:'running',destination:{},createGain(){return{gain:param(),connect(){},disconnect(){}};},createOscillator(){const n={frequency:param(),connect(){},disconnect(){},start(){notes.push(this);},stop(){}};return n;}};
 globalThis.window={AudioContext:class{constructor(){return ctx;}}};
 try{const a=createGameAudio();assert.equal(a.actorCue('flavio'),false);a.prime();assert.equal(a.actorCue('flavio'),true);assert.equal(a.actorCue('pf'),false,'não empilha entradas');
  for(const n of notes)n.onended?.();ctx.currentTime=2;assert.equal(a.actorCue('pf'),true);a.toggle();ctx.currentTime=4;assert.equal(a.actorCue('lula'),false);
 }finally{if(old===undefined)delete globalThis.window;else globalThis.window=old;}
});

test('coleta de aliado não dispara voz de outro personagem',async()=>{
 const {createVoiceDirector}=await import('../tanahoraflavio/runner-voice-director.mjs');
 const played=[],d=createVoiceDirector({play:id=>(played.push(id),true)});
 const run={status:'running',elapsed:20,raid:null,boss:null,ally:{id:'jair'}};
 d.event('ally',run,'jair');d.update(run,{safe:true});assert.deepEqual(played,[]);
});
