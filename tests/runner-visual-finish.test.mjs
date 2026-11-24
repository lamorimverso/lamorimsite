import test from 'node:test';
import assert from 'node:assert/strict';
import {createCanvas} from '@napi-rs/canvas';
import {drawJourneyFinish,drawBossAccent,drawImpactFinish,campaignResultText,localParallaxFor,journeyFinishTones} from '../tanahoraflavio/runner-visual-finish.mjs';
const pixels=(draw)=>{const c=createCanvas(480,300).getContext('2d');draw(c);return c;};
test('finish leaves flight void free and only decorates the route below the floor',()=>{
 const flight=pixels(c=>drawJourneyFinish(c,{width:480,flight:true}));
 const ground=pixels(c=>drawJourneyFinish(c,{width:480}));
 assert.equal(flight.getImageData(200,290,1,1).data[3],0);
 assert.ok(ground.getImageData(200,290,1,1).data[3]>0);
 assert.equal(ground.getImageData(200,200,1,1).data[3],0);
});
test('reduced motion fixes foreground pattern while normal parallax changes',()=>{
 const frame=(distance,reducedMotion)=>pixels(c=>drawJourneyFinish(c,{width:480,distance,reducedMotion})).getImageData(0,285,480,15).data;
 assert.deepEqual(frame(0,true),frame(54,true));
 assert.notDeepEqual(frame(0,false),frame(54,false));
});
test('boss phase accents and impact are bounded and keep source state unchanged',()=>{
 const state={x:340,y:246,ground:246,preparing:true,action:'move',progress:.5,enraged:true};
 const before=JSON.stringify(state),c=pixels(c=>{drawBossAccent(c,state);drawImpactFinish(c,{x:80,y:230,remaining:.18});});
 assert.equal(JSON.stringify(state),before);
 assert.ok(c.getImageData(320,180,60,75).data.some((v,i)=>i%4===3&&v>0));
 assert.equal(c.getImageData(0,0,1,1).data[3],0);
});
test('campaign result shows actual completed stages and passports',()=>{
 assert.match(campaignResultText({bossesDefeated:17,passports:23},12500),/17 etapas concluídas.*23 passaportes/);
});

test('local background moves left continuously even while geographic route is held',()=>{
 for(const width of [480,900]){
  const a=localParallaxFor({width,distance:1000}),b=localParallaxFor({width,distance:1100});
  assert.ok(a[0].scale<a[1].scale);
  for(let layer=0;layer<2;layer++){
   for(const tile of a[layer].tiles){
    const next=b[layer].tiles.find(t=>t.index===tile.index);
    if(next)assert.ok(Math.abs(next.x-tile.x+100*a[layer].scale)<1e-8);
   }
  }
  assert.deepEqual(localParallaxFor({width,distance:1000,reducedMotion:true}),localParallaxFor({width,distance:9000,reducedMotion:true}));
 }
});
test('regional finish colors feather through the boundary instead of jumping',()=>{
 const transition={from:{id:'brasilia'},to:{id:'rio'}};
 assert.deepEqual(journeyFinishTones('brasilia',{...transition,progress:0}),journeyFinishTones('brasilia'));
 assert.deepEqual(journeyFinishTones('rio',{...transition,progress:1}),journeyFinishTones('rio'));
 const before=journeyFinishTones('brasilia',{...transition,progress:.49999}),after=journeyFinishTones('rio',{...transition,progress:.50001});
 for(let i=0;i<2;i++)for(const ch of [1,3,5])assert.ok(Math.abs(parseInt(before[i].slice(ch,ch+2),16)-parseInt(after[i].slice(ch,ch+2),16))<=1);
});
