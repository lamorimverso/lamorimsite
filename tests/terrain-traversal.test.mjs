import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
import {pilotDodge} from '../tools/story-pilot.mjs';
const DT=1/120;
function isolated(width=900){
 const r=core.createRun({seed:3});core.startRun(r);core.resizeRun(r,width);
 for(const key of ['nextObstacle','nextRaid','nextBossAt','nextAllyAt','nextSupportAt','nextPassport','nextPower','nextPickup'])r[key]=Infinity;
 assert.ok(r.terrain,'route has its own physical terrain state');r.terrain.nextAt=Infinity;return r;
}
function step(r,s,control){for(let i=0;i<Math.round(s/DT)&&r.status==='running';i++){control?.(r);core.advanceRun(r,DT);}}
function encounter(kind,width=900){const r=isolated(width);r.terrain.nextAt=0;r.terrain.nextKind=kind;r.nextObstacle=0;core.advanceRun(r,DT);r.nextObstacle=Infinity;assert.equal(r.terrain.active?.kind,kind);return r;}

test('grounded crouch-forward produces bounded momentum with release, reverse, jump and clear exits',()=>{
 const r=isolated();core.crouchRun(r,true);core.moveRun(r,1);step(r,.2);
 assert.equal(r.player.sliding,true);assert.ok(r.player.x>120+230*.2,'slide has real forward momentum');
 step(r,1);assert.equal(r.player.sliding,false,'holding does not create an unlimited slide');
 core.crouchRun(r,false);core.crouchRun(r,true);step(r,.05);assert.equal(r.player.sliding,true);
 core.moveRun(r,-1);step(r,DT);assert.equal(r.player.sliding,false);
 core.moveRun(r,1);step(r,DT);assert.equal(r.player.sliding,true);assert.equal(core.jumpRun(r),true);assert.equal(r.player.sliding,false);
 step(r,.1);assert.equal(r.player.crouching,false,'diagonal air input cannot shrink the jumping body');
 core.clearRunInput(r);assert.equal(r.player.sliding,false);
});
test('visible low opening hits standing, while crouch-forward slides beneath it',()=>{
 for(const crouch of [false]){const r=encounter('passage');core.crouchRun(r,crouch);step(r,5);assert.equal(r.status,'over');assert.equal(r.lastHit.type,'terrain-ceiling');}
 for(const width of [480,900]){const r=encounter('passage',width);step(r,5,pilotDodge);assert.equal(r.status,'running');assert.ok(r.terrain.completed>=1);}
});
test('gap removes ground support and consumes a life even under shields, with stable recovery on extra life',()=>{
 const r=encounter('gap-platform');r.shieldFor=Infinity;step(r,5);assert.equal(r.status,'over');assert.equal(r.lastHit.type,'terrain-gap');
 const extra=encounter('gap-platform');extra.lives=2;for(let i=0;i<600&&extra.lives===2;i++)core.advanceRun(extra,DT);assert.equal(extra.status,'running');assert.equal(extra.lives,1);assert.equal(extra.player.y,0);assert.equal(extra.terrain.active,null);assert.ok(extra.graceFor>0);
});
test('legal jump lands on raised support before returning to floor, at both viewport widths',()=>{
 for(const width of [480,900]){const r=encounter('gap-platform',width);let landed=false,maxY=0;step(r,6,run=>{pilotDodge(run);maxY=Math.max(maxY,run.player.y);if(run.player.supportY===28&&run.player.velocity===0)landed=true;});assert.equal(r.status,'running');assert.ok(maxY>70);assert.ok(landed,'platform supplies real elevated support');assert.equal(r.player.y,0);assert.ok(r.terrain.completed>=1);}
});
test('jump from an elevated support and buffered landing retain normal input semantics',()=>{
 const r=encounter('gap-platform');let jumped=false;step(r,5,run=>{pilotDodge(run);if(!jumped&&run.player.supportY===28&&run.player.velocity===0){assert.equal(core.jumpRun(run),true);jumped=true;}});assert.equal(jumped,true);assert.equal(r.status,'running');
});
test('resize preserves terrain contact time and active support coordinates without replacing ground',()=>{
 const r=encounter('gap-platform');step(r,.4);const a=r.terrain.active,offset=a.gaps[0].x-r.player.x,span=a.gaps[0].width;
 core.resizeRun(r,480);assert.ok(Math.abs(a.gaps[0].x-r.player.x-offset)<1e-9);assert.equal(a.gaps[0].width,span);core.resizeRun(r,900);assert.ok(Math.abs(a.gaps[0].x-r.player.x-offset)<1e-9);
 step(r,5,pilotDodge);assert.equal(r.status,'running');assert.ok(r.terrain.completed>=1);
});
test('terrain waits for threats and protected scenes in both modes and reserves an active traversal',()=>{
 for(const mode of ['story','endless'])for(const scene of ['boss','raid','jacare','transition','rehearsal','threat']){
  const r=isolated();r.mode=mode;r.terrain.nextAt=0;r.nextObstacle=0;
  if(scene==='boss')r.boss={combat:true,phase:'intro',remaining:100,type:'haddad',introFor:100,attacks:0};
  if(scene==='raid')r.raid={phase:'warning',remaining:100};
  if(scene==='jacare'){r.player.isJacare=true;r.player.jacareAge=0;}
  if(scene==='transition')r.routeDistance=(mode==='story'?core.STORY_OPENING_DISTANCE:0)+7000;
  if(scene==='rehearsal'){if(mode==='endless')continue;r.nextBossAt=core.STORY_OPENING_DISTANCE;r.routeDistance=r.nextBossAt-200;}
  if(scene==='threat')r.obstacles=[{x:850,width:34,height:40,type:'barrier',speed:180}];
  core.advanceRun(r,DT);assert.equal(r.terrain.active,null,`${mode} ${scene}`);
 }
 const r=encounter('gap-platform'),active=r.terrain.active;r.nextRaid=0;r.nextBossAt=0;
 step(r,.5,pilotDodge);assert.equal(r.terrain.active,active);assert.equal(r.boss,null);assert.equal(r.raid,null);
 step(r,5,pilotDodge);assert.equal(r.status,'running');assert.ok(r.boss||r.raid,'reserved event starts after terrain completes');
});
test('fixed seeded terrain route is independent of viewport and simulation step within physical tolerance',()=>{
 const states=[];for(const width of [480,900])for(const dt of [1/60,1/120]){
  const r=encounter('gap-platform',width);for(let t=0;t<6&&r.status==='running';t+=dt){pilotDodge(r);core.advanceRun(r,dt);}states.push(r);
 }
 assert.ok(states.every(r=>r.status==='running'&&r.terrain.completed===1&&r.player.y===0));
});
test('raised support has solid entry faces in both lateral directions',()=>{
 for(const direction of [-1,1]){
  const r=encounter('gap-platform'),a=r.terrain.active;a.gaps=[];a.platforms=[{x:direction===1?r.player.x+32:r.player.x+4-140,width:140,y:28}];
  core.moveRun(r,direction);step(r,.1);assert.equal(r.status,'over');assert.equal(r.lastHit.type,'terrain-platform');
 }
});
test('stale ground flags never permit an airborne jump or crouch',()=>{
 const r=isolated();r.player.y=55;assert.equal(core.jumpRun(r),false);assert.equal(core.crouchRun(r,true),false);assert.equal(r.player.velocity,0);
});
test('a transformation pickup is deferred during committed terrain without repeated collection credit',()=>{
 const r=encounter('passage');r.pickups=[{type:'ze-gotinha',x:r.player.x+17,y:20,speed:0}];
 step(r,.1);assert.equal(r.player.isJacare,false);assert.equal(r.collected,0);assert.equal(r.pickups.length,1);
});
test('holding forward before a terrain announcement preserves at least 820ms of physical reaction',()=>{
 for(const width of [480,900])for(const crouch of [false,true]){
  const r=isolated(width);r.aid={kind:'encourage',remaining:10};core.crouchRun(r,crouch);core.moveRun(r,1);r.terrain.nextAt=0;r.terrain.nextKind='passage';r.nextObstacle=0;core.advanceRun(r,DT);r.nextObstacle=Infinity;
  const announced=r.elapsed,roof=r.terrain.active.ceilings[0];while(r.player.x+31<roof.x&&r.status==='running'&&r.elapsed-announced<4)core.advanceRun(r,DT);
  assert.ok(r.elapsed-announced>=.82,`reaction ${r.elapsed-announced}`);
 }
});
test('natural endless and story routes actually deliver terrain without starving it behind reserved events',()=>{
 for(const mode of ['endless','story'])for(const width of [480,900]){
  const r=core.createRun({mode,seed:1});core.startRun(r);core.resizeRun(r,width);r.nextAllyAt=Infinity;
  step(r,65,pilotDodge);assert.equal(r.status,'running');assert.ok(r.terrain.completed>=1,`${mode}/${width} completed terrain`);
 }
});

test('descending onto the leading edge lands on solid support before the center reaches the platform',()=>{
 for(const width of [480,900])for(const jumpEta of [.20,.24,.26]){
  const r=encounter('gap-platform',width),gap=r.terrain.active.gaps[0];
  while((gap.x-(r.player.x+17))/200>jumpEta)core.advanceRun(r,DT);
  assert.equal(core.jumpRun(r),true);let landed=false;
  step(r,3,run=>{if(run.player.grounded&&run.player.supportY===28)landed=true;});
  assert.equal(r.status,'running',`edge jump ${width}/${jumpEta}`);assert.ok(landed,'body cannot pass through the visible top');
 }
});

test('a descending foot interval can land from the reverse platform edge without center overlap',()=>{
 const r=encounter('gap-platform'),a=r.terrain.active;
 a.gaps=[{x:0,width:900}];a.platforms=[{x:-14,width:140,y:28}];
 r.player.y=28.2;r.player.velocity=-10;r.player.grounded=false;r.player.supportY=null;core.moveRun(r,-1);
 core.advanceRun(r,DT);
 assert.equal(r.status,'running');assert.equal(r.player.y,28);assert.equal(r.player.supportY,28);assert.equal(r.player.grounded,true);
});
