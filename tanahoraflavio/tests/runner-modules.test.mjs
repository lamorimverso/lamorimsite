import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../runner-core.mjs';
import * as difficulty from '../runner-difficulty.mjs?v=9c65e484cb70';
import * as geometry from '../runner-run-geometry.mjs?v=6561adb004e2';
import * as random from '../runner-random.mjs?v=8de9f87c7593';
import * as combat from '../runner-projectile-combat.mjs?v=ca84fdc99f94';
import * as state from '../runner-run-state.mjs?v=376084611be1';
import * as boss from '../runner-boss-rules.mjs?v=c153f9a51b4d';
import * as timing from '../runner-threat-timing.mjs?v=f309aa6ac16a';
import * as cues from '../runner-attack-cues.mjs?v=5545f4acc1e6';

test('public core bindings remain compatible with the extracted modules',()=>{
 for(const [module,names] of [
  [difficulty,['PURSUERS','CHARACTER_UNLOCK_LEVEL','unlockedCharacters','characterProgressAt','difficultyAt','pursuitAt']],
  [geometry,['WORLD','PLAYER','playerX','playerBounds']],
  [random,['createSeededRandom']],
  [combat,['setAttackRun','heroMuzzleFor','isHostileProjectile','attackRun']],
  [state,['startRun','ballotDigit','ballotClear','ballotConfirm','togglePause','scoreFor']],
  [boss,['BOSS_ROSTER','bossAtRound','bossAttackFor','storyDuelChallenge','applyStoryDuelTempo']],
  [timing,['threatTimeToContact']],
  [cues,['ATTACK_NAMES','attackCueFor','projectileStyle']]
 ])for(const name of names)assert.equal(core[name],module[name],name);
});

test('run factory facade preserves seeded state, independent mutable objects and lifecycle',()=>{
 for(const mode of ['story','endless']){
  const a=core.createRun({mode,seed:87}),b=state.createRunState({mode,seed:87});
  assert.deepEqual(a,b);
  assert.notEqual(a.player,b.player);
  assert.notEqual(a.obstacles,b.obstacles);
  assert.equal(a.randomState,87);
  assert.equal(a.status,'ready');
  core.startRun(a);assert.equal(a.status,'running');
  core.togglePause(a);assert.equal(a.status,'paused');
  core.togglePause(a);assert.equal(a.status,'running');
 }
});

test('seeded random stream and initial difficulty retain known values',()=>{
 const rng=core.createSeededRandom(0);
 assert.equal(rng(),1013904223/4294967296);
 assert.equal(rng(),1196435762/4294967296);
 assert.equal(core.difficultyAt(0).level,1);
 assert.equal(core.difficultyAt(0).speed,270);
 assert.equal(core.difficultyAt(0).obstacleGap,1.70);
 assert.equal(core.difficultyAt(0).bossApproach,1.15);
 assert.deepEqual(core.unlockedCharacters(1,'ground'),['pf','barrier']);
 assert.equal(core.pursuitAt(0,()=>0,1).type,'pf');
});

test('threat timing and firing retain contact geometry and ammo accounting',()=>{
 const run=core.createRun({seed:123});
 const front=geometry.frontContact(run);
 assert.equal(core.threatTimeToContact(run,{x:front+180,speed:180}),1);
 assert.equal(core.threatTimeToContact(run,{falling:true,warningFor:1,fallFor:1,age:.2}),1.5);
 assert.equal(core.attackRun(run),false);
 core.startRun(run);
 const before=run.ammo;
 assert.equal(core.attackRun(run),true);
 assert.equal(run.ammo,before-1);
 assert.equal(run.shotsFired,1);
 assert.ok(run.heroShots.length>0);
 assert.equal(core.attackRun(run),false);
});
