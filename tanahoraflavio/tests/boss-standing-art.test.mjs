import test from 'node:test';
import assert from 'node:assert/strict';
import {standingEnemyPose,drawHoverEnemy,drawBossArena} from '../runner-boss-art.mjs';

function context(){const commands=[];return new Proxy({commands,globalAlpha:1,save(){commands.push(['save']);},restore(){commands.push(['restore']);}}, {get(o,key){if(key in o)return o[key];return (...args)=>commands.push([key,...args]);},set(o,key,value){o[key]=value;commands.push(['set',key,value]);return true;}});}

test('standing rig always plants both feet on the platform and keeps knees below hips',()=>{
 for(const flags of [{},{preparing:true},{attacking:true},{hurt:true}])for(const phase of [0,1,12,120]){
  const p=standingEnemyPose({phase,...flags});
  assert.equal(p.left.foot.y,0);assert.equal(p.right.foot.y,0);
  for(const leg of [p.left,p.right]){
   assert.ok(leg.knee.y>leg.hip.y&&leg.foot.y>leg.knee.y);
   assert.ok(Math.abs(leg.foot.x-leg.hip.x)<15,'no running stride');
  }
  assert.ok(p.neck.y<-60);assert.ok(p.shoulders.y<p.left.hip.y);
 }
});

test('charge, release, recoil and class stances articulate arms independently',()=>{
 const idle=standingEnemyPose({reducedMotion:true});
 const charge=standingEnemyPose({preparing:true,reducedMotion:true});
 const release=standingEnemyPose({attacking:true,reducedMotion:true});
 const recoil=standingEnemyPose({hurt:true,reducedMotion:true});
 assert.notDeepEqual(idle.arms,charge.arms);assert.notDeepEqual(charge.arms,release.arms);
 assert.notDeepEqual(release.arms,recoil.arms);
 assert.ok(release.arms.left.hand.x<release.arms.left.elbow.x,'release projects towards the hero on the left');
 assert.notEqual(charge.arms.left.hand.y,charge.arms.right.hand.y);
 assert.notDeepEqual(standingEnemyPose({classId:'sentinel'}).arms,standingEnemyPose({classId:'sovereign'}).arms);
});

test('reduced motion freezes bob, idle gestures and decorative motors but keeps combat pose changes',()=>{
 assert.deepEqual(standingEnemyPose({phase:0,reducedMotion:true}),standingEnemyPose({phase:99,reducedMotion:true}));
 for(const type of ['xandao','bossonari','meme-army']){
  const a=context(),b=context();drawHoverEnemy(a,{type,x:100,y:180,phase:0,reducedMotion:true});drawHoverEnemy(b,{type,x:100,y:180,phase:99,reducedMotion:true});
  assert.deepEqual(a.commands,b.commands);
  const charging=context();drawHoverEnemy(charging,{type,x:100,y:180,preparing:true,reducedMotion:true});assert.notDeepEqual(a.commands,charging.commands);
 }
});

test('hover art and arena balance canvas state, use a visible platform, and do not need a DOM',()=>{
 for(const type of ['haddad','lula','xandao','pf','janones','bossonari','meme-army','missing']){
  const c=context();drawHoverEnemy(c,{type,x:250,y:170,scale:.9,phase:4});
  assert.equal(c.commands.filter(x=>x[0]==='save').length,c.commands.filter(x=>x[0]==='restore').length);
  assert.ok(c.commands.some(x=>x[0]==='ellipse'&&x[3]>=45),'saucer is wider than the standing torso');
 }
 for(const state of ['intro','prepare','attack','recover','phase2','victory']){
  const c=context();drawBossArena(c,{width:900,ground:246,phase:4,state,stageIndex:2});
  assert.equal(c.commands.filter(x=>x[0]==='save').length,c.commands.filter(x=>x[0]==='restore').length);
  assert.ok(c.commands.some(x=>x[0]==='fillRect'));
 }
});

test('human Bossonari and final meme-army keep separate original identities',()=>{
 const human=context(),ghost=context();
 drawHoverEnemy(human,{type:'bossonari',x:150,y:180,reducedMotion:true});
 drawHoverEnemy(ghost,{type:'meme-army',x:150,y:180,reducedMotion:true});
 assert.ok(human.commands.some(x=>x[0]==='ellipse'&&x[3]===18&&x[4]===21),'original human vector face');
 assert.ok(ghost.commands.some(x=>x[0]==='set'&&x[1]==='fillStyle'&&x[2]==='#8c233b'),'original red three-point hat');
 assert.ok(!human.commands.some(x=>x[0]==='set'&&x[1]==='fillStyle'&&x[2]==='#8c233b'),'human encounter does not become the ghost');
});

test('phase two adds a persistent arena cue without replacing charge, release or recovery',()=>{
 function arena(state,phase=0){const c=context();drawBossArena(c,{state,phase,reducedMotion:true});return c.commands;}
 const idle=arena('idle'),phase2=arena('phase2');
 assert.notDeepEqual(phase2,idle,'phase two must remain visible with reduced motion');
 assert.deepEqual(phase2,arena({phase:'idle',enraged:true}));
 assert.deepEqual(phase2,arena('phase2',90),'the phase-two cue is static in reduced motion');
 for(const phase of ['charge','attack','recover']){
  const normal=arena(phase),enraged=arena({phase,enraged:true});
  assert.deepEqual(normal,arena({phase,enraged:false}));
  assert.deepEqual(enraged.slice(0,normal.length-1),normal.slice(0,-1),'existing phase cues are retained');
  assert.ok(enraged.length>normal.length,'rage adds a separate cue');
 }
});
