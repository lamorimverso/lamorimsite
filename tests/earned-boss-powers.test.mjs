import test from 'node:test';import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
import {legacyBossAt,optionalStoryBossAt,storyBossAt,STORY_ENCOUNTERS} from '../tanahoraflavio/runner-bosses.mjs';
const make=()=>{const r=core.createRun();core.startRun(r);for(const k of ['nextBossAt','nextRaid','nextObstacle','nextAllyAt','nextSupportAt','nextPower','nextPassport'])r[k]=Infinity;return r;};
const step=(r,t)=>{for(let i=0;i<t*120&&r.status==='running';i++)core.advanceRun(r,1/120,()=>.5);};
test('vencer Dilma concede e equipa vento; a revanche melhora o mesmo poder sem duplicar o inventário',()=>{
 const r=make();r.mode='story';r.bossesDefeated=11;r.boss={...legacyBossAt(11),combat:true,hp:0,maxHp:50,total:50,remaining:0,fired:0,nextAttack:100};
 core.advanceRun(r,1/120);assert.ok(r.ownedPowers?.includes('dilma'));assert.equal(r.activePower,'dilma');assert.equal(r.powerLevels.dilma,1);assert.equal(r.lastPowerReward.id,'dilma');
 assert.equal(typeof core.grantBossPower,'function');core.grantBossPower(r,'dilma');assert.equal(r.powerLevels.dilma,2);assert.equal(r.ownedPowers.filter(id=>id==='dilma').length,1);
 assert.equal(core.grantBossPower(r,'santiago'),false);assert.deepEqual(core.createRun().ownedPowers,['ivermectina']);
});
test('tiros na corrida derrotam um perseguidor hostil e interceptam um projétil sem gastar passaportes',()=>{
 const r=make(),body={type:'pf',x:320,width:34,height:44,speed:0,action:'jump'},y=core.heroMuzzleFor(r).y;
 r.passports=8;r.obstacles=[body,{type:'message',x:455,width:34,height:44,y,speed:100,projectile:true,launched:true,launchX:472,targetX:r.player.x+17,launchY:y,targetY:y}];
 assert.equal(core.setAttackRun(r,true),true);assert.equal(core.attackRun(r),true);step(r,1);
 assert.equal(body.destroyed,true);assert.equal(body.hitPoints,0);assert.equal(r.defeatedEnemies,1);
 assert.deepEqual(r.obstacles,[]);assert.equal(r.passports,8);assert.equal(r.status,'running');
});
test('vento herdado da Dilma dispersa projéteis; trocar poder respeita bloqueios e mantém o tiro em voo',()=>{
 const r=make();assert.equal(typeof core.equipHeroPower,'function');assert.equal(core.equipHeroPower(r,'dilma'),false);
 core.grantBossPower(r,'dilma');core.attackRun(r);const shot=r.heroShots[0];assert.equal(shot.powerId,'dilma');assert.equal(shot.type,'wind');
 r.obstacles=[{type:'hammer',owner:'xandao',bossAttack:true,projectile:true,launched:true,x:shot.x+60,y:shot.y,width:25,height:28,speed:0,waitFor:0,action:'jump',launchX:shot.x+72,targetX:r.player.x,launchY:shot.y,targetY:shot.y}];
 core.equipHeroPower(r,'ivermectina');assert.equal(r.heroShots[0],shot);step(r,.2);assert.ok(!r.obstacles.length,'vento remove o projétil em sua trajetória');
});
test('rajada de Janones, planilha de Simone e selo de Dino têm comportamento físico próprio',()=>{
 for(const id of ['janones','simone','dino']){
  const r=make();core.grantBossPower(r,id);core.attackRun(r);
  if(id==='dino'){assert.equal(r.heroShots.length,1);assert.ok(r.heroShots[0].damage>2);}
  else{assert.equal(r.heroShots.length,3);step(r,.1);assert.equal(new Set(r.heroShots.map(s=>Math.round(s.y))).size,3);}
 }
});

test('ordem das primeiras lutas forma uma cadeia: o poder ganho é a fraqueza do próximo vilão novo',async()=>{
 const {bossProfileFor}=await import('../tanahoraflavio/runner-boss-profiles.mjs');
 const order=[...new Set(Array.from({length:24},(_,i)=>legacyBossAt(i).type))];
 for(let i=1;i<order.length;i++)assert.equal(bossProfileFor(order[i]).weakness,order[i-1],order[i]);
});
test('projétil alto já lançado mantém velocidade de saída e posição contínua após girar a tela',()=>{
 const r=make();r.viewportWidth=900;r.obstacles=[{type:'microphone',sourceActor:'joice',approach:'overhead',projectile:true,launched:true,x:317,y:84,width:46,height:72,speed:200,waitFor:0,launchX:600,targetX:137,targetY:84,cast:{fromX:600,fromY:84,toX:400,flightFor:.4,flightAge:.7}}];
 core.resizeRun(r,480);const shot=r.obstacles[0],before=shot.x;
 assert.ok(Math.abs(shot.speed)>=180);core.advanceRun(r,1/120);assert.ok(Math.abs(shot.x-before+shot.speed/120)<1e-7,'resize não faz salto tardio na cauda do voo');
});

test('Lula no Infinito conclui a luta quando seus bumerangues foram evitados',()=>{
 const r=make();r.nextBossAt=0;r.bossBag=['lula'];r.shieldFor=Infinity;step(r,90);assert.ok(r.bossesDefeated>=1,'retorno visual não prende a contagem de ataques do chefe');
});


test('vencer cada novo duelo equipa sua técnica própria e o disparo usa a física correspondente',()=>{
 const specs={
  'ana-elisa':['network-panel','stack',3],rick:['signal-pulse','wave',1],sofia:['arrow-panel','pierce',1],
  guilherme:['garden-box','bounce',1],erika:['stage-spotlight','double',2],jones:['debate-card','return',1],
  maestro:['baton-wave','orbit',1],capita:['wind-flag','gust',1]
 };
 const campaign=Array.from({length:STORY_ENCOUNTERS},(_,i)=>storyBossAt(i));
 for(const [id,[projectile,behavior,count]] of Object.entries(specs)){
  const r=make(),b=campaign.find(row=>row.type===id)||optionalStoryBossAt(id);
  r.boss={...b,combat:true,phase:'recover',phaseFor:1,hp:0,maxHp:b.hp,total:b.hp,remaining:0,fired:0,nextAttack:100};
  core.advanceRun(r,1/120);
  assert.equal(r.activePower,id);assert.equal(r.lastPowerReward.id,id);
  assert.equal(r.powerLevels[id],1);assert.ok(r.ownedPowers.includes(id));
  assert.equal(core.attackRun(r),true);assert.equal(r.heroShots.length,count);
  assert.ok(r.heroShots.every(shot=>shot.type===projectile&&shot.behavior===behavior&&shot.powerId===id));
 }
});

test('as travessias não entregam armamento nem alteram a arma equipada',()=>{
 const r=make();
 for(const id of ['fiscal','povo','renato-freitas'])assert.equal(core.grantBossPower(r,id),false,id);
 assert.deepEqual(r.ownedPowers,['ivermectina']);assert.equal(r.activePower,'ivermectina');
});
