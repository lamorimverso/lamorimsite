// Mundo lógico fixo: física, sorteios e temporizadores independem da tela e do FPS.
export const WORLD = Object.freeze({width:900,height:300,ground:246});
export const PLAYER = Object.freeze({x:120,width:34,height:58});
export const SCENE_SECONDS = 20;
export const SCENE_DISTANCE = 7000; // 7 km efetivos por cenário; 35 km por volta
export const PASSPORTS_PER_LIFE = 100;
export const STARTING_LIVES = 1;
export const RECOVERY_AFTER_EXTRA = 1.2;
export const STAGES = Object.freeze([
 {id:'brasilia',name:'Brasília',short:'Brasília',sky:'#e5f2ff',ink:'#456b85',accent:'#52889c',ground:'#cbdcc1'},
 {id:'rio',name:'Rio de Janeiro',short:'Rio',sky:'#dff7fa',ink:'#287b82',accent:'#238e85',ground:'#e4d7a9'},
 {id:'argentina',name:'Argentina',short:'Argentina',sky:'#e8efff',ink:'#4b6e9f',accent:'#397ab7',ground:'#ccd9ea'},
 {id:'florida',name:'Flórida',short:'Flórida',sky:'#ffece0',ink:'#a86765',accent:'#bd7378',ground:'#e9cfac'},
 {id:'casa-branca',name:'Casa Branca',short:'Casa Branca',sky:'#e7eafa',ink:'#596d8c',accent:'#7777a9',ground:'#c9dcb9'}
].map((s,index)=>Object.freeze({...s,index})));
export const PURSUERS = Object.freeze([
 {type:'pf',name:'Polícia Federal',short:'PF',width:34,height:44,color:'#284c70'},
 {type:'janones',name:'Janones',short:'Janones',width:36,height:46,color:'#346a9c'},
 {type:'army',name:'Exército',short:'Exército',width:40,height:47,color:'#64734c'},
 {type:'boulos',name:'Boulos',short:'Boulos',width:38,height:46,color:'#765488'},
 {type:'dino',name:'Flávio Dino',short:'Dino',width:40,height:48,color:'#8a6247'},
 {type:'xandao',name:'Xandão',short:'Xandão',width:40,height:49,color:'#493f62'},
 {type:'haddad',name:'Haddad',short:'Haddad',width:40,height:48,color:'#286779'},
 {type:'lula',name:'Lula',short:'Lula',width:46,height:50,color:'#aa3c50'},
 {type:'barrier',name:'Barreira',short:'Barreira',width:44,height:32,color:'#c48845'},
 {type:'case',name:'Mala',short:'Mala',width:38,height:36,color:'#906490'}
].map((p,index)=>Object.freeze({...p,index})));
export const BOSS_ROSTER = Object.freeze(['haddad','lula','xandao']);
const BOSS_GOALS = Object.freeze({
 haddad:{attacks:5,goalKind:'papers',objective:'Desvie de 5 papéis.'},
 lula:{attacks:6,goalKind:'pairs',objective:'Complete 3 sequências de ataques altos e baixos.'},
 xandao:{attacks:8,goalKind:'hammer-mandado',objective:'Supere 4 martelos e 4 mandados.'}
});
export const PICKUPS = Object.freeze([
 Object.freeze({type:'passport',name:'Passaporte',value:10,purpose:'100 passaportes = +1 vida'}),
 Object.freeze({type:'shield',name:'Escudo das Américas',value:0,purpose:'Proteção por 6 segundos'})
]);
// O protagonista não possui armas; chefões atacam e o jogador só desvia.
// Texto de roteiro ficcional, sem atribuir gravações/falas autênticas à personagem.
export const RAID_FACTS = Object.freeze([
 {title:'Denúncia · 2020',text:'Em 2020, o MP-RJ apresentou denúncia contra Flávio no caso das rachadinhas.',source:'MP-RJ · 04/11/2020',url:'https://www.mprj.mp.br/web/guest/visualizar?noticiaId=96203'},
 {title:'Decisão · 2021',text:'Em 2021, o STF anulou quatro relatórios do Coaf usados no caso.',source:'STF · 30/11/2021',url:'https://portal.stf.jus.br/noticias/verNoticiaDetalhe.asp?idConteudo=477496'},
 {title:'Arquivo · 2020',text:'Fabrício Queiroz e outros 15 investigados também foram denunciados pelo MP-RJ.',source:'MP-RJ · 04/11/2020',url:'https://www.mprj.mp.br/web/guest/visualizar?noticiaId=96203'}
].map(Object.freeze));
const POOLS = [
 ['pf','barrier','janones'],['janones','barrier','pf'],
 ['pf','barrier','case'],['army','pf','case'],['pf','janones','army','case','barrier']
];
const random = rng => Math.max(0,Math.min(.999999999,Number(rng())||0));
const foeFor = type => PURSUERS.find(p=>p.type===type);
// Mantém stageAt em escala de 20 unidades por cenário, mas o percurso real
// é SCENE_DISTANCE metros. Assim o cenário exige 7 km de fuga, não 20 s fixos.
const routeClock = run => run.routeDistance / SCENE_DISTANCE * SCENE_SECONDS;
const visibleWidth = run => Math.max(480,Math.min(900,Number(run.viewportWidth)||WORLD.width));
const announce = (run,text) => {run.event=text;run.events++;};
const assistance = run => run.assisted ? .82 : 1;
// Primeiro contato horizontal usa o mesmo recuo de 3 px da colisão abaixo.
const contactX = PLAYER.x+PLAYER.width-6;
const approachSpeed = (run,distance,seconds) => Math.max(1,distance)/seconds*assistance(run);
const JUMP_BUFFER_SECONDS = .12;

