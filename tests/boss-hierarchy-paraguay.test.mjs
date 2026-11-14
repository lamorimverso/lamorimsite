import test from 'node:test';import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
import * as bosses from '../tanahoraflavio/runner-bosses.mjs';
test('rota contém Paraguai depois da Argentina, antes da Flórida e uma volta de42km',()=>{
 assert.deepEqual(core.STAGES.map(s=>s.id),['brasilia','rio','argentina','paraguai','florida','casa-branca']);
 for(let index=0;index<12;index++)assert.equal(core.stageAt(index*core.SCENE_SECONDS).id,core.STAGES[index%6].id);
 assert.equal(core.stageTransitionAt(4*core.SCENE_SECONDS).to.id,'florida');
});
test('24 chefes seguem quatro níveis; cada personagem conserva classe, poderes e patente',async()=>{
 const {bossProfileFor}=await import('../tanahoraflavio/runner-boss-profiles.mjs');
 assert.equal(core.STORY_BOSS_COUNT,24);const identities=new Map(),powers=new Map();let priorHp=0;
 for(let i=0;i<24;i++){
  const b=bosses.storyBossAt(i),p=bossProfileFor(b.type);assert.ok(p);assert.equal(b.rank,i%4+1);assert.equal(b.rank,p.rank);assert.equal(b.classId,p.classId);assert.deepEqual(b.attackTypes,p.attackTypes);assert.ok(b.hp>priorHp);priorHp=b.hp;
  const signature=JSON.stringify([b.rank,b.classId,b.attackTypes]);if(identities.has(b.type))assert.equal(signature,identities.get(b.type));identities.set(b.type,signature);
  for(const weapon of b.attackTypes){if(powers.has(weapon))assert.equal(powers.get(weapon),b.type,'poder não pode ser emprestado');powers.set(weapon,b.type);}
 }
 assert.equal(bosses.storyBossAt(15).type,'xandao');assert.equal(bosses.storyBossAt(15).stageIndex,3);assert.equal(bosses.storyBossAt(23).type,'meme-army');assert.equal(bosses.storyBossAt(24),null);
});
test('planejamento e padrões, incluindo chuva marcada, preservam a munição de cada chefe',()=>{
 for(let i=0;i<24;i++)for(let fired=0;fired<24;fired++)for(const roll of [.1,.5,.9]){
  const b={...bosses.storyBossAt(i),hp:12,maxHp:50,fired,stillFor:4};
  for(const attack of [bosses.arenaPatternFor(b,fired),bosses.planArenaAttack(b,{x:200,y:0,stillFor:4},()=>roll)])assert.ok(b.attackTypes.includes(attack.type),b.type+' recebeu '+attack.type);
 }
});

test('combate físico e perigos marcados dos24 encontros não emprestam poderes',()=>{
 for(let index=0;index<24;index++){
  const r=core.createRun({mode:'story'});core.startRun(r);r.bossesDefeated=index;r.nextBossAt=0;r.shieldFor=Infinity;
  for(const key of ['nextRaid','nextObstacle','nextAllyAt','nextSupportAt','nextPower','nextPassport'])r[key]=Infinity;
  const seen=new Set();for(let frame=0;frame<120*18;frame++){
   core.advanceRun(r,1/120,()=>.5);for(const o of r.obstacles)if(o.bossAttack){assert.equal(o.owner,r.boss.type);assert.ok(r.boss.attackTypes.includes(o.type),r.boss.type+' lançou '+o.type);seen.add(o.type);}
  }
  assert.ok(seen.size>0);
 }
});
test('a mesma identidade conserva patente, classe e família de armas também no Infinito',async()=>{
 const {bossProfileFor}=await import('../tanahoraflavio/runner-boss-profiles.mjs');
 for(const type of ['haddad','lula','xandao','janones','pf','army','bossonari']){
  const r=core.createRun();core.startRun(r);r.nextBossAt=0;r.nextRaid=Infinity;r.bossBag=[type];core.advanceRun(r,1/120,()=>.5);
  const p=bossProfileFor(type);assert.equal(r.boss.rank,p.rank);assert.equal(r.boss.classId,p.classId);assert.deepEqual(r.boss.attackTypes,p.attackTypes);
 }
});

test('Santiago é aliado exclusivo do Paraguai e nunca integra a campanha inimiga',async()=>{
 const {ALLIES,allyForStage,collectAlly}=await import('../tanahoraflavio/runner-allies.mjs');
 const {bossProfileFor}=await import('../tanahoraflavio/runner-boss-profiles.mjs');
 const ally=ALLIES.find(a=>a.id==='santiago');assert.ok(ally);assert.deepEqual(ally.stages,[3]);
 assert.equal(bossProfileFor('santiago'),null);
 for(let i=0;i<24;i++)assert.notEqual(bosses.storyBossAt(i).type,'santiago');
 for(let stage=0;stage<6;stage++)for(const roll of [0,.5,.999]){
  const visits=Object.fromEntries(ALLIES.map(a=>[a.id,1]));visits.santiago=0;
  if(stage===3)assert.equal(allyForStage(stage,visits,()=>roll).id,'santiago');
  else assert.notEqual(allyForStage(stage,visits,()=>roll).id,'santiago');
 }
 const r=core.createRun();core.startRun(r);const hp=r.player.hp;
 assert.equal(collectAlly(r,'santiago'),true);assert.equal(r.ally.id,'santiago');
 assert.equal(r.aid.kind,'telegraph');assert.equal(r.player.hp,hp);assert.equal(r.obstacles.length,0);
});

test('Paraguai oferece Santiago no primeiro apoio local e seleção inimiga ignora seu nome',()=>{
 const r=core.createRun({mode:'story'});core.startRun(r);
 r.routeDistance=core.STORY_OPENING_DISTANCE+3*core.SCENE_DISTANCE+2000;
 for(const key of ['nextBossAt','nextRaid','nextObstacle','nextAllyAt','nextPower','nextPassport'])r[key]=Infinity;
 r.nextSupportAt=0;core.advanceRun(r,1/120,()=>0);
 assert.equal(r.pickups.find(p=>p.type==='ally')?.allyId,'santiago');
 const endless=core.createRun();core.startRun(endless);endless.nextBossAt=0;endless.nextRaid=Infinity;endless.bossBag=['santiago'];
 assert.doesNotThrow(()=>core.advanceRun(endless,1/120,()=>.5));assert.notEqual(endless.boss?.type,'santiago');
});
