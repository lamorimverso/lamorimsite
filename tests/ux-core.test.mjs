import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';

const DT=1/120;
const seeded=seed=>()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);
const running=(options={})=>{const run=core.createRun(options);core.startRun(run);return run;};
function step(run,seconds,rng=()=>0){
 for(let i=0;i<Math.ceil(seconds/DT)&&run.status==='running';i++)core.advanceRun(run,DT,rng);
}
function isolatedBoss(type,width=900,distance=0,assisted=false,fired=0){
 const run=running({assisted});run.viewportWidth=width;run.distance=distance;
 run.nextRaid=Infinity;run.bossBag=[type];run.nextBossAt=0;
 core.advanceRun(run,DT,()=>0);run.boss.fired=fired;run.boss.nextAttack=0;
 core.advanceRun(run,DT,()=>0);run.boss.nextAttack=Infinity;
 return run;
}

// Removing the held intent used to discard a press made just before landing.
test('abaixar durante o salto guarda a intenção e aplica ao pousar',()=>{
 const run=running();assert.equal(core.jumpRun(run),true);step(run,.2);
 const height=run.player.y;
 assert.equal(core.crouchRun(run,true),false,'o comando não encolhe a colisão no ar');
 assert.equal(run.player.crouchHeld,true);
 assert.equal(run.player.y,height);
 step(run,.6);
 assert.equal(run.player.y,0);assert.equal(run.player.crouching,true);
 assert.equal(core.jumpRun(run),true,'saltar sai da postura mantida');
 assert.equal(run.player.crouchHeld,true);assert.equal(run.player.crouching,false);
 core.crouchRun(run,false);
 assert.equal(run.player.crouchHeld,false);assert.equal(run.player.crouching,false);
 assert.equal(core.jumpRun(run),false,'a mesma decolagem não permite salto duplo');
});

test('soltar ou cancelar no ar limpa a intenção antes do pouso',()=>{
 const run=running();core.jumpRun(run);step(run,.2);core.crouchRun(run,true);
 core.crouchRun(run,false);step(run,.6);
 assert.equal(run.player.crouchHeld,false);assert.equal(run.player.crouching,false);
 run.status='paused';core.crouchRun(run,false);
 assert.equal(run.player.crouchHeld,false);assert.equal(run.player.crouching,false);
});

// A constant-high pattern lets holding Down defeat the entire encounter.
test('padrão público mistura salto e abaixar usando as armas de cada chefão',()=>{
 assert.equal(typeof core.bossAttackFor,'function');
 for(const [type,actions] of [
  ['xandao',['jump','jump','crouch','jump']],
  ['haddad',['crouch','jump','jump','crouch']],
  ['lula',['jump','crouch','jump','jump']]
 ]){
  for(let fired=0;fired<4;fired++){
   const action=actions[fired],weapon=type==='xandao'?(action==='jump'?'hammer':'mandado'):type==='lula'?'lhand':'receipts';
   assert.deepEqual(core.bossAttackFor(type,fired),{type:weapon,action});
   const run=isolatedBoss(type,612,0,false,fired),attack=run.obstacles.at(-1);
   assert.equal(attack.type,weapon);assert.equal(attack.action,action);
   assert.equal(attack.targetY,action==='jump'?29:90);
  }
 }
});

test('o impacto registra a ação que teria evitado o perigo real',()=>{
 const common=running();common.obstacles=[{x:125,width:34,height:44,type:'pf'}];
 core.advanceRun(common,DT,()=>0);
 assert.deepEqual(common.lastHit,{type:'pf',action:'jump'});
 const high=isolatedBoss('lula',900,0,false,1);step(high,2);
 assert.equal(high.status,'over');assert.deepEqual(high.lastHit,{type:'lhand',action:'crouch'});
 const low=isolatedBoss('haddad',900,0,false,1);core.crouchRun(low,true);step(low,2);
 assert.equal(low.status,'over');assert.deepEqual(low.lastHit,{type:'receipts',action:'jump'});
});

