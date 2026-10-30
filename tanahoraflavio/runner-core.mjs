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
 {type:'dilma',name:'Dilma Rousseff',short:'Dilma',width:36,height:46,color:'#b74250'},
 {type:'simone',name:'Simone Tebet',short:'Simone',width:36,height:46,color:'#586fa2'},
 {type:'soraya',name:'Soraya Thronicke',short:'Soraya',width:38,height:46,color:'#866548'},
 {type:'barrier',name:'Barreira',short:'Barreira',width:44,height:32,color:'#c48845'},
 {type:'case',name:'Mala',short:'Mala',width:38,height:36,color:'#906490'}
].map((p,index)=>Object.freeze({...p,index})));
export const BOSS_ROSTER = Object.freeze(['haddad','lula','xandao']);
const BOSS_GOALS = Object.freeze({
 haddad:{attacks:9,goalKind:'papers'},
 lula:{attacks:10,goalKind:'patterns'},
 xandao:{attacks:12,goalKind:'hammer-mandado'}
});
export const PICKUPS = Object.freeze([
 Object.freeze({type:'passport',name:'Passaporte',value:10,purpose:'100 passaportes = +1 vida'}),
 Object.freeze({type:'shield',name:'Escudo das Américas',value:0,purpose:'Proteção por 6 segundos'}),
 Object.freeze({type:'ze-gotinha',name:'Zé Gotinha',value:0,purpose:'Transforma Flávio em jacaré fictício até pressionar ↑; limpa perigos comuns por 2,5 segundos'})
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
const REACTION_GAP = .82;
// A retaguarda se aproxima pela esquerda; outras ameaças continuam pela direita.
const rearContact = PLAYER.x+5;
const JUMP_BUFFER_SECONDS = .12;
const JACARE_ENTRY_GRACE = .9;
const JACARE_RESTORE_GRACE = .55;
const JACARE_RESTORE_FLASH = .48;

export function difficultyAt(distance,elapsed=0) {
 const d=Number.isFinite(distance)?Math.max(0,distance):0,t=Number.isFinite(elapsed)?Math.max(0,elapsed):0;
 // Pressão cresce por várias voltas em vez de saturar na primeira.
 // O tempo e a distância continuam contínuos ao atravessar os cenários.
 const pressure=1-Math.exp(-(d/62000+t/500)),p=d/(d+10000);
 return {level:1+Math.floor(9*pressure),pressure,
  speed:270+165*pressure,obstacleGap:Math.max(1.12,1.70-.58*pressure),
  pickupGap:12+8*p,passportGap:5.2+1.2*p,powerGap:24+32*p,
  bossApproach:Math.max(.85,1.15-.30*pressure),obstacleApproach:Math.max(.95,1.65-.70*pressure)};
}
// Uma onda mais rápida nunca alcança a anterior e forma um par impossível.
function threatSpeed(run,x,seconds,visibleX=x){
 const pending=run.obstacles.filter(o=>o.x>contactX&&o.speed>0)
  .map(o=>(o.x-contactX)/o.speed);
 const rear=run.obstacles.filter(o=>o.approach==='rear'&&o.speed<0)
  .map(o=>(rearContact-(o.x+o.width-3))/-o.speed)
  .filter(t=>t>0);
 const speed=Math.max(1,visibleX-contactX)/seconds*assistance(run);
 const nextContact=Math.max((x-contactX)/speed,...pending.concat(rear).map(t=>t+REACTION_GAP));
 return Math.max(1,x-contactX)/nextContact;
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
// Retaguarda usa a mesma janela de leitura, sem disputar o contato com um perigo frontal.
function rearSpeed(run,x,width){
 const front=run.obstacles.filter(o=>o.x>contactX&&o.speed>0).map(o=>(o.x-contactX)/o.speed);
 const rear=run.obstacles.filter(o=>o.approach==='rear'&&o.speed<0).map(o=>(rearContact-(o.x+o.width-3))/-o.speed);
 const seconds=Math.max(run.assisted?1.22:1.06,...front.concat(rear).filter(t=>t>0).map(t=>t+REACTION_GAP));
 return -(rearContact-(x+width-3))/seconds;
}
export function createRun({assisted=false}={}) {
 return {status:'ready',assisted:assisted===true,elapsed:0,distance:0,routeDistance:0,viewportWidth:WORLD.width,bonus:0,collected:0,passports:0,lives:1,
  event:'',events:0,player:{y:0,velocity:0,crouching:false,crouchHeld:false,isJacare:false,jacareAge:0,restoreFlashFor:0,jumpBufferedUntil:0},obstacles:[],pickups:[],lastHit:null,
  nextObstacle:1.5,nextPickup:0,nextPassport:4.8,nextPower:7,shieldFor:0,graceFor:0,
  lastPickup:null,spawnedObstacles:0,spawnedPickups:0,spawnedPowers:0,
  boss:null,bossBag:[],lastBoss:null,bossesDefeated:0,nextBossAt:null,bossCooldown:0,
  raid:null,nextRaid:null,raids:0,lastFact:-1,cameo:null,overheadCount:0,lastOverheadActor:null,lastAction:null,actionStreak:0,attackStyles:[],nextAllyAt:14000,alliesMet:0};
}
// Reenquadra ondas ainda à frente, preservando prazo de contato e trajetória.
// Perigos cujo contato já começou ficam onde estão: nunca reaparecem no caminho.
export function resizeRun(run,width){
 const previous=visibleWidth(run);run.viewportWidth=Math.max(480,Math.min(900,Number(width)||WORLD.width));
 const ratio=(visibleWidth(run)-contactX)/(previous-contactX);if(ratio===1)return;
 const moved=new Map(),project=x=>contactX+(x-contactX)*ratio;
 for(const o of run.obstacles){
  if(!Number.isFinite(o.speed)||o.speed<=0||o.x<=contactX)continue;
  const oldX=o.x;o.x=project(o.x);o.speed*=ratio;moved.set(o,{delta:o.x-oldX,speed:o.speed});
  if(o.projectile){
   // Coordenadas centrais seguem o mesmo referencial da borda de contato.
   // Isso mantém exatamente a fração percorrida, sem salto vertical da arma.
   const center=o.width/2;
   if(Number.isFinite(o.launchX))o.launchX=project(o.launchX-center)+center;
   if(Number.isFinite(o.targetX))o.targetX=project(o.targetX-center)+center;
  }
 }
 for(const p of run.pickups){
  const source=moved.get(p.anchor);if(!source)continue;
  p.x+=source.delta;p.speed=source.speed;
 }
}
export function startRun(run){if(run.status==='ready')run.status='running';}
export function jumpRun(run){
 if(run.status!=='running')return false;
 // Antídoto exclusivamente cartunesco: o primeiro ↑ restaura o herói,
 // sem conceder um salto gratuito que possa contornar um ataque.
 if(run.player.isJacare){
  run.player.isJacare=false;run.player.jacareAge=0;
  run.player.restoreFlashFor=JACARE_RESTORE_FLASH;
  run.graceFor=Math.max(run.graceFor,JACARE_RESTORE_GRACE);
  run.player.jumpBufferedUntil=0;run.player.crouchHeld=false;run.player.crouching=false;
  announce(run,'Antídoto fictício de videogame: voltou a Flávio! Próximo ↑ pula. Vacinas não transformam pessoas em jacarés; cloroquina não reverte vacinas.');
  return false;
 }
 if(run.player.y>0||run.player.velocity>0){run.player.jumpBufferedUntil=run.elapsed+JUMP_BUFFER_SECONDS;return false;}
 run.player.jumpBufferedUntil=0;run.player.crouching=false;run.player.velocity=610;return true;
}
export function clearRunInput(run){
 run.player.crouchHeld=false;run.player.crouching=false;run.player.jumpBufferedUntil=0;
}
// A intenção permanece durante o salto, sem encolher a colisão no ar.
// Soltar/cancelar limpa também uma intenção ainda aguardando o pouso.
export function crouchRun(run,active){
 run.player.crouchHeld=!!active&&run.status==='running'&&!run.player.isJacare;
 const next=!run.player.isJacare&&run.player.crouchHeld&&run.player.y===0&&run.player.velocity===0;
 run.player.crouching=next;
 return next;
}
// Interno ao motor/testes; não há comando de pausa na interface.
export function togglePause(run){if(run.status==='running')run.status='paused';else if(run.status==='paused')run.status='running';}
// O placar agora é a quilometragem percorrida em metros; coletas não alteram metros.
export function scoreFor(run){return Math.floor(run.distance);}
export function bossAtRound(round,type) {
 const safe=Math.max(0,Math.floor(Number.isFinite(round)?round:0)),level=Math.floor(safe/3)+1;
 const foe=foeFor(type||BOSS_ROSTER[safe%3]),goal=BOSS_GOALS[foe.type],attacks=goal.attacks+2*Math.min(2,level-1);
 const noun=foe.type==='haddad'?'papéis':foe.type==='lula'?'gestos em L':'martelos e mandados';
 return {foe,level,supreme:foe.type==='lula',round:safe+1,goalKind:goal.goalKind,attacks,
  objective:'Desvie de '+attacks+' '+noun+'.',
  interval:Math.max(1.04,1.32-.08*BOSS_ROSTER.indexOf(foe.type)-.04*(level-1))};
}
// Padrões próprios incluem repetições; o aviso sempre consulta esta mesma fonte.
export function bossAttackFor(type,fired,round=0) {
 const patterns={haddad:['crouch','jump','jump','crouch','crouch','jump','crouch','jump','jump'],
  lula:['jump','crouch','jump','jump','crouch','crouch','jump','crouch','jump','crouch'],
  xandao:['jump','jump','crouch','jump','crouch','crouch','jump','crouch','jump','crouch','crouch','jump']};
 const sequence=patterns[type]||patterns.haddad,index=Math.max(0,Math.floor(Number(fired)||0))+2*Math.floor(Math.max(0,round)/3);
 const action=sequence[index%sequence.length];
 return {type:type==='xandao'?(action==='jump'?'hammer':'mandado'):type==='lula'?'lhand':'receipts',action};
}
// Primeiro marco após21km; cada vitória reserva mais7km de corrida.
// Um marco alcançado fica pendente enquanto houver evento ou cooldown.
function nextBossDistance(count){return 22000+count*7000;}
function takeBoss(run){
 // O bag explícito mantém a seleção determinística usada por integrações/testes.
 return run.bossBag.length?run.bossBag.pop():BOSS_ROSTER[run.bossesDefeated%BOSS_ROSTER.length];
}
function beginBoss(run){
 const conf=bossAtRound(run.bossesDefeated,takeBoss(run));
 run.boss={type:conf.foe.type,name:conf.foe.name,color:conf.foe.color,level:conf.level,supreme:conf.supreme,
  objective:conf.objective,goalKind:conf.goalKind,
  round:conf.round,total:conf.attacks,remaining:conf.attacks,fired:0,interval:conf.interval,nextAttack:1.1,
  hitFlashFor:0,attackFlashFor:0,lastAction:null,actionStreak:0,
  plannedFor:0,plannedAttack:{...bossAttackFor(conf.foe.type,0,conf.round-1),approach:'diagonal'}};
 run.obstacles=[];run.nextObstacle=Math.max(1.8,run.nextObstacle);
 announce(run,'CHEFÃO '+conf.foe.name+'! '+conf.objective);
}
function chooseBossPattern(boss,rng,pressure){
 // A abertura ensina o tipo de ameaça; depois o próprio chefe improvisa.
 if(boss.fired<3)return {...bossAttackFor(boss.type,boss.fired,boss.round-1),approach:'diagonal'};
 let action=random(rng)<(.48+.06*pressure)?'crouch':'jump';
 if(action===boss.lastAction&&boss.actionStreak>=2)action=action==='jump'?'crouch':'jump';
 const type=boss.type==='xandao'?(action==='jump'?'hammer':'mandado'):
  boss.type==='lula'?'lhand':(action==='jump'&&random(rng)<.48?'stamp':'receipts');
 const approach=action==='jump'&&random(rng)<.48?'drop':action==='crouch'&&random(rng)<.45?'sweep':'diagonal';
 return {type,action,approach};
}
function advanceBoss(run,dt,rng,balance){
 const boss=run.boss;if(!boss)return;
 boss.attackFlashFor=Math.max(0,boss.attackFlashFor-dt);
 boss.nextAttack-=dt;
 if(boss.fired>=boss.total||boss.nextAttack>0)return;
 // Cada chefão ataca com armas específicas; Flávio não dispara.
 const pattern=boss.plannedFor===boss.fired?boss.plannedAttack:bossAttackFor(boss.type,boss.fired,boss.round-1);
 const attackType=pattern.type;
 const [width,baseHeight]=({hammer:[46,44],mandado:[42,44],
  lhand:[46,46],receipts:[44,40],stamp:[44,36]})[attackType];
 const height=pattern.action==='crouch'?84:baseHeight;
 const x=visibleWidth(run)-104;
 const entry=pattern.approach||'diagonal';
 const fromY=entry==='drop'?155:pattern.action==='jump'?77:90;
 const toY=pattern.action==='jump'?(entry==='drop'?22:PLAYER.height/2):90;
 const attack={x,width,height,type:attackType,action:pattern.action,owner:boss.type,bossAttack:true,counted:false,
  approach:entry,speed:threatSpeed(run,x,balance.bossApproach),
  projectile:true,launchX:x+width/2,targetX:PLAYER.x+PLAYER.width/2,
  launchY:fromY,targetY:toY,y:fromY};
 run.obstacles.push(attack);
 boss.attackFlashFor=.26;boss.fired++;
 boss.actionStreak=pattern.action===boss.lastAction?(boss.actionStreak||0)+1:1;
 boss.lastAction=pattern.action;
 boss.plannedFor=boss.fired;
 boss.plannedAttack=chooseBossPattern(boss,rng,balance.pressure);
 boss.nextAttack+=boss.interval+random(rng)*.22;
 return attack;
}
function resolveBossDodges(run){
 if(!run.boss)return;
 for(const o of run.obstacles)if(o.bossAttack&&!o.counted&&o.x+o.width<PLAYER.x){o.counted=true;run.boss.remaining--;}
 const boss=run.boss;if(boss.fired<boss.total||boss.remaining>0)return;
 run.lastBoss=boss.type;run.boss=null;run.bossesDefeated++;run.bossCooldown=4;
 run.nextBossAt=Math.max(nextBossDistance(run.bossesDefeated),run.routeDistance+7000);run.nextObstacle=Math.max(1.8,run.nextObstacle);
 announce(run,'Você escapou do chefão '+boss.name+'! '+(run.bossesDefeated%3===0?'Três chefões superados nesta sequência.':'Continue fugindo.'));
}
function advanceRaid(run,dt,rng){
 if(run.raid){
  const raid=run.raid;raid.remaining=Math.max(0,raid.remaining-dt);
  if(raid.remaining<=1e-8){
   if(raid.phase==='warning'){raid.phase='active';raid.remaining=10;announce(run,'Toc, toc, toc… é a Polícia Federal! Pule a PF e abaixe dos microfones por dez segundos.');}
   else if(raid.phase==='active'){raid.phase='recovery';raid.remaining=2;announce(run,'A perseguição especial terminou. O ritmo normal está voltando.');}
   else{run.raid=null;run.nextRaid=26+random(rng)*10;run.bossCooldown=Math.max(2.5,run.bossCooldown);}
  }return;
 }
 run.nextRaid-=dt;
 if(run.boss||run.bossCooldown>0||stageTransitionAt(routeClock(run)).active)return;
 if(run.nextRaid<=0){
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
  y:obstacle.action==='crouch'?18:100,type:item.type,value:item.value,speed:obstacle.speed,anchor:obstacle});
}
export function advanceRun(run,seconds,rng=Math.random){
 if(run.status!=='running'||!Number.isFinite(seconds)||seconds<=0)return;
 const dt=Math.min(seconds,.05);run.elapsed+=dt;
 if(run.player.isJacare)run.player.jacareAge+=dt;
 run.player.restoreFlashFor=Math.max(0,run.player.restoreFlashFor-dt);
 if(run.nextBossAt===null)run.nextBossAt=nextBossDistance(0);
 if(run.nextRaid===null)run.nextRaid=18+random(rng)*12;
 const balance=difficultyAt(run.distance,run.elapsed),travel=balance.speed*assistance(run)*dt;run.distance+=travel;
 run.routeDistance+=travel;
 run.bossCooldown=Math.max(0,run.bossCooldown-dt);
 if(run.cameo){run.cameo.remaining-=dt;if(run.cameo.remaining<=0)run.cameo=null;}
 // A tolerância só absorve erro de ponto flutuante no limite exato de 120ms.
 if(run.player.jumpBufferedUntil<run.elapsed-1e-8)run.player.jumpBufferedUntil=0;
 run.player.velocity-=1750*dt;run.player.y=Math.max(0,run.player.y+run.player.velocity*dt);
 if(run.player.y>0)run.player.crouching=false;
 if(run.player.y===0){
  run.player.velocity=0;run.player.crouching=!run.player.isJacare&&!!run.player.crouchHeld;
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
 run.obstacles=run.obstacles.filter(o=>o.approach==='rear'?o.x<PLAYER.x+PLAYER.width+80:o.x+o.width>-20);
 run.pickups=run.pickups.filter(p=>p.x>-30);
 // Uma Joice já vencida tem prioridade sobre o próximo marco de chefe.
 advanceRaid(run,dt,rng);
 if(!run.boss&&!run.raid&&run.bossCooldown<=0&&run.routeDistance>=run.nextBossAt&&!stageTransitionAt(routeClock(run)).active)beginBoss(run);
 let anchor;
 if(run.boss)anchor=advanceBoss(run,dt,rng,balance);
 else{
  run.nextObstacle-=dt;
  if(run.nextObstacle<=0){
   const raidActive=run.raid?.phase==='active';
   // O sorteio é contextual, mas não impõe um ciclo previsível de ações.
   // O limite de três perigos iguais evita ensinar uma estratégia automática.
   const previous=run.lastAction;
   const inverted=previous==='jump'?'crouch':'jump';
   let action=run.elapsed<10?'jump':random(rng)<(raidActive ? .49 : .40+.08*balance.pressure)?'crouch':'jump';
   if(run.elapsed>=10&&previous===action&&run.actionStreak>=3)action=inverted;
   else if(run.elapsed>=10&&previous===action&&run.actionStreak>=2&&balance.pressure>.52&&random(rng)<.38)action=inverted;
   run.actionStreak=action===run.lastAction?run.actionStreak+1:1;run.lastAction=action;
   const x=visibleWidth(run)+40,approach=raidActive?Math.max(.85,balance.obstacleApproach-.15):balance.obstacleApproach;
   // A partir da segunda etapa, baixos podem rolar, cair de cima ou avançar pela retaguarda.
   // Cada estilo compete por um único intervalo: jamais surgem dois contatos simultâneos.
   if(action==='crouch'){
    const performers=['dilma','simone','soraya'];
    const available=performers.filter(actor=>actor!==run.lastOverheadActor);
    const type=raidActive?'joice':available[Math.floor(random(rng)*available.length)];
    if(!raidActive){run.lastOverheadActor=type;run.overheadCount++;}
    const attackType={dilma:'wind',simone:'paper-gate',soraya:'microphone',joice:'microphone'}[type];
    anchor={x,width:46,height:72,type:attackType,action,sourceActor:type,projectile:true,
     launchX:x+23,targetX:PLAYER.x+17,launchY:84,targetY:84,y:84,speed:threatSpeed(run,x,approach,visibleWidth(run))};
    if(!raidActive)run.cameo={type,remaining:1.4};
   }else{
    const foe=raidActive?foeFor('pf'):pursuitAt(routeClock(run),rng);
    const roll=random(rng);
    const activeStyles=run.elapsed>=12&&!raidActive;
    const rear=activeStyles&&balance.pressure>.24&&roll<.18;
    const falling=activeStyles&&balance.pressure>.12&&roll>=.18&&roll<.42;
    const rolling=activeStyles&&roll>=.42&&roll<.62;
    const popcorn=activeStyles&&roll>=.62&&roll<.76;
    if(rear){
     // O aviso de retaguarda surge antes da entrada física do perseguidor.
     // A velocidade precisa atravessar toda a hitbox durante a janela de salto.
     const start=-125,width=foe.width;
     anchor={x:start,width,height:foe.height,type:foe.type,action:'jump',
      approach:'rear',speed:rearSpeed(run,start,width)};
    }else if(falling){
     anchor={x,width:36,height:36,type:'falling-case',action:'jump',approach:'drop',
      speed:threatSpeed(run,x,approach,visibleWidth(run)),projectile:true,
      launchX:x+18,targetX:PLAYER.x+17,launchY:160,targetY:24,y:160};
    }else{
     const type=rolling?'rolling-case':popcorn?'popcorn':foe.type;
     anchor={x,width:rolling?40:popcorn?40:foe.width,
      height:rolling?30:popcorn?35:foe.height,type,action,
      approach:rolling?'rolling':'front',speed:threatSpeed(run,x,approach,visibleWidth(run))};
    }
   }
   run.obstacles.push(anchor);run.spawnedObstacles++;
   run.attackStyles.push(anchor.approach||'overhead');
   if(run.attackStyles.length>16)run.attackStyles.shift();
   const gap=raidActive ? .98-.08*balance.pressure:run.raid?.phase==='recovery'?
    (.98-.08*balance.pressure)+(balance.obstacleGap-.98+.08*balance.pressure)*(1-run.raid.remaining/2):balance.obstacleGap;
   // Microvariação de intervalo aumenta a incerteza sem criar colisões inevitáveis.
   // A aproximação de cada perigo ainda passa pelo limitador de 0,82 s.
   run.nextObstacle+=gap+(raidActive?random(rng)*.04:random(rng)*(.16+.06*(1-balance.pressure)));
  }
 }
 if(!run.boss&&!run.raid&&run.routeDistance>=run.nextAllyAt){
  run.pickups.push({type:'ze-gotinha',x:visibleWidth(run)+40,y:20,speed:balance.speed*assistance(run),value:0});
  run.nextAllyAt+=35000;run.alliesMet++;
 }
 run.nextPickup-=dt;run.nextPassport-=dt;run.nextPower-=dt;
 if(anchor?.approach!=='rear')rewardForObstacle(run,anchor,balance,rng);
 const left=PLAYER.x+5,right=PLAYER.x+PLAYER.width-3,bottom=run.player.y+3,
  top=run.player.y+(run.player.crouching||run.player.isJacare?25:PLAYER.height-5);
 // Coleta antes do impacto: o escudo ou o centésimo passaporte já valem neste frame.
 run.pickups=run.pickups.filter(p=>{
  const hit=right>p.x-12&&left<p.x+12&&top>p.y-12&&bottom<p.y+12;
  if(hit){
   run.collected++;run.lastPickup=p.type;
   if(p.type==='ze-gotinha'){
    run.obstacles=run.obstacles.filter(o=>o.bossAttack);
    run.nextObstacle=Math.max(2.5,run.nextObstacle);
    run.graceFor=Math.max(run.graceFor,JACARE_ENTRY_GRACE);
    run.player.isJacare=true;run.player.jacareAge=0;run.player.restoreFlashFor=0;
    run.player.crouching=false;run.player.crouchHeld=false;run.player.jumpBufferedUntil=0;
    announce(run,'Zé Gotinha: transformação fictícia em jacaré! Não pode saltar. Pressione ↑ uma vez para voltar à forma humana; ↑ novamente para pular. Vacinas não causam isso.');
   }
   if(p.type==='shield'){run.shieldFor=6;announce(run,'Escudo das Américas! Proteção por 6 segundos.');}
   if(p.type==='passport'&&++run.passports%100===0){run.lives++;announce(run,'100 passaportes! Uma vida extra; total: '+run.lives+'.');}
  }return !hit;
 });
 // A largura visual do jacaré é de aproximadamente 70 px (120-15 a 154+17).
 // O humano mantém as margens antigas para preservar o restante da física.
 const collisionLeft=run.player.isJacare?PLAYER.x-15:left;
 const collisionRight=run.player.isJacare?PLAYER.x+PLAYER.width+17:right;
 const hit=run.shieldFor<=0&&run.graceFor<=0&&run.obstacles.find(o=>
  collisionRight>o.x+3&&collisionLeft<o.x+o.width-3&&(
   o.projectile?(bottom<o.y+o.height/2&&top>o.y-o.height/2):(bottom<o.height&&top>0)
  ));
 if(hit){
  run.lastHit={type:hit.type,action:hit.action||(hit.projectile&&(hit.targetY??hit.y)>50?'crouch':'jump')};
  run.lives--;announce(run,run.lives>0?'Vida extra usada! Restam '+run.lives+'.':'Foi pego pela Polícia Federal! A fuga fictícia terminou.');
  if(run.lives<=0){run.status='over';return;}run.graceFor=RECOVERY_AFTER_EXTRA;
 }
}
