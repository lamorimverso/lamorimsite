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
test('cada onda anuncia três ou quatro impactos escalonados e não acumula outra chuva simultânea',()=>{
 for(const age of [0,6])for(const width of [480,612,900])for(const edge of ['min','center','max']){
  const sample=newJacare(width,120,age),bounds=core.playerBounds(sample);
  sample.player.x=edge==='center'?(bounds.min+bounds.max)/2:bounds[edge];
  const group=core.spawnJacareVolley(sample,{rng:()=>.5});
  assert.equal(group.length,age===0?3:4);
  assert.ok(group.every(o=>o.owner==='pfizer'&&o.type==='pfizer-ampoule'));
  assert.ok(group.every(o=>o.age===0&&o.y===310&&o.warningFor>=.78&&o.fallFor<=.5));
  assert.ok(group.every((o,i)=>i===0||o.warningFor>group[i-1].warningFor));
  assert.deepEqual(core.spawnJacareVolley(sample,{rng:()=>.5}),[]);
 }
});
test('recuperação preserva o último aviso e impede uma nova onda na forma humana',()=>{
 const run=newJacare(480,240,6);run.shieldFor=Infinity;
 const wave=core.spawnJacareVolley(run,{rng:()=>.5});
 const other={x:600,width:40,height:40,type:'barrier',speed:45};run.obstacles.push(other);
 run.player.jacareAge=core.JACARE_RECOVERY_SECONDS-.1;
 step(run,.2);
 assert.equal(run.player.isJacare,false);
 assert.deepEqual(run.obstacles,[...wave,other]);
 assert.deepEqual(core.spawnJacareVolley(run,{rng:()=>0}),[]);
 step(run,2.5);
 assert.deepEqual(run.obstacles,[other]);
});
test('ondas consecutivas disparam no ponto atual, sem mudar os alvos já anunciados',()=>{
 const run=newJacare(480,240,6);run.shieldFor=Infinity;run.player.nextJacareThreat=0;
 step(run,.01);const first=run.obstacles.slice(),locations=first.map(o=>o.x),before=run.player.x;
 core.moveRun(run,1);step(run,.5);core.moveRun(run,0);assert.ok(run.player.x>before+70);
 assert.deepEqual(first.map(o=>o.x),locations);
 const firstFall=first.at(-1).warningFor+first.at(-1).fallFor;
 while(run.obstacles.every(o=>first.includes(o))&&run.elapsed<3)step(run,DT);
 const next=run.obstacles.find(o=>!first.includes(o));assert.ok(next);
 assert.ok(run.elapsed<firstFall+.52,'nova onda vem pouco depois da última queda');
 assert.ok(Math.abs(next.x+next.width/2-(run.player.x+17))<=25,'nova onda mira a posição já deslocada');
});
