import {foeFor} from './runner-difficulty.mjs?v=9c65e484cb70';
import {bossProfileFor,bossWeaponFor} from './runner-boss-profiles.mjs?v=740e8ab135c4';

export const BOSS_ROSTER = Object.freeze(['haddad','lula','xandao','janones','pf']);
const BOSS_GOALS = Object.freeze({
 haddad:{attacks:9,goalKind:'papers'},
 lula:{attacks:10,goalKind:'patterns'},
 xandao:{attacks:12,goalKind:'hammer-mandado'},janones:{attacks:9,goalKind:'urgent'},pf:{attacks:8,goalKind:'blitz'},
 army:{attacks:8,goalKind:'flares'},bossonari:{attacks:14,goalKind:'phantoms'}
});
export function bossAtRound(round,type) {
 const safe=Math.max(0,Math.floor(Number.isFinite(round)?round:0)),level=Math.floor(safe/BOSS_ROSTER.length)+1;
 const foe=foeFor(type||BOSS_ROSTER[safe%BOSS_ROSTER.length]),goal=BOSS_GOALS[foe.type],attacks=goal.attacks+(foe.type==='bossonari'?0:2*Math.min(2,level-1));
 const noun=({haddad:'papéis',lula:'gestos em L',xandao:'martelos e mandados',janones:'mensagens em três blocos',pf:'bloqueios da blitz',bossonari:'frascos cenográficos',army:'sinalizadores'})[foe.type];
 return {foe,level,supreme:foe.type==='lula',round:safe+1,goalKind:goal.goalKind,attacks,
  objective:'Desvie de '+attacks+' '+noun+'. '+({
    haddad:'Pule os papéis baixos e abaixe dos recibos altos.',
    lula:'Observe os gestos em L: pule os baixos e abaixe dos altos.',
    xandao:'Pule os martelos baixos e abaixe dos mandados altos.',
    janones:'Mensagens urgentes: alterne salto e agachamento.',
    pf:'Blitz: pule barreiras, abaixe das algemas e saia dos alvos marcados.',
    army:'Pule ou abaixe dos sinalizadores e leia o aviso da patrulha.',bossonari:'Pule ou abaixe dos frascos cenográficos de Bossonari.'
   }[foe.type]||'Leia o próximo aviso antes de reagir.'),
  interval:foe.type==='bossonari'?1.18:Math.max(1.04,1.32-.08*BOSS_ROSTER.indexOf(foe.type)-.04*(level-1))};
}
// Padrões próprios incluem repetições; o aviso sempre consulta esta mesma fonte.
export function bossAttackFor(type,fired,round=0) {
 const patterns={haddad:['crouch','jump','jump','crouch','crouch','jump','crouch','jump','jump'],
  lula:['jump','crouch','jump','jump','crouch','crouch','jump','crouch','jump','crouch'],
  xandao:['jump','jump','crouch','jump','crouch','crouch','jump','crouch','jump','crouch','crouch','jump'],
  janones:['jump','crouch','jump','crouch','jump','crouch','jump','jump','crouch'],pf:['jump','crouch','move','jump','crouch','move','jump','crouch'],
  bossonari:['jump','crouch','jump','crouch','jump','jump','crouch','jump','crouch','jump','crouch','jump','crouch','jump']};
 const sequence=patterns[type]||bossProfileFor(type)?.sequence||patterns.haddad,index=Math.max(0,Math.floor(Number(fired)||0))+2*Math.floor(Math.max(0,round)/BOSS_ROSTER.length);
 const action=sequence[index%sequence.length];
 return {type:bossWeaponFor(type,index,action)||'receipts',action};
}
// Primeiro marco após21km; cada vitória reserva mais7km de corrida.
// Um marco alcançado fica pendente enquanto houver evento ou cooldown.
export function nextBossDistance(count){return 22000+count*7000;}
export function takeBoss(run){
 // O bag explícito mantém a seleção determinística usada por integrações/testes.
 while(run.bossBag.length){const type=run.bossBag.pop();if(type!=='bossonari'&&BOSS_GOALS[type])return type;}
 return BOSS_ROSTER[run.bossesDefeated%BOSS_ROSTER.length];
}
// Extra duel pressure is separate from physical contact, authored sequences,
// and the counter reward. Assisted play and non-combat crossings keep the
// original balance, as does the introductory Ana Elisa duel. Later stages
// require more consistent execution without a tutorial progression regression.
export function storyDuelChallenge(encounter,assisted=false){
 if(!encounter||encounter.traversal||assisted||encounter.type==='ana-elisa')return {hpScale:1,pressure:0};
 const stage=Math.max(0,Math.min(7,Number(encounter.stageIndex)||0));
 const final=encounter.role==='final-boss';
 return {hpScale:1.10+stage*.016+(final?.04:0),pressure:.065+stage*.012+(final?.02:0)};
}
export function applyStoryDuelTempo(boss){
 if(!boss.combat||boss.traversal||!(boss.challengePressure>0)||boss.patternIndex<2)return;
 const pressure=Math.min(.20,boss.challengePressure+(boss.hp<=boss.maxHp/2?.04:0));
 // Never take away a signature counter window or the minimum authored tell.
 // Contact timings, volley gaps and safety reservations remain untouched.
 const shorten=(value,floor)=>Math.min(value,Math.max(floor,value*(1-pressure)));
 boss.telegraph=shorten(boss.telegraph,.62);
 boss.phaseFor=boss.telegraph;
 if(!boss.plannedAttack?.counter)boss.recover=shorten(boss.recover,.62);
}
