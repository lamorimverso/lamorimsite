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

test("a corrida visita os cinco destinos e permanece na Casa Branca", () => {
  for (const [seconds, name] of [[0,"Brasília"],[19.999,"Brasília"],[20,"Rio de Janeiro"],[40,"Argentina"],[60,"Flórida"],[80,"Casa Branca"],[999,"Casa Branca"]]) {
    assert.equal(core.stageAt(seconds).name, name);
  }
});

test("bateu sem proteção: perde imediatamente na primeira colisão", () => {
  const run = running();
  assert.equal(core.STARTING_LIVES, 1);
  assert.equal(run.lives, 1);
  run.obstacles.push({ x: 125, width: 34, height: 44, type: "pf" });
  frames(run, .02);
  assert.equal(run.status, "over");
  assert.equal(run.lives, 0);
  assert.equal(run.graceFor, 0);
  const score=core.scoreFor(run);
  frames(run, 2);
  assert.equal(core.scoreFor(run), score);
});

test("vida extra coletada absorve uma colisão, mas a próxima sem proteção encerra", () => {
  const run = running();
  run.lives = 2; // uma vida inicial mais uma adquirida
  run.obstacles.push({ x: 125, width: 34, height: 44, type: "pf" },
                     { x: 133, width: 34, height: 48, type: "xandao" });
  frames(run, .02);
  assert.equal(run.status,"running");
  assert.equal(run.lives,1);
  assert.ok(run.graceFor>1,"a mesma barreira não pode consumir duas vidas");
  frames(run,.2);
  assert.equal(run.lives,1);
  run.graceFor=0;
  run.obstacles.push({ x: 125, width: 34, height: 44, type: "pf" });
  frames(run,.02);
  assert.equal(run.status,"over");
  assert.equal(run.lives,0);
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

test("a corrida não termina aos 75 segundos ou após a Casa Branca", () => {
  const run = running();
  run.elapsed = 74.99;
  run.invisibleFor = 1000;
  core.advanceRun(run, .02, () => .5);
  assert.equal(run.status, "running");
  assert.ok(run.elapsed > 75);
  const score = core.scoreFor(run);
  frames(run, 35);
  assert.equal(run.status, "running");
  assert.equal(core.stageAt(run.elapsed).name, "Casa Branca");
  assert.ok(core.scoreFor(run) > score);
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
  late.distance = 30000;
  // Mantém o foco do teste na curva normal, sem ativar o novo chefe de 1.500 pontos.
  early.bossCooldown = late.bossCooldown = 999;
  early.nextObstacle = late.nextObstacle = 0;
  core.advanceRun(early, 1 / 120, () => 0);
  core.advanceRun(late, 1 / 120, () => 0);
  assert.ok(core.difficultyAt(late.distance).speed > core.difficultyAt(early.distance).speed);
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
  run.nextObstacle = run.nextPickup = run.nextPassport = 100;
  frames(run, 6.1);
  assert.equal(run.invisibleFor, 0);
  run.obstacles.push({ x: 125, width: 34, height: 44, type: "pf" });
  core.advanceRun(run, 1 / 120);
  assert.equal(run.status, "over");
  assert.equal(run.lives, 0);
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
  run.nextObstacle = run.nextPickup = run.nextPassport = 100;
  frames(run, 1.3);
  run.obstacles.push({ x: 125, width: 34, height: 44, type: "pf" });
  core.advanceRun(run, 1 / 120);
  assert.equal(run.status, "over");
  assert.equal(run.lives, 0);
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
      run.nextObstacle = run.nextPickup = 0;
      run.nextPassport = 1e9;
      run.nextPower = i % 3 === 1 ? 0 : 1e9;
      core.advanceRun(run, 1 / 120, () => rng);
      for (const item of run.pickups) types.add(item.type);
      run.pickups = [];
      run.obstacles = [];
    }
  }
  for (const type of ["chocolate","mansion","receipt","invisible","chance"]) assert.ok(types.has(type), type);
});

test("100 passaportes somam uma vida e só concedem nova vida aos 200", () => {
  const run = running();
  run.nextObstacle = run.nextPickup = run.nextPassport = 1e9;
  for (let i = 0; i < 100; i++) {
    run.pickups.push({x:136,y:35,value:50,type:"passport"});
    core.advanceRun(run,1/120,()=>.5);
  }
  assert.equal(run.passports,100);
  assert.equal(run.lives,2);
  core.advanceRun(run,1/120,()=>.5);
  assert.equal(run.lives,2);
  assert.equal(run.bonus,5000);
});

