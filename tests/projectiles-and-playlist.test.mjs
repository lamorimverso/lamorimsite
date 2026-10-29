import test from 'node:test';
import assert from 'node:assert/strict';
import {createRun,startRun,advanceRun,jumpRun,crouchRun,PLAYER,SCENE_DISTANCE,scoreFor,difficultyAt} from '../tanahoraflavio/runner-core.mjs';

const step=(r,n)=>{for(let i=0;i<n&&r.status==='running';i++)advanceRun(r,1/120,()=>0);};
function bossRun(type='xandao'){
 const r=createRun();startRun(r);r.viewportWidth=480;r.nextRaid=Infinity;
 r.bossBag=[type];r.nextBossAt=0;
 advanceRun(r,1/120,()=>0);
 r.boss.nextShot=100;r.boss.nextAttack=0;
 advanceRun(r,1/120,()=>0);
 return r;
}
test('primeiro chefe só chega após 22 km, mesmo que a corrida já dure um minuto',()=>{
 const r=createRun();startRun(r);r.nextRaid=Infinity;r.nextObstacle=1e8;
 r.nextPassport=r.nextPower=r.nextPickup=1e8;r.shieldFor=100;
 advanceRun(r,1/120,()=>0);
 assert.equal(r.nextBossAt,22000);
 step(r,120*60);
 assert.ok(r.routeDistance<22000);
 assert.equal(r.boss,null,'o relógio sozinho não antecipa o marco de rota');
 step(r,120*25);
 assert.ok(r.boss||r.bossesDefeated>=1,'o chefão surge ao alcançar 22 km, mesmo se já foi vencido');
});
test('objeto sai da mão do chefão e viaja em linha reta até o Flávio',()=>{
 const r=bossRun(),shot=r.obstacles.at(-1);
 assert.ok(shot.bossAttack&&shot.projectile);
 assert.equal(shot.targetX,PLAYER.x+PLAYER.width/2);
 assert.equal(shot.targetY,PLAYER.height/2);
 assert.equal(shot.y,77);
 const initialX=shot.x;step(r,24);
 assert.ok(shot.x<initialX,'o disparo deve mover-se da direita para a esquerda');
 assert.ok(shot.y<77,'o ataque deve aproximar-se da altura real do jogador');
 const progress=(shot.launchX-(shot.x+shot.width/2))/(shot.launchX-shot.targetX);
 assert.ok(Math.abs(shot.y-(shot.launchY+(shot.targetY-shot.launchY)*progress))<.0001);
});
test('projétil acertando tira vida e derruba jogador desprotegido',()=>{
 const r=bossRun();step(r,120*2);
 assert.equal(r.status,'over');
 assert.equal(r.lives,0);
});
test('o salto depois do lançamento realmente evita o projétil direcionado',()=>{
 const r=bossRun(),first=r.obstacles[0];
 step(r,144);assert.equal(r.status,'running');
 assert.equal(jumpRun(r),true);
 step(r,120);
 assert.equal(r.status,'running');
 assert.ok(first.x+first.width<PLAYER.x,'a ameaça inteira passa antes de declarar o desvio');
 assert.equal(r.lastHit,null);
});
test('o Escudo das Américas protege contra projéteis sem dano',()=>{
 const r=bossRun();r.shieldFor=6;
 step(r,120*2);
 assert.equal(r.status,'running');
 assert.equal(r.lives,1);
});
test('sete quilômetros por cenário, velocidade cresce e score mede apenas metros',()=>{
 assert.equal(SCENE_DISTANCE,7000);
 const r=createRun();r.distance=4311.8;r.bonus=99999;
 assert.equal(scoreFor(r),4311,'coletas nunca alteram metros percorridos');
 const speeds=[0,3500,7000,14000,28000,50000].map(d=>difficultyAt(d).speed);
 assert.ok(speeds.every((v,i)=>i===0||v>speeds[i-1]));
 assert.ok(speeds.at(-1)<=435,'velocidade máxima ainda permite reação');
});
test('segurar Abaixar protege contra a mão em L do Lula, mas não contra martelo baixo',()=>{
 const high=bossRun('lula');assert.equal(crouchRun(high,true),true);
 assert.equal(high.player.crouching,true);
 step(high,120*1.9);
 assert.equal(high.status,'running');
 assert.equal(high.lives,1);
 const low=bossRun('xandao');crouchRun(low,true);
 step(low,120*1.4);
 assert.equal(low.status,'over','martelo baixo exige salto');
});
test('pular sai do agachamento sem permitir abaixar em pleno salto',()=>{
 const r=createRun();startRun(r);
 assert.equal(crouchRun(r,true),true);
 assert.equal(jumpRun(r),true);
 assert.equal(r.player.crouchHeld,true);assert.equal(r.player.crouching,false);
 assert.equal(crouchRun(r,false),false);
 assert.equal(jumpRun(r),false);
 assert.equal(crouchRun(r,true),false);
});
test('martelo e mandado alternam, e Lua usa a mão em L no alto',()=>{
 const x=bossRun('xandao');assert.equal(x.obstacles[0].type,'hammer');
 x.boss.nextAttack=0;advanceRun(x,1/120,()=>0);
 assert.equal(x.obstacles.at(-1).type,'mandado');
 assert.equal(x.obstacles.at(-1).targetY,70);
 const lula=bossRun('lula');assert.equal(lula.obstacles[0].type,'lhand');
 assert.equal(lula.obstacles[0].targetY,70);
});
