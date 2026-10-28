import { WORLD, PLAYER, STAGES, SCENE_SECONDS, SCENE_DISTANCE, difficultyAt, createRun, startRun, jumpRun, crouchRun, advanceRun, stageAt, stageTransitionAt, scoreFor } from "./runner-core.mjs?v=20261028-dodge-km-v1";
import { RAID_FACTS } from "./runner-core.mjs?v=20261028-dodge-km-v1";
import { drawActor, drawItem, drawThreat, loadSprites, drawSpritePortrait, enemyMotionFor, crouchAnimationStep } from "./runner-art.mjs?v=20261028-clean-scene-v1";
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
  let crouchPose=0,lastPoseFrame=performance.now();
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
    $("game-crouch").disabled=run.status!=="running";
    $("game-crouch").setAttribute("aria-pressed",String(run.player.crouching));
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
    crouchPose=0;lastPoseFrame=performance.now();
    lastCollected=0;lastPower="";lastStatus="";lastEvents=0;lastLives=1;
    resetFrameClock(frameClock,performance.now());
    updateUI();draw();syncActivity();canvas.focus({preventScroll:true});
  }
  function jump(){
    resumeFromGesture();
    if(["ready","over"].includes(run.status))begin();
    if(jumpRun(run)){audio.effect("jump");draw();}
  }
  function crouch(active){
    if(crouchRun(run,active)){draw();}
    else if(!active)draw();
    $("game-crouch").setAttribute("aria-pressed",String(run.player.crouching));
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
  const crouchButton=$("game-crouch");
  // Segure para abaixar, solte para voltar a correr (celular/mouse/caneta).
  crouchButton.addEventListener("pointerdown",event=>{
    if(event.button!==0||run.status!=="running")return;
    event.preventDefault();resumeFromGesture();
    try{crouchButton.setPointerCapture?.(event.pointerId);}catch{/* navegador pode não reconhecer eventos de teste/assistivos */}
    crouch(true);
  });
  const releaseCrouch=()=>crouch(false);
  crouchButton.addEventListener("pointerup",releaseCrouch);
  crouchButton.addEventListener("pointercancel",releaseCrouch);
  crouchButton.addEventListener("lostpointercapture",releaseCrouch);
  // Enter/Espaço no botão: alternância acessível sem exigir manter tecla.
  crouchButton.addEventListener("click",event=>{
    if(event.detail===0)crouch(!run.player.crouching);
  });
  section.addEventListener("keydown", event => {
    if (event.target.closest("button,a,input,select,textarea,summary") || event.ctrlKey || event.metaKey || event.altKey) return;
    if (["Space","ArrowUp"].includes(event.code)) {
      event.preventDefault();
      if (!event.repeat) jump();
    } else if(["ArrowDown","KeyS"].includes(event.code)) {
      event.preventDefault();
      crouch(true);
    }
  });
  section.addEventListener("keyup",event=>{
    if(["ArrowDown","KeyS"].includes(event.code)){event.preventDefault();crouch(false);}
  });
  document.addEventListener("visibilitychange",()=>{if(document.hidden)crouch(false);syncActivity();});
  window.addEventListener("blur", () => { crouch(false);windowFocused=false; syncActivity(); });
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
  // Fundo em três planos: céu, silhuetas distantes e um marco por destino.
  // Retirados os cartazes repetitivos, caricaturas sobrepostas e o avião.
  // Tudo é decoração: nenhum novo obstáculo ou hitbox é criado aqui.
  const wrap=(x,span)=>((x%span)+span)%span;
  function layeredHorizon(stage, distance){
    const farShift=distance*.018,nearShift=distance*.052;
    ctx.save();
    // Colinas suaves e afastadas; não competem com o personagem.
    ctx.fillStyle=stage.accent+"16";
    for(let i=-1;i<=7;i++){
      const x=i*185-wrap(farShift,185);
      ctx.beginPath();ctx.moveTo(x-12,225);
      ctx.quadraticCurveTo(x+72,175+(i%3)*7,x+175,225);
      ctx.closePath();ctx.fill();
    }
    // Uma só fileira de elementos baixos dá movimento sem amontoar.
    ctx.fillStyle=stage.ink+"25";
    for(let i=-1;i<=7;i++){
      const x=i*174-wrap(nearShift,174);
      if(stage.id==="rio"){
        ctx.beginPath();ctx.ellipse(x+45,224,34,10,0,Math.PI,0);ctx.fill();
      }else if(stage.id==="florida"){
        ctx.fillRect(x+26,207,36,16);ctx.fillRect(x+34,199,12,8);
      }else if(stage.id==="argentina"){
        ctx.fillRect(x+20,206,29,18);ctx.fillRect(x+54,197,22,27);
      }else{
        ctx.beginPath();ctx.ellipse(x+28,220,22,6,0,0,Math.PI*2);ctx.fill();
        ctx.fillRect(x+25,206,6,16);
      }
    }
    ctx.restore();
  }
  function landmark(stage){
    const x=virtualWidth*.70,base=226;
    ctx.save();
    if(stage.id==="brasilia"){
      // Congresso Nacional: referência arquitetônica concentrada à direita.
      ctx.fillStyle="#eff4f4";ctx.fillRect(x-121,base-14,242,14);
      ctx.fillStyle="#b9ceda";ctx.fillRect(x-14,125,12,87);ctx.fillRect(x+5,125,12,87);
      ctx.fillStyle="#eaf0f1";
      ctx.beginPath();ctx.arc(x-68,base-20,34,Math.PI,0);ctx.fill();
      ctx.beginPath();ctx.arc(x+75,base-42,31,0,Math.PI);ctx.fill();
      ctx.strokeStyle="#a3bac6";ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(x-109,base);ctx.lineTo(x+112,base);ctx.stroke();
    }else if(stage.id==="rio"){
      // Morros do Rio e Cristo Redentor, em duas cores da mesma paleta.
      ctx.fillStyle="#b8d9d2";
      ctx.beginPath();ctx.moveTo(x-170,base);
      ctx.bezierCurveTo(x-105,202,x-122,139,x-72,145);
      ctx.bezierCurveTo(x-27,148,x-27,206,x+21,base);ctx.fill();
      ctx.fillStyle="#a6cec3";
      ctx.beginPath();ctx.moveTo(x-17,base);
      ctx.bezierCurveTo(x+25,204,x+17,121,x+67,126);
      ctx.bezierCurveTo(x+104,130,x+101,209,x+159,base);ctx.fill();
      ctx.strokeStyle="#e8f2e9";ctx.lineWidth=5;ctx.lineCap="round";
      ctx.beginPath();ctx.moveTo(x-70,151);ctx.lineTo(x-70,120);ctx.moveTo(x-87,132);ctx.lineTo(x-53,132);ctx.stroke();
      circle(x-70,113,5,"#e8f2e9");
    }else if(stage.id==="argentina"){
      // Obelisco de Buenos Aires, com prédios discretos bem ao fundo.
      ctx.fillStyle="#ccd9ea";ctx.fillRect(x-145,182,34,42);
      ctx.fillRect(x+103,184,38,40);
      ctx.fillStyle="#fffaf0";ctx.beginPath();
      ctx.moveTo(x-12,base);ctx.lineTo(x-7,116);ctx.lineTo(x,94);
      ctx.lineTo(x+7,116);ctx.lineTo(x+12,base);ctx.closePath();ctx.fill();
      ctx.strokeStyle="#d7d1bd";ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(x,115);ctx.lineTo(x,base);ctx.stroke();
    }else if(stage.id==="florida"){
      // Miami: apenas duas fachadas art déco e palmeiras nas laterais.
      ctx.fillStyle="#f4d6cd";ctx.fillRect(x-93,164,73,61);
      ctx.fillStyle="#d3d6e7";ctx.fillRect(x+3,177,77,48);
      ctx.fillStyle="#fff7ec";
      for(let row=0;row<3;row++){
        ctx.fillRect(x-83,176+row*15,51,4);
        ctx.fillRect(x+13,188+row*12,55,3);
      }
      for(const px of [x-141,x+135]){
        ctx.strokeStyle="#b4a289";ctx.lineWidth=5;ctx.lineCap="round";
        ctx.beginPath();ctx.moveTo(px,base);ctx.quadraticCurveTo(px-7,172,px+2,146);ctx.stroke();
        ctx.strokeStyle="#7cae98";ctx.lineWidth=6;
        for(const dx of [-27,-9,16,29]){
          ctx.beginPath();ctx.moveTo(px+2,146);ctx.lineTo(px+dx,148+Math.abs(dx)*.27);ctx.stroke();
        }
      }
    }else{
      // Casa Branca, um único edifício proporcional ao horizonte.
      ctx.fillStyle="#dce4ee";ctx.fillRect(x-117,166,234,60);
      ctx.fillStyle="#fff";ctx.fillRect(x-108,172,216,51);
      ctx.fillStyle="#e9edf4";ctx.fillRect(x-43,151,86,72);
      ctx.fillStyle="#fff";
      for(let i=0;i<5;i++)ctx.fillRect(x-37+i*16,164,8,59);
      ctx.beginPath();ctx.moveTo(x-53,151);ctx.lineTo(x,119);ctx.lineTo(x+53,151);ctx.closePath();ctx.fill();
      ctx.fillStyle="#b2c2d3";
      for(let i=0;i<4;i++){
        ctx.fillRect(x-99+i*24,185,9,18);ctx.fillRect(x+29+i*24,185,9,18);
      }
      ctx.fillStyle="#edf1f4";ctx.fillRect(x-124,223,248,6);
    }
    ctx.restore();
  }
  function scenery(stage) {
    // O modo de movimento reduzido congela apenas a paralaxe.
    const distance=prefersReducedMotion()?0:run.distance;
    const sky=ctx.createLinearGradient(0,0,0,WORLD.ground);
    sky.addColorStop(0,stage.sky);sky.addColorStop(1,"#ffffff");
    ctx.fillStyle=sky;ctx.fillRect(0,0,virtualWidth,WORLD.height);
    circle(virtualWidth-64,54,20,"#ffffff80");
    // Nuvens esparsas, altas e deslocadas da área dos chefões.
    for(let i=0;i<2;i++){
      const x=wrap(155+i*360-distance*.026,virtualWidth+180)-65;
      cloud(x,69+(i%2)*25);
    }
    layeredHorizon(stage,distance);
    landmark(stage);
    // O solo é o mesmo em todos os destinos, por clareza de jogabilidade.
    ctx.fillStyle=stage.ground;ctx.fillRect(0,WORLD.ground,virtualWidth,WORLD.height-WORLD.ground);
    line([[0,WORLD.ground],[virtualWidth,WORLD.ground]],stage.ink,2);
    const offset=distance%84;
    for(let x=-offset;x<virtualWidth;x+=84)line([[x,274],[x+31,274]],"#ffffffb0",3);
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
    if(b.nextAttack<.65&&b.fired<b.total){
      ctx.fillStyle="#a33e4b";ctx.font="900 11px system-ui";ctx.textAlign="center";
      ctx.fillText(b.type==='xandao'&&b.fired%2===0?"PREPARE O SALTO":"PREPARE O AGACHAMENTO",virtualWidth-86,62);ctx.textAlign="start";
    }
  }
  function character(){
    const airborne=run.player.y>0,reduced=prefersReducedMotion();
    const active=run.status==="running"&&!reduced;
    const phase=active?run.elapsed*12:0;
    const crouchTarget=run.player.crouching&&!airborne;
    const frameTime=performance.now();
    crouchPose=crouchAnimationStep(crouchPose,crouchTarget,(frameTime-lastPoseFrame)/1000,reduced);
    lastPoseFrame=frameTime;
    const bounce=active&&!airborne?(1-crouchPose)*Math.abs(Math.sin(phase))*2:0;
    if(active&&!airborne){
      circle(PLAYER.x-8-run.distance%19,WORLD.ground-2,2.8,"#a6a7aa70");
      // Pequena poeira que acompanha o deslize, sem afetar a pista.
      if(crouchPose>.22){
        circle(PLAYER.x-14,WORLD.ground-5,2.5,"#a6a7aa60");
        circle(PLAYER.x-23,WORLD.ground-8,1.5,"#a6a7aa55");
      }
    }
    ctx.save();ctx.globalAlpha=.12;ctx.fillStyle="#292337";
    ctx.beginPath();ctx.ellipse(PLAYER.x+17,WORLD.ground+4,22+crouchPose*6,4,0,0,Math.PI*2);ctx.fill();ctx.restore();
    if(run.shieldFor>0){
      ctx.save();ctx.strokeStyle="#bda15b";ctx.lineWidth=2;ctx.setLineDash([5,4]);
      ctx.beginPath();ctx.ellipse(PLAYER.x+17,WORLD.ground-run.player.y-35+crouchPose*12,27,47-crouchPose*15,0,0,Math.PI*2);
      ctx.stroke();ctx.restore();
      drawItem(ctx,{type:"shield",x:PLAYER.x+17,y:WORLD.ground-run.player.y-91+crouchPose*35,scale:.38});
    }
    // Animação agachar ↔ levantar dura ~150ms: abaixa o corpo, flexiona
    // a postura e alterna para o quadro de aterrissagem. Sem troca de hitbox.
    const feet=WORLD.ground-run.player.y-bounce;
    ctx.save();
    if(crouchPose>.001&&!airborne){
      const pivot=PLAYER.x+17;
      ctx.translate(pivot,feet);
      ctx.rotate(-.045*crouchPose);
      ctx.scale(1+.09*crouchPose,1-.53*crouchPose);
      ctx.translate(-pivot,-feet);
    }
    drawActor(ctx,{type:"flavio",x:PLAYER.x+17,y:feet,scale:.95,phase,airborne,
      landing:run.elapsed<landingUntil||(crouchPose>.60&&!airborne),
      hurt:run.status==="over",alpha:run.shieldFor>0?.27:run.graceFor>0?.55:1});
    ctx.restore();
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
