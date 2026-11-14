import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
import {collectAlly,advanceAllies} from '../tanahoraflavio/runner-allies.mjs';
const make=()=>{const r=core.createRun();core.startRun(r);for(const k of ['nextRaid','nextBossAt','nextObstacle','nextPower','nextPassport','nextAllyAt','nextSupportAt'])r[k]=Infinity;return r;};
const step=(r,t)=>{for(let i=0;i<t*120;i++)core.advanceRun(r,1/120,()=>.5);};
test('seis coletas reais de ajudantes guardam um escudo manual, sem ativá-lo ou empilhá-lo',()=>{
 const r=make();
 for(let n=1;n<=6;n++){r.pickups=[{type:'ally',allyId:'jair',x:r.player.x+17,y:20,speed:0}];core.advanceRun(r,1/120);assert.equal(r.reserveShields,n===6?1:0);assert.equal(r.shieldFor,0);}
 assert.equal(r.allyShieldProgress,0);
 for(let i=0;i<7;i++)collectAlly(r,'jair');assert.equal(r.reserveShields,1);assert.equal(r.allyShieldProgress,0);
 assert.equal(core.activateReserveShield(r),true);assert.equal(r.reserveShields,0);assert.equal(r.shieldFor,6);
 assert.equal(core.activateReserveShield(r),false);assert.equal(r.shieldFor,6);
 for(let i=0;i<6;i++)collectAlly(r,'jair');assert.equal(r.reserveShields,1);
 assert.equal(core.activateReserveShield(r),false,'escudo em uso preserva a reserva');
 step(r,6.1);assert.equal(core.activateReserveShield(r),true);assert.equal(r.reserveShields,0);
 assert.equal(core.createRun().reserveShields,0,'nova corrida reinicia a reserva');
});
test('reserva protege de dano real, respeita pausa e pode ser usada no ar',()=>{
 const r=make();r.reserveShields=1;r.player.y=40;r.player.velocity=100;r.status='paused';
 assert.equal(core.activateReserveShield(r),false);assert.equal(r.reserveShields,1);r.status='running';assert.equal(core.activateReserveShield(r),true);
 r.player.y=0;r.player.velocity=0;r.obstacles=[{type:'case',x:r.player.x,width:38,height:34,speed:0,action:'jump'}];
 core.advanceRun(r,1/120);assert.equal(r.status,'running');r.shieldFor=0;core.advanceRun(r,1/120);assert.equal(r.status,'over');
});
test('Eduardo adia perseguição uma vez; Tarcísio aproxima o próximo apoio',()=>{
 const r=make();r.nextRaid=10;r.nextSupportAt=18000;r.routeDistance=1000;
 collectAlly(r,'eduardo');assert.equal(r.nextRaid,14);advanceAllies(r,.1);assert.equal(r.nextRaid,14);
 collectAlly(r,'tarcisio');assert.equal(r.nextSupportAt,11000);
});
test('Silas melhora deslocamento lateral sem alterar velocidade da corrida ou metros',()=>{
 const r=make(),control=make();collectAlly(r,'silas');core.moveRun(r,1);core.moveRun(control,1);step(r,.4);step(control,.4);
 assert.ok(r.player.x>control.player.x+10);assert.equal(r.distance,control.distance);assert.equal(r.shieldFor,0);
});
test('Renan busca um único passaporte próximo, sem criar coletas artificiais',()=>{
 const r=make();r.pickups=[{type:'passport',x:210,y:55,speed:0},{type:'passport',x:260,y:55,speed:0}];collectAlly(r,'renan');step(r,.6);
 assert.equal(r.passports,1);step(r,.5);assert.equal(r.passports,1);assert.equal(r.pickups.length,1);
});
test('aumenta ataques de retaguarda desde cedo e preserva antecedência e outras direções',()=>{
 let rear=0,total=0;const styles=new Set();let seed=582;
 const rng=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};
 for(let n=0;n<300;n++){
  const r=make();r.elapsed=25;r.distance=r.routeDistance=7000;r.nextObstacle=0;core.advanceRun(r,1/120,rng);
  const o=r.obstacles.at(-1);if(!o)continue;total++;styles.add(o.approach);
  if(o.approach==='rear'){rear++;assert.ok(o.speed<0);assert.ok(core.threatTimeToContact(r,o)>=1.04);}
 }
 assert.ok(rear/total>.1,`${rear}/${total} precisa incluir mais perseguidores por trás`);assert.ok(styles.has('front')&&styles.has('overhead'));
});
test('disparo do Flávio identifica o projétil de ivermectina sem consumir passaportes',()=>{
 const r=make();r.nextBossAt=0;r.bossBag=['haddad'];core.advanceRun(r,1/120);r.passports=12;
 assert.equal(core.attackRun(r),true);assert.equal(r.heroShots[0].type,'hero-ivermectina');assert.equal(r.passports,12);
});
