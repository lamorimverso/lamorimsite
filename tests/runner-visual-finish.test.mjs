import test from 'node:test';
import assert from 'node:assert/strict';
import {createCanvas} from '@napi-rs/canvas';
import {drawJourneyFinish,drawBossAccent,drawImpactFinish,campaignResultText} from '../tanahoraflavio/runner-visual-finish.mjs';
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
