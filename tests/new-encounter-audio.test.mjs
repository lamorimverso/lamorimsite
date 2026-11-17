import test from 'node:test';
import assert from 'node:assert/strict';
import {createGameAudio} from '../tanahoraflavio/runner-audio.mjs';
import {createShotSoundTracker} from '../tanahoraflavio/runner-shot-events.mjs';
import * as soundEvents from '../tanahoraflavio/runner-shot-events.mjs';
import {advanceRun,createRun,resizeRun,startRun,STORY_BOSS_COUNT} from '../tanahoraflavio/runner-core.mjs';
import {bossCounterWindow,nextStoryBossDistance,storyBossAt} from '../tanahoraflavio/runner-bosses.mjs';
import {pilotDodge} from '../tools/story-pilot.mjs';

const encounters=[['ana-elisa','network-panel'],['rick','signal-pulse'],['sofia','arrow-panel'],['guilherme','garden-box'],
 ['erika','stage-spotlight'],['renato-freitas','rotating-sign'],['jones','debate-card'],['maestro','baton-wave'],
 ['capita','wind-flag'],['fiscal','inspection-gate'],['povo','crowd-lane']];
const passages=new Set(['renato-freitas','fiscal','povo']);
const DT=1/120;
function audioFixture(fn){
 const previous=globalThis.window,notes=[],tracks=[];
 const param=()=>({values:[],setValueAtTime(value){this.values.push(value);},linearRampToValueAtTime(value){this.values.push(value);},
  exponentialRampToValueAtTime(value){this.values.push(value);},setTargetAtTime(){},cancelScheduledValues(){}});
 const context={currentTime:0,state:'running',destination:{},createGain(){return {gain:param(),connect(){},disconnect(){}};},
  createOscillator(){return {frequency:param(),connect(gain){this.gain=gain;},disconnect(){this.released=true;},
   start(time){this.at=time;notes.push(this);},stop(time){this.until=time;}};}};
 globalThis.window={AudioContext:class{constructor(){return context;}},Audio:class{constructor(src){tracks.push(src);}play(){return Promise.resolve();}pause(){}}};
 const audio=createGameAudio();
 function sample(play){
  const index=notes.length,t=context.currentTime;
  assert.equal(play(),true);
  const batch=notes.slice(index);
  assert.ok(batch.length>=1&&batch.length<=3,'efeito breve com até três canais');
  assert.ok(batch.every(n=>n.until<=t+.35&&n.gain.gain.values[1]>0&&n.gain.gain.values[1]<.15),'duração e nível dos novos sinais');
  const sound=batch.map(n=>[n.type,Math.round((n.at-t)*1000),n.frequency.values]);
  for(const n of batch)n.onended?.();context.currentTime+=1;
  return sound;
 }
 try{fn({audio,context,notes,tracks,sample});}finally{if(previous===undefined)delete globalThis.window;else globalThis.window=previous;}
}

test('os 11 encontros novos têm entrada, aviso e lançamentos próprios, sem reaproveitar voz',()=>audioFixture(({audio,sample,tracks})=>{
 audio.prime();
 const cues=[];
 for(const [actor,weapon] of encounters){
  const arrival=sample(()=>audio.enemyEntrance(actor));
  const windup=sample(()=>audio.enemyWindup?.(actor));
  const shots=Array.from({length:4},()=>sample(()=>audio.enemyShot(actor,weapon)));
  assert.deepEqual(shots[0],shots[3],`${actor}: volta ao primeiro lançamento só depois da variação`);
  cues.push(arrival,windup,...shots.slice(0,3));
 }
 assert.equal(new Set(cues.map(JSON.stringify)).size,55,'nenhuma entrada/aviso/variação é um fallback repetido');
 assert.deepEqual(tracks,[]);
}));

test('armas de duelo soam no dano e passagens só sinalizam o bloqueio',()=>audioFixture(({audio,sample})=>{
 audio.prime();
 const after=[];
 for(const [actor,weapon] of encounters){
  if(passages.has(actor)){
   after.push(sample(()=>audio.traversalBlock?.(actor,weapon)));
   assert.equal(audio.enemyImpact(actor,weapon),false,`${actor}: não simula perda de PV`);
  }else{
   after.push(sample(()=>audio.enemyImpact?.(actor,weapon)));
   assert.equal(audio.traversalBlock(actor,weapon),false,`${actor}: não é uma travessia`);
  }
 }
 assert.equal(new Set(after.map(JSON.stringify)).size,11);
}));

