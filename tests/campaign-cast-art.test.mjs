import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {createRun,startRun,resizeRun,advanceRun,STORY_BOSS_COUNT} from '../tanahoraflavio/runner-core.mjs';
import {bossPresentationFor,nextStoryBossDistance,storyBossAt} from '../tanahoraflavio/runner-bosses.mjs';
import {campaignBossPoseFor} from '../tanahoraflavio/runner-campaign-art.mjs';
import {standingEnemyPose} from '../tanahoraflavio/runner-cast-pose.mjs';
import {pilotDodge} from '../tools/story-pilot.mjs';

const artRoot=new URL('../tanahoraflavio/',import.meta.url);
const require=createRequire(import.meta.url);
const ids=['ana-elisa','rick','sofia','guilherme','erika','renato-freitas','jones','maestro','capita','fiscal'];

test('a mão chega à origem física antes de disparar e não salta na soltura',async()=>{
 const {campaignBossPoseFor}=await import(new URL('runner-campaign-art.mjs',artRoot)),{standingEnemyPose}=await import(new URL('runner-cast-pose.mjs',artRoot));
 const muzzle={x:-48,y:-52},distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 const frontHand=(type,options)=>campaignBossPoseFor(type,standingEnemyPose(options),options).arms.left.hand;
 for(const type of ids)for(const reducedMotion of [false,true]){
  for(const action of ['jump','crouch']){
   const base={action,phase:13,reducedMotion},label=type+' / '+action+' / reduzido '+reducedMotion;
   const approaching=frontHand(type,{...base,preparing:true,progress:.95});
   const loaded=frontHand(type,{...base,preparing:true,progress:1});
   const cast=frontHand(type,{...base,attacking:true,progress:0});
   const firstFrames=frontHand(type,{...base,attacking:true,progress:.1});
   assert.ok(distance(cast,muzzle)<=4,label+' projétil nasceu longe da mão: '+distance(cast,muzzle));
   assert.ok(distance(firstFrames,muzzle)<=4,label+' a mão saiu cedo do ponto de soltura');
   assert.ok(distance(approaching,loaded)<=8,label+' aproximação abrupta no fim do preparo');
   assert.ok(distance(loaded,cast)<=2,label+' salto entre o preparo e a soltura');
   const finish=frontHand(type,{...base,attacking:true,progress:1});
   const recover=frontHand(type,{...base,recovering:true,progress:0});
   assert.ok(distance(finish,recover)<=.1,label+' salto entre soltura e recuperação');
  }
  const lane=frontHand(type,{action:'move',phase:13,reducedMotion,attacking:true,progress:0});
  assert.ok(distance(lane,muzzle)>10,type+' marca lateral não deve usar o gesto de tiro');
 }
});

