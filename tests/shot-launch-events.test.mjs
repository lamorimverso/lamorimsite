import test from 'node:test';import assert from 'node:assert/strict';
import {createShotSoundTracker} from '../tanahoraflavio/runner-shot-events.mjs';
test('som é emitido uma vez na saída física, nunca no agendamento',()=>{
 const calls=[],tracker=createShotSoundTracker((...a)=>calls.push(a)),o={sourceActor:'dilma',type:'wind',projectile:true,waitFor:.5};
 tracker.update([o]);assert.equal(calls.length,0);o.launched=true;o.waitFor=0;
 tracker.update([o]);tracker.update([o]);assert.deepEqual(calls,[['dilma','wind',o]]);
 tracker.update([{...o}]);assert.equal(calls.length,2);
});
test('queda aguarda o aviso e boss usa a identidade dona da munição',()=>{
 const calls=[],tracker=createShotSoundTracker((...a)=>calls.push(a)),o={owner:'xandao',type:'hammer',falling:true,age:.9,warningFor:1.2};
 tracker.update([o],'haddad');assert.equal(calls.length,0);o.age=1.2;tracker.update([o],'haddad');assert.deepEqual(calls,[['xandao','hammer',o]]);
});
test('projétil sem dono continua emitindo o efeito genérico uma vez',()=>{
 const calls=[],tracker=createShotSoundTracker((...args)=>calls.push(args));const shot={type:'falling-case',projectile:true,launched:true};
 tracker.update([shot]);tracker.update([shot]);assert.equal(calls.length,1);assert.equal(calls[0][1],'falling-case');assert.equal(calls[0][2],shot);
});
