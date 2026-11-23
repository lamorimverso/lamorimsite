import {stageRouteTravel,RAID_HANDOFF_SECONDS,PAIR_RUN_DISTANCE,pairRunRemaining} from './runner-stage-director.mjs?v=071886f07909';
export {stagePlanFor} from './runner-stage-director.mjs?v=071886f07909';
import {HERO_MAX_HP,playerBodyFor} from './runner-body.mjs?v=57ec474fca38';
import {createMovementSkills,movementProfileFor,rewardMovementVictory} from './runner-movement-skills.mjs?v=d0ad734b4838';
export {movementProfileFor} from './runner-movement-skills.mjs?v=d0ad734b4838';
export {terrainProfileFor} from './runner-terrain.mjs?v=47a8f957733b';
import {TERRAIN,STORY_DASH_RECOVERY_SECONDS,createTerrain,beginTerrain,beginGroundLesson,beginAirTransfer,aircraftHitFor,terrainReservationFor,translateTerrain,advanceSlide,advanceTerrain,stepTerrainPlayer} from './runner-terrain.mjs?v=47a8f957733b';
export {terrainSupportAt} from './runner-terrain.mjs?v=47a8f957733b';
import {stageRosterFor} from './runner-stage-roster.mjs?v=3f963f6dd2ce';
import {groundRhythmFor,groundStyleFor} from './runner-ground-rhythm.mjs?v=c282904db6c6';
import {ROUTE_AMMO,advanceAmmo,addShieldPart} from './runner-supplies.mjs?v=44c67e8a5802';
import {heroPowerFor,grantBossPower,equipHeroPower,cycleHeroPower} from './runner-earned-powers.mjs?v=9c3a03f65c5f';
export {grantBossPower,equipHeroPower,cycleHeroPower} from './runner-earned-powers.mjs?v=9c3a03f65c5f';
import {createStoryRoomState,spawnStageEnemies,stepStageEnemies,constrainStageAdvance,stepStoryRooms,restoreStoryCheckpoint,stageHazardHit} from './runner-story-rooms.mjs?v=420bf36998ec';
import {STAGES,STORY_STAGES,SCENE_DISTANCE,SCENE_SECONDS,ROUTE_DISTANCE} from './runner-route-data.mjs?v=c4fcfde513ff';
export {STAGES,STORY_STAGES,SCENE_DISTANCE,SCENE_SECONDS,ROUTE_DISTANCE} from './runner-route-data.mjs?v=c4fcfde513ff';
import {BOSS_RANKS,bossProfileFor,bossWeaponFor} from './runner-boss-profiles.mjs?v=740e8ab135c4';
import {combatGeometryFor} from './runner-combat-geometry.mjs?v=bb7820d6e288';
import {retainMovingThreat} from './runner-visibility.mjs?v=ae4d37b77be7';
import {HERO_SHOT_DURATION,DUEL_CHARGE_SECONDS,heroShotPose} from './runner-hero-shot.mjs?v=7aa1e19e9838';
import {regularCastMuzzle} from './runner-cast-pose.mjs?v=8f2c5aee1585';
import {allyForStage,collectAlly,advanceAllies} from './runner-allies.mjs?v=d3b6a81b34b9';
import {ARCHIVE_VOICES} from './runner-voice-data.mjs?v=d5e017561fd6';
import {BOSS_ARENA_RESERVE,BOSS_RUN_INTERVAL,BOSS_CLASSES,STORY_ENCOUNTERS,STORY_OPENING_DISTANCE,storyBossAt,optionalStoryBossAt,nextStoryBossDistance,storyApproachAt,arenaPatternFor,bossCounterWindow,bossArenaPose,stepBossPhase} from './runner-bosses.mjs?v=f8107568ec3b';
export {STORY_OPENING_DISTANCE} from './runner-bosses.mjs?v=f8107568ec3b';
export {bossArenaPose} from './runner-bosses.mjs?v=f8107568ec3b';
// Mundo lógico fixo: física, sorteios e temporizadores independem da tela e do FPS.
import {bossStopsAutoRun} from './runner-drawn-motion.mjs?v=0d1971800c55';
export const WORLD = Object.freeze({width:900,height:300,ground:246});
// Envelope de todas as poses no atlas a .95 de escala, incluindo o agachamento.
// A mesma margem serve ao jacaré e evita deslocar o herói ao trocar de postura.
export const PLAYER = Object.freeze({x:120,width:34,height:58,visualLeft:-26,visualRight:75});
export const JACARE_RECOVERY_SECONDS = 10;
export const GAME_MODES = Object.freeze(['endless','story']);
export const STORY_BOSS_COUNT = STORY_ENCOUNTERS;
export const PASSPORTS_PER_LIFE = 100;
export const STARTING_LIVES = 1;
export const RECOVERY_AFTER_EXTRA = 1.2;
const RAID_WARNING_FOR=1.2,RAID_ACTIVE_FOR=10,RAID_AUDIO_MARGIN_FOR=1;
// A fala começa no aviso. O retorno reserva seu fim e uma margem de carga,
// sem alongar os dez segundos de perigos ativos.
export const RAID_TIMING=Object.freeze({warningFor:RAID_WARNING_FOR,activeFor:RAID_ACTIVE_FOR,audioMarginFor:RAID_AUDIO_MARGIN_FOR,
 recoveryFor:Math.max(2,(Number(ARCHIVE_VOICES.joice.durationSeconds)||0)+RAID_AUDIO_MARGIN_FOR-RAID_WARNING_FOR-RAID_ACTIVE_FOR)});
