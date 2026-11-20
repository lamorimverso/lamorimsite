import test from 'node:test';
import assert from 'node:assert/strict';
import * as sprites from '../tanahoraflavio/runner-sprites.mjs';

const types=['handcuffs','microphone','hammer','mandado','receipts','budget-sheets','parachute-cross','lhand'];
test('eight signature objects have complete four-pose artwork in the essential load',()=>{
 assert.equal(sprites.CORE_SPRITE_SHEET_COUNT,20);
 assert.equal(sprites.SPRITE_SHEET_COUNT,24);
 assert.equal(typeof sprites.drawIllustratedProp,'function');
});

test('illustrated objects load atomically, animate during a 240ms flight and preserve the physical center',async t=>{
 assert.equal(typeof sprites.drawIllustratedProp,'function');
 const images=[],original=globalThis.Image;
 globalThis.Image=class {constructor(){images.push(this);}set src(value){this.url=value;}};
 t.after(()=>original===undefined?delete globalThis.Image:globalThis.Image=original);
 const s=await import('../tanahoraflavio/runner-sprites.mjs?signature-prop-loading');
 const pending=s.loadSprites(()=>{},{coreOnly:true});
 const context=()=>({globalAlpha:1,calls:[],transforms:[],save(){},restore(){},translate(...a){this.transforms.push(['translate',...a]);},rotate(...a){this.transforms.push(['rotate',...a]);},drawImage(...a){this.calls.push(a);}});
 assert.equal(s.drawIllustratedProp(context(),{type:'handcuffs'}),false);
 for(const image of images){const d=Object.values(s.spriteDefinitions).find(d=>d.url===image.url);image.naturalWidth=d.width;image.naturalHeight=d.height;image.onload();}
 await pending;
 for(const type of types){
  const poses=[],still=[];
  for(const phase of [0,1.44,2.88,4.32]){
   const c=context();assert.equal(s.drawIllustratedProp(c,{type,width:46,height:44,phase}),true);const a=c.calls[0];
   assert.equal(c.calls.length,1,'one complete source pose');
   assert.ok(a[7]<=46&&a[8]<=44,'uniform scale fits existing collision envelope');
   assert.ok(Math.abs(a[5]+a[7]/2)<1e-9,'horizontal physics center');
   assert.ok(Math.abs(a[6]+a[8]/2+22)<1e-9,'vertical physics center');
   poses.push(a.slice(1,5));
   const r=context();s.drawIllustratedProp(r,{type,width:46,height:44,phase,reducedMotion:true});still.push(r.calls);
  }
  assert.equal(new Set(poses.map(JSON.stringify)).size,4,type+' shows all four poses during flight');
  assert.ok(still.every(a=>JSON.stringify(a)===JSON.stringify(still[0])),'reduced motion holds first complete pose');
 }
 assert.equal(s.drawIllustratedProp(context(),{type:'handcuffs',width:NaN}),false);
 for(const height of [72,84]){
  const a=context(),b=context();
  assert.equal(s.drawIllustratedProp(a,{type:'handcuffs',width:46,height,phase:0}),true,'actual PF cast uses illustrated handcuffs');
  assert.equal(s.drawIllustratedProp(b,{type:'handcuffs',width:46,height,phase:1.44}),true);
  assert.notDeepEqual(a.calls[0].slice(1,5),b.calls[0].slice(1,5),'PF chain animates in the real cast envelope');
  assert.deepEqual(a.transforms,[['translate',0,-height/2],['rotate',Math.PI/2]],'complete pose turns uniformly around the collision center');
  assert.ok(a.calls[0][8]<=46&&a.calls[0][7]<=height,'rotated artwork fits physics bounds');
 }
 assert.equal(s.drawIllustratedProp(context(),{type:'unknown'}),false);
});
