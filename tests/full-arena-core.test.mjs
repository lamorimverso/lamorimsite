import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
import {frames} from '../tanahoraflavio/runner-sprite-data.mjs';

const DT=1/120;
function isolated(width=900){
 const r=core.createRun();core.startRun(r);core.resizeRun(r,width);
 for(const k of ['nextBossAt','nextRaid','nextObstacle','nextAllyAt','nextSupportAt','nextPower','nextPassport','nextPickup'])r[k]=Infinity;
 return r;
}
function step(r,seconds){for(let i=0;i<Math.ceil(seconds/DT)&&r.status==='running';i++)core.advanceRun(r,DT,()=>.5);}
function transform(r){r.pickups=[{type:'ze-gotinha',x:r.player.x+17,y:20,speed:0}];core.advanceRun(r,DT,()=>.5);}

test('limites abrangem a arena útil inteira e mantêm cada pose dentro da tela',()=>{
 assert.equal(typeof core.playerBounds,'function');
 const scale=.95*94/Math.max(...frames.hero.slice(0,8).map(f=>f.height));
 for(const width of [480,612,900]){
  const r=isolated(width),bounds=core.playerBounds(r);
  assert.ok(bounds.max-bounds.min>width*.75);
  core.moveRun(r,-1);step(r,5);assert.equal(r.player.x,bounds.min);
  core.moveRun(r,1);step(r,5);assert.equal(r.player.x,bounds.max);
  for(const [i,f] of frames.hero.entries()){
   const s=i===10?Math.min(scale,48*.95/f.height):scale;
   assert.ok(bounds.min+17+(f.x-f.center)*s>=0);
   assert.ok(bounds.max+17+(f.x-f.center+f.width)*s<=width);
  }
 }
});

test('resize preserva proporção lateral e prazos em ambos os sentidos, incluindo retaguarda',()=>{
 const r=isolated(),beforeBounds=core.playerBounds(r);r.player.x=beforeBounds.min+.73*(beforeBounds.max-beforeBounds.min);
 r.obstacles=[{x:870,width:40,height:40,type:'barrier',speed:250},{x:100,width:40,height:40,type:'pf',approach:'rear',speed:-300}];
 const times=r.obstacles.map(o=>core.threatTimeToContact(r,o));
 for(const width of [480,612,900]){
  core.resizeRun(r,width);const bounds=core.playerBounds(r);
  assert.ok(Math.abs((r.player.x-bounds.min)/(bounds.max-bounds.min)-.73)<1e-9);
  for(const [i,o] of r.obstacles.entries())assert.ok(Math.abs(core.threatTimeToContact(r,o)-times[i])<1e-9);
 }
});

test('jacaré dura dez segundos lógicos e retorna automaticamente',()=>{
 const r=isolated();transform(r);r.shieldFor=Infinity;
 assert.equal(core.JACARE_DURATION_SECONDS,10);
 assert.ok(r.graceFor>=3&&r.nextObstacle>=3);
 for(let i=0;i<8;i++)assert.equal(core.jumpRun(r),false);
 step(r,9.9);
 assert.equal(r.player.isJacare,true);
 assert.ok(r.distance>100);
 step(r,.2);
 assert.equal(r.player.isJacare,false);
 assert.ok(r.player.restoreFlashFor>=0);
 assert.equal(core.jumpRun(r),true);
});

test('semente reproduz a aleatoriedade interna sem depender de Math.random',()=>{
 assert.equal(typeof core.createSeededRandom,'function');
 const a=core.createSeededRandom(7),b=core.createSeededRandom(7),c=core.createSeededRandom(8);
 const values=Array.from({length:100},a);assert.deepEqual(values,Array.from({length:100},b));assert.notDeepEqual(values,Array.from({length:100},c));assert.ok(values.every(v=>v>=0&&v<1));
 const runs=[core.createRun({seed:7}),core.createRun({seed:7})];
 for(const r of runs){core.startRun(r);r.shieldFor=Infinity;for(let i=0;i<2400;i++)core.advanceRun(r,DT);}
 assert.deepEqual(runs[0].obstacles,runs[1].obstacles);assert.equal(runs[0].spawnedObstacles,runs[1].spawnedObstacles);
});

