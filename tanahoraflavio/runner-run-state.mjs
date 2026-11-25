import {WORLD,PLAYER} from './runner-run-geometry.mjs?v=e55c2c4eae5e';
import {HERO_MAX_HP} from './runner-body.mjs?v=57ec474fca38';
import {createMovementSkills} from './runner-movement-skills.mjs?v=d0ad734b4838';
import {createTerrain} from './runner-terrain.mjs?v=d75123c1af20';
import {ROUTE_AMMO} from './runner-supplies.mjs?v=44c67e8a5802';
import {STORY_OPENING_DISTANCE,optionalStoryBossAt} from './runner-bosses.mjs?v=dae0075d20c5';
import {SCENE_DISTANCE} from './runner-route-data.mjs?v=c4fcfde513ff';

export const announce = (run,text) => {run.event=text;run.events++;};
export function createRunState({assisted=false,seed,mode='endless',practiceId,manualStory=false}={}) {
 const practice=mode==='story'?optionalStoryBossAt(practiceId):null;
 const startDistance=practice?STORY_OPENING_DISTANCE+practice.stageIndex*SCENE_DISTANCE+practice.distance:0;
 return {status:'ready',mode:mode==='story'?'story':'endless',manualStory:mode==='story'&&manualStory===true,assisted:assisted===true,practice,elapsed:0,distance:startDistance,routeDistance:startDistance,viewportWidth:WORLD.width,cameraLead:0,bonus:0,collected:0,passports:0,lives:1,
  randomState:seed===undefined?null:Number(seed)>>>0,
  damageRandomState:seed===undefined?null:(Number(seed)^0x9e3779b9)>>>0,
  ballot:{digits:'',message:''},
  event:'',events:0,movementSkills:createMovementSkills(),lastSkillReward:null,terrain:createTerrain(),player:{airJumpsUsed:0,grounded:true,supportY:0,sliding:false,slideRemaining:0,slideLatched:false,slideCooldownFor:0,x:PLAYER.x,moveHeld:0,y:0,velocity:0,crouching:false,crouchHeld:false,isJacare:false,jacareProgress:0,jacareAge:0,nextJacareThreat:0,restoreFlashFor:0,coyoteUntil:0,jumpBufferedUntil:0,attackHeld:false,chargeFor:0,arenaTravel:0,manualTravel:0,attackFor:0,attackCooldown:0,shotFacing:1,hp:HERO_MAX_HP,maxHp:HERO_MAX_HP,recoveryPending:false,terrainContact:null},obstacles:[],pickups:[],heroShots:[],shotsFired:0,ammo:ROUTE_AMMO,ammoIdleFor:0,ammoReloadFor:0,ownedPowers:['ivermectina'],powerLevels:{ivermectina:1},activePower:'ivermectina',lastPowerReward:null,defeatedEnemies:0,lastHit:null,
  nextObstacle:1.5,nextPickup:0,nextPassport:4.8,nextPower:7,recoveryReadyAt:0,shieldFor:0,graceFor:0,reserveShields:0,allyShieldProgress:0,allyHelpCount:0,
  lastPickup:null,lastTraversalBlock:null,spawnedObstacles:0,spawnedPickups:0,spawnedPowers:0,phantomCloud:null,
  boss:null,bossBag:[],lastBoss:null,bossesDefeated:0,nextBossAt:practice?startDistance:null,bossCooldown:0,storyLeg:null,arenaExit:null,
  raid:null,nextRaid:null,raids:0,raidStages:{},raidStageCoverage:{},lastFact:-1,cameo:null,overheadCount:0,lastOverheadActor:null,
  seenOverheadActors:[],seenGroundActors:[],lastGroundActor:null,
  lastAction:null,actionStreak:0,attackStyles:[],nextAllyAt:14000,alliesMet:0,
  nextSupportAt:18000,supportAvailable:true,ally:null,aid:null,allyVisits:{},lastAllyId:null,creditCooldown:0};
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
// Interno ao motor/testes; não há comando de pausa na interface.
export function togglePause(run){if(run.status==='running')run.status='paused';else if(run.status==='paused')run.status='running';}
// O placar agora é a quilometragem percorrida em metros; coletas não alteram metros.
export function scoreFor(run){return Math.floor(run.distance);}
