import test from 'node:test';
import assert from 'node:assert/strict';
import * as art from '../tanahoraflavio/runner-art.mjs';

test('bueiro sinaliza alvo comprometido antes de abrir no mesmo local',()=>{
 assert.equal(typeof art.manholeThreatGeometry,'function');
 const hole={x:180,width:64,height:18,age:.6,warningFor:1.2,activeFor:1.1};
 const warning=art.manholeThreatGeometry(hole,246);
 assert.equal(warning.centerX,212);assert.equal(warning.ground,246);assert.equal(warning.open,false);
 hole.age=1.3;const open=art.manholeThreatGeometry(hole,246);
 assert.equal(open.centerX,212);assert.equal(open.open,true);
});
test('transição visual do bueiro não nasce aberta nem permanece após duração física',()=>{
 assert.equal(typeof art.manholeThreatGeometry,'function');
 const hole={x:40,width:64,height:18,age:0,warningFor:1.2,activeFor:1.1};
 assert.equal(art.manholeThreatGeometry(hole).open,false);
 hole.age=2.4;assert.equal(art.manholeThreatGeometry(hole).open,false);
});
test('metamorfose faz transição entre formas e efeitos reduzidos preservam forma correta',()=>{
 assert.equal(typeof art.jacareBlendFor,'function');
 assert.deepEqual(art.jacareBlendFor({isJacare:true,jacareAge:0}),{human:1,jacare:0});
 assert.deepEqual(art.jacareBlendFor({isJacare:true,jacareAge:.15}),{human:.5,jacare:.5});
 assert.deepEqual(art.jacareBlendFor({isJacare:true,jacareAge:2}),{human:0,jacare:1});
 assert.deepEqual(art.jacareBlendFor({isJacare:false,restoreFlashFor:.24}),{human:.5,jacare:.5});
 assert.deepEqual(art.jacareBlendFor({isJacare:true,jacareAge:0},true),{human:0,jacare:1});
 assert.deepEqual(art.jacareBlendFor({isJacare:false,restoreFlashFor:.48},true),{human:1,jacare:0});
});
