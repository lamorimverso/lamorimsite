// Atlas e recortes gerados dos desenhos escolhidos, preservando os PNGs fontes.
import {definitions} from './runner-sprite-data.mjs?v=08009af62666';
const sheets=new Map();let activeAttempt=null;
const actorGroups={flavio:[0,1,2,3,4,5],xandao:[0,1,2],haddad:[4,5,6],lula:[8,9,10],pf:[3],janones:[7],army:[11],joice:[12]};
export function loadSprites(onProgress=()=>{}){
 const entries=Object.entries(definitions),total=entries.length;
 if(sheets.size===total)return Promise.resolve();
 if(activeAttempt)return activeAttempt.promise;
 const attempt={images:[],loaded:new Map(),settled:false};
 attempt.promise=new Promise((resolve,reject)=>{attempt.resolve=resolve;attempt.reject=reject;});
 activeAttempt=attempt;
 function finish(error){
  if(activeAttempt!==attempt||attempt.settled)return;
  attempt.settled=true;clearTimeout(attempt.timer);
  for(const image of attempt.images){image.onload=null;image.onerror=null;}
  if(!error)for(const [name,sheet] of attempt.loaded)sheets.set(name,sheet);
  activeAttempt=null;
  if(error)attempt.reject(error);else attempt.resolve();
 }
 attempt.timer=setTimeout(()=>finish(new Error('Os personagens não carregaram em 15 segundos. Tente novamente.')),15000);
 try{
  for(const [name,definition] of entries){
   if(attempt.settled)break;
   const image=new Image();attempt.images.push(image);image.decoding='async';
   image.onload=()=>{
    if(activeAttempt!==attempt||attempt.settled||attempt.loaded.has(name))return;
    try{
     if(image.naturalWidth!==definition.width||image.naturalHeight!==definition.height)throw new Error('Dimensões inesperadas no atlas de personagens');
     attempt.loaded.set(name,{image,frames:definition.frames});
     onProgress(attempt.loaded.size,total);
     if(attempt.loaded.size===total)finish();
    }catch(error){finish(error);}
   };
   image.onerror=()=>finish(new Error('Não foi possível carregar os personagens'));
   image.src=definition.url;
  }
 }catch(error){finish(error);}
 return attempt.promise;
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
// Os atlas originais já mostram Flávio olhando para o avanço (+X).
// Esta informação descreve a arte; não é uma instrução para espelhá-la.
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
 // Preservar a orientação original também no salto, agachamento e impacto.
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
