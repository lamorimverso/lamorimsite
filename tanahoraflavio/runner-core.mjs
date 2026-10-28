// Mundo lógico fixo: física, sorteios e temporizadores independem da tela e do FPS.
export const WORLD = Object.freeze({width:900,height:300,ground:246});
export const PLAYER = Object.freeze({x:120,width:34,height:58});
export const SCENE_SECONDS = 20;
export const SCENE_DISTANCE = 5000;
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
export const BOSS_ROSTER = Object.freeze(['xandao','haddad','lula']);
export const PICKUPS = Object.freeze([
 Object.freeze({type:'passport',name:'Passaporte',value:10,purpose:'100 passaportes = +1 vida'}),
 Object.freeze({type:'shield',name:'Escudo das Américas',value:0,purpose:'Invisibilidade por 6 segundos'}),
 Object.freeze({type:'biblia',name:'Bíblia evangélica',value:0,purpose:'Próximos 3 disparos com dano 3'})
]);
export const BOSS_WEAPONS = Object.freeze([
 Object.freeze({type:'ivermectina',name:'Ivermectina',damage:1}),
 Object.freeze({type:'biblia',name:'Bíblia evangélica',damage:3})
]);
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
const routeClock = run => run.routeDistance / 250;
const visibleWidth = run => Math.max(480,Math.min(900,Number(run.viewportWidth)||WORLD.width));
const announce = (run,text) => {run.event=text;run.events++;};

