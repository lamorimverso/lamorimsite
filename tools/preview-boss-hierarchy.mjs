#!/usr/bin/env node
// Optional QA artwork: requires @napi-rs/canvas and sharp.
import {createCanvas,Image} from '@napi-rs/canvas';
import sharp from 'sharp';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {STAGES} from '../tanahoraflavio/runner-route-data.mjs';
import {storyBossAt,STORY_ENCOUNTERS} from '../tanahoraflavio/runner-bosses.mjs';
const root=new URL('../tanahoraflavio/',import.meta.url),artURL=new URL('runner-boss-art.mjs',root);
globalThis.Image=class extends Image{set src(v){this.url=v;super.src=fileURLToPath(v);}get src(){return this.url;}get naturalWidth(){return this.width;}get naturalHeight(){return this.height;}};
const source=await readFile(artURL,'utf8'),spec=source.match(/from ["']([^"']*runner-sprites[^"']*)["']/)[1],sprites=await import(new URL(spec,artURL));await sprites.loadSprites();
const {drawHoverEnemy}=await import(artURL),{drawCompleteWeapon}=await import(new URL('runner-weapon-art.mjs',root)),{drawThreat}=await import(new URL('runner-art.mjs',root));
const flags=[{preparing:true,progress:.1},{preparing:true,progress:.9},{attacking:true,progress:.05},{recovering:true,progress:.4}],frames=[];
for(let frame=0;frame<4;frame++){
 const img=createCanvas(960,STAGES.length*220),c=img.getContext('2d');c.fillStyle='#edf0f2';c.fillRect(0,0,img.width,img.height);
 for(let index=0;index<STORY_ENCOUNTERS;index++){
  const b=storyBossAt(index),left=b.slot*240,top=b.stageIndex*220;
  c.fillStyle='#43505f';c.textAlign='center';c.font='bold 14px sans-serif';c.fillText(b.name,left+120,top+24);
  c.font='11px sans-serif';c.fillText(STAGES[b.stageIndex].short+' · Nível '+b.rank+' · '+b.rankName,left+120,top+43);
  c.fillStyle='#657384';c.fillText(b.powerName,left+120,top+200);
  drawHoverEnemy(c,{type:b.type,x:left+94,y:top+153,phase:0,reducedMotion:true,classId:b.classId,armyVariant:STAGES[b.stageIndex].id,enraged:frame===3&&b.type==='santiago',...flags[frame]});
  const weapon=b.attackTypes[frame%b.attackTypes.length];c.save();c.translate(left+191,top+132);
  if(!drawCompleteWeapon(c,{type:weapon,width:34,height:40,phase:frame*4}))drawThreat(c,{type:weapon,x:-17,width:34,height:40,action:'jump'},0,frame*4,{weaponEffects:false});
  c.restore();
 }
 frames.push(await sharp(img.toBuffer('image/png')).ensureAlpha().raw().toBuffer());
}
const width=960,pageHeight=STAGES.length*220;
await sharp(Buffer.concat(frames),{raw:{width,height:pageHeight*4,channels:4,pageHeight}}).webp({lossless:true,loop:0,delay:[450,450,220,500]}).toFile(fileURLToPath(new URL('docs/chefes-hierarquia-2026-11-13.webp',root)));
await sharp(frames[2],{raw:{width,height:pageHeight,channels:4}}).webp({lossless:true}).toFile(fileURLToPath(new URL('docs/chefes-poderes-2026-11-13.webp',root)));
console.log('Rendered24 bosses, six destinations, four ranks, exclusive power families and complete illustrated poses.');
