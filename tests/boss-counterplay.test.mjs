import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
import {bossCounterWindow,storyBossAt,legacyBossAt,arenaPatternFor} from '../tanahoraflavio/runner-bosses.mjs';
import {combatGeometryFor} from '../tanahoraflavio/runner-combat-geometry.mjs';

const frame=1/120;
function scene(type,width=480){
 const r=core.createRun({mode:'story',seed:32});core.startRun(r);core.resizeRun(r,width);
 for(const k of ['nextRaid','nextObstacle','nextAllyAt','nextSupportAt','nextPower','nextPassport'])r[k]=Infinity;
 const index=Array.from({length:core.STORY_BOSS_COUNT},(_,i)=>storyBossAt(i)).findIndex(b=>b.type===type);
 r.bossesDefeated=Math.max(0,index);r.distance=r.routeDistance=22000;r.nextBossAt=0;r.shieldFor=Infinity;
 core.advanceRun(r,frame);
 // The retired Blitz remains a narrow regression fixture for guard collision.
 if(type==='pf'){
  const fixture=legacyBossAt(0);
  Object.assign(r.boss,fixture,{maxHp:fixture.hp,plannedAttack:arenaPatternFor(fixture,0)});
 }
 return r;
}
function until(run,predicate,max=120*26){
 for(let i=0;i<max&&!predicate();i++)core.advanceRun(run,frame);
 assert.ok(predicate(),'expected game state was never reached');
}

test('Blitz opens after actually clearing the barrier, not after tanking it behind a shield',()=>{
 const cleared=scene('pf'),shielded=scene('pf');
 for(const r of [cleared,shielded]){
  until(r,()=>r.obstacles.some(o=>o.launched&&core.threatTimeToContact(r,o)<=.165));
  if(r===cleared)assert.equal(core.jumpRun(r),true);
  until(r,()=>r.boss.phase==='recover');
 }
 const open=bossCounterWindow(cleared.boss),closed=bossCounterWindow(shielded.boss);
 assert.match(open.label,/BLITZ/);assert.ok(open.damage>=3);
 assert.equal(closed.label,null);assert.ok(closed.damage<=1);
 assert.equal(cleared.boss.counterReady?.label,open.label,'earning the window primes the next reflected projectile');
 assert.equal(shielded.boss.counterReady,undefined);
});

test('a Janones opening waits for all three messages to clear',()=>{
 const r=scene('janones');
 until(r,()=>r.boss.fired===1);
 for(let i=1;i<=3;i++){
  until(r,()=>r.obstacles.some(o=>o.launched&&!o.passed&&core.threatTimeToContact(r,o)<=.165));
  assert.equal(bossCounterWindow(r.boss).label,null);
  assert.equal(core.jumpRun(r),true);
  for(let tick=0;tick<Math.round(.54/frame);tick++)core.advanceRun(r,frame);
  if(i<3)assert.equal(bossCounterWindow(r.boss).label,null);
 }
 assert.match(bossCounterWindow(r.boss).label,/RAJADA/);
});

test('Lula cannot be countered before the L comes back',()=>{
 const r=scene('lula');
 until(r,()=>r.obstacles.some(o=>o.launched&&core.threatTimeToContact(r,o)<=.165));
 assert.equal(core.jumpRun(r),true);
 until(r,()=>r.obstacles.some(o=>o.returning));
 assert.equal(bossCounterWindow(r.boss).label,null);
 until(r,()=>!!bossCounterWindow(r.boss).label,120*5);
 assert.match(bossCounterWindow(r.boss).label,/VOLTOU/);
 assert.equal(r.obstacles.some(o=>o.returning),false);
});