function commonContact(width,distance,assisted=false){
 const run=running({assisted});run.viewportWidth=width;run.distance=distance;
 run.nextBossAt=run.nextRaid=Infinity;run.nextObstacle=0;
 core.advanceRun(run,DT,()=>0);run.nextObstacle=Infinity;
 let visible;
 for(let i=0;i<120*5&&run.status==='running';i++){
  core.advanceRun(run,DT,()=>0);
  if(visible===undefined&&run.obstacles[0]?.x<=width)visible=run.elapsed;
 }
 assert.equal(run.status,'over');assert.ok(visible!==undefined);
 return run.elapsed-visible;
}
function bossContact(width,distance,assisted=false){
 const run=isolatedBoss('xandao',width,distance,assisted),launch=run.elapsed;
 step(run,5);assert.equal(run.status,'over');return run.elapsed-launch;
}

test('primeira visibilidade de inimigos comuns dá a mesma janela em celular e desktop',()=>{
 for(const [distance,min,max] of [[0,1.62,1.68],[9000000,.92,.98]]){
  const times=[480,612,900].map(width=>commonContact(width,distance));
  assert.ok(times.every(t=>t>=min&&t<=max),`${distance}m: ${times}`);
  assert.ok(Math.max(...times)-Math.min(...times)<.026,`largura não altera a reação: ${times}`);
 }
});

test('lançamento de chefão dá 1,15 a .85 segundo até contato em qualquer largura',()=>{
 for(const [distance,min,max] of [[0,1.12,1.18],[9000000,.83,.88]]){
  const times=[480,612,900].map(width=>bossContact(width,distance));
  assert.ok(times.every(t=>t>=min&&t<=max),`${distance}m: ${times}`);
  assert.ok(Math.max(...times)-Math.min(...times)<.026,`largura não altera a reação: ${times}`);
 }
});

test('assistência alonga aproximação e deslocamento em 82% sem mudar o salto',()=>{
 const normal=running(),assisted=running({assisted:true});
 for(const run of [normal,assisted]){run.nextObstacle=run.nextBossAt=run.nextRaid=Infinity;core.jumpRun(run);}
 let normalPeak=0,assistedPeak=0;
 for(let i=0;i<120;i++){
  core.advanceRun(normal,DT,()=>0);core.advanceRun(assisted,DT,()=>0);
  normalPeak=Math.max(normalPeak,normal.player.y);assistedPeak=Math.max(assistedPeak,assisted.player.y);
 }
 assert.ok(assisted.distance/normal.distance>.817&&assisted.distance/normal.distance<.823);
 assert.equal(assistedPeak,normalPeak);assert.equal(assisted.player.y,normal.player.y);
 assert.ok(Math.abs(bossContact(612,0,true)/bossContact(612,0)-1/.82)<.025);
 assert.ok(Math.abs(commonContact(612,0,true)/commonContact(612,0)-1/.82)<.025);
});

test('coletas de ataque alto ficam ao alcance de abaixar e acompanham o perigo',()=>{
 for(const [type,fired,height] of [['lula',1,18],['haddad',0,18],['xandao',2,18],['xandao',0,100]]){
  const run=running();run.viewportWidth=612;run.nextRaid=Infinity;run.bossBag=[type];run.nextBossAt=0;
  core.advanceRun(run,DT,()=>0);run.boss.fired=fired;run.boss.nextAttack=0;
  run.nextPower=Infinity;run.nextPassport=0;core.advanceRun(run,DT,()=>0);
  const attack=run.obstacles.at(-1);run.boss.nextAttack=Infinity;
  assert.equal(run.pickups.length,3);
  assert.ok(run.pickups.every(p=>p.y===height));
  assert.ok(Number.isFinite(attack.speed)&&attack.speed>0);
  assert.ok(run.pickups.every(p=>p.speed===attack.speed));
  const gaps=run.pickups.map(p=>p.x-attack.x);run.viewportWidth=900;
  core.advanceRun(run,DT,()=>0);
  assert.ok(run.pickups.every((p,i)=>Math.abs(p.x-attack.x-gaps[i])<1e-9),'resize não separa recompensa e perigo já lançados');
 }
});

test('objetos manuais sem speed mantêm velocidade do mundo',()=>{
 const run=running();run.nextObstacle=run.nextBossAt=run.nextRaid=Infinity;
 run.obstacles=[{x:600,width:34,height:44,type:'pf'}];run.pickups=[{x:650,y:100,type:'passport'}];
 const distance=run.distance;core.advanceRun(run,DT,()=>0);
 const travel=run.distance-distance;
 assert.ok(Math.abs(run.obstacles[0].x-(600-travel))<1e-9);
 assert.ok(Math.abs(run.pickups[0].x-(650-travel))<1e-9);
});

