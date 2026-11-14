import test from 'node:test';
import assert from 'node:assert/strict';
import {BOSS_PROFILES} from '../tanahoraflavio/runner-boss-profiles.mjs';
import {storyBossAt,arenaPatternFor,planArenaAttack,stepBossPhase,bossArenaPose} from '../tanahoraflavio/runner-bosses.mjs';

const actors=Object.keys(BOSS_PROFILES);
const actorBoss=(type,extra={})=>({...Array.from({length:24},(_,i)=>storyBossAt(i)).find(b=>b.type===type),maxHp:100,hp:100,fired:0,...extra});
const fingerprint=p=>JSON.stringify([p.type,p.action,p.approach,p.targetY,p.arcHeight,p.curve,p.waveAmplitude,p.burst,p.burstGap,p.projectileSpeedScale,p.widthScale]);
const sequence=b=>Array.from({length:12},(_,i)=>fingerprint(arenaPatternFor(b,i)));

test('every villain teaches an owned power, a concrete tactic and the coherent weakness chain',()=>{
 const weak=['pf','janones','haddad','xandao','army','joice','simone','lula','soraya','dino','dilma','bossonari','boulos','meme-army'];
 for(const type of actors){
  const b=actorBoss(type),profile=BOSS_PROFILES[type];
  assert.equal(b.reward?.id,type);assert.equal(profile.reward?.id,type);
  assert.ok(b.tactic?.length>30,type+' needs an actionable tactic');
  assert.equal(b.weakness,weak[(weak.indexOf(type)+weak.length-1)%weak.length]);
  assert.match(b.objective,new RegExp(b.tactic.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
 }
});

test('14 identities have distinct gameplay sequences and announced attacks never read player posture or randomness',()=>{
 const signatures=new Set();
 for(const type of actors){
  const b=actorBoss(type);signatures.add(JSON.stringify(sequence(b)));
  for(let fired=0;fired<18;fired++){
   const attack=arenaPatternFor(b,fired);
   assert.equal(typeof attack.signature,'string');assert.ok(attack.mechanic,type);
   assert.deepEqual(planArenaAttack({...b,fired},{x:30,y:0,crouching:true,stillFor:5},()=>0),attack);
   assert.deepEqual(planArenaAttack({...b,fired},{x:700,y:90},()=>.99),attack);
   assert.ok(b.attackTypes.includes(attack.type));
   assert.ok(attack.projectileSpeedScale>=.75&&attack.projectileSpeedScale<=1.15);
   assert.ok(attack.widthScale>=.8&&attack.widthScale<=1.25);
   assert.ok(attack.action==='move'||attack.action==='jump'&&attack.targetY>=20&&attack.targetY<=30||attack.action==='crouch'&&attack.targetY>=88&&attack.targetY<=96);
   assert.ok(attack.burstGap>=.7,'no overlapping opposing contact lanes');
  }
 }
 assert.equal(signatures.size,14);
});

test('rematches count prior appearances and change attacks beyond hp or speed; half health introduces an advanced sequence',()=>{
 const seen=new Map();
 for(let index=0;index<24;index++){
  const b=storyBossAt(index),prior=seen.get(b.type)||0;assert.equal(b.rematchIndex,prior);seen.set(b.type,prior+1);
  if(prior)assert.notDeepEqual(sequence({...b,maxHp:100,hp:100}),sequence(actorBoss(b.type)),b.type+' rematch');
 }
 for(const type of actors){
  const b=actorBoss(type);assert.notDeepEqual(sequence(b),sequence({...b,hp:50}),type+' second phase');
 }
 assert.notDeepEqual(sequence(actorBoss('pf',{rematchIndex:1})),sequence(actorBoss('pf',{rematchIndex:2})));
});

test('signature mechanics include Dilma sinusoidal wind, Boulos bounce and Lula returning L',()=>{
 const all=type=>Array.from({length:24},(_,i)=>arenaPatternFor(actorBoss(type,{hp:40,rematchIndex:1}),i));
 assert.ok(all('dilma').some(p=>p.curve==='sine'&&p.waveAmplitude>0&&p.gust?.strength>0));
 assert.ok(all('boulos').some(p=>p.curve==='bounce'&&p.waveAmplitude>0));
 assert.ok(all('lula').some(p=>p.curve==='boomerang'));
});

test('actor attack rhythm controls telegraph, volley and recovery while old boss objects remain usable',()=>{
 const b=actorBoss('janones',{phase:'recover',phaseFor:0,age:0,telegraph:.8,recover:1.1,burst:3});
 stepBossPhase(b,.01);assert.equal(b.phase,'charge');assert.equal(b.phaseFor,b.plannedAttack.telegraph);
 b.phaseFor=0;stepBossPhase(b,.01);assert.equal(b.volleyLeft,b.plannedAttack.burst);
 b.phaseFor=0;stepBossPhase(b,.01);assert.equal(b.phase,'recover');assert.equal(b.phaseFor,b.plannedAttack.recover);
 const plain={type:'pf',phase:'intro',phaseFor:0,telegraph:1,recover:1,burst:1};
 assert.doesNotThrow(()=>stepBossPhase(plain,.01));assert.ok(arenaPatternFor(plain).type);
 assert.equal(arenaPatternFor({type:'unknown'}).type,null);
});

test('each identity moves differently within safe boss bounds, with a stable reduced-motion pose',()=>{
 const motions=actors.map(type=>Array.from({length:20},(_,i)=>bossArenaPose(actorBoss(type,{age:i/3,phase:'attack',stageIndex:0}),480)));
 assert.equal(new Set(motions.map(p=>JSON.stringify(p))).size,14);
 for(const poses of motions)for(const pose of poses){assert.ok(pose.x>=300&&pose.x<=450);assert.ok(pose.platformY>=45&&pose.platformY<=115);}
 for(const type of actors)assert.deepEqual(bossArenaPose(actorBoss(type,{age:0,reducedMotion:true}),480),bossArenaPose(actorBoss(type,{age:90,reducedMotion:true}),480));
});

test('multi-shot volleys advance one authored pattern per windup instead of skipping by projectile count',()=>{
 const b=actorBoss('janones',{phase:'intro',phaseFor:0,telegraph:1,recover:1,age:0});
 const seen=[];
 for(let volley=0;volley<4;volley++){
  b.phaseFor=0;stepBossPhase(b,.01);seen.push(b.plannedAttack.signature);
  b.fired+=b.plannedAttack.burst;b.phase='recover';b.phaseFor=0;
 }
 assert.deepEqual(seen,['message-triple','message-header','message-lob','message-reply']);
});

test('returning bosses bring an attack absent from both phases of their first encounter',()=>{
 for(const type of actors){
  const initial=new Set([100,50].flatMap(hp=>sequence(actorBoss(type,{hp}))));
  const rematch=[100,50].flatMap(hp=>sequence(actorBoss(type,{hp,rematchIndex:1})));
  assert.ok(rematch.some(p=>!initial.has(p)),type+' needs a newly learned rematch attack');
 }
 for(const type of ['pf','army']){
  const previous=new Set([0,1].flatMap(rematchIndex=>[100,50].flatMap(hp=>sequence(actorBoss(type,{hp,rematchIndex})))));
  assert.ok([100,50].flatMap(hp=>sequence(actorBoss(type,{hp,rematchIndex:2}))).some(p=>!previous.has(p)),type+' third appearance needs a new attack');
 }
});
