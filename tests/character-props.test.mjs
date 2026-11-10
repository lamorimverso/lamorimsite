import test from 'node:test';
import assert from 'node:assert/strict';
import {drawThreat} from '../tanahoraflavio/runner-art.mjs';

function fakeCanvas(){
 const calls={rectangles:[],scales:[],labels:[],lines:0,geometry:[]};
 const ctx={save(){},restore(){},translate(){},rotate(){},beginPath(){},ellipse(...v){calls.geometry.push(['ellipse',...v]);},
  fill(){},stroke(){},closePath(){},moveTo(...v){calls.geometry.push(['move',...v]);},lineTo(...v){calls.lines++;calls.geometry.push(['line',...v]);},bezierCurveTo(...v){calls.geometry.push(['bezier',...v]);},
  quadraticCurveTo(...v){calls.geometry.push(['quadratic',...v]);},fillText(value){calls.labels.push(value);},
  roundRect(x,y,width,height){calls.rectangles.push({x,y,width,height});},
  scale(x,y){calls.scales.push({x,y});}};
 return {ctx,calls};
}
test('obstáculos altos não têm fundo retangular e continuam alinhados à colisão',()=>{
 for(const type of ['wind','budget-sheets','parachute-cross','handcuffs','receipts','lhand','mandado','hammer','message','barrier']){
  const {ctx,calls}=fakeCanvas();
  assert.doesNotThrow(()=>drawThreat(ctx,{x:200,width:46,height:84,type,action:'crouch'},246,0,{reducedMotion:true}),type);
  assert.ok(calls.scales.some(s=>s.x===1&&s.y===84/44),type+' deve representar toda a altura do obstáculo');
  assert.ok(calls.rectangles.every(r=>r.width<40||r.height<60),type+' possui painel retangular de fundo');
 }
});
test('coadjuvantes têm objetos visualmente distintos, sem fundo genérico',()=>{
 const appearances=[];
 for(const type of ['wind','budget-sheets','parachute-cross','handcuffs']){
  const {ctx,calls}=fakeCanvas();
  drawThreat(ctx,{x:200,width:46,height:72,type,action:'crouch'},246,0,{reducedMotion:true});
  appearances.push(JSON.stringify({rectangles:calls.rectangles,geometry:calls.geometry,labels:calls.labels}));
 }
 assert.equal(new Set(appearances).size,4,'objeto diferente para cada personagem');
});
