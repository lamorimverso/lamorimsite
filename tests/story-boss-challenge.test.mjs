import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
import {storyBossAt,nextStoryBossDistance,arenaPatternFor} from '../tanahoraflavio/runner-bosses.mjs';
function duel(index,assisted=false){
 const r=core.createRun({mode:'story',assisted,seed:17});core.startRun(r);
 for(const k of ['nextRaid','nextObstacle','nextAllyAt','nextSupportAt','nextPower','nextPassport'])r[k]=Infinity;
 r.terrain.nextAt=Infinity;r.bossesDefeated=index;r.distance=r.routeDistance=r.nextBossAt=nextStoryBossDistance(index);
 core.advanceRun(r,1/120);return r;
}
test('normal Story duels after the introductory encounter have more health, with final boss harder and crossings and assisted mode unchanged',()=>{
 for(let i=0;i<core.STORY_BOSS_COUNT;i++){
  const entry=storyBossAt(i),normal=duel(i).boss,assisted=duel(i,true).boss;
  const challenge=core.storyDuelChallenge(entry);
  assert.equal(normal.hp,Math.round(entry.hp*challenge.hpScale));
  assert.equal(normal.maxHp,normal.hp);
  assert.equal(assisted.hp,entry.hp);
  assert.equal(assisted.challengePressure,0);
  if(entry.traversal){assert.equal(normal.hp,1);assert.equal(normal.challengePressure,0);}
  else if(entry.type==='ana-elisa'){assert.equal(normal.hp,entry.hp);assert.equal(normal.challengePressure,0);}
  else {assert.ok(normal.hp>entry.hp);assert.ok(normal.challengePressure>0);}
 }
 const first=core.storyDuelChallenge(storyBossAt(1)),final=core.storyDuelChallenge(storyBossAt(core.STORY_BOSS_COUNT-1));
 assert.ok(final.hpScale>first.hpScale);assert.ok(final.pressure>first.pressure);
});
test('later duels tighten charge and unearned recovery without changing committed attacks or counter windows',()=>{
 for(let i=0;i<core.STORY_BOSS_COUNT;i++){
  const entry=storyBossAt(i);if(entry.traversal)continue;
  for(const hp of [entry.hp,entry.hp/3])for(let index=0;index<12;index++){
   const b={...entry,combat:true,hp,maxHp:entry.hp,patternIndex:index,challengePressure:core.storyDuelChallenge(entry).pressure};
   const pattern=arenaPatternFor(b,index);
   Object.assign(b,{plannedAttack:pattern,telegraph:pattern.telegraph,recover:pattern.recover,phaseFor:pattern.telegraph});
   const before=JSON.stringify(pattern);
   core.applyStoryDuelTempo(b);
   assert.equal(JSON.stringify(pattern),before);
   assert.ok(b.telegraph<=pattern.telegraph&&b.telegraph>=.62);
   assert.equal(b.phaseFor,b.telegraph);
   assert.ok(b.recover<=pattern.recover&&b.recover>=.62);
   if(pattern.counter)assert.equal(b.recover,pattern.recover);
   if(index<2){assert.equal(b.telegraph,pattern.telegraph);assert.equal(b.recover,pattern.recover);}
  }
 }
 const make=hp=>({combat:true,patternIndex:4,challengePressure:.10,hp,maxHp:100,telegraph:1,recover:1,phaseFor:1,plannedAttack:{}});
 const normal=make(100),enraged=make(40);
 core.applyStoryDuelTempo(normal);core.applyStoryDuelTempo(enraged);
 assert.ok(enraged.telegraph<normal.telegraph&&enraged.recover<normal.recover);
});
