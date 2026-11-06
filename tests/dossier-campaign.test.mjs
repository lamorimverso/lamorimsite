import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
const dt=1/120,seeded=s=>()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/2**32);
function start(type,width=480){const r=core.createRun();core.startRun(r);r.viewportWidth=width;r.player.x=175;r.routeDistance=23000;r.nextBossAt=0;for(const k of ['nextRaid','nextAllyAt','nextSupportAt','nextPower','nextPassport'])r[k]=Infinity;r.bossBag=[type];return r;}
test('Janones e PF entram como encontros distintos e ambos são vencíveis por comandos legais',()=>{
 assert.ok(core.BOSS_ROSTER.includes('janones')&&core.BOSS_ROSTER.includes('pf'));
 for(const type of ['janones','pf'])for(const width of [480,900]){
  const r=start(type,width),rng=seeded(81),observed=[];let lastDrop=null,evade=0;
  for(let i=0;i<120*45&&r.status==='running'&&r.bossesDefeated===0;i++){
   // Piloto conhece as posições; só usa comandos públicos, sem mudar estado de ameaça/proteção.
   const drop=r.obstacles.find(o=>o.falling&&o.age<o.warningFor+o.fallFor);
   if(drop&&drop!==lastDrop){lastDrop=drop;evade=r.player.x<175?1:-1;}
   const clear=drop&&(evade<0?r.player.x+31<drop.x-10:r.player.x+5>drop.x+drop.width+10);
   core.moveRun(r,drop&&!clear&&r.player.y===0?evade:0);
   const incoming=r.obstacles.filter(o=>!o.falling&&!o.passed&&o.x+o.width>=r.player.x).sort((a,b)=>a.x-b.x)[0];
   if(incoming){const until=core.threatTimeToContact?core.threatTimeToContact(r,incoming):(incoming.x-(r.player.x+28))/incoming.speed;
    if(incoming.action==='crouch')core.crouchRun(r,true);
    else if(until<.185&&r.player.y===0){core.crouchRun(r,false);core.jumpRun(r);}
   }else core.crouchRun(r,false);
   const before=r.boss?.fired||0;core.advanceRun(r,dt,rng);if(r.boss&&r.boss.fired>before)observed.push(r.obstacles.at(-1));
  }
  assert.equal(r.status,'running',`${type} ${width}: ${JSON.stringify(r.lastHit)}`);assert.equal(r.bossesDefeated,1,type);assert.ok(r.nextBossAt>=r.routeDistance+7000-1e-7);
  if(type==='janones')assert.ok(observed.some(o=>o.type==='message')&&observed.some(o=>o.action==='crouch'));
  if(type==='pf')assert.ok(observed.some(o=>o.falling),'blitz usa quedas posicionais');
 }
});
test('avanço à borda da arena conserva aviso e velocidade de travessia saltável',()=>{
 const r=start('janones',480);r.player.x=280;core.advanceRun(r,dt,()=>.5);r.boss.nextAttack=0;core.advanceRun(r,dt,()=>.5);
 const o=r.obstacles.at(-1);assert.ok(o.speed>=180,'baixa precisa cruzar a hitbox durante um salto');assert.ok(o.waitFor>0,'aviso segura a arma antes do disparo próximo');
 assert.ok(core.threatTimeToContact(r,o)>=1,'avanço não transforma o lançamento em colisão sem aviso');
});
test('primeiro ciclo dos cinco chefes conserva metas-base e só a volta seguinte cresce',()=>{
 for(const [round,type,base] of [[0,'haddad',9],[1,'lula',10],[2,'xandao',12],[3,'janones',9],[4,'pf',8]]){
  assert.equal(core.bossAtRound(round).foe.type,type);assert.equal(core.bossAtRound(round).attacks,base);
  assert.equal(core.bossAtRound(round+5).attacks,base+2);
 }
});
test('Joice inclui queda comprometida e não a sobrepõe a um chefão',()=>{
 const r=start('haddad');r.nextBossAt=Infinity;r.routeDistance=1000;r.nextRaid=0;const rng=seeded(83),drops=[];r.shieldFor=Infinity;
 for(let i=0;i<120*14;i++){core.advanceRun(r,dt,rng);for(const o of r.obstacles)if(o.falling&&!drops.includes(o))drops.push(o);assert.equal(r.boss,null);}
 assert.ok(drops.length>=1&&drops.length<=3);assert.ok(drops.every(o=>o.warningFor>=1.2));
});
