// Offline visual review. Optional dependencies: @napi-rs/canvas and sharp.
// node tools/preview-campaign-cast.mjs BASE CANDIDATO SAIDA
import {createRequire} from 'node:module';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

const require=createRequire(import.meta.url);
function optionalPackage(id){
 try{return require(id);}catch(err){
  if(!process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES)throw err;
  return require(join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,id));
 }
}
const {createCanvas,Image}=optionalPackage('@napi-rs/canvas'),sharp=optionalPackage('sharp');
const [base,candidate,out]=process.argv.slice(2);
if(!base||!candidate||!out)throw new Error('Uso: node tools/preview-campaign-cast.mjs BASE CANDIDATO SAIDA');
globalThis.Image=class extends Image{
 set src(value){this.filePath=value;super.src=fileURLToPath(value);}
 get src(){return this.filePath;}
 get naturalWidth(){return this.width;}
 get naturalHeight(){return this.height;}
};

async function load(checkout){
 const url=pathToFileURL(resolve(checkout,'tanahoraflavio/runner-boss-art.mjs'));
 const text=await readFile(url,'utf8');
 const spec=text.match(/from ["']([^"']*runner-sprites[^"']*)["']/)?.[1];
 if(!spec)throw new Error('Atlas não encontrado em '+checkout);
 const sprites=await import(new URL(spec,url));await sprites.loadSprites(()=>{},{coreOnly:true});
 const {drawHoverEnemy}=await import(url);
 const {drawCampaignCrowd}=await import(new URL(text.match(/from ["']([^"']*runner-campaign-art[^"']*)["']/)[1],url));
 const {storyBossAt,STORY_ENCOUNTERS,STORY_OPTIONAL_IDS,optionalStoryBossAt}=await import(new URL('runner-bosses.mjs',url));
 const bosses=[...Array.from({length:STORY_ENCOUNTERS},(_,i)=>storyBossAt(i)),...STORY_OPTIONAL_IDS.map(optionalStoryBossAt)];
 return {drawHoverEnemy,drawCampaignCrowd,bosses:Object.fromEntries(bosses.map(b=>[b.type,b]))};
}

const sets=[
 ['obrigatorios',['ana-elisa','rick','guilherme','erika','fiscal','povo','joice']],
 ['opcionais',['renato-freitas','jones','maestro','sofia','capita','soraya']]
];
const states=[
 ['Neutro',{}],['Preparação',{preparing:true,progress:.78}],['Soltura',{attacking:true,progress:.42}],['Recuperação',{recovering:true,progress:.61}]
];
const samples=[await load(base),await load(candidate)];
await mkdir(out,{recursive:true});
for(const [name,ids] of sets){
 const width=1120,height=104+ids.length*150,canvas=createCanvas(width,height),c=canvas.getContext('2d');
 c.fillStyle='#f5f1e8';c.fillRect(0,0,width,height);c.fillStyle='#232638';c.font='bold 24px sans-serif';c.fillText('Corre, Flávio! · '+name,24,33);
 c.font='13px sans-serif';c.fillText('Referência de escala de jogo · mesmas poses e ações nas duas versões',24,57);
 for(const [v,title] of ['Antes','Depois'].entries()){
  const span=460,left=192+v*span;
  c.fillStyle=v?'#294546':'#5f5366';c.font='bold 15px sans-serif';c.fillText(title,left,80);
  for(const [i,[label]] of states.entries()){c.font='12px sans-serif';c.fillText(label,left+i*111,98);}
 }
 for(const [i,id] of ids.entries()){
  const top=104+i*150,ground=top+111,action=['erika','rick','maestro','sofia','joice'].includes(id)?'crouch':['fiscal','renato-freitas','povo','capita'].includes(id)?'move':'jump';
  c.fillStyle=i%2?'#eae7e0':'#fffbf1';c.fillRect(0,top,width,150);
  c.fillStyle='#222638';c.font='bold 15px sans-serif';c.fillText(samples[1].bosses[id].name,18,top+66);
  c.font='12px sans-serif';c.fillStyle='#545b60';c.fillText(id==='povo'?'travessia no solo':'apoio no casco',18,top+86);
  for(const [v,sample] of samples.entries())for(const [frame,[,flags]] of states.entries()){
   const x=232+v*460+frame*111,b=sample.bosses[id];
   c.strokeStyle='#a8b2ad';c.beginPath();c.moveTo(x-45,ground);c.lineTo(x+55,ground);c.stroke();
   if(id==='povo')sample.drawCampaignCrowd(c,{x,y:ground,scale:.70,phase:frame*7,reducedMotion:false,...flags});
   else sample.drawHoverEnemy(c,{type:id,x,y:ground,scale:.78,phase:frame*6,classId:b.classId,stageId:b.stageId,action,...flags});
  }
 }
 const image=await sharp(canvas.toBuffer('image/png')).webp({lossless:true}).toBuffer();
 await writeFile(resolve(out,`elenco-${name}-comparativo.webp`),image);
}
console.log('Comparativo renderizado: 11 personagens da revisão e 2 referências de atlas, 4 poses por versão.');
