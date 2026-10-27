import test from "node:test";
import assert from "node:assert/strict";

let core = {};
try { core = await import("../tanahoraflavio/runner-core.mjs"); }
catch (error) { if (error.code !== "ERR_MODULE_NOT_FOUND") throw error; }

function running() {
  assert.equal(typeof core.createRun, "function", "O motor de corrida ainda não existe");
  const run = core.createRun();
  core.startRun(run);
  return run;
}
function frames(run, seconds) {
  for (let i = 0; i < Math.ceil(seconds * 120); i++) core.advanceRun(run, 1 / 120, () => .5);
}

test("a pista só avança depois de iniciar", () => {
  const run = running();
  run.status = "ready";
  frames(run, 1);
  assert.equal(run.distance, 0);
  assert.equal(run.elapsed, 0);
  assert.equal(core.jumpRun(run), false);
  core.startRun(run);
  frames(run, .5);
  assert.ok(run.distance > 100);
  assert.ok(core.scoreFor(run) > 0);
});

test("um pulo sobe, impede novo pulo no ar e aterrissa", () => {
  const run = running();
  assert.equal(core.jumpRun(run), true);
  frames(run, .2);
  assert.ok(run.player.y > 65);
  assert.equal(core.jumpRun(run), false);
  frames(run, .65);
  assert.equal(run.player.y, 0);
  assert.equal(core.jumpRun(run), true);
});

test("a pausa congela física e pontuação e permite retomar", () => {
  const run = running();
  core.jumpRun(run);
  frames(run, .1);
  core.togglePause(run);
  const snapshot = structuredClone(run);
  frames(run, 2);
  assert.deepEqual(run, snapshot);
  core.togglePause(run);
  frames(run, .1);
  assert.ok(run.elapsed > snapshot.elapsed);
});

test("Rio muda para Argentina e depois EUA exatamente nas fronteiras", () => {
  running();
  for (const [seconds, name] of [[0,"Rio de Janeiro"],[24.999,"Rio de Janeiro"],[25,"Argentina"],[49.999,"Argentina"],[50,"Estados Unidos"],[75,"Estados Unidos"]]) {
    assert.equal(core.stageAt(seconds).name, name);
  }
});

test("uma colisão no chão encerra e congela a partida", () => {
  const run = running();
  run.obstacles.push({ x: 125, width: 34, height: 40, type: "barrier" });
  frames(run, .02);
  assert.equal(run.status, "over");
  const score = core.scoreFor(run);
  frames(run, 1);
  assert.equal(core.scoreFor(run), score);
});

test("saltar acima de um obstáculo não é colisão", () => {
  const run = running();
  run.player.y = 95;
  run.obstacles.push({ x: 125, width: 34, height: 40, type: "barrier" });
  frames(run, .02);
  assert.equal(run.status, "running");
});

test("um item soma o bônus uma única vez", () => {
  const run = running();
  run.pickups.push({ x: 136, y: 35, value: 50, type: "passport" });
  frames(run, .02);
  assert.equal(run.bonus, 50);
  assert.equal(run.collected, 1);
  assert.equal(run.pickups.length, 0);
  frames(run, .02);
  assert.equal(run.bonus, 50);
});

test("um intervalo enorme ou inválido não teleporta o personagem", () => {
  const run = running();
  for (const dt of [-1, NaN, Infinity]) core.advanceRun(run, dt, () => .5);
  assert.equal(run.elapsed, 0);
  core.advanceRun(run, 120, () => .5);
  assert.ok(run.elapsed > 0 && run.elapsed <= .05);
  assert.ok(run.distance < 20);
});

test("a rota termina aos 75 segundos e não ganha pontos depois", () => {
  const run = running();
  run.elapsed = 74.99;
  core.advanceRun(run, .02, () => .5);
  assert.equal(run.status, "won");
  assert.equal(run.elapsed, 75);
  const score = core.scoreFor(run);
  frames(run, 5);
  assert.equal(core.scoreFor(run), score);
});

test("os obstáculos chegam com tempo de reação e intervalo para aterrissar", () => {
  const run = running();
  let previous = null;
  let saw = 0;
  for (let i = 0; i < 1200; i++) {
    const count = run.obstacles.length;
    core.advanceRun(run, 1 / 120, () => 0);
    if (run.obstacles.length > count) {
      const obstacle = run.obstacles.at(-1);
      assert.ok(obstacle.x >= 895);
      if (previous !== null) assert.ok(run.elapsed - previous >= 1.1);
      previous = run.elapsed;
      saw++;
    }
    run.obstacles = run.obstacles.filter(o => o.x > 250);
  }
  assert.ok(saw >= 4);
});

