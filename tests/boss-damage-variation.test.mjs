import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';

const dt=1/120;
function scene(seed=22){
 const r=core.createRun({seed});core.startRun(r);r.shieldFor=Infinity;
 for(const k of ['nextRaid','nextObstacle','nextAllyAt','nextSupportAt','nextPower','nextPassport'])r[k]=Infinity;
 r.terrain.nextAt=Infinity;r.nextBossAt=0;core.advanceRun(r,dt);
 Object.assign(r.boss,{hp:100,maxHp:100,remaining:100,total:100,nextAttack:Infinity});
 return r;
}
function advanceUntil(r,predicate){
 for(let i=0;i<360&&!predicate();i++)core.advanceRun(r,dt);
 assert.ok(predicate(),'the reflected projectile must reach its boss');
}
function rebound(r){
 const boss=r.boss,m=core.heroMuzzleFor(r),hp=boss.hp;
 const hostile={type:'receipts',owner:boss.type,bossAttack:true,projectile:true,launched:true,
  x:m.x+100,width:28,height:30,speed:60,launchX:m.x+114,launchY:m.y,y:m.y,targetY:m.y,targetX:m.x-10};
 r.obstacles=[hostile];r.player.attackCooldown=0;r.ammo=9;
 assert.equal(core.attackRun(r),true);
 advanceUntil(r,()=>hostile.reflected);
 assert.equal(boss.hp,hp,'interception cannot hurt the boss before the return lands');
 advanceUntil(r,()=>boss.hp<hp);
 return {amount:hp-boss.hp,critical:boss.lastDamage?.critical,feedback:boss.lastDamage&&{...boss.lastDamage}};
}
function sequence(seed){
 const r=scene(seed),hits=[];
 for(let i=0;i<24;i++){r.boss.hp=100;hits.push(rebound(r));}
 return hits;
}

test('identical successful rebounds vary damage and include occasional critical hits',()=>{
 const hits=sequence(22);
 assert.ok(new Set(hits.map(h=>h.amount.toFixed(4))).size>12,'damage must not stay fixed');
 assert.ok(hits.some(h=>h.critical));assert.ok(hits.some(h=>!h.critical));
 for(const h of hits){
  assert.ok(h.amount>=10.2-1e-8&&h.amount<=20.7+1e-8,'normal and critical damage stay within balanced bounds');
  assert.equal(h.feedback.amount,h.amount);assert.ok(h.feedback.remaining>0);
 }
});
test('seeded damage can be reproduced without repeating across different runs',()=>{
 const amounts=seed=>sequence(seed).map(({amount,critical})=>({amount,critical}));
 assert.deepEqual(amounts(22),amounts(22));assert.notDeepEqual(amounts(22),amounts(23));
});
test('damage rolls do not consume the attack planning random stream',()=>{
 const r=scene(22),prior=r.randomState;rebound(r);assert.equal(r.randomState,prior);
});
test('damage feedback reports actual HP removed and one projectile cannot hurt twice',()=>{
 const r=scene(22),boss=r.boss;boss.hp=2;
 const hit=rebound(r);assert.equal(boss.hp,0);assert.equal(hit.feedback.amount,2);
 const feedback=boss.lastDamage;
 for(let i=0;i<60;i++)core.advanceRun(r,dt);
 assert.equal(boss.hp,0);assert.equal(boss.lastDamage,feedback);
});
