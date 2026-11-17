// Native-size flight review, with the original vector fallback captured first.
import {createCanvas,Image} from '@napi-rs/canvas';
import sharp from 'sharp';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=new URL('../tanahoraflavio/',import.meta.url),weaponURL=new URL('runner-weapon-art.mjs',root);
const weaponSource=await readFile(weaponURL,'utf8');
const {drawCompleteWeapon}=await import(weaponURL);
const sprites=await import(new URL(weaponSource.match(/from ["']([^"']*runner-sprites[^"']*)["']/)[1],weaponURL));
const types=['handcuffs','microphone','hammer','mandado','receipts','budget-sheets','parachute-cross','lhand'];
const sizes={handcuffs:[46,72],microphone:[46,72],hammer:[46,44],mandado:[42,44],receipts:[44,40],'budget-sheets':[46,72],'parachute-cross':[46,72],lhand:[60,46]};
const width=1080,height=700,old=[];
for(let frame=0;frame<4;frame++){
 const canvas=createCanvas(width,height),c=canvas.getContext('2d');
 for(const [i,type] of types.entries()){
  const left=i%4*270,top=220+Math.floor(i/4)*220,[w,h]=sizes[type];
  c.save();c.translate(left+44,top+106);drawCompleteWeapon(c,{type,width:w,height:h,phase:frame*1.44});c.restore();
 }
 c.save();c.translate(152,188);drawCompleteWeapon(c,{type:'handcuffs',width:46,height:72,phase:frame*1.44});c.restore();
 old.push(canvas);
}
globalThis.Image=class extends Image{set src(v){super.src=fileURLToPath(v);}get naturalWidth(){return this.width;}get naturalHeight(){return this.height;}};
await sprites.loadSprites(()=>{},{coreOnly:true});
const pages=[];
for(let frame=0;frame<4;frame++){
 const canvas=createCanvas(width,height),c=canvas.getContext('2d');c.fillStyle='#edf2f5';c.fillRect(0,0,width,height);
 c.fillStyle='#293548';c.font='bold 22px sans-serif';c.fillText('Signature objects · complete illustrated poses',22,32);
 c.font='14px sans-serif';c.fillText('Native gameplay size + 2× detail · no particles · '+frame*60+' ms of a 240 ms flight',22,56);
 c.font='bold 14px sans-serif';c.fillText('PF: previous',28,88);c.fillText('PF: illustrated',292,88);
 sprites.drawSpriteActor(c,{type:'pf',x:70,y:188,phase:0});
 sprites.drawSpriteActor(c,{type:'pf',x:334,y:188,phase:0});
 c.drawImage(old[frame],0,0);
 c.save();c.translate(416,188);drawCompleteWeapon(c,{type:'handcuffs',width:46,height:72,phase:frame*1.44});c.restore();
 c.fillStyle='#63778b';c.font='13px sans-serif';c.fillText('Dark ink · warm highlights · cool material shadows',570,120);
 c.fillText('Four actual articulated poses, held 60 ms each',570,145);
 for(const [i,type] of types.entries()){
  const left=i%4*270,top=220+Math.floor(i/4)*220,[w,h]=sizes[type];
  c.fillStyle='#293548';c.font='bold 14px sans-serif';c.fillText(type,left+16,top+20);
  c.fillStyle='#63778b';c.font='12px sans-serif';c.fillText('before',left+20,top+145);c.fillText('after',left+94,top+145);c.fillText('detail 2×',left+177,top+190);
  for(const [scale,x,y] of [[1,left+118,top+106],[2,left+211,top+166]]){
   c.save();c.translate(x,y);c.scale(scale,scale);drawCompleteWeapon(c,{type,width:w,height:h,phase:frame*1.44});c.restore();
  }
 }
 const png=canvas.toBuffer('image/png');
 if(frame===0)await sharp(png).webp({lossless:true}).toFile(fileURLToPath(new URL('docs/signature-props-review-2026-11-16.webp',root)));
 pages.push(await sharp(png).ensureAlpha().raw().toBuffer());
}
await sharp(Buffer.concat(pages),{raw:{width,height:height*4,channels:4,pageHeight:height}}).webp({lossless:true,loop:0,delay:60}).toFile(fileURLToPath(new URL('docs/signature-props-animated-2026-11-16.webp',root)));
console.log('Saved native-size PF comparison and four-pose flight animation.');
