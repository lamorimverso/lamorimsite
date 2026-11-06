// A press belongs to a physical key until keyup, cancellation or loss of focus.
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
