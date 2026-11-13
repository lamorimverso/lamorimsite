import test from 'node:test';import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
test('todos os24 chefes iniciam ataques, ferem e derrotam quem fica parado sem atirar',()=>{
 for(let index=0;index<24;index++){
  const r=core.createRun({mode:'story'});core.startRun(r);r.bossesDefeated=index;r.nextBossAt=0;
  for(const key of ['nextRaid','nextObstacle','nextAllyAt','nextSupportAt','nextPower','nextPassport'])r[key]=Infinity;
  let fired=0,damage=false;
  for(let frame=0;frame<120*45&&r.status==='running';frame++){core.advanceRun(r,1/120,()=>.4);fired=Math.max(fired,r.boss?.fired||0);damage ||= r.player.hp<r.player.maxHp;}
  assert.ok(fired>0,'chefe '+index+' não iniciou ataque');assert.equal(r.shotsFired,0);assert.ok(damage,'chefe '+index+' não causa dano');assert.equal(r.status,'over','chefe '+index+' não derrota jogador parado');
 }
});
test('a distância aumenta risco, velocidade e frequência por várias voltas',()=>{
 const values=[0,42000,84000,168000,500000,1000000].map(d=>core.difficultyAt(d,0));
 for(let i=1;i<values.length;i++){
  const a=values[i-1],b=values[i];assert.ok(b.speed>a.speed);assert.ok(b.obstacleGap<a.obstacleGap);assert.ok(b.obstacleApproach<a.obstacleApproach);assert.ok(b.level>=a.level);
 }
 assert.ok(values.at(-1).level>10,'risco não fica parado no patamar antigo');assert.ok(values.at(-1).speed<=535);
});
