import test from 'node:test';
import assert from 'node:assert/strict';
import { createRun, startRun, advanceRun, difficultyAt } from '../tanahoraflavio/runner-core.mjs';

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
    run.nextBossAt = Infinity; run.nextRaid = Infinity;
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
    assert.ok(groups >= 5, "coletas úteis continuam presentes mesmo com passaportes mais raros");
  }
});

test('poderes não se acumulam em uma sequência que torna o jogador sempre invencível', () => {
  const run = running(), rng = seeded(71);
  run.nextBossAt = Infinity; run.nextRaid = Infinity;
  const powers = [], types = new Set();
  for (let i = 0; i < 120 * 180; i++) {
    const old = new Set(run.pickups);
    advanceRun(run, 1 / 120, rng);
    for (const p of run.pickups) if (!old.has(p) && ['shield'].includes(p.type)) {
      powers.push(run.elapsed); types.add(p.type);
    }
    run.obstacles = run.obstacles.filter(o => o.x > 250);
    run.pickups = run.pickups.filter(p => p.x > 250);
  }
  assert.deepEqual([...types].sort(), ['shield']);
  assert.ok(powers.length >= 4 && powers.length <= 11);
  for (let i = 1; i < powers.length; i++) assert.ok(powers[i] - powers[i-1] >= 12);
});

// A economia com coleta física real é verificada pelo piloto de ux-core.test.mjs.
test('itens raros possuem intervalos amplos e continuam alcançáveis', () => {
  const first=difficultyAt(0),last=difficultyAt(900000);
  assert.ok(first.pickupGap>=7);
  assert.ok(first.passportGap>=5.2&&first.passportGap<6,'novo intervalo permite a primeira vida em tempo útil');
  assert.ok(first.powerGap>=24);
  assert.ok(last.pickupGap>first.pickupGap);
  assert.ok(last.passportGap>first.passportGap);
  assert.ok(last.passportGap<=6.4,'o intervalo entre passaportes tem limite');
  assert.ok(last.powerGap>first.powerGap);
});
