// Um quadro lento não pode desligar a corrida. O limite evita uma espiral de
// recuperação, e a suspensão explícita descarta tempo que não foi jogado.
const STEP=1/120,MAX_STEPS=18;
export function createFrameClock(now=0){return {last:Number.isFinite(now)?now:0,accumulator:0};}
export function resetFrameClock(clock,now){clock.last=Number.isFinite(now)?now:0;clock.accumulator=0;}
export function advanceFrameClock(clock,now){
 if(!Number.isFinite(now))return {steps:0,step:STEP,interpolation:0};
 const elapsed=Math.max(0,(now-clock.last)/1000);clock.last=now;
 clock.accumulator+=Math.min(elapsed,.15);
 const steps=Math.min(MAX_STEPS,Math.floor((clock.accumulator+1e-10)/STEP));
 clock.accumulator=Math.max(0,clock.accumulator-steps*STEP);
 return {steps,step:STEP,interpolation:Math.min(1,clock.accumulator/STEP)};
}
