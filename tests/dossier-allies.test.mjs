import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
const dt=1/120;
const isolated=()=>{const r=core.createRun();core.startRun(r);for(const k of ['nextBossAt','nextRaid','nextObstacle','nextAllyAt','nextSupportAt','nextPower','nextPassport','nextPickup'])r[k]=Infinity;return r;};
const step=(r,t)=>{for(let i=0;i<Math.ceil(t/dt);i++)core.advanceRun(r,dt,()=>.5);};
const source=()=>import('../tanahoraflavio/runner-allies.mjs');
test('Vorcaro atrai somente passaportes próximos por três segundos sem mudar metros ou vidas',async()=>{
 const {collectAlly}=await source(),r=isolated(),control=isolated();r.pickups=[{type:'passport',x:210,y:65,speed:0},{type:'shield',x:220,y:65,speed:0}];
 assert.equal(collectAlly(r,'vorcaro'),true);step(r,.6);step(control,.6);assert.equal(r.passports,1);assert.equal(r.lives,1);assert.equal(r.shieldFor,0);assert.equal(r.distance,control.distance);
 step(r,2.5);r.pickups.push({type:'passport',x:250,y:65,speed:0});step(r,.2);assert.equal(r.passports,1,'ímã expirou');
 assert.equal(collectAlly(r,'vorcaro'),false,'cooldown bloqueia coleta repetida');step(r,21);assert.equal(collectAlly(r,'vorcaro'),true);
});
test('Milei remove só um obstáculo cenográfico e preserva pessoas e ataques de chefes',async()=>{
 const {collectAlly}=await source(),r=isolated();r.obstacles=[{type:'pf',x:260,width:34,height:44,speed:0},{type:'barrier',x:320,width:44,height:32,speed:0},{type:'case',x:380,width:38,height:36,speed:0},{type:'hammer',x:420,width:44,height:44,speed:0,bossAttack:true}];
 collectAlly(r,'milei');step(r,.2);assert.deepEqual(r.obstacles.map(o=>o.type),['pf','case','hammer']);assert.equal(r.lives,1);assert.equal(r.shieldFor,0);
});
test('Bia tem meta opcional real de três coletas e não concede passaportes artificiais',async()=>{
 const {collectAlly}=await source(),r=isolated();collectAlly(r,'bia');
 for(let i=0;i<3;i++){r.pickups.push({type:'passport',x:137,y:20,speed:0});core.advanceRun(r,dt);}
 core.advanceRun(r,dt);assert.equal(r.passports,3);assert.equal(r.aid?.kind,'magnet');assert.ok(r.aid.remaining<=1.5);
});
test('aliados são escolhidos no cenário apropriado sem repetir até usar os elegíveis',async()=>{
 const {ALLIES,allyForStage}=await source(),seen={};
 assert.equal(ALLIES.length,15);assert.equal(new Set(ALLIES.map(a=>a.id)).size,15);
 for(let n=0;n<12;n++){const a=allyForStage(0,seen,()=>.5);assert.ok(!['milei','trump'].includes(a.id));assert.equal(seen[a.id]||0,0);seen[a.id]=1;}
 assert.ok(ALLIES.every(a=>a.label&&a.kind&&a.duration>0));
 const visited=Object.fromEntries(ALLIES.map(a=>[a.id,1]));visited.milei=0;assert.equal(allyForStage(2,visited,()=>0).id,'milei');
});
test('todos os aliados são coletáveis no motor e nenhum concede arma ou invulnerabilidade',async()=>{
 const {ALLIES}=await source();for(const a of ALLIES){const r=isolated();r.pickups=[{type:'ally',allyId:a.id,x:137,y:20,speed:0}];core.advanceRun(r,dt);assert.equal(r.ally?.id,a.id);assert.equal(r.shieldFor,0);assert.equal(r.lives,1);assert.equal(r.passports,0);}
});
test('expansão indisponível adia apoios e não cria um perigo sem desenho próprio',()=>{
 const r=isolated();r.supportAvailable=false;r.elapsed=80;r.distance=r.routeDistance=19000;r.nextSupportAt=r.nextObstacle=0;
 core.advanceRun(r,dt,()=>.999);assert.equal(r.obstacles.at(-1).type,'pf');assert.ok(!r.pickups.some(p=>p.type==='ally'));
 r.supportAvailable=true;core.advanceRun(r,dt,()=>.999);assert.ok(r.pickups.some(p=>p.type==='ally'));
});
