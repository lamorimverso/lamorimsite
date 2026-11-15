import test from 'node:test';
import assert from 'node:assert/strict';

const controlMap = () => import('../tanahoraflavio/runner-control-map.mjs');
const button = index => ({kind:'button',index});
const axis = (index,direction) => ({kind:'axis',index,direction});

test('defaults expose every ability and preserve familiar keyboard aliases',async()=>{
 const {ACTION_DEFINITIONS,DEFAULT_CONTROLS,keyboardActionFor}=await controlMap();
 assert.deepEqual(ACTION_DEFINITIONS.map(({id})=>id),['left','right','jump','crouch','fire','power','shield','start']);
 for(const [code,action] of [['KeyA','left'],['ArrowLeft','left'],['KeyD','right'],['ArrowRight','right'],['KeyW','jump'],['ArrowUp','jump'],['Space','jump'],['KeyS','crouch'],['ArrowDown','crouch'],['KeyJ','fire'],['KeyZ','fire'],['KeyQ','power'],['KeyE','shield'],['Enter','start']]){
  assert.equal(keyboardActionFor(DEFAULT_CONTROLS,code),action);
 }
 assert.equal(keyboardActionFor(DEFAULT_CONTROLS,'KeyF'),null);
 assert.ok(Object.isFrozen(DEFAULT_CONTROLS.keyboard.fire));
 assert.ok(Object.isFrozen(DEFAULT_CONTROLS.gamepad.left[0]));
 assert.throws(()=>DEFAULT_CONTROLS.keyboard.fire.push('KeyF'),TypeError);
});

test('legacy fire preferences migrate only when no saved mapping exists',async()=>{
 const {normalizeControls}=await controlMap();
 assert.deepEqual(normalizeControls(undefined,'KeyF').keyboard.fire,['KeyF']);
 assert.deepEqual(normalizeControls(null,'KeyL').keyboard.fire,['KeyL']);
 assert.deepEqual(normalizeControls(undefined,'unknown').keyboard.fire,['KeyJ','KeyZ']);
 assert.deepEqual(normalizeControls({},'KeyF').keyboard.fire,['KeyJ','KeyZ']);
});

test('normalization repairs malformed persisted controls and duplicate aliases',async()=>{
 const {normalizeControls,keyboardActionFor}=await controlMap();
 for(const malformed of [false,17,'oops',[],{keyboard:null,gamepad:42}]){
  assert.equal(keyboardActionFor(normalizeControls(malformed),'Space'),'jump');
 }
 const saved={keyboard:{left:['KeyD'],fire:['Escape'],power:['KeyF'],shield:['KeyF']},gamepad:{left:[axis(0,0)],jump:[button(2)],fire:[button(2)]}};
 const copy=JSON.stringify(saved);
 const clean=normalizeControls(saved);
 assert.equal(keyboardActionFor(clean,'KeyD'),'right');
 assert.equal(keyboardActionFor(clean,'Escape'),null);
 assert.deepEqual(clean.keyboard.power,['KeyQ']);
 assert.deepEqual(clean.keyboard.shield,['KeyE']);
 assert.deepEqual(clean.gamepad.jump,[button(0)]);
 assert.deepEqual(clean.gamepad.fire,[button(2),button(7)]);
 assert.equal(JSON.stringify(saved),copy);
});

test('normalization returns independent mutable maps without retaining input descriptors',async()=>{
 const {normalizeControls,DEFAULT_CONTROLS}=await controlMap();
 const saved={keyboard:{fire:['KeyF']},gamepad:{fire:[button(10)]}};
 const one=normalizeControls(saved),two=normalizeControls(saved);
 one.keyboard.fire.push('KeyK');one.gamepad.fire[0].index=11;
 assert.deepEqual(two.keyboard.fire,['KeyF']);
 assert.deepEqual(saved.gamepad.fire,[button(10)]);
 assert.deepEqual(DEFAULT_CONTROLS.keyboard.fire,['KeyJ','KeyZ']);
});

