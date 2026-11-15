import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);let canvas;try{canvas=require('@napi-rs/canvas');}catch{}
async function setup(t){
 const {Image}=canvas,prior=Object.getOwnPropertyDescriptor(globalThis,'Image');
 globalThis.Image=class extends Image{set src(v){super.src=fileURLToPath(v);}get naturalWidth(){return this.width;}get naturalHeight(){return this.height;}};
 t.after(()=>prior?Object.defineProperty(globalThis,'Image',prior):delete globalThis.Image);
 const url=new URL('../runner-character-art.mjs',import.meta.url),source=readFileSync(url,'utf8'),spec=source.match(/from ["']([^"']*runner-sprites[^"']*)["']/)[1];
 const sprites=await import(new URL(spec,url));await sprites.loadSprites(()=>{},{coreOnly:true});return {sprites,art:await import(url)};
}
function bounds(c){const {data,width,height}=c.getImageData(0,0,c.canvas.width,c.canvas.height);let x0=width,x1=-1,y0=height,y1=-1,n=0;for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(data[(y*width+x)*4+3]>64){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);n++;}return {x0,x1,y0,y1,n};}
test('new complete crouches render four grounded full-body poses at actual runtime size and mirror around the feet',{skip:!canvas},async t=>{
 const {sprites}=await setup(t),phases=[];
 for(let phase=0;phase<4;phase++){
  const poses=[];
  for(const facing of [1,-1]){
   const c=canvas.createCanvas(260,180).getContext('2d'),draw=c.drawImage.bind(c),calls=[];c.drawImage=(...args)=>{calls.push(args);draw(...args);};
   assert.equal(sprites.drawSpriteActor(c,{type:'flavio',x:130,y:150,scale:.95,landing:true,phase,facing}),true);assert.equal(calls.length,1,'complete source pose, no detached head');
   const b=bounds(c);assert.ok(b.n>400);assert.ok(b.y0>=107&&b.y1<=150&&b.y1>=149,'44px crouch with shoes on baseline');poses.push(b);
   if(facing===1)phases.push(Buffer.from(c.getImageData(0,0,260,180).data).toString('base64'));
  }
  assert.ok(Math.abs(poses[0].x0+poses[1].x1-259)<=1,'feet anchor stays fixed when facing changes');assert.equal(poses[0].y1,poses[1].y1);
 }
 assert.equal(new Set(phases).size,4);
});
test('release, recoil and recovery render distinct complete low poses and muzzle flash touches the new barrel',{skip:!canvas},async t=>{
 const {art}=await setup(t),{heroShotPose}=await import('../runner-hero-shot.mjs');
 for(const facing of [-1,1]){
  const states=[];for(const age of [0,.08,.18]){
   const c=canvas.createCanvas(260,180).getContext('2d');assert.equal(art.drawHeroShot(c,{x:130,y:150,crouching:true,age,facing}),true);
   const b=bounds(c);assert.ok(b.n>400);assert.ok(b.y0>=107&&b.y1>=149&&b.y1<=150);states.push(Buffer.from(c.getImageData(0,0,260,180).data).toString('base64'));
   if(age===0){const p=heroShotPose({age,crouching:true,facing}),pixels=c.getImageData(Math.round(130+p.muzzle.x+facing*5)-3,Math.round(150+p.muzzle.y)-3,7,7).data;assert.ok(pixels.some((v,i)=>i%4===0&&v>230&&pixels[i+1]>150&&pixels[i+2]<220&&pixels[i+3]>100),'flash beside drawn IVER barrel');}
  }
  assert.equal(new Set(states).size,3);
 }
});
