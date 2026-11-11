// Encontros ficcionais: quatro classes por cenário, sem mudar identidades.
export const STORY_ENCOUNTERS=20;
export const STORY_OPENING_DISTANCE=20800;
export const BOSS_CLASSES=Object.freeze({
 sentinel:Object.freeze({name:'Sentinela',color:'#63c4e1',telegraph:.92,recover:1.3,burst:1}),
 gunner:Object.freeze({name:'Artilheiro',color:'#f1b65d',telegraph:.82,recover:1.15,burst:3}),
 caster:Object.freeze({name:'Conjurador',color:'#bc8af0',telegraph:.90,recover:1.2,burst:2}),
 sovereign:Object.freeze({name:'Soberano',color:'#ee7588',telegraph:.76,recover:1.05,burst:3})
});
const ranks=['Patrulha','Tático','Elite','Chefe de cenário'];
const cast=[
 [['haddad','Haddad · Taxad'],['janones','Janones'],['pf','Blitz da PF'],['xandao','Xandão']],
 [['dilma','Dilma'],['soraya','Soraya'],['boulos','Boulos'],['lula','Lula']],
 [['dino','Dino'],['janones','Janones · Comando'],['simone','Simone Tebet'],['haddad','Taxad · Auditor Supremo']],
 [['joice','Joice'],['pf','PF · Interceptor'],['soraya','Soraya · Guarda Aérea'],['bossonari','Bossonari']],
 [['lula','Lula · Soberano'],['xandao','Xandão · Fortaleza'],['bossonari','Bossonari · Arauto'],['meme-army','Fantasma do Comunismo']]
];
const classes=Object.keys(BOSS_CLASSES);
const attacks={
 haddad:['receipts','stamp'],janones:['message','message'],pf:['barrier','handcuffs'],xandao:['hammer','mandado'],
 dilma:['wind','wind'],soraya:['parachute-cross','parachute-cross'],boulos:['rolling-case','falling-case'],lula:['lhand','lhand'],
 dino:['mandado','hammer'],simone:['budget-sheets','budget-sheets'],joice:['handcuffs','microphone'],
 bossonari:['cloroquina-prop','ivermectina-prop'],'meme-army':['meme-ghost','meme-ghost']
};
export function storyBossAt(index){
 if(!Number.isInteger(index)||index<0||index>=STORY_ENCOUNTERS)return null;
 const stageIndex=Math.floor(index/4),slot=index%4,[type,name]=cast[stageIndex][slot],classId=classes[slot],group=BOSS_CLASSES[classId];
 return {id:'stage-'+stageIndex+'-boss-'+slot,index,stageIndex,slot,type,name,classId,className:group.name,
  rank:slot+1,rankName:ranks[slot],hp:18+stageIndex*8+slot*2,
  color:group.color,burst:group.burst,telegraph:Math.max(.58,group.telegraph-stageIndex*.035),
  recover:Math.max(.8,group.recover-stageIndex*.04),interval:Math.max(.68,1.04-slot*.055-stageIndex*.035),
  attackTypes:attacks[type],objective:'Derrote '+name+' com disparos. Desvie e aproveite a recuperação.'};
}
export function nextStoryBossDistance(index){
 const b=storyBossAt(index);return b?STORY_OPENING_DISTANCE+b.stageIndex*7000+[1200,2900,4600,6300][b.slot]:Infinity;
}
export function arenaPatternFor(boss,fired=0){
 const types=boss.attackTypes||attacks[boss.type]||attacks.haddad;
 const phase=boss.hp<=boss.maxHp/2?2:1;
 // Cada classe ensina uma leitura própria antes de combinar respostas.
 const sequences={sentinel:['jump','jump','crouch'],gunner:['jump','jump','jump','crouch','crouch','crouch'],
  caster:['jump','crouch','jump','move','crouch','move'],sovereign:['jump','crouch','jump','move','jump','crouch','move','jump']};
 const sequence=sequences[boss.classId]||sequences.sentinel;
 const action=sequence[fired%sequence.length];
 const type=types[fired%types.length];
 if(action==='move')return {type:'falling-case',action,approach:'vertical'};
 const entry=action==='jump'&&fired%3===1?'drop':action==='crouch'&&phase===2?'sweep':'diagonal';
 return {type,action,approach:entry};
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
 return {x:width-94+Math.sin(age*.85)*amplitude+arrival,platformY:68+Math.sin(age*1.3)*10};
}
export function stepBossPhase(boss,dt){
 boss.age=(boss.age||0)+dt;boss.phaseFor-=dt;
 if(boss.phaseFor>0)return;
 const enraged=boss.hp<=boss.maxHp/2;
 if(boss.phase==='intro'||boss.phase==='recover'){
  boss.phase='charge';boss.phaseFor=boss.telegraph;boss.plannedAttack=arenaPatternFor(boss,boss.fired);
 }else if(boss.phase==='charge'){
  boss.phase='attack';boss.volleyLeft=(boss.burst||1)+(enraged?1:0);boss.nextAttack=0;boss.phaseFor=Infinity;
 }else if(boss.phase==='attack'){
  boss.phase='recover';boss.phaseFor=boss.recover;
 }
 boss.enraged=enraged;
}
