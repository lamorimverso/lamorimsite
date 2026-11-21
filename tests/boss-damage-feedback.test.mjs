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
test('the real boss renderer shows the damage and critical distinction in both viewport sizes',()=>{
 for(const width of [480,900])for(const critical of [false,true]){
  const [label]=render({width,critical});
  assert.equal(label.text,critical?'CRÍTICO! −6,3 PV':'−6,3 PV');
  assert.ok(label.x-label.maxWidth/2>=0&&label.x+label.maxWidth/2<=width);
  assert.ok(label.y>=16&&label.y<=290);
 }
});
test('reduced motion keeps damage feedback stationary, and expired feedback disappears',()=>{
 assert.equal(render({reduced:true})[0].y,render({reduced:true,remaining:.4})[0].y);
 assert.ok(render({remaining:.4})[0].y<render()[0].y);
 assert.deepEqual(render({remaining:0}),[]);
});
