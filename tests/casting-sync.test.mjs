import test from 'node:test';import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
function isolated(width=900,x=120){const r=core.createRun({seed:2});core.startRun(r);core.resizeRun(r,width);r.player.x=x;r.elapsed=11;r.nextObstacle=0;r.nextBossAt=r.nextRaid=r.nextAllyAt=r.nextSupportAt=r.nextPower=r.nextPassport=Infinity;return r;}
test('emissor comum prepara e lança com origem real na mão, não fora da tela',()=>{
 const r=isolated();core.advanceRun(r,1/120,()=>0);
 const o=r.obstacles.find(o=>o.sourceActor);assert.ok(o,'há emissor alto');assert.ok(o.cast,'ciclo de emissão explícito');assert.ok(o.waitFor>=.45);assert.equal(o.launched,undefined);
 r.nextObstacle=Infinity;for(let i=0;i<240&&!o.launched;i++)core.advanceRun(r,1/120,()=>0);
 assert.equal(o.launched,true);assert.ok(o.launchX<900&&o.launchX>600);assert.ok(o.launchY>130);assert.ok(o.cast.flightAge>0);
});
test('emissão alta preserva resposta de abaixar em ambas as bordas',()=>{
 for(const width of [480,900])for(const edge of ['min','max']){
  const r=isolated(width),bounds=core.playerBounds(r);r.player.x=bounds[edge];core.advanceRun(r,1/120,()=>0);r.nextObstacle=Infinity;
  const o=r.obstacles.find(o=>o.sourceActor);assert.ok(o.cast);assert.ok(core.threatTimeToContact(r,o)>=.95);
  for(let i=0;i<360&&r.status==='running';i++){core.crouchRun(r,true);core.advanceRun(r,1/120,()=>0);}
  assert.equal(r.status,'running',width+'/'+edge);
 }
});
test('resize preserva o prazo do projétil emitido e os pontos continuam finitos',()=>{
 const r=isolated();core.advanceRun(r,1/120,()=>0);r.nextObstacle=Infinity;const o=r.obstacles.find(o=>o.sourceActor);assert.ok(o.cast);
 for(let i=0;i<80;i++)core.advanceRun(r,1/120,()=>0);const eta=core.threatTimeToContact(r,o);core.resizeRun(r,480);
 assert.ok(Math.abs(core.threatTimeToContact(r,o)-eta)<1e-9);assert.ok(Number.isFinite(o.cast.fromX)&&Number.isFinite(o.cast.toX));
});
test('origem do disparo coincide com a mão no início da soltura, inclusive com movimento reduzido',async()=>{
 const {regularCastMuzzle,regularEmitterPose}=await import('../tanahoraflavio/runner-cast-pose.mjs');
 const {combatGeometryFor}=await import('../tanahoraflavio/runner-combat-geometry.mjs');
 for(const width of [480,900])for(const reducedMotion of [false,true])for(const type of ['dilma','simone','soraya','joice']){
  const phase=19,pose=regularEmitterPose(type,width,core.WORLD.ground),rig=combatGeometryFor(type,{phase,reducedMotion,frame:2,scale:pose.scale}),muzzle=regularCastMuzzle(type,width,core.WORLD.ground,phase);
  assert.equal(muzzle.x,pose.x+rig.muzzle.x);
  assert.ok(Math.abs(muzzle.y-(core.WORLD.ground-pose.y-rig.muzzle.y))<1,'diferença subpixel de respiração');
 }
});
test('passaportes vinculados seguem o disparo durante preparação, voo e resize',()=>{
 const r=isolated();r.shieldFor=Infinity;r.nextPassport=0;core.advanceRun(r,1/120,()=>0);r.nextObstacle=Infinity;
 const o=r.obstacles.find(o=>o.cast),p=r.pickups.find(p=>p.anchor===o);assert.ok(p);let offset=p.x-o.x;
 for(let i=0;i<165;i++){
  if(i===125){core.resizeRun(r,480);offset=p.x-o.x;}
  core.advanceRun(r,1/120,()=>0);
  assert.ok(Math.abs(p.x-o.x-offset)<1e-7,'não separa coleta da onda após mudar velocidade');
 }
});
test('resize conserva também o instante físico da colisão durante o voo',()=>{
 function impact(resize){const r=isolated();core.advanceRun(r,1/120,()=>0);r.nextObstacle=Infinity;const o=r.obstacles.find(o=>o.cast);while(o.cast.flightAge<.3)core.advanceRun(r,1/120,()=>0);if(resize)core.resizeRun(r,480);while(r.status==='running'&&o.cast.flightAge<1)core.advanceRun(r,1/120,()=>0);assert.equal(r.status,'over');return o.cast.flightAge;}
 assert.ok(Math.abs(impact(false)-impact(true))<=1/120);
});
