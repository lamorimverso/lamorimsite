// Efeitos não verbais originais, sem amostras, falas ou imitação de pessoas.
// Cada nota: atraso, frequência inicial/final, duração, onda, volume, ataque.
const n=(delay,start,end,length,wave,volume=.055,attack=.006)=>({delay,start,end,length,wave,volume,attack});
const banks={
 army:[[n(0,180,1080,.16,'sawtooth',.03),n(.12,540,270,.08,'triangle')],[n(0,240,1440,.12,'triangle'),n(.09,720,360,.12,'sawtooth',.028)],[n(0,320,1280,.08,'square',.025),n(.1,640,160,.15,'triangle')]],
 'santiago-harp':[[n(0,392,784,.1,'sine'),n(.08,523,1047,.12,'sine'),n(.17,659,1318,.14,'triangle',.035)],[n(0,440,880,.12,'sine'),n(.1,587,1174,.16,'triangle',.04)],[n(0,330,660,.08,'triangle'),n(.075,494,988,.1,'sine'),n(.15,740,1480,.12,'sine')]],
 'santiago-terere':[[n(0,800,330,.08,'sine'),n(.09,620,270,.12,'triangle')],[n(0,660,220,.12,'triangle'),n(.12,880,440,.08,'sine')],[n(0,1100,550,.06,'sine'),n(.08,730,240,.14,'sine')]],
 // Sopro ascendente, rajada quebrada e redemoinho grave.
 dilma:[
  [n(0,170,940,.22,'sawtooth',.035,.04)],
  [n(0,230,610,.08,'triangle'),n(.065,420,1180,.14,'sawtooth',.03,.025)],
  [n(0,680,160,.12,'sawtooth',.03,.016),n(.10,190,820,.17,'sine',.065,.045)]
 ],
 // Folhas: pequenos rasgos secos, alternando tamanho e ritmo.
 simone:[
  [n(0,1720,620,.055,'sawtooth',.035),n(.075,1220,440,.08,'triangle')],
  [n(0,1960,810,.04,'square',.028),n(.045,1530,510,.04,'sawtooth',.03),n(.11,980,390,.065,'triangle')],
  [n(0,1410,390,.13,'sawtooth',.033,.014),n(.15,1880,680,.035,'square',.025)]
 ],
 // Paraquedas: abertura macia e queda em degraus.
 soraya:[
  [n(0,960,300,.21,'triangle',.06,.025),n(.11,330,240,.08,'sine')],
  [n(0,780,1170,.075,'sine',.06,.018),n(.085,920,250,.18,'triangle',.06,.025)],
  [n(0,1100,620,.07,'triangle'),n(.09,620,390,.07,'sine'),n(.18,390,210,.09,'triangle')]
 ],
 // Três blocos de notificação; cadências diferentes por envio.
 janones:[
  [n(0,880,880,.045,'square',.035),n(.055,1175,1175,.045,'square',.035),n(.12,1568,1319,.07,'triangle')],
  [n(0,1320,990,.035,'triangle'),n(.075,660,880,.065,'square',.035),n(.15,1320,1760,.05,'sine')],
  [n(0,1047,1397,.06,'square',.03),n(.07,1397,1047,.06,'triangle'),n(.17,2093,1568,.045,'square',.025)]
 ],
 // Gesto em L: dois segmentos bem separados e um rebote opcional.
 lula:[
  [n(0,210,210,.075,'square',.04),n(.085,210,840,.14,'triangle',.065,.018)],
  [n(0,280,140,.055,'sawtooth',.035),n(.065,280,1120,.10,'square',.03),n(.18,560,840,.055,'sine')],
  [n(0,155,310,.12,'triangle',.07,.025),n(.125,620,1240,.08,'square',.03)]
 ],
 // Recibo em impressora de jogo; carimbo tem ataque grave próprio.
 'haddad-paper':[
  [n(0,1380,490,.075,'square',.028),n(.09,980,360,.075,'sawtooth',.032)],
  [n(0,1660,1180,.035,'sawtooth',.035),n(.05,1180,780,.035,'square',.028),n(.10,780,310,.095,'triangle')],
  [n(0,920,420,.11,'sawtooth',.032,.018),n(.14,1840,540,.045,'square',.027)]
 ],
 'haddad-stamp':[
  [n(0,240,52,.10,'triangle',.10),n(.018,1320,330,.035,'square',.035)],
  [n(0,180,65,.065,'sawtooth',.055),n(.10,290,45,.115,'triangle',.085,.008)],
  [n(0,330,70,.14,'triangle',.09,.012),n(.15,720,180,.045,'square',.035)]
 ],
 'xandao-hammer':[
  [n(0,155,32,.15,'triangle',.11),n(.006,1840,240,.045,'square',.03)],
  [n(0,92,38,.085,'square',.045),n(.09,215,36,.16,'triangle',.10)],
  [n(0,260,44,.11,'sawtooth',.05),n(.025,112,28,.19,'triangle',.08,.012),n(.16,620,150,.04,'square',.025)]
 ],
 'xandao-mandado':[
  [n(0,820,1640,.09,'square',.03),n(.10,1640,410,.10,'sawtooth',.032)],
  [n(0,1040,520,.055,'triangle'),n(.07,1560,780,.055,'square',.03),n(.14,2080,520,.08,'sawtooth',.03)],
  [n(0,2400,600,.16,'sawtooth',.03,.024),n(.18,1200,300,.055,'square',.028)]
 ],
 'pf-barrier':[
  [n(0,370,185,.075,'square',.04),n(.10,370,92,.10,'triangle',.07)],
  [n(0,440,220,.055,'sawtooth',.035),n(.06,220,110,.055,'square',.03),n(.13,180,55,.10,'triangle',.07)],
  [n(0,290,580,.09,'square',.03),n(.12,145,48,.14,'triangle',.08,.018)]
 ],
 'pf-cuffs':[
  [n(0,2460,820,.04,'square',.03),n(.085,1640,410,.055,'triangle')],
  [n(0,2040,510,.06,'triangle'),n(.07,3060,1020,.03,'square',.025),n(.12,1020,255,.055,'square',.03)],
  [n(0,2700,900,.035,'square',.03),n(.14,1800,450,.09,'sawtooth',.03,.012)]
 ],
 'joice-cuffs':[
  [n(0,3000,1200,.032,'square',.025),n(.045,2250,750,.032,'square',.025),n(.10,1500,375,.065,'triangle')],
  [n(0,1800,600,.06,'sawtooth',.035),n(.11,3600,900,.045,'square',.023)],
  [n(0,2400,800,.075,'triangle'),n(.08,1200,400,.04,'square',.028),n(.16,3200,640,.035,'square',.023)]
 ],
 'joice-mic':[
  [n(0,420,1260,.07,'sawtooth',.035),n(.08,1260,630,.09,'square',.027)],
  [n(0,560,1680,.085,'square',.028),n(.10,840,420,.065,'triangle'),n(.18,1680,840,.03,'square',.023)],
  [n(0,315,1890,.15,'sawtooth',.03,.025),n(.17,945,473,.06,'sine')]
 ],
 'bossonari-bottle':[
  [n(0,1480,740,.07,'sine',.07),n(.055,2220,1110,.055,'triangle',.04)],
  [n(0,1320,660,.045,'triangle'),n(.065,1980,990,.045,'sine',.065),n(.135,2640,880,.07,'sine')],
  [n(0,1760,440,.14,'sine',.07,.012),n(.16,880,660,.04,'square',.023)]
 ],
 'bossonari-bottle-alt':[
  [n(0,1190,595,.09,'triangle',.06),n(.06,2380,1190,.07,'sine')],
  [n(0,1680,840,.045,'sine',.065),n(.08,1260,420,.11,'triangle')],
  [n(0,2100,1050,.035,'square',.023),n(.05,1575,525,.06,'sine'),n(.14,1050,350,.085,'triangle')]
 ],
 // Fantasmas satíricos: portamentos eletrônicos, nunca uma voz.
 ghost:[
  [n(0,310,1240,.20,'sine',.065,.035),n(.10,465,155,.15,'triangle',.04,.035)],
  [n(0,720,180,.14,'sine',.065,.025),n(.09,240,1440,.18,'triangle',.045,.04)],
  [n(0,220,660,.08,'triangle'),n(.075,660,1320,.09,'sine'),n(.155,990,165,.13,'sine',.06,.025)]
 ],
 dino:[
  [n(0,195,49,.13,'square',.04),n(.025,98,33,.18,'triangle',.08,.018)],
  [n(0,280,70,.08,'triangle',.08),n(.10,140,35,.16,'sawtooth',.035,.02)],
  [n(0,390,130,.06,'square',.03),n(.07,260,65,.06,'triangle',.07),n(.15,130,32,.13,'triangle',.075)]
 ],
 boulos:[
  [n(0,135,270,.08,'triangle',.08),n(.085,270,90,.10,'sawtooth',.04)],
  [n(0,180,90,.045,'square',.035),n(.065,225,112,.045,'triangle',.07),n(.13,315,79,.095,'sawtooth',.035)],
  [n(0,108,432,.13,'sawtooth',.035,.025),n(.14,216,54,.09,'triangle',.08)]
 ]
};
const defaults={dilma:'dilma',simone:'simone',soraya:'soraya',janones:'janones',lula:'lula',haddad:'haddad-paper',
 xandao:'xandao-hammer',pf:'pf-barrier',joice:'joice-mic',bossonari:'bossonari-bottle','meme-army':'ghost',dino:'dino',boulos:'boulos',army:'army',santiago:'santiago-terere'};
// A arma refina o timbre dentro do ator; armas novas mantêm sua identidade.
const weapons={haddad:{stamp:'haddad-stamp'},xandao:{mandado:'xandao-mandado'},pf:{handcuffs:'pf-cuffs'},
 joice:{microphone:'joice-mic'},santiago:{'harp-note':'santiago-harp'},bossonari:{'ivermectina-prop':'bossonari-bottle-alt'}};
export function getEnemyShotBank(actor,weapon){
 const type=typeof actor==='string'?actor:actor?.type;
 const attack=typeof weapon==='string'?weapon:weapon?.attackType||weapon?.type;
 if(!Object.hasOwn(defaults,type))return null;
 const id=Object.hasOwn(weapons,type)&&Object.hasOwn(weapons[type],attack)?weapons[type][attack]:defaults[type];
 return {id,variants:banks[id]};
}
