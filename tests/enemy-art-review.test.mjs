import test from 'node:test';
import assert from 'node:assert/strict';
import * as art from '../tanahoraflavio/runner-art.mjs';
import * as core from '../tanahoraflavio/runner-core.mjs';
function canvas(){const calls=[];return {calls,save(){},restore(){},translate(...x){calls.push(['translate',...x]);},scale(...x){calls.push(['scale',...x]);},rotate(...x){calls.push(['rotate',...x]);},beginPath(){},closePath(){},moveTo(){},lineTo(){},bezierCurveTo(){},quadraticCurveTo(){},ellipse(){},fill(){},stroke(){},roundRect(){},fillText(s){calls.push(['text',s]);}}}
test('todos os personagens possuem uma identidade de arma definida',()=>{
 for(const type of ['pf','janones','army','boulos','dino','xandao','haddad','lula','dilma','simone','soraya','joice','meme-army','bossonari'])assert.ok(art.enemyWeaponFor(type),type);
});
test('gesto L acompanha a largura física e fantasma final tem silhueta própria',()=>{
 const c=canvas();art.drawThreat(c,{type:'lhand',x:100,width:60,height:46,action:'jump'},246,0,{reducedMotion:true});
 assert.ok(c.calls.some(v=>v[0]==='scale'&&v[1]===60/46));
 const ghost=canvas();art.drawComunismoGhostBoss(ghost,{preparing:true,reducedMotion:true});
 assert.ok(ghost.calls.some(v=>v[0]==='text'&&v[1]==='FANTASMA DO COMUNISMO'));
 assert.equal(core.bossAtRound(5,'bossonari').attacks,14);
 assert.match(core.bossAtRound(5,'bossonari').foe.name,/Fantasma do Comunismo/);
});

test('o encontro final inclui investidas reais do fantasma além dos frascos',()=>{
 const r=core.createRun({mode:'story'});core.startRun(r);r.bossesDefeated=5;
 r.distance=r.routeDistance=57000;r.nextBossAt=0;r.shieldFor=Infinity;
 for(const k of ['nextObstacle','nextRaid','nextAllyAt','nextSupportAt','nextPower','nextPassport'])r[k]=Infinity;
 const seen=new Set();
 for(let i=0;i<120*42&&r.status==='running';i++){core.advanceRun(r,1/120,()=>.5);for(const o of r.obstacles)if(o.bossAttack)seen.add(o.type);}
 assert.ok(seen.has('meme-ghost'));assert.ok(seen.has('cloroquina-prop'));assert.ok(seen.has('ivermectina-prop'));
 assert.equal(r.status,'ballot');
});
