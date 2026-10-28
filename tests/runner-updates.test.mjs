import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
const running=()=>{const r=core.createRun();core.startRun(r);return r;};
const seeded=seed=>()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);
function step(r,seconds,rng=()=>.5){for(let i=0;i<Math.ceil(seconds*120)&&r.status==='running';i++)core.advanceRun(r,1/120,rng);}
const collect=(r,type)=>{r.pickups.push({x:136,y:35,type,value:0});core.advanceRun(r,1/120,()=>.5);};
const collide=r=>r.obstacles.push({x:125,width:34,height:44,type:'pf'});
function triggerBoss(r,type='xandao',rng=()=>.5){
 r.bossBag=[type];r.nextBossAt=r.routeDistance;r.bossCooldown=0;
 core.advanceRun(r,1/120,rng);
 assert.ok(r.boss,'chefão deve aparecer pelo percurso');
}
test('Escudo das Américas protege de obstáculo sem gastar a vida',()=>{
 const r=running();collide(r);collect(r,'shield');
 assert.equal(r.status,'running');assert.equal(r.lives,1);assert.equal(r.shieldFor,6);
});
test('o escudo termina depois de 6 segundos',()=>{
 const r=running();collect(r,'shield');r.obstacles=[];r.nextObstacle=100;
 step(r,6.1);assert.equal(r.shieldFor,0);collide(r);
 core.advanceRun(r,1/120);assert.equal(r.status,'over');
});
test('100 passaportes ainda concedem uma vida e protegem no mesmo frame',()=>{
 const r=running();r.passports=99;collide(r);collect(r,'passport');
 assert.equal(r.status,'running');assert.equal(r.passports,100);assert.equal(r.lives,1);
 r.obstacles=[];collect(r,'passport');assert.equal(r.lives,1);
});
test('pista gera apenas passaportes e escudos úteis, sem armas do protagonista',()=>{
 const r=running(),rng=seeded(54),types=new Set();r.nextBossAt=Infinity;r.nextRaid=Infinity;
 for(let i=0;i<120*100;i++){core.advanceRun(r,1/120,rng);
  r.pickups.forEach(p=>types.add(p.type));
  r.obstacles=r.obstacles.filter(o=>o.x>250);r.pickups=r.pickups.filter(p=>p.x>250);
 }
 assert.deepEqual([...types].sort(),['passport','shield']);
 assert.equal('shots' in r,false);assert.equal('bibleCharges' in r,false);
});
test('chefões são sorteados sem repetição entre grupos de três',()=>{
 const rng=seeded(7),r=running(),seen=[];
 for(let i=0;i<6;i++){
  r.nextBossAt=r.routeDistance;r.bossCooldown=0;core.advanceRun(r,1/120,rng);
  assert.ok(r.boss);seen.push(r.boss.type);
  r.boss.fired=r.boss.total;r.boss.remaining=0;r.obstacles=[];
  core.advanceRun(r,1/120,rng);assert.equal(r.boss,null);
 }
 assert.deepEqual(seen.slice(0,3).sort(),['haddad','lula','xandao']);
 assert.deepEqual(seen.slice(3,6).sort(),['haddad','lula','xandao']);
 assert.notEqual(seen[2],seen[3]);
});
test('a distância cresce enquanto a rota espera o chefão e o protagonista não atira',()=>{
 const r=running();triggerBoss(r);r.boss.nextAttack=100;const route=r.routeDistance,start=r.distance;
 step(r,.2);
 assert.equal(r.routeDistance,route);
 assert.ok(core.scoreFor(r)>start);
 assert.equal(r.boss.total,4);
 assert.equal('shots' in r,false);
});
test('Xandão usa martelo e mandado, Lula gesto em L e Haddad papéis',()=>{
 for(const [type,first,second] of [['xandao','hammer','mandado'],['lula','lhand','lhand'],['haddad','receipts','receipts']]){
  const r=running();triggerBoss(r,type);r.boss.nextAttack=0;
  core.advanceRun(r,1/120,()=>.5);
  assert.equal(r.obstacles.at(-1).type,first);
  assert.ok(r.obstacles.at(-1).projectile);
  r.boss.nextAttack=0;core.advanceRun(r,1/120,()=>.5);
  assert.equal(r.obstacles.at(-1).type,second);
 }
});
test('chefão termina depois que todos os ataques são superados, sem vida/tiros próprios',()=>{
 const r=running();triggerBoss(r,'lula');r.shieldFor=100;
 r.boss.nextAttack=0;step(r,28);
 assert.equal(r.status,'running');assert.equal(r.bossesDefeated,1);
 assert.equal(r.boss,null);
});
test('ganho de pontos independe de coletas e não antecipa o chefão',()=>{
 const r=running();r.bonus=99999;r.nextBossAt=4000;
 core.advanceRun(r,.01,()=>.5);assert.equal(r.boss,null);
 assert.equal(core.scoreFor(r),Math.floor(r.distance));
});
test('Joice avisa por dois segundos e intensifica perseguição por oito',()=>{
 const r=running();r.nextRaid=0;r.nextBossAt=Infinity;core.advanceRun(r,1/120,()=>.5);
 assert.equal(r.raid.phase,'warning');assert.equal(r.raid.remaining,2);r.shieldFor=50;
 step(r,2.02);assert.equal(r.raid.phase,'active');
 step(r,8.02);assert.equal(r.raid.phase,'recovery');
 step(r,2.02);assert.equal(r.raid,null);assert.ok(r.nextRaid>=35);
});
test('ondas da PF no evento preservam intervalo mínimo de reação',()=>{
 const a=running(),b=running();a.nextBossAt=b.nextBossAt=Infinity;a.nextRaid=b.nextRaid=Infinity;
 b.raid={phase:'active',remaining:8,factIndex:0,id:1};a.nextObstacle=b.nextObstacle=0;
 core.advanceRun(a,1/120,()=>.5);core.advanceRun(b,1/120,()=>.5);
 assert.equal(b.obstacles[0].type,'pf');assert.ok(b.nextObstacle<a.nextObstacle);assert.ok(b.nextObstacle>=1.15);
});
test('Joice não começa durante chefão ou transição de cenário',()=>{
 const b=running();triggerBoss(b);b.nextRaid=0;core.advanceRun(b,.01,()=>.5);assert.equal(b.raid,null);
 const t=running();t.routeDistance=core.SCENE_DISTANCE-80;t.nextBossAt=Infinity;t.nextRaid=0;
 core.advanceRun(t,.01,()=>.5);assert.equal(t.raid,null);
});
test('suspensão não avança os controles, o escudo ou o percurso',()=>{
 const r=running();r.shieldFor=5;r.player.crouching=true;core.togglePause(r);
 const saved=structuredClone(r);step(r,2);assert.deepEqual(r,saved);
});
test('chefões não entram nas ondas normais de polícia e obstáculos',()=>{
 const r=running();r.routeDistance=22000;r.nextRaid=r.nextBossAt=Infinity;r.nextObstacle=0;
 core.advanceRun(r,1/120,()=>.7);
 assert.ok(r.obstacles.length>0);
 assert.ok(!['xandao','haddad','lula'].includes(r.obstacles[0].type));
});
