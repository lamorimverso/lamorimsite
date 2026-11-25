import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../runner-core.mjs';
import * as route from '../runner-route-progress.mjs?v=adaaacdf6859';
import {STAGES,STORY_STAGES,SCENE_DISTANCE,SCENE_SECONDS} from '../runner-route-data.mjs?v=c4fcfde513ff';

test('the core keeps its public route API and canonical stage objects',()=>{
 for(const name of ['campaignRouteDistance','routeStagesFor','routeStageFor','routeTransitionFor','stageAt','stageTransitionAt']){
  assert.equal(core[name],route[name]);
 }
 // Import through the versioned graph to preserve the identity-sensitive story array.
 assert.equal(core.STAGES,STAGES);
 assert.equal(core.STORY_STAGES,STORY_STAGES);
 assert.equal(route.stageAt(-1),STAGES[0]);
 assert.equal(route.stageAt(NaN),STAGES[0]);
 assert.equal(route.stageAt(SCENE_SECONDS),STAGES[1]);
 assert.equal(route.stageAt(SCENE_SECONDS*STAGES.length),STAGES[0]);
 assert.equal(route.stageAt(SCENE_SECONDS*100,STORY_STAGES),STORY_STAGES.at(-1));
});

test('route offsets, smooth transitions and final story boundary remain unchanged',()=>{
 const story={mode:'story',routeDistance:core.STORY_OPENING_DISTANCE};
 const endless={mode:'endless',routeDistance:0};
 assert.equal(route.campaignRouteDistance(story),0);
 assert.equal(route.routeStageFor(story),STORY_STAGES[0]);
 assert.equal(route.routeStageFor(endless),STAGES[0]);
 const transition=route.stageTransitionAt(SCENE_SECONDS);
 assert.deepEqual(transition,{from:STAGES[0],to:STAGES[1],progress:.5,active:true});
 assert.equal(route.stageTransitionAt(SCENE_SECONDS-2).active,false);
 assert.equal(route.stageTransitionAt(SCENE_SECONDS+2).active,false);
 assert.equal(route.stageTransitionAt(STORY_STAGES.length*SCENE_SECONDS,STORY_STAGES).active,false);
});

test('ground lesson and geographic flights retain their mode-specific gates',()=>{
 const endless={mode:'endless',routeDistance:2*SCENE_DISTANCE,terrain:{nextAt:0}};
 assert.deepEqual(route.groundLessonFor(endless),{lessonAt:2*SCENE_DISTANCE+760,lessonExit:2*SCENE_DISTANCE+1180,lessonStage:STAGES[2]});
 assert.equal(route.lessonPending(endless),true);
 assert.equal(route.nextAirTransfer({...endless,routeDistance:SCENE_DISTANCE}),null);
 assert.deepEqual(route.nextAirTransfer(endless),{from:STAGES[2],to:STAGES[3],boardAt:3*SCENE_DISTANCE-1400,arrival:3*SCENE_DISTANCE});
 assert.equal(route.nextAirTransfer({...endless,practice:true}),null);
 assert.equal(route.lessonPending({...endless,terrain:{nextAt:0,lessonCompleted:true}}),false);
 const story={mode:'story',routeDistance:core.STORY_OPENING_DISTANCE+(STORY_STAGES.length-1)*SCENE_DISTANCE,terrain:{nextAt:0}};
 assert.equal(route.nextAirTransfer(story),null);
});

test('active flight and recent arrival override the ordinary stage transition',()=>{
 const arrival=3*SCENE_DISTANCE;
 const run={mode:'endless',routeDistance:arrival,terrain:{active:{flight:{from:STAGES[2].id,to:STAGES[3].id,progress:.25,phase:'boarding'}}}};
 assert.deepEqual(route.routeTransitionFor(run),{from:STAGES[2],to:STAGES[3],progress:.25,active:true,kind:'air-transfer',phase:'boarding'});
 run.terrain={lastFlightArrival:arrival};
 assert.deepEqual(route.routeTransitionFor(run),{from:STAGES[3],to:STAGES[3],progress:1,active:false});
});