test('bueiro compromete o alvo, avisa e permite saída com comandos em ambas as bordas',()=>{
 assert.equal(typeof core.spawnManholeThreat,'function');
 for(const width of [480,900])for(const edge of ['min','max']){
  const r=isolated(width),bounds=core.playerBounds(r);r.player.x=bounds[edge];
  const o=core.spawnManholeThreat(r,{rng:()=>.5});assert.ok(o?.groundHazard);assert.ok(o.warningFor>=1.2);assert.equal(o.type,'manhole');
  assert.equal(core.spawnManholeThreat(r),null,'uma única zona de impacto por vez');
  const target=o.x;step(r,.3);assert.equal(r.status,'running','aviso ainda não causa dano');
  core.moveRun(r,edge==='min'?1:-1);step(r,2.5);assert.equal(o.x,target);assert.equal(r.status,'running');assert.ok(!r.obstacles.includes(o));
  const waiting=isolated(width);waiting.player.x=bounds[edge];core.spawnManholeThreat(waiting,{rng:()=>.5});step(waiting,2);assert.equal(waiting.status,'over','acampar na borda não neutraliza o perigo');
 }
});

test('ampolas da Pfizer aparecem e são evitadas com deslocamento lateral',()=>{
 const r=isolated();transform(r);step(r,3.1);
 const o=r.obstacles.find(o=>o.falling&&o.owner==='pfizer');
 assert.ok(o,'a ampola deve aparecer após o respiro inicial');
 assert.equal(o.type,'pfizer-ampoule');
 assert.ok(o.warningFor>=1.2);
 core.moveRun(r,-1);step(r,1.9);
 assert.equal(r.status,'running','deslocamento lateral evita a ampola');
 const stationary=isolated();transform(stationary);step(stationary,5.2);
 assert.equal(stationary.status,'over','ficar imóvel permite colisão após o aviso');
});

test('chefões respeitam o contato real quando Flávio ocupa a extremidade direita',()=>{
 for(const type of core.BOSS_ROSTER)for(const width of [480,900]){
  const r=isolated(width);r.player.x=core.playerBounds(r).max;r.routeDistance=23000;r.bossBag=[type];r.nextBossAt=0;
  core.advanceRun(r,DT,()=>.5);r.boss.nextAttack=0;core.advanceRun(r,DT,()=>.5);
  const o=r.obstacles.at(-1);assert.ok(o.bossAttack);assert.ok(o.x>r.player.x+core.PLAYER.width,'arma não nasce na hitbox ou atrás do herói');
  assert.ok(core.threatTimeToContact(r,o)>=.84);step(r,2);assert.equal(r.status,'over','ameaça atravessa a borda ocupada');
 }
});

test('identidade de Simone distingue adesivo de fala e Haddad conserva nome com apelido Taxad',()=>{
 const simone=core.PURSUERS.find(p=>p.type==='simone'),haddad=core.PURSUERS.find(p=>p.type==='haddad');
 assert.equal(simone.name,'Simone Tebet');assert.equal(simone.meme,'Gostosas do Lula');assert.equal(simone.memeKind,'adesivo cenográfico; não fala autêntica');
 assert.equal(haddad.name,'Haddad');assert.equal(haddad.short,'Taxad');
});

test('retaguarda conserva travessia saltável perto da borda esquerda',()=>{
 const r=isolated(480);r.elapsed=80;r.distance=r.routeDistance=100000;r.nextObstacle=0;r.player.x=core.playerBounds(r).min;
 const values=[.9,.9,0,0,0];core.advanceRun(r,DT,()=>values.shift()??0);
 const o=r.obstacles.at(-1);assert.equal(o.approach,'rear');assert.ok(o.speed<=-180);assert.ok(o.waitFor>0);assert.ok(core.threatTimeToContact(r,o)>=1.05);
});

