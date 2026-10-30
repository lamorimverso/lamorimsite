import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
const dt=1/120;
const make=()=>{const r=core.createRun();core.startRun(r);r.shieldFor=1000;r.nextRaid=r.nextBossAt=Infinity;return r;};
const seeded=seed=>()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};
function simulate(r,seconds,rng=seeded(103)){for(let i=0;i<Math.ceil(seconds/dt);i++)core.advanceRun(r,dt,rng);}

test('pressão cresce pelo tempo e distância até limites explícitos',()=>{
 const a=core.difficultyAt(0,0),b=core.difficultyAt(0,70),c=core.difficultyAt(20000,70),z=core.difficultyAt(1e12,1e9);
 assert.equal(a.pressure,0);assert.ok(b.pressure>a.pressure);assert.ok(c.pressure>b.pressure);
 assert.equal(z.pressure,1);assert.equal(z.speed,435);assert.ok(z.obstacleGap>=1.12&&z.obstacleApproach>=.95&&z.bossApproach>=.85);
 assert.ok(c.obstacleGap<a.obstacleGap&&c.obstacleApproach<a.obstacleApproach);
});
test('corrida comum oferece altos e baixos e limita repetições para exigir leitura',()=>{
 const r=make(),rng=seeded(7),actions=[];let count=0;
 for(let i=0;i<60/dt;i++){core.advanceRun(r,dt,rng);if(r.spawnedObstacles>count){count=r.spawnedObstacles;actions.push({action:r.obstacles.at(-1).action,elapsed:r.elapsed});}}
 assert.ok(actions.some(o=>o.action==='jump')&&actions.some(o=>o.action==='crouch'));assert.equal(actions[0].action,'jump');
 let streak=1;for(let i=1;i<actions.length;i++){streak=actions[i].action===actions[i-1].action?streak+1:1;if(actions[i].elapsed>=10)assert.ok(streak<=3);}
});
test('Dilma, Simone e Soraya geram ameaças altas com função e popcorn pede salto',()=>{
 const r=make(),seen=new Map(),rng=seeded(8801);let count=0;
 for(let i=0;i<100/dt;i++){core.advanceRun(r,dt,rng);if(r.spawnedObstacles>count){count=r.spawnedObstacles;const o=r.obstacles.at(-1);if(o.sourceActor)seen.set(o.sourceActor,o);if(o.type==='popcorn')seen.set('popcorn',o);}}
 for(const [actor,type] of [['dilma','wind'],['simone','paper-gate'],['soraya','microphone']]){assert.equal(seen.get(actor)?.type,type);assert.equal(seen.get(actor)?.action,'crouch');}
 assert.equal(seen.get('popcorn')?.action,'jump');
});
test('chefes têm sequências próprias, repetições e metas maiores que um escudo',()=>{
 const strings=[];for(const [i,type] of ['haddad','lula','xandao'].entries()){
  const conf=core.bossAtRound(i);assert.equal(conf.attacks,[9,10,12][i]);assert.ok(conf.interval>=1.04&&conf.interval<=1.32);
  const actions=Array.from({length:conf.attacks},(_,n)=>core.bossAttackFor(type,n,i).action);
  assert.ok(actions.includes('jump')&&actions.includes('crouch'));assert.ok(actions.some((a,n)=>n&&a===actions[n-1]));strings.push(actions.join(','));
  assert.notDeepEqual(Array.from({length:9},(_,n)=>core.bossAttackFor(type,n,i)),Array.from({length:9},(_,n)=>core.bossAttackFor(type,n,i+3)));
 }
 assert.equal(new Set(strings).size,3);
});
test('Joice vencida espera chefe e tem dez segundos de ameaças mistas sem fome',()=>{
 const r=make();r.nextRaid=.1;r.boss={...core.bossAtRound(0),type:'haddad',name:'Haddad',fired:0,total:1000,remaining:1000,nextAttack:1e6};
 simulate(r,1);assert.ok(r.nextRaid<=0,'relógio continua durante chefe');r.boss=null;r.bossCooldown=0;r.routeDistance=1000;
 core.advanceRun(r,dt,()=>.5);assert.equal(r.raid?.phase,'warning');simulate(r,1.21);assert.equal(r.raid?.phase,'active');assert.ok(r.raid.remaining>9.9);
 const count=r.spawnedObstacles;simulate(r,9.7,seeded(7));assert.ok(r.spawnedObstacles-count>=8);simulate(r,2.5);assert.equal(r.raid,null);assert.ok(r.nextRaid>=24&&r.nextRaid<=36);
});
test('Zé Gotinha recolhido limpa perigos comuns e abre respiro sem vencer chefe',()=>{
 const r=make();r.shieldFor=0;r.obstacles=[{x:400,width:34,height:44,type:'pf',speed:200},{x:450,width:40,height:40,type:'hammer',bossAttack:true,projectile:true,y:60,speed:200}];
 r.pickups=[{type:'ze-gotinha',x:137,y:20,speed:0}];core.advanceRun(r,dt);
 assert.equal(r.lastPickup,'ze-gotinha');assert.equal(r.obstacles.length,1);assert.equal(r.obstacles[0].bossAttack,true);assert.ok(r.nextObstacle>=2.5-dt);assert.equal(r.shieldFor,0);
});
test('transição de Joice e aceleração preservam .82s entre contatos previstos em todas telas',()=>{
 for(const width of [480,612,900])for(const assisted of [false,true]){
  const r=make(),rng=seeded(7);r.viewportWidth=width;r.assisted=assisted;r.nextRaid=18;let count=0;
  for(let i=0;i<140/dt;i++){core.advanceRun(r,dt,rng);if(r.spawnedObstacles>count){count=r.spawnedObstacles;const times=r.obstacles.filter(o=>o.x>148).map(o=>(o.x-148)/o.speed).sort((a,b)=>a-b);for(let n=1;n<times.length;n++)assert.ok(times[n]-times[n-1]>=.82-1e-7,`${width} ${assisted}: ${times}`);}}
 }
});

