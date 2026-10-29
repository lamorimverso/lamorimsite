import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';

const root=fileURLToPath(new URL('../',import.meta.url));

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

test('recortes explícitos incluem cada personagem sem cortar nem capturar vizinhos',async()=>{
 const {definitions,frames}=await manifest(),sharp=imageDecoder();
 for(const [name,filename,count] of [['hero','flavio-motion-v2',12],['cast','characters-motion-v2',16]]){
  const {data,info:{width,height}}=await sharp(join(root,'tanahoraflavio/assets',filename+'.png')).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  assert.equal(frames[name].length,count);
  assert.deepEqual([definitions[name].width,definitions[name].height],[width,height]);
  const covered=new Uint8Array(width*height);
  for(const frame of frames[name]){
   assert.ok(frame.x>=0&&frame.y>=0&&frame.x+frame.width<=width&&frame.y+frame.height<=height,'recorte dentro da imagem');
   let opaque=0;
   for(let y=frame.y;y<frame.y+frame.height;y++)for(let x=frame.x;x<frame.x+frame.width;x++){
    const i=y*width+x,a=data[i*4+3];
    if(a>2){assert.equal(covered[i],0,'um pixel de personagem não pode aparecer em dois quadros');covered[i]=1;}
    if(a>=150)opaque++;
    if(x===frame.x||x===frame.x+frame.width-1||y===frame.y||y===frame.y+frame.height-1)assert.ok(a<=2,'margem transparente evita cortar pés/acessórios');
   }
   assert.ok(opaque>5000,'quadro contém um personagem visível, não só ruído');
   assert.ok(frame.groundY>=frame.y&&frame.groundY<=frame.y+frame.height);
  }
  for(let i=0;i<covered.length;i++)if(data[i*4+3]>2)assert.equal(covered[i],1,'nenhum fragmento de personagem foi descartado entre os recortes');
 }
});

test('WebP preserva cada pixel visível e dimensões dos PNGs com menos bytes e hash real',async()=>{
 const {definitions}=await manifest();
 const sharp=imageDecoder();
 for(const [name,filename] of [['hero','flavio-motion-v2'],['cast','characters-motion-v2']]){
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
 const files=['tanahoraflavio/runner-sprite-data.mjs','tanahoraflavio/assets/flavio-motion-v2.webp','tanahoraflavio/assets/characters-motion-v2.webp'];
 const before=await Promise.all(files.map(file=>readFile(join(root,file))));
 const result=spawnSync(process.execPath,[tool,'--check'],{cwd:root,env:process.env,encoding:'utf8'});
 assert.equal(result.status,0,result.stderr||result.stdout);
 const after=await Promise.all(files.map(file=>readFile(join(root,file))));
 assert.deepEqual(after,before);
});
