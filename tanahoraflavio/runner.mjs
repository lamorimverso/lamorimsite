import { WORLD, PLAYER, STAGES, createRun, startRun, jumpRun, togglePause, advanceRun, stageAt, scoreFor } from "./runner-core.mjs";

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
  const portrait = new Image();
  portrait.src = new URL("./retrato.webp", import.meta.url).href;
  portrait.addEventListener("load", () => draw());
  const pad = number => String(number).padStart(2, "0");

  function updateUI() {
    const stage = stageAt(run.elapsed), score = scoreFor(run);
    if ((run.status === "over" || run.status === "won") && score > best) {
      best = score;
      try { localStorage.setItem(recordKey, String(best)); } catch { /* Recorde da sessão permanece na memória. */ }
    }
    $("game-score").textContent = String(score).padStart(4, "0");
    $("game-best").textContent = String(best).padStart(4, "0");
    $("game-time").textContent = `${pad(Math.floor(run.elapsed / 60))}:${pad(Math.floor(run.elapsed % 60))}`;
    $("game-progress").setAttribute("aria-valuenow", String(Math.floor(run.elapsed)));
    $("game-progress").setAttribute("aria-valuetext", `${Math.floor(run.elapsed)} de 75 segundos. ${stage.name}.`);
    $("game-progress").firstElementChild.style.width = `${run.elapsed / 75 * 100}%`;
    section.dataset.runState = run.status;
    $("game-jump").disabled = run.status !== "running";
    $("game-pause").disabled = run.status !== "running" && run.status !== "paused";
    $("game-pause").textContent = run.status === "paused" ? "Continuar corrida" : "Pausar corrida";
    $("game-start").textContent = run.status === "ready" ? "Começar corrida" : run.status === "over" ? "Tentar de novo" : run.status === "won" ? "Jogar de novo" : "Recomeçar corrida";
    $("game-overlay").hidden = run.status === "running";
    const overlays = {
      ready: ["Passaporte na mão?", "Tem um longo caminho até o portão de embarque."],
      paused: ["Pausa no embarque", "Sua corrida está guardada. Continue quando quiser."],
      over: ["Barrado no caminho!", `${score} pontos · ${run.collected} ${run.collected === 1 ? "bônus coletado" : "bônus coletados"}. Bora tentar outra vez?`],
      won: ["Rota concluída!", `Do Rio aos EUA em 75 segundos. Você fez ${score} pontos!`]
    };
    if (overlays[run.status]) {
      $("game-overlay-title").textContent = overlays[run.status][0];
      $("game-overlay-copy").textContent = overlays[run.status][1];
    }
    if (lastStatus !== run.status || lastStage !== stage.index) {
      const messages = {
        ready: "Tudo pronto. A corrida começa quando você quiser.",
        running: `${stage.name}: desvie dos obstáculos e pegue os bônus.`,
        paused: "Corrida pausada. Toque em Continuar corrida para retomar.",
        over: `Fim da corrida. ${score} pontos. Toque em Tentar de novo para jogar.`,
        won: `Rota concluída! ${score} pontos. Você chegou aos Estados Unidos.`
      };
      $("game-status").textContent = messages[run.status];
      section.querySelectorAll("[data-stage]").forEach((stop, index) => {
        stop.classList.toggle("is-current", index === stage.index);
        stop.classList.toggle("is-done", index < stage.index || run.status === "won");
        if (index === stage.index) stop.setAttribute("aria-current", "step");
        else stop.removeAttribute("aria-current");
      });
      lastStage = stage.index;
      lastStatus = run.status;
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
    accumulator = 0; lastFrame = performance.now();
    updateUI(); draw(); schedule();
    canvas.focus({ preventScroll: true });
  }
  function jump() {
    if (["ready", "over", "won"].includes(run.status)) begin();
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
    if (event.target.closest("button,a,input,select,textarea") || event.ctrlKey || event.metaKey || event.altKey) return;
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
    ctx.fillStyle = stage.index === 1 ? "#cadcf1" : "#ded2e9";
    for (let index = 0; index < 11; index++) {
      const x = virtualWidth * .38 + index * 45;
      const height = [43,70,51,86,58,68][index % 6];
      ctx.fillRect(x,base-height,32,height);
      ctx.fillStyle = "#ffffff72";
      for(let y=base-height+10;y<base-6;y+=13) { ctx.fillRect(x+7,y,4,5);ctx.fillRect(x+20,y,4,5); }
      ctx.fillStyle = stage.index === 1 ? "#cadcf1" : "#ded2e9";
    }
  }
  function scenery(stage) {
    ctx.fillStyle = stage.sky; ctx.fillRect(0,0,virtualWidth,WORLD.height);
    circle(virtualWidth-65,49,20,"#ebcc7880");
    for (let i=0;i<3;i++) cloud(((i*290 + 110 - run.distance*.07) % (virtualWidth+180) + virtualWidth+180) % (virtualWidth+180)-70, 65+(i%2)*30);
    if (stage.index === 0) {
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
    } else if (stage.index === 1) {
      buildings(stage);
      const x=virtualWidth*.64;
      ctx.fillStyle="#fffaf0";ctx.beginPath();ctx.moveTo(x-10,219);ctx.lineTo(x-6,108);ctx.lineTo(x,91);ctx.lineTo(x+6,108);ctx.lineTo(x+10,219);ctx.fill();
      line([[x,111],[x+1,214]],"#d4c9af",1);
      ctx.fillStyle="#b7cae1";ctx.fillRect(x-18,218,36,5);
    } else {
      buildings(stage);
      const x=virtualWidth*.7;
      ctx.fillStyle="#ad97c3";ctx.fillRect(x-17,138,34,83);ctx.fillRect(x-11,124,22,14);
      line([[x,124],[x,104]],"#ad97c3",3);
      const liberty=virtualWidth*.88;
      ctx.fillStyle="#91b8ad";ctx.beginPath();ctx.moveTo(liberty-17,218);ctx.lineTo(liberty-5,162);ctx.lineTo(liberty+5,162);ctx.lineTo(liberty+15,218);ctx.fill();
      circle(liberty,155,7,"#91b8ad");
      line([[liberty+4,174],[liberty+18,145],[liberty+18,134]],"#91b8ad",6);
      circle(liberty+18,130,4,"#d6b65e");
      ctx.fillStyle="#b6b3bd";ctx.fillRect(liberty-20,218,40,9);
    }
    // Pequeno avião e linha pontilhada indicam a viagem sem distrair da pista.
    ctx.save(); ctx.translate(virtualWidth-135,83);ctx.fillStyle=stage.ink;ctx.globalAlpha=.45;
    ctx.beginPath();ctx.moveTo(0,-9);ctx.lineTo(4,-1);ctx.lineTo(15,4);ctx.lineTo(15,7);ctx.lineTo(3,4);ctx.lineTo(2,12);ctx.lineTo(6,15);ctx.lineTo(6,17);ctx.lineTo(0,15);ctx.lineTo(-6,17);ctx.lineTo(-6,15);ctx.lineTo(-2,12);ctx.lineTo(-3,4);ctx.lineTo(-15,7);ctx.lineTo(-15,4);ctx.lineTo(-4,-1);ctx.closePath();ctx.fill();ctx.restore();
    ctx.fillStyle=stage.ground;ctx.fillRect(0,WORLD.ground,virtualWidth,WORLD.height-WORLD.ground);
    line([[0,WORLD.ground],[virtualWidth,WORLD.ground]],stage.ink,2);
    const offset=run.distance%64;
    for(let x=-offset;x<virtualWidth;x+=64)line([[x,272],[x+25,272]],"#ffffffaa",3);
    ctx.fillStyle=stage.ink;ctx.font='650 11px system-ui, sans-serif';ctx.fillText(stage.name.toLocaleUpperCase("pt-BR"),20,26);
  }
  function character() {
    const stride = run.player.y === 0 && run.status === "running" ? Math.sin(run.elapsed*22)*9 : 4;
    ctx.save();ctx.translate(PLAYER.x+17,WORLD.ground-run.player.y);
    ctx.fillStyle="#414052";ctx.globalAlpha=.09;ctx.beginPath();ctx.ellipse(0,run.player.y+3,21,4,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    line([[-5,-21],[-8+stride,-10],[-8-stride,0]],"#383249",7);
    line([[5,-21],[8-stride,-10],[8+stride,0]],"#51405f",7);
    line([[-10-stride,0],[-2-stride,0]],"#272130",5);line([[7+stride,0],[14+stride,0]],"#272130",5);
    ctx.fillStyle="#694790";ctx.beginPath();ctx.moveTo(-10,-39);ctx.lineTo(9,-39);ctx.lineTo(12,-18);ctx.lineTo(-11,-18);ctx.closePath();ctx.fill();
    ctx.fillStyle="#f4ecf8";ctx.beginPath();ctx.moveTo(-5,-39);ctx.lineTo(5,-39);ctx.lineTo(0,-27);ctx.fill();
    line([[0,-36],[2,-28]],"#d7b45a",3);
    line([[-8,-35],[-15,-27],[-17-stride*.4,-20]],"#694790",5);
    line([[8,-35],[14,-27],[20+stride*.4,-29]],"#694790",5);
    circle(20+stride*.4,-29,3,"#ddbb9d");
    ctx.save();ctx.beginPath();ctx.ellipse(0,-52,15,18,0,0,Math.PI*2);ctx.clip();
    if(portrait.complete&&portrait.naturalWidth)ctx.drawImage(portrait,portrait.width*.2,portrait.height*.04,portrait.width*.6,portrait.height*.76,-15,-70,30,36);
    else{ctx.fillStyle="#dfbda0";ctx.fillRect(-15,-70,30,36);ctx.fillStyle="#423631";ctx.fillRect(-15,-70,30,9);}
    ctx.restore();ctx.restore();
  }
  function obstacle(item) {
    const y=WORLD.ground-item.height;
    if(item.type==="barrier"){
      ctx.fillStyle="#b47861";ctx.fillRect(item.x+4,y+14,5,item.height-14);ctx.fillRect(item.x+item.width-9,y+14,5,item.height-14);
      ctx.fillStyle="#d58b64";ctx.fillRect(item.x,y,item.width,19);
      ctx.save();ctx.beginPath();ctx.rect(item.x,y,item.width,19);ctx.clip();
      for(let x=item.x-9;x<item.x+item.width;x+=18)line([[x,y+19],[x+12,y]],"#fff4e5",6);
      ctx.restore();
    }else if(item.type==="papers"){
      ctx.fillStyle="#b7a5c9";ctx.fillRect(item.x,y,item.width,item.height);
      ctx.fillStyle="#fbf8ff";ctx.fillRect(item.x+3,y+3,item.width-6,item.height-5);
      for(let row=0;row<4;row++)line([[item.x+8,y+9+row*6],[item.x+item.width-7,y+9+row*6]],"#c6b6d5",2);
    }else{
      line([[item.x+11,y],[item.x+11,y-5],[item.x+25,y-5],[item.x+25,y]],"#7b645b",3);
      ctx.fillStyle="#b88e76";ctx.fillRect(item.x,y,item.width,item.height-3);
      line([[item.x+10,y+3],[item.x+10,y+item.height-7]],"#e0bca0",3);line([[item.x+28,y+3],[item.x+28,y+item.height-7]],"#e0bca0",3);
      circle(item.x+7,WORLD.ground-1,3,"#6c5a60");circle(item.x+item.width-7,WORLD.ground-1,3,"#6c5a60");
    }
  }
  function pickup(item) {
    const x=item.x,y=WORLD.ground-item.y;
    if(item.type==="miles"){
      circle(x,y,12,"#e5c56d");circle(x,y,8,"#f9df93");ctx.fillStyle="#91742e";ctx.font='bold 15px system-ui';ctx.fillText("+",x-6,y+5);
    }else if(item.type==="passport"){
      ctx.fillStyle="#79609c";ctx.fillRect(x-10,y-14,20,28);circle(x,y-1,5,"#e2c87f");line([[x-5,y+8],[x+5,y+8]],"#e2c87f",1);
    }else{
      ctx.fillStyle="#92bc9b";ctx.fillRect(x-14,y-9,28,18);ctx.strokeStyle="#d4ebd7";ctx.lineWidth=1;ctx.strokeRect(x-11,y-6,22,12);circle(x,y,5,"#d4ebd7");
    }
  }
  function draw() {
    ctx.setTransform(canvas.width/virtualWidth,0,0,canvas.height/WORLD.height,0,0);
    scenery(stageAt(run.elapsed));
    for(const item of run.pickups)pickup(item);
    for(const item of run.obstacles)obstacle(item);
    character();
  }
  updateUI(); resize(); draw();
}

initRunner();
