import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRun,startRun,advanceRun} from '../tanahoraflavio/runner-core.mjs';

function runFor(mode){
 const r=createRun({mode,seed:144});startRun(r);
 for(const key of ['nextBossAt','nextRaid','nextObstacle','nextPickup','nextPower','nextSupportAt','nextAllyAt','nextPassport'])r[key]=Infinity;
 r.terrain.nextAt=Infinity;r.graceFor=1000;
 return r;
}
test('Story and Infinite automatically progress without held left/right input',()=>{
 for(const mode of ['story','endless']){
  const r=runFor(mode),before=r.distance;
  for(let i=0;i<120;i++)advanceRun(r,1/120);
  assert.equal(r.status,'running');
  assert.equal(r.player.moveHeld,0);
  assert.equal(r.manualStory,false);
  assert.ok(r.distance>before+100,mode+' must advance without manually moving the camera');
 }
});
test('production HTML and game UI describe automatic movement in both modes',async()=>{
 const html=await readFile(new URL('../tanahoraflavio/index.html',import.meta.url),'utf8');
 const entry=await readFile(new URL('../tanahoraflavio/runner.mjs',import.meta.url),'utf8');
 assert.ok(html.includes('Nos dois modos, a corrida avança automaticamente.'));
 assert.match(html,/id="game-mode-story"[^>]*value="story"/);
 assert.match(html,/id="game-mode-infinite"[^>]*value="endless"/);
 assert.ok(!html.includes('História · Corrida automática'),'the removed decorative badge must stay removed');
 assert.ok(!html.includes('No modo História, use A/D ou ←/→ para caminhar'));
 assert.ok(entry.includes('manualStory:false'));
});
