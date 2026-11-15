import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {journeySceneryGeometry} from '../tanahoraflavio/runner-scenery.mjs';
const {chromium}=createRequire(import.meta.url)('playwright');
const cast=['ana-elisa','rick','sofia','guilherme','erika','renato-freitas','jones','maestro','capita','fiscal','povo'];
const props=['network-panel','signal-pulse','arrow-panel','garden-box','stage-spotlight','rotating-sign','debate-card','baton-wave','wind-flag','inspection-gate','crowd-lane'];
const stages=['brasilia','rio','sao-paulo','argentina','paraguai','florida','casa-branca','brasilia-final'];
let browser,page;
function browserTests(t){
 t.before(async()=>{
 browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 page=await browser.newPage();
 await page.route('http://campaign.test/**',async route=>{
  const path=new URL(route.request().url()).pathname;
  if(path==='/')return route.fulfill({contentType:'text/html',body:'<!doctype html>'});
  if(/^\/assets\/[a-z0-9-]+\.webp$/.test(path)){
   const body=await readFile(new URL(`../tanahoraflavio${path}`,import.meta.url));
   return route.fulfill({contentType:'image/webp',body});
  }
  if(!/^\/[a-z0-9-]+\.mjs$/.test(path))return route.abort();
  const body=await readFile(new URL(`../tanahoraflavio${path}`,import.meta.url),'utf8');
  return route.fulfill({contentType:'text/javascript',body});
 });
 await page.goto('http://campaign.test/');
 });
 t.after(async()=>{await browser?.close();});
}

test('the campaign can place the MASP and final Brasília without altering the legacy scenery loop',()=>{
 const g=options=>journeySceneryGeometry({width:480,...options});
 for(const [index,id] of [[2,'sao-paulo'],[7,'brasilia-final']]){
  const left=g({routeDistance:index*7000+2500,campaignStages:stages}).landmarks.find(l=>l.segmentIndex===index);
  assert.equal(left.stageId,id);
  assert.equal(left.x,168);
 }
 assert.equal(g({routeDistance:16500}).landmarks.find(l=>l.segmentIndex===2).stageId,'argentina');
});

test('campaign illustrations in the browser',async t=>{
 browserTests(t);
 await t.test('Paulista draws a visible landmark with the red MASP structure',async()=>{
 const landmark=await page.evaluate(async campaignStages=>{
  const {drawJourneyScenery}=await import('/runner-scenery.mjs');
  const c=document.createElement('canvas');c.width=480;c.height=300;const ctx=c.getContext('2d');
  drawJourneyScenery(ctx,{routeDistance:16500,width:480,campaignStages});
  const data=ctx.getImageData(50,95,235,131).data;
  let red=0;for(let i=0;i<data.length;i+=4)if(data[i]>data[i+1]*1.55&&data[i]>data[i+2]*1.3)red++;
  return red;
 },stages);
 assert.ok(landmark>1200,'the MASP has wide, visible red supports');
 });

 await t.test('new encounter figures, portraits and illustrated threats produce distinct pixels',async()=>{
 const results=await page.evaluate(async({cast,props})=>{
  const {drawHoverEnemy}=await import('/runner-boss-art.mjs');
  const {drawCampaignCrowd,drawCampaignPortrait}=await import('/runner-campaign-art.mjs');
  const {drawThreat}=await import('/runner-art.mjs');
  const canvas=document.createElement('canvas');canvas.width=180;canvas.height=180;const ctx=canvas.getContext('2d');
  function capture(draw){
   ctx.clearRect(0,0,180,180);draw();const pixels=ctx.getImageData(0,0,180,180).data;
   let count=0,hash=0;for(let i=0;i<pixels.length;i++){hash=(Math.imul(hash,31)+pixels[i])|0;if(i%4===3&&pixels[i]>64)count++;}
   return {count,hash};
  }
  return [cast.map(type=>capture(()=>type==='povo'?drawCampaignCrowd(ctx,{x:90,y:155,reducedMotion:true}):drawHoverEnemy(ctx,{type,x:90,y:135,preparing:true,reducedMotion:true}))),cast.map(type=>capture(()=>drawCampaignPortrait(ctx,{type,x:90,y:126,size:76}))),props.map(type=>capture(()=>drawThreat(ctx,{type,x:55,width:70,height:62},130,1,{reducedMotion:true})))];
 },{cast,props});
 for(const group of results){
  assert.ok(group.every(({count})=>count>=350));
  assert.equal(new Set(group.map(({hash})=>hash)).size,group.length);
 }
 });

 await t.test('campaign corridor hazards render in the live atlas and remain visibly distinct',async()=>{
  const figures=await page.evaluate(async()=>{
   const {loadSprites,drawThreat,drawProjectile}=await import('/runner-art.mjs');
   await loadSprites(()=>{},{coreOnly:true});
   const canvas=document.createElement('canvas');canvas.width=100;canvas.height=100;const ctx=canvas.getContext('2d');
   return ['orla-runner','paulista-runner','route-scout','terminal-guard','lula-runner','ze-gotinha-rival'].map(type=>{
    ctx.clearRect(0,0,100,100);
    const item={type,x:30,y:18,width:type==='ze-gotinha-rival'?29:37,height:type==='ze-gotinha-rival'?32:44,speed:1,launched:true};
    if(type==='ze-gotinha-rival')drawProjectile(ctx,item,80,3,{reducedMotion:true});
    else drawThreat(ctx,item,80,3,{reducedMotion:true});
    const pixels=ctx.getImageData(0,0,100,100).data;let hash=0,count=0;
    for(let i=0;i<pixels.length;i++){hash=(Math.imul(hash,31)+pixels[i])|0;if(i%4===3&&pixels[i]>64)count++;}
    return {type,hash,count};
   });
  });
  for(const {type,count} of figures)assert.ok(count>180,`${type} was not painted`);
  assert.equal(new Set(figures.map(({hash})=>hash)).size,figures.length);
 });
});
