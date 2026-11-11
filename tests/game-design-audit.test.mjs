import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as core from '../tanahoraflavio/runner-core.mjs';
import {nextStoryBossDistance} from '../tanahoraflavio/runner-bosses.mjs';
const dt=1/120;
const ui=readFileSync(new URL('../tanahoraflavio/runner.mjs',import.meta.url),'utf8');
function arena(mode='story',index=0,width=480){
 const r=core.createRun({mode});core.startRun(r);r.viewportWidth=width;r.bossesDefeated=index;
 r.distance=r.routeDistance=mode==='story'?nextStoryBossDistance(index):22000;r.nextBossAt=0;r.shieldFor=Infinity;
 for(const k of ['nextRaid','nextObstacle','nextAllyAt','nextSupportAt','nextPower','nextPassport'])r[k]=Infinity;
 core.advanceRun(r,dt,()=>.5);return r;
}
test('recuperação só começa depois do último lançamento reservado',()=>{
 for(const width of [480,900])for(let index=0;index<20;index++){
  const r=arena('story',index,width),seen=new WeakSet();
  for(let i=0;i<120*20;i++){
   core.advanceRun(r,dt,()=>.5);
   for(const o of r.obstacles)if(o.bossAttack&&o.projectile&&o.launched&&!seen.has(o)){
    seen.add(o);assert.notEqual(r.boss.phase,'recover',`${width}px/encontro ${index}: disparo durante recuperação`);
   }
  }
 }
});
test('disparo para trás nasce na mão voltada ao alvo, sem atravessar o próprio corpo',()=>{
 const r=arena('endless',0,900);r.player.x=core.playerBounds(r).max;
 assert.equal(core.attackRun(r),true);const shot=r.heroShots.at(-1);
 assert.ok(shot.vx<0);assert.ok(shot.x<r.player.x+core.PLAYER.width/2,'origem do lado errado');
});
test('atalhos de disparo funcionam com o próprio botão Disparar focado',()=>{
 const start=ui.indexOf('  section.addEventListener("keydown", event => {');
 const end=ui.indexOf('  document.addEventListener("keyup",event=>{',start);
 let handler,shots=0,prevented=false;
 const section={addEventListener(type,callback){handler=callback;}};
 Function('env','const {run,section,fire}=env;'+ui.slice(start,end))({run:{status:'running'},section,fire(){shots++;}});
 const button={};
 handler({code:'KeyJ',repeat:false,target:{closest(selector){return selector.includes('button')||selector==='#game-attack'?button:null;}},preventDefault(){prevented=true;}});
 assert.equal(shots,1,'o próprio controle não pode bloquear J/Z');assert.equal(prevented,true);
});
test('HUD do Infinito apresenta energia restante quando Flávio pode atirar',()=>{
 const r=arena('endless',0,900);r.boss.hp--;
 const nodes=new Map(),$=id=>{if(!nodes.has(id))nodes.set(id,{style:{setProperty(){}},setAttribute(){}});return nodes.get(id);};
 const start=ui.indexOf('    if(run.boss){'),end=ui.indexOf('    const liveAttack=',start);
 Function('env','const {run,$,section,bossCue,attackCueFor}=env;'+ui.slice(start,end))({run:r,$,section:{dataset:{}},bossCue:()=>r.boss.plannedAttack,attackCueFor:core.attackCueFor});
 assert.match($('game-boss-weapon').textContent,/PV 17\/18/,'acertos precisam de feedback de vida visível');
});
