import test from 'node:test';
import assert from 'node:assert/strict';
import * as bosses from '../tanahoraflavio/runner-bosses.mjs';
import * as core from '../tanahoraflavio/runner-core.mjs';
const boss=()=>({...bosses.storyBossAt(2),maxHp:22,hp:22,fired:5,actionStreak:0});
test('IA usa postura e permanência do jogador em vez de sequência fixa',()=>{
 assert.equal(typeof bosses.planArenaAttack,'function');
 const b=boss(),p={x:120,y:0,crouching:false,moveHeld:0,stillFor:0};
 const a=bosses.planArenaAttack(b,p,()=>.5);
 const crouched=bosses.planArenaAttack(b,{...p,crouching:true},()=>.5);
 const jumping=bosses.planArenaAttack(b,{...p,y:55},()=>.5);
 const camping=bosses.planArenaAttack(b,{...p,stillFor:3},()=>.5);
 assert.equal(crouched.action,'jump');assert.equal(jumping.action,'crouch');assert.equal(camping.action,'move');
 assert.notDeepEqual(a,crouched);
 assert.deepEqual(bosses.planArenaAttack(b,p,()=>.5),a,'reprodutível');
});
test('IA limita repetições, mantém armas e preserva a abertura didática',()=>{
 assert.equal(typeof bosses.planArenaAttack,'function');
 for(let i=0;i<20;i++){
  const b={...bosses.storyBossAt(i),maxHp:50,hp:50,fired:7,lastAction:'jump',actionStreak:3};
  const p={x:140,y:0,crouching:true,moveHeld:0,stillFor:0};
  const a=bosses.planArenaAttack(b,p,()=>.5);assert.notEqual(a.action,'jump');assert.ok(b.attackTypes.includes(a.type)||a.action==='move');
  assert.deepEqual(bosses.planArenaAttack({...b,fired:0},p,()=>.5),bosses.arenaPatternFor({...b,fired:0},0));
 }
});
test('plano anunciado permanece até o lançamento e mira não persegue depois',()=>{
 const r=core.createRun({mode:'story'});core.startRun(r);r.shieldFor=Infinity;r.nextBossAt=0;
 r.nextRaid=r.nextObstacle=r.nextSupportAt=r.nextAllyAt=r.nextPower=r.nextPassport=Infinity;
 core.advanceRun(r,1/120,()=>.5);
 Object.assign(r.boss,{phase:'recover',phaseFor:0,fired:5,stillFor:0});core.crouchRun(r,true);
 core.advanceRun(r,1/120,()=>.5);const planned={...r.boss.plannedAttack};assert.equal(planned.action,'jump');
 core.crouchRun(r,false);r.player.y=60;
 for(let i=0;i<300&&!r.obstacles.some(o=>o.projectile&&o.launched);i++)core.advanceRun(r,1/120,()=>.5);
 const shot=r.obstacles.find(o=>o.projectile&&o.launched);assert.ok(shot);assert.equal(shot.action,planned.action);
 const target=[shot.targetX,shot.targetY];r.player.x+=50;r.player.y=90;
 core.advanceRun(r,1/120,()=>.5);assert.deepEqual([shot.targetX,shot.targetY],target);
});

test('padrões variam a curvatura e mantêm a faixa de contato esquivável',()=>{
 assert.equal(typeof bosses.planArenaAttack,'function');
 const b={...boss(),classId:'gunner'},p={x:120,y:0,crouching:true};
 const a=bosses.planArenaAttack(b,p,()=>.2),c=bosses.planArenaAttack(b,p,()=>.8);
 assert.notEqual(a.arcHeight,c.arcHeight);assert.ok(a.targetY>=20&&a.targetY<=30);assert.ok(c.targetY>=20&&c.targetY<=30);
});

test('a posição lateral muda a escolha sem alterar o sorteio da partida',()=>{
 const b={...boss(),classId:'gunner'},p={x:90,y:0,crouching:false,stillFor:0,viewportWidth:480};
 const far=bosses.planArenaAttack(b,p,()=>.3),close=bosses.planArenaAttack(b,{...p,x:340},()=>.3);
 assert.notEqual(far.action,close.action);
});
