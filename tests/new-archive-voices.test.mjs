import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {ARCHIVE_VOICES} from '../tanahoraflavio/runner-voice-data.mjs';
import {createVoiceDirector} from '../tanahoraflavio/runner-voice-director.mjs';
for(const actor of ['soraya','dilma','dino','simone','xandao','boulos'])test(actor+' tem dois arquivos reais identificados e selecionados sem repetição',()=>{
 const played=[],d=createVoiceDirector({random:()=>0,play:id=>(played.push(id),true)}),run={status:'running',raid:null,boss:{type:actor},elapsed:20};
 d.event('boss',run);d.update(run,{safe:true});assert.equal(played.length,1,actor+' sem fala');
 run.elapsed=40;d.event('boss',run);d.update(run,{safe:true});assert.equal(played.length,2);assert.notEqual(played[0],played[1]);
 for(const id of played){const clip=ARCHIVE_VOICES[id];assert.ok(clip.speaker&&clip.quote&&clip.context&&clip.source&&clip.sourceMedia&&clip.verification);
  assert.ok(clip.toSeconds>clip.fromSeconds);assert.ok(clip.durationSeconds<9);
  const bytes=readFileSync(new URL('../tanahoraflavio/'+clip.file,import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),clip.sha256);
 }
});
