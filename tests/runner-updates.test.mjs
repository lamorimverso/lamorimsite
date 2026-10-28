import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';

const running=()=>{const r=core.createRun();core.startRun(r);return r;};
const seeded=seed=>()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);
function step(r,seconds,rng=()=>.5){for(let n=0;n<Math.ceil(seconds*120)&&r.status==='running';n++)core.advanceRun(r,1/120,rng);}
const collect=(r,type)=>{r.pickups.push({x:136,y:35,type,value:0});core.advanceRun(r,1/120,()=>.5);};
const collide=r=>r.obstacles.push({x:125,width:34,height:44,type:'pf'});
function triggerBoss(r,rng=()=>.5){r.nextBossAt=r.routeDistance||0;r.bossCooldown=0;core.advanceRun(r,1/120,rng);assert.ok(r.boss,'o encontro deve começar pela distância');}

test('Escudo das Américas coletado junto ao perigo protege sem gastar vida',()=>{
 const r=running();collide(r);collect(r,'shield');
 assert.equal(r.status,'running');assert.equal(r.lives,1);assert.equal(r.shieldFor,6);
});
test('escudo expira em seis segundos sem deixar uma colisão guardada',()=>{
 const r=running();collect(r,'shield');r.obstacles=[];r.nextObstacle=100;step(r,6.1);
 assert.equal(r.shieldFor,0);collide(r);core.advanceRun(r,1/120);assert.equal(r.status,'over');
});
test('não oferece outra coleta de escudo enquanto a invisibilidade está ativa',()=>{
 const r=running();r.shieldFor=5;r.nextPower=0;r.nextObstacle=0;r.nextPassport=100;
 core.advanceRun(r,1/120,()=>.5);assert.ok(r.pickups.every(p=>p.type!=='shield'));
});
test('100 passaportes concedem vida uma vez e coletar o número 100 salva no mesmo frame',()=>{
 const r=running();r.passports=99;collide(r);collect(r,'passport');
 assert.equal(r.status,'running');assert.equal(r.passports,100);assert.equal(r.lives,1);assert.ok(r.graceFor>0);
 r.obstacles=[];collect(r,'passport');assert.equal(r.lives,1);
});
test('apenas passaportes e vantagens úteis são gerados em ondas comuns',()=>{
 const r=running(),rng=seeded(54),types=new Set();r.nextBossAt=Infinity;r.nextRaid=Infinity;
 for(let i=0;i<120*100;i++){core.advanceRun(r,1/120,rng);r.pickups.forEach(p=>types.add(p.type));r.obstacles=r.obstacles.filter(o=>o.x>250);r.pickups=r.pickups.filter(p=>p.x>250);}
 assert.deepEqual([...types].sort(),['passport','shield']);
});
test('Bíblia coletada fortalece exatamente três tiros; o quarto usa o ataque básico',()=>{
 const r=running();triggerBoss(r);r.boss.health=r.boss.maxHealth=100;r.boss.nextAttack=100;r.boss.nextShot=.1;
 collect(r,'biblia');assert.equal(r.bibleCharges,3);
 const kinds=[];for(let i=0;i<120*4;i++){const n=r.boss.shotsFired;core.advanceRun(r,1/120,()=>.5);if(r.boss.shotsFired>n)kinds.push(r.boss.lastWeapon);}
 assert.deepEqual(kinds.slice(0,4),['Bíblia evangélica','Bíblia evangélica','Bíblia evangélica','Ivermectina']);assert.equal(r.bibleCharges,0);
});
test('munição especial causa dano três e o tiro básico causa um sem remover perigos',()=>{
 for(const [type,damage] of [['biblia',3],['ivermectina',1]]){
  const r=running();triggerBoss(r);r.boss.nextShot=r.boss.nextAttack=100;const hp=r.boss.health;
  r.shots.push({type,damage,progress:.99,launchY:0});r.obstacles=[{x:700,width:35,height:40,type:'pf'}];
  core.advanceRun(r,1/120,()=>.5);assert.equal(r.boss.health,hp-damage);assert.equal(r.obstacles.length,1);
 }
});
test('Bíblia só nasce em chefe e não desperdiça coleta quando há cargas',()=>{
 const r=running();triggerBoss(r);r.shieldFor=1;r.nextPower=100;r.nextPassport=100;r.nextPickup=0;r.boss.nextAttack=0;
 core.advanceRun(r,1/120,()=>.5);assert.ok(r.pickups.some(p=>p.type==='biblia'));
 r.pickups=[];r.bibleCharges=3;r.nextPickup=0;r.boss.nextAttack=0;core.advanceRun(r,1/120,()=>.5);assert.ok(r.pickups.every(p=>p.type!=='biblia'));
});
test('chefões sorteados são três distintos por rodada e variam entre sementes',()=>{
 const orders=[];
 for(const seed of [1,44,800]){const r=running(),rng=seeded(seed),seen=[];r.nextRaid=Infinity;
  for(let i=0;i<6;i++){triggerBoss(r,rng);seen.push(r.boss.type);r.boss.fired=r.boss.total;r.boss.remaining=r.boss.health=0;r.obstacles=[];core.advanceRun(r,1/120,rng);assert.equal(r.boss,null);}
  assert.deepEqual(seen.slice(0,3).sort(),['haddad','lula','xandao']);assert.deepEqual(seen.slice(3,6).sort(),['haddad','lula','xandao']);assert.notEqual(seen[2],seen[3]);orders.push(seen.join(','));
 }assert.ok(new Set(orders).size>1);
});
test('bônus de pontos não antecipam chefes e rota continua após cada volta',()=>{
 const r=running();r.bonus=99999;r.nextBossAt=4000;core.advanceRun(r,.01,()=>.5);assert.equal(r.boss,null);
 assert.equal(core.stageAt(100).id,'brasilia');assert.equal(core.stageAt(180).id,'casa-branca');
 const t=core.stageTransitionAt(99);assert.equal(t.from.id,'casa-branca');assert.equal(t.to.id,'brasilia');assert.equal(t.active,true);
});
test('distância da rota espera o chefe, mas personagem e pontuação continuam',()=>{
 const r=running();triggerBoss(r);const route=r.routeDistance,dist=r.distance;r.boss.nextAttack=100;step(r,.2);
 assert.equal(r.routeDistance,route);assert.ok(r.distance>dist);
});
test('chefões anunciam ataques próprios e todos são saltáveis',()=>{
 const attacks=new Map();const r=running(),rng=seeded(71);r.nextRaid=Infinity;
 for(let i=0;i<3;i++){triggerBoss(r,rng);assert.ok(r.boss.nextAttack>=1.2);r.boss.nextAttack=0;core.advanceRun(r,1/120,rng);const attack=r.obstacles.at(-1);assert.ok(attack.bossAttack);assert.ok(attack.height<=50);attacks.set(r.boss.type,attack.type);r.boss.fired=r.boss.total;r.boss.remaining=r.boss.health=0;r.obstacles=[];core.advanceRun(r,1/120,rng);}
 assert.equal(new Set(attacks.values()).size,3);
});
test('Joice avisa por dois segundos e a dificuldade extra dura oito segundos',()=>{
 const r=running();r.nextRaid=0;r.nextBossAt=Infinity;core.advanceRun(r,1/120,()=>.5);
 assert.equal(r.raid.phase,'warning');assert.equal(r.raid.remaining,2);r.shieldFor=50;
 step(r,2.02);assert.equal(r.raid.phase,'active');assert.ok(r.raid.remaining>7.9);
 step(r,8.02);assert.equal(r.raid.phase,'recovery');step(r,2.02);assert.equal(r.raid,null);assert.ok(r.nextRaid>=35&&r.nextRaid<=60);
});
test('evento produz ondas da PF mais frequentes, mas conserva intervalo para aterrissar',()=>{
 const normal=running(),raid=running();normal.nextBossAt=raid.nextBossAt=Infinity;normal.nextRaid=raid.nextRaid=Infinity;
 raid.raid={phase:'active',remaining:8,factIndex:0,id:1};normal.nextObstacle=raid.nextObstacle=0;
 core.advanceRun(normal,1/120,()=>.5);core.advanceRun(raid,1/120,()=>.5);
 assert.equal(raid.obstacles[0].type,'pf');assert.ok(raid.nextObstacle<normal.nextObstacle);assert.ok(raid.nextObstacle>=1.15);
});
test('evento não começa durante chefe ou transição e chefe aguarda evento ativo',()=>{
 const r=running();triggerBoss(r);r.nextRaid=0;core.advanceRun(r,.01,()=>.5);assert.equal(r.raid,null);
 const t=running();t.routeDistance=4900;t.nextBossAt=Infinity;t.nextRaid=0;core.advanceRun(t,.01,()=>.5);assert.equal(t.raid,null);
 const a=running();a.raid={phase:'active',remaining:8,factIndex:0,id:1};a.nextBossAt=0;core.advanceRun(a,.01,()=>.5);assert.equal(a.boss,null);
});
test('suspensão congela efeitos, munição e evento; reinício limpa tudo',()=>{
 const r=running();r.shieldFor=5;r.bibleCharges=2;r.raid={phase:'active',remaining:4,factIndex:0,id:1};core.togglePause(r);
 const copy=structuredClone(r);step(r,2);assert.deepEqual(r,copy);
 const fresh=core.createRun();assert.equal(fresh.shieldFor,0);assert.equal(fresh.bibleCharges,0);assert.equal(fresh.raid,null);
});
test('sorteio dos inimigos varia sem transformar chefões em perseguidores comuns',()=>{
 const types=new Set();for(const random of [.01,.3,.6,.99]){const r=running();r.routeDistance=21000;r.nextBossAt=r.nextRaid=Infinity;r.nextObstacle=0;core.advanceRun(r,.01,()=>random);types.add(r.obstacles[0].type);}
 assert.ok(types.size>=3);assert.ok([...types].every(x=>!['xandao','haddad','lula'].includes(x)));
});
test('a rota espera o evento terminar para não misturar Joice com transições de cenário',()=>{
 const r=running();r.routeDistance=4200;r.nextRaid=0;r.nextBossAt=Infinity;core.advanceRun(r,.01,()=>.5);
 assert.ok(r.raid);const route=r.routeDistance;r.shieldFor=20;step(r,9);
 assert.equal(r.routeDistance,route);assert.equal(core.stageTransitionAt(r.routeDistance/250).active,false);
});
