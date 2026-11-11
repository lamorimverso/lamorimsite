import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);let canvas;try{canvas=require('@napi-rs/canvas');}catch{if(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES)try{canvas=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/@napi-rs/canvas');}catch{}}
test('virar o corpo muda a orientação real sem deslocar o retângulo visível',{skip:!canvas},async t=>{
 const {createCanvas,Image}=canvas,previous=Object.getOwnPropertyDescriptor(globalThis,'Image');
 globalThis.Image=class extends Image{set src(v){this.url=v;super.src=fileURLToPath(v);}get src(){return this.url;}get naturalWidth(){return this.width;}get naturalHeight(){return this.height;}};
 t.after(()=>previous?Object.defineProperty(globalThis,'Image',previous):delete globalThis.Image);
 const sprites=await import('../runner-sprites.mjs');await sprites.loadSprites();
 function draw(type,phase,facing){const img=createCanvas(300,180),c=img.getContext('2d');assert.equal(sprites.drawSpriteActor(c,{type,x:150,y:150,phase,facing}),true);const pixels=c.getImageData(0,0,300,180).data;let min=300,max=-1;for(let y=0;y<180;y++)for(let x=0;x<300;x++)if(pixels[(y*300+x)*4+3]>40){min=Math.min(min,x);max=Math.max(max,x);}return {pixels,min,max};}
 for(const type of ['flavio','pf','jacare'])for(const phase of [0,1,2,3]){
  const right=draw(type,phase,1),left=draw(type,phase,-1);assert.notDeepEqual(right.pixels,left.pixels,type+' deve virar');
  assert.ok(Math.abs(right.min-left.min)<=1&&Math.abs(right.max-left.max)<=1,type+' mantém tamanho e envelope ao virar');
 }
});
