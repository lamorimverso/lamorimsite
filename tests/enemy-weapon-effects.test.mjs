import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
import * as art from '../tanahoraflavio/runner-art.mjs';
function canvas(){
 const calls=[];
 return {calls,save(){},restore(){},translate(...v){calls.push(['translate',...v]);},rotate(...v){calls.push(['rotate',...v]);},scale(...v){calls.push(['scale',...v]);},
  beginPath(){},closePath(){},moveTo(...v){calls.push(['move',...v]);},lineTo(...v){calls.push(['line',...v]);},
  bezierCurveTo(...v){calls.push(['bezier',...v]);},quadraticCurveTo(...v){calls.push(['quadratic',...v]);},
  ellipse(...v){calls.push(['ellipse',...v]);},fill(){},stroke(){},roundRect(...v){calls.push(['rect',...v]);},
  fillText(...v){calls.push(['text',...v]);}};
}
test('vendaval tem várias camadas e muda de geometria a cada quadro sem quebrar redução de movimento',()=>{
 const a=canvas(),b=canvas(),low=canvas(),lowLater=canvas();
 art.drawWindVortex(a,{phase:0});art.drawWindVortex(b,{phase:32});
 assert.ok(a.calls.filter(v=>v[0]==='bezier').length>=10,'vendaval precisa de várias curvas, não 3 linhas');
 assert.notDeepEqual(a.calls,b.calls,'efeito não pode continuar como imagem estática');
 art.drawWindVortex(low,{phase:0,reducedMotion:true});
 art.drawWindVortex(lowLater,{phase:33,reducedMotion:true});
 assert.deepEqual(low.calls,lowLater.calls,'acessibilidade não pode criar animação involuntária');
});
test('armas dos inimigos têm efeitos próprios sem alterar propriedades físicas',()=>{
 const pairs=[['wind','crouch'],['budget-sheets','crouch'],['parachute-cross','crouch'],['handcuffs','crouch'],
  ['meme-ghost','crouch'],['receipts','jump'],['stamp','jump'],['lhand','crouch'],['hammer','jump'],
  ['mandado','crouch'],['message','jump'],['cloroquina-prop','jump'],['ivermectina-prop','crouch']];
 for(const [type,action] of pairs){
  const item={type,action,x:200,width:46,height:action==='crouch'?84:44,projectile:true};
  const before=structuredClone(item),ctx=canvas();
  assert.doesNotThrow(()=>art.drawThreat(ctx,item,246,25,{reducedMotion:false}),type);
  assert.deepEqual(item,before,'renderização não deve mutar hitbox/ataque '+type);
  assert.ok(ctx.calls.length>3,'arma sem desenho visual '+type);
 }
});
test('identidade da arma e comando do objetivo correspondem ao ataque real',()=>{
 const rows=[['wind','crouch','Dilma','Abaixe'],['budget-sheets','crouch','Simone','Abaixe'],
  ['parachute-cross','crouch','Soraya','Abaixe'],['handcuffs','crouch','PF','Abaixe'],
  ['hammer','jump','Xandão','Pule'],['mandado','crouch','Xandão','Abaixe'],
  ['message','jump','Janones','Pule'],['lhand','crouch','Lula','Abaixe'],
  ['cloroquina-prop','jump','Bossonari','Pule'],['ivermectina-prop','crouch','Bossonari','Abaixe'],
  ['pfizer-ampoule','move','Pfizer','Saia do alvo']];
 for(const [type,action,name,verb] of rows){
  const cue=core.attackCueFor({type,action});
  assert.ok(cue.label.includes(name),type);assert.equal(cue.verb,verb);
  assert.ok(cue.instruction.includes(cue.label));
 }
 assert.equal(core.attackCueFor(null),null);
});
test('chefões têm objetivos temáticos e quantitativo original preservado',()=>{
 const goals={haddad:'recibos',lula:'gestos',xandao:'mandados',janones:'Mensagens',pf:'algemas',bossonari:'frascos'};
 for(const [type,key] of Object.entries(goals)){
  const b=core.bossAtRound(0,type);
  assert.ok(b.objective.includes(String(b.attacks)));
  assert.ok(b.objective.includes(key),type+' está sem instrução própria');
  assert.ok(/Pule|abaixe|salto|agachamento/.test(b.objective));
 }
});
