import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
import * as bosses from '../tanahoraflavio/runner-bosses.mjs';
import * as art from '../tanahoraflavio/runner-art.mjs';
import {readFileSync} from 'node:fs';
import {pilotCounter} from '../tools/story-pilot.mjs';
import {combatGeometryFor} from '../tanahoraflavio/runner-combat-geometry.mjs';
import {campaignAccentFor} from '../tanahoraflavio/runner-campaign-art.mjs';

const dt=1/120;
function scene(index=0){
 const r=core.createRun({mode:'story',seed:32});core.startRun(r);
 for(const k of ['nextRaid','nextObstacle','nextAllyAt','nextSupportAt','nextPower','nextPassport'])r[k]=Infinity;
 r.bossesDefeated=index;r.distance=r.routeDistance=bosses.nextStoryBossDistance(index);r.nextBossAt=0;r.shieldFor=Infinity;
 core.advanceRun(r,dt,()=>.5);return r;
}
test('campanha exige um subchefe e um chefe por mapa, com travessia extra antes do final',()=>{
 const rows=Array.from({length:core.STORY_BOSS_COUNT},(_,i)=>bosses.storyBossAt(i));
 assert.equal(rows.length,17);
 for(let stage=0;stage<core.STORY_STAGES.length;stage++){
  const group=rows.filter(b=>b.stageIndex===stage);
  assert.deepEqual(group.map(b=>b.role),stage===7?['traversal','subboss','final-boss']:['subboss','map-boss']);
  assert.ok(group.every((b,i)=>i===0||b.hp>group[i-1].hp));
 }
 assert.deepEqual(rows.slice(13).map(b=>b.type),['meme-army','povo','janones','lula']);
 assert.deepEqual(rows.filter(b=>b.traversal).map(b=>b.type),['fiscal','povo']);
 assert.ok(rows.every(b=>b.type!=='bossonari'));
 assert.equal(bosses.storyBossAt(core.STORY_BOSS_COUNT),null);
});
test('sobreviver aos ataques não derrota um chefão da História',()=>{
 const r=scene();const distance=r.routeDistance,physical=r.distance;
 for(let i=0;i<120*35;i++)core.advanceRun(r,dt,()=>.5);
 assert.equal(r.bossesDefeated,0);assert.ok(r.boss.hp>0);
 assert.equal(r.routeDistance,distance,'arena fica no cenário do confronto');
 assert.equal(r.distance,physical,'a arena interrompe o deslocamento físico');
 assert.ok(r.elapsed>35,'o relógio do combate continua ativo');
 assert.ok(r.boss.fired>0);
});
test('disparo real possui intervalo e rebate um projétil, sem aceitar tiro durante a entrada',()=>{
 const r=scene(1);assert.equal(typeof core.attackRun,'function');
 assert.equal(core.attackRun(r),false,'entrada do chefe não aceita disparo');
 for(let i=0;i<120*4&&!r.obstacles.some(core.isHostileProjectile);i++)core.advanceRun(r,dt,()=>.5);
 assert.ok(r.obstacles.some(core.isHostileProjectile));
 const hp=r.boss.hp;assert.equal(core.attackRun(r),true);
 assert.equal(core.attackRun(r),false,'intervalo de tiro evita spam');
 assert.equal(r.heroShots.length,1);
 for(let i=0;i<160;i++)core.advanceRun(r,dt,()=>.5);
 assert.ok(r.boss.hp<hp,'o projétil devolvido atinge o chefe');
});
test('atirar e esquivar vence encontros e a urna só abre depois do último',()=>{
 for(let index=0;index<core.STORY_BOSS_COUNT;index++){
  const r=scene(index);r.shieldFor=0;
  for(let i=0;i<120*100&&r.status==='running'&&r.bossesDefeated===index;i++){pilotCounter(r);core.advanceRun(r,dt,()=>.5);}
  assert.equal(r.bossesDefeated,index+1,'encontro '+index);
  if(index===8||index===14){assert.equal(r.shotsFired,0);assert.deepEqual(r.ownedPowers,['ivermectina']);}
  assert.equal(r.boss,null);assert.equal(r.heroShots.length,0);
  assert.equal(r.status,index===core.STORY_BOSS_COUNT-1?'ballot':'running');
 }
});
test('resize da arena conserva combate e devolução; entrada reposiciona sem teleporte',()=>{
 const r=scene(1);r.player.x=820;
 const original=r.player.x;core.advanceRun(r,dt,()=>.5);
 assert.ok(original-r.player.x<3,'entrada deve aproximar suavemente');
 for(let i=0;i<180;i++)core.advanceRun(r,dt,()=>.5);
 assert.ok(r.player.x<=core.playerBounds(r).max);
 for(let i=0;i<480&&!r.obstacles.some(core.isHostileProjectile);i++)core.advanceRun(r,dt,()=>.5);
 assert.ok(r.obstacles.some(core.isHostileProjectile));core.setAttackRun(r,true);core.advanceRun(r,.05,()=>.5);
 core.resizeRun(r,480);
 assert.ok(r.player.x<=core.playerBounds(r).max);assert.ok(r.heroShots.every(s=>Number.isFinite(s.x)&&Number.isFinite(s.vx)));
 const hp=r.boss.hp;
 for(let i=0;i<720&&r.boss&&r.boss.hp===hp;i++){pilotCounter(r);core.advanceRun(r,dt,()=>.5);}
 assert.ok(!r.boss||r.boss.hp<hp);
});
test('limpar comandos e reiniciar não mantém o disparo automático',()=>{
 const r=scene();core.setAttackRun(r,true);core.clearRunInput(r);
 assert.equal(r.player.attackHeld,false);
 for(let i=0;i<240;i++)core.advanceRun(r,dt,()=>.5);
 assert.equal(r.heroShots.length,0);
 const fresh=core.createRun({mode:'story'});assert.equal(fresh.player.attackHeld,false);assert.deepEqual(fresh.heroShots,[]);
});
test('Rick dispara seis pulsos em rajada e Erika inclui queda com alvo marcado',()=>{
 const r=scene(2);let maxShotsInVolley=0;
 for(let i=0;i<120*18;i++){
  core.advanceRun(r,dt,()=>.5);
  maxShotsInVolley=Math.max(maxShotsInVolley,r.boss.volleyShots?.length||0);
 }
 assert.equal(maxShotsInVolley,6);
 const e=scene(5);let markedDrop=false;
 for(let i=0;i<120*18;i++){
  core.advanceRun(e,dt,()=>.5);markedDrop ||= e.obstacles.some(o=>o.falling&&o.type==='stage-spotlight'&&o.warningFor>0);
 }
 assert.equal(markedDrop,true,'refletor de Erika precisa exigir reposicionamento');
});
test('anúncios da História usam a identidade e o objetivo real dos 17 encontros',()=>{
 for(let index=0;index<core.STORY_BOSS_COUNT;index++){
  const r=scene(index);
  assert.ok(r.event.includes(r.boss.name),'identidade '+index+': '+r.event);
  assert.ok(r.event.includes(r.boss.objective),'objetivo de combate '+index);
  assert.equal(r.event.startsWith('CHEFÃO FINAL'),index===core.STORY_BOSS_COUNT-1,'somente o último é final');
 }
 const r=scene();r.boss.hp=0;core.advanceRun(r,dt,()=>.5);
 assert.match(r.event,new RegExp('1/'+core.STORY_BOSS_COUNT));
});
test('bossFigure desenha o corpo na origem física do projétil inimigo nos dois modos',()=>{
 const source=readFileSync(new URL('../tanahoraflavio/runner.mjs',import.meta.url),'utf8');
 const start=source.indexOf('  function bossFigure(){'),end=source.indexOf('  function character(){',start);
 const make=Function('env','const {run,ctx,virtualWidth,WORLD,STAGES,bossArenaPose,bossPresentationFor,bossCounterWindow,enemyEmitterPose,enemyMotionFor,prefersReducedMotion,drawHoverEnemy,bossCue,campaignAccentFor}=env;'+source.slice(start,end)+';return bossFigure;');
 for(const mode of ['story','endless'])for(const reduced of [true,false]){
  const r=core.createRun({mode});core.startRun(r);r.nextBossAt=0;r.nextRaid=Infinity;r.shieldFor=Infinity;
  if(mode==='story')r.bossesDefeated=1;
  core.advanceRun(r,dt,()=>.5);for(let i=0;i<120*4&&!r.obstacles.some(core.isHostileProjectile);i++)core.advanceRun(r,dt,()=>.5);
  const state={x:0,y:0},stack=[];let drawn;
  const ctx={save(){stack.push({...state});},restore(){Object.assign(state,stack.pop());},translate(x,y){state.x+=x;state.y+=y;},fillText(){},beginPath(){},ellipse(){},roundRect(){},fill(){},measureText(s){return {width:s.length*7};}};
  const draw=make({run:r,ctx,STAGES:core.STAGES,virtualWidth:900,WORLD:core.WORLD,bossArenaPose:core.bossArenaPose,bossPresentationFor:bosses.bossPresentationFor,bossCounterWindow:bosses.bossCounterWindow,campaignAccentFor,
   enemyEmitterPose:art.enemyEmitterPose,enemyMotionFor:art.enemyMotionFor,prefersReducedMotion:()=>reduced,
   drawHoverEnemy(c,args){drawn={x:state.x+args.x,y:state.y+args.y};},bossCue:()=>({action:'jump'})});
  draw();
  const shot=r.obstacles.find(core.isHostileProjectile),muzzle=combatGeometryFor(r.boss.type,{frame:2,facing:-1}).muzzle;
  assert.ok(Math.abs(shot.launchX-(drawn.x+muzzle.x))<15,mode+' arma deslocada horizontalmente');
  assert.ok(Math.abs((core.WORLD.ground-shot.launchY)-(drawn.y+muzzle.y))<8,mode+' arma deslocada verticalmente');
 }
});
test('plataforma mantém posição estável quando os efeitos reduzidos estão ativos',()=>{
 assert.deepEqual(bosses.bossArenaPose({age:0,reducedMotion:true},480),bosses.bossArenaPose({age:99,reducedMotion:true},480));
});