test('projétil aguardando disparo usa a posição real ao começar o voo',()=>{
 const r=isolated();r.player.x=755;
 const o={x:940,width:36,height:36,type:'falling-case',action:'jump',approach:'drop',speed:180,waitFor:1,projectile:true,launchX:958,targetX:772,launchY:160,targetY:24,y:160};r.obstacles=[o];
 core.moveRun(r,1);step(r,.15);core.moveRun(r,0);const launchTarget=r.player.x+17;step(r,.9);
 assert.equal(o.waitFor,0);assert.equal(o.targetX,launchTarget,'fila ainda sem movimento não aponta para uma posição antiga');
 const fixed=o.targetX;core.moveRun(r,-1);step(r,.1);assert.equal(o.targetX,fixed,'depois do lançamento a trajetória fica comprometida');
});

test('jacaré termina o minigame antes de iniciar outro encontro pendente',()=>{
 for(const kind of ['boss','raid']){
  const r=isolated();transform(r);r.routeDistance=23000;if(kind==='boss')r.nextBossAt=0;else r.nextRaid=0;
  r.shieldFor=Infinity;
  step(r,.2);assert.equal(r.boss,null);assert.equal(r.raid,null);
  step(r,9.7);assert.equal(r.player.isJacare,true,'encontro espera terminar os dez segundos');
  step(r,.2);
  assert.equal(r.player.isJacare,false,'restauração automática');
  assert.ok(kind==='boss'?r.boss:r.raid,'encontro pendente inicia após o relógio do jacaré');
 }
});

test('queda diagonal já alcança altura baixa ao primeiro contato na borda direita',()=>{
 const r=isolated(480);r.player.x=core.playerBounds(r).max;
 const x=r.player.x+28+60,o={x,width:44,height:40,type:'receipts',action:'jump',approach:'drop',projectile:true,speed:180,waitFor:0,launchX:x+22,targetX:r.player.x+17,launchY:155,targetY:22,y:155};
 r.obstacles=[o];core.jumpRun(r);step(r,.334);
 assert.ok(o.y<=o.targetY+.01,'altura anunciada deve valer no início físico da colisão');
});

test('espera adicional do resize não mira novamente um projétil já lançado',()=>{
 const r=isolated();r.player.x=230;
 const o={x:400,width:44,height:40,type:'receipts',action:'jump',approach:'drop',projectile:true,speed:220,waitFor:0,launchX:500,targetX:247,launchY:155,targetY:22,y:110};r.obstacles=[o];
 core.advanceRun(r,DT,()=>.5);core.moveRun(r,1);step(r,.1);core.moveRun(r,0);core.resizeRun(r,480);
 assert.ok(o.waitFor>0);const target=o.targetX;step(r,.5);assert.equal(o.targetX,target,'reação preservada pelo resize não altera trajetória comprometida');
});

// Apenas comandos públicos durante o percurso. Não injeta proteção, teleporte,
// vidas, coletas nem muda o estado dos perigos para forçar uma aprovação.
function pilot(r){
 const local=r.obstacles.find(o=>(o.falling||o.groundHazard)&&o.age<o.warningFor+(o.fallFor??o.activeFor));
 let evade=0;
 if(local){
  const bounds=core.playerBounds(r),toLeft=local.x-12-(r.player.x+31),toRight=local.x+local.width+12-(r.player.x+5);
  const leftPossible=r.player.x+toLeft>=bounds.min,rightPossible=r.player.x+toRight<=bounds.max;
  if(!(r.player.x+31<local.x-10||r.player.x+5>local.x+local.width+10))evade=leftPossible&&(!rightPossible||Math.abs(toLeft)<Math.abs(toRight))?-1:1;
 }
 if(r.player.isJacare)core.jumpRun(r);
 const danger=r.obstacles.filter(o=>!o.falling&&!o.groundHazard&&!o.passed&&!o.counted&&
  (o.approach==='rear'?o.x<r.player.x+31:o.x+o.width-3>r.player.x+5))
  .sort((a,b)=>core.threatTimeToContact(r,a)-core.threatTimeToContact(r,b))[0];
 const until=danger?core.threatTimeToContact(r,danger):Infinity,speed=Math.abs(danger?.speed||270);
 // O aviso local é agendado após o ataque em voo: primeiro concluir sua
 // evasão, depois usar os .82s reservados para sair do ponto de impacto.
 const localEta=local?core.threatTimeToContact(r,local):Infinity;
 core.moveRun(r,local&&r.player.y===0&&(!danger||until>localEta+.2)?evade:0);
 core.crouchRun(r,danger?.action==='crouch'&&until<.65);
 const jumpAhead=danger?.approach==='rear'?.22:.35-((danger?.width||40)+20)/(2*speed);
 if(danger?.action==='jump'&&until<=jumpAhead&&until>-.1)core.jumpRun(r);
}

