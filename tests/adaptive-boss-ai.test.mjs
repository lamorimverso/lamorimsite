import test from 'node:test';
import assert from 'node:assert/strict';
import * as bosses from '../tanahoraflavio/runner-bosses.mjs';
import * as core from '../tanahoraflavio/runner-core.mjs';
const boss=()=>({...bosses.storyBossAt(2),maxHp:22,hp:22,fired:5,actionStreak:0});
test('cada chefe mantém seu padrão anunciado quando a postura do jogador muda',()=>{
 const b=boss(),p={x:120,y:0,crouching:false,moveHeld:0,stillFor:0};
 const a=bosses.planArenaAttack(b,p,()=>.5);
 for(const player of [{...p,crouching:true},{...p,y:55},{...p,stillFor:3}])
  assert.deepEqual(bosses.planArenaAttack(b,player,()=>.9),a);
 assert.deepEqual(a,bosses.arenaPatternFor(b,b.fired));
});
test('planejamento mantém armas próprias e preserva a abertura didática de cada identidade',()=>{
 for(let i=0;i<24;i++){
  const b={...bosses.storyBossAt(i),maxHp:50,hp:50,fired:7,lastAction:'jump',actionStreak:3};
  const p={x:140,y:0,crouching:true,moveHeld:0,stillFor:0};
  const a=bosses.planArenaAttack(b,p,()=>.5);assert.ok(b.attackTypes.includes(a.type));
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
test('padrões autorais variam a curvatura e mantêm a faixa de contato esquivável',()=>{
 const b=boss();
 const attacks=Array.from({length:12},(_,fired)=>bosses.planArenaAttack({...b,fired}));
 assert.ok(new Set(attacks.map(a=>a.arcHeight)).size>1);
 for(const a of attacks)assert.ok(a.action==='move'||a.action==='jump'&&a.targetY>=20&&a.targetY<=30||a.action==='crouch'&&a.targetY>=88&&a.targetY<=96);
});
test('posição lateral e sorteio não substituem a tática própria do chefe',()=>{
 const b=boss(),p={x:90,y:0,crouching:false,stillFor:0,viewportWidth:480};
 assert.deepEqual(bosses.planArenaAttack(b,p,()=>.3),bosses.planArenaAttack(b,{...p,x:340},()=>.9));
});
