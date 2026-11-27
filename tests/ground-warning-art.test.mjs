import test from 'node:test';
import assert from 'node:assert/strict';
import {drawManholeThreat,drawFallingThreat,manholeThreatGeometry,fallingThreatGeometry} from '../tanahoraflavio/runner-art.mjs';
function recorder(){
 const calls=[],state={globalAlpha:1};
 const c=new Proxy(state,{get(t,p){if(p in t)return t[p];return (...args)=>calls.push([p,...args,t.fillStyle]);}});
 return {c,calls};
}
test('floor warning contrasts with the road and keeps its physical anchor',()=>{
 const item={type:'manhole',x:120,width:60,height:28,age:.5,warningFor:1,activeFor:2};
 const {c,calls}=recorder();
 assert.deepEqual(manholeThreatGeometry(item),{centerX:150,ground:246,width:60,open:false,progress:.5});
 drawManholeThreat(c,item);
 assert.ok(calls.some(v=>v[0]==='roundRect'&&v[1]===134&&v[2]===203&&v[3]===32&&v[4]===25));
 assert.ok(calls.some(v=>v[0]==='fillText'&&v[1]==='↔'&&v[2]===150&&v.at(-1)==='#fff5de'));
 const active=recorder();drawManholeThreat(active.c,{...item,age:1.5});
 assert.ok(!active.calls.some(v=>v[0]==='fillText'));
});
test('falling warning uses a high contrast backing only before the threat arrives',()=>{
 const item={type:'pfizer-ampoule',x:120,width:40,height:40,y:90,age:.5,warningFor:1};
 const {c,calls}=recorder();
 assert.equal(fallingThreatGeometry(item).showBody,false);
 drawFallingThreat(c,item);
 assert.ok(calls.some(v=>v[0]==='roundRect'&&v[1]===124&&v[2]===160&&v[3]===32&&v[4]===27));
 assert.ok(calls.some(v=>v[0]==='fillText'&&v[1]==='↔'&&v.at(-1)==='#fff5de'));
 const active=recorder();drawFallingThreat(active.c,{...item,age:1.5});
 assert.ok(!active.calls.some(v=>v[0]==='fillText'&&v[1]==='↔'));
});