test('novos avisos não entram antes do gesto, com contexto suspenso, sem canais, ou após mute',()=>audioFixture(({audio,context,notes})=>{
 assert.equal(audio.enemyWindup?.('rick'),false);audio.prime();
 context.state='suspended';assert.equal(audio.enemyWindup('rick'),false);context.state='running';
 for(let i=0;i<12;i++)audio.effect('pickup');
 assert.equal(audio.enemyWindup('rick'),false);assert.equal(notes.length,12);
 for(const n of notes)n.onended?.();
 assert.equal(audio.enemyWindup('rick'),true);audio.toggle();
 assert.equal(audio.enemyWindup('rick'),false);assert.equal(audio.traversalBlock('fiscal','inspection-gate'),false);
 assert.ok(notes.slice(12).every(n=>n.until===undefined),'mute cancela inclusive as notas agendadas');
}));

function atEncounter(id){
 const index=Array.from({length:STORY_BOSS_COUNT},(_,i)=>storyBossAt(i)).findIndex(boss=>boss.type===id);
 const run=createRun({mode:'story',seed:12,practiceId:index<0?id:undefined});
 startRun(run);resizeRun(run,480);
 for(const key of ['nextRaid','nextObstacle','nextAllyAt','nextSupportAt','nextPower','nextPassport'])run[key]=Infinity;
 if(index>=0){run.bossesDefeated=index;run.distance=run.routeDistance=nextStoryBossDistance(index);run.nextBossAt=run.routeDistance;}
 return run;
}

test('painel comum de São Paulo não toca o impacto da Sofia sem origem correspondente',()=>audioFixture(({audio,sample})=>{
 audio.prime();
 assert.equal(audio.enemyImpact(undefined,'arrow-panel'),false);
 assert.equal(audio.enemyImpact('pf','arrow-panel'),false);
 assert.equal(audio.enemyImpact('sofia','garden-box'),false);
 sample(()=>audio.enemyImpact('sofia','arrow-panel'));
}));

test('impacto real registra somente o autor explícito da ameaça, não o chefe presente',()=>{
 const running=atEncounter('sofia');
 for(let i=0;i<120*10&&!running.lastHit;i++)advanceRun(running,DT);
 assert.equal(running.lastHit?.type,'arrow-panel');
 assert.equal(running.lastHit?.actor,'sofia','a arma do duelo preserva o dono real');
 for(const [origin,actor] of [[{},undefined],[{sourceActor:'route-scout'},'route-scout'],[{sourceActor:'sofia',owner:'pf'},'sofia']]){
  const run=atEncounter('sofia');advanceRun(run,DT);assert.equal(run.boss.type,'sofia');
  run.obstacles.push({type:'arrow-panel',x:run.player.x+8,width:25,height:42,speed:0,...origin});
  advanceRun(run,DT);
  assert.deepEqual(run.lastHit,{type:'arrow-panel',action:'jump',...(actor?{actor}:{})});
 }
});

test('Rick avisa uma vez no preparo, toca seis saídas físicas e deixa o sétimo tempo em silêncio',()=>{
 assert.equal(typeof soundEvents.createEncounterSoundTracker,'function');
 const run=atEncounter('rick'),cues=[],shots=[];
 const encounter=soundEvents.createEncounterSoundTracker((kind,actor)=>cues.push([kind,actor,run.elapsed]));
 const projectiles=createShotSoundTracker((actor,weapon,shot)=>shots.push([actor,weapon,shot.action,run.elapsed]));
 for(let i=0;i<120*14&&run.status==='running';i++){
  pilotDodge(run);advanceRun(run,DT);encounter.update(run);encounter.update(run);projectiles.update(run.obstacles);
  if(run.boss&&bossCounterWindow(run.boss).label)break;
 }
 assert.equal(cues.length,1);assert.deepEqual(cues[0].slice(0,2),['windup','rick']);
 assert.deepEqual(shots.map(s=>s.slice(0,3)),['jump','crouch','jump','crouch','jump','crouch'].map(action=>['rick','signal-pulse',action]));
 assert.ok(shots[0][3]-cues[0][2]>=.6,'preparo precede o primeiro lançamento');
 assert.match(bossCounterWindow(run.boss).label,/SÉTIMO/);
});

for(const id of passages)test(`${id} emite um sinal no contato de passagem sem emitir dano`,()=>{
 assert.equal(typeof soundEvents.createEncounterSoundTracker,'function');
 const run=atEncounter(id),blocked=[];
 const encounter=soundEvents.createEncounterSoundTracker((kind,actor,weapon)=>{if(kind==='blocked')blocked.push([actor,weapon]);});
 for(let i=0;i<120*20&&!blocked.length;i++){
  advanceRun(run,DT);encounter.update(run);encounter.update(run);
 }
 assert.deepEqual(blocked,[[id,encounters.find(([actor])=>actor===id)[1]]]);
 assert.equal(run.player.hp,2);assert.equal(run.lastHit,null);
});
