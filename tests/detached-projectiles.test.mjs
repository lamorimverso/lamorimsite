import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
import * as art from '../tanahoraflavio/runner-art.mjs';
test('origem do disparo separada do emissor e protegida em toda largura',()=>{
 for(const width of [480,640,900])for(const pos of [70,220,width-65]){
  const r=core.createRun();r.viewportWidth=width;r.player.x=pos;
  const x=core.projectileOrigin(r,60);
  assert.ok(x>=pos+60);
  if(pos<width-270)assert.ok(x+60<width-100);
 }
});
test('famílias de projéteis têm curvas próprias e altura de contato idêntica à anunciada',()=>{
 const styles=['wind','paper','metal','fall','ghost','glide'];
 const vals=styles.map(flightStyle=>core.projectileHeightAt({launchY:90,targetY:90,flightStyle},.3));
 assert.equal(new Set(vals).size,styles.length);
 for(const flightStyle of styles)for(const p of [.6,.8,1])assert.equal(core.projectileHeightAt({launchY:90,targetY:90,flightStyle},p),90);
});
test('chefão cria projétil independente, prepara e dispara sem mudar o objetivo',()=>{
 const r=core.createRun({mode:'story',seed:73});core.startRun(r);
 r.nextBossAt=0;r.bossBag=['lula'];r.nextRaid=Infinity;r.shieldFor=Infinity;
 for(let i=0;i<120*5&&!r.obstacles.some(o=>o.bossAttack);i++)core.advanceRun(r,1/120,()=>.5);
 const o=r.obstacles.find(o=>o.bossAttack);assert.ok(o);assert.equal(o.type,'lhand');assert.ok(o.waitFor>0);
 const start=o.x;for(let i=0;i<120;i++)core.advanceRun(r,1/120,()=>.5);
 assert.ok(o.launched);assert.ok(o.x<start);assert.equal(o.flightStyle,'glide');
});
function canvas(){const ops=[];return {ops,globalAlpha:1,save(){},restore(){},translate(...v){ops.push(['translate',...v]);},rotate(...v){ops.push(['rotate',...v]);},scale(){},beginPath(){},closePath(){},ellipse(){},moveTo(){},lineTo(){},bezierCurveTo(){},quadraticCurveTo(){},fill(){},stroke(){},roundRect(){},fillText(s){ops.push(['text',s]);}}}
test('preparação não desenha a arma inteira; voo é desenhado na coordenada física',()=>{
 const item={type:'message',x:200,width:44,height:36,y:90,launchX:300,flightStyle:'glide',action:'jump',waitFor:.18};
 const c=canvas();art.drawProjectile(c,item,246,0);assert.ok(!c.ops.some(o=>o[0]==='text'&&o[1]==='URGENTE'));
 item.waitFor=0;item.launched=true;art.drawProjectile(c,item,246,3);
 assert.ok(c.ops.some(o=>o[0]==='text'&&o[1]==='URGENTE'));
 assert.ok(c.ops.some(o=>o[0]==='translate'&&o[1]===222&&o[2]===156));
});
