// Recuperação independente: uma falha de módulo não deixa o início preso.
(() => {
 'use strict';
 const entry=document.currentScript?.dataset.runner;
 const button=document.getElementById('game-start');
 const note=document.getElementById('game-loading-note');
 if(!entry||!button||!note)return;
 let settled=false;
 const reload=()=>location.reload();
 function showFailure(){
  if(settled)return;
  button.disabled=false;button.textContent='Recarregar jogo';
  note.hidden=false;note.textContent='Não foi possível carregar o jogo. Confira a conexão e tente recarregar.';
  button.addEventListener('click',reload,{once:true});
 }
 const timer=setTimeout(showFailure,12000);
 import(new URL(entry,document.baseURI).href).then(()=>{
  settled=true;clearTimeout(timer);button.removeEventListener('click',reload);
 }).catch(()=>{clearTimeout(timer);showFailure();});
})();
