import {SCENE_DISTANCE,STAGES,STORY_STAGES} from './runner-route-data.mjs?v=c4fcfde513ff';
import {STORY_OPENING_DISTANCE,STORY_ENCOUNTERS,storyBossAt,bossRoleLabel,storyApproachAt} from './runner-bosses.mjs?v=f8107568ec3b';

export const RAID_HANDOFF_SECONDS=4.5;
export const PAIR_RUN_DISTANCE=100000;
export const pairRunRemaining=run=>Math.max(0,(run.storyLeg?.requiredDistance||0)-(run.storyLeg?.groundDistance||0));
const encounters=Object.freeze(Array.from({length:STORY_ENCOUNTERS},(_,i)=>Object.freeze(storyBossAt(i))));
const guides=Object.freeze({
 brasilia:['Fuga pelas avenidas','Pule os bloqueios e abaixe dos ataques altos.'],
 rio:['Fuga pela orla','Observe a retaguarda e alterne salto e agachamento.'],
 'sao-paulo':['Fuga na cidade','Pule os obstáculos rolantes e pouse nas plataformas.'],
 argentina:['Fuga na fronteira','Leia os objetos que descem e os ataques de frente.'],
 paraguai:['Travessia da ponte','Saia das áreas marcadas e pule os obstáculos rolantes.'],
 florida:['Fuga pela rodovia','Alterne saltos sobre os obstáculos da pista.'],
 'casa-branca':['Fuga pelo terminal','Abaixe dos ataques altos e desvie das marcas.'],
 'brasilia-final':['Fuga final','Ceda espaço à multidão e observe a retaguarda.']
});
export function stageGuideFor(id){
 const [label,lesson]=guides[id]||guides.brasilia;
 return {label,lesson,order:'Dois vilões · '+(id==='brasilia-final'?'Urna':PAIR_RUN_DISTANCE/1000+' km de fuga · '+(['brasilia','rio'].includes(id)?'Próxima dupla':'Viagem por plataformas'))};
}
function raidTimeLeft(raid,timing){
 const recovery=raid.recoveryFor??timing.recoveryFor;
 return Math.max(0,raid.remaining||0)+(raid.phase==='warning'?timing.activeFor+recovery:raid.phase==='active'?recovery:0);
}
// Route coordinates describe stage progress, while physical metres retain their
// normal speed. Reserve pursuit time before the rehearsal/arena, not at its gate.
export function stageRouteTravel(run,travel,dt,{stageIndex,missingRaid,raidTiming,jacareRecovery=10,checkpointAt=Infinity,clearanceSeconds=0}){
 const legRemaining=pairRunRemaining(run),legAvailable=Math.min(run.nextBossAt,checkpointAt)-run.routeDistance;
 if(legRemaining>0&&legAvailable>0)travel=Math.min(travel,legAvailable*travel/legRemaining);
 const ampoules=(run.obstacles||[]).filter(o=>o.type==='pfizer-ampoule').map(o=>Math.max(0,o.warningFor+o.fallFor+.25-o.age));
 const form=Math.max(run.player?.isJacare?jacareRecovery-run.player.jacareAge:0,...ampoules,0);
 if(run.mode!=='story'||run.practice||!Number.isFinite(run.nextBossAt)){
  const budget=Math.max(form,clearanceSeconds),available=checkpointAt-run.routeDistance;
  return budget>0&&Number.isFinite(available)&&available>0?Math.min(travel,available*dt/budget):travel;
 }
 const next=encounters[run.bossesDefeated],raid=run.raid;
 const pending=missingRaid&&!raid&&next?.stageIndex===stageIndex&&next.role!=='subboss'&&next.role!=='traversal';
 let budget=Math.max(0,run.bossCooldown||0,form,clearanceSeconds),boundary=run.nextBossAt;
 if(raid||pending){
  const pursuit=raid?raidTimeLeft(raid,raidTiming):raidTiming.warningFor+raidTiming.activeFor+raidTiming.recoveryFor;
  budget=raid?Math.max(budget,pursuit+RAID_HANDOFF_SECONDS):budget+pursuit+RAID_HANDOFF_SECONDS;
 }
 if(raid||pending||form>0){
  const reserve=Math.min(1000,Math.max(0,run.nextBossAt-run.routeDistance)/2);
  boundary=run.nextBossAt-reserve;
 }
 if(budget>0)boundary=Math.min(boundary,checkpointAt);
 const available=boundary-run.routeDistance;
 return budget>0&&available>0?Math.min(travel,available*dt/budget):travel;
}

