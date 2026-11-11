import test from 'node:test';
import assert from 'node:assert/strict';
import * as art from '../runner-art.mjs';
import * as core from '../runner-core.mjs';
import {definitions} from '../runner-sprite-data.mjs';

function canvas(){
 const calls=[];
 const ctx={calls,globalAlpha:1};
 for(const name of ['save','restore','translate','rotate','scale','beginPath','closePath','moveTo','lineTo','bezierCurveTo','quadraticCurveTo','ellipse','fill','stroke','roundRect','fillText','drawImage'])
  ctx[name]=(...args)=>calls.push([name,...args]);
 return ctx;
}
test('corpo de cada família de projétil anima sem depender somente das partículas',()=>{
 for(const [type,style] of [['lhand','glide'],['message','glide'],['receipts','paper'],['hammer','metal'],['wind','wind'],['meme-ghost','ghost'],['parachute-cross','fall']]){
  const item={type,flightStyle:style,x:200,width:46,height:44,y:70,launchX:350,action:'jump',launched:true};
  const a=canvas(),b=canvas();art.drawProjectile(a,item,246,0);art.drawProjectile(b,item,246,9);
  const body=ctx=>ctx.calls.find(c=>c[0]==='rotate')?.[1];
  assert.notEqual(body(a),body(b),type+' continua com o corpo estático');
  const low=canvas(),later=canvas();
  art.drawProjectile(low,item,246,0,{reducedMotion:true});art.drawProjectile(later,item,246,9,{reducedMotion:true});
  assert.deepEqual(low.calls,later.calls,'redução de movimento '+type);
 }
});
test('rastro fica atrás do deslocamento também em disparo para a direita',()=>{
 const item={type:'message',flightStyle:'glide',x:200,width:44,height:36,y:70,launchX:100,speed:-180,launched:true};
 const c=canvas();art.drawProjectile(c,item,246,4);
 const tail=c.calls.find(v=>v[0]==='quadraticCurveTo');
 assert.ok(tail&&tail[3]<222,'rastro da retaguarda deve apontar para a esquerda');
});
test('perseguidor no chão alterna os recortes reais de corrida',async t=>{
 const original=globalThis.Image;
 globalThis.Image=class{set src(url){const def=Object.values(definitions).find(d=>d.url===url);this.naturalWidth=def.width;this.naturalHeight=def.height;queueMicrotask(()=>this.onload?.());}};
 t.after(()=>{if(original===undefined)delete globalThis.Image;else globalThis.Image=original;});
 await art.loadSprites();
 for(const type of ['pf','janones','army','haddad','lula','xandao','boulos','dino']){
  const a=canvas(),b=canvas();
  art.drawThreat(a,{type,x:100,width:40,height:46},246,0);
  art.drawThreat(b,{type,x:100,width:40,height:46},246,1);
  assert.notDeepEqual(a.calls.find(c=>c[0]==='drawImage')?.slice(2,6),b.calls.find(c=>c[0]==='drawImage')?.slice(2,6),type);
 }
});
test('antecipação de projétil não causa dano antes do lançamento',()=>{
 const r=core.createRun();core.startRun(r);
 for(const k of ['nextBossAt','nextRaid','nextObstacle','nextPower','nextPassport','nextPickup','nextAllyAt','nextSupportAt'])r[k]=Infinity;
 r.obstacles=[{type:'message',x:125,width:44,height:36,y:22,launchY:22,targetY:22,launchX:147,targetX:137,projectile:true,waitFor:1,speed:180}];
 core.advanceRun(r,1/120);
 assert.equal(r.status,'running','o aviso sem corpo físico não pode matar');
 r.obstacles[0].waitFor=0;core.advanceRun(r,1/120);
 assert.equal(r.status,'over','o mesmo disparo lançado deve colidir');
});
test('pose de disparo do chefe começa no lançamento, após a espera reservada',()=>{
 const r=core.createRun();core.startRun(r);r.viewportWidth=480;r.player.x=390;r.shieldFor=Infinity;
 r.nextBossAt=0;r.bossBag=['lula'];r.nextRaid=Infinity;
 core.advanceRun(r,1/120,()=>.5);r.boss.nextAttack=0;
 core.advanceRun(r,1/120,()=>.5);
 const shot=r.obstacles.at(-1);
 assert.ok(shot.waitFor>0);
 assert.equal(r.boss.attackFlashFor,0,'não disparar visualmente durante a preparação');
 for(let i=0;i<240&&!shot.launched;i++)core.advanceRun(r,1/120,()=>.5);
 assert.equal(shot.launched,true);
 assert.ok(r.boss.attackFlashFor>0,'o disparo real deve animar o emissor');
});
