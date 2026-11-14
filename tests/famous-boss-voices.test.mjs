import test from 'node:test';
import assert from 'node:assert/strict';
import {createVoiceDirector} from '../tanahoraflavio/runner-voice-director.mjs';
import {ARCHIVE_VOICES} from '../tanahoraflavio/runner-voice-data.mjs';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
test('Dilma e Soraya usam bordões famosos, sem discursos genéricos de arquivo',()=>{
 const expected={dilma:['meme-dilma-meta-aberta','meme-dilma-dobrar-meta'],soraya:['meme-soraya-festa-junina']};
 for(const [actor,ids] of Object.entries(expected))for(const roll of [0,.5,.999]){
  const played=[],d=createVoiceDirector({random:()=>roll,play:id=>(played.push(id),true)}),r={status:'running',elapsed:20,raid:null,boss:{type:actor}};
  d.event('boss',r);d.update(r,{safe:true});assert.ok(ids.includes(played[0]),actor+': '+played[0]);
 }
});
test('bordões novos mantêm arquivo, falante, origem e contexto verificáveis',async()=>{
 for(const id of ['meme-dilma-meta-aberta','meme-dilma-dobrar-meta','meme-soraya-festa-junina']){
  const clip=ARCHIVE_VOICES[id];assert.ok(clip,id);assert.ok(clip.actor&&clip.speaker&&clip.quote&&clip.context&&clip.sourceMedia&&clip.sourceSha256&&clip.corroboration);
  assert.ok(clip.complete&&clip.famous&&clip.durationSeconds>1&&clip.durationSeconds<8);
  assert.equal(createHash('sha256').update(await readFile(new URL('../tanahoraflavio/'+clip.file,import.meta.url))).digest('hex'),clip.sha256);
 }
});

test('Dino e Xandão têm os bordões corretos; frase única não se repete durante a luta',()=>{
 for(const [actor,prefix] of [['dino','meme-dino-'],['xandao','meme-xandao-']]){
  const played=[],d=createVoiceDirector({random:()=>0,play:id=>(played.push(id),true)}),r={status:'running',elapsed:20,raid:null,boss:{type:actor}};
  d.event('boss',r);d.update(r,{safe:true});assert.ok(played[0]?.startsWith(prefix));r.elapsed=40;d.update(r,{safe:true});assert.equal(played.length,2);assert.notEqual(played[0],played[1]);
 }
 const played=[],d=createVoiceDirector({play:id=>(played.push(id),true)}),r={status:'running',elapsed:20,raid:null,boss:{type:'soraya'}};
 d.event('boss',r);d.update(r,{safe:true});r.elapsed=40;d.update(r,{safe:true});assert.equal(played.length,1);
});
