import {normalizeControls,keyboardActionFor,keyLabel} from './runner-control-map.mjs?v=2bb295d2954f';
import {createControlSettings} from './runner-control-settings.mjs?v=4f1a7c34883d';
import {createGamepadDriver} from './runner-gamepad.mjs?v=b3315cc72b13';
import {HERO_POWERS,heroPowerFor,equipHeroPower,cycleHeroPower} from './runner-earned-powers.mjs?v=27e0bb16e2f2';
import {updateCombatHUD} from './runner-combat-hud.mjs?v=105e8d20d358';
import {createMovementSoundDirector} from './runner-movement-audio.mjs?v=3b96b07ed6e3';
import {HERO_SHOT_DURATION,drawHeroProjectile} from './runner-hero-shot.mjs?v=f273e11b16a6';
import {regularEmitterPose,regularEmitterExitPose,regularCastPresentation} from './runner-cast-pose.mjs?v=ed1b40296acc';
import {createShotSoundTracker} from './runner-shot-events.mjs?v=a3769f250d68';
import {bossPresentationFor} from './runner-bosses.mjs?v=4d0d9c1a5182';
import {createVoiceDirector} from './runner-voice-director.mjs?v=405b7acd6323';
import { WORLD, PLAYER, JACARE_DURATION_SECONDS, STORY_BOSS_COUNT, STAGES, SCENE_SECONDS, SCENE_DISTANCE, RAID_FACTS, difficultyAt, characterProgressAt, attackCueFor, ballotDigit, ballotClear, ballotConfirm, createRun, resizeRun, startRun, moveRun, playerX, threatTimeToContact, jumpRun, crouchRun, clearRunInput, advanceRun, stageAt, stageTransitionAt, scoreFor, bossAttackFor,attackRun,setAttackRun,activateReserveShield,bossArenaPose,heroMuzzleFor,campaignRouteDistance,STORY_OPENING_DISTANCE } from "./runner-core.mjs?v=9f0d4a32624f";
import {bossCounterWindow} from './runner-bosses.mjs?v=4d0d9c1a5182';
import {drawHoverEnemy,drawBossArena} from './runner-boss-art.mjs?v=a750937a6c76';
import { drawHeroShot, drawActor, drawItem, drawThreat, drawProjectile, enemyEmitterPose, loadSprites, drawSpritePortrait, enemyMotionFor, crouchAnimationStep, drawProtection, drawJacare, jacareBlendFor, drawFallingThreat, drawManholeThreat, drawMemeArmy, drawBossOfBosses, drawPhantomCloud, drawComunismoGhostBoss, drawEnemyActor, CORE_SPRITE_SHEET_COUNT } from "./runner-art.mjs?v=40174ceffa76";
import { createGameAudio } from "./runner-audio.mjs?v=501606e818db";
import { ARCHIVE_VOICES } from "./runner-voice-data.mjs?v=d5e017561fd6";
import { drawJourneyScenery, drawRaidAtmosphere, raidMoodFor } from "./runner-scenery.mjs?v=5bf1abd1a18b";
import { createFrameClock,resetFrameClock,advanceFrameClock } from "./runner-clock.mjs?v=81383aa71924";

import {allyById} from './runner-allies.mjs?v=260a67b845c4';
import {createPressGate,createHeldSources} from './runner-input.mjs?v=bbf7f3e16548';

