import {drawJourneyFinish,drawBossAccent,drawImpactFinish,campaignResultText} from './runner-visual-finish.mjs?v=3ab9249fcffb';
import {storyBattleCue,storyRewardText} from './runner-story-cue.mjs?v=c7b38ccf12e2';
import {stageGuideFor} from './runner-stage-director.mjs?v=071886f07909';
import {HURT_BODY_SCALE} from './runner-body.mjs?v=57ec474fca38';
import {createPresentationDOM,createControlLabelReader} from './runner-presentation-cache.mjs?v=4712d27109dc';
import {edgeThreatsFor,drawEdgeThreats} from './runner-edge-cues.mjs?v=b4b61c9e89df';
import {drawTerrain,drawSlideContact} from './runner-terrain-art.mjs?v=d58971ff04da';
import {TERRAIN,terrainSupportAt} from './runner-terrain.mjs?v=d75123c1af20';
import {normalizeControls,keyboardActionFor,mouseActionFor,keyLabel} from './runner-control-map.mjs?v=568387e3f764';
import {createControlSettings} from './runner-control-settings.mjs?v=25524a717d9e';
import {createGamepadDriver} from './runner-gamepad.mjs?v=18383546c2cd';
import {HERO_POWERS,heroPowerFor,cycleHeroPower} from './runner-earned-powers.mjs?v=9c3a03f65c5f';
import {updateCombatHUD} from './runner-combat-hud.mjs?v=b96950bfabe4';
import {createMovementSoundDirector,movementIsAirborne} from './runner-movement-audio.mjs?v=31522b0ccc1e';
import {HERO_SHOT_DURATION,DUEL_CHARGE_SECONDS,drawHeroCharge,drawHeroProjectile} from './runner-hero-shot.mjs?v=7aa1e19e9838';
import {regularEmitterPose,regularEmitterExitPose,regularCastPresentation} from './runner-cast-pose.mjs?v=8f2c5aee1585';
import {createAircraftWarningTracker,createEncounterSoundTracker,createShotSoundTracker} from './runner-shot-events.mjs?v=37fd940420f1';
import {bossPresentationFor,bossRoleLabel,STORY_OPTIONAL_IDS,optionalStoryBossAt,storyBossAt} from './runner-bosses.mjs?v=f8107568ec3b';
import {createVoiceDirector} from './runner-voice-director.mjs?v=405b7acd6323';
import { WORLD, PLAYER, JACARE_RECOVERY_SECONDS, STORY_BOSS_COUNT, STAGES, SCENE_DISTANCE, RAID_FACTS, difficultyAt, characterProgressAt, attackCueFor, isHostileProjectile, ballotDigit, ballotClear, ballotConfirm, createRun, resizeRun, startRun, canContinueRun, continueRun, moveRun, playerX, threatTimeToContact, jumpRun, releaseJumpRun, crouchRun, clearRunInput, advanceRun, routeStageFor, routeStagesFor, routeTransitionFor, scoreFor, stagePlanFor, bossAttackFor,attackRun,setAttackRun,activateReserveShield,bossArenaPose,heroMuzzleFor,campaignRouteDistance,STORY_OPENING_DISTANCE } from "./runner-core.mjs?v=14bee58e345d";
import {STORY_STAGE_IDS} from './runner-route-data.mjs?v=c4fcfde513ff';
import {heroStridePhase,bossStopsAutoRun} from './runner-drawn-motion.mjs?v=0d1971800c55';
import {campaignAccentFor,drawCampaignCrowd} from './runner-campaign-art.mjs?v=700c55ebad49';
import {bossCounterWindow} from './runner-bosses.mjs?v=f8107568ec3b';
import {drawHoverEnemy,drawBossArena} from './runner-boss-art.mjs?v=c0f55e6867c9';
import { drawHeroShot, drawActor, drawItem, drawThreat, drawProjectile, enemyEmitterPose, loadSprites, drawSpritePortrait, enemyMotionFor, crouchAnimationStep, drawProtection, drawJacare, jacareBlendFor, drawFallingThreat, drawManholeThreat, drawMemeArmy, drawBossOfBosses, drawPhantomCloud, drawComunismoGhostBoss, drawEnemyActor, CORE_SPRITE_SHEET_COUNT } from "./runner-art.mjs?v=dbaac525a595";
import { createGameAudio } from "./runner-audio.mjs?v=d93419fd0e46";
import { ARCHIVE_VOICES } from "./runner-voice-data.mjs?v=d5e017561fd6";
import { drawJourneyScenery, drawRaidAtmosphere, raidMoodFor,createSceneryScroll,advanceSceneryScroll } from "./runner-scenery.mjs?v=8b0005a207e6";
import { createFrameClock,resetFrameClock,advanceFrameClock } from "./runner-clock.mjs?v=81383aa71924";

import {allyById} from './runner-allies.mjs?v=d3b6a81b34b9';
import {createPressGate,createHeldSources} from './runner-input.mjs?v=bbf7f3e16548';

