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
