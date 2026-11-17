import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';

function isolated(){
 const r=core.createRun({seed:17});core.startRun(r);
 r.nextBossAt=r.nextRaid=r.nextObstacle=r.nextAllyAt=r.nextSupportAt=Infinity;
 r.nextPower=r.nextPassport=r.nextPickup=Infinity;
 return r;
}
function step(r,seconds){for(let i=0;i<Math.round(seconds*120)&&r.status==='running';i++)core.advanceRun(r,1/120);}
function collect(r){r.pickups.push({type:'ze-gotinha',x:r.player.x+17,y:20,speed:0});step(r,1/120);}

test('o relógio não recupera o jacaré, e a corrida e as ondas seguem após dez segundos',()=>{
 const r=isolated();collect(r);assert.equal(r.player.isJacare,true);
 r.shieldFor=Infinity;
 step(r,12);
 assert.equal(r.player.isJacare,true);
 assert.equal(r.player.jacareProgress,0);
 assert.ok(r.distance>1000);
 const deadline=r.elapsed+5;
 while(!r.obstacles.some(o=>o.type==='pfizer-ampoule'&&o.age<.1)&&r.elapsed<deadline)step(r,1/120);
 const wave=r.obstacles.filter(o=>o.type==='pfizer-ampoule');
 assert.ok(wave.length===4&&wave.every(o=>o.warningFor>=.78),'uma onda nova ainda tem aviso e desvio');
});

test('quinto comando retorna sem salto, preservando velocidade, vida e proteção já existente',()=>{
 const r=isolated();r.lives=2;r.player.hp=2;r.shieldFor=8;collect(r);
 assert.equal(r.player.jacareProgress,0);
 for(let n=1;n<5;n++){
  assert.equal(core.recoverJacareRun(r),true);
  assert.equal(r.player.jacareProgress,n);
  assert.equal(r.player.isJacare,true);
  assert.equal(core.jumpRun(r),false);
  assert.equal(r.player.velocity,0);
 }
 core.moveRun(r,1);
 assert.equal(core.recoverJacareRun(r),true);
 assert.equal(r.player.jacareProgress,5);
 assert.equal(r.player.isJacare,false);
 assert.equal(r.player.velocity,0);
 assert.equal(r.player.jumpBufferedUntil,0);
 assert.equal(r.player.moveHeld,1);
 assert.equal(r.player.hp,2);
 assert.equal(r.lives,2);
 assert.ok(r.shieldFor>7);
 assert.ok(r.player.restoreFlashFor>0);
 assert.equal(core.recoverJacareRun(r),false);
 assert.equal(core.jumpRun(r),true,'só um novo comando permite salto humano');
});

test('uma coleta sobreposta não apaga o progresso e um novo evento começa em zero',()=>{
 const r=isolated();collect(r);core.recoverJacareRun(r);collect(r);
 assert.equal(r.player.jacareProgress,1);
 assert.equal(r.collected,1);
 for(let n=0;n<4;n++)core.recoverJacareRun(r);
 r.shieldFor=Infinity;step(r,2.5);
 collect(r);
 assert.equal(r.player.isJacare,true);
 assert.equal(r.player.jacareProgress,0);
 assert.equal(r.collected,2);
});

test('coleta simultânea com o início de um chefe ou perseguição não transforma',()=>{
 for(const event of ['nextBossAt','nextRaid']){
  const r=isolated();r[event]=0;collect(r);
  assert.ok(r.raid||r.boss);
  assert.equal(r.player.isJacare,false);
  assert.equal(r.collected,0);
 }
});

test('um salto antes do pouso não conta sozinho como recuperação',()=>{
 const r=isolated();collect(r);r.player.jumpBufferedUntil=r.elapsed+.12;
 step(r,.04);
 assert.equal(r.player.jacareProgress,0);
 assert.equal(r.player.velocity,0);
});

test('a coleta avisa a primeira onda imediatamente e cinco comandos não apagam a ameaça',()=>{
 for(const finishImmediately of [false,true]){
  const r=isolated();collect(r);
  const wave=r.obstacles.filter(o=>o.type==='pfizer-ampoule');
  assert.equal(wave.length,3,'primeira pressão começa com a coleta');
  assert.ok(wave.every(o=>o.age===0&&o.warningFor>=.78));
  if(finishImmediately){
   for(let n=0;n<5;n++)assert.equal(core.recoverJacareRun(r),true);
   assert.equal(r.player.isJacare,false);
   assert.deepEqual(r.obstacles,wave,'sinais já exibidos continuam valendo');
  }
  step(r,1.8);
  assert.equal(r.status,'running');assert.equal(r.player.hp,1,'ficar parado custa um dos dois impactos mesmo depois de restaurar a forma');
  assert.equal(r.lastHit.type,'pfizer-ampoule');
 }
});

test('Joice e chefes não sobrepõem a última onda depois da forma humana voltar',()=>{
 for(const pending of ['nextBossAt','nextRaid']){
  const r=isolated();collect(r);r[pending]=0;r.shieldFor=Infinity;
  for(let n=0;n<5;n++)core.recoverJacareRun(r);
  step(r,.9);assert.ok(r.obstacles.some(o=>o.type==='pfizer-ampoule'));assert.equal(r.boss,null);assert.equal(r.raid,null);
  step(r,1.7);assert.ok(pending==='nextBossAt'?r.boss:r.raid);
 }
});