function initRunner() {
  const ui=createPresentationDOM(document),$=ui.get;
  const canvas = $("runner-canvas"), section = $("game");
  if (!canvas || !section) return;
  // Uma aba pode ter conservado o HTML anterior enquanto os módulos já
  // mudaram. Atualizar a página uma vez evita inicializar sobre IDs antigos.
  if(!$("game-stage-progress")||!$("game-control-bindings")||!$("game-combat-hud")||!$("game-hero-health")||!$("game-power-charge")||!$("game-weapon-cycle")||!$("game-power-reward")||!$("game-reserve-shield")||!$("game-aid-status")||!$("game-effects")||!$("game-assist")||$("game-options-panel")||!$("game-attack")||!$("game-jacare-progress")||!$("game-jacare-count")||!$("game-jacare-hint")||!$("game-support-retry")||!$("game-settings")||!$("game-fullscreen")||!$("game-fullscreen-note")||!$("game-start-hint")||!$("game-battle-cue")||!$("game-practice")||!$("game-route")||!$("game-result-actions")||!$("game-ready-actions")||!$("game-controls")||!$("game-continue")||!$("game-form-status")||$("game-expand")||!$("game-sound-label")||!$("game-voice-note")||!$("game-captured")||!$("countdown-layout")||$("game-jump")||$("game-progress")){
    const url=new URL(location.href);
    if(url.searchParams.get("ui")!=="20261115-campaign-hierarchy"){
      url.searchParams.set("ui","20261115-campaign-hierarchy");location.replace(url.href);
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
      if(["system","reduce","full"].includes(saved.effects))preferences.effects=saved.effects;
      preferences.assisted=saved.assisted===true;
      preferences.controls=normalizeControls(saved.controls,saved.fireKey);
    }
  }catch{/* Ajustes continuam disponíveis sem persistência. */}
  $("game-crouch-mode").value=preferences.crouchMode;
  $("game-effects").value=preferences.effects;
  $("game-assist").checked=preferences.assisted;
  const controlsOpen=()=>$("game-settings").open;
  const isFireKey=code=>keyboardActionFor(preferences.controls,code)==='fire';
  const readControlLabels=createControlLabelReader();
  const controlLabels=()=>readControlLabels(preferences.controls);
  let controlSettings=null,gamepadDriver=null;
  const gamepadHeld=new Set();
  const selectedMode=()=>$("game-mode-story").checked?"story":"endless";
  let run=createRun({assisted:preferences.assisted,mode:selectedMode(),manualStory:false}),frameId=0;
  run.supportAvailable=false;
  let sceneryRun=null,sceneryScroll=null;
  const trackPointers=new Map(),moveKeys=new Set(),jumpKeys=createPressGate(),jumpSources=createHeldSources(),crouchSources=createHeldSources(),attackSources=createHeldSources();
  const attackButton=$("game-attack"),firePointers=new Set(),mouseHeld=new Map();
  const frameClock=createFrameClock(performance.now());
  let spritesReady=false,spritesFailed=false,loadedSprites=0,loadingSprites=false,landingUntil=0;
  let supportReady=false,supportLoading=false,supportFailed=false;
  let crouchPose=0,slidePose=0,slideTravel=0,lastPoseElapsed=0;
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
  const encounterSounds=createEncounterSoundTracker((kind,actor,weapon)=>{
    if(kind==='windup')audio.enemyWindup(actor);else audio.traversalBlock(actor,weapon);
  });
  const aircraftWarnings=createAircraftWarningTracker(effect=>audio.effect(effect));
  const voices=createVoiceDirector({play:(id,options)=>audio.voice(id,options),selector:audio.voiceSelector});
  const movementSounds=createMovementSoundDirector({play:name=>audio.movement(name)});
  $("game-sound-label").textContent=audio.enabled?"Som ligado":"Som desligado";
  $("game-sound").title=$("game-sound-label").textContent;
  $("game-sound").setAttribute("aria-pressed",String(audio.enabled));
  let lastRaidKey="",lastPageMotion=null,lastHeroShotHeard=0;
  const campaignPhases=["Convenções","Campanha","1º turno","Travessia do Paraguai","Reta final","Diplomação"];
  const pad = number => String(number).padStart(2, "0");
  const healthText=value=>Number(value).toLocaleString("pt-BR",{maximumFractionDigits:1});
  // A preferência pode mudar enquanto o jogo está aberto.
  const motionPreference = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  const compactLandscape = window.matchMedia?.("(min-width:480px) and (orientation:landscape) and (max-height:600px)");
  const prefersReducedMotion = () => preferences.effects==="reduce"||preferences.effects==="system"&&motionPreference?.matches === true;
  function bossCue(){
    if(!run.boss)return null;
    const incoming=run.obstacles.filter(o=>o.bossAttack&&!o.counted&&!o.passed).sort((a,b)=>threatTimeToContact(run,a)-threatTimeToContact(run,b))[0];
    return incoming||(run.boss.combat||run.boss.plannedFor===run.boss.fired?run.boss.plannedAttack:bossAttackFor(run.boss.type,Math.min(run.boss.fired,run.boss.total-1),run.boss.round-1));
  }
  function dodgeHint(){
    const hit=run.lastHit;if(!hit)return "Observe os perigos e tente novamente.";
    const names={stamp:'Carimbo TAXA',wind:"Vento",'meme-ghost':"Exército de Memes",'cloroquina-prop':"Cloroquina fictícia",'ivermectina-prop':"Ivermectina fictícia","budget-sheets":"Planilhas","parachute-cross":"Cruz com paraquedas",handcuffs:"Algemas",microphone:"Microfone","paper-gate":"Papéis",popcorn:"Pipoca",hammer:"Martelo",mandado:"Mandado",receipts:"Papéis",lhand:"Mão em L"};
    if(hit.action==="move")return hit.type==="pfizer-ampoule"?"Ampola cenográfica da Pfizer: desvie lateralmente para sair do alvo.":(names[hit.type]||"Objeto")+" em queda: saia do alvo no chão com ←/→ ou deslize lateral.";
    if(hit.action==="crouch")return (names[hit.type]||"Ataque")+" no alto: abaixe para desviar.";
    return (names[hit.type]||"Perigo")+" baixo: sincronize o salto para desviar.";
  }

  let renderedRoute=null;
  const campaignRows=Array.from({length:STORY_BOSS_COUNT},(_,i)=>storyBossAt(i));
  function updateItinerary(stages,active){
    const route=$('game-route');
    if(renderedRoute!==stages){
      renderedRoute=stages;
      route.replaceChildren(...stages.map(stage=>{
        const item=document.createElement('li');item.dataset.stage=stage.id;
        const label=document.createElement('strong');label.textContent=stage.name;item.append(label);
        if(stages!==STAGES){
          const line=campaignRows.filter(row=>row.stageId===stage.id).map(row=>bossRoleLabel(row)+' · '+row.name).join(' / ');
          const cast=document.createElement('small');cast.textContent=line;item.append(cast);
          const guide=stageGuideFor(stage.id),steps=document.createElement('small');steps.className='game-route-guide';steps.textContent=guide.order;steps.title=guide.lesson;item.append(steps);
        }
        return item;
      }));
    }
    for(const [i,stop] of [...route.children].entries()){
      stop.classList.toggle('is-current',i===active.index);
      stop.classList.toggle('is-done',i<active.index);
      if(i===active.index)stop.setAttribute('aria-current','step');else stop.removeAttribute('aria-current');
    }
  }
  function updateUI() {
    run.reducedMotion=prefersReducedMotion();
    if(run.boss)run.boss.reducedMotion=run.reducedMotion;
    if(run.arenaExit)run.arenaExit.reducedMotion=run.reducedMotion;
    const stage=routeStageFor(run),stages=routeStagesFor(run),score=scoreFor(run),difficulty=difficultyAt(run.distance,run.elapsed);
    const transition=routeTransitionFor(run),banner=$("game-transition");
    // Destinations remain accessible; the scenery itself communicates transitions.
    ui.prop(banner,'hidden',true);
    if(transition.active){
      ui.text("game-transition-name",transition.to.name);
      ui.style("game-transition-progress",'width',Math.round(transition.progress*100)+"%");
    }
    if(!run.practice&&(run.status==="over"||run.status==="won")&&score>best){best=score;try{localStorage.setItem(recordKey,String(best));}catch{}}
    ui.text("game-score",String(score).padStart(4,"0"));
    ui.text("game-lives",String(Math.max(0,run.lives-1)));
    ui.text("game-form-status",run.player.recoveryPending?"Cura pendente":"Machucado");
    ui.prop("game-form-status",'hidden',run.status!=="running"||run.player.hp!==1);
    const weapon=heroPowerFor(run),cycle=$("game-weapon-cycle"),labels=controlLabels();
    ui.prop("game-power-loadout",'hidden',run.status!=="running");
    ui.prop(cycle,'hidden',run.status!=="running"||(run.ownedPowers?.length||1)<2);
    ui.prop(cycle,'disabled',controlsOpen()||cycle.hidden);
    const switchLabel="Trocar arma · "+labels.power;
    ui.prop(cycle,'title',switchLabel);ui.attr(cycle,"aria-label",switchLabel);ui.text("game-weapon-effect",run.lastPowerReward&&compactLandscape?.matches?'Conquistado: '+run.lastPowerReward.name:weapon.description);
    const reward=$("game-power-reward"),skill=run.lastSkillReward;ui.prop(reward,'hidden',!(skill||run.lastPowerReward)||run.status!=="running");
    if(skill||run.lastPowerReward){
      ui.text(reward,storyRewardText(skill,run.lastPowerReward,labels.jump));
      ui.prop(reward,'title',run.lastPowerReward?HERO_POWERS[run.lastPowerReward.id]?.description||'':'');
    }
    ui.data(section,'heroPower',run.activePower);
    ui.prop("game-aid-bar",'hidden',run.status!=="running");
    const reserve=$("game-reserve-shield"),ally=allyById(run.aid?.id);
    ui.prop(reserve,'disabled',controlsOpen()||run.status!=="running"||!run.reserveShields||run.shieldFor>0);
    ui.text("game-aid-status",ally?ally.name+" · "+run.aid.label+" · "+Math.ceil(run.aid.remaining)+" s":run.reserveShields?"Escudo de reserva pronto. Use quando precisar.":"Ajudas "+run.allyShieldProgress+"/6 para guardar um escudo");
    ui.text("game-passports",String(run.passports));
    ui.text("game-passport-next",String(100-run.passports%100));
    ui.style("game-passport-progress",'width',run.passports%100+"%");
    const lap=Math.floor(campaignRouteDistance(run)/(SCENE_DISTANCE*stages.length))+1;

    ui.text("game-phase","Cenário "+(stage.index+1)+" de "+stages.length+" · "+(run.mode==="story"?"História "+Math.min(run.bossesDefeated,STORY_BOSS_COUNT)+"/"+STORY_BOSS_COUNT:"Volta "+lap));
    ui.text("game-stage-name",stage.name);
    const cast=characterProgressAt(run);
    ui.text("game-difficulty","Risco "+difficulty.level+" · "+cast.available+"/"+cast.total+" rivais");
    ui.data(section,'playerForm',run.player.isJacare?'jacare':run.player.hp===1?'hurt':'normal');
    const stagePlan=stagePlanFor(run),stagePercent=Math.round(stagePlan.progress*100);
    ui.text("game-stage-time",run.mode==="story"?stagePlan.label:run.boss?run.boss.remaining+" ataques para escapar do chefão":run.raid?stagePlan.label:campaignPhases[stage.index]);
    ui.prop("game-stage-time",'title',stagePlan.goal);ui.attr("game-stage-time",'aria-label',stagePlan.label+'. '+stagePlan.goal);
    ui.data(section,'stageSection',stagePlan.section);
    ui.attr('game-stage-progress','aria-valuenow',stagePercent);ui.attr('game-stage-progress','aria-valuetext',stagePercent+'% · '+stage.name+'. '+stagePlan.goal);
    ui.style('game-stage-progress','--stage-fill',stagePercent+'%');
    ui.text("game-best",best.toLocaleString("pt-BR"));
    ui.text("game-time",pad(Math.floor(run.elapsed/60))+":"+pad(Math.floor(run.elapsed%60)));
    ui.data(section,'runState',run.status);ui.data(section,'runMode',run.mode);
    ui.data(section,'reducedMotion',String(prefersReducedMotion()));
    if(lastPageMotion!==prefersReducedMotion()){
      lastPageMotion=prefersReducedMotion();
      section.dispatchEvent(new CustomEvent("runner:motion",{detail:{reducedMotion:lastPageMotion}}));
    }
    ui.data(section,'art',spritesReady?"loaded":spritesFailed?"error":"loading");
    const power=run.shieldFor>0?"shield":run.graceFor>0?"recovery":"none";
    ui.data(section,'power',run.player.isJacare?"jacare":power);ui.data(section,'ammo',"none");
    const recoveryElapsed=Math.min(JACARE_RECOVERY_SECONDS,Math.floor(run.player.jacareAge));
    const recoveryRemaining=Math.max(0,Math.ceil(JACARE_RECOVERY_SECONDS-run.player.jacareAge));
    const entryProtected=run.player.isJacare&&run.graceFor>0;
    ui.text("game-power",run.player.isJacare?"Jacaré · "+recoveryRemaining+" s":run.boss?.combat?"Energia "+run.player.hp+"/"+run.player.maxHp+(power==='shield'?" · Escudo":""):power==="shield"?"Escudo de reserva · "+Math.ceil(run.shieldFor)+" s":power==="recovery"?"Recuperando · "+Math.ceil(run.graceFor)+" s":"Sem efeito ativo");
    const recovery=$("game-jacare-progress");
    if(recovery){
      const recovering=run.player.isJacare;
      const ampoulesPending=!recovering&&run.player.jacareAge>=JACARE_RECOVERY_SECONDS&&run.obstacles.some(o=>o.type==='pfizer-ampoule');
      ui.prop(recovery,'hidden',run.status!=="running"||!(recovering||ampoulesPending||run.player.restoreFlashFor>0));
      ui.text("game-jacare-count",recovering?recoveryRemaining+" s":"0 s");
      ui.text("game-jacare-hint",recovering?"Retorno automático"+(entryProtected?" · Protegido":""):ampoulesPending?"Desvie da última onda":"Recuperado");
      ui.attr(recovery,"aria-valuenow",String(recoveryElapsed));
      ui.attr(recovery,"aria-valuetext",recovering?recoveryRemaining+" segundos restantes. Recuperação automática. Desvie de lado."+(entryProtected?" Proteção inicial ativa.":""):"Forma humana recuperada."+(ampoulesPending?" Desvie da última onda.":""));
    }
    ui.prop($("game-ammo").parentElement,'hidden',!run.boss);
    const fireLabel=labels.fire;
    ui.text("game-ammo",run.boss?fireLabel+" · Disparar":"Sem arma");
    ui.prop(attackButton,'disabled',controlsOpen()||run.boss?.traversal||run.player.isJacare||!run.boss&&run.ammo===0);
    ui.data(attackButton,'ammo',run.ammo>0?"ready":run.player.attackHeld?"held":"reload");
    const ammoHint=run.ammo===0?(run.boss?(run.player.attackHeld?"Solte o disparo para recarregar":"Recarregando munição"):"Sem munição. Colete ajudantes para repor tiros"):"";
    ui.prop(attackButton,'title',ammoHint||(run.player.isJacare?"Disparo indisponível durante a transformação":"Atirar no chefão ou rebater projéteis · "+fireLabel+" · "+weapon.name));
    ui.attr(attackButton,"aria-label","Atirar no chefão ou rebater projéteis; segure para repetir"+(run.boss?.combat&&!run.boss.traversal?" e carregar o tiro; solte para recarregar":"")+"; tecla "+fireLabel+"; "+weapon.name+(ammoHint?"; "+ammoHint:""));
    const hideAttack=run.status!=="running"||!run.boss||run.boss.traversal;
    if(hideAttack&&!attackButton.hidden){
      for(const id of firePointers){
        attackSources.set('pointer:'+id,false);
        if(attackButton.hasPointerCapture(id))attackButton.releasePointerCapture(id);
      }
      firePointers.clear();
      // A second finger must not leave a held shot after a boss disappears.
      for(const [id,pointer] of trackPointers){
        if(pointer.action==='fire'){
          attackSources.set('touch-fire:'+id,false);
          trackPointers.delete(id);
        }
      }
      setAttackRun(run,attackSources.active);
      if(run.status==="running"&&document.activeElement===attackButton)canvas.focus({preventScroll:true});
    }
    ui.prop(attackButton,'hidden',hideAttack);

    ui.prop("game-boss",'hidden',run.status!=="running"||!run.boss||run.boss.traversal);ui.data(section,'traversal',String(!!run.boss?.traversal));ui.data(section,'boss',run.boss?.type||"none");
    if(run.boss){
      const b=run.boss;
      ui.data(section,'bossPhase',b.phase||'attack');
      if(b.combat){
       ui.text("game-boss-name",b.name+" · "+bossRoleLabel(b));
       ui.style("game-boss-progress",'width',100*b.hp/b.maxHp+"%");
       const state=bossCounterWindow(b).label||({intro:'ENTRADA',charge:'PREPARANDO',attack:'ATAQUE',recover:'RECUPERAÇÃO'})[b.phase];
       ui.text("game-boss-weapon",state+" · "+healthText(b.hp)+"/"+b.maxHp+" PV"+(b.enraged?" · FASE 2":"")+(b.rematchIndex?" · REVANCHE "+b.rematchIndex:"")+(b.weakness?" · Fraco a "+(HERO_POWERS[b.weakness]?.name||b.weakness):"")+(b.tactic?" · "+b.tactic:""));
      }else{
      ui.text("game-boss-name",b.type==="janones"?"Janones · bloco "+Math.min(3,Math.floor((b.total-b.remaining)/Math.ceil(b.total/3))+1)+"/3":(b.type==="haddad"?"Haddad · Taxad":b.type==="pf"?"Blitz da PF":b.name)+" · rodada "+b.level);
      ui.style("game-boss-progress",'width',100*(b.total-b.remaining)/b.total+"%");
      const dodged=b.total-b.remaining;
      const goal=dodged+"/"+b.total+" ataques superados";
      const attack=attackCueFor(bossCue());
      ui.text("game-boss-weapon",(attack?.short||"Observe o ataque")+
        (bossCue()?.approach==="drop"?" · VEM DO ALTO!":"")+" · "+goal+(Number.isFinite(b.hp)?" · PV "+healthText(b.hp)+"/"+b.maxHp:""));
      }
      ui.style("game-boss","--boss-accent",b.color);
    }
    updateCombatHUD(run,{spritesReady,controlLabels:labels});
    const liveAttack=run.obstacles.filter(o=>!o.passed&&!o.counted)
      .sort((a,b)=>threatTimeToContact(run,a)-threatTimeToContact(run,b))[0];
    const liveCue=attackCueFor(liveAttack);
    const b=run.boss;
    // Announce the specific committed threat, even during a phase boundary.
    // Only suggest reflection for that very projectile, never a ground hazard.
    const actualBossAttack=b?.combat?run.obstacles.filter(o=>o.bossAttack&&!o.destroyed&&!o.reflected&&(!o.passed&&!o.counted||isHostileProjectile(o)))
      .sort((a,b)=>threatTimeToContact(run,a)-threatTimeToContact(run,b))[0]:null;
    const combatCue=b?.combat&&(actualBossAttack||(b.phase==='charge'?b.plannedAttack:null));
    const reflected=run.obstacles.some(o=>o.reflected&&!o.destroyed);
    const intercept=!!b&&!b.traversal&&isHostileProjectile(actualBossAttack);
    const opening=b?.combat&&!b.traversal&&bossCounterWindow(b).label;
    const battle=storyBattleCue(b,{attack:combatCue||null,attackLabel:attackCueFor(combatCue)?.label,intercept,reflected,opening});
    const cue=$("game-battle-cue");
    ui.prop(cue,'hidden',run.status!=="running"||!battle);
    ui.data(cue,'opening',String(!!battle?.open));
    if(!cue.hidden&&battle){
      ui.text("game-battle-attack",battle.label);
      ui.text("game-battle-action",battle.action);
    }

    const cameoAttack=run.cameo?run.obstacles.find(o=>o.sourceActor===run.cameo.type&&!o.passed):null;
    ui.text("game-threat",run.raid?.phase==="active"?"PF em operação":
      liveAttack?.approach==="rear"?"⚠ Por trás · "+(liveCue?.label||"Inimigo"):
      run.cameo?("Ataque · "+(attackCueFor(cameoAttack)?.label||run.cameo.type)):
      "Inimigos sorteados · "+stage.short);
    ui.text("game-objective",run.status==="running"&&run.boss?
      (attackCueFor(bossCue())?.instruction||"Observe o próximo ataque."):
      run.status==="running"&&liveCue&&threatTimeToContact(run,liveAttack)<2?
      liveCue.instruction:"Faltam "+(100-run.passports%100)+" passaportes para uma continuação");
    // Mantém a instrução de perigo disponível para tecnologias assistivas.
    const dangerVisible=!!(liveCue&&threatTimeToContact(run,liveAttack)<2);
    ui.prop("game-objective",'hidden',run.status!=="running"||!!run.raid||!banner.hidden||
      (!run.boss&&!dangerVisible));
    const raid=run.status==="running"?run.raid:null;
    ui.prop("game-raid",'hidden',!raid);ui.data(section,'raid',raid?.phase||"none");
    if(raid){
      const fact=RAID_FACTS[raid.factIndex];
      ui.text("game-raid-title",raid.phase==="warning"?"JOICE APARECEU!":raid.phase==="active"?"É A POLÍCIA FEDERAL! · "+Math.ceil(raid.remaining)+" s":"RITMO NORMAL VOLTANDO");
      ui.text("game-raid-copy",raid.phase==="warning"?"Toc, toc, toc… prepare os reflexos!":raid.phase==="active"?"↑ PF · ↓ Microfones · ↔ Saia do alvo no chão":"Respire: o cenário e o ritmo estão voltando.");
      ui.text("game-raid-source","Áudio de arquivo · Joice · Câmara");
      ui.prop("game-raid-source",'href',ARCHIVE_VOICES.joice.source);
      const raidKey=raid.id+":"+raid.phase;
      if(raidKey!==lastRaidKey){audio.event(raid.phase,fact);lastRaidKey=raidKey;}
    }else if(lastRaidKey){
      audio.event(lastRaidKey.endsWith(":recovery")?"end":"cancelled");
      lastRaidKey="";
    }
    ui.prop("game-start",'disabled',!spritesReady&&!spritesFailed);
    for(const button of $("game-practice").children)ui.prop(button,'disabled',!spritesReady);
    ui.text("game-start",!spritesReady?(spritesFailed?"Tentar carregar desenhos":"Carregando desenhos · "+loadedSprites+"/"+CORE_SPRITE_SHEET_COUNT):run.status==="ready"?"Começar corrida":run.status==="won"?"Jogar novamente":run.status==="over"?"Tentar de novo":"Recomeçar corrida");
    ui.prop("game-loading-note",'hidden',spritesReady);
    $("game-loading-note").classList.toggle("sr-only",!spritesFailed);
    ui.prop("game-support-status",'hidden',!supportFailed);
    ui.prop("game-support-retry",'disabled',supportLoading);
    ui.text("game-loading-note",spritesFailed?"Os desenhos não carregaram. Toque no botão para tentar novamente.":"Preparando os personagens…");
    const ballotOpen=run.status==="ballot",prison=run.status==="prison";
    ui.prop("game-ballot",'hidden',!ballotOpen);
    ui.text("game-ballot-number",run.ballot.digits.padEnd(2,"_"));
    ui.text("game-ballot-message",run.ballot.message||"Digite dois números e confirme.");
    ui.prop("game-urna-confirm",'disabled',run.ballot.digits.length!==2);
    ui.prop("game-overlay",'hidden',run.status==="running"||ballotOpen);
    const controls=$("game-controls"),inside=run.status==="over"||run.status==="won";
    const actionsHost=$(inside?"game-result-actions":"game-ready-actions");
    if(controls.parentNode!==actionsHost)actionsHost.append(controls);
    ui.prop("game-continue",'hidden',!canContinueRun(run));
    const terrainOutcome=run.lastHit?.type?.startsWith('terrain-'),aircraftOutcome=run.lastHit?.type?.startsWith('aircraft-'),ampouleOutcome=run.lastHit?.type==='pfizer-ampoule';
    const outcomeTitle=terrainOutcome?(run.lastHit.type==='terrain-gap'?'Caiu no vão!':run.lastHit.type==='terrain-ceiling'?'Bateu na passagem baixa!':'Bateu na borda da plataforma!'):aircraftOutcome?'O projétil aéreo atingiu Flávio!':ampouleOutcome?'A ampola acertou Flávio!':'Foi pego pela Polícia Federal!';
    const outcomeHint=terrainOutcome?(run.lastHit.type==='terrain-ceiling'?'Abaixe e avance para deslizar pela abertura.':'Pule antes da borda e pouse na plataforma.'):aircraftOutcome?(run.lastHit.action==='crouch'?'Abaixe sobre a barra quando o avião sinalizar o disparo alto.':'Pule antes da faixa marcada e alcance o próximo apoio.'):ampouleOutcome?'Desvie de lado assim que os alvos aparecerem, inclusive após voltar à forma humana.':dodgeHint();
    ui.prop("game-captured",'hidden',run.status==='over'?terrainOutcome||aircraftOutcome||ampouleOutcome:!prison);
    if(ballotOpen&&lastStatus!=="ballot"){
      clearControls();$("game-ballot").focus({preventScroll:true});
    }
    if(prison){
      ui.text("game-overlay-title","Flávio foi preso!");
      ui.text("game-overlay-copy","Código 22 confirmado. A campanha recomeça em instantes.");
      ui.text("game-overlay-badge","Final fictício");
    }
    ui.prop("game-start-hint",'hidden',run.status!=="ready");
    if(run.status==="won"){
      ui.text("game-overlay-title",run.practice?"Desafio concluído!":"História concluída!");
      ui.text("game-overlay-copy",run.practice?"Você superou o desafio de "+run.practice.name+".":campaignResultText(run,score));
      ui.text("game-overlay-badge","Vitória fictícia");
      if(lastStatus!=="won")section.dispatchEvent(new Event("runner:won"));
    }
    if(run.status==="over"){
      ui.text("game-overlay-title",outcomeTitle);
      ui.text("game-overlay-copy",outcomeHint+" "+score.toLocaleString("pt-BR")+" m · "+run.passports+" passaportes.");
      ui.text("game-overlay-badge",aircraftOutcome?"Travessia aérea fictícia":ampouleOutcome?"Transformação fictícia":"Perseguição fictícia");audio.stop();
      if(lastStatus!=="over")section.dispatchEvent(new Event("runner:over"));
    }
    if(renderedRoute!==stages||lastStatus!==run.status||lastStage!==stage.index||lastCollected!==run.collected||lastPower!==power||lastLives!==run.lives||lastEvents!==run.events){
      let message=run.status==="ready"?"Tudo pronto. A corrida começa quando você quiser.":run.status==="ballot"?"Etapa final: digite dois números na urna fictícia.":run.status==="prison"?"Flávio foi preso. A campanha vai recomeçar.":run.status==="won"?(run.practice?"Desafio opcional concluído.":"História concluída. Todas as "+STORY_BOSS_COUNT+" etapas foram superadas."):run.status==="over"?outcomeTitle+" "+outcomeHint+" "+score+" metros percorridos. Toque em Tentar de novo.":stage.name+" · pule ou abaixe conforme o perigo.";
      if(run.status==="running"){
        if(run.events>lastEvents)message=run.event;
        else if(lastCollected!==run.collected)message="Passaporte coletado. Faltam "+(100-run.passports%100)+" para uma continuação.";
        else if(lastPower==="shield"&&power!=="shield")message="O escudo de reserva terminou. Volte a desviar!";
        if(lastStage>=0&&lastStage!==stage.index){message="Chegamos a "+stage.name+"! A corrida continua.";audio.effect("stage");}
      }
      ui.text("game-status",message);
      updateItinerary(stages,stage);
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
  function playPlayerImpact(){if(!audio.enemyImpact(run.lastHit?.actor,run.lastHit?.type))audio.effect('hit');}
  function frame(now) {
    frameId=0;if(run.status!=="running")return;
    if($("game-settings").open){resetFrameClock(frameClock,now);return;}
    gamepadDriver?.poll();
    const timing=advanceFrameClock(frameClock,now);
    const before={hp:run.player.hp,hit:run.lastHit,collected:run.collected,boss:run.boss?.type,jacare:run.player.isJacare,
      passports:run.passports,spawned:run.spawnedObstacles,attacks:run.boss?.fired||0};
    let bufferedTakeoff=false;
    for(let i=0;i<timing.steps&&run.status==="running";i++){
      const wasAirborne=movementIsAirborne(run.player),pending=run.player.jumpBufferedUntil>0&&run.player.velocity<=0;
      advanceRun(run,timing.step);
      encounterSounds.update(run);
      if(wasAirborne&&!movementIsAirborne(run.player))landingUntil=run.elapsed+.12;
      if(pending&&run.player.jumpBufferedUntil===0&&run.player.velocity>0)bufferedTakeoff=true;
    }
    updateUI();
    if(!before.boss&&run.boss){audio.enemyEntrance(run.boss);voices.event("boss",run);}
    if(before.jacare&&!run.player.isJacare)audio.effect("restore");
    if(run.status==="running"&&run.lastHit!==before.hit)playPlayerImpact();
    else if(run.player.hp>before.hp)audio.effect("restore");
    else if(before.boss&&!run.boss)audio.effect("victory");
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
    aircraftWarnings(run.terrain?.active?.flight);
    audio.background({active:run.status==="running",pressure:difficultyAt(run.distance,run.elapsed).pressure,boss:!!run.boss,raid:run.raid?.phase==="active"});
    if(run.status==="over"&&run.lastHit!==before.hit)playPlayerImpact();
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
  function begin(practiceId){
    if(!spritesReady){if(spritesFailed)prepareSprites();return;}
    cancelAnimationFrame(frameId);frameId=0;resumeFromGesture();
    audio.stop();audio.prime();audio.actorCue("flavio");voices.reset();lastRaidKey="";
    clearControls();
    shotSounds.reset();lastHeroShotHeard=0;
    run=createRun({assisted:preferences.assisted,mode:practiceId?"story":selectedMode(),practiceId,manualStory:false});run.supportAvailable=supportReady;run.viewportWidth=virtualWidth;startRun(run);encounterSounds.reset(run);movementSounds.reset(run);landingUntil=0;crouchPose=slidePose=slideTravel=0;lastPoseElapsed=0;
    if(!supportReady)prepareSupport();
    $("game-settings").open=false;
    crouchPose=slidePose=slideTravel=0;
    lastCollected=0;lastPower="";lastStatus="";lastEvents=0;lastLives=1;
    resetFrameClock(frameClock,performance.now());
    updateUI();section.dispatchEvent(new Event("runner:start"));draw();resumeFromGesture();syncActivity();canvas.focus({preventScroll:true});
  }
  $("game-continue").addEventListener("click",()=>{
    if(!continueRun(run))return;
    clearControls();audio.prime();shotSounds.reset();movementSounds.reset(run);landingUntil=0;
    resetFrameClock(frameClock,performance.now());updateUI();draw();resumeFromGesture();
    canvas.focus({preventScroll:true});
  });
  function heroShotSound(){
    if(run.shotsFired<=lastHeroShotHeard)return;lastHeroShotHeard=run.shotsFired;
    audio.heroShot(({wind:'wind',receipts:'papers','budget-sheets':'papers',hammer:'metal','court-seal':'metal',handcuffs:'metal'})[heroPowerFor(run).projectile]||'magic');
  }
  function switchWeapon(){
    if(controlsOpen()||run.status!=="running"||(run.ownedPowers?.length||1)<2)return;
    if(cycleHeroPower(run)){attackSources.clear();updateUI();draw();}
  }
  $("game-weapon-cycle").addEventListener('click',()=>{switchWeapon();if(!controlsOpen())canvas.focus({preventScroll:true});});
  function useReserveShield(){
    if(controlsOpen())return;
    resumeFromGesture();if(activateReserveShield(run)){audio.effect('restore');updateUI();draw();canvas.focus({preventScroll:true});}
  }
  $("game-reserve-shield").addEventListener('click',useReserveShield);
  function jump(source){
    if(controlsOpen())return;
    resumeFromGesture();
    if(["ready","over"].includes(run.status))begin();
    if(typeof source==='string')jumpSources.set(source,true);
    // O salto nunca acelera a transformação: apenas o relógio recupera o jacaré.
    if(jumpRun(run)){movementSounds.update(run);draw();}
  }
  function releaseJump(source){
    const held=jumpSources.active;jumpSources.set(source,false);
    if(held&&!jumpSources.active&&releaseJumpRun(run))draw();
  }
  function crouch(active){
    if(active&&controlsOpen())return;
    if(crouchRun(run,active)){draw();}
    else if(!active)draw();
  }
  function clearControls(){
    trackPointers.clear();moveKeys.clear();mouseHeld.clear();gamepadHeld.clear();gamepadDriver?.reset();jumpKeys.clear();jumpSources.clear();crouchSources.clear();attackSources.clear();clearRunInput(run);movementSounds.reset(run);
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
    const actions=[...moveKeys].map(code=>keyboardActionFor(preferences.controls,code)).concat([...mouseHeld.values()]);
    const right=actions.includes('right')||gamepadHeld.has('right'),left=actions.includes('left')||gamepadHeld.has('left');
    const pointer=[...trackPointers.values()].filter(p=>p.action==="move").at(-1);
    moveRun(run,Number(right)-Number(left)||(pointer?.direction||0));
  }
  $("game-start").addEventListener("click",()=>begin());
  $("game-mode-chooser").addEventListener("change",()=>{if(run.status==="ready"){run.mode=selectedMode();run.manualStory=false;updateUI();draw();}});
  for(const id of STORY_OPTIONAL_IDS){
    const b=optionalStoryBossAt(id),button=document.createElement('button');
    if(!b)continue;
    button.type='button';button.disabled=!spritesReady;button.textContent=b.name+' · '+routeStagesFor({mode:'story'})[b.stageIndex].name;
    button.addEventListener('click',()=>begin(id));$("game-practice").append(button);
  }
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
  // Mouse usa eventos por botão para permitir dois comandos físicos juntos.
  canvas.addEventListener('mousedown',event=>{
    if(controlsOpen()||event.sourceCapabilities?.firesTouchEvents)return;
    const action=mouseActionFor(preferences.controls,event.button);
    if(!action||mouseHeld.has(event.button))return;
    event.preventDefault();lastPointerAt=performance.now();canvas.focus({preventScroll:true});resumeFromGesture();
    const source='mouse:'+event.button;
    if(action==='jump'){mouseHeld.set(event.button,action);jump(source);}
    else if(action==='power')switchWeapon();
    else if(action==='shield')useReserveShield();
    else if(action==='start'){if(['ready','over','won'].includes(run.status))begin();}
    else if(run.status==='running'){
      mouseHeld.set(event.button,action);
      if(action==='fire')fire(source,true);
      else if(action==='crouch'){crouchSources.set(source,true);crouch(crouchSources.active);}
      else updateMovement();
    }
  });
  window.addEventListener('mouseup',event=>{
    const action=mouseHeld.get(event.button);if(!action)return;
    mouseHeld.delete(event.button);const source='mouse:'+event.button;
    if(action==='fire')fire(source,false);
    else if(action==='crouch'){crouchSources.set(source,false);crouch(crouchSources.active);}
    else if(action==='jump')releaseJump(source);
    else updateMovement();
  });
  for(const type of ['contextmenu','auxclick'])canvas.addEventListener(type,event=>{
    if(!controlsOpen()&&mouseActionFor(preferences.controls,type==='contextmenu'?2:event.button))event.preventDefault();
  });
  // O toque mantém os gestos existentes, independentemente do mouse.

  canvas.addEventListener("pointerdown",event=>{
    if(controlsOpen()||event.pointerType==="mouse")return;
    if(event.button!==0||(event.isPrimary===false&&event.pointerType!=="touch"))return;
    lastPointerAt=performance.now();
    event.preventDefault();resumeFromGesture();canvas.focus({preventScroll:true});
    if(event.pointerType!=="touch"||run.status!=="running"){jump();return;}
    if(event.isPrimary===false&&run.boss&&!run.boss.traversal){
      const source='touch-fire:'+event.pointerId;
      trackPointers.set(event.pointerId,{action:'fire'});
      fire(source,true);
      try{canvas.setPointerCapture?.(event.pointerId);}catch{}
      return;
    }
    const pointer={x:event.clientX,y:event.clientY,action:"pending"};
    if(run.player.crouchHeld&&(preferences.crouchMode==="hold"||trackPointers.size>0)){pointer.action="jump";jump('touch:'+event.pointerId);}
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
    if(dy<0){pointer.action="jump";jump('touch:'+event.pointerId);}
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
    if(pointer.action==="jump")releaseJump('touch:'+event.pointerId);
    if(pointer.action==="fire")fire('touch-fire:'+event.pointerId,false);
    if(pointer.action==="pending"&&event.type==="pointerup")jump();
    if(pointer.action==="crouch"&&preferences.crouchMode==="hold"){crouchSources.set("touch:"+event.pointerId,false);crouch(crouchSources.active);}
  }
  canvas.addEventListener("pointerup",releaseTrackPointer);
  canvas.addEventListener("lostpointercapture",releaseTrackPointer);
  canvas.addEventListener("pointercancel",releaseTrackPointer);
  canvas.addEventListener("click",event=>{
    // Alguns navegadores enviam click de toque com detail0; o pointer já o tratou.
    const justHandledPointer=performance.now()-lastPointerAt<500;
    if(!justHandledPointer&&(!("PointerEvent" in window)||event.detail===0&&!event.pointerType))jump();
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
    if(action==='power'){event.preventDefault();if(!event.repeat)switchWeapon();}
    else if(action==='shield'){event.preventDefault();if(!event.repeat)useReserveShield();}
    else if(isFireKey(event.code)){
      event.preventDefault();if(!event.repeat)fire('key:'+event.code,true);
    }else if(action==='left'||action==='right'){
      event.preventDefault();moveKeys.add(event.code);resumeFromGesture();updateMovement();
    }else if (action==='jump') {
      event.preventDefault();
      if(jumpKeys.press(event.code,{repeat:event.repeat}))jump('key:'+event.code);
    } else if(action==='crouch') {
      event.preventDefault();
      crouchSources.set("key:"+event.code,true);crouch(crouchSources.active);
    }else if(action==='start'&&!event.repeat&&['ready','over','won'].includes(run.status)){event.preventDefault();begin();}
  });
  document.addEventListener("keyup",event=>{
    if(isFireKey(event.code))fire('key:'+event.code,false);
    jumpKeys.release(event.code);
    releaseJump('key:'+event.code);
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

  // Native Fullscreen API on Android/iPad; fixed-viewport fallback on iPhone
  // where Safari may still reject fullscreen for non-video elements.
  const fullscreenButton=$('game-fullscreen');
  const fullscreenNote=$('game-fullscreen-note');
  let fallbackFullscreen=false;
  const fullscreenActive=()=>document.fullscreenElement===section||fallbackFullscreen;
  function reflectFullscreen(){
    section.dataset.mobileFullscreen=String(fallbackFullscreen);
    document.body.classList.toggle('runner-fullscreen-fallback',fallbackFullscreen);
    const active=fullscreenActive();
    fullscreenButton.setAttribute('aria-pressed',String(active));
    fullscreenButton.textContent=active?'⛶ Sair da tela cheia':'⛶ Jogar em tela cheia';
    fullscreenNote.textContent=fallbackFullscreen
      ?'O navegador não permite tela cheia nativa. A pista ocupa a área disponível; barras do navegador podem permanecer. Use esta opção para sair.'
      :active?'Tela cheia ativa. Abra a engrenagem e escolha Sair da tela cheia para voltar.'
        :'Sem botões direcionais: toque para pular, deslize para desviar ou abaixar; nos chefes, toque com um segundo dedo para atirar.';
  }
  async function toggleFullscreen(){
    if(document.fullscreenElement===section){
      try{await document.exitFullscreen();}catch{ /* O navegador mantém seu estado. */ }
    }else if(fallbackFullscreen){
      fallbackFullscreen=false;
    }else if(typeof section.requestFullscreen==='function'){
      try{
        await section.requestFullscreen({navigationUI:'hide'});
        if(document.fullscreenElement!==section)fallbackFullscreen=true;
      }catch{fallbackFullscreen=true;}
    }else fallbackFullscreen=true;
    $('game-settings').open=false;
    reflectFullscreen();syncActivity();resize();draw();
    if(run.status==='running')canvas.focus({preventScroll:true});
  }
  fullscreenButton.addEventListener('click',toggleFullscreen);
  document.addEventListener('fullscreenchange',()=>{
    if(document.fullscreenElement===section)fallbackFullscreen=false;
    reflectFullscreen();syncActivity();resize();draw();
  });
  reflectFullscreen();
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
    const presentation=bossPresentationFor(b,run.obstacles,{continuousCast:campaignAccentFor(b.type)!==null});
    if(b.type==='povo'){
      drawCampaignCrowd(ctx,{x:virtualWidth*.71,y:WORLD.ground-3,scale:virtualWidth<650?.75:1,phase:run.elapsed,...presentation,reducedMotion:prefersReducedMotion()});
      return;
    }
    const phase=run.elapsed*9;
    const arenaPose=bossArenaPose(b,virtualWidth);
    const pose={x:arenaPose.x,y:WORLD.ground-arenaPose.platformY,scale:1};
    const bossX=pose.x,bossY=pose.y;
    const {preparing,attacking}=presentation;
    if(b.platformer){
      ctx.save();ctx.fillStyle='#29233722';ctx.beginPath();ctx.ellipse(bossX,WORLD.ground+2,24-arenaPose.platformY*.08,4,0,0,Math.PI*2);ctx.fill();ctx.restore();
    }
    drawBossAccent(ctx,{x:bossX,y:bossY,ground:WORLD.ground,color:campaignAccentFor(b.type)||b.color,...presentation,enraged:b.enraged,reducedMotion:prefersReducedMotion()});
    ctx.save();ctx.translate(bossX,bossY);
    drawHoverEnemy(ctx,{type:b.type,platform:!b.platformer,x:0,y:0,scale:pose.scale,phase,...presentation,hurt:b.hitFlashFor>0,reducedMotion:prefersReducedMotion(),classId:b.classId,armyVariant:b.stageId||STAGES[b.stageIndex]?.id,enraged:b.enraged});
    ctx.restore();
    if(b.lastDamage?.remaining>0){
      const hit=b.lastDamage,progress=1-hit.remaining/.8;
      const label=(hit.critical?"CRÍTICO! ":"")+"−"+Number(hit.amount).toLocaleString("pt-BR",{maximumFractionDigits:1})+" PV";
      ctx.save();ctx.globalAlpha=Math.min(1,hit.remaining*5);ctx.textAlign="center";
      ctx.font=hit.critical?"850 17px system-ui":"750 15px system-ui";
      const w=Math.min(virtualWidth-24,ctx.measureText(label).width+16);
      const x=Math.max(w/2+12,Math.min(virtualWidth-w/2-12,bossX));
      const y=Math.max(24,bossY-98-(prefersReducedMotion()?0:progress*16));
      ctx.fillStyle=hit.critical?"#6c3b16":"#163f36";ctx.beginPath();ctx.roundRect(x-w/2,y-15,w,23,5);ctx.fill();
      ctx.fillStyle="#fff";ctx.fillText(label,x,y+2,w-12);ctx.restore();
    }
    if(b.role)return;
    const counter=b.combat&&bossCounterWindow(b),cue=b.phase==='charge'?b.plannedAttack:bossCue();
    const showDodge=b.combat?b.phase==='charge':b.nextAttack<.65&&b.fired<b.total&&!run.obstacles.some(o=>o.bossAttack&&!o.counted);
    const action=showDodge&&cue?(cue.action==='move'?"↔ DESVIE":cue.action==='jump'?"↑ PULE":"↓ ABAIXE"):"";
    const hint=counter?.label||action;
    if(hint){
      const tip=!counter?.label&&cue?.counterHint;
      ctx.save();ctx.font="750 13px system-ui";ctx.textAlign="center";
      const w=Math.min(246,Math.max(ctx.measureText(hint).width,tip?ctx.measureText(tip).width:0)+18),y=Math.max(86,bossY-115);
      const x=Math.max(w/2+18,Math.min(virtualWidth-w/2-76,bossX));
      ctx.fillStyle=counter?.label?"#265044ee":"#572f42ee";ctx.beginPath();ctx.roundRect(x-w/2,y-12,w,tip?34:20,5);ctx.fill();
      ctx.fillStyle="#fff";ctx.fillText(hint,x,y+2,w-12);
      if(tip){ctx.font="600 12px system-ui";ctx.fillText(tip,x,y+16,w-12);}
      ctx.restore();
    }
  }
  function character(){
    const airborne=movementIsAirborne(run.player),reduced=prefersReducedMotion();
    const active=run.status==="running",decorative=active&&!reduced;
    const facing=run.allyShieldFor>0?1:run.manualStory?(run.player.shotFacing<0?-1:1):run.player.moveHeld<0?-1:1;
    // A corrida volta a usar sua passada ilustrada original. As duas ações
    // baixas selecionam quadros de sequências próprias, no mesmo apoio.
    const phase=run.manualStory&&!bossStopsAutoRun(run)?Math.max(0,run.player.manualTravel||0)/18:heroStridePhase(run);
    const crouchTarget=run.player.crouching&&!airborne,shooting=active&&run.player.attackFor>0;
    const sliding=active&&!airborne&&run.player.sliding;
    const poseDt=run.elapsed-lastPoseElapsed;
    crouchPose=crouchAnimationStep(crouchPose,crouchTarget,poseDt,reduced||airborne);
    slidePose=crouchAnimationStep(slidePose,sliding,poseDt*2,reduced||airborne);
    if(sliding)slideTravel=1-run.player.slideRemaining/TERRAIN.slideFor;
    else if(slidePose===0)slideTravel=0;
    const slidePhase=reduced?0:slideTravel;
    lastPoseElapsed=run.elapsed;
    const runningStride=active&&(!bossStopsAutoRun(run)&&!run.manualStory||!!run.player.moveHeld)&&!airborne&&!crouchTarget&&!run.player.isJacare;
    const support=terrainSupportAt(run,playerX(run)+18,13),floor=WORLD.ground-(support??0);
    // Pés e efeito de impacto assumem a altura do suporte real, sem levantar
    // o sprite inteiro para fazer a passada animada parecer mais forte.
    if(decorative&&runningStride&&support!==null){
      const footfall=Math.max(0,1-(phase%4)/.65);
      if(footfall>0)circle(playerX(run)+17-facing*(9+12*(1-footfall)),floor-1-.8*(1-footfall),1.3+footfall,'#617f7f54');
    }
    if(support!==null){
      ctx.save();ctx.globalAlpha=.12;ctx.fillStyle="#292337";
      ctx.beginPath();ctx.ellipse(playerX(run)+17,floor+4,22+crouchPose*6+slidePose*6,4,0,0,Math.PI*2);ctx.fill();ctx.restore();
    }
    const feet=WORLD.ground-run.player.y;
    if(decorative&&!airborne&&run.elapsed<landingUntil){
      const fading=(landingUntil-run.elapsed)/.12;
      ctx.save();ctx.globalAlpha*=.45*fading;ctx.strokeStyle="#536e76";ctx.lineWidth=1.1;
      ctx.beginPath();ctx.ellipse(playerX(run)+17,feet+1,13+11*(1-fading),2.7,0,0,Math.PI*2);ctx.stroke();ctx.restore();
    }
    if(sliding)drawSlideContact(ctx,{x:playerX(run)+17,y:feet,age:run.elapsed,reducedMotion:reduced});
    const protection={x:playerX(run)+17,y:feet,crouching:crouchTarget||run.player.isJacare,remaining:run.shieldFor};
    ctx.save();
    if(!shooting&&decorative&&runningStride){
      // Inclinação pequena e alternada para que a corrida não pareça
      // apenas o cenário rolando por trás de um personagem imóvel.
      const pivot=playerX(run)+17;
      ctx.translate(pivot,feet);
      ctx.rotate(Math.sin(phase*Math.PI/4)*.022*Math.max(0,1-Math.max(crouchPose,slidePose)/.34));
      ctx.translate(-pivot,-feet);
    }
    const blend=jacareBlendFor(run.player,reduced);
    if(blend.jacare>0){
      ctx.save();ctx.globalAlpha*=blend.jacare;
      drawJacare(ctx,{x:playerX(run)+17,y:feet,phase,facing,age:run.player.jacareAge,reducedMotion:reduced});ctx.restore();
    }
    if(blend.human>0){
      const alpha=blend.human*(run.graceFor>0&&run.shieldFor<=0?.55:1);
      const pivot=playerX(run)+17,scale=run.player.hp===1?HURT_BODY_SCALE:1;
      if(shooting){
        if(scale!==1){ctx.save();ctx.translate(pivot,feet);ctx.scale(scale,scale);ctx.translate(-pivot,-feet);}
        drawHeroShot(ctx,{x:pivot,y:feet,phase,age:HERO_SHOT_DURATION-run.player.attackFor,crouching:crouchTarget,crouchPose,sliding,slidePose,slidePhase,airborne,falling:run.player.velocity<0,reducedMotion:reduced,facing:run.player.shotFacing||1,alpha});
        if(scale!==1)ctx.restore();
      }else drawActor(ctx,{type:"flavio",x:pivot,y:feet,scale:.95*scale,phase,standing:(bossStopsAutoRun(run)||run.manualStory)&&!run.player.moveHeld,airborne,facing,
        falling:run.player.velocity<0,reducedMotion:reduced,landing:crouchTarget,crouchPose,sliding,slidePose,slidePhase,hurt:run.status==="over",alpha});
      if(run.player.restoreFlashFor>0&&!prefersReducedMotion()){
        ctx.save();ctx.globalAlpha=Math.min(.55,run.player.restoreFlashFor/.48*.55);
        ctx.strokeStyle="#5ba86d";ctx.lineWidth=3;ctx.beginPath();
        ctx.ellipse(playerX(run)+17,feet-27,22,32,0,0,Math.PI*2);ctx.stroke();ctx.restore();
      }
    }
    ctx.restore();
    if(active&&run.boss?.combat&&!run.boss.traversal){
      const muzzle=heroMuzzleFor(run,run.player.shotFacing||1);
      drawHeroCharge(ctx,{x:muzzle.x,y:WORLD.ground-muzzle.y,progress:(run.player.chargeFor||0)/DUEL_CHARGE_SECONDS,flash:run.player.chargedFlashFor||0});
    }
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
      const index=routeStageFor(run).index,total=routeStagesFor(run).length;
      for(let i=0;i<total;i++){
        ctx.fillStyle=i===index?"#267448":"#b8d0bf";ctx.beginPath();ctx.arc(virtualWidth-(total*14+21)+i*14,83,i===index?4:2.5,0,Math.PI*2);ctx.fill();
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
    if(item.projectile){
      if(item.reflected){
        const x=item.x+item.width/2,y=WORLD.ground-item.y,w=Math.min(20,item.width*.42);
        ctx.save();ctx.strokeStyle="#388878";ctx.lineWidth=2;ctx.lineCap="round";
        ctx.beginPath();ctx.moveTo(x-w-15,y-4);ctx.lineTo(x-w-3,y-4);
        ctx.moveTo(x-w-21,y+3);ctx.lineTo(x-w-5,y+3);ctx.stroke();ctx.restore();
      }
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
    // Follow high platform jumps with the whole world, preserving physics and
    // the hero's proportions. The DOM meters remain fixed above the playfield.
    const cameraLift=Math.max(0,run.player.y+94+8-WORLD.ground);
    ctx.save();ctx.translate(0,cameraLift);
    if(sceneryRun!==run){sceneryRun=run;sceneryScroll=createSceneryScroll();}
    const stageId=routeStageFor(run).id,transition=routeTransitionFor(run);
    const scrollRegions=advanceSceneryScroll(sceneryScroll,{distance:run.distance,stageId,transition});
    drawJourneyScenery(ctx,{cameraLift,scrollRegions,flight:run.terrain?.active?.flight,routeDistance:run.routeDistance,campaignStages:run.mode==='story'?STORY_STAGE_IDS:undefined,openingDistance:run.mode==="story"?STORY_OPENING_DISTANCE:0,distance:run.distance,width:virtualWidth,reducedMotion:prefersReducedMotion(),quiet:run.aid?.kind==="quiet"?Math.max(0,Math.min(1,(6-run.aid.remaining)/.35,run.aid.remaining/.35)):0});
    drawJourneyFinish(ctx,{width:virtualWidth,ground:WORLD.ground,distance:run.distance,stageId,transition,flight:!!run.terrain?.active?.flight,reducedMotion:prefersReducedMotion()});
    drawRaidAtmosphere(ctx,{strength:raidMoodFor(run.raid),width:virtualWidth,distance:run.distance,reducedMotion:prefersReducedMotion()});
    drawTerrain(ctx,{terrain:run.terrain,ground:WORLD.ground,width:virtualWidth});
    if(run.boss?.combat)drawBossArena(ctx,{width:virtualWidth,ground:WORLD.ground,state:run.boss});
    else if(run.arenaExit)drawBossArena(ctx,{width:virtualWidth,ground:WORLD.ground,state:run.arenaExit});
    // O Fantasma do Comunismo é a figura principal do confronto final, não decoração.
    bossFigure();
    joiceFigure();
    drawSupport();
    if(run.cameo&&!run.boss&&!run.raid){
      const actor=run.cameo.type,shot=run.cameo.shot||run.obstacles.find(o=>o.sourceActor===actor&&!o.passed);
      const pose=regularEmitterExitPose(actor,virtualWidth,WORLD.ground,run.cameo.remaining),presentation=regularCastPresentation(shot);
      drawHoverEnemy(ctx,{type:actor,stageId:run.cameo.stageId||routeStageFor(run).id,...pose,...presentation,phase:run.elapsed*10,reducedMotion:prefersReducedMotion()});
    }
    for(const item of run.pickups)pickup(item);
    for(const item of run.obstacles){ctx.save();if(item.returning&&!item.reflected)ctx.globalAlpha*=.4;obstacle(item);ctx.restore();}
    for(const shot of run.heroShots||[])drawHeroProjectile(ctx,shot,WORLD.ground,{reducedMotion:prefersReducedMotion()});
    character();
    if(run.clearedAt)drawImpactFinish(ctx,{x:run.clearedAt.x,y:WORLD.ground-15,remaining:run.clearedAt.remaining,reducedMotion:prefersReducedMotion()});
    ctx.restore();
    if(run.status==='running'){
      const cues=edgeThreatsFor(run.obstacles,virtualWidth,item=>threatTimeToContact(run,item));
      drawEdgeThreats(ctx,cues,{width:virtualWidth,ground:WORLD.ground});
    }
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
    else if(action==='jump'){if(active)jump('gamepad');else releaseJump('gamepad');}
    else if(active&&action==='power')switchWeapon();
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
  for(const id of ["game-sound","game-crouch-mode","game-effects","game-assist","game-fullscreen"])$(id).disabled=false;
  updateUI();resize();draw();prepareSprites();
}

initRunner();
