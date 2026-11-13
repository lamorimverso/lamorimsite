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
test('perseguidores de solo têm altura comparável ao herói e mantêm quadros reais de corrida',{skip:!canvas},async t=>{
 const {readFileSync}=await import('node:fs');
 const {createCanvas,Image}=canvas,previous=Object.getOwnPropertyDescriptor(globalThis,'Image');
 globalThis.Image=class extends Image{set src(v){this.url=v;super.src=fileURLToPath(v);}get src(){return this.url;}get naturalWidth(){return this.width;}get naturalHeight(){return this.height;}};
 t.after(()=>previous?Object.defineProperty(globalThis,'Image',previous):delete globalThis.Image);
 const url=new URL('../runner-art.mjs',import.meta.url),source=readFileSync(url,'utf8');
 const spec=source.match(/from ["']([^"']*runner-sprites[^"']*)["']/)[1];await (await import(new URL(spec,url))).loadSprites();
 const {drawThreat,drawActor}=await import(url);
 function render(type,phase){const c=createCanvas(320,200).getContext('2d');if(type==='flavio')drawActor(c,{type,x:150,y:160,scale:.95,phase});else drawThreat(c,{type,x:133,width:34,height:58,action:'jump'},160,phase);const pixels=c.getImageData(0,0,320,200).data;let min=200,max=-1;for(let y=0;y<200;y++)for(let x=0;x<320;x++)if(pixels[(y*320+x)*4+3]>80){min=Math.min(min,y);max=Math.max(max,y);}return {height:max-min+1,pixels};}
 const hero=render('flavio',0);
 for(const type of ['pf','army','janones','boulos','dino','xandao','haddad','lula','dilma','simone','soraya']){
  const frames=[0,1,2,3].map(p=>render(type,p));
  for(const frame of frames)assert.ok(frame.height>=hero.height*.8&&frame.height<=hero.height*1.2,`${type}: ${frame.height}px vs ${hero.height}px`);
  assert.notDeepEqual(frames[0].pixels,frames[2].pixels,type+' corre em quadros distintos');
 }
});
