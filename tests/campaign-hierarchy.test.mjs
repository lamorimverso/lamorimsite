import test from 'node:test';
import assert from 'node:assert/strict';
import * as bosses from '../tanahoraflavio/runner-bosses.mjs';
import * as route from '../tanahoraflavio/runner-route-data.mjs';
import * as core from '../tanahoraflavio/runner-core.mjs';

test('História tem oito mapas, cada um com um subchefe e um chefe diferentes',()=>{
 assert.deepEqual(route.STORY_STAGES?.map(s=>s.id),['brasilia','rio','sao-paulo','argentina','paraguai','florida','casa-branca','brasilia-final']);
 const cast=Array.from({length:bosses.STORY_ENCOUNTERS},(_,i)=>bosses.storyBossAt(i));
 const pairs=[['ana-elisa','xandao'],['rick','joice'],['guilherme','erika'],['soraya','dilma'],['fiscal','haddad'],['boulos','simone'],['dino','meme-army'],['janones','lula']];
 assert.equal(cast.length,17);
 for(let i=0;i<8;i++){
  const group=cast.filter(b=>b.stageIndex===i&&b.role!=='traversal');
  assert.deepEqual(group.map(b=>b.type),pairs[i]);
  assert.deepEqual(group.map(b=>b.role),['subboss',i===7?'final-boss':'map-boss']);
 }
 assert.equal(new Set(cast.map(b=>b.type)).size,cast.length);
 assert.deepEqual(cast.slice(-4).map(b=>b.type),['meme-army','povo','janones','lula']);
 assert.ok(cast.every((b,i)=>!i||bosses.nextStoryBossDistance(i)>bosses.nextStoryBossDistance(i-1)));
 assert.equal(route.STAGES.length,6,'Infinito mantém a rota original');
});

test('A travessia do Povo não permite disparo e não abre a urna',()=>{
 const index=14,r=core.createRun({mode:'story',seed:11});core.startRun(r);
 r.bossesDefeated=index;r.distance=r.routeDistance=bosses.nextStoryBossDistance(index);r.nextRaid=Infinity;
 r.nextBossAt=r.routeDistance;core.moveRun(r,1);core.advanceRun(r,.02,()=>.5);
 assert.equal(r.boss.type,'povo');
 assert.equal(r.player.moveHeld,1,'continua respeitando input mantido ao entrar');
 assert.equal(r.boss.traversal,true);
 assert.equal(core.setAttackRun(r,true),false);
 assert.equal(core.attackRun(r),false);
 assert.equal(r.shotsFired,0);
 r.reserveShields=1;r.ammo=0;
 assert.equal(core.activateReserveShield(r),false);
 for(let i=0;i<600;i++)core.advanceRun(r,.01,()=>.5);
 assert.equal(r.ammo,0,'travessia não recarrega como duelo');
 assert.equal(r.reserveShields,1);
 assert.equal(r.status,'running');
});

test('rota completa sem teleporte percorre todas as fases até a urna depois de Lula',async()=>{
 const {pilotCounter}=await import('../tools/story-pilot.mjs');
 for(const width of [480,900]){
  const run=core.createRun({mode:'story',seed:12,assisted:true});core.resizeRun(run,width);core.startRun(run);run.lives=20;
  const seen=[],visited=new Set();let last=null;
  for(let i=0;i<120*4200&&run.status==='running';i++){
   pilotCounter(run);core.advanceRun(run,1/120);
   visited.add(core.routeStageFor(run).id);
   if(run.boss&&run.boss!==last){last=run.boss;seen.push(run.boss.type);}
  }
  assert.equal(run.status,'ballot','campanha completa em '+width);
  assert.deepEqual(seen,Array.from({length:17},(_,i)=>bosses.storyBossAt(i).type));
  assert.deepEqual([...visited],route.STORY_STAGE_IDS);
  for(const digit of ['1','3'])assert.equal(core.ballotDigit(run,digit),true);
  assert.equal(core.ballotConfirm(run),'won');
 }
});
