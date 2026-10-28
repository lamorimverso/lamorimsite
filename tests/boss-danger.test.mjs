import test from 'node:test';
import assert from 'node:assert/strict';
import {createRun,startRun,advanceRun} from '../tanahoraflavio/runner-core.mjs';
const running=()=>{const r=createRun();startRun(r);r.nextRaid=Infinity;return r;};
function bossRun(type='xandao',width=480){
 const r=running();r.viewportWidth=width;r.bossBag=[type];r.nextBossAt=0;
 advanceRun(r,1/120,()=>.5);return r;
}
test('ataque nasce junto ao chefão dentro da área visível em celular e desktop',()=>{
 for(const width of [480,620,900]){
  const r=bossRun('xandao',width);r.boss.nextAttack=0;advanceRun(r,1/120,()=>.5);
  const attack=r.obstacles.at(-1);assert.ok(attack.x>=width-145&&attack.x<=width-60,'origem coerente com a posição do chefão: '+attack.x);
 }
});
test('inimigos comuns também nascem na borda da área de jogo real',()=>{
 const r=running();r.viewportWidth=480;r.nextBossAt=Infinity;r.nextObstacle=0;advanceRun(r,1/120,()=>.5);
 assert.ok(r.obstacles[0].x>=480&&r.obstacles[0].x<=530);
});
test('chefão vivo continua atacando depois de sua primeira sequência',()=>{
 const r=bossRun();r.boss.health=r.boss.maxHealth=100;r.boss.nextShot=100;r.shieldFor=100;
 const initial=r.boss.total;for(let i=0;i<120*15;i++)advanceRun(r,1/120,()=>.5);
 assert.ok(r.boss.fired>initial,'o chefe não pode ficar inerte com vida');
});
test('todos os chefões conseguem atingir e derrotar jogador que não desvia',()=>{
 for(const type of ['xandao','haddad','lula']){
  const r=bossRun(type);for(let i=0;i<120*6&&r.status==='running';i++)advanceRun(r,1/120,()=>.5);
  assert.equal(r.status,'over',type+' deve representar perigo nos primeiros seis segundos');
 }
});
test('aviso precede um ataque real sem dano instantâneo no jogador',()=>{
 const r=bossRun('lula');assert.ok(r.boss.nextAttack>=1.2);assert.equal(r.obstacles.length,0);
 for(let i=0;i<120*.6;i++)advanceRun(r,1/120,()=>.5);assert.equal(r.status,'running');assert.equal(r.obstacles.length,0);
});
