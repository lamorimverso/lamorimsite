import test from 'node:test';import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
import {nextStoryBossDistance} from '../tanahoraflavio/runner-bosses.mjs';
function encounter(index){
 const r=core.createRun({mode:'story'});core.startRun(r);r.bossesDefeated=index;r.nextBossAt=r.routeDistance=r.distance=nextStoryBossDistance(index);
 for(const key of ['nextRaid','nextObstacle','nextAllyAt','nextSupportAt','nextPower','nextPassport'])r[key]=Infinity;
 return r;
}
test('os 15 chefes de combate iniciam ataques, ferem e derrotam quem fica parado sem atirar',()=>{
 for(let index=0;index<core.STORY_BOSS_COUNT;index++){
  if(index===8||index===14)continue;
  const r=encounter(index);
  let fired=0,damage=false;
  for(let frame=0;frame<120*45&&r.status==='running';frame++){core.advanceRun(r,1/120,()=>.4);fired=Math.max(fired,r.boss?.fired||0);damage ||= r.player.hp<r.player.maxHp;}
  assert.ok(fired>0,'chefe '+index+' não iniciou ataque');assert.equal(r.shotsFired,0);assert.ok(damage,'chefe '+index+' não causa dano');assert.equal(r.status,'over','chefe '+index+' não derrota jogador parado');
 }
});
test('Fiscal e Povo bloqueiam o jogador parado, sem tirar vida nem permitir disparo',()=>{
 for(const [index,actor] of [[8,'fiscal'],[14,'povo']]){
  const r=encounter(index);core.advanceRun(r,1/120,()=>.4);
  assert.equal(r.boss.type,actor);
  let blocked=false;
  for(let frame=0;frame<120*45&&r.boss;frame++){
   assert.equal(core.attackRun(r),false);
   core.advanceRun(r,1/120,()=>.4);
   blocked ||= r.event.startsWith('Passagem bloqueada');
  }
  assert.equal(blocked,true,actor+' não bloqueou o jogador');
  assert.equal(r.bossesDefeated,index);
  assert.equal(r.status,'running');assert.equal(r.lives,1);assert.equal(r.player.hp,r.player.maxHp);assert.equal(r.shotsFired,0);
 }
});
test('a distância aumenta risco, velocidade e frequência por várias voltas',()=>{
 const values=[0,42000,84000,168000,500000,1000000].map(d=>core.difficultyAt(d,0));
 for(let i=1;i<values.length;i++){
  const a=values[i-1],b=values[i];assert.ok(b.speed>a.speed);assert.ok(b.obstacleGap<a.obstacleGap);assert.ok(b.obstacleApproach<a.obstacleApproach);assert.ok(b.level>=a.level);
 }
 assert.ok(values.at(-1).level>10,'risco não fica parado no patamar antigo');assert.ok(values.at(-1).speed<=535);
});