test('keyboard assignments replace aliases immutably and reject collisions or reserved keys',async()=>{
 const {normalizeControls,assignKeyboard,keyboardActionFor}=await controlMap();
 const original=normalizeControls();
 const custom=assignKeyboard(original,'fire','KeyF');
 assert.equal(custom.ok,true);
 assert.deepEqual(custom.controls.keyboard.fire,['KeyF']);
 assert.equal(keyboardActionFor(custom.controls,'KeyJ'),null);
 assert.deepEqual(original.keyboard.fire,['KeyJ','KeyZ']);
 for(const code of ['KeyD','ArrowRight','Escape','Tab','ControlLeft','AltRight','MetaLeft','F1','F12','NotAKey',null]){
  const result=assignKeyboard(original,'fire',code);
  assert.equal(result.ok,false,String(code));assert.equal(typeof result.error,'string');
 }
 for(const code of ['Digit3','ShiftLeft','ArrowLeft','Space']){
  const action=code==='ArrowLeft'?'left':code==='Space'?'jump':'fire';
  assert.equal(assignKeyboard(original,action,code).ok,true,code);
 }
 assert.equal(assignKeyboard(original,'missing','KeyF').ok,false);
});

test('gamepad assignments replace bindings and reject button and axis conflicts',async()=>{
 const {normalizeControls,assignGamepad}=await controlMap();
 const original=normalizeControls();
 const descriptor=button(10);
 const custom=assignGamepad(original,'fire',descriptor);
 assert.equal(custom.ok,true);assert.deepEqual(custom.controls.gamepad.fire,[button(10)]);
 descriptor.index=11;
 assert.deepEqual(custom.controls.gamepad.fire,[button(10)]);
 assert.deepEqual(original.gamepad.fire,[button(2),button(7)]);
 for(const binding of [button(0),axis(0,-1),button(-1),button(1.5),axis(0,0),{kind:'other',index:1},null]){
  assert.equal(assignGamepad(original,'fire',binding).ok,false);
 }
 assert.equal(assignGamepad(original,'fire',axis(1,1)).ok,true);
 assert.equal(assignGamepad(original,'missing',button(10)).ok,false);
});

test('gamepad inputs enforce axis and analog dead zones and tolerate missing devices',async()=>{
 const {gamepadInputs}=await controlMap();
 const pad={connected:true,buttons:[{pressed:true,value:0},{pressed:false,value:.56},{pressed:false,value:.55},null],axes:[-.56,.55,1,NaN]};
 assert.deepEqual(gamepadInputs(pad),[button(0),button(1),axis(0,-1),axis(2,1)]);
 for(const missing of [null,undefined,false,{}, {connected:false,...{buttons:pad.buttons,axes:pad.axes}}, {buttons:42,axes:'bad'}]){
  assert.deepEqual(gamepadInputs(missing),[]);
 }
});

test('controller actions use the first connected device and clear immediately on disconnect',async()=>{
 const {normalizeControls,readGamepadActions}=await controlMap();
 const controls=normalizeControls();
 const held={connected:true,id:'Controle USB',index:2,buttons:Array.from({length:16},(_,index)=>({pressed:[0,2,4,9,14].includes(index),value:0})),axes:[.8]};
 const result=readGamepadActions([null,{...held,connected:false},held,{...held,id:'Segundo'}],controls);
 assert.equal(result.connected,true);assert.equal(result.id,'Controle USB');assert.equal(result.index,2);
 assert.deepEqual([...result.active].sort(),['fire','jump','left','right','shield','start']);
 const custom={...held,buttons:Array.from({length:11},(_,index)=>({value:index===10?1:0})),axes:[]};
 controls.gamepad.fire=[button(10)];
 assert.deepEqual([...readGamepadActions([custom],controls).active],['fire']);
 for(const missing of [null,undefined,{},[null],[{...held,connected:false}]]){
  const state=readGamepadActions(missing,controls);
  assert.equal(state.connected,false);assert.equal(state.id,'');assert.equal(state.index,-1);assert.equal(state.active.size,0);
 }
});

test('binding labels explain keyboard and standard controller names',async()=>{
 const {keyLabel,gamepadBindingLabel}=await controlMap();
 for(const [code,label] of [['KeyF','F'],['Digit3','3'],['Space','Espaço'],['ArrowLeft','←'],['ArrowRight','→'],['ArrowUp','↑'],['ArrowDown','↓'],['Enter','Enter'],['ShiftLeft','Shift esquerdo']])assert.equal(keyLabel(code),label);
 for(const [index,label] of [[0,'A / ×'],[1,'B / ○'],[2,'X / □'],[3,'Y / △'],[4,'LB / L1'],[5,'RB / R1'],[6,'LT / L2'],[7,'RT / R2'],[9,'Start'],[14,'Direcional ←']])assert.equal(gamepadBindingLabel(button(index)),label);
 assert.match(gamepadBindingLabel(axis(0,-1)),/←/);
 assert.match(gamepadBindingLabel(axis(1,1)),/↓/);
 assert.equal(typeof gamepadBindingLabel(null),'string');
});
