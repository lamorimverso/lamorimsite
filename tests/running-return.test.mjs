import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as core from '../tanahoraflavio/runner-core.mjs';
import {createPressGate,fireBindingFor} from '../tanahoraflavio/runner-input.mjs';
const ui=readFileSync(new URL('../tanahoraflavio/runner.mjs',import.meta.url),'utf8');
test('perseguidores comuns usam o desenho de corrida sem nave',()=>{
 const start=ui.indexOf('  function obstacle(item){'),end=ui.indexOf('  function pickup(item){',start);
 const run=core.createRun();run.elapsed=3;const seen=[];
 const ctx=new Proxy({},{get:()=>()=>{}});
 const draw=Function('env','const {run,ctx,WORLD,playerX,threatTimeToContact,prefersReducedMotion,drawFallingThreat,drawManholeThreat,drawProjectile,drawHoverEnemy,drawThreat}=env;'+ui.slice(start,end)+';return obstacle;')({run,ctx,WORLD:core.WORLD,playerX:core.playerX,threatTimeToContact:core.threatTimeToContact,prefersReducedMotion:()=>false,drawFallingThreat(){},drawManholeThreat(){},drawProjectile(){},drawHoverEnemy(){seen.push('ship');},drawThreat(c,item,ground,phase){seen.push({type:item.type,ground,phase});}});
 for(const type of ['pf','janones','army','boulos','dino','lula','xandao','haddad'])draw({type,x:300,width:34,height:44,action:'jump'});
 draw({type:'pf',x:100,width:34,height:44,action:'jump',passed:true});
 assert.equal(seen.length,8,'perseguidor evadido deixa de sobrepor o retorno');assert.ok(seen.every(row=>typeof row==='object'&&row.ground===246&&row.phase>0));
});
test('W pula uma vez por pressionamento usando o handler real',()=>{
 const start=ui.indexOf('  section.addEventListener("keydown", event => {'),end=ui.indexOf('  document.addEventListener("keyup",event=>{',start);
 let handler,jumps=0;const section={addEventListener(type,f){handler=f;}},jumpKeys=createPressGate();
 Function('env','const {run,section,isFireKey,jumpKeys,jump}=env;'+ui.slice(start,end))({run:{status:'running'},section,isFireKey:code=>fireBindingFor('default').keys.includes(code),jumpKeys,jump(){jumps++;}});
 const event={code:'KeyW',repeat:false,target:{closest(){return null;}},preventDefault(){}};
 handler(event);handler(event);handler({...event,repeat:true});assert.equal(jumps,1);
 jumpKeys.release('KeyW');handler(event);assert.equal(jumps,2);
});
