import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('playwright');

test('presentation updates stay immediate without repeatedly mutating unchanged DOM',async t=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 t.after(()=>browser.close());
 const page=await browser.newPage();
 await page.route('http://presentation.test/**',async route=>{
  const path=new URL(route.request().url()).pathname;
  if(path==='/')return route.fulfill({contentType:'text/html',body:'<!doctype html><main id="hud"><span id="score"></span><button id="fire"></button><div id="meter"></div></main>'});
  try{return await route.fulfill({contentType:'text/javascript',body:await readFile(new URL('../tanahoraflavio'+path,import.meta.url),'utf8')});}catch{return route.fulfill({status:404,body:''});}
 });
 await page.goto('http://presentation.test/');
 await t.test('unchanged text, attributes, styles, data and button state cause no DOM mutations',async()=>{
  const result=await page.evaluate(async()=>{
   const {createPresentationDOM}=await import('/runner-presentation-cache.mjs');
   const ui=createPresentationDOM(document),hud=ui.get('hud'),observer=new MutationObserver(()=>{});
   observer.observe(hud,{subtree:true,attributes:true,childList:true,characterData:true});
   function present(){ui.text('score','0042');ui.prop('fire','disabled',false);ui.prop('fire','title','Disparar · J');ui.attr('meter','aria-valuenow','6');ui.style('meter','--meter-fill','100%');ui.data(hud,'combat','true');}
   present();observer.takeRecords();for(let n=0;n<120;n++)present();
   const repeated=observer.takeRecords().length;
   ui.text('score','0043');ui.prop('fire','disabled',true);ui.attr('meter','aria-valuenow','5');ui.style('meter','--meter-fill','83%');ui.data(hud,'combat','false');
   return {repeated,text:ui.get('score').textContent,disabled:ui.get('fire').disabled,aria:ui.get('meter').getAttribute('aria-valuenow'),fill:ui.get('meter').style.getPropertyValue('--meter-fill'),combat:hud.dataset.combat};
  });
  assert.deepEqual(result,{repeated:0,text:'0043',disabled:true,aria:'5',fill:'83%',combat:'false'});
 });
 await t.test('node caching leaves absent nodes discoverable and restores externally changed DOM values',async()=>{
  const result=await page.evaluate(async()=>{
   const {createPresentationDOM}=await import('/runner-presentation-cache.mjs');
   const ui=createPresentationDOM(document),before=ui.get('late');
   const element=document.createElement('span');element.id='late';document.body.append(element);
   ui.text('late','Ready');element.textContent='External';ui.text('late','Ready');
   let missingThrows=false;try{ui.text('missing-required','Missing');}catch(error){missingThrows=error instanceof TypeError;}
   return {before,found:ui.get('late')===element,text:element.textContent,missingThrows};
  });
  assert.deepEqual(result,{before:null,found:true,text:'Ready',missingThrows:true});
 });
 await t.test('control labels retain their object until a new control map and reflect remaps immediately',async()=>{
  const result=await page.evaluate(async()=>{
   const {createControlLabelReader}=await import('/runner-presentation-cache.mjs');
   const read=createControlLabelReader(),controls={keyboard:{fire:['KeyJ','KeyZ'],power:['KeyT'],shield:['KeyE']}};
   const first=read(controls),same=read(controls)===first;
   const changed=read({keyboard:{...controls.keyboard,fire:['KeyF'],power:['KeyQ']}});
   return {same,first,changed};
  });
  assert.deepEqual(result,{same:true,first:{fire:'J/Z',power:'T',shield:'E'},changed:{fire:'F',power:'Q',shield:'E'}});
 });
 await t.test('real combat HUD has no idle mutation churn and updates life, ammunition and accessible controls immediately',async()=>{
  const result=await page.evaluate(async()=>{
   const ids=['game-combat-hud','game-hero-health','game-power-charge','game-power-loadout','game-weapon-level','game-reserve-shield','game-shield-count','game-shield-progress','game-hero-portrait','game-weapon-icon','game-boss-portrait','game-boss-tag','game-boss','game-boss-name','game-boss-weapon','game-boss-health'];
   const fixture=document.createElement('section');
   for(const id of ids){const node=document.createElement('div');node.id=id;fixture.append(node);}
   document.body.append(fixture);
   const {createRun,startRun,advanceRun}=await import('/runner-core.mjs');
   const {updateCombatHUD}=await import('/runner-combat-hud.mjs');
   const {nextStoryBossDistance}=await import('/runner-bosses.mjs');
   const run=createRun({mode:'story',seed:417});startRun(run);run.nextRaid=Infinity;run.bossesDefeated=9;run.routeDistance=run.distance=nextStoryBossDistance(9);run.nextBossAt=0;advanceRun(run,1/120);run.ammo=6;
   const options={controlLabels:{power:'T',shield:'E'}};
   const observer=new MutationObserver(()=>{});observer.observe(fixture,{subtree:true,attributes:true,childList:true,characterData:true});
   updateCombatHUD(run,options);observer.takeRecords();for(let n=0;n<120;n++)updateCombatHUD(run,options);
   const repeated=observer.takeRecords().length;
   run.player.hp=1;run.ammo=2;run.reserveShields=1;run.boss.hp=11;
   updateCombatHUD(run,{controlLabels:{power:'Q',shield:'R'}});
   const get=id=>document.getElementById(id);
   const result={repeated,hp:get('game-hero-health').getAttribute('aria-valuenow'),ammo:get('game-power-charge').getAttribute('aria-valuenow'),bossHp:get('game-boss-health').getAttribute('aria-valuenow'),weapon:get('game-weapon-level').textContent,power:get('game-power-loadout').title.includes('Q troca'),shield:get('game-reserve-shield').getAttribute('aria-label').includes('R ou toque')};
   run.status='over';updateCombatHUD(run);result.hidden=get('game-combat-hud').hidden;
   return result;
  });
  assert.deepEqual(result,{repeated:0,hp:'1',ammo:'2',bossHp:'11',weapon:'2/12',power:true,shield:true,hidden:true});
 });
});
