import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createCanvas} from '@napi-rs/canvas';
import {bossArenaPose,bossPresentationFor} from '../tanahoraflavio/runner-bosses.mjs';
import {campaignAccentFor} from '../tanahoraflavio/runner-campaign-art.mjs';
import {drawBossAccent} from '../tanahoraflavio/runner-visual-finish.mjs';

const source=readFileSync(new URL('../tanahoraflavio/runner.mjs',import.meta.url),'utf8');
const start=source.indexOf('  function bossFigure(){'),end=source.indexOf('  function character(){',start);
const make=Function('env',`const {run,ctx,virtualWidth,WORLD,bossArenaPose,bossPresentationFor,campaignAccentFor,prefersReducedMotion,drawHoverEnemy,drawBossAccent}=env;${source.slice(start,end)};return bossFigure;`);
function render({width=480,critical=true,remaining=.8,reduced=false}={}){
 const ctx=createCanvas(width,300).getContext('2d'),labels=[],poses=[];
 const fillText=ctx.fillText.bind(ctx);
 ctx.fillText=(text,x,y,maxWidth)=>{labels.push({text,x,y,maxWidth});fillText(text,x,y,maxWidth);};
 ctx.globalAlpha=.65;ctx.fillStyle='#345678';const priorAlpha=ctx.globalAlpha;
 const run={elapsed:4,obstacles:[],boss:{type:'jones',stageId:'brasilia',role:'optional',phase:'recover',phaseFor:.5,age:4,
  hitFlashFor:Math.min(.28,remaining),lastDamage:{amount:6.25,critical,remaining}}};
 make({run,ctx,virtualWidth:width,WORLD:{ground:246},bossArenaPose,bossPresentationFor,campaignAccentFor,
  prefersReducedMotion:()=>reduced,drawHoverEnemy:(c,pose)=>poses.push(pose),drawBossAccent})();
 assert.equal(ctx.globalAlpha,priorAlpha);
 return {labels,poses};
}
test('ordinary and critical hits draw no floating HP number at either viewport size',()=>{
 for(const width of [480,900])for(const critical of [false,true])for(const reduced of [false,true]){
  const {labels,poses}=render({width,critical,reduced});
  assert.deepEqual(labels,[]);
  assert.equal(poses.length,1);
  assert.equal(poses[0].hurt,true,'the existing hurt drawing still gives immediate hit feedback');
 }
});
test('expired damage no longer selects the hurt drawing, and still emits no label',()=>{
 const {labels,poses}=render({remaining:0});
 assert.deepEqual(labels,[]);
 assert.equal(poses[0].hurt,false);
});
