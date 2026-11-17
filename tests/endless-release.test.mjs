import test from 'node:test';
import assert from 'node:assert/strict';
import {ENDLESS_RELEASE_CASES,replayEndless} from '../tools/check-endless-release.mjs';

for(const sample of ENDLESS_RELEASE_CASES){
 test(`Infinito por 35 minutos mantém física e variedade em 30/60/120 quadros simulados, ${sample.width}px`,()=>{
  const centered=replayEndless({...sample,rate:60});
  assert.equal(centered.status,'running');
  assert.equal(centered.activeSeconds,2100);
  assert.equal(centered.steps,252000);
  assert.ok(centered.speed>530&&centered.speed<=535,'percurso real chega perto do teto da rolagem');
  assert.ok(centered.firstNearCap!==null&&Object.keys(centered.lateStyles).length>=5,'tramas terrestres seguem variadas perto do teto');
  assert.ok(centered.rounds>=6&&centered.bosses>=30&&centered.terrain>centered.flightsCompleted,'aviões, duelos e terreno não interrompem várias voltas completas');
  assert.equal(centered.lessonCompleted,true,'a corrida natural apresenta a barra de treino');
  assert.equal(centered.flightsCompleted,centered.mapExits-2,'cada saída geográfica depois das duas primeiras exige um pouso');
  for(const rate of [30,120])assert.deepEqual(replayEndless({...sample,rate}),centered,`${rate} FPS simulados não mudam controles, progresso ou ameaças`);
 });
}
