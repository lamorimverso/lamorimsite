// A press belongs to a physical key until keyup, cancellation or loss of focus.
const FIRE_BINDINGS=new Map([
 ['default',{keys:Object.freeze(['KeyJ','KeyZ']),label:'J/Z'}],
 ...['F','K','L','X','C'].map(letter=>['Key'+letter,{keys:Object.freeze(['Key'+letter]),label:letter}])
].map(([id,binding])=>[id,Object.freeze(binding)]));
export const fireBindingFor=value=>FIRE_BINDINGS.get(value)||FIRE_BINDINGS.get('default');

export function createPressGate(){
 const held=new Set();
 return {
  press(code,{repeat=false}={}){
   if(!code||repeat||held.has(code))return false;
   held.add(code);return true;
  },
  release(code){held.delete(code);},
  clear(){held.clear();}
 };
}

// Releasing one control must not release a different finger or keyboard key.
export function createHeldSources(){
 const held=new Set();
 return {
  get active(){return held.size>0;},
  set(source,active){if(active)held.add(source);else held.delete(source);},
  toggle(source){if(held.has(source))held.delete(source);else held.add(source);},
  clear(){held.clear();}
 };
}
