import {createCanvas,Image} from '@napi-rs/canvas';
import sharp from 'sharp';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=new URL('../tanahoraflavio/',import.meta.url),url=new URL('runner-character-art.mjs',root),source=await readFile(url,'utf8');
globalThis.Image=class extends Image{set src(v){super.src=fileURLToPath(v);}get naturalWidth(){return this.width;}get naturalHeight(){return this.height;}};
const sprites=await import(new URL(source.match(/from ["']([^"']*runner-sprites[^"']*)["']/)[1],url));await sprites.loadSprites(()=>{},{coreOnly:true});
const canvas=createCanvas(1000,680),c=canvas.getContext('2d');c.fillStyle='#edf2f5';c.fillRect(0,0,1000,680);
for(let row=0;row<2;row++)for(let phase=0;phase<4;phase++){
 const left=phase*250,top=row*340,x=left+115,y=top+218;
 c.fillStyle='#293548';c.font='bold 16px sans-serif';c.textAlign='center';c.fillText((row?'IVER · ':'Agacha · ')+['Entrada / mira','Deslize / recuo','Peso / disparo','Apoio / retorno'][phase],left+125,top+26);
 c.strokeStyle='#c7d2d9';c.lineWidth=1;c.beginPath();c.moveTo(left+12,y);c.lineTo(left+238,y);c.stroke();
 if(row)sprites.drawCombatSprite(c,{type:'flavio-slide-shot',x,y,scale:3,frame:phase});
 else sprites.drawSpriteActor(c,{type:'flavio',x,y,scale:3,landing:true,phase});
 c.font='12px sans-serif';c.fillStyle='#526477';c.fillText('3× · corpo inteiro',left+125,top+243);
 for(const facing of [1,-1]){
  const xx=left+(facing===1?72:178),yy=top+309;
  if(row)sprites.drawCombatSprite(c,{type:'flavio-slide-shot',x:xx,y:yy,scale:.95,frame:phase,facing});
  else sprites.drawSpriteActor(c,{type:'flavio',x:xx,y:yy,scale:.95,landing:true,phase,facing});
 }
 c.fillText('Tamanho do jogo · 41,8 px · ↔',left+125,top+331);
}
const path=fileURLToPath(new URL('docs/flavio-crouch-review-2026-11-15.webp',root));await sharp(canvas.toBuffer('image/png')).webp({lossless:true}).toFile(path);console.log(path);
