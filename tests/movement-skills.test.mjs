import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
import {nextStoryBossDistance} from '../tanahoraflavio/runner-bosses.mjs';
import {pilotCounter,pilotDodge} from '../tools/story-pilot.mjs';
const DT=1/120;
function isolated(width=900){const r=core.createRun({seed:11});core.startRun(r);core.resizeRun(r,width);for(const k of ['nextBossAt','nextRaid','nextObstacle','nextAllyAt','nextSupportAt','nextPower','nextPassport','nextPickup'])r[k]=Infinity;r.terrain.nextAt=Infinity;assert.deepEqual(r.movementSkills,{doubleJump:false});return r;}
function step(r,s,pilot,dt=DT){for(let t=0;t<s&&r.status==='running';t+=dt){pilot?.(r);core.advanceRun(r,dt);}}
function sorayaScene(){const r=isolated();r.mode='story';r.bossesDefeated=6;r.distance=r.routeDistance=nextStoryBossDistance(6);r.nextBossAt=0;core.advanceRun(r,DT);assert.equal(r.boss.type,'soraya');return r;}
function finishBoss(r){const count=r.bossesDefeated;for(let i=0;i<120*100&&r.status==='running'&&r.bossesDefeated===count;i++){pilotCounter(r);core.advanceRun(r,DT);}assert.equal(r.status,'running',JSON.stringify(r.lastHit));assert.equal(r.bossesDefeated,count+1);}
function skilled(width=900){const r=isolated(width);r.movementSkills.doubleJump=true;return r;}
function terrain(r){r.terrain.nextAt=0;r.terrain.nextKind='gap-platform';r.nextObstacle=0;core.advanceRun(r,DT);r.nextObstacle=Infinity;assert.ok(r.terrain.active);return r.terrain.active;}

test('locked runs reject air jumps; starting or losing Soraya grants no movement skill',()=>{
 const r=isolated();assert.equal(core.jumpRun(r),true);step(r,.2);assert.equal(core.jumpRun(r),false);assert.equal(r.player.airJumpsUsed,0);
 const boss=sorayaScene();assert.equal(boss.movementSkills.doubleJump,false);boss.player.hp=1;boss.obstacles=[{x:boss.player.x,width:30,height:50,type:'barrier',speed:0}];core.advanceRun(boss,DT);assert.equal(boss.status,'over');assert.equal(boss.movementSkills.doubleJump,false);
});
test('actual Soraya defeat unlocks once after the earned projectile and new runs reset the skill',()=>{
 const r=sorayaScene();finishBoss(r);assert.ok(r.ownedPowers.includes('soraya'));assert.equal(r.movementSkills.doubleJump,true);assert.equal(r.lastSkillReward.id,'double-jump');assert.equal(r.lastSkillReward.sourceBoss,'soraya');assert.equal(r.lastSkillReward.name,'Duplo pulo');assert.ok(r.lastSkillReward.remaining>0);
 const second=sorayaScene();second.movementSkills.doubleJump=true;finishBoss(second);assert.equal(second.lastSkillReward,null,'repeat victories cannot duplicate the skill reward');
 assert.deepEqual(core.createRun().movementSkills,{doubleJump:false});
});
test('endless unlocks only on its fifth actual boss victory and does not repeat the reward',()=>{
 const r=isolated();for(let i=0;i<6;i++){r.nextBossAt=0;r.bossCooldown=0;core.advanceRun(r,DT);finishBoss(r);assert.equal(r.movementSkills.doubleJump,i>=4);if(i===4){assert.equal(r.lastSkillReward.id,'double-jump');assert.equal(r.lastSkillReward.sourceBoss,r.lastBoss);}if(i===5)assert.equal(r.lastSkillReward,null);}
});
test('one ground jump plus one air jump, with third request buffered only until a real landing',()=>{
 const r=skilled();assert.equal(core.jumpRun(r),true);step(r,.25);const prior=r.player.y;assert.equal(core.jumpRun(r),true);assert.equal(r.player.airJumpsUsed,1);assert.ok(r.player.velocity>0);assert.equal(core.jumpRun(r),false);assert.equal(r.player.airJumpsUsed,1);step(r,.2);assert.ok(r.player.y>prior);assert.equal(r.player.airJumpsUsed,1);
 step(r,1);assert.equal(r.player.grounded,true);assert.equal(r.player.airJumpsUsed,0);assert.equal(r.player.velocity,0,'expired third-press buffer never creates repeat jumps');
 core.jumpRun(r);step(r,.05);core.jumpRun(r);while(!(r.player.velocity<0&&r.player.y<20))core.advanceRun(r,DT);assert.equal(core.jumpRun(r),false);for(let i=0;i<120&&r.player.velocity!==610;i++)core.advanceRun(r,DT);assert.equal(r.player.velocity,610,'landing buffer creates the next ground jump');assert.equal(r.player.airJumpsUsed,0);
});
test('platform support resets the air jump and Jacare ignores all jump requests',()=>{
 const r=skilled();terrain(r);let landed=false;step(r,6,run=>{pilotDodge(run);if(run.player.grounded&&run.player.supportY===40&&!landed){landed=true;assert.equal(run.player.airJumpsUsed,0);assert.equal(core.jumpRun(run),true);core.advanceRun(run,DT);assert.equal(core.jumpRun(run),true);assert.equal(core.jumpRun(run),false);}});assert.equal(r.status,'running');assert.ok(landed);
 const jacare=skilled();jacare.player.isJacare=true;assert.equal(core.jumpRun(jacare),false);assert.equal(jacare.player.velocity,0);assert.equal(jacare.player.airJumpsUsed,0);
});
test('terrain geometry and reservation adapt only after a movement skill is earned',()=>{
 const basic=isolated(),advanced=skilled();const before=terrain(basic),after=terrain(advanced);assert.equal(before.gaps[0].width,125);assert.equal(before.platforms[0].y,28);assert.equal(after.gaps[0].width,190);assert.equal(after.platforms[0].x-after.gaps[0].x,160);assert.equal(after.platforms[0].width,150);assert.equal(after.platforms[0].y,40);assert.equal(after.requiresDoubleJump,true);assert.ok(core.terrainProfileFor(advanced).requiresDoubleJump);assert.equal(core.movementProfileFor(basic).maxAirJumps,0);assert.equal(core.movementProfileFor(advanced).maxAirJumps,1);
});
test('advanced gap requires the second jump and a legal double jump clears it across resize and FPS',()=>{
 const fail=skilled();const gap=terrain(fail).gaps[0];let jumped=false;step(fail,6,r=>{if(!jumped&&(gap.x-r.player.x-17)/200<.13){core.jumpRun(r);jumped=true;}});assert.equal(fail.status,'over');assert.match(fail.lastHit.type,/terrain-(platform|gap)/);
 for(const width of [480,900])for(const dt of [1/60,1/120]){
  const r=skilled(width);terrain(r);let used=false,resized=false;step(r,7,run=>{if(!resized&&run.player.y>60){core.resizeRun(run,width===480?900:480);resized=true;}pilotDodge(run);used||=run.player.airJumpsUsed===1;},dt);assert.equal(r.status,'running',`${width}/${dt}: ${JSON.stringify(r.lastHit)}`);assert.ok(used);assert.equal(r.terrain.completed,1);assert.equal(r.player.y,0);assert.equal(r.player.airJumpsUsed,0);
 }
});
