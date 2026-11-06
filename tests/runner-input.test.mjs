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
