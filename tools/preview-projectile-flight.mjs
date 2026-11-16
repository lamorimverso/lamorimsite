// Optional visual QA: use the same native canvas/sharp tools as other art previews.
import {createCanvas} from '@napi-rs/canvas';
import sharp from 'sharp';
import {fileURLToPath} from 'node:url';
import {drawCompleteWeapon,COMPLETE_WEAPONS} from '../tanahoraflavio/runner-weapon-art.mjs';
import {CAMPAIGN_PROP_COLORS} from '../tanahoraflavio/runner-campaign-art.mjs';
const sizes={hammer:[46,44],mandado:[42,44],microphone:[46,40],handcuffs:[46,40],barrier:[44,32],stamp:[44,36],message:[44,36],lhand:[60,46],receipts:[44,40],'paper-gate':[44,40],'budget-sheets':[46,42],'parachute-cross':[46,44],'cloroquina-prop':[52,38],'ivermectina-prop':[52,38],'rolling-case':[40,30],'falling-case':[36,36],case:[34,28],popcorn:[40,35],wind:[46,44],'court-seal':[44,44],'signal-flare':[38,42],'terere-gourd':[44,44],'harp-note':[42,44]};
const types=[...COMPLETE_WEAPONS,...Object.keys(CAMPAIGN_PROP_COLORS)],width=960,height=60+Math.ceil(types.length/4)*140,frames=[];
const output=new URL('../tanahoraflavio/docs/',import.meta.url);
for(let frame=0;frame<8;frame++){
 const canvas=createCanvas(width,height),c=canvas.getContext('2d'),age=frame*.04;
 c.fillStyle='#edf2f5';c.fillRect(0,0,width,height);c.fillStyle='#35425b';c.font='bold 18px sans-serif';c.fillText('Objetos em voo · tamanho real e ampliação 2× · sem partículas',20,27);
 c.font='12px sans-serif';c.fillText(`Fase real do motor: ${(age*1000).toFixed(0)} ms × 24 · apenas partes do objeto se movem`,20,47);
 for(const [index,type] of types.entries()){
  const left=index%4*240,top=60+Math.floor(index/4)*140,[w,h]=sizes[type]||[46,40];
  c.fillStyle='#35425b';c.font='bold 12px sans-serif';c.fillText(type,left+12,top+15);c.font='10px sans-serif';c.fillText(`${w}×${h} px`,left+12,top+31);
  for(const [scale,x,y] of [[1,left+47,top+107],[2,left+162,top+125]]){
   c.strokeStyle='#c5d1d9';c.lineWidth=1;c.beginPath();c.moveTo(x-w*scale*.55,y);c.lineTo(x+w*scale*.55,y);c.stroke();
   c.save();c.translate(x,y);c.scale(scale,scale);drawCompleteWeapon(c,{type,width:w,height:h,phase:age*24});c.restore();
  }
 }
 const png=canvas.toBuffer('image/png');
 if(frame===4)await sharp(png).webp({lossless:true}).toFile(fileURLToPath(new URL('objetos-voo-quadro-2026-11-16.webp',output)));
 frames.push(await sharp(png).ensureAlpha().raw().toBuffer());
}
await sharp(Buffer.concat(frames),{raw:{width,height:height*frames.length,channels:4,pageHeight:height}}).webp({lossless:true,loop:0,delay:40}).toFile(fileURLToPath(new URL('objetos-voo-animado-2026-11-16.webp',output)));
console.log('Saved eight actual-flight frames at 40ms intervals, native-size plus 2×, with effects disabled.');
