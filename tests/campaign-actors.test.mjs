import test from 'node:test';
import assert from 'node:assert/strict';
import {bossProfileFor} from '../tanahoraflavio/runner-boss-profiles.mjs';
import {bossMechanicFor} from '../tanahoraflavio/runner-boss-mechanics.mjs';
import * as core from '../tanahoraflavio/runner-core.mjs';
import {bossCounterWindow,storyBossAt,nextStoryBossDistance,STORY_OPTIONAL_IDS} from '../tanahoraflavio/runner-bosses.mjs';
import {pilotCounter,pilotDodge} from '../tools/story-pilot.mjs';

const types={
 'ana-elisa':'network-panel',rick:'signal-pulse',sofia:'arrow-panel',guilherme:'garden-box',erika:'stage-spotlight',
 'renato-freitas':'rotating-sign',jones:'debate-card',maestro:'baton-wave',capita:'wind-flag',fiscal:'inspection-gate',povo:'crowd-lane'
};
const tactic=(type,{hp=100,rematchIndex=0,stageIndex=0}={})=>(fired=0)=>bossMechanicFor({type,hp,maxHp:100,rematchIndex,stageIndex,rank:bossProfileFor(type)?.rank},fired);
const authored=(type,options)=>(Array.from({length:12},(_,i)=>tactic(type,options)(i)));
const actions=move=>move.sequence.map(step=>step.action);

test('every new identity teaches its own attack type and has different patterns in phase two',()=>{
 const motions=[],tactics=[],counters=[];
 for(const [type,attackType] of Object.entries(types)){
  const actor=bossProfileFor(type);
  assert.ok(actor,type);
  assert.ok(actor.tactic.length>30,type);
  assert.ok(actor.attackTypes.includes(attackType),type);
  const opening=authored(type),advanced=authored(type,{hp:48});
  for(const stage of [opening,advanced]){
   assert.ok(stage.every(attack=>attack.type===attackType&&attack.contactFor>=.82&&attack.burstGap>=.78),type);
   assert.ok(stage.some(attack=>attack.counter&&attack.counterHint),type);
  }
  assert.ok(advanced.some(attack=>!opening.some(first=>attack.signature===first.signature)),type);
  motions.push(JSON.stringify(actor.motion));tactics.push(actor.tactic);counters.push(opening.find(p=>p.counter).counter.label);
 }
 for(const catalog of [motions,tactics,counters])assert.equal(new Set(catalog).size,Object.keys(types).length);
});

test('Rick uses six alternating pulses before the delayed seventh beat opening',()=>{
 for(const options of [{},{hp:48},{hp:48,rematchIndex:1}]){
  const attack=authored('rick',options).find(p=>p?.counter);
  assert.ok(attack,'Rick needs an authored counter');
  assert.equal(attack.burst,6,'the seventh beat must not spawn a hazard');
  assert.equal(attack.burstMode,'sequence');
  const beats=actions(attack);
  assert.equal(beats.length,6);
  assert.ok(beats.every((beat,i)=>i===0||beat!==beats[i-1]));
  assert.ok(attack.counter.delay>=.3,'a readable seventh beat holds before firing');
  assert.match(attack.counter.label,/SÉTIMO/);
 }
});

test('Ana Elisa commits staggered marked zones, Érika crosses two sides of the stage',()=>{
 const ana=authored('ana-elisa').find(p=>p?.counter),erika=authored('erika').find(p=>p?.counter);
 assert.ok(ana&&erika);
 assert.deepEqual(actions(ana),['move','move','move']);
 assert.equal(new Set(ana.sequence.map(s=>s.laneOffset)).size,3);
 const offsets=erika.sequence.filter(s=>s.action==='move').map(s=>s.laneOffset);
 assert.ok(offsets.some(x=>x<0)&&offsets.some(x=>x>0),'the spotlights must take opposite sides');
});

