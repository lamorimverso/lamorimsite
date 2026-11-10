import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
import * as art from '../tanahoraflavio/runner-art.mjs';

const DT=1/120;
function isolated(mode='endless'){
 const r=core.createRun({mode,seed:123});core.startRun(r);
 for(const key of ['nextObstacle','nextRaid','nextAllyAt','nextSupportAt','nextPower','nextPassport','nextPickup'])r[key]=Infinity;
 return r;
}
test('Infinito permanece padrão, História é opção explícita, entradas inválidas não quebram o modo',()=>{
 assert.deepEqual(core.GAME_MODES,['endless','story']);
 assert.equal(core.createRun().mode,'endless');
 assert.equal(core.createRun({mode:'story'}).mode,'story');
 assert.equal(core.createRun({mode:'invalid'}).mode,'endless');
 assert.equal(core.STORY_BOSS_COUNT,core.BOSS_ROSTER.length+1);
});
test('chefão dos chefões apresenta 14 ataques de medicamentos fictícios com duas formas de esquiva',()=>{
 const boss=core.bossAtRound(5,'bossonari');
 assert.equal(boss.foe.type,'bossonari');
 assert.equal(boss.attacks,14);
 assert.equal(boss.goalKind,'phantoms');
 const moves=Array.from({length:14},(_,i)=>core.bossAttackFor('bossonari',i,5));
 assert.ok(moves.some(m=>m.type==='cloroquina-prop'));
 assert.ok(moves.some(m=>m.type==='ivermectina-prop'));
 assert.ok(moves.some(m=>m.action==='jump')&&moves.some(m=>m.action==='crouch'));
 assert.ok(moves.every(m=>!('medicinalEffect' in m)));
});
test('História conclui somente depois de desviar do sexto chefão',()=>{
 const r=isolated('story');
 r.distance=r.routeDistance=57000;r.bossesDefeated=5;r.nextBossAt=0;r.shieldFor=Infinity;
 const seen=new Set();
 for(let i=0;i<120*42&&r.status==='running';i++){
  core.advanceRun(r,DT,()=>.5);
  if(r.boss)seen.add(r.boss.type);
 }
 assert.deepEqual([...seen],['bossonari']);
 assert.equal(r.status,'ballot');
 assert.equal(r.bossesDefeated,6);
 assert.equal(core.ballotDigit(r,'1'),true);
 assert.equal(core.ballotDigit(r,'3'),true);
 assert.equal(core.ballotConfirm(r),'won');
 assert.equal(r.status,'won');
 assert.equal(r.lastBoss,'bossonari');
 assert.equal(r.nextBossAt,Infinity);
 assert.ok(r.event.includes('HISTÓRIA CONCLUÍDA'));
 const before=structuredClone(r);
 core.advanceRun(r,1,()=>.5);
 assert.deepEqual(r,before,'o motor não continua rodando após a vitória');
 assert.equal(core.jumpRun(r),false);
 assert.equal(core.moveRun(r,1),false);
});
test('Infinito segue depois de cinco chefões e não chama a vitória da História',()=>{
 const r=isolated();r.distance=r.routeDistance=57000;r.bossesDefeated=5;r.nextBossAt=0;r.shieldFor=Infinity;
 const seen=[];
 for(let i=0;i<120*42&&r.status==='running';i++){
  const prev=r.boss;
  core.advanceRun(r,DT,()=>.5);
  if(r.boss&&r.boss!==prev)seen.push(r.boss.type);
 }
 assert.ok(seen.includes('haddad'));
 assert.equal(r.status,'running');
 assert.ok(r.bossesDefeated>=6);
 assert.ok(!seen.includes('bossonari'),'o ciclo original do Infinito permanece válido');
});
test('Exército de Memes gera perigos altos e não altera a física de movimento do jogador',()=>{
 const r=isolated();r.elapsed=40;r.nextObstacle=0;r.nextBossAt=Infinity;r.shieldFor=Infinity;
 const seen=new Set();
 for(let i=0;i<120*110;i++){
  core.advanceRun(r,DT,core.createSeededRandom(i+11));
  for(const o of r.obstacles)if(o.sourceActor==='meme-army'){seen.add(o.type);assert.equal(o.action,'crouch');assert.equal(o.projectile,true);}
 }
 assert.ok(seen.has('meme-ghost'));
});
function fakeCanvas(){
 const calls=[];return {calls,save(){},restore(){},translate(){},rotate(){},scale(){},beginPath(){},ellipse(){},
 fill(){},stroke(){},moveTo(){},lineTo(){},closePath(){},bezierCurveTo(){},quadraticCurveTo(){},
 roundRect(...args){calls.push(args)},fillText(value){calls.push(value)}};
}
test('arte vetorial nova desenha fantasmas, chapéu flutuante e projéteis sem atlas obrigatório',()=>{
 const ctx=fakeCanvas();
 assert.doesNotThrow(()=>art.drawMemeArmy(ctx,{x:200,y:180,phase:4}));
 assert.doesNotThrow(()=>art.drawBossOfBosses(ctx,{x:600,y:220,phase:9,attacking:true}));
 assert.doesNotThrow(()=>art.drawPhantomCloud(ctx,{x:400,y:220,phase:3,hitFor:1}));
 for(const type of ['meme-ghost','cloroquina-prop','ivermectina-prop']){
  assert.doesNotThrow(()=>art.drawThreat(ctx,{type,x:200,width:52,height:84,action:'crouch'},230,7,{reducedMotion:true}));
 }
 assert.ok(ctx.calls.some(c=>c==='BOSSONARI'));
 assert.ok(ctx.calls.some(c=>c==='CLOROQ.'));
 assert.ok(ctx.calls.some(c=>c==='IVERM.'));
});

test('urna aceita apenas códigos da ficção e impede confirmar duas vezes',()=>{
 const r=isolated('story');r.status='ballot';
 assert.equal(core.ballotDigit(r,'x'),false);
 core.ballotDigit(r,'9');core.ballotDigit(r,'9');
 assert.equal(core.ballotDigit(r,'1'),false);
 assert.equal(core.ballotConfirm(r),'invalid');
 assert.equal(r.status,'ballot');core.ballotClear(r);
 core.ballotDigit(r,'2');core.ballotDigit(r,'2');
 assert.equal(core.ballotConfirm(r),'prison');
 assert.equal(r.status,'prison');assert.equal(core.ballotConfirm(r),false);
 const e=isolated();assert.equal(core.ballotDigit(e,'1'),false);
 assert.equal(core.ballotConfirm(e),false);
});
