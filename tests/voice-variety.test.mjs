import test from 'node:test';import assert from 'node:assert/strict';
import {createVoiceDirector,MEME_SCENES} from '../tanahoraflavio/runner-voice-director.mjs';
test('cada personagem esgota suas falas antes de repetir, mesmo com outra pessoa entre elas',()=>{
 const played=[],d=createVoiceDirector({random:()=>0,play:id=>(played.push(id),true)}),run={status:'running',raid:null,boss:null,elapsed:20};
 for(let i=0;i<MEME_SCENES.lula.length;i++){
  run.boss={type:'lula'};d.event('boss',run);d.update(run,{safe:true});run.elapsed+=20;
  run.boss={type:'janones'};d.event('boss',run);d.update(run,{safe:true});run.elapsed+=20;
 }
 const lula=played.filter(id=>MEME_SCENES.lula.includes(id));assert.equal(new Set(lula).size,MEME_SCENES.lula.length);
});

test('17 novas frases têm falante, fonte, contexto, duração e arquivo íntegro',async()=>{
 const {EXTRA_ARCHIVE_VOICES}=await import('../tanahoraflavio/runner-extra-voices.mjs'),{createHash}=await import('node:crypto'),{readFile}=await import('node:fs/promises');
 assert.equal(Object.keys(EXTRA_ARCHIVE_VOICES).length,17);
 for(const [id,clip] of Object.entries(EXTRA_ARCHIVE_VOICES)){
  assert.ok(clip.actor&&clip.speaker&&clip.quote&&clip.source&&clip.sourceMedia&&clip.context&&clip.sourceSha256,id);assert.ok(clip.complete);assert.ok(clip.durationSeconds>.5&&clip.durationSeconds<9);
  const bytes=await readFile(new URL('../tanahoraflavio/'+clip.file,import.meta.url));assert.ok(bytes.length>1000,id);assert.equal(createHash('sha256').update(bytes).digest('hex'),clip.sha256,id);
 }
});

test('Joice compartilha o histórico de falas entre chefe e perseguição',async t=>{
 const {createGameAudio}=await import('../tanahoraflavio/runner-audio.mjs'),prior=globalThis.window,tracks=[];
 globalThis.window={Audio:class{constructor(src){this.src=src;tracks.push(this);}play(){return Promise.resolve();}pause(){}}};t.after(()=>{if(prior===undefined)delete globalThis.window;else globalThis.window=prior;});
 const audio=createGameAudio();audio.prime();const d=createVoiceDirector({random:()=>0,selector:audio.voiceSelector,play:(id,options)=>audio.voice(id,options)}),r={status:'running',elapsed:20,raid:null,boss:{type:'joice'}};
 for(let i=0;i<4;i++){
  if(i%2===0){r.boss={type:'joice'};d.event('boss',r);d.update(r,{safe:true});}
  else audio.event('warning');
  assert.equal(tracks.length,i+1);tracks.at(-1).onended();if(i%2===1)audio.event('end');r.elapsed+=20;
 }
 assert.notEqual(tracks[0].src,tracks[1].src,'perseguição não repete a frase do chefe');assert.equal(new Set(tracks.map(p=>p.src)).size,4,'esgota alternativas nos dois eventos');audio.stop();
});