test('story traversal spans a visible arc, and at the rightmost player position its release comes from the muzzle with time to react',()=>{
 for(const width of [480,900]){
  const r=scene('xandao',width);const minimum=core.playerBounds(r).min;
  until(r,()=>r.boss.phase==='charge');r.player.x=core.playerBounds(r).max;core.moveRun(r,1);
  const positions=[];let launched;
  for(let tick=0;tick<120*15;tick++){
   core.advanceRun(r,frame);
   const b=r.boss,pose=core.bossArenaPose(b,width);
   if(b.phase!=='intro')positions.push(pose.x);
   if(!launched&&(launched=r.obstacles.find(o=>o.launched))){
    const g=combatGeometryFor(b.type,{frame:2,facing:-1});
    assert.equal(r.player.x,core.playerBounds(r).max);
    assert.ok(Math.abs(launched.launchX-(pose.x+g.muzzle.x))<2,'attack should not teleport in front of the muzzle');
    assert.ok(Math.abs(launched.launchY-(pose.platformY-g.muzzle.y))<2);
    assert.ok(core.threatTimeToContact(r,launched)>=.48);
   }
  }
  assert.ok(launched,'fight spawned a horizontal projectile');
  assert.ok(core.playerBounds(r).max-minimum>=100,'mobile retains meaningful horizontal movement');
  assert.ok(Math.max(...positions)-Math.min(...positions)>=40,'boss performs a committed ground advance');
  assert.ok(positions.every(x=>x>=width-220&&x<=width-52),'boss stays within the visible combat arena');
 }
});

test('all 24 encounters teach a counter to their own attacks in both phases',()=>{
 const tactics=new Set();
 for(let index=0;index<24;index++){
  const b=legacyBossAt(index);tactics.add(b.tactic);
  for(const hp of [100,48]){
   const patterns=Array.from({length:12},(_,i)=>arenaPatternFor({...b,maxHp:100,hp},i));
   assert.ok(patterns.some(p=>p.counterHint),b.name+' needs a readable counter in this phase');
   assert.ok(patterns.some(p=>!p.counterHint)||b.type==='army',b.name+' should not signal an opening on every single attack');
  }
 }
 assert.equal(tactics.size,14);
});

test('a rematch at low health has a quicker windup and shorter reaction budget than the same pattern on the opening patrol',()=>{
 const first=legacyBossAt(0),later=legacyBossAt(8);let fresh,late;
 for(let i=0;i<12;i++){
  const a=arenaPatternFor({...first,maxHp:100,hp:100},i);
  for(let j=0;j<12;j++){
   const b=arenaPatternFor({...later,maxHp:100,hp:48},j);
   if(a.signature===b.signature&&a.action!=='move'){fresh=a;late=b;break;}
  }
  if(fresh)break;
 }
 assert.ok(fresh&&late);
 assert.ok(late.telegraph<=fresh.telegraph-.14);
 assert.ok(late.contactFor<=fresh.contactFor-.1);
 assert.ok(late.contactFor>=.78);
});


test('losing the current volley on rotation neither shortens its warning nor stalls combat',()=>{
 for(const [from,to] of [[480,900],[900,480]]){
  const r=scene('meme-army',from);core.moveRun(r,1);
  until(r,()=>r.obstacles.some(o=>o.launched));const shot=r.obstacles.find(o=>o.launched);
  const before=core.threatTimeToContact(r,shot);core.resizeRun(r,to);
  assert.ok(Math.abs(core.threatTimeToContact(r,shot)-before)<.015);
  until(r,()=>r.boss.phase==='recover');
  assert.ok(r.player.x<=core.playerBounds(r).max);
 }
});

test('late low attacks stay low at both ends of the mobile arena despite early forward movement',()=>{
 const r=scene('xandao');core.moveRun(r,-1);
 until(r,()=>r.obstacles.some(o=>o.launched));const shot=r.obstacles.find(o=>o.launched);
 r.player.x=core.playerBounds(r).max-70;core.moveRun(r,1);
 until(r,()=>core.threatTimeToContact(r,shot)<=.02);
 assert.equal(r.player.x,core.playerBounds(r).max);
 assert.ok(shot.y+shot.height/2<=50,'authored jump must clear the attack even at the forward edge');
});