test('chefes não são vencidos só segurando abaixar com um escudo de seis segundos',()=>{
 for(const type of ['haddad','lula','xandao']){
  const r=make();r.shieldFor=6;r.bossBag=[type];r.nextBossAt=0;r.nextPassport=r.nextPower=Infinity;
  core.crouchRun(r,true);simulate(r,25,()=>0);
  assert.equal(r.status,'over',type+' exige voltar a ler e desviar depois da proteção');assert.equal(r.bossesDefeated,0);
 }
});
test('estratégia de só saltar perde para ameaça alta, e Joice volta em corrida longa',()=>{
 for(const seed of [7,103,8801]){
  const r=make(),rng=seeded(seed);r.shieldFor=0;r.nextPower=Infinity;
  for(let i=0;i<60/dt&&r.status==='running';i++){
   const danger=r.obstacles.find(o=>o.x+o.width>125),until=danger?(danger.x-148)/danger.speed:Infinity;
   if(danger&&until<.26&&r.player.y===0)core.jumpRun(r);core.advanceRun(r,dt,rng);
  }
  assert.equal(r.status,'over');assert.equal(r.lastHit.action,'crouch');
  const long=make();long.nextRaid=null;long.nextBossAt=null;simulate(long,600,seeded(seed));
  assert.ok(long.raids>=8,'perseguição especial não some depois dos primeiros chefes');assert.ok(long.bossesDefeated>=8);
 }
});

test('vitória reserva sete quilômetros de corrida antes do próximo chefe',()=>{
 const r=make();r.routeDistance=60000;r.nextBossAt=22000;r.boss={type:'haddad',name:'Haddad',fired:9,total:9,remaining:0,nextAttack:10,attackFlashFor:0};
 core.advanceRun(r,dt);assert.ok(r.nextBossAt>=r.routeDistance+7000-1e-8,'padrões mais longos não viram fila interminável de chefes');
});

