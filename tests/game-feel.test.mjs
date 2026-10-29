import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';

const DT=.01;
function running(){
 const run=core.createRun();core.startRun(run);
 run.nextObstacle=run.nextBossAt=run.nextRaid=Infinity;
 return run;
}
function frames(run,count){for(let i=0;i<count;i++)core.advanceRun(run,DT,()=>.5);}
function descendingAt(frame){
 const run=running();assert.equal(core.jumpRun(run),true);frames(run,frame);
 assert.ok(run.player.y>0&&run.player.velocity<0,'o primeiro salto ainda está descendo');
 return run;
}

test('salto solicitado 70ms antes do pouso espera o chão e salta ao aterrissar',()=>{
 const run=descendingAt(62),{y,velocity}=run.player;
 assert.equal(core.jumpRun(run),false,'o retorno só indica salto imediato');
 assert.equal(run.player.y,y);assert.equal(run.player.velocity,velocity,'não há salto duplo');
 frames(run,6);assert.ok(run.player.y>0&&run.player.velocity<0);
 frames(run,1);assert.equal(run.player.y,0);assert.equal(run.player.velocity,610);
 frames(run,1);assert.ok(run.player.y>0);
});

test('a intenção de salto continua válida no limite de 120ms até o pouso',()=>{
 const run=descendingAt(57);assert.equal(core.jumpRun(run),false);
 frames(run,12);assert.equal(run.player.y,0);assert.equal(run.player.velocity,610);
});

test('salto solicitado 130ms antes do pouso já expirou',()=>{
 const run=descendingAt(56);assert.equal(core.jumpRun(run),false);
 frames(run,13);assert.equal(run.player.y,0);assert.equal(run.player.velocity,0);
});

test('salto solicitado 250ms antes do pouso não fica guardado',()=>{
 const run=descendingAt(44);assert.equal(core.jumpRun(run),false);
 frames(run,25);assert.equal(run.player.y,0);assert.equal(run.player.velocity,0);
 frames(run,80);assert.equal(run.player.y,0);assert.equal(run.player.velocity,0);
});

test('cada pressão guardada produz apenas um salto e não repete ao próximo pouso',()=>{
 const run=descendingAt(62);core.jumpRun(run);frames(run,7);
 assert.equal(run.player.velocity,610,'a pressão pendente foi consumida no primeiro pouso');
 frames(run,69);assert.equal(run.player.y,0);assert.equal(run.player.velocity,0);
 frames(run,70);assert.equal(run.player.y,0);assert.equal(run.player.velocity,0);
});

test('pular enquanto abaixado levanta e preserva a intenção de abaixar no pouso',()=>{
 const run=running();assert.equal(core.crouchRun(run,true),true);
 assert.equal(core.jumpRun(run),true);
 assert.equal(run.player.crouching,false);assert.equal(run.player.crouchHeld,true);
 frames(run,1);assert.ok(run.player.y>0);assert.equal(run.player.crouching,false);
 frames(run,68);assert.equal(run.player.y,0);assert.equal(run.player.crouching,true);
});

test('salto guardado também sai da postura ao pousar e só abaixa no pouso seguinte',()=>{
 const run=descendingAt(62);core.crouchRun(run,true);core.jumpRun(run);frames(run,7);
 assert.equal(run.player.velocity,610);assert.equal(run.player.crouching,false);
 assert.equal(run.player.crouchHeld,true);
 frames(run,69);assert.equal(run.player.y,0);assert.equal(run.player.crouching,true);
});

test('limpar entradas cancela salto e agachamento pendentes sem mudar a física no ar',()=>{
 assert.equal(typeof core.clearRunInput,'function');
 const run=descendingAt(62);core.crouchRun(run,true);core.jumpRun(run);
 const {y,velocity}=run.player;core.clearRunInput(run);
 assert.equal(run.player.y,y);assert.equal(run.player.velocity,velocity);
 assert.equal(run.player.crouchHeld,false);assert.equal(run.player.crouching,false);
 frames(run,8);assert.equal(run.player.y,0);assert.equal(run.player.velocity,0);
 assert.equal(run.player.crouching,false);
});

test('limpar entradas remove postura mantida mesmo fora do estado running',()=>{
 assert.equal(typeof core.clearRunInput,'function');
 for(const status of ['ready','running','paused','over']){
  const run=running();core.crouchRun(run,true);run.status=status;
  core.clearRunInput(run);
  assert.equal(run.player.crouchHeld,false,status);assert.equal(run.player.crouching,false,status);
  assert.equal(run.status,status);
 }
});

test('reiniciar não herda salto pendente nem intenção de abaixar da corrida anterior',()=>{
 const previous=descendingAt(62);core.jumpRun(previous);core.crouchRun(previous,true);
 const run=running();frames(run,100);
 assert.equal(run.player.y,0);assert.equal(run.player.velocity,0);
 assert.equal(run.player.crouchHeld,false);assert.equal(run.player.crouching,false);
});

test('pedido fora da corrida ativa não deixa salto guardado para o retorno',()=>{
 for(const status of ['ready','paused','over']){
  const run=descendingAt(62);run.status=status;
  assert.equal(core.jumpRun(run),false,status);run.status='running';frames(run,7);
  assert.equal(run.player.y,0,status);assert.equal(run.player.velocity,0,status);
 }
});