// This pilot only reads the visible hazards and presses the actual controls.
// It never rewrites position, items, immunity, lives, deadlines, or obstacles.
export function legalPilot(seed,{width=900,assisted=false,limit=340,resize=false}={}){
 const run=running({assisted}),rng=seeded(seed);run.viewportWidth=width;
 let jumps=0,crouches=0,peak=0,shieldFrames=0,widthChanges=0;
 for(let i=0;i<120*limit&&run.status==='running'&&run.passports<100;i++){
  if(resize&&i>0&&i%(120*12)===0){const width=[480,900,612,900][(i/(120*12)-1)%4];if(width!==run.viewportWidth){core.resizeRun(run,width);widthChanges++;}}
  // O piloto considera o alerta de retaguarda antes de o inimigo entrar na tela.
  const eta=o=>o.approach==='rear'
    ?(core.PLAYER.x+5-(o.x+o.width-3))/-o.speed
    :(o.x-148)/(o.speed||1);
  const threats=run.obstacles.filter(o=>{
    const seconds=eta(o);
    if(o.approach==='rear')return o.speed<0&&seconds>-.15;
    return o.x<run.viewportWidth&&o.x+o.width-3>core.PLAYER.x+5&&seconds>-.15;
  });
  const danger=threats.sort((a,b)=>eta(a)-eta(b))[0];
  const speed=Math.abs(danger?.speed??core.difficultyAt(run.distance).speed*(assisted ? .82 : 1));
  const action=danger?.action??(danger?.projectile&&danger.targetY>50?'crouch':'jump');
  const until=danger?eta(danger):Infinity;
  const crouch=!!danger&&action==='crouch'&&until<.65;
  if(crouch&&!run.player.crouchHeld)crouches++;
  core.crouchRun(run,crouch);
  const jumpAhead=danger?.approach==='rear'?.34:(danger ? .35-(danger.width+20)/(2*speed) : 0);
  if(danger&&action==='jump'&&until<=jumpAhead&&until>-.1&&core.jumpRun(run))jumps++;
  core.advanceRun(run,DT,rng);peak=Math.max(peak,run.player.y);
  if(run.shieldFor>0)shieldFrames++;
 }
 return {run,jumps,crouches,peak,shieldFrames,widthChanges};
}

test('piloto legal coleta cem passaportes em 150–330 s sem imunidade ou teleporte artificial',()=>{
 for(const [seed,width,assisted] of [[7,480,false],[103,612,false],[8801,900,false],[7,612,true]]){
  const {run,jumps,crouches,peak,shieldFrames}=legalPilot(seed,{width,assisted});
  assert.equal(run.status,'running',`piloto ${seed}/${width}: ${JSON.stringify(run.lastHit)} aos ${run.elapsed}s`);
  assert.ok(run.passports>=100,`piloto ${seed}/${width}: ${run.passports} em ${run.elapsed}s`);
  assert.ok(run.elapsed>=150&&run.elapsed<=330,`${run.elapsed}s na sequência ${seed}/${width}`);
  assert.equal(run.lives,2);assert.equal(run.lastHit,null,'coletas naturais sem consumo de vida');
  assert.ok(jumps>20&&crouches>0,'usa as duas ações em encontros reais');
  assert.ok(peak>95&&peak<110,'respeita o alcance físico do salto');
  assert.ok(shieldFrames>0&&shieldFrames/run.elapsed/120<.3,'apenas escudos coletados e temporários');
  assert.ok(run.bossesDefeated>=3,'a economia inclui os chefões da rota');
 }
});

test('piloto legal continua coletando após rotações repetidas sem mudar física ou proteção',()=>{
 for(const assisted of [false,true])for(const seed of [7,103,8801]){
  const {run,widthChanges}=legalPilot(seed,{width:900,assisted,resize:true});
  assert.equal(run.status,'running',`${seed}/${assisted} perdeu por ${JSON.stringify(run.lastHit)}`);assert.equal(run.lastHit,null);assert.ok(run.passports>=100);assert.equal(run.lives,2);assert.ok(widthChanges>=10);
 }
});
