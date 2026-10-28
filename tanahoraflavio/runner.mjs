import { WORLD, PLAYER, STAGES, SCENE_SECONDS, SCENE_DISTANCE, difficultyAt, createRun, startRun, jumpRun, advanceRun, stageAt, stageTransitionAt, scoreFor } from "./runner-core.mjs?v=20261028-dodge-km-v1";
import { RAID_FACTS } from "./runner-core.mjs?v=20261028-dodge-km-v1";
import { drawActor, drawItem, drawThreat, loadSprites, drawSpritePortrait, enemyMotionFor } from "./runner-art.mjs?v=20261028-dodge-km-v1";
import { createGameAudio } from "./runner-audio.mjs?v=20261028-aimed-shots-v1";
import { createFrameClock,resetFrameClock,advanceFrameClock } from "./runner-clock.mjs?v=20261028-aimed-shots-v1";

function initRunner() {
  const $ = id => document.getElementById(id);
  const canvas = $("runner-canvas"), section = $("game");
  if (!canvas || !section) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    $("game-status").textContent = "O jogo não está disponível neste navegador. A contagem continua funcionando.";
    $("game-start").disabled = true;
    return;
  }
  const recordKey = "tanahoraflavio.runner.best.metres.v2";
  let best = 0;
  try {
    const stored = Number(localStorage.getItem(recordKey));
    if (Number.isSafeInteger(stored) && stored >= 0 && stored <= 10000000) best = stored;
  } catch { /* O modo privado e o armazenamento bloqueado não impedem jogar. */ }
  let run=createRun(),frameId=0;
  const frameClock=createFrameClock(performance.now());
  let spritesReady=false,spritesFailed=false,loadedSprites=0,loadingSprites=false,landingUntil=0;
  let windowFocused = true, inView = true;
  let lastStatus = "", lastStage = -1, virtualWidth = 900, measuredWidth = 0, measuredDpr = 0;
  let lastCollected=0,lastPower="";
  let lastLives = 1, lastEvents = 0;
  const audio=createGameAudio();
  let lastRaidKey="";
  const routeSeconds=()=>run.routeDistance/SCENE_DISTANCE*SCENE_SECONDS;
  const pad = number => String(number).padStart(2, "0");
  // A preferência pode mudar enquanto o jogo está aberto.
  const motionPreference = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  const prefersReducedMotion = () => motionPreference?.matches === true;

  function updateUI() {
    const clock=routeSeconds(),stage=stageAt(clock),score=scoreFor(run),difficulty=difficultyAt(run.distance);
    const transition=stageTransitionAt(clock),banner=$("game-transition");
    banner.hidden=run.status!=="running"||!transition.active||!!run.raid;
    if(!banner.hidden){
      $("game-transition-label").textContent=transition.progress<.5?"PRÓXIMA PARADA":"CHEGANDO EM";
      $("game-transition-name").textContent=transition.to.name;
      $("game-transition-progress").style.width=Math.round(transition.progress*100)+"%";
    }
    if(run.status==="over"&&score>best){best=score;try{localStorage.setItem(recordKey,String(best));}catch{}}
    $("game-score").textContent=String(score).padStart(4,"0");
    $("game-lives").textContent=String(run.lives);
    $("game-passports").textContent=String(run.passports);
    $("game-passport-next").textContent=String(100-run.passports%100);
    $("game-passport-progress").style.width=run.passports%100+"%";
    const lap=Math.floor(run.routeDistance/(SCENE_DISTANCE*STAGES.length))+1;
    const sceneElapsed=run.routeDistance%SCENE_DISTANCE;
    $("game-phase").textContent="Cenário "+(stage.index+1)+" de 5 · Volta "+lap;
    $("game-stage-name").textContent=stage.name;
    $("game-difficulty").textContent="Risco "+difficulty.level+" · "+score.toLocaleString("pt-BR")+" m";
    $("game-stage-time").textContent=run.boss?"Desvie do chefão":Math.ceil(SCENE_DISTANCE-sceneElapsed).toLocaleString("pt-BR")+" m até "+STAGES[(stage.index+1)%5].short;
    $("game-best").textContent=best.toLocaleString("pt-BR");
    $("game-time").textContent=pad(Math.floor(run.elapsed/60))+":"+pad(Math.floor(run.elapsed%60));
    $("game-progress").hidden=false;
    $("game-progress").setAttribute("aria-valuemax",String(SCENE_DISTANCE));
    $("game-progress").setAttribute("aria-valuenow",String(Math.floor(sceneElapsed)));
    $("game-progress").setAttribute("aria-valuetext",stage.name+" · volta "+lap);
    $("game-progress").firstElementChild.style.width=sceneElapsed/SCENE_DISTANCE*100+"%";
    section.dataset.runState=run.status;
    section.dataset.art=spritesReady?"loaded":spritesFailed?"error":"loading";
    const power=run.shieldFor>0?"shield":run.graceFor>0?"recovery":"none";
    section.dataset.power=power;section.dataset.ammo="none";
    $("game-power").textContent=power==="shield"?"Escudo das Américas · "+Math.ceil(run.shieldFor)+" s":power==="recovery"?"Recuperando · "+Math.ceil(run.graceFor)+" s":"Sem efeito ativo";
    $("game-ammo").parentElement.hidden=true;
    $("game-boss").hidden=!run.boss;section.dataset.boss=run.boss?.type||"none";
    if(run.boss){
      const b=run.boss;
      $("game-boss-name").textContent=b.name+" · rodada "+b.level;
      $("game-boss-health").setAttribute("aria-valuemax",String(b.total));
      $("game-boss-health").setAttribute("aria-valuenow",String(b.total-b.remaining));
      $("game-boss-progress").style.width=100*(b.total-b.remaining)/b.total+"%";
      $("game-boss-weapon").textContent="Desvie de "+b.remaining+" ataque"+(b.remaining===1?"":"s")+" para escapar";
      $("game-boss").style.setProperty("--boss-accent",b.color);
    }
    $("game-threat").textContent=run.raid?.phase==="active"?"PF em operação":"Inimigos sorteados · "+stage.short;
    $("game-objective").textContent=run.boss?"Só o chefão ataca. Pule para desviar e escapar!":"Faltam "+(100-run.passports%100)+" passaportes para +1 vida";
    const raid=run.status==="running"?run.raid:null;
    $("game-raid").hidden=!raid;section.dataset.raid=raid?.phase||"none";
    if(raid){
      const fact=RAID_FACTS[raid.factIndex];
      $("game-raid-title").textContent=raid.phase==="warning"?"JOICE AVISA · "+Math.ceil(raid.remaining)+" s":raid.phase==="active"?"É A POLÍCIA FEDERAL! · "+Math.ceil(raid.remaining)+" s":"RITMO NORMAL VOLTANDO";
      $("game-raid-copy").textContent=raid.phase==="warning"?"Toc, toc, toc… prepare o salto!":fact.text;
      $("game-raid-source").textContent=raid.phase==="warning"?"Joice Hasselmann · personagem satírica":fact.source;
      $("game-raid-source").href=fact.url;
      const raidKey=raid.id+":"+raid.phase;
      if(raidKey!==lastRaidKey){audio.event(raid.phase,fact);lastRaidKey=raidKey;}
    }else if(lastRaidKey){audio.stop();lastRaidKey="";}
    $("game-jump").disabled=run.status!=="running";
    $("game-start").disabled=!spritesReady&&!spritesFailed;
    $("game-start").textContent=!spritesReady?(spritesFailed?"Tentar carregar desenhos":"Carregando desenhos · "+loadedSprites+"/2"):run.status==="ready"?"Começar corrida":run.status==="over"?"Tentar de novo":"Recomeçar corrida";
    $("game-loading-note").hidden=spritesReady;
    $("game-loading-note").textContent=spritesFailed?"Os desenhos não carregaram. Toque no botão para tentar novamente.":"Preparando os personagens…";
    $("game-overlay").hidden=run.status==="running";
    if(run.status==="over"){
      $("game-overlay-title").textContent="Foi pego pela Polícia Federal!";
      $("game-overlay-copy").textContent=score.toLocaleString("pt-BR")+" metros percorridos · "+run.passports+" passaportes. Tente novamente!";
      $("game-overlay-badge").textContent="Perseguição fictícia";audio.stop();
    }
    if(lastStatus!==run.status||lastStage!==stage.index||lastCollected!==run.collected||lastPower!==power||lastLives!==run.lives||lastEvents!==run.events){
      let message=run.status==="ready"?"Tudo pronto. A corrida começa quando você quiser.":run.status==="over"?"Foi pego pela Polícia Federal! "+score+" metros percorridos. Toque em Tentar de novo.":stage.name+" · continue pulando os perigos.";
      if(run.status==="running"){
        if(run.events>lastEvents)message=run.event;
        else if(lastCollected!==run.collected)message="Passaporte coletado. Faltam "+(100-run.passports%100)+" para uma vida.";
        else if(lastPower==="shield"&&power!=="shield")message="O Escudo das Américas terminou. Volte a desviar!";
        if(lastStage>=0&&lastStage!==stage.index)message="Chegamos a "+stage.name+"! A corrida continua.";
      }
      $("game-status").textContent=message;
      section.querySelectorAll("[data-stage]").forEach((stop,i)=>{stop.classList.toggle("is-current",i===stage.index);stop.classList.toggle("is-done",i<stage.index);if(i===stage.index)stop.setAttribute("aria-current","step");else stop.removeAttribute("aria-current");});
      lastStatus=run.status;lastStage=stage.index;lastCollected=run.collected;lastPower=power;lastLives=run.lives;lastEvents=run.events;
    }
  }

  function schedule() {
    if (!frameId && run.status === "running" && !document.hidden && windowFocused && inView) frameId = requestAnimationFrame(frame);
  }
  // Sem controle de pausa: congela apenas a simulação oculta e retoma sozinha.
  function syncActivity() {
    cancelAnimationFrame(frameId);frameId=0;
    resetFrameClock(frameClock,performance.now());
    if(document.hidden||!windowFocused||!inView||run.status!=="running")audio.stop();
    schedule();
  }
  function frame(now) {
    frameId=0;if(run.status!=="running")return;
    const timing=advanceFrameClock(frameClock,now),wasAirborne=run.player.y>0;
    const before={lives:run.lives,collected:run.collected,boss:run.boss?.type,
      attacks:run.boss?.fired||0};
    for(let i=0;i<timing.steps&&run.status==="running";i++)advanceRun(run,timing.step);
    if(wasAirborne&&run.player.y===0)landingUntil=run.elapsed+.12;
    updateUI();
    if(run.lives<before.lives)audio.effect("hit");
    else if(before.boss&&!run.boss)audio.effect("victory");
    else if(!before.boss&&run.boss)audio.effect("boss");
    else if(run.boss&&run.boss.fired>before.attacks)audio.effect("attack");
    else if(run.collected>before.collected)audio.effect("pickup");
    draw();schedule();
  }
  function resumeFromGesture(){
    if(document.hidden)return;
    windowFocused=true;
    const rect=canvas.getBoundingClientRect();inView=rect.height>0&&rect.bottom>0&&rect.top<window.innerHeight;
    if(!frameId){resetFrameClock(frameClock,performance.now());schedule();}
  }
  function prepareSprites(){
    if(loadingSprites)return;
    loadingSprites=true;spritesFailed=false;loadedSprites=0;updateUI();
    loadSprites(count=>{loadedSprites=count;updateUI();}).then(()=>{
      spritesReady=true;loadingSprites=false;
      const portraitContext=$("game-joice-portrait").getContext("2d");
      if(portraitContext)drawSpritePortrait(portraitContext,"joice",78,96);
      updateUI();draw();
    }).catch(()=>{
      spritesFailed=true;loadingSprites=false;updateUI();
      $("game-status").textContent="Os desenhos não carregaram. Toque em Tentar carregar desenhos.";
    });
  }
  function begin(){
    if(!spritesReady){if(spritesFailed)prepareSprites();return;}
    cancelAnimationFrame(frameId);frameId=0;resumeFromGesture();
    audio.stop();audio.prime();lastRaidKey="";
    run=createRun();run.viewportWidth=virtualWidth;startRun(run);landingUntil=0;
    lastCollected=0;lastPower="";lastStatus="";lastEvents=0;lastLives=1;
    resetFrameClock(frameClock,performance.now());
    updateUI();draw();syncActivity();canvas.focus({preventScroll:true});
  }
  function jump(){
    resumeFromGesture();
    if(["ready","over"].includes(run.status))begin();
    if(jumpRun(run)){audio.effect("jump");draw();}
  }
  $("game-start").addEventListener("click",begin);
  $("game-sound").addEventListener("click",()=>{
    const enabled=audio.toggle();$("game-sound").textContent=enabled?"Som ligado":"Som desligado";
    $("game-sound").setAttribute("aria-pressed",String(enabled));lastRaidKey="";updateUI();
  });
  function bindJump(target){
    const activate=()=>{jump();canvas.focus({preventScroll:true});};
    if("PointerEvent" in window)target.addEventListener("pointerdown",event=>{
      if(event.isPrimary===false||event.button!==0)return;
      event.preventDefault();activate();
    },{passive:false});
    target.addEventListener("click",event=>{if(!("PointerEvent" in window)||event.detail===0)activate();});
  }
  bindJump($("game-jump"));bindJump(canvas);
  section.addEventListener("keydown", event => {
    if (event.target.closest("button,a,input,select,textarea,summary") || event.ctrlKey || event.metaKey || event.altKey) return;
    if (["Space","ArrowUp"].includes(event.code)) {
      event.preventDefault();
      if (!event.repeat) jump();
    }
  });
  document.addEventListener("visibilitychange", syncActivity);
  window.addEventListener("blur", () => { windowFocused=false; syncActivity(); });
  window.addEventListener("focus", () => { windowFocused=true; syncActivity(); });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(entries => {
      inView=entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= .12);
      syncActivity();
    }, {threshold:[0,.12]}).observe(canvas);
  }

  function resize() {
    const width = canvas.getBoundingClientRect().width;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (!width || (width === measuredWidth && dpr === measuredDpr)) return;
    measuredWidth = width; measuredDpr = dpr;
    virtualWidth = Math.min(900, Math.max(480, Math.round(width * 1.15)));
    run.viewportWidth=virtualWidth;
    canvas.style.aspectRatio = `${virtualWidth} / ${WORLD.height}`;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(width * WORLD.height / virtualWidth * dpr);
    draw();
  }
  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(canvas);
  window.addEventListener("resize", resize);

  function line(points, color, width = 2) {
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath(); points.forEach(([x,y], index) => index ? ctx.lineTo(x,y) : ctx.moveTo(x,y)); ctx.stroke();
  }
  function circle(x, y, radius, color) {
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x,y,radius,0,Math.PI*2); ctx.fill();
  }
  function cloud(x, y) {
    ctx.fillStyle = "#ffffffb8"; ctx.beginPath(); ctx.ellipse(x,y,32,9,0,0,Math.PI*2); ctx.fill();
    circle(x-10,y-6,11,"#ffffffb8"); circle(x+7,y-9,15,"#ffffffb8");
  }
  function buildings(stage) {
    const base = 217;
    ctx.fillStyle = stage.id === "argentina" ? "#cadcf1" : "#ded2e9";
    for (let index = 0; index < 11; index++) {
      const x = virtualWidth * .38 + index * 45;
      const height = [43,70,51,86,58,68][index % 6];
      ctx.fillRect(x,base-height,32,height);
      ctx.fillStyle = "#ffffff72";
      for(let y=base-height+10;y<base-6;y+=13) { ctx.fillRect(x+7,y,4,5);ctx.fillRect(x+20,y,4,5); }
      ctx.fillStyle = stage.id === "argentina" ? "#cadcf1" : "#ded2e9";
    }
  }
  // Duas camadas discretas para comunicar deslocamento sem criar colisões falsas.
  // Velocidades diferentes dão profundidade (parallax) e continuam baratas no mobile.
  function environmentalLayers(stage, distance) {
    const far=distance*.045, near=distance*.13;
    const wrap=(x,period)=>((x%period)+period)%period;
    ctx.save();
    ctx.fillStyle=stage.accent+"17";
    for(let i=0;i<12;i++){
      const x=wrap(i*120-far,virtualWidth+160)-80;
      ctx.beginPath();
      ctx.moveTo(x-38,219);
      ctx.lineTo(x+24,173+i%3*9);
      ctx.lineTo(x+86,219);
      ctx.closePath();ctx.fill();
    }
    ctx.fillStyle=stage.ink+"23";
    for(let i=0;i<10;i++){
      const x=wrap(i*138-near,virtualWidth+120)-60;
      if(stage.id==="rio"){
        ctx.beginPath();ctx.ellipse(x+12,221,31,10,0,Math.PI,0);ctx.fill();
      }else if(stage.id==="florida"){
        ctx.fillRect(x,202,28,18);ctx.fillRect(x+8,191,10,11);
      }else{
        const height=18+(i*7)%19;
        ctx.fillRect(x,220-height,22,height);
        if(stage.id==="argentina"||stage.id==="casa-branca"){
          ctx.fillStyle="#ffffff55";ctx.fillRect(x+7,221-height+5,4,5);
          ctx.fillStyle=stage.ink+"23";
        }
      }
    }
    ctx.restore();
  }
  function scenery(stage) {
    // Mantém obstáculos e salto em movimento; congela somente a decoração.
    const decorativeDistance = prefersReducedMotion() ? 0 : run.distance;
    ctx.fillStyle = stage.sky; ctx.fillRect(0,0,virtualWidth,WORLD.height);
    circle(virtualWidth-65,49,20,"#ebcc7880");
    for (let i=0;i<3;i++) cloud(((i*290 + 110 - decorativeDistance*.07) % (virtualWidth+180) + virtualWidth+180) % (virtualWidth+180)-70, 65+(i%2)*30);
    environmentalLayers(stage,decorativeDistance);
    if (stage.id === "brasilia") {
      const x = virtualWidth * .64;
      ctx.fillStyle="#c1d9c8";ctx.fillRect(0,218,virtualWidth,28);
      ctx.fillStyle="#bdcad8";ctx.fillRect(x-7,107,10,111);ctx.fillRect(x+7,107,10,111);
      ctx.fillStyle="#fff";ctx.fillRect(x-99,207,201,15);
      ctx.beginPath();ctx.arc(x-54,205,29,Math.PI,0);ctx.fill();
      ctx.beginPath();ctx.arc(x+59,176,32,0,Math.PI);ctx.fill();
      line([[x-89,225],[x+91,225]],"#a6c6c3",2);
    } else if (stage.id === "rio") {
      ctx.fillStyle="#c9e4df";
      ctx.beginPath(); ctx.moveTo(virtualWidth*.35,218);ctx.bezierCurveTo(virtualWidth*.47,193,virtualWidth*.46,130,virtualWidth*.54,141);ctx.bezierCurveTo(virtualWidth*.64,143,virtualWidth*.6,200,virtualWidth*.71,218);ctx.fill();
      ctx.fillStyle="#b5d9d3";
      const hill=virtualWidth*.77;
      ctx.beginPath();ctx.moveTo(hill-95,218);ctx.bezierCurveTo(hill-50,204,hill-50,119,hill-14,119);ctx.bezierCurveTo(hill+29,114,hill+28,197,hill+80,218);ctx.fill();
      line([[virtualWidth*.53,149],[virtualWidth*.53,115]],"#83b5ac",5);
      line([[virtualWidth*.53-12,126],[virtualWidth*.53+12,126]],"#83b5ac",4);
      circle(virtualWidth*.53,110,4,"#83b5ac");
      ctx.fillStyle="#aed7d250";ctx.fillRect(0,215,virtualWidth,31);
      for(let x=0;x<virtualWidth;x+=65)line([[x,229],[x+23,229]],"#ffffff9c",2);
    } else if (stage.id === "argentina") {
      buildings(stage);
      const x=virtualWidth*.64;
      ctx.fillStyle="#fffaf0";ctx.beginPath();ctx.moveTo(x-10,219);ctx.lineTo(x-6,108);ctx.lineTo(x,91);ctx.lineTo(x+6,108);ctx.lineTo(x+10,219);ctx.fill();
      line([[x,111],[x+1,214]],"#d4c9af",1);
      ctx.fillStyle="#b7cae1";ctx.fillRect(x-18,218,36,5);
    } else if (stage.id === "florida") {
      ctx.fillStyle="#b3dcdf";ctx.fillRect(0,180,virtualWidth,66);
      ctx.fillStyle="#efdeca";ctx.fillRect(0,228,virtualWidth,18);
      for(let i=0;i<4;i++){
        const x=virtualWidth*.42+i*49,h=38+i%2*23;
        ctx.fillStyle=i%2?"#dfb7c6":"#c4d0e5";ctx.fillRect(x,215-h,38,h);
        ctx.fillStyle="#fff4e9";ctx.fillRect(x+6,222-h,25,5);ctx.fillRect(x+6,234-h,25,5);
      }
      for(const x of [virtualWidth*.32,virtualWidth*.85]){
        line([[x,231],[x-7,184],[x+2,132]],"#b89975",6);
        line([[x-29,145],[x-14,126],[x+2,132],[x+21,124],[x+33,142]],"#8aaa85",7);
        line([[x-20,161],[x-11,139],[x+2,132],[x+18,145],[x+25,164]],"#8aaa85",7);
      }
    } else if (stage.id === "casa-branca") {
      const x=virtualWidth*.65,w=210;
      ctx.fillStyle="#c1d7bb";ctx.fillRect(0,211,virtualWidth,35);
      ctx.fillStyle="#e0e7ea";ctx.fillRect(x-w/2,144,w,74);
      ctx.fillStyle="#fff";ctx.fillRect(x-w/2+3,147,w-6,66);
      for(let row=0;row<2;row++)for(let col=0;col<10;col++){ctx.fillStyle="#a3b3c4";ctx.fillRect(x-w/2+12+col*19,158+row*25,7,12);}
      ctx.fillStyle="#e7ebef";ctx.fillRect(x-44,151,88,63);
      ctx.fillStyle="#fff";
      for(let i=0;i<5;i++)ctx.fillRect(x-37+i*17,153,8,59);
      ctx.beginPath();ctx.moveTo(x-53,151);ctx.lineTo(x,120);ctx.lineTo(x+53,151);ctx.closePath();ctx.fill();
      line([[x-49,216],[x+49,216]],"#c2cdd6",5);
      line([[x,123],[x,92]],"#8391a6",2);
      for(let i=0;i<6;i++){ctx.fillStyle=i%2?"#fff":"#c5828c";ctx.fillRect(x+1,92+i*2.5,28,2.5);}
      ctx.fillStyle="#637ba5";ctx.fillRect(x+1,92,12,8);
    }
    // Pequeno avião e linha pontilhada indicam a viagem sem distrair da pista.
    ctx.save(); ctx.translate(virtualWidth-135,83);ctx.fillStyle=stage.ink;ctx.globalAlpha*=.45;
    ctx.beginPath();ctx.moveTo(0,-9);ctx.lineTo(4,-1);ctx.lineTo(15,4);ctx.lineTo(15,7);ctx.lineTo(3,4);ctx.lineTo(2,12);ctx.lineTo(6,15);ctx.lineTo(6,17);ctx.lineTo(0,15);ctx.lineTo(-6,17);ctx.lineTo(-6,15);ctx.lineTo(-2,12);ctx.lineTo(-3,4);ctx.lineTo(-15,7);ctx.lineTo(-15,4);ctx.lineTo(-4,-1);ctx.closePath();ctx.fill();ctx.restore();
    ctx.fillStyle=stage.ground;ctx.fillRect(0,WORLD.ground,virtualWidth,WORLD.height-WORLD.ground);
    line([[0,WORLD.ground],[virtualWidth,WORLD.ground]],stage.ink,2);
    const offset=decorativeDistance%64;
    for(let x=-offset;x<virtualWidth;x+=64)line([[x,272],[x+25,272]],"#ffffffaa",3);
  }
  function sceneTitle(stage) {
    ctx.fillStyle=stage.ink;
    ctx.font='650 11px system-ui, sans-serif';
    ctx.fillText(`${stage.index + 1}/${STAGES.length} · ${stage.name.toLocaleUpperCase("pt-BR")}`,20,26);
  }
  function bossFigure(){
    const b=run.boss;if(!b)return;
    const phase=prefersReducedMotion()?0:run.elapsed*6;
    // Balanço sutil e passos para o chefe não parecer congelado.
    const bossX=virtualWidth-72,bossY=WORLD.ground-3;
    const motion=enemyMotionFor(b.type,phase,bossX);
    ctx.save();ctx.translate(bossX,bossY+motion.bob);ctx.rotate(motion.lean);
    drawActor(ctx,{type:b.type,x:0,y:0,scale:1.62,phase,attacking:b.attackFlashFor>0,hurt:b.hitFlashFor>0});
    ctx.restore();
    if(b.nextAttack<.65&&(b.health>0||b.fired<b.total)){
      ctx.fillStyle="#a33e4b";ctx.font="900 11px system-ui";ctx.textAlign="center";
      ctx.fillText("PREPARE O SALTO",virtualWidth-86,62);ctx.textAlign="start";
    }
  }
  function character(){
    const active=run.status==="running"&&!prefersReducedMotion(),airborne=run.player.y>0;
    const phase=active?run.elapsed*12:0,bounce=active&&!airborne?Math.abs(Math.sin(phase))*2:0;
    if(active&&!airborne){circle(PLAYER.x-8-run.distance%19,WORLD.ground-2,2.8,"#a6a7aa70");circle(PLAYER.x-30,WORLD.ground-4,1.7,"#aaa2a660");}
    ctx.save();ctx.globalAlpha=.12;ctx.fillStyle="#292337";ctx.beginPath();ctx.ellipse(PLAYER.x+17,WORLD.ground+4,22,4,0,0,Math.PI*2);ctx.fill();ctx.restore();
    if(run.shieldFor>0){
      ctx.save();ctx.strokeStyle="#bda15b";ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.beginPath();ctx.ellipse(PLAYER.x+17,WORLD.ground-run.player.y-35,27,47,0,0,Math.PI*2);ctx.stroke();ctx.restore();
      drawItem(ctx,{type:"shield",x:PLAYER.x+17,y:WORLD.ground-run.player.y-91,scale:.38});
    }
    // O Canvas espelha os quadros originais para o Flávio fugir olhando para +X (direita).
    drawActor(ctx,{type:"flavio",x:PLAYER.x+17,y:WORLD.ground-run.player.y-bounce,scale:.95,phase,airborne,landing:run.elapsed<landingUntil,hurt:run.status==="over",alpha:run.shieldFor>0?.27:run.graceFor>0?.55:1});
  }
  function obstacle(item){
    if(item.projectile){
      // O rastro confirma visualmente que o ataque parte do chefão rumo ao jogador.
      const y=WORLD.ground-item.y;
      line([[item.x+item.width*.78,y-2],[item.x+item.width+22,y-7]],"#bd526e",3);
      drawThreat(ctx,item,y+item.height/2,prefersReducedMotion()?0:run.elapsed*8);
    }else drawThreat(ctx,item,WORLD.ground,prefersReducedMotion()?0:run.elapsed*8);
  }
  function pickup(item){
    drawItem(ctx,{type:item.type,x:item.x,y:WORLD.ground-item.y,scale:item.type==="shield"?.86:.8});
  }
  function draw() {
    ctx.setTransform(canvas.width/virtualWidth,0,0,canvas.height/WORLD.height,0,0);
    const stage = stageAt(routeSeconds());
    const transition = stageTransitionAt(routeSeconds());
    if (transition.active && !prefersReducedMotion()) {
      scenery(transition.from);
      ctx.save();
      ctx.globalAlpha=transition.progress;
      scenery(transition.to);
      ctx.restore();
    } else {
      scenery(stage);
    }
    sceneTitle(stage);
    bossFigure();
    for(const item of run.pickups)pickup(item);
    for(const item of run.obstacles)obstacle(item);
    character();
  }
  updateUI();resize();draw();prepareSprites();
}

initRunner();
