import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
import {nextStoryBossDistance,storyBossAt} from '../tanahoraflavio/runner-bosses.mjs';

const dt=1/120;
function scene(type='xandao'){
 const r=core.createRun({mode:'story',seed:22});core.startRun(r);core.resizeRun(r,480);
 for(const k of ['nextRaid','nextObstacle','nextAllyAt','nextSupportAt','nextPower','nextPassport'])r[k]=Infinity;
 if(type){const i=Array.from({length:core.STORY_BOSS_COUNT},(_,index)=>storyBossAt(index)).findIndex(b=>b.type===type);
  r.bossesDefeated=i;r.distance=r.routeDistance=nextStoryBossDistance(i);r.nextBossAt=0;r.shieldFor=Infinity;core.advanceRun(r,dt);
 }else r.nextBossAt=Infinity;
 return r;
}
function until(r,predicate,maxSeconds=15){
 for(let i=0;i<maxSeconds/dt&&!predicate();i++)core.advanceRun(r,dt);
 assert.ok(predicate(),'expected game state never occurred');
}

test('a shot only destroys active hostile projectiles; bodies and ground structures stay unchanged',()=>{
 const r=scene(null),m=core.heroMuzzleFor(r);
 const body={type:'pf',x:m.x+60,width:45,height:75,speed:0};
 const barrier={type:'barrier',x:m.x+112,width:40,height:75,speed:0};
 const civic={type:'crowd-lane',x:m.x+130,width:50,height:56,falling:true,y:m.y,age:0,warningFor:8,fallFor:.4,speed:0};
 const bouncingBody={type:'ze-gotinha-rival',x:m.x+172,width:24,height:35,speed:0,projectile:true,launched:true,y:m.y};
 const runner={...bouncingBody,x:m.x+190,type:'lula-runner'};
 const hostile={type:'message',x:m.x+220,width:28,height:30,speed:10,projectile:true,launched:true,launchX:m.x+234,launchY:m.y,y:m.y,targetY:m.y,targetX:m.x-10};
 r.obstacles=[body,barrier,civic,bouncingBody,runner,hostile];
 assert.equal(core.attackRun(r),true);
 until(r,()=>!r.obstacles.includes(hostile));
 assert.ok(r.obstacles.includes(body));assert.ok(r.obstacles.includes(barrier));assert.ok(r.obstacles.includes(civic));
 for(const o of [body,barrier,civic,bouncingBody,runner]){assert.ok(r.obstacles.includes(o));assert.equal(o.hitPoints,undefined);}
 assert.equal(r.defeatedEnemies,0);
});

test('a direct shot damages the boss once and is consumed',()=>{
 const r=scene();until(r,()=>r.boss.phase==='charge');
 const b=r.boss,hp=b.hp,pose=core.bossArenaPose(b,480);
 r.heroShots.push({x:pose.x-52,y:pose.platformY+48,radius:5,cancels:0,vx:850,vy:0,age:0,flightFor:.2,damage:30});
 for(let i=0;i<16;i++)core.advanceRun(r,dt);
 assert.ok(b.hp<hp);assert.equal(r.heroShots.length,0);const after=b.hp;
 for(let i=0;i<60;i++)core.advanceRun(r,dt);assert.equal(b.hp,after,'the consumed shot cannot hit again');
});

test('starter shot relays an in-flight boss projectile, and damage occurs only on the return',()=>{
 const r=scene();until(r,()=>r.obstacles.some(o=>o.launched));
 const hostile=r.obstacles.find(o=>o.launched),boss=r.boss,hp=boss.hp;
 assert.equal(core.attackRun(r),true);
 until(r,()=>hostile.reflected===true);
 assert.equal(boss.hp,hp,'the hit between projectiles does not damage the boss immediately');
 assert.ok(r.obstacles.includes(hostile));
 assert.equal(hostile.passed,true);assert.equal(r.player.hp,r.player.maxHp);
 until(r,()=>boss.hp<hp);
 assert.ok(!r.obstacles.includes(hostile));
});

test('natural boomerang return without Flávio firing cannot damage a boss',()=>{
 const r=scene('lula'),hp=r.boss.hp;
 until(r,()=>r.obstacles.some(o=>o.returning));
 until(r,()=>r.boss.phase==='recover');
 assert.equal(r.boss.hp,hp);assert.equal(r.shotsFired,0);
});


test('the lookout ignores windups and falling marks when selecting a projectile',()=>{
 const r=scene(null),p=core.heroMuzzleFor(r);
 const mark={type:'stage-spotlight',x:p.x+55,width:30,height:45,falling:true,projectile:true,y:p.y,age:1.2,warningFor:1.2,fallFor:.4,speed:0};
 const pending={type:'microphone',projectile:true,x:p.x+155,y:p.y+8,width:30,height:36,speed:180,waitFor:3};
 assert.equal(core.isHostileProjectile(undefined),false);
 assert.equal(core.isHostileProjectile(mark),false);
 assert.equal(core.isHostileProjectile(pending),false);
 r.obstacles=[mark,pending];assert.equal(core.attackRun(r),true);
 assert.ok(r.heroShots[0].vx>0);assert.equal(r.heroShots[0].vy,0);
 for(let i=0;i<35;i++)core.advanceRun(r,dt);
 assert.ok(r.obstacles.includes(pending));assert.equal(mark.destroyed,undefined);
});

test('an enemy projectile already behind the front muzzle cannot lock Flávio into a near-vertical shot',()=>{
 const r=scene(null),m=core.heroMuzzleFor(r),front={type:'message',projectile:true,launched:true,x:m.x-18,y:110,width:22,height:30,speed:30};
 r.obstacles=[front];assert.equal(core.attackRun(r),true);
 const shot=r.heroShots[0];assert.ok(shot.vx>700);assert.equal(shot.vy,0);
});

test('a target behind Flávio does not reverse targetless shots after it is gone',()=>{
 const r=scene(null),m=core.heroMuzzleFor(r,-1),rear={type:'message',projectile:true,launched:true,x:m.x-60,y:m.y,width:28,height:30,speed:0};
 r.obstacles=[rear];assert.equal(core.attackRun(r),true);assert.equal(r.player.shotFacing,-1);
 r.obstacles=[];for(let i=0;i<40;i++)core.advanceRun(r,dt);
 assert.equal(core.attackRun(r),true);assert.equal(r.player.shotFacing,1);assert.ok(r.heroShots.at(-1).vx>0);
});

test('Infinito leaves the last rebound in flight long enough to reach its owner',()=>{
 const r=core.createRun({mode:'endless',seed:1});core.startRun(r);
 for(const k of ['nextRaid','nextObstacle','nextAllyAt','nextSupportAt','nextPower','nextPassport'])r[k]=Infinity;
 r.nextBossAt=0;core.advanceRun(r,dt);
 const boss=r.boss,m=core.heroMuzzleFor(r),hp=boss.hp;
 Object.assign(boss,{remaining:1,fired:boss.total,nextAttack:Infinity});
 const threat={type:'receipts',owner:boss.type,bossAttack:true,projectile:true,launched:true,x:m.x+80,width:28,height:30,speed:60,launchX:m.x+94,launchY:m.y,y:m.y,targetY:m.y,targetX:m.x-10};
 r.obstacles=[threat];assert.equal(core.attackRun(r),true);
 until(r,()=>threat.reflected);
 assert.equal(r.boss,boss,'the last rebound is still visible');
 assert.equal(boss.hp,hp);
 until(r,()=>r.boss===null);
 assert.ok(boss.hp<hp,'the reflected object made contact before the victory');
});
