import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
import {nextStoryBossDistance} from '../tanahoraflavio/runner-bosses.mjs';
import {pilotCounter} from '../tools/story-pilot.mjs';

const DT=1/120;
const storyStages=[
 ['brasilia',['ana-elisa','xandao'],['renato-freitas','jones']],
 ['rio',['rick','joice'],['maestro']],
 ['sao-paulo',['guilherme','erika'],['sofia']],
 ['argentina',['soraya','dilma'],['capita']],
 ['paraguai',['fiscal','haddad'],[]],
 ['florida',['boulos','simone'],[]],
 ['casa-branca',['dino','meme-army'],[]],
 ['brasilia-final',['povo','janones','lula'],[]]
];
const crossings=['fiscal','povo','renato-freitas'];
const settings={mode:'story',seed:17};

function enterPractice(practiceId,width=900){
 const run=core.createRun({...settings,practiceId});
 core.resizeRun(run,width);
 core.startRun(run);
 core.advanceRun(run,DT);
 return run;
}

test('direct practice opens every Story encounter in its own stage with canonical and actor IDs',()=>{
 for(const [stage,mandatory,optional] of storyStages){
  for(const [prefix,ids] of [['campaign',mandatory],['optional',optional]]){
   for(const id of ids){
    for(const practiceId of [id,`${prefix}-${id}`]){
     const run=enterPractice(practiceId);
     const traversal=crossings.includes(id);
     assert.equal(run.boss?.type,id,practiceId);
     assert.equal(run.boss.id,`${prefix}-${id}`,practiceId);
     assert.equal(run.boss.stageId,stage,practiceId);
     assert.equal(core.routeStageFor(run).id,stage,practiceId);
     assert.equal(run.boss.traversal,traversal,practiceId);
     assert.equal(run.boss.platformer,!traversal,practiceId);
     assert.equal(run.ammo,6,practiceId);
     assert.equal(run.bossesDefeated,0,practiceId);
     if(!traversal)assert.equal(core.scoreFor(run),0,practiceId);
    }
   }
  }
 }
});

test('practice preserves the challenge of the final duel on both difficulty settings',()=>{
 for(const assisted of [false,true]){
  const run=core.createRun({...settings,practiceId:'lula',assisted});
  core.startRun(run);
  core.advanceRun(run,DT);
  assert.equal(run.boss?.hp,assisted?104:130);
  assert.equal(run.boss?.maxHp,run.boss.hp);
  assert.ok(Math.abs(run.boss.challengePressure-(assisted?0:.169))<1e-10);
 }
});

test('a practice crossing preserves its arena pace and opening attack with a fresh score',()=>{
 const practice=core.createRun({...settings,practiceId:'fiscal'});
 const campaign=core.createRun(settings),index=8;
 const distance=nextStoryBossDistance(index);
 campaign.bossesDefeated=index;
 campaign.distance=campaign.routeDistance=campaign.nextBossAt=distance;
 campaign.terrain.nextAt=Infinity;
 assert.equal(core.scoreFor(practice),0);
 const practiceStart=practice.distance;
 core.startRun(campaign);
 core.startRun(practice);
 for(let frame=0;frame<480&&!campaign.obstacles.some(o=>o.bossAttack);frame++){
  core.advanceRun(campaign,DT);
  core.advanceRun(practice,DT);
 }
 assert.equal(campaign.boss?.type,'fiscal');
 const attack=campaign.obstacles.find(o=>o.bossAttack);
 assert.equal(attack?.type,'inspection-gate');
 assert.equal(practice.distance-practiceStart,campaign.distance-distance);
 assert.deepEqual(practice.obstacles.find(o=>o.bossAttack),attack);
 assert.equal(core.scoreFor(practice),Math.floor(campaign.distance-distance));
 assert.equal(core.scoreFor(campaign),Math.floor(campaign.distance));
});

test('mandatory practice equips preceding Story rewards without awarding campaign progress',()=>{
 const first=enterPractice('ana-elisa');
 assert.deepEqual(first.ownedPowers,['ivermectina']);
 assert.equal(first.movementSkills.doubleJump,false);
 const soraya=enterPractice('soraya');
 assert.deepEqual(soraya.ownedPowers,['ivermectina','ana-elisa','xandao','rick','joice','guilherme','erika']);
 assert.equal(soraya.activePower,'erika');
 assert.equal(soraya.movementSkills.doubleJump,false);
 const haddad=enterPractice('haddad');
 assert.equal(haddad.activePower,'dilma','a traversal does not grant a weapon');
 assert.equal(haddad.movementSkills.doubleJump,true);
 assert.equal(haddad.lastPowerReward,null);
 assert.equal(haddad.lastSkillReward,null);
 assert.equal(haddad.storyLeg,null);
 assert.equal(haddad.bossesDefeated,0);
 assert.equal(haddad.passports,0);
 assert.deepEqual(haddad.ballot,{digits:'',message:''});
 const optional=enterPractice('maestro');
 assert.deepEqual(optional.ownedPowers,['ivermectina']);
 assert.equal(optional.movementSkills.doubleJump,false);
});

test('invalid, mismatched and non-Story practice IDs keep the ordinary run factory',()=>{
 const campaign=core.createRun(settings);
 for(const practiceId of ['',null,0,{},'not-a-boss','pf','constructor','optional-lula','campaign-jones']){
  assert.deepEqual(core.createRun({...settings,practiceId}),campaign);
 }
 const endless={...settings,mode:'endless'};
 assert.deepEqual(core.createRun({...endless,practiceId:'lula'}),core.createRun(endless));
});

test('all 22 encounters can be won in practice without continuing the campaign',()=>{
 const ids=storyStages.flatMap(([,mandatory,optional])=>[...mandatory,...optional]);
 for(const id of ids)for(const width of [480,900]){
  const run=enterPractice(id,width);
  const traversal=crossings.includes(id);
  if(traversal)assert.equal(core.attackRun(run),false,id);
  for(let frame=0;frame<120*100&&run.status==='running';frame++){
   pilotCounter(run);
   core.advanceRun(run,DT);
  }
  assert.equal(run.lastBoss,id,`${id}/${width}: ${JSON.stringify(run.lastHit)}`);
  assert.equal(run.status,'won',id);
  assert.equal(run.boss,null,id);
  assert.equal(run.storyLeg,null,id);
  assert.equal(run.nextBossAt,Infinity,id);
  assert.equal(core.ballotDigit(run,1),false,id);
  assert.equal(core.ballotConfirm(run),false,id);
  assert.deepEqual(run.ballot,{digits:'',message:''},id);
  if(traversal)assert.equal(run.shotsFired,0,id);
 }
});

test('a repeated practice and a new campaign each start with fresh run state',()=>{
 const first=enterPractice('soraya');
 assert.equal(first.boss?.type,'soraya');
 const expected=structuredClone(first);
 first.boss.hp=0;
 core.advanceRun(first,DT);
 assert.equal(first.status,'won');
 assert.equal(first.movementSkills.doubleJump,true);
 assert.deepEqual(enterPractice('soraya'),expected);
 const campaign=core.createRun(settings);
 assert.equal(campaign.practice,null);
 assert.equal(campaign.routeDistance,0);
 assert.equal(core.scoreFor(campaign),0);
 assert.equal(campaign.bossesDefeated,0);
 assert.deepEqual(campaign.ownedPowers,['ivermectina']);
 assert.equal(campaign.movementSkills.doubleJump,false);
 assert.deepEqual(campaign.ballot,{digits:'',message:''});
});
