// Player oficial do YouTube e lista editorial de jingles de 2026.
// Usa vídeos publicados (sem copiar o áudio), com início/fim da faixa
// quando ela faz parte de uma compilação documental.
const COLLECTION='-X64_csaUhM'; // Fundo Eleitoral, compilação de 12/09/2026.
export const ELECTION_TRACKS=Object.freeze([
 {id:'lula',title:'Rap do Silva · jingle de Lula (2026)',video:'Bag7gdwbjbY'},
 {id:'bota',title:'Bota Pra Virar · Igor Kannário',video:'dC5pqPsUSnw'},
 {id:'flavio',title:'Fé que o Brasil vai vencer · Flávio Bolsonaro',video:COLLECTION,start:375,end:513},
 {id:'renan',title:'A Vingança do Povo · Renan Santos',video:COLLECTION,start:980,end:1153},
 {id:'caiado',title:'Vamos Endireitar o Brasil · Caiado',video:COLLECTION,start:0,end:105},
 {id:'clariana',title:'É Claro que É Clariana',video:COLLECTION,start:202,end:315},
 {id:'augusto',title:'Augusto Cury Chegou',video:COLLECTION,start:315,end:375},
 {id:'tropa',title:'Tropa do Bolsonaro · Flávio',video:COLLECTION,start:592,end:711},
 {id:'coracao',title:'Coração, Vem Cá · Lula',video:COLLECTION,start:711,end:802},
 {id:'tapete',title:'Tapete Vermelho · Lula',video:COLLECTION,start:802,end:980},
 {id:'samara',title:'Negra no Poder · Samara Martins',video:COLLECTION,start:1153,end:1304},
 {id:'zema',title:'Zema, Zema, Zema',video:COLLECTION,start:1304},
 {id:'coletanea',title:'Coletânea de jingles presidenciais de 2026',video:COLLECTION}
]);
export function playlistEmbedUrl(id){
 const track=ELECTION_TRACKS.find(t=>t.id===id);
 if(!track)return null;
 const params=new URLSearchParams({autoplay:'1',playsinline:'1',controls:'1',rel:'0'});
 if(Number.isInteger(track.start))params.set('start',String(track.start));
 if(Number.isInteger(track.end))params.set('end',String(track.end));
 return 'https://www.youtube-nocookie.com/embed/'+track.video+'?'+params;
}
export function playlistWatchUrl(id){
 const track=ELECTION_TRACKS.find(t=>t.id===id);
 if(!track)return null;
 const stamp=Number.isInteger(track.start)?'&t='+track.start+'s':'';
 return 'https://www.youtube.com/watch?v='+track.video+stamp;
}
export function initElectionPlaylist(){
 const frame=document.getElementById('game-playlist-frame'),
  box=document.getElementById('game-playlist-player'),
  label=document.getElementById('game-playlist-status'),
  stop=document.getElementById('game-playlist-stop'),
  external=document.getElementById('game-playlist-open');
 if(!frame||!box||!label||!stop||!external)return;
 const buttons=[...document.querySelectorAll('[data-election-track]')];
 for(const button of buttons)button.addEventListener('click',()=>{
  const track=ELECTION_TRACKS.find(t=>t.id===button.dataset.electionTrack);
  if(!track)return;
  // Não misturar trilha da contagem com a playlist.
  window.dispatchEvent(new Event('game-playlist-start'));
  frame.src=playlistEmbedUrl(track.id);
  frame.title='Reprodução no YouTube: '+track.title;
  external.href=playlistWatchUrl(track.id);
  box.hidden=false;
  label.textContent='Selecionado: '+track.title+'. O player pode exigir toque em Play.';
  buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 });
 stop.addEventListener('click',()=>{
  frame.removeAttribute('src');box.hidden=true;
  buttons.forEach(b=>b.setAttribute('aria-pressed','false'));
  label.textContent='Reprodução interrompida.';
 });
}
if(typeof document!=='undefined'){
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initElectionPlaylist,{once:true});
 else initElectionPlaylist();
}
