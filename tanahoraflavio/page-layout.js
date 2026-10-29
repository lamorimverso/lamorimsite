(() => {
  'use strict';
  const shell=document.getElementById('countdown-layout');
  if(!shell)return;
  const game=document.getElementById('game');
  const motion=window.matchMedia?.('(prefers-reduced-motion: reduce)');
  let pending=0,gameReduced=false;
  function geometry(){
    const compact=parseFloat(getComputedStyle(shell).getPropertyValue('--hero-compact-height'))||266;
    return {origin:shell.getBoundingClientRect().top+window.scrollY,range:Math.max(1,shell.offsetHeight-compact)};
  }
  function update(){
    pending=0;
    const {origin,range}=geometry();
    const progress=Math.max(0,Math.min(1,(window.scrollY-origin)/range));
    const reduced=gameReduced||motion?.matches===true;
    const value=reduced?(progress>=.999?1:0):progress;
    shell.style.setProperty('--hero-progress',String(value));
    shell.dataset.layout=value===0?'large':value>=.999?'compact':'transition';
    shell.dataset.reducedMotion=String(reduced);
  }
  function schedule(){if(!pending)pending=requestAnimationFrame(update);}
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule);
  motion?.addEventListener?.('change',schedule);
  if('ResizeObserver' in window)new ResizeObserver(schedule).observe(shell);
  game?.addEventListener('runner:motion',event=>{gameReduced=event.detail?.reducedMotion===true;schedule();});
  game?.addEventListener('runner:start',()=>{
    if(game.classList.contains('is-expanded'))return;
    const {origin,range}=geometry();
    const controls=game.querySelector('.game-viewport')?.getBoundingClientRect();
    const target=Math.max(origin+range,controls?controls.bottom+window.scrollY-innerHeight+12:0);
    // O gesto de começar alinha a versão compacta e preserva espaço para
    // os comandos, inclusive em telas baixas ou após fechar a ajuda.
    if(Math.abs(window.scrollY-target)>1)window.scrollTo({top:target,behavior:'auto'});
    update();
  });
  game?.addEventListener('runner:over',()=>{
    const retry=document.getElementById('game-start');
    const bottom=retry?.getBoundingClientRect().bottom;
    if(Number.isFinite(bottom)&&bottom>innerHeight-12){
      const scroller=game.classList.contains('is-expanded')?game:window;
      scroller.scrollBy({top:bottom-innerHeight+12,behavior:'auto'});
    }
  });
  update();
})();
