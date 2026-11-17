import test from 'node:test';
import assert from 'node:assert/strict';
import {edgeThreatsFor} from '../tanahoraflavio/runner-edge-cues.mjs';

const cue=(obstacles,width=480)=>edgeThreatsFor(obstacles,width,o=>o.eta);
test('o aviso de borda mostra a resposta antes de uma ameaça frontal entrar na tela',()=>{
 const high={x:520,width:38,speed:400,action:'crouch',eta:1.4,projectile:true};
 const low={x:500,width:38,speed:400,action:'jump',eta:.88};
 assert.deepEqual(cue([high,low]),[{side:'right',action:'jump'}],'prioriza a decisão com menos tempo de reação');
 assert.deepEqual(cue([high]),[{side:'right',action:'crouch'}]);
 assert.deepEqual(cue([{...high,x:410}]),[],'uma silhueta visível não precisa de aviso duplicado');
});

test('retaguarda mantém lado correto e sinais não repetem ameaças mortas ou já desenhadas',()=>{
 const rear={x:-76,width:42,speed:-300,eta:1.1,action:'move',approach:'rear'};
 const front={x:930,width:42,speed:500,eta:.9,action:'jump'};
 assert.deepEqual(cue([front,rear],900),[{side:'left',action:'move'},{side:'right',action:'jump'}]);
 for(const o of [{...rear,passed:true},{...rear,x:-16},{...rear,reflected:true},{...rear,eta:4},{...rear,eta:-.02},{...rear,eta:NaN},{...rear,falling:true},{...rear,groundHazard:true}])assert.deepEqual(cue([o]),[]);
});