function initRunner() {
  const $ = id => document.getElementById(id);
  const canvas = $("runner-canvas"), section = $("game");
  if (!canvas || !section) return;
  // Uma aba pode ter conservado o HTML anterior enquanto os módulos já
  // mudaram. Atualizar a página uma vez evita inicializar sobre IDs antigos.
  if(!$("game-control-bindings")||!$("game-combat-hud")||!$("game-hero-health")||!$("game-power-charge")||!$("game-weapon-select")||!$("game-power-reward")||!$("game-reserve-shield")||!$("game-aid-status")||!$("game-effects")||!$("game-assist")||$("game-options-panel")||!$("game-attack")||!$("game-jacare-progress")||!$("game-support-retry")||!$("game-settings")||!$("game-start-hint")||!$("game-expand-label")||!$("game-sound-label")||!$("game-voice-note")||!$("game-captured")||!$("countdown-layout")||$("game-jump")||$("game-progress")){
    const url=new URL(location.href);
    if(url.searchParams.get("ui")!=="20261115-clean-game"){
      url.searchParams.set("ui","20261115-clean-game");location.replace(url.href);
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
  const preferences={crouchMode:"hold",effects:"system",assisted:false,controls:normalizeControls(null)};
  const preferencesKey="tanahoraflavio.runner.preferences.v1";
  try{
    const saved=JSON.parse(localStorage.getItem(preferencesKey)||"{}");
    if(saved&&typeof saved==="object"){
      if(["hold","toggle"].includes(saved.crouchMode))preferences.crouchMode=saved.crouchMode;
      if(["system","reduce"].includes(saved.effects))preferences.effects=saved.effects;
      preferences.assisted=saved.assisted===true;
      preferences.controls=normalizeControls(saved.controls,saved.fireKey);
    }
  }catch{/* Ajustes continuam disponíveis sem persistência. */}
  $("game-crouch-mode").value=preferences.crouchMode;
  $("game-effects").value=preferences.effects;
  $("game-assist").checked=preferences.assisted;
  const controlsOpen=()=>$("game-settings").open;
  const isFireKey=code=>keyboardActionFor(preferences.controls,code)==='fire';
  const controlLabels=()=>Object.fromEntries(Object.entries(preferences.controls.keyboard).map(([action,keys])=>[action,keys.map(keyLabel).join('/')]));
  let controlSettings=null,gamepadDriver=null;
  const gamepadHeld=new Set();
  let run=createRun({assisted:preferences.assisted}),frameId=0;
  run.supportAvailable=false;
  const trackPointers=new Map(),moveKeys=new Set(),jumpKeys=createPressGate(),crouchSources=createHeldSources(),attackSources=createHeldSources();
  const attackButton=$("game-attack"),firePointers=new Set();
  const frameClock=createFrameClock(performance.now());
  let spritesReady=false,spritesFailed=false,loadedSprites=0,loadingSprites=false,landingUntil=0;
  let supportReady=false,supportLoading=false,supportFailed=false;
  let crouchPose=0,lastPoseFrame=performance.now();
  let windowFocused = true, inView = true;
  let lastStatus = "", lastStage = -1, virtualWidth = 900, measuredWidth = 0, measuredDpr = 0;
  let lastCollected=0,lastPower="",lastPointerAt=-Infinity;
  let lastLives = 1, lastEvents = 0;
  const audio=createGameAudio({onVoice:clip=>{
    const note=$("game-voice-note");note.hidden=!clip;
    note.textContent=clip?clip.speaker+" · "+(clip.label||clip.quote):"";
    note.title=clip?clip.speaker+". "+clip.context:"";
  }});
  const shotSounds=createShotSoundTracker((actor,weapon,shot)=>{if(!audio.enemyShot(actor,weapon))audio.effect(weaponEffect(shot));});
  const voices=createVoiceDirector({play:(id,options)=>audio.voice(id,options),selector:audio.voiceSelector});
  const movementSounds=createMovementSoundDirector({play:name=>audio.movement(name)});
  $("game-sound-label").textContent=audio.enabled?"Som ligado":"Som desligado";
  $("game-sound").title=$("game-sound-label").textContent;
  $("game-sound").setAttribute("aria-pressed",String(audio.enabled));
  let lastRaidKey="",lastPageMotion=null,lastHeroShotHeard=0;
  const campaignPhases=["Convenções","Campanha","1º turno","Travessia do Paraguai","Reta final","Diplomação"];
  const routeSeconds=()=>campaignRouteDistance(run)/SCENE_DISTANCE*SCENE_SECONDS;
  const pad = number => String(number).padStart(2, "0");
  // A preferência pode mudar enquanto o jogo está aberto.
  const motionPreference = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  const prefersReducedMotion = () => preferences.effects==="reduce"||motionPreference?.matches === true;
  function bossCue(){
    if(!run.boss)return null;
    const incoming=run.obstacles.filter(o=>o.bossAttack&&!o.counted&&!o.passed).sort((a,b)=>threatTimeToContact(run,a)-threatTimeToContact(run,b))[0];
    return incoming||(run.boss.plannedFor===run.boss.fired?run.boss.plannedAttack:bossAttackFor(run.boss.type,Math.min(run.boss.fired,run.boss.total-1),run.boss.round-1));
  }
  function dodgeHint(){
    const hit=run.lastHit;if(!hit)return "Observe os perigos e tente novamente.";
    const names={stamp:'Carimbo TAXA',wind:"Vento",'meme-ghost':"Exército de Memes",'cloroquina-prop':"Cloroquina fictícia",'ivermectina-prop':"Ivermectina fictícia","budget-sheets":"Planilhas","parachute-cross":"Cruz com paraquedas",handcuffs:"Algemas",microphone:"Microfone","paper-gate":"Papéis",popcorn:"Pipoca",hammer:"Martelo",mandado:"Mandado",receipts:"Papéis",lhand:"Mão em L"};
    if(hit.action==="move")return hit.type==="pfizer-ampoule"?"Ampola cenográfica da Pfizer: desvie lateralmente para sair do alvo.":(names[hit.type]||"Objeto")+" em queda: saia do alvo no chão com ←/→ ou deslize lateral.";
    if(hit.action==="crouch")return (names[hit.type]||"Ataque")+" no alto: abaixe para desviar.";
    return (names[hit.type]||"Perigo")+" baixo: sincronize o salto para desviar.";
  }

  function updateUI() {
    run.reducedMotion=prefersReducedMotion();
    if(run.boss)run.boss.reducedMotion=run.reducedMotion;
    const clock=routeSeconds(),stage=stageAt(clock),score=scoreFor(run),difficulty=difficultyAt(run.distance,run.elapsed);
    const transition=stageTransitionAt(clock),banner=$("game-transition");
    // Destinations remain accessible; the scenery itself communicates transitions.
    banner.hidden=true;
    if(transition.active){
      $("game-transition-name").textContent=transition.to.name;
      $("game-transition-progress").style.width=Math.round(transition.progress*100)+"%";
    }
    if((run.status==="over"||run.status==="won")&&score>best){best=score;try{localStorage.setItem(recordKey,String(best));}catch{}}
    $("game-score").textContent=String(score).padStart(4,"0");
    $("game-lives").textContent=String(run.lives);
    const weapon=heroPowerFor(run),loadout=$("game-weapon-select"),owned=run.ownedPowers||['ivermectina'];
    $("game-power-loadout").hidden=run.status!=="running";
    if(loadout.options.length!==owned.length){loadout.replaceChildren(...owned.map(id=>{const option=document.createElement('option');option.value=id;option.textContent=HERO_POWERS[id].name;return option;}));}
    for(const option of loadout.options){const label=HERO_POWERS[option.value].name+(option.value!=='ivermectina'?' · Nv. '+(run.powerLevels[option.value]||1):'');if(option.textContent!==label)option.textContent=label;}
    loadout.value=run.activePower;$("game-weapon-effect").textContent=run.lastPowerReward&&section.classList.contains('is-expanded')&&innerHeight<500?'Conquistado: '+run.lastPowerReward.name:weapon.description;
    const reward=$("game-power-reward");reward.hidden=!run.lastPowerReward||run.status!=="running";
    if(run.lastPowerReward)reward.textContent=(run.lastPowerReward.isNew?'PODER CONQUISTADO · ':'PODER MELHORADO · ')+run.lastPowerReward.name+' · nível '+run.lastPowerReward.level;
    section.dataset.heroPower=run.activePower;
    $("game-aid-bar").hidden=run.status!=="running";
    const reserve=$("game-reserve-shield"),ally=allyById(run.aid?.id);
    reserve.disabled=controlsOpen()||run.status!=="running"||!run.reserveShields||run.shieldFor>0;
    $("game-aid-status").textContent=ally?ally.name+" · "+run.aid.label+" · "+Math.ceil(run.aid.remaining)+" s":run.reserveShields?"Escudo de reserva pronto. Use quando precisar.":"Ajudas "+run.allyShieldProgress+"/6 para guardar um escudo";
    $("game-passports").textContent=String(run.passports);
    $("game-passport-next").textContent=String(100-run.passports%100);
    $("game-passport-progress").style.width=run.passports%100+"%";
    const lap=Math.floor(campaignRouteDistance(run)/(SCENE_DISTANCE*STAGES.length))+1;

    $("game-phase").textContent="Cenário "+(stage.index+1)+" de "+STAGES.length+" · "+(run.mode==="story"?"História "+Math.min(run.bossesDefeated,STORY_BOSS_COUNT)+"/"+STORY_BOSS_COUNT:"Volta "+lap);
    $("game-stage-name").textContent=stage.name;
    const cast=characterProgressAt(run);
    $("game-difficulty").textContent="Risco "+difficulty.level+" · "+cast.available+"/"+cast.total+" rivais";
    $("game-stage-time").textContent=run.status==="ballot"?"Etapa final · Urna":run.status==="prison"?"Prisão fictícia":run.status==="won"?"História concluída!":run.status==="over"?"Fim da corrida":run.boss?.combat?"Confronto "+(run.boss.slot+1)+"/4 · "+run.boss.rankName:run.boss?run.boss.remaining+" ataques para escapar do chefão":run.raid?"Perseguição especial":run.mode==="story"?"Chefões "+run.bossesDefeated+"/"+STORY_BOSS_COUNT:campaignPhases[stage.index];
    $("game-best").textContent=best.toLocaleString("pt-BR");
    $("game-time").textContent=pad(Math.floor(run.elapsed/60))+":"+pad(Math.floor(run.elapsed%60));
    section.dataset.runState=run.status;section.dataset.runMode=run.mode;
    section.dataset.reducedMotion=String(prefersReducedMotion());
    if(lastPageMotion!==prefersReducedMotion()){
      lastPageMotion=prefersReducedMotion();
      section.dispatchEvent(new CustomEvent("runner:motion",{detail:{reducedMotion:lastPageMotion}}));
    }
    section.dataset.art=spritesReady?"loaded":spritesFailed?"error":"loading";
    const power=run.shieldFor>0?"shield":run.graceFor>0?"recovery":"none";
    section.dataset.power=run.player.isJacare?"jacare":power;section.dataset.ammo="none";
    const remainingJacareSeconds=Math.max(0,Math.ceil(JACARE_DURATION_SECONDS-run.player.jacareAge));
    $("game-power").textContent=run.player.isJacare?"Jacaré · "+remainingJacareSeconds+" s":run.boss?.combat?"Energia "+run.player.hp+"/"+run.player.maxHp+(power==='shield'?" · Escudo":""):power==="shield"?"Escudo de reserva · "+Math.ceil(run.shieldFor)+" s":power==="recovery"?"Recuperando · "+Math.ceil(run.graceFor)+" s":"Sem efeito ativo";
    const recovery=$("game-jacare-progress");
    if(recovery){
      recovery.hidden=run.status!=="running"||!run.player.isJacare;
      $("game-jacare-seconds").textContent=remainingJacareSeconds+" s";
      recovery.setAttribute("aria-label","Jacaré: "+remainingJacareSeconds+" segundos restantes; desvie lateralmente das ampolas");
    }
    $("game-ammo").parentElement.hidden=!run.boss;
    $("game-weapon-select").disabled=controlsOpen()||run.status!=="running";
    const fireLabel=controlLabels().fire;
    $("game-ammo").textContent=run.boss?fireLabel+" · Disparar":"Sem arma";
    attackButton.disabled=controlsOpen()||run.player.isJacare||!run.boss&&run.ammo===0;
    attackButton.textContent=run.ammo>0?"◎ Disparar":run.boss?(run.player.attackHeld?"Solte":"Recarga"):"Vazio";
    const ammoHint=run.ammo===0?(run.boss?"Solte o disparo para recarregar durante a luta":"Sem munição. Colete ajudantes para repor tiros"):"";
    attackButton.title=ammoHint||(run.player.isJacare?"Disparo indisponível durante a transformação":"Disparar: "+fireLabel+" · "+weapon.name);
    attackButton.setAttribute("aria-label","Disparar: segure para repetir; tecla "+fireLabel+"; "+weapon.name+(ammoHint?"; "+ammoHint:""));
    const hideAttack=run.status!=="running"||!run.boss;
    if(hideAttack&&!attackButton.hidden){
      for(const id of firePointers){
        attackSources.set('pointer:'+id,false);
        if(attackButton.hasPointerCapture(id))attackButton.releasePointerCapture(id);
      }
      firePointers.clear();
      if(run.status==="running"&&document.activeElement===attackButton)canvas.focus({preventScroll:true});
    }
    attackButton.hidden=hideAttack;

    $("game-boss").hidden=run.status!=="running"||!run.boss;section.dataset.boss=run.boss?.type||"none";
    if(run.boss){
      const b=run.boss;
      section.dataset.bossPhase=b.phase||'attack';
      if(b.combat){
       $("game-boss-name").textContent=b.name+" · "+b.className+" · "+b.rankName+" "+b.rank;
       $("game-boss-health").setAttribute("aria-valuemax",String(b.maxHp));
       $("game-boss-health").setAttribute("aria-valuenow",String(b.hp));
       $("game-boss-health").setAttribute("aria-label","Energia de "+b.name);
       $("game-boss-progress").style.width=100*b.hp/b.maxHp+"%";
       const state=bossCounterWindow(b).label||({intro:'ENTRADA',charge:'PREPARANDO',attack:'ATAQUE',recover:'RECUPERAÇÃO · ATIRE!'})[b.phase];
       $("game-boss-weapon").textContent=state+" · "+b.hp+"/"+b.maxHp+" PV"+(b.enraged?" · FASE 2":"")+(b.rematchIndex?" · REVANCHE "+b.rematchIndex:"")+(b.weakness?" · Fraco a "+(HERO_POWERS[b.weakness]?.name||b.weakness):"");
      }else{
      $("game-boss-name").textContent=b.type==="janones"?"Janones · bloco "+Math.min(3,Math.floor((b.total-b.remaining)/Math.ceil(b.total/3))+1)+"/3":(b.type==="haddad"?"Haddad · Taxad":b.type==="pf"?"Blitz da PF":b.name)+" · rodada "+b.level;
      $("game-boss-health").setAttribute("aria-valuemax",String(b.total));
      $("game-boss-health").setAttribute("aria-valuenow",String(b.total-b.remaining));
      $("game-boss-health").setAttribute("aria-label",b.objective||"Ataques superados");
      $("game-boss-progress").style.width=100*(b.total-b.remaining)/b.total+"%";
      const dodged=b.total-b.remaining;
      const goal=dodged+"/"+b.total+" ataques superados";
      const attack=attackCueFor(bossCue());
      $("game-boss-weapon").textContent=(attack?.short||"Observe o ataque")+
        (bossCue().approach==="drop"?" · VEM DO ALTO!":"")+" · "+goal+(Number.isFinite(b.hp)?" · PV "+b.hp+"/"+b.maxHp:"");
      }
      $("game-boss").style.setProperty("--boss-accent",b.color);
    }
    updateCombatHUD(run,{spritesReady,controlLabels:controlLabels()});
    const liveAttack=run.obstacles.filter(o=>!o.passed&&!o.counted)
      .sort((a,b)=>threatTimeToContact(run,a)-threatTimeToContact(run,b))[0];
    const liveCue=attackCueFor(liveAttack);
    const cameoAttack=run.cameo?run.obstacles.find(o=>o.sourceActor===run.cameo.type&&!o.passed):null;
    $("game-threat").textContent=run.raid?.phase==="active"?"PF em operação":
      liveAttack?.approach==="rear"?"⚠ Por trás · "+(liveCue?.label||"Inimigo"):
      run.cameo?("Ataque · "+(attackCueFor(cameoAttack)?.label||run.cameo.type)):
      "Inimigos sorteados · "+stage.short;
    $("game-objective").textContent=run.status==="running"&&run.boss?
      (attackCueFor(bossCue())?.instruction||"Observe o próximo ataque."):
      run.status==="running"&&liveCue&&threatTimeToContact(run,liveAttack)<2?
      liveCue.instruction:"Faltam "+(100-run.passports%100)+" passaportes para +1 vida";
    // Mantém a instrução de perigo disponível para tecnologias assistivas.
    const dangerVisible=!!(liveCue&&threatTimeToContact(run,liveAttack)<2);
    $("game-objective").hidden=run.status!=="running"||!!run.raid||!banner.hidden||
      (!run.boss&&!dangerVisible);
    const raid=run.status==="running"?run.raid:null;
    $("game-raid").hidden=!raid;section.dataset.raid=raid?.phase||"none";
    if(raid){
      const fact=RAID_FACTS[raid.factIndex];
      $("game-raid-title").textContent=raid.phase==="warning"?"JOICE APARECEU!":raid.phase==="active"?"É A POLÍCIA FEDERAL! · "+Math.ceil(raid.remaining)+" s":"RITMO NORMAL VOLTANDO";
      $("game-raid-copy").textContent=raid.phase==="warning"?"Toc, toc, toc… prepare os reflexos!":raid.phase==="active"?"↑ PF · ↓ Microfones · ↔ Saia do alvo no chão":"Respire: o cenário e o ritmo estão voltando.";
      $("game-raid-source").textContent="Áudio de arquivo · Joice · Câmara";
      $("game-raid-source").href=ARCHIVE_VOICES.joice.source;
      const raidKey=raid.id+":"+raid.phase;
      if(raidKey!==lastRaidKey){audio.event(raid.phase,fact);lastRaidKey=raidKey;}
    }else if(lastRaidKey){
      audio.event(lastRaidKey.endsWith(":recovery")?"end":"cancelled");
      lastRaidKey="";
    }
    $("game-start").disabled=!spritesReady&&!spritesFailed;
    $("game-start").textContent=!spritesReady?(spritesFailed?"Tentar carregar desenhos":"Carregando desenhos · "+loadedSprites+"/"+CORE_SPRITE_SHEET_COUNT):run.status==="ready"?"Começar corrida":run.status==="won"?"Jogar novamente":run.status==="over"?"Tentar de novo":"Recomeçar corrida";
    $("game-loading-note").hidden=spritesReady;
    $("game-loading-note").classList.toggle("sr-only",!spritesFailed);
    $("game-support-status").hidden=!supportFailed;
    $("game-support-retry").disabled=supportLoading;
    $("game-loading-note").textContent=spritesFailed?"Os desenhos não carregaram. Toque no botão para tentar novamente.":"Preparando os personagens…";
    const ballotOpen=run.status==="ballot",prison=run.status==="prison";
    $("game-ballot").hidden=!ballotOpen;
    $("game-ballot-number").textContent=run.ballot.digits.padEnd(2,"_");
    $("game-ballot-message").textContent=run.ballot.message||"Digite dois números e confirme.";
    $("game-urna-confirm").disabled=run.ballot.digits.length!==2;
    $("game-overlay").hidden=run.status==="running"||ballotOpen;
    $("game-captured").hidden=run.status!=="over"&&!prison;
    if(ballotOpen&&lastStatus!=="ballot"){
      clearControls();$("game-ballot").focus({preventScroll:true});
    }
    if(prison){
      $("game-overlay-title").textContent="Flávio foi preso!";
      $("game-overlay-copy").textContent="Código 22 confirmado. A campanha recomeça em instantes.";
      $("game-overlay-badge").textContent="Final fictício";
    }
    $("game-start-hint").hidden=run.status!=="ready";
    if(run.status==="won"){
      $("game-overlay-title").textContent="História concluída!";
      $("game-overlay-copy").textContent="Código 13 confirmado! Você concluiu a etapa final da campanha. "+score.toLocaleString("pt-BR")+" m percorridos.";
      $("game-overlay-badge").textContent="Vitória fictícia";
      if(lastStatus!=="won")section.dispatchEvent(new Event("runner:won"));
    }
    if(run.status==="over"){
      $("game-overlay-title").textContent="Foi pego pela Polícia Federal!";
      $("game-overlay-copy").textContent=dodgeHint()+" "+score.toLocaleString("pt-BR")+" m · "+run.passports+" passaportes.";
      $("game-overlay-badge").textContent="Perseguição fictícia";audio.stop();
      if(lastStatus!=="over")section.dispatchEvent(new Event("runner:over"));
    }
    if(lastStatus!==run.status||lastStage!==stage.index||lastCollected!==run.collected||lastPower!==power||lastLives!==run.lives||lastEvents!==run.events){
      let message=run.status==="ready"?"Tudo pronto. A corrida começa quando você quiser.":run.status==="ballot"?"Etapa final: digite dois números na urna fictícia.":run.status==="prison"?"Flávio foi preso. A campanha vai recomeçar.":run.status==="won"?"História concluída: todos os "+STORY_BOSS_COUNT+" chefões superados.":run.status==="over"?"Foi pego pela Polícia Federal! "+dodgeHint()+" "+score+" metros percorridos. Toque em Tentar de novo.":stage.name+" · pule ou abaixe conforme o perigo.";
      if(run.status==="running"){
        if(run.events>lastEvents)message=run.event;
        else if(lastCollected!==run.collected)message="Passaporte coletado. Faltam "+(100-run.passports%100)+" para uma vida.";
        else if(lastPower==="shield"&&power!=="shield")message="O escudo de reserva terminou. Volte a desviar!";
        if(lastStage>=0&&lastStage!==stage.index){message="Chegamos a "+stage.name+"! A corrida continua.";audio.effect("stage");}
      }
      $("game-status").textContent=message;
      section.querySelectorAll("[data-stage]").forEach((stop,i)=>{stop.classList.toggle("is-current",i===stage.index);stop.classList.toggle("is-done",i<stage.index);if(i===stage.index)stop.setAttribute("aria-current","step");else stop.removeAttribute("aria-current");});
      lastStatus=run.status;lastStage=stage.index;lastCollected=run.collected;lastPower=power;lastLives=run.lives;lastEvents=run.events;
    }
  }

  function schedule() {
    if (!frameId && run.status === "running" && !document.hidden && windowFocused && inView && !$("game-settings").open) frameId = requestAnimationFrame(frame);
  }
  // Configuração, aba oculta e perda de foco suspendem a simulação e os comandos mantidos.
  function syncActivity() {
    cancelAnimationFrame(frameId);frameId=0;
    resetFrameClock(frameClock,performance.now());
    if(document.hidden||!windowFocused||!inView||$("game-settings").open||run.status!=="running"){
      audio.stop();lastRaidKey="";clearControls();
    }
    schedule();
  }
  function weaponEffect(item){
    const type=item?.type;
    if(type==='wind')return 'wind';
    if(['budget-sheets','receipts','paper-gate','mandado','stamp','message'].includes(type))return 'papers';
    if(['hammer','handcuffs','barrier','rolling-case','case'].includes(type))return 'metal';
    if(['meme-ghost','lhand','parachute-cross','cloroquina-prop','ivermectina-prop'].includes(type))return 'magic';
    return item?.falling?'drop':item?.action==='crouch'?'high':'low';
  }
  function frame(now) {
    frameId=0;if(run.status!=="running")return;
    if($("game-settings").open){resetFrameClock(frameClock,now);return;}
    gamepadDriver?.poll();
    const timing=advanceFrameClock(frameClock,now),wasAirborne=run.player.y>0;
    const before={hp:run.player.hp,lives:run.lives,collected:run.collected,boss:run.boss?.type,
      passports:run.passports,spawned:run.spawnedObstacles,attacks:run.boss?.fired||0,jacare:run.player.isJacare};
    let bufferedTakeoff=false;
    for(let i=0;i<timing.steps&&run.status==="running";i++){
      const pending=run.player.jumpBufferedUntil>0&&run.player.velocity<=0;
      advanceRun(run,timing.step);
      if(pending&&run.player.jumpBufferedUntil===0&&run.player.velocity>0)bufferedTakeoff=true;
    }
    if(wasAirborne&&run.player.y===0)landingUntil=run.elapsed+.12;
    updateUI();
    if(run.status==="running"&&(run.lives<before.lives||run.player.hp<before.hp))audio.effect("hit");
    else if(before.jacare&&!run.player.isJacare)audio.effect("restore");
    else if(before.boss&&!run.boss)audio.effect("victory");
    else if(!before.boss&&run.boss){audio.enemyEntrance(run.boss);voices.event("boss",run);}
    else if(run.collected>before.collected)audio.effect(run.lastPickup==="ze-gotinha"?"transform":run.lastPickup==="ally"?"ally":"pickup");
    if(run.spawnedObstacles>before.spawned){
      const newest=run.obstacles.at(-1);
      const actor=newest?.sourceActor||newest?.type,cued=actor&&audio.enemyEntrance(actor);
      if(newest?.approach==='rear')audio.effect('rear');
      else if(!newest?.projectile&&!newest?.falling&&!cued)audio.effect(weaponEffect(newest));
      if(actor)voices.event("actor",run,actor);
    }
    if(run.collected>before.collected){
      if(run.lastPickup==="ze-gotinha"){audio.actorCue("jacare");voices.event("ally",run,"ze-gotinha");}
      else if(run.lastPickup==="ally"){audio.actorCue(run.lastAllyId);voices.event("ally",run,run.lastAllyId);}
    }
    const nearest=Math.min(Infinity,...run.obstacles.filter(o=>!o.passed&&!o.counted).map(o=>threatTimeToContact(run,o)));
    voices.update(run,{safe:nearest>.9});
    shotSounds.update(run.obstacles,run.boss?.type);
    audio.background({active:run.status==="running",pressure:difficultyAt(run.distance,run.elapsed).pressure,boss:!!run.boss,raid:run.raid?.phase==="active"});
    if(run.status==="over"&&run.lives<before.lives)audio.effect("hit");
    heroShotSound();movementSounds.update(run,{bufferedTakeoff});
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
    loadSprites(count=>{loadedSprites=count;updateUI();},{coreOnly:true}).then(()=>{
      spritesReady=true;loadingSprites=false;
      const portraitContext=$("game-joice-portrait")?.getContext("2d");
      if(portraitContext)drawSpritePortrait(portraitContext,"joice",78,96);
      updateUI();draw();prepareSupport();
    }).catch(()=>{
      spritesFailed=true;loadingSprites=false;updateUI();
      $("game-status").textContent="Os desenhos não carregaram. Toque em Tentar carregar desenhos.";
    });
  }
  function prepareSupport(){
    if(supportReady||supportLoading)return;
    supportLoading=true;supportFailed=false;updateUI();
    loadSprites().then(()=>{
      supportReady=true;supportLoading=false;run.supportAvailable=true;updateUI();draw();
    }).catch(()=>{supportLoading=false;supportFailed=true;updateUI();});
  }
  $("game-support-retry").addEventListener("click",prepareSupport);
  function begin(){
    if(!spritesReady){if(spritesFailed)prepareSprites();return;}
    cancelAnimationFrame(frameId);frameId=0;resumeFromGesture();
    audio.stop();audio.prime();audio.actorCue("flavio");voices.reset();lastRaidKey="";
    clearControls();
    shotSounds.reset();lastHeroShotHeard=0;
    run=createRun({assisted:preferences.assisted,mode:$("game-mode-story").checked?"story":"endless"});run.supportAvailable=supportReady;run.viewportWidth=virtualWidth;startRun(run);movementSounds.reset(run);landingUntil=0;
    if(!supportReady)prepareSupport();
    $("game-settings").open=false;
    crouchPose=0;lastPoseFrame=performance.now();
    lastCollected=0;lastPower="";lastStatus="";lastEvents=0;lastLives=1;
    resetFrameClock(frameClock,performance.now());
    updateUI();section.dispatchEvent(new Event("runner:start"));draw();resumeFromGesture();syncActivity();canvas.focus({preventScroll:true});
  }
  function heroShotSound(){
    if(run.shotsFired<=lastHeroShotHeard)return;lastHeroShotHeard=run.shotsFired;
    audio.heroShot(({wind:'wind',receipts:'papers','budget-sheets':'papers',hammer:'metal','court-seal':'metal',handcuffs:'metal'})[heroPowerFor(run).projectile]||'magic');
  }
  $("game-weapon-select").addEventListener('change',event=>{if(controlsOpen()){event.target.value=run.activePower;return;}equipHeroPower(run,event.target.value);attackSources.clear();updateUI();draw();canvas.focus({preventScroll:true});});
  function useReserveShield(){
    if(controlsOpen())return;
    resumeFromGesture();if(activateReserveShield(run)){audio.effect('restore');updateUI();draw();canvas.focus({preventScroll:true});}
  }
  $("game-reserve-shield").addEventListener('click',useReserveShield);
  function jump(){
    if(controlsOpen())return;
    resumeFromGesture();
    if(["ready","over"].includes(run.status))begin();
    if(jumpRun(run)){movementSounds.update(run);draw();}
  }
  function crouch(active){
    if(active&&controlsOpen())return;
    if(crouchRun(run,active)){draw();}
    else if(!active)draw();
  }
  function clearControls(){
    trackPointers.clear();moveKeys.clear();gamepadHeld.clear();gamepadDriver?.reset();jumpKeys.clear();crouchSources.clear();attackSources.clear();clearRunInput(run);movementSounds.reset(run);
  }
  function fire(source,active){
    if(active&&controlsOpen())return;
    attackSources.set(source,active);setAttackRun(run,attackSources.active);
    if(active){resumeFromGesture();if(attackRun(run))heroShotSound();draw();}
  }
  attackButton.addEventListener('pointerdown',event=>{
    if(event.button!==0||attackButton.hidden||attackButton.disabled)return;
    event.preventDefault();canvas.focus({preventScroll:true});
    firePointers.add(event.pointerId);fire('pointer:'+event.pointerId,true);
    try{attackButton.setPointerCapture(event.pointerId);}catch{}
  });
  for(const type of ['pointerup','pointercancel','lostpointercapture'])attackButton.addEventListener(type,event=>{
    if(firePointers.delete(event.pointerId))fire('pointer:'+event.pointerId,false);
  });
  attackButton.addEventListener('click',event=>{if(controlsOpen()||attackButton.hidden)return;if(event.detail===0){if(attackRun(run))heroShotSound();draw();}});
  function updateMovement(){
    if(controlsOpen()){moveRun(run,0);return;}
    const actions=[...moveKeys].map(code=>keyboardActionFor(preferences.controls,code));
    const right=actions.includes('right')||gamepadHeld.has('right'),left=actions.includes('left')||gamepadHeld.has('left');
    const pointer=[...trackPointers.values()].filter(p=>p.action==="move").at(-1);
    moveRun(run,Number(right)-Number(left)||(pointer?.direction||0));
  }
  $("game-start").addEventListener("click",begin);
  function confirmBallot(){
    const outcome=ballotConfirm(run);
    if(!outcome)return;
    updateUI();draw();
    if(outcome==="won")audio.effect("victory");
    if(outcome==="prison"){
      audio.effect("hit");
      const imprisoned=run;
      window.setTimeout(()=>{
        if(run!==imprisoned||run.status!=="prison")return;
        $("game-mode-story").checked=true;begin();
      },2400);
    }
  }
  $("game-ballot").querySelectorAll("[data-urna-digit]").forEach(button=>button.addEventListener("click",()=>{
    if(ballotDigit(run,button.dataset.urnaDigit)){audio.effect("pickup");updateUI();}
  }));
  $("game-urna-clear").addEventListener("click",()=>{ballotClear(run);updateUI();});
  $("game-urna-confirm").addEventListener("click",confirmBallot);
  $("game-sound").addEventListener("click",()=>{
    const enabled=audio.toggle();$("game-sound-label").textContent=enabled?"Som ligado":"Som desligado";
    $("game-sound").title=$("game-sound-label").textContent;
    $("game-sound").setAttribute("aria-pressed",String(enabled));lastRaidKey="";updateUI();
  });
  function savePreferences(){try{localStorage.setItem(preferencesKey,JSON.stringify(preferences));}catch{/* A sessão atual permanece funcional. */}}
  function applyControls(next){
    clearControls();preferences.controls=normalizeControls(next);
    controlSettings?.setControls(preferences.controls);
    savePreferences();updateUI();draw();
  }
  $("game-crouch-mode").addEventListener("change",()=>{crouchSources.clear();crouch(false);preferences.crouchMode=$("game-crouch-mode").value;savePreferences();});
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
  document.addEventListener("keydown",event=>{if(!event.defaultPrevented&&event.code==="Escape"&&expanded){event.preventDefault();setExpanded(false);canvas.focus({preventScroll:true});}});
  // Gestos na pista substituem os botões: toque/passe para cima, ou desça e segure.
  canvas.addEventListener("pointerdown",event=>{
    if(controlsOpen())return;
    if(event.button!==0||(event.isPrimary===false&&event.pointerType!=="touch"))return;
    lastPointerAt=performance.now();
    event.preventDefault();resumeFromGesture();canvas.focus({preventScroll:true});
    if(event.pointerType!=="touch"||run.status!=="running"){jump();return;}
    const pointer={x:event.clientX,y:event.clientY,action:"pending"};
    if(run.player.crouchHeld&&(preferences.crouchMode==="hold"||trackPointers.size>0)){pointer.action="jump";jump();}
    trackPointers.set(event.pointerId,pointer);
    try{canvas.setPointerCapture?.(event.pointerId);}catch{/* Eventos assistivos podem não ter contato nativo. */}
  },{passive:false});
  canvas.addEventListener("pointermove",event=>{
    const pointer=trackPointers.get(event.pointerId);if(!pointer||!["pending","move"].includes(pointer.action))return;
    const dx=event.clientX-pointer.x,dy=event.clientY-pointer.y;
    if(pointer.action==="move"){event.preventDefault();pointer.direction=Math.abs(dx)<8?0:Math.sign(dx);updateMovement();return;}
    if(Math.max(Math.abs(dx),Math.abs(dy))<22)return;
    event.preventDefault();
    if(Math.abs(dx)>Math.abs(dy)){pointer.action="move";pointer.direction=Math.sign(dx);updateMovement();return;}
    if(dy<0){pointer.action="jump";jump();}
    else{
      pointer.action="crouch";
      if(preferences.crouchMode==="toggle")crouchSources.toggle("touch-toggle");
      else crouchSources.set("touch:"+event.pointerId,true);
      crouch(crouchSources.active);
    }
  },{passive:false});
  function releaseTrackPointer(event){
    const pointer=trackPointers.get(event.pointerId);if(!pointer)return;
    lastPointerAt=performance.now();
    trackPointers.delete(event.pointerId);
    if(pointer.action==="move")updateMovement();
    if(pointer.action==="pending"&&event.type==="pointerup")jump();
    if(pointer.action==="crouch"&&preferences.crouchMode==="hold"){crouchSources.set("touch:"+event.pointerId,false);crouch(crouchSources.active);}
  }
  canvas.addEventListener("pointerup",releaseTrackPointer);
  canvas.addEventListener("lostpointercapture",releaseTrackPointer);
  canvas.addEventListener("pointercancel",()=>{clearControls();crouch(false);});
  canvas.addEventListener("click",event=>{
    // Alguns navegadores enviam click de toque com detail0; o pointer já o tratou.
    const physical=!!event.pointerType||performance.now()-lastPointerAt<500;
    if(!("PointerEvent" in window)||event.detail===0&&!physical)jump();
  });
  section.addEventListener("keydown", event => {
    if(controlsOpen())return;
    if(run.status==="ballot"&&!event.ctrlKey&&!event.metaKey&&!event.altKey){
      if(/^[0-9]$/.test(event.key)){event.preventDefault();if(!event.repeat)ballotDigit(run,event.key);updateUI();}
      else if(event.key==="Backspace"||event.key==="Delete"){event.preventDefault();ballotClear(run);updateUI();}
      else if(event.key==="Enter"&&!event.target.closest("button")){event.preventDefault();if(run.ballot.digits.length===2&&!event.repeat)confirmBallot();}
      return;
    }
    const action=keyboardActionFor(preferences.controls,event.code);
    const ownFireShortcut=action==='fire'&&event.target.closest('#game-attack');
    const ownShieldShortcut=action==='shield'&&(event.target.closest('#game-reserve-shield')||event.target.closest('#game-attack'));
    if (event.target.closest("button,a,input,select,textarea,summary")&&!ownFireShortcut&&!ownShieldShortcut || event.ctrlKey || event.metaKey || event.altKey) return;
    if(action==='power'){event.preventDefault();if(!event.repeat){cycleHeroPower(run);attackSources.clear();updateUI();draw();}}
    else if(action==='shield'){event.preventDefault();if(!event.repeat)useReserveShield();}
    else if(isFireKey(event.code)){
      event.preventDefault();if(!event.repeat)fire('key:'+event.code,true);
    }else if(action==='left'||action==='right'){
      event.preventDefault();moveKeys.add(event.code);resumeFromGesture();updateMovement();
    }else if (action==='jump') {
      event.preventDefault();
      if(jumpKeys.press(event.code,{repeat:event.repeat}))jump();
    } else if(action==='crouch') {
      event.preventDefault();
      crouchSources.set("key:"+event.code,true);crouch(crouchSources.active);
    }else if(action==='start'&&!event.repeat&&['ready','over','won'].includes(run.status)){event.preventDefault();begin();}
  });
  document.addEventListener("keyup",event=>{
    if(isFireKey(event.code))fire('key:'+event.code,false);
    jumpKeys.release(event.code);
    if(moveKeys.has(event.code)){event.preventDefault();moveKeys.delete(event.code);updateMovement();}
    if(keyboardActionFor(preferences.controls,event.code)==='crouch'){crouchSources.set("key:"+event.code,false);crouch(crouchSources.active);}
  });
  section.addEventListener("focusout",event=>{
    if(!section.contains(event.relatedTarget)){clearControls();draw();}
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
    const arenaPose=bossArenaPose(b,virtualWidth);
    const pose={x:arenaPose.x,y:WORLD.ground-arenaPose.platformY,scale:1};
    const bossX=pose.x,bossY=pose.y;
    const presentation=bossPresentationFor(b,run.obstacles);
    const {preparing,attacking}=presentation;
    ctx.save();ctx.translate(bossX,bossY);
    drawHoverEnemy(ctx,{type:b.type,x:0,y:0,scale:pose.scale,phase,...presentation,hurt:b.hitFlashFor>0,reducedMotion:prefersReducedMotion(),classId:b.classId,armyVariant:STAGES[b.stageIndex]?.id,enraged:b.enraged});
    ctx.restore();
    if(b.nextAttack<.65&&b.fired<b.total&&!run.obstacles.some(o=>o.bossAttack&&!o.counted)){
      ctx.fillStyle="#843338";ctx.font="800 16px system-ui";ctx.textAlign="center";
      ctx.fillText(bossCue().action==="move"?"↔ DESVIE":bossCue().action==="jump"?"↑ PULE":"↓ ABAIXE",virtualWidth-86,62);ctx.textAlign="start";
    }
  }
  function character(){
    const airborne=run.player.y>0||run.player.velocity>0,reduced=prefersReducedMotion();
    const active=run.status==="running",decorative=active&&!reduced;
    // O Flávio corre em oito quadros reais. A cadência depende do tempo da
    // simulação (não de arredondamentos da quilometragem/câmera), mantendo
    // passada visível mesmo nas velocidades mais tranquilas.
    // O herói e os perseguidores de solo usam seus ciclos de corrida.
    const phase=active?run.elapsed*(run.assisted?9:11):0;
    const crouchTarget=run.player.crouching&&!airborne,shooting=active&&run.player.attackFor>0;
    const frameTime=performance.now();
    crouchPose=crouchAnimationStep(crouchPose,crouchTarget,(frameTime-lastPoseFrame)/1000,reduced);
    lastPoseFrame=frameTime;
    const runningStride=active&&!airborne&&!crouchTarget&&!run.player.isJacare;
    const bounce=decorative&&runningStride&&!shooting?Math.abs(Math.sin(phase*Math.PI/4))*2.6:0;
    if(decorative&&!airborne){
      circle(playerX(run)-8-run.distance%19,WORLD.ground-2,2.8,"#a6a7aa70");
      // Pequena poeira que acompanha o deslize, sem afetar a pista.
      if(crouchPose>.22){
        circle(playerX(run)-14,WORLD.ground-5,2.5,"#a6a7aa60");
        circle(playerX(run)-23,WORLD.ground-8,1.5,"#a6a7aa55");
      }
    }
    ctx.save();ctx.globalAlpha=.12;ctx.fillStyle="#292337";
    ctx.beginPath();ctx.ellipse(playerX(run)+17,WORLD.ground+4,22+crouchPose*6,4,0,0,Math.PI*2);ctx.fill();ctx.restore();
    // Slide desenhado na postura baixa: sem comprimir o rosto novamente.
    const feet=WORLD.ground-run.player.y-bounce;
    const protection={x:playerX(run)+17,y:feet,crouching:crouchTarget||run.player.isJacare,remaining:run.shieldFor};
    ctx.save();
    if(crouchTarget&&!shooting){
      const pivot=playerX(run)+17;
      ctx.translate(pivot,feet);
      ctx.rotate(-.018*crouchPose);
      ctx.translate(-pivot,-feet);
    }else if(!shooting&&active&&!airborne&&run.elapsed<landingUntil){
      const ease=(landingUntil-run.elapsed)/.12,pivot=playerX(run)+17;
      ctx.translate(pivot,feet);ctx.scale(1+.025*ease,1-.025*ease);ctx.translate(-pivot,-feet);
    }else if(!shooting&&decorative&&runningStride){
      // Inclinação pequena e alternada para que a corrida não pareça
      // apenas o cenário rolando por trás de um personagem imóvel.
      const pivot=playerX(run)+17;
      ctx.translate(pivot,feet);
      ctx.rotate(Math.sin(phase*Math.PI/4)*.022);
      ctx.translate(-pivot,-feet);
    }
    const blend=jacareBlendFor(run.player,reduced);
    if(blend.jacare>0){
      ctx.save();ctx.globalAlpha*=blend.jacare;
      drawJacare(ctx,{x:playerX(run)+17,y:feet,phase,facing:run.player.moveHeld<0?-1:1,age:run.player.jacareAge,reducedMotion:reduced});ctx.restore();
    }
    if(blend.human>0){
      const alpha=blend.human*(run.graceFor>0&&run.shieldFor<=0?.55:1);
      if(shooting)drawHeroShot(ctx,{x:playerX(run)+17,y:feet,phase,age:HERO_SHOT_DURATION-run.player.attackFor,crouching:crouchTarget,airborne,falling:run.player.velocity<0,facing:run.player.shotFacing||1,alpha});
      else drawActor(ctx,{type:"flavio",x:playerX(run)+17,y:feet,scale:.95,phase,airborne,facing:run.player.moveHeld<0?-1:1,
        falling:run.player.velocity<0,landing:crouchTarget,hurt:run.status==="over",alpha});
      if(run.player.restoreFlashFor>0&&!prefersReducedMotion()){
        ctx.save();ctx.globalAlpha=Math.min(.55,run.player.restoreFlashFor/.48*.55);
        ctx.strokeStyle="#5ba86d";ctx.lineWidth=3;ctx.beginPath();
        ctx.ellipse(playerX(run)+17,feet-27,22,32,0,0,Math.PI*2);ctx.stroke();ctx.restore();
      }
    }
    ctx.restore();
    drawProtection(ctx,{...protection,foreground:true});
  }
  function joiceFigure(){
    const raid=run.raid;if(run.status!=="running"||!raid)return;
    if(raid.phase==='recovery')return;
    const shot=run.obstacles.filter(o=>o.sourceActor==='joice'&&o.cast&&!o.passed).at(-1);
    drawHoverEnemy(ctx,{type:'joice',...regularEmitterPose('joice',virtualWidth,WORLD.ground),...regularCastPresentation(shot),phase:run.elapsed*10,reducedMotion:prefersReducedMotion()});
  }
  function drawSupport(){
    const aid=run.aid;if(!aid||run.status!=="running")return;
    const incoming=run.obstacles.filter(o=>!o.passed&&!o.counted).sort((a,b)=>threatTimeToContact(run,a)-threatTimeToContact(run,b));
    const arrow=o=>o?.action==="move"?"↔":o?.action==="crouch"?"↓":o?"↑":"…";
    const cue=aid.kind==="sequence"?incoming.slice(0,3).map(arrow).join("  "):aid.kind==="predict"?arrow(run.boss?bossCue():incoming[0]):aid.kind==="quest"?"▣ "+Math.max(0,aid.goal-run.passports):aid.kind==="event"?"◷ "+Math.max(0,Math.ceil(run.nextRaid||0))+" s":"";
    ctx.save();
    if(cue){
      ctx.fillStyle="#f1fbf5ef";ctx.strokeStyle="#76a68d";ctx.lineWidth=1;
      ctx.beginPath();ctx.roundRect(virtualWidth-96,71,76,24,7);ctx.fill();ctx.stroke();
      ctx.fillStyle="#245940";ctx.font="700 12px system-ui";ctx.textAlign="center";ctx.fillText(cue,virtualWidth-58,87,68);
    }
    if(["route","destination"].includes(aid.kind)){
      // Compact itinerary: keep the allies' route information without scene captions.
      const index=stageAt(routeSeconds()).index;
      for(let i=0;i<STAGES.length;i++){
        ctx.fillStyle=i===index?"#267448":"#b8d0bf";ctx.beginPath();ctx.arc(virtualWidth-(STAGES.length*14+21)+i*14,83,i===index?4:2.5,0,Math.PI*2);ctx.fill();
      }
      ctx.strokeStyle="#267448";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(virtualWidth-20,80);ctx.lineTo(virtualWidth-17,83);ctx.lineTo(virtualWidth-20,86);ctx.stroke();
    }
    if(run.ally&&!run.cameo&&!run.boss&&!run.raid){drawActor(ctx,{type:aid.id,x:Math.max(60,Math.min(virtualWidth-150,playerX(run)+105)),y:WORLD.ground-2,scale:.92,phase:run.elapsed*9});}
    if(["collect","guide","magnet"].includes(aid.kind)){
      const p=run.pickups.filter(p=>p.type==="passport"&&p.x>playerX(run)&&p.x<playerX(run)+180).sort((a,b)=>a.x-b.x)[0];
      if(p){ctx.strokeStyle="#41966baa";ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(p.x,WORLD.ground-p.y,14,17,0,0,Math.PI*2);ctx.stroke();}
    }
    if(["route","highlight","predict","sequence"].includes(aid.kind)){
      for(const o of incoming.slice(0,aid.kind==="highlight"?3:1)){ctx.strokeStyle="#bb7636";ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(o.x-4,WORLD.ground-(o.projectile?o.y+o.height/2:o.height)-4,o.width+8,o.height+8,7);ctx.stroke();}
    }
    if(run.clearedAt){ctx.globalAlpha*=Math.max(0,run.clearedAt.remaining/.4);ctx.fillStyle="#f2d49c";for(const offset of [-12,0,12]){ctx.beginPath();ctx.ellipse(run.clearedAt.x+offset,WORLD.ground-15,5,3,0,0,Math.PI*2);ctx.fill();}}
    ctx.restore();
  }
  function obstacle(item){
    if(item.falling){drawFallingThreat(ctx,item,WORLD.ground,run.elapsed*10,{reducedMotion:prefersReducedMotion()});return;}
    if(item.groundHazard){drawManholeThreat(ctx,item,WORLD.ground);return;}
    if(item.approach==='drop'&&!item.passed&&!item.counted){
      // Alerta visual obrigatório, inclusive para quem reduz movimento.
      const time=Math.max(0,threatTimeToContact(run,item));
      if(time<1.6){
        ctx.save();ctx.globalAlpha=.20+Math.max(0,1-time/1.6)*.26;
        ctx.fillStyle="#a34855";ctx.beginPath();
        ctx.ellipse(playerX(run)+17,WORLD.ground+3,16,4,0,0,Math.PI*2);ctx.fill();ctx.restore();
      }
    }
    if(item.approach==='rear'&&!item.passed&&!item.counted&&item.x<playerX(run)){
      ctx.save();ctx.fillStyle="#a23d50";ctx.font="800 12px system-ui";
      ctx.fillText("→ !",12,WORLD.ground-96);ctx.restore();
    }
    if(item.projectile){
      drawProjectile(ctx,item,WORLD.ground,item.cast?(item.cast.flightAge||0)*24:run.elapsed*10,{reducedMotion:prefersReducedMotion()});
    }else drawThreat(ctx,item,WORLD.ground,run.elapsed*10,{reducedMotion:prefersReducedMotion()});
  }
  function pickup(item){
    if(item.type==="ally"){
      const ally=allyById(item.allyId);if(!ally)return;
      ctx.save();ctx.strokeStyle="#41966b";ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(item.x,WORLD.ground-25,25,29,0,0,Math.PI*2);ctx.stroke();
      drawActor(ctx,{type:ally.id,x:item.x,y:WORLD.ground,scale:.61,phase:run.elapsed*9});ctx.restore();return;
    }
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
    drawJourneyScenery(ctx,{routeDistance:run.routeDistance,openingDistance:run.mode==="story"?STORY_OPENING_DISTANCE:0,distance:run.distance,width:virtualWidth,reducedMotion:prefersReducedMotion(),quiet:run.aid?.kind==="quiet"?Math.max(0,Math.min(1,(6-run.aid.remaining)/.35,run.aid.remaining/.35)):0});
    drawRaidAtmosphere(ctx,{strength:raidMoodFor(run.raid),width:virtualWidth,distance:run.distance,reducedMotion:prefersReducedMotion()});
    if(run.boss?.combat)drawBossArena(ctx,{width:virtualWidth,ground:WORLD.ground,phase:run.elapsed*8,state:{phase:run.boss.phase,enraged:run.boss.enraged},stageIndex:run.boss.stageIndex,reducedMotion:prefersReducedMotion()});
    if(run.boss?.combat){
      ctx.save();ctx.strokeStyle='#69a5b488';ctx.lineWidth=3;ctx.setLineDash([4,5]);ctx.beginPath();ctx.moveTo(virtualWidth-170,WORLD.ground-35);ctx.lineTo(virtualWidth-170,WORLD.ground+2);ctx.stroke();ctx.restore();
    }
    // O Fantasma do Comunismo é a figura principal do confronto final, não decoração.
    bossFigure();
    joiceFigure();
    drawSupport();
    if(run.cameo&&!run.boss&&!run.raid){
      const actor=run.cameo.type,shot=run.cameo.shot||run.obstacles.find(o=>o.sourceActor===actor&&!o.passed);
      const pose=regularEmitterExitPose(actor,virtualWidth,WORLD.ground,run.cameo.remaining),presentation=regularCastPresentation(shot);
      drawHoverEnemy(ctx,{type:actor,...pose,...presentation,phase:run.elapsed*10,reducedMotion:prefersReducedMotion()});
    }
    for(const item of run.pickups)pickup(item);
    for(const item of run.obstacles){ctx.save();if(item.returning)ctx.globalAlpha*=.4;obstacle(item);ctx.restore();}
    for(const shot of run.heroShots||[])drawHeroProjectile(ctx,shot,WORLD.ground);
    character();
  }
  // A controller is another held-input source, with neutral rearming after menus/focus.
  let ballotFocus=0;
  const ballotControls={gamepad:{left:[{kind:'button',index:14},{kind:'axis',index:0,direction:-1}],right:[{kind:'button',index:15},{kind:'axis',index:0,direction:1}],jump:[{kind:'button',index:0}],crouch:[{kind:'button',index:13},{kind:'axis',index:1,direction:1}],shield:[{kind:'button',index:12},{kind:'axis',index:1,direction:-1}],fire:[{kind:'button',index:1}],power:[{kind:'button',index:9}],start:[]}};
  function padAction(action,active){
    if(active)gamepadHeld.add(action);else gamepadHeld.delete(action);
    if(run.status==='ballot'){
      if(!active)return;
      const buttons=[...$('game-ballot').querySelectorAll('button')];
      if(['left','right','crouch','shield'].includes(action)){
        ballotFocus=(ballotFocus+({left:-1,right:1,crouch:3,shield:-3})[action]+buttons.length)%buttons.length;
        buttons[ballotFocus]?.focus({preventScroll:true});
      }else if(action==='jump')buttons[ballotFocus]?.click();
      else if(action==='fire'){ballotClear(run);updateUI();}
      else if(action==='power')confirmBallot();
      return;
    }
    if(action==='left'||action==='right')updateMovement();
    else if(action==='fire')fire('gamepad',active);
    else if(action==='crouch'){crouchSources.set('gamepad',active);crouch(crouchSources.active);}
    else if(active&&action==='jump')jump();
    else if(active&&action==='power'&&run.status==='running'){cycleHeroPower(run);attackSources.clear();updateUI();draw();}
    else if(active&&action==='shield')useReserveShield();
    else if(active&&action==='start'&&['ready','over','won'].includes(run.status))begin();
  }
  controlSettings=createControlSettings({root:$('game-control-bindings'),controls:preferences.controls,onChange:applyControls,onCaptureChange:()=>clearControls()});
  gamepadDriver=createGamepadDriver({getControls:()=>run.status==='ballot'?ballotControls:preferences.controls,
    canPlay:()=>spritesReady&&!document.hidden&&windowFocused&&(run.status==='ballot'?(()=>{const r=$('game-ballot').getBoundingClientRect();return r.height>0&&r.bottom>0&&r.top<innerHeight;})():inView)&&!$('game-settings').open&&!controlSettings.capturing,
    onAction:padAction,onDevice:state=>controlSettings.setDevice(state),onCapture:pads=>controlSettings.pollCapture(pads)});
  $('game-settings').addEventListener('toggle',()=>{syncActivity();updateUI();draw();});
  const pollControllerOutsideGame=()=>{if(run.status!=='running'||$('game-settings').open)gamepadDriver.poll();};
  let controllerTimer=setInterval(pollControllerOutsideGame,80);
  window.addEventListener('gamepadconnected',()=>gamepadDriver.poll());
  window.addEventListener('gamepaddisconnected',()=>gamepadDriver.poll());
  window.addEventListener('pagehide',()=>{clearInterval(controllerTimer);controllerTimer=null;gamepadDriver.reset();controlSettings.cancelCapture();});
  window.addEventListener('pageshow',()=>{if(controllerTimer===null)controllerTimer=setInterval(pollControllerOutsideGame,80);gamepadDriver.reset();syncActivity();});
  for(const id of ["game-sound","game-expand","game-crouch-mode","game-effects","game-assist"])$(id).disabled=false;
  updateUI();resize();draw();prepareSprites();
}

initRunner();