for(const [id,opening] of [['rick',['jump','crouch','jump','crouch','jump','crouch']],
 ['ana-elisa',['move','jump']],['erika',['move','crouch','move']]]){
 test(`${id} prepara cada batida real antes de emitir, sem salto de pose`,()=>{
  const dt=1/120,muzzle={x:-48,y:-52},distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const index=Array.from({length:STORY_BOSS_COUNT},(_,i)=>storyBossAt(i)).findIndex(b=>b.type===id);
  for(const [width,reducedMotion] of [[480,true],[900,false]]){
   const run=createRun({mode:'story',seed:12});startRun(run);resizeRun(run,width);run.reducedMotion=reducedMotion;
   run.bossesDefeated=index;run.distance=run.routeDistance=run.nextBossAt=nextStoryBossDistance(index);
   for(const key of ['nextRaid','nextObstacle','nextAllyAt','nextSupportAt','nextPower','nextPassport'])run[key]=Infinity;
   run.terrain.nextAt=Infinity;
   const readPose=()=>{
    if(!run.boss)return null;
    const flags=bossPresentationFor(run.boss,run.obstacles,{continuousCast:true});
    const options={phase:run.elapsed*9,reducedMotion,classId:run.boss.classId,...flags};
    return {flags,hand:campaignBossPoseFor(id,standingEnemyPose(options),options).arms.left.hand};
   };
   const seen=new WeakSet(),emitted=[];
   for(let i=0;i<120*12&&emitted.length<opening.length;i++){
    const previous=readPose(),fired=run.boss?.fired??0;
    pilotDodge(run);advanceRun(run,dt);
    if(!run.boss)continue;
    const actual=readPose();
    if(run.boss.fired>fired){
     const shot=run.boss.volleyShots.at(-1),action=opening[fired],label=`${width}px, batida ${fired+1}`;
     assert.equal(shot.action,action,label);
     assert.equal(previous.flags.preparing,true,`${label}: gesto começa antes da reserva física`);
     assert.equal(previous.flags.action,action,`${label}: gesto corresponde à próxima batida`);
     assert.ok(distance(previous.hand,actual.hand)<3,`${label}: a mão não salta ao reservar`);
     if(action==='move'){
      assert.ok(shot.falling&&actual.flags.attacking,`${label}: a marca tem soltura própria`);
      assert.ok(distance(actual.hand,muzzle)>10,`${label}: a marca não nasce da mão`);
      emitted.push(action);
     }else{
      assert.ok(!shot.launched,`${label}: o projétil ainda está reservado`);
      assert.equal(actual.flags.preparing,true,`${label}: reserva de espera zero mantém o preparo`);
     }
    }
    for(const shot of run.obstacles){
     if(shot.owner!==id||!shot.projectile||!shot.launched||seen.has(shot))continue;
     seen.add(shot);
     assert.equal(previous.flags.preparing,true,`${width}px: quadro anterior ao disparo mantém a mão pronta`);
     assert.equal(actual.flags.attacking,true);
     assert.equal(actual.flags.action,shot.action);
     assert.ok(distance(previous.hand,actual.hand)<3,`${width}px: a mão não salta ao disparar`);
     assert.ok(distance(actual.hand,muzzle)<3,`${width}px: a origem continua na mão`);
     emitted.push(shot.action);
    }
   }
   assert.deepEqual(emitted,opening);
  }
 });
}

function nativeCanvas(){
 const modules=process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES;
 for(const id of ['@napi-rs/canvas',...(modules?[modules+'/@napi-rs/canvas']:[])]){
  try{return require(id);}catch(error){if(error.code!=='MODULE_NOT_FOUND')throw error;}
 }
}
async function measure(t){
 const native=nativeCanvas();
 if(native){
  const art=await import(new URL('runner-campaign-art.mjs',artRoot)),{standingEnemyPose}=await import(new URL('runner-cast-pose.mjs',artRoot));
  return inspect(native.createCanvas,art,standingEnemyPose,ids);
 }
 // CI installs Playwright, so the regression also exercises Chrome's actual Canvas.
 const {chromium}=require('playwright'),executablePath=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
 const browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{})});
 t.after(()=>browser.close());
 const page=await browser.newPage();
 await page.route('http://campaign-cast.test/**',async route=>{
  const {pathname}=new URL(route.request().url());
  if(pathname==='/')return route.fulfill({contentType:'text/html',body:'<!doctype html>'});
  if(!/^\/[a-z0-9-]+\.mjs$/.test(pathname))return route.abort();
  return route.fulfill({contentType:'text/javascript',body:await readFile(new URL(pathname.slice(1),artRoot))});
 });
 await page.goto('http://campaign-cast.test/');
 return page.evaluate(async({inspectSource,ids})=>{
  const art=await import('/runner-campaign-art.mjs'),{standingEnemyPose}=await import('/runner-cast-pose.mjs');
  return Function('return ('+inspectSource+')')()((width,height)=>Object.assign(document.createElement('canvas'),{width,height}),art,standingEnemyPose,ids);
 },{inspectSource:inspect.toString(),ids});
}

