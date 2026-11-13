import test from 'node:test';
import assert from 'node:assert/strict';
import * as weapons from '../tanahoraflavio/runner-weapon-art.mjs';
const types=['hammer','microphone','mandado','handcuffs','barrier','stamp','message','lhand','receipts','paper-gate','budget-sheets','parachute-cross','cloroquina-prop','ivermectina-prop','rolling-case','falling-case','case','popcorn','wind'];
function context(){const calls=[];return new Proxy({calls,globalAlpha:1},{get(o,k){if(k in o)return o[k];return (...a)=>calls.push([k,...a]);},set(o,k,v){o[k]=v;calls.push(['set',k,v]);return true;}});}
for(const type of types)test(type+' possui corpo completo, partes móveis e desenho escalável',()=>{
 const frames=[];
 for(const phase of [0,7]){const c=context();assert.equal(weapons.drawCompleteWeapon(c,{type,width:46,height:44,phase}),true);frames.push(c.calls);
  assert.ok(c.calls.filter(c=>c[0]==='fill').length>=4,type+' precisa de material e partes, não só contorno');
  assert.equal(c.calls.filter(c=>c[0]==='save').length,c.calls.filter(c=>c[0]==='restore').length);
 }
 assert.notDeepEqual(frames[0],frames[1],type+' sem animação interna');
 const a=context(),b=context();weapons.drawCompleteWeapon(a,{type,width:46,height:44,phase:0,reducedMotion:true});weapons.drawCompleteWeapon(b,{type,width:46,height:44,phase:7,reducedMotion:true});assert.deepEqual(a.calls,b.calls);
 for(const size of [16,46,138]){const c=context();weapons.drawCompleteWeapon(c,{type,width:size,height:size*1.4,phase:3});assert.ok(c.calls.every(row=>row.slice(1).filter(v=>typeof v==='number').every(Number.isFinite)),'sem cortes por coordenadas inválidas');}
});
