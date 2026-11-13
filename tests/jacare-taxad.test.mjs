import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';

function isolated(){
 const run=core.createRun();core.startRun(run);
 run.nextBossAt=run.nextRaid=run.nextObstacle=run.nextAllyAt=Infinity;
 run.nextPower=run.nextPassport=run.nextPickup=Infinity;
 return run;
}
test('jacaré dura dez segundos, ignora ↑ e volta automaticamente sem interromper corrida',()=>{
 const r=isolated();r.pickups=[{type:'ze-gotinha',x:136,y:20,speed:0}];
 core.advanceRun(r,1/120,()=>.5);
 assert.equal(r.player.isJacare,true);
 assert.equal(r.lastPickup,'ze-gotinha');
 assert.equal(core.JACARE_DURATION_SECONDS,10);
 assert.ok(r.nextObstacle>=2.5);
 r.shieldFor=Infinity;
 for(let i=0;i<10;i++)assert.equal(core.jumpRun(r),false);
 assert.equal(r.player.isJacare,true);
 const start=r.distance;
 for(let i=0;i<1199;i++)core.advanceRun(r,1/120,()=>.5);
 assert.equal(r.player.isJacare,true,'antes do fim dos 10 segundos');
 assert.ok(r.distance>start,'corrida avança durante a transformação');
 core.advanceRun(r,1/120,()=>.5);
 assert.equal(r.player.isJacare,false);
 assert.equal(r.player.velocity,0);
 assert.equal(core.jumpRun(r),true,'salto volta a funcionar');
});
test('jacaré não salta nem se abaixa para encurtar transformação',()=>{
 const r=isolated();r.player.isJacare=true;
 assert.equal(core.crouchRun(r,true),false);
 for(let i=0;i<20;i++)assert.equal(core.jumpRun(r),false);
 assert.equal(r.player.isJacare,true);
 assert.equal(r.player.crouchHeld,false);
});

test('A transformação não substitui proteção existente nem enfraquece vida extra',()=>{
 const r=isolated();r.shieldFor=5;r.lives=2;
 r.pickups=[{type:'ze-gotinha',x:136,y:20,speed:0}];
 core.advanceRun(r,1/120,()=>.5);
 assert.equal(r.lives,2);
 assert.ok(r.shieldFor>4);
 assert.equal(r.player.isJacare,true);
 assert.equal(core.scoreFor(r),Math.floor(r.distance));
});
test('Padrões do chefe Haddad continuam distinguindo salto e abaixar',()=>{
 const patterns=Array.from({length:9},(_,i)=>core.bossAttackFor('haddad',i));
 assert.ok(patterns.some(p=>p.action==='jump'));
 assert.ok(patterns.some(p=>p.action==='crouch'));
 assert.ok(patterns.every(p=>['receipts','stamp'].includes(p.type)),'o visual Taxad não deve quebrar as assinaturas dos ataques');
});


test('jacaré usa a largura real do desenho para colisões, humano mantém a largura antiga',()=>{
 const r=isolated();r.player.isJacare=true;r.player.jacareAge=1;r.graceFor=0;
 r.obstacles=[{x:161,width:32,height:24,type:'barrier',speed:0}];
 core.advanceRun(r,1/120,()=>.5);
 assert.equal(r.status,'over','colisão alcança a cabeça do jacaré, que aparece mais larga');
 const human=isolated();human.graceFor=0;
 human.obstacles=[{x:161,width:32,height:24,type:'barrier',speed:0}];
 core.advanceRun(human,1/120,()=>.5);
 assert.equal(human.status,'running','não amplia a hitbox do personagem humano');
});

test('coleta cria margem segura de transformação e mantém escudo e vidas',()=>{
 const r=isolated();r.graceFor=0;r.shieldFor=3;r.lives=2;
 r.pickups=[{type:'ze-gotinha',x:136,y:20,speed:0}];
 core.advanceRun(r,1/120,()=>.5);
 assert.equal(r.player.isJacare,true);
 assert.ok(r.graceFor>=3&&r.graceFor<=3.01);
 assert.ok(r.shieldFor>2.9);
 assert.equal(r.lives,2);
 assert.equal(r.player.jacareAge,0);
 core.advanceRun(r,1/120,()=>.5);
 assert.ok(r.player.jacareAge>0,'animação acompanha tempo lógico');
});

test('retorno por tempo preserva proteção e não oferece salto automático',()=>{
 const r=isolated();r.player.isJacare=true;r.player.jacareAge=9.99;r.player.crouchHeld=true;r.shieldFor=Infinity;
 core.advanceRun(r,.02,()=>.5);
 assert.equal(r.player.isJacare,false);
 assert.ok(r.graceFor>.49);
 assert.ok(r.player.restoreFlashFor>0);
 assert.equal(r.player.velocity,0);
 assert.equal(core.jumpRun(r),true);
});
test('retorno automático no ar não teletransporta o personagem',()=>{
 const r=isolated();r.player.y=42;r.player.velocity=210;r.player.isJacare=true;r.player.jacareAge=9.99;r.shieldFor=Infinity;
 core.advanceRun(r,.02,()=>.5);
 assert.equal(r.player.isJacare,false);
 assert.ok(r.player.y>42);
 assert.ok(r.player.velocity>0);
 assert.equal(core.jumpRun(r),false,'no ar, o próximo comando só arma buffer');
});
