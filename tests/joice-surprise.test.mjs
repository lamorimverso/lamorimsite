import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
import {ARCHIVE_VOICES} from '../tanahoraflavio/runner-voice-data.mjs';
const dt=1/120;
function run(){const r=core.createRun();core.startRun(r);r.shieldFor=Infinity;r.nextBossAt=r.nextObstacle=Infinity;return r;}
// Isola segundos elegíveis: o teste de exclusão de transições está no motor.
const advance=(r,seconds,rng=()=>.5)=>{for(let i=0;i<Math.ceil(seconds/dt);i++){r.routeDistance=1000;core.advanceRun(r,dt,rng);}};

test('corrida infinita mantém a paisagem e a rota passando durante Joice e chefes',()=>{
 for(const encounter of ['boss','raid']){
  const r=run();r.nextRaid=Infinity;
  if(encounter==='raid')r.raid={phase:'active',remaining:8,factIndex:0,id:1};
  else{r.nextBossAt=0;core.advanceRun(r,dt);}
  const before={route:r.routeDistance,total:r.distance};
  core.advanceRun(r,dt);
  assert.ok(r.routeDistance>before.route,'nenhum encontro congela o avanço da paisagem');
  assert.ok(Math.abs((r.routeDistance-before.route)-(r.distance-before.total))<1e-8);
 }
});

test('Joice aparece sem agenda fixa no HUD, primeiro entre 18 e 30 segundos elegíveis',()=>{
 for(const random of [0,.5,.999]){
  const r=run();core.advanceRun(r,dt,()=>random);
  assert.ok(r.nextRaid>=18-dt&&r.nextRaid<=30,'primeira surpresa chega enquanto a partida ainda está começando');
  const scheduled=r.nextRaid;advance(r,scheduled-.03,()=>random);assert.equal(r.raid,null);
  advance(r,.05,()=>random);assert.equal(r.raid?.phase,'warning');
 }
});
test('surpresa dá 1,2 segundo de reação, dez de perseguição e retorno até concluir a fala',()=>{
 const r=run();r.nextRaid=0;core.advanceRun(r,dt);
 assert.equal(r.raid.remaining,1.2);advance(r,1.21);
 assert.equal(r.raid.phase,'active');assert.ok(r.raid.remaining>9.9);
 advance(r,10.01);assert.equal(r.raid.phase,'recovery');
 advance(r,core.RAID_TIMING.recoveryFor+.01);assert.equal(r.raid,null);assert.ok(r.nextRaid>=24&&r.nextRaid<=36);
});
test('janela da Joice comporta áudio integral e margem sem prolongar os dez segundos ativos',()=>{
 const timing=core.RAID_TIMING;assert.ok(timing);
 assert.equal(timing.warningFor,1.2);assert.equal(timing.activeFor,10);assert.ok(timing.recoveryFor>=2);assert.ok(timing.audioMarginFor>=.35);
 assert.ok(timing.warningFor+timing.activeFor+timing.recoveryFor>=ARCHIVE_VOICES.joice.durationSeconds+timing.audioMarginFor);
 const r=run();r.nextRaid=0;core.advanceRun(r,dt,()=>.5);const start=r.elapsed;
 assert.equal(r.raid.recoveryFor,timing.recoveryFor);
 advance(r,timing.warningFor+.01);assert.equal(r.raid.phase,'active');const activeStart=r.elapsed;
 advance(r,9.95);assert.equal(r.raid.phase,'active','a fala não altera o desafio ativo');
 advance(r,.06);assert.equal(r.raid.phase,'recovery');assert.ok(Math.abs(r.elapsed-activeStart-10)<.03);
 while(r.raid)advance(r,dt);assert.ok(r.elapsed-start>=ARCHIVE_VOICES.joice.durationSeconds+timing.audioMarginFor);
});
test('retorno alongado normaliza a cadência pela duração própria sem gerar ondas mais rápidas',()=>{
 const r=run();r.elapsed=40;r.distance=100000;r.raid={phase:'recovery',remaining:6,recoveryFor:6,id:1,factIndex:0};r.nextObstacle=0;r.nextRaid=Infinity;
 core.advanceRun(r,dt,()=>.9);assert.ok(r.nextObstacle>=.90-dt,'início de retorno conserva o limite mínimo de cadência');
 assert.ok(r.nextObstacle<=core.difficultyAt(r.distance,r.elapsed).obstacleGap+.25);
});
test('Joice produz mais ondas reais da PF sem reduzir abaixo do intervalo mínimo',()=>{
 for(const distance of [0,7000,28000,1000000]){
  const normal=run(),surprise=run();
  for(const r of [normal,surprise]){r.distance=distance;r.nextRaid=Infinity;r.nextObstacle=0;}
  surprise.raid={phase:'active',remaining:8,factIndex:0,id:1};
  core.advanceRun(normal,dt,()=>0);core.advanceRun(surprise,dt,()=>0);
  assert.equal(surprise.obstacles[0].type,'pf');
  const expected=.98-.08*core.difficultyAt(distance,dt).pressure-dt;
  assert.ok(Math.abs(surprise.nextObstacle-expected)<1e-8,'onda usa o ritmo intensificado');
  assert.ok(surprise.nextObstacle<normal.nextObstacle);assert.ok(surprise.nextObstacle>=.90-dt-1e-8);
 }
});
test('dificuldade cresce de forma perceptível e contínua a cada destino',()=>{
 const points=[0,7000,14000,28000,70000].map(d=>core.difficultyAt(d));
 for(let i=1;i<points.length;i++){
  assert.ok(points[i].speed>points[i-1].speed);
  assert.ok(points[i].obstacleGap<points[i-1].obstacleGap);
  assert.ok(points[i].obstacleApproach<points[i-1].obstacleApproach);
 }
 assert.ok(points[2].obstacleGap<=1.61,'14 km já exigem uma frequência maior de desvios');
 assert.ok(points[2].obstacleApproach<=1.52,'14 km já aproximam perigos com mais rapidez');
 for(const distance of [6999.99,7000,13999.99,14000]){
  const a=core.difficultyAt(distance),b=core.difficultyAt(distance+.01);
  assert.ok(Math.abs(a.speed-b.speed)<.001);assert.ok(Math.abs(a.obstacleGap-b.obstacleGap)<.001);
 }
 const limit=core.difficultyAt(1e12);assert.ok(limit.speed<=435);assert.ok(limit.obstacleGap>=1.12);assert.ok(limit.obstacleApproach>=.95);
});
