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
 pf:['Pule todas as barreiras sem encostar. A blitz abre a guarda ao concluir o bloqueio.','meme-army',[57,.72,8,1.1,0,.12]],
 army:['Desvie de todos os sinalizadores de uma salva. Ataque quando a última chama passar.','xandao',[56,1.02,12,1.8,.8,.26]],
 janones:['Espere a terceira mensagem da rajada. Desvie das três e dispare no intervalo.','pf',[58,1.34,9,2.2,1.2,.32]],
 joice:['Abaixe até a nota alta passar. Ataque quando o microfone ficar mudo.','army',[59,1.11,19,1.6,2,.29]],
 soraya:['Acompanhe a cruz até o chão. Desvie da queda e dispare logo após o pouso.','lula',[52,.59,30,.86,.45,.40]],
 boulos:['Pule a mala quicante até ela passar de vez. A mala alta não abre a guarda.','bossonari',[60,1.58,10,2.7,2.45,.38]],
 haddad:['Escape do carimbo TAXA, inclusive no marcador. Dispare assim que ele baixar.','janones',[58,.91,27,1.44,1.7,.31]],
 simone:['Saia da coluna de orçamento marcada. A brecha vem quando a planilha cai no alvo vazio.','joice',[56,.82,19,1.25,2.8,.34]],
 dino:['Escape do selo em queda. Deixe o impacto baixar antes de atirar.','soraya',[55,.73,25,1.66,.68,.22]],
 xandao:['Salte sobre a martelada. Espere o braço baixar para atacar, sem gastar tiro no mandado.','haddad',[60,.88,19,.98,2.6,.23]],
 lula:['Desvie do L na ida e espere ele voltar ao chefe por cima. Só então contra-ataque.','simone',[59,.95,20,1.4,1.1,.31]],
 dilma:['Desvie quando o vento empurrar a pista. Ataque no instante em que a rajada parar.','dino',[58,.72,29,1.15,1.45,.40]],
 bossonari:['Desvie dos frascos de cloroquina e ivermectina em sequência. Os dois tipos abrem a guarda.','dilma',[61,1.24,17,1.9,2.15,.41]],
 'meme-army':['Saia da assombração marcada ou pule a investida baixa. Atire quando o fantasma recuar.','boulos',[63,1.09,27,.84,2.9,.42]]
};
export const BOSS_PROFILES=Object.freeze(Object.fromEntries(Object.entries(profiles).map(([type,p])=>{
 const [tactic,weakness,[xAmplitude,xRate,yAmplitude,yRate,offset,swerve]]=identity[type];
 return [type,Object.freeze({...p,tactic,weakness,reward:Object.freeze({id:type,name:p.powerName}),
  motion:Object.freeze({id:type,xAmplitude,xRate,yAmplitude,yRate,offset,swerve})})];
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