test("a perseguição introduz PF, Xandão, Janones, exército e chefe em ordem", () => {
  for (const [elapsed, expected] of [[0,"pf"],[15,"xandao"],[30,"janones"],[45,"army"],[60,"lula"]]) {
    const run = running();
    run.elapsed = elapsed;
    run.nextObstacle = 0;
    core.advanceRun(run, 1 / 120, () => .99);
    assert.equal(run.obstacles[0].type, expected);
    assert.ok(run.obstacles[0].height <= 58, "O adversário deve continuar saltável");
  }
});

test("a dificuldade aumenta sem eliminar a janela entre pulos", () => {
  const early = running(), late = running();
  late.elapsed = 60;
  early.nextObstacle = late.nextObstacle = 0;
  core.advanceRun(early, 1 / 120, () => 0);
  core.advanceRun(late, 1 / 120, () => 0);
  assert.ok(late.distance > early.distance);
  assert.ok(late.nextObstacle < early.nextObstacle);
  assert.ok(late.nextObstacle >= 1.09);
});

test("invisibilidade coletada no frame de uma colisão protege imediatamente", () => {
  const run = running();
  run.pickups.push({ x: 136, y: 35, value: 0, type: "invisible" });
  run.obstacles.push({ x: 125, width: 34, height: 44, type: "pf" });
  core.advanceRun(run, 1 / 120, () => .5);
  assert.equal(run.status, "running");
  assert.equal(run.invisibleFor, 6);
  assert.equal(run.collected, 1);
});

test("a invisibilidade expira e não acumula duração infinita", () => {
  const run = running();
  run.invisibleFor = 4;
  run.pickups.push({ x: 136, y: 35, value: 0, type: "invisible" });
  core.advanceRun(run, 1 / 120, () => .5);
  assert.equal(run.invisibleFor, 6);
  run.nextObstacle = run.nextPickup = 100;
  frames(run, 6.1);
  assert.equal(run.invisibleFor, 0);
  run.obstacles.push({ x: 125, width: 34, height: 44, type: "pf" });
  core.advanceRun(run, 1 / 120);
  assert.equal(run.status, "over");
});

test("uma chance extra absorve uma colisão e evita perda imediata por sobreposição", () => {
  const run = running();
  run.pickups.push({ x: 136, y: 35, value: 0, type: "chance" });
  run.obstacles.push({ x: 125, width: 34, height: 44, type: "pf" }, { x: 133, width: 34, height: 48, type: "xandao" });
  core.advanceRun(run, 1 / 120, () => .5);
  assert.equal(run.status, "running");
  assert.equal(run.extraChance, false);
  assert.equal(run.saves, 1);
  assert.ok(run.graceFor > 1);
  run.nextObstacle = run.nextPickup = 100;
  frames(run, 1.3);
  run.obstacles.push({ x: 125, width: 34, height: 44, type: "pf" });
  core.advanceRun(run, 1 / 120);
  assert.equal(run.status, "over");
  assert.equal(run.saves, 1);
});

test("a pausa congela a invisibilidade e a recuperação", () => {
  const run = running();
  run.pickups.push({ x: 136, y: 35, value: 0, type: "invisible" });
  core.advanceRun(run, 1 / 120);
  run.graceFor = .7;
  core.togglePause(run);
  const before = structuredClone(run);
  frames(run, 8);
  assert.deepEqual(run, before);
  core.togglePause(run);
  core.advanceRun(run, .05);
  assert.ok(run.invisibleFor < 6);
  assert.ok(run.graceFor < .7);
});

test("a proteção invisível não gasta a chance guardada e nova partida limpa vantagens", () => {
  const run = running();
  run.extraChance = true;
  run.invisibleFor = 2;
  run.obstacles.push({ x: 125, width: 34, height: 44, type: "lula" });
  core.advanceRun(run, 1 / 120);
  assert.equal(run.status, "running");
  assert.equal(run.extraChance, true);
  const fresh = core.createRun();
  assert.equal(fresh.extraChance, false);
  assert.equal(fresh.invisibleFor, 0);
  assert.equal(fresh.graceFor, 0);
  assert.equal(fresh.saves, 0);
});

test("os itens incluem os três objetos satíricos e oferecem ambas as vantagens regularmente", () => {
  const types = new Set();
  for (const rng of [0,.4,.7,.99]) {
    const run = running();
    for (let i = 0; i < 10; i++) {
      run.nextPickup = 0;
      core.advanceRun(run, 1 / 120, () => rng);
      for (const item of run.pickups) types.add(item.type);
      run.pickups = [];
    }
  }
  for (const type of ["chocolate","mansion","receipt","invisible","chance"]) assert.ok(types.has(type), type);
});
