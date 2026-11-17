import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
import {aircraftPoseFor,terrainSupportAt} from '../tanahoraflavio/runner-terrain.mjs';
import {pilotDodge} from '../tools/story-pilot.mjs';
const crossAt=core.STORY_OPENING_DISTANCE+3*core.SCENE_DISTANCE;
function flightReady({width=900,assisted=false}={}){
 const r=core.createRun({mode:'story',seed:87,assisted});core.startRun(r);core.resizeRun(r,width);
 r.distance=r.routeDistance=crossAt-1401;r.elapsed=150;r.bossesDefeated=6;
 for(const k of ['nextRaid','nextBossAt','nextAllyAt','nextSupportAt','nextPassport','nextPower','nextPickup'])r[k]=Infinity;
 r.terrain.nextAt=900;r.nextObstacle=2;return r;
}
function enter(r,dt=1/120){for(let i=0;i<Math.round(2/dt)&&!r.terrain.active;i++)core.advanceRun(r,dt);return r.terrain.active;}
test('São Paulo boards to Argentina, with movement and no ground encounters during the crossing',()=>{
 const r=flightReady(),a=enter(r);assert.equal(a?.kind,'air-transfer');assert.equal(a.flight.phase,'boarding');
 let route=r.routeDistance,x=r.player.x;
 assert.deepEqual([a.flight.from,a.flight.to],['sao-paulo','argentina']);
 core.moveRun(r,1);r.nextBossAt=0;r.nextRaid=0;r.nextObstacle=0;
 for(let i=0;i<36;i++)core.advanceRun(r,1/120);
 assert.ok(r.player.x>x);assert.ok(r.routeDistance>route);assert.equal(r.boss,null);assert.equal(r.raid,null);assert.equal(r.obstacles.length,0);
 assert.ok(!a.requiresDoubleJump);assert.equal(core.routeTransitionFor(r).to.id,'argentina');
 assert.equal(terrainSupportAt(r,a.gaps[0].x+30),null);
});
test('real flight needs jumping, survives with ordinary inputs and reaches Argentina at 30/60/120 Hz',()=>{
 for(const hz of [30,60,120])for(const width of [480,900])for(const assisted of [false,true]){
  const r=flightReady({width,assisted}),dt=1/hz,a=enter(r,dt),initial=r.elapsed;
  assert.equal(a?.kind,'air-transfer');let lastY=0,landings=0,phases=new Set(),resized=false;
  for(let i=0;i<30*hz&&r.terrain.active&&r.status==='running';i++){
   phases.add(a.flight.phase);
   if(!resized&&r.player.y>75){core.resizeRun(r,width===480?900:480);resized=true;}
   pilotDodge(r);core.advanceRun(r,dt);
   if(r.player.grounded&&r.player.supportY>0&&r.player.supportY!==lastY){lastY=r.player.supportY;landings++;}
   assert.equal(r.player.airJumpsUsed,0);assert.equal(r.shotsFired,0);
  }
  assert.equal(r.status,'running',JSON.stringify({hz,width,assisted,last:r.lastHit,phase:a.flight.phase,flight:a.flight.progress,x:r.player.x,y:r.player.y}));
  assert.equal(r.terrain.flightCompleted,true);assert.equal(core.routeStageFor(r).id,'argentina');
  assert.ok(r.elapsed-initial>=19&&r.elapsed-initial<27);assert.ok(landings>=4);assert.ok(resized);
  assert.deepEqual([...phases],['boarding','ascent','crossing','landing']);
 }
});
test('ignoring the first gap causes a real fall even with a reserve shield',()=>{
 const r=flightReady();r.shieldFor=999;assert.equal(enter(r)?.kind,'air-transfer');
 for(let i=0;i<600&&r.status==='running';i++)core.advanceRun(r,1/120);
 assert.equal(r.status,'over');assert.equal(r.lastHit.type,'terrain-gap');
});

