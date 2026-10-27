import { WORLD, PLAYER, PURSUERS, PICKUPS, STAGES, SCENE_SECONDS, difficultyAt, createRun, startRun, jumpRun, togglePause, advanceRun, stageAt, pursuitAt, scoreFor } from "./runner-core.mjs?v=20261027-one-hit";

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
  const recordKey = "tanahoraflavio.runner.best.v1";
  let best = 0;
  try {
    const stored = Number(localStorage.getItem(recordKey));
    if (Number.isSafeInteger(stored) && stored >= 0 && stored <= 10000000) best = stored;
  } catch { /* O modo privado e o armazenamento bloqueado não impedem jogar. */ }
  let run = createRun(), frameId = 0, lastFrame = 0, accumulator = 0;
  let lastStatus = "", lastStage = -1, virtualWidth = 900, measuredWidth = 0, measuredDpr = 0;
  let lastPursuit = -1, lastCollected = 0, lastSaves = 0, lastPower = "";
  let lastLives = 1, lastEvents = 0;
  const portrait = new Image();
  portrait.src = new URL("./retrato.webp", import.meta.url).href;
  portrait.addEventListener("load", () => draw());
  const pad = number => String(number).padStart(2, "0");

  function updateUI() {
    const stage = stageAt(run.elapsed), score = scoreFor(run), pursuit = pursuitAt(run.elapsed);
    const difficulty = difficultyAt(run.distance);
    const power = run.invisibleFor > 0 ? "invisible" : run.graceFor > 0 ? "recovery" : "none";
    if ((run.status === "over" || run.status === "won") && score > best) {
      best = score;
      try { localStorage.setItem(recordKey, String(best)); } catch { /* Recorde da sessão permanece na memória. */ }
    }
    $("game-score").textContent = String(score).padStart(4, "0");
    $("game-lives").textContent = String(run.lives);
    $("game-passports").textContent = String(run.passports);
    $("game-passport-next").textContent = String(100 - run.passports % 100);
    $("game-passport-progress").style.width = `${run.passports % 100}%`;
    $("game-phase").textContent = `Cenário ${stage.index + 1} de ${STAGES.length}`;
    $("game-stage-name").textContent = stage.name;
    $("game-difficulty").textContent = `Risco ${difficulty.level} · ${Math.floor(run.distance / 10).toLocaleString("pt-BR")} m`;
    const remaining = Math.max(0, Math.ceil((stage.index + 1) * SCENE_SECONDS - run.elapsed));
    $("game-stage-time").textContent = stage.index < STAGES.length - 1 ? `${remaining} s para ${STAGES[stage.index + 1].short}` : "Corrida sem fim";
    $("game-best").textContent = String(best).padStart(4, "0");
    $("game-time").textContent = `${pad(Math.floor(run.elapsed / 60))}:${pad(Math.floor(run.elapsed % 60))}`;
    const sceneElapsed = Math.max(0, run.elapsed - stage.index * SCENE_SECONDS);
    $("game-progress").hidden = stage.index === STAGES.length - 1;
    $("game-progress").setAttribute("aria-valuenow", String(Math.floor(Math.min(SCENE_SECONDS, sceneElapsed))));
    $("game-progress").setAttribute("aria-valuetext", `${stage.name}: próximo cenário em ${Math.max(0, Math.ceil(SCENE_SECONDS - sceneElapsed))} segundos.`);
    $("game-progress").firstElementChild.style.width = `${Math.min(100, sceneElapsed / SCENE_SECONDS * 100)}%`;
    section.dataset.runState = run.status;
    section.dataset.power = power;
    section.dataset.chance = run.extraChance ? "held" : "none";
    const bossPanel = $("game-boss");
    bossPanel.hidden = !run.boss;
    section.dataset.boss = run.boss?.type || "none";
    if (run.boss) {
      const boss = run.boss;
      $("game-boss-name").textContent = `${boss.name} · Nível ${boss.level}`;
      $("game-boss-health").setAttribute("aria-valuemax", String(boss.total));
      $("game-boss-health").setAttribute("aria-valuenow", String(boss.remaining));
      $("game-boss-progress").style.width = `${100 * boss.remaining / boss.total}%`;
      bossPanel.style.setProperty("--boss-accent", boss.color);
    }
    $("game-threat").textContent = `${pursuit.index + 1}/5 · ${pursuit.name}`;
    $("game-power").textContent = power === "invisible" ? `Invisível · ${Math.ceil(run.invisibleFor)} s` : power === "recovery" ? `Recuperando · ${Math.ceil(run.graceFor)} s` : "Sem efeito ativo";
    $("game-chance").textContent = run.extraChance ? "1 guardada" : "0 guardada";
    $("game-jump").disabled = run.status !== "running";
    $("game-pause").disabled = run.status !== "running" && run.status !== "paused";
    $("game-pause").textContent = run.status === "paused" ? "Continuar corrida" : "Pausar corrida";
    $("game-start").textContent = run.status === "ready" ? "Começar corrida" : run.status === "over" ? "Tentar de novo" : "Recomeçar corrida";
    $("game-overlay").hidden = run.status === "running";
    const overlays = {
      ready: ["Pronto para correr?", "Pule e sobreviva."],
      paused: ["Pausado", "Continue quando quiser."],
      over: ["Bateu, perdeu!", `${score} pontos · ${run.passports} passaportes. Tente novamente!`]
    };
    if (overlays[run.status]) {
      $("game-overlay-title").textContent = overlays[run.status][0];
      $("game-overlay-copy").textContent = overlays[run.status][1];
      $("game-overlay-badge").textContent = run.status === "over" ? "Capturado · PF" : run.status === "paused" ? "Corrida pausada" : "Perseguição fictícia";
    }
    if (lastStatus !== run.status || lastStage !== stage.index || lastPursuit !== pursuit.index || lastCollected !== run.collected || lastSaves !== run.saves || lastPower !== power || lastLives !== run.lives || lastEvents !== run.events) {
      const messages = {
        ready: "Tudo pronto. A corrida começa quando você quiser.",
        running: `${stage.name} · ${pursuit.name} na perseguição. Desvie e colete itens; risco ${difficulty.level}.`,
        paused: "Corrida pausada. Toque em Continuar corrida para retomar.",
        over: `Bateu, perdeu! ${score} pontos. Toque em Tentar de novo para jogar.`
      };
      if (run.status === "running") {
        if (run.events > lastEvents) messages.running = run.event;
        else if (run.saves > lastSaves) messages.running = "Chance extra usada! Você escapou da colisão e ganhou um instante para se recuperar.";
        else if (run.collected > lastCollected) {
          const item = PICKUPS.find(item => item.type === run.lastPickup);
          messages.running = run.lastPickup === "invisible" ? "Invisibilidade ativada por 6 segundos. Atravesse os adversários!" : run.lastPickup === "chance" ? "Uma chance extra guardada. Ela protege você de uma colisão." : `${item?.name || "Item"} coletado: +${item?.value || 0} pontos.`;
        } else if (lastPower === "invisible" && power !== "invisible") messages.running = "A invisibilidade terminou. Volte a pular os adversários!";
      }
      $("game-status").textContent = messages[run.status];
      section.querySelectorAll("[data-stage]").forEach((stop, index) => {
        stop.classList.toggle("is-current", index === stage.index);
        stop.classList.toggle("is-done", index < stage.index);
        if (index === stage.index) stop.setAttribute("aria-current", "step");
        else stop.removeAttribute("aria-current");
      });
      lastStage = stage.index;
      lastStatus = run.status;
      lastPursuit = pursuit.index; lastCollected = run.collected; lastSaves = run.saves; lastPower = power;
      lastLives = run.lives; lastEvents = run.events;
    }
  }

  function schedule() {
    if (!frameId && run.status === "running") frameId = requestAnimationFrame(frame);
  }
  function frame(now) {
    frameId = 0;
    if (run.status !== "running") return;
    if (now - lastFrame > 250) { pause("A corrida foi pausada para você não perder o ponto. Toque em Continuar corrida."); return; }
    accumulator += Math.min(.05, Math.max(0, (now - lastFrame) / 1000));
    lastFrame = now;
    while (accumulator >= 1 / 120 && run.status === "running") {
      advanceRun(run, 1 / 120);
      accumulator -= 1 / 120;
    }
    updateUI();
    draw();
    schedule();
  }
  function begin() {
    cancelAnimationFrame(frameId); frameId = 0;
    run = createRun(); startRun(run);
    lastCollected = 0; lastSaves = 0; lastPower = ""; lastStatus = ""; lastEvents = 0; lastLives = 1;
    accumulator = 0; lastFrame = performance.now();
    updateUI(); draw(); schedule();
    canvas.focus({ preventScroll: true });
  }
  function jump() {
    if (["ready", "over"].includes(run.status)) begin();
    if (jumpRun(run)) draw();
  }
  function pause(message) {
    if (run.status !== "running") return;
    togglePause(run); cancelAnimationFrame(frameId); frameId = 0;
    updateUI(); draw();
    if (message) $("game-status").textContent = message;
  }
  function pauseOrResume() {
    if (run.status === "running") pause();
    else if (run.status === "paused") {
      togglePause(run); lastFrame = performance.now(); accumulator = 0;
      updateUI(); draw(); schedule(); canvas.focus({ preventScroll: true });
    }
  }
  $("game-start").addEventListener("click", begin);
  $("game-jump").addEventListener("click", () => { jump(); canvas.focus({ preventScroll: true }); });
  $("game-pause").addEventListener("click", pauseOrResume);
  canvas.addEventListener("click", () => { jump(); canvas.focus({ preventScroll: true }); });
  section.addEventListener("keydown", event => {
    // Espaço em um botão deve ativar aquele botão uma única vez.
    if (event.target.closest("button,a,input,select,textarea,summary") || event.ctrlKey || event.metaKey || event.altKey) return;
    if (["Space", "ArrowUp", "KeyP", "Escape"].includes(event.code)) {
      event.preventDefault();
      if (event.repeat) return;
      if (event.code === "Space" || event.code === "ArrowUp") jump();
      else if (event.code === "KeyP") pauseOrResume();
      else pause();
    }
  });
  document.addEventListener("visibilitychange", () => { if (document.hidden) pause("Você saiu da aba. Sua corrida está pausada."); });
  window.addEventListener("blur", () => pause("Sua corrida está pausada. Continue quando estiver pronto."));
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(entries => {
      if (entries.some(entry => !entry.isIntersecting || entry.intersectionRatio < .12)) pause("A pista saiu da tela. Toque em Continuar corrida para retomar.");
    }, { threshold: [0, .12] }).observe(canvas);
  }

  function resize() {
    const width = canvas.getBoundingClientRect().width;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (!width || (width === measuredWidth && dpr === measuredDpr)) return;
    measuredWidth = width; measuredDpr = dpr;
    virtualWidth = Math.min(900, Math.max(480, Math.round(width * 1.15)));
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
  function scenery(stage) {
    ctx.fillStyle = stage.sky; ctx.fillRect(0,0,virtualWidth,WORLD.height);
    circle(virtualWidth-65,49,20,"#ebcc7880");
    for (let i=0;i<3;i++) cloud(((i*290 + 110 - run.distance*.07) % (virtualWidth+180) + virtualWidth+180) % (virtualWidth+180)-70, 65+(i%2)*30);
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
    ctx.save(); ctx.translate(virtualWidth-135,83);ctx.fillStyle=stage.ink;ctx.globalAlpha=.45;
    ctx.beginPath();ctx.moveTo(0,-9);ctx.lineTo(4,-1);ctx.lineTo(15,4);ctx.lineTo(15,7);ctx.lineTo(3,4);ctx.lineTo(2,12);ctx.lineTo(6,15);ctx.lineTo(6,17);ctx.lineTo(0,15);ctx.lineTo(-6,17);ctx.lineTo(-6,15);ctx.lineTo(-2,12);ctx.lineTo(-3,4);ctx.lineTo(-15,7);ctx.lineTo(-15,4);ctx.lineTo(-4,-1);ctx.closePath();ctx.fill();ctx.restore();
    ctx.fillStyle=stage.ground;ctx.fillRect(0,WORLD.ground,virtualWidth,WORLD.height-WORLD.ground);
    line([[0,WORLD.ground],[virtualWidth,WORLD.ground]],stage.ink,2);
    const offset=run.distance%64;
    for(let x=-offset;x<virtualWidth;x+=64)line([[x,272],[x+25,272]],"#ffffffaa",3);
    ctx.fillStyle=stage.ink;ctx.font='650 11px system-ui, sans-serif';ctx.fillText(`${stage.index + 1}/${STAGES.length} · ${stage.name.toLocaleUpperCase("pt-BR")}`,20,26);
  }
  function bossFigure() {
    const boss = run.boss;
    if (!boss) return;
    const idleMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const bob = idleMotion ? 0 : Math.sin(run.elapsed * 4) * 3;
    const x = virtualWidth - 76, y = 155 + bob;
    ctx.save();
    ctx.globalAlpha = .83;
    circle(x, y - 35, 40, "#ffffffb9");
    circle(x, y - 35, 37, boss.color + "20");
    ctx.fillStyle = boss.color;
    ctx.beginPath();ctx.roundRect(x-29,y-16,58,54,15);ctx.fill();
    circle(x, y-45, 25, "#e8c7aa");
    ctx.strokeStyle="#3e2f30";ctx.lineWidth=3;
    line([[x-17,y-54],[x-6,y-50]],"#3e2f30",3);
    line([[x+6,y-50],[x+17,y-54]],"#3e2f30",3);
    circle(x-9,y-44,2.5,"#352e2e");
    circle(x+9,y-44,2.5,"#352e2e");
    line([[x-8,y-33],[x+8,y-33]],"#a66c5d",2);
    // Acessórios originais diferenciam os três novos chefes entre si.
    if(boss.type==="haddad"){
      ctx.strokeStyle="#324750";ctx.lineWidth=2.5;
      ctx.strokeRect(x-20,y-52,15,10);ctx.strokeRect(x+5,y-52,15,10);
      line([[x-5,y-47],[x+5,y-47]],"#324750",2);
      ctx.fillStyle="#fff";ctx.fillRect(x-5,y-14,10,21);
      line([[x,y-14],[x,y+7]],"#497f93",2.5);
    }else if(boss.type==="boulos"){
      ctx.fillStyle="#5a475e";ctx.fillRect(x-25,y-65,50,7);
      ctx.fillRect(x-16,y-80,32,16);
      ctx.fillStyle="#f0e5f5";ctx.fillRect(x-14,y+5,28,7);
    }else if(boss.type==="dino"){
      ctx.fillStyle="#f3e4d0";
      ctx.fillRect(x-16,y-13,32,11);
      ctx.strokeStyle="#9e836c";ctx.lineWidth=2;
      ctx.strokeRect(x-19,y-52,16,10);ctx.strokeRect(x+3,y-52,16,10);
      line([[x-3,y-47],[x+3,y-47]],"#9e836c",2);
    }
    if(boss.supreme){
      ctx.fillStyle="#dfba52";
      ctx.beginPath();ctx.moveTo(x-23,y-71);ctx.lineTo(x-21,y-89);
      ctx.lineTo(x-9,y-80);ctx.lineTo(x,y-96);ctx.lineTo(x+9,y-80);
      ctx.lineTo(x+21,y-89);ctx.lineTo(x+23,y-71);ctx.closePath();ctx.fill();
    }
    ctx.fillStyle="#fff";ctx.textAlign="center";ctx.font="800 13px system-ui";
    ctx.fillText(boss.supreme?"SUPREMO":"CHEFE",x,y+18);
    ctx.restore();
  }

  function character() {
    const stride = run.player.y === 0 && run.status === "running" ? Math.sin(run.elapsed*22)*9 : 4;
    ctx.save();ctx.translate(PLAYER.x+17,WORLD.ground-run.player.y);
    ctx.fillStyle="#414052";ctx.globalAlpha=.09;ctx.beginPath();ctx.ellipse(0,run.player.y+3,21,4,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    if (run.extraChance || run.invisibleFor > 0) {
      ctx.strokeStyle = run.invisibleFor > 0 ? "#299b8b" : "#5984b7";ctx.lineWidth=2;
      ctx.setLineDash(run.invisibleFor > 0 ? [4,4] : []);ctx.beginPath();ctx.ellipse(0,-34,25,42,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
    }
    ctx.globalAlpha = run.invisibleFor > 0 ? .27 : run.graceFor > 0 ? .55 : 1;
    line([[-5,-21],[-8+stride,-10],[-8-stride,0]],"#383249",7);
    line([[5,-21],[8-stride,-10],[8+stride,0]],"#51405f",7);
    line([[-10-stride,0],[-2-stride,0]],"#272130",5);line([[7+stride,0],[14+stride,0]],"#272130",5);
    ctx.fillStyle="#694790";ctx.beginPath();ctx.moveTo(-10,-39);ctx.lineTo(9,-39);ctx.lineTo(12,-18);ctx.lineTo(-11,-18);ctx.closePath();ctx.fill();
    ctx.fillStyle="#f4ecf8";ctx.beginPath();ctx.moveTo(-5,-39);ctx.lineTo(5,-39);ctx.lineTo(0,-27);ctx.fill();
    line([[0,-36],[2,-28]],"#d7b45a",3);
    line([[-8,-35],[-15,-27],[-17-stride*.4,-20]],"#694790",5);
    line([[8,-35],[14,-27],[20+stride*.4,-29]],"#694790",5);
    circle(20+stride*.4,-29,3,"#ddbb9d");
    ctx.save();
    // Leve inclinação do retrato acompanha o movimento (sem alterar a imagem).
    if(!window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
      const tilt = run.player.y > 0 ? -.075 : Math.sin(run.elapsed*9)*.035;
      ctx.translate(0,-52);ctx.rotate(tilt);ctx.translate(0,52);
    }
    ctx.beginPath();ctx.ellipse(0,-52,15,18,0,0,Math.PI*2);ctx.clip();
    if(portrait.complete&&portrait.naturalWidth)ctx.drawImage(portrait,portrait.width*.2,portrait.height*.04,portrait.width*.6,portrait.height*.76,-15,-70,30,36);
    else{ctx.fillStyle="#dfbda0";ctx.fillRect(-15,-70,30,36);ctx.fillStyle="#423631";ctx.fillRect(-15,-70,30,9);}
    ctx.restore();ctx.restore();
  }
  function obstacle(item) {
    const foe = PURSUERS.find(foe => foe.type === item.type);
    if (!foe) return;
    const x=item.x+item.width/2, y=WORLD.ground;
    ctx.save();ctx.translate(x,y);ctx.scale(item.width/34,item.height/54);
    const stride=run.status==="running" ? Math.sin(run.elapsed*18+x*.02)*5 : 2;
    line([[-5,-18],[-7+stride,-8],[-8-stride,0]],"#343847",6);
    line([[5,-18],[7-stride,-8],[8+stride,0]],"#444556",6);
    ctx.fillStyle=foe.color;
    ctx.beginPath();ctx.moveTo(-10,-36);ctx.lineTo(10,-36);ctx.lineTo(item.type==="xandao"?15:11,-15);ctx.lineTo(item.type==="xandao"?-15:-11,-15);ctx.closePath();ctx.fill();
    line([[-9,-32],[-15,-24],[-11,-19]],foe.color,5);
    line([[9,-32],[15,-25],[12,-20]],foe.color,5);
    circle(0,-43,9,"#dab494");
    circle(-3,-44,1,"#3e3333");circle(3,-44,1,"#3e3333");
    line([[-3,-38],[3,-38]],"#8e6555",1);
    if(item.type==="pf" || item.type==="army") {
      ctx.fillStyle=foe.color;ctx.fillRect(-10,-53,20,7);ctx.fillRect(-12,-48,24,3);
      ctx.fillStyle=item.type==="pf"?"#efd67e":"#d7ddb0";ctx.font="800 7px system-ui";ctx.textAlign="center";ctx.fillText(item.type==="pf"?"PF":"★",0,-24);
      if(item.type==="army")line([[-8,-34],[8,-20]],"#b8bf91",3);
    } else if(item.type==="xandao") {
      line([[-4,-35],[0,-28],[4,-35]],"#f7f3ed",3);
      ctx.fillStyle="#a18562";ctx.fillRect(-18,-29,7,4);line([[-14,-29],[-14,-20]],"#a18562",2);
    } else if(item.type==="janones") {
      ctx.fillStyle="#463e39";ctx.fillRect(-8,-52,16,5);
      ctx.fillStyle="#233b51";ctx.fillRect(11,-39,7,13);ctx.fillStyle="#bce4ef";ctx.fillRect(12,-37,5,8);
    } else if(item.type==="haddad") {
      ctx.strokeStyle="#324750";ctx.lineWidth=2;
      ctx.strokeRect(-10,-49,8,6);ctx.strokeRect(2,-49,8,6);
      ctx.fillStyle="#f0ece4";ctx.fillRect(-4,-34,8,9);
      line([[0,-34],[0,-23]],"#a2bec4",2);
    } else if(item.type==="boulos") {
      ctx.fillStyle="#5a475e";ctx.fillRect(-11,-54,22,6);ctx.fillRect(-8,-61,16,9);
      ctx.fillStyle="#ded0e7";ctx.fillRect(-8,-34,16,4);
    } else if(item.type==="dino") {
      ctx.strokeStyle="#614b3e";ctx.lineWidth=2;
      ctx.strokeRect(-11,-49,9,6);ctx.strokeRect(2,-49,9,6);
      ctx.fillStyle="#d4b38b";ctx.fillRect(-6,-32,12,6);
    } else {
      circle(-7,-48,3,"#e4dfd5");circle(7,-48,3,"#e4dfd5");
      ctx.fillStyle="#f2eee5";ctx.beginPath();ctx.arc(0,-41,8,0,Math.PI);ctx.lineTo(-6,-34);ctx.lineTo(0,-31);ctx.lineTo(6,-34);ctx.closePath();ctx.fill();
      line([[-7,-35],[8,-18]],"#e7ce65",5);line([[-7,-35],[8,-18]],"#4d8967",2);
    }
    ctx.restore();
    ctx.save();ctx.font='750 10px system-ui';ctx.textAlign="center";
    const labelWidth=ctx.measureText(foe.short).width+12;
    ctx.fillStyle=foe.color;ctx.fillRect(x-labelWidth/2,y-item.height-24,labelWidth,17);
    ctx.fillStyle="#fff";ctx.fillText(foe.short,x,y-item.height-12);ctx.restore();
  }
  function pickup(item) {
    const x=item.x,y=WORLD.ground-item.y;
    if(item.type==="invisible"){
      circle(x,y,19,"#dbf2eb");ctx.strokeStyle="#238575";ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(x,y-3,10,Math.PI,0);ctx.lineTo(x+10,y+12);ctx.lineTo(x+5,y+8);ctx.lineTo(x,y+12);ctx.lineTo(x-5,y+8);ctx.lineTo(x-10,y+12);ctx.closePath();ctx.fillStyle="#fff";ctx.fill();ctx.stroke();
      circle(x-4,y-3,1.5,"#238575");circle(x+4,y-3,1.5,"#238575");
    }else if(item.type==="chance"){
      circle(x,y,19,"#e3ecf8");ctx.fillStyle="#5984b7";ctx.beginPath();ctx.moveTo(x,y-15);ctx.lineTo(x+12,y-10);ctx.lineTo(x+10,y+6);ctx.lineTo(x,y+15);ctx.lineTo(x-10,y+6);ctx.lineTo(x-12,y-10);ctx.closePath();ctx.fill();
      ctx.save();ctx.fillStyle="#fff";ctx.font="800 12px system-ui";ctx.textAlign="center";ctx.fillText("+1",x,y+4);ctx.restore();
    }else if(item.type==="chocolate"){
      ctx.fillStyle="#744c3c";ctx.fillRect(x-11,y-15,22,29);
      ctx.fillStyle="#b68158";for(let i=0;i<2;i++)for(let j=0;j<2;j++)ctx.fillRect(x-8+i*9,y-12+j*8,7,6);
      ctx.fillStyle="#d9b4cf";ctx.fillRect(x-12,y+1,24,14);line([[x-7,y+7],[x+7,y+7]],"#fff2f9",2);
    }else if(item.type==="mansion"){
      ctx.fillStyle="#e9c278";ctx.fillRect(x-15,y-3,30,18);ctx.fillStyle="#9a7257";ctx.beginPath();ctx.moveTo(x-18,y-4);ctx.lineTo(x,y-18);ctx.lineTo(x+18,y-4);ctx.closePath();ctx.fill();
      ctx.fillStyle="#6b718d";ctx.fillRect(x-3,y+4,6,11);ctx.fillRect(x-11,y+1,5,6);ctx.fillRect(x+6,y+1,5,6);
    }else if(item.type==="passport"){
      ctx.fillStyle="#79609c";ctx.fillRect(x-10,y-14,20,28);circle(x,y-1,5,"#e2c87f");line([[x-5,y+8],[x+5,y+8]],"#e2c87f",1);
    }else{
      ctx.fillStyle="#e9dfcb";ctx.fillRect(x-10,y-15,20,30);ctx.fillStyle="#fffaf1";ctx.fillRect(x-8,y-13,16,26);
      for(let i=0;i<3;i++)line([[x-5,y-7+i*6],[x+5,y-7+i*6]],"#ad9b80",1.5);
    }
  }
  function draw() {
    ctx.setTransform(canvas.width/virtualWidth,0,0,canvas.height/WORLD.height,0,0);
    scenery(stageAt(run.elapsed));
    bossFigure();
    for(const item of run.pickups)pickup(item);
    for(const item of run.obstacles)obstacle(item);
    character();
  }
  updateUI(); resize(); draw();
}

initRunner();
