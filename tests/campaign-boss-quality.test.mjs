import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
import {bossCounterWindow,nextStoryBossDistance,storyBossAt} from '../tanahoraflavio/runner-bosses.mjs';
import {pilotCounter,pilotDodge} from '../tools/story-pilot.mjs';

const dt=1/120;
const roster=Array.from({length:core.STORY_BOSS_COUNT},(_,i)=>storyBossAt(i));

function startDuel(type,width,seed=17){
 const run=core.createRun({mode:'story',seed});
 core.startRun(run);core.resizeRun(run,width);
 const {index}=roster.find(b=>b.type===type);
 run.distance=run.routeDistance=run.nextBossAt=nextStoryBossDistance(index);
 run.bossesDefeated=index;
 // Isolate the encounter without editing its HP, committed projectiles, or player protection.
 for(const key of ['nextRaid','nextObstacle','nextAllyAt','nextSupportAt','nextPower','nextPassport'])run[key]=Infinity;
 run.terrain.nextAt=Infinity;
 core.advanceRun(run,dt);
 assert.equal(run.boss.type,type);
 return run;
}

for(const [id,latest,opening,ownBeat] of [
 ['ana-elisa',7.8,'REDE APAGADA',o=>o.falling],
 ['erika',7.8,'PALCO ESCURO',o=>o.falling],
 ['dilma',7.8,'CALMARIA',o=>!!o.gust],
 ['haddad',8.6,'CARIMBO BAIXOU',o=>o.type==='stamp'&&o.falling],
 ['simone',8.6,'COLUNA LIVRE',o=>o.falling]
])test(`${id} ensina a assinatura cedo e recompensa a devolução seguinte`,()=>{
 for(const width of [480,900]){
  const run=startDuel(id,width),boss=run.boss,start=run.elapsed,originalHP=boss.hp;
  const attacks=new Set();
  while(run.status==='running'&&run.elapsed-start<latest&&!bossCounterWindow(boss).label){
   pilotDodge(run);core.advanceRun(run,dt);
   for(const o of run.obstacles)if(o.bossAttack)attacks.add(o);
  }
  assert.equal(bossCounterWindow(boss).label,opening,`${width}px: primeira abertura assinada em até ${latest}s`);
  assert.ok([...attacks].some(ownBeat),`${width}px: o próprio gesto veio antes da abertura`);
  assert.ok([...attacks].some(o=>o.launched&&o.projectile),`${width}px: já há uma ameaça rebatível`);
  if(id==='erika')assert.deepEqual([...attacks].map(o=>o.action),['move','crouch','move'],`${width}px: os dois refletores enquadram a troca de postura`);
  assert.equal(run.player.hp,run.player.maxHp,`${width}px: a abertura pode ser limpa sem escudo`);
  assert.equal(run.shotsFired,0);
  assert.equal(boss.hp,originalHP,'a esquiva abre a guarda mas não dá dano direto');
  const earliest=run.elapsed;
  while(run.status==='running'&&run.elapsed-earliest<7&&boss.hp===originalHP){
   pilotCounter(run);core.advanceRun(run,dt);
  }
  assert.ok(originalHP-boss.hp>originalHP*.145*1.45,`${width}px: a próxima devolução física recebe o bônus`);
 }
});

