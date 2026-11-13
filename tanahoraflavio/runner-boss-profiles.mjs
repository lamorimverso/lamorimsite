// Fictional GAME hierarchy. Class and powers belong to a character, never a location slot.
const profile=(rank,classId,powerName,attackTypes,sequence,style='mixed')=>Object.freeze({rank,classId,powerName,attackTypes:Object.freeze(attackTypes),sequence:Object.freeze(sequence),style});
export const BOSS_RANKS=Object.freeze(['Patrulha','Líder','Comandante','Governante']);
export const BOSS_PROFILES=Object.freeze({
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
 santiago:profile(4,'sovereign','Tereré e notas de harpa',['terere-gourd','harp-note'],['jump','crouch','move','jump','move','crouch'],'arc'),
 bossonari:profile(4,'sovereign','Frascos cenográficos',['cloroquina-prop','ivermectina-prop'],['jump','crouch','jump','jump','crouch','move']),
 'meme-army':profile(4,'sovereign','Investidas do Fantasma',['meme-ghost'],['crouch','move','jump','move','jump','crouch'])
});
export const bossProfileFor=type=>BOSS_PROFILES[type]||null;
export function bossWeaponFor(type,fired=0,action='jump'){
 const p=bossProfileFor(type);if(!p)return null;
 if(type==='haddad'&&fired<3)return 'receipts';
 if(type==='pf')return action==='jump'?'barrier':'handcuffs';
 if(type==='xandao')return action==='jump'?'hammer':'mandado';
 if(type==='boulos')return action==='move'?'falling-case':'rolling-case';
 return p.attackTypes[Math.max(0,Math.floor(Number(fired)||0))%p.attackTypes.length];
}
