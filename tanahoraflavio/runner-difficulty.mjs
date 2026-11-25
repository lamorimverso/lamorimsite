import {random} from './runner-random.mjs?v=8de9f87c7593';
import {stageAt} from './runner-route-progress.mjs?v=adaaacdf6859';

export const PURSUERS = Object.freeze([
 {type:'pf',name:'Polícia Federal',short:'PF',width:34,height:44,color:'#284c70'},
 {type:'janones',name:'Janones',short:'Janones',width:36,height:46,color:'#346a9c'},
 {type:'army',name:'Exército',short:'Exército',width:40,height:47,color:'#64734c'},
 {type:'meme-army',name:'Exército de memes do Lula',short:'Memes',width:46,height:44,color:'#b44d67'},
 {type:'bossonari',name:'Bossonari',short:'Bossonari',width:56,height:58,color:'#7a4f8d'},
 {type:'boulos',name:'Boulos',short:'Boulos',width:38,height:46,color:'#765488'},
 {type:'dino',name:'Flávio Dino',short:'Dino',width:40,height:48,color:'#8a6247'},
 {type:'xandao',name:'Xandão',short:'Xandão',width:40,height:49,color:'#493f62'},
 {type:'haddad',name:'Haddad',short:'Taxad',width:40,height:48,color:'#286779'},
 {type:'lula',name:'Lula',short:'Lula',width:46,height:50,color:'#aa3c50'},
 {type:'dilma',name:'Dilma Rousseff',short:'Dilma',width:36,height:46,color:'#b74250'},
 {type:'simone',name:'Simone Tebet',short:'Simone',meme:'Gostosas do Lula',memeKind:'adesivo cenográfico; não fala autêntica',width:36,height:46,color:'#586fa2'},
 {type:'soraya',name:'Soraya Thronicke',short:'Soraya',width:38,height:46,color:'#866548'},
 {type:'orla-runner',name:'Patrulheiro da orla',short:'Orla',width:38,height:44,color:'#417382'},
 {type:'paulista-runner',name:'Corredor da Paulista',short:'Paulista',width:37,height:43,color:'#8375a4'},
 {type:'route-scout',name:'Batedor da rota',short:'Batedor',width:38,height:45,color:'#96805a'},
 {type:'terminal-guard',name:'Guarda do terminal',short:'Terminal',width:37,height:44,color:'#567889'},
 {type:'arrow-panel',name:'Painel de setas',short:'Painel',width:39,height:33,color:'#725bb4'},
 {type:'lula-runner',name:'Corredor do Exército do Lula',short:'Corredor',width:38,height:45,color:'#ab4556'},
 {type:'ze-gotinha-rival',name:'Zé Gotinha rival',short:'Gotinha rival',width:32,height:43,color:'#8f477f'},
 {type:'meme-ghost',name:'Aparição do Fantasma',short:'Aparição',width:42,height:42,color:'#8f477f'},
 {type:'barrier',name:'Barreira',short:'Barreira',width:44,height:32,color:'#c48845'},
 {type:'case',name:'Mala',short:'Mala',width:38,height:36,color:'#906490'}
].map((p,index)=>Object.freeze({...p,index})));
export function difficultyAt(distance,elapsed=0) {
 const d=Number.isFinite(distance)?Math.max(0,distance):0,t=Number.isFinite(elapsed)?Math.max(0,elapsed):0;
 // Pressão cresce por várias voltas em vez de saturar na primeira.
 // O tempo e a distância continuam contínuos ao atravessar os cenários.
 const pressure=1-Math.exp(-(d/45000+t/360)),endurance=1-Math.exp(-d/180000),p=d/(d+10000);
 return {level:1+Math.floor(9*pressure)+Math.floor(6*endurance),pressure,endurance,
  speed:270+170*pressure+95*endurance,obstacleGap:Math.max(.86,1.70-.66*pressure-.18*endurance),
  pickupGap:12+8*p,passportGap:5.2+1.2*p,powerGap:24+32*p,
  bossApproach:Math.max(.72,1.15-.33*pressure-.10*endurance),obstacleApproach:Math.max(.82,1.65-.73*pressure-.10*endurance)};
}
const POOLS = [
 ['pf','barrier','janones','boulos','army'],['janones','army','barrier','pf'],
 ['pf','barrier','case','dino','army'],['army','pf','case','janones'],['army','pf','case'],['pf','janones','army','dino','case','barrier']
];
// Desbloqueio por risco: cada ator entra em cena após o jogador aprender a
// reagir aos anteriores. Chefões mantêm a ordem e os marcos da História.
export const CHARACTER_UNLOCK_LEVEL=Object.freeze({
 pf:1,barrier:1,dilma:1,
 janones:2,simone:2,
 army:3,case:3,soraya:3,
 boulos:4,
 'meme-army':5,
 dino:6
});
const GROUND_CAST=Object.freeze(['pf','barrier','janones','army','case','boulos','dino']);
const OVERHEAD_CAST=Object.freeze(['dilma','simone','soraya','meme-army']);
export function unlockedCharacters(level,role='all'){
 const rank=Math.max(1,Math.min(10,Math.floor(Number(level)||1)));
 return (role==='ground'?GROUND_CAST:role==='overhead'?OVERHEAD_CAST:[...GROUND_CAST,...OVERHEAD_CAST])
  .filter(type=>CHARACTER_UNLOCK_LEVEL[type]<=rank);
}
export function characterProgressAt(run){
 const level=difficultyAt(run.distance,run.elapsed).level;
 const available=unlockedCharacters(level).filter(type=>type!=='barrier'&&type!=='case');
 const all=unlockedCharacters(10).filter(type=>type!=='barrier'&&type!=='case');
 return {level,available:available.length,total:all.length,characters:available};
}
// Um ator novo aparece antes da repetição do elenco antigo, sem deixar
// dois ataques seguidos com o mesmo personagem quando há alternativas.
export function chooseProgressiveCharacter(options,rng,seen=[],last=null){
 const fresh=options.filter(type=>!seen.includes(type));
 const eligible=fresh.length?fresh:options.filter(type=>type!==last);
 const choices=eligible.length?eligible:options;
 return choices[Math.floor(random(rng)*choices.length)];
}
export const foeFor = type => PURSUERS.find(p=>p.type===type)||null;
export function pursuitAt(seconds,rng=()=>.5,level=10,seen=[],last=null) {
 const stagePool=POOLS[stageAt(seconds).index];
 const pool=stagePool.filter(type=>CHARACTER_UNLOCK_LEVEL[type]<=level);
 return foeFor(chooseProgressiveCharacter(pool.length?pool:['pf'],rng,seen,last));
}
