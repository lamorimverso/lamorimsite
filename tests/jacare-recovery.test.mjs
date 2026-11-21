import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';

const DT=1/120;
function isolated(){
 const r=core.createRun({seed:17});core.startRun(r);
 r.nextBossAt=r.nextRaid=r.nextObstacle=r.nextAllyAt=r.nextSupportAt=Infinity;
 r.nextPower=r.nextPassport=r.nextPickup=Infinity;
 return r;
}
function step(r,seconds){for(let i=0;i<Math.ceil(seconds/DT)&&r.status==='running';i++)core.advanceRun(r,DT);}
function collect(r){r.pickups.push({type:'ze-gotinha',x:r.player.x+17,y:20,speed:0});step(r,DT);}

test('jacaré conta dez segundos sozinho, sem pressionar W, toque ou outro botão',()=>{
 const r=isolated();r.shieldFor=Infinity;collect(r);
 assert.equal(r.player.isJacare,true);assert.equal(r.player.jacareAge,0);
 step(r,core.JACARE_RECOVERY_SECONDS-.2);
 assert.equal(r.player.isJacare,true);
 assert.ok(r.player.jacareAge>9.7&&r.player.jacareProgress===9);
 assert.ok(r.distance>1000,'a corrida e as ondas continuam enquanto o relógio avança');
 step(r,.25);
 assert.equal(r.player.isJacare,false);
 assert.equal(r.player.jacareProgress,core.JACARE_RECOVERY_SECONDS);
 assert.equal(r.player.jacareAge,core.JACARE_RECOVERY_SECONDS);
 assert.equal(r.player.velocity,0);
 assert.ok(r.player.restoreFlashFor>0);
 assert.equal(core.recoverJacareRun(r),false);
});

test('W e demais comandos não aceleram nem reiniciam a contagem, mantendo vida e deslocamento',()=>{
 const r=isolated();r.lives=2;r.player.hp=2;r.shieldFor=Infinity;collect(r);
 for(let n=0;n<10;n++){
  assert.equal(core.recoverJacareRun(r),false);
  assert.equal(core.jumpRun(r),false);
 }
 assert.equal(r.player.jacareAge,0);
 assert.equal(r.player.jacareProgress,0);
 core.moveRun(r,1);step(r,.5);
 assert.equal(r.player.isJacare,true);
 assert.ok(r.player.x>core.PLAYER.x);
 assert.equal(r.player.hp,2);
 assert.equal(r.lives,2);
 step(r,core.JACARE_RECOVERY_SECONDS);
 assert.equal(r.player.isJacare,false);
 assert.equal(r.player.moveHeld,1);
 assert.equal(r.player.hp,2);
 assert.equal(r.lives,2);
 assert.equal(core.jumpRun(r),true,'o salto só volta a funcionar depois do temporizador');
});

test('coleta repetida não reinicia relógio e um novo jacaré inicia em dez segundos',()=>{
 const r=isolated();r.shieldFor=Infinity;collect(r);step(r,2);
 const before=r.player.jacareAge;collect(r);
 assert.equal(r.player.isJacare,true);
 assert.ok(r.player.jacareAge>=before);
 assert.equal(r.collected,1);
 step(r,core.JACARE_RECOVERY_SECONDS);
 assert.equal(r.player.isJacare,false);
 step(r,3);
 collect(r);
 assert.equal(r.player.isJacare,true);
 assert.equal(r.player.jacareAge,0);
 assert.equal(r.player.jacareProgress,0);
 assert.equal(r.collected,2);
});

test('coleta simultânea com começo de chefe ou raid não transforma',()=>{
 for(const event of ['nextBossAt','nextRaid']){
  const r=isolated();r[event]=0;collect(r);
  assert.ok(r.raid||r.boss);
  assert.equal(r.player.isJacare,false);
  assert.equal(r.collected,0);
 }
});

test('salto anterior, input mantido e recuperação automática não disparam salto involuntário',()=>{
 const r=isolated();collect(r);r.shieldFor=Infinity;
 r.player.jumpBufferedUntil=r.elapsed+.12;
 step(r,.04);
 assert.equal(r.player.jacareProgress,0);
 assert.equal(r.player.velocity,0);
 step(r,core.JACARE_RECOVERY_SECONDS);
 assert.equal(r.player.isJacare,false);
 assert.equal(r.player.velocity,0);
 assert.equal(r.player.jumpBufferedUntil,0);
});

test('contagem expira sem apagar ampolas já anunciadas nem abrir nova onda',()=>{
 const r=isolated();r.shieldFor=Infinity;collect(r);
 r.player.jacareAge=core.JACARE_RECOVERY_SECONDS-.15;
 r.player.nextJacareThreat=0;
 r.obstacles=[];
 step(r,DT);
 const wave=r.obstacles.filter(o=>o.type==='pfizer-ampoule');
 assert.ok(wave.length>=3&&wave.every(o=>o.warningFor>=.78));
 step(r,.2);
 assert.equal(r.player.isJacare,false);
 assert.ok(wave.every(o=>r.obstacles.includes(o)),'os avisos existentes não desaparecem');
 const count=r.obstacles.length;
 step(r,.1);
 assert.equal(r.obstacles.length,count,'não há nova onda depois da forma humana');
});

test('chefes e Joice aguardam o fim do relógio e da última onda',()=>{
 for(const pending of ['nextBossAt','nextRaid']){
  const r=isolated();collect(r);r[pending]=0;r.shieldFor=Infinity;
  step(r,core.JACARE_RECOVERY_SECONDS-.3);
  assert.equal(r.player.isJacare,true);
  assert.equal(r.boss,null);assert.equal(r.raid,null);
  step(r,.4);
  assert.equal(r.player.isJacare,false);
  step(r,3);
  assert.ok(pending==='nextBossAt'?r.boss:r.raid);
 }
});
