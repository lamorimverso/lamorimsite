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

test('a abertura reforça só o próximo projétil devolvido, mesmo depois de acabar o aviso',async()=>{
 const core=await import('../tanahoraflavio/runner-core.mjs');
 function ready(earned){
  const r=core.createRun({mode:'story',seed:17});core.startRun(r);core.resizeRun(r,480);r.nextBossAt=0;r.bossesDefeated=1;r.shieldFor=Infinity;
  r.nextObstacle=r.nextRaid=r.nextPower=r.nextPassport=r.nextAllyAt=r.nextSupportAt=Infinity;core.advanceRun(r,1/120);
  const b=r.boss,opening=b.plannedAttack.counter;
  Object.assign(b,{phase:'recover',phaseFor:.12,recover:opening.window+opening.delay+.1,earnedCounter:opening,hp:100,maxHp:100});
  if(earned)b.counterReady=opening;
  for(let i=0;i<28;i++)core.advanceRun(r,1/120);
  assert.equal(bosses.bossCounterWindow(b).label,null);
  const x=r.player.x+122,y=52;
  r.obstacles=[{type:'hammer',owner:b.type,bossAttack:true,projectile:true,launched:true,x,width:40,height:40,speed:80,launchX:x+20,launchY:y,targetX:r.player.x+17,targetY:y,y}];
  assert.equal(core.attackRun(r),true);
  for(let i=0;i<180&&b.hp===100;i++)core.advanceRun(r,1/120);
  return {lost:100-b.hp,charge:b.counterReady};
 }
 const plain=ready(false),boosted=ready(true);
 assert.ok(plain.lost>0);assert.ok(boosted.lost>plain.lost);
 assert.equal(boosted.charge,null,'a mesma abertura não se aplica a múltiplas devoluções');
});