test("à medida que a distância cresce, as vantagens ficam mais raras", () => {
  const start=core.difficultyAt(0), middle=core.difficultyAt(30000), late=core.difficultyAt(1000000);
  assert.ok(start.level < middle.level && middle.level < late.level);
  assert.ok(start.speed < middle.speed && middle.speed < late.speed);
  assert.ok(start.obstacleGap > middle.obstacleGap && middle.obstacleGap > late.obstacleGap);
  assert.ok(late.obstacleGap > 1);
  for(const type of ["pickupGap","passportGap","powerGap"]) {
    assert.ok(start[type] < middle[type] && middle[type] < late[type],type);
  }
  const spawn = (distance, timer) => {
    const run=running();
    run.distance=distance;
    run.nextBossScore=Infinity;
    run.nextPickup=run.nextPassport=run.nextPower=1e9;
    run.nextObstacle=run[timer]=0;
    core.advanceRun(run,1/120,()=>.5);
    return run;
  };
  for (const timer of ['nextPickup','nextPassport','nextPower']) {
    const a=spawn(0,timer), b=spawn(90000,timer);
    assert.ok(a.nextObstacle > b.nextObstacle);
    assert.ok(a[timer] < b[timer], timer);
  }
  assert.ok((480-core.PLAYER.x-core.PLAYER.width)/late.speed>.75);
});

test("uma nova corrida zera vidas, passaportes e vantagens", () => {
  const old=running();
  old.passports=100; old.lives=5; old.invisibleFor=5; old.extraChance=true;
  const fresh=core.createRun();
  assert.equal(fresh.passports,0);
  assert.equal(fresh.lives,1);
  assert.equal(fresh.invisibleFor,0);
  assert.equal(fresh.extraChance,false);
});


test("o primeiro chefe só aparece ao alcançar 1.500 pontos", () => {
  const run = running();
  run.nextObstacle=run.nextPickup=run.nextPassport=1e8;
  run.bonus=core.BOSS_SCORE_STEP-2;
  core.advanceRun(run,1/120,()=>.5);
  assert.equal(run.boss,null);
  run.bonus=core.BOSS_SCORE_STEP;
  core.advanceRun(run,1/120,()=>.5);
  assert.equal(run.boss.type,"pf");
  assert.equal(run.boss.level,1);
  assert.equal(run.boss.remaining,3);
  assert.equal(run.nextBossScore,core.BOSS_SCORE_STEP);
});

test("oito chefes em ordem, com Lula supremo no final de cada ciclo", () => {
  const names=["pf","xandao","janones","army","haddad","boulos","dino","lula"];
  assert.deepEqual(core.BOSS_ROSTER,names);
  for(let i=0;i<names.length*3;i++){
    const c=core.bossAtRound(i);
    assert.equal(c.foe.type,names[i%8]);
    assert.equal(c.level,Math.floor(i/8)+1);
    if(i%8===7){assert.equal(c.supreme,true);assert.ok(c.attacks>core.bossAtRound(i-1).attacks);}
    else assert.equal(c.supreme,false);
    assert.ok(c.interval>=1.18,"intervalo justo");
    assert.ok(c.attacks<=9,"limite de ataques");
    assert.ok(c.foe.height<=58,"saltável");
  }
  assert.ok(core.bossAtRound(15).attacks>=core.bossAtRound(7).attacks);
  for(const [secs,type] of [[0,"pf"],[15,"xandao"],[30,"janones"],[45,"army"],[60,"lula"]]){
    assert.equal(core.pursuitAt(secs).type,type,"perseguição comum permanece");
  }
});

test("chefe avisa antes do primeiro ataque e substitui a chuva de obstáculos comuns", () => {
  const run=running();
  run.bonus=core.BOSS_SCORE_STEP;
  run.obstacles.push({x:200,width:34,height:44,type:"pf"});
  run.nextObstacle=0;run.nextPickup=run.nextPassport=1e7;
  core.advanceRun(run,1/120,()=>.5);
  assert.equal(run.obstacles.length,0);
  assert.equal(run.boss.fired,0);
  assert.ok(run.boss.nextAttack>1);
  frames(run,.9);
  assert.equal(run.boss.fired,0);
  frames(run,.5);
  assert.equal(run.boss.fired,1);
  assert.equal(run.obstacles.filter(x=>x.bossAttack).length,1);
});

test("a barra do chefe esgota ao superar os ataques; pause interrompe seu relógio", () => {
  const run=running();
  run.bonus=core.BOSS_SCORE_STEP;
  run.nextPickup=run.nextPassport=1e8;
  core.advanceRun(run,1/120,()=>.5);
  run.graceFor=500;
  core.togglePause(run);
  const pause=structuredClone(run.boss);
  frames(run,4);
  assert.deepEqual(run.boss,pause);
  core.togglePause(run);
  const expected=run.boss.total;
  for(let i=0;i<120*20 && run.boss;i++){
    core.advanceRun(run,1/120,()=>.5);
  }
  assert.equal(run.boss,null);
  assert.equal(run.bossesDefeated,1);
  assert.equal(expected,3);
  assert.equal(run.nextBossScore,core.BOSS_SCORE_STEP*2);
  assert.equal(run.status,"running");
});

