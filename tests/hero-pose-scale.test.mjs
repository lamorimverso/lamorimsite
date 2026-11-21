import test from 'node:test';
import assert from 'node:assert/strict';
import {createCanvas,Image} from '@napi-rs/canvas';
import {fileURLToPath} from 'node:url';
import {imageComponents,facePixel} from '../tools/hero-image-components.mjs';
test('crouch, slide and low firing keep the running face scale, with only posture lowering the silhouette',async t=>{
 const previous=Object.getOwnPropertyDescriptor(globalThis,'Image');
 globalThis.Image=class extends Image{set src(v){super.src=fileURLToPath(v)}get naturalWidth(){return this.width}get naturalHeight(){return this.height}};
 t.after(()=>previous?Object.defineProperty(globalThis,'Image',previous):delete globalThis.Image);
 const {loadSprites,drawActor,drawHeroShot}=await import('../tanahoraflavio/runner-art.mjs');await loadSprites();
 const measure=(draw,args)=>{
  const c=createCanvas(600,420).getContext('2d');c.scale(3,3);draw(c,{type:'flavio',x:100,y:130,scale:.95,...args});
  const pixels=c.getImageData(0,0,600,420).data,face=imageComponents(pixels,600,420,facePixel)[0];
  const body=imageComponents(pixels,600,420,(d,i)=>d[i+3]>128)[0];return {face,body};
 };
 const running=measure(drawActor,{});
 const poses=[... [.22,.48,.85,1].map(crouchPose=>[drawActor,{landing:true,crouchPose}]),
  ...[.04,.14,.52,.94].map(slidePhase=>[drawActor,{landing:true,sliding:true,slidePhase}]),
  ...[false,true].flatMap(sliding=>[0,.08].map(age=>[drawHeroShot,{crouching:true,sliding,age}]))];
 for(const [draw,args] of poses){
  const {face,body}=measure(draw,args),ratio=face.width/running.face.width;
  assert.ok(ratio>=.95&&ratio<=1.05,'the face must stay at running scale: '+JSON.stringify({args,face,running:running.face,ratio}));
  assert.ok(face.height>=running.face.height*.9&&face.height<=running.face.height*1.15,'the head is never vertically squashed or miniaturized');
  assert.ok(Math.abs(body.y+body.height-390)<=3,'postures keep the same ground anchor');
 }
});
