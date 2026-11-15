import {
 ACTION_DEFINITIONS,normalizeControls,keyLabel,gamepadBindingLabel,mouseButtonLabel,
 assignKeyboard,assignGamepad,assignMouse,gamepadInputs
} from './runner-control-map.mjs?v=568387e3f764';

const inputId=input=>input.kind==='axis'?`axis:${input.index}:${input.direction}`:`button:${input.index}`;
const bindingDevices={keyboard:'teclado',mouse:'mouse',gamepad:'controle'};

/** Render and capture bindings; the caller owns persistence and gamepad polling. */
export function createControlSettings({root,controls,onChange=()=>{},onCaptureChange=()=>{}}){
 const doc=root.ownerDocument,view=doc.defaultView,details=root.closest('details');
 let current=normalizeControls(controls),device={connected:false,id:''},capture=null,destroyed=false;
 let capturedMouseButton=null;
 const buttons=new Map(),cleanups=[];
 const element=(tag,className,text)=>{
  const node=doc.createElement(tag);
  if(className)node.className=className;
  if(text!==undefined)node.textContent=text;
  return node;
 };
 const listen=(target,type,handler,options)=>{
  if(!target)return;
  target.addEventListener(type,handler,options);
  cleanups.push(()=>target.removeEventListener(type,handler,options));
 };
 const readPads=()=>{
  try{return Array.from(view?.navigator?.getGamepads?.()||[]);}catch{return [];}
 };
 const connectedPads=pads=>Array.from(pads||[]).filter(pad=>pad&&pad.connected!==false);
 const snapshot=pads=>new Map(connectedPads(pads).map((pad,index)=>[
  pad.index??index,new Set(gamepadInputs(pad).map(inputId))
 ]));

 root.classList.add('control-bindings');
 const intro=element('p','control-bindings-intro','Escolha um comando para alterá-lo. Cada tecla ou botão pode ter uma função.');
 const controllerStatus=element('p','control-bindings-device');
 controllerStatus.id='game-controller-status';
 const region=element('div','control-bindings-scroll');
 region.setAttribute('role','region');
 region.setAttribute('aria-label','Comandos de teclado, mouse e controle');
 region.tabIndex=0;
 const table=element('table','control-bindings-table');
 const caption=element('caption','control-bindings-sr','Comandos do jogo');
 const head=element('thead'),headRow=element('tr');
 for(const label of ['Ação','Teclado','Mouse','Controle']){
  const heading=element('th',null,label);heading.scope='col';headRow.append(heading);
 }
 head.append(headRow);
 const body=element('tbody');
 for(const action of ACTION_DEFINITIONS){
  const row=element('tr'),label=element('th',null,action.label);
  label.scope='row';row.append(label);
  for(const type of Object.keys(bindingDevices)){
   const cell=element('td'),button=element('button','control-binding');
   button.type='button';
   button.dataset.bindAction=action.id;button.dataset.bindDevice=type;
   button.setAttribute('aria-describedby','game-control-status');
   button.setAttribute('aria-pressed','false');
   listen(button,'click',()=>beginCapture(action,type,button));
   buttons.set(`${type}:${action.id}`,button);cell.append(button);row.append(cell);
  }
  body.append(row);
 }
 table.append(caption,head,body);region.append(table);
 const status=element('p','control-bindings-status','As alterações são salvas neste aparelho.');
 status.id='game-control-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 status.setAttribute('aria-atomic','true');
 const actions=element('div','control-bindings-actions');
 const cancel=element('button','control-bindings-cancel','Cancelar');
 cancel.type='button';cancel.hidden=true;
 const clearMouse=element('button','control-bindings-clear','Limpar botão');
 clearMouse.type='button';clearMouse.hidden=true;
 const reset=element('button','control-bindings-reset','Restaurar padrões');
 reset.type='button';reset.id='game-controls-reset';
 actions.append(cancel,clearMouse,reset);
 root.replaceChildren(intro,controllerStatus,region,status,actions);

 function render(){
  for(const action of ACTION_DEFINITIONS){
   for(const [type,deviceLabel] of Object.entries(bindingDevices)){
    const button=buttons.get(`${type}:${action.id}`);
    const active=capture?.action.id===action.id&&capture?.type===type;
    const binding=current[type][action.id];
    const label=type==='mouse'?mouseButtonLabel(binding):binding.map(type==='keyboard'?keyLabel:gamepadBindingLabel).join(' / ');
    button.textContent=active?(type==='mouse'?'Clique…':'Aguardando…'):label;
    button.title=label;
    button.setAttribute('aria-label',`Alterar ${deviceLabel}: ${action.label} (${label})`);
    button.setAttribute('aria-pressed',String(active));
   }
  }
  cancel.hidden=!capture;
  clearMouse.hidden=capture?.type!=='mouse';
 }
 function finish(message,{focus=false}={}){
  if(!capture)return;
  const previous=capture;capture=null;
  view.clearTimeout(previous.timer);
  render();
  if(message)status.textContent=message;
  onCaptureChange(false);
  if(focus&&(!details||details.open))previous.button.focus({preventScroll:true});
 }
 function beginCapture(action,type,button){
  if(destroyed)return;
  if(capture)finish();
  const pads=readPads();
  if(type==='gamepad'&&!device.connected&&!connectedPads(pads).length){
   status.textContent='Conecte um controle e pressione um botão para reconhecê-lo. Depois escolha o comando.';
   return;
  }
  capture={action,type,button,previous:snapshot(pads),timer:null};
  capture.timer=view.setTimeout(()=>finish('Tempo esgotado. Escolha o comando para tentar novamente.'),15000);
  status.textContent=type==='keyboard'
   ?`Pressione a nova tecla para ${action.label}. Esc cancela.`
   :type==='mouse'
   ?`Clique com o botão desejado nesta área. Delete limpa e Esc cancela.`
   :`Pressione um botão ou mova um direcional para ${action.label}. Solte comandos já pressionados antes de usá-los. Esc cancela.`;
  render();onCaptureChange(true);
 }
 function apply(result,message){
  if(!result.ok){status.textContent=`${result.error} Escolha outro comando ou pressione Esc para cancelar.`;return;}
  const label=capture.action.label;
  current=result.controls;
  finish(message??`Comando de ${label} alterado.`,{focus:true});
  onChange(current);
 }
 listen(doc,'keydown',event=>{
  if(!capture)return;
  event.preventDefault();event.stopImmediatePropagation();
  if(event.code==='Escape'||event.key==='Escape'){finish('Alteração cancelada.',{focus:true});return;}
  if(!event.repeat&&capture.type==='mouse'&&(event.code==='Delete'||event.key==='Delete')){removeMouseBinding();return;}
  if(event.repeat||capture.type!=='keyboard')return;
  if(event.ctrlKey||event.altKey||event.metaKey||/^(Control|Alt|Meta)/.test(event.code||'')){
   status.textContent='Use uma tecla sem Ctrl, Alt ou Meta. Esc cancela.';return;
  }
  apply(assignKeyboard(current,capture.action.id,event.code));
 },true);
 // A captured key must not reach the game's held-key bookkeeping on release.
 listen(doc,'keyup',event=>{
  if(!capture)return;
  event.preventDefault();event.stopImmediatePropagation();
 },true);
 function removeMouseBinding(){
  if(capture?.type==='mouse')apply(assignMouse(current,capture.action.id,null),'Botão do mouse removido.');
 }
 const consume=event=>{event.preventDefault();event.stopImmediatePropagation();};
 listen(doc,'pointerdown',event=>{
  if(event.pointerType!=='mouse')return;
  capturedMouseButton=null;
  if(capture?.type!=='mouse'||!root.contains(event.target)||actions.contains(event.target))return;
  consume(event);
  capturedMouseButton=event.button;
  apply(assignMouse(current,capture.action.id,event.button));
 },true);
 // Prevent the pointer gesture used for remapping from clicking another setting,
 // opening the browser menu, or triggering middle/side mouse defaults.
 for(const type of ['pointerup','click','auxclick','contextmenu'])listen(doc,type,event=>{
  if(capturedMouseButton===null||event.button!==capturedMouseButton||event.pointerType&&event.pointerType!=='mouse')return;
  if(type==='click'&&event.detail===0)return;
  consume(event);
 },true);
 listen(cancel,'click',()=>finish('Alteração cancelada.',{focus:true}));
 listen(clearMouse,'click',removeMouseBinding);
 listen(reset,'click',()=>{
  if(capture)finish();
  current=normalizeControls(null);render();status.textContent='Comandos padrão restaurados.';onChange(current);
 });
 listen(details,'toggle',()=>{if(!details.open)finish('Alteração cancelada ao fechar os comandos.');});
 listen(view,'blur',()=>finish('Alteração cancelada ao sair da janela.'));
 listen(doc,'visibilitychange',()=>{if(doc.hidden)finish('Alteração cancelada ao sair da página.');});

 function setDevice(next={}){
  if(destroyed)return;
  device={connected:Boolean(next.connected),id:typeof next.id==='string'?next.id:''};
  const message=device.connected
   ?`Controle conectado${device.id?`: ${device.id}`:'.'}`
   :'Controle desconectado. Conecte e pressione um botão para reconhecê-lo.';
  if(controllerStatus.textContent!==message)controllerStatus.textContent=message;
  if(!device.connected&&capture?.type==='gamepad')finish('Controle desconectado. Reconecte-o para alterar o comando.');
 }
 setDevice(device);render();

 return {
  setControls(next){if(!destroyed){current=normalizeControls(next);render();}},
  setDevice,
  pollCapture(pads){
   if(destroyed||capture?.type!=='gamepad')return;
   const live=connectedPads(pads);
   if(!live.length){setDevice({connected:false});return;}
   const previous=capture.previous;
   capture.previous=snapshot(live);
   for(const [index,pad] of live.entries()){
    const held=previous.get(pad.index??index)||new Set();
    for(const input of gamepadInputs(pad)){
     if(!held.has(inputId(input))){apply(assignGamepad(current,capture.action.id,input));return;}
    }
   }
  },
  get capturing(){return Boolean(capture);},
  cancelCapture(){finish('Alteração cancelada.');},
  destroy(){
   if(destroyed)return;
   finish();destroyed=true;
   cleanups.forEach(cleanup=>cleanup());
   root.replaceChildren();root.classList.remove('control-bindings');
  }
 };
}
