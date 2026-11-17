import test from 'node:test';
import assert from 'node:assert/strict';
import {advanceRun,createRun,jumpRun,startRun} from '../tanahoraflavio/runner-core.mjs';
const dt=1/120;
function lip(){
 const run=createRun({seed:8});startRun(run);
 for(const key of ['nextBossAt','nextRaid','nextObstacle','nextAllyAt','nextSupportAt'])run[key]=Infinity;
 run.terrain.active={kind:'gap-platform',speed:0,age:0,gaps:[{x:90,width:700}],platforms:[],ceilings:[]};
 return run;
}
test('one normal jump remains available just after the character leaves the ledge',()=>{
 const run=lip();for(let i=0;i<7;i++)advanceRun(run,dt);
 assert.equal(run.player.grounded,false);
 assert.ok(run.player.y<0,'the player already left support');
 assert.equal(jumpRun(run),true);
 assert.equal(run.player.velocity,610);
 assert.equal(run.player.airJumpsUsed,0);
 assert.equal(jumpRun(run),false,'taking off cannot grant a second normal jump');
});
test('the ledge grace expires and does not arm after an intentional jump',()=>{
 const late=lip();for(let i=0;i<13;i++)advanceRun(late,dt);
 assert.equal(jumpRun(late),false);
 const launched=lip();assert.equal(jumpRun(launched),true);advanceRun(launched,dt);
 assert.equal(jumpRun(launched),false);
 const transformed=lip();transformed.player.isJacare=true;advanceRun(transformed,dt);
 assert.equal(jumpRun(transformed),false);
 assert.equal(transformed.player.jacareProgress,0);
});
