import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {versionRunnerAssets} from '../tools/version-runner-assets.mjs';

async function fixture(t,files){
 const root=await mkdtemp(join(tmpdir(),'runner-versions-'));
 t.after(()=>rm(root,{recursive:true,force:true}));
 for(const [name,body] of Object.entries(files)){
  const path=join(root,name);
  await mkdir(dirname(path),{recursive:true});
  await writeFile(path,body);
 }
 return root;
}
const read=(root,name)=>readFile(join(root,name),'utf8');
const hash=body=>createHash('sha256').update(body).digest('hex').slice(0,12);

test('versions nested runtime entries and propagates changes through shared modules',async t=>{
 const files={
  'index.html':'<script data-runner="runner.mjs"></script>',
  'runner.mjs':"import './src/shared.mjs';",
  'src/shared.mjs':"export const value=1;",
  'battle/index.html':'<link href = "battle.css"><script src="battle.mjs"></script><img src="../assets/face.png"><a href="../index.html#game">voltar</a><script src="https://example.org/a.js"></script>',
  'battle/battle.mjs':"export const load=()=>import( './src/fighter.mjs' );",
  'battle/src/fighter.mjs':"export {value} from '../../src/shared.mjs';",
  'battle/battle.css':'body { color: red; }',
  'assets/face.png':'fixture image',
  'docs/example.html':'<script src="missing.js"></script>',
  'tests/example.test.mjs':"import './missing.mjs';",
  'third-party/example.js':"import './missing.mjs';"
 };
 const root=await fixture(t,files);
 const expected=['index.html','runner.mjs','battle/index.html','battle/battle.mjs','battle/src/fighter.mjs'].sort();
 assert.deepEqual((await versionRunnerAssets(root,{check:true})).sort(),expected);
 for(const [name,body] of Object.entries(files))assert.equal(await read(root,name),body);
 assert.deepEqual((await versionRunnerAssets(root)).sort(),expected);
 assert.deepEqual(await versionRunnerAssets(root,{check:true}),[]);
 const shared=hash(await read(root,'src/shared.mjs'));
 const fighter=await read(root,'battle/src/fighter.mjs');
 assert.ok(fighter.includes('../../src/shared.mjs?v='+shared));
 const battle=await read(root,'battle/battle.mjs');
 assert.ok(battle.includes('./src/fighter.mjs?v='+hash(fighter)));
 const page=await read(root,'battle/index.html');
 assert.ok(page.includes('battle.mjs?v='+hash(battle)));
 assert.ok(page.includes('battle.css?v='+hash(files['battle/battle.css'])));
 assert.ok(page.includes('../assets/face.png?v='+hash(files['assets/face.png'])));
 assert.ok(page.includes('../index.html#game'));
 assert.ok(page.includes('https://example.org/a.js'));
 await writeFile(join(root,'src/shared.mjs'),'export const value=2;');
 assert.deepEqual((await versionRunnerAssets(root,{check:true})).sort(),expected);
 assert.equal(await read(root,'battle/index.html'),page);
 await versionRunnerAssets(root);
 assert.deepEqual(await versionRunnerAssets(root,{check:true}),[]);
 assert.notEqual(await read(root,'battle/index.html'),page);
});

test('fails without partial writes when a nested runtime reference is missing',async t=>{
 const root=await fixture(t,{'index.html':'<script src="runner.mjs"></script>','runner.mjs':'export {};','battle/index.html':'<script src="missing.mjs"></script>'});
 await assert.rejects(versionRunnerAssets(root),/ENOENT/);
 assert.equal(await read(root,'index.html'),'<script src="runner.mjs"></script>');
});
