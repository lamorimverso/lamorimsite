import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';

function isolated(){
 const run=core.createRun();core.startRun(run);
 run.nextBossAt=run.nextRaid=run.nextObstacle=run.nextAllyAt=Infinity;
 run.nextPower=run.nextPassport=run.nextPickup=Infinity;
 return run;
}
test('Zé Gotinha transforma em jacaré fictício, mantém respiro e restaura ao pressionar ↑',()=>{
 const r=isolated();
 assert.equal(r.player.isJacare,false);
 r.pickups=[{type:'ze-gotinha',x:136,y:20,speed:0}];
 core.advanceRun(r,1/120,()=>.5);
 assert.equal(r.player.isJacare,true);
 assert.equal(r.lastPickup,'ze-gotinha');
 assert.ok(r.nextObstacle>=2.5-1/120);
 assert.equal(r.passports,0);
 assert.equal(core.jumpRun(r),false,'primeiro comando consome antídoto ficcional');
 assert.equal(r.player.isJacare,false,'o herói volta à forma normal');
 assert.equal(r.player.y,0,'o retorno não salta no mesmo comando');
 assert.equal(r.player.velocity,0);
 assert.equal(core.jumpRun(r),true,'segundo comando salta normalmente');
 assert.ok(r.player.velocity>0);
});
test('Jacaré não salta e não pode usar agachamento para burlar o estado',()=>{
 const r=isolated();r.player.isJacare=true;
 assert.equal(core.crouchRun(r,true),false);
 assert.equal(r.player.crouching,false);
 assert.equal(core.jumpRun(r),false,'comando restaura a forma sem salto');
 assert.equal(r.player.isJacare,false);
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
 assert.ok(patterns.every(p=>p.type==='receipts'),'o visual Taxad não deve quebrar as assinaturas dos ataques');
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
 assert.ok(r.graceFor>=.85&&r.graceFor<=.9);
 assert.ok(r.shieldFor>2.9);
 assert.equal(r.lives,2);
 assert.equal(r.player.jacareAge,0);
 core.advanceRun(r,1/120,()=>.5);
 assert.ok(r.player.jacareAge>0,'animação acompanha tempo lógico');
});

test('antídoto fictício consome uma entrada e deixa breve recuperação sem salto automático',()=>{
 const r=isolated();r.player.isJacare=true;r.player.jacareAge=2;r.player.crouchHeld=true;
 assert.equal(core.crouchRun(r,true),false);
 assert.equal(r.player.crouchHeld,false,'não acumula agachamento oculto');
 assert.equal(core.jumpRun(r),false);
 assert.equal(r.player.isJacare,false);
 assert.ok(r.graceFor>=.55);
 assert.ok(r.player.restoreFlashFor>0);
 assert.equal(r.player.velocity,0);
 core.advanceRun(r,.1,()=>.5);
 assert.ok(r.player.restoreFlashFor>0);
 assert.equal(core.jumpRun(r),true,'segundo comando realmente executa o salto');
});

test('restaurar no ar não teletransporta o jacaré nem duplica o salto',()=>{
 const r=isolated();r.player.y=42;r.player.velocity=210;r.player.isJacare=true;
 assert.equal(core.jumpRun(r),false);
 assert.equal(r.player.y,42);assert.equal(r.player.velocity,210);
 assert.equal(core.jumpRun(r),false,'comando aéreo só permite buffer sem novo impulso');
 assert.equal(r.player.velocity,210);
});
