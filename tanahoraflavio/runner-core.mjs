// Coordenadas lógicas fixas: a física independe do tamanho e da densidade da tela.
export const WORLD = Object.freeze({ width: 900, height: 300, ground: 246 });
export const PLAYER = Object.freeze({ x: 120, width: 34, height: 58 });
export const SCENE_SECONDS = 20;
export const PASSPORTS_PER_LIFE = 100;
export const STARTING_LIVES = 3;
export const STAGES = Object.freeze([
  Object.freeze({ id: "brasilia", obstacle: "barrier", bonus: "miles", mission: "Pule as barreiras e colete milhas para seguir viagem.", name: "Brasília", short: "Brasília", index: 0, sky: "#edf5fa", ink: "#557b85", accent: "#477b81", ground: "#dae9de" }),
  Object.freeze({ id: "rio", obstacle: "barrier", bonus: "miles", mission: "Pule as barreiras da orla e colete milhas.", name: "Rio de Janeiro", short: "Rio", index: 1, sky: "#edf8f7", ink: "#3c7c79", accent: "#2c8379", ground: "#d9eeea" }),
  Object.freeze({ id: "argentina", obstacle: "case", bonus: "note", mission: "Desvie das malas no terminal e colete as notas.", name: "Argentina", short: "Argentina", index: 2, sky: "#edf5ff", ink: "#527ba8", accent: "#3570ac", ground: "#dce9f8" }),
  Object.freeze({ id: "florida", obstacle: "papers", bonus: "passport", mission: "Pule os papéis e colete passaportes na Flórida.", name: "Flórida", short: "Flórida", index: 3, sky: "#fff3ec", ink: "#a47364", accent: "#ba8178", ground: "#f0dfc8" }),
  Object.freeze({ id: "casa-branca", obstacle: "papers", bonus: "passport", mission: "A corrida continua: desvie dos papéis e some pontos.", name: "Casa Branca", short: "Casa Branca", index: 4, sky: "#eff3fb", ink: "#64768f", accent: "#6876a0", ground: "#dfe9d9" })
]);
export const PURSUERS = Object.freeze([
  Object.freeze({ type: "pf", name: "Polícia Federal", short: "PF", index: 0, width: 34, height: 44, color: "#354d69" }),
  Object.freeze({ type: "xandao", name: "Xandão", short: "Xandão", index: 1, width: 36, height: 49, color: "#454051" }),
  Object.freeze({ type: "janones", name: "Janones", short: "Janones", index: 2, width: 38, height: 46, color: "#397ba0" }),
  Object.freeze({ type: "army", name: "Exército do Lula", short: "Exército", index: 3, width: 44, height: 48, color: "#65714b" }),
  Object.freeze({ type: "lula", name: "Lula · chefe", short: "Lula · chefe", index: 4, width: 50, height: 56, color: "#b64250" })
]);
export const PICKUPS = Object.freeze([
  Object.freeze({ type: "chocolate", name: "Chocolate", value: 25 }),
  Object.freeze({ type: "mansion", name: "Mansão", value: 50 }),
  Object.freeze({ type: "receipt", name: "Recibo", value: 25 }),
  Object.freeze({ type: "passport", name: "Passaporte", value: 50 }),
  Object.freeze({ type: "invisible", name: "Invisibilidade", value: 0 }),
  Object.freeze({ type: "chance", name: "Chance extra", value: 0 })
]);

/**
 * Dificuldade guiada pela distância da própria partida, não pelo tempo do navegador.
 * A curva aproxima-se de limites seguros: o salto continua capaz de superar
 * obstáculos e os bônus tornam-se raros, mas nunca desaparecem.
 */
export function difficultyAt(distance) {
  const traveled = Number.isFinite(distance) ? Math.max(0, distance) : 0;
  const progression = traveled / (traveled + 25000);
  return {
    level: 1 + Math.floor(traveled / 8000),
    speed: 260 + 160 * progression,
    obstacleGap: 1.75 - .62 * progression,
    pickupGap: 1.9 + 4.2 * progression,
    passportGap: 1.8 + 3.8 * progression,
    shieldGap: 22 + 63 * progression
  };
}

export function pursuitAt(seconds) {
  return PURSUERS[Math.max(0, Math.min(4, Math.floor(seconds / 15)))];
}

export function stageAt(seconds) {
  return STAGES[Math.max(0, Math.min(STAGES.length - 1, Math.floor((seconds + 1e-7) / SCENE_SECONDS)))];
}

export function createRun() {
  return {
    status: "ready", elapsed: 0, distance: 0, bonus: 0, collected: 0,
    passports: 0, lives: STARTING_LIVES, event: "", events: 0,
    player: { y: 0, velocity: 0 }, obstacles: [], pickups: [],
    nextObstacle: 1.5, nextPickup: 2.2, nextPassport: 1.9,
    invisibleFor: 0, graceFor: 0, extraChance: false, saves: 0,
    lastPickup: null, spawnedObstacles: 0, spawnedPickups: 0
  };
}

