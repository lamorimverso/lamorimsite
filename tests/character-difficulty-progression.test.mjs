import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
const DT=1/120;
const tier=core.CHARACTER_UNLOCK_LEVEL;
test('entrada escalonada sem retirar personagens já conhecidos',()=>{
 assert.equal(tier.dilma,1);assert.equal(tier.simone,2);assert.equal(tier.soraya,3);assert.equal(tier['meme-army'],5);
 const names=new Set();
 for(let level=1;level<=10;level++){
  const cast=core.unlockedCharacters(level);
  for(const name of names)assert.ok(cast.includes(name),'não deve bloquear ator conhecido: '+name);
  for(const name of cast){assert.ok(tier[name]<=level);names.add(name);}
 }
 assert.deepEqual(core.unlockedCharacters(1,'overhead'),['dilma']);
 assert.deepEqual(core.unlockedCharacters(2,'overhead'),['dilma','simone']);
 assert.deepEqual(core.unlockedCharacters(3,'overhead'),['dilma','simone','soraya']);
 assert.deepEqual(core.unlockedCharacters(5,'overhead'),['dilma','simone','soraya','meme-army']);
 assert.equal(core.unlockedCharacters(1,'ground').includes('dino'),false);
 assert.equal(core.unlockedCharacters(6,'ground').includes('dino'),true);
});
test('cada estágio usa somente inimigos do patamar, sem alterar o cenário',()=>{
 for(let level=1;level<=10;level++)for(let stage=0;stage<5;stage++)for(let seed=1;seed<=90;seed++){
  const selected=core.pursuitAt(stage*20,core.createSeededRandom(seed),level);
  assert.ok(tier[selected.type]<=level,selected.type+' antes do desbloqueio');
  assert.ok(core.PURSUERS.some(p=>p.type===selected.type));
 }
});
test('inimigos novos são apresentados antes de repetição excessiva no mesmo cenário',()=>{
 const seen=[];
 for(let i=0;i<8;i++){
  const selected=core.pursuitAt(0,()=>.5,4,seen,seen.at(-1)).type;
  if(!seen.includes(selected))seen.push(selected);
 }
 assert.ok(seen.includes('pf'));
 assert.ok(seen.includes('barrier'));
 assert.ok(seen.includes('janones'));
 assert.ok(seen.includes('boulos'));
});
test('no motor, personagens aéreos só surgem após a liberação da dificuldade',()=>{
 for(const [distance,seconds] of [[0,10],[7000,25],[15000,40],[29000,80],[95000,160]]){
  const r=core.createRun({seed:73});core.startRun(r);r.distance=r.routeDistance=distance;r.elapsed=seconds;
  r.shieldFor=Infinity;
  for(const k of ['nextBossAt','nextRaid','nextAllyAt','nextSupportAt','nextPower','nextPassport'])r[k]=Infinity;
  r.nextObstacle=0;
  const risk=core.difficultyAt(distance,seconds).level;
  for(let i=0;i<1400;i++){
   core.advanceRun(r,DT,()=>.45);
   for(const o of r.obstacles)if(o.sourceActor&&o.sourceActor!=='joice')
    assert.ok(tier[o.sourceActor]<=core.difficultyAt(r.distance,r.elapsed).level,o.sourceActor+' antes do risco adequado');
  }
  assert.ok(r.seenOverheadActors.every(actor=>tier[actor]<=core.difficultyAt(r.distance,r.elapsed).level),risk);
 }
});
test('História possui vinte chefões e o Infinito permanece sem final',()=>{
 assert.equal(core.STORY_BOSS_COUNT,20);
 assert.deepEqual(core.BOSS_ROSTER,['haddad','lula','xandao','janones','pf']);
 for(const mode of core.GAME_MODES){
  const r=core.createRun({mode});assert.equal(r.mode,mode);
  assert.deepEqual(core.characterProgressAt(r),{level:1,available:2,total:9,characters:['pf','dilma']});
 }
});
