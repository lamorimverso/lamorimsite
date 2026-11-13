import test from 'node:test';
import assert from 'node:assert/strict';
import * as bosses from '../tanahoraflavio/runner-bosses.mjs';
import * as core from '../tanahoraflavio/runner-core.mjs';
import {standingEnemyPose,drawHoverEnemy} from '../tanahoraflavio/runner-boss-art.mjs';

// These fail if classes collapse to the same responses, or animated joints
// return a held key pose throughout an entire wind-up/release.
test('personagens de cada nível têm rotinas próprias e conservam seus poderes',()=>{
 const rows=[0,1,2,3].map(index=>bosses.storyBossAt(index));
 const signatures=rows.map(b=>Array.from({length:12},(_,i)=>bosses.arenaPatternFor({...b,maxHp:b.hp},i)).map(a=>a.action+'/'+a.type).join('|'));
 assert.equal(new Set(signatures).size,4);
 for(const b of rows)for(let i=0;i<12;i++)assert.ok(b.attackTypes.includes(bosses.arenaPatternFor(b,i).type));
});
test('gestos de preparação e disparo percorrem trajetórias e anunciam a resposta correta',()=>{
 for(const flags of [{preparing:true},{attacking:true},{recovering:true}]){
  const a=standingEnemyPose({...flags,progress:.1,phase:5}),b=standingEnemyPose({...flags,progress:.85,phase:5});
  assert.ok(Math.hypot(a.arms.left.hand.x-b.arms.left.hand.x,a.arms.left.hand.y-b.arms.left.hand.y)>5,'não pode segurar o mesmo quadro');
  for(const p of [a,b])assert.equal(p.left.foot.y,0);
 }
 const poses=['jump','crouch','move'].map(action=>standingEnemyPose({preparing:true,progress:.8,action,phase:5}).arms);
 assert.equal(new Set(poses.map(p=>JSON.stringify(p))).size,3,'gesto informa o padrão');
});
test('apresentação prepara cada munição pendente e não esconde outro lançamento real',()=>{
 assert.equal(typeof bosses.bossPresentationFor,'function');
 const b={phase:'attack',attackFlashFor:0,hitFlashFor:0,lastAction:'jump',telegraph:.9};
 const pending=[{bossAttack:true,projectile:true,waitFor:.5,action:'crouch'}];
 let p=bosses.bossPresentationFor(b,pending);assert.equal(p.preparing,true);assert.equal(p.action,'crouch');
 p=bosses.bossPresentationFor({...b,attackFlashFor:.2,lastAction:'crouch',lastReleasedAction:'jump'},pending);assert.equal(p.attacking,true);assert.equal(p.preparing,false);assert.equal(p.action,'jump');
});
function commands(type,phase,flags={}){
 const calls=[];return (()=>{const c=new Proxy({globalAlpha:1},{get(o,k){if(k in o)return o[k];return (...args)=>calls.push([k,...args]);},set(o,k,v){o[k]=v;calls.push([k,v]);return true;}});drawHoverEnemy(c,{type,x:150,y:180,phase,...flags});return calls;})();
}
test('Fantasma move a silhueta e os braços, preservando estabilidade de efeitos reduzidos',()=>{
 // Filter out the shared ship: the body above the deck must move too.
 const body=rows=>rows.filter(row=>row[0]==='rotate'||row[0]==='bezierCurveTo'||row[0]==='moveTo'&&row[2]<-30);
 assert.notDeepEqual(body(commands('meme-army',0)),body(commands('meme-army',8)));
 assert.deepEqual(commands('meme-army',0,{reducedMotion:true}),commands('meme-army',8,{reducedMotion:true}));
});
function runAt(distance){
 const r=core.createRun({mode:'story'});core.startRun(r);r.routeDistance=distance;r.distance=distance;
 r.nextRaid=r.nextPower=r.nextPassport=r.nextAllyAt=r.nextSupportAt=Infinity;r.nextBossAt=22000;r.nextObstacle=0;return r;
}
test('aproximação reserva um corredor sem novos perigos antes de cada chefe',()=>{
 for(const index of [0,3,4,19]){
  const r=runAt(bosses.nextStoryBossDistance(index)-300);r.bossesDefeated=index;r.nextBossAt=bosses.nextStoryBossDistance(index);
  core.advanceRun(r,1/120,()=>.5);assert.equal(r.obstacles.length,0,'não introduzir ameaça antes da entrada');
 }
});
test('ensaio da História usa a arma do próximo chefe, isolada e com prazo de reação',()=>{
 const r=runAt(21200);core.advanceRun(r,1/120,()=>.5);
 assert.equal(r.obstacles.length,1);assert.equal(r.obstacles[0].type,'barrier');
 assert.equal(r.obstacles[0].sourceActor,'pf');assert.equal(r.obstacles[0].rehearsal,true);
 assert.ok(core.threatTimeToContact(r,r.obstacles[0])>=.82);
 const count=r.spawnedObstacles;for(let i=0;i<25;i++){r.nextObstacle=0;core.advanceRun(r,1/120,()=>.5);}
 assert.equal(r.spawnedObstacles,count,'o ensaio não se repete a cada quadro');
});

test('Infinito conserva preparação antes do disparo mesmo sem munição reservada',()=>{
 const p=bosses.bossPresentationFor({combat:false,nextAttack:.3,fired:0,total:6,plannedAttack:{action:'jump'}},[]);
 assert.equal(p.preparing,true);assert.ok(p.progress>0&&p.progress<1);
});
test('recuperação conclui o gesto que saiu e não salta para a próxima ação',()=>{
 const p=bosses.bossPresentationFor({combat:true,phase:'recover',phaseFor:.6,recover:1.2,lastReleasedAction:'jump',plannedAttack:{action:'move'}},[]);
 assert.equal(p.recovering,true);assert.equal(p.action,'jump');
});

test('perigos comuns não ocupam a janela de ensaio nas etapas avançadas',()=>{
 for(const index of [8,12,19])for(let seed=1;seed<=100;seed++){
  const target=bosses.nextStoryBossDistance(index),r=core.createRun({mode:'story',seed});core.startRun(r);
  Object.assign(r,{bossesDefeated:index,routeDistance:target-1800,distance:target+index*5500,elapsed:index*40+15,nextBossAt:target,shieldFor:Infinity});
  for(const key of ['nextRaid','nextAllyAt','nextSupportAt','nextPower','nextPassport'])r[key]=Infinity;
  for(let i=0;i<1600&&!r.boss;i++)core.advanceRun(r,1/120);
  assert.equal(r.rehearsedBoss,'stage-'+Math.floor(index/4)+'-boss-'+index%4,'índice '+index+', semente '+seed);
 }
});
