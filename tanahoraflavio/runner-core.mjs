// Coordenadas lógicas fixas: a física independe do tamanho e da densidade da tela.
export const WORLD = Object.freeze({ width: 900, height: 300, ground: 246 });
export const PLAYER = Object.freeze({ x: 120, width: 34, height: 58 });
export const SCENE_SECONDS = 20;
export const STAGES = Object.freeze([
  Object.freeze({ id: "brasilia", obstacle: "barrier", bonus: "miles", mission: "Pule as barreiras e colete milhas para seguir viagem.", name: "Brasília", short: "Brasília", index: 0, sky: "#edf5fa", ink: "#557b85", accent: "#477b81", ground: "#dae9de" }),
  Object.freeze({ id: "rio", obstacle: "barrier", bonus: "miles", mission: "Pule as barreiras da orla e colete milhas.", name: "Rio de Janeiro", short: "Rio", index: 1, sky: "#edf8f7", ink: "#3c7c79", accent: "#2c8379", ground: "#d9eeea" }),
  Object.freeze({ id: "argentina", obstacle: "case", bonus: "note", mission: "Desvie das malas no terminal e colete as notas.", name: "Argentina", short: "Argentina", index: 2, sky: "#edf5ff", ink: "#527ba8", accent: "#3570ac", ground: "#dce9f8" }),
  Object.freeze({ id: "florida", obstacle: "papers", bonus: "passport", mission: "Pule os papéis e colete passaportes na Flórida.", name: "Flórida", short: "Flórida", index: 3, sky: "#fff3ec", ink: "#a47364", accent: "#ba8178", ground: "#f0dfc8" }),
  Object.freeze({ id: "casa-branca", obstacle: "papers", bonus: "passport", mission: "A corrida continua: desvie dos papéis e some pontos.", name: "Casa Branca", short: "Casa Branca", index: 4, sky: "#eff3fb", ink: "#64768f", accent: "#6876a0", ground: "#dfe9d9" })
]);

export function stageAt(seconds) {
  return STAGES[Math.max(0, Math.min(STAGES.length - 1, Math.floor((seconds + 1e-7) / SCENE_SECONDS)))];
}

export function createRun() {
  return {
    status: "ready", elapsed: 0, distance: 0, bonus: 0, collected: 0,
    player: { y: 0, velocity: 0 }, obstacles: [], pickups: [],
    nextObstacle: 1.5, nextPickup: 2.2
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
  if (seconds > .25) { togglePause(run); return; }
  let remaining = seconds;
  while (remaining > 1e-8 && run.status === "running") {
    const dt = Math.min(remaining, 1 / 120);
    stepRun(run, dt, rng);
    remaining -= dt;
  }
}

function stepRun(run, dt, rng) {
  run.elapsed += dt;
  const speed = Math.min(400, 280 + run.elapsed * 1.6);
  const travel = speed * dt;
  run.distance += travel;
  run.player.velocity -= 1750 * dt;
  run.player.y = Math.max(0, run.player.y + run.player.velocity * dt);
  if (run.player.y === 0) run.player.velocity = 0;

  for (const obstacle of run.obstacles) obstacle.x -= travel;
  for (const pickup of run.pickups) pickup.x -= travel;
  run.obstacles = run.obstacles.filter(o => o.x + o.width > -20);
  run.pickups = run.pickups.filter(p => p.x > -30);

  run.nextObstacle -= dt;
  if (run.nextObstacle <= 0) {
    const type = stageAt(run.elapsed).obstacle;
    run.obstacles.push({ x: WORLD.width + 40, width: type === "papers" ? 30 : 38, height: type === "papers" ? 48 : type === "case" ? 42 : 36, type });
    // Sempre maior que o tempo completo de um pulo (~0,7 s).
    run.nextObstacle += 1.3 + rng() * .55;
  }
  run.nextPickup -= dt;
  if (run.nextPickup <= 0) {
    const type = stageAt(run.elapsed).bonus;
    run.pickups.push({ x: WORLD.width + 40, y: 74 + rng() * 25, type, value: type === "passport" ? 50 : 25 });
    run.nextPickup += 1.9 + rng() * .7;
  }

  // Hitbox menor que o desenho: pernas e braços não geram colisões injustas.
  const left = PLAYER.x + 5, right = PLAYER.x + PLAYER.width - 3;
  const bottom = run.player.y + 3, top = run.player.y + PLAYER.height - 5;
  for (const obstacle of run.obstacles) {
    if (right > obstacle.x + 3 && left < obstacle.x + obstacle.width - 3 && bottom < obstacle.height && top > 0) {
      run.status = "over";
      return;
    }
  }
  run.pickups = run.pickups.filter(pickup => {
    const hit = right > pickup.x - 12 && left < pickup.x + 12 && top > pickup.y - 12 && bottom < pickup.y + 12;
    if (hit) { run.bonus += pickup.value; run.collected++; }
    return !hit;
  });
}
