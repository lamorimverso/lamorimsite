// Fictional GAME hierarchy. Class and powers belong to a character, never a location slot.
const profile=(rank,classId,powerName,attackTypes,sequence,style='mixed')=>Object.freeze({rank,classId,powerName,attackTypes:Object.freeze(attackTypes),sequence:Object.freeze(sequence),style});
export const BOSS_RANKS=Object.freeze(['Patrulha','Líder','Comandante','Governante']);
const profiles=Object.freeze({
 pf:profile(1,'sentinel','Blitz e algemas',['barrier','handcuffs'],['jump','crouch','move','jump','crouch']),
 army:profile(1,'sentinel','Sinalizadores',['signal-flare'],['jump','jump','crouch','jump']),
 janones:profile(2,'gunner','Rajada de mensagens',['message'],['jump','crouch','jump','jump','crouch']),
 joice:profile(2,'gunner','Ondas do microfone',['microphone'],['crouch','crouch','jump','move']),
 soraya:profile(2,'gunner','Cruzes com paraquedas',['parachute-cross'],['jump','crouch','move','crouch'],'drop'),
 boulos:profile(2,'gunner','Malas rolantes e em queda',['rolling-case','falling-case'],['jump','jump','crouch','move'],'rolling'),
 haddad:profile(3,'caster','Recibos e carimbos TAXA',['receipts','stamp'],['crouch','jump','jump','move','crouch']),
 simone:profile(3,'caster','Planilhas de orçamento',['budget-sheets'],['jump','crouch','move','jump','move','crouch']),
 dino:profile(3,'caster','Selos do tribunal',['court-seal'],['crouch','move','jump','crouch','jump','move']),
 xandao:profile(4,'sovereign','Martelos e mandados',['hammer','mandado'],['jump','jump','crouch','move','jump']),
 lula:profile(4,'sovereign','Gestos em L',['lhand'],['jump','crouch','jump','move','crouch']),
 dilma:profile(4,'sovereign','Vendavais',['wind'],['crouch','jump','move','jump','crouch']),
 bossonari:profile(4,'sovereign','Frascos cenográficos',['cloroquina-prop','ivermectina-prop'],['jump','crouch','jump','jump','crouch','move']),
 'meme-army':profile(4,'sovereign','Investidas do Fantasma',['meme-ghost'],['crouch','move','jump','move','jump','crouch'])
});
// Motion numbers describe each actor's arena path, independent of location.
const identity={
 pf:['Pule a barreira, abaixe sob as algemas e saia do marcador antes da queda.','meme-army',[18,.65,6,1.1]],
 army:['Leia o sinalizador: pule a salva baixa, abaixe na alta e avance na pausa.','xandao',[20,1.05,7,1.8]],
 janones:['Espere a terceira mensagem da rajada e atire durante a pausa longa.','pf',[24,1.4,8,2.2]],
 joice:['Abaixe nas notas altas, pule as ondas baixas e atire entre os refrões.','army',[26,1.1,12,1.6]],
 soraya:['Observe a cruz descendo: saia do marcador e ataque após o pouso.','lula',[21,.55,19,.85]],
 boulos:['Pule a mala rasteira, abaixe na alta e abandone o marcador da mala em queda.','bossonari',[29,1.65,8,2.8]],
 haddad:['Abaixe nos recibos, pule os carimbos e saia da coluna TAXA antes do impacto.','janones',[29,.9,22,1.45]],
 simone:['Leia as linhas: pule a baixa, abaixe na alta e saia da coluna marcada.','joice',[23,.8,15,1.25]],
 dino:['Saia do selo marcado; o carimbo lento deixa uma abertura longa para atirar.','soraya',[20,.7,18,1.7]],
 xandao:['Pule o martelo baixo, abaixe nos mandados e contra-ataque após a martelada.','haddad',[34,.8,16,.95]],
 lula:['Desvie do L na ida: ele retorna para o chefe; atire depois da volta.','simone',[30,.95,14,1.4]],
 dilma:['Leia a onda do vento e avance contra a rajada anunciada; atire na calmaria.','dino',[31,.7,20,1.15]],
 bossonari:['Pule os frascos baixos, abaixe na rajada alta e saia do marcador de queda.','dilma',[25,1.25,13,1.9]],
 'meme-army':['Saia da assombração marcada, pule a investida baixa e atire quando o fantasma recuar.','boulos',[32,1.15,21,.8]]
};
export const BOSS_PROFILES=Object.freeze(Object.fromEntries(Object.entries(profiles).map(([type,p])=>{
 const [tactic,weakness,[xAmplitude,xRate,yAmplitude,yRate]]=identity[type];
 return [type,Object.freeze({...p,tactic,weakness,reward:Object.freeze({id:type,name:p.powerName}),
  motion:Object.freeze({id:type,xAmplitude,xRate,yAmplitude,yRate})})];
})));
export const bossProfileFor=type=>BOSS_PROFILES[type]||null;
export function bossWeaponFor(type,fired=0,action='jump'){
 const p=bossProfileFor(type);if(!p)return null;
 if(type==='haddad'&&fired<3)return 'receipts';
 if(type==='pf')return action==='jump'?'barrier':'handcuffs';
 if(type==='xandao')return action==='jump'?'hammer':'mandado';
 if(type==='boulos')return action==='move'?'falling-case':'rolling-case';
 return p.attackTypes[Math.max(0,Math.floor(Number(fired)||0))%p.attackTypes.length];
}
