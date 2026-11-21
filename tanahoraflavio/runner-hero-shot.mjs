import {drawCompleteWeapon} from './runner-weapon-art.mjs?v=21afe89d7de6';
import {drawCombatSprite} from './runner-sprites.mjs?v=02eabcb74f94';
import {HERO_POWERS} from './runner-earned-powers.mjs?v=432ca45a76e4';
import {combatGeometryFor} from './runner-combat-geometry.mjs?v=6da54cb343f5';
// Essential action timing shared by the hero renderer and physical launch.
export const HERO_SHOT_DURATION=.22;
export function heroShotPose({age=0,crouching=false,airborne=false,facing=1}={}){
 const t=Math.max(0,Math.min(HERO_SHOT_DURATION,Number(age)||0));
 const state=t<.065?'release':t<.13?'recoil':'recover';
 const kick=state==='release'?Math.sin(t/.065*Math.PI)*3.5:state==='recoil'?3.5*(1-(t-.065)/.065):0;
 const settle=state==='recover'?Math.min(1,(t-.13)/.09):0;
 const height=crouching?18:38;
 return {state,kick,settle,facing:facing<0?-1:1,waist:crouching?-13:-28,
  neck:{x:-9-kick*.4,y:crouching?-26:-49},headSize:crouching?23:40,
  shoulder:{x:-8-kick*.4,y:crouching?-26:-44},
  elbow:{x:1-kick-settle*8,y:-height+1+settle*6},
  hand:{x:10-kick-settle*12,y:-height+settle*9},
  muzzle:combatGeometryFor(crouching?'flavio-slide-shot':airborne?'flavio-air-shot':'flavio',{frame:2,scale:.95,facing}).muzzle};
}

/** Complete bottle projectile; its proportions stay fixed while following the shot. */
export function drawHeroProjectile(c,shot,ground=230,{reducedMotion=false}={}){
 if(shot.powerId&&shot.powerId!=='ivermectina'){
  const power=HERO_POWERS[shot.powerId],size=shot.behavior==='gust'?46:shot.behavior==='wave'?Math.min(56,24+shot.age*44):shot.behavior==='heavy'?30:24;
  c.save();c.translate(shot.x,ground-shot.y);c.rotate(Math.atan2(-shot.vy,shot.vx));
  c.strokeStyle=power?.color||'#d7bff0';c.globalAlpha*=.65;c.lineWidth=3;c.beginPath();c.moveTo(-18,0);c.lineTo(-5,0);c.stroke();c.globalAlpha/=.65;
  if(shot.type==='meme-ghost')drawCombatSprite(c,{type:'meme-army',x:0,y:14,scale:.28,frame:2,facing:1});
  else{c.rotate(Math.PI/2);c.translate(0,size/2);drawCompleteWeapon(c,{type:shot.type,width:size,height:size,phase:shot.age*35,reducedMotion});}
  c.restore();return;
 }
 c.save();c.translate(shot.x,ground-shot.y);c.rotate(Math.atan2(-shot.vy,shot.vx));
 c.strokeStyle='#b395df';c.lineWidth=3;c.lineCap='round';c.beginPath();c.moveTo(-19,0);c.lineTo(-10,0);c.stroke();
 c.fillStyle='#fff8ec';c.strokeStyle='#473356';c.lineWidth=1.2;
 c.beginPath();c.roundRect(-8,-5,16,10,3);c.fill();c.stroke();
 const time=reducedMotion?0:(Number(shot.age)||0),sway=time?Math.sin(time*25):0,rattle=time?Math.sin(time*34):0;
 // Contents and cap move against the fixed glass; the shot's center stays put.
 c.fillStyle='#a8dce8';c.beginPath();c.moveTo(-6,2+sway);c.quadraticCurveTo(-1,-1-sway,5,2-sway);c.lineTo(5,4);c.lineTo(-6,4);c.closePath();c.fill();
 c.save();c.translate(7,0);c.rotate(rattle*.18);c.translate(-7,0);
 c.fillStyle='#75509e';c.beginPath();c.roundRect(6,-6,5,12,1);c.fill();c.stroke();
 c.strokeStyle='#ece0ff';c.lineWidth=.7;for(const x of [7.5,9.5]){c.beginPath();c.moveTo(x,-4.5);c.lineTo(x,4.5);c.stroke();}c.restore();
 c.fillStyle='#936bb7';c.beginPath();c.moveTo(-5,-4);c.quadraticCurveTo(-1,-4+sway*1.8,3,-4);c.lineTo(3,4+sway*.8);c.lineTo(-5,4);c.closePath();c.fill();
 c.fillStyle='#ffffff';c.font='bold 4.5px system-ui';c.textAlign='center';c.fillText('IVM',-1,1.5);
 c.restore();
}
