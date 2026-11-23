import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createCanvas} from '@napi-rs/canvas';
import {bossArenaPose,bossPresentationFor} from '../tanahoraflavio/runner-bosses.mjs';
import {campaignAccentFor} from '../tanahoraflavio/runner-campaign-art.mjs';

const source=readFileSync(new URL('../tanahoraflavio/runner.mjs',import.meta.url),'utf8');
const start=source.indexOf('  function bossFigure(){'),end=source.indexOf('  function character(){',start);
const make=Function('env',`const {run,ctx,virtualWidth,WORLD,bossArenaPose,bossPresentationFor,campaignAccentFor,prefersReducedMotion,drawHoverEnemy}=env;${source.slice(start,end)};return bossFigure;`);
function render({width=480,critical=true,remaining=.8,reduced=false}={}){
 const ctx=createCanvas(width,300).getContext('2d'),labels=[];
 const fillText=ctx.fillText.bind(ctx);
 ctx.fillText=(text,x,y,maxWidth)=>{labels.push({text,x,y,maxWidth});fillText(text,x,y,maxWidth);};
 ctx.globalAlpha=.65;ctx.fillStyle='#345678';const priorAlpha=ctx.globalAlpha;
 const run={elapsed:4,obstacles:[],boss:{type:'jones',stageId:'brasilia',role:'optional',phase:'recover',phaseFor:.5,age:4,
  lastDamage:{amount:6.25,critical,remaining}}};
 make({run,ctx,virtualWidth:width,WORLD:{ground:246},bossArenaPose,bossPresentationFor,campaignAccentFor,
  prefersReducedMotion:()=>reduced,drawHoverEnemy:()=>{}})();
 assert.equal(ctx.globalAlpha,priorAlpha);
 return labels;
}
test('no floating PV or critical text is drawn over bosses at any viewport size',()=>{
 for(const width of [480,900])for(const critical of [false,true]){
  assert.deepEqual(render({width,critical}),[]);
 }
});
test('damage values are not drawn during reduced motion or while a hit expires',()=>{
 for(const reduced of [false,true])for(const remaining of [0,.4,.8]){
  assert.deepEqual(render({reduced,remaining}),[]);
 }
});
