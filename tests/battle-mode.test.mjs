import test from 'node:test';
import assert from 'node:assert/strict';
import {ROSTER,createBattle,stepBattle,STEP,queueAction,randomMatchup} from '../tanahoraflavio/battle/battle-core.mjs';
const tick=(g,n,input={},cpuInput={})=>{for(let i=0;i<n;i++)stepBattle(g,i===0?input:{...input,press:[]},STEP,{cpuInput:i===0?cpuInput:{...cpuInput,press:[]}});};
const fight=(opts={})=>{const g=createBattle(opts);tick(g,160);assert.equal(g.status,'fight');return g;};
test('all selectable characters have individual powers and combat attributes',()=>{assert.equal(ROSTER.length,23);assert.ok(ROSTER.every(r=>r.power?.name&&r.hp>0&&r.speed>0));assert.ok(new Set(ROSTER.map(r=>r.power.name)).size===ROSTER.length);});
test('fighters walk freely without auto-running and stop at arena boundaries',()=>{const g=fight(),a=g.fighters[0];const x=a.x;tick(g,60);assert.equal(a.x,x);tick(g,40,{right:true});assert.ok(a.x>x);tick(g,180,{left:true});assert.equal(a.x,42);});
test('melee attack requires range, then applies hitstun; low guard blocks low, not overhead',()=>{const g=fight(),[a,b]=g.fighters;const initial=b.hp;tick(g,60,{press:['light']});assert.equal(b.hp,initial);a.x=380;b.x=455;tick(g,50,{press:['light']});assert.ok(b.hp<initial);const h=fight(),[p,o]=h.fighters;p.x=380;o.x=455;tick(h,45,{press:['heavy'],down:true},{guard:true,down:true});const blocked=o.maxHp-o.hp;assert.ok(blocked>0&&blocked<=3);const j=fight(),[u,v]=j.fighters;u.x=380;v.x=455;tick(j,45,{press:['heavy']},{guard:true,down:true});assert.ok(v.maxHp-v.hp>blocked);});
test('special uses selected character power, consumes meter and creates real projectile',()=>{for(const id of ['flavio','xandao','lula','janones','dilma','boulos']){const g=fight({player:id}),a=g.fighters[0];tick(g,40,{press:['special']});assert.equal(a.meter,5);assert.ok(g.projectiles.length>0);assert.equal(g.projectiles[0].type,a.def.power.projectile);}});
test('rounds reset combat but retain score, two victories end the match',()=>{const g=fight();g.fighters[1].hp=0;tick(g,1);assert.equal(g.score[0],1);assert.equal(g.status,'roundover');tick(g,420);assert.equal(g.status,'fight');assert.equal(g.round,2);assert.equal(g.fighters[1].hp,g.fighters[1].maxHp);g.fighters[1].hp=0;tick(g,1);assert.equal(g.status,'finished');assert.deepEqual(g.score,[2,0]);});
test('CPU acts and simulation remains bounded across match',()=>{const g=createBattle({difficulty:'hard',seed:9});for(let i=0;i<120*80&&g.status!=='finished';i++)stepBattle(g,{right:i%240<120,press:i%80===0?['heavy']:[]});assert.ok(g.fighters.every(f=>Number.isFinite(f.x)&&f.x>=42&&f.x<=858&&f.hp>=0&&f.hp<=f.maxHp));assert.ok(g.score.some(n=>n>0)||g.fighters.some(f=>f.hp<f.maxHp));assert.ok(g.projectiles.length<=32);});

test('time out compares remaining life proportion instead of raw HP',()=>{
 const g=fight({player:'flavio',boss:'xandao'}),[a,b]=g.fighters;
 a.hp=b.hp=50;g.clock=STEP/2;tick(g,1);
 assert.equal(g.result.winner,0);assert.equal(g.result.reason,'TEMPO');
});
test('a hit-confirmed light attack may link into a heavy and award a combo',()=>{
 const g=fight(),[a,b]=g.fighters;a.x=380;b.x=455;
 tick(g,15,{press:['light']});assert.ok(a.connected);
 tick(g,55,{press:['heavy']});assert.ok(a.combo>=2);assert.ok(b.hp<b.maxHp-10);
});

test('random matchup selects valid distinct fighters and a valid arena',()=>{
 for(let i=0;i<=100;i++){
  const match=randomMatchup(()=>i/100);
  assert.ok(ROSTER.some(f=>f.id===match.player));
  assert.ok(ROSTER.some(f=>f.id===match.boss));
  assert.ok(match.boss!=='flavio'&&match.boss!==match.player);
  const g=createBattle(match);
  assert.equal(g.stage,match.stage);
 }
});
