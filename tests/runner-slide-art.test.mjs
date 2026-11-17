import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {drawActor,drawHeroShot,loadSprites} from '../tanahoraflavio/runner-art.mjs';
import {heroShotPose} from '../tanahoraflavio/runner-hero-shot.mjs';
import {HURT_BODY_SCALE,playerBodyFor} from '../tanahoraflavio/runner-body.mjs';

const require=createRequire(import.meta.url);
let canvas;
try{canvas=require('@napi-rs/canvas');}catch(error){if(error.code!=='MODULE_NOT_FOUND')throw error;}

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
 const ratio=3,x=60;
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
  return {height:(bottom-top+1)/ratio,width:(right-left+1)/ratio,sole:(bottom+1)/ratio-floor};
 }
 const stand=measure(drawActor,{scale:.95});
 const crouch=measure(drawActor,{landing:true,scale:.95});
 const slide=measure(drawActor,{landing:true,sliding:true,scale:.95});
 assert.ok(stand.height>crouch.height+25,JSON.stringify({stand,crouch}));
 assert.ok(slide.height<=playerBodyFor({hp:2,sliding:true}).terrainHeight+1&&slide.height<crouch.height-5,JSON.stringify({slide,crouch}));
 assert.ok(slide.width>=crouch.width+8,JSON.stringify({slide,crouch}));
 const push=measure(drawActor,{landing:true,sliding:true,slidePhase:.5,scale:.95});
 assert.ok(push.width>slide.width+2&&Math.abs(push.sole)<=1.5,'a passada alonga durante o deslize sem levantar as solas');
 const raised=measure(drawActor,{landing:true,sliding:true,scale:.95},{floor:81});
 assert.deepEqual(raised,slide,'uma barra elevada muda somente a altura do apoio');
 const hurt=measure(drawActor,{landing:true,sliding:true,scale:.95*HURT_BODY_SCALE});
 assert.ok(Math.abs(hurt.height-slide.height*HURT_BODY_SCALE)<=1&&Math.abs(hurt.width-slide.width*HURT_BODY_SCALE)<=1,JSON.stringify({slide,hurt}));
 for(const age of [.03,.08,.16,.21])for(const facing of [-1,1]){
  const lowShot=measure(drawHeroShot,{age,crouching:true,sliding:true,facing},{checkMuzzle:age===.03});
  assert.ok(lowShot.height<=33&&lowShot.width>=crouch.width+8,JSON.stringify({lowShot,slide,crouch,age,facing}));
  assert.ok(Math.abs(lowShot.sole)<=1.5,JSON.stringify(lowShot));
 }
 for(const pose of [stand,crouch,slide,hurt])assert.ok(Math.abs(pose.sole)<=1.5,JSON.stringify(pose));
});
