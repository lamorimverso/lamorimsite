import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {ARCHIVE_VOICES} from '../tanahoraflavio/runner-voice-data.mjs';
const tool=new URL('../tools/version-runner-assets.mjs',import.meta.url);
const version=s=>createHash('sha256').update(s).digest('hex').slice(0,12);
test('URL versionada do recorte corresponde ao áudio incluído na publicação',async()=>{
 for(const clip of Object.values(ARCHIVE_VOICES)){
  const bytes=await readFile(new URL('../tanahoraflavio/'+clip.file,import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),clip.sha256,'mídia alterada exige versão nova');
  assert.ok(clip.toSeconds>clip.fromSeconds&&clip.toSeconds-clip.fromSeconds<6,'mídia curta de até seis segundos (edições de memes identificadas no manifesto)');
 }
});
test('recurso alterado invalida também o import e a entrada HTML, com geração estável',async()=>{
 const root=await mkdtemp(join(tmpdir(),'runner-release-'));
 try{
  await writeFile(join(root,'leaf.mjs'),'export const answer=1;\n');
  await writeFile(join(root,'entry.mjs'),"import {answer} from './leaf.mjs';\nexport {answer};\n");
  await writeFile(join(root,'boot.js'),'void 0;\n');
  await writeFile(join(root,'game.css'),'body{color:#222}\n');
  await writeFile(join(root,'index.html'),'<link href="game.css"><script src="boot.js" data-runner="./entry.mjs"></script><a href="https://example.org/">Fonte</a>');
  const run=(...args)=>spawnSync(process.execPath,[tool.pathname,'--root',root,...args],{encoding:'utf8'});
  let result=run();assert.equal(result.status,0,result.stderr);
  const entry=await readFile(join(root,'entry.mjs'),'utf8'),html=await readFile(join(root,'index.html'),'utf8');
  assert.ok(entry.includes('./leaf.mjs?v='+version('export const answer=1;\n')));
  assert.ok(html.includes('./entry.mjs?v='+version(entry)));
  assert.ok(html.includes('https://example.org/'));
  assert.equal(run('--check').status,0);
  await writeFile(join(root,'leaf.mjs'),'export const answer=2;\n');
  assert.equal(run('--check').status,1,'CI deve rejeitar versão desatualizada');
  assert.equal(run().status,0);
  assert.notEqual(await readFile(join(root,'index.html'),'utf8'),html,'mudança se propaga ao HTML');
  const stable=await readFile(join(root,'index.html'),'utf8');
  assert.equal(run().status,0);assert.equal(await readFile(join(root,'index.html'),'utf8'),stable);
 }finally{await rm(root,{recursive:true,force:true});}
});
