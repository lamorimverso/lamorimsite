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
 'meme-army':profile(4,'sovereign','Investidas do Fantasma',['meme-ghost'],['crouch','move','jump','move','jump','crouch']),
 'ana-elisa':profile(2,'gunner','Rede de painéis',['network-panel'],['move','move','move','crouch'],'network'),
 rick:profile(2,'gunner','Seis pulsos e uma pausa',['signal-pulse'],['jump','crouch','jump','crouch','jump','crouch'],'pulse'),
 sofia:profile(2,'gunner','Painel de setas',['arrow-panel'],['jump','crouch','move'],'arrows'),
 guilherme:profile(2,'gunner','Jardineiras alternadas',['garden-box'],['jump','crouch','jump','move'],'rolling'),
 erika:profile(3,'caster','Refletores cruzados',['stage-spotlight'],['move','move','crouch','jump'],'lights'),
 'renato-freitas':profile(3,'caster','Placas giratórias',['rotating-sign'],['jump','crouch','move'],'rotation'),
 jones:profile(3,'caster','Debate em dois sentidos',['debate-card'],['crouch','jump','move'],'debate'),
 maestro:profile(3,'caster','Fintas de batuta',['baton-wave'],['jump','crouch','jump'],'music'),
 capita:profile(3,'caster','Bandeiras de vento',['wind-flag'],['crouch','jump','crouch'],'wind'),
 fiscal:profile(1,'sentinel','Sequência de cancelas',['inspection-gate'],['move','jump','move'],'traversal'),
 povo:profile(1,'sentinel','Corredor da praça',['crowd-lane'],['move','move','move'],'traversal')
});
// Motion numbers describe each actor's arena path, independent of location.
const identity={
 pf:['Pule todas as barreiras sem encostar. A blitz abre a guarda ao concluir o bloqueio.','meme-army',[57,.72,8,1.1,0,.12]],
 army:['Desvie da salva de sinalizadores. Uma salva limpa reforça o próximo projétil que você devolver.','xandao',[56,1.02,12,1.8,.8,.26]],
 janones:['Desvie das três mensagens da rajada. O intervalo reforça a próxima mensagem que você devolver.','pf',[58,1.34,9,2.2,1.2,.32]],
 joice:['Abaixe até a nota alta passar. O silêncio reforça sua próxima devolução.','army',[59,1.11,19,1.6,2,.29]],
 soraya:['Desvie da cruz até o pouso. Uma queda evitada reforça a próxima cruz que você devolver.','lula',[52,.59,30,.86,.45,.40]],
 boulos:['Pule a mala quicante até ela passar de vez. Só a mala baixa evitada reforça sua próxima devolução.','bossonari',[60,1.58,10,2.7,2.45,.38]],
 haddad:['Escape do carimbo TAXA, inclusive no marcador. O carimbo evitado reforça o próximo projétil devolvido.','janones',[58,.91,27,1.44,1.7,.31]],
 simone:['Saia da coluna de orçamento marcada. O alvo vazio reforça sua próxima devolução.','joice',[56,.82,19,1.25,2.8,.34]],
 dino:['Escape do selo em queda. O impacto evitado reforça o próximo selo que você devolver.','soraya',[55,.73,25,1.66,.68,.22]],
 xandao:['Salte sobre a martelada. O braço baixo reforça o próximo martelo ou mandado que você devolver.','haddad',[60,.88,19,.98,2.6,.23]],
 lula:['Desvie do L na ida. O retorno ao chefe reforça o próximo L que você devolver.','simone',[59,.95,20,1.4,1.1,.31]],
 dilma:['Desvie enquanto o vento empurra a pista. A calmaria reforça a próxima rajada que você devolver.','dino',[58,.72,29,1.15,1.45,.40]],
 bossonari:['Desvie dos frascos de cloroquina e ivermectina em sequência. Os dois tipos abrem a guarda.','dilma',[61,1.24,17,1.9,2.15,.41]],
 'meme-army':['Saia da marca ou pule a investida baixa. O recuo reforça o próximo projétil devolvido.','boulos',[63,1.09,27,.84,2.9,.42]],
 'ana-elisa':['Saia das marcas no chão e pule os painéis baixos. Na pausa da rede, o próximo painel devolvido ganha força.','pf',[60,.76,24,1.65,1.4,.27]],
 rick:['Desvie dos seis pulsos alternados. O sétimo tempo é uma pausa que reforça o próximo pulso devolvido.','xandao',[58,1.27,8,2.9,.73,.41]],
 sofia:['Siga as setas: pule, abaixe e saia da marca. A sequência reforça o próximo painel devolvido.','rick',[52,1.12,21,1.16,1.92,.3]],
 guilherme:['Pule as jardineiras que quicam e abaixe sob as altas. Uma sequência limpa reforça a próxima devolução.','joice',[62,1.48,12,2.3,2.4,.38]],
 erika:['Saia das áreas marcadas e abaixe sob os refletores altos. A pausa no escuro reforça a próxima devolução.','guilherme',[62,.66,29,.97,1.1,.47]],
 'renato-freitas':['Acompanhe o giro das placas. Desvie da baixa e da alta e saia da marca quando a placa cair.',null,[56,1.16,23,1.51,.6,.43]],
 jones:['Desvie das cartas nos dois sentidos. A inversão reforça a próxima devolução.','dino',[57,1.24,27,1.38,1.82,.39]],
 maestro:['Não salte na primeira finta. Desvie no ritmo da batuta para reforçar sua próxima devolução.','simone',[52,1.47,26,.94,.97,.48]],
 capita:['Desvie dos três sinais de vento. As bandeiras baixas reforçam a próxima devolução.','dilma',[62,.8,24,2.12,2.52,.36]],
 fiscal:['Leia a sinalização e passe pelas cancelas sem atirar. A passagem abre depois da sequência.',null,[53,.71,10,1.38,.31,.3]],
 povo:['Ceda passagem na praça. Saia das áreas marcadas e atravesse sem usar a arma.',null,[46,.52,6,.81,1.5,.2]]
};
export const BOSS_PROFILES=Object.freeze(Object.fromEntries(Object.entries(profiles).map(([type,p])=>{
 const [tactic,weakness,[xAmplitude,xRate,yAmplitude,yRate,offset,swerve]]=identity[type];
 return [type,Object.freeze({...p,tactic,weakness,reward:p.style==='traversal'||type==='renato-freitas'?null:Object.freeze({id:type,name:p.powerName}),
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
