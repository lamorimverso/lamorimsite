import {keyLabel} from './runner-control-map.mjs?v=568387e3f764';

// Read the current DOM value before writing: live controls and accessible
// meters update in this frame, while unchanged labels cause no mutation work.
export function createPresentationDOM(document){
 const nodes=new Map();
 const get=id=>{
  if(typeof id!=='string')return id;
  let node=nodes.get(id);
  if(!node){node=document.getElementById(id);if(node)nodes.set(id,node);}
  return node;
 };
 return {
  get,
  text(target,value){const node=get(target),text=String(value);if(node.textContent!==text)node.textContent=text;},
  prop(target,name,value){const node=get(target);if(node[name]!==value)node[name]=value;},
  attr(target,name,value){const node=get(target),text=String(value);if(node.getAttribute(name)!==text)node.setAttribute(name,text);},
  style(target,name,value){const node=get(target),text=String(value);if(node.style.getPropertyValue(name)!==text)node.style.setProperty(name,text);},
  data(target,name,value){const node=get(target),text=String(value);if(node.dataset[name]!==text)node.dataset[name]=text;}
 };
}

// Control settings replace the normalized map on every remap/reset. Keeping
// that map's labels avoids rebuilding eight arrays and an object every frame.
export function createControlLabelReader(){
 let keyboard=null,labels=null;
 return controls=>{
  if(controls.keyboard!==keyboard){
   keyboard=controls.keyboard;labels={};
   for(const action of Object.keys(keyboard))labels[action]=keyboard[action].map(keyLabel).join('/');
  }
  return labels;
 };
}