export const PURSUERS = Object.freeze([
 {type:'pf',name:'Polícia Federal',short:'PF',width:34,height:44,color:'#284c70'},
 {type:'janones',name:'Janones',short:'Janones',width:36,height:46,color:'#346a9c'},
 {type:'army',name:'Exército',short:'Exército',width:40,height:47,color:'#64734c'},
 {type:'meme-army',name:'Exército de memes do Lula',short:'Memes',width:46,height:44,color:'#b44d67'},
 {type:'bossonari',name:'Bossonari',short:'Bossonari',width:56,height:58,color:'#7a4f8d'},
 {type:'boulos',name:'Boulos',short:'Boulos',width:38,height:46,color:'#765488'},
 {type:'dino',name:'Flávio Dino',short:'Dino',width:40,height:48,color:'#8a6247'},
 {type:'xandao',name:'Xandão',short:'Xandão',width:40,height:49,color:'#493f62'},
 {type:'haddad',name:'Haddad',short:'Taxad',width:40,height:48,color:'#286779'},
 {type:'lula',name:'Lula',short:'Lula',width:46,height:50,color:'#aa3c50'},
 {type:'dilma',name:'Dilma Rousseff',short:'Dilma',width:36,height:46,color:'#b74250'},
 {type:'simone',name:'Simone Tebet',short:'Simone',meme:'Gostosas do Lula',memeKind:'adesivo cenográfico; não fala autêntica',width:36,height:46,color:'#586fa2'},
 {type:'soraya',name:'Soraya Thronicke',short:'Soraya',width:38,height:46,color:'#866548'},
 {type:'orla-runner',name:'Patrulheiro da orla',short:'Orla',width:38,height:44,color:'#417382'},
 {type:'paulista-runner',name:'Corredor da Paulista',short:'Paulista',width:37,height:43,color:'#8375a4'},
 {type:'route-scout',name:'Batedor da rota',short:'Batedor',width:38,height:45,color:'#96805a'},
 {type:'terminal-guard',name:'Guarda do terminal',short:'Terminal',width:37,height:44,color:'#567889'},
 {type:'arrow-panel',name:'Painel de setas',short:'Painel',width:39,height:33,color:'#725bb4'},
 {type:'lula-runner',name:'Corredor do Exército do Lula',short:'Corredor',width:38,height:45,color:'#ab4556'},
 {type:'ze-gotinha-rival',name:'Zé Gotinha rival',short:'Gotinha rival',width:32,height:43,color:'#8f477f'},
 {type:'meme-ghost',name:'Aparição do Fantasma',short:'Aparição',width:42,height:42,color:'#8f477f'},
 {type:'barrier',name:'Barreira',short:'Barreira',width:44,height:32,color:'#c48845'},
 {type:'case',name:'Mala',short:'Mala',width:38,height:36,color:'#906490'}
].map((p,index)=>Object.freeze({...p,index})));
export const BOSS_ROSTER = Object.freeze(['haddad','lula','xandao','janones','pf']);
const BOSS_GOALS = Object.freeze({
 haddad:{attacks:9,goalKind:'papers'},
 lula:{attacks:10,goalKind:'patterns'},
 xandao:{attacks:12,goalKind:'hammer-mandado'},janones:{attacks:9,goalKind:'urgent'},pf:{attacks:8,goalKind:'blitz'},
 army:{attacks:8,goalKind:'flares'},bossonari:{attacks:14,goalKind:'phantoms'}
});
export const PICKUPS = Object.freeze([
 Object.freeze({type:'passport',name:'Passaporte',value:10,purpose:'100 passaportes = +1 continuação'}),
 Object.freeze({type:'shield',name:'Parte de escudo',value:0,purpose:'6 partes = 1 escudo de reserva'}),
 Object.freeze({type:'ze-gotinha',name:'Zé Gotinha',value:0,purpose:'Transforma Flávio em jacaré fictício por dez segundos, com recuperação automática e breve proteção inicial'}),
 Object.freeze({type:'rachadinha',name:'Rachadinha',value:0,purpose:'Pacote cenográfico raro que restaura a forma normal'})
]);
// Chefões atacam por iniciativa própria; Flávio dispara, desvia e gerencia suprimentos.
// Texto de roteiro ficcional, sem atribuir gravações/falas autênticas à personagem.
export const RAID_FACTS = Object.freeze([
 {title:'Denúncia · 2020',text:'Em 2020, o MP-RJ apresentou denúncia contra Flávio no caso das rachadinhas.',source:'MP-RJ · 04/11/2020',url:'https://www.mprj.mp.br/web/guest/visualizar?noticiaId=96203'},
 {title:'Decisão · 2021',text:'Em 2021, o STF anulou quatro relatórios do Coaf usados no caso.',source:'STF · 30/11/2021',url:'https://portal.stf.jus.br/noticias/verNoticiaDetalhe.asp?idConteudo=477496'},
 {title:'Arquivo · 2020',text:'Fabrício Queiroz e outros 15 investigados também foram denunciados pelo MP-RJ.',source:'MP-RJ · 04/11/2020',url:'https://www.mprj.mp.br/web/guest/visualizar?noticiaId=96203'}
].map(Object.freeze));
const POOLS = [
 ['pf','barrier','janones','boulos','army'],['janones','army','barrier','pf'],
 ['pf','barrier','case','dino','army'],['army','pf','case','janones'],['army','pf','case'],['pf','janones','army','dino','case','barrier']
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
const foeFor = type => PURSUERS.find(p=>p.type===type)||null;
// Mantém stageAt em escala de 20 unidades por cenário, mas o percurso real
// é SCENE_DISTANCE metros. Assim o cenário exige 7 km de fuga, não 20 s fixos.
export const campaignRouteDistance = run => Math.max(0,run.routeDistance-(run.mode==='story'?STORY_OPENING_DISTANCE:0));
const routeClock = run => campaignRouteDistance(run) / SCENE_DISTANCE * SCENE_SECONDS;
export const routeStagesFor=run=>run.mode==='story'?STORY_STAGES:STAGES;
export const routeStageFor=run=>stageAt(routeClock(run),routeStagesFor(run));
function groundLessonRoute(stages,offset){
 return Object.freeze({lessonAt:offset+2*SCENE_DISTANCE+760,lessonExit:offset+2*SCENE_DISTANCE+1180,lessonStage:stages[2]});
}
const STORY_LESSON=groundLessonRoute(STORY_STAGES,STORY_OPENING_DISTANCE),ENDLESS_LESSON=groundLessonRoute(STAGES,0);
const groundLessonFor=run=>run.mode==='story'?STORY_LESSON:ENDLESS_LESSON;
const lessonPending=run=>!run.practice&&!run.terrain?.lessonCompleted&&Number.isFinite(run.terrain?.nextAt);
function nextAirTransfer(run){
 if(run.practice||!Number.isFinite(run.terrain?.nextAt))return null;
 const stageIndex=Math.floor(campaignRouteDistance(run)/SCENE_DISTANCE),stages=routeStagesFor(run),story=run.mode==='story';
 // Only the first two departures stay on land. A new endless lap may fly
 // even through those same places after the original lesson is behind it.
 if(stageIndex<2||story&&stageIndex+1>=stages.length)return null;
 const from=stages[stageIndex%stages.length],to=stages[(stageIndex+1)%stages.length];
 const changesRegion=from.region&&to.region&&from.region!==to.region;
 if(from.country===to.country&&!changesRegion)return null;
 const arrival=(story?STORY_OPENING_DISTANCE:0)+(stageIndex+1)*SCENE_DISTANCE;
 return {from,to,boardAt:arrival-1400,arrival};
}
export function routeTransitionFor(run){
 const stages=routeStagesFor(run),flight=run.terrain?.active?.flight,arrival=run.terrain?.lastFlightArrival;
 if(flight){
  const from=stages.find(stage=>stage.id===flight.from),to=stages.find(stage=>stage.id===flight.to);
  if(from&&to)return {from,to,progress:flight.progress,active:true,kind:'air-transfer',phase:flight.phase};
 }
 const distance=run.routeDistance-arrival;
 if(Number.isFinite(arrival)&&distance>=0&&distance<SCENE_DISTANCE*.1){
  const stage=routeStageFor(run);return {from:stage,to:stage,progress:1,active:false};
 }
 return stageTransitionAt(routeClock(run),stages);
}

const MIN_VIEWPORT_WIDTH=480;
const visibleWidth = run => Math.max(MIN_VIEWPORT_WIDTH,Math.min(900,Number(run.viewportWidth)||WORLD.width));
const announce = (run,text) => {run.event=text;run.events++;};
const assistance = run => run.assisted ? .82 : 1;
// Primeiro contato horizontal usa o mesmo recuo de 3 px da colisão abaixo.
export const playerX = run => Number.isFinite(run.player.x)?run.player.x:PLAYER.x;
const arenaReserve=run=>run.boss?.traversal?326:BOSS_ARENA_RESERVE;
export const playerBounds = run => ({min:-PLAYER.visualLeft,max:visibleWidth(run)-(run.boss?.combat&&run.boss.phase!=='intro'?arenaReserve(run):PLAYER.visualRight)});
const frontContact = run => playerX(run)+PLAYER.width-6;
const REACTION_GAP = .82;
// A full marked-lane escape can close opposing contacts by almost a second
// at their 180px/s clearance floor, even after the marker itself has ended.
const OPPOSING_ESCAPE_RESERVE=.95;
// A retaguarda se aproxima pela esquerda; outras ameaças continuam pela direita.
const JUMP_BUFFER_SECONDS = .12;
const EDGE_JUMP_GRACE = .08;
const STORY_JUMP_BUFFER_SECONDS = .15;
const STORY_EDGE_JUMP_GRACE = .12;
const JACARE_ENTRY_GRACE = .60;
const LATERAL_SPEED = 230;
export {DUEL_CHARGE_SECONDS} from './runner-hero-shot.mjs?v=7aa1e19e9838';
const isJacareAmpoule=o=>o.falling&&o.owner==='pfizer'&&o.type==='pfizer-ampoule';
const hasJacareVolley=run=>run.obstacles.some(isJacareAmpoule);
const JACARE_RESTORE_GRACE = .55;
const JACARE_RESTORE_FLASH = .48;
export function threatTimeToContact(run,o){
 if(o.cast)return (o.waitFor||0)+o.cast.flightFor-o.cast.flightAge;
 if(o.groundHazard)return o.warningFor-o.age;
 if(o.falling)return o.warningFor+o.fallFor*.7-o.age;
 if(o.approach==='rear')return (o.waitFor||0)+(playerX(run)+5-(o.x+o.width-3))/-o.speed;
 if(o.bossFlight&&!o.returning){
  const distance=o.x-frontContact(run),coast=o.bossFlight.remaining*o.bossFlight.speed;
  if(distance>0&&coast>0)return (o.waitFor||0)+(distance<=coast?distance/o.bossFlight.speed:o.bossFlight.remaining+(distance-coast)/o.speed);
 }
 return (o.waitFor||0)+(o.x-frontContact(run))/o.speed;
}
// Zonas persistentes reservam também sua janela ativa antes da próxima onda.
const threatReservation = (run,o) => threatTimeToContact(run,o)+(o.groundHazard?o.activeFor:0);

export function difficultyAt(distance,elapsed=0) {
 const d=Number.isFinite(distance)?Math.max(0,distance):0,t=Number.isFinite(elapsed)?Math.max(0,elapsed):0;
 // Pressão cresce por várias voltas em vez de saturar na primeira.
 // O tempo e a distância continuam contínuos ao atravessar os cenários.
 const pressure=1-Math.exp(-(d/45000+t/360)),endurance=1-Math.exp(-d/180000),p=d/(d+10000);
 return {level:1+Math.floor(9*pressure)+Math.floor(6*endurance),pressure,endurance,
  speed:270+170*pressure+95*endurance,obstacleGap:Math.max(.86,1.70-.66*pressure-.18*endurance),
  pickupGap:12+8*p,passportGap:5.2+1.2*p,powerGap:24+32*p,
  bossApproach:Math.max(.72,1.15-.33*pressure-.10*endurance),obstacleApproach:Math.max(.82,1.65-.73*pressure-.10*endurance)};
}
// Uma onda mais rápida nunca alcança a anterior e forma um par impossível.
function threatSpeed(run,x,seconds,visibleX=x){
 if(run.aid?.kind==='telegraph')seconds+=run.aid.warningBonus??.24;
 const contactX=frontContact(run),rearContact=playerX(run)+5;
 const pending=run.obstacles.filter(o=>!o.passed&&(o.cast||o.x>contactX)&&o.speed>0)
  .map(o=>threatReservation(run,o));
 // Opposite directions need room for one body-width of lateral escape
 // after a ground marker; that movement closes their two contact times.
 const rear=run.obstacles.filter(o=>!o.passed&&!o.counted&&o.approach==='rear'&&o.speed<0)
  .map(o=>threatReservation(run,o))
  .filter(t=>t>0).map(t=>t+OPPOSING_ESCAPE_RESERVE);
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
export function stageAt(seconds,stages=STAGES) {
 const s=Number.isFinite(seconds)?Math.max(0,seconds):0;
 const index=Math.floor((s+1e-7)/SCENE_SECONDS);
 return stages===STORY_STAGES?stages[Math.min(index,stages.length-1)]:stages[index%stages.length];
}
export function stageTransitionAt(seconds,stages=STAGES) {
 const s=Number.isFinite(seconds)?Math.max(0,seconds):0,current=stageAt(s,stages);
 const index=Math.round(s/SCENE_SECONDS),boundary=index*SCENE_SECONDS;
 if(index<1||stages===STORY_STAGES&&index>=stages.length||Math.abs(s-boundary)>=2)return {from:current,to:current,progress:1,active:false};
 const linear=Math.max(0,Math.min(1,(s-boundary+2)/4));
 return {from:stages[(index-1)%stages.length],to:stages[index%stages.length],progress:linear*linear*(3-2*linear),active:true};
}
export function pursuitAt(seconds,rng=()=>.5,level=10,seen=[],last=null) {
 const stagePool=POOLS[stageAt(seconds).index];
 const pool=stagePool.filter(type=>CHARACTER_UNLOCK_LEVEL[type]<=level);
 return foeFor(chooseProgressiveCharacter(pool.length?pool:['pf'],rng,seen,last));
}
// Retaguarda usa a mesma janela de leitura, sem disputar o contato com um perigo frontal.
function rearMotion(run,x,width){
 const contactX=frontContact(run),rearContact=playerX(run)+5;
 const front=run.obstacles.filter(o=>!o.passed&&(o.cast||o.x>contactX)&&o.speed>0).map(o=>threatReservation(run,o)+OPPOSING_ESCAPE_RESERVE);
 const rear=run.obstacles.filter(o=>!o.passed&&!o.counted&&o.approach==='rear'&&o.speed<0).map(o=>threatReservation(run,o));
 const drops=run.obstacles.filter(o=>o.falling||o.groundHazard).map(o=>threatReservation(run,o));
 const seconds=Math.max(run.assisted?1.22:1.06,...front.concat(rear,drops).filter(t=>t>0).map(t=>t+REACTION_GAP));
 const distance=rearContact-(x+width-3),requested=distance/seconds,speed=Math.max(180,requested);
 return {speed:-speed,waitFor:Math.max(0,seconds-distance/speed)};
}
export function createRun({assisted=false,seed,mode='endless',practiceId,manualStory=false}={}) {
 const practice=mode==='story'?optionalStoryBossAt(practiceId):null;
 const startDistance=practice?STORY_OPENING_DISTANCE+practice.stageIndex*SCENE_DISTANCE+practice.distance:0;
 return {status:'ready',mode:mode==='story'?'story':'endless',manualStory:mode==='story'&&manualStory===true,assisted:assisted===true,practice,elapsed:0,distance:startDistance,routeDistance:startDistance,viewportWidth:WORLD.width,cameraLead:0,bonus:0,collected:0,passports:0,lives:1,
  randomState:seed===undefined?null:Number(seed)>>>0,
  damageRandomState:seed===undefined?null:(Number(seed)^0x9e3779b9)>>>0,
  ballot:{digits:'',message:''},
  event:'',events:0,movementSkills:createMovementSkills(),lastSkillReward:null,terrain:createTerrain(),storyRooms:createStoryRoomState(),player:{airJumpsUsed:0,grounded:true,supportY:0,sliding:false,slideRemaining:0,slideLatched:false,slideCooldownFor:0,x:PLAYER.x,moveHeld:0,y:0,velocity:0,crouching:false,crouchHeld:false,isJacare:false,jacareProgress:0,jacareAge:0,nextJacareThreat:0,restoreFlashFor:0,coyoteUntil:0,jumpBufferedUntil:0,attackHeld:false,chargeFor:0,arenaTravel:0,manualTravel:0,attackFor:0,attackCooldown:0,shotFacing:1,hp:HERO_MAX_HP,maxHp:HERO_MAX_HP,recoveryPending:false,terrainContact:null},obstacles:[],pickups:[],heroShots:[],shotsFired:0,ammo:ROUTE_AMMO,ammoIdleFor:0,ammoReloadFor:0,ownedPowers:['ivermectina'],powerLevels:{ivermectina:1},activePower:'ivermectina',lastPowerReward:null,defeatedEnemies:0,lastHit:null,
  nextObstacle:1.5,nextPickup:0,nextPassport:4.8,nextPower:7,recoveryReadyAt:0,shieldFor:0,graceFor:0,reserveShields:0,allyShieldProgress:0,allyHelpCount:0,
  lastPickup:null,lastTraversalBlock:null,spawnedObstacles:0,spawnedPickups:0,spawnedPowers:0,phantomCloud:null,
  boss:null,bossBag:[],lastBoss:null,bossesDefeated:0,nextBossAt:practice?startDistance:null,bossCooldown:0,storyLeg:null,arenaExit:null,
  raid:null,nextRaid:null,raids:0,raidStages:{},raidStageCoverage:{},lastFact:-1,cameo:null,overheadCount:0,lastOverheadActor:null,
  seenOverheadActors:[],seenGroundActors:[],lastGroundActor:null,
  lastAction:null,actionStreak:0,attackStyles:[],nextAllyAt:14000,alliesMet:0,
  nextSupportAt:18000,supportAvailable:true,ally:null,aid:null,allyVisits:{},lastAllyId:null,creditCooldown:0};
}
// Reenquadra ondas ainda à frente, preservando prazo de contato e trajetória.
 // Contatos iniciados preservam sua posição relativa ao herói reenquadrado.
export function resizeRun(run,width){
 const previous=visibleWidth(run),oldBounds=playerBounds(run),oldX=playerX(run),oldFront=frontContact(run),oldRear=oldX+5;
 const position=Math.max(0,Math.min(1,(oldX-oldBounds.min)/(oldBounds.max-oldBounds.min)));
 run.viewportWidth=Math.max(MIN_VIEWPORT_WIDTH,Math.min(900,Number(width)||WORLD.width));
 if(visibleWidth(run)===previous)return;
 const bounds=playerBounds(run);run.player.x=bounds.min+position*(bounds.max-bounds.min);
 const delta=playerX(run)-oldX;translateTerrain(run,delta);
 const contactX=frontContact(run),rear=playerX(run)+5;
 const ratio=(visibleWidth(run)-contactX)/(previous-oldFront),rearRatio=rear/oldRear;
 const moved=new Map(),project=x=>contactX+(x-oldFront)*ratio;
 for(const shot of run.heroShots||[]){shot.x=project(shot.x);shot.previousX=project(shot.previousX);shot.vx*=ratio;}
 for(const o of run.obstacles){
  const start=o.x;
  if(o.cast){
   const factor=visibleWidth(run)/previous,half=o.width/2,oldContact=o.speed<0?oldRear+3-half:oldFront+half,newContact=o.speed<0?rear+3-half:contactX+half,map=x=>newContact+(x-oldContact)*factor;
   o.x=map(o.x+o.width/2)-o.width/2;o.launchX=map(o.launchX);o.targetX=map(o.targetX);o.speed*=factor;
   o.cast.fromX=map(o.cast.fromX);o.cast.toX=map(o.cast.toX);
   if(o.launched&&Math.abs(o.speed)<180){
    const oldSpeed=o.speed;o.speed=Math.sign(o.speed)*180;
    // Keep the already-travelled tail at the same point while preserving
    // the minimum clearance speed after a screen rotation.
    o.cast.toX+=(o.speed-oldSpeed)*Math.max(0,o.cast.flightAge-o.cast.flightFor);
   }
  }else if(o.falling||o.groundHazard||o.passed||!Number.isFinite(o.speed)||o.speed===0){o.x+=delta;}
  else if(o.speed>0&&o.x>oldFront){
   o.x=project(o.x);o.speed*=ratio;
   if(o.bossFlight){o.bossFlight.speed*=ratio;}
   else if(o.speed<180){
    const distance=o.x-contactX;o.waitFor=(o.waitFor||0)+distance/o.speed-distance/180;o.speed=180;
   }
   if(o.projectile){
    const center=o.width/2;
    if(Number.isFinite(o.launchX))o.launchX=project(o.launchX-center)+center;
    // O fim do arco corresponde à borda de primeiro contato, não ao centro
    // do corpo. Transformar esse mesmo ponto conserva a altura no resize.
    if(Number.isFinite(o.targetX))o.targetX=project(o.targetX+PLAYER.width/2-6)-(PLAYER.width/2-6);
    if(Number.isFinite(o.laneX))o.laneX=project(o.laneX);
   }
  }else if(o.approach==='rear'&&o.x+o.width-3<oldRear){
   const distance=(oldRear-(o.x+o.width-3))*rearRatio;
   o.x=rear-distance-o.width+3;o.speed*=rearRatio;
   if(-o.speed<180){o.waitFor=(o.waitFor||0)+distance/-o.speed-distance/180;o.speed=-180;}
  }else{
   o.x+=delta;
   if(Number.isFinite(o.launchX))o.launchX+=delta;
   if(Number.isFinite(o.targetX))o.targetX+=delta;
   if(Number.isFinite(o.laneX))o.laneX+=delta;
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
 run.player.moveHeld=Number.isFinite(direction)?Math.sign(direction):0;
 // História: ao soltar as teclas, Flávio continua olhando para o lado escolhido.
 if(run.manualStory&&run.player.moveHeld)run.player.shotFacing=run.player.moveHeld;
 return true;
}
// Alvo comprometido ao anunciar. O jogador pode fugir para ambos os lados.
export function spawnFallingThreat(run,{bossAttack=false,owner='joice',type,laneOffset=0}={}){
 if(run.status!=='running'||run.obstacles.some(o=>o.falling||o.groundHazard))return null;
 const isAmpoule=owner==='pfizer',width=isAmpoule?42:56;
 const x=Math.max(0,Math.min(visibleWidth(run)-width,playerX(run)+17-width/2+laneOffset));
 const arrivals=run.obstacles.filter(o=>!o.passed).map(o=>threatReservation(run,o)).filter(t=>Number.isFinite(t)&&t>0);
 const lead=isAmpoule?(run.player.jacareAge>=5.3?.78:.92):1.2;
 const warningFor=Math.max(lead,...arrivals.map(t=>t+REACTION_GAP))+(run.aid?.kind==='sky'?.35:0);
 const item={x,width,height:isAmpoule?48:44,type:isAmpoule?'pfizer-ampoule':type||bossWeaponFor(owner,0,'move')||'falling-case',action:'move',approach:'vertical',falling:true,age:0,warningFor,fallFor:isAmpoule?.46:.4,y:310,speed:0,owner,bossAttack,counted:false};
 run.obstacles.push(item);return item;
}
// A primeira ampola compromete a mira inteira no aviso. As seguintes fecham
// saídas próximas sem ocupar o último corredor que o jogador consegue atingir.
export function spawnJacareVolley(run,{rng=Math.random}={}){
 if(run.status!=='running'||!run.player.isJacare)return [];
 const target=spawnFallingThreat(run,{owner:'pfizer'});
 if(!target)return [];
 const hero=playerX(run),{min,max}=playerBounds(run),width=visibleWidth(run),maxX=width-target.width;
 target.x=Math.max(0,Math.min(maxX,Math.round(target.x+(random(rng)-.5)*22)));
 const volley=[target],extra=run.player.jacareAge>=5.3?3:2;
 const spacing=64+Math.round(random(rng)*18),side=random(rng)<.5?-1:1;
 // Margens espelham a hitbox quadrúpede, com folga para um passo de simulação.
 // O corredor precisa ser atingível antes do primeiro contato mesmo após .30 s.
 const behind=target.width+16,ahead=PLAYER.width+18;
 const reach=LATERAL_SPEED*(target.warningFor+.65*target.fallFor-.30);
 // A rotação da tela translada as marcas junto com o herói. Certifique um
 // corredor que ainda exista na menor largura, na posição relativa atual.
 const fraction=(hero-min)/(max-min),shrink=width-MIN_VIEWPORT_WIDTH;
 const safeMin=min+shrink*fraction,safeMax=max-shrink*(1-fraction);
 const canEscape=xs=>[safeMin,safeMax,...xs.flatMap(x=>[x-ahead,x+behind])].some(p=>
  p>=safeMin&&p<=safeMax&&Math.abs(p-hero)<=reach&&xs.every(x=>p<=x-ahead||p>=x+behind));
 for(let i=0;i<extra;i++){
  const xs=volley.map(o=>o.x);
  const valid=x=>x>=0&&x<=maxX&&xs.every(other=>Math.abs(other-x)>=58)&&canEscape([...xs,x]);
  const candidates=[side,-side,2*side,-2*side,3*side,-3*side].map(n=>target.x+n*spacing);
  for(let n=0;n<8;n++)candidates.push(Math.round(random(rng)*maxX));
  candidates.push(0,maxX);
  const x=candidates.find(valid);
  if(x===undefined)break;
  const warningFor=volley.at(-1).warningFor+.12+random(rng)*.08;
  const ampoule={...target,x,warningFor};
  run.obstacles.push(ampoule);volley.push(ampoule);
 }
 return volley;
}
function queueJacareVolley(run,rng){
 const wave=spawnJacareVolley(run,{rng}),last=wave.at(-1);
 // Mantém a próxima mira fixa no momento do aviso, depois da queda anterior.
 run.player.nextJacareThreat=last?last.warningFor+last.fallFor+.25+.10+random(rng)*.10:.10;
 return wave[0];
}
// O aviso fixa a posição antes da abertura; nunca há uma hitbox ativa no nascimento.
// Uma única zona local deixa espaço de fuga, inclusive no extremo da arena.
export function spawnManholeThreat(run,{rng=Math.random}={}){
 if(run.status!=='running'||run.obstacles.some(o=>o.falling||o.groundHazard))return null;
 const width=64,x=Math.max(0,Math.min(visibleWidth(run)-width,playerX(run)+17-width/2+(random(rng)-.5)*24));
 const arrivals=run.obstacles.filter(o=>!o.passed).map(o=>threatReservation(run,o)).filter(t=>Number.isFinite(t)&&t>0);
 const warningFor=Math.max(1.2,...arrivals.map(t=>t+REACTION_GAP+.3));
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
export function activateReserveShield(run){
 if(run.status!=='running'||run.boss?.traversal||!(run.reserveShields>0)||run.shieldFor>0)return false;
 run.reserveShields--;run.shieldFor=6;
 announce(run,'Escudo de reserva ativado! Proteção por 6 segundos.');return true;
}
// API antiga mantida por compatibilidade: nenhum comando pode antecipar o relógio.
export function recoverJacareRun(_run){return false;}
function restoreJacareRun(run){
 const p=run.player;
 if(run.status!=='running'||!p.isJacare||p.jacareAge<JACARE_RECOVERY_SECONDS)return false;
 p.isJacare=false;p.restoreFlashFor=JACARE_RESTORE_FLASH;
 p.jumpBufferedUntil=p.coyoteUntil=0;p.crouchHeld=false;p.crouching=false;
 const wavePending=hasJacareVolley(run);
 if(!wavePending)run.graceFor=Math.max(run.graceFor,JACARE_RESTORE_GRACE);
 announce(run,wavePending?'Contagem concluída: forma humana recuperada. Desvie das ampolas já marcadas.':'Contagem concluída: Flávio voltou à corrida normal.');
 return true;
}
function finishStoryDash(run){
 const p=run.player;
 if(run.manualStory&&p.sliding)p.slideCooldownFor=Math.max(p.slideCooldownFor||0,STORY_DASH_RECOVERY_SECONDS);
 p.sliding=false;p.slideRemaining=0;
}
export function jumpRun(run){
 if(run.status!=='running'||run.player.isJacare)return false;
 const p=run.player;
 const edgeJump=p.grounded===false&&p.velocity<=0&&p.coyoteUntil>0&&run.elapsed<=p.coyoteUntil+1e-8;
 if(!edgeJump&&(p.grounded===false||Math.abs(p.y-(p.supportY??0))>1e-8||p.velocity>0)){
  const profile=movementProfileFor(run);
  if((run.player.airJumpsUsed||0)<profile.maxAirJumps){
   run.player.airJumpsUsed=(run.player.airJumpsUsed||0)+1;run.player.jumpBufferedUntil=0;
   run.player.crouching=false;finishStoryDash(run);run.player.grounded=false;run.player.velocity=profile.airJumpVelocity;return true;
  }
  run.player.jumpBufferedUntil=run.elapsed+(run.manualStory?STORY_JUMP_BUFFER_SECONDS:JUMP_BUFFER_SECONDS);return false;
 }
 p.jumpBufferedUntil=p.coyoteUntil=0;p.crouching=false;finishStoryDash(run);p.grounded=false;p.velocity=610;return true;
}
export function releaseJumpRun(run){
 const p=run.player,b=run.boss;
 if(run.status!=='running'||!run.manualStory&&(!b?.combat||b.traversal)||p.isJacare||p.grounded||p.velocity<=260)return false;
 p.velocity=260;return true;
}
export function clearRunInput(run){
 run.player.moveHeld=0;run.player.crouchHeld=false;run.player.crouching=false;run.player.sliding=false;run.player.slideRemaining=0;run.player.slideLatched=false;run.player.jumpBufferedUntil=run.player.coyoteUntil=0;
 run.player.attackHeld=false;run.player.chargeFor=0;
}
export function setAttackRun(run,active){
 run.player.attackHeld=!!active&&run.status==='running'&&!run.player.isJacare&&!run.boss?.traversal;
 if(!run.player.attackHeld)run.player.chargeFor=0;
 return run.player.attackHeld;
}
export function heroMuzzleFor(run,facing=1){
 const {muzzle}=heroShotPose({facing,crouching:run.player.crouching,sliding:run.player.sliding,airborne:run.player.y>0});
 const scale=playerBodyFor(run.player).scale;
 return {x:playerX(run)+PLAYER.width/2+muzzle.x*scale,y:run.player.y-muzzle.y*scale};
}
// A seleção de projéteis só inclui ameaças já lançadas; o chefão tem alvo próprio.
// Zé rival reutiliza trajetória de quique, mas continua sendo um personagem.
const nonProjectileBodies=new Set(['povo','crowd-lane','ze-gotinha-rival','lula-runner','orla-runner','paulista-runner','route-scout','terminal-guard']);
const shootableStoryEnemies=new Set(['pf','janones','army','boulos','dino','orla-runner','paulista-runner','route-scout','terminal-guard','lula-runner']);
const isShootableStoryEnemy=o=>!!o&&!o.projectile&&!o.falling&&!o.groundHazard&&!o.passed&&!o.counted&&!o.destroyed&&shootableStoryEnemies.has(o.type);
export function isHostileProjectile(o){
 return !!o?.projectile&&!nonProjectileBodies.has(o.type)&&!o.falling&&!o.groundHazard&&!o.reflected&&!o.destroyed&&
  (o.launched||!o.cast&&!o.storyVolley&&!(o.waitFor>0))&&(!o.passed&&!o.counted||o.returning&&!o.contactHit);
}
function projectileFlightY(o,x){
 const landingX=(o.laneX??o.targetX+PLAYER.width/2-6)+o.width/2;
 const span=Math.max(1,o.launchX-landingX);
 const u=Math.max(0,Math.min(1,(o.launchX-(x+o.width/2))/span));
 if(!Number.isFinite(u)||!Number.isFinite(o.launchY)||!Number.isFinite(o.targetY))return o.y;
 let y=o.launchY+(o.targetY-o.launchY)*u+Math.sin(Math.PI*u)*(o.arcHeight||0);
 if(o.curve){
  const envelope=Math.sin(Math.PI*u)**2,cycle=Math.sin(u*Math.PI*2*(o.waveCycles||1)),amplitude=o.waveAmplitude||16;
  y+=(o.curve==='bounce'?Math.abs(cycle):cycle)*amplitude*envelope;
  if(o.action==='crouch')y=Math.max(48+o.height/2,y);
  else if(u>=.72)y=Math.min(26,y);
 }
 return y;
}
function projectileAt(o,seconds){
 if(o.cast){
  const c=o.cast,time=c.flightAge+seconds,u=Math.min(1,time/c.flightFor);
  return {x:c.fromX+(c.toX-c.fromX)*u-o.speed*Math.max(0,time-c.flightFor),y:c.fromY+(o.targetY-c.fromY)*u};
 }
 const coasting=o.bossFlight&&!o.returning?Math.min(seconds,o.bossFlight.remaining):0;
 const left=o.x-(o.speed||0)*(seconds-coasting)-(o.bossFlight?.speed||0)*coasting;
 return {x:left+o.width/2,y:o.returning?o.y:projectileFlightY(o,left)};
}
function aimAtProjectile(run,power){
 const center=playerX(run)+PLAYER.width/2;
 const candidates=run.obstacles.filter(isHostileProjectile)
  .sort((a,b)=>Math.abs(a.x+a.width/2-center)-Math.abs(b.x+b.width/2-center));
 for(const target of candidates){
  const facing=target.x+target.width/2<center?-1:1,muzzle=heroMuzzleFor(run,facing);
  if((target.x+target.width/2-muzzle.x)*facing<=0)continue;
  // Procura o primeiro ponto futuro alcançável onde os dois trajetos se cruzam.
  // Amostra a aceleração e a curva já comprometidas do inimigo, sem mirar em seu autor.
  for(let i=1;i<=72;i++){
   const time=i/60,anticipated=projectileAt(target,time);
   if((anticipated.x-muzzle.x)*facing<=0)break;
   if(Math.hypot(anticipated.x-muzzle.x,anticipated.y-muzzle.y)<=time*power.speed){
    const lift=shotLift(power.behavior,Math.min(1,time/Math.max(.15,time)));
    return {...anticipated,y:anticipated.y-lift,facing};
   }
  }
 }
 return null;
}
function shotLift(behavior,progress){
 const envelope=Math.sin(Math.PI*progress);
 return behavior==='lob'?60*envelope:behavior==='arc'?30*envelope:behavior==='heavy'?18*envelope:
  behavior==='bounce'?28*Math.abs(Math.sin(progress*Math.PI*3)):behavior==='orbit'?22*Math.sin(progress*Math.PI*4)*envelope:behavior==='gust'?8*Math.sin(progress*Math.PI*5)*envelope:0;
}
function aimAtBoss(run,power){
 const boss=run.boss;
 if(!boss||boss.traversal||boss.phase==='intro'||boss.hp<=0)return null;
 const muzzle=heroMuzzleFor(run,1);let time=0,pose;
 // Lead the moving platform using the same clock as its visible trajectory.
 for(let i=0;i<5;i++){
  pose=bossArenaPose({...boss,age:boss.age+time,motionClock:(boss.motionClock||0)+time},visibleWidth(run));
  const y=pose.platformY+48;time=Math.hypot(pose.x-muzzle.x,y-muzzle.y)/power.speed;
 }
 return {x:pose.x,y:pose.platformY+48,facing:1};
}
function aimAtStoryEnemy(run){
 if(!run.manualStory||run.boss)return null;
 const facing=run.player.shotFacing<0?-1:1,muzzle=heroMuzzleFor(run,facing);
 const target=run.obstacles.filter(isShootableStoryEnemy).filter(o=>(o.x+o.width/2-muzzle.x)*facing>0)
  .sort((a,b)=>(a.x+a.width/2-b.x-b.width/2)*facing)[0];
 return target?{x:target.x+target.width/2,y:Math.max(14,(target.platformY||0)+target.height*.58),facing}:null;
}
export function attackRun(run){
 const b=run.boss,p=run.player,power=heroPowerFor(run),level=run.powerLevels?.[run.activePower]||1;
 const limit=b?.combat&&!b.traversal&&run.activePower==='ivermectina'?3:18;
 const charged=!!b?.combat&&!b.traversal&&p.attackHeld&&(p.chargeFor||0)>=DUEL_CHARGE_SECONDS-1e-8&&run.ammo>=2;
 if(run.status!=='running'||!(run.ammo>0)||p.isJacare||b?.traversal||b?.phase==='intro'||p.attackCooldown>0&&!charged||(run.heroShots?.length||0)>=limit)return false;
 const ammoCost=charged?2:1;
 const target=b?.combat?aimAtBoss(run,power)||aimAtProjectile(run,power):
  run.manualStory?aimAtStoryEnemy(run)||aimAtProjectile(run,power):aimAtProjectile(run,power)||aimAtBoss(run,power);
 p.shotFacing=target?.facing??(run.manualStory?(p.shotFacing<0?-1:1):1);
 const {x,y}=heroMuzzleFor(run,p.shotFacing),targetX=target?.x??x+p.shotFacing*160,targetY=target?.y??y;
 const dx=p.shotFacing*Math.max(1,(targetX-x)*p.shotFacing),dy=targetY-y,distance=Math.max(1,Math.hypot(dx,dy)),angle=Math.atan2(dy,dx);
 for(let i=0;i<power.shots;i++){
  const spread=power.behavior==='fan'?(i-1)*power.spread:0,offset=power.behavior==='stack'?(i-1)*18:power.behavior==='double'?(i-.5)*12:0;
  const vx=Math.cos(angle+spread)*power.speed,vy=Math.sin(angle+spread)*power.speed;
  (run.heroShots??=[]).push({type:run.activePower==='ivermectina'?'hero-ivermectina':power.projectiles?.[i]||power.projectile,powerId:run.activePower,
   behavior:power.behavior,x,y:y+offset,originX:x,originY:y+offset,previousX:x,previousY:y+offset,vx,vy,age:0,flightFor:Math.max(.15,distance/power.speed),
   radius:power.radius+(charged?4:0),cancels:power.cancels+(charged?1:0),damage:power.damage*(1+(level-1)*.12)*(charged?2.1:1),charged,ammoCost});
 }
 run.ammo-=ammoCost;run.ammoIdleFor=0;run.ammoReloadFor=0;
 if(charged){p.chargeFor=0;p.chargedFlashFor=.22;}
 p.attackCooldown=power.cooldown*(1-(level-1)*.06);p.attackFor=HERO_SHOT_DURATION;run.shotsFired=(run.shotsFired||0)+1;return true;
}
function segmentHitsBox(shot,minX,maxX,minY,maxY,radius=0){
 const dx=shot.x-shot.previousX,dy=shot.y-shot.previousY;let near=0,far=1;
 for(const [origin,delta,min,max] of [[shot.previousX,dx,minX-radius,maxX+radius],[shot.previousY,dy,minY-radius,maxY+radius]]){
  if(Math.abs(delta)<1e-8){if(origin<min||origin>max)return false;}
  else{const a=(min-origin)/delta,z=(max-origin)/delta;near=Math.max(near,Math.min(a,z));far=Math.min(far,Math.max(a,z));}
 }return near<=far;
}
function rollBossDamage(run,basis){
 // Sorteio por acerto, separado da IA: FPS e padrões do chefe não alteram o dano.
 const draw=()=>{
  if(run.damageRandomState==null)run.damageRandomState=(random(Math.random)*4294967296)>>>0;
  run.damageRandomState=nextSeed(run.damageRandomState);
  return run.damageRandomState/4294967296;
 };
 const critical=draw()<.14,variation=.85+draw()*.30;
 return {damage:basis*variation*(critical?1.5:1),critical};
}
function applyBossHit(boss,hit){
 if(boss.combat&&boss.hurtFor>0)return;
 const previousHp=boss.hp;
 boss.hp=Math.max(0,boss.hp-hit.damage);boss.hitFlashFor=boss.combat?.28:.16;
 if(boss.combat)boss.hurtFor=.28;
 if(previousHp>boss.hp)boss.lastDamage={amount:previousHp-boss.hp,critical:hit.critical===true,remaining:.8};
 if(hit.weakness)boss.weaknessFlashFor=.3;
}
function interceptProjectile(run,shot,o){
 const boss=run.boss;
 if(o.bossAttack&&boss&&!boss.traversal&&(o.owner===boss.type||o.storyVolley&&o.owner==null)){
  // Guarda o bônus na interceptação. O PV continua intocado até a volta física.
  const weakness=boss.weakness&&shot.powerId===boss.weakness;
  const earned=boss.counterReady;
  const basis=boss.combat?2.6:Math.max(2,boss.maxHp*.12);
  const hit=rollBossDamage(run,basis*Math.max(.84,Math.min(1.55,shot.damage||1))*(earned?1+earned.damage*.16:1)*(weakness?1.35:1));
  boss.counterReady=null;
  if(!boss.combat&&!o.counted)boss.remaining=Math.max(0,boss.remaining-1);
  Object.assign(o,{reflected:true,returning:true,passed:true,counted:true,resolved:true,waitFor:0,speed:-510,
   reflection:{boss,...hit,weakness,age:0}});
 }else{o.destroyed=true;o.counted=true;o.passed=true;}
 run.clearedAt={x:o.x+o.width/2,remaining:.25};
}
// Uma sequência comprometida mantém as ameaças reais mesmo após o golpe
// letal e dá tempo de ler a pausa; nenhum novo ataque é preparado por isso.
function storyVolleyPendingVictory(boss){
 const settle=boss.volleyPattern?.finishBeforeVictory;
 return boss.combat&&settle>0&&(boss.phase==='attack'||
  boss.phase==='recover'&&boss.recover-boss.phaseFor<Math.min(settle,boss.recover));
}
function advanceReflectedProjectile(run,o,dt){
 const reflected=o.reflection,boss=run.boss;
 if(!boss||reflected.boss!==boss||boss.traversal||boss.hp<=0&&!storyVolleyPendingVictory(boss)){o.destroyed=true;return;}
 reflected.age+=dt;
 const pose=bossArenaPose(boss,visibleWidth(run));
 const x=o.x+o.width/2,dx=pose.x-x,dy=pose.platformY+48-o.y,distance=Math.hypot(dx,dy),pace=610*dt;
 if(distance<=24+pace){
  applyBossHit(boss,reflected);
  o.destroyed=true;return;
 }
 if(reflected.age>2){o.destroyed=true;return;}
 o.x+=dx/distance*pace;o.y+=dy/distance*pace;
}
function advanceHeroShots(run,dt){
 const p=run.player;p.attackCooldown=Math.max(0,(p.attackCooldown||0)-dt);p.attackFor=Math.max(0,(p.attackFor||0)-dt);
 advanceAmmo(run,dt);
 const charging=run.boss?.combat&&!run.boss.traversal&&run.boss.phase!=='intro'&&p.attackHeld&&!p.isJacare&&run.ammo>=2;
 p.chargeFor=charging?Math.min(DUEL_CHARGE_SECONDS,(p.chargeFor||0)+dt):0;
 p.chargedFlashFor=Math.max(0,(p.chargedFlashFor||0)-dt);
 if(p.attackHeld)attackRun(run);
 run.heroShots=(run.heroShots||[]).filter(shot=>{
  shot.previousX=shot.x;shot.previousY=shot.y;shot.age+=dt;
  if(shot.behavior==='homing'){
   const boss=run.boss,pose=boss?.combat&&!boss.traversal&&boss.hp>0?bossArenaPose(boss,visibleWidth(run)):null;
   const target=pose?{x:pose.x,y:pose.platformY+48}:run.obstacles.filter(isHostileProjectile).sort((a,b)=>Math.hypot(a.x+a.width/2-shot.x,a.y-shot.y)-Math.hypot(b.x+b.width/2-shot.x,b.y-shot.y))[0];
   if(target){const dx=target.x+(target.width||0)/2-shot.x,dy=target.y-shot.y,d=Math.max(1,Math.hypot(dx,dy)),k=Math.min(1,dt*4);shot.vx+=(dx/d*540-shot.vx)*k;shot.vy+=(dy/d*540-shot.vy)*k;}
  }
  if(shot.behavior==='return'&&shot.age>shot.flightFor*1.2&&!shot.returned){shot.vx=-shot.vx;shot.vy=-shot.vy*.5;shot.returned=true;}
  shot.x+=shot.vx*dt;
  const progress=Math.min(1,shot.age/(shot.flightFor||1)),previous=Math.min(1,Math.max(0,shot.age-dt)/(shot.flightFor||1));
  shot.y+=shot.vy*dt+shotLift(shot.behavior,progress)-shotLift(shot.behavior,previous);
  if(shot.age>3||shot.x<-40||shot.x>visibleWidth(run)+40||shot.y<-50||shot.y>360)return false;
  const radius=shot.behavior==='wave'?Math.min(34,shot.radius+shot.age*30):shot.radius||0;
  for(const o of run.obstacles){
   if(!isHostileProjectile(o)||!segmentHitsBox(shot,o.x,o.x+o.width,o.y-o.height/2,o.y+o.height/2,radius))continue;
   interceptProjectile(run,shot,o);
   if(shot.cancels>0){shot.cancels--;continue;}return false;
  }
  if(run.manualStory&&!run.boss){
   for(const enemy of run.obstacles){
    if(!isShootableStoryEnemy(enemy)||!segmentHitsBox(shot,enemy.x,enemy.x+enemy.width,enemy.platformY||0,(enemy.platformY||0)+enemy.height,radius))continue;
    if(enemy.storyEnemyId){
     enemy.hp=Math.max(0,(enemy.hp??1)-(shot.damage||1));
     if(enemy.hp>0){enemy.hitFlashFor=.15;run.clearedAt={x:enemy.x+enemy.width/2,remaining:.2};return false;}
     if(run.storyRooms?.defeated)run.storyRooms.defeated[enemy.storyEnemyId]=true;
    }
    enemy.destroyed=true;enemy.passed=true;enemy.counted=true;
    run.defeatedEnemies=(run.defeatedEnemies||0)+1;
    run.clearedAt={x:enemy.x+enemy.width/2,remaining:.25};
    return false;
   }
  }
  const boss=run.boss;
  if(boss&&!boss.traversal&&boss.phase!=='intro'&&boss.hp>0){
   const pose=bossArenaPose(boss,visibleWidth(run));
   // The body and deck share the drawn position. A shot is consumed once,
   // including wave/fan powers; rebounding a hostile shot remains stronger.
   if(segmentHitsBox(shot,pose.x-30,pose.x+30,pose.platformY+8,pose.platformY+100,radius)){
    const weakness=boss.weakness===shot.powerId;
    const opening=boss.combat?Math.min(2.2,bossCounterWindow(boss).damage):1;
    const hit=rollBossDamage(run,(boss.combat?1.1:Math.max(1.5,boss.maxHp*.075))*Math.max(.84,Math.min(shot.charged?3.1:1.55,shot.damage||1))*(weakness?1.35:1)*opening);
    applyBossHit(boss,{...hit,weakness});return false;
   }
  }
  return true;
 });
}
// A intenção permanece durante o salto, sem encolher a colisão no ar.
// Soltar/cancelar limpa também uma intenção ainda aguardando o pouso.
export function crouchRun(run,active){
 run.player.crouchHeld=!!active&&run.status==='running'&&!run.player.isJacare;
 const next=!run.player.isJacare&&run.player.crouchHeld&&run.player.grounded!==false&&Math.abs(run.player.y-(run.player.supportY??0))<1e-8&&run.player.velocity===0;
 run.player.crouching=next;if(!next)finishStoryDash(run);if(!active)run.player.slideLatched=false;
 return next;
}
// Interno ao motor/testes; não há comando de pausa na interface.
export function togglePause(run){if(run.status==='running')run.status='paused';else if(run.status==='paused')run.status='running';}
// O placar agora é a quilometragem percorrida em metros; coletas não alteram metros.
export function scoreFor(run){return Math.floor(run.distance);}
// Uma fonte única para os nomes das armas, a instrução de esquiva e o HUD.
export const ATTACK_NAMES=Object.freeze({
 wind:'Vendaval da Dilma',
 'network-panel':'Painéis em rede','signal-pulse':'Virada de turno','arrow-panel':'Painel de setas',
 'garden-box':'Jardineiras móveis','stage-spotlight':'Holofotes cruzados','rotating-sign':'Placas móveis',
 'debate-card':'Debate em três tempos','baton-wave':'Contratempo da maré','wind-flag':'Bandeiras cruzadas',
 'inspection-gate':'Cancela dupla','crowd-lane':'Corredor da praça','lula-runner':'Corredor do Exército do Lula',
 'ze-gotinha-rival':'Zé Gotinha rival','orla-runner':'Patrulheiro da orla','paulista-runner':'Corredor da Paulista',
 'route-scout':'Batedor da rota','terminal-guard':'Guarda do terminal',
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
 'court-seal':'Selo do tribunal de Dino','signal-flare':'Sinalizador da patrulha','terere-gourd':'Tereré de Santiago Peña','harp-note':'Notas de harpa de Santiago Peña',
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
  instruction:(attack.approach==='rear'?'Por trás! ':'')+verb+' para escapar de '+label+'.'};
}

export function bossAtRound(round,type) {
 const safe=Math.max(0,Math.floor(Number.isFinite(round)?round:0)),level=Math.floor(safe/BOSS_ROSTER.length)+1;
 const foe=foeFor(type||BOSS_ROSTER[safe%BOSS_ROSTER.length]),goal=BOSS_GOALS[foe.type],attacks=goal.attacks+(foe.type==='bossonari'?0:2*Math.min(2,level-1));
 const noun=({haddad:'papéis',lula:'gestos em L',xandao:'martelos e mandados',janones:'mensagens em três blocos',pf:'bloqueios da blitz',bossonari:'frascos cenográficos',army:'sinalizadores'})[foe.type];
 return {foe,level,supreme:foe.type==='lula',round:safe+1,goalKind:goal.goalKind,attacks,
  objective:'Desvie de '+attacks+' '+noun+'. '+({
    haddad:'Pule os papéis baixos e abaixe dos recibos altos.',
    lula:'Observe os gestos em L: pule os baixos e abaixe dos altos.',
    xandao:'Pule os martelos baixos e abaixe dos mandados altos.',
    janones:'Mensagens urgentes: alterne salto e agachamento.',
    pf:'Blitz: pule barreiras, abaixe das algemas e saia dos alvos marcados.',
    army:'Pule ou abaixe dos sinalizadores e leia o aviso da patrulha.',bossonari:'Pule ou abaixe dos frascos cenográficos de Bossonari.'
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
 const sequence=patterns[type]||bossProfileFor(type)?.sequence||patterns.haddad,index=Math.max(0,Math.floor(Number(fired)||0))+2*Math.floor(Math.max(0,round)/BOSS_ROSTER.length);
 const action=sequence[index%sequence.length];
 return {type:bossWeaponFor(type,index,action)||'receipts',action};
}
// Primeiro marco após21km; cada vitória reserva mais7km de corrida.
// Um marco alcançado fica pendente enquanto houver evento ou cooldown.
function nextBossDistance(count){return 22000+count*7000;}
function takeBoss(run){
 // O bag explícito mantém a seleção determinística usada por integrações/testes.
 while(run.bossBag.length){const type=run.bossBag.pop();if(type!=='bossonari'&&BOSS_GOALS[type])return type;}
 return BOSS_ROSTER[run.bossesDefeated%BOSS_ROSTER.length];
}
function beginBoss(run){
 if(run.mode==='story'&&pairRunRemaining(run)>1e-6)return;
 const encounter=run.mode==='story'?(run.practice||storyBossAt(run.bossesDefeated)):null;
 if(run.mode==='story'&&!encounter){run.nextBossAt=Infinity;return;}
 const type=encounter?.type||takeBoss(run);
 run.arenaExit=null;
 run.storyLeg=null;
 const conf=encounter?{foe:{type,name:encounter.name,color:encounter.color},rule:encounter.role,level:encounter.rank,objective:encounter.objective,round:encounter.index+1,attacks:encounter.hp,interval:encounter.interval}:bossAtRound(run.bossesDefeated,type);
 run.boss={type:conf.foe.type,name:conf.foe.name,color:conf.foe.color,level:conf.level,supreme:conf.supreme,
  objective:conf.objective,goalKind:conf.goalKind,
  round:conf.round,total:conf.attacks,remaining:conf.attacks,fired:0,interval:conf.interval,nextAttack:1.1,
  hitFlashFor:0,attackFlashFor:0,lastAction:null,actionStreak:0,
  plannedFor:0,plannedAttack:{...bossAttackFor(conf.foe.type,0,conf.round-1),approach:'diagonal'}};
 if(encounter){
  Object.assign(run.boss,encounter,{combat:true,platformer:!encounter.traversal,maxHp:encounter.hp,hp:encounter.hp,age:0,phase:'intro',phaseFor:1.1,
   total:encounter.hp,remaining:encounter.hp,fired:0,volleyLeft:0,evaded:0,plannedAttack:arenaPatternFor(encounter,0)});
  run.heroShots=[];run.pickups=[];
  if(encounter.traversal)run.player.attackHeld=false;
 }else {const profile=bossProfileFor(type);Object.assign(run.boss,{maxHp:conf.attacks*2,hp:conf.attacks*2,age:0,classId:profile.classId,className:BOSS_CLASSES[profile.classId].name,rank:profile.rank,rankName:BOSS_RANKS[profile.rank-1],powerName:profile.powerName,attackTypes:profile.attackTypes,tactic:profile.tactic,weakness:profile.weakness,reward:profile.reward,rematchIndex:Math.floor(Math.max(0,conf.round-1)/BOSS_ROSTER.length)});}
 run.boss.reducedMotion=run.reducedMotion===true;
 run.boss.flightSeed=run.randomState??Math.floor(random(Math.random)*4294967296);
 run.obstacles=[];run.nextObstacle=Math.max(1.8,run.nextObstacle);
 const final=encounter?.role==='final-boss';
 announce(run,(final?'CHEFÃO FINAL ':encounter?.type==='povo'?'TRAVESSIA ':encounter?.role==='subboss'?'SUBCHEFE ':encounter?.role==='optional'?'DESAFIO OPCIONAL ':'CHEFÃO ')+run.boss.name+'! '+run.boss.objective);
}
function chooseBossPattern(boss,rng,pressure){
 if(boss.fired<3)return {...bossAttackFor(boss.type,boss.fired,boss.round-1),approach:'diagonal'};
 // Endless encounters also choose from this actor's own authored repertoire.
 // A small seeded offset varies the order, never the identity or announced lane.
 const rematchIndex=boss.rematchIndex??Math.floor(Math.max(0,(boss.round||1)-1)/BOSS_ROSTER.length);
 const phaseTwo=boss.remaining<=boss.total/2;
 return arenaPatternFor({...boss,rematchIndex,hp:phaseTwo?(boss.maxHp||100)/2:(boss.maxHp||100),maxHp:boss.maxHp||100},boss.fired+Math.floor(random(rng)*2));
}
function bossProjectileOrigin(run,boss,width){
 const pose=bossArenaPose(boss,visibleWidth(run));
 const muzzle=combatGeometryFor(boss.type,{frame:2,facing:-1,armyVariant:boss.stageId||STAGES[boss.stageIndex]?.id,enraged:boss.enraged})?.muzzle;
 return {x:pose.x+(muzzle?.x??-48)-width/2,y:pose.platformY-(muzzle?.y??-52)};
}
function launchStoryProjectile(run,shot){
 const origin=bossProjectileOrigin(run,run.boss,shot.width),distance=origin.x-frontContact(run);
 const reserve=run.obstacles.filter(o=>o!==shot&&o.bossAttack&&!o.passed&&!o.counted).map(o=>threatReservation(run,o)).filter(t=>Number.isFinite(t)&&t>0);
 // At the forward boundary, the shot still has a full reaction beat.
 // Well back, movement toward that boundary cannot skip the whole warning.
 const frontRange=playerBounds(run).max-playerX(run);
 const closestDistance=Math.max(1,distance-frontRange);
 const aid=run.aid?.kind==='telegraph'?run.aid.warningBonus??.24:0;
 const contact=Math.max(shot.contactFor+aid,...reserve.map(t=>t+REACTION_GAP));
 const speed=Math.max(202,Math.min(610,distance/contact));
 const finalSpan=Math.min(closestDistance*.52,speed*.19),coastSpan=closestDistance-finalSpan;
 const coastFor=Math.max(0,contact-(distance-coastSpan)/speed,.62+aid-finalSpan/speed);
 Object.assign(shot,{x:origin.x,y:origin.y,launchX:origin.x+shot.width/2,launchY:origin.y,targetX:playerX(run)+PLAYER.width/2,speed,
  laneX:origin.x-coastSpan,bossFlight:coastFor>0&&coastSpan>0?{remaining:coastFor,speed:coastSpan/coastFor}:null});
}
function finishStoryVolley(boss){
 const pattern=boss.volleyPattern,shots=boss.volleyShots;
 if(!pattern||!shots?.length||shots.some(o=>!o.resolved))return false;
 const cleared=shots.every(o=>!o.contactHit);
 const prior=boss.previousVolley;
 if(cleared&&boss.traversal&&pattern.counter?.trigger==='clear-only')boss.hp=0;
 if(cleared&&pattern.counter&&(pattern.counter.trigger!=='alternate'||prior?.cleared&&prior.type!==pattern.type)){
  boss.earnedCounter=pattern.counter;if(!boss.traversal)boss.counterReady=pattern.counter;
 }
 boss.previousVolley={type:pattern.type,cleared};
 boss.phaseFor=0;return true;
}
function advanceBoss(run,dt,rng,balance){
 const boss=run.boss;if(!boss)return;
 boss.attackFlashFor=Math.max(0,boss.attackFlashFor-dt);
 boss.hitFlashFor=Math.max(0,(boss.hitFlashFor||0)-dt);
 if(boss.lastDamage)boss.lastDamage.remaining=Math.max(0,boss.lastDamage.remaining-dt);
 if(boss.combat){
  if(boss.phase==='attack'&&boss.volleyLeft<=0)finishStoryVolley(boss);
  boss.stillFor=run.player.moveHeld?0:(boss.stillFor||0)+dt;
  const previousPhase=boss.phase;
  stepBossPhase(boss,dt,{...run.player,viewportWidth:visibleWidth(run),stillFor:boss.stillFor},rng);
  if(previousPhase!==boss.phase&&boss.phase==='charge')boss.volleyPattern=boss.plannedAttack;
  if(boss.phase!=='attack'||boss.volleyLeft<=0)return;
 }else boss.age=(boss.age||0)+dt;
 boss.nextAttack-=dt;
 if(!boss.combat&&boss.fired>=boss.total||boss.nextAttack>0)return;
 if(run.obstacles.filter(o=>!o.passed&&!o.counted).length>=5){boss.nextAttack=.12;return;}
 // Cada chefão ataca com suas armas; o disparo do herói é independente.
 const volley=boss.combat?(boss.volleyPattern||boss.plannedAttack||arenaPatternFor(boss,boss.fired)):boss.plannedFor===boss.fired?boss.plannedAttack:bossAttackFor(boss.type,boss.fired,boss.round-1);
 const release=boss.combat&&volley.burstMode==='sequence'?volley.sequence?.[(volley.burst||1)-boss.volleyLeft]:null;
 const pattern=release?{...volley,...release}:volley;
 const attackType=pattern.type;
 let attack;
 if(pattern.action==='move'){
  attack=spawnFallingThreat(run,{bossAttack:true,owner:boss.type,type:attackType,laneOffset:pattern.laneOffset});if(!attack){boss.nextAttack=.1;return;}
  if(boss.combat)attack.type=attackType;
 }else{
 const [baseWidth,baseHeight]=({hammer:[46,44],mandado:[42,44],
  lhand:[60,46],receipts:[44,40],stamp:[44,36],message:[44,36],microphone:[46,40],handcuffs:[46,40],barrier:[44,32],wind:[46,44],'budget-sheets':[46,42],'parachute-cross':[46,44],'rolling-case':[40,30],'falling-case':[36,36],'cloroquina-prop':[52,38],'ivermectina-prop':[52,38],'meme-ghost':[52,44],'signal-flare':[38,42],'court-seal':[44,44],'terere-gourd':[44,44],'harp-note':[42,44]})[attackType]||[46,40];
 const width=baseWidth*(pattern.widthScale||1),height=pattern.action==='crouch'?84:baseHeight;
 const entry=pattern.approach||'diagonal';
 const origin=bossProjectileOrigin(run,boss,width);
 const x=boss.combat?origin.x:Math.max(origin.x,frontContact(run)+60);
 const fromY=origin.y;
 const toY=Number.isFinite(pattern.targetY)?pattern.targetY:pattern.action==='jump'?(entry==='drop'?22:PLAYER.height/2):90;
 attack={x,width,height,type:attackType,action:pattern.action,owner:boss.type,bossAttack:true,counted:false,
  approach:entry,flightStyle:projectileStyle(attackType),...(boss.combat?{waitFor:0,speed:0,contactFor:pattern.contactFor??1.1}:threatMotion(run,x,balance.bossApproach/(pattern.projectileSpeedScale||1))),
  curve:pattern.curve,waveAmplitude:pattern.waveAmplitude,waveCycles:pattern.waveCycles,gust:pattern.gust,signature:pattern.signature,projectile:true,launchX:x+width/2,targetX:playerX(run)+PLAYER.width/2,
  launchY:fromY,targetY:toY,arcHeight:pattern.arcHeight||0,y:fromY};
 run.obstacles.push(attack);
 }
 if(boss.combat){attack.storyVolley=true;boss.volleyShots.push(attack);}
 if(boss.type==='bossonari')run.phantomCloud={remaining:1.3,medicine:attackType,x:Math.max(180,Math.min(visibleWidth(run)-150,playerX(run)+260))};
 // Projéteis com espera ainda estão em preparação. O loop de movimento
 // aciona a pose de disparo quando a espera termina, junto do corpo físico.
 if(!attack.projectile){boss.attackFlashFor=.26;boss.lastWeapon=attackType;boss.lastReleasedAction=pattern.action;}
 boss.fired++;
 boss.actionStreak=pattern.action===boss.lastAction?(boss.actionStreak||0)+1:1;
 boss.lastAction=pattern.action;
 boss.plannedFor=boss.fired;
 boss.plannedAttack=boss.combat?volley:chooseBossPattern(boss,rng,balance.pressure);
 boss.nextAttack+=(boss.combat?(pattern.gap??pattern.burstGap??boss.interval):boss.interval)+random(rng)*.12+(!boss.combat&&boss.type==='janones'&&boss.fired%Math.ceil(boss.total/3)===0?.55:0);
 if(boss.combat)boss.volleyLeft--;
 return attack;
}
function overlapsPlayer(run,o){
 const p=run.player,body=playerBodyFor(p),x=playerX(run),left=x+body.left,right=x+body.right;
 const low=p.y+3,high=p.y+body.height;
 return right>o.x+3&&left<o.x+o.width-3&&(o.projectile||o.falling?low<o.y+o.height/2&&high>o.y-o.height/2:low<(o.platformY||0)+o.height&&high>(o.platformY||0));
}
function resolveBossDodges(run){
 if(!run.boss)return;
 for(const o of run.obstacles)if(o.bossAttack&&!o.counted&&(o.falling?o.age>=o.warningFor+o.fallFor:o.x+o.width<playerX(run))){o.counted=true;if(run.boss.combat)run.boss.evaded++;else run.boss.remaining--;}
 const boss=run.boss;
 if(boss.combat?boss.hp>0:!(Number.isFinite(boss.hp)&&boss.hp<=0)&&(boss.fired<boss.total||boss.remaining>0))return;
 if(storyVolleyPendingVictory(boss))return;
 if(!boss.combat&&boss.hp>0&&run.obstacles.some(o=>o.reflected&&!o.destroyed&&o.reflection?.boss===boss))return;
 if(!boss.traversal)grantBossPower(run,boss.type);run.lastBoss=boss.type;run.boss=null;run.ammo=Math.min(ROUTE_AMMO,run.ammo);run.bossesDefeated++;rewardMovementVictory(run,boss);run.bossCooldown=BOSS_RUN_INTERVAL;
 if(boss.combat&&!boss.traversal&&!run.practice&&run.bossesDefeated<STORY_BOSS_COUNT)run.arenaExit={phase:'exit',age:0,duration:.65,color:boss.color,reducedMotion:run.reducedMotion===true};
 if(run.mode==='story'&&!run.practice&&boss.role==='map-boss')run.storyLeg={fromStage:boss.stageIndex,requiredDistance:PAIR_RUN_DISTANCE,groundDistance:0};
 run.heroShots=[];run.player.attackHeld=false;run.player.chargeFor=0;run.obstacles=[];
 if(run.practice){run.status='won';run.nextBossAt=Infinity;clearRunInput(run);announce(run,'Desafio opcional concluído.');return;}
 if(run.mode==='story'&&run.bossesDefeated>=STORY_BOSS_COUNT){
  run.status='ballot';run.nextBossAt=Infinity;run.obstacles=[];run.pickups=[];run.phantomCloud=null;
  run.ballot={digits:'',message:''};clearRunInput(run);
  announce(run,'ETAPA FINAL: confirme o código na urna fictícia.');
  return;
 }
 run.nextBossAt=run.mode==='story'?nextStoryBossDistance(run.bossesDefeated):Math.max(nextBossDistance(run.bossesDefeated),run.routeDistance+7000);run.nextObstacle=Math.max(1.8,run.nextObstacle);
 announce(run,run.mode==='story'?(boss.traversal?'Passagem concluída · ':'Você derrotou ')+boss.name+'! '+run.bossesDefeated+'/'+STORY_BOSS_COUNT+' etapas concluídas. '+(boss.role==='map-boss'?'Dupla vencida. Corra mais '+PAIR_RUN_DISTANCE/1000+' km até a próxima dupla.':'Continue para o próximo confronto.'):
  'Você escapou do chefão '+boss.name+'! '+(run.bossesDefeated%BOSS_ROSTER.length===0?'Cinco chefões superados nesta sequência.':'Continue fugindo.'));
}
const raidStageKey=run=>Math.floor(campaignRouteDistance(run)/(routeStagesFor(run).length*SCENE_DISTANCE))+':'+routeStageFor(run).id;
function recordRaidPresence(run,raid){
 const key=raidStageKey(run),stage=routeStageFor(run);
 raid.stageKeys??=[];if(raid.stageKeys.includes(key))return;
 raid.stageKeys.push(key);run.raidStageCoverage??={};run.raidStageCoverage[key]=true;
 run.raidStages??={};run.raidStages[stage.id]=(run.raidStages[stage.id]||0)+1;
}
function advanceRaid(run,dt,rng){
 if(run.raid){
  const raid=run.raid;if(raid.phase!=='recovery')recordRaidPresence(run,raid);raid.remaining=Math.max(0,raid.remaining-dt);
  if(raid.remaining<=1e-8){
   if(raid.phase==='warning'){raid.phase='active';raid.remaining=RAID_TIMING.activeFor;announce(run,'Toc, toc, toc… é a Polícia Federal! Pule a PF e abaixe dos microfones por dez segundos.');}
   else if(raid.phase==='active'){raid.phase='recovery';raid.recoveryFor=raid.recoveryFor||RAID_TIMING.recoveryFor;raid.remaining=raid.recoveryFor;announce(run,'A perseguição especial terminou. O ritmo normal está voltando.');}
   else{run.raid=null;const risk=difficultyAt(run.distance,run.elapsed).pressure;run.nextRaid=28-12*risk+random(rng)*(8-3*risk);run.bossCooldown=Math.max(run.mode==='story'?RAID_HANDOFF_SECONDS:2.5,run.bossCooldown);}
  }return;
 }
 if(run.terrain?.active||run.terrain?.preparing||!Number.isFinite(run.nextRaid))return;
 run.nextRaid-=dt;
 const stage=routeStageFor(run),local=campaignRouteDistance(run)%SCENE_DISTANCE;
 const dueByStage=local>=3000&&!run.raidStageCoverage?.[raidStageKey(run)];
 // An overdue local encounter reserves the boss approach instead of being
 // discarded when Jacaré or a preceding duel consumed its normal slot.
 if(run.practice||run.player.isJacare||hasJacareVolley(run)||run.boss||run.bossCooldown>0||routeTransitionFor(run).active||
  !dueByStage&&run.mode==='story'&&storyApproachAt(run.routeDistance,run.bossesDefeated))return;
 if(run.nextRaid<=0||dueByStage){
  const choices=RAID_FACTS.map((_,i)=>i).filter(i=>i!==run.lastFact);
  const factIndex=choices[Math.floor(random(rng)*choices.length)];run.lastFact=factIndex;
  run.raid={phase:'warning',stageId:stage.id,remaining:RAID_TIMING.warningFor,recoveryFor:RAID_TIMING.recoveryFor,factIndex,id:++run.raids,waves:0};
  recordRaidPresence(run,run.raid);
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
// Drop at most one recovery pack in 36 seconds, only while visibly hurt.
// A pack offers an optional level route; it is not paired with an imminent threat.
function maybeSpawnRecoveryPickup(run,balance){
 const p=run.player,b=run.boss;
 if(p.hp!==1||p.recoveryPending||p.isJacare||hasJacareVolley(run)||run.elapsed<run.recoveryReadyAt||run.terrain.active||run.raid||b?.traversal||b?.combat&&b.phase!=='recover'||run.pickups.some(o=>o.type==='rachadinha'))return;
 const speed=balance.speed*assistance(run),x=Math.max(playerX(run)+145,visibleWidth(run)+10),arrival=(x-playerX(run)-17)/speed;
 if(run.obstacles.some(o=>!o.counted&&!o.passed&&Math.abs(threatTimeToContact(run,o)-arrival)<.6))return;
 run.recoveryReadyAt=run.elapsed+36;
 run.pickups.push({type:'rachadinha',x,y:19,speed});
}
function applyPendingRecovery(run){
 const p=run.player;
 if(!p.recoveryPending||p.hp!==1||p.isJacare)return false;
 const full=playerBodyFor(p,{full:true});
 const terrain=run.terrain.active,overlaps=o=>p.x+full.right>o.x&&p.x+full.left<o.x+o.width;
 const lowRoof=terrain?.ceilings?.some(o=>overlaps(o)&&p.y+full.terrainHeight>o.bottom&&p.y<o.top);
 const raisedFace=terrain?.platforms?.some(o=>overlaps(o)&&p.y<o.y-1e-8&&p.y+full.terrainHeight>0);
 if(lowRoof||raisedFace)return false;
 p.recoveryPending=false;p.hp=p.maxHp;
 announce(run,'Rachadinha cenográfica: forma normal recuperada.');return true;
}
function finishImpact(run,hit,fatalFall){
 const p=run.player;
 const actor=hit.sourceActor||hit.owner;
 run.lastHit={type:hit.type,action:hit.action||(hit.projectile&&(hit.targetY??hit.y)>50?'crouch':'jump'),...(actor?{actor}:{})};
 if(hit.source)p.terrainContact=hit.source;
 else if(hit!==null){
  hit.counted=true;hit.contactHit=true;
  // Even a missed dodge eventually leaves the running-mode boss's sequence.
  if(hit.bossAttack&&run.boss&&!run.boss.combat)run.boss.remaining=Math.max(0,run.boss.remaining-1);
 }
 p.hp=fatalFall?0:Math.max(0,p.hp-1);
 if(p.hp>0){
  run.graceFor=1.2;run.recoveryReadyAt=Math.max(run.recoveryReadyAt,run.elapsed+5);
  announce(run,'Flávio se machucou. Mais um impacto encerra a tentativa.');return;
 }
 if(restoreStoryCheckpoint(run)){
  clearRunInput(run);announce(run,'CHECKPOINT! Flávio voltou à última bandeira. Tentativas restantes: '+run.storyRooms.retries+'.');return;
 }
 p.recoveryPending=false;run.status='over';run.heroShots=[];clearRunInput(run);
 announce(run,fatalFall?'Flávio caiu no vazio.':isJacareAmpoule(hit)?'Uma ampola cenográfica atingiu Flávio. A corrida terminou.':'A corrida terminou após o segundo impacto.');
}
export function canContinueRun(run){
 return run.status==='over'&&run.lives>STARTING_LIVES&&run.lastHit?.type!=='terrain-gap'&&!run.terrain?.active&&!run.practice&&!run.boss?.traversal;
}
export function continueRun(run){
 if(!canContinueRun(run))return false;
 const p=run.player,b=run.boss;
 if(b?.combat){
  // A continuação remove as ameaças emitidas, mas a rajada ainda guarda
  // essas referências. Resolva-as como não esquivadas antes de limpar a pista.
  for(const shot of b.volleyShots??[])if(!shot.resolved){shot.resolved=true;shot.contactHit=true;}
 }else if(b){
  const cleared=run.obstacles.filter(o=>o.bossAttack&&!o.counted).length;
  b.remaining=Math.max(0,b.remaining-cleared);
 }
 run.lives--;run.status='running';run.lastHit=null;run.heroShots=[];run.obstacles=[];run.graceFor=RECOVERY_AFTER_EXTRA;
 run.nextObstacle=Math.max(.85,run.nextObstacle);
 if(b)b.nextAttack=Math.max(.85,b.nextAttack);
 p.hp=p.maxHp;p.recoveryPending=false;p.terrainContact=null;p.isJacare=false;p.jacareProgress=0;p.jacareAge=0;p.restoreFlashFor=0;
 p.y=0;p.velocity=0;p.supportY=0;p.grounded=true;p.airJumpsUsed=0;
 clearRunInput(run);
 announce(run,'Continuação usada. A corrida segue da posição atual.');return true;
}
function regularShot(run,type,actor,approach){
 const stageId=routeStageFor(run).id,width=46,muzzle=regularCastMuzzle(actor,visibleWidth(run),WORLD.ground,run.elapsed*10,stageId);
 const reserved=run.obstacles.filter(o=>!o.passed&&!o.counted).map(o=>threatReservation(run,o)).filter(t=>Number.isFinite(t)&&t>0);
 const flightFor=Math.min(.6,.24+Math.abs(muzzle.x-(playerX(run)+17))/900);
 // A nearby emitter can hit as soon as it releases. Reserve that release,
 // rather than only the end of flight, after the preceding evasive action.
 const eta=Math.max(1.08,approach/assistance(run),...reserved.map(t=>t+REACTION_GAP+flightFor));
 const waitFor=eta-flightFor;
 return {x:muzzle.x-width/2,y:muzzle.y,width,height:72,type,stageId,action:'crouch',sourceActor:actor,projectile:true,
  approach:'overhead',flightStyle:projectileStyle(type),launchX:muzzle.x,launchY:muzzle.y,targetX:playerX(run)+17,targetY:84,speed:180,waitFor,
  cast:{windupFor:waitFor,flightFor,flightAge:0,fromX:muzzle.x,fromY:muzzle.y,toX:playerX(run)+17}};
}
function advanceRegularShot(run,o,dt){
 const waiting=o.waitFor||0,active=Math.max(0,dt-waiting);o.waitFor=Math.max(0,waiting-dt);
 if(active<=0)return;
 const cast=o.cast;
 if(!o.launched){
  const muzzle=regularCastMuzzle(o.sourceActor,visibleWidth(run),WORLD.ground,run.elapsed*10,o.stageId||routeStageFor(run).id),center=playerX(run)+17,half=o.width/2;
  const direction=muzzle.x>=center?1:-1,near=direction>0?frontContact(run)+half:playerX(run)+5-half+3;
  const far=direction>0?playerX(run)+5-half+3:frontContact(run)+half;
  cast.fromX=o.launchX=muzzle.x;cast.fromY=o.launchY=muzzle.y;cast.toX=direction*(muzzle.x-near)>=0?near:far;
  o.targetX=center;o.approach=direction>0?'overhead':'rear';o.speed=direction*Math.max(180,Math.abs(cast.fromX-cast.toX)/cast.flightFor);
  cast.releasePhase=run.elapsed*10;o.launched=true;
 }
 cast.flightAge+=active;const u=Math.min(1,cast.flightAge/cast.flightFor);
 o.x=cast.fromX+(cast.toX-cast.fromX)*u-o.width/2-o.speed*Math.max(0,cast.flightAge-cast.flightFor);
 o.y=cast.fromY+(o.targetY-cast.fromY)*u;
 if(cast.flightAge>=cast.flightFor){const left=playerX(run)+5,right=playerX(run)+PLAYER.width-3;
  if(o.speed>0&&o.x+o.width-3<=left||o.speed<0&&o.x+3>=right)o.passed=true;
 }
}
function rehearseStoryBoss(run,balance){
 const approach=storyApproachAt(run.routeDistance,run.bossesDefeated);
 if(!approach||approach.boss.traversal||approach.phase!=='rehearsal'||run.rehearsedBoss===approach.boss.id||
  run.obstacles.some(o=>!o.passed&&!o.counted))return;
 const b=approach.boss,pattern=arenaPatternFor(b,0),width=44,x=visibleWidth(run)+40;
 // Um exemplo isolado da arma, com a mesma geometria de evasão do combate.
 // Não acrescenta um prêmio, uma segunda onda nem um tutorial que interrompa.
 if(!pattern.type)return;
 const o=pattern.action==='move'?spawnFallingThreat(run,{type:pattern.type,owner:b.type,laneOffset:pattern.laneOffset}):
  {x,width,height:pattern.action==='crouch'?84:40,type:pattern.type,action:pattern.action,sourceActor:b.type,rehearsal:true,
  approach:pattern.approach,projectile:true,flightStyle:projectileStyle(pattern.type),launchX:x+width/2,
  targetX:playerX(run)+PLAYER.width/2,launchY:100,targetY:pattern.action==='crouch'?92:24,y:100,
  ...threatMotion(run,x,balance.obstacleApproach)};
 if(!o)return;
 o.rehearsal=true;o.sourceActor=b.type;
 if(!o.falling)run.obstacles.push(o);run.spawnedObstacles++;run.rehearsedBoss=b.id;
 run.cameo={type:b.type,remaining:1.4};return o;
}
function terrainEntryBudget(run){
 const p=run.player;
 const threats=run.obstacles.filter(o=>!o.passed&&!o.counted&&!o.destroyed).map(o=>{
  if(o.falling)return Math.max(0,o.warningFor+o.fallFor+.25-o.age);
  if(o.groundHazard)return Math.max(0,o.warningFor+o.activeFor-o.age);
  return Math.max(0,threatTimeToContact(run,o))+(o.width||40)/Math.max(180,Math.abs(o.speed)||180)+.3;
 });
 const landing=p.grounded?0:(p.velocity+Math.sqrt(p.velocity*p.velocity+3500*Math.max(0,p.y)))/1750;
 const remaining=Math.max(0,landing,...threats.filter(Number.isFinite));
 return remaining>0?remaining+.12:0;
}
function prepareTerrainEntry(run,at,kind,speed){
 const state=run.terrain,clearing=terrainEntryBudget(run);
 if(pairRunRemaining(run)>speed*Math.max(2.4,clearing))return false;
 if(run.nextBossAt<at&&run.nextBossAt>run.routeDistance){
  if(state.preparing?.kind===kind)state.preparing=null;
  return false;
 }
 if(state.preparing?.kind!==kind&&run.routeDistance<at-speed*Math.max(2.4,clearing))return false;
 state.preparing={kind,at};
 return true;
}
function prepareGroundLesson(run,balance){
 const {lessonAt,lessonExit,lessonStage}=groundLessonFor(run);
 if(!lessonPending(run)||run.terrain.active||run.routeDistance>=lessonExit||run.boss||run.raid||run.player.isJacare||run.nextBossAt<=run.routeDistance)return false;
 if(!prepareTerrainEntry(run,lessonAt,'ground-lesson',balance.speed*assistance(run)))return false;
 if(run.routeDistance<lessonAt)return true;
 if(run.obstacles.some(o=>!o.passed&&!o.counted&&!o.destroyed)||!run.player.grounded||run.player.y!==0)return true;
 beginGroundLesson(run,balance.speed*assistance(run),{routeStart:run.routeDistance,routeEnd:lessonExit});
 announce(run,lessonStage.short+': pule quando a barra se aproximar; ainda há chão sob o exercício.');
 return true;
}
function prepareFlight(run,balance){
 if(run.terrain?.active||run.boss||run.raid||run.player.isJacare||run.nextBossAt<=run.routeDistance)return false;
 const plan=nextAirTransfer(run);
 if(!plan)return false;
 const {arrival,from,to}=plan;
 // Let previously committed warnings resolve. No extra terrestrial waves
 // enter the runway, but world time and controls keep moving while it clears.
 if(run.nextRaid!==Infinity&&!run.raidStageCoverage?.[raidStageKey(run)])return false;
 if(!prepareTerrainEntry(run,plan.boardAt,'air-transfer',balance.speed*assistance(run)))return false;
 if(run.routeDistance<plan.boardAt)return true;
 if(run.obstacles.some(o=>!o.passed&&!o.counted&&!o.destroyed)||!run.player.grounded||run.player.y!==0)return true;
 const corridor=beginAirTransfer(run,balance.speed*assistance(run),{routeStart:run.routeDistance,routeEnd:arrival,from:from.id,to:to.id,fromName:from.short,toName:to.short});
 run.obstacles=[];run.pickups=[];
 // Keep the normal passport economy on actual supports, away from armed
 // crossings. They follow the moving bars instead of the ground waves.
 if(Number.isFinite(run.nextPassport)){
  for(const bar of [corridor.platforms[0],corridor.platforms.at(-1)]){
   const center=bar.x+bar.width*.48,item=PICKUPS[0];
   for(const offset of [-35,0,35])run.pickups.push({x:center+offset,y:bar.y+18,type:item.type,value:item.value});
   run.spawnedPickups++;
  }
 }
 announce(run,'Embarque: '+from.short+' → '+to.short+'. Sem chão: pule de plataforma em plataforma. Cair no vazio encerra a tentativa.');
 return true;
}
function prepareTerrain(run,balance){
 const state=run.terrain;if(!state||state.active||run.elapsed<state.nextAt||!Number.isFinite(run.nextObstacle)||run.practice||run.boss||run.raid||run.player.isJacare||run.bossCooldown>0||routeTransitionFor(run).active||run.mode==='story'&&storyApproachAt(run.routeDistance,run.bossesDefeated))return false;
 if(campaignRouteDistance(run)<2*SCENE_DISTANCE)return false;
 const speed=balance.speed*assistance(run),reserve=terrainReservationFor(run,speed),travel=speed*reserve;
 const local=campaignRouteDistance(run)%SCENE_DISTANCE;
 const plan=nextAirTransfer(run),{lessonAt}=groundLessonFor(run);
 const end=run.routeDistance+travel;
 if((plan&&run.routeDistance<plan.boardAt&&end>=plan.boardAt)||
    (lessonPending(run)&&run.routeDistance<lessonAt&&end>=lessonAt))return false;
 if(run.nextRaid<=reserve||run.nextBossAt-run.routeDistance<=travel+(run.mode==='story'?1000:0)||local+travel>SCENE_DISTANCE*.9||run.pickups.some(p=>p.type==='ze-gotinha'))return false;
 // Stop introducing waves while the last announced attack clears. Existing
 // attacks complete with their original contact times before terrain appears.
 if(run.obstacles.some(o=>!o.passed&&!o.counted&&!o.destroyed))return true;
 beginTerrain(run,speed);announce(run,'Vão à frente: pule e pouse na plataforma elevada.');return true;
}
export function advanceRun(run,seconds,rng){
 if(run.status!=='running'||!Number.isFinite(seconds)||seconds<=0)return;
 if(typeof rng!=='function')rng=run.randomState===null||run.randomState===undefined?Math.random:()=>{run.randomState=nextSeed(run.randomState);return run.randomState/4294967296;};
 const dt=Math.min(seconds,.05);run.elapsed+=dt;
 if(run.clearedAt){
  run.clearedAt.remaining=Math.max(0,run.clearedAt.remaining-dt);
  if(run.clearedAt.remaining<=0)run.clearedAt=null;
 }
 if(run.arenaExit){run.arenaExit.age+=dt;if(run.arenaExit.age>=run.arenaExit.duration)run.arenaExit=null;}
 if(run.boss)run.boss.hurtFor=Math.max(0,(run.boss.hurtFor||0)-dt);
 if(run.lastSkillReward){run.lastSkillReward.remaining-=dt;if(run.lastSkillReward.remaining<=0)run.lastSkillReward=null;}
 if(run.lastPowerReward){run.lastPowerReward.remaining-=dt;if(run.lastPowerReward.remaining<=0)run.lastPowerReward=null;}
 run.player.previousX=playerX(run);
 const bounds=playerBounds(run);
 if(run.boss?.activeGust){const gust=run.boss.activeGust;run.player.x=Math.max(bounds.min,Math.min(bounds.max,playerX(run)+gust.direction*gust.strength*dt));gust.remaining-=dt;if(gust.remaining<=0)run.boss.activeGust=null;}
 const duel=run.boss?.combat&&!run.boss.traversal&&run.boss.phase!=='intro';
 advanceSlide(run,dt,!!duel||!run.boss&&!run.raid&&!run.player.isJacare&&!(run.mode==='story'&&storyApproachAt(run.routeDistance,run.bossesDefeated)));
 const moveSpeed=run.player.sliding?TERRAIN.slideSpeed:LATERAL_SPEED*(run.aid?.kind==='encourage'?1.2:1);
 const entering=run.boss?.combat&&run.boss.phase==='intro'&&playerX(run)>visibleWidth(run)-arenaReserve(run);
 // O modo História visível usa controle manual: Flávio anda até o
  // ponto de acompanhamento da câmera, que só então move o cenário.
  // Recuar move Flávio dentro da tela, sem retroceder para fases vencidas.
  // O Infinito e as simulações antigas mantêm a corrida automática.
  const manualScroll=run.manualStory===true&&!bossStopsAutoRun(run);
  // Antecipação suave: deixa até 5,5% da tela a mais à frente do
  // personagem. O recuo da câmera nunca move a estrada sem comando.
  // Acompanhamento inicia depois da metade da tela, não na antiga marca de 38%.
  if(manualScroll){
   const targetLead=run.player.moveHeld>0?Math.min(28,visibleWidth(run)*.055):
    run.player.moveHeld<0?-Math.min(14,visibleWidth(run)*.03):0;
   run.cameraLead+=(targetLead-run.cameraLead)*(1-Math.exp(-9*dt));
  }
  let manualTravel=0;
  if(manualScroll&&!entering&&run.player.moveHeld>0){
   const step=moveSpeed*dt,anchor=Math.max(bounds.min,Math.min(bounds.max,visibleWidth(run)*.56-run.cameraLead));
   const screenStep=Math.min(step,Math.max(0,anchor-playerX(run)));
   run.player.x=Math.max(bounds.min,Math.min(bounds.max,playerX(run)+screenStep));
   manualTravel=step-screenStep;
  }else if(manualScroll&&!entering&&run.player.moveHeld<0&&!run.terrain?.active&&!run.raid){
   const step=moveSpeed*dt,anchor=Math.max(bounds.min,Math.min(bounds.max,visibleWidth(run)*.25-run.cameraLead));
   const screenStep=Math.min(step,Math.max(0,playerX(run)-anchor));
   run.player.x=Math.max(bounds.min,playerX(run)-screenStep);
   const backtrack=Math.min(Math.max(0,run.distance),step-screenStep);
   manualTravel=-backtrack;
   const remainder=step-screenStep-backtrack;
   if(remainder>0)run.player.x=Math.max(bounds.min,playerX(run)-remainder);
   if(backtrack>0){
    for(const o of run.obstacles)if(!Number.isFinite(o.storyWorldX))o.x+=backtrack;
    for(const item of run.pickups)item.x+=backtrack;
   }
  }else{
   run.player.x=entering?Math.max(visibleWidth(run)-arenaReserve(run),playerX(run)-230*dt):Math.max(bounds.min,Math.min(bounds.max,playerX(run)+(run.player.moveHeld||0)*moveSpeed*dt));
  }
  manualTravel=constrainStageAdvance(run,manualTravel,playerBodyFor(run.player));
  if(manualScroll&&run.player.moveHeld)run.player.manualTravel=(run.player.manualTravel||0)+Math.abs(run.player.x-run.player.previousX)+Math.abs(manualTravel);
 if(bossStopsAutoRun(run)&&run.player.moveHeld)run.player.arenaTravel=(run.player.arenaTravel||0)+Math.abs(run.player.x-run.player.previousX);
 advanceAllies(run,dt);
 if(run.player.isJacare){
  const p=run.player;
  p.jacareAge=Math.min(JACARE_RECOVERY_SECONDS,p.jacareAge+dt);
  p.jacareProgress=Math.floor(p.jacareAge);
  if(p.jacareAge>=JACARE_RECOVERY_SECONDS)restoreJacareRun(run);
 }
 run.player.restoreFlashFor=Math.max(0,run.player.restoreFlashFor-dt);
 if(run.nextBossAt===null)run.nextBossAt=run.mode==='story'?nextStoryBossDistance(0):nextBossDistance(0);
 if(run.nextRaid===null)run.nextRaid=18+random(rng)*12;
 const balance=difficultyAt(run.distance,run.elapsed),travel=bossStopsAutoRun(run)?0:run.manualStory?manualTravel:balance.speed*assistance(run)*dt;run.distance=Math.max(0,run.distance+travel);
 const progressTravel=run.manualStory?Math.max(0,run.distance-(run.storyRooms?.maxDistance||0)):travel;
  if(run.storyRooms)run.storyRooms.maxDistance=Math.max(run.storyRooms.maxDistance||0,run.distance);
  if(!run.boss&&!run.terrain?.active?.flight&&!run.terrain?.active?.lesson){
  const stop=run.mode==='story'&&Number.isFinite(run.nextBossAt)&&run.routeDistance<=run.nextBossAt?run.nextBossAt:Infinity;
  const local=campaignRouteDistance(run)%SCENE_DISTANCE;
  const missingRaid=Number.isFinite(run.nextRaid)&&!run.practice&&!run.raidStageCoverage?.[raidStageKey(run)];
  // Keep an unmet local encounter before the scenery transition. Physical
  // distance still advances while a cooldown or Jacaré finishes.
  const raidStop=missingRaid&&local<=6200?run.routeDistance-local+6200:Infinity;
  const plan=nextAirTransfer(run),{lessonAt}=groundLessonFor(run);
  const flightStop=plan&&run.routeDistance<=plan.boardAt?plan.boardAt:Infinity;
  const lessonStop=lessonPending(run)&&run.routeDistance<=lessonAt?lessonAt:Infinity;
  // Stretch nominal stage progress across the post-boss running interval.
  // Physical metres and road movement keep their normal speed; no checkpoint freeze.
  const routeTravel=stageRouteTravel(run,progressTravel,dt,{stageIndex:routeStageFor(run).index,missingRaid,raidTiming:RAID_TIMING,
   jacareRecovery:JACARE_RECOVERY_SECONDS,checkpointAt:Math.min(flightStop,lessonStop,raidStop),clearanceSeconds:run.terrain.preparing?terrainEntryBudget(run):0});
  run.routeDistance=Math.min(stop,raidStop,flightStop,lessonStop,run.routeDistance+routeTravel);
 }
 if(run.storyLeg&&!run.boss&&!run.terrain?.active?.flight)run.storyLeg.groundDistance=Math.min(run.storyLeg.requiredDistance,run.storyLeg.groundDistance+progressTravel);
 stepStoryRooms(run,dt);
 run.bossCooldown=Math.max(0,run.bossCooldown-dt);
 if(run.phantomCloud){run.phantomCloud.remaining=Math.max(0,run.phantomCloud.remaining-dt);if(!run.phantomCloud.remaining)run.phantomCloud=null;}
 if(run.cameo){run.cameo.remaining-=dt;if(run.cameo.remaining<=0)run.cameo=null;}
 // A tolerância só absorve erro de ponto flutuante no limite exato de 120ms.
 if(run.player.jumpBufferedUntil<run.elapsed-1e-8)run.player.jumpBufferedUntil=0;
 const wasGrounded=run.player.grounded;
 advanceTerrain(run,dt,travel);
 const terrainHit=stepTerrainPlayer(run,dt);
 const p=run.player;
 if(p.isJacare||p.grounded||terrainHit)p.coyoteUntil=0;
 else if(wasGrounded&&p.velocity<=0)p.coyoteUntil=run.elapsed+(run.manualStory?STORY_EDGE_JUMP_GRACE:EDGE_JUMP_GRACE);
 else if(p.coyoteUntil<run.elapsed)p.coyoteUntil=0;
 if(!run.player.isJacare&&run.player.grounded&&run.player.jumpBufferedUntil>0)jumpRun(run);
 if(!terrainHit||terrainHit.source!==run.player.terrainContact)run.player.terrainContact=null;
 run.shieldFor=Math.max(0,run.shieldFor-dt);run.graceFor=Math.max(0,run.graceFor-dt);
 stepStageEnemies(run,dt);
 const castDeltas=new Map();
 for(const obstacle of run.obstacles){
  if(Number.isFinite(obstacle.storyWorldX)){obstacle.x=obstacle.storyWorldX-run.distance;continue;}
  if(obstacle.reflected){advanceReflectedProjectile(run,obstacle,dt);continue;}
  if(obstacle.cast){const before=obstacle.x;advanceRegularShot(run,obstacle,dt);castDeltas.set(obstacle,obstacle.x-before);continue;}
  if(obstacle.groundHazard){obstacle.age+=dt;continue;}
  if(obstacle.falling){
   obstacle.age+=dt;
   const progress=Math.max(0,Math.min(1,(obstacle.age-obstacle.warningFor)/obstacle.fallFor));
   obstacle.y=310-342*progress;
   if(obstacle.storyVolley){
    if(obstacle.age>=obstacle.warningFor&&overlapsPlayer(run,obstacle))obstacle.contactHit=true;
    if(progress>=1)obstacle.resolved=true;
   }
   continue;
  }
  const waiting=obstacle.waitFor||0,activeDelta=Math.max(0,dt-waiting);
  // A espera ainda é preparação. Comprometer a mira somente ao disparar
  // evita arcos altos involuntários após uma esquiva lateral obrigatória.
  if(obstacle.projectile&&activeDelta>0){
   if(!obstacle.launched&&obstacle.storyVolley)launchStoryProjectile(run,obstacle);
   else if(!obstacle.launched&&waiting>0)obstacle.targetX=playerX(run)+PLAYER.width/2;
   if(!obstacle.launched&&obstacle.bossAttack&&run.boss){run.boss.attackFlashFor=.26;run.boss.lastWeapon=obstacle.type;run.boss.lastReleasedAction=obstacle.action;if(obstacle.gust)run.boss.activeGust={...obstacle.gust,remaining:obstacle.gust.duration};}
   obstacle.launched=true;
  }
  obstacle.waitFor=Math.max(0,waiting-dt);
  const coast=obstacle.bossFlight&&!obstacle.returning?Math.min(activeDelta,obstacle.bossFlight.remaining):0;
  if(coast>0){obstacle.bossFlight.remaining-=coast;obstacle.x-=obstacle.bossFlight.speed*coast;}
  obstacle.x-=Number.isFinite(obstacle.speed)?obstacle.speed*(activeDelta-coast):travel;
  if(obstacle.projectile&&!obstacle.returning)obstacle.y=projectileFlightY(obstacle,obstacle.x);
  if(obstacle.storyVolley&&obstacle.launched&&!obstacle.passed&&overlapsPlayer(run,obstacle))obstacle.contactHit=true;
  const left=playerX(run)+(run.player.isJacare?-15:5),right=playerX(run)+(run.player.isJacare?PLAYER.width+17:PLAYER.width-3);
  if(obstacle.speed>0&&obstacle.x+obstacle.width-3<=left||obstacle.speed<0&&obstacle.x+3>=right)obstacle.passed=true;
  if(obstacle.curve==='boomerang'&&obstacle.passed&&!obstacle.returning&&obstacle.x+obstacle.width<playerX(run)){
   obstacle.returning=true;obstacle.speed=-Math.max(420,Math.abs(obstacle.speed)*1.22);if(obstacle.storyVolley)obstacle.y=Math.max(108,obstacle.y);
  }
  if(obstacle.returning&&run.boss){const pose=bossArenaPose(run.boss,visibleWidth(run));obstacle.y+=(pose.platformY+48-obstacle.y)*Math.min(1,dt*2);if(obstacle.x+obstacle.width/2>=pose.x){obstacle.resolved=true;obstacle.destroyed=true;}}
  else if(obstacle.passed&&obstacle.curve!=='boomerang')obstacle.resolved=true;
 }
 for(const pickup of run.pickups){
  if(pickup.anchor?.cast&&castDeltas.has(pickup.anchor)){pickup.x+=castDeltas.get(pickup.anchor);pickup.speed=pickup.anchor.speed;pickup.waitFor=pickup.anchor.waitFor;continue;}
  const activeDelta=Math.max(0,dt-(pickup.waitFor||0));pickup.waitFor=Math.max(0,(pickup.waitFor||0)-dt);
  pickup.x-=Number.isFinite(pickup.speed)?pickup.speed*activeDelta:travel;
 }
 spawnStageEnemies(run);
 advanceHeroShots(run,dt);
 resolveBossDodges(run);
 if(run.status!=='running')return;
 run.obstacles=run.obstacles.filter(o=>{
  const keep=!o.destroyed&&(o.groundHazard?o.age<o.warningFor+o.activeFor:o.falling?o.age<o.warningFor+o.fallFor+.25:retainMovingThreat(o,visibleWidth(run)));
  if(!keep&&o.storyVolley&&!o.resolved){o.resolved=true;o.contactHit=true;}
  return keep;
 });
 run.pickups=run.pickups.filter(p=>p.x>-30);
 const jacareWave=hasJacareVolley(run);
 // Uma Joice já vencida tem prioridade sobre o próximo marco de chefe.
 advanceRaid(run,dt,rng);
 if(!run.terrain?.active&&!run.player.isJacare&&!jacareWave&&!run.boss&&!run.raid&&run.bossCooldown<=0&&run.routeDistance>=run.nextBossAt&&(run.mode==='story'||!routeTransitionFor(run).active))beginBoss(run);
 const terrainWaiting=!jacareWave&&(prepareGroundLesson(run,balance)||prepareFlight(run,balance)||prepareTerrain(run,balance));
 let anchor;
 if(run.terrain?.active||terrainWaiting){run.nextObstacle=Math.max(run.nextObstacle,1.2);}
 else if(run.player.isJacare){
  // Sem salto normal, o evento pede reposicionamento, não obstáculos saltáveis.
  run.player.nextJacareThreat-=dt;
  if(run.player.nextJacareThreat<=0)anchor=queueJacareVolley(run,rng);
 }else if(jacareWave){run.nextObstacle=Math.max(run.nextObstacle,.8);}
 else if(run.boss)anchor=advanceBoss(run,dt,rng,balance);
 else if(run.mode==='story'&&!run.raid&&storyApproachAt(run.routeDistance,run.bossesDefeated)){
  anchor=rehearseStoryBoss(run,balance);
  run.nextObstacle=Math.max(run.nextObstacle,1.5);
 }
 else if(run.manualStory&&!run.raid){
  // Nas salas da História, inimigos fixos substituem ondas da corrida automática.
  run.nextObstacle=Math.max(run.nextObstacle,1.2);
 }
 else{
  run.nextObstacle-=dt;
  if(run.nextObstacle<=0&&run.obstacles.filter(o=>!o.passed&&!o.counted).length<5){
   const raidActive=run.raid?.phase==='active';
   const stageId=routeStageFor(run).id,route=campaignRouteDistance(run);
   const lap=run.mode==='story'?0:Math.floor(route/ROUTE_DISTANCE);
   const priorRhythm=run.groundRhythm?.stageId===stageId&&run.groundRhythm.lap===lap?run.groundRhythm:null;
   const chapter=priorRhythm?.beat??0,cursor=priorRhythm?.lessonCursor??0;
   const rhythm=!run.raid&&run.elapsed>=10?groundRhythmFor({mode:run.mode,stageId,lap,beat:chapter,lessonCursor:cursor,lastBoss:run.lastBoss,
    localDistance:route%SCENE_DISTANCE,capped:balance.pressure>=.995&&balance.endurance>=.99}):null;
   const plannedLesson=rhythm?.opening;
   // Se não houver espaço para o aviso planejado, mantenha a lição pendente
   // e use o sorteio normal com reserva de contato, sem empilhar marcações.
   if(plannedLesson==='marker')anchor=spawnManholeThreat(run,{rng});
   const lesson=plannedLesson==='marker'&&!anchor?null:plannedLesson;
   // A abertura ensina o sinal local; fora dela, o limite de três respostas
   // iguais evita ensinar uma estratégia repetitiva para a corrida inteira.
   const previous=run.lastAction;
   const inverted=previous==='jump'?'crouch':'jump';
   const crouchChance=raidActive ? .49 : .40+.08*balance.pressure+(rhythm?.crouchShift??0);
   let action=lesson?lesson==='overhead'?'crouch':'jump':run.elapsed<10?'jump':random(rng)<crouchChance?'crouch':'jump';
   if(!lesson&&run.elapsed>=10&&previous===action&&run.actionStreak>=3)action=inverted;
   else if(!lesson&&run.elapsed>=10&&previous===action&&run.actionStreak>=2&&balance.pressure>.52&&random(rng)<.38)action=inverted;
   run.actionStreak=action===run.lastAction?run.actionStreak+1:1;run.lastAction=action;
   const x=visibleWidth(run)+40,approach=raidActive?Math.max(.85,balance.obstacleApproach-.15):balance.obstacleApproach;
   // A partir da segunda etapa, baixos podem rolar, cair de cima ou avançar pela retaguarda.
   // Cada estilo compete por um único intervalo: jamais surgem dois contatos simultâneos.
   if(raidActive&&(run.raid.waves||0)>0&&random(rng)<.20+.15*balance.pressure&&run.raid.remaining>3){
    anchor=spawnFallingThreat(run);
    if(anchor&&anchor.warningFor+anchor.fallFor>run.raid.remaining-.2){run.obstacles=run.obstacles.filter(o=>o!==anchor);anchor=null;}
   }
   if(!anchor&&!raidActive&&!plannedLesson&&run.elapsed>=12&&random(rng)<.12+.14*balance.pressure+(rhythm?.markerShift??0))anchor=spawnManholeThreat(run,{rng});
   if(anchor){/* A zona local já entrou no mundo com um aviso comprometido. */}
   else if(action==='crouch'){
    const regional=run.mode==='story'?stageRosterFor(routeStageFor(run).id).overhead:null;
    const performers=regional?regional.map(entry=>entry.actor):unlockedCharacters(balance.level,'overhead');
    const type=raidActive?'joice':chooseProgressiveCharacter(performers,rng,run.seenOverheadActors,run.lastOverheadActor);
    if(!raidActive){
     if(!run.seenOverheadActors.includes(type))run.seenOverheadActors.push(type);
     run.lastOverheadActor=type;run.overheadCount++;
    }
    const attackType=(!raidActive&&regional?.find(entry=>entry.actor===type)?.weapon)||{dilma:'wind',simone:'budget-sheets',soraya:'parachute-cross','meme-army':'meme-ghost',joice:'microphone'}[type];
    anchor=regularShot(run,attackType,type,approach);
    if(!raidActive)run.cameo={type,stageId:anchor.stageId,remaining:anchor.waitFor+.78,shot:anchor};
   }else{
    const selected=raidActive?foeFor('pf'):run.mode==='story'?foeFor(chooseProgressiveCharacter(stageRosterFor(routeStageFor(run).id).ground,rng,run.seenGroundActors,run.lastGroundActor)):pursuitAt(routeClock(run),rng,balance.level,run.seenGroundActors,run.lastGroundActor);
    const foe=run.supportAvailable===false&&['boulos','dino'].includes(selected.type)?foeFor('pf'):selected;
    const roll=random(rng);
    const activeStyles=run.elapsed>=12&&!raidActive;
    const rearChance=.30+.18*balance.pressure;
    const style=lesson||((rhythm&&activeStyles)?groundStyleFor(rhythm,roll,balance.pressure,{rear:run.elapsed>=18,drop:balance.pressure>.12}):null);
    const rear=style?style==='rear':activeStyles&&run.elapsed>=18&&roll<rearChance;
    const falling=style?style==='drop':activeStyles&&balance.pressure>.12&&roll>=rearChance&&roll<rearChance+.20;
    const rolling=style?style==='rolling':activeStyles&&roll>=rearChance+.20&&roll<rearChance+.36;
    const popcorn=style?style==='popcorn':activeStyles&&roll>=rearChance+.36&&roll<rearChance+.50;
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
    if(anchor.type==='ze-gotinha-rival'){anchor.projectile=true;anchor.curve='bounce';anchor.arcHeight=0;anchor.waveAmplitude=43;anchor.waveCycles=2;anchor.y=anchor.targetY=anchor.launchY=26;anchor.launchX=anchor.x+anchor.width/2;anchor.targetX=playerX(run)+17;}
    if(!raidActive&&anchor.type===foe.type){
     if(!run.seenGroundActors.includes(foe.type))run.seenGroundActors.push(foe.type);
     run.lastGroundActor=foe.type;
    }
   }
   if(anchor.type==='army')anchor.armyVariant=routeStageFor(run).id;
   if(!anchor.falling&&!anchor.groundHazard)run.obstacles.push(anchor);run.spawnedObstacles++;
   if(raidActive)run.raid.waves=(run.raid.waves||0)+1;
   if(rhythm){
    const actual=anchor.groundHazard?'marker':anchor.cast?'overhead':anchor.approach;
    run.groundRhythm={stageId,lap,beat:chapter+1,lessonCursor:cursor+Number(!!lesson&&lesson===actual)};
   }
   run.attackStyles.push(anchor.approach||'overhead');
   if(run.attackStyles.length>16)run.attackStyles.shift();
   const gap=raidActive ? 1.02-.17*balance.pressure:run.raid?.phase==='recovery'?
    (1.02-.17*balance.pressure)+(balance.obstacleGap-1.02+.17*balance.pressure)*Math.max(0,Math.min(1,1-run.raid.remaining/(run.raid.recoveryFor||RAID_TIMING.recoveryFor))):Math.max(.86,balance.obstacleGap*(rhythm?.pace??1));
   // Microvariação de intervalo aumenta a incerteza sem criar colisões inevitáveis.
   // A aproximação de cada perigo ainda passa pelo limitador de 0,82 s.
   run.nextObstacle+=gap+(raidActive?random(rng)*.04:random(rng)*(.16+.06*(1-balance.pressure)));
  }
 }
 if(!run.terrain?.active&&!run.boss&&!run.raid&&!run.player.isJacare&&!jacareWave&&run.routeDistance>=run.nextAllyAt){
  run.pickups.push({type:'ze-gotinha',x:visibleWidth(run)+40,y:20,speed:balance.speed*assistance(run),value:0});
  run.nextAllyAt+=ROUTE_DISTANCE;run.alliesMet++;
 }
 if(!run.terrain?.active&&run.supportAvailable!==false&&!run.boss&&!run.raid&&run.routeDistance>=run.nextSupportAt&&!run.pickups.some(p=>p.type==='ally')){
  const ally=allyForStage(run.mode==='story'?routeStageFor(run).legacyIndex:routeStageFor(run).index,run.allyVisits,rng);
  run.pickups.push({type:'ally',allyId:ally.id,x:visibleWidth(run)+40,y:20,speed:balance.speed*assistance(run),value:0});
  run.nextSupportAt=run.routeDistance+14000;
 }
 run.nextPickup-=dt;run.nextPassport-=dt;run.nextPower-=dt;
 if(!anchor?.rehearsal&&anchor?.approach!=='rear'&&!anchor?.falling&&!anchor?.groundHazard)rewardForObstacle(run,anchor,balance,rng);
 const body=playerBodyFor(run.player),x=playerX(run),left=x+Math.max(5,body.left),right=x+Math.min(31,body.right),bottom=run.player.y+3,top=run.player.y+body.height;
 // Coleta antes do impacto. Recuperação pendente só aumenta a forma se couber no cenário.
 run.pickups=run.pickups.filter(p=>{
  const hit=right>p.x-12&&left<p.x+12&&top>p.y-12&&bottom<p.y+12;
  if(hit){
   if(p.type==='rachadinha'&&run.player.isJacare)return true;
   if(p.type==='ze-gotinha'){
    if(run.player.isJacare)return false;
    if(run.terrain?.active||run.boss||run.raid||hasJacareVolley(run))return true;
   }
   run.collected++;run.lastPickup=p.type;
   if(p.type==='ally')collectAlly(run,p.allyId);
   if(p.type==='ze-gotinha'){
    run.obstacles=run.obstacles.filter(o=>o.bossAttack);
    run.nextObstacle=Math.max(1.2,run.nextObstacle);
    run.graceFor=Math.max(run.graceFor,JACARE_ENTRY_GRACE);
    run.player.isJacare=true;run.player.jacareProgress=0;run.player.jacareAge=0;run.player.nextJacareThreat=0;run.player.restoreFlashFor=0;
    run.player.crouching=false;run.player.crouchHeld=false;run.player.jumpBufferedUntil=run.player.coyoteUntil=0;
    run.player.sliding=false;run.player.slideRemaining=0;run.player.attackHeld=false;run.player.attackFor=0;
    queueJacareVolley(run,rng);
    announce(run,'Zé Gotinha: transformação fictícia por dez segundos! A recuperação é automática; desvie lateralmente das ampolas cenográficas. Vacinas não causam essa transformação.');
   }
   if(p.type==='shield'){addShieldPart(run);announce(run,run.allyShieldProgress?'Parte de escudo: '+run.allyShieldProgress+'/6.':'Escudo de reserva guardado! Use o botão de escudo quando precisar.');}
   if(p.type==='rachadinha'){
    if(run.player.hp===1){run.player.recoveryPending=true;announce(run,'Rachadinha cenográfica coletada.');}
    else announce(run,'Rachadinha coletada. A forma normal não acumula resistência.');
   }
   if(p.type==='passport'&&++run.passports%PASSPORTS_PER_LIFE===0){run.lives++;announce(run,'100 passaportes! Continuação guardada para depois da derrota.');}
  }return !hit;
 });
 // A coleta do Zé Gotinha pode comprometer uma onda neste mesmo passo.
 maybeSpawnRecoveryPickup(run,balance);
 applyPendingRecovery(run);
 // O vazio não é contato comum: não se recupera no ar, nem com escudo.
 if(terrainHit?.type==='terrain-gap'){finishImpact(run,terrainHit,true);return;}
 const protectedNow=run.shieldFor>0||run.graceFor>0;
 if(protectedNow&&!run.boss?.traversal)return;
 const hit=(terrainHit&&terrainHit.source!==run.player.terrainContact?terrainHit:null)||aircraftHitFor(run,playerBodyFor(run.player))||stageHazardHit(run,playerBodyFor(run.player))||run.obstacles.find(o=>!o.passed&&!o.counted&&(!o.projectile||o.launched||!(o.waitFor>0))&&(!(o.falling||o.groundHazard)||o.age>=o.warningFor)&&overlapsPlayer(run,o));
 // Fiscal/Povo are traversal checks, not damaging duels: a blocked attempt
 // cannot clear the passage, even with an already-active reserve shield.
 if(run.boss?.traversal&&hit?.bossAttack){
  hit.counted=true;hit.contactHit=true;run.graceFor=1.1;
  run.lastTraversalBlock={actor:run.boss.type,type:hit.type};
  announce(run,'Passagem bloqueada. Leia o próximo sinal e tente outra abertura.');return;
 }
 if(hit&&!protectedNow)finishImpact(run,hit,false);
}
