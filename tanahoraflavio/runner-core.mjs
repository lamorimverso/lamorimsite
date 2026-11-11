import {allyForStage,collectAlly,advanceAllies} from './runner-allies.mjs?v=181506ec1b3c';
import {ARCHIVE_VOICES} from './runner-voice-data.mjs?v=fa9433a61a03';
import {STORY_ENCOUNTERS,STORY_OPENING_DISTANCE,storyBossAt,nextStoryBossDistance,storyApproachAt,arenaPatternFor,bossArenaPose,stepBossPhase} from './runner-bosses.mjs?v=0094a5e5951f';
export {STORY_OPENING_DISTANCE} from './runner-bosses.mjs?v=0094a5e5951f';
export {bossArenaPose} from './runner-bosses.mjs?v=0094a5e5951f';
// Mundo lógico fixo: física, sorteios e temporizadores independem da tela e do FPS.
export const WORLD = Object.freeze({width:900,height:300,ground:246});
// Envelope de todas as poses no atlas a .95 de escala, incluindo o agachamento.
// A mesma margem serve ao jacaré e evita deslocar o herói ao trocar de postura.
export const PLAYER = Object.freeze({x:120,width:34,height:58,visualLeft:-26,visualRight:75});
export const JACARE_DURATION_SECONDS = 10;
export const GAME_MODES = Object.freeze(['endless','story']);
export const STORY_BOSS_COUNT = STORY_ENCOUNTERS;
export const SCENE_SECONDS = 20;
export const SCENE_DISTANCE = 7000; // 7 km efetivos por cenário; 35 km por volta
export const PASSPORTS_PER_LIFE = 100;
export const STARTING_LIVES = 1;
export const RECOVERY_AFTER_EXTRA = 1.2;
const RAID_WARNING_FOR=1.2,RAID_ACTIVE_FOR=10,RAID_AUDIO_MARGIN_FOR=1;
// A fala começa no aviso. O retorno reserva seu fim e uma margem de carga,
// sem alongar os dez segundos de perigos ativos.
export const RAID_TIMING=Object.freeze({warningFor:RAID_WARNING_FOR,activeFor:RAID_ACTIVE_FOR,audioMarginFor:RAID_AUDIO_MARGIN_FOR,
 recoveryFor:Math.max(2,(Number(ARCHIVE_VOICES.joice.durationSeconds)||0)+RAID_AUDIO_MARGIN_FOR-RAID_WARNING_FOR-RAID_ACTIVE_FOR)});
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
 {type:'meme-army',name:'Exército de memes do Lula',short:'Memes',width:46,height:44,color:'#b44d67'},
 {type:'bossonari',name:'Fantasma do Comunismo · Chefão final',short:'Bossonari',width:56,height:58,color:'#7a4f8d'},
 {type:'boulos',name:'Boulos',short:'Boulos',width:38,height:46,color:'#765488'},
 {type:'dino',name:'Flávio Dino',short:'Dino',width:40,height:48,color:'#8a6247'},
 {type:'xandao',name:'Xandão',short:'Xandão',width:40,height:49,color:'#493f62'},
 {type:'haddad',name:'Haddad',short:'Taxad',width:40,height:48,color:'#286779'},
 {type:'lula',name:'Lula',short:'Lula',width:46,height:50,color:'#aa3c50'},
 {type:'dilma',name:'Dilma Rousseff',short:'Dilma',width:36,height:46,color:'#b74250'},
 {type:'simone',name:'Simone Tebet',short:'Simone',meme:'Gostosas do Lula',memeKind:'adesivo cenográfico; não fala autêntica',width:36,height:46,color:'#586fa2'},
 {type:'soraya',name:'Soraya Thronicke',short:'Soraya',width:38,height:46,color:'#866548'},
 {type:'barrier',name:'Barreira',short:'Barreira',width:44,height:32,color:'#c48845'},
 {type:'case',name:'Mala',short:'Mala',width:38,height:36,color:'#906490'}
].map((p,index)=>Object.freeze({...p,index})));
export const BOSS_ROSTER = Object.freeze(['haddad','lula','xandao','janones','pf']);
const BOSS_GOALS = Object.freeze({
 haddad:{attacks:9,goalKind:'papers'},
 lula:{attacks:10,goalKind:'patterns'},
 xandao:{attacks:12,goalKind:'hammer-mandado'},janones:{attacks:9,goalKind:'urgent'},pf:{attacks:8,goalKind:'blitz'},
 bossonari:{attacks:14,goalKind:'phantoms'}
});
export const PICKUPS = Object.freeze([
 Object.freeze({type:'passport',name:'Passaporte',value:10,purpose:'100 passaportes = +1 vida'}),
 Object.freeze({type:'shield',name:'Escudo das Américas',value:0,purpose:'Proteção por 6 segundos'}),
 Object.freeze({type:'ze-gotinha',name:'Zé Gotinha',value:0,purpose:'Transforma Flávio em jacaré fictício por 10 segundos; proteção inicial de 3 segundos'})
]);
// O protagonista não possui armas; chefões atacam e o jogador só desvia.
// Texto de roteiro ficcional, sem atribuir gravações/falas autênticas à personagem.
export const RAID_FACTS = Object.freeze([
 {title:'Denúncia · 2020',text:'Em 2020, o MP-RJ apresentou denúncia contra Flávio no caso das rachadinhas.',source:'MP-RJ · 04/11/2020',url:'https://www.mprj.mp.br/web/guest/visualizar?noticiaId=96203'},
 {title:'Decisão · 2021',text:'Em 2021, o STF anulou quatro relatórios do Coaf usados no caso.',source:'STF · 30/11/2021',url:'https://portal.stf.jus.br/noticias/verNoticiaDetalhe.asp?idConteudo=477496'},
 {title:'Arquivo · 2020',text:'Fabrício Queiroz e outros 15 investigados também foram denunciados pelo MP-RJ.',source:'MP-RJ · 04/11/2020',url:'https://www.mprj.mp.br/web/guest/visualizar?noticiaId=96203'}
].map(Object.freeze));
const POOLS = [
 ['pf','barrier','janones','boulos'],['janones','army','barrier','pf'],
 ['pf','barrier','case','dino'],['army','pf','case'],['pf','janones','army','dino','case','barrier']
];
// Desbloqueio por risco: cada ator entra em cena após o jogador aprender a
// reagir aos anteriores. Chefões mantêm a ordem e os marcos da História.
export const CHARACTER_UNLOCK_LEVEL=Object.freeze({
 pf:1,barrier:1,dilma:1,
 janones:2,simone:2,
 army:3,case:3,soraya:3,
 boulos:4,
 'meme-army':5,
 dino:6
});
const GROUND_CAST=Object.freeze(['pf','barrier','janones','army','case','boulos','dino']);
const OVERHEAD_CAST=Object.freeze(['dilma','simone','soraya','meme-army']);
export function unlockedCharacters(level,role='all'){
 const rank=Math.max(1,Math.min(10,Math.floor(Number(level)||1)));
 return (role==='ground'?GROUND_CAST:role==='overhead'?OVERHEAD_CAST:[...GROUND_CAST,...OVERHEAD_CAST])
  .filter(type=>CHARACTER_UNLOCK_LEVEL[type]<=rank);
}
export function characterProgressAt(run){
 const level=difficultyAt(run.distance,run.elapsed).level;
 const available=unlockedCharacters(level).filter(type=>type!=='barrier'&&type!=='case');
 const all=unlockedCharacters(10).filter(type=>type!=='barrier'&&type!=='case');
 return {level,available:available.length,total:all.length,characters:available};
}
// Um ator novo aparece antes da repetição do elenco antigo, sem deixar
// dois ataques seguidos com o mesmo personagem quando há alternativas.
function chooseProgressiveCharacter(options,rng,seen=[],last=null){
 const fresh=options.filter(type=>!seen.includes(type));
 const eligible=fresh.length?fresh:options.filter(type=>type!==last);
 const choices=eligible.length?eligible:options;
 return choices[Math.floor(random(rng)*choices.length)];
}
const random = rng => Math.max(0,Math.min(.999999999,Number(rng())||0));
const nextSeed = seed => (Math.imul(seed,1664525)+1013904223)>>>0;
export function createSeededRandom(seed=0){
 let state=Number(seed)>>>0;
 return ()=>{state=nextSeed(state);return state/4294967296;};
}
const foeFor = type => PURSUERS.find(p=>p.type===type);
// Mantém stageAt em escala de 20 unidades por cenário, mas o percurso real
// é SCENE_DISTANCE metros. Assim o cenário exige 7 km de fuga, não 20 s fixos.
export const campaignRouteDistance = run => Math.max(0,run.routeDistance-(run.mode==='story'?STORY_OPENING_DISTANCE:0));
const routeClock = run => campaignRouteDistance(run) / SCENE_DISTANCE * SCENE_SECONDS;
const visibleWidth = run => Math.max(480,Math.min(900,Number(run.viewportWidth)||WORLD.width));
const announce = (run,text) => {run.event=text;run.events++;};
const assistance = run => run.assisted ? .82 : 1;
// Primeiro contato horizontal usa o mesmo recuo de 3 px da colisão abaixo.
export const playerX = run => Number.isFinite(run.player.x)?run.player.x:PLAYER.x;
export const playerBounds = run => ({min:-PLAYER.visualLeft,max:visibleWidth(run)-(run.boss?.combat&&run.boss.phase!=='intro'?245:PLAYER.visualRight)});
const frontContact = run => playerX(run)+PLAYER.width-6;
const REACTION_GAP = .82;
// A retaguarda se aproxima pela esquerda; outras ameaças continuam pela direita.
const JUMP_BUFFER_SECONDS = .12;
const JACARE_ENTRY_GRACE = 3;
const JACARE_RESTORE_GRACE = .55;
const JACARE_RESTORE_FLASH = .48;
export function threatTimeToContact(run,o){
 if(o.groundHazard)return o.warningFor-o.age;
 if(o.falling)return o.warningFor+o.fallFor*.7-o.age;
 if(o.approach==='rear')return (o.waitFor||0)+(playerX(run)+5-(o.x+o.width-3))/-o.speed;
 return (o.waitFor||0)+(o.x-frontContact(run))/o.speed;
}
// Zonas persistentes reservam também sua janela ativa antes da próxima onda.
const threatReservation = (run,o) => threatTimeToContact(run,o)+(o.groundHazard?o.activeFor:0);

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
 if(run.aid?.kind==='telegraph')seconds+=.24;
 const contactX=frontContact(run),rearContact=playerX(run)+5;
 const pending=run.obstacles.filter(o=>!o.passed&&o.x>contactX&&o.speed>0)
  .map(o=>threatReservation(run,o));
 const rear=run.obstacles.filter(o=>o.approach==='rear'&&o.speed<0)
  .map(o=>threatReservation(run,o))
  .filter(t=>t>0);
 const speed=Math.max(1,visibleX-contactX)/seconds*assistance(run);
 const drops=run.obstacles.filter(o=>o.falling||o.groundHazard).map(o=>threatReservation(run,o)).filter(t=>t>0);
 const nextContact=Math.max((x-contactX)/speed,...pending.concat(rear,drops).map(t=>t+REACTION_GAP));
 return Math.max(1,x-contactX)/nextContact;
}
function threatMotion(run,x,seconds,visibleX=x){
 const requested=threatSpeed(run,x,seconds,visibleX),speed=Math.max(180,requested);
 // O tempo extra vira antecipação visível, sem alongar a travessia física.
 return {speed,waitFor:Math.max(0,(x-frontContact(run))/requested-(x-frontContact(run))/speed)};
}
export function projectileStyle(type){
 return ({wind:'wind','budget-sheets':'paper',receipts:'paper','paper-gate':'paper',mandado:'paper',
 hammer:'metal',handcuffs:'metal',barrier:'metal',stamp:'metal','parachute-cross':'fall',
 'meme-ghost':'ghost',lhand:'glide',message:'glide','cloroquina-prop':'metal','ivermectina-prop':'metal'})[type]||'glide';
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
export function pursuitAt(seconds,rng=()=>.5,level=10,seen=[],last=null) {
 const stagePool=POOLS[stageAt(seconds).index];
 const pool=stagePool.filter(type=>CHARACTER_UNLOCK_LEVEL[type]<=level);
 return foeFor(chooseProgressiveCharacter(pool.length?pool:['pf'],rng,seen,last));
}
// Retaguarda usa a mesma janela de leitura, sem disputar o contato com um perigo frontal.
function rearMotion(run,x,width){
 const contactX=frontContact(run),rearContact=playerX(run)+5;
 const front=run.obstacles.filter(o=>!o.passed&&o.x>contactX&&o.speed>0).map(o=>threatReservation(run,o));
 const rear=run.obstacles.filter(o=>o.approach==='rear'&&o.speed<0).map(o=>threatReservation(run,o));
 const drops=run.obstacles.filter(o=>o.falling||o.groundHazard).map(o=>threatReservation(run,o));
 const seconds=Math.max(run.assisted?1.22:1.06,...front.concat(rear,drops).filter(t=>t>0).map(t=>t+REACTION_GAP));
 const distance=rearContact-(x+width-3),requested=distance/seconds,speed=Math.max(180,requested);
 return {speed:-speed,waitFor:Math.max(0,seconds-distance/speed)};
}
export function createRun({assisted=false,seed,mode='endless'}={}) {
 return {status:'ready',mode:mode==='story'?'story':'endless',assisted:assisted===true,elapsed:0,distance:0,routeDistance:0,viewportWidth:WORLD.width,bonus:0,collected:0,passports:0,lives:1,
  randomState:seed===undefined?null:Number(seed)>>>0,
  ballot:{digits:'',message:''},
  event:'',events:0,player:{x:PLAYER.x,moveHeld:0,y:0,velocity:0,crouching:false,crouchHeld:false,isJacare:false,jacareAge:0,nextJacareThreat:3,restoreFlashFor:0,jumpBufferedUntil:0,attackHeld:false,attackFor:0,attackCooldown:0,shotFacing:1,hp:5,maxHp:5},obstacles:[],pickups:[],heroShots:[],shotsFired:0,lastHit:null,
  nextObstacle:1.5,nextPickup:0,nextPassport:4.8,nextPower:7,shieldFor:0,graceFor:0,
  lastPickup:null,spawnedObstacles:0,spawnedPickups:0,spawnedPowers:0,phantomCloud:null,
  boss:null,bossBag:[],lastBoss:null,bossesDefeated:0,nextBossAt:null,bossCooldown:0,
  raid:null,nextRaid:null,raids:0,lastFact:-1,cameo:null,overheadCount:0,lastOverheadActor:null,
  seenOverheadActors:[],seenGroundActors:[],lastGroundActor:null,
  lastAction:null,actionStreak:0,attackStyles:[],nextAllyAt:14000,alliesMet:0,
  nextSupportAt:18000,supportAvailable:true,ally:null,aid:null,allyVisits:{},lastAllyId:null,creditCooldown:0};
}
// Reenquadra ondas ainda à frente, preservando prazo de contato e trajetória.
 // Contatos iniciados preservam sua posição relativa ao herói reenquadrado.
export function resizeRun(run,width){
 const previous=visibleWidth(run),oldBounds=playerBounds(run),oldX=playerX(run),oldFront=frontContact(run),oldRear=oldX+5;
 const position=Math.max(0,Math.min(1,(oldX-oldBounds.min)/(oldBounds.max-oldBounds.min)));
 run.viewportWidth=Math.max(480,Math.min(900,Number(width)||WORLD.width));
 if(visibleWidth(run)===previous)return;
 const bounds=playerBounds(run);run.player.x=bounds.min+position*(bounds.max-bounds.min);
 const delta=playerX(run)-oldX,contactX=frontContact(run),rear=playerX(run)+5;
 const ratio=(visibleWidth(run)-contactX)/(previous-oldFront),rearRatio=rear/oldRear;
 const moved=new Map(),project=x=>contactX+(x-oldFront)*ratio;
 for(const shot of run.heroShots||[]){shot.x=project(shot.x);shot.previousX=project(shot.previousX);shot.vx*=ratio;}
 for(const o of run.obstacles){
  const start=o.x;
  if(o.falling||o.groundHazard||o.passed||!Number.isFinite(o.speed)||o.speed===0){o.x+=delta;}
  else if(o.speed>0&&o.x>oldFront){
   o.x=project(o.x);o.speed*=ratio;
   if(o.speed<180){
    const distance=o.x-contactX;o.waitFor=(o.waitFor||0)+distance/o.speed-distance/180;o.speed=180;
   }
   if(o.projectile){
    const center=o.width/2;
    if(Number.isFinite(o.launchX))o.launchX=project(o.launchX-center)+center;
    // O fim do arco corresponde à borda de primeiro contato, não ao centro
    // do corpo. Transformar esse mesmo ponto conserva a altura no resize.
    if(Number.isFinite(o.targetX))o.targetX=project(o.targetX+PLAYER.width/2-6)-(PLAYER.width/2-6);
   }
  }else if(o.approach==='rear'&&o.x+o.width-3<oldRear){
   const distance=(oldRear-(o.x+o.width-3))*rearRatio;
   o.x=rear-distance-o.width+3;o.speed*=rearRatio;
   if(-o.speed<180){o.waitFor=(o.waitFor||0)+distance/-o.speed-distance/180;o.speed=-180;}
  }else{
   o.x+=delta;
   if(Number.isFinite(o.launchX))o.launchX+=delta;
   if(Number.isFinite(o.targetX))o.targetX+=delta;
  }
  moved.set(o,{delta:o.x-start,speed:o.speed,waitFor:o.waitFor||0});
 }
 for(const p of run.pickups){
  const source=moved.get(p.anchor);if(!source){p.x+=delta;continue;}
  p.x+=source.delta;p.speed=source.speed;p.waitFor=source.waitFor;
 }
}
export function startRun(run){if(run.status==='ready')run.status='running';}
// Urna exclusivamente fictícia, sem integração eleitoral, coleta ou transmissão de votos.
export function ballotDigit(run,digit){
 if(run.status!=='ballot'||!/^[0-9]$/.test(String(digit))||run.ballot.digits.length>=2)return false;
 run.ballot.digits+=String(digit);run.ballot.message='';return true;
}
export function ballotClear(run){
 if(run.status!=='ballot')return false;
 run.ballot.digits='';run.ballot.message='';return true;
}
export function ballotConfirm(run){
 if(run.mode!=='story'||run.status!=='ballot')return false;
 if(run.ballot.digits==='13'){
  run.status='won';announce(run,'HISTÓRIA CONCLUÍDA! Código 13 confirmado. Você venceu a etapa final.');return 'won';
 }
 if(run.ballot.digits==='22'){
  run.status='prison';announce(run,'Código 22 confirmado. Flávio foi preso! A campanha recomeça.');return 'prison';
 }
 run.ballot.message='Código inválido. Corrija e tente novamente.';return 'invalid';
}
// Movimento independente do avanço automático e limitado apenas pelo sprite.
export function moveRun(run,direction){
 if(run.status!=='running')return false;
 run.player.moveHeld=Number.isFinite(direction)?Math.sign(direction):0;return true;
}
// Alvo comprometido ao anunciar. O jogador pode fugir para ambos os lados.
export function spawnFallingThreat(run,{bossAttack=false,owner='joice'}={}){
 if(run.status!=='running'||run.obstacles.some(o=>o.falling||o.groundHazard))return null;
 const isAmpoule=owner==='pfizer',width=isAmpoule?42:56;
 const x=Math.max(0,Math.min(visibleWidth(run)-width,playerX(run)+17-width/2));
 const arrivals=run.obstacles.filter(o=>!o.passed).map(o=>threatReservation(run,o)).filter(t=>Number.isFinite(t)&&t>0);
 const warningFor=Math.max(1.2,...arrivals.map(t=>t+REACTION_GAP))+(run.aid?.kind==='sky'?.35:0);
 const item={x,width,height:isAmpoule?48:44,type:isAmpoule?'pfizer-ampoule':'falling-case',action:'move',approach:'vertical',falling:true,age:0,warningFor,fallFor:isAmpoule?.72:.4,y:310,speed:0,owner,bossAttack,counted:false};
 run.obstacles.push(item);return item;
}
// Cada ampola marca um ponto sorteado na pista. Aviso simultâneo,
// impactos escalonados e distância mínima evitam perigos pareados.
// A posição marcada permanece fixa; Joice e PF não usam esta regra.
export function spawnJacareVolley(run,{rng=Math.random}={}){
 if(run.status!=='running'||!run.player.isJacare)return [];
 const target=spawnFallingThreat(run,{owner:'pfizer'});
 if(!target)return [];
 const maxX=visibleWidth(run)-target.width;
 target.x=Math.max(0,Math.min(maxX,Math.round(target.x+(random(rng)-.5)*48)));
 const volley=[target],extra=run.player.jacareAge>=5.3?2:1,minimumGap=150;
 const valid=x=>x>=0&&x<=maxX&&volley.every(o=>Math.abs(o.x-x)>=minimumGap);
 for(let i=0;i<extra;i++){
  let x=null;
  // Amostragem horizontal real, sem colunas predefinidas ou repetidas.
  for(let attempt=0;attempt<12;attempt++){
   const candidate=Math.round(random(rng)*maxX);
   if(valid(candidate)){x=candidate;break;}
  }
  if(x===null){
   // Fallback para bordas ou gerador determinístico constante.
   const options=[0,maxX,Math.round(maxX/2),target.x-160,target.x+160,target.x-320,target.x+320];
   const gap=candidate=>Math.min(...volley.map(o=>Math.abs(candidate-o.x)));
   x=options.filter(valid).sort((a,b)=>gap(b)-gap(a))[0]??null;
  }
  if(x===null)break;
  const delay=(i+1)*(.34+random(rng)*.08);
  const ampoule={...target,x,warningFor:target.warningFor+delay};
  run.obstacles.push(ampoule);volley.push(ampoule);
 }
 return volley;
}
// O aviso fixa a posição antes da abertura; nunca há uma hitbox ativa no nascimento.
// Uma única zona local deixa espaço de fuga, inclusive no extremo da arena.
export function spawnManholeThreat(run,{rng=Math.random}={}){
 if(run.status!=='running'||run.obstacles.some(o=>o.falling||o.groundHazard))return null;
 const width=64,x=Math.max(0,Math.min(visibleWidth(run)-width,playerX(run)+17-width/2+(random(rng)-.5)*24));
 const arrivals=run.obstacles.filter(o=>!o.passed).map(o=>threatReservation(run,o)).filter(t=>Number.isFinite(t)&&t>0);
 const warningFor=Math.max(1.2,...arrivals.map(t=>t+REACTION_GAP));
 // Zonas persistentes precisam terminar antes do ensaio isolado. Sem isso,
 // um bueiro anterior pode consumir toda a janela e apagar a preparação.
 if(run.mode==='story'&&!run.boss&&!run.raid&&Number.isFinite(run.nextBossAt)){
  const travelSpeed=difficultyAt(run.distance,run.elapsed).speed*assistance(run);
  const timeToRehearsal=(nextStoryBossDistance(run.bossesDefeated)-run.routeDistance-1000)/travelSpeed;
  if(warningFor+1.2>timeToRehearsal)return null;
 }
 const item={x,width,height:18,type:'manhole',action:'move',approach:'ground',groundHazard:true,age:0,warningFor,activeFor:1.1,y:0,speed:0};
 run.obstacles.push(item);return item;
}
export function jumpRun(run){
 if(run.status!=='running')return false;
 // Durante a transformação a tecla de salto não interrompe a forma de jacaré.
 // As ampolas exigem desvio lateral e a corrida permanece ativa.
 if(run.player.isJacare)return false;
 if(run.player.y>0||run.player.velocity>0){run.player.jumpBufferedUntil=run.elapsed+JUMP_BUFFER_SECONDS;return false;}
 run.player.jumpBufferedUntil=0;run.player.crouching=false;run.player.velocity=610;return true;
}
export function clearRunInput(run){
 run.player.moveHeld=0;run.player.crouchHeld=false;run.player.crouching=false;run.player.jumpBufferedUntil=0;
 run.player.attackHeld=false;
}
export function setAttackRun(run,active){
 run.player.attackHeld=!!active&&run.status==='running'&&!!run.boss&&!run.player.isJacare;
 return run.player.attackHeld;
}
export function heroMuzzleFor(run,facing=1){
 return {x:playerX(run)+(facing<0?2:PLAYER.width-2),y:run.player.y+(run.player.crouching?18:38)};
}
export function attackRun(run){
 const b=run.boss,p=run.player;
 if(run.status!=='running'||!b||p.isJacare||b.phase==='intro'||p.attackCooldown>0||(run.heroShots?.length||0)>=6)return false;
 const pose=bossArenaPose(b,visibleWidth(run));
 p.shotFacing=pose.x<playerX(run)+PLAYER.width/2?-1:1;
 const {x,y}=heroMuzzleFor(run,p.shotFacing);
 const dx=pose.x-x,dy=pose.platformY+48-y,distance=Math.max(1,Math.hypot(dx,dy));
 (run.heroShots??=[]).push({x,y,previousX:x,previousY:y,vx:dx/distance*760,vy:dy/distance*760,age:0});
 p.attackCooldown=.28;p.attackFor=.13;run.shotsFired=(run.shotsFired||0)+1;return true;
}
function advanceHeroShots(run,dt){
 const p=run.player;p.attackCooldown=Math.max(0,(p.attackCooldown||0)-dt);p.attackFor=Math.max(0,(p.attackFor||0)-dt);
 if(p.attackHeld)attackRun(run);
 const b=run.boss,pose=b?bossArenaPose(b,visibleWidth(run)):null;
 run.heroShots=(run.heroShots||[]).filter(shot=>{
  shot.previousX=shot.x;shot.previousY=shot.y;shot.x+=shot.vx*dt;shot.y+=shot.vy*dt;shot.age+=dt;
  if(!b||shot.age>2||shot.x<-30||shot.x>visibleWidth(run)+30||shot.y<-30||shot.y>330)return false;
  // Segmento varrido evita atravessar a hitbox em quadros longos.
  const dx=shot.x-shot.previousX,dy=shot.y-shot.previousY;
  let near=0,far=1;
  for(const [origin,delta,min,max] of [[shot.previousX,dx,pose.x-34,pose.x+34],[shot.previousY,dy,pose.platformY+8,pose.platformY+104]]){
   if(Math.abs(delta)<1e-8){if(origin<min||origin>max)return true;}
   else{const a=(min-origin)/delta,z=(max-origin)/delta;near=Math.max(near,Math.min(a,z));far=Math.min(far,Math.max(a,z));}
  }
  if(near>far)return true;
  if(b.phase==='intro')return false;
  b.hp=Math.max(0,(b.hp??b.total)-(b.phase==='recover'?2:1));b.hitFlashFor=.16;
  return false;
 });
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
// Uma fonte única para os nomes das armas, a instrução de esquiva e o HUD.
export const ATTACK_NAMES=Object.freeze({
 wind:'Vendaval da Dilma',
 'budget-sheets':'Planilhas voadoras de Simone',
 'parachute-cross':'Cruzes de paraquedas de Soraya',
 handcuffs:'Algemas da PF / Joice',
 'meme-ghost':'Investida do Fantasma do Comunismo',
 pf:'Agente da PF',army:'Soldado do Exército',janones:'Janones em perseguição',
 boulos:'Boulos em perseguição',dino:'Dino em perseguição',
 receipts:'Recibos TAXA de Haddad','paper-gate':'Papéis TAXA de Haddad',
 stamp:'Carimbo TAXA de Haddad',lhand:'Gestos em L de Lula',
 hammer:'Martelo de Xandão',mandado:'Mandado de Xandão',
 message:'Mensagens urgentes de Janones',barrier:'Barreira da PF',
 'falling-case':'Mala em queda','rolling-case':'Mala rolando',case:'Mala',
 popcorn:'Pipoca','cloroquina-prop':'Cloroquina cenográfica de Bossonari',
 'ivermectina-prop':'Ivermectina cenográfica de Bossonari',
 'pfizer-ampoule':'Ampola cenográfica da Pfizer'
});
export function attackCueFor(attack){
 if(!attack)return null;
 const label=ATTACK_NAMES[attack.type]||'Perigo';
 const action=attack.action==='move'?'move':attack.action==='crouch'?'crouch':'jump';
 const verb=action==='move'?'Saia do alvo':action==='crouch'?'Abaixe':'Pule';
 return {label,action,verb,short:(action==='move'?'↔ ':action==='crouch'?'↓ ':'↑ ')+verb+' · '+label,
  instruction:verb+' para escapar de '+label+'.'};
}

export function bossAtRound(round,type) {
 const safe=Math.max(0,Math.floor(Number.isFinite(round)?round:0)),level=Math.floor(safe/BOSS_ROSTER.length)+1;
 const foe=foeFor(type||BOSS_ROSTER[safe%BOSS_ROSTER.length]),goal=BOSS_GOALS[foe.type],attacks=goal.attacks+(foe.type==='bossonari'?0:2*Math.min(2,level-1));
 const noun=({haddad:'papéis',lula:'gestos em L',xandao:'martelos e mandados',janones:'mensagens em três blocos',pf:'bloqueios da blitz',bossonari:'frascos satíricos e aparições fictícias'})[foe.type];
 return {foe,level,supreme:foe.type==='lula',round:safe+1,goalKind:goal.goalKind,attacks,
  objective:'Desvie de '+attacks+' '+noun+'. '+({
    haddad:'Pule os papéis baixos e abaixe dos recibos altos.',
    lula:'Observe os gestos em L: pule os baixos e abaixe dos altos.',
    xandao:'Pule os martelos baixos e abaixe dos mandados altos.',
    janones:'Mensagens urgentes: alterne salto e agachamento.',
    pf:'Blitz: pule barreiras, abaixe das algemas e saia das malas marcadas.',
    bossonari:'Pule ou abaixe dos frascos satíricos de Bossonari e abaixe das investidas do Fantasma do Comunismo.'
   }[foe.type]||'Leia o próximo aviso antes de reagir.'),
  interval:foe.type==='bossonari'?1.18:Math.max(1.04,1.32-.08*BOSS_ROSTER.indexOf(foe.type)-.04*(level-1))};
}
// Padrões próprios incluem repetições; o aviso sempre consulta esta mesma fonte.
export function bossAttackFor(type,fired,round=0) {
 const patterns={haddad:['crouch','jump','jump','crouch','crouch','jump','crouch','jump','jump'],
  lula:['jump','crouch','jump','jump','crouch','crouch','jump','crouch','jump','crouch'],
  xandao:['jump','jump','crouch','jump','crouch','crouch','jump','crouch','jump','crouch','crouch','jump'],
  janones:['jump','crouch','jump','crouch','jump','crouch','jump','jump','crouch'],pf:['jump','crouch','move','jump','crouch','move','jump','crouch'],
  bossonari:['jump','crouch','jump','crouch','jump','jump','crouch','jump','crouch','jump','crouch','jump','crouch','jump']};
 const sequence=patterns[type]||patterns.haddad,index=Math.max(0,Math.floor(Number(fired)||0))+2*Math.floor(Math.max(0,round)/BOSS_ROSTER.length);
 const action=sequence[index%sequence.length];
 return {type:type==='bossonari'?(index%2===0?'cloroquina-prop':'ivermectina-prop'):type==='xandao'?(action==='jump'?'hammer':'mandado'):type==='lula'?'lhand':type==='janones'?'message':type==='pf'?(action==='move'?'falling-case':action==='crouch'?'handcuffs':'barrier'):'receipts',action};
}
// Primeiro marco após21km; cada vitória reserva mais7km de corrida.
// Um marco alcançado fica pendente enquanto houver evento ou cooldown.
function nextBossDistance(count){return 22000+count*7000;}
function takeBoss(run){
 // O bag explícito mantém a seleção determinística usada por integrações/testes.
 if(run.bossBag.length)return run.bossBag.pop();
 if(run.mode==='story'&&run.bossesDefeated===BOSS_ROSTER.length)return 'bossonari';
 return BOSS_ROSTER[run.bossesDefeated%BOSS_ROSTER.length];
}
function beginBoss(run){
 const encounter=run.mode==='story'?storyBossAt(run.bossesDefeated):null;
 const type=run.bossBag.length?takeBoss(run):encounter?.type||takeBoss(run);
 const conf=bossAtRound(run.bossesDefeated,BOSS_GOALS[type]?type:'bossonari');
 run.boss={type:conf.foe.type,name:conf.foe.name,color:conf.foe.color,level:conf.level,supreme:conf.supreme,
  objective:conf.objective,goalKind:conf.goalKind,
  round:conf.round,total:conf.attacks,remaining:conf.attacks,fired:0,interval:conf.interval,nextAttack:1.1,
  hitFlashFor:0,attackFlashFor:0,lastAction:null,actionStreak:0,
  plannedFor:0,plannedAttack:{...bossAttackFor(conf.foe.type,0,conf.round-1),approach:'diagonal'}};
 if(encounter){
  Object.assign(run.boss,encounter,{combat:true,maxHp:encounter.hp,hp:encounter.hp,age:0,phase:'intro',phaseFor:1.1,
   total:encounter.hp,remaining:encounter.hp,fired:0,volleyLeft:0,evaded:0,plannedAttack:arenaPatternFor(encounter,0)});
  run.player.hp=run.player.maxHp;run.heroShots=[];run.pickups=[];
 }else Object.assign(run.boss,{maxHp:conf.attacks*2,hp:conf.attacks*2,age:0,classId:'sovereign',className:'Soberano',rank:Math.min(4,conf.level),rankName:'Infinito'});
 run.boss.reducedMotion=run.reducedMotion===true;
 run.obstacles=[];run.nextObstacle=Math.max(1.8,run.nextObstacle);
 const final=encounter?.index===STORY_BOSS_COUNT-1;
 announce(run,(final?'CHEFÃO FINAL ':'CHEFÃO ')+run.boss.name+'! '+run.boss.objective);
}
function chooseBossPattern(boss,rng,pressure){
 if(boss.type==='pf'&&boss.fired%3===2)return {type:'falling-case',action:'move',approach:'vertical'};
 // A abertura ensina o tipo de ameaça; depois o próprio chefe improvisa.
 if(boss.fired<3)return {...bossAttackFor(boss.type,boss.fired,boss.round-1),approach:'diagonal'};
 if(boss.type==='bossonari'){
  // O fantasma é participante ativo: depois de aprender os frascos,
  // alterna investidas aéreas próprias e os disparos do aliado Bossonari.
  if(boss.fired%3===0)return {type:'meme-ghost',action:'crouch',approach:'sweep'};
  return {type:random(rng)<.5?'cloroquina-prop':'ivermectina-prop',action:random(rng)<.5?'jump':'crouch',approach:random(rng)<.38?'drop':'diagonal'};
 }
 let action=random(rng)<(.48+.06*pressure)?'crouch':'jump';
 if(action===boss.lastAction&&boss.actionStreak>=2)action=action==='jump'?'crouch':'jump';
 const type=boss.type==='xandao'?(action==='jump'?'hammer':'mandado'):
  boss.type==='lula'?'lhand':boss.type==='janones'?'message':boss.type==='pf'?(action==='crouch'?'handcuffs':'barrier'):(action==='jump'&&random(rng)<.48?'stamp':'receipts');
 const approach=action==='jump'&&random(rng)<.48?'drop':action==='crouch'&&random(rng)<.45?'sweep':'diagonal';
 return {type,action,approach};
}
function advanceBoss(run,dt,rng,balance){
 const boss=run.boss;if(!boss)return;
 boss.attackFlashFor=Math.max(0,boss.attackFlashFor-dt);
 boss.hitFlashFor=Math.max(0,(boss.hitFlashFor||0)-dt);
 if(boss.combat){
  // Recuperação só após o lançamento efetivo, não seu agendamento.
  if(boss.phase==='attack'&&boss.volleyLeft<=0&&(boss.attackFlashFor>0||run.obstacles.some(o=>o.bossAttack&&o.projectile&&!o.launched&&o.waitFor>0))){boss.age+=dt;return;}
  stepBossPhase(boss,dt);
  if(boss.phase!=='attack'||boss.volleyLeft<=0)return;
 }else boss.age=(boss.age||0)+dt;
 boss.nextAttack-=dt;
 if(!boss.combat&&boss.fired>=boss.total||boss.nextAttack>0)return;
 if(run.obstacles.filter(o=>!o.passed&&!o.counted).length>=5){boss.nextAttack=.12;return;}
 // Cada chefão ataca com suas armas; o disparo do herói é independente.
 const pattern=boss.combat?arenaPatternFor(boss,boss.fired):boss.plannedFor===boss.fired?boss.plannedAttack:bossAttackFor(boss.type,boss.fired,boss.round-1);
 const attackType=pattern.type;
 let attack;
 if(pattern.action==='move'){
  attack=spawnFallingThreat(run,{bossAttack:true,owner:boss.type});if(!attack){boss.nextAttack=.1;return;}
 }else{
 const [width,baseHeight]=({hammer:[46,44],mandado:[42,44],
  lhand:[60,46],receipts:[44,40],stamp:[44,36],message:[44,36],microphone:[46,40],handcuffs:[46,40],barrier:[44,32],wind:[46,44],'budget-sheets':[46,42],'parachute-cross':[46,44],'rolling-case':[40,30],'falling-case':[36,36],'cloroquina-prop':[52,38],'ivermectina-prop':[52,38],'meme-ghost':[52,44]})[attackType];
 const height=pattern.action==='crouch'?84:baseHeight;
 const x=Math.max(boss.combat?bossArenaPose(boss,visibleWidth(run)).x-48-width/2:visibleWidth(run)-104,frontContact(run)+60);
 const entry=pattern.approach||'diagonal';
 const fromY=boss.combat?bossArenaPose(boss,visibleWidth(run)).platformY+52:entry==='drop'?155:pattern.action==='jump'?77:90;
 const toY=pattern.action==='jump'?(entry==='drop'?22:PLAYER.height/2):90;
 attack={x,width,height,type:attackType,action:pattern.action,owner:boss.type,bossAttack:true,counted:false,
  approach:entry,flightStyle:projectileStyle(attackType),...threatMotion(run,x,balance.bossApproach),
  projectile:true,launchX:x+width/2,targetX:playerX(run)+PLAYER.width/2,
  launchY:fromY,targetY:toY,y:fromY};
 run.obstacles.push(attack);
 }
 if(boss.type==='bossonari')run.phantomCloud={remaining:1.3,medicine:attackType,x:Math.max(180,Math.min(visibleWidth(run)-150,playerX(run)+260))};
 // Projéteis com espera ainda estão em preparação. O loop de movimento
 // aciona a pose de disparo quando a espera termina, junto do corpo físico.
 if(!attack.projectile||!(attack.waitFor>0)){boss.attackFlashFor=.26;boss.lastWeapon=attackType;boss.lastReleasedAction=pattern.action;}
 boss.fired++;
 boss.actionStreak=pattern.action===boss.lastAction?(boss.actionStreak||0)+1:1;
 boss.lastAction=pattern.action;
 boss.plannedFor=boss.fired;
 boss.plannedAttack=boss.combat?arenaPatternFor(boss,boss.fired):chooseBossPattern(boss,rng,balance.pressure);
 boss.nextAttack+=boss.interval+random(rng)*.22+(boss.type==='janones'&&boss.fired%Math.ceil(boss.total/3)===0?.55:0);
 if(boss.combat&&--boss.volleyLeft<=0)boss.phaseFor=Math.max(.24,boss.interval*.55);
 return attack;
}
function resolveBossDodges(run){
 if(!run.boss)return;
 for(const o of run.obstacles)if(o.bossAttack&&!o.counted&&(o.falling?o.age>=o.warningFor+o.fallFor:o.x+o.width<playerX(run))){o.counted=true;if(run.boss.combat)run.boss.evaded++;else run.boss.remaining--;}
 const boss=run.boss;
 if(boss.combat?boss.hp>0:!(Number.isFinite(boss.hp)&&boss.hp<=0)&&(boss.fired<boss.total||boss.remaining>0))return;
 run.lastBoss=boss.type;run.boss=null;run.bossesDefeated++;run.bossCooldown=4;
 run.heroShots=[];run.player.attackHeld=false;run.obstacles=[];run.player.hp=run.player.maxHp;
 if(run.mode==='story'&&run.bossesDefeated>=STORY_BOSS_COUNT){
  run.status='ballot';run.nextBossAt=Infinity;run.obstacles=[];run.pickups=[];run.phantomCloud=null;
  run.ballot={digits:'',message:''};clearRunInput(run);
  announce(run,'ETAPA FINAL: confirme o código na urna fictícia.');
  return;
 }
 run.nextBossAt=run.mode==='story'?nextStoryBossDistance(run.bossesDefeated):Math.max(nextBossDistance(run.bossesDefeated),run.routeDistance+7000);run.nextObstacle=Math.max(1.8,run.nextObstacle);
 announce(run,run.mode==='story'?'Você derrotou '+boss.name+'! '+run.bossesDefeated+'/'+STORY_BOSS_COUNT+' confrontos vencidos. '+(run.bossesDefeated%4===0?'Cenário concluído.':'Continue para o próximo confronto.'):
  'Você escapou do chefão '+boss.name+'! '+(run.bossesDefeated%BOSS_ROSTER.length===0?'Cinco chefões superados nesta sequência.':'Continue fugindo.'));
}
function advanceRaid(run,dt,rng){
 if(run.raid){
  const raid=run.raid;raid.remaining=Math.max(0,raid.remaining-dt);
  if(raid.remaining<=1e-8){
   if(raid.phase==='warning'){raid.phase='active';raid.remaining=RAID_TIMING.activeFor;announce(run,'Toc, toc, toc… é a Polícia Federal! Pule a PF e abaixe dos microfones por dez segundos.');}
   else if(raid.phase==='active'){raid.phase='recovery';raid.recoveryFor=raid.recoveryFor||RAID_TIMING.recoveryFor;raid.remaining=raid.recoveryFor;announce(run,'A perseguição especial terminou. O ritmo normal está voltando.');}
   else{run.raid=null;run.nextRaid=26+random(rng)*10;run.bossCooldown=Math.max(2.5,run.bossCooldown);}
  }return;
 }
 run.nextRaid-=dt;
 if(run.player.isJacare||run.boss||run.bossCooldown>0||stageTransitionAt(routeClock(run)).active||
  run.mode==='story'&&storyApproachAt(run.routeDistance,run.bossesDefeated))return;
 if(run.nextRaid<=0){
  const choices=RAID_FACTS.map((_,i)=>i).filter(i=>i!==run.lastFact);
  const factIndex=choices[Math.floor(random(rng)*choices.length)];run.lastFact=factIndex;
  run.raid={phase:'warning',remaining:RAID_TIMING.warningFor,recoveryFor:RAID_TIMING.recoveryFor,factIndex,id:++run.raids,waves:0};
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
  y:obstacle.action==='crouch'?18:100,type:item.type,value:item.value,speed:obstacle.speed,waitFor:obstacle.waitFor||0,anchor:obstacle});
}
function rehearseStoryBoss(run,balance){
 const approach=storyApproachAt(run.routeDistance,run.bossesDefeated);
 if(!approach||approach.phase!=='rehearsal'||run.rehearsedBoss===approach.boss.id||
  run.obstacles.some(o=>!o.passed&&!o.counted))return;
 const b=approach.boss,pattern=arenaPatternFor(b,0),width=44,x=visibleWidth(run)+40;
 // Um exemplo isolado da arma, com a mesma geometria de evasão do combate.
 // Não acrescenta um prêmio, uma segunda onda nem um tutorial que interrompa.
 const o={x,width,height:40,type:pattern.type,action:'jump',sourceActor:b.type,rehearsal:true,
  approach:'diagonal',projectile:true,flightStyle:projectileStyle(pattern.type),launchX:x+width/2,
  targetX:playerX(run)+PLAYER.width/2,launchY:84,targetY:PLAYER.height/2,y:84,
  ...threatMotion(run,x,balance.obstacleApproach)};
 run.obstacles.push(o);run.spawnedObstacles++;run.rehearsedBoss=b.id;
 run.cameo={type:b.type,remaining:1.4};return o;
}
export function advanceRun(run,seconds,rng){
 if(run.status!=='running'||!Number.isFinite(seconds)||seconds<=0)return;
 if(typeof rng!=='function')rng=run.randomState===null||run.randomState===undefined?Math.random:()=>{run.randomState=nextSeed(run.randomState);return run.randomState/4294967296;};
 const dt=Math.min(seconds,.05);run.elapsed+=dt;
 const bounds=playerBounds(run);
 const entering=run.boss?.combat&&run.boss.phase==='intro'&&playerX(run)>visibleWidth(run)-245;
 run.player.x=entering?Math.max(visibleWidth(run)-245,playerX(run)-230*dt):Math.max(bounds.min,Math.min(bounds.max,playerX(run)+(run.player.moveHeld||0)*230*dt));
 advanceAllies(run,dt);
 if(run.player.isJacare){
  run.player.jacareAge=Math.min(JACARE_DURATION_SECONDS,run.player.jacareAge+dt);
  if(run.player.jacareAge>=JACARE_DURATION_SECONDS-1e-8){
   run.player.isJacare=false;
   run.player.restoreFlashFor=JACARE_RESTORE_FLASH;
   run.graceFor=Math.max(run.graceFor,JACARE_RESTORE_GRACE);
   run.player.jumpBufferedUntil=0;run.player.crouchHeld=false;run.player.crouching=false;
   announce(run,'A transformação fictícia terminou após 10 segundos. Flávio voltou à corrida normal.');
  }
 }
 run.player.restoreFlashFor=Math.max(0,run.player.restoreFlashFor-dt);
 if(run.nextBossAt===null)run.nextBossAt=run.mode==='story'?nextStoryBossDistance(0):nextBossDistance(0);
 if(run.nextRaid===null)run.nextRaid=18+random(rng)*12;
 const balance=difficultyAt(run.distance,run.elapsed),travel=balance.speed*assistance(run)*dt;run.distance+=travel;
 if(!run.boss?.combat){
  const stop=run.mode==='story'&&Number.isFinite(run.nextBossAt)&&run.routeDistance<=run.nextBossAt?run.nextBossAt:Infinity;
  run.routeDistance=Math.min(stop,run.routeDistance+travel);
 }
 run.bossCooldown=Math.max(0,run.bossCooldown-dt);
 if(run.phantomCloud){run.phantomCloud.remaining=Math.max(0,run.phantomCloud.remaining-dt);if(!run.phantomCloud.remaining)run.phantomCloud=null;}
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
  if(obstacle.groundHazard){obstacle.age+=dt;continue;}
  if(obstacle.falling){
   obstacle.age+=dt;
   const progress=Math.max(0,Math.min(1,(obstacle.age-obstacle.warningFor)/obstacle.fallFor));
   obstacle.y=310-342*progress;
   continue;
  }
  const waiting=obstacle.waitFor||0,activeDelta=Math.max(0,dt-waiting);
  // A espera ainda é preparação. Comprometer a mira somente ao disparar
  // evita arcos altos involuntários após uma esquiva lateral obrigatória.
  if(obstacle.projectile&&activeDelta>0){
   if(!obstacle.launched&&waiting>0)obstacle.targetX=playerX(run)+PLAYER.width/2;
   if(!obstacle.launched&&obstacle.bossAttack&&run.boss){run.boss.attackFlashFor=.26;run.boss.lastWeapon=obstacle.type;run.boss.lastReleasedAction=obstacle.action;}
   obstacle.launched=true;
  }
  obstacle.waitFor=Math.max(0,waiting-dt);
  obstacle.x-=Number.isFinite(obstacle.speed)?obstacle.speed*activeDelta:travel;
  if(obstacle.projectile){
   const landingX=obstacle.targetX+PLAYER.width/2-6+obstacle.width/2;
   const span=Math.max(1,obstacle.launchX-landingX);
   const progress=Math.max(0,Math.min(1,(obstacle.launchX-(obstacle.x+obstacle.width/2))/span));
   obstacle.y=obstacle.launchY+(obstacle.targetY-obstacle.launchY)*progress;
  }
  const left=playerX(run)+(run.player.isJacare?-15:5),right=playerX(run)+(run.player.isJacare?PLAYER.width+17:PLAYER.width-3);
  if(obstacle.speed>0&&obstacle.x+obstacle.width-3<=left||obstacle.speed<0&&obstacle.x+3>=right)obstacle.passed=true;
 }
 for(const pickup of run.pickups){
  const activeDelta=Math.max(0,dt-(pickup.waitFor||0));pickup.waitFor=Math.max(0,(pickup.waitFor||0)-dt);
  pickup.x-=Number.isFinite(pickup.speed)?pickup.speed*activeDelta:travel;
 }
 advanceHeroShots(run,dt);
 resolveBossDodges(run);
 if(run.status!=='running')return;
 run.obstacles=run.obstacles.filter(o=>o.groundHazard?o.age<o.warningFor+o.activeFor:o.falling?o.age<o.warningFor+o.fallFor+.25:o.approach==='rear'?o.x<playerX(run)+PLAYER.width+80:o.x+o.width>-20);
 run.pickups=run.pickups.filter(p=>p.x>-30);
 // Uma Joice já vencida tem prioridade sobre o próximo marco de chefe.
 advanceRaid(run,dt,rng);
 if(!run.player.isJacare&&!run.boss&&!run.raid&&run.bossCooldown<=0&&run.routeDistance>=run.nextBossAt&&(run.mode==='story'||!stageTransitionAt(routeClock(run)).active))beginBoss(run);
 let anchor;
 if(run.player.isJacare){
  // Sem salto normal, o evento pede reposicionamento, não obstáculos saltáveis.
  run.player.nextJacareThreat-=dt;
  if(run.player.jacareAge>=JACARE_ENTRY_GRACE&&run.player.jacareAge<=JACARE_DURATION_SECONDS-2.4&&run.player.nextJacareThreat<=0){
   const volley=spawnJacareVolley(run,{rng});
   anchor=volley[0]||null;
   run.player.nextJacareThreat=anchor?1.7+random(rng)*.7:.12;
  }
 }else if(run.boss)anchor=advanceBoss(run,dt,rng,balance);
 else if(run.mode==='story'&&!run.raid&&storyApproachAt(run.routeDistance,run.bossesDefeated)){
  anchor=rehearseStoryBoss(run,balance);
  run.nextObstacle=Math.max(run.nextObstacle,1.5);
 }
 else{
  run.nextObstacle-=dt;
  if(run.nextObstacle<=0&&run.obstacles.filter(o=>!o.passed&&!o.counted).length<5){
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
   if(raidActive&&(run.raid.waves||0)>0&&random(rng)<.25&&run.raid.remaining>3){
    anchor=spawnFallingThreat(run);
    if(anchor&&anchor.warningFor+anchor.fallFor>run.raid.remaining-.2){run.obstacles=run.obstacles.filter(o=>o!==anchor);anchor=null;}
   }
   if(!anchor&&!raidActive&&run.elapsed>=12&&random(rng)<.13+.09*balance.pressure)anchor=spawnManholeThreat(run,{rng});
   if(anchor){/* A zona local já entrou no mundo com um aviso comprometido. */}
   else if(action==='crouch'){
    const performers=unlockedCharacters(balance.level,'overhead');
    const type=raidActive?'joice':chooseProgressiveCharacter(performers,rng,run.seenOverheadActors,run.lastOverheadActor);
    if(!raidActive){
     if(!run.seenOverheadActors.includes(type))run.seenOverheadActors.push(type);
     run.lastOverheadActor=type;run.overheadCount++;
    }
    const attackType={dilma:'wind',simone:'budget-sheets',soraya:'parachute-cross','meme-army':'meme-ghost',joice:'handcuffs'}[type];
    anchor={x,width:46,height:72,type:attackType,action,sourceActor:type,projectile:true,
     flightStyle:projectileStyle(attackType),launchX:x+23,targetX:playerX(run)+17,launchY:84,targetY:84,y:84,...threatMotion(run,x,approach,visibleWidth(run))};
    if(!raidActive)run.cameo={type,remaining:1.4};
   }else{
    const selected=raidActive?foeFor('pf'):pursuitAt(routeClock(run),rng,balance.level,run.seenGroundActors,run.lastGroundActor);
    const foe=run.supportAvailable===false&&['boulos','dino'].includes(selected.type)?foeFor('pf'):selected;
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
      approach:'rear',...rearMotion(run,start,width)};
    }else if(falling){
     anchor={x,width:36,height:36,type:'falling-case',action:'jump',approach:'drop',
      ...threatMotion(run,x,approach,visibleWidth(run)),projectile:true,
      flightStyle:'fall',launchX:x+18,targetX:playerX(run)+17,launchY:160,targetY:24,y:160};
    }else{
     const type=rolling?'rolling-case':popcorn?'popcorn':foe.type;
     anchor={x,width:rolling?40:popcorn?40:foe.width,
      height:rolling?30:popcorn?35:foe.height,type,action,
      approach:rolling?'rolling':'front',...threatMotion(run,x,approach,visibleWidth(run))};
    }
    if(!raidActive&&anchor.type===foe.type){
     if(!run.seenGroundActors.includes(foe.type))run.seenGroundActors.push(foe.type);
     run.lastGroundActor=foe.type;
    }
   }
   if(!anchor.falling&&!anchor.groundHazard)run.obstacles.push(anchor);run.spawnedObstacles++;
   if(raidActive)run.raid.waves=(run.raid.waves||0)+1;
   run.attackStyles.push(anchor.approach||'overhead');
   if(run.attackStyles.length>16)run.attackStyles.shift();
   const gap=raidActive ? .98-.08*balance.pressure:run.raid?.phase==='recovery'?
    (.98-.08*balance.pressure)+(balance.obstacleGap-.98+.08*balance.pressure)*Math.max(0,Math.min(1,1-run.raid.remaining/(run.raid.recoveryFor||RAID_TIMING.recoveryFor))):balance.obstacleGap;
   // Microvariação de intervalo aumenta a incerteza sem criar colisões inevitáveis.
   // A aproximação de cada perigo ainda passa pelo limitador de 0,82 s.
   run.nextObstacle+=gap+(raidActive?random(rng)*.04:random(rng)*(.16+.06*(1-balance.pressure)));
  }
 }
 if(!run.boss&&!run.raid&&run.routeDistance>=run.nextAllyAt){
  run.pickups.push({type:'ze-gotinha',x:visibleWidth(run)+40,y:20,speed:balance.speed*assistance(run),value:0});
  run.nextAllyAt+=35000;run.alliesMet++;
 }
 if(run.supportAvailable!==false&&!run.boss&&!run.raid&&run.routeDistance>=run.nextSupportAt&&!run.pickups.some(p=>p.type==='ally')){
  const ally=allyForStage(stageAt(routeClock(run)).index,run.allyVisits,rng);
  run.pickups.push({type:'ally',allyId:ally.id,x:visibleWidth(run)+40,y:20,speed:balance.speed*assistance(run),value:0});
  run.nextSupportAt=run.routeDistance+14000;
 }
 run.nextPickup-=dt;run.nextPassport-=dt;run.nextPower-=dt;
 if(!anchor?.rehearsal&&anchor?.approach!=='rear'&&!anchor?.falling&&!anchor?.groundHazard)rewardForObstacle(run,anchor,balance,rng);
 const left=playerX(run)+5,right=playerX(run)+PLAYER.width-3,bottom=run.player.y+3,
  top=run.player.y+(run.player.crouching||run.player.isJacare?25:PLAYER.height-5);
 // Coleta antes do impacto: o escudo ou o centésimo passaporte já valem neste frame.
 run.pickups=run.pickups.filter(p=>{
  const hit=right>p.x-12&&left<p.x+12&&top>p.y-12&&bottom<p.y+12;
  if(hit){
   run.collected++;run.lastPickup=p.type;
   if(p.type==='ally')collectAlly(run,p.allyId);
   if(p.type==='ze-gotinha'){
    run.obstacles=run.obstacles.filter(o=>o.bossAttack);
    run.nextObstacle=Math.max(JACARE_ENTRY_GRACE,run.nextObstacle);
    run.graceFor=Math.max(run.graceFor,JACARE_ENTRY_GRACE);
    run.player.isJacare=true;run.player.jacareAge=0;run.player.nextJacareThreat=JACARE_ENTRY_GRACE;run.player.restoreFlashFor=0;
    run.player.crouching=false;run.player.crouchHeld=false;run.player.jumpBufferedUntil=0;
    announce(run,'Zé Gotinha: jacaré por 10 segundos! Continue correndo e desvie lateralmente de ampolas cenográficas da Pfizer espalhadas pela pista. Vacinas não causam essa transformação.');
   }
   if(p.type==='shield'){run.shieldFor=6;announce(run,'Escudo das Américas! Proteção por 6 segundos.');}
   if(p.type==='passport'&&++run.passports%100===0){run.lives++;announce(run,'100 passaportes! Uma vida extra; total: '+run.lives+'.');}
  }return !hit;
 });
 // A largura visual do jacaré é de aproximadamente 70 px (120-15 a 154+17).
 // O humano mantém as margens antigas para preservar o restante da física.
 const collisionLeft=run.player.isJacare?playerX(run)-15:left;
 const collisionRight=run.player.isJacare?playerX(run)+PLAYER.width+17:right;
 const hit=run.shieldFor<=0&&run.graceFor<=0&&run.obstacles.find(o=>!o.passed&&!o.counted&&(!o.projectile||o.launched||!(o.waitFor>0))&&(!(o.falling||o.groundHazard)||o.age>=o.warningFor)&&
  collisionRight>o.x+3&&collisionLeft<o.x+o.width-3&&(
   o.projectile||o.falling?(bottom<o.y+o.height/2&&top>o.y-o.height/2):(bottom<o.height&&top>0)
  ));
 if(hit){
  run.lastHit={type:hit.type,action:hit.action||(hit.projectile&&(hit.targetY??hit.y)>50?'crouch':'jump')};
  if(run.boss?.combat&&--run.player.hp>0){
   hit.counted=true;run.graceFor=1.1;announce(run,'Atingido! Energia '+run.player.hp+'/'+run.player.maxHp+'.');return;
  }
  run.lives--;announce(run,run.lives>0?'Vida extra usada! Restam '+run.lives+'.':'Foi pego pela Polícia Federal! A fuga fictícia terminou.');
  if(run.lives<=0){run.status='over';run.heroShots=[];clearRunInput(run);return;}run.player.hp=run.player.maxHp;run.graceFor=RECOVERY_AFTER_EXTRA;
 }
}
