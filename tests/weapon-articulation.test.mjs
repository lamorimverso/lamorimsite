import test from 'node:test';
import assert from 'node:assert/strict';
import {drawThreat} from '../tanahoraflavio/runner-art.mjs';
function geometry(type,phase,reducedMotion=false){
 const calls=[],ctx=new Proxy({globalAlpha:1},{get(o,k){if(k in o)return o[k];return (...a)=>{if(['roundRect','bezierCurveTo','quadraticCurveTo','ellipse'].includes(k))calls.push([k,...a]);};},set(o,k,v){o[k]=v;return true;}});
 drawThreat(ctx,{type,x:150,width:46,height:44,action:'jump'},246,phase,{reducedMotion});
 return type==='handcuffs'?calls.filter(c=>c[0]==='ellipse').slice(0,6):calls.filter(c=>type==='lhand'||type==='parachute-cross'?c[0].endsWith('CurveTo'):c[0]==='roundRect');
}
for(const type of ['message','stamp','lhand','handcuffs','parachute-cross','cloroquina-prop','ivermectina-prop','microphone','receipts','budget-sheets','hammer','mandado','barrier','case','falling-case'])test(type+' articula a geometria interna, além da rotação e das partículas',()=>{
 assert.notDeepEqual(geometry(type,0),geometry(type,9),type+' está rígido');
 assert.deepEqual(geometry(type,0,true),geometry(type,9,true),'movimento reduzido estável');
});

test('queda de chefão desenha a arma anunciada, sem substituir por mala',async()=>{
 const {drawFallingThreat}=await import('../tanahoraflavio/runner-art.mjs');
 for(const type of ['lhand','handcuffs']){
  const calls=[],c=new Proxy({globalAlpha:1},{get(o,k){if(k in o)return o[k];return(...args)=>calls.push([k,...args]);},set(o,k,v){o[k]=v;return true;}});
  drawFallingThreat(c,{type,x:130,width:56,height:44,y:100,bossAttack:true,age:2,warningFor:1},246);
  assert.ok(calls.some(c=>c[0]===(type==='lhand'?'quadraticCurveTo':'ellipse')),type+' deve conservar silhueta');
 }
});
