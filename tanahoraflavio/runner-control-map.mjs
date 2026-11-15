import {fireBindingFor} from './runner-input.mjs?v=bbf7f3e16548';

const freeze=value=>{
 if(value&&typeof value==='object'){
  Object.values(value).forEach(freeze);
  Object.freeze(value);
 }
 return value;
};
export const ACTION_DEFINITIONS=freeze([
 {id:'left',label:'Recuar'},{id:'right',label:'Avançar'},
 {id:'jump',label:'Pular'},{id:'crouch',label:'Abaixar'},
 {id:'fire',label:'Disparar'},{id:'power',label:'Trocar arma'},
 {id:'shield',label:'Usar escudo'},{id:'start',label:'Começar / recomeçar'}
]);
const button=index=>({kind:'button',index});
const axis=(index,direction)=>({kind:'axis',index,direction});
export const DEFAULT_CONTROLS=freeze({
 keyboard:{left:['KeyA','ArrowLeft'],right:['KeyD','ArrowRight'],jump:['KeyW','ArrowUp','Space'],crouch:['KeyS','ArrowDown'],fire:['KeyJ','KeyZ'],power:['KeyT','KeyQ'],shield:['KeyE'],start:['Enter']},
 gamepad:{left:[axis(0,-1),button(14)],right:[axis(0,1),button(15)],jump:[button(0)],crouch:[button(1),button(13)],fire:[button(2),button(7)],power:[button(3),button(5)],shield:[button(4)],start:[button(9)]},
 mouse:{left:null,right:null,jump:0,crouch:null,fire:null,power:null,shield:null,start:null}
});
const ids=ACTION_DEFINITIONS.map(({id})=>id);
const labels=new Map(ACTION_DEFINITIONS.map(({id,label})=>[id,label]));
const keyNames={Space:'Espaço',ArrowLeft:'←',ArrowRight:'→',ArrowUp:'↑',ArrowDown:'↓',Enter:'Enter',NumpadEnter:'Enter numérico',ShiftLeft:'Shift esquerdo',ShiftRight:'Shift direito',Backspace:'Apagar',CapsLock:'Caps Lock',Delete:'Delete',Insert:'Insert',Home:'Home',End:'End',PageUp:'Page Up',PageDown:'Page Down',Minus:'-',Equal:'=',BracketLeft:'[',BracketRight:']',Backslash:'\\',Semicolon:';',Quote:"'",Backquote:'`',Comma:',',Period:'.',Slash:'/',IntlBackslash:'\\',NumpadAdd:'+ numérico',NumpadSubtract:'- numérico',NumpadMultiply:'× numérico',NumpadDivide:'/ numérico',NumpadDecimal:'. numérico'};
const validKey=code=>typeof code==='string'&&(/^(Key[A-Z]|Digit[0-9]|Numpad[0-9])$/.test(code)||Object.hasOwn(keyNames,code));
const validBinding=value=>!!value&&typeof value==='object'&&Number.isInteger(value.index)&&value.index>=0&&value.index<256&&(value.kind==='button'||value.kind==='axis'&&(value.direction===-1||value.direction===1));
const copyBinding=value=>value.kind==='axis'?axis(value.index,value.direction):button(value.index);
const bindingId=value=>value.kind==='axis'?`axis:${value.index}:${value.direction}`:`button:${value.index}`;
const copyList=(list,device)=>list.map(value=>device==='keyboard'?value:copyBinding(value));
const mouseNames=['Esquerdo','Meio','Direito','Lateral 1','Lateral 2'];
const validMouseButton=value=>Number.isInteger(value)&&value>=0&&value<mouseNames.length;
// Resolve old keyboard conflicts before introducing T so another action can keep it.
const baseDefault=(device,id)=>device==='keyboard'&&id==='power'?['KeyQ']:DEFAULT_CONTROLS[device][id];

// Persisted data is untrusted. Invalid or conflicting action maps fall back to
// their familiar defaults, including conflicts exposed by another fallback.
export function normalizeControls(saved,legacyFireKey='default'){
 const result={keyboard:{},gamepad:{},mouse:{}};
 let defaultPower=false;
 for(const device of ['keyboard','gamepad']){
  const valid=device==='keyboard'?validKey:validBinding;
  const token=device==='keyboard'?value=>value:bindingId;
  for(const id of ids){
   const candidate=saved?.[device]?.[id];
   const isValid=Array.isArray(candidate)&&candidate.length>0&&candidate.every(valid);
   const source=isValid?candidate:baseDefault(device,id);
   if(device==='keyboard'&&id==='power')defaultPower=!isValid;
   const unique=new Map(source.map(value=>[token(value),value]));
   result[device][id]=copyList([...unique.values()],device);
  }
  for(let pass=0;pass<ids.length;pass++){
   const owners=new Map(),conflicts=new Set();
   for(const id of ids)for(const value of result[device][id]){
    const key=token(value),owner=owners.get(key);
    if(owner){conflicts.add(owner);conflicts.add(id);}else owners.set(key,id);
   }
   if(!conflicts.size)break;
   for(const id of conflicts){
    if(device==='keyboard'&&id==='power')defaultPower=true;
    result[device][id]=copyList(baseDefault(device,id),device);
   }
  }
 }
 if(saved==null)result.keyboard.fire=[...fireBindingFor(legacyFireKey).keys];
 const power=result.keyboard.power;
 if((defaultPower||saved?.mouse==null&&power.length===1&&power[0]==='KeyQ')&&!keyboardActionFor(result,'KeyT'))power.unshift('KeyT');
 const assigned=new Set();
 for(const id of ids){
  const candidate=saved?.mouse?.[id];
  if(candidate===null)result.mouse[id]=null;
  if(validMouseButton(candidate)){
   result.mouse[id]=assigned.has(candidate)?null:candidate;
   assigned.add(candidate);
  }
 }
 for(const id of ids){
  if(Object.hasOwn(result.mouse,id))continue;
  const fallback=DEFAULT_CONTROLS.mouse[id];
  result.mouse[id]=assigned.has(fallback)?null:fallback;
  if(fallback!==null)assigned.add(fallback);
 }
 return result;
}

