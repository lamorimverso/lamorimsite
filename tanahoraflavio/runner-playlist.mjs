// Reprodução por meio do YouTube oficial, mediante clique explícito.
// Não copia ou hospeda músicas protegidas e não interrompe a física do jogo.
export const ELECTION_TRACKS=Object.freeze([
 {id:'lula',title:'Rap do Silva · versão eleitoral de Lula (2026)',video:'Z8xdsLBJjaY'},
 {id:'bota',title:'Bota Pra Virar · Igor Kannário',video:'dC5pqPsUSnw'},
 {id:'flavio',title:'Vem com Fé · jingle de Flávio Bolsonaro',video:'5098ui5-800'},
 {id:'renan',title:'A Vingança do Povo · Renan Santos',video:'mBtQ-PyfJWQ'}
]);
export function playlistEmbedUrl(id){
 const selected=ELECTION_TRACKS.find(t=>t.id===id);
 if(!selected)return null;
 const remaining=ELECTION_TRACKS.filter(t=>t.id!==id).map(t=>t.video);
 // Com o parâmetro playlist, o próprio YouTube oferece a sequência.
 const playlist=[...remaining,selected.video].join(',');
 return 'https://www.youtube-nocookie.com/embed/'+selected.video+
  '?autoplay=1&playsinline=1&controls=1&rel=0&loop=1&playlist='+playlist;
}
export function initElectionPlaylist(){
 const frame=document.getElementById('game-playlist-frame'),
   box=document.getElementById('game-playlist-player'),
   label=document.getElementById('game-playlist-status'),
   stop=document.getElementById('game-playlist-stop');
 if(!frame||!box||!label||!stop)return;
 const buttons=[...document.querySelectorAll('[data-election-track]')];
 for(const button of buttons)button.addEventListener('click',()=>{
  const track=ELECTION_TRACKS.find(t=>t.id===button.dataset.electionTrack);
  if(!track)return;
  // A trilha da contagem é pausada para impedir duas músicas simultâneas.
  window.dispatchEvent(new Event('game-playlist-start'));
  frame.src=playlistEmbedUrl(track.id);
  frame.title='Playlist eleitoral de 2026: '+track.title;
  box.hidden=false;label.textContent='Selecionado: '+track.title+
   '. Se o navegador bloquear o som, use o botão Play do vídeo.';
  buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 });
 stop.addEventListener('click',()=>{
  frame.removeAttribute('src');box.hidden=true;
  buttons.forEach(b=>b.setAttribute('aria-pressed','false'));
  label.textContent='Playlist interrompida.';
 });
}
if(typeof document!=='undefined'){
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initElectionPlaylist,{once:true});
 else initElectionPlaylist();
}
