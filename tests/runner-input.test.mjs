import test from 'node:test';
import assert from 'node:assert/strict';

// The gate must reject a held key even when a device omits repeat=true.
test('um pressionamento só gera um comando até a tecla ser solta',async()=>{
 const {createPressGate}=await import('../tanahoraflavio/runner-input.mjs');
 const gate=createPressGate();
 assert.equal(gate.press('ArrowUp'),true);
 assert.equal(gate.press('ArrowUp'),false);
 assert.equal(gate.press('ArrowUp',{repeat:true}),false);
 gate.release('ArrowUp');assert.equal(gate.press('ArrowUp'),true);
});
test('repetição sem início não conta e limpar foco permite novo comando',async()=>{
 const {createPressGate}=await import('../tanahoraflavio/runner-input.mjs');
 const gate=createPressGate();
 assert.equal(gate.press('Space',{repeat:true}),false);
 assert.equal(gate.press('Space'),true);
 assert.equal(gate.press('ArrowUp'),true);
 gate.clear();assert.equal(gate.press('Space'),true);
 assert.equal(gate.press(''),false);
});
test('agachamento continua ativo até todas as fontes mantidas serem soltas',async()=>{
 const {createHeldSources}=await import('../tanahoraflavio/runner-input.mjs');
 assert.equal(typeof createHeldSources,'function');
 const input=createHeldSources();input.set('touch:7',true);input.set('key:ArrowDown',true);
 input.set('key:ArrowDown',false);assert.equal(input.active,true);
 input.set('key:S',true);input.set('touch:7',false);assert.equal(input.active,true);
 input.set('key:ArrowDown',true);input.set('key:S',false);assert.equal(input.active,true);
 input.set('key:ArrowDown',false);assert.equal(input.active,false);
});
test('toggle e cancelamento agregam fontes sem deixar entradas retidas',async()=>{
 const {createHeldSources}=await import('../tanahoraflavio/runner-input.mjs');
 assert.equal(typeof createHeldSources,'function');
 const input=createHeldSources();input.toggle('touch-toggle');input.set('key:S',true);
 input.toggle('touch-toggle');assert.equal(input.active,true);
 input.clear();assert.equal(input.active,false);
});
