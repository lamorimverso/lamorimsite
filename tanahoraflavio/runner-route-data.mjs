// One ordered route shared by gameplay, scenery, allies and the HUD.
export const SCENE_SECONDS=20;
export const SCENE_DISTANCE=7000;
export const STAGES=Object.freeze([
 {id:'brasilia',name:'Brasília',short:'Brasília',country:'Brasil',region:'DF',sky:'#e5f2ff',ink:'#456b85',accent:'#52889c',ground:'#cbdcc1'},
 {id:'rio',name:'Rio de Janeiro',short:'Rio',country:'Brasil',region:'RJ',sky:'#dff7fa',ink:'#287b82',accent:'#238e85',ground:'#e4d7a9'},
 {id:'argentina',name:'Argentina',short:'Argentina',country:'Argentina',sky:'#e8efff',ink:'#4b6e9f',accent:'#397ab7',ground:'#ccd9ea'},
 {id:'paraguai',name:'Paraguai · Assunção',short:'Paraguai',country:'Paraguai',sky:'#f6e5df',ink:'#8b615f',accent:'#c1666e',ground:'#d1dfbc'},
 {id:'florida',name:'Flórida',short:'Flórida',country:'Estados Unidos',region:'FL',sky:'#ffece0',ink:'#a86765',accent:'#bd7378',ground:'#e9cfac'},
 {id:'casa-branca',name:'Casa Branca',short:'Casa Branca',country:'Estados Unidos',region:'DC',sky:'#e7eafa',ink:'#596d8c',accent:'#7777a9',ground:'#c9dcb9'}
].map((stage,index)=>Object.freeze({...stage,index})));
export const ROUTE_DISTANCE=SCENE_DISTANCE*STAGES.length;

const [brasilia,rio,argentina,paraguai,florida,casaBranca]=STAGES;
export const STORY_STAGES=Object.freeze([
 brasilia,rio,
 {id:'sao-paulo',name:'São Paulo',short:'São Paulo',country:'Brasil',region:'SP',sky:'#e9e7f5',ink:'#655b82',accent:'#936575',ground:'#d7e2df'},
 argentina,paraguai,florida,casaBranca,
 {...brasilia,id:'brasilia-final',name:'Retorno a Brasília',short:'Brasília · Final'}
].map((stage,index)=>Object.freeze({...stage,index,legacyIndex:STAGES.find(s=>s.id===stage.id)?.index??0})));
export const STORY_STAGE_IDS=Object.freeze(STORY_STAGES.map(s=>s.id));
