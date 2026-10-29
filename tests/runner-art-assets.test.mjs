import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';

const root=fileURLToPath(new URL('../',import.meta.url));
const expectedFrames={
 hero:[
  {x:73,y:20,width:425,height:490,center:256},
  {x:579,y:20,width:401,height:491,center:768},
  {x:1064,y:21,width:429,height:456,center:1280},
  {x:57,y:522,width:400,height:487,center:256},
  {x:601,y:524,width:383,height:469,center:768},
  {x:1086,y:522,width:417,height:464,center:1280}
 ],
 cast:[
  {x:28,y:40,width:285,height:273,center:156.5},
  {x:313,y:5,width:298,height:308,center:470},
  {x:636,y:66,width:304,height:247,center:783.5},
  {x:940,y:38,width:298,height:275,center:1097},
  {x:62,y:336,width:232,height:289,center:156.5},
  {x:342,y:333,width:285,height:294,center:470},
  {x:627,y:342,width:313,height:281,center:783.5},
  {x:940,y:334,width:296,height:287,center:1097},
  {x:27,y:634,width:277,height:291,center:156.5},
  {x:331,y:627,width:254,height:305,center:470},
  {x:636,y:639,width:304,height:287,center:783.5},
  {x:940,y:656,width:305,height:266,center:1097},
  {x:23,y:940,width:276,height:289,center:156.5},
  {x:348,y:940,width:259,height:242,center:470},
  {x:642,y:995,width:288,height:226,center:783.5},
  {x:951,y:941,width:286,height:242,center:1097}
 ]
};

async function manifest(){
 const imported=await import('../tanahoraflavio/runner-sprite-data.mjs').catch(()=>null);
 assert.ok(imported,'o manifesto de recortes precisa existir antes do carregamento');
 return imported;
}

function imageDecoder(){
 const require=createRequire(import.meta.url);
 try{return require('sharp');}
 catch(error){
  if(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES)return require(join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'sharp'));
  throw new Error('Os testes de pixels requerem sharp: instale sharp@0.35.5.',{cause:error});
 }
}

test('manifesto preserva os 22 recortes do PNG com alfa 150 e margem de 2 pixels',async()=>{
 const {definitions,frames}=await manifest();
 assert.deepEqual(frames,expectedFrames);
 assert.equal(definitions.hero.cols,3);assert.equal(definitions.hero.rows,2);
 assert.equal(definitions.cast.cols,4);assert.equal(definitions.cast.rows,4);
 assert.deepEqual([definitions.hero.width,definitions.hero.height],[1536,1024]);
 assert.deepEqual([definitions.cast.width,definitions.cast.height],[1254,1254]);
});

test('WebP preserva cada pixel visível e dimensões dos PNGs com menos bytes e hash real',async()=>{
 const {definitions}=await manifest();
 const sharp=imageDecoder();
 for(const [name,filename] of [['hero','flavio-run'],['cast','characters-2026']]){
  const definition=definitions[name],url=new URL(definition.url);
  assert.equal(url.pathname.endsWith(`${filename}.webp`),true);
  const source=await readFile(join(root,'tanahoraflavio/assets',`${filename}.png`));
  const compressed=await readFile(url);
  const hash=createHash('sha256').update(compressed).digest('hex');
  assert.equal(definition.sha256,hash);
  assert.equal(url.searchParams.get('v'),hash.slice(0,12));
  assert.ok(compressed.length<source.length,`${name} precisa transferir menos bytes`);
  const original=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const converted=await sharp(compressed).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  assert.deepEqual(converted.info,original.info);
  assert.equal(converted.info.width,definition.width);assert.equal(converted.info.height,definition.height);
  let visible=0;
  for(let i=0;i<original.data.length;i+=4){
   assert.equal(converted.data[i+3],original.data[i+3],`${name}: canal alfa no pixel ${i/4}`);
   if(original.data[i+3]===0)continue;
   visible++;
   for(let channel=0;channel<3;channel++)assert.equal(converted.data[i+channel],original.data[i+channel],`${name}: cor visível no pixel ${i/4}`);
  }
  assert.ok(visible>100000,`${name} mantém conteúdo visível`);
 }
});

test('a ferramenta reproduz atlas e manifesto sem alterar os arquivos ao verificar',async()=>{
 const tool=join(root,'tools/build-runner-art.mjs');
 assert.ok(await stat(tool).catch(()=>null),'a geração precisa ter um comando repetível');
 const files=['tanahoraflavio/runner-sprite-data.mjs','tanahoraflavio/assets/flavio-run.webp','tanahoraflavio/assets/characters-2026.webp'];
 const before=await Promise.all(files.map(file=>readFile(join(root,file))));
 const result=spawnSync(process.execPath,[tool,'--check'],{cwd:root,env:process.env,encoding:'utf8'});
 assert.equal(result.status,0,result.stderr||result.stdout);
 const after=await Promise.all(files.map(file=>readFile(join(root,file))));
 assert.deepEqual(after,before);
});