test('Sofia telegraphs arrows and Guilherme alternates low/high planters',()=>{
 const sofia=authored('sofia').find(p=>p?.counter),guilherme=authored('guilherme').find(p=>p?.counter);
 assert.ok(sofia&&guilherme);
 assert.deepEqual(actions(sofia),['jump','crouch','move']);
 assert.deepEqual(actions(guilherme),['jump','crouch','jump']);
 assert.ok(guilherme.sequence.filter(s=>s.action==='jump').every(s=>s.curve==='bounce'));
});

test('clear-only traversal doesn’t turn crowds into targets or unlock before the marked sequence',()=>{
 for(const type of ['renato-freitas','fiscal','povo'])for(const hp of [100,48]){
  const clear=authored(type,{hp}).find(p=>p?.counter?.trigger==='clear-only');
  assert.ok(clear,type);
  assert.ok(clear.burst>1&&clear.burstMode==='sequence',type);
  if(type==='povo'){
   assert.equal(bossProfileFor(type).reward,null);
   assert.ok(clear.sequence.every(s=>s.action==='move'&&s.approach==='vertical'));
  }
 }
});

test('Jones changes momentum, Maestro breaks the rhythm and Capitã reverses the wind',()=>{
 const jones=authored('jones').find(p=>p?.counter),maestro=authored('maestro').find(p=>p?.counter),capita=authored('capita').find(p=>p?.counter);
 assert.ok(jones&&maestro&&capita);
 assert.deepEqual(jones.sequence.map(p=>p.gust?.direction),[-1,1]);
 assert.ok(maestro.sequence.some(p=>p.curve==='sine'&&p.waveAmplitude>20&&p.gap>.95));
 assert.deepEqual(capita.sequence.map(p=>p.gust?.direction),[1,-1,1]);
});


const campaign=Array.from({length:core.STORY_BOSS_COUNT},(_,i)=>storyBossAt(i));
function atEncounter(id,width,seed){
 const index=campaign.findIndex(b=>b.type===id);
 const run=core.createRun({mode:'story',seed,practiceId:index<0?id:undefined});
 core.startRun(run);core.resizeRun(run,width);
 for(const k of ['nextRaid','nextObstacle','nextAllyAt','nextSupportAt','nextPower','nextPassport'])run[k]=Infinity;
 if(index>=0){
  run.bossesDefeated=index;run.distance=run.routeDistance=nextStoryBossDistance(index);run.nextBossAt=run.routeDistance;
 }
 return run;
}

test('Rick realmente lança seis pulsos com esquivas alternadas e não lança no sétimo tempo',()=>{
 const r=atEncounter('rick',480,12),beats=[];let lastFired=0,opening;
 for(let i=0;i<120*14&&r.status==='running';i++){
  pilotDodge(r);core.advanceRun(r,1/120);
  if(r.boss?.fired>lastFired){lastFired=r.boss.fired;beats.push(r.boss.volleyShots.at(-1).action);}
  if(r.boss&&bossCounterWindow(r.boss).label){opening=bossCounterWindow(r.boss).label;break;}
 }
 assert.match(opening,/SÉTIMO/);
 assert.deepEqual(beats,['jump','crouch','jump','crouch','jump','crouch']);
 assert.equal(r.boss.volleyShots.length,6);
 assert.equal(r.boss.volleyShots.filter(shot=>shot.resolved&&!shot.contactHit).length,6);
});

test('os 22 encontros obrigatórios e opcionais são vencíveis em celular e desktop com comandos reais',()=>{
 for(const id of [...campaign.map(b=>b.type),...STORY_OPTIONAL_IDS])for(const width of [480,900])for(const seed of [1,12,33]){
  const r=atEncounter(id,width,seed),before=r.bossesDefeated,travel=['renato-freitas','fiscal','povo'].includes(id);
  for(let i=0;i<120*90&&r.status==='running'&&r.bossesDefeated===before;i++){
   pilotCounter(r);core.advanceRun(r,1/120);
  }
  const context=`${id}, ${width}px, semente ${seed}, ${r.status}, PV ${r.boss?.hp??'-'}`;
  assert.equal(r.bossesDefeated,before+1,context);assert.equal(r.lastBoss,id,context);
  if(travel){assert.equal(r.shotsFired,0,context);assert.equal(r.lastPowerReward,null,context);}
 }
});
