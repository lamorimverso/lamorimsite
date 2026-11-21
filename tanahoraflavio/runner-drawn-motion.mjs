// Select whole authored drawings. Timing is supplied by the simulation clock.
export function bossStopsAutoRun(run){return !!run?.boss&&!run.boss.traversal;}
export function heroStridePhase(run){
 // Eight drawings cover two ground contacts over a 144px full stride.
 // Physical distance keeps cadence continuous as speed and scenery change.
 if(run?.status!=='running')return 0;
 if(bossStopsAutoRun(run))return Math.max(0,run.player?.arenaTravel||0)/18;
 return Number.isFinite(run.distance)?Math.max(0,run.distance)/18:0;
}
export function strideDrawing(frames,index,phase=0,reducedMotion=false){
 const next=frames[index]?.next,fraction=Math.max(0,Number(phase)||0)%1;
 return !reducedMotion&&fraction>=.5&&Number.isInteger(next)?next:index;
}
export function actionDrawing(frames,start,{state='idle',progress=1,phase=0,reducedMotion=false}={}){
 const u=Math.max(0,Math.min(1,Number(progress)||0));
 const key=state==='charge'?1:state==='release'?2:state==='recover'||state==='recoil'?3:0;
 const index=start+key,next=frames[index]?.next;
 if(reducedMotion||!Number.isInteger(next))return index;
 if(state==='idle')return Math.floor(Math.max(0,phase)/6)%2?next:index;
 if(state==='charge')return u<.2?start:u<.6?next:index;
 if(state==='release')return u<.3?index:u<.65?next:start+3;
 if(state==='recover')return u<.65?index:next;
 return index;
}
