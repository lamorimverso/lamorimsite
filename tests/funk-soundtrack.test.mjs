import test from 'node:test';
import assert from 'node:assert/strict';
import {createGameSoundtrack} from '../tanahoraflavio/runner-soundtrack.mjs';
function context(){
 const notes=[],gains=[];const param=()=>({value:0,setValueAtTime(v){this.value=v;},linearRampToValueAtTime(v){this.value=v;},exponentialRampToValueAtTime(v){this.value=v;},setTargetAtTime(v){this.value=v;}});
 return {currentTime:0,state:'running',destination:{},notes,gains,createGain(){const n={gain:param(),connect(){},disconnect(){}};gains.push(n);return n;},createOscillator(){return {type:'sine',frequency:param(),connect(){},disconnect(){},start(t){notes.push({time:t,type:this.type,hz:this.frequency.value});},stop(){}};}};
}
function play(state={},seconds=9){const c=context(),m=createGameSoundtrack(c);for(let i=0;i<seconds*100;i++){c.currentTime=i/100;m.update({active:true,...state});}return c;}
test('fundo usa lead quadrado melódico e percussão sincopada em grade16, sem samples de voz',()=>{
 const c=play({},4),lead=c.notes.filter(n=>n.type==='square'&&n.hz>250&&n.hz<1000);
 assert.ok(new Set(lead.map(n=>n.hz.toFixed(1))).size>=5,'melodia tem notas de sintetizador, não só pulsos agudos');
 const step=60/123/4;assert.ok(c.notes.some(n=>Math.abs(n.time/step-Math.round(n.time/step))<1e-6&&Math.round(n.time/step)%2===1),'há síncopa na semicolcheia');
 assert.ok(lead.some(n=>Math.abs(n.hz-440)<.01),'motivo inicia na região deLá4');
});
test('andamento e frase permanecem estáveis com chefes/Joice e atravessam a volta do loop',()=>{
 const states=[{}, {pressure:1,boss:true},{pressure:1,raid:true}],tracks=states.map(s=>play(s,16).notes.filter(n=>n.type==='square'&&n.hz>250&&n.hz<1000));
 assert.deepEqual(tracks[1],tracks[0]);assert.deepEqual(tracks[2],tracks[0]);
 const cycle=64*60/123/4,first=tracks[0].filter(n=>n.time<cycle-.001),second=tracks[0].filter(n=>n.time>=cycle-1e-7&&n.time<cycle*2-.001);
 assert.equal(first.length,second.length);for(let i=0;i<first.length;i++){assert.ok(Math.abs(second[i].time-first[i].time-cycle)<1e-7);assert.equal(first[i].hz,second[i].hz);}
});
