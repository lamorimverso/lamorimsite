// The launcher keeps the original IVER shot; victories add the defeated foe's own ability.
const p=(name,projectile,behavior,cooldown,speed,damage,extra={})=>Object.freeze({name,projectile,behavior,cooldown,speed,damage,shots:1,radius:5,cancels:0,...extra});
export const HERO_POWERS=Object.freeze({
 ivermectina:p('Arma IVER','ivermectina-prop','bolt',.28,760,1,{color:'#936bb7',description:'Tiro direto e rápido'}),
 pf:p('Laço da Blitz','handcuffs','return',.52,620,1.4,{cancels:1,color:'#5e94c9',description:'Algemas que voltam e interceptam um ataque'}),
 army:p('Sinalizador explosivo','signal-flare','arc',.65,560,2,{radius:15,cancels:2,color:'#e98c44',description:'Arco explosivo de alcance amplo'}),
 janones:p('Rajada urgente','message','fan',.5,820,.55,{shots:3,spread:.13,color:'#e45e79',description:'Três mensagens em leque'}),
 joice:p('Onda do microfone','microphone','wave',.68,480,1.8,{radius:14,cancels:2,color:'#e4bd58',description:'Onda crescente que intercepta projéteis'}),
 soraya:p('Cruz de paraquedas','parachute-cross','lob',.8,430,2.8,{radius:9,cancels:1,color:'#a68cdb',description:'Cruz em arco alto e queda forte'}),
 boulos:p('Mala quicante','rolling-case','bounce',.72,540,2.3,{radius:10,cancels:1,color:'#aa6c47',description:'Mala com saltos sucessivos'}),
 haddad:p('Recibo perfurante','receipts','pierce',.42,900,1.2,{cancels:3,color:'#e0a55e',description:'Papéis que atravessam três ameaças'}),
 simone:p('Planilha tripla','budget-sheets','stack',.7,620,1,{shots:3,color:'#4cadb8',description:'Três planilhas em faixas paralelas'}),
 dino:p('Selo pesado','court-seal','heavy',.85,460,3.2,{radius:14,cancels:2,color:'#b497d9',description:'Impacto lento e forte do selo'}),
 xandao:p('Martelo orbital','hammer','orbit',.9,520,3,{radius:12,cancels:2,color:'#7394bd',description:'Martelo em espiral com área de impacto'}),
 lula:p('L perseguidor','lhand','homing',.65,540,1.8,{color:'#e65e56',description:'O gesto em L acompanha o alvo'}),
 dilma:p('Vendaval da Dilma','wind','gust',.75,580,1.65,{radius:24,cancels:3,color:'#52bdcc',description:'Rajada de vento que dispersa projéteis'}),
 bossonari:p('Fórmula dupla','ivermectina-prop','double',.55,740,1,{shots:2,projectiles:['cloroquina-prop','ivermectina-prop'],color:'#80ad7e',description:'Dois frascos em trajetórias próximas'}),
 'meme-army':p('Eco do Fantasma','meme-ghost','ghost',1.05,430,2.7,{radius:20,cancels:4,color:'#dd808e',description:'Eco amplo que atravessa ataques'})
});
export const heroPowerFor=run=>HERO_POWERS[run.activePower]||HERO_POWERS.ivermectina;
export function grantBossPower(run,id){
 if(id==='ivermectina'||!HERO_POWERS[id])return false;
 run.ownedPowers??=['ivermectina'];run.powerLevels??={ivermectina:1};
 const isNew=!run.ownedPowers.includes(id);if(isNew)run.ownedPowers.push(id);
 const previous=run.powerLevels[id]||0;run.powerLevels[id]=Math.min(3,previous+1);run.activePower=id;
 run.lastPowerReward={id,name:HERO_POWERS[id].name,level:run.powerLevels[id],isNew,upgraded:run.powerLevels[id]>previous,remaining:5};
 return run.lastPowerReward;
}
export function equipHeroPower(run,id){
 if(run.status!=='running'||!run.ownedPowers?.includes(id)||!HERO_POWERS[id])return false;
 run.activePower=id;if(run.player)run.player.attackHeld=false;return true;
}
export function cycleHeroPower(run){
 const list=run.ownedPowers||['ivermectina'],index=list.indexOf(run.activePower);
 return equipHeroPower(run,list[(index+1)%list.length]);
}
