import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';

const dt=1/120;
function isolated(mode,manualStory=false){
 const run=core.createRun({mode,manualStory,seed:17});
 core.startRun(run);
 for(const key of ['nextObstacle','nextPickup','nextPassport','nextPower','nextRaid','nextAllyAt','nextSupportAt','nextBossAt'])run[key]=Infinity;
 run.terrain.nextAt=Infinity;
 return run;
}
function step(run,count){
 for(let i=0;i<count&&run.status==='running';i++)core.advanceRun(run,dt);
}

test('History manual movement keeps the route still until the player walks right',()=>{
 const run=isolated('story',true);
 const startX=run.player.x;
 step(run,90);
 assert.equal(run.distance,0);
 assert.equal(run.routeDistance,0);
 assert.equal(run.player.x,startX);
 assert.equal(run.player.manualTravel,0);
 core.moveRun(run,1);
 step(run,260);
 assert.ok(run.player.x>startX,'walking must move the player within the screen');
 assert.ok(run.player.manualTravel>0,'manual walking drives the stride');
 assert.ok(run.distance>0,'following the camera anchor must scroll the route');
 assert.ok(run.routeDistance>0,'manual progression must advance the map');
 const travel=run.distance,route=run.routeDistance;
 core.moveRun(run,0);
 step(run,30);
 assert.equal(run.distance,travel,'releasing right stops the scenery');
 assert.equal(run.routeDistance,route,'releasing right stops route progression');
});

test('manual retreat changes player position without going backwards across completed stages',()=>{
 const run=isolated('story',true);
 core.moveRun(run,1);step(run,180);
 const distance=run.distance,route=run.routeDistance,x=run.player.x;
 core.moveRun(run,-1);step(run,30);
 assert.ok(run.player.x<x,'left key must retreat');
 assert.equal(run.distance,distance);
 assert.equal(run.routeDistance,route);
});

test('endless and legacy simulation remain automatic; Story practice does not inherit the manual flag',()=>{
 const endless=isolated('endless');
 step(endless,30);
 assert.ok(endless.distance>0);
 const legacy=isolated('story');
 step(legacy,30);
 assert.ok(legacy.distance>0);
 assert.equal(legacy.manualStory,false);
 const practice=core.createRun({mode:'story',practiceId:'haddad',manualStory:false});
 assert.equal(practice.manualStory,false);
});


test('manual Story passes the old camera anchor and progresses the world',()=>{
 const run=isolated('story',true);
 core.moveRun(run,1);step(run,320);
 assert.ok(run.player.x>core.WORLD.width*.5,'Flávio can move beyond the previous 38% screen anchor');
 assert.ok(run.distance>0&&run.routeDistance>0,'the stage keeps scrolling while walking');
});

test('manual Story remembers direction and shoots to the left after movement is released',()=>{
 const run=isolated('story',true);
 core.moveRun(run,-1);core.moveRun(run,0);
 assert.equal(run.player.shotFacing,-1);
 assert.equal(core.attackRun(run),true);
 assert.ok(run.heroShots[0].vx<0);
});

test('shots remove hostile ground enemies in manual Story and Endless but not barriers',()=>{
 const story=isolated('story',true),enemy={type:'pf',x:story.player.x+180,width:34,height:44,speed:0,action:'jump'};
 story.obstacles.push(enemy);
 assert.equal(core.attackRun(story),true);step(story,75);
 assert.equal(enemy.destroyed,true);
 assert.equal(story.defeatedEnemies,1);
 assert.equal(story.obstacles.includes(enemy),false);
 const blocked=isolated('story',true),barrier={type:'barrier',x:blocked.player.x+180,width:44,height:80,speed:0,action:'jump'};
 blocked.obstacles.push(barrier);core.attackRun(blocked);step(blocked,75);
 assert.notEqual(barrier.destroyed,true);
 const endless=isolated('endless',false),endlessEnemy={type:'pf',x:endless.player.x+180,width:34,height:80,speed:0,action:'jump'};
 endless.obstacles.push(endlessEnemy);core.attackRun(endless);step(endless,45);
 assert.equal(endlessEnemy.destroyed,true);
 assert.equal(endless.defeatedEnemies,1);
});


test('Story impact sparkle ends after its short lifetime',()=>{
 const run=isolated('story',true);
 run.clearedAt={x:120,remaining:.25};
 step(run,40);
 assert.equal(run.clearedAt,null,'impact feedback must not leave permanent marks on the track');
});

test('earned heavy weapons trade cadence for power against tough enemies during continuous travel',()=>{
 for(const mode of ['story','endless']){
  const light=isolated(mode),heavy=isolated(mode);
  const target=r=>({type:'army',x:core.heroMuzzleFor(r).x+120,width:40,height:88,speed:0,action:'jump'});
  const a=target(light),b=target(heavy);
  light.obstacles.push(a);heavy.obstacles.push(b);
  assert.ok(core.grantBossPower(heavy,'dino'));
  assert.equal(core.attackRun(light),true);assert.equal(core.attackRun(heavy),true);
  assert.ok(heavy.player.attackCooldown>light.player.attackCooldown);
  assert.ok(heavy.heroShots[0].damage>light.heroShots[0].damage);
  assert.ok(heavy.heroShots[0].vx<light.heroShots[0].vx);
  step(light,95);step(heavy,95);
  assert.ok(a.hitPoints>0&&a.hitPoints<2.4);
  assert.notEqual(a.destroyed,true);
  assert.equal(b.destroyed,true);
  assert.equal(heavy.defeatedEnemies,1);
  assert.ok(heavy.routeDistance>0);
 }
});

test('the homing power tracks the selected ground enemy in both directions in manual Story',()=>{
 for(const facing of [-1,1]){
  const run=isolated('story',true);
  run.player.x=450;
  core.moveRun(run,facing);core.moveRun(run,0);
  const muzzle=core.heroMuzzleFor(run,facing),projectileX=muzzle.x+facing*102;
  const enemy={type:'pf',x:muzzle.x+facing*185-15,width:30,height:44,speed:facing*20,action:'jump'};
  const projectile={type:'message',x:projectileX-12,width:24,height:20,y:160,speed:0,
   projectile:true,launched:true,launchX:projectileX,targetX:muzzle.x-10,launchY:160,targetY:160};
  run.obstacles=[enemy,projectile];
  assert.ok(core.grantBossPower(run,'lula'));
  assert.equal(core.attackRun(run),true);
  step(run,72);
  assert.equal(enemy.destroyed,true,`ground enemy in direction ${facing}`);
  assert.equal(run.defeatedEnemies,1);
  assert.ok(run.obstacles.includes(projectile),'the unrelated aerial attack must remain in play');
 }
});

test('the homing power can intercept an aerial shot when its ground target leaves play',()=>{
 const run=isolated('story',true),muzzle=core.heroMuzzleFor(run);
 const enemy={type:'pf',x:muzzle.x+170,width:30,height:44,speed:20,action:'jump'};
 const projectileX=muzzle.x+150,y=muzzle.y+40;
 const projectile={type:'message',x:projectileX-12,width:24,height:36,y,speed:0,
  projectile:true,launched:true,launchX:projectileX,targetX:muzzle.x-10,launchY:y,targetY:y};
 run.obstacles=[enemy,projectile];
 assert.ok(core.grantBossPower(run,'lula'));
 assert.equal(core.attackRun(run),true);
 run.obstacles=[projectile];
 step(run,90);
 assert.equal(projectile.destroyed,true);
 assert.equal(run.defeatedEnemies,0);
});
