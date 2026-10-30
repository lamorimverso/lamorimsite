#!/usr/bin/env node
// Requer sharp no ambiente de desenvolvimento; o jogo não depende de Node/sharp.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';

const root=fileURLToPath(new URL('../',import.meta.url));
const sources=[
 {name:'hero',file:'flavio-motion-v2',cols:4,rows:3},
 {name:'cast',file:'characters-motion-v2',cols:4,rows:4},
 {name:'cameos',file:'cameos-motion-v1',cols:4,rows:4},
 {name:'chase',file:'chase-motion-v1',cols:4,rows:4}
];

function loadSharp(){
 const require=createRequire(import.meta.url);
 try{return require('sharp');}
 catch(error){
  if(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES)return require(join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'sharp'));
  throw new Error('Instale sharp@0.35.5 para gerar a arte: npm install --no-save sharp@0.35.5',{cause:error});
 }
}

function explicitFrames(layout,source,width,height){
 const frames=layout[source.name],size=layout[source.name+'Size'];
 if(!Array.isArray(frames)||frames.length!==source.cols*source.rows||size?.[0]!==width||size?.[1]!==height)throw new Error('Layout incompatível com o PNG de '+source.name);
 return frames.map((f,index)=>{
  const values=[f.x,f.y,f.width,f.height,...f.center,f.groundY];
  if(!values.every(Number.isFinite)||f.x<0||f.y<0||f.width<=0||f.height<=0||f.x+f.width>width||f.y+f.height>height||f.groundY<f.y||f.groundY>f.y+f.height)throw new Error('Recorte inválido: '+source.name+'/'+index);
  return {...f,center:f.center[0],anchorY:f.center[1]};
 });
}

function manifestFor(atlases){
 const frameSets=Object.fromEntries(atlases.map(atlas=>[atlas.name,atlas.frames]));
 const definitions=atlases.map(({name,file,cols,rows,width,height,sha256})=>
  ` ${name}:{url:new URL('./assets/${file}.webp',import.meta.url).href+'?v=${sha256.slice(0,12)}',cols:${cols},rows:${rows},width:${width},height:${height},sha256:'${sha256}',frames:frames.${name}}`
 ).join(',\n');
 return '// Gerado por tools/build-runner-art.mjs a partir dos PNGs originais.\n'+
  '// Recortes explícitos e pivôs revisados em tools/runner-art-layout.json.\n'+
  `export const frames=${JSON.stringify(frameSets,null,2)};\n`+
  `export const definitions={\n${definitions}\n};\n`;
}

async function output(path,bytes,check){
 if(!check){await writeFile(path,bytes);return;}
 const current=await readFile(path).catch(()=>null);
 if(!current||!current.equals(Buffer.from(bytes)))throw new Error(`Arte desatualizada: ${path}. Execute node tools/build-runner-art.mjs.`);
}

async function main(){
 const args=process.argv.slice(2);
 if(args.some(arg=>arg!=='--check'))throw new Error('Uso: node tools/build-runner-art.mjs [--check]');
 const check=args.includes('--check'),sharp=loadSharp(),atlases=[];
 const layout={...JSON.parse(await readFile(join(root,'tools/runner-art-layout.json'),'utf8')),...JSON.parse(await readFile(join(root,'tools/pressure-art-layout.json'),'utf8'))};
 for(const source of sources){
  const input=await readFile(join(root,'tanahoraflavio/assets',`${source.file}.png`));
  const {width,height}=await sharp(input).metadata();
  const webp=await sharp(input).webp({lossless:true,effort:6}).toBuffer();
  atlases.push({...source,width,height,frames:explicitFrames(layout,source,width,height),
   sha256:createHash('sha256').update(webp).digest('hex'),sourceBytes:input.length,webp});
 }
 for(const atlas of atlases)await output(join(root,'tanahoraflavio/assets',`${atlas.file}.webp`),atlas.webp,check);
 await output(join(root,'tanahoraflavio/runner-sprite-data.mjs'),manifestFor(atlases),check);
 const assets=atlases.map(({name,width,height,sha256,sourceBytes,webp})=>({name,width,height,sha256,sourceBytes,webpBytes:webp.length}));
 console.log(JSON.stringify({verified:check,sharp:sharp.versions.sharp,webp:sharp.versions.webp,assets},null,2));
}

main().catch(error=>{console.error(error.message);process.exitCode=1;});
