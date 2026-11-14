import {createCanvas,Image} from '@napi-rs/canvas';
import sharp from 'sharp';
import {fileURLToPath} from 'node:url';import {readFile} from 'node:fs/promises';
const root=new URL('../tanahoraflavio/',import.meta.url),url=new URL('runner-character-art.mjs',root),src=await readFile(url,'utf8'),spec=src.match(/from ["']([^"']*runner-sprites[^"']*)["']/)[1];
globalThis.Image=class extends Image{set src(v){super.src=fileURLToPath(v);}get naturalWidth(){return this.width;}get naturalHeight(){return this.height;}};
const sprites=await import(new URL(spec,url));await sprites.loadSprites();const {combatGeometryFor}=await import(new URL('runner-combat-geometry.mjs',root));const {drawHeroProjectile}=await import(new URL('runner-hero-shot.mjs',root));
const frames=[],flags=['Em pé','No ar','Deslizando'],types=['flavio','flavio-air-shot','flavio-slide-shot'];
for(let frame=0;frame<4;frame++){
 const canvas=createCanvas(1000,510),c=canvas.getContext('2d');c.fillStyle='#edf2f5';c.fillRect(0,0,1000,510);
 for(let row=0;row<3;row++)for(let col=0;col<4;col++){
  const type=types[row],x=col*250+85,y=row*170+145;
  c.fillStyle='#334458';c.font='bold 14px sans-serif';c.textAlign='center';c.fillText(flags[row]+' · '+['Prepara','Recuo','Dispara','Retorna'][col],col*250+125,row*170+22);
  sprites.drawCombatSprite(c,{type,x,y,scale:1,frame:col,facing:1});
  if(col===2){const g=combatGeometryFor(type,{frame:2,scale:1,facing:1});drawHeroProjectile(c,{x:x+g.muzzle.x+24+frame*6,y:-(g.muzzle.y),vx:760,vy:0,age:.1},y);}
 }
 frames.push(await sharp(canvas.toBuffer('image/png')).ensureAlpha().raw().toBuffer());
}
await sharp(Buffer.concat(frames),{raw:{width:1000,height:2040,channels:4,pageHeight:510}}).webp({lossless:true,loop:0,delay:180}).toFile(fileURLToPath(new URL('docs/flavio-ivermectina-2026-11-14.webp',root)));