test("vida extra por 100 passaportes permanece independente dos chefes", () => {
  const run=running();
  run.bonus=core.BOSS_SCORE_STEP;
  run.nextPickup=run.nextPassport=1e8;
  core.advanceRun(run,1/120,()=>.5);
  run.passports=99;run.lives=1;
  run.pickups.push({x:136,y:35,value:50,type:"passport"});
  core.advanceRun(run,1/120,()=>.5);
  assert.equal(run.passports,100);
  assert.equal(run.lives,2);
  assert.equal(run.boss.type,"pf");
});

test("vencer Lula concede um escudo e abre o próximo ciclo sem finalizar a corrida", () => {
  const run=running();
  run.bossesDefeated=7;run.nextBossScore=8*core.BOSS_SCORE_STEP;
  run.bonus=run.nextBossScore;run.nextObstacle=run.nextPickup=run.nextPassport=1e8;
  core.advanceRun(run,1/120,()=>.5);
  assert.equal(run.boss.type,"lula");
  assert.equal(run.boss.supreme,true);
  run.graceFor=500;
  for(let i=0;i<120*25&&run.boss;i++)core.advanceRun(run,1/120,()=>.5);
  assert.equal(run.boss,null);
  assert.equal(run.status,"running");
  assert.equal(run.bossesDefeated,8);
  assert.equal(run.extraChance,true);
  assert.equal(core.bossAtRound(run.bossesDefeated).level,2);
});

test("Haddad, Boulos e Dino aparecem nos marcos e seus ataques podem ser vencidos", () => {
  for(const [index,type] of [[4,"haddad"],[5,"boulos"],[6,"dino"]]){
    const run=running();
    run.bossesDefeated=index;
    run.nextBossScore=(index+1)*core.BOSS_SCORE_STEP;
    run.bonus=run.nextBossScore;
    run.nextObstacle=run.nextPickup=run.nextPassport=100000;
    core.advanceRun(run,1/120,()=>.5);
    assert.equal(run.boss.type,type);
    assert.equal(run.boss.level,1);
    assert.equal(run.boss.supreme,false);
    assert.ok(run.boss.nextAttack>1);
    run.graceFor=100;
    for(let i=0;i<120*26&&run.boss;i++)core.advanceRun(run,1/120,()=>.5);
    assert.equal(run.boss,null);
    assert.equal(run.bossesDefeated,index+1);
    assert.equal(run.nextBossScore,(index+2)*core.BOSS_SCORE_STEP);
    assert.equal(run.status,"running");
  }
});

test("Lula encerra sempre a sequência de oito chefes em todos os níveis", () => {
  for(let level=1;level<=5;level++){
    const last=core.bossAtRound(level*8-1);
    const first=core.bossAtRound(level*8);
    assert.equal(last.foe.type,"lula");
    assert.equal(last.supreme,true);
    assert.equal(last.level,level);
    assert.equal(first.foe.type,"pf");
    assert.equal(first.supreme,false);
    assert.equal(first.level,level+1);
  }
});

test("escudo temporário absorve um choque, mas não oferece vidas adicionais", () => {
  const run=running();
  run.extraChance=true;
  run.obstacles.push({x:125,width:34,height:44,type:"pf"});
  frames(run,.02);
  assert.equal(run.status,"running");
  assert.equal(run.lives,1);
  assert.equal(run.extraChance,false);
  assert.equal(run.saves,1);
  assert.ok(run.graceFor>1);
  run.graceFor=0;
  run.obstacles.push({x:125,width:34,height:44,type:"pf"});
  frames(run,.02);
  assert.equal(run.status,"over");
  assert.equal(run.lives,0);
});

test("coletar passaporte número 100 no mesmo quadro da colisão salva a corrida", () => {
  const run=running();
  run.passports=99;
  run.pickups.push({x:136,y:35,type:"passport",value:50});
  run.obstacles.push({x:125,width:34,height:44,type:"pf"});
  core.advanceRun(run,1/120,()=>.5);
  assert.equal(run.passports,100);
  assert.equal(run.status,"running");
  assert.equal(run.lives,1);
  assert.ok(run.graceFor>1);
});

test("colisão contra ataque de chefe também termina a corrida sem poder", () => {
  const run=running();
  run.bonus=core.BOSS_SCORE_STEP;
  core.advanceRun(run,1/120,()=>.5);
  assert.equal(run.boss.type,"pf");
  run.obstacles.push({x:125,width:34,height:44,type:"pf",bossAttack:true,counted:false});
  core.advanceRun(run,1/120,()=>.5);
  assert.equal(run.status,"over");
  assert.equal(run.lives,0);
});
