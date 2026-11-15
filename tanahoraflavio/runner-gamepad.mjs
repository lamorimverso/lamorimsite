import {readGamepadActions} from './runner-control-map.mjs?v=2bb295d2954f';

// The caller owns scheduling. Only controller-owned action transitions leave
// this driver, so resetting a pad never releases a keyboard or touch source.
export function createGamepadDriver({getControls,canPlay,onAction,onDevice,onCapture=()=>{},getPads=()=>globalThis.navigator?.getGamepads?.()||[]}){
 const held=new Set();
 let device=null,armed=false,destroyed=false,polling=false,generation=0;
 const releaseHeld=()=>{
  for(const action of [...held]){
   if(!held.delete(action))continue;
   onAction(action,false);
  }
 };
 const reset=()=>{
  if(destroyed)return;
  generation++;armed=false;
  releaseHeld();
 };
 const destroy=()=>{
  if(destroyed)return;
  destroyed=true;generation++;armed=false;
  releaseHeld();
 };
 const poll=()=>{
  if(destroyed||polling)return;
  polling=true;
  const sampleGeneration=generation;
  const current=()=>!destroyed&&generation===sampleGeneration;
  try{
   let pads=[];
   try{
    const sample=getPads();
    if(Array.isArray(sample))pads=sample;
   }catch{
    // Browser policy, unsupported APIs and disconnect races mean no device.
   }
   onCapture(pads);
   if(!current())return;
   // Capture may have just changed a binding; resolve controls afterward.
   const state=readGamepadActions(pads,getControls());
   if(!current())return;
   const nextDevice={connected:state.connected,id:state.id,index:state.index};
   if(!device||device.connected!==nextDevice.connected||device.id!==nextDevice.id||device.index!==nextDevice.index){
    device=nextDevice;armed=false;
    onDevice({...nextDevice});
    if(!current())return;
    releaseHeld();
    if(!current())return;
   }
   if(!state.connected||!canPlay()){
    armed=false;
    releaseHeld();
    return;
   }
   if(!current())return;
   if(!armed){
    // Neutral must be observed while play is permitted. A neutral menu sample
    // cannot arm a held shot or jump when focus later returns.
    armed=state.active.size===0;
    return;
   }
   for(const action of [...held]){
    if(state.active.has(action))continue;
    held.delete(action);
    onAction(action,false);
    if(!current())return;
   }
   for(const action of state.active){
    if(held.has(action))continue;
    if(!canPlay()){reset();return;}
    if(!current())return;
    // Record first: onAction can synchronously reset or destroy this driver.
    held.add(action);
    onAction(action,true);
    if(!current())return;
   }
   if(!canPlay())reset();
  }finally{
   polling=false;
  }
 };
 return {poll,reset,destroy};
}
