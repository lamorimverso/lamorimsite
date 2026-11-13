import {STAGES} from './runner-route-data.mjs?v=859ae4e257bd';
import {BOSS_RANKS,bossProfileFor,bossWeaponFor} from './runner-boss-profiles.mjs?v=ad8596a8668a';
// Encontros ficcionais: quatro classes por cenário, sem mudar identidades.
export const STORY_ENCOUNTERS=STAGES.length*4;
export const STORY_OPENING_DISTANCE=20800;
export const BOSS_CLASSES=Object.freeze({
 sentinel:Object.freeze({name:'Sentinela',color:'#63c4e1',telegraph:.92,recover:1.3,burst:1}),
 gunner:Object.freeze({name:'Artilheiro',color:'#f1b65d',telegraph:.82,recover:1.15,burst:3}),
 caster:Object.freeze({name:'Conjurador',color:'#bc8af0',telegraph:.90,recover:1.2,burst:2}),
 sovereign:Object.freeze({name:'Soberano',color:'#ee7588',telegraph:.76,recover:1.05,burst:3})
});
const cast=[
 [['pf','Blitz da PF'],['janones','Janones'],['haddad','Haddad · Taxad'],['xandao','Xandão']],
 [['army','Patrulha do Rio'],['joice','Joice'],['simone','Simone Tebet'],['lula','Lula']],
 [['pf','PF · Interceptor'],['soraya','Soraya'],['dino','Dino'],['dilma','Dilma']],
 [['army','Patrulha paraguaia'],['janones','Janones · Comando'],['haddad','Taxad · Auditor'],['santiago','Santiago Peña']],
 [['pf','PF · Patrulha'],['joice','Joice · Comando'],['simone','Simone · Orçamento'],['bossonari','Bossonari']],
 [['army','Guarda da Casa Branca'],['boulos','Boulos'],['dino','Dino · Tribunal'],['meme-army','Fantasma do Comunismo']]
];
export function storyBossAt(index){
 if(!Number.isInteger(index)||index<0||index>=STORY_ENCOUNTERS)return null;
 const stageIndex=Math.floor(index/4),slot=index%4,[type,name]=cast[stageIndex][slot],profile=bossProfileFor(type),classId=profile.classId,group=BOSS_CLASSES[classId];
 return {id:'stage-'+stageIndex+'-boss-'+slot,index,stageIndex,slot,type,name,classId,className:group.name,
  rank:profile.rank,rankName:BOSS_RANKS[profile.rank-1],powerName:profile.powerName,hp:18+stageIndex*8+slot*2,
  color:group.color,burst:group.burst,telegraph:Math.max(.58,group.telegraph-stageIndex*.035),
  recover:Math.max(.8,group.recover-stageIndex*.04),interval:Math.max(.68,1.04-slot*.055-stageIndex*.035),
  attackTypes:profile.attackTypes,objective:'Nível '+profile.rank+' · '+profile.powerName+'. Atire nas aberturas e desvie do poder anunciado.'};
}
export function nextStoryBossDistance(index){
 const b=storyBossAt(index);return b?STORY_OPENING_DISTANCE+b.stageIndex*7000+[1200,2900,4600,6300][b.slot]:Infinity;
}
export function arenaPatternFor(boss,fired=0){
 const profile=bossProfileFor(boss.type);if(!profile)return {type:null,action:'jump',approach:'diagonal'};
 const sequence=profile.sequence,action=sequence[fired%sequence.length];
 const type=bossWeaponFor(boss.type,fired,action);
 const entry=action==='move'?'vertical':profile.style==='drop'?'drop':action==='jump'&&fired%3===1?'drop':action==='crouch'&&boss.hp<=boss.maxHp/2?'sweep':'diagonal';
 return {type,action,approach:entry};
}
// Only choose when a new wind-up begins; the published cue is a commitment.
export function planArenaAttack(boss,player={},rng=Math.random){
 const fired=Number(boss.fired)||0;
 if(fired<3)return arenaPatternFor(boss,fired);
 const roll=Math.max(0,Math.min(.999999,Number(rng())||0));
 const profile=bossProfileFor(boss.type);if(!profile)return arenaPatternFor(boss,fired);
 const complex=profile.sequence.includes('move');
 let action=player.crouching?'jump':player.y>20?'crouch':
  complex&&player.stillFor>2?'move':player.x>(player.viewportWidth||900)*.5?(roll<.6?'crouch':'jump'):roll<.46?'jump':roll<.86?'crouch':complex?'move':'jump';
 if(action===boss.lastAction&&boss.actionStreak>=3)action=action==='jump'?'crouch':'jump';
 const type=bossWeaponFor(boss.type,fired+Math.floor(roll*profile.attackTypes.length),action);
 const approach=action==='move'?'vertical':profile.style==='drop'?'drop':action==='jump'?(roll<.5?'drop':'diagonal'):
  player.y>20||roll>.5?'sweep':'diagonal';
 // The target lane remains dodgeable. Position is sampled for the announced
 // overhead marker; projectiles commit their horizontal aim on actual release.
 return {type,action,approach,targetY:action==='jump'?22+roll*4:88+roll*6,
  arcHeight:approach==='drop'?30+roll*12:approach==='sweep'?8+roll*8:0};
}
export function storyApproachAt(distance,index){
 const boss=storyBossAt(index);if(!boss)return null;
 const remaining=nextStoryBossDistance(index)-distance;
 return remaining>=0&&remaining<=1000?{boss,remaining,phase:remaining>400?'rehearsal':'safe'}:null;
}
// A munição pode ficar reservada após a fase de carga. O corpo deve continuar
// preparando-a, e uma segunda reserva nunca pode esconder o disparo em curso.
export function bossPresentationFor(boss,obstacles=[]){
 const pending=obstacles.find(o=>o.bossAttack&&o.projectile&&o.waitFor>0&&!o.launched);
 const endlessCue=!boss.combat&&boss.nextAttack<.55&&boss.fired<boss.total;
 const attacking=boss.attackFlashFor>0,preparing=!attacking&&(boss.phase==='charge'||!!pending||endlessCue);
 const recovering=!attacking&&!preparing&&boss.phase==='recover';
 const progress=attacking?1-boss.attackFlashFor/.26:preparing?
  boss.phase==='charge'?1-boss.phaseFor/boss.telegraph:pending?1-pending.waitFor/.82:1-boss.nextAttack/.55:
  recovering?1-boss.phaseFor/boss.recover:0;
 return {attacking,preparing,recovering,progress:Math.max(0,Math.min(1,progress||0)),
  action:attacking||recovering?boss.lastReleasedAction||boss.lastAction||'jump':pending?.action||boss.plannedAttack?.action||'jump'};
}
export function bossArenaPose(boss,width=900){
 if(boss.reducedMotion)return {x:width-94,platformY:68};
 const age=Number(boss.age)||0;
 const amplitude=({sentinel:18,gunner:24,caster:29,sovereign:34})[boss.classId]||18;
 const arrival=boss.phase==='intro'?Math.max(0,1-age/1.1)**3*150:0;
 const tempo=1+(Number(boss.stageIndex)||0)*.06+(boss.enraged?.16:0);
 const t=age*tempo,release=boss.attackFlashFor>0?Math.sin(boss.attackFlashFor/.26*Math.PI)*7:0;
 const motion={
  sentinel:{x:Math.sin(t*.65)*amplitude,y:68+Math.sin(t*1.1)*6},
  gunner:{x:Math.sin(t*1.4)*amplitude+release,y:70+Math.sin(t*2.2)*8},
  caster:{x:Math.sin(t*.9)*amplitude,y:78+Math.sin(t*1.45)*22},
  sovereign:{x:Math.sin(t*.8)*amplitude+Math.sin(t*1.7)*8,y:76+Math.sin(t*.95)*16+Math.sin(t*2.1)*5}
 }[boss.classId]||{x:Math.sin(t*.85)*18,y:68+Math.sin(t*1.3)*10};
 return {x:width-94+motion.x+arrival,platformY:motion.y};
}
// Opportunities differ by class. Holding fire stays available; well-timed
// counterattacks finish fights sooner without introducing another input.
export function bossCounterWindow(boss){
 const recovery=boss.phase==='recover',elapsed=(boss.recover||1)-(boss.phaseFor||0);
 const special=boss.classId==='caster'&&boss.phase==='charge'&&boss.phaseFor<=.3||
  recovery&&(boss.classId==='gunner'&&elapsed<.45||boss.classId==='sovereign'&&elapsed<.32);
 return {damage:special?3:recovery?2:1,label:special?'ABERTURA · CONTRA-ATAQUE ×3':recovery?'RECUPERAÇÃO · ATIRE! ×2':null};
}
export function stepBossPhase(boss,dt,player={},rng=Math.random){
 boss.age=(boss.age||0)+dt;boss.phaseFor-=dt;
 if(boss.phaseFor>0)return;
 const enraged=boss.hp<=boss.maxHp/2;
 if(boss.phase==='intro'||boss.phase==='recover'){
  boss.phase='charge';boss.phaseFor=boss.telegraph;boss.plannedAttack=planArenaAttack(boss,player,rng);
 }else if(boss.phase==='charge'){
  boss.phase='attack';boss.volleyLeft=(boss.burst||1)+(enraged?1:0);boss.nextAttack=0;boss.phaseFor=Infinity;
 }else if(boss.phase==='attack'){
  boss.phase='recover';boss.phaseFor=boss.recover;
 }
 boss.enraged=enraged;
}
