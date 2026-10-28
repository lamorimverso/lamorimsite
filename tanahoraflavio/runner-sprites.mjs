// Atlas criados a partir da prancha escolhida pelo usuário, sem redesenho geométrico.
const VERSION='20261028-sprites-v4';
const definitions={
 hero:{url:new URL('./assets/flavio-run.png',import.meta.url).href+'?v='+VERSION,cols:3,rows:2},
 cast:{url:new URL('./assets/characters-2026.png',import.meta.url).href+'?v='+VERSION,cols:4,rows:4}
};
const sheets=new Map();let pending=null;
const actorGroups={flavio:[0,1,2,3,4,5],xandao:[0,1,2],haddad:[4,5,6],lula:[8,9,10],pf:[3],janones:[7],army:[11],joice:[12]};
function scanFrames(image,cols,rows){
 const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
 const context=canvas.getContext('2d',{willReadFrequently:true});
 if(!context)throw new Error('Canvas indisponível');
 context.drawImage(image,0,0);const data=context.getImageData(0,0,canvas.width,canvas.height).data,frames=[];
 for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
  const x0=Math.floor(col*canvas.width/cols),x1=Math.floor((col+1)*canvas.width/cols);
  const y0=Math.floor(row*canvas.height/rows),y1=Math.floor((row+1)*canvas.height/rows);
  let left=x1,right=x0-1,top=y1,bottom=y0-1;
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)if(data[(y*canvas.width+x)*4+3]>=150){
   left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
  }
  if(right<left||bottom<top)throw new Error('Quadro de personagem vazio');
  left=Math.max(x0,left-2);top=Math.max(y0,top-2);right=Math.min(x1-1,right+2);bottom=Math.min(y1-1,bottom+2);
  frames.push({x:left,y:top,width:right-left+1,height:bottom-top+1,center:(x0+x1)/2});
 }
 // Descartar apenas a superfície de leitura; os PNG originais permanecem intactos.
 canvas.width=canvas.height=1;return frames;
}
function loadSheet(name,definition,onProgress){
 if(sheets.has(name)){onProgress(sheets.size,2);return Promise.resolve();}
 return new Promise((resolve,reject)=>{
  const image=new Image();image.decoding='async';
  image.onload=()=>{
   try{sheets.set(name,{image,frames:scanFrames(image,definition.cols,definition.rows)});onProgress(sheets.size,2);resolve();}
   catch(error){reject(error);}
  };
  image.onerror=()=>reject(new Error('Não foi possível carregar os personagens'));
  image.src=definition.url;
 });
}
export function loadSprites(onProgress=()=>{}){
 if(sheets.size===2)return Promise.resolve();
 if(pending)return pending;
 pending=Promise.all(Object.entries(definitions).map(([name,definition])=>loadSheet(name,definition,onProgress)))
  .then(()=>{pending=null;}).catch(error=>{pending=null;throw error;});
 return pending;
}
export function spriteFrameFor(type,{phase=0,airborne=false,landing=false,hurt=false,attacking=false}={}){
 if(type==='flavio'){
  if(hurt)return {sheet:'cast',index:15};
  if(landing)return {sheet:'cast',index:14};
  if(airborne)return {sheet:'cast',index:13};
  return {sheet:'hero',index:Math.floor(Math.max(0,phase))%6};
 }
 const group=actorGroups[type]||actorGroups.pf;
 return {sheet:'cast',index:group.length===3?group[attacking?2:Math.floor(Math.max(0,phase))%2]:group[0]};
}
// Cada atlas tem resolução própria. As poses do Flávio vindas do atlas
// de elenco devem manter a altura aparente dos quadros de corrida.
export function spriteScaleFor(type,sheetName,frames,scale=1){
 const indices=type==='flavio'&&sheetName==='cast'?[13,14,15]:(actorGroups[type]||actorGroups.pf);
 const sourceHeight=Math.max(...indices.map(i=>frames[i]?.height||0));
 return sourceHeight>0?(type==='joice'?90:94)*scale/sourceHeight:0;
}
// As imagens originais da corrida mostram Flávio olhando para a esquerda.
// Espelhar somente o herói no Canvas o põe de frente para o avanço (+X)
// sem alterar os PNGs, a posição do personagem ou as colisões.
export function spriteFacesRight(type){return type==='flavio';}
export function portraitCropFor(frame){
 // O microfone da Joice e os acessórios laterais ficam fora do recorte antigo.
 // Preservar toda a largura, recortando somente a parte inferior para retrato.
 return {x:frame.x,y:frame.y,width:frame.width,height:frame.height*.76};
}
export function drawSpriteActor(context,{type='flavio',x=0,y=0,scale=1,phase=0,airborne=false,landing=false,attacking=false,hurt=false,alpha=1}={}){
 const selected=spriteFrameFor(type,{phase,airborne,landing,attacking,hurt});
 const sheet=sheets.get(selected.sheet);if(!sheet)return false;
 const frame=sheet.frames[selected.index];
 const factor=spriteScaleFor(type,selected.sheet,sheet.frames,scale);
 if(!factor)return false;
 const dx=x+(frame.x-frame.center)*factor,dy=y-frame.height*factor;
 context.save();context.globalAlpha*=alpha;context.imageSmoothingEnabled=true;
 // O eixo de espelhamento passa pelo centro do Flávio: nenhuma mudança
 // no hitbox, no x físico ou no alinhamento dos quadros de salto/impacto.
 if(spriteFacesRight(type)){context.translate(2*x,0);context.scale(-1,1);}
 if(hurt&&type!=='flavio'){context.shadowColor='#ffd56b';context.shadowBlur=9;}
 context.drawImage(sheet.image,frame.x,frame.y,frame.width,frame.height,dx,dy,frame.width*factor,frame.height*factor);
 context.restore();return true;
}
export function drawSpritePortrait(context,type,width,height){
 const cast=sheets.get('cast'),index=actorGroups[type]?.[0];if(!cast||index===undefined)return;
 const f=cast.frames[index],crop=portraitCropFor(f);
 const factor=Math.min(width/crop.width,height/crop.height);
 context.clearRect(0,0,width,height);
 context.drawImage(cast.image,crop.x,crop.y,crop.width,crop.height,(width-crop.width*factor)/2,(height-crop.height*factor)/2,crop.width*factor,crop.height*factor);
}
