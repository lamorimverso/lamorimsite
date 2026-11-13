import test from 'node:test';
import assert from 'node:assert/strict';
import * as bosses from '../tanahoraflavio/runner-bosses.mjs';
import {standingEnemyPose} from '../tanahoraflavio/runner-cast-pose.mjs';
const classes=['sentinel','gunner','caster','sovereign'];
test('classes têm trajetórias de nave diferentes, sem sair do campo de combate',()=>{
 const signatures=classes.map(classId=>Array.from({length:24},(_,i)=>bosses.bossArenaPose({classId,age:i/3,phase:'attack'},480)));
 assert.equal(new Set(signatures.map(s=>JSON.stringify(s.map(p=>p.platformY)))).size,4,'não basta variar amplitude lateral');
 for(const poses of signatures)for(const p of poses){assert.ok(p.x>=300&&p.x<=450);assert.ok(p.platformY>=45&&p.platformY<=115);}
});
test('preparação e soltura possuem silhueta própria por classe',()=>{
 for(const flags of [{preparing:true},{attacking:true}]){
  const poses=classes.map(classId=>standingEnemyPose({...flags,classId,phase:9,progress:.8,action:'jump'}).arms);
  assert.equal(new Set(poses.map(p=>JSON.stringify(p))).size,4);
 }
});
test('contra-ataque recompensa oportunidades diferentes por classe',()=>{
 assert.equal(typeof bosses.bossCounterWindow,'function');
 assert.equal(bosses.bossCounterWindow({classId:'sentinel',phase:'recover',phaseFor:.8,recover:1.3}).damage,2);
 assert.equal(bosses.bossCounterWindow({classId:'gunner',phase:'recover',phaseFor:1.1,recover:1.15}).damage,3);
 assert.equal(bosses.bossCounterWindow({classId:'gunner',phase:'charge',phaseFor:.8}).damage,1);
 assert.equal(bosses.bossCounterWindow({classId:'caster',phase:'charge',phaseFor:.2}).damage,3);
 assert.equal(bosses.bossCounterWindow({classId:'caster',phase:'charge',phaseFor:.8}).damage,1);
 assert.equal(bosses.bossCounterWindow({classId:'sovereign',phase:'recover',phaseFor:1,recover:1.05}).damage,3);
});

test('disparar ao ver a abertura garante o bônus mesmo após o tempo de voo',async()=>{
 const core=await import('../tanahoraflavio/runner-core.mjs');
 for(const [index,phase,phaseFor] of [[1,'recover',1.15],[2,'charge',.29],[3,'recover',1.05]]){
  const r=core.createRun({mode:'story'});core.startRun(r);r.nextBossAt=0;r.bossesDefeated=index;r.shieldFor=Infinity;
  r.nextObstacle=r.nextRaid=r.nextPower=r.nextPassport=r.nextAllyAt=r.nextSupportAt=Infinity;core.advanceRun(r,1/120,()=>.5);
  Object.assign(r.boss,{phase,phaseFor,hp:100,maxHp:100});
  assert.equal(bosses.bossCounterWindow(r.boss).damage,3);assert.equal(core.attackRun(r),true);
  for(let i=0;i<240&&r.heroShots.length;i++)core.advanceRun(r,1/120,()=>.5);
  assert.equal(r.boss.hp,97,'bônus anunciado para '+r.boss.classId);
 }
});
