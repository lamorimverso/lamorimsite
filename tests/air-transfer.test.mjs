import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
import {aircraftHitFor,aircraftPoseFor,terrainSupportAt} from '../tanahoraflavio/runner-terrain.mjs';
import {pilotDodge} from '../tools/story-pilot.mjs';
import * as shotAudio from '../tanahoraflavio/runner-shot-events.mjs';
const crossAt=core.STORY_OPENING_DISTANCE+3*core.SCENE_DISTANCE;
function flightReady({width=900,assisted=false,mode='story'}={}){
 const r=core.createRun({mode,seed:87,assisted});core.startRun(r);core.resizeRun(r,width);
 r.distance=r.routeDistance=(mode==='story'?crossAt:4*core.SCENE_DISTANCE)-1401;r.elapsed=150;r.bossesDefeated=6;
 for(const k of ['nextRaid','nextBossAt','nextAllyAt','nextSupportAt','nextPassport','nextPower','nextPickup'])r[k]=Infinity;
 r.terrain.nextAt=900;r.nextObstacle=2;return r;
}
function enter(r,dt=1/120){for(let i=0;i<Math.round(2/dt)&&!r.terrain.active;i++)core.advanceRun(r,dt);return r.terrain.active;}
const beforeExit=(r,index)=>{
 r.routeDistance=(r.mode==='story'?core.STORY_OPENING_DISTANCE:0)+index*core.SCENE_DISTANCE-1401;
 r.nextObstacle=Infinity;
};
function finishFlight(r,from,to,crossings){
 const a=enter(r);assert.equal(a?.kind,'air-transfer',`${from} → ${to}`);
 assert.deepEqual([a.flight.from,a.flight.to],[from,to]);
 assert.deepEqual([core.routeTransitionFor(r).from.id,core.routeTransitionFor(r).to.id],[from,to]);
 for(let i=0;i<30*120&&r.terrain.active&&r.status==='running';i++){pilotDodge(r);core.advanceRun(r,1/120);}
 assert.equal(r.status,'running');assert.equal(r.terrain.active,null);assert.equal(r.terrain.flightsCompleted,crossings);
 assert.equal(core.routeStageFor(r).id,to);
 assert.deepEqual([core.routeTransitionFor(r).active,core.routeTransitionFor(r).to.id],[false,to]);
}
test('depois do treino, saídas geográficas sucessivas embarcam uma vez, inclusive entre Flórida e Distrito de Colúmbia',()=>{
 const r=flightReady({mode:'endless'});
 for(const index of [1,2]){beforeExit(r,index);assert.equal(enter(r),null,'os dois primeiros cenários ainda são em terra');}
 for(const [index,from,to] of [[3,'argentina','paraguai'],[4,'paraguai','florida'],[5,'florida','casa-branca'],[6,'casa-branca','brasilia'],[7,'brasilia','rio']]){
  beforeExit(r,index);finishFlight(r,from,to,index-2);
  assert.equal(enter(r),null,'pousar não reabre o mesmo voo');
 }
});
test('História pousa no destino de cada voo, retorna a Brasília e não reinicia a rota no final',()=>{
 const r=flightReady();
 for(let index=3;index<core.STORY_STAGES.length;index++){
  beforeExit(r,index);finishFlight(r,core.STORY_STAGES[index-1].id,core.STORY_STAGES[index].id,index-2);
 }
 beforeExit(r,core.STORY_STAGES.length);
 assert.equal(enter(r),null);assert.equal(core.routeStageFor(r).id,'brasilia-final');
});
test('Infinito tem uma barra de treino no terceiro destino e viagem Paraguai → Flórida sem ameaças do solo',()=>{
 const r=flightReady({width:480,assisted:true});r.mode='endless';r.routeDistance=2*core.SCENE_DISTANCE+759;
 assert.equal(enter(r)?.kind,'ground-lesson');assert.equal(core.routeStageFor(r).id,'argentina');
 for(let i=0;i<6*120&&r.terrain.active&&r.status==='running';i++){pilotDodge(r);core.advanceRun(r,1/120);}
 assert.ok(r.terrain.lessonCompleted);
 r.routeDistance=4*core.SCENE_DISTANCE-1401;r.player.hp=1;r.recoveryReadyAt=Infinity;
 const a=enter(r);assert.equal(a?.kind,'air-transfer');
 assert.deepEqual([a.flight.from,a.flight.to],['paraguai','florida']);
 assert.deepEqual([core.routeTransitionFor(r).from.id,core.routeTransitionFor(r).to.id],['paraguai','florida']);
 r.nextBossAt=0;r.nextRaid=0;r.nextObstacle=0;
 for(let i=0;i<30*120&&r.terrain.active&&r.status==='running';i++){
  pilotDodge(r);core.advanceRun(r,1/120);
  if(r.terrain.active){assert.equal(r.boss,null);assert.equal(r.raid,null);assert.equal(r.obstacles.length,0);}
 }
 assert.equal(r.status,'running');assert.equal(r.terrain.flightCompleted,true);
 assert.equal(core.routeStageFor(r).id,'florida');assert.equal(r.player.hp,1);
 assert.equal(r.shotsFired,0);assert.equal(r.player.airJumpsUsed,0);
});
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
test('os passaportes normais continuam acessíveis no voo sem alterar vida, escudo ou dano',()=>{
 const r=flightReady({mode:'endless'});r.nextPassport=0;r.player.hp=1;r.recoveryReadyAt=Infinity;
 const a=enter(r);assert.equal(a?.kind,'air-transfer');
 assert.equal(r.pickups.length,6);
 for(const pickup of r.pickups){
  assert.equal(pickup.type,'passport');
  const bar=[a.platforms[0],a.platforms.at(-1)].find(bar=>pickup.x>=bar.x&&pickup.x<=bar.x+bar.width);
  assert.ok(bar,'coleta não exige abandonar uma barra');assert.equal(pickup.y,bar.y+18);
 }
 for(let i=0;i<30*120&&r.terrain.active&&r.status==='running';i++){pilotDodge(r);core.advanceRun(r,1/120);}
 assert.equal(r.terrain.flightCompleted,true);assert.equal(r.passports,6);
 assert.equal(r.player.hp,1);assert.equal(r.lives,1);assert.equal(r.reserveShields,0);
});
test('real flight needs jumping and reaches each mode’s destination at 30/60/120 Hz',()=>{
 for(const mode of ['story','endless'])for(const hz of [30,60,120])for(const width of [480,900])for(const assisted of [false,true]){
  const r=flightReady({width,assisted,mode}),dt=1/hz,a=enter(r,dt),initial=r.elapsed;
  assert.equal(a?.kind,'air-transfer');let lastY=0,landings=0,phases=new Set(),resized=false;
  for(let i=0;i<30*hz&&r.terrain.active&&r.status==='running';i++){
   phases.add(a.flight.phase);
   if(!resized&&r.player.y>75){core.resizeRun(r,width===480?900:480);resized=true;}
   pilotDodge(r);core.advanceRun(r,dt);
   if(r.player.grounded&&r.player.supportY>0&&r.player.supportY!==lastY){lastY=r.player.supportY;landings++;}
   assert.equal(r.player.airJumpsUsed,0);assert.equal(r.shotsFired,0);
  }
  assert.equal(r.status,'running',JSON.stringify({mode,hz,width,assisted,last:r.lastHit,phase:a.flight.phase,flight:a.flight.progress,x:r.player.x,y:r.player.y}));
  assert.equal(r.terrain.flightCompleted,true);assert.equal(core.routeStageFor(r).id,mode==='story'?'argentina':'florida');
  assert.ok(r.elapsed-initial>=19&&r.elapsed-initial<27);assert.ok(landings>=4);assert.ok(resized);
  assert.deepEqual([...phases],['boarding','ascent','crossing','landing']);
 }
});
test('crouch-forward desliza sobre uma plataforma no ar sem tirar o apoio',()=>{
 for(const mode of ['story','endless']){
  const r=flightReady({mode}),a=enter(r),bar=a.platforms[0];
  for(let i=0;i<5*120&&!(r.player.grounded&&r.player.y===bar.y);i++){pilotDodge(r);core.advanceRun(r,1/120);}
  assert.ok(r.player.grounded&&r.player.y===bar.y);
  const x=r.player.x;core.crouchRun(r,true);core.moveRun(r,1);
  for(let i=0;i<16;i++)core.advanceRun(r,1/120);
  assert.equal(r.player.sliding,true);assert.equal(r.player.y,bar.y);assert.ok(r.player.x>x+36);
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

test('o voo alto passa sobre as novas poses, mas ainda acerta as duas formas em pé',()=>{
 for(const hp of [1,2])for(const posture of ['crouching','sliding','standing']){
  const r=flightReady(),a=enter(r),craft=a.flight.aircraft.find(c=>c.kind==='high');
  a.flight.traveled=craft.launchAt;
  const {shot}=aircraftPoseFor(a,craft);
  Object.assign(r.player,{hp,x:shot.x-18,y:a.platforms[craft.barIndex].y,[posture]:true});
  assert.equal(aircraftHitFor(r)?.type,posture==='standing'?'aircraft-high':undefined);
 }
});

test('só aviões armados dão um aviso sonoro por aproximação, antes de disparar',()=>{
 assert.equal(typeof shotAudio.createAircraftWarningTracker,'function');
 const r=flightReady(),{flight}=enter(r),heard=[];
 const warn=shotAudio.createAircraftWarningTracker(effect=>heard.push(effect));
 warn(flight);assert.deepEqual(heard,[]);
 for(const craft of flight.aircraft){flight.traveled=craft.warnAt;warn(flight);warn(flight);}
 assert.deepEqual(heard,['high','drop']);
 const missed=shotAudio.createAircraftWarningTracker(effect=>heard.push(effect));
 flight.traveled=flight.aircraft.at(-1).launchAt;missed(flight);missed(null);
 assert.deepEqual(heard,['high','drop'],'não toca aviso atrasado quando já há disparo');
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
