// First-party, non-vocal signatures. Tuples are [wave, delay, start Hz, end Hz,
// length, gain, optional attack]. No recording, sampled instrument or RNG.
const s='sine',t='triangle',q='square',z='sawtooth';
const bank=(id,takes)=>Object.freeze({id,variants:Object.freeze(takes.map(take=>Object.freeze(take.map(([wave,delay,start,end,length,volume,attack=.006])=>
 Object.freeze({wave,delay,start,end,length,volume,attack})))))});
const author=(id,weapon,entrance,windup,launch,after,passage=false)=>Object.freeze({weapon,
 entrance:bank('presence-'+id,[entrance]),windup:bank('windup-'+id,[windup]),launch:bank('release-'+id,launch),
 after:bank((passage?'blocked-':'impact-')+id,[after]),passage});
const design={
 // Rede: negociação digital, pacotes curtos e relé apagando.
 'ana-elisa':author('ana-elisa','network-panel',[[q,0,510,510,.035,.024],[s,.058,765,765,.044,.032],[s,.125,1020,1020,.06,.029]],
  [[q,0,1020,1020,.033,.041],[s,.085,1530,1530,.075,.056]],[
   [[q,0,1640,820,.034,.04],[s,.054,1220,1220,.053,.052]],
   [[q,0,1830,915,.028,.04],[q,.043,915,610,.04,.033]],
   [[s,0,1190,1785,.06,.055],[q,.09,1785,595,.034,.043]]],[[q,0,870,360,.04,.041],[t,.027,390,85,.104,.078]]),
 // Rick: eletrônica seca. Uma saída = um pulso, sem preencher o intervalo.
 rick:author('rick','signal-pulse',[[t,0,192,96,.08,.035],[q,.115,388,388,.055,.023]],
  [[t,0,255,255,.045,.07],[t,.105,255,510,.083,.066]],[
   [[q,0,320,320,.09,.042],[t,.065,180,90,.075,.06]],
   [[q,0,710,710,.065,.042],[t,.045,300,150,.084,.053]],
   [[q,0,490,490,.085,.043],[t,.07,220,75,.068,.065]]],[[q,0,244,122,.071,.042],[t,.018,110,46,.147,.08]]),
 // Sofia: a chave de detentes do painel, seguida por corte de obturador.
 sofia:author('sofia','arrow-panel',[[t,0,350,700,.076,.033],[s,.104,1050,1400,.07,.024]],
  [[t,0,376,940,.092,.057],[q,.112,940,470,.037,.032]],[
   [[t,0,450,1140,.083,.062],[q,.09,1390,620,.026,.034]],
   [[s,0,1090,420,.09,.069],[q,.093,650,405,.029,.035]],
   [[t,0,620,1100,.054,.048],[t,.061,1100,620,.059,.052],[q,.131,960,480,.027,.037]]],[[z,0,1050,470,.037,.033],[t,.041,520,135,.076,.072]]),
 // Cortez: cerâmica oca ao sair, terra e barro no contato.
 guilherme:author('guilherme','garden-box',[[t,0,305,142,.08,.035],[s,.12,449,224,.066,.027]],
  [[t,0,340,190,.069,.069],[z,.099,245,490,.089,.025,.018]],[
   [[t,0,440,178,.066,.081],[s,.018,867,452,.05,.042]],
   [[s,0,684,243,.097,.079],[t,.021,373,151,.07,.043]],
   [[t,0,288,113,.094,.078],[s,.016,593,311,.062,.046]]],[[t,0,217,50,.145,.098],[z,.012,725,255,.046,.033]]),
 // Érika: relé de lâmpada, acendimento curto do feixe, desligamento seco.
 erika:author('erika','stage-spotlight',[[s,0,420,1130,.139,.024,.052],[t,.122,1350,1800,.079,.031,.013]],
  [[q,0,1500,680,.024,.035],[s,.033,380,1280,.18,.058,.085]],[
   [[q,0,2050,880,.022,.034],[s,.02,720,1840,.142,.067,.039]],
   [[q,0,1800,740,.026,.035],[t,.03,1350,540,.135,.056,.035]],
   [[s,0,580,1540,.105,.07,.04],[s,.076,1150,1840,.124,.044,.03]]],[[t,0,1120,190,.101,.064],[q,.016,1690,475,.024,.029]]),
 // Placa giratória: catraca, metal em giro e trava (sem efeito de ferimento).
 'renato-freitas':author('renato-freitas','rotating-sign',[[q,0,690,345,.044,.022],[q,.067,840,420,.038,.021],[t,.139,330,180,.07,.032]],
  [[q,0,960,480,.026,.033],[q,.045,800,400,.027,.033],[t,.086,500,1160,.09,.054,.018]],[
   [[z,0,780,340,.082,.031,.014],[t,.03,1160,520,.105,.06]],
   [[q,0,1220,305,.045,.031],[t,.065,840,420,.077,.061]],
   [[t,0,540,1020,.061,.053],[z,.05,670,305,.105,.028,.025]]],[[q,0,1270,395,.032,.038],[t,.035,410,150,.082,.067]],true),
 // Debate: cartas de papel e respostas em dois registros, sem voz.
 jones:author('jones','debate-card',[[z,0,720,235,.038,.023],[t,.056,276,128,.061,.034],[t,.15,384,190,.059,.033]],
  [[t,0,315,140,.055,.058],[z,.082,2050,850,.065,.03,.015]],[
   [[z,0,1780,660,.071,.033,.015],[t,.029,360,173,.058,.057]],
   [[q,0,1250,810,.033,.028],[z,.041,1450,510,.079,.035,.013]],
   [[z,0,912,340,.066,.031],[t,.07,477,200,.073,.062]]],[[z,0,1410,500,.044,.03],[t,.03,175,70,.086,.076]]),
 // Batuta: madeira e intervalo curto, sem introduzir música nova ou falsos pulsos.
 maestro:author('maestro','baton-wave',[[t,0,392,395,.063,.026],[t,.082,587,589,.073,.031],[s,.17,784,780,.081,.029]],
  [[t,0,522,388,.043,.058],[t,.09,648,495,.041,.063]],[
   [[t,0,784,750,.096,.06],[s,.037,1175,1130,.11,.04,.015]],
   [[t,0,587,561,.102,.06],[s,.025,880,835,.094,.047,.009]],
   [[t,0,659,623,.102,.06],[s,.026,880,847,.079,.044],[s,.084,1319,1260,.083,.038]]],[[t,0,585,220,.058,.074],[s,.031,293,166,.086,.061]]),
 // Bandeira: rajada suave sob uma batida curta que representa o tecido.
 capita:author('capita','wind-flag',[[t,0,220,410,.121,.03,.041],[z,.107,870,570,.044,.019]],
  [[s,0,270,625,.16,.071,.037],[z,.12,760,410,.042,.028,.009]],[
   [[t,0,315,740,.15,.056,.028],[z,.068,930,405,.07,.033,.017]],
   [[z,0,660,460,.06,.029,.02],[s,.035,460,820,.13,.068,.038]],
   [[t,0,230,590,.164,.054,.031],[z,.044,840,580,.052,.031],[z,.128,870,530,.04,.023]]],[[z,0,950,295,.073,.029,.01],[t,.022,360,112,.113,.074]]),
 // Cancela: trava da ponte e motor curto. Bloqueio não é dano.
 fiscal:author('fiscal','inspection-gate',[[t,0,165,80,.081,.033],[q,.101,410,205,.045,.023]],
  [[q,0,470,235,.05,.038],[q,.094,470,235,.05,.038]],[
   [[z,0,168,82,.14,.036,.02],[q,.06,610,205,.043,.031]],
   [[t,0,211,75,.171,.061,.023],[q,.084,530,165,.044,.031]],
   [[z,0,182,108,.077,.033,.014],[q,.057,620,303,.036,.031],[t,.114,225,61,.083,.063]]],[[q,0,720,275,.046,.033],[t,.045,245,115,.12,.059]],true),
 // Praça: passos alternados e indicação de faixa, sem gravação de multidão.
 povo:author('povo','crowd-lane',[[t,0,205,57,.072,.034],[t,.091,285,71,.071,.029],[t,.197,228,59,.08,.032]],
  [[t,0,188,75,.064,.058],[t,.068,216,94,.065,.053],[s,.153,725,520,.068,.037]],[
   [[t,0,254,77,.092,.069],[t,.071,242,54,.088,.048],[s,.071,550,370,.026,.027]],
   [[t,0,252,62,.07,.062],[t,.114,302,87,.081,.058],[t,.114,620,305,.024,.025]],
   [[t,0,181,83,.069,.063],[t,.051,142,55,.073,.047],[s,.126,532,372,.067,.044]]],[[t,0,156,65,.095,.061],[s,.09,480,325,.093,.056]],true)
};
export const ENCOUNTER_SOUND_CAST=Object.freeze(Object.keys(design));
export function getEncounterSoundBank(actor,phase,weapon){
 const id=typeof actor==='string'?actor:actor?.type;
 if(!Object.hasOwn(design,id))return null;
 const entry=design[id];
 if(phase==='entrance'||phase==='windup')return entry[phase];
 const type=typeof weapon==='string'?weapon:weapon?.attackType||weapon?.type;
 if(entry.weapon!==type)return null;
 if(phase==='launch')return entry.launch;
 if(phase==='impact')return entry.passage?null:entry.after;
 return phase==='blocked'&&entry.passage?entry.after:null;
}
