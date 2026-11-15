import {ammoCapacityFor} from './runner-supplies.mjs?v=ffd49bde7244';
import {heroPowerFor} from './runner-earned-powers.mjs?v=27e0bb16e2f2';
import {drawSpriteHead,drawCombatSprite} from './runner-sprites.mjs?v=94bad35aaa14';
import {drawHeroProjectile} from './runner-hero-shot.mjs?v=f273e11b16a6';

// DOM meters retain keyboard/touch controls and accessible values over the track.
const clamp=value=>Math.max(0,Math.min(1,value));
const artKeys=new WeakMap();
function meter(element,value,max,text){
 element.setAttribute('aria-valuenow',String(value));element.setAttribute('aria-valuemax',String(max));
 element.setAttribute('aria-valuetext',text);element.style.setProperty('--meter-fill',100*clamp(value/Math.max(1,max))+'%');
}
function portrait(canvas,type,ready){
 if(!ready||artKeys.get(canvas)===type)return;
 const context=canvas.getContext('2d');if(!context)return;
 const source=document.createElement('canvas');source.width=128;source.height=96;
 const c=source.getContext('2d');if(!c)return;
 if(!drawSpriteHead(c,{type,x:54,y:80,size:58}))drawCombatSprite(c,{type,x:64,y:90,scale:.7,frame:0});
 const pixels=c.getImageData(0,0,128,96).data;let left=128,top=96,right=0,bottom=0;
 for(let y=0;y<96;y++)for(let x=0;x<128;x++)if(pixels[(y*128+x)*4+3]>0){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}
 if(right<left)return;
 const width=right-left+1,height=bottom-top+1,scale=Math.min((canvas.width-4)/width,(canvas.height-4)/height);
 context.clearRect(0,0,canvas.width,canvas.height);
 context.drawImage(source,left,top,width,height,(canvas.width-width*scale)/2,(canvas.height-height*scale)/2,width*scale,height*scale);artKeys.set(canvas,type);
}
export function updateCombatHUD(run,{spritesReady=false,controlLabels={power:'Q',shield:'E'}}={}){
 const $=id=>document.getElementById(id),active=run.status==='running',weapon=heroPowerFor(run);
 $('game-combat-hud').hidden=!active;
 if(!active)return;
 const combat=!!run.boss;$('game-combat-hud').dataset.combat=String(combat);
 const life=$('game-hero-health'),charge=$('game-power-charge'),level=run.powerLevels?.[run.activePower]||1;
 life.parentElement.hidden=!combat;charge.hidden=!combat;
 meter(life,run.player.hp,run.player.maxHp,run.player.hp+' de '+run.player.maxHp+' pontos de vida');
 const capacity=ammoCapacityFor(run),ammo=run.ammo??6;
 charge.setAttribute('aria-label','Munição de '+weapon.name);
 meter(charge,ammo,capacity,ammo+' de '+capacity+' tiros · '+(run.boss?(run.player.attackHeld?'Solte o disparo para recarregar':'Recarrega ao parar de atirar'):'Reponha munição com ajudantes'));
 charge.style.setProperty('--meter-color',weapon.color);
 const select=$('game-weapon-select');select.setAttribute('aria-label','Poder de Flávio, '+ammo+' de '+capacity+' tiros');select.title=weapon.name+' · nível '+level+' · '+weapon.description+' · '+controlLabels.power+' troca o poder';
 $('game-power-loadout').title=select.title;$('game-weapon-level').textContent=ammo+'/'+capacity;
 const reserve=$('game-reserve-shield'),ready=run.reserveShields>0,guarded=run.shieldFor>0;
 const shieldText=ready?(guarded?'Escudo guardado; aguarde a proteção atual terminar':run.reserveShields+' escudos prontos; usar com '+controlLabels.shield+' ou toque'):'Escudo: '+run.allyShieldProgress+'/6 ajudas';
 reserve.setAttribute('aria-label',shieldText);reserve.setAttribute('aria-describedby','game-aid-status');reserve.title=shieldText+' · '+run.reserveShields+' reservas · '+run.allyShieldProgress+'/6 partes';
 reserve.dataset.ready=String(ready);reserve.dataset.active=String(guarded);
 $('game-shield-count').textContent=ready?'×'+run.reserveShields:guarded?Math.ceil(run.shieldFor)+'s':run.allyShieldProgress+'/6';
 $('game-shield-progress').style.width=(100*run.allyShieldProgress/6)+'%';
 if(combat)portrait($('game-hero-portrait'),'flavio',spritesReady);
 const icon=$('game-weapon-icon');
 if(spritesReady&&artKeys.get(icon)!==run.activePower){
  const context=icon.getContext('2d');if(context){context.clearRect(0,0,64,64);context.save();context.translate(32,32);
   const scale=run.activePower==='ivermectina'?2.3:['gust','wave'].includes(weapon.behavior)?1.1:1.7;context.scale(scale,scale);
   drawHeroProjectile(context,{powerId:run.activePower,type:weapon.projectile,behavior:weapon.behavior,x:0,y:0,vx:500,vy:0,age:0},0);context.restore();artKeys.set(icon,run.activePower);}
 }
 if(run.boss){
  const b=run.boss;portrait($('game-boss-portrait'),b.type,spritesReady);
  $('game-boss-tag').textContent=b.type==='meme-army'?'FANTASMA':b.type==='army'?'GUARDA':b.type==='haddad'?'TAXAD':b.type==='pf'?'PF':b.type.toLocaleUpperCase('pt-BR');
  $('game-boss').title=$('game-boss-name').textContent+' · '+$('game-boss-weapon').textContent;
  // The evasion objective stays in the boss description; this meter shows life.
  const remaining=b.combat?b.hp:Number.isFinite(b.hp)?b.hp:b.remaining;
  const max=b.combat?b.maxHp:Number.isFinite(b.hp)?b.maxHp:b.total;
  $('game-boss-health').setAttribute('aria-label','Vida de '+(b.name||b.type));
  $('game-boss-health').setAttribute('aria-describedby','game-boss-weapon');
  meter($('game-boss-health'),remaining,max,remaining+' de '+max+' pontos de vida');
 }
}
