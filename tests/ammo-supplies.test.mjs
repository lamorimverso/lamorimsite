import test from 'node:test';import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
import {collectAlly} from '../tanahoraflavio/runner-allies.mjs';
const make=()=>{const r=core.createRun();core.startRun(r);for(const key of ['nextBossAt','nextRaid','nextObstacle','nextAllyAt','nextSupportAt','nextPower','nextPassport'])r[key]=Infinity;return r;};
const step=(r,t)=>{for(let i=0;i<Math.ceil(t*120)&&r.status==='running';i++)core.advanceRun(r,1/120,()=>.5);};
test('corrida permite só seis disparos e não recarrega com tempo, troca de poder ou descanso',()=>{
 const r=make();assert.equal(r.ammo,6);
 for(let i=0;i<6;i++){assert.equal(core.attackRun(r),true);r.heroShots=[];step(r,.3);}
 assert.equal(r.ammo,0);assert.equal(core.attackRun(r),false);step(r,8);assert.equal(r.ammo,0);
 core.grantBossPower(r,'dilma');assert.equal(r.ammo,0);assert.equal(core.attackRun(r),false);
});
test('rajada de três projéteis custa uma munição e ajudante repõe três sem exceder o limite',()=>{
 const r=make();core.grantBossPower(r,'janones');core.attackRun(r);assert.equal(r.heroShots.length,3);assert.equal(r.ammo,5);
 r.ammo=0;collectAlly(r,'jair');assert.equal(r.ammo,3);collectAlly(r,'michelle');assert.equal(r.ammo,6);collectAlly(r,'silas');assert.equal(r.ammo,6);
});
test('chefe tem limite de doze; segurar o tiro vazio impede recarga até soltar',()=>{
 const r=make();r.nextBossAt=0;r.bossBag=['lula'];core.advanceRun(r,1/120);r.shieldFor=Infinity;r.ammo=0;
 core.setAttackRun(r,true);step(r,2);assert.equal(r.ammo,0);
 core.setAttackRun(r,false);step(r,.8);assert.equal(r.ammo,0);step(r,.8);assert.ok(r.ammo>=1&&r.ammo<=2);
 step(r,8);assert.equal(r.ammo,12);collectAlly(r,'jair');assert.equal(r.ammo,12);
 r.boss=null;r.nextBossAt=Infinity;step(r,.02);assert.equal(r.ammo,6);r.ammo=0;step(r,4);assert.equal(r.ammo,0);
});
test('cada seis ajudas cria uma reserva acumulável além dos três segundos de proteção; E gasta só uma',()=>{
 const r=make();for(let i=0;i<14;i++)collectAlly(r,'jair');
 assert.equal(r.reserveShields,2);assert.equal(r.allyShieldProgress,2);assert.equal(r.shieldFor,3);
 assert.equal(core.activateReserveShield(r),false);assert.equal(r.reserveShields,2);step(r,3.1);
 assert.equal(core.activateReserveShield(r),true);assert.equal(r.reserveShields,1);assert.equal(core.activateReserveShield(r),false);assert.equal(r.reserveShields,1);
 step(r,6.1);assert.equal(core.activateReserveShield(r),true);assert.equal(r.reserveShields,0);
 assert.equal(core.createRun().ammo,6);assert.equal(core.createRun().reserveShields,0);
});
test('uma coleta de escudo é uma parte e nunca concede proteção gratuita',()=>{
 const r=make();for(let i=0;i<6;i++){r.pickups=[{type:'shield',x:r.player.x+17,y:20,speed:0}];core.advanceRun(r,1/120);assert.equal(r.shieldFor,0);}
 assert.equal(r.reserveShields,1);assert.equal(r.allyShieldProgress,0);
});
