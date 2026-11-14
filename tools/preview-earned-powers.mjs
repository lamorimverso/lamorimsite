import {createCanvas,Image} from '@napi-rs/canvas';import sharp from 'sharp';import {readFile} from 'node:fs/promises';import {fileURLToPath} from 'node:url';
const root=new URL('../tanahoraflavio/',import.meta.url),url=new URL('runner-character-art.mjs',root),source=await readFile(url,'utf8'),spec=source.match(/from ["']([^"']*runner-sprites[^"']*)["']/)[1];
globalThis.Image=class extends Image{set src(v){super.src=fileURLToPath(v);}get naturalWidth(){return this.width;}get naturalHeight(){return this.height;}};
const sprites=await import(new URL(spec,url));await sprites.loadSprites();const {HERO_POWERS}=await import(new URL('runner-earned-powers.mjs',root)),{drawHeroProjectile}=await import(new URL('runner-hero-shot.mjs',root));
const frames=[];
for(let frame=0;frame<4;frame++){
 const canvas=createCanvas(960,850),c=canvas.getContext('2d');c.fillStyle='#edf2f5';c.fillRect(0,0,960,850);
 for(const [index,[id,power]] of Object.entries(HERO_POWERS).entries()){
  const left=index%3*320,top=Math.floor(index/3)*170;c.fillStyle='#35425b';c.font='bold 14px sans-serif';c.textAlign='center';c.fillText(power.name,left+160,top+22,300);c.font='11px sans-serif';c.fillText(power.description,left+160,top+43,300);
  sprites.drawCombatSprite(c,{type:'flavio',x:left+83,y:top+151,scale:.9,frame:frame===0?0:2,facing:1});
  for(let i=0;i<(power.shots||1);i++)drawHeroProjectile(c,{powerId:id,type:id==='ivermectina'?'hero-ivermectina':power.projectiles?.[i]||power.projectile,behavior:power.behavior,x:left+210+frame*5,y:64+(i-(power.shots-1)/2)*15,vx:500,vy:0,age:.1+frame*.11},top+151);
 }
 frames.push(await sharp(canvas.toBuffer('image/png')).ensureAlpha().raw().toBuffer());
}
await sharp(Buffer.concat(frames),{raw:{width:960,height:3400,channels:4,pageHeight:850}}).webp({lossless:true,loop:0,delay:220}).toFile(fileURLToPath(new URL('docs/poderes-conquistados-2026-11-14.webp',root)));
