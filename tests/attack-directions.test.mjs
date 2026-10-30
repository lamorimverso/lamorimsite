import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
const dt=1/120;
const seeded=seed=>()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);
function running(width=900){
 const r=core.createRun();core.startRun(r);
 r.viewportWidth=width;r.shieldFor=Infinity;r.nextBossAt=r.nextRaid=r.nextAllyAt=Infinity;
 r.elapsed=80;r.distance=r.routeDistance=35000;return r;
}
const eta=o=>o.approach==='rear'
 ?(core.PLAYER.x+5-(o.x+o.width-3))/-o.speed
 :(o.x-(core.PLAYER.x+core.PLAYER.width-6))/o.speed;

test('a corrida combina ataques da frente, da retaguarda, por cima e rolantes sem padrão fixo',()=>{
 const signatures=[],styles=new Set();
 for(const [seed,width] of [[12,480],[53,900],[911,612]]){
  const r=running(width),rng=seeded(seed),observed=[];let n=0;
  for(let i=0;i<140/dt;i++){
   core.advanceRun(r,dt,rng);
   if(r.spawnedObstacles!==n){
    n=r.spawnedObstacles;const o=r.obstacles.at(-1);
    assert.ok(o);
    styles.add(o.approach||'overhead');observed.push(o.approach||'overhead');
    if(o.approach==='rear')assert.ok(o.speed<0&&o.x<core.PLAYER.x);
    if(o.approach==='drop')assert.ok(o.projectile&&o.launchY>o.targetY);
   }
  }
  signatures.push(observed.slice(0,25).join('|'));
 }
 for(const kind of ['rear','drop','rolling','front','overhead'])assert.ok(styles.has(kind),kind);
 assert.equal(new Set(signatures).size,3,'três partidas não repetem sequência de ataques');
});

test('cada contato mantém tempo de reação inclusive da retaguarda e em celular',()=>{
 for(const width of [480,612,900])for(const seed of [7,82,550]){
  const r=running(width),rng=seeded(seed);let previous=-Infinity,count=0;
  for(let i=0;i<100/dt;i++){
   core.advanceRun(r,dt,rng);
   if(r.spawnedObstacles<=count)continue;
   count=r.spawnedObstacles;const o=r.obstacles.at(-1),arrival=r.elapsed+eta(o);
   assert.ok(arrival-previous>=.81,`intervalo entre contatos: ${width} ${seed} ${arrival-previous} ${o.approach}`);
   previous=arrival;
  }
 }
});

test('inimigo da retaguarda pode ser pulado e é retirado depois de atravessar o herói',()=>{
 const r=running(480),rng=seeded(932);r.nextObstacle=0;
 let rear=null;
 for(let i=0;i<120*80&&!rear;i++){
  core.advanceRun(r,dt,rng);rear=r.obstacles.find(o=>o.approach==='rear');
 }
 assert.ok(rear);assert.ok(rear.speed<0);
 // Proteção de testes permite examinar todo o percurso sem interferência.
 for(let i=0;i<120*4;i++)core.advanceRun(r,dt,rng);
 assert.ok(!r.obstacles.includes(rear),'o perigo que passou não permanece na memória');
});

test('chefões improvisam depois da abertura, com aviso do ataque efetivamente programado',()=>{
 const combos=[];
 for(const type of ['haddad','lula','xandao']){
  for(const seed of [7,418]){
   const r=running(612);r.nextBossAt=0;r.bossBag=[type];r.shieldFor=Infinity;
   core.advanceRun(r,dt,seeded(seed));const boss=r.boss;
   assert.ok(boss);
   const rng=seeded(seed),attacks=[];
   for(let i=0;i<boss.total;i++){
    boss.nextAttack=0;
    core.advanceRun(r,dt,rng);
    const o=r.obstacles.at(-1);
    assert.ok(o?.bossAttack);
    attacks.push(o.action+'/'+o.approach+'/'+o.type);
    if(i<boss.total-1){
     assert.equal(boss.plannedFor,boss.fired);
     assert.ok(['jump','crouch'].includes(boss.plannedAttack.action));
    }
   }
   assert.ok(attacks.some(a=>a.startsWith('jump/'))&&attacks.some(a=>a.startsWith('crouch/')));
   assert.ok(new Set(attacks.slice(3).map(s=>s.split('/')[1])).size>=2,
     type+' deve variar a origem dos ataques após a apresentação');
   combos.push(attacks.join('|'));
  }
 }
 assert.ok(new Set(combos).size>=5,'sequência distinta por chefe e semente');
});

test('comandos repetidos não evitam os dois tipos de ataques após o aumento de pressão',()=>{
 const r=running(480),rng=seeded(741);r.shieldFor=0;r.nextPower=Infinity;
 for(let i=0;i<80/dt&&r.status==='running';i++){
  core.crouchRun(r,true);core.advanceRun(r,dt,rng);
 }
 assert.equal(r.status,'over','apenas abaixar não deve vencer a corrida');
});
