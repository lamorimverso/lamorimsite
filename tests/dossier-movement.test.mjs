import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
const dt=1/120;
function isolated(){const r=core.createRun();core.startRun(r);for(const k of ['nextBossAt','nextRaid','nextObstacle','nextAllyAt','nextPower','nextPassport','nextPickup'])r[k]=Infinity;return r;}
const step=(r,seconds)=>{for(let i=0;i<Math.ceil(seconds/dt)&&r.status==='running';i++)core.advanceRun(r,dt,()=>.5);};

test('posição lateral responde ao comando e para ao soltar sem alterar os metros',()=>{
 const r=isolated(),control=isolated();assert.equal(r.player.x,120);assert.equal(typeof core.moveRun,'function');
 core.moveRun(r,1);step(r,.4);step(control,.4);assert.ok(r.player.x>205&&r.player.x<220);assert.equal(r.distance,control.distance);
 core.moveRun(r,0);const x=r.player.x;step(r,.2);assert.equal(r.player.x,x);
 core.moveRun(r,-1);step(r,3);assert.equal(r.player.x,70);core.moveRun(r,1);step(r,3);assert.equal(r.player.x,280);
 core.moveRun(r,NaN);const held=r.player.x;step(r,.1);assert.equal(r.player.x,held,'entrada inválida não prende direção');
});
test('lateral coexiste com salto e intenção de abaixar, e clear limpa todos os comandos',()=>{
 const r=isolated();assert.equal(typeof core.moveRun,'function');core.moveRun(r,1);core.jumpRun(r);core.crouchRun(r,true);step(r,.2);
 assert.ok(r.player.x>160&&r.player.y>0);assert.equal(r.player.crouching,false);step(r,.6);assert.equal(r.player.crouching,true);
 core.clearRunInput(r);const x=r.player.x;step(r,.2);assert.equal(r.player.x,x);assert.equal(r.player.crouching,false);
});
test('coleta e colisão acompanham a posição real fora da coluna original',()=>{
 const r=isolated();r.player.x=240;r.pickups=[{type:'passport',x:257,y:20,speed:0}];core.advanceRun(r,dt);assert.equal(r.passports,1);
 r.obstacles=[{x:245,width:30,height:44,type:'barrier',speed:0}];core.advanceRun(r,dt);assert.equal(r.status,'over');
 const safe=isolated();safe.player.x=240;safe.obstacles=[{x:120,width:30,height:44,type:'barrier',speed:0}];core.advanceRun(safe,dt);assert.equal(safe.status,'running');
});
test('recuar depois de uma evasão não ressuscita o perigo já ultrapassado',()=>{
 const r=isolated();r.player.x=240;r.obstacles=[{x:180,width:30,height:44,type:'barrier',speed:140}];core.advanceRun(r,dt);
 assert.equal(typeof core.moveRun,'function');core.moveRun(r,-1);step(r,.7);assert.equal(r.status,'running');
});
test('a margem real da hitbox encerrada também permanece evadida ao recuar',()=>{
 const r=isolated();r.player.x=280;r.obstacles=[{x:241,width:46,height:72,type:'microphone',speed:180,projectile:true,y:84,launchY:84,targetY:84,launchX:543,targetX:297}];
 core.advanceRun(r,dt);core.moveRun(r,-1);step(r,.3);assert.equal(r.status,'running','não revive contato cujo recorte físico já passou');
});
test('queda avisa sem dano antes de cair e acerta quem permanece no alvo',()=>{
 const r=isolated();assert.equal(typeof core.spawnFallingThreat,'function');const o=core.spawnFallingThreat(r);assert.ok(o);
 r.player.x=o.x+o.width/2-17;step(r,1.19);assert.equal(r.status,'running');step(r,.5);assert.equal(r.status,'over');assert.equal(r.lastHit.action,'move');
});
test('a mesma queda permite duas fugas laterais com comandos reais e alvo comprometido',()=>{
 for(const direction of [-1,1]){
  const r=isolated();r.player.x=175;assert.equal(typeof core.spawnFallingThreat,'function');const o=core.spawnFallingThreat(r),target=o.x;
  core.moveRun(r,direction);step(r,1.9);assert.equal(r.status,'running');assert.equal(o.x,target,'a queda não persegue após seu aviso');assert.ok(!r.obstacles.includes(o));
 }
});
test('resize preserva prazo de chegada e alvo de queda com o herói deslocado',()=>{
 const r=isolated();r.player.x=230;r.obstacles=[{x:600,width:40,height:40,type:'barrier',speed:250}];
 const before=(600-(230+28))/250;core.resizeRun(r,480);const o=r.obstacles[0];assert.ok(Math.abs(core.threatTimeToContact(r,o)-before)<1e-9);
 assert.equal(typeof core.spawnFallingThreat,'function');const drop=core.spawnFallingThreat(r),x=drop.x;step(r,.3);core.resizeRun(r,900);assert.equal(drop.x,x);assert.ok(drop.age>=.3-1e-8);
});
test('resize estreito conserva prazo sem tornar a travessia lenta demais para saltar',()=>{
 const r=isolated();r.player.x=230;r.obstacles=[{x:400,width:44,height:36,type:'barrier',speed:220}];
 const before=core.threatTimeToContact(r,r.obstacles[0]);core.resizeRun(r,480);
 assert.ok(r.obstacles[0].speed>=180);assert.ok(Math.abs(core.threatTimeToContact(r,r.obstacles[0])-before)<1e-9);assert.ok(r.obstacles[0].waitFor>0);
});
