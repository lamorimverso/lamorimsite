const {test}=require('node:test');
const assert=require('node:assert/strict');
const {validateCandidateReport}=require('../tools/capture-runner-experience.cjs');

function report(){
 return {runs:[390,1440].flatMap(width=>['pista','duelo','viagem'].map(scene=>({
  version:'candidato',width,scene,reached:true,
  timing:[30,60,120].map(rate=>({rate,frames:rate,reached:true,p95Ms:1,peakMs:2}))
 })))};
}
test('accepts all required candidate checkpoints and measurements',()=>{
 const r=report();r.runs.push({version:'base',width:390,scene:'viagem',reached:false});
 assert.doesNotThrow(()=>validateCandidateReport(r));
});
test('rejects missing, duplicate or unreached candidate checkpoints',()=>{
 for(const mutate of [r=>r.runs.pop(),r=>r.runs.push(r.runs[0]),r=>{r.runs[0].reached=false;}]){
  const r=report();mutate(r);assert.throws(()=>validateCandidateReport(r),/checkpoint/);
 }
});
test('rejects missing, repeated, invalid or unreached measurements',()=>{
 for(const mutate of [t=>t.pop(),t=>t.push(t[0]),t=>{t[0].reached=false;},t=>{t[0].frames=0;},t=>{t[0].p95Ms=NaN;},t=>{t[0].peakMs=0;}]){
  const r=report();mutate(r.runs[0].timing);assert.throws(()=>validateCandidateReport(r),/medição/);
 }
});
