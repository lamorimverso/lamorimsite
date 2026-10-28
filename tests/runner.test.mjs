import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
const running=()=>{const r=core.createRun();core.startRun(r);return r;};
function frames(r,seconds){for(let n=0;n<Math.ceil(seconds*120);n++)core.advanceRun(r,1/120,()=>.5);}
test('a pista só avança depois de iniciar e para depois da derrota',()=>{
 const r=core.createRun();frames(r,1);assert.equal(r.distance,0);assert.equal(core.jumpRun(r),false);
 core.startRun(r);frames(r,.5);assert.ok(r.distance>100);r.status='over';const d=r.distance;frames(r,1);assert.equal(r.distance,d);
});
test('salto sobe, impede novo salto no ar e aterrissa',()=>{
 const r=running();assert.equal(core.jumpRun(r),true);frames(r,.2);assert.ok(r.player.y>65);
 assert.equal(core.jumpRun(r),false);frames(r,.65);assert.equal(r.player.y,0);assert.equal(core.jumpRun(r),true);
});
test('suspensão interna congela física, placar e temporizadores',()=>{
 const r=running();core.jumpRun(r);frames(r,.1);core.togglePause(r);const copy=structuredClone(r);
 frames(r,2);assert.deepEqual(r,copy);core.togglePause(r);frames(r,.1);assert.ok(r.elapsed>copy.elapsed);
});
test('uma colisão sem proteção encerra imediatamente a corrida',()=>{
 const r=running();r.obstacles=[{x:125,width:34,height:44,type:'pf'}];frames(r,.02);
 assert.equal(r.status,'over');assert.equal(r.lives,0);assert.equal(r.graceFor,0);
});
test('vida extra suporta um impacto e recuperação evita dano duplicado da mesma onda',()=>{
 const r=running();r.lives=2;r.obstacles=[{x:125,width:34,height:44,type:'pf'},{x:133,width:34,height:44,type:'pf'}];
 frames(r,.02);assert.equal(r.status,'running');assert.equal(r.lives,1);assert.ok(r.graceFor>1);
 frames(r,.2);assert.equal(r.lives,1);r.graceFor=0;r.obstacles=[{x:125,width:34,height:44,type:'pf'}];frames(r,.02);assert.equal(r.status,'over');
});
test('saltar sobre inimigo não gera colisão',()=>{
 const r=running();r.player.y=95;r.obstacles=[{x:125,width:40,height:44,type:'pf'}];frames(r,.02);assert.equal(r.status,'running');
});
test('passaporte é coletado uma vez e contribui para a próxima vida',()=>{
 const r=running();r.pickups=[{x:136,y:35,type:'passport',value:10}];frames(r,.02);
 assert.equal(r.passports,1);assert.equal(core.scoreFor(r),Math.floor(r.distance));assert.equal(r.collected,1);frames(r,.02);assert.equal(r.passports,1);
});
test('dt inválido não altera estado e frame enorme é limitado',()=>{
 const r=running();for(const dt of [-1,NaN,Infinity])core.advanceRun(r,dt);assert.equal(r.elapsed,0);
 core.advanceRun(r,120,()=>.5);assert.ok(r.elapsed<=.05);assert.ok(r.distance<20);
});
test('dificuldade aumenta com distância e preserva intervalo completo entre saltos',()=>{
 const a=core.difficultyAt(0),b=core.difficultyAt(9000000);assert.ok(b.speed>a.speed);assert.ok(b.speed<=435);
 assert.ok(b.obstacleGap<a.obstacleGap);assert.ok(b.obstacleGap>=1.35);
});
test('os cinco destinos repetem em voltas sem encerrar a partida',()=>{
 for(const [s,id] of [[0,'brasilia'],[20,'rio'],[40,'argentina'],[60,'florida'],[80,'casa-branca'],[100,'brasilia'],[120,'rio']])assert.equal(core.stageAt(s).id,id);
 const r=running();r.elapsed=200;r.routeDistance=35000;r.shieldFor=100;r.nextBossAt=Infinity;frames(r,1);assert.equal(r.status,'running');
});
test('transição é contínua e inclui a volta da Casa Branca a Brasília',()=>{
 for(const boundary of [20,40,60,80,100,120]){
  const before=core.stageTransitionAt(boundary-2),mid=core.stageTransitionAt(boundary),after=core.stageTransitionAt(boundary+2);
  assert.equal(before.active,false);assert.equal(mid.active,true);assert.equal(mid.progress,.5);assert.equal(after.active,false);
  assert.equal(mid.to.id,core.stageAt(boundary).id);
 }
});
test('movimento e pontuação continuam durante a transição',()=>{
 const r=running();r.routeDistance=6950;r.nextBossAt=Infinity;const d=r.distance;frames(r,.1);
 assert.ok(r.distance>d);assert.ok(core.scoreFor(r)>0);assert.equal(core.stageTransitionAt(r.routeDistance/core.SCENE_DISTANCE*core.SCENE_SECONDS).active,true);
});
test('primeiras ondas oferecem tempo de reação e nenhuma aparece sobre o jogador',()=>{
 const r=running();r.nextBossAt=r.nextRaid=Infinity;let previous=0,saw=0;
 for(let i=0;i<120*20;i++){const count=r.spawnedObstacles;core.advanceRun(r,1/120,()=>0);
  if(r.spawnedObstacles>count){assert.ok(r.obstacles.at(-1).x>=900);if(saw)assert.ok(r.elapsed-previous>=1.15);previous=r.elapsed;saw++;}
  r.obstacles=r.obstacles.filter(o=>o.x>250);
 }assert.ok(saw>=8);
});
