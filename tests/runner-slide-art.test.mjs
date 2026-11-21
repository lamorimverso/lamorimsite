import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {drawActor,drawHeroShot,loadSprites} from '../tanahoraflavio/runner-art.mjs';
import {heroShotPose} from '../tanahoraflavio/runner-hero-shot.mjs';
import {HURT_BODY_SCALE,playerBodyFor} from '../tanahoraflavio/runner-body.mjs';
import {heroActionFrameFor} from '../tanahoraflavio/runner-hero-actions.mjs';

const require=createRequire(import.meta.url);
let canvas;
try{canvas=require('@napi-rs/canvas');}catch(error){if(error.code!=='MODULE_NOT_FOUND')throw error;}

test('agachamento, deslize e recuperação selecionam quadros próprios',()=>{
 assert.deepEqual([.2,.45,.8,1].map(crouchPose=>heroActionFrameFor({crouchPose})),[0,1,2,3]);
 assert.equal(heroActionFrameFor({landing:true,crouchPose:0}),null,'início preserva silhueta sem tranco');
 assert.equal(heroActionFrameFor({landing:true,crouchPose:.2}),0,'a primeira pose baixa aparece após breve transição');
 assert.equal(heroActionFrameFor({landing:true,sliding:true,slidePose:0,slidePhase:0}),4,'a entrada do deslize usa sua arte própria');
 assert.deepEqual([.04,.14,.52,.94].map(slidePhase=>heroActionFrameFor({sliding:true,slidePhase})),[4,5,6,7]);
 assert.equal(heroActionFrameFor({crouchPose:1,slidePose:.61,slidePhase:.52}),7);
 assert.equal(heroActionFrameFor({crouchPose:1,slidePose:.61,slidePhase:.52,slideShot:{state:'recoil'}}),7,'o recuo não pula o recolhimento da perna');
 assert.equal(heroActionFrameFor({crouchPose:1,slidePose:.06,slidePhase:.52}),3);
 assert.equal(heroActionFrameFor({airborne:true,sliding:true}),null);
});

