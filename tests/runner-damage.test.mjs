import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
import {stepTerrainPlayer} from '../tanahoraflavio/runner-terrain.mjs';

const DT=1/120;
function scene(options={}){
 const r=core.createRun({seed:19,...options});core.startRun(r);
 r.nextObstacle=r.nextPickup=r.nextPower=r.nextPassport=r.nextBossAt=r.nextRaid=r.nextAllyAt=r.nextSupportAt=Infinity;
 r.terrain.nextAt=Infinity;
 return r;
}
const step=(r,n=1)=>{for(let i=0;i<n;i++)core.advanceRun(r,DT,()=>.5);};
const hazard=(r,extra={})=>({type:'barrier',x:r.player.x+8,width:24,height:40,speed:0,...extra});
const strike=(r,extra)=>{r.obstacles.push(hazard(r,extra));step(r);};
const packageAt=(r)=>{r.pickups.push({type:'rachadinha',x:r.player.x+17,y:20,speed:0});};

test('dois impactos separados valem na pista e no duelo, sem dano repetido do mesmo objeto',()=>{
 for(const mode of ['endless','story']){
  const r=scene({mode});
  if(mode==='story'){r.nextBossAt=0;step(r);assert.equal(r.boss.combat,true);r.boss.nextAttack=Infinity;}
  strike(r);assert.equal(r.status,'running');assert.equal(r.player.hp,1);assert.ok(r.graceFor>0);
  step(r,150);assert.equal(r.status,'running');assert.equal(r.player.hp,1);
  strike(r);assert.equal(r.status,'over');assert.equal(r.player.hp,0);
 }
});

test('o chefe e o fim da transformação não restauram o dano acumulado',()=>{
 const r=scene({mode:'story'});r.player.hp=1;r.nextBossAt=0;step(r);
 assert.equal(r.boss.combat,true);assert.equal(r.player.hp,1);
 r.boss.hp=0;step(r);assert.equal(r.boss,null);assert.equal(r.player.hp,1);
 r.player.isJacare=true;r.player.jacareAge=core.JACARE_RECOVERY_SECONDS-.01;
 step(r,2);
 assert.equal(r.player.isJacare,false);assert.equal(r.player.hp,1);
});

test('cair no vão interrompe imediatamente mesmo com escudo e continuação guardada',()=>{
 const r=scene();r.lives=2;r.shieldFor=6;r.player.y=-86;
 step(r);assert.equal(r.status,'over');assert.equal(r.player.hp,0);assert.equal(r.lastHit.type,'terrain-gap');assert.equal(r.lives,2);
});

test('Rachadinha resolve antes do impacto no mesmo frame e nunca dá vida extra',()=>{
 const r=scene();r.player.hp=1;packageAt(r);strike(r);assert.equal(r.status,'running');assert.equal(r.player.hp,1);assert.equal(r.lastPickup,'rachadinha');
 r.obstacles=[];packageAt(r);step(r);assert.equal(r.player.hp,2);
 packageAt(r);step(r);assert.equal(r.player.hp,2);assert.equal(r.lives,1);
});

test('o aumento de tamanho de Rachadinha espera espaço embaixo de um teto',()=>{
 const r=scene();r.player.hp=1;
 r.terrain.active={id:1,kind:'passage',age:0,speed:0,gaps:[],platforms:[],ceilings:[{x:96,width:150,bottom:70,top:110}]};
 packageAt(r);step(r);assert.equal(r.lastPickup,'rachadinha');assert.equal(r.player.hp,1);assert.equal(r.player.recoveryPending,true);
 r.player.x=275;step(r);assert.equal(r.player.hp,2);assert.equal(r.player.recoveryPending,false);
});

test('passaportes só permitem continuar após a derrota por uma ação explícita',()=>{
 const r=scene();r.player.hp=1;r.lives=2;r.passports=100;
 strike(r);const distance=r.distance;
 assert.equal(r.status,'over');assert.equal(r.lives,2);assert.equal(r.player.hp,0);
 assert.equal(core.continueRun?.(r),true);assert.equal(r.status,'running');assert.equal(r.player.hp,2);
 assert.equal(r.lives,1);assert.equal(r.distance,distance);assert.equal(r.passports,100);
 assert.equal(core.continueRun?.(r),false);
});

test('a forma machucada tem colisão menor, sem modificar a altura do pulo',()=>{
 const normal=scene(),hurt=scene();hurt.player.hp=1;
 for(const r of [normal,hurt])strike(r,{projectile:true,launched:true,y:57,height:22});
 assert.equal(normal.player.hp,1);assert.equal(hurt.status,'running');assert.equal(hurt.lastHit,null);
 core.jumpRun(normal);core.jumpRun(hurt);assert.equal(normal.player.velocity,hurt.player.velocity);
});

test('o pacote raro só aparece depois de um intervalo seguro e não se repete a cada onda',()=>{
 const r=scene();step(r,601);assert.ok(r.pickups.every(o=>o.type!=='rachadinha'));
 strike(r);step(r,600);assert.equal(r.pickups.filter(o=>o.type==='rachadinha').length,1);
 r.pickups=[];step(r,601);assert.ok(r.pickups.every(o=>o.type!=='rachadinha'));
});

test('a cura não é gerada na entrada do jacaré nem durante a onda já marcada',()=>{
 for(const dodge of [false,true]){
  const r=scene();r.viewportWidth=480;r.player.hp=1;r.recoveryReadyAt=0;
  r.pickups=[{type:'ze-gotinha',x:r.player.x+17,y:20,speed:0}];
  step(r);assert.equal(r.player.isJacare,true);
  assert.ok(!r.pickups.some(p=>p.type==='rachadinha'));
  r.player.jacareAge=core.JACARE_RECOVERY_SECONDS-.02;
  if(dodge)core.moveRun(r,1);
  step(r,3);
  step(r,164);assert.ok(!r.pickups.some(p=>p.type==='rachadinha'));
  if(!dodge){assert.equal(r.status,'over');assert.equal(r.lastHit.type,'pfizer-ampoule');continue;}
  core.moveRun(r,0);
  for(let i=0;i<120&&!r.pickups.some(p=>p.type==='rachadinha');i++)step(r);
  assert.equal(r.status,'running');assert.equal(r.player.hp,1);
  assert.equal(r.pickups.filter(p=>p.type==='rachadinha').length,1);
 }
});

test('a mesma passagem baixa não consome os dois impactos enquanto durar o contato',()=>{
 const r=scene();r.terrain.active={id:1,kind:'passage',age:0,speed:0,gaps:[],platforms:[],ceilings:[{x:96,width:900,bottom:40,top:110}]};
 step(r,201);assert.equal(r.status,'running');assert.equal(r.player.hp,1);
 r.player.x=core.playerBounds(r).max;step(r);r.player.x=120;step(r);
 assert.equal(r.status,'over');assert.equal(r.player.hp,0);assert.equal(r.lastHit.type,'terrain-ceiling');
});

test('a forma machucada não recebe apoio de uma borda que seu pé não alcança',()=>{
 for(const hp of [1,2]){
  const r=scene();r.player.hp=hp;r.player.x=120;r.player.y=28.04;r.player.velocity=-12;r.player.grounded=false;
  r.terrain.active={kind:'air-transfer',gaps:[{x:55,width:190}],platforms:[{x:150,width:90,y:28}],ceilings:[]};
  stepTerrainPlayer(r,DT);
  assert.equal(r.player.grounded,hp===2);
 }
});