export function stagePlanFor(run){
 const story=run.mode==='story',stages=story?STORY_STAGES:STAGES;
 const route=Math.max(0,(Number(run.routeDistance)||0)-(story?STORY_OPENING_DISTANCE:0));
 const stage=stages[story?Math.min(stages.length-1,Math.floor(route/SCENE_DISTANCE)):Math.floor(route/SCENE_DISTANCE)%stages.length];
 const guide=stageGuideFor(stage.id),next=story?encounters[run.bossesDefeated]:null;
 const opening=story&&run.routeDistance<STORY_OPENING_DISTANCE;
 const remaining=pairRunRemaining(run);
 const progress=remaining>0?1-remaining/run.storyLeg.requiredDistance:opening?Math.max(0,run.routeDistance/STORY_OPENING_DISTANCE):story?route/SCENE_DISTANCE-stage.index:(route%SCENE_DISTANCE)/SCENE_DISTANCE;
 const plan={stageId:stage.id,progress:Math.max(0,Math.min(1,progress)),section:'run',label:guide.label,
  goal:next?'Próximo: '+next.name+'. '+guide.lesson:guide.lesson,nextBossName:next?.name||null};
 if(run.status==='won'||run.status==='ballot')return {...plan,progress:1,section:'finish',label:run.status==='ballot'?'Etapa final · Urna':'História concluída!',goal:'Conclua a etapa final.'};
 if(run.status==='over')return {...plan,section:'result',label:'Fim da corrida',goal:'Veja o resultado da tentativa.'};
 if(run.status==='prison')return {...plan,section:'result',label:'Prisão fictícia',goal:'A campanha será reiniciada.'};
 if(run.boss)return {...plan,section:'arena',label:bossRoleLabel(run.boss)+' · '+run.boss.name,
  goal:run.boss.traversal?'Desvie até concluir a passagem.':'Mova-se pela arena e atire nas aberturas. Solte o pulo na subida para encurtar o salto.'};
 if(run.player?.isJacare)return {...plan,section:'jacare',label:'Desvie das ampolas',goal:'Mova-se para os lados até a recuperação automática.'};
 if(run.terrain?.active?.flight){const f=run.terrain.active.flight;return {...plan,section:'transfer',label:'Viagem · Sem chão',goal:'Pule de plataforma em plataforma até '+f.toName+'. Cair no vazio encerra a tentativa.'};}
 if(run.terrain?.active)return {...plan,section:'platforms',label:'Trecho de plataformas',goal:'Salte e pouse no topo das plataformas.'};
 if(run.raid)return {...plan,section:'pursuit',label:run.raid.phase==='warning'?'Perseguição à vista':run.raid.phase==='active'?'Fuja da PF':'Retomando a fuga',goal:'Pule os bloqueios e abaixe dos microfones.'};
 if(run.terrain?.preparing)return {...plan,section:'prepare',label:run.terrain.preparing.kind==='air-transfer'?'Embarque à frente':'Plataformas à frente',goal:'Conclua a esquiva e prepare o próximo salto.'};
 if(remaining>0){
  const distance=remaining<1000?Math.ceil(remaining)+' m':(remaining/1000).toFixed(1).replace('.',',')+' km';
  return {...plan,section:'leg',label:'Fuga · '+distance+' até a dupla',goal:'Corra os '+PAIR_RUN_DISTANCE/1000+' km antes da próxima dupla. '+plan.goal};
 }
 if(opening)return {...plan,section:'opening',label:'Fuga inicial · Brasília'};
 if(story&&storyApproachAt(run.routeDistance,run.bossesDefeated))return {...plan,section:'approach',label:'Chefão à frente · '+next.name,goal:'Observe o ataque antes de enfrentar '+next.name+'.'};
 if(run.bossCooldown>0&&run.bossesDefeated>0)return {...plan,section:'recovery',label:'Trecho de fuga'+(next?' · '+next.name:'')};
 return plan;
}
