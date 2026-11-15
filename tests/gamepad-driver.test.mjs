import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeControls} from '../tanahoraflavio/runner-control-map.mjs';

const driverModule=()=>import('../tanahoraflavio/runner-gamepad.mjs');
const pad=(pressed=[],extra={})=>({connected:true,id:'Controle USB',index:0,axes:[0,0],buttons:Array.from({length:16},(_,index)=>({pressed:pressed.includes(index),value:pressed.includes(index)?1:0})),...extra});
async function setup(options={}){
 const {createGamepadDriver}=await driverModule();
 const state={pads:[pad()],play:true,controls:normalizeControls(),actions:[],devices:[],captures:[]};
 const driver=createGamepadDriver({
  getPads:()=>state.pads,getControls:()=>state.controls,canPlay:()=>state.play,
  onAction:(action,active)=>state.actions.push([action,active]),
  onDevice:device=>state.devices.push(device),onCapture:pads=>state.captures.push(pads),
  ...options
 });
 return {state,driver};
}

test('held actions emit once per transition after an initial neutral sample',async()=>{
 const {state,driver}=await setup();
 driver.poll();
 state.pads=[pad([0,2])];driver.poll();driver.poll();
 assert.deepEqual(state.actions,[['jump',true],['fire',true]]);
 state.pads=[pad([2])];driver.poll();
 state.pads=[pad()];driver.poll();driver.poll();
 assert.deepEqual(state.actions,[['jump',true],['fire',true],['jump',false],['fire',false]]);
 assert.deepEqual(state.devices,[{connected:true,id:'Controle USB',index:0}]);
 assert.equal(state.captures.length,6);
});

test('a controller connected with held buttons must become neutral before play',async()=>{
 const {state,driver}=await setup();
 state.pads=[pad([0,2])];driver.poll();driver.poll();
 assert.deepEqual(state.actions,[]);
 state.pads=[pad()];driver.poll();
 state.pads=[pad([0])];driver.poll();
 assert.deepEqual(state.actions,[['jump',true]]);
});

test('disconnect releases pad actions and bounds device notifications',async()=>{
 const {state,driver}=await setup();
 driver.poll();state.pads=[pad([2,14])];driver.poll();
 state.pads=[null,{...pad([2]),connected:false}];driver.poll();driver.poll();
 assert.deepEqual(state.actions,[['left',true],['fire',true],['left',false],['fire',false]]);
 assert.deepEqual(state.devices,[{connected:true,id:'Controle USB',index:0},{connected:false,id:'',index:-1}]);
 state.pads=[pad([2])];driver.poll();
 assert.equal(state.actions.length,4);
});

test('focus or menu blocking releases actions but capture continues until neutral regain',async()=>{
 const {state,driver}=await setup();
 driver.poll();state.pads=[pad([2])];driver.poll();
 state.play=false;driver.poll();
 state.pads=[pad()];driver.poll();
 state.play=true;state.pads=[pad([2])];driver.poll();
 assert.deepEqual(state.actions,[['fire',true],['fire',false]]);
 assert.equal(state.captures.length,5);
 state.pads=[pad()];driver.poll();state.pads=[pad([2])];driver.poll();
 assert.deepEqual(state.actions,[['fire',true],['fire',false],['fire',true]]);
});

test('controller identity and index changes release actions and require neutral',async()=>{
 const {state,driver}=await setup();
 driver.poll();state.pads=[pad([2])];driver.poll();
 state.pads=[pad([2],{id:'Novo',index:1})];driver.poll();driver.poll();
 assert.deepEqual(state.actions,[['fire',true],['fire',false]]);
 assert.equal(state.devices.length,2);
 state.pads=[pad([],{id:'Novo',index:1})];driver.poll();
 state.pads=[pad([2],{id:'Novo',index:1})];driver.poll();
 assert.deepEqual(state.actions.at(-1),['fire',true]);
 state.pads=[pad([2],{id:'Novo',index:2})];driver.poll();
 assert.deepEqual(state.actions.at(-1),['fire',false]);assert.equal(state.devices.length,3);
});

test('unavailable, malformed and throwing browser API samples safely disconnect',async()=>{
 let sample=[pad()];
 const {state,driver}=await setup({getPads:()=>{if(sample instanceof Error)throw sample;return sample;}});
 driver.poll();sample=[pad([2])];driver.poll();
 for(const missing of [new Error('blocked'),null,undefined,false,{},'bad']){sample=missing;assert.doesNotThrow(()=>driver.poll());}
 assert.deepEqual(state.actions,[['fire',true],['fire',false]]);
 assert.equal(state.devices.length,2);
 assert.deepEqual(state.captures.slice(2),[[],[],[],[],[],[]]);
});

test('reset releases held actions and destroy permanently stops sampling',async()=>{
 const {state,driver}=await setup();
 driver.poll();state.pads=[pad([0,2])];driver.poll();
 driver.reset();driver.reset();driver.poll();
 assert.deepEqual(state.actions,[['jump',true],['fire',true],['jump',false],['fire',false]]);
 state.pads=[pad()];driver.poll();state.pads=[pad([2])];driver.poll();
 driver.destroy();driver.destroy();
 const captures=state.captures.length;
 driver.poll();driver.reset();
 assert.deepEqual(state.actions.at(-1),['fire',false]);
 assert.equal(state.actions.length,6);assert.equal(state.captures.length,captures);
});

test('an action that resets the driver cancels remaining actions from that sample',async()=>{
 let driver;
 const events=[];
 const setupResult=await setup({onAction:(action,active)=>{
  events.push([action,active]);
  if(action==='jump'&&active)driver.reset();
 }});
 driver=setupResult.driver;
 driver.poll();setupResult.state.pads=[pad([0,2])];driver.poll();driver.poll();
 assert.deepEqual(events,[['jump',true],['jump',false]]);
});

test('a release callback can reset without duplicate releases or stale presses',async()=>{
 let driver,resetOnRelease=false;
 const events=[];
 const setupResult=await setup({onAction:(action,active)=>{
  events.push([action,active]);
  if(!active&&resetOnRelease){resetOnRelease=false;driver.reset();}
 }});
 driver=setupResult.driver;driver.poll();
 setupResult.state.pads=[pad([0,2])];driver.poll();
 resetOnRelease=true;setupResult.state.pads=[pad([4])];driver.poll();
 assert.deepEqual(events,[['jump',true],['fire',true],['jump',false],['fire',false]]);
});

test('capture can reset or update bindings before any actions are calculated',async()=>{
 let driver,state,mode='none';
 const setupResult=await setup({onCapture:()=>{
  if(mode==='reset'){mode='none';driver.reset();}
  else if(mode==='rebind'){mode='none';state.controls.gamepad.fire=[{kind:'button',index:10}];}
 }});
 ({state,driver}=setupResult);
 driver.poll();state.pads=[pad([2])];driver.poll();
 mode='rebind';driver.poll();
 assert.deepEqual(state.actions,[['fire',true],['fire',false]]);
 state.pads=[pad([10])];mode='reset';driver.poll();driver.poll();
 assert.equal(state.actions.length,2);
 state.pads=[pad()];driver.poll();state.pads=[pad([10])];driver.poll();
 assert.deepEqual(state.actions.at(-1),['fire',true]);
});
