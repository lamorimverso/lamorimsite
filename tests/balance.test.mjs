import test from 'node:test';
import assert from 'node:assert/strict';
import { createRun, startRun, advanceRun, jumpRun, difficultyAt, PLAYER } from '../tanahoraflavio/runner-core.mjs';

const running = () => { const run = createRun(); startRun(run); return run; };
function seeded(seed) { return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2 ** 32; }; }

test('recompensas simultâneas ocupam um único grupo por obstáculo', () => {
  const run = running();
  run.nextObstacle = run.nextPickup = run.nextPassport = run.nextPower = 0;
  advanceRun(run, 1 / 120, () => .5);
  assert.ok(run.pickups.length > 0 && run.pickups.length <= 3);
  assert.equal(new Set(run.pickups.map(p => p.type)).size, 1, 'um único tipo por salto');
});

test('itens gerados ficam na trajetória do salto sobre o obstáculo', () => {
  for (const seed of [1, 92, 800]) {
    const run = running(), rng = seeded(seed);
    run.nextBossScore = Infinity;
    let groups = 0;
    for (let i = 0; i < 120 * 50; i++) {
      const old = new Set(run.pickups);
      advanceRun(run, 1 / 120, rng);
      const added = run.pickups.filter(p => !old.has(p));
      if (added.length) {
        groups++;
        const obstacle = run.obstacles.at(-1);
        assert.ok(obstacle);
        for (const item of added) {
          assert.ok(Math.abs(item.x - (obstacle.x + obstacle.width / 2)) <= 36, 'coleta alinhada ao perigo');
          assert.ok(item.y >= 96 && item.y <= 104, 'altura coletável durante o salto');
        }
      }
      // A análise dos nascimentos não exige colidir com a onda anterior.
      run.obstacles = run.obstacles.filter(o => o.x > 250);
      run.pickups = run.pickups.filter(p => p.x > 250);
    }
    assert.ok(groups >= 12);
  }
});

test('poderes não se acumulam em uma sequência que torna o jogador sempre invencível', () => {
  const run = running(), rng = seeded(71);
  run.nextBossScore = Infinity;
  const powers = [], types = new Set();
  for (let i = 0; i < 120 * 180; i++) {
    const old = new Set(run.pickups);
    advanceRun(run, 1 / 120, rng);
    for (const p of run.pickups) if (!old.has(p) && ['invisible','chance'].includes(p.type)) {
      powers.push(run.elapsed); types.add(p.type);
    }
    run.obstacles = run.obstacles.filter(o => o.x > 250);
    run.pickups = run.pickups.filter(p => p.x > 250);
  }
  assert.deepEqual([...types].sort(), ['chance','invisible']);
  assert.ok(powers.length >= 4 && powers.length <= 11);
  for (let i = 1; i < powers.length; i++) assert.ok(powers[i] - powers[i-1] >= 12);
});

test('um piloto que salta os obstáculos consegue coletar 100 passaportes sem proteção gratuita', () => {
  for (const seed of [7, 103, 8801]) {
    const run = running(), rng = seeded(seed);
    for (let i = 0; i < 120 * 240 && run.status === 'running'; i++) {
      const speed = difficultyAt(run.distance).speed;
      const next = run.obstacles.find(o => o.x + o.width > PLAYER.x + 5);
      if (next && next.x - (PLAYER.x + PLAYER.width) <= speed * .19) jumpRun(run);
      advanceRun(run, 1 / 120, rng);
    }
    assert.equal(run.status, 'running', `saltos viáveis na sequência ${seed}`);
    assert.ok(run.passports >= 100, `vida extra alcançável na sequência ${seed}: ${run.passports}`);
    assert.ok(run.lives >= 2);
    assert.ok(run.bossesDefeated >= 1, 'o piloto também enfrenta chefes');
  }
});

test('itens raros possuem intervalos amplos e continuam alcançáveis', () => {
  const first=difficultyAt(0),last=difficultyAt(900000);
  assert.ok(first.pickupGap>=7);
  assert.ok(first.passportGap>=4.5);
  assert.ok(first.powerGap>=24);
  assert.ok(last.pickupGap>first.pickupGap);
  assert.ok(last.passportGap>first.passportGap);
  assert.ok(last.powerGap>first.powerGap);
});
