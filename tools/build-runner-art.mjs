#!/usr/bin/env node
// Requer sharp no ambiente de desenvolvimento; o jogo não depende de Node/sharp.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';

const root=fileURLToPath(new URL('../',import.meta.url));
const sources=[
 {name:'hero',file:'flavio-run',cols:3,rows:2},
 {name:'cast',file:'characters-2026',cols:4,rows:4}
];

function loadSharp(){
 const require=createRequire(import.meta.url);
 try{return require('sharp');}
 catch(error){
  if(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES)return require(join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'sharp'));
  throw new Error('Instale sharp@0.35.5 para gerar a arte: npm install --no-save sharp@0.35.5',{cause:error});
 }
}

function scanFrames(data,width,height,cols,rows){
 const frames=[];
 for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
  const x0=Math.floor(col*width/cols),x1=Math.floor((col+1)*width/cols);
  const y0=Math.floor(row*height/rows),y1=Math.floor((row+1)*height/rows);
  let left=x1,right=x0-1,top=y1,bottom=y0-1;
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)if(data[(y*width+x)*4+3]>=150){
   left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
  }
  if(right<left||bottom<top)throw new Error(`Quadro de personagem vazio: linha ${row}, coluna ${col}`);
  left=Math.max(x0,left-2);top=Math.max(y0,top-2);right=Math.min(x1-1,right+2);bottom=Math.min(y1-1,bottom+2);
  frames.push({x:left,y:top,width:right-left+1,height:bottom-top+1,center:(x0+x1)/2});
 }
 return frames;
}

function manifestFor(atlases){
 const frameSets=Object.fromEntries(atlases.map(atlas=>[atlas.name,atlas.frames]));
 const definitions=atlases.map(({name,file,cols,rows,width,height,sha256})=>
  ` ${name}:{url:new URL('./assets/${file}.webp',import.meta.url).href+'?v=${sha256.slice(0,12)}',cols:${cols},rows:${rows},width:${width},height:${height},sha256:'${sha256}',frames:frames.${name}}`
 ).join(',\n');
 return '// Gerado por tools/build-runner-art.mjs a partir dos PNGs originais.\n'+
  '// Recortes: alfa >= 150, margem de 2 pixels limitada à célula do atlas.\n'+
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
 for(const source of sources){
  const input=await readFile(join(root,'tanahoraflavio/assets',`${source.file}.png`));
  const {data,info:{width,height}}=await sharp(input).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const webp=await sharp(input).webp({lossless:true,effort:6}).toBuffer();
  atlases.push({...source,width,height,frames:scanFrames(data,width,height,source.cols,source.rows),
   sha256:createHash('sha256').update(webp).digest('hex'),sourceBytes:input.length,webp});
 }
 for(const atlas of atlases)await output(join(root,'tanahoraflavio/assets',`${atlas.file}.webp`),atlas.webp,check);
 await output(join(root,'tanahoraflavio/runner-sprite-data.mjs'),manifestFor(atlases),check);
 const assets=atlases.map(({name,width,height,sha256,sourceBytes,webp})=>({name,width,height,sha256,sourceBytes,webpBytes:webp.length}));
 console.log(JSON.stringify({verified:check,sharp:sharp.versions.sharp,webp:sharp.versions.webp,assets},null,2));
}

main().catch(error=>{console.error(error.message);process.exitCode=1;});