test('2.000 sequências com sementes e entradas reais mantêm rotas vencíveis pela arena',()=>{
 const signatures=new Set(),styles=new Set();let waves=0;
 for(let seed=1;seed<=2000;seed++){
  const width=[480,612,900][seed%3],r=isolated(width),rng=core.createSeededRandom(seed);
  r.elapsed=40;r.distance=r.routeDistance=(seed%8)*35000;r.nextObstacle=0;
  const bounds=core.playerBounds(r);r.player.x=[bounds.min,(bounds.min+bounds.max)/2,bounds.max][Math.floor(seed/3)%3];
  let count=0;const sequence=[];
  for(let i=0;i<24*60&&r.status==='running';i++){
   if(seed%5===0&&i===12*60)core.resizeRun(r,[612,900,480][seed%3]);
   pilot(r);core.advanceRun(r,1/60,rng);
   if(r.spawnedObstacles>count){
    count=r.spawnedObstacles;waves++;const o=r.obstacles.at(-1);styles.add(o.approach||'overhead');sequence.push(o.type+'/'+o.approach);
    assert.ok(!o.falling&&!o.groundHazard||o.age<o.warningFor,'zona nasce como aviso sem hitbox ativa');
    if(!o.falling&&!o.groundHazard&&!(o.cast&&!o.launched&&o.waitFor>=.45))assert.ok(o.approach==='rear'?o.x+o.width<r.player.x+5:o.x>r.player.x+28,'projétil não nasce em contato');
    assert.ok(r.obstacles.filter(o=>!o.passed&&!o.counted).length<=5);
   }
  }
  assert.equal(r.status,'running',`semente ${seed}/${width}, x=${r.player.x}: ${JSON.stringify(r.lastHit)} em ${r.elapsed}`);
  signatures.add(sequence.join('|'));
 }
 assert.ok(waves>15000);assert.ok(signatures.size>1900,'combinações não formam ciclo memorizável');
 for(const style of ['front','rear','drop','rolling','ground','overhead'])assert.ok(styles.has(style),style);
});

test('cinco chefes são vencíveis nos extremos e no centro com sementes e comandos reais',()=>{
 for(const [bossIndex,type] of core.BOSS_ROSTER.entries())for(const width of [480,612,900])for(const edge of ['min','center','max'])for(let seed=1;seed<=8;seed++){
  const r=isolated(width),rng=core.createSeededRandom(seed),bounds=core.playerBounds(r);
  r.player.x=edge==='center'?(bounds.min+bounds.max)/2:bounds[edge];r.distance=r.routeDistance=23000;r.bossBag=[type];r.bossesDefeated=bossIndex;r.nextBossAt=0;r.elapsed=40;
  for(let i=0;i<40*120&&r.status==='running'&&r.bossesDefeated===bossIndex;i++){pilot(r);core.advanceRun(r,DT,rng);}
  assert.equal(r.status,'running',`${type}/${width}/${edge}/${seed}: ${JSON.stringify(r.lastHit)}`);
  assert.equal(r.bossesDefeated,bossIndex+1,`${type}/${width}/${edge}/${seed}: encontro precisa terminar`);
 }
});
