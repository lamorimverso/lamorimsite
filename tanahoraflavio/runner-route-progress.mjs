import {STAGES,STORY_STAGES,SCENE_DISTANCE,SCENE_SECONDS} from './runner-route-data.mjs?v=c4fcfde513ff';
import {STORY_OPENING_DISTANCE} from './runner-bosses.mjs?v=dae0075d20c5';

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

// Mantém stageAt em escala de 20 unidades por cenário, mas o percurso real
// é SCENE_DISTANCE metros. Assim o cenário exige 7 km de fuga, não 20 s fixos.
export const campaignRouteDistance = run => Math.max(0,run.routeDistance-(run.mode==='story'?STORY_OPENING_DISTANCE:0));
export const routeClock = run => campaignRouteDistance(run) / SCENE_DISTANCE * SCENE_SECONDS;
export const routeStagesFor=run=>run.mode==='story'?STORY_STAGES:STAGES;
export const routeStageFor=run=>stageAt(routeClock(run),routeStagesFor(run));
function groundLessonRoute(stages,offset){
 return Object.freeze({lessonAt:offset+2*SCENE_DISTANCE+760,lessonExit:offset+2*SCENE_DISTANCE+1180,lessonStage:stages[2]});
}
const STORY_LESSON=groundLessonRoute(STORY_STAGES,STORY_OPENING_DISTANCE),ENDLESS_LESSON=groundLessonRoute(STAGES,0);
export const groundLessonFor=run=>run.mode==='story'?STORY_LESSON:ENDLESS_LESSON;
export const lessonPending=run=>!run.practice&&!run.terrain?.lessonCompleted&&Number.isFinite(run.terrain?.nextAt);
export function nextAirTransfer(run){
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

