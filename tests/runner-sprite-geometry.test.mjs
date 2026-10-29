import test from 'node:test';
import assert from 'node:assert/strict';
import {spriteFrameFor,spriteScaleFor,portraitCropFor,spriteFacesRight} from '../tanahoraflavio/runner-sprites.mjs';
import {enemyMotionFor,crouchAnimationStep} from '../tanahoraflavio/runner-art.mjs';

test('oito passos e todas as ações usam o mesmo herói sem trocar escala entre poses',()=>{
 const hero=Array.from({length:12},()=>({height:300}));hero[7].height=320;hero[10].height=150;
 const factor=spriteScaleFor('flavio','hero',hero);
 assert.ok(Math.abs(hero[7].height*factor-94)<1e-10);
 assert.ok(hero[10].height*factor<47,'a pose baixa mantém a escala do desenho, sem esticar');
 assert.deepEqual(Array.from({length:8},(_,phase)=>spriteFrameFor('flavio',{phase}).index),[0,1,2,3,4,5,6,7]);
 assert.deepEqual(spriteFrameFor('flavio',{airborne:true}),{sheet:'hero',index:8});
 assert.deepEqual(spriteFrameFor('flavio',{airborne:true,falling:true}),{sheet:'hero',index:9});
 assert.deepEqual(spriteFrameFor('flavio',{landing:true}),{sheet:'hero',index:10});
 assert.deepEqual(spriteFrameFor('flavio',{hurt:true}),{sheet:'hero',index:11});
});
test('perseguidores alternam pernas em vez de repetir um único recorte',()=>{
 for(const [type,indices] of [['pf',[3,13]],['janones',[7,14]],['army',[11,15]]]){
  assert.deepEqual([0,1,2].map(phase=>spriteFrameFor(type,{phase}).index),[...indices,indices[0]]);
 }
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

test('o herói mantém quadros orientados à direita sem alterar a orientação dos perseguidores',()=>{
 assert.equal(spriteFacesRight('flavio'),true);
 for(const type of ['pf','janones','army','xandao','haddad','lula'])assert.equal(spriteFacesRight(type),false);
 assert.equal(spriteFrameFor('flavio',{phase:3}).index,3);
 assert.equal(spriteFrameFor('flavio',{airborne:true}).index,8);
});
test('perseguidores e chefões balançam, mas só alguns pixels e sem afetar obstáculos',()=>{
 for(const type of ['pf','janones','army','xandao','haddad','lula']){
  const start=enemyMotionFor(type,0,100);
  assert.deepEqual(start,{bob:0,lean:0},'respeita movimento reduzido');
  const motion=[1,2,3,4,5].map(phase=>enemyMotionFor(type,phase,100));
  assert.ok(motion.some(m=>m.bob!==0&&m.lean!==0),'anima '+type);
  assert.ok(motion.every(m=>m.bob<=0&&m.bob>=-2.4&&Math.abs(m.lean)<=.034001));
 }
 for(const type of ['barrier','case','sound','stamp','receipts']){
  assert.deepEqual(enemyMotionFor(type,12,100),{bob:0,lean:0});
 }
});

test('efeitos secundários da postura interpolam ativação e retorno sem reversões',()=>{
 let pose=0;
 const descent=[];
 for(let i=0;i<18;i++){pose=crouchAnimationStep(pose,true,1/60);descent.push(pose);}
 assert.ok(descent[0]>0 && descent[0]<.3,'início gradual do agachamento');
 assert.ok(descent.every((v,i)=>i===0||v>=descent[i-1]),'corpo baixa sem reversões');
 assert.ok(descent.at(-1)>.85&&descent.at(-1)<=1,'agacha de verdade');
 let rising=pose;
 for(let i=0;i<22;i++)rising=crouchAnimationStep(rising,false,1/60);
 assert.ok(rising<.12,'personagem se levanta suavemente ao soltar');
 assert.equal(crouchAnimationStep(.3,true,1/60,true),1,'movimento reduzido pula o efeito');
 assert.equal(crouchAnimationStep(.9,false,1/60,true),0);
 assert.equal(crouchAnimationStep(.4,true,-1),.4,'não avança com dt negativo');
});
