import {STAGES} from './runner-route-data.mjs?v=859ae4e257bd';
import {bossMechanicFor} from './runner-boss-mechanics.mjs?v=fefc6adba0bd';
import {BOSS_RANKS,bossProfileFor} from './runner-boss-profiles.mjs?v=686945c2001a';
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
 [['army','Patrulha paraguaia'],['janones','Janones · Comando'],['haddad','Taxad · Auditor'],['xandao','Xandão · Fronteira']],
 [['pf','PF · Patrulha'],['joice','Joice · Comando'],['simone','Simone · Orçamento'],['bossonari','Bossonari']],
 [['army','Guarda da Casa Branca'],['boulos','Boulos'],['dino','Dino · Tribunal'],['meme-army','Fantasma do Comunismo']]
];
export function storyBossAt(index){
 if(!Number.isInteger(index)||index<0||index>=STORY_ENCOUNTERS)return null;
 const prior=cast.flat().slice(0,index);
 const stageIndex=Math.floor(index/4),slot=index%4,[type,name]=cast[stageIndex][slot],profile=bossProfileFor(type),classId=profile.classId,group=BOSS_CLASSES[classId];
 return {id:'stage-'+stageIndex+'-boss-'+slot,index,stageIndex,slot,type,name,classId,className:group.name,
  rank:profile.rank,rankName:BOSS_RANKS[profile.rank-1],powerName:profile.powerName,
  rematchIndex:prior.filter(([actor])=>actor===type).length,tactic:profile.tactic,reward:profile.reward,weakness:profile.weakness,hp:18+stageIndex*8+slot*2,
  color:group.color,burst:group.burst,telegraph:Math.max(.58,group.telegraph-stageIndex*.035),
  recover:Math.max(.8,group.recover-stageIndex*.04),interval:Math.max(.68,1.04-slot*.055-stageIndex*.035),
  attackTypes:profile.attackTypes,objective:'Nível '+profile.rank+' · '+profile.powerName+'. '+profile.tactic};
}
export function nextStoryBossDistance(index){
 const b=storyBossAt(index);return b?STORY_OPENING_DISTANCE+b.stageIndex*7000+[1200,2900,4600,6300][b.slot]:Infinity;
}
export function arenaPatternFor(boss,fired=0){
 const pattern=bossMechanicFor(boss,fired),profile=bossProfileFor(boss?.type);
 return pattern?{...pattern,bossMotion:profile.motion}:{type:null,action:'jump',approach:'diagonal'};
}
// Decide once at wind-up. Actors own their rhythm; neither posture nor a random
// roll silently changes the announced tactic into a universal adaptive attack.
export function planArenaAttack(boss,player={},rng=Math.random){
 return arenaPatternFor(boss,Number.isFinite(boss.patternIndex)?boss.patternIndex:Number(boss.fired)||0);
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
 const identity=boss.plannedAttack?.bossMotion||bossProfileFor(boss.type)?.motion;
 const amplitude=({sentinel:18,gunner:24,caster:29,sovereign:34})[boss.classId]||18;
 const arrival=boss.phase==='intro'?Math.max(0,1-age/1.1)**3*150:0;
 const tempo=1+(Number(boss.stageIndex)||0)*.06+(boss.enraged?.16:0);
 const t=age*tempo,release=boss.attackFlashFor>0?Math.sin(boss.attackFlashFor/.26*Math.PI)*7:0;
 const motion=identity?{x:Math.sin(t*identity.xRate)*identity.xAmplitude+release,
  y:76+Math.sin(t*identity.yRate)*identity.yAmplitude}:{
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
  boss.phase='charge';boss.patternIndex=Number.isFinite(boss.patternIndex)?boss.patternIndex+1:0;
  boss.plannedAttack=planArenaAttack(boss,player,rng);
  boss.telegraph=boss.plannedAttack.telegraph??boss.telegraph;boss.recover=boss.plannedAttack.recover??boss.recover;
  boss.phaseFor=boss.telegraph;
 }else if(boss.phase==='charge'){
  boss.phase='attack';boss.volleyLeft=boss.plannedAttack?.burst??boss.burst??1;boss.nextAttack=0;boss.phaseFor=Infinity;
 }else if(boss.phase==='attack'){
  boss.phase='recover';boss.phaseFor=boss.recover;
 }
 boss.enraged=enraged;
}
