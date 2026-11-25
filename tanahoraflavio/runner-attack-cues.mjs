
export function projectileStyle(type){
 return ({wind:'wind','budget-sheets':'paper',receipts:'paper','paper-gate':'paper',mandado:'paper',
 hammer:'metal',handcuffs:'metal',barrier:'metal',stamp:'metal','parachute-cross':'fall',
 'meme-ghost':'ghost',lhand:'glide',message:'glide','cloroquina-prop':'metal','ivermectina-prop':'metal'})[type]||'glide';
}
// Uma fonte única para os nomes das armas, a instrução de esquiva e o HUD.
export const ATTACK_NAMES=Object.freeze({
 wind:'Vendaval da Dilma',
 'network-panel':'Painéis em rede','signal-pulse':'Virada de turno','arrow-panel':'Painel de setas',
 'garden-box':'Jardineiras móveis','stage-spotlight':'Holofotes cruzados','rotating-sign':'Placas móveis',
 'debate-card':'Debate em três tempos','baton-wave':'Contratempo da maré','wind-flag':'Bandeiras cruzadas',
 'inspection-gate':'Cancela dupla','crowd-lane':'Corredor da praça','lula-runner':'Corredor do Exército do Lula',
 'ze-gotinha-rival':'Zé Gotinha rival','orla-runner':'Patrulheiro da orla','paulista-runner':'Corredor da Paulista',
 'route-scout':'Batedor da rota','terminal-guard':'Guarda do terminal',
 'budget-sheets':'Planilhas voadoras de Simone',
 'parachute-cross':'Cruzes de paraquedas de Soraya',
 handcuffs:'Algemas da PF / Joice',
 'meme-ghost':'Investida do Fantasma do Comunismo',
 pf:'Agente da PF',army:'Soldado do Exército',janones:'Janones em perseguição',
 boulos:'Boulos em perseguição',dino:'Dino em perseguição',
 receipts:'Recibos TAXA de Haddad','paper-gate':'Papéis TAXA de Haddad',
 stamp:'Carimbo TAXA de Haddad',lhand:'Gestos em L de Lula',
 hammer:'Martelo de Xandão',mandado:'Mandado de Xandão',
 message:'Mensagens urgentes de Janones',barrier:'Barreira da PF',
 'falling-case':'Mala em queda','rolling-case':'Mala rolando',case:'Mala',
 'court-seal':'Selo do tribunal de Dino','signal-flare':'Sinalizador da patrulha','terere-gourd':'Tereré de Santiago Peña','harp-note':'Notas de harpa de Santiago Peña',
 popcorn:'Pipoca','cloroquina-prop':'Cloroquina cenográfica de Bossonari',
 'ivermectina-prop':'Ivermectina cenográfica de Bossonari',
 'pfizer-ampoule':'Ampola cenográfica da Pfizer'
});
export function attackCueFor(attack){
 if(!attack)return null;
 const label=ATTACK_NAMES[attack.type]||'Perigo';
 const action=attack.action==='move'?'move':attack.action==='crouch'?'crouch':'jump';
 const verb=action==='move'?'Saia do alvo':action==='crouch'?'Abaixe':'Pule';
 return {label,action,verb,short:(action==='move'?'↔ ':action==='crouch'?'↓ ':'↑ ')+verb+' · '+label,
  instruction:(attack.approach==='rear'?'Por trás! ':'')+verb+' para escapar de '+label+'.'};
}
