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
test('7.200 combinações: ampolas fecham saídas próximas sem bloquear o último corredor',()=>{
 const combinations=new Set();
 for(const age of [0,7])for(const width of [480,612,900])for(const edge of ['min','center','max'])for(let seed=1;seed<=400;seed++){
  const run=scene(width,edge,age),rng=core.createSeededRandom(seed),group=core.spawnJacareVolley(run,{rng});
  assert.equal(group.length,age===0?3:4);
  assert.ok(group.every(o=>o.x>=0&&o.x+o.width<=width&&o.warningFor>=.78));
  const ordered=group.slice().sort((a,b)=>a.x-b.x);
  for(let i=1;i<ordered.length;i++)assert.ok(ordered[i].x-ordered[i-1].x>=58,'alvos sobrepostos');
  for(let i=1;i<group.length;i++)assert.ok(group[i].warningFor>group[i-1].warningFor,'impactos sincronizados');
  const destination=nearestSafe(run,group);
  assert.notEqual(destination,null,'corredor bloqueado');
  const displacement=Math.abs(destination-run.player.x);
  assert.ok(displacement>=90,'uma esquiva mínima de poucos pixels não deve bastar');
  assert.ok(.30+displacement/230<group[0].warningFor+.65*group[0].fallFor,'corredor inacessível após perceber a marca');
  combinations.add(group.map(o=>o.x+':'+o.warningFor.toFixed(2)).join('|')+'/'+width+'/'+edge);
 }
 assert.ok(combinations.size>3200,'disposições muito repetitivas');
});
test('deslocamento lateral real evita chuvas aleatórias sem escudo e sem teleporte',()=>{
 for(const age of [0,7])for(const width of [480,612,900])for(const edge of ['min','center','max'])for(const seed of [1,7,19,103,8801]){
  const run=scene(width,edge,age),group=core.spawnJacareVolley(run,{rng:core.createSeededRandom(seed)});
  for(let i=0;i<36;i++)core.advanceRun(run,DT,()=>.5);
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

test('reduzir a janela não corta o último corredor anunciado',()=>{
 const run=scene(510,'center',7),b=core.playerBounds(run);
 run.player.x=b.min+.15*(b.max-b.min);
 const group=core.spawnJacareVolley(run,{rng:core.createSeededRandom(6)});
 core.resizeRun(run,480);
 core.moveRun(run,-1);
 for(let i=0;i<36;i++)core.advanceRun(run,DT,()=>.5);
 const destination=nearestSafe(run,group);
 assert.notEqual(destination,null,'a pista menor ainda tem uma saída conjunta');
 const dir=Math.sign(destination-run.player.x);core.moveRun(run,dir);
 for(let i=0;i<280&&run.status==='running';i++){
  if(dir>0&&run.player.x>=destination||dir<0&&run.player.x<=destination)core.moveRun(run,0);
  core.advanceRun(run,DT,()=>.5);
 }
 assert.equal(run.status,'running','o jogador teve uma saída sem escudo mesmo após redimensionar');
});
