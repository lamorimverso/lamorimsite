import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';

const DT=1/120;
function newJacare(width,x,age=3.1){
 const run=core.createRun();core.startRun(run);
 run.viewportWidth=width;
 run.player.x=x;run.player.isJacare=true;run.player.jacareAge=age;run.player.nextJacareThreat=Infinity;
 run.nextBossAt=run.nextRaid=run.nextObstacle=run.nextAllyAt=run.nextSupportAt=Infinity;
 return run;
}
function step(run,seconds){
 for(let i=0;i<Math.ceil(seconds/DT)&&run.status==='running';i++)core.advanceRun(run,DT,()=>.5);
}
test('jacaré mostra duas ampolas dispersas em celular e desktop, com tempos distintos',()=>{
 for(const width of [480,612,900])for(const edge of ['min','center','max']){
  const sample=newJacare(width,120),bounds=core.playerBounds(sample);
  sample.player.x=edge==='center'?(bounds.min+bounds.max)/2:bounds[edge];
  const group=core.spawnJacareVolley(sample,{rng:()=>.5});
  assert.equal(group.length,2,`${width} ${edge}: duas ampolas no mesmo momento`);
  assert.equal(sample.obstacles.length,2);
  assert.ok(group.every(o=>o.owner==='pfizer'&&o.type==='pfizer-ampoule'));
  assert.ok(group.every(o=>o.age===0&&o.y===310&&o.warningFor>=1.2));
  assert.ok(group.every(o=>o.x>=0&&o.x+o.width<=width));
  assert.ok(Math.abs(group[0].x-group[1].x)>=150);
  assert.ok(group[1].warningFor-group[0].warningFor>=.34,'as ampolas caem em momentos diferentes');
  assert.deepEqual(core.spawnJacareVolley(sample,{rng:()=>.5}),[],'aguardar a primeira onda terminar');
 }
});
test('perto do fim da transformação surgem três ampolas com corredores livres',()=>{
 const run=newJacare(480,240,6);
 const group=core.spawnJacareVolley(run,{rng:()=>.5});
 assert.equal(group.length,3,'o volume cresce dentro dos dez segundos');
 assert.ok(group.some(o=>o.x<group[0].x));
 assert.ok(group.some(o=>o.x>group[0].x));
 const ordered=group.slice().sort((a,b)=>a.x-b.x);
 for(let i=1;i<ordered.length;i++)assert.ok(ordered[i].x-ordered[i-1].x>=150,'corredor de evasão');
 assert.ok(group[1].warningFor>group[0].warningFor&&group[2].warningFor>group[1].warningFor,'ordem temporal escalonada');
 run.graceFor=0;
 core.moveRun(run,-1);
 step(run,.35);
 core.moveRun(run,0);
 step(run,1.9);
 assert.equal(run.status,'running','o jogador pode chegar ao corredor sem teleporte ou escudo');
 assert.equal(run.lives,1);
});
test('nenhuma nova saraivada acontece após recuperar a forma humana',()=>{
 const run=newJacare(480,240,9.99);
 run.shieldFor=Infinity;run.player.nextJacareThreat=0;
 step(run,.03);
 assert.equal(run.player.isJacare,false);
 assert.deepEqual(core.spawnJacareVolley(run,{rng:()=>0}),[]);
 assert.equal(run.obstacles.filter(o=>o.owner==='pfizer').length,0);
});
