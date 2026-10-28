import test from 'node:test';
import assert from 'node:assert/strict';
import {spriteFrameFor,spriteScaleFor,portraitCropFor} from '../tanahoraflavio/runner-sprites.mjs';

test('Flávio não encolhe ao trocar atlas da corrida por salto e impacto',()=>{
 const hero=[490,491,456,487,469,464].map(height=>({height}));
 const cast=Array.from({length:16},()=>({height:300}));
 cast[13]={height:242};cast[14]={height:226};cast[15]={height:242};
 const running=spriteScaleFor('flavio','hero',hero);
 const jumping=spriteScaleFor('flavio','cast',cast);
 assert.ok(Math.abs(hero[1].height*running-cast[13].height*jumping)<.1);
 assert.ok(Math.abs(hero[1].height*running-cast[15].height*jumping)<.1);
 assert.ok(cast[14].height*jumping>85,'a aterrissagem permanece legível');
 assert.equal(spriteFrameFor('flavio',{airborne:true}).index,13);
 assert.equal(spriteFrameFor('flavio',{landing:true}).index,14);
 assert.equal(spriteFrameFor('flavio',{hurt:true}).index,15);
});
test('chefões conservam proporções próprias em seus três quadros',()=>{
 const frames=Array.from({length:16},()=>({height:250}));
 frames[0]={height:275};frames[1]={height:310};frames[2]={height:248};
 const factor=spriteScaleFor('xandao','cast',frames);
 assert.ok(Math.abs(frames[1].height*factor-94)<1e-10);
 assert.equal(spriteFrameFor('xandao',{attacking:true}).index,2);
});
test('o retrato da Joice preserva toda a largura para não cortar o microfone',()=>{
 const f={x:27,y:941,width:274,height:290};
 const crop=portraitCropFor(f);
 assert.equal(crop.x,f.x);assert.equal(crop.width,f.width);
 assert.equal(crop.y,f.y);
 assert.ok(crop.height>f.height*.7&&crop.height<=f.height);
});
