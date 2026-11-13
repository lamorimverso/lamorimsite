// One ordered route shared by gameplay, scenery, allies and the HUD.
export const SCENE_SECONDS=20;
export const SCENE_DISTANCE=7000;
export const STAGES=Object.freeze([
 {id:'brasilia',name:'Brasília',short:'Brasília',country:'Brasil',sky:'#e5f2ff',ink:'#456b85',accent:'#52889c',ground:'#cbdcc1'},
 {id:'rio',name:'Rio de Janeiro',short:'Rio',country:'Brasil',sky:'#dff7fa',ink:'#287b82',accent:'#238e85',ground:'#e4d7a9'},
 {id:'argentina',name:'Argentina',short:'Argentina',country:'Argentina',sky:'#e8efff',ink:'#4b6e9f',accent:'#397ab7',ground:'#ccd9ea'},
 {id:'paraguai',name:'Paraguai · Assunção',short:'Paraguai',country:'Paraguai',sky:'#f6e5df',ink:'#8b615f',accent:'#c1666e',ground:'#d1dfbc'},
 {id:'florida',name:'Flórida',short:'Flórida',country:'Estados Unidos',sky:'#ffece0',ink:'#a86765',accent:'#bd7378',ground:'#e9cfac'},
 {id:'casa-branca',name:'Casa Branca',short:'Casa Branca',country:'Estados Unidos',sky:'#e7eafa',ink:'#596d8c',accent:'#7777a9',ground:'#c9dcb9'}
].map((stage,index)=>Object.freeze({...stage,index})));
export const ROUTE_DISTANCE=SCENE_DISTANCE*STAGES.length;
