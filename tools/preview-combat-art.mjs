#!/usr/bin/env node
// Optional visual QA: npm install --no-save @napi-rs/canvas@0.1.80 sharp@0.35.5
import {createCanvas,Image} from '@napi-rs/canvas';
import sharp from 'sharp';
import {fileURLToPath} from 'node:url';
import {readFile,writeFile} from 'node:fs/promises';
const root=new URL('../tanahoraflavio/',import.meta.url),artURL=new URL('runner-boss-art.mjs',root);
globalThis.Image=class extends Image{set src(v){this.url=v;super.src=fileURLToPath(v);}get src(){return this.url;}get naturalWidth(){return this.width;}get naturalHeight(){return this.height;}};
const source=await readFile(artURL,'utf8'),spec=source.match(/from ["']([^"']*runner-sprites[^"']*)["']/)[1];
const sprites=await import(new URL(spec,artURL));await sprites.loadSprites();
const {drawHoverEnemy}=await import(artURL);
const cast=['haddad','lula','xandao','pf','janones','joice','dilma','simone','soraya','boulos','dino','bossonari','meme-army','army','flavio','ze-gotinha'];
const flags=[{preparing:true,progress:.1},{preparing:true,progress:.9},{attacking:true,progress:0},{recovering:true,progress:.3}],labels=['Pronto','Prepara','Dispara','Recupera'];
const frames=[],board=createCanvas(720,cast.length*170),b=board.getContext('2d');b.fillStyle='#edf0f2';b.fillRect(0,0,board.width,board.height);
for(let frame=0;frame<4;frame++){
 const img=createCanvas(720,760),c=img.getContext('2d');c.fillStyle='#edf0f2';c.fillRect(0,0,img.width,img.height);
 for(const [i,type] of cast.entries()){
  c.fillStyle='#485063';c.font='12px system-ui';c.textAlign='center';c.fillText(type+' · '+labels[frame],i%4*180+90,Math.floor(i/4)*190+18);
  drawHoverEnemy(c,{type,x:i%4*180+90,y:Math.floor(i/4)*190+145,phase:0,reducedMotion:true,...flags[frame]});
  b.fillStyle='#485063';b.font='12px system-ui';b.textAlign='center';b.fillText(type+' · '+labels[frame],frame*180+90,i*170+18);
  drawHoverEnemy(b,{type,x:frame*180+90,y:i*170+130,phase:0,reducedMotion:true,...flags[frame]});
 }
 frames.push(img.toBuffer('image/png'));
}
// Sharp reads a vertical raw strip as separate animation pages.
const raw=await Promise.all(frames.map(f=>sharp(f).ensureAlpha().raw().toBuffer()));
await sharp(Buffer.concat(raw),{raw:{width:720,height:760*4,channels:4,pageHeight:760}}).webp({lossless:true,loop:0,delay:[450,450,180,450]}).toFile(fileURLToPath(new URL('docs/elenco-ilustrado-animado-2026-11-13.webp',root)));
await sharp(board.toBuffer('image/png')).webp({lossless:true}).toFile(fileURLToPath(new URL('docs/elenco-ilustrado-quadros-2026-11-13.webp',root)));
await writeFile(new URL('docs/elenco-ilustrado-pronto-2026-11-13.webp',root),await sharp(frames[0]).webp({lossless:true}).toBuffer());
console.log('Saved complete-figure animation (4 frames), contact sheet (64 poses), and ready board.');
const {SOLDIER_VARIANTS}=await import(new URL('runner-soldier-variants.mjs',root)),{drawThreat}=await import(new URL('runner-art.mjs',root));
const uniforms=Object.entries(SOLDIER_VARIANTS),runs=[],uniformWidth=uniforms.length*180;
for(let phase=0;phase<4;phase++){
 const img=createCanvas(uniformWidth,200),c=img.getContext('2d');c.fillStyle='#edf0f2';c.fillRect(0,0,uniformWidth,200);
 for(const [index,[armyVariant,variant]] of uniforms.entries()){
  c.fillStyle='#485063';c.font='12px system-ui';c.textAlign='center';c.fillText(variant.name,index*180+90,22);c.fillText(variant.country,index*180+90,40);
  drawThreat(c,{type:'army',x:index*180+70,width:40,height:47,armyVariant,approach:'front'},170,phase,{reducedMotion:true,weaponEffects:false});
 }
 runs.push(await sharp(img.toBuffer('image/png')).ensureAlpha().raw().toBuffer());
}
await sharp(Buffer.concat(runs),{raw:{width:uniformWidth,height:200*4,channels:4,pageHeight:200}}).webp({lossless:true,loop:0,delay:[140,140,140,140]}).toFile(fileURLToPath(new URL('docs/soldados-por-cenario-2026-11-13.webp',root)));
console.log('Saved '+uniforms.length+' regional uniforms with four real running frames each.');