function inspect(surface,{drawCampaignBoss,drawCampaignCrowd},standingEnemyPose,ids){
 const states=[{}, {preparing:true,progress:.9}, {attacking:true,progress:.43}, {recovering:true,progress:.42}, {hurt:true}];
 function render(draw){
  const c=surface(180,155).getContext('2d');c.translate(90,136);
  draw(c);return c.getImageData(0,0,180,155).data;
 }
 function mask(pixels,[x,y,w,h],filter=()=>true){
  const out=[];for(let i=y;i<y+h;i++)for(let j=x;j<x+w;j++)if(filter(j))out.push(+(pixels[(i*180+j)*4+3]>138));
  return out;
 }
 const distance=(a,b)=>a.reduce((n,v,i)=>n+ +(v!==b[i]),0);
 const cast=ids.map(id=>{
  const phases=states.map(flags=>{
   // Same incoming class and action for each boss. Shape and acting must
   // establish the identity even without a palette or a different AI class.
   const opts={action:'move',phase:4,reducedMotion:true,...flags};
   return render(c=>drawCampaignBoss(c,{type:id,pose:standingEnemyPose(opts),...opts}));
  });
  const repeat=render(c=>drawCampaignBoss(c,{type:id,pose:standingEnemyPose({action:'move',phase:19,reducedMotion:true}),action:'move',phase:19,reducedMotion:true}));
  const feet=phases.map(p=>mask(p,[61,131,58,6]));
  const body=mask(phases[0],[53,74,76,54]);
  const edge=phases.map(p=>mask(p,[15,31,150,96],x=>x<56||x>124));
  return {id,feetStable:feet.every(f=>distance(f,feet[0])===0),feetCount:feet[0].reduce((a,b)=>a+b,0),
   phaseChanges:phases.slice(1).map((p,i)=>distance(mask(p,[20,15,140,114]),mask(phases[i],[20,15,140,114]))),
   functionalGesture:edge[2].map((value,i)=>value^edge[1][i]),body,
   stableReduced:repeat.every((value,i)=>value===phases[0][i])};
 });
 const pairs=[];for(const [i,a] of cast.entries())for(const b of cast.slice(i+1))pairs.push([a.id,b.id,distance(a.body,b.body),distance(a.functionalGesture,b.functionalGesture)]);
 const crowd0=render(c=>drawCampaignCrowd(c,{phase:0})),crowd1=render(c=>drawCampaignCrowd(c,{phase:7}));
 const still0=render(c=>drawCampaignCrowd(c,{phase:0,reducedMotion:true})),still1=render(c=>drawCampaignCrowd(c,{phase:7,reducedMotion:true}));
 const reducedPhases=[{}, {preparing:true,progress:.85},{attacking:true,progress:.6},{recovering:true,progress:.32}].map(flags=>
  mask(render(c=>drawCampaignCrowd(c,{phase:4,reducedMotion:true,...flags})),[10,14,160,108]));
 const crowd={poses:reducedPhases.slice(1).map((p,i)=>distance(p,reducedPhases[i])),
  feet:distance(mask(crowd0,[12,131,156,5]),mask(crowd1,[12,131,156,5])),
  left:distance(mask(crowd0,[12,12,64,110]),mask(crowd1,[12,12,64,110])),right:distance(mask(crowd0,[104,12,64,110]),mask(crowd1,[104,12,64,110])),
  stableReduced:still0.every((v,i)=>v===still1[i])};
 return {cast:cast.map(({body,functionalGesture,...details})=>details),pairs,crowd};
}
test('a arte nova continua distinta e funcional no Canvas',async t=>{
 const metrics=await measure(t);
 await t.test('dez chefes têm silhuetas e gestos próprios sem depender de cor ou classe',()=>{
  for(const [first,second,body,gesture] of metrics.pairs){
   assert.ok(body>=45,`${first} / ${second}: apenas ${body} pixels distinguem as silhuetas do corpo`);
   assert.ok(gesture>=30,`${first} / ${second}: apenas ${gesture} pixels distinguem os gestos de soltura`);
  }
 });
 await t.test('poses essenciais continuam legíveis em movimento reduzido e os sapatos não deslizam',()=>{
  for(const actor of metrics.cast){
   assert.ok(actor.phaseChanges.every(n=>n>=75),JSON.stringify(actor));
   assert.ok(actor.feetStable&&actor.feetCount>=20,JSON.stringify(actor));
   assert.ok(actor.stableReduced,JSON.stringify(actor));
  }
 });
 await t.test('O Povo gesticula e abre passagem sem flutuar, inclusive em modo reduzido',()=>{
  assert.equal(metrics.crowd.feet,0);
  assert.ok(metrics.crowd.left>=80&&metrics.crowd.right>=80,JSON.stringify(metrics.crowd));
  assert.ok(metrics.crowd.poses.every(n=>n>=40),JSON.stringify(metrics.crowd));
  assert.ok(metrics.crowd.stableReduced);
 });
});