export function startRun(run) {
  if (run.status === "ready") run.status = "running";
}

export function jumpRun(run) {
  if (run.status !== "running" || run.player.y > 0 || run.player.velocity > 0) return false;
  run.player.velocity = 610;
  return true;
}

export function togglePause(run) {
  if (run.status === "running") run.status = "paused";
  else if (run.status === "paused") run.status = "running";
}

export function scoreFor(run) {
  return Math.floor(run.distance / 20) + run.bonus;
}

export function advanceRun(run, seconds, rng = Math.random) {
  if (run.status !== "running" || !Number.isFinite(seconds) || seconds <= 0) return;
  // Não há limite de duração: o jogo termina apenas quando acabam as vidas.
  const dt = Math.min(seconds, .05);
  run.elapsed += dt;
  const balance = difficultyAt(run.distance);
  const speed = balance.speed;
  const travel = speed * dt;
  run.distance += travel;
  run.player.velocity -= 1750 * dt;
  run.player.y = Math.max(0, run.player.y + run.player.velocity * dt);
  if (run.player.y === 0) run.player.velocity = 0;
  run.invisibleFor = Math.max(0, run.invisibleFor - dt);
  run.graceFor = Math.max(0, run.graceFor - dt);

  for (const obstacle of run.obstacles) obstacle.x -= travel;
  for (const pickup of run.pickups) pickup.x -= travel;
  run.obstacles = run.obstacles.filter(o => o.x + o.width > -20);
  run.pickups = run.pickups.filter(p => p.x > -30);

  run.nextObstacle -= dt;
  if (run.nextObstacle <= 0) {
    const current = pursuitAt(run.elapsed);
    // O novo adversário aparece com frequência; os anteriores continuam na perseguição.
    const opponent = run.spawnedObstacles++ % 3 === 2
      ? PURSUERS[Math.min(current.index, Math.floor(rng() * (current.index + 1)))] : current;
    run.obstacles.push({ x: WORLD.width + 40, width: opponent.width, height: opponent.height, type: opponent.type });
    // Sempre maior que o tempo completo de um pulo (~0,7 s).
    run.nextObstacle += balance.obstacleGap + rng() * .4;
  }
  run.nextPickup -= dt;
  if (run.nextPickup <= 0) {
    const slot = run.spawnedPickups++ % 5;
    const item = PICKUPS[slot === 1 ? 4 : slot === 3 ? 5 : Math.min(3, Math.floor(rng() * 4))];
    run.pickups.push({ x: WORLD.width + 40, y: 74 + rng() * 25, type: item.type, value: item.value });
    run.nextPickup += balance.pickupGap + rng() * .7;
  }

  // Passaportes em sequência podem ser coletados num único salto. Aumentar
  // o espaço entre sequências reduz a frequência sem tornar +1 vida impossível.
  run.nextPassport -= dt;
  if (run.nextPassport <= 0) {
    const y = 78 + rng() * 12;
    for (let i = 0; i < 3; i++) {
      run.pickups.push({ x: WORLD.width + 40 + i * 35, y, type: "passport", value: 50 });
    }
    run.nextPassport += balance.passportGap + rng() * .5;
  }

  // Hitbox menor que o desenho: pernas e braços não geram colisões injustas.
  const left = PLAYER.x + 5, right = PLAYER.x + PLAYER.width - 3;
  const bottom = run.player.y + 3, top = run.player.y + PLAYER.height - 5;
  // Coletar antes de resolver colisões permite usar a vantagem já neste frame.
  run.pickups = run.pickups.filter(pickup => {
    const hit = right > pickup.x - 12 && left < pickup.x + 12 && top > pickup.y - 12 && bottom < pickup.y + 12;
    if (hit) {
      run.bonus += pickup.value; run.collected++; run.lastPickup = pickup.type;
      if (pickup.type === "invisible") run.invisibleFor = 6;
      if (pickup.type === "chance") run.extraChance = true;
      if (pickup.type === "passport") {
        run.passports++;
        if (run.passports % PASSPORTS_PER_LIFE === 0) {
          run.lives++;
          run.events++;
          run.event = `100 passaportes! Você ganhou uma vida extra. Total: ${run.lives}.`;
        }
      }
    }
    return !hit;
  });
  if (run.invisibleFor <= 0 && run.graceFor <= 0) {
    const collision = run.obstacles.some(obstacle => right > obstacle.x + 3 && left < obstacle.x + obstacle.width - 3 && bottom < obstacle.height && top > 0);
    if (collision) {
      if (run.extraChance) {
        run.extraChance = false; run.graceFor = 1.2; run.saves++;
      } else {
        run.lives--;
        run.events++;
        run.event = run.lives > 0
          ? `Colisão! Restam ${run.lives} vidas. Proteção por 2 s.`
          : "Pego pela Polícia Federal! A fuga fictícia terminou.";
        if (run.lives <= 0) { run.status = "over"; return; }
        run.graceFor = 2;
      }
    }
  }
}
