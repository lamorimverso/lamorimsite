import {soldierVariantFor} from './runner-soldier-variants.mjs?v=4bf435291c82';
import {combatActors,combatDefinitions} from './runner-combat-sprite-data.mjs?v=22b4ef6e9140';
export function combatActorTypeFor(type,{armyVariant,enraged=false}={}){return type==='army'&&armyVariant?soldierVariantFor(armyVariant).combatActor:type==='santiago'&&enraged?'santiago-phase2':type;}
/** Whole-pose keys track physical combat state, never a running cycle on a ship. */
export function combatFrameFor(type,{frame,phase=0,preparing=false,attacking=false,recovering=false,hurt=false,reducedMotion=false,progress,armyVariant,enraged=false}={}){
 type=combatActorTypeFor(type,{armyVariant,enraged});
 const actor=combatActors[type];if(!actor)return null;
 const u=Number.isFinite(progress)?Math.max(0,Math.min(1,progress)):1;
 const key=Number.isInteger(frame)?Math.max(0,Math.min(3,frame)):hurt?3:attacking?(u<.65?2:3):preparing?(u<.3?0:1):recovering?(u<.8?3:0):reducedMotion?0:Math.floor(Math.max(0,phase)/6)%2?3:0;
 return {sheet:actor.sheet,index:actor.row*4+key};
}
export function combatGeometryFor(type,options={}){
 type=combatActorTypeFor(type,options);
 const selected=combatFrameFor(type,options);if(!selected)return null;
 const actor=combatActors[type],sheet=combatDefinitions[selected.sheet],frame=sheet.frames[selected.index];
 const height=Math.max(...sheet.frames.slice(actor.row*4,actor.row*4+4).map(f=>f.groundY-f.y));
 const scale=Number.isFinite(options.scale)?options.scale:1,factor=(type==='flavio-slide-shot'?48:94)*scale/height;
 const facing=options.facing===1||options.facing===-1?options.facing:actor.facing,flip=facing/actor.facing;
 return {...selected,frame,factor,flip,muzzle:{x:(frame.muzzle.x-frame.center)*factor*flip,y:(frame.muzzle.y-frame.groundY)*factor},rect:{x:(frame.x-frame.center)*factor,y:(frame.y-frame.groundY)*factor,width:frame.width*factor,height:frame.height*factor}};
}