test('o deslize desenha uma silhueta baixa, estendida e apoiada, inclusive ao disparar',{
 skip:!canvas&&'A renderização em Canvas nativo é opcional. O teste de navegador mede os pixels em CI.'
},async t=>{
 const prior=Object.getOwnPropertyDescriptor(globalThis,'Image');
 globalThis.Image=class extends canvas.Image{
  set src(value){super.src=fileURLToPath(value);}
  get naturalWidth(){return this.width;}
  get naturalHeight(){return this.height;}
 };
 t.after(()=>prior?Object.defineProperty(globalThis,'Image',prior):delete globalThis.Image);
 await loadSprites(()=>{},{coreOnly:true});
 const frameContext=canvas.createCanvas(360,360).getContext('2d'),completeDraw=frameContext.drawImage.bind(frameContext);
 for(const pose of [{landing:true},{landing:true,sliding:true}]){
  let layers=0;frameContext.drawImage=(...args)=>{layers++;completeDraw(...args);};
  assert.ok(drawActor(frameContext,{x:60,y:104,scale:.95,...pose}));
  assert.equal(layers,1,'cada ação usa um quadro ilustrado inteiro, não membros recortados');
 }
 const ratio=3,x=60;
 function alphaMask(args){
  const c=canvas.createCanvas(360,360).getContext('2d');c.scale(ratio,ratio);
  assert.equal(drawActor(c,{x,y:104,scale:.95,...args}),true);
  return c.getImageData(0,0,360,360).data;
 }
 function contourDelta(before,after){
  let difference=0,union=0;
  for(let i=3;i<before.length;i+=4){
   difference+=Math.abs(before[i]-after[i]);union+=Math.max(before[i],after[i]);
  }
  return difference/union;
 }
 // Hold the stride frame constant to isolate the handoff from normal running.
 for(const phase of [0,2,4,6])for(const facing of [-1,1]){
  const a=alphaMask({phase,facing}),b=alphaMask({phase,facing,landing:true,crouchPose:.05});
  const entry=contourDelta(a,b);
  assert.ok(entry<.13,'o primeiro quadro não troca o corpo inteiro: '+JSON.stringify({phase,facing,entry}));
  const c=alphaMask({phase,facing,crouchPose:.119}),d=alphaMask({phase,facing,crouchPose:.121});
  const exit=contourDelta(c,d);
  assert.ok(exit<.06,'não há tranco ao voltar para a passada: '+JSON.stringify({phase,facing,exit}));
 }
 assert.ok(contourDelta(alphaMask({phase:2}),alphaMask({phase:6}))>.15,'a passada ainda alterna os membros visivelmente');
 assert.equal(contourDelta(alphaMask({phase:2,reducedMotion:true,landing:true,sliding:true,slidePhase:.17}),
   alphaMask({phase:6,reducedMotion:true,landing:true,sliding:true,slidePhase:.53})),0,'movimento reduzido fixa o desenho baixo');
 function measure(draw,args,{floor=104,checkMuzzle=false}={}){
  const c=canvas.createCanvas(360,360).getContext('2d');
  c.scale(ratio,ratio);
  assert.equal(draw(c,{x,y:floor,...args}),true);
  const {data}=c.getImageData(0,0,360,360);let left=360,right=-1,top=360,bottom=-1;
  for(let i=3;i<data.length;i+=4)if(data[i]>128){const x=((i-3)/4)%360,y=Math.floor((i-3)/4/360);left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
  if(checkMuzzle){
   const {muzzle}=heroShotPose(args),sign=Math.sign(muzzle.x);let barrel=false;
   for(let dy=-1;dy<=1;dy++)for(let dx=1;dx<=5;dx++){
    const index=4*(Math.round((floor+muzzle.y+dy)*ratio)*360+Math.round((x+muzzle.x-sign*dx)*ratio));
    if(data[index+3]>128&&data[index+2]>data[index+1]*1.18)barrel=true;
   }
   assert.ok(barrel,'o cano roxo do disparo encosta no ponto de saída físico');
  }
  let headLeft=360,headRight=-1;
  for(let y=top+5;y<=top+38;y++)for(let x=left;x<=right;x++)if(data[(y*360+x)*4+3]>128){headLeft=Math.min(headLeft,x);headRight=Math.max(headRight,x);}
  return {height:(bottom-top+1)/ratio,width:(right-left+1)/ratio,sole:(bottom+1)/ratio-floor,headWidth:(headRight-headLeft+1)/ratio};
 }
 const stand=measure(drawActor,{scale:.95});
 const crouch=measure(drawActor,{landing:true,scale:.95});
 const slide=measure(drawActor,{landing:true,sliding:true,scale:.95});
 assert.ok(crouch.height>=51&&stand.height>crouch.height+12,JSON.stringify({stand,crouch}));
 assert.ok(slide.height>=38,JSON.stringify({slide,crouch}));
 assert.ok(crouch.headWidth>=stand.headWidth*.87&&crouch.headWidth<=stand.headWidth*1.14,'a arte do agachamento permanece intacta');
 assert.ok(slide.headWidth>=26&&slide.headWidth<slide.height*.8,'a nova pose mantém o rosto legível e espaço para o tronco: '+JSON.stringify(slide));
 const descending=measure(drawActor,{landing:true,crouchPose:.45,scale:.95});
 const rising=measure(drawActor,{landing:false,crouchPose:.45,scale:.95});
 assert.ok(descending.height>crouch.height+5&&descending.height<stand.height,JSON.stringify({stand,descending,crouch}));
 assert.deepEqual(rising,descending,'subida e descida percorrem a mesma dobra do corpo');
 assert.ok(slide.height<=playerBodyFor({hp:2,sliding:true}).terrainHeight+1&&slide.height<crouch.height-2,JSON.stringify({slide,crouch}));
 assert.ok(slide.width>=crouch.width+8,JSON.stringify({slide,crouch}));
 const retract=measure(drawActor,{landing:true,slidePose:.55,slidePhase:.55,scale:.95});
 assert.ok(retract.width<slide.width-8&&Math.abs(retract.sole)<=1.5,'o calcanhar recolhe na saída do deslize');
 const startingSlide=measure(drawActor,{landing:true,sliding:true,slidePose:.5,scale:.95});
 assert.ok(startingSlide.width>crouch.width+2&&startingSlide.width<slide.width-2&&Math.abs(startingSlide.sole)<=1.5,'a perna estende aos poucos com a sola apoiada');
 const raised=measure(drawActor,{landing:true,sliding:true,scale:.95},{floor:81});
 assert.deepEqual(raised,slide,'uma barra elevada muda somente a altura do apoio');
 const hurt=measure(drawActor,{landing:true,sliding:true,scale:.95*HURT_BODY_SCALE});
 assert.ok(Math.abs(hurt.height-slide.height*HURT_BODY_SCALE)<=1&&Math.abs(hurt.width-slide.width*HURT_BODY_SCALE)<=1,JSON.stringify({slide,hurt}));
 for(const age of [.03,.08,.16,.21])for(const facing of [-1,1]){
  const lowShot=measure(drawHeroShot,{age,crouching:true,sliding:true,facing},{checkMuzzle:age===.03});
  assert.ok(lowShot.height<=playerBodyFor({hp:2,sliding:true}).terrainHeight+1&&lowShot.width>=crouch.width+8,JSON.stringify({lowShot,slide,crouch,age,facing}));
  assert.ok(Math.abs(lowShot.sole)<=1.5,JSON.stringify(lowShot));
 }
 for(const facing of [-1,1]){
  const duckShot=measure(drawHeroShot,{age:.03,crouching:true,facing},{checkMuzzle:true});
  assert.ok(duckShot.height>=51&&duckShot.height<=playerBodyFor({hp:2,crouching:true}).terrainHeight+1&&Math.abs(duckShot.sole)<=1.5,JSON.stringify(duckShot));
 }
 for(const pose of [stand,crouch,slide,hurt])assert.ok(Math.abs(pose.sole)<=1.5,JSON.stringify(pose));
});
