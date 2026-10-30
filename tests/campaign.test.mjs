import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';

const DT=1/120;
function isolatedRoute(){
 const run=core.createRun();core.startRun(run);
 run.nextObstacle=run.nextRaid=run.nextPassport=run.nextPower=run.nextPickup=Infinity;
 run.shieldFor=Infinity;
 return run;
}
const advance=(run,rng=()=>0,dt=DT)=>core.advanceRun(run,dt,rng);
const transition=run=>core.stageTransitionAt(run.routeDistance/7000*20);

test('a primeira aparição espera 22 km de rota sem variação aleatória',()=>{
 for(const random of [0,.5,.999]){
  const run=isolatedRoute(),rng=()=>random;
  advance(run,rng);
  assert.equal(run.nextBossAt,22000);
  run.routeDistance=21990;
  advance(run,rng);
  assert.equal(run.boss,null,'21 km e o fim da transição ainda precedem o encontro');
  for(let i=0;i<10&&!run.boss;i++)advance(run,rng);
  assert.ok(run.boss,'o encontro começa assim que a rota alcança 22 km');
  assert.ok(run.routeDistance>=22000&&run.routeDistance<22004);
  assert.equal(transition(run).active,false);
 }
});

test('campanha repete a ordem e reserva sete quilômetros depois de cada vitória',()=>{
 for(const random of [0,.999]){
  const run=isolatedRoute(),rng=()=>random,seen=[];
  run.routeDistance=21990;
  let previousBoss=null;
  for(let i=0;i<12000&&run.bossesDefeated<6;i++){
   advance(run,rng,.05);
   if(run.boss&&run.boss!==previousBoss){
    seen.push({type:run.boss.type,at:run.nextBossAt});
    assert.ok(run.routeDistance>=run.nextBossAt,'encontro nunca antecede o marco; pode esperar o chefe/transição anterior');
    assert.equal(transition(run).active,false);
   }
   previousBoss=run.boss;
  }
  assert.equal(run.bossesDefeated,6,'a sequência termina por desvios reais');
  assert.deepEqual(seen.map(s=>s.type),['haddad','lula','xandao','haddad','lula','xandao']);
  assert.equal(seen[0].at,22000);
  for(let i=1;i<seen.length;i++)assert.ok(seen[i].at-seen[i-1].at>=7000);
  assert.ok(run.nextBossAt>=run.routeDistance+7000-1e-7);
 }
});

for(const [type,total,goalKind,types,actions,objective] of [
 ['haddad',9,'papers',Array(9).fill('receipts'),['crouch','jump','jump','crouch','crouch','jump','crouch','jump','jump'],/9 papéis/],
 ['lula',10,'patterns',Array(10).fill('lhand'),['jump','crouch','jump','jump','crouch','crouch','jump','crouch','jump','crouch'],/10 gestos em L/],
 ['xandao',12,'hammer-mandado',['hammer','hammer','mandado','hammer','mandado','mandado','hammer','mandado','hammer','mandado','mandado','hammer'],['jump','jump','crouch','jump','crouch','crouch','jump','crouch','jump','crouch','crouch','jump'],/12 martelos e mandados/]
]){
 test(`${type} tem objetivo próprio e só termina após os ${total} ataques reais passarem`,()=>{
  const run=isolatedRoute(),attacks=[];
  run.bossBag=[type];run.nextBossAt=0;advance(run);
  assert.equal(run.boss.type,type,'a seleção explícita dos testes continua disponível');
  assert.equal(run.boss.total,total);
  assert.equal(run.boss.remaining,total);
  assert.equal(run.boss.goalKind,goalKind);
  assert.match(run.boss.objective,objective);
  for(let i=0;i<120*30&&run.boss;i++){
   advance(run);
   for(const attack of run.obstacles)if(attack.bossAttack&&!attacks.includes(attack))attacks.push(attack);
   const passed=attacks.filter(attack=>attack.x+attack.width<core.PLAYER.x).length;
   if(run.boss)assert.equal(run.boss.remaining,total-passed,'o aviso acompanha desvios, não disparos');
  }
  assert.equal(run.boss,null);
  assert.equal(run.bossesDefeated,1);
  assert.equal(attacks.length,total);
  assert.deepEqual(attacks.map(attack=>attack.type),types);
  assert.deepEqual(attacks.map(attack=>attack.action),actions);
  assert.ok(attacks.every(attack=>attack.x+attack.width<core.PLAYER.x),'o último ataque precisa passar inteiro');
  for(const round of [0,3,30]){
   const config=core.bossAtRound(round,type);
   assert.equal(config.attacks,total+2*Math.min(2,Math.floor(round/3)),'voltas aumentam a meta até quatro ataques extras');
   assert.equal(config.goalKind,goalKind);
   assert.ok(config.objective.includes(String(config.attacks)));
   assert.ok(config.interval>=1.04,'o ritmo preserva o novo limite seguro');
  }
 });
}

test('um encontro alcançado espera a transição sem pular seu marco',()=>{
 const run=isolatedRoute();run.routeDistance=21000;run.nextBossAt=21000;
 advance(run);
 assert.equal(run.boss,null);assert.equal(run.nextBossAt,21000);
 for(let i=0;i<120*4&&!run.boss;i++)advance(run);
 assert.equal(run.boss?.type,'haddad');
 assert.equal(run.nextBossAt,21000);
 assert.equal(transition(run).active,false);
});

test('um encontro alcançado espera Joice encerrar enquanto a rota continua',()=>{
 const run=isolatedRoute();run.routeDistance=23000;run.nextBossAt=22000;
 run.raid={phase:'recovery',remaining:.1,factIndex:0,id:1};
 advance(run);
 assert.equal(run.boss,null);assert.equal(run.nextBossAt,22000);
 assert.ok(run.routeDistance>23000);assert.ok(run.distance>0);
 for(let i=0;i<120*3&&!run.boss;i++)advance(run);
 assert.equal(run.boss?.type,'haddad');assert.equal(run.nextBossAt,22000);
});

test('marcos vencidos durante o intervalo de segurança continuam pendentes em ordem',()=>{
 const run=isolatedRoute();run.routeDistance=52000;run.nextBossAt=22000;run.bossCooldown=.2;
 advance(run);
 assert.equal(run.boss,null);assert.equal(run.nextBossAt,22000);
 for(let i=0;i<30&&!run.boss;i++)advance(run);
 assert.equal(run.boss?.type,'haddad');
 for(let i=0;i<120*30&&run.boss;i++)advance(run);
 assert.ok(run.nextBossAt>=run.routeDistance+7000-1e-7,'vitória abre trecho de corrida sem fila acumulada');
 assert.equal(run.boss,null);assert.ok(run.bossCooldown>0);
 const next=run.nextBossAt;for(let i=0;i<120*40&&!run.boss;i++)advance(run);
 assert.equal(run.boss?.type,'lula');assert.equal(run.nextBossAt,next);
});