test('air transfer warns before real shots and does not count a decorative aircraft as a threat',()=>{
 const r=flightReady(),a=enter(r);assert.equal(a?.kind,'air-transfer');
 const aircraft=a.flight.aircraft;
 assert.deepEqual(aircraft.map(c=>c.kind),['flyby','high','lane']);
 assert.ok(aircraft.slice(1).every(c=>c.launchAt-c.warnAt>=.90*a.flight.nominalSpeed));
 for(let i=0;i<18*120&&r.status==='running'&&!r.lastHit&&a.flight.progress<.39;i++){
  pilotDodge(r);core.crouchRun(r,false);core.advanceRun(r,1/120);
 }
 assert.equal(r.lastHit.type,'aircraft-high');assert.equal(r.lastHit.action,'crouch');
 assert.equal(r.status,'running');assert.equal(r.player.hp,1,'um avião obedece à mesma regra de dano da pista');
});


test('each aerial shot starts at the plane and an armed warning never damages early',()=>{
 const r=flightReady(),a=enter(r),[flyby,...armed]=a.flight.aircraft;
 a.flight.traveled=flyby.launchAt;assert.equal(aircraftPoseFor(a,flyby).shot,null);
 for(const craft of armed){
  a.flight.traveled=(craft.launchAt+craft.warnAt)/2;
  assert.equal(aircraftPoseFor(a,craft).warning,true);assert.equal(aircraftPoseFor(a,craft).shot,null);
  a.flight.traveled=craft.launchAt;
  const {aircraftX,aircraftY,shot}=aircraftPoseFor(a,craft);
  assert.deepEqual([shot.x,shot.y],[aircraftX,aircraftY]);
  a.flight.traveled+=.20*a.flight.nominalSpeed;
  const later=aircraftPoseFor(a,craft).shot;
  assert.ok(craft.kind==='high'?later.x<shot.x:later.y<shot.y);
 }
});

test('the injured body can land and avoid both aircraft without being healed',()=>{
 for(const width of [480,900])for(const assisted of [false,true]){
  const run=flightReady({width,assisted});run.player.hp=1;run.recoveryReadyAt=Infinity;
  assert.equal(enter(run)?.kind,'air-transfer');
  for(let i=0;i<30*120&&run.terrain.active&&run.status==='running';i++){
   pilotDodge(run);core.advanceRun(run,1/120);
  }
  assert.equal(run.status,'running',JSON.stringify(run.lastHit));
  assert.equal(run.terrain.flightCompleted,true);
  assert.equal(run.player.hp,1);
 }
});

test('São Paulo teaches a grounded bar before its first duel or flight, with no gap in the runway',()=>{
 const r=flightReady();r.routeDistance=core.STORY_OPENING_DISTANCE+2*core.SCENE_DISTANCE+759;r.bossesDefeated=4;
 r.nextBossAt=r.routeDistance+1450;const a=enter(r);
 assert.equal(a?.kind,'ground-lesson');assert.equal(core.routeStageFor(r).id,'sao-paulo');
 assert.ok(a.platforms.length&&a.gaps.length===0);
 assert.equal(terrainSupportAt(r,a.platforms[0].x-1),0,'embarkation skill is taught on solid ground');
 const initial=r.distance;let landed=false,previousRoute=r.routeDistance;
 for(let i=0;i<6*120&&r.terrain.active&&r.status==='running';i++){
  pilotDodge(r);core.advanceRun(r,1/120);landed||=r.player.grounded&&r.player.supportY>0;
  assert.equal(r.boss,null);assert.ok(r.routeDistance>=previousRoute);previousRoute=r.routeDistance;
 }
 assert.equal(r.status,'running');assert.ok(r.distance-initial>500);assert.equal(landed,true);
 assert.equal(r.terrain.lessonCompleted,true);
});

test('takeoff ramp is a physical upward surface ending at the real opening',()=>{
 const r=flightReady(),a=enter(r);
 const ramp=a.ramps?.[0];assert.ok(ramp);
 assert.ok(Math.abs(ramp.x+ramp.width-a.gaps[0].x)<1e-9);
 assert.ok(Math.abs(terrainSupportAt(r,ramp.x+ramp.width/2)-ramp.height/2)<1e-9);
 assert.equal(terrainSupportAt(r,a.gaps[0].x+10),null);
 let ascended=false;
 for(let i=0;i<230&&r.status==='running'&&!ascended;i++){
  core.advanceRun(r,1/120);
  if(r.player.y>5){ascended=true;assert.equal(r.player.grounded,true);assert.equal(r.player.velocity,0);}
 }
 assert.equal(ascended,true);
});
