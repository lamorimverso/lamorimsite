import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import * as core from '../tanahoraflavio/runner-core.mjs';
const ui=readFileSync(new URL('../tanahoraflavio/runner.mjs',import.meta.url),'utf8'),DT=1/120;
function run(width=900){const r=core.createRun();core.startRun(r);core.resizeRun(r,width);r.player.x=width/2;r.shieldFor=Infinity;for(const k of ['nextBossAt','nextRaid','nextObstacle','nextAllyAt','nextSupportAt','nextPower','nextPassport'])r[k]=Infinity;return r;}
function advance(r,t){for(let i=0;i<Math.ceil(t/DT);i++)core.advanceRun(r,DT,()=>.5);}
test('perseguidor ultrapassado continua desenhado no mesmo caminho real da partida',()=>{
 const start=ui.indexOf('  function obstacle(item){'),end=ui.indexOf('  function pickup(item){',start),r=run(),seen=[];
 const ctx=new Proxy({},{get:()=>()=>{}});
 const draw=Function('env','const {run,ctx,WORLD,playerX,threatTimeToContact,prefersReducedMotion,drawFallingThreat,drawManholeThreat,drawProjectile,drawThreat}=env;'+ui.slice(start,end)+';return obstacle;')({run:r,ctx,WORLD:core.WORLD,playerX:core.playerX,threatTimeToContact:core.threatTimeToContact,prefersReducedMotion:()=>false,drawFallingThreat(){},drawManholeThreat(){},drawProjectile(){},drawThreat(c,o){seen.push(o);}});
 const o={type:'pf',x:300,width:34,height:44,action:'jump',passed:true};draw(o);assert.deepEqual(seen,[o]);
});
test('retaguarda percorre a largura inteira depois de ultrapassar o jogador',()=>{
 for(const width of [480,900]){const r=run(width),o={type:'pf',x:r.player.x+130,width:34,height:44,action:'jump',approach:'rear',speed:-180,passed:true};r.obstacles=[o];advance(r,.1);assert.ok(r.obstacles.includes(o),'não remover perto do Flávio');advance(r,(width+180-o.x)/180);assert.ok(!r.obstacles.includes(o),'limpeza acontece após borda');}
});
test('sprites largos continuam presentes perto da borda esquerda e saem sem acumular',()=>{
 const r=run(),o={type:'meme-army',x:-65,width:46,height:44,action:'jump',speed:180,passed:true};r.obstacles=[o];advance(r,DT);assert.ok(r.obstacles.includes(o),'a arte ainda pode ocupar a borda');advance(r,2);assert.equal(r.obstacles.length,0);
});
test('mostrar personagem evadido não reativa sua colisão ao voltar',()=>{
 const r=run(),o={type:'pf',x:320,width:34,height:44,action:'jump',speed:0,passed:true};r.obstacles=[o];r.shieldFor=0;r.player.x=320;advance(r,.5);assert.equal(r.status,'running');assert.equal(o.passed,true);
});
test('emissor temporário sai pela borda antes do fim da aparição',async()=>{
 const pose=await import('../tanahoraflavio/runner-cast-pose.mjs');assert.equal(typeof pose.regularEmitterExitPose,'function');
 for(const width of [480,900]){const start=pose.regularEmitterExitPose('dilma',width,246,1),end=pose.regularEmitterExitPose('dilma',width,246,.005);assert.ok(start.x<width);assert.ok(end.x>width+60,'corpo inteiro sai da tela antes de encerrar');}
});
