import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createCanvas,Image} from '@napi-rs/canvas';
import {fileURLToPath} from 'node:url';
import {campaignActors,campaignDefinitions} from '../tanahoraflavio/runner-campaign-sprite-data.mjs';
import {loadSprites} from '../tanahoraflavio/runner-art.mjs';
import {drawCampaignBoss,drawCampaignCrowd,drawCampaignPortrait} from '../tanahoraflavio/runner-campaign-art.mjs';
import {standingEnemyPose} from '../tanahoraflavio/runner-cast-pose.mjs';

test('os dez personagens e a multidão têm quatro desenhos inteiros em atlas transparentes',async()=>{
 assert.equal(Object.keys(campaignActors).length,11);
 for(const d of Object.values(campaignDefinitions)){
  const bytes=await readFile(new URL(d.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),d.sha256);
 }
 const previous=globalThis.Image;
 globalThis.Image=class extends Image{
  set src(value){super.src=fileURLToPath(value);}
  get naturalWidth(){return this.width;}
  get naturalHeight(){return this.height;}
 };
 try{
  await loadSprites(()=>{},{coreOnly:true});
  for(const [type,actor] of Object.entries(campaignActors)){
   const d=campaignDefinitions[actor.sheet],hashes=[];
   for(const [index,flags] of [{},{preparing:true},{attacking:true},{recovering:true}].entries()){
    const canvas=createCanvas(250,180),c=canvas.getContext('2d');
    let draws=0;const draw=c.drawImage.bind(c);c.drawImage=(...args)=>{draws++;draw(...args);};
    if(type==='povo')drawCampaignCrowd(c,{x:125,y:155,reducedMotion:true,...flags});
    else{c.translate(125,155);drawCampaignBoss(c,{type,pose:standingEnemyPose({...flags,reducedMotion:true})});}
    assert.equal(draws,1,type+' deve usar uma figura ilustrada completa');
    const pixels=c.getImageData(0,0,250,180).data;let count=0,bottom=0;
    for(let y=0;y<180;y++)for(let x=0;x<250;x++)if(pixels[(y*250+x)*4+3]>128){count++;bottom=Math.max(bottom,y);}
    assert.ok(count>1200,type+' figura visível');assert.ok(bottom>=153&&bottom<=155,type+' sola no apoio');
    hashes.push(createHash('sha256').update(pixels).digest('hex'));
    const frame=d.frames[actor.row*4+index];
    assert.ok(frame.width>0&&frame.height>0&&frame.x>=0&&frame.y>=0&&frame.x+frame.width<=d.width&&frame.y+frame.height<=d.height);
   }
   assert.equal(new Set(hashes).size,4,type+' quatro poses diferentes');
   const c=createCanvas(120,120).getContext('2d');let portraits=0;const draw=c.drawImage.bind(c);
   c.drawImage=(...args)=>{portraits++;draw(...args);};
   assert.equal(drawCampaignPortrait(c,{type,x:60,y:90,size:58}),true);
   assert.equal(portraits,1,type+' retrato deve vir do novo atlas');
  }
 }finally{if(previous)globalThis.Image=previous;else delete globalThis.Image;}
});
