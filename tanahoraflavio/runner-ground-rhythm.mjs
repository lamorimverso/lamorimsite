// Grounded encounter staging. The scheduler still owns contact separation;
// these profiles choose which problem is taught and how pressure is phrased.
const profile=(opening,crouchShift,styles,markerShift,pace)=>Object.freeze({
 opening:Object.freeze(opening),crouchShift,styles:Object.freeze(styles),markerShift,pace
});
const route=Object.freeze({
 brasilia:profile(['front','overhead'],-.06,{front:1.30,rear:.82,drop:.85},-.025,1.04),
 rio:profile(['rear','front'],.01,{rear:1.25,front:1.12,drop:.85},0,1),
 'sao-paulo':profile(['rolling','overhead'],.06,{rolling:1.42,rear:.86},0,1.04),
 argentina:profile(['drop','front'],.05,{drop:1.38,rolling:.88},-.03,1),
 paraguai:profile(['marker','rolling'],-.045,{rolling:1.30,rear:.92},.055,1.04),
 florida:profile(['rolling','front'],-.025,{front:1.18,rolling:1.22,popcorn:1.30},-.02,.98),
 'casa-branca':profile(['overhead','marker'],.08,{drop:1.18,rear:.94},.025,1),
 'brasilia-final':profile(['rear','overhead'],.02,{rear:1.20,front:.90,rolling:1.10},.025,.99)
});
const cappedRotation=Object.freeze(['front','rear','drop','rolling']);
const cappedOpenings=Object.freeze([...cappedRotation,'overhead']);
export function groundRhythmFor({mode,stageId,localDistance,beat,lessonCursor=0,lastBoss,lap,capped}){
 if(mode!=='story'){
  if(!capped)return null;
  // Bosses and terrain can skip a stage's opening. Complete the late-route
  // sequence at the next eligible ground spawns anywhere in the same lap.
  const opening=lessonCursor<cappedOpenings.length?cappedOpenings[(lap+lessonCursor)%cappedOpenings.length]:null;
  return {opening,
   crouchShift:0,styles:{[cappedRotation[lap%cappedRotation.length]]:1.4},markerShift:0,pace:[.99,1.06,.97][lap%3]};
 }
 const p=route[stageId];if(!p)return null;
 // Late pairs reserve a breath after the second warning, never a smaller
 // collision gap. Giving back time at the exit limits cross-scenery surprises.
 const phrase=localDistance<1500?1.08:localDistance<3800?1:localDistance<6000?[.96,.96,1.13][beat%3]:1.15;
 // The final map begins with the Povo traversal, then Janones's rehearsal
 // and arena. Treat the first eligible ground after them as its classroom.
 const afterFiscal=stageId==='paraguai'&&lastBoss==='fiscal'&&localDistance>=2200&&localDistance<3900;
 const teaches=stageId==='brasilia-final'?lastBoss==='janones'&&localDistance>=2200&&localDistance<3900:localDistance<1500||afterFiscal;
 return {...p,opening:teaches?p.opening[lessonCursor]||null:null,pace:p.pace*phrase};
}
export function groundStyleFor(rhythm,roll,pressure,{rear,drop}){
 const back=.30+.18*pressure;
 const base={rear:rear?back:0,drop:drop ? .20 : 0,rolling:.16,popcorn:.14,front:1-back-.50+(rear?0:back)+(drop?0:.20)};
 const weighted=Object.entries(base).map(([kind,value])=>[kind,Math.max(0,value)*(rhythm.styles[kind]??1)]);
 let offset=roll*weighted.reduce((sum,[,weight])=>sum+weight,0);
 for(const [kind,weight] of weighted){offset-=weight;if(offset<0)return kind;}
 return 'front';
}
