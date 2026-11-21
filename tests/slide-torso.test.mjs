import test from 'node:test';
import assert from 'node:assert/strict';
import {createCanvas,Image} from '@napi-rs/canvas';
import {fileURLToPath} from 'node:url';
import * as actions from '../tanahoraflavio/runner-hero-actions.mjs';
import {heroShotPose} from '../tanahoraflavio/runner-hero-shot.mjs';

test('sliding shot physics uses the barrel of the replacement sliding drawing',()=>{
 assert.equal(typeof actions.heroActionMuzzleFor,'function');
 for(const [state,age] of [['release',0],['recoil',.08]])for(const facing of [-1,1]){
  const point=actions.heroActionMuzzleFor(state,facing);
  assert.deepEqual(heroShotPose({age,crouching:true,sliding:true,facing}).muzzle,point);
 }
});
test('the sustained slide has visible jacket volume above the hips, not a flat strip',async t=>{
 const previous=Object.getOwnPropertyDescriptor(globalThis,'Image');
 globalThis.Image=class extends Image{set src(v){super.src=fileURLToPath(v)}get naturalWidth(){return this.width}get naturalHeight(){return this.height}};
 t.after(()=>previous?Object.defineProperty(globalThis,'Image',previous):delete globalThis.Image);
 const {drawActor,loadSprites}=await import('../tanahoraflavio/runner-art.mjs');await loadSprites();
 const c=createCanvas(360,360).getContext('2d');c.scale(3,3);
 drawActor(c,{type:'flavio',x:60,y:104,scale:.95,landing:true,sliding:true,slidePhase:.52});
 const data=c.getImageData(0,0,360,360).data;let rows=0;
 for(let y=-26;y<=-17;y++){
  let purple=0;
  for(let x=-24;x<2;x++){
   const i=(Math.round((104+y)*3)*360+Math.round((60+x)*3))*4;
   const [r,g,b,a]=data.slice(i,i+4);if(a>128&&r>35&&b>r*.95&&b>g*1.3)purple++;
  }
  if(purple>=4)rows++;
 }
 assert.ok(rows>=6,'the jacket must occupy at least six distinct torso rows above the hips; got '+rows);
});
