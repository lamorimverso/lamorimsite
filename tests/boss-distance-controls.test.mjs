import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
import * as bosses from '../tanahoraflavio/runner-bosses.mjs';
import * as input from '../tanahoraflavio/runner-input.mjs';
import {journeySceneryGeometry} from '../tanahoraflavio/runner-scenery.mjs';
function near(distance){const r=core.createRun({mode:'story'});core.startRun(r);r.distance=r.routeDistance=distance;for(const k of ['nextRaid','nextObstacle','nextAllyAt','nextSupportAt','nextPower','nextPassport'])r[k]=Infinity;return r;}
test('primeiro chefão aguarda 22 km de rota, sem entrada antecipada em 1,2 km',()=>{
 const r=near(1199);for(let i=0;i<20;i++)core.advanceRun(r,1/120,()=>.5);assert.equal(r.boss,null);assert.equal(r.nextBossAt,22000);
 const late=near(21999);core.advanceRun(late,1/120,()=>.5);assert.equal(late.boss?.index,0);assert.equal(late.routeDistance,22000);
 assert.equal(bosses.nextStoryBossDistance(3),27100);assert.equal(bosses.nextStoryBossDistance(4),29000);
});
test('coordenada da campanha preserva quatro encontros no cenário correto depois da abertura',()=>{
 assert.equal(typeof core.campaignRouteDistance,'function');
 for(let i=0;i<20;i++){
  const r=near(bosses.nextStoryBossDistance(i)),b=bosses.storyBossAt(i);
  const stage=core.stageAt(core.campaignRouteDistance(r)/7000*20);assert.equal(stage.index,b.stageIndex);
 }
 assert.equal(core.campaignRouteDistance(near(10000)),0);
 const r=core.createRun();r.routeDistance=24000;assert.equal(core.campaignRouteDistance(r),24000);
});
test('abertura de Brasília move o fundo e não salta na entrada da campanha',()=>{
 const a=journeySceneryGeometry({routeDistance:10000,openingDistance:20800}),b=journeySceneryGeometry({routeDistance:10100,openingDistance:20800});
 assert.ok(a.layers.every(l=>l.segments.every(s=>s.stageId==='brasilia')));
 const first=a.layers[0].segments[2],moved=b.layers[0].segments.find(s=>s.segmentIndex===first.segmentIndex);assert.ok(Math.abs((first.x-moved.x)-14)<.001);
 const before=journeySceneryGeometry({routeDistance:20799.99,openingDistance:20800}),after=journeySceneryGeometry({routeDistance:20800.01,openingDistance:20800});
 for(const old of before.landmarks){const same=after.landmarks.find(x=>x.segmentIndex===old.segmentIndex);if(same)assert.ok(Math.abs(old.x-same.x)<.01);}
});
test('tecla de disparo aceita opções permitidas e ignora preferência inválida',()=>{
 assert.equal(typeof input.fireBindingFor,'function');
 assert.deepEqual(input.fireBindingFor('KeyF').keys,['KeyF']);assert.equal(input.fireBindingFor('KeyF').label,'F');
 for(const value of ['invalid','KeyS','ArrowUp',null,{},'__proto__'])assert.deepEqual(input.fireBindingFor(value).keys,['KeyJ','KeyZ']);
});
