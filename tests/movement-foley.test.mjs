import test from 'node:test';import assert from 'node:assert/strict';
test('the earned midair impulse sounds once without requiring another ground takeoff',async()=>{
 const {createMovementSoundDirector}=await import('../tanahoraflavio/runner-movement-audio.mjs');
 const sounds=[],d=createMovementSoundDirector({play:id=>sounds.push(id)}),r={status:'running',elapsed:0,player:{x:120,y:0,supportY:0,grounded:true,velocity:0,airJumpsUsed:0,moveHeld:0,crouching:false,isJacare:false}};
 d.reset(r);r.player.grounded=false;r.player.velocity=610;d.update(r);
 r.player.y=60;r.player.velocity=200;r.elapsed=.2;d.update(r);
 r.player.airJumpsUsed=1;r.player.velocity=610;r.elapsed=.3;d.update(r);d.update(r);
 assert.deepEqual(sounds,['jump','jump']);
 r.player.y=0;r.player.velocity=0;r.player.grounded=true;r.player.airJumpsUsed=0;r.elapsed=1;d.update(r);
 assert.deepEqual(sounds,['jump','jump','land']);
});
test('raised support does not emit a false takeoff, and stepping into a gap is a fall rather than a jump',async()=>{
 const {createMovementSoundDirector}=await import('../tanahoraflavio/runner-movement-audio.mjs');
 const sounds=[],d=createMovementSoundDirector({play:id=>sounds.push(id)}),r={status:'running',elapsed:0,player:{x:120,y:28,supportY:28,grounded:true,velocity:0,moveHeld:0,crouching:false,isJacare:false}};
 d.reset(r);r.elapsed=.1;r.player.y=0;r.player.supportY=0;d.update(r);assert.deepEqual(sounds,[],'walking along support does not fake a landing');
 r.player.grounded=false;r.player.y=-2;r.player.velocity=-30;r.elapsed=.2;d.update(r);assert.deepEqual(sounds,[],'a fall does not play the jump impulse');
 r.player.grounded=true;r.player.y=0;r.player.velocity=0;r.elapsed=.4;d.update(r);assert.deepEqual(sounds,['land']);
});
test('pulo, pouso, avanço, parada e slide soam por transição, sem repetir ao segurar',async()=>{
 const {createMovementSoundDirector}=await import('../tanahoraflavio/runner-movement-audio.mjs');
 const sounds=[],d=createMovementSoundDirector({play:id=>sounds.push(id)}),r={status:'running',elapsed:0,player:{x:120,y:0,velocity:0,moveHeld:0,crouching:false,isJacare:false}};
 d.reset(r);r.player.velocity=610;d.update(r);d.update(r);assert.deepEqual(sounds,['jump']);
 r.elapsed=.2;r.player.y=60;d.update(r);r.elapsed=.8;r.player.y=0;r.player.velocity=0;d.update(r);assert.equal(sounds.at(-1),'land');
 r.player.moveHeld=1;r.player.x+=2;r.elapsed=1;d.update(r);assert.equal(sounds.at(-1),'run-start');
 r.player.x+=2;r.elapsed=1.2;d.update(r);r.player.moveHeld=0;r.elapsed=1.4;d.update(r);assert.equal(sounds.at(-1),'brake');
 r.player.crouching=true;r.elapsed=1.6;d.update(r);assert.equal(sounds.at(-1),'slide');const count=sounds.length;d.update(r);assert.equal(sounds.length,count);
 r.status='paused';r.player.crouching=false;d.update(r);assert.equal(sounds.length,count);
});
test('padrões de movimento têm variantes distintas e timbres próprios',async()=>{
 const {getMovementSoundBank}=await import('../tanahoraflavio/runner-movement-audio.mjs');
 const ids=['jump','land','run-start','run-back','brake','slide','slide-stop','slide-drag'];
 const signatures=ids.map(id=>{const bank=getMovementSoundBank(id);assert.equal(bank.variants.length,id==='jump'?4:3);assert.equal(new Set(bank.variants.map(v=>JSON.stringify(v))).size,bank.variants.length);return JSON.stringify(bank.variants);});
 assert.equal(new Set(signatures).size,ids.length);
});
