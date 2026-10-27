// Coordenadas lógicas fixas: a física independe do tamanho e da densidade da tela.
export const WORLD = Object.freeze({ width: 900, height: 300, ground: 246 });
export const PLAYER = Object.freeze({ x: 120, width: 34, height: 58 });
export const STAGES = Object.freeze([
  Object.freeze({ name: "Rio de Janeiro", short: "Rio", index: 0, sky: "#edf8f7", ink: "#3c7c79", accent: "#2c8379", ground: "#d9eeea" }),
  Object.freeze({ name: "Argentina", short: "Argentina", index: 1, sky: "#edf5ff", ink: "#527ba8", accent: "#3570ac", ground: "#dce9f8" }),
  Object.freeze({ name: "Estados Unidos", short: "EUA", index: 2, sky: "#f4effa", ink: "#78608e", accent: "#8052a5", ground: "#e9def2" })
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

export function pursuitAt(seconds) {
  return PURSUERS[Math.max(0, Math.min(4, Math.floor(seconds / 15)))];
}

export function stageAt(seconds) {
  return STAGES[Math.max(0, Math.min(2, Math.floor(seconds / 25)))];
}

export function createRun() {
  return {
    status: "ready", elapsed: 0, distance: 0, bonus: 0, collected: 0,
    player: { y: 0, velocity: 0 }, obstacles: [], pickups: [],
    nextObstacle: 1.5, nextPickup: 2.2,
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
  const dt = Math.min(seconds, .05, 75 - run.elapsed);
  run.elapsed = Math.min(75, run.elapsed + dt);
  const speed = Math.min(430, 280 + run.elapsed * 2);
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
    run.nextObstacle += Math.max(1.1, 1.6 - run.elapsed / 120) + rng() * .4;
  }
  run.nextPickup -= dt;
  if (run.nextPickup <= 0) {
    const slot = run.spawnedPickups++ % 5;
    const item = PICKUPS[slot === 1 ? 4 : slot === 3 ? 5 : Math.min(3, Math.floor(rng() * 4))];
    run.pickups.push({ x: WORLD.width + 40, y: 74 + rng() * 25, type: item.type, value: item.value });
    run.nextPickup += 1.9 + rng() * .7;
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
    }
    return !hit;
  });
  if (run.invisibleFor <= 0 && run.graceFor <= 0) {
    const collision = run.obstacles.some(obstacle => right > obstacle.x + 3 && left < obstacle.x + obstacle.width - 3 && bottom < obstacle.height && top > 0);
    if (collision) {
      if (run.extraChance) { run.extraChance = false; run.graceFor = 1.2; run.saves++; }
      else { run.status = "over"; return; }
    }
  }
  if (run.elapsed >= 75) run.status = "won";
}
