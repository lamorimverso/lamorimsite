import {createVoiceDirector} from './runner-voice-director.mjs?v=e9e904bed9c1';
import { WORLD, PLAYER, STAGES, SCENE_SECONDS, SCENE_DISTANCE, RAID_FACTS, difficultyAt, createRun, resizeRun, startRun, jumpRun, crouchRun, clearRunInput, advanceRun, stageAt, stageTransitionAt, scoreFor, bossAttackFor } from "./runner-core.mjs?v=8066458e20b0";
import { drawActor, drawItem, drawThreat, loadSprites, drawSpritePortrait, enemyMotionFor, crouchAnimationStep, drawProtection, drawJacare, SPRITE_SHEET_COUNT } from "./runner-art.mjs?v=eac2697a2d91";
import { createGameAudio } from "./runner-audio.mjs?v=325b12904473";
import { ARCHIVE_VOICES } from "./runner-voice-data.mjs?v=e04644dd1f8f";
import { drawJourneyScenery, drawRaidAtmosphere, raidMoodFor } from "./runner-scenery.mjs?v=cb8316f1085d";
import { createFrameClock,resetFrameClock,advanceFrameClock } from "./runner-clock.mjs?v=81383aa71924";

function initRunner() {
  const $ = id => document.getElementById(id);
  const canvas = $("runner-canvas"), section = $("game");
  if (!canvas || !section) return;
  // Uma aba pode ter conservado o HTML anterior enquanto os módulos já
  // mudaram. Atualizar a página uma vez evita inicializar sobre IDs antigos.
  if(!$("game-settings")||!$("game-start-hint")||!$("game-expand-label")||!$("game-sound-label")||!$("game-voice-note")||!$("game-captured")||!$("countdown-layout")||$("game-jump")||$("game-progress")){
    const url=new URL(location.href);
    if(url.searchParams.get("ui")!=="20261030-pressure"){
      url.searchParams.set("ui","20261030-pressure");location.replace(url.href);
    }else{
      const button=$("game-start"),note=$("game-loading-note");
      if(button){button.disabled=false;button.textContent="Recarregar jogo";button.addEventListener("click",()=>location.reload(),{once:true});}
      if(note){note.hidden=false;note.textContent="A página precisa ser atualizada para carregar o jogo. Tente recarregar.";}
    }
    return;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    $("game-loading-note").textContent = "O jogo não está disponível neste navegador. A contagem continua funcionando.";
    $("game-status").textContent = $("game-loading-note").textContent;
    $("game-start").textContent="Jogo indisponível";
    $("game-start").disabled = true;
    return;
  }
  const recordKey = "tanahoraflavio.runner.best.metres.v2";
  let best = 0;
  try {
    const stored = Number(localStorage.getItem(recordKey));
    if (Number.isSafeInteger(stored) && stored >= 0 && stored <= 10000000) best = stored;
  } catch { /* O modo privado e o armazenamento bloqueado não impedem jogar. */ }
  const preferences={crouchMode:"hold",effects:"system",assisted:false};
  const preferencesKey="tanahoraflavio.runner.preferences.v1";
  try{
    const saved=JSON.parse(localStorage.getItem(preferencesKey)||"{}");
    if(saved&&typeof saved==="object"){
      if(["hold","toggle"].includes(saved.crouchMode))preferences.crouchMode=saved.crouchMode;
      if(["system","reduce"].includes(saved.effects))preferences.effects=saved.effects;
      preferences.assisted=saved.assisted===true;
    }
  }catch{/* Ajustes continuam disponíveis sem persistência. */}
  $("game-crouch-mode").value=preferences.crouchMode;
  $("game-effects").value=preferences.effects;
  $("game-assist").checked=preferences.assisted;
  let run=createRun({assisted:preferences.assisted}),frameId=0;
  const trackPointers=new Map();
  const frameClock=createFrameClock(performance.now());
  let spritesReady=false,spritesFailed=false,loadedSprites=0,loadingSprites=false,landingUntil=0;
  let crouchPose=0,lastPoseFrame=performance.now();
  let windowFocused = true, inView = true;
  let lastStatus = "", lastStage = -1, virtualWidth = 900, measuredWidth = 0, measuredDpr = 0;
  let lastCollected=0,lastPower="";
  let lastLives = 1, lastEvents = 0;
  const audio=createGameAudio({onVoice:clip=>{
    const note=$("game-voice-note");note.hidden=!clip;
    note.textContent=clip?"Áudio de arquivo · "+(clip.label||clip.quote):"";
    note.title=clip?clip.speaker+". "+clip.context:"";
  }});
  const voices=createVoiceDirector({play:(id,options)=>audio.voice(id,options)});
  $("game-sound-label").textContent=audio.enabled?"Som ligado":"Som desligado";
  $("game-sound").title=$("game-sound-label").textContent;
  $("game-sound").setAttribute("aria-pressed",String(audio.enabled));
  let lastRaidKey="",lastPageMotion=null;
  const campaignPhases=["Convenções","Campanha","1º turno","Reta final","Diplomação"];
  const routeSeconds=()=>run.routeDistance/SCENE_DISTANCE*SCENE_SECONDS;
  const pad = number => String(number).padStart(2, "0");
  // A preferência pode mudar enquanto o jogo está aberto.
  const motionPreference = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  const prefersReducedMotion = () => preferences.effects==="reduce"||motionPreference?.matches === true;
  function bossCue(){
    if(!run.boss)return null;
    const incoming=run.obstacles.filter(o=>o.bossAttack&&!o.counted&&o.x+o.width>=PLAYER.x).sort((a,b)=>a.x-b.x)[0];
    return incoming||bossAttackFor(run.boss.type,Math.min(run.boss.fired,run.boss.total-1),run.boss.round-1);
  }
  function dodgeHint(){
    const hit=run.lastHit;if(!hit)return "Observe os perigos e tente novamente.";
    const names={stamp:'Carimbo TAXA',wind:"Vento",microphone:"Microfone","paper-gate":"Papéis",popcorn:"Pipoca",hammer:"Martelo",mandado:"Mandado",receipts:"Papéis",lhand:"Mão em L"};
    if(hit.action==="crouch")return (names[hit.type]||"Ataque")+" no alto: abaixe para desviar.";
    return (names[hit.type]||"Perigo")+" baixo: sincronize o salto para desviar.";
  }

  function updateUI() {
    const clock=routeSeconds(),stage=stageAt(clock),score=scoreFor(run),difficulty=difficultyAt(run.distance,run.elapsed);
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
    $("game-difficulty").textContent="Risco "+difficulty.level+"/10 · "+Math.round(difficulty.speed)+" px/s";
    $("game-stage-time").textContent=run.status==="over"?"Fim da corrida":run.boss?run.boss.remaining+" ataques para escapar do chefão":run.raid?"Perseguição especial":campaignPhases[stage.index];
    $("game-best").textContent=best.toLocaleString("pt-BR");
    $("game-time").textContent=pad(Math.floor(run.elapsed/60))+":"+pad(Math.floor(run.elapsed%60));
    section.dataset.runState=run.status;
    section.dataset.reducedMotion=String(prefersReducedMotion());
    if(lastPageMotion!==prefersReducedMotion()){
      lastPageMotion=prefersReducedMotion();
      section.dispatchEvent(new CustomEvent("runner:motion",{detail:{reducedMotion:lastPageMotion}}));
    }
    section.dataset.art=spritesReady?"loaded":spritesFailed?"error":"loading";
    const power=run.shieldFor>0?"shield":run.graceFor>0?"recovery":"none";
    section.dataset.power=run.player.isJacare?"jacare":power;section.dataset.ammo="none";
    $("game-power").textContent=run.player.isJacare?"Jacaré fictício · ↑ para voltar a Flávio (cloroquina de videogame)":power==="shield"?"Escudo das Américas · "+Math.ceil(run.shieldFor)+" s":power==="recovery"?"Recuperando · "+Math.ceil(run.graceFor)+" s":"Sem efeito ativo";
    $("game-ammo").parentElement.hidden=true;
    $("game-boss").hidden=run.status!=="running"||!run.boss;section.dataset.boss=run.boss?.type||"none";
    if(run.boss){
      const b=run.boss;
      $("game-boss-name").textContent=b.name+" · rodada "+b.level;
      $("game-boss-health").setAttribute("aria-valuemax",String(b.total));
      $("game-boss-health").setAttribute("aria-valuenow",String(b.total-b.remaining));
      $("game-boss-health").setAttribute("aria-label",b.objective||"Ataques superados");
      $("game-boss-progress").style.width=100*(b.total-b.remaining)/b.total+"%";
      const dodged=b.total-b.remaining;
      const goal=dodged+"/"+b.total+" "+(b.goalKind==="papers"?"papéis":b.goalKind==="patterns"?"gestos em L":"ataques");
      $("game-boss-weapon").textContent=(bossCue().action==="crouch"?"↓ Abaixe":"↑ Pule")+" · "+goal;
      $("game-boss").style.setProperty("--boss-accent",b.color);
    }
    $("game-threat").textContent=run.raid?.phase==="active"?"PF em operação":"Inimigos sorteados · "+stage.short;
    $("game-objective").textContent=run.status==="running"&&run.boss?(bossCue().action==="crouch"?"↓ Abaixe para passar sob o ataque alto.":"↑ Pule para superar o ataque baixo."):"Faltam "+(100-run.passports%100)+" passaportes para +1 vida";
    $("game-objective").hidden=run.status==="running"&&(!!run.boss||!!run.raid||!banner.hidden);
    const raid=run.status==="running"?run.raid:null;
    $("game-raid").hidden=!raid;section.dataset.raid=raid?.phase||"none";
    if(raid){
      const fact=RAID_FACTS[raid.factIndex];
      $("game-raid-title").textContent=raid.phase==="warning"?"JOICE APARECEU!":raid.phase==="active"?"É A POLÍCIA FEDERAL! · "+Math.ceil(raid.remaining)+" s":"RITMO NORMAL VOLTANDO";
      $("game-raid-copy").textContent=raid.phase==="warning"?"Toc, toc, toc… prepare os reflexos!":raid.phase==="active"?"↑ Pule a PF · ↓ Abaixe dos microfones":"Respire: o cenário e o ritmo estão voltando.";
      $("game-raid-source").textContent="Áudio de arquivo · Joice · Câmara";
      $("game-raid-source").href=ARCHIVE_VOICES.joice.source;
      const raidKey=raid.id+":"+raid.phase;
      if(raidKey!==lastRaidKey){audio.event(raid.phase,fact);lastRaidKey=raidKey;}
    }else if(lastRaidKey){audio.stop();lastRaidKey="";}
    $("game-start").disabled=!spritesReady&&!spritesFailed;
    $("game-start").textContent=!spritesReady?(spritesFailed?"Tentar carregar desenhos":"Carregando desenhos · "+loadedSprites+"/"+SPRITE_SHEET_COUNT):run.status==="ready"?"Começar corrida":run.status==="over"?"Tentar de novo":"Recomeçar corrida";
    $("game-loading-note").hidden=spritesReady;
    $("game-loading-note").textContent=spritesFailed?"Os desenhos não carregaram. Toque no botão para tentar novamente.":"Preparando os personagens…";
    $("game-overlay").hidden=run.status==="running";
    $("game-captured").hidden=run.status!=="over";
    $("game-start-hint").hidden=run.status!=="ready";
    if(run.status==="over"){
      $("game-overlay-title").textContent="Foi pego pela Polícia Federal!";
      $("game-overlay-copy").textContent=dodgeHint()+" "+score.toLocaleString("pt-BR")+" m · "+run.passports+" passaportes.";
      $("game-overlay-badge").textContent="Perseguição fictícia";audio.stop();
      if(lastStatus!=="over")section.dispatchEvent(new Event("runner:over"));
    }
    if(lastStatus!==run.status||lastStage!==stage.index||lastCollected!==run.collected||lastPower!==power||lastLives!==run.lives||lastEvents!==run.events){
      let message=run.status==="ready"?"Tudo pronto. A corrida começa quando você quiser.":run.status==="over"?"Foi pego pela Polícia Federal! "+dodgeHint()+" "+score+" metros percorridos. Toque em Tentar de novo.":stage.name+" · pule ou abaixe conforme o perigo.";
      if(run.status==="running"){
        if(run.events>lastEvents)message=run.event;
        else if(lastCollected!==run.collected)message="Passaporte coletado. Faltam "+(100-run.passports%100)+" para uma vida.";
        else if(lastPower==="shield"&&power!=="shield")message="O Escudo das Américas terminou. Volte a desviar!";
        if(lastStage>=0&&lastStage!==stage.index){message="Chegamos a "+stage.name+"! A corrida continua.";audio.effect("stage");}
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
    if(document.hidden||!windowFocused||!inView||run.status!=="running"){
      audio.stop();lastRaidKey="";clearRunInput(run);trackPointers.clear();
    }
    schedule();
  }
  function frame(now) {
    frameId=0;if(run.status!=="running")return;
    const timing=advanceFrameClock(frameClock,now),wasAirborne=run.player.y>0;
    const before={lives:run.lives,collected:run.collected,boss:run.boss?.type,
      passports:run.passports,spawned:run.spawnedObstacles,attacks:run.boss?.fired||0};
    let bufferedTakeoff=false;
    for(let i=0;i<timing.steps&&run.status==="running";i++){
      const pending=run.player.jumpBufferedUntil>0&&run.player.velocity<=0;
      advanceRun(run,timing.step);
      if(pending&&run.player.jumpBufferedUntil===0&&run.player.velocity>0)bufferedTakeoff=true;
    }
    if(wasAirborne&&run.player.y===0)landingUntil=run.elapsed+.12;
    updateUI();
    if(run.lives<before.lives)audio.effect("hit");
    else if(before.boss&&!run.boss)audio.effect("victory");
    else if(!before.boss&&run.boss){audio.effect("boss");voices.event("boss",run);}
    else if(run.boss&&run.boss.fired>before.attacks)audio.effect("attack");
    else if(run.collected>before.collected)audio.effect(run.lastPickup==="ze-gotinha"?"transform":"pickup");
    if(run.spawnedObstacles>before.spawned){
      const newest=run.obstacles.at(-1);
      audio.effect(newest?.action==="crouch"?"high":"low");
      const actor=newest?.sourceActor||newest?.type;
      if(actor)voices.event("actor",run,actor);
    }
    if(run.collected>before.collected){
      if(run.lastPickup==="ze-gotinha")voices.event("ally",run);
    }
    const nearest=Math.min(Infinity,...run.obstacles.filter(o=>o.x+o.width>PLAYER.x).map(o=>(o.x-148)/(o.speed||1)));
    voices.update(run,{safe:nearest>.9});
    audio.background({active:run.status==="running",pressure:difficultyAt(run.distance,run.elapsed).pressure,boss:!!run.boss,raid:run.raid?.phase==="active"});
    if(bufferedTakeoff&&run.status==="running")audio.effect("jump");
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
    audio.stop();audio.prime();voices.reset();lastRaidKey="";
    trackPointers.clear();
    run=createRun({assisted:preferences.assisted});run.viewportWidth=virtualWidth;startRun(run);landingUntil=0;
    $("game-settings").open=false;
    crouchPose=0;lastPoseFrame=performance.now();
    lastCollected=0;lastPower="";lastStatus="";lastEvents=0;lastLives=1;
    resetFrameClock(frameClock,performance.now());
    updateUI();section.dispatchEvent(new Event("runner:start"));draw();resumeFromGesture();syncActivity();canvas.focus({preventScroll:true});
  }
  function jump(){
    resumeFromGesture();
    if(["ready","over"].includes(run.status))begin();
    const wasJacare=run.player.isJacare;
    if(jumpRun(run)){audio.effect("jump");draw();}
    else if(wasJacare&&!run.player.isJacare){audio.effect("restore");updateUI();draw();}
  }
  function crouch(active){
    if(crouchRun(run,active)){draw();}
    else if(!active)draw();
  }
  $("game-start").addEventListener("click",begin);
  $("game-sound").addEventListener("click",()=>{
    const enabled=audio.toggle();$("game-sound-label").textContent=enabled?"Som ligado":"Som desligado";
    $("game-sound").title=$("game-sound-label").textContent;
    $("game-sound").setAttribute("aria-pressed",String(enabled));lastRaidKey="";updateUI();
  });
  function savePreferences(){try{localStorage.setItem(preferencesKey,JSON.stringify(preferences));}catch{/* A sessão atual permanece funcional. */}}
  $("game-crouch-mode").addEventListener("change",()=>{crouch(false);preferences.crouchMode=$("game-crouch-mode").value;savePreferences();});
  $("game-effects").addEventListener("change",()=>{preferences.effects=$("game-effects").value;savePreferences();updateUI();draw();});
  $("game-assist").addEventListener("change",()=>{preferences.assisted=$("game-assist").checked;savePreferences();});
  let expanded=false;
  function setExpanded(active){
    expanded=!!active;section.classList.toggle("is-expanded",expanded);document.body.classList.toggle("game-expanded",expanded);
    $("game-expand").setAttribute("aria-pressed",String(expanded));
    $("game-expand").setAttribute("aria-expanded",String(expanded));
    $("game-expand-icon").textContent=expanded?"⤡":"⤢";
    $("game-expand-label").textContent=expanded?"Recolher":"Expandir";
    $("game-expand").setAttribute("aria-label",expanded?"Recolher jogo":"Ampliar jogo");
    $("game-expand").title=expanded?"Recolher jogo":"Ampliar jogo";
    resize();resumeFromGesture();
  }
  $("game-expand").addEventListener("click",()=>setExpanded(!expanded));
  document.addEventListener("keydown",event=>{if(event.code==="Escape"&&expanded){event.preventDefault();setExpanded(false);canvas.focus({preventScroll:true});}});
  // Gestos na pista substituem os botões: toque/passe para cima, ou desça e segure.
  canvas.addEventListener("pointerdown",event=>{
    if(event.button!==0||(event.isPrimary===false&&event.pointerType!=="touch"))return;
    event.preventDefault();resumeFromGesture();canvas.focus({preventScroll:true});
    if(event.pointerType!=="touch"||run.status!=="running"){jump();return;}
    const pointer={x:event.clientX,y:event.clientY,action:"pending"};
    if(run.player.crouchHeld&&(preferences.crouchMode==="hold"||trackPointers.size>0)){pointer.action="jump";jump();}
    trackPointers.set(event.pointerId,pointer);
    try{canvas.setPointerCapture?.(event.pointerId);}catch{/* Eventos assistivos podem não ter contato nativo. */}
  },{passive:false});
  canvas.addEventListener("pointermove",event=>{
    const pointer=trackPointers.get(event.pointerId);if(!pointer||pointer.action!=="pending")return;
    const dx=event.clientX-pointer.x,dy=event.clientY-pointer.y;
    if(Math.max(Math.abs(dx),Math.abs(dy))<22)return;
    event.preventDefault();
    if(Math.abs(dx)>Math.abs(dy)){pointer.action="cancelled";return;}
    if(dy<0){pointer.action="jump";jump();}
    else{pointer.action="crouch";crouch(preferences.crouchMode==="toggle"?!run.player.crouchHeld:true);}
  },{passive:false});
  function releaseTrackPointer(event){
    const pointer=trackPointers.get(event.pointerId);if(!pointer)return;
    trackPointers.delete(event.pointerId);
    if(pointer.action==="pending"&&event.type==="pointerup")jump();
    if(pointer.action==="crouch"&&preferences.crouchMode==="hold"&&![...trackPointers.values()].some(p=>p.action==="crouch"))crouch(false);
  }
  canvas.addEventListener("pointerup",releaseTrackPointer);
  canvas.addEventListener("lostpointercapture",releaseTrackPointer);
  canvas.addEventListener("pointercancel",()=>{trackPointers.clear();clearRunInput(run);crouch(false);});
  canvas.addEventListener("click",event=>{if(!("PointerEvent" in window)||event.detail===0)jump();});
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
    resizeRun(run,virtualWidth);
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
  function bossFigure(){
    const b=run.boss;if(!b)return;
    const phase=run.elapsed*9;
    // Balanço sutil e passos para o chefe não parecer congelado.
    const bossX=virtualWidth-72,bossY=WORLD.ground-3;
    const motion=enemyMotionFor(b.type,prefersReducedMotion()?0:phase,bossX);
    ctx.save();ctx.translate(bossX,bossY+motion.bob);ctx.rotate(motion.lean);
    drawActor(ctx,{type:b.type,x:0,y:0,scale:1.62,phase,preparing:b.nextAttack<.55&&b.fired<b.total,attacking:b.attackFlashFor>0,hurt:b.hitFlashFor>0});
    ctx.restore();
    if(b.nextAttack<.65&&b.fired<b.total&&!run.obstacles.some(o=>o.bossAttack&&!o.counted)){
      ctx.fillStyle="#843338";ctx.font="800 16px system-ui";ctx.textAlign="center";
      ctx.fillText(bossAttackFor(b.type,b.fired,b.round-1).action==="jump"?"↑ PULE":"↓ ABAIXE",virtualWidth-86,62);ctx.textAlign="start";
    }
  }
  function character(){
    const airborne=run.player.y>0||run.player.velocity>0,reduced=prefersReducedMotion();
    const active=run.status==="running",decorative=active&&!reduced;
    // A passada comunica a corrida; reduzir efeitos só retira poeira/balanço.
    const phase=active?run.distance/24:0;
    const crouchTarget=run.player.crouching&&!airborne;
    const frameTime=performance.now();
    crouchPose=crouchAnimationStep(crouchPose,crouchTarget,(frameTime-lastPoseFrame)/1000,reduced);
    lastPoseFrame=frameTime;
    const bounce=decorative&&!airborne?(1-crouchPose)*Math.abs(Math.sin(phase*Math.PI/4))*1.2:0;
    if(decorative&&!airborne){
      circle(PLAYER.x-8-run.distance%19,WORLD.ground-2,2.8,"#a6a7aa70");
      // Pequena poeira que acompanha o deslize, sem afetar a pista.
      if(crouchPose>.22){
        circle(PLAYER.x-14,WORLD.ground-5,2.5,"#a6a7aa60");
        circle(PLAYER.x-23,WORLD.ground-8,1.5,"#a6a7aa55");
      }
    }
    ctx.save();ctx.globalAlpha=.12;ctx.fillStyle="#292337";
    ctx.beginPath();ctx.ellipse(PLAYER.x+17,WORLD.ground+4,22+crouchPose*6,4,0,0,Math.PI*2);ctx.fill();ctx.restore();
    // Slide desenhado na postura baixa: sem comprimir o rosto novamente.
    const feet=WORLD.ground-run.player.y-bounce;
    const protection={x:PLAYER.x+17,y:feet,crouching:crouchTarget,remaining:run.shieldFor};
    ctx.save();
    if(crouchTarget){
      const pivot=PLAYER.x+17;
      ctx.translate(pivot,feet);
      ctx.rotate(-.018*crouchPose);
      ctx.translate(-pivot,-feet);
    }else if(active&&!airborne&&run.elapsed<landingUntil){
      const ease=(landingUntil-run.elapsed)/.12,pivot=PLAYER.x+17;
      ctx.translate(pivot,feet);ctx.scale(1+.025*ease,1-.025*ease);ctx.translate(-pivot,-feet);
    }
    if(run.player.isJacare)drawJacare(ctx,{x:PLAYER.x+17,y:feet,phase});
    else drawActor(ctx,{type:"flavio",x:PLAYER.x+17,y:feet,scale:.95,phase,airborne,
      falling:run.player.velocity<0,landing:crouchTarget,
      hurt:run.status==="over",alpha:run.graceFor>0&&run.shieldFor<=0?.55:1});
    ctx.restore();
    drawProtection(ctx,{...protection,foreground:true});
  }
  function joiceFigure(){
    const raid=run.raid;if(run.status!=="running"||!raid)return;
    if(raid.phase==='recovery')return;
    drawActor(ctx,{type:"joice",x:virtualWidth-62,y:WORLD.ground-2,scale:1.08,phase:run.elapsed*10});
  }
  function obstacle(item){
    if(item.projectile){
      // O rastro confirma visualmente que o ataque parte do chefão rumo ao jogador.
      const y=WORLD.ground-item.y;
      line([[item.x+item.width*.78,y-2],[item.x+item.width+22,y-7]],"#bd526e",3);
      drawThreat(ctx,item,y+item.height/2,run.elapsed*10,{reducedMotion:prefersReducedMotion()});
    }else drawThreat(ctx,item,WORLD.ground,run.elapsed*10,{reducedMotion:prefersReducedMotion()});
  }
  function pickup(item){
    if(item.type==="ze-gotinha"){
      drawActor(ctx,{type:"ze-gotinha",x:item.x,y:WORLD.ground,scale:.72,phase:run.elapsed*10});return;
    }
    const phase=run.status==="running"?run.elapsed*6:0;
    const bob=prefersReducedMotion()?0:Math.sin(phase+item.x*.017)*1.3;
    const pulse=prefersReducedMotion()?1:1+.035*Math.sin(phase+item.x*.012);
    drawItem(ctx,{type:item.type,x:item.x,y:WORLD.ground-item.y+bob,scale:(item.type==="shield"?.86:.8)*pulse});
  }
  function draw() {
    ctx.setTransform(canvas.width/virtualWidth,0,0,canvas.height/WORLD.height,0,0);
    drawJourneyScenery(ctx,{routeDistance:run.routeDistance,distance:run.distance,width:virtualWidth,reducedMotion:prefersReducedMotion()});
    drawRaidAtmosphere(ctx,{strength:raidMoodFor(run.raid),width:virtualWidth,distance:run.distance,reducedMotion:prefersReducedMotion()});
    bossFigure();
    joiceFigure();
    if(run.cameo&&!run.boss&&!run.raid){
      const actor=run.cameo.type;
      drawActor(ctx,{type:actor,x:virtualWidth-60,y:WORLD.ground-2,scale:1.05,phase:run.elapsed*10});
      ctx.fillStyle="#59344f";ctx.font="700 12px system-ui";ctx.textAlign="center";
      ctx.fillText(({dilma:"Dilma · ↓",simone:"Adesivo: Gostosas com Lula · ↓",soraya:"Padre de festa junina · ↓"})[actor],virtualWidth-87,130,165);ctx.textAlign="start";
    }
    for(const item of run.pickups)pickup(item);
    for(const item of run.obstacles)obstacle(item);
    character();
  }
  for(const id of ["game-sound","game-expand","game-crouch-mode","game-effects","game-assist"])$(id).disabled=false;
  updateUI();resize();draw();prepareSprites();
}

initRunner();
