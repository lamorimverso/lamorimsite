import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
import * as art from '../tanahoraflavio/runner-art.mjs';
test('emissor está acima da pista e projéteis mantêm origem física e tempo original',()=>{
 for(const width of [480,612,900]){
  const r=core.createRun();core.startRun(r);r.viewportWidth=width;r.nextRaid=Infinity;r.nextBossAt=0;r.bossBag=['lula'];
  core.advanceRun(r,1/120,()=>.5);r.boss.nextAttack=0;core.advanceRun(r,1/120,()=>.5);
  const o=r.obstacles.at(-1),pose=art.enemyEmitterPose(width,246,'lula',true);
  assert.equal(o.x,width-104);assert.equal(o.flightStyle,'glide');
  assert.ok(pose.y<246-o.y-o.height/2);
  assert.ok(Math.abs(pose.x-(o.x+o.width/2))>70);
  assert.ok(Math.abs(core.threatTimeToContact(r,o)-1.15)<.03);
 }
});
test('famílias têm estilos próprios, sem substituir a trajetória física',()=>{
 assert.equal(core.projectileStyle('wind'),'wind');
 assert.equal(core.projectileStyle('budget-sheets'),'paper');
 assert.equal(core.projectileStyle('hammer'),'metal');
 assert.equal(core.projectileStyle('parachute-cross'),'fall');
 assert.equal(core.projectileStyle('meme-ghost'),'ghost');
 assert.equal(core.projectileStyle('lhand'),'glide');
});
function canvas(){const ops=[];return {ops,globalAlpha:1,save(){},restore(){},translate(...v){ops.push(['translate',...v]);},rotate(...v){ops.push(['rotate',...v]);},scale(){},beginPath(){},closePath(){},ellipse(){},moveTo(){},lineTo(){},bezierCurveTo(){},quadraticCurveTo(){},fill(){},stroke(){},roundRect(){},fillText(s){ops.push(['text',s]);}}}
test('preparação não desenha a arma inteira; voo é desenhado na coordenada física',()=>{
 const item={type:'message',x:200,width:44,height:36,y:90,launchX:300,flightStyle:'glide',action:'jump',waitFor:.18};
 const c=canvas();art.drawProjectile(c,item,246,0);assert.ok(!c.ops.some(o=>o[0]==='text'&&o[1]==='URGENTE'));
 item.waitFor=0;item.launched=true;art.drawProjectile(c,item,246,3);
 assert.ok(c.ops.some(o=>o[0]==='text'&&o[1]==='URGENTE'));
 assert.ok(c.ops.some(o=>o[0]==='translate'&&o[1]===222&&o[2]===156));
});
test('o emissor não contém miniatura da arma, mesmo em preparação e ataque',()=>{
 const c=canvas();
 art.drawEnemyActor(c,{type:'meme-army',weapon:'message',preparing:true,attacking:true});
 assert.ok(!c.ops.some(o=>o[0]==='text'&&o[1]==='URGENTE'));
});
