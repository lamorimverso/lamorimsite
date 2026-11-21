import {createPresentationDOM} from './runner-presentation-cache.mjs?v=4712d27109dc';
import {ammoCapacityFor} from './runner-supplies.mjs?v=44c67e8a5802';
import {heroPowerFor} from './runner-earned-powers.mjs?v=432ca45a76e4';
import {drawSpriteHead,drawCombatSprite} from './runner-sprites.mjs?v=02eabcb74f94';
import {drawHeroProjectile} from './runner-hero-shot.mjs?v=b60a849f2e34';

import {drawCampaignPortrait} from './runner-campaign-art.mjs?v=6cc1ca5a171d';

// DOM meters retain keyboard/touch controls and accessible values over the track.
const clamp=value=>Math.max(0,Math.min(1,value));
const artKeys=new WeakMap(),doms=new WeakMap();
const presentationFor=doc=>{let ui=doms.get(doc);if(!ui){ui=createPresentationDOM(doc);doms.set(doc,ui);}return ui;};
function meter(ui,element,value,max,text){
 ui.attr(element,'aria-valuenow',value);ui.attr(element,'aria-valuemax',max);
 ui.attr(element,'aria-valuetext',text);ui.style(element,'--meter-fill',100*clamp(value/Math.max(1,max))+'%');
}
function portrait(canvas,type,ready){
 if(!ready||artKeys.get(canvas)===type)return;
 const context=canvas.getContext('2d');if(!context)return;
 const source=document.createElement('canvas');source.width=128;source.height=96;
 const c=source.getContext('2d');if(!c)return;
 if(!drawCampaignPortrait(c,{type,x:54,y:80,size:58})&&!drawSpriteHead(c,{type,x:54,y:80,size:58}))drawCombatSprite(c,{type,x:64,y:90,scale:.7,frame:0});
 const pixels=c.getImageData(0,0,128,96).data;let left=128,top=96,right=0,bottom=0;
 for(let y=0;y<96;y++)for(let x=0;x<128;x++)if(pixels[(y*128+x)*4+3]>0){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}
 if(right<left)return;
 const width=right-left+1,height=bottom-top+1,scale=Math.min((canvas.width-4)/width,(canvas.height-4)/height);
 context.clearRect(0,0,canvas.width,canvas.height);
 context.drawImage(source,left,top,width,height,(canvas.width-width*scale)/2,(canvas.height-height*scale)/2,width*scale,height*scale);artKeys.set(canvas,type);
}
export function updateCombatHUD(run,{spritesReady=false,controlLabels={power:'T',shield:'E'}}={}){
 const ui=presentationFor(document),$=ui.get,active=run.status==='running',weapon=heroPowerFor(run);
 ui.prop('game-combat-hud','hidden',!active);
 if(!active)return;
 const combat=!!run.boss;ui.data('game-combat-hud','combat',combat);
 const life=$('game-hero-health'),charge=$('game-power-charge'),level=run.powerLevels?.[run.activePower]||1;
 ui.prop(life.parentElement,'hidden',!combat);
 meter(ui,life,run.player.hp,run.player.maxHp,run.player.hp+' de '+run.player.maxHp+' pontos de vida');
 const capacity=ammoCapacityFor(run),ammo=run.ammo??6;
 ui.attr(charge,'aria-label','Munição de '+weapon.name);
 meter(ui,charge,ammo,capacity,ammo+' de '+capacity+' tiros · '+(run.boss?(run.player.attackHeld?'Solte o disparo para recarregar':'Recarrega ao parar de atirar'):'Reponha munição com ajudantes'));
 ui.style(charge,'--meter-color',weapon.color);
 ui.prop('game-power-loadout','title',weapon.name+' · nível '+level+' · '+weapon.description+' · '+controlLabels.power+' troca a arma');
 ui.text('game-weapon-level',ammo+'/'+capacity);
 const reserve=$('game-reserve-shield'),ready=run.reserveShields>0,guarded=run.shieldFor>0;
 const shieldText=ready?(guarded?'Escudo guardado; aguarde a proteção atual terminar':run.reserveShields+' escudos prontos; usar com '+controlLabels.shield+' ou toque'):'Escudo: '+run.allyShieldProgress+'/6 ajudas';
 ui.attr(reserve,'aria-label',shieldText);ui.attr(reserve,'aria-describedby','game-aid-status');ui.prop(reserve,'title',shieldText+' · '+run.reserveShields+' reservas · '+run.allyShieldProgress+'/6 partes');
 ui.data(reserve,'ready',ready);ui.data(reserve,'active',guarded);
 ui.text('game-shield-count',ready?'×'+run.reserveShields:guarded?Math.ceil(run.shieldFor)+'s':run.allyShieldProgress+'/6');
 ui.style('game-shield-progress','width',(100*run.allyShieldProgress/6)+'%');
 if(combat)portrait($('game-hero-portrait'),'flavio',spritesReady);
 const icon=$('game-weapon-icon');
 if(spritesReady&&artKeys.get(icon)!==run.activePower){
  const context=icon.getContext('2d');if(context){context.clearRect(0,0,64,64);context.save();context.translate(32,32);
   const scale=run.activePower==='ivermectina'?2.3:['gust','wave'].includes(weapon.behavior)?1.1:1.7;context.scale(scale,scale);
   drawHeroProjectile(context,{powerId:run.activePower,type:weapon.projectile,behavior:weapon.behavior,x:0,y:0,vx:500,vy:0,age:0},0);context.restore();artKeys.set(icon,run.activePower);}
 }
 if(run.boss){
  const b=run.boss;portrait($('game-boss-portrait'),b.type,spritesReady);
  ui.text('game-boss-tag',b.type==='meme-army'?'FANTASMA':b.type==='army'?'GUARDA':b.type==='haddad'?'TAXAD':b.type==='pf'?'PF':b.type.toLocaleUpperCase('pt-BR'));
  ui.prop('game-boss','title',$('game-boss-name').textContent+' · '+$('game-boss-weapon').textContent);
  // The evasion objective stays in the boss description; this meter shows life.
  const remaining=b.combat?b.hp:Number.isFinite(b.hp)?b.hp:b.remaining;
  const max=b.combat?b.maxHp:Number.isFinite(b.hp)?b.maxHp:b.total;
  ui.attr('game-boss-health','aria-label','Vida de '+(b.name||b.type));
  ui.attr('game-boss-health','aria-describedby','game-boss-weapon');
  meter(ui,$('game-boss-health'),remaining,max,remaining+' de '+max+' pontos de vida');
 }
}