test('perigos altos deixam pelo menos48px visuais para o slide em toda a viagem',()=>{
 const r=make(),rng=seeded(103);let saw=false;
 for(let i=0;i<60/dt;i++){core.advanceRun(r,dt,rng);for(const o of r.obstacles.filter(o=>o.action==='crouch')){saw=true;assert.ok(o.y-o.height/2>=48,'slide desenhado tem até48px; o perigo não pode atravessar sua cabeça');}}
 assert.ok(saw);
 for(const type of ['haddad','lula','xandao']){
  const b=make();b.nextBossAt=0;b.bossBag=[type];core.advanceRun(b,dt);b.boss.nextAttack=0;b.boss.fired=type==='haddad'?0:type==='lula'?1:2;core.advanceRun(b,dt);
  const o=b.obstacles.at(-1);assert.equal(o.action,'crouch');assert.ok(o.y-o.height/2>=48);assert.ok(o.targetY-o.height/2>=48);
 }
});

test('resize preserva janela visível, contatos, voo e recompensas normal/assistido nos dois sentidos',()=>{
 assert.equal(typeof core.resizeRun,'function');
 for(const assisted of [false,true])for(const [from,to] of [[900,480],[480,900]])for(const kind of ['common','boss']){
  const r=make();r.assisted=assisted;r.viewportWidth=from;r.elapsed=200;r.distance=r.routeDistance=90000;r.nextObstacle=0;r.nextPower=Infinity;r.nextPassport=0;r.nextAllyAt=Infinity;
  if(kind==='boss'){r.nextObstacle=Infinity;r.nextBossAt=0;r.bossBag=['xandao'];core.advanceRun(r,dt,()=>.9);r.boss.nextAttack=0;}
  core.advanceRun(r,dt,()=>.9);r.nextObstacle=Infinity;if(r.boss)r.boss.nextAttack=Infinity;
  const danger=r.obstacles.at(-1),time=(danger.x-148)/danger.speed,offsets=r.pickups.map(p=>p.x-danger.x),beforeY=danger.y;
  const control=structuredClone(r);core.resizeRun(r,to);
  assert.equal(r.viewportWidth,to);assert.ok(Math.abs((danger.x-148)/danger.speed-time)<1e-9,'nenhuma mudança de prazo ao virar a tela');assert.equal(danger.y,beforeY);
  assert.ok(r.pickups.every((p,i)=>Math.abs(p.x-danger.x-offsets[i])<1e-9&&p.speed===danger.speed),'grupo acompanha a ameaça sem se separar');
  core.advanceRun(r,dt,()=>.9);core.advanceRun(control,dt,()=>.9);
  if(kind==='boss')assert.ok(Math.abs(danger.y-control.obstacles.at(-1).y)<1e-9,'progresso vertical do voo contínuo');
  if(kind==='common')assert.ok(Math.abs((Math.min(to,danger.x)-148)/danger.speed-(Math.min(from,control.obstacles.at(-1).x)-148)/control.obstacles.at(-1).speed)<1e-9,'mesma reação a partir da borda visível');
 }
 const r=make();r.viewportWidth=900;r.obstacles=[{x:392,speed:400,width:34,height:44,type:'pf'},{x:760,speed:400,width:46,height:72,type:'microphone',action:'crouch',projectile:true,y:84,launchY:84,targetY:84,launchX:783,targetX:137}];
 const times=r.obstacles.map(o=>(o.x-148)/o.speed);core.resizeRun(r,480);const after=r.obstacles.map(o=>(o.x-148)/o.speed);assert.ok(after.every((t,i)=>Math.abs(t-times[i])<1e-9));assert.ok(after[1]-after[0]>=.82);
 const touching={x:145,speed:250,width:44,height:32,type:'barrier'};r.obstacles=[touching];core.resizeRun(r,900);assert.equal(touching.x,145);assert.equal(touching.speed,250,'não reposiciona nem ressuscita contato já iniciado');
});