export function keyLabel(code){
 if(typeof code!=='string'||!code)return '—';
 if(/^Key[A-Z]$/.test(code))return code.slice(3);
 if(/^Digit[0-9]$/.test(code))return code.slice(5);
 if(/^Numpad[0-9]$/.test(code))return code.slice(6)+' numérico';
 return Object.hasOwn(keyNames,code)?keyNames[code]:code;
}

export function keyboardActionFor(controls,code){
 if(!validKey(code))return null;
 return ids.find(id=>Array.isArray(controls?.keyboard?.[id])&&controls.keyboard[id].includes(code))??null;
}

export function mouseButtonLabel(button){
 return validMouseButton(button)?mouseNames[button]:'Sem botão';
}

export function mouseActionFor(controls,button){
 if(!validMouseButton(button))return null;
 return ids.find(id=>controls?.mouse?.[id]===button)??null;
}

export function assignMouse(controls,action,button){
 if(!labels.has(action))return {ok:false,error:'Ação desconhecida.'};
 if(button!==null&&!validMouseButton(button))return {ok:false,error:'Botão de mouse inválido.'};
 const next=normalizeControls(controls);
 const conflict=mouseActionFor(next,button);
 if(conflict&&conflict!==action)return {ok:false,error:`Este botão do mouse já está em uso: ${labels.get(conflict)}.`};
 next.mouse[action]=button;
 return {ok:true,controls:next};
}

export function assignKeyboard(controls,action,code){
 if(!labels.has(action))return {ok:false,error:'Ação desconhecida.'};
 if(!validKey(code))return {ok:false,error:'Esta tecla é reservada ou não pode ser usada.'};
 const next=normalizeControls(controls);
 const conflict=keyboardActionFor(next,code);
 if(conflict&&conflict!==action)return {ok:false,error:`Esta tecla já está em uso: ${labels.get(conflict)}.`};
 next.keyboard[action]=[code];
 return {ok:true,controls:next};
}

export function assignGamepad(controls,action,binding){
 if(!labels.has(action))return {ok:false,error:'Ação desconhecida.'};
 if(!validBinding(binding))return {ok:false,error:'Botão ou eixo de controle inválido.'};
 const next=normalizeControls(controls),key=bindingId(binding);
 const conflict=ids.find(id=>id!==action&&next.gamepad[id].some(value=>bindingId(value)===key));
 if(conflict)return {ok:false,error:`Este comando já está em uso: ${labels.get(conflict)}.`};
 next.gamepad[action]=[copyBinding(binding)];
 return {ok:true,controls:next};
}

const values=value=>Array.isArray(value)||ArrayBuffer.isView(value)&&typeof value.length==='number'?value:[];
export function gamepadInputs(pad){
 if(!pad||typeof pad!=='object'||pad.connected===false)return [];
 const pressed=[];
 Array.from(values(pad.buttons)).slice(0,256).forEach((value,index)=>{
  if(value?.pressed===true||typeof value?.value==='number'&&Number.isFinite(value.value)&&value.value>.55)pressed.push(button(index));
 });
 Array.from(values(pad.axes)).slice(0,256).forEach((value,index)=>{
  if(typeof value==='number'&&Number.isFinite(value)&&Math.abs(value)>.55)pressed.push(axis(index,value<0?-1:1));
 });
 return pressed;
}

export function readGamepadActions(pads,controls){
 const pad=Array.from(values(pads)).find(value=>value&&typeof value==='object'&&value.connected===true);
 const active=new Set();
 if(!pad)return {connected:false,id:'',index:-1,active};
 const pressed=new Set(gamepadInputs(pad).map(bindingId));
 for(const id of ids){
  const bindings=controls?.gamepad?.[id];
  if(Array.isArray(bindings)&&bindings.some(value=>validBinding(value)&&pressed.has(bindingId(value))))active.add(id);
 }
 return {connected:true,id:typeof pad.id==='string'?pad.id:'Controle',index:Number.isInteger(pad.index)&&pad.index>=0?pad.index:0,active};
}

const buttonNames=['A / ×','B / ○','X / □','Y / △','LB / L1','RB / R1','LT / L2','RT / R2','Select / View','Start','L3','R3','Direcional ↑','Direcional ↓','Direcional ←','Direcional →','Home'];
export function gamepadBindingLabel(binding){
 if(!validBinding(binding))return '—';
 if(binding.kind==='button')return buttonNames[binding.index]??`Botão ${binding.index+1}`;
 const direction=binding.index%2===0?(binding.direction<0?'←':'→'):(binding.direction<0?'↑':'↓');
 return `Eixo ${binding.index+1} ${direction}`;
}
