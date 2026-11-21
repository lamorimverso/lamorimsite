import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {crouchDefinition as atlas} from '../tanahoraflavio/runner-crouch-sprite-data.mjs';
import {combatActors} from '../tanahoraflavio/runner-combat-sprite-data.mjs';
import {combatGeometryFor} from '../tanahoraflavio/runner-combat-geometry.mjs';
import {heroShotPose} from '../tanahoraflavio/runner-hero-shot.mjs';
import {spriteDefinitions,spriteFrameFor,spriteScaleFor} from '../tanahoraflavio/runner-sprites.mjs';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');

test('dedicated crouch art preserves native transparent PNG pixels in lossless WebP',async()=>{
 const png=await readFile(new URL('../tanahoraflavio/assets/flavio-crouch-v1.png',import.meta.url)),webp=await readFile(new URL(atlas.url));
 const source=await sharp(png).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const decoded=await sharp(webp).ensureAlpha().raw().toBuffer();
 assert.equal(hash(webp),atlas.sha256);assert.equal(source.info.width,atlas.width);assert.equal(source.info.height,atlas.height);
 assert.ok(source.data.some((v,i)=>i%4===3&&v===0),'native transparent space');
 assert.ok(source.data.some((v,i)=>i%4===3&&v===255),'solid full characters');
 // WebP may zero RGB underneath alpha=0; every visible pixel is preserved.
 for(let i=0;i<decoded.length;i+=4){assert.equal(decoded[i+3],source.data[i+3]);if(decoded[i+3])for(let c=0;c<3;c++)assert.equal(decoded[i+c],source.data[i+c]);}
});

test('four complete neutral crouches have distinct grounded legs, readable necks, uniform scale and high-attack clearance',async()=>{
 assert.equal(spriteDefinitions.heroCrouch.sha256,atlas.sha256);
 const poses=[],feet=[];const factor=spriteScaleFor('flavio','heroCrouch',atlas.frames);
 for(let phase=0;phase<4;phase++){
  assert.deepEqual(spriteFrameFor('flavio',{landing:true,phase}),{sheet:'heroCrouch',index:phase});
  const f=atlas.frames[phase];assert.ok(f.width>300&&f.height>300,'whole drawing rather than a detached head');
  assert.ok(f.neck.x>f.x&&f.neck.x<f.x+f.width&&f.neck.y>f.y&&f.neck.y<f.groundY);
  assert.ok((f.groundY-f.y)*factor<=44.0001);assert.ok(f.height*factor<=45,'including safe crop padding');
  const {data,info}=await sharp(new URL(atlas.url).pathname).extract({left:f.x,top:f.y,width:f.width,height:f.height}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let sole=false;for(let y=info.height-5;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>128)sole=true;
  assert.ok(sole,'soles meet the measured baseline');poses.push(hash(data));
  feet.push(hash(await sharp(new URL(atlas.url).pathname).extract({left:f.x,top:f.groundY-70,width:f.width,height:70}).raw().toBuffer()));
 }
 assert.equal(new Set(poses).size,4);assert.equal(new Set(feet).size,4,'knees and shoes animate');
});

test('crouched firing uses the illustrated IVER barrel for physical release in both directions',async()=>{
 assert.deepEqual(combatActors['flavio-slide-shot'],{sheet:'heroCrouch',row:1,facing:1});
 const {data,info}=await sharp(new URL(atlas.url).pathname).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 for(let frame=0;frame<4;frame++)for(const facing of [-1,1]){
  const g=combatGeometryFor('flavio-slide-shot',{frame,facing,scale:.95}),f=atlas.frames[frame+4];
  assert.deepEqual(g.frame,f);assert.ok(g.rect.height<=45*.95);assert.equal(g.flip,facing);
  assert.equal(g.muzzle.x,(f.muzzle.x-f.center)*g.factor*facing);assert.equal(g.muzzle.y,(f.muzzle.y-f.groundY)*g.factor);
  assert.ok(f.muzzle.x>=f.x+f.width-8,'barrel tip at complete right edge');
  let barrel=false;for(let y=f.muzzle.y-3;y<=f.muzzle.y+3;y++)for(let x=f.muzzle.x-7;x<=f.muzzle.x;x++){
   const i=(y*info.width+x)*4;if(data[i+3]>128&&data[i+2]>data[i+1]*1.15)barrel=true;
  }
  assert.ok(barrel,'measured muzzle touches the actual purple barrel');
  if(frame===2){const {heroActionMuzzleFor}=await import('../tanahoraflavio/runner-hero-actions.mjs');assert.deepEqual(heroShotPose({age:0,crouching:true,facing}).muzzle,heroActionMuzzleFor('release',facing,false));}
 }
});
