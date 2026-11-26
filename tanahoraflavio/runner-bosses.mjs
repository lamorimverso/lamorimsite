import {STAGES,STORY_STAGES,SCENE_DISTANCE} from './runner-route-data.mjs?v=c4fcfde513ff';
import {bossMechanicFor} from './runner-boss-mechanics.mjs?v=640e2bd41abb';
import {BOSS_RANKS,bossProfileFor} from './runner-boss-profiles.mjs?v=740e8ab135c4';
import {bossFlightPose} from './runner-boss-flight.mjs?v=a2f8750919e6';
import {platformBossPose} from './runner-platform-boss.mjs?v=0d85a5116a16';
// Encontros ficcionais: quatro classes por cenário, sem mudar identidades.

export const STORY_OPENING_DISTANCE=20800;
export const BOSS_ARENA_RESERVE=242;
export const BOSS_RUN_INTERVAL=18;
export const BOSS_CLASSES=Object.freeze({
 sentinel:Object.freeze({name:'Sentinela',color:'#63c4e1',telegraph:.92,recover:1.3,burst:1}),
 gunner:Object.freeze({name:'Artilheiro',color:'#f1b65d',telegraph:.82,recover:1.15,burst:3}),
 caster:Object.freeze({name:'Conjurador',color:'#bc8af0',telegraph:.90,recover:1.2,burst:2}),
 sovereign:Object.freeze({name:'Soberano',color:'#ee7588',telegraph:.76,recover:1.05,burst:3})
});
const historicalCast=[
 [['pf','Blitz da PF'],['janones','Janones'],['haddad','Haddad · Taxad'],['xandao','Xandão']],
 [['army','Patrulha do Rio'],['joice','Joice'],['simone','Simone Tebet'],['lula','Lula']],
 [['pf','PF · Interceptor'],['soraya','Soraya'],['dino','Dino'],['dilma','Dilma']],
 [['army','Patrulha paraguaia'],['janones','Janones · Comando'],['haddad','Taxad · Auditor'],['xandao','Xandão · Fronteira']],
 [['pf','PF · Patrulha'],['joice','Joice · Comando'],['simone','Simone · Orçamento'],['bossonari','Bossonari']],
 [['army','Guarda da Casa Branca'],['boulos','Boulos'],['dino','Dino · Tribunal'],['meme-army','Fantasma do Comunismo']]
];
export function legacyBossAt(index){
 if(!Number.isInteger(index)||index<0||index>=STAGES.length*4)return null;
 const prior=historicalCast.flat().slice(0,index);
 const stageIndex=Math.floor(index/4),slot=index%4,[type,name]=historicalCast[stageIndex][slot],profile=bossProfileFor(type),classId=profile.classId,group=BOSS_CLASSES[classId];
 return {id:'stage-'+stageIndex+'-boss-'+slot,index,stageIndex,slot,type,name,classId,className:group.name,
  rank:profile.rank,rankName:BOSS_RANKS[profile.rank-1],powerName:profile.powerName,
  rematchIndex:prior.filter(([actor])=>actor===type).length,tactic:profile.tactic,reward:profile.reward,weakness:profile.weakness,hp:18+stageIndex*8+slot*2,
  color:group.color,burst:group.burst,telegraph:Math.max(.58,group.telegraph-stageIndex*.035),
  recover:Math.max(.8,group.recover-stageIndex*.04),interval:Math.max(.68,1.04-slot*.055-stageIndex*.035),
  attackTypes:profile.attackTypes,objective:'Nível '+profile.rank+' · '+profile.powerName+'. '+profile.tactic};
}
const mandatory=[
 [['ana-elisa','Ana Elisa'],['xandao','Xandão']],
 [['rick','Rick Azevedo'],['joice','Joice']],
 [['guilherme','Guilherme Cortez'],['erika','Erika Hilton']],
 [['soraya','Soraya'],['dilma','Dilma']],
 [['fiscal','Fiscal da Ponte'],['haddad','Haddad · Taxad']],
 [['boulos','Boulos'],['simone','Simone Tebet']],
 [['dino','Dino'],['meme-army','Fantasma do Comunismo']],
 [['janones','Janones'],['lula','Presidente Lula']]
];
const optional=[
 ['renato-freitas','Renato Freitas',0],['jones','Jones Manoel',0],['maestro','Maestro da Maré',1],
 ['sofia','Sofia Favero',2],['capita','Capitã dos Ventos',3]
];
const encounters=mandatory.flatMap((pair,stageIndex)=>[
 ...(stageIndex===7?[{type:'povo',name:'O Povo Brasileiro',stageIndex,role:'traversal',distance:650}]:[]),
 ...pair.map(([type,name],slot)=>({type,name,stageIndex,slot,role:slot===0?'subboss':stageIndex===7?'final-boss':'map-boss',
 distance:slot===0?(stageIndex===0?1200:2200):5300}))
]);
export const STORY_ENCOUNTERS=encounters.length;
export const STORY_OPTIONAL_IDS=Object.freeze(optional.map(([id])=>id));
function campaignBoss(entry,index=-1){
 const {type,name,stageIndex,role,slot=0,distance}=entry;
 const profile=bossProfileFor(type);
 if(!profile)return null;
 const group=BOSS_CLASSES[profile.classId],traversal=['fiscal','renato-freitas','povo'].includes(type);
 const hp=traversal?1:role==='final-boss'?104:role==='map-boss'?60+stageIndex*6:['rick','guilherme'].includes(type)?64:32+stageIndex*4;
 return {id:role==='optional'?'optional-'+type:'campaign-'+type,index,stageIndex,stageId:STORY_STAGES[stageIndex].id,slot,type,name,role,traversal,distance,
  classId:profile.classId,className:group.name,rank:profile.rank,rankName:BOSS_RANKS[profile.rank-1],
  powerName:profile.powerName,rematchIndex:0,tactic:profile.tactic,reward:profile.reward,weakness:profile.weakness,hp,
  color:group.color,burst:group.burst,telegraph:group.telegraph,recover:group.recover,interval:1.03,
  attackTypes:profile.attackTypes,objective:profile.tactic};
}
export function storyBossAt(index){
 return Number.isInteger(index)&&encounters[index]?campaignBoss(encounters[index],index):null;
}
export function optionalStoryBossAt(id){
 const entry=optional.find(row=>row[0]===id);
 return entry?campaignBoss({type:entry[0],name:entry[1],stageIndex:entry[2],role:'optional',distance:3400}):null;
}
export function storyPracticeBossAt(id){
 if(typeof id!=='string')return null;
 if(id.startsWith('optional-'))return optionalStoryBossAt(id.slice('optional-'.length));
 const index=encounters.findIndex(({type})=>id===type||id==='campaign-'+type);
 return storyBossAt(index)||optionalStoryBossAt(id);
}
export function nextStoryBossDistance(index){
 const b=encounters[index];return Number.isInteger(index)&&b?STORY_OPENING_DISTANCE+b.stageIndex*SCENE_DISTANCE+b.distance:Infinity;
}
export function bossRoleLabel(boss){
 return boss?.type==='povo'?'Ato 2 · Travessia':({subboss:'Subchefe','map-boss':'Chefe da fase','final-boss':'Chefão do jogo',optional:'Desafio opcional'})[boss?.role]||'Chefão';
}
export function arenaPatternFor(boss,fired=0){
 const pattern=bossMechanicFor(boss,fired),profile=bossProfileFor(boss?.type);
 return pattern?{...pattern,bossMotion:profile.motion}:{type:null,action:'jump',approach:'diagonal'};
}
// Decide once at wind-up. Actors own their rhythm; neither posture nor a random
// roll silently changes the announced tactic into a universal adaptive attack.
export function planArenaAttack(boss,player={},rng=Math.random){
 const index=Number.isFinite(boss.patternIndex)?boss.patternIndex:Number(boss.fired)||0;
 if(!boss.combat||boss.traversal||index<2)return arenaPatternFor(boss,index);
 // Shuffle complete authored attacks, never the beats within an announced
 // attack. The first two teach the identity; later cycles vary with the run.
 const phase=boss.hp<=boss.maxHp/2?1:0,size=phase?6:4,cycle=Math.floor((index-2)/size);
 const order=Array.from({length:size},(_,i)=>i);
 let seed=((boss.flightSeed||0)^Math.imul(cycle+1,0x9e3779b9)^Math.imul(phase+1,0x85ebca6b))>>>0;
 for(const char of boss.type||'')seed=(Math.imul(seed,31)+char.charCodeAt(0))>>>0;
 for(let i=size-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[order[i],order[j]]=[order[j],order[i]];}
 return arenaPatternFor(boss,order[(index-2)%size]+size);
}
export function storyApproachAt(distance,index){
 const boss=storyBossAt(index);if(!boss)return null;
 const remaining=nextStoryBossDistance(index)-distance;
 return remaining>=0&&remaining<=1000?{boss,remaining,phase:remaining>400?'rehearsal':'safe'}:null;
}
// A munição pode ficar reservada após a fase de carga. O corpo deve continuar
// preparando-a, e uma segunda reserva nunca pode esconder o disparo em curso.
export function bossPresentationFor(boss,obstacles=[],{continuousCast=false}={}){
 const arenaCast=continuousCast&&boss.combat;
 const pending=obstacles.find(o=>o.bossAttack&&o.projectile&&!o.launched&&
  (o.waitFor>0||arenaCast&&o.storyVolley&&o.owner===boss.type));
 // Cada batida da rajada tem um gesto. A reserva da História é criada um
 // passo antes do lançamento, mesmo com espera zero: não voltar à pose neutra.
 const beatWindup=.32,upcoming=arenaCast&&boss.phase==='attack'&&boss.volleyLeft>0&&boss.nextAttack<beatWindup;
 const volley=boss.volleyPattern||boss.plannedAttack;
 const beat=upcoming&&volley?.burstMode==='sequence'?volley.sequence?.[(volley.burst||1)-boss.volleyLeft]:null;
 const endlessCue=!boss.combat&&boss.nextAttack<.55&&boss.fired<boss.total;
 const attacking=boss.attackFlashFor>0,preparing=!attacking&&(boss.phase==='charge'||!!pending||upcoming||endlessCue);
 const recovering=!attacking&&!preparing&&boss.phase==='recover';
 const progress=attacking?1-boss.attackFlashFor/.26:preparing?
  boss.phase==='charge'?1-boss.phaseFor/boss.telegraph:pending?1-(pending.waitFor||0)/.82:
   upcoming?1-boss.nextAttack/beatWindup:1-boss.nextAttack/.55:
  recovering?1-boss.phaseFor/boss.recover:0;
 return {attacking,preparing,recovering,progress:Math.max(0,Math.min(1,progress||0)),
  action:attacking||recovering?boss.lastReleasedAction||boss.lastAction||'jump':pending?.action||beat?.action||boss.plannedAttack?.action||'jump'};
}
export function bossArenaPose(boss,width=900){
 if(boss.platformer)return platformBossPose(boss,width);
 if(boss.reducedMotion)return {x:width-94,platformY:68};
 const age=Number(boss.age)||0;
 const identity=boss.plannedAttack?.bossMotion||bossProfileFor(boss.type)?.motion;
 const amplitude=({sentinel:18,gunner:24,caster:29,sovereign:34})[boss.classId]||18;
 const arrival=boss.phase==='intro'?Math.max(0,1-age/1.1)**3*150:0;
 const tempo=1+(Number(boss.stageIndex)||0)*.06+(boss.enraged?.16:0);
 const t=age*tempo,release=boss.attackFlashFor>0?Math.sin(boss.attackFlashFor/.26*Math.PI)*7:0;
 if(boss.combat&&identity){
  if(!boss.traversal)return bossFlightPose(boss,width,identity);
  // These routes occupy the right corridor, leaving a fixed safe run-up at
  // the same proportional screen position even when a mobile device rotates.
  const time=(boss.motionClock??t)+identity.offset;
  const orbit=time*identity.xRate,side=Math.sin(orbit)+identity.swerve*Math.sin(orbit*2+.55);
  const height=time*identity.yRate;
  return {x:width-123+identity.xAmplitude*side/(1+identity.swerve)+arrival,
   platformY:69+identity.yAmplitude*Math.sin(height)*(.84+.16*Math.cos(orbit))};
 }
 const motion=identity?{x:Math.sin(t*identity.xRate)*Math.min(identity.xAmplitude*.52,32)+release,
  y:76+Math.sin(t*identity.yRate)*identity.yAmplitude*.72}:{
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
 if(boss.combat){
  const counter=boss.earnedCounter;
  const opened=recovery&&counter&&elapsed+1e-8>=counter.delay&&elapsed<counter.delay+counter.window;
  return {damage:opened?counter.damage:recovery?1:.66,label:opened?counter.label:null};
 }
 const special=boss.classId==='caster'&&boss.phase==='charge'&&boss.phaseFor<=.3||
  recovery&&(boss.classId==='gunner'&&elapsed<.45||boss.classId==='sovereign'&&elapsed<.32);
 return {damage:special?3:recovery?2:1,label:special?'ABERTURA · CONTRA-ATAQUE ×3':recovery?'RECUPERAÇÃO · ATIRE! ×2':null};
}
export function stepBossPhase(boss,dt,player={},rng=Math.random){
 boss.age=(boss.age||0)+dt;boss.phaseFor-=dt;
 boss.motionClock=(boss.motionClock||0)+dt*(1+(Number(boss.stageIndex)||0)*.09+(boss.enraged?.28:0));
 if(boss.phaseFor>0)return;
 const enraged=boss.hp<=boss.maxHp/2;
 if(boss.phase==='intro'||boss.phase==='recover'){
  boss.phase='charge';boss.earnedCounter=null;boss.patternIndex=Number.isFinite(boss.patternIndex)?boss.patternIndex+1:0;
  boss.plannedAttack=planArenaAttack(boss,player,rng);
  boss.telegraph=boss.plannedAttack.telegraph??boss.telegraph;boss.recover=boss.plannedAttack.recover??boss.recover;
  boss.phaseFor=boss.telegraph;
 }else if(boss.phase==='charge'){
  boss.phase='attack';boss.volleyShots=[];boss.volleyLeft=boss.plannedAttack?.burst??boss.burst??1;boss.nextAttack=0;boss.phaseFor=Infinity;
 }else if(boss.phase==='attack'){
  boss.phase='recover';boss.phaseFor=boss.recover;
 }
 boss.enraged=enraged;
}
