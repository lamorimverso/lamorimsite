import test from 'node:test';
import assert from 'node:assert/strict';
let clock={};
try{clock=await import('../tanahoraflavio/runner-clock.mjs');}catch(e){if(e.code!=='ERR_MODULE_NOT_FOUND')throw e;}
test('quadros atrasados avançam a corrida com trabalho limitado em vez de congelar',()=>{
 assert.equal(typeof clock.createFrameClock,'function');const c=clock.createFrameClock(0);let steps=0;
 for(const now of [300,600,900,1200])steps+=clock.advanceFrameClock(c,now).steps;
 assert.ok(steps>=40&&steps<=80,'mesmo com atraso há movimento e limite de processamento');
});
test('60 Hz e 120 Hz simulam a mesma quantidade de tempo',()=>{
 assert.equal(typeof clock.createFrameClock,'function');const counts=[];
 for(const hz of [60,120]){const c=clock.createFrameClock(0);let steps=0;for(let i=1;i<=hz;i++)steps+=clock.advanceFrameClock(c,i*1000/hz).steps;counts.push(steps);}
 assert.ok(Math.abs(counts[0]-counts[1])<=1);assert.ok(counts[0]>=119&&counts[0]<=120);
});
test('reiniciar o relógio ao retomar não recupera tempo da aba oculta',()=>{
 assert.equal(typeof clock.createFrameClock,'function');const c=clock.createFrameClock(0);clock.advanceFrameClock(c,16);
 clock.resetFrameClock(c,60000);assert.ok(clock.advanceFrameClock(c,60016).steps<=2);
});
