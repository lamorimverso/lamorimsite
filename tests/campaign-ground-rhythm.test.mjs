import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
const dt=1/120;
function isolated(mode,stage,width=480,seed=7){
 const r=core.createRun({mode,seed});core.startRun(r);core.resizeRun(r,width);
 r.elapsed=60;
 r.routeDistance=r.distance=(mode==='story'?core.STORY_OPENING_DISTANCE:0)+stage*core.SCENE_DISTANCE+50;
 r.nextBossAt=r.nextRaid=r.nextAllyAt=r.nextSupportAt=r.nextPower=r.nextPassport=Infinity;
 r.terrain.nextAt=Infinity;r.nextObstacle=0;r.shieldFor=Infinity;
 return r;
}
function upcoming(r,count=2){
 const waves=[];
 for(let i=0;i<8/dt&&waves.length<count;i++){
  const n=r.spawnedObstacles;
  core.advanceRun(r,dt,()=>.55);
  if(r.spawnedObstacles===n)continue;
  const shot=r.obstacles.at(-1);
  waves.push({style:shot.groundHazard?'marker':shot.cast?'overhead':shot.approach,arrival:r.elapsed+core.threatTimeToContact(r,shot)});
 }
 return waves;
}
test('a primeira lição terrestre de cada destino tem uma geometria própria, além da identidade visual do perseguidor',()=>{
 const openers=['front','rear','rolling','drop','marker','rolling','overhead','rear'];
 for(let stage=0;stage<openers.length;stage++){
  const r=isolated('story',stage);
  if(stage===7){r.routeDistance+=2200;r.distance+=2200;r.lastBoss='janones';} // Libera o recorte depois de Janones.
  const waves=upcoming(r);
  assert.equal(waves.length,2);
  assert.equal(waves[0].style,openers[stage],core.routeStageFor(r).id);
  assert.notEqual(waves[1].style,waves[0].style,'a abertura apresenta uma decisão e depois outra, não dói com a mesma surpresa');
 }
});

test('intervalos de contato continuam seguros nas duas bordas após a lição local',()=>{
 for(const width of [480,900])for(const edge of ['min','max'])for(let stage=0;stage<8;stage++){
  const r=isolated('story',stage,width);r.player.x=core.playerBounds(r)[edge];
  const waves=upcoming(r,4);assert.ok(waves.length>=3);
  assert.ok(waves.every((w,i)=>!i||w.arrival-waves[i-1].arrival>=.81),`${width}/${edge}/${stage}: ${JSON.stringify(waves)}`);
 }
});

test('depois do teto de velocidade, as voltas mudam composição sem acelerar o mundo',()=>{
 const waves=[];
 for(let lap=300;lap<304;lap++){
  const r=isolated('endless',0);r.elapsed=50000;r.distance=1e10;
  r.routeDistance=lap*core.STAGES.length*core.SCENE_DISTANCE+50;
  waves.push({speed:core.difficultyAt(r.distance,r.elapsed).speed,style:upcoming(r)[0].style});
 }
 assert.deepEqual(waves.map(w=>w.speed),[535,535,535,535]);
 assert.ok(new Set(waves.map(w=>w.style)).size>=3,'a volta tem decisões novas mesmo com a velocidade fixa');
});

test('Ana Elisa e Erika ensinam o perigo lateral e liberam cedo um projétil rebatível',async()=>{
 const bosses=await import('../tanahoraflavio/runner-bosses.mjs');
 for(const id of ['ana-elisa','erika'])for(const width of [480,900]){
  const index=Array.from({length:bosses.STORY_ENCOUNTERS},(_,i)=>bosses.storyBossAt(i)).find(b=>b.type===id).index;
  const r=isolated('story',0,width);r.routeDistance=r.distance=bosses.nextStoryBossDistance(index);
  r.elapsed=0;r.bossesDefeated=index;r.nextBossAt=0;
  let lateralBeforeReflection=false,firstProjectile=null;
  for(let i=0;i<6.5/dt&&!firstProjectile;i++){
   core.advanceRun(r,dt);
   lateralBeforeReflection ||= r.obstacles.some(o=>o.bossAttack&&o.falling);
   firstProjectile=r.obstacles.find(o=>o.bossAttack&&core.isHostileProjectile(o));
  }
  assert.ok(lateralBeforeReflection,id+' apresenta a assinatura de marcas');
  assert.ok(firstProjectile,`${id}/${width}: não há progresso ofensivo nos primeiros 6,5 s`);
  assert.equal(firstProjectile.owner,id);
  assert.equal(r.boss.hp,r.boss.maxHp,'o disparo só causa dano após voltar à origem');
 }
});

test('a campanha de verdade apresenta retaguarda e emissão alta depois da travessia do Povo e de Janones',async()=>{
 const {pilotCounter}=await import('../tools/story-pilot.mjs');
 for(const [width,seed] of [[480,2],[900,7]]){
  const r=core.createRun({mode:'story',seed});core.resizeRun(r,width);core.startRun(r);
  let lastSpawn=0,povo=false,janones=false;const waves=[];
  for(let i=0;i<120*900&&r.status==='running'&&waves.length<2;i++){
   pilotCounter(r);if(r.reserveShields&&r.shieldFor<=0)core.activateReserveShield(r);core.advanceRun(r,dt);
   povo ||= r.lastBoss==='povo';janones ||= r.lastBoss==='janones';
   if(lastSpawn===r.spawnedObstacles)continue;lastSpawn=r.spawnedObstacles;
   if(!janones||r.boss||r.raid||r.terrain.active||core.routeStageFor(r).id!=='brasilia-final')continue;
   const o=r.obstacles.at(-1);if(o.rehearsal)continue;
   waves.push(o.cast?'overhead':o.approach);
  }
  assert.ok(povo&&janones,'o piloto de comandos públicos conclui ambos os encontros reais');
  assert.deepEqual(waves,['rear','overhead'],`${width}px: abertura terrestre depois de Janones`);
 }
});

test('a marca do Paraguai continua pendente quando uma zona anterior ocupa a janela',()=>{
 const r=isolated('story',4);
 const blocker=core.spawnManholeThreat(r,{rng:()=>.55});
 assert.ok(blocker);
 blocker.age=blocker.warningFor+blocker.activeFor-.05;
 const waves=upcoming(r);
 assert.notEqual(waves[0].style,'marker','um aviso anunciado não é sobreposto');
 assert.equal(waves[1].style,'marker','a próxima janela livre ainda ensina o desvio da marca');
});

test('o Fiscal não consome o espaço de ensino do Paraguai na rota natural',async()=>{
 const {pilotCounter}=await import('../tools/story-pilot.mjs');
 const r=core.createRun({mode:'story',seed:1});core.resizeRun(r,480);core.startRun(r);
 const waves=[];let lastSpawn=0;
 for(let i=0;i<120*900&&r.status==='running'&&waves.length<2;i++){
  pilotCounter(r);if(r.reserveShields&&r.shieldFor<=0)core.activateReserveShield(r);core.advanceRun(r,dt);
  if(lastSpawn===r.spawnedObstacles)continue;lastSpawn=r.spawnedObstacles;
  if(r.lastBoss!=='fiscal'||r.boss||r.raid||r.terrain.active||core.routeStageFor(r).id!=='paraguai')continue;
  const o=r.obstacles.at(-1);if(o.rehearsal)continue;
  waves.push(o.groundHazard?'marker':o.cast?'overhead':o.approach);
 }
 assert.deepEqual(waves,['marker','rolling'],'a primeira janela livre após o Fiscal ensina marcação e rolante');
});