export function difficultyAt(distance) {
 const d=Number.isFinite(distance)?Math.max(0,distance):0,p=d/(d+10000);
 return {level:1+Math.floor(d/8000),
  // Aceleração perceptível conforme a quilometragem, limitada para preservar o salto.
  speed:250+Math.min(185,36*Math.log2(1+d/4500)),
  obstacleGap:1.95-.6*p,
  pickupGap:12+8*p,passportGap:5.2+1.2*p,powerGap:24+32*p,
  bossApproach:1.35-.35*p,obstacleApproach:1.85-.75*p};
}
export function stageAt(seconds) {
 const s=Number.isFinite(seconds)?Math.max(0,seconds):0;
 return STAGES[Math.floor((s+1e-7)/SCENE_SECONDS)%STAGES.length];
}
export function stageTransitionAt(seconds) {
 const s=Number.isFinite(seconds)?Math.max(0,seconds):0,current=stageAt(s);
 const index=Math.round(s/SCENE_SECONDS),boundary=index*SCENE_SECONDS;
 if(index<1||Math.abs(s-boundary)>=2)return {from:current,to:current,progress:1,active:false};
 const linear=Math.max(0,Math.min(1,(s-boundary+2)/4));
 return {from:STAGES[(index-1)%5],to:STAGES[index%5],progress:linear*linear*(3-2*linear),active:true};
}
export function pursuitAt(seconds,rng=()=>.5) {
 const pool=POOLS[stageAt(seconds).index];return foeFor(pool[Math.floor(random(rng)*pool.length)]);
}
export function createRun({assisted=false}={}) {
 return {status:'ready',assisted:assisted===true,elapsed:0,distance:0,routeDistance:0,viewportWidth:WORLD.width,bonus:0,collected:0,passports:0,lives:1,
  event:'',events:0,player:{y:0,velocity:0,crouching:false,crouchHeld:false,jumpBufferedUntil:0},obstacles:[],pickups:[],lastHit:null,
  nextObstacle:1.5,nextPickup:0,nextPassport:4.8,nextPower:7,shieldFor:0,graceFor:0,
  lastPickup:null,spawnedObstacles:0,spawnedPickups:0,spawnedPowers:0,
  boss:null,bossBag:[],lastBoss:null,bossesDefeated:0,nextBossAt:null,bossCooldown:0,
  raid:null,nextRaid:null,raids:0,lastFact:-1};
}
export function startRun(run){if(run.status==='ready')run.status='running';}
export function jumpRun(run){
 if(run.status!=='running')return false;
 if(run.player.y>0||run.player.velocity>0){run.player.jumpBufferedUntil=run.elapsed+JUMP_BUFFER_SECONDS;return false;}
 run.player.jumpBufferedUntil=0;run.player.crouching=false;run.player.velocity=610;return true;
}
export function clearRunInput(run){
 run.player.crouchHeld=false;run.player.crouching=false;run.player.jumpBufferedUntil=0;
}
// A intenção permanece durante o salto, sem encolher a colisão no ar.
// Soltar/cancelar limpa também uma intenção ainda aguardando o pouso.
export function crouchRun(run,active){
 run.player.crouchHeld=!!active&&run.status==='running';
 const next=run.player.crouchHeld&&run.player.y===0&&run.player.velocity===0;
 run.player.crouching=next;
 return next;
}
// Interno ao motor/testes; não há comando de pausa na interface.
export function togglePause(run){if(run.status==='running')run.status='paused';else if(run.status==='paused')run.status='running';}
// O placar agora é a quilometragem percorrida em metros; coletas não alteram metros.
export function scoreFor(run){return Math.floor(run.distance);}
export function bossAtRound(round,type) {
 const safe=Math.max(0,Math.floor(Number.isFinite(round)?round:0)),level=Math.floor(safe/3)+1;
 const foe=foeFor(type||BOSS_ROSTER[safe%3]),supreme=foe.type==='lula';
 return {foe,level,supreme,round:safe+1,...BOSS_GOALS[foe.type],
  interval:Math.max(1.5,1.8-Math.min(level-1,4)*.05)};
}
// Fonte única para o aviso da interface, a arma e a altura do ataque real.
export function bossAttackFor(type,fired) {
 const even=Math.max(0,Math.floor(Number(fired)||0))%2===0;
 if(type==='xandao')return even?{type:'hammer',action:'jump'}:{type:'mandado',action:'crouch'};
 return {type:type==='lula'?'lhand':'receipts',action:even?'crouch':'jump'};
}
// Marcos fixos de rota: o primeiro fica após 21 km e fora da transição.
// Um marco alcançado permanece pendente enquanto houver evento ou cooldown.
function nextBossDistance(count){return 22000+count*7000;}
function takeBoss(run){
 // O bag explícito mantém a seleção determinística usada por integrações/testes.
 return run.bossBag.length?run.bossBag.pop():BOSS_ROSTER[run.bossesDefeated%BOSS_ROSTER.length];
}
function beginBoss(run){
 const conf=bossAtRound(run.bossesDefeated,takeBoss(run));
 run.boss={type:conf.foe.type,name:conf.foe.name,color:conf.foe.color,level:conf.level,supreme:conf.supreme,
  objective:conf.objective,goalKind:conf.goalKind,
  round:conf.round,total:conf.attacks,remaining:conf.attacks,fired:0,interval:conf.interval,nextAttack:1.3,
  hitFlashFor:0,attackFlashFor:0};
 run.obstacles=[];run.nextObstacle=Math.max(1.8,run.nextObstacle);
 announce(run,'CHEFÃO '+conf.foe.name+'! '+conf.objective);
}
function advanceBoss(run,dt,rng,balance){
 const boss=run.boss;if(!boss)return;
 boss.attackFlashFor=Math.max(0,boss.attackFlashFor-dt);
 boss.nextAttack-=dt;
 if(boss.fired>=boss.total||boss.nextAttack>0)return;
 // Cada chefão ataca com armas específicas; Flávio não dispara.
 const pattern=bossAttackFor(boss.type,boss.fired),attackType=pattern.type;
 const [width,height]=({hammer:[46,44],mandado:[42,44],
  lhand:[46,46],receipts:[44,40]})[attackType];
 const x=visibleWidth(run)-104;
 const attack={x,width,height,type:attackType,action:pattern.action,owner:boss.type,bossAttack:true,counted:false,
  speed:approachSpeed(run,x-contactX,balance.bossApproach),
  projectile:true,launchX:x+width/2,targetX:PLAYER.x+PLAYER.width/2,
  launchY:77,targetY:pattern.action==='jump'?PLAYER.height/2:70,y:77};
 run.obstacles.push(attack);
 boss.attackFlashFor=.26;boss.fired++;
 boss.nextAttack+=boss.interval+random(rng)*.22;
 return attack;
}
function resolveBossDodges(run){
 if(!run.boss)return;
 for(const o of run.obstacles)if(o.bossAttack&&!o.counted&&o.x+o.width<PLAYER.x){o.counted=true;run.boss.remaining--;}
 const boss=run.boss;if(boss.fired<boss.total||boss.remaining>0)return;
 run.lastBoss=boss.type;run.boss=null;run.bossesDefeated++;run.bossCooldown=4;
 run.nextBossAt=nextBossDistance(run.bossesDefeated);run.nextObstacle=Math.max(1.8,run.nextObstacle);
 announce(run,'Você escapou do chefão '+boss.name+'! '+(run.bossesDefeated%3===0?'Três chefões superados nesta sequência.':'Continue fugindo.'));
}
function advanceRaid(run,dt,rng){
 if(run.raid){
  const raid=run.raid;raid.remaining=Math.max(0,raid.remaining-dt);
  if(raid.remaining<=1e-8){
   if(raid.phase==='warning'){raid.phase='active';raid.remaining=8;announce(run,'Toc, toc, toc… é a Polícia Federal! Oito segundos de perseguição.');}
   else if(raid.phase==='active'){raid.phase='recovery';raid.remaining=2;announce(run,'A perseguição especial terminou. O ritmo normal está voltando.');}
   else{run.raid=null;run.nextRaid=28+random(rng)*20;}
  }return;
 }
 if(run.boss||run.bossCooldown>0||stageTransitionAt(routeClock(run)).active)return;
 run.nextRaid-=dt;
 if(run.nextRaid<=0&&run.nextBossAt-run.routeDistance>1500){
  const choices=RAID_FACTS.map((_,i)=>i).filter(i=>i!==run.lastFact);
  const factIndex=choices[Math.floor(random(rng)*choices.length)];run.lastFact=factIndex;
  run.raid={phase:'warning',remaining:1.2,factIndex,id:++run.raids};
  announce(run,'Joice apareceu. Atenção: vem aí uma perseguição especial da PF.');
 }
}
function rewardForObstacle(run,obstacle,balance,rng){
 if(!obstacle)return;let item,count=1;
 const has=type=>run.pickups.some(p=>p.type===type);
 if(run.nextPower<=0&&run.shieldFor<=0&&!has('shield')){
  item=PICKUPS[1];run.spawnedPowers++;run.nextPower=balance.powerGap+random(rng)*4;
 }else if(run.nextPassport<=0){item=PICKUPS[0];count=3;run.nextPassport=balance.passportGap+random(rng)*.7;}
 else return;
 run.spawnedPickups++;const center=obstacle.x+obstacle.width/2;
 for(let i=0;i<count;i++)run.pickups.push({x:center+(i-(count-1)/2)*35,
  y:obstacle.action==='crouch'?18:100,type:item.type,value:item.value,speed:obstacle.speed});
}
export function advanceRun(run,seconds,rng=Math.random){
 if(run.status!=='running'||!Number.isFinite(seconds)||seconds<=0)return;
 const dt=Math.min(seconds,.05);run.elapsed+=dt;
 if(run.nextBossAt===null)run.nextBossAt=nextBossDistance(0);
 if(run.nextRaid===null)run.nextRaid=18+random(rng)*12;
 const balance=difficultyAt(run.distance),travel=balance.speed*assistance(run)*dt;run.distance+=travel;
 run.routeDistance+=travel;
 run.bossCooldown=Math.max(0,run.bossCooldown-dt);
 // A tolerância só absorve erro de ponto flutuante no limite exato de 120ms.
 if(run.player.jumpBufferedUntil<run.elapsed-1e-8)run.player.jumpBufferedUntil=0;
 run.player.velocity-=1750*dt;run.player.y=Math.max(0,run.player.y+run.player.velocity*dt);
 if(run.player.y>0)run.player.crouching=false;
 if(run.player.y===0){
  run.player.velocity=0;run.player.crouching=!!run.player.crouchHeld;
  if(run.player.jumpBufferedUntil>0)jumpRun(run);
 }
 run.shieldFor=Math.max(0,run.shieldFor-dt);run.graceFor=Math.max(0,run.graceFor-dt);
 for(const obstacle of run.obstacles){
  obstacle.x-=Number.isFinite(obstacle.speed)?obstacle.speed*dt:travel;
  if(obstacle.projectile){
   const span=Math.max(1,obstacle.launchX-obstacle.targetX);
   const progress=Math.max(0,Math.min(1,(obstacle.launchX-(obstacle.x+obstacle.width/2))/span));
   obstacle.y=obstacle.launchY+(obstacle.targetY-obstacle.launchY)*progress;
  }
 }
 for(const pickup of run.pickups)pickup.x-=Number.isFinite(pickup.speed)?pickup.speed*dt:travel;
 resolveBossDodges(run);
 run.obstacles=run.obstacles.filter(o=>o.x+o.width>-20);run.pickups=run.pickups.filter(p=>p.x>-30);
 if(!run.boss&&!run.raid&&run.bossCooldown<=0&&run.routeDistance>=run.nextBossAt&&!stageTransitionAt(routeClock(run)).active)beginBoss(run);
 advanceRaid(run,dt,rng);
 let anchor;
 if(run.boss)anchor=advanceBoss(run,dt,rng,balance);
 else{
  run.nextObstacle-=dt;
  if(run.nextObstacle<=0){
   const opponent=run.raid?.phase==='active'?foeFor('pf'):pursuitAt(routeClock(run),rng);
   anchor={x:visibleWidth(run)+40,width:opponent.width,height:opponent.height,type:opponent.type,action:'jump',
    speed:approachSpeed(run,visibleWidth(run)-contactX,balance.obstacleApproach)};
   run.obstacles.push(anchor);run.spawnedObstacles++;
   const factor=run.raid?.phase==='active'?.78:run.raid?.phase==='recovery'?1-.22*run.raid.remaining/2:1;
   run.nextObstacle+=Math.max(1.15,balance.obstacleGap*factor)+random(rng)*.4;
  }
 }
 run.nextPickup-=dt;run.nextPassport-=dt;run.nextPower-=dt;rewardForObstacle(run,anchor,balance,rng);
 const left=PLAYER.x+5,right=PLAYER.x+PLAYER.width-3,bottom=run.player.y+3,
  top=run.player.y+(run.player.crouching?25:PLAYER.height-5);
 // Coleta antes do impacto: o escudo ou o centésimo passaporte já valem neste frame.
 run.pickups=run.pickups.filter(p=>{
  const hit=right>p.x-12&&left<p.x+12&&top>p.y-12&&bottom<p.y+12;
  if(hit){
   run.collected++;run.lastPickup=p.type;
   if(p.type==='shield'){run.shieldFor=6;announce(run,'Escudo das Américas! Proteção por 6 segundos.');}
   if(p.type==='passport'&&++run.passports%100===0){run.lives++;announce(run,'100 passaportes! Uma vida extra; total: '+run.lives+'.');}
  }return !hit;
 });
 const hit=run.shieldFor<=0&&run.graceFor<=0&&run.obstacles.find(o=>
  right>o.x+3&&left<o.x+o.width-3&&(
   o.projectile?(bottom<o.y+o.height/2&&top>o.y-o.height/2):(bottom<o.height&&top>0)
  ));
 if(hit){
  run.lastHit={type:hit.type,action:hit.action||(hit.projectile&&(hit.targetY??hit.y)>50?'crouch':'jump')};
  run.lives--;announce(run,run.lives>0?'Vida extra usada! Restam '+run.lives+'.':'Foi pego pela Polícia Federal! A fuga fictícia terminou.');
  if(run.lives<=0){run.status='over';return;}run.graceFor=RECOVERY_AFTER_EXTRA;
 }
}
