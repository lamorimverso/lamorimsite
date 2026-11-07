import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
const DT=1/120;
function scene(width,position,age=6){
 const r=core.createRun();core.startRun(r);r.viewportWidth=width;
 const b=core.playerBounds(r);
 r.player.x=position==='min'?b.min:position==='max'?b.max:(b.min+b.max)/2;
 r.player.isJacare=true;r.player.jacareAge=age;
 for(const key of ['nextJacareThreat','nextBossAt','nextRaid','nextObstacle','nextAllyAt','nextSupportAt','nextPower','nextPassport','nextPickup']){if(key==='nextJacareThreat')r.player[key]=Infinity;else r[key]=Infinity;}
 return r;
}
function nearestSafe(run,group){
 const b=core.playerBounds(run),candidates=[];
 for(let x=b.min;x<=b.max;x++)if(group.every(o=>x+51<=o.x+3||x-15>=o.x+o.width-3))candidates.push(x);
 return candidates.sort((a,b)=>Math.abs(a-run.player.x)-Math.abs(b-run.player.x))[0]??null;
}
test('3.600 combinações: dispersão, avisos, corredores e reprodutibilidade',()=>{
 const combinations=new Set();
 for(const width of [480,612,900])for(const edge of ['min','center','max'])for(let seed=1;seed<=400;seed++){
  const run=scene(width,edge),rng=core.createSeededRandom(seed),group=core.spawnJacareVolley(run,{rng});
  assert.ok(group.length>=2&&group.length<=3);
  assert.ok(group.every(o=>o.x>=0&&o.x+o.width<=width&&o.warningFor>=1.2));
  const ordered=group.slice().sort((a,b)=>a.x-b.x);
  for(let i=1;i<ordered.length;i++)assert.ok(ordered[i].x-ordered[i-1].x>=150,'alvos pareados');
  for(let i=1;i<group.length;i++)assert.ok(group[i].warningFor>group[i-1].warningFor,'impactos sincronizados');
  const destination=nearestSafe(run,group);
  assert.notEqual(destination,null,'corredor bloqueado');
  assert.ok(Math.abs(destination-run.player.x)/230<group[0].warningFor,'corredor inacessível antes da queda');
  combinations.add(group.map(o=>o.x+':'+o.warningFor.toFixed(2)).join('|')+'/'+width+'/'+edge);
 }
 assert.ok(combinations.size>3200,'disposições muito repetitivas');
});
test('deslocamento lateral real evita chuvas aleatórias sem escudo e sem teleporte',()=>{
 for(const width of [480,612,900])for(const edge of ['min','center','max'])for(const seed of [1,7,19,103,8801]){
  const run=scene(width,edge),group=core.spawnJacareVolley(run,{rng:core.createSeededRandom(seed)});
  const dest=nearestSafe(run,group);
  assert.notEqual(dest,null);
  const dir=Math.sign(dest-run.player.x);core.moveRun(run,dir);
  for(let i=0;i<360&&run.status==='running';i++){
   if(dir>0&&run.player.x>=dest||dir<0&&run.player.x<=dest)core.moveRun(run,0);
   core.advanceRun(run,DT,()=>.5);
  }
  assert.equal(run.status,'running',width+'/'+edge+'/'+seed+' '+JSON.stringify(run.lastHit));
  assert.equal(run.lives,1);
 }
});
test('alvos repetem por semente e não iniciam onda concorrente ou fora do jacaré',()=>{
 const a=scene(612,'center'),b=scene(612,'center');
 assert.deepEqual(core.spawnJacareVolley(a,{rng:core.createSeededRandom(2026)}),core.spawnJacareVolley(b,{rng:core.createSeededRandom(2026)}));
 assert.deepEqual(core.spawnJacareVolley(a,{rng:core.createSeededRandom(7)}),[]);
 a.player.isJacare=false;
 assert.deepEqual(core.spawnJacareVolley(a,{rng:core.createSeededRandom(8)}),[]);
});
