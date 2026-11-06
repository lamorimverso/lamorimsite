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
