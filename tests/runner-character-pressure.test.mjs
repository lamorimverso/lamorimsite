import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../tanahoraflavio/runner-core.mjs';
import {createVoiceDirector} from '../tanahoraflavio/runner-voice-director.mjs';
import {createGameAudio} from '../tanahoraflavio/runner-audio.mjs';

const seeded=seed=>()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);
const running=()=>{const r=core.createRun();core.startRun(r);r.shieldFor=Infinity;r.nextBossAt=r.nextRaid=Infinity;return r;};

test('velocidade e risco continuam crescendo depois da primeira volta',()=>{
 const points=[[0,0],[35000,115],[70000,230],[120000,400],[210000,700]]
  .map(([d,t])=>core.difficultyAt(d,t));
 assert.ok(points.every((p,i)=>i===0||p.speed>points[i-1].speed));
 assert.ok(points.every((p,i)=>i===0||p.pressure>points[i-1].pressure));
 assert.ok(points.at(-1).speed<=435);
 assert.ok(points[1].obstacleGap>points.at(-1).obstacleGap);
 assert.ok(points[2].speed<435,'não atinge teto ao acabar a segunda volta');
 assert.ok(core.difficultyAt(14000).obstacleApproach<=1.52,'a segunda etapa exige reação mais rápida');
});

test('ameaças altas variam com sementes diferentes sem repetir ordem fixa',()=>{
 const routes=[];
 for(const seed of [7,91,8801]){
  const run=running(),rng=seeded(seed),names=[];let spawned=0;
  for(let frame=0;frame<120*95;frame++){
   core.advanceRun(run,1/120,rng);
   if(run.spawnedObstacles>spawned){
    spawned=run.spawnedObstacles;
    const obstacle=run.obstacles.at(-1);
    if(obstacle.sourceActor)names.push(obstacle.sourceActor);
   }
   run.obstacles=run.obstacles.filter(o=>o.x>240);
  }
  assert.ok(names.length>=7);
  assert.ok(new Set(names).size>=3,'todos os coadjuvantes aparecem');
  assert.ok(names.every((name,i)=>i===0||name!==names[i-1]));
  routes.push(names.slice(0,9).join('/'));
 }
 assert.ok(new Set(routes).size>1,'o elenco não segue um ciclo idêntico em todas as corridas');
});

test('o diretor fala do personagem quando a pista é segura, sem esperar 14 segundos do ambiente',()=>{
 const events=[],director=createVoiceDirector({random:()=>0,play:(id,settings)=>{events.push({id,settings});return true;}});
 const run={status:'running',elapsed:0,boss:null,raid:null};
 director.event('start',run);assert.equal(events.length,1);
 run.elapsed=3;director.event('actor',run,'janones');director.update(run,{safe:false});
 assert.equal(events.length,1,'não toca durante uma janela perigosa');
 director.update(run,{safe:true});
 assert.equal(events.length,2);assert.equal(events.at(-1).id,'pessoal-urgente');
 run.elapsed=5;director.event('actor',run,'janones');director.update(run,{safe:true});
 assert.equal(events.length,2,'mesmo personagem não cria spam');
 run.elapsed=25;director.event('actor',run,'simone');director.update(run,{safe:true});
 assert.equal(events.length,3,'personagem sem arquivo não ocupa a fila das falas reais');
});

test('gravações existentes funcionam e cada personagem sem arquivo tem sinal e locução neutra opcional',()=>{
 const previous=globalThis.window,notes=[],tracks=[],spoken=[];
 const param=()=>({setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){},setTargetAtTime(){}});
 const ctx={currentTime:20,state:'running',destination:{},resume:()=>Promise.resolve(),
  createGain:()=>({gain:param(),connect(){},disconnect(){}}),
  createOscillator:()=>({type:'sine',frequency:param(),connect(){},disconnect(){},start(){notes.push(this);},stop(){}})};
 globalThis.window={AudioContext:class{constructor(){return ctx;}},Audio:class{
  constructor(src){this.src=src;tracks.push(this);}play(){return Promise.resolve();}pause(){}},
  SpeechSynthesisUtterance:class{constructor(text){this.text=text;}},
  speechSynthesis:{getVoices:()=>[{name:'Neutra',lang:'pt-BR',localService:true}],speak:u=>spoken.push(u),cancel(){}}
 };
 try{
  const audio=createGameAudio();audio.prime();
  assert.equal(audio.character('simone'),true);
  assert.ok(notes.length>=1);
  assert.equal(spoken[0]?.text,'Atenção: Simone');
  assert.equal(audio.character('soraya'),false,'espaçamento entre anúncios');
  ctx.currentTime=30;
  assert.equal(audio.voice('pessoal-urgente',{priority:1}),true,'arquivo de Janones já está disponível');
  assert.ok(tracks.at(-1).src.includes('meme-pessoal-urgente'));
  assert.equal(audio.character('pf'),true);
  assert.equal(spoken.length,1,'locução não atravessa um arquivo de voz');
  audio.toggle();assert.equal(audio.character('army'),false);
 }finally{if(previous===undefined)delete globalThis.window;else globalThis.window=previous;}
});
