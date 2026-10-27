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

test("uma corrida visita Brasília, Rio, Argentina, Flórida e Casa Branca, sem São Paulo", () => {
  running();
  for (const [seconds, name] of [[0,"Brasília"],[19.999,"Brasília"],[20,"Rio de Janeiro"],[40,"Argentina"],[60,"Flórida"],[80,"Casa Branca"],[200,"Casa Branca"]]) {
    assert.equal(core.stageAt(seconds).name, name);
  }
});

test("colisões consomem vidas sem dano repetido durante a proteção", () => {
  const run = running();
  assert.equal(run.lives, 3);
  run.obstacles.push({ x: 125, width: 34, height: 40, type: "barrier" });
  frames(run, .02);
  assert.equal(run.status, "running");
  assert.equal(run.lives, 2);
  frames(run, .1);
  assert.equal(run.lives, 2);
  run.invulnerableFor = 0;
  run.obstacles.push({ x: 125, width: 34, height: 40, type: "barrier" });
  frames(run, .02);
  assert.equal(run.lives, 1);
  run.invulnerableFor = 0;
  run.obstacles.push({ x: 125, width: 34, height: 40, type: "barrier" });
  frames(run, .02);
  assert.equal(run.lives, 0);
  assert.equal(run.status, "over");
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
  assert.equal(run.elapsed, 0);
  assert.equal(run.status, "paused");
});

test("a corrida continua após a Casa Branca, sem vitória ou reinício automático", () => {
  const run = running();
  run.elapsed = 100;
  core.advanceRun(run, .02, () => .5);
  assert.equal(run.status, "running");
  assert.ok(run.elapsed > 100);
  assert.equal(core.stageAt(run.elapsed).name, "Casa Branca");
  const score = core.scoreFor(run);
  frames(run, .2);
  assert.ok(core.scoreFor(run) > score);
});

test("os cenários duram o mesmo em 10, 15, 30 e 60 fps", () => {
  for (const fps of [10,15,30,60]) {
    const run = running();
    run.nextObstacle = run.nextPickup = 1e9;
    for (let i = 0; i < 20 * fps; i++) core.advanceRun(run, 1 / fps, () => .5);
    assert.ok(Math.abs(run.elapsed - 20) < 1e-7, fps + " fps: " + run.elapsed);
    assert.equal(core.stageAt(run.elapsed).name, "Rio de Janeiro");
  }
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

test("cada cenário recebe os obstáculos e bônus da viagem", () => {
  for (const [elapsed, obstacle, bonus] of [[0,"barrier","miles"],[20,"barrier","miles"],[40,"case","note"],[60,"papers","passport"],[80,"papers","passport"]]) {
    const run = running();
    run.elapsed = elapsed;
    run.nextObstacle = 0;
    run.nextPickup = 0;
    core.advanceRun(run,1/120,()=>.99);
    assert.equal(run.obstacles[0].type,obstacle);
    assert.equal(run.pickups[0].type,bonus);
  }
});

test("100 passaportes concedem uma vida extra, sem bônus duplicado", () => {
  const run = running();
  run.nextObstacle = run.nextPickup = run.nextPassport = run.nextShield = 1e9;
  for (let i = 0; i < 100; i++) {
    run.pickups.push({x:136,y:35,type:"passport",value:50});
    core.advanceRun(run, 1/120, () => .5);
  }
  assert.equal(run.passports, 100);
  assert.equal(run.lives, 4);
  assert.equal(run.bonus, 5000);
  core.advanceRun(run, 1/120, () => .5);
  assert.equal(run.lives, 4);
});

test("escudo preserva vidas durante colisões e expira", () => {
  const run = running();
  run.nextObstacle = run.nextPickup = run.nextPassport = run.nextShield = 1e9;
  run.pickups.push({x:136,y:35,type:"shield",value:0});
  core.advanceRun(run, 1/120, () => .5);
  assert.ok(run.shieldFor > 5);
  run.obstacles.push({x:125,width:34,height:40,type:"barrier"});
  core.advanceRun(run, 1/120, () => .5);
  assert.equal(run.lives, 3);
  run.shieldFor = 0;
  core.advanceRun(run, 1/120, () => .5);
  assert.equal(run.lives, 2);
});


test("a dificuldade aumenta com a distância sem tornar o salto impossível", () => {
  const start = core.difficultyAt(0);
  const middle = core.difficultyAt(30000);
  const far = core.difficultyAt(10000000);
  assert.ok(start.level < middle.level && middle.level < far.level);
  assert.ok(start.speed < middle.speed && middle.speed < far.speed);
  assert.ok(start.obstacleGap > middle.obstacleGap && middle.obstacleGap > far.obstacleGap);
  // O intervalo mínimo continua superior à duração (~0,70 s) de um salto.
  assert.ok(far.obstacleGap > 1);
  // No celular o obstáculo permanece visível antes de alcançar o personagem.
  assert.ok((480 - core.PLAYER.x - core.PLAYER.width) / far.speed > .75);
});

test("quanto mais longe, mais raros são passaportes, escudos e outros bônus", () => {
  const start = core.difficultyAt(0);
  const middle = core.difficultyAt(30000);
  const far = core.difficultyAt(10000000);
  for (const key of ["pickupGap", "passportGap", "shieldGap"]) {
    assert.ok(start[key] < middle[key] && middle[key] < far[key], key);
    assert.ok(Number.isFinite(far[key]), key);
  }
  const spawn = distance => {
    const run = running();
    run.distance = distance;
    run.nextObstacle = run.nextPickup = run.nextPassport = run.nextShield = 0;
    core.advanceRun(run, 1/120, () => .5);
    return run;
  };
  const early = spawn(0), late = spawn(90000);
  assert.ok(late.nextObstacle < early.nextObstacle);
  for (const key of ["nextPickup", "nextPassport", "nextShield"]) {
    assert.ok(late[key] > early[key], key);
  }
});

test("a corrida não tem linha de chegada, mesmo após longa distância", () => {
  const run = running();
  run.invulnerableFor = 1000000;
  for (let i = 0; i < 240 * 120; i++) core.advanceRun(run, 1/120, () => .5);
  assert.equal(run.status, "running");
  assert.ok(run.distance > 50000);
  assert.equal(core.stageAt(run.elapsed).name, "Casa Branca");
  assert.ok(core.difficultyAt(run.distance).level > 1);
  assert.ok(core.scoreFor(run) > 0);
});
