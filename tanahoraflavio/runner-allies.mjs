// Papéis ficcionais de apoio: sem arma do protagonista e sem proteção acumulada.
export const ALLIES=Object.freeze([
 {id:'vorcaro',name:'Vorcaro',kind:'magnet',label:'Crédito Relâmpago · ímã de passaportes',duration:3},
 {id:'jair',name:'Jair Bolsonaro',kind:'route',label:'Rota indicada',duration:4},
 {id:'michelle',name:'Michelle Bolsonaro',kind:'highlight',label:'Perigo em destaque',duration:5},
 {id:'eduardo',name:'Eduardo Bolsonaro',kind:'event',label:'Perseguição adiada em 4 s',duration:6},
 {id:'carlos',name:'Carlos Bolsonaro',kind:'sequence',label:'Próximas três esquivas em sequência',duration:5},
 {id:'renan',name:'Renan Bolsonaro',kind:'collect',label:'Busca um passaporte próximo',duration:5},
 {id:'silas',name:'Silas Malafaia',kind:'encourage',label:'Incentivo · movimento lateral 20% mais rápido',duration:3},
 {id:'magno',name:'Magno Malta',kind:'predict',label:'Próxima ação antecipada',duration:5},
 {id:'nikolas',name:'Nikolas Ferreira',kind:'quiet',label:'Foco na pista',duration:6},
 {id:'tarcisio',name:'Tarcísio de Freitas',kind:'destination',label:'Próximo apoio 7 km mais perto',duration:6},
 {id:'damares',name:'Damares Alves',kind:'sky',label:'Atenção às quedas',duration:6},
 {id:'bia',name:'Bia Kicis',kind:'quest',label:'Colete três passaportes · ganhe um ímã',duration:12},
 {id:'trump',name:'Donald Trump',kind:'telegraph',label:'Mais tempo para ler o perigo',duration:5,warningBonus:.24,stages:[4,5]},
 {id:'milei',name:'Javier Milei',kind:'clear',label:'Um obstáculo cenográfico removido',duration:4,stages:[2]},
 {id:'santiago',name:'Santiago Peña',kind:'telegraph',label:'Apoio no Paraguai · mais tempo para reagir',duration:6,warningBonus:.4,stages:[3]},
 {id:'bolsominion',name:'Apoiador fictício',kind:'guide',label:'Coleta em destaque',duration:4}
].map(Object.freeze));
export const allyById=id=>ALLIES.find(a=>a.id===id);
export function allyForStage(stageIndex,visits={},rng=Math.random){
 const eligible=ALLIES.filter(a=>!a.stages||a.stages.includes(stageIndex));
 const least=Math.min(...eligible.map(a=>visits[a.id]||0));
 const unvisitedLocal=eligible.filter(a=>a.stages&&!(visits[a.id]||0));
 const pool=unvisitedLocal.length?unvisitedLocal:eligible.filter(a=>(visits[a.id]||0)===least);
 const random=Math.max(0,Math.min(.999999,Number(rng())||0));return pool[Math.floor(random*pool.length)];
}
export function collectAlly(run,id){
 const ally=allyById(id);if(run.status!=='running'||!ally||id==='vorcaro'&&run.creditCooldown>0)return false;
 run.ally={id,remaining:2.8};run.aid={id,kind:ally.kind,label:ally.label,remaining:ally.duration,warningBonus:ally.warningBonus,startPassports:run.passports};
 run.lastAllyId=id;run.allyVisits??={};run.allyVisits[id]=(run.allyVisits[id]||0)+1;
 run.allyHelpCount=(run.allyHelpCount||0)+1;
 if(!(run.reserveShields>0)){
  run.allyShieldProgress=(run.allyShieldProgress||0)+1;
  if(run.allyShieldProgress>=6){run.reserveShields=1;run.allyShieldProgress=0;}
 }
 if(ally.kind==='event'&&!run.raid&&Number.isFinite(run.nextRaid))run.nextRaid+=4;
 if(ally.kind==='destination'&&Number.isFinite(run.nextSupportAt))run.nextSupportAt=Math.max(run.routeDistance+1500,run.nextSupportAt-7000);
 if(id==='vorcaro')run.creditCooldown=24;
 if(ally.kind==='quest')run.aid.goal=run.passports+3;
 if(ally.kind==='clear'){
  const target=run.obstacles.filter(o=>!o.bossAttack&&!o.falling&&!o.passed&&o.x>(run.player.x??120)+34&&['barrier','case','rolling-case','popcorn'].includes(o.type)).sort((a,b)=>a.x-b.x)[0];
  if(target){run.obstacles=run.obstacles.filter(o=>o!==target);run.clearedAt={x:target.x,remaining:.4};run.aid.kind='cleared';}
  else run.aid.label='Abre-caminho reservado ao próximo obstáculo';
 }
 run.event=ally.name+' · '+run.aid.label+'. Participação fictícia.';run.events++;return true;
}
export function advanceAllies(run,dt){
 run.creditCooldown=Math.max(0,(run.creditCooldown||0)-dt);
 for(const field of ['ally','aid','clearedAt'])if(run[field]){run[field].remaining-=dt;if(run[field].remaining<=0)run[field]=null;}
 const aid=run.aid;if(!aid)return;
 if(aid.kind==='quest'&&run.passports>=aid.goal){run.aid={...aid,kind:'magnet',label:'Meta cumprida · ímã por 3,5 s',remaining:3.5};return;}
 if(aid.kind==='clear'){
  const target=run.obstacles.find(o=>!o.bossAttack&&!o.falling&&!o.passed&&o.x>(run.player.x??120)+34&&['barrier','case','rolling-case','popcorn'].includes(o.type));
  if(target){run.obstacles=run.obstacles.filter(o=>o!==target);run.clearedAt={x:target.x,remaining:.4};run.aid={...aid,kind:'cleared',label:'Caminho aberto · continue desviando'};}
 }
 if(aid.kind==='collect'){
  if(run.passports>aid.startPassports){aid.kind='collected';aid.label='Passaporte recolhido';return;}
  const target=run.pickups.filter(p=>p.type==='passport'&&p.x>=(run.player.x??120)-30&&p.x<=(run.player.x??120)+240).sort((a,b)=>a.x-b.x)[0];
  if(!target)return;
  const dx=(run.player.x??120)+17-target.x,dy=run.player.y+25-target.y,d=Math.hypot(dx,dy),ratio=d>.01?Math.min(1,620*dt/d):1;
  target.x+=dx*ratio;target.y+=dy*ratio;return;
 }
 if(aid.kind!=='magnet')return;
 const x=(run.player.x??120)+17,y=run.player.y+(run.player.crouching?16:25);
 for(const p of run.pickups){
  if(p.type!=='passport'||p.x<x-30)continue;
  const dx=x-p.x,dy=y-p.y,d=Math.hypot(dx,dy);if(d>180||d<.01)continue;
  const ratio=Math.min(1,400*dt/d);p.x+=dx*ratio;p.y+=dy*ratio;
 }
}