test('Rick termina os seis pulsos comprometidos mesmo com uma devolução letal antecipada',()=>{
 for(const width of [480,900]){
  const run=startDuel('rick',width),boss=run.boss,start=run.elapsed;
  core.grantBossPower(run,'xandao'); // Recompensa do duelo imediatamente anterior na rota.
  let lethalAt,visibleOpening=false;
  while(run.status==='running'&&run.boss===boss&&run.elapsed-start<16){
   pilotCounter(run);core.advanceRun(run,dt);
   if(boss.hp===0&&!lethalAt)lethalAt=boss.fired;
   visibleOpening ||= bossCounterWindow(boss).label==='SÉTIMO TEMPO';
  }
  assert.ok(lethalAt>0&&lethalAt<6,`${width}px: o martelo mantém dano letal antes do sexto pulso`);
  assert.equal(boss.fired,6,`${width}px: o golpe letal não cancela pulsos já anunciados`);
  assert.deepEqual(boss.volleyShots.map(o=>o.action),['jump','crouch','jump','crouch','jump','crouch']);
  assert.ok(boss.volleyShots.every(o=>o.launched&&o.resolved&&!o.contactHit),`${width}px: os seis pulsos são reais e evitáveis`);
  assert.ok(visibleOpening,`${width}px: o sétimo tempo é legível mesmo sobre o fim do duelo`);
  assert.equal(run.lastBoss,'rick');
  assert.equal(run.lastPowerReward.id,'rick');
  assert.equal(run.player.hp,run.player.maxHp);
 }
});

test('continuar depois de sofrer um pulso tardio não deixa Rick preso com zero PV',()=>{
 const run=startDuel('rick',480),boss=run.boss;
 core.grantBossPower(run,'xandao');
 run.player.hp=1;run.lives=2;
 for(let i=0;i<12/dt&&run.status==='running'&&boss.hp>0;i++){
  pilotCounter(run);core.advanceRun(run,dt);
 }
 assert.equal(boss.hp,0);
 assert.ok(boss.fired>0&&boss.fired<6,'o golpe letal chega antes dos últimos pulsos');
 // Continue esquivando até a quarta batida: dano direto pode antecipar o golpe letal.
 for(let i=0;i<6/dt&&boss.fired<4&&run.status==='running';i++){pilotDodge(run);core.advanceRun(run,dt);}
 core.clearRunInput(run);
 for(let i=0;i<6/dt&&run.status==='running';i++)core.advanceRun(run,dt);
 assert.equal(run.status,'over');
 assert.deepEqual(run.lastHit,{type:'signal-pulse',action:'jump',actor:'rick'});
 assert.equal(boss.fired,6);
 assert.equal(boss.phase,'attack');
 assert.ok(boss.volleyShots.some(o=>!o.resolved));
 assert.equal(core.continueRun(run),true);
 assert.equal(run.lives,1);
 let opening=false;
 for(let i=0;i<4/dt&&run.boss===boss;i++){
  core.advanceRun(run,dt);
  opening ||= !!bossCounterWindow(boss).label;
 }
 assert.equal(run.lastBoss,'rick','a continuação conclui a sequência já emitida');
 assert.equal(boss.fired,6,'não nasce outra batida depois do golpe letal');
 assert.equal(opening,false,'o pulso que acertou o jogador não conta como esquiva');
 assert.equal(run.lastPowerReward.id,'rick');
});

test('continuar em outra arena não trava a rajada descartada nem dá abertura gratuita',()=>{
 const run=startDuel('ana-elisa',480),boss=run.boss;
 run.player.hp=1;run.lives=2;
 for(let i=0;i<8/dt&&run.status==='running';i++)core.advanceRun(run,dt);
 assert.equal(run.status,'over');
 assert.deepEqual(run.lastHit,{type:'network-panel',action:'move',actor:'ana-elisa'});
 assert.equal(boss.phase,'attack');
 assert.ok(boss.volleyShots.some(o=>!o.resolved));
 assert.equal(core.continueRun(run),true);
 for(let i=0;i<4/dt&&boss.phase==='attack';i++){
  pilotDodge(run);core.advanceRun(run,dt);
 }
 assert.equal(boss.phase,'recover','a rajada descartada não bloqueia o relógio do duelo');
 assert.equal(boss.counterReady,undefined);
 assert.equal(boss.hp,boss.maxHp);
 for(let i=0;i<35/dt&&run.boss===boss&&run.status==='running';i++){
  pilotCounter(run);core.advanceRun(run,dt);
 }
 assert.equal(run.lastBoss,'ana-elisa','é possível vencer com os comandos normais depois de continuar');
});
