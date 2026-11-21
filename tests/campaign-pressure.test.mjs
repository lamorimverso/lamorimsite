import test from 'node:test';import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
import {STORY_STAGE_IDS,SCENE_DISTANCE} from '../tanahoraflavio/runner-route-data.mjs';
const make=(stage=0)=>{const r=core.createRun({mode:'story',seed:21});core.startRun(r);r.elapsed=40;r.routeDistance=r.distance=core.STORY_OPENING_DISTANCE+stage*SCENE_DISTANCE+3100;for(const key of ['nextBossAt','nextObstacle','nextAllyAt','nextSupportAt','nextPower','nextPassport'])r[key]=Infinity;r.nextRaid=999;return r;};
const tick=r=>core.advanceRun(r,1/120,()=>.5);
test('Joice tem entrada garantida em todos os oito mapas, sem depender do sorteio do temporizador',()=>{
 for(let stage=0;stage<8;stage++){const r=make(stage);tick(r);assert.equal(r.raid?.phase,'warning',STORY_STAGE_IDS[stage]);assert.equal(r.raid.stageId,STORY_STAGE_IDS[stage]);assert.equal(r.raidStages[STORY_STAGE_IDS[stage]],1);assert.equal(r.raids,1);}
});
test('entrada obrigatória espera um chefe/transformação e não reinicia sem parar na mesma fase',()=>{
 const r=make(2);r.player.isJacare=true;r.player.nextJacareThreat=Infinity;tick(r);assert.equal(r.raid,null);
 r.player.isJacare=false;r.boss={type:'lula',combat:false,hp:10,maxHp:10,total:10,remaining:10,fired:0,nextAttack:100};tick(r);assert.equal(r.raid,null,'Joice não interrompe o duelo');r.boss=null;tick(r);assert.equal(r.raid?.stageId,'sao-paulo');
 r.raid=null;r.nextRaid=999;tick(r);assert.equal(r.raid,null,'fase já teve seu encontro garantido');
 r.routeDistance+=SCENE_DISTANCE;tick(r);assert.equal(r.raid?.stageId,'argentina');
});
test('desafios opcionais e cenários isolados podem desativar raids explicitamente',()=>{
 const r=make(5);r.nextRaid=Infinity;tick(r);assert.equal(r.raid,null);assert.equal(r.raids,0);
});
test('pressão final aproxima contatos e ondas mais que a curva antiga, mantendo os limites de reação',()=>{
 const first=core.difficultyAt(0,0),late=core.difficultyAt(70000,450),far=core.difficultyAt(500000,1400);
 assert.equal(first.speed,270);assert.ok(late.obstacleGap<1.10,'ondas tardias mais próximas');assert.ok(late.pressure>.92,'pressão tardia chega antes');
 assert.ok(far.speed>late.speed&&far.speed<=535);assert.ok(far.obstacleGap<late.obstacleGap);assert.ok(far.obstacleApproach>=.82);assert.ok(far.bossApproach>=.72);
});

test('toc-toc também cobre os seis destinos e volta a ser garantido em novas voltas do Infinito',()=>{
 for(let stage=0;stage<6;stage++){
  const r=make();r.mode='endless';r.routeDistance=r.distance=stage*SCENE_DISTANCE+3100;r.nextRaid=999;tick(r);assert.equal(r.raid?.stageId,core.STAGES[stage].id);
 }
 const r=make();r.mode='endless';r.routeDistance=r.distance=3100;tick(r);assert.equal(r.raid?.stageId,'brasilia');
 r.raid=null;r.nextRaid=999;r.routeDistance+=6*SCENE_DISTANCE;tick(r);assert.equal(r.raid?.stageId,'brasilia','nova volta permite nova entrada garantida');assert.equal(r.raidStages.brasilia,2);
});

test('o sorteio real da História usa apenas os atacantes de cima da localidade',async()=>{
 const {STORY_ROSTERS}=await import('../tanahoraflavio/runner-stage-roster.mjs');
 for(let stage=0;stage<8;stage++){
  const r=make(stage);r.terrain.nextAt=Infinity;r.nextRaid=Infinity;r.nextObstacle=0;const rolls=[.1,.99,.5,.5];core.advanceRun(r,1/120,()=>rolls.shift()??.5);
  const expected=STORY_ROSTERS[stage].overhead[0],shot=r.obstacles.find(o=>o.cast);
  assert.equal(shot?.sourceActor,expected.actor,STORY_STAGE_IDS[stage]);assert.equal(shot.type,expected.weapon);assert.equal(shot.stageId,STORY_STAGE_IDS[stage]);assert.equal(r.cameo.type,expected.actor);
 }
});

test('transformação que atravessa o horário do toc-toc não deixa a fase ser pulada pelo chefe',async()=>{
 const {nextStoryBossDistance}=await import('../tanahoraflavio/runner-bosses.mjs');const {pilotCounter}=await import('../tools/story-pilot.mjs');
 const r=make(5);r.elapsed=200;r.bossesDefeated=11;r.nextBossAt=nextStoryBossDistance(11);r.player.isJacare=true;r.player.jacareAge=0;r.shieldFor=Infinity;
 const order=[];let priorBoss=null,priorRaid=null;
 for(let frame=0;frame<120*90&&core.routeStageFor(r).id==='florida';frame++){
  pilotCounter(r);core.advanceRun(r,1/120,()=>.5);
  if(r.raid&&r.raid!==priorRaid){assert.equal(r.boss,null);assert.equal(r.player.isJacare,false);order.push('joice');}priorRaid=r.raid;
  if(r.boss&&r.boss!==priorBoss)order.push(r.boss.type);priorBoss=r.boss;
 }
 assert.ok(r.raidStages.florida>=1,'Flórida precisa ter Joice antes de partir');assert.ok(order.indexOf('joice')<order.indexOf('simone'),'raid pendente vem antes do chefe de encerramento');
});

test('no Infinito a travessia reserva a entrada pendente antes de trocar de mapa',()=>{
 const r=make();r.mode='endless';r.elapsed=200;r.routeDistance=r.distance=5900;r.player.isJacare=true;r.player.jacareAge=0;r.shieldFor=Infinity;
 let saw=false;
 for(let i=0;i<120*14&&!saw;i++){
  tick(r);if(r.player.isJacare){
   assert.equal(core.routeStageFor(r).id,'brasilia','jacaré não consome a oportunidade do mapa');
   assert.equal(r.raid,null,'a perseguição aguarda a recuperação');
  }
  if(r.raid){saw=true;assert.equal(r.raid.stageId,'brasilia');assert.equal(core.routeTransitionFor(r).active,false,'aviso respeita a transição');}
 }
 assert.equal(saw,true);assert.ok(r.distance>r.routeDistance,'movimento e pontuação continuam durante a reserva');
});
