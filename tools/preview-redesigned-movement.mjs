// Render the actual runtime drawings into a reviewable animated atlas preview.
import {createCanvas,Image} from '@napi-rs/canvas';
import sharp from 'sharp';
import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {loadSprites,drawActor} from '../tanahoraflavio/runner-art.mjs';
import {drawHoverEnemy} from '../tanahoraflavio/runner-boss-art.mjs';
globalThis.Image=class extends Image{
 set src(value){super.src=fileURLToPath(value);}
 get naturalWidth(){return this.width;}
 get naturalHeight(){return this.height;}
};
await loadSprites();
const width=1000,height=650,frames=[];
const actors=[['haddad','Haddad'],['lula','Lula'],['xandao','Xandão'],['joice','Joice'],['ana-elisa','Ana Elisa'],['rick','Rick'],['erika','Erika'],['maestro','Maestro'],['pf','PF'],['dilma','Dilma'],['trump','Trump'],['jacare','Jacaré']];
const poses=[{}, {phase:7}, {preparing:true,progress:.4}, {preparing:true,progress:.9}, {attacking:true,progress:0}, {attacking:true,progress:.4}, {recovering:true,progress:.2}, {recovering:true,progress:.9}];
for(let i=0;i<16;i++){
 const canvas=createCanvas(width,height),c=canvas.getContext('2d');
 c.fillStyle='#17283a';c.fillRect(0,0,width,height);c.fillStyle='#f7edd8';c.font='bold 23px sans-serif';c.fillText('Corre, Flávio! · desenhos e movimento',24,36);
 for(const [j,[type,label]] of actors.entries()){
  const col=j%4,row=Math.floor(j/4),x=125+col*250,y=210+row*200;
  c.fillStyle='#20374b';c.fillRect(col*250+8,57+row*200,234,188);
  c.strokeStyle='#6e8e99';c.lineWidth=1;c.beginPath();c.moveTo(x-85,y+1);c.lineTo(x+85,y+1);c.stroke();
  if(j<8)drawHoverEnemy(c,{type,x,y,scale:1.05,...poses[i%8]});
  else drawActor(c,{type,x,y,scale:type==='jacare'?2:1.05,phase:i/2,facing:-1});
  c.fillStyle='#f7edd8';c.textAlign='center';c.font='bold 15px sans-serif';c.fillText(label,x,y+27);c.textAlign='left';
 }
 frames.push(canvas.getContext('2d').getImageData(0,0,width,height).data);
}
const bytes=Buffer.concat(frames.map(f=>Buffer.from(f)));
const out=process.argv[2]||fileURLToPath(new URL('../tanahoraflavio/docs/elenco-movimento-2026-11-20.webp',import.meta.url));
await writeFile(out,await sharp(bytes,{raw:{width,height:height*frames.length,channels:4,pageHeight:height}}).webp({quality:85,loop:0,delay:Array(frames.length).fill(100)}).toBuffer());
console.log(out);
