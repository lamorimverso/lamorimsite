import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';

test('cada lugar da rota possui uniforme completo de soldado próprio',async()=>{
 const {soldierVariantFor}=await import('../tanahoraflavio/runner-soldier-variants.mjs');
 const {combatActors}=await import('../tanahoraflavio/runner-combat-sprite-data.mjs');
 const variants=core.STAGES.map(s=>soldierVariantFor(s.id));
 assert.equal(new Set(variants.map(v=>v.actor)).size,5);
 assert.deepEqual(variants.map(v=>v.country),['Brasil','Brasil','Argentina','Estados Unidos','Estados Unidos']);
 for(const variant of variants)assert.ok(combatActors[variant.actor]);
});

test('soldado recebe o uniforme do cenário ao entrar e o mantém até sair',()=>{
 for(const [index,stage] of core.STAGES.entries()){
  const r=core.createRun();core.startRun(r);r.elapsed=400;r.routeDistance=r.distance=140000+index*7000+200;
  for(const key of ['nextBossAt','nextRaid','nextPower','nextPassport','nextAllyAt','nextSupportAt'])r[key]=Infinity;
  r.seenGroundActors=core.unlockedCharacters(10,'ground').filter(t=>t!=='army');r.nextObstacle=0;
  core.advanceRun(r,1/120,()=>.9);
  const soldier=r.obstacles.find(o=>o.type==='army');assert.ok(soldier,stage.id);assert.equal(soldier.armyVariant,stage.id);
  r.nextObstacle=Infinity;r.routeDistance+=7000;core.advanceRun(r,1/120,()=>.9);
  assert.equal(soldier.armyVariant,stage.id,'a troca de país não troca o uniforme no meio de uma passada');
 }
});