export function difficultyAt(distance) {
 const d=Number.isFinite(distance)?Math.max(0,distance):0,p=d/(d+25000);
 return {level:1+Math.floor(d/8000),speed:250+130*p,obstacleGap:1.95-.6*p,
  pickupGap:12+8*p,passportGap:4.6+.8*p,powerGap:24+32*p};
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
export function createRun() {
 return {status:'ready',elapsed:0,distance:0,routeDistance:0,viewportWidth:WORLD.width,bonus:0,collected:0,passports:0,lives:1,
  event:'',events:0,player:{y:0,velocity:0},obstacles:[],pickups:[],shots:[],
  nextObstacle:1.5,nextPickup:0,nextPassport:3.5,nextPower:7,shieldFor:0,graceFor:0,bibleCharges:0,
  lastPickup:null,spawnedObstacles:0,spawnedPickups:0,spawnedPowers:0,
  boss:null,bossBag:[],lastBoss:null,bossesDefeated:0,nextBossAt:null,bossCooldown:0,
  raid:null,nextRaid:null,raids:0,lastFact:-1};
}
export function startRun(run){if(run.status==='ready')run.status='running';}
export function jumpRun(run){
 if(run.status!=='running'||run.player.y>0||run.player.velocity>0)return false;
 run.player.velocity=610;return true;
}
// Interno ao motor/testes; não há comando de pausa na interface.
export function togglePause(run){if(run.status==='running')run.status='paused';else if(run.status==='paused')run.status='running';}
export function scoreFor(run){return Math.floor(run.distance/20)+run.bonus;}
export function bossAtRound(round,type) {
 const safe=Math.max(0,Math.floor(Number.isFinite(round)?round:0)),level=Math.floor(safe/3)+1;
 const foe=foeFor(type||BOSS_ROSTER[safe%3]),supreme=foe.type==='lula';
 return {foe,level,supreme,round:safe+1,attacks:Math.min(7,3+Math.min(level-1,3)+(supreme?1:0)),
  interval:Math.max(1.25,1.65-Math.min(level-1,4)*.07),health:({xandao:14,haddad:16,lula:20})[foe.type]+Math.min(level-1,4)*2};
}
// O primeiro chefe só entra após aproximadamente 34 segundos de corrida efetiva.
// Os próximos encontros continuam distribuídos pelo trajeto, sem se acumular.
function nextBossDistance(count,rng){return Math.floor(count/3)*25000+[8500,16500,24000][count%3]+random(rng)*700;}
function takeBoss(run,rng){
 if(!run.bossBag.length){
  run.bossBag=[...BOSS_ROSTER];
  for(let i=2;i>0;i--){const j=Math.floor(random(rng)*(i+1));[run.bossBag[i],run.bossBag[j]]=[run.bossBag[j],run.bossBag[i]];}
  if(run.bossBag.at(-1)===run.lastBoss)[run.bossBag[0],run.bossBag[2]]=[run.bossBag[2],run.bossBag[0]];
 }
 return run.bossBag.pop();
}
function beginBoss(run,rng){
 const conf=bossAtRound(run.bossesDefeated,takeBoss(run,rng));
 run.boss={type:conf.foe.type,name:conf.foe.name,color:conf.foe.color,level:conf.level,supreme:conf.supreme,
  round:conf.round,total:conf.attacks,remaining:conf.attacks,fired:0,interval:conf.interval,nextAttack:1.3,
  health:conf.health,maxHealth:conf.health,nextShot:.45,shotsFired:0,lastWeapon:'Ivermectina',hitFlashFor:0,attackFlashFor:0};
 run.obstacles=[];run.shots=[];run.nextObstacle=Math.max(1.8,run.nextObstacle);
 announce(run,conf.foe.name+' apareceu! Desvie dos ataques e continue correndo.');
}
function advanceBoss(run,dt,rng){
 const boss=run.boss;if(!boss)return;
 boss.attackFlashFor=Math.max(0,boss.attackFlashFor-dt);
 boss.nextShot-=dt;
 if(boss.nextShot<=0&&boss.health>0){
  const weapon=BOSS_WEAPONS[run.bibleCharges>0?1:0];if(run.bibleCharges>0)run.bibleCharges--;
  run.shots.push({type:weapon.type,damage:weapon.damage,progress:0,launchY:run.player.y});
  boss.lastWeapon=weapon.name;boss.shotsFired++;boss.nextShot+=.9;
 }
 boss.nextAttack-=dt;
 if((boss.health>0||boss.fired<boss.total)&&boss.nextAttack<=0){
  if(boss.fired>=boss.total){boss.total++;boss.remaining++;}
  const attackType={xandao:'stamp',haddad:'receipts',lula:'sound'}[boss.type];
  const [width,height]={stamp:[42,32],receipts:[44,40],sound:[48,38]}[attackType];
  // Tiro de verdade: parte da mão do chefe, mira a posição do protagonista
  // na altura habitual da corrida e continua em linha reta, permitindo salto.
  // Mirar o ponto do salto atual faria o objeto atingir injustamente quem desvia.
  const x=visibleWidth(run)-104;
  const attack={x,width,height,type:attackType,owner:boss.type,bossAttack:true,counted:false,
   projectile:true,launchX:x+width/2,targetX:PLAYER.x+PLAYER.width/2,
   launchY:77,targetY:PLAYER.height/2,y:77};
  run.obstacles.push(attack);boss.attackFlashFor=.26;boss.fired++;boss.nextAttack+=boss.interval+random(rng)*.25;return attack;
 }
}
function advanceShots(run,dt){
 if(!run.boss){run.shots=[];return;}const boss=run.boss;boss.hitFlashFor=Math.max(0,boss.hitFlashFor-dt);
 for(const shot of run.shots){shot.progress+=dt/.55;if(shot.progress>=1){boss.health=Math.max(0,boss.health-shot.damage);boss.hitFlashFor=.15;}}
 run.shots=run.shots.filter(s=>s.progress<1);
}
function resolveBossDodges(run,rng){
 if(!run.boss)return;
 for(const o of run.obstacles)if(o.bossAttack&&!o.counted&&o.x+o.width<PLAYER.x){o.counted=true;run.boss.remaining--;}
 const boss=run.boss;if(boss.fired<boss.total||boss.remaining>0||boss.health>0)return;
 run.lastBoss=boss.type;run.boss=null;run.shots=[];run.bossesDefeated++;run.bossCooldown=4;
 run.nextBossAt=nextBossDistance(run.bossesDefeated,rng);run.nextObstacle=Math.max(1.8,run.nextObstacle);
 run.pickups=run.pickups.filter(p=>p.type!=='biblia');
 announce(run,boss.name+' vencido! '+(run.bossesDefeated%3===0?'Rodada completa; os três chefões serão sorteados novamente.':'A viagem continua.'));
}
function advanceRaid(run,dt,rng){
 if(run.raid){
  const raid=run.raid;raid.remaining=Math.max(0,raid.remaining-dt);
  if(raid.remaining<=1e-8){
   if(raid.phase==='warning'){raid.phase='active';raid.remaining=8;announce(run,'Toc, toc, toc… é a Polícia Federal! Oito segundos de perseguição.');}
   else if(raid.phase==='active'){raid.phase='recovery';raid.remaining=2;announce(run,'A perseguição especial terminou. O ritmo normal está voltando.');}
   else{run.raid=null;run.nextRaid=35+random(rng)*25;}
  }return;
 }
 if(run.boss||run.bossCooldown>0||stageTransitionAt(routeClock(run)).active)return;
 run.nextRaid-=dt;
 if(run.nextRaid<=0&&run.nextBossAt-run.routeDistance>1500){
  const choices=RAID_FACTS.map((_,i)=>i).filter(i=>i!==run.lastFact);
  const factIndex=choices[Math.floor(random(rng)*choices.length)];run.lastFact=factIndex;
  run.raid={phase:'warning',remaining:2,factIndex,id:++run.raids};
  announce(run,'Joice apareceu. Atenção: vem aí uma perseguição especial da PF.');
 }
}
function rewardForObstacle(run,obstacle,balance,rng){
 if(!obstacle)return;let item,count=1;
 const has=type=>run.pickups.some(p=>p.type===type);
 if(run.boss&&run.boss.health>0&&run.bibleCharges===0&&run.nextPickup<=0&&!has('biblia')){
  item=PICKUPS[2];run.nextPickup=balance.pickupGap+random(rng)*4;
 }else if(run.nextPower<=0&&run.shieldFor<=0&&!has('shield')){
  item=PICKUPS[1];run.spawnedPowers++;run.nextPower=balance.powerGap+random(rng)*4;
 }else if(run.nextPassport<=0){item=PICKUPS[0];count=3;run.nextPassport=balance.passportGap+random(rng)*.7;}
 else return;
 run.spawnedPickups++;const center=obstacle.x+obstacle.width/2;
 for(let i=0;i<count;i++)run.pickups.push({x:center+(i-(count-1)/2)*35,y:100,type:item.type,value:item.value});
}
export function advanceRun(run,seconds,rng=Math.random){
 if(run.status!=='running'||!Number.isFinite(seconds)||seconds<=0)return;
 const dt=Math.min(seconds,.05);run.elapsed+=dt;
 if(run.nextBossAt===null)run.nextBossAt=nextBossDistance(0,rng);
 if(run.nextRaid===null)run.nextRaid=35+random(rng)*25;
 const balance=difficultyAt(run.distance),travel=balance.speed*dt;run.distance+=travel;
 if(!run.boss&&!run.raid)run.routeDistance+=travel;
 run.bossCooldown=Math.max(0,run.bossCooldown-dt);
 run.player.velocity-=1750*dt;run.player.y=Math.max(0,run.player.y+run.player.velocity*dt);
 if(run.player.y===0)run.player.velocity=0;
 run.shieldFor=Math.max(0,run.shieldFor-dt);run.graceFor=Math.max(0,run.graceFor-dt);
 for(const obstacle of run.obstacles){
  obstacle.x-=travel;
  if(obstacle.projectile){
   const span=Math.max(1,obstacle.launchX-obstacle.targetX);
   const progress=Math.max(0,Math.min(1,(obstacle.launchX-(obstacle.x+obstacle.width/2))/span));
   obstacle.y=obstacle.launchY+(obstacle.targetY-obstacle.launchY)*progress;
  }
 }
 for(const pickup of run.pickups)pickup.x-=travel;
 advanceShots(run,dt);resolveBossDodges(run,rng);
 run.obstacles=run.obstacles.filter(o=>o.x+o.width>-20);run.pickups=run.pickups.filter(p=>p.x>-30);
 if(!run.boss&&!run.raid&&run.bossCooldown<=0&&run.routeDistance>=run.nextBossAt&&!stageTransitionAt(routeClock(run)).active)beginBoss(run,rng);
 advanceRaid(run,dt,rng);
 let anchor;
 if(run.boss)anchor=advanceBoss(run,dt,rng);
 else{
  run.nextObstacle-=dt;
  if(run.nextObstacle<=0){
   const opponent=run.raid?.phase==='active'?foeFor('pf'):pursuitAt(routeClock(run),rng);
   anchor={x:visibleWidth(run)+40,width:opponent.width,height:opponent.height,type:opponent.type};run.obstacles.push(anchor);run.spawnedObstacles++;
   const factor=run.raid?.phase==='active'?.84:run.raid?.phase==='recovery'?1-.16*run.raid.remaining/2:1;
   run.nextObstacle+=Math.max(1.15,balance.obstacleGap*factor)+random(rng)*.4;
  }
 }
 run.nextPickup-=dt;run.nextPassport-=dt;run.nextPower-=dt;rewardForObstacle(run,anchor,balance,rng);
 const left=PLAYER.x+5,right=PLAYER.x+PLAYER.width-3,bottom=run.player.y+3,top=run.player.y+PLAYER.height-5;
 // Coleta antes do impacto: o escudo ou o centésimo passaporte já valem neste frame.
 run.pickups=run.pickups.filter(p=>{
  const hit=right>p.x-12&&left<p.x+12&&top>p.y-12&&bottom<p.y+12;
  if(hit){
   run.bonus+=p.value;run.collected++;run.lastPickup=p.type;
   if(p.type==='shield'){run.shieldFor=6;announce(run,'Escudo das Américas! Invisibilidade por 6 segundos.');}
   if(p.type==='biblia'){run.bibleCharges=3;announce(run,'Bíblia coletada: próximos três disparos com dano 3.');}
   if(p.type==='passport'&&++run.passports%100===0){run.lives++;announce(run,'100 passaportes! Uma vida extra; total: '+run.lives+'.');}
  }return !hit;
 });
 if(run.shieldFor<=0&&run.graceFor<=0&&run.obstacles.some(o=>
  right>o.x+3&&left<o.x+o.width-3&&(
   o.projectile?(bottom<o.y+o.height/2&&top>o.y-o.height/2):(bottom<o.height&&top>0)
  ))){
  run.lives--;announce(run,run.lives>0?'Vida extra usada! Restam '+run.lives+'.':'Foi pego pela Polícia Federal! A fuga fictícia terminou.');
  if(run.lives<=0){run.status='over';return;}run.graceFor=RECOVERY_AFTER_EXTRA;
 }
}
