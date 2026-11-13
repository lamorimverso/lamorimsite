import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
import * as bosses from '../tanahoraflavio/runner-bosses.mjs';
import * as art from '../tanahoraflavio/runner-art.mjs';
import {readFileSync} from 'node:fs';

const dt=1/120;
function scene(index=0){
 const r=core.createRun({mode:'story',seed:32});core.startRun(r);
 for(const k of ['nextRaid','nextObstacle','nextAllyAt','nextSupportAt','nextPower','nextPassport'])r[k]=Infinity;
 r.bossesDefeated=index;r.distance=r.routeDistance=bosses.nextStoryBossDistance(index);r.nextBossAt=0;r.shieldFor=Infinity;
 core.advanceRun(r,dt,()=>.5);return r;
}
test('campanha possui quatro encontros por cenário, classes e dificuldade crescente',()=>{
 const rows=Array.from({length:core.STORY_BOSS_COUNT},(_,i)=>bosses.storyBossAt(i));
 for(let stage=0;stage<core.STAGES.length;stage++){
  const group=rows.filter(b=>b.stageIndex===stage);assert.equal(group.length,4);
  assert.equal(new Set(group.map(b=>b.classId)).size,4);
  assert.ok(group.every((b,i)=>b.rank===i+1&&b.hp>0));
  assert.ok(group.every((b,i)=>i===0||b.hp>group[i-1].hp));
 }
 assert.equal(rows.at(-1).type,'meme-army');assert.match(rows.at(-1).name,/Fantasma do Comunismo/);
 assert.equal(bosses.storyBossAt(core.STORY_BOSS_COUNT),null);
 assert.equal(bosses.nextStoryBossDistance(0),22000);
 assert.equal(bosses.nextStoryBossDistance(3),27100);
 assert.equal(bosses.nextStoryBossDistance(4),29000);
});
test('sobreviver aos ataques não derrota um chefão da História',()=>{
 const r=scene();const distance=r.routeDistance;
 for(let i=0;i<120*35;i++)core.advanceRun(r,dt,()=>.5);
 assert.equal(r.bossesDefeated,0);assert.ok(r.boss.hp>0);
 assert.equal(r.routeDistance,distance,'arena fica no cenário do confronto');
 assert.ok(r.distance>distance,'corrida e relógio continuam ativos');
 assert.ok(r.boss.fired>0);
});
test('disparo real possui intervalo e acerta o chefe sem dano durante sua entrada',()=>{
 const r=scene();assert.equal(typeof core.attackRun,'function');
 assert.equal(core.attackRun(r),false,'entrada do chefe não aceita disparo');
 for(let i=0;i<160;i++)core.advanceRun(r,dt,()=>.5);
 const hp=r.boss.hp;assert.equal(core.attackRun(r),true);
 assert.equal(core.attackRun(r),false,'intervalo de tiro evita spam');
 assert.equal(r.heroShots.length,1);
 for(let i=0;i<160;i++)core.advanceRun(r,dt,()=>.5);
 assert.ok(r.boss.hp<hp,'é preciso existir colisão de tiro, não apenas animação');
});
test('atirar e esquivar vence encontros e a urna só abre depois do último',()=>{
 for(let index=0;index<core.STORY_BOSS_COUNT;index++){
  const r=scene(index);core.setAttackRun(r,true);
  for(let i=0;i<120*60&&r.bossesDefeated===index;i++)core.advanceRun(r,dt,()=>.5);
  assert.equal(r.bossesDefeated,index+1,'encontro '+index);
  assert.equal(r.boss,null);assert.equal(r.heroShots.length,0);
  assert.equal(r.status,index===core.STORY_BOSS_COUNT-1?'ballot':'running');
 }
});
test('resize da arena conserva combate e tiros; entrada reposiciona sem teleporte',()=>{
 const r=scene();r.player.x=820;
 const original=r.player.x;core.advanceRun(r,dt,()=>.5);
 assert.ok(original-r.player.x<3,'entrada deve aproximar suavemente');
 for(let i=0;i<180;i++)core.advanceRun(r,dt,()=>.5);
 assert.ok(r.player.x<=core.playerBounds(r).max);
 core.setAttackRun(r,true);core.advanceRun(r,.05,()=>.5);
 core.resizeRun(r,480);
 assert.ok(r.player.x<=core.playerBounds(r).max);assert.ok(r.heroShots.every(s=>Number.isFinite(s.x)&&Number.isFinite(s.vx)));
 const hp=r.boss.hp;
 for(let i=0;i<360&&r.boss;i++)core.advanceRun(r,dt,()=>.5);
 assert.ok(!r.boss||r.boss.hp<hp);
});
test('limpar comandos e reiniciar não mantém o disparo automático',()=>{
 const r=scene();core.setAttackRun(r,true);core.clearRunInput(r);
 assert.equal(r.player.attackHeld,false);
 for(let i=0;i<240;i++)core.advanceRun(r,dt,()=>.5);
 assert.equal(r.heroShots.length,0);
 const fresh=core.createRun({mode:'story'});assert.equal(fresh.player.attackHeld,false);assert.deepEqual(fresh.heroShots,[]);
});
test('artilheiro dispara rajadas e conjurador inclui queda com alvo marcado',()=>{
 const counts=[];
 for(const index of [0,1,2]){
  const r=scene(index);let drop=false;
  for(let i=0;i<120*28;i++){core.advanceRun(r,dt,()=>.5);drop ||=r.obstacles.some(o=>o.falling);}
  counts.push(r.boss.fired);
  if(index===2)assert.equal(drop,true,'classe conjuradora precisa exigir reposicionamento');
 }
 assert.ok(counts[1]>counts[0],'artilheiro deve ter rajadas distintas da sentinela');
});
test('anúncios da História usam a identidade e o objetivo real dos 24 encontros',()=>{
 for(let index=0;index<core.STORY_BOSS_COUNT;index++){
  const r=scene(index);
  assert.ok(r.event.includes(r.boss.name),'identidade '+index+': '+r.event);
  assert.ok(r.event.includes(r.boss.objective),'objetivo de combate '+index);
  assert.equal(r.event.startsWith('CHEFÃO FINAL'),index===core.STORY_BOSS_COUNT-1,'somente o último é final');
 }
 const r=scene();r.boss.hp=0;core.advanceRun(r,dt,()=>.5);
 assert.match(r.event,new RegExp('1/'+core.STORY_BOSS_COUNT));
});
test('bossFigure desenha o corpo na mesma posição atingida pelo tiro nos dois modos',()=>{
 const source=readFileSync(new URL('../tanahoraflavio/runner.mjs',import.meta.url),'utf8');
 const start=source.indexOf('  function bossFigure(){'),end=source.indexOf('  function character(){',start);
 const make=Function('env','const {run,ctx,virtualWidth,WORLD,STAGES,bossArenaPose,bossPresentationFor,enemyEmitterPose,enemyMotionFor,prefersReducedMotion,drawHoverEnemy,bossCue}=env;'+source.slice(start,end)+';return bossFigure;');
 for(const mode of ['story','endless'])for(const reduced of [true,false]){
  const r=core.createRun({mode});core.startRun(r);r.nextBossAt=0;r.nextRaid=Infinity;r.shieldFor=Infinity;
  core.advanceRun(r,dt,()=>.5);for(let i=0;i<160;i++)core.advanceRun(r,dt,()=>.5);
  const state={x:0,y:0},stack=[];let drawn;
  const ctx={save(){stack.push({...state});},restore(){Object.assign(state,stack.pop());},translate(x,y){state.x+=x;state.y+=y;},fillText(){}};
  const draw=make({run:r,ctx,STAGES:core.STAGES,virtualWidth:900,WORLD:core.WORLD,bossArenaPose:core.bossArenaPose,bossPresentationFor:bosses.bossPresentationFor,
   enemyEmitterPose:art.enemyEmitterPose,enemyMotionFor:art.enemyMotionFor,prefersReducedMotion:()=>reduced,
   drawHoverEnemy(c,args){drawn={x:state.x+args.x,y:state.y+args.y};},bossCue:()=>({action:'jump'})});
  draw();assert.equal(core.attackRun(r),true);
  const shot=r.heroShots.at(-1),heightAtBody=shot.y+(drawn.x-shot.x)*shot.vy/shot.vx;
  assert.ok(Math.abs((core.WORLD.ground-heightAtBody)-(drawn.y-48))<.001,mode+' mira fora do corpo');
 }
});
test('plataforma mantém posição estável quando os efeitos reduzidos estão ativos',()=>{
 assert.deepEqual(bosses.bossArenaPose({age:0,reducedMotion:true},480),bosses.bossArenaPose({age:99,reducedMotion:true},480));
});
