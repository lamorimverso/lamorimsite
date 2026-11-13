// Atlas e recortes gerados dos desenhos escolhidos, preservando os PNGs fontes.
import {definitions} from './runner-sprite-data.mjs?v=4a931cb52b80';
import {combatDefinitions} from './runner-combat-sprite-data.mjs?v=5c8ff35ddc6b';
import {combatGeometryFor} from './runner-combat-geometry.mjs?v=69851726fc55';
export const spriteDefinitions={...definitions,...combatDefinitions};
const sheets=new Map();let activeAttempt=null;
const actorGroups={flavio:[0,1,2,3,4,5,6,7],xandao:[0,1,2],haddad:[4,5,6],lula:[8,9,10],pf:[3,13],janones:[7,14],army:[11,15],joice:[12]};
const runningGroups={haddad:{sheet:'chase',start:0},lula:{sheet:'chase',start:4},xandao:{sheet:'chase',start:8},joice:{sheet:'chase',start:12},dilma:{sheet:'cameos',start:0},simone:{sheet:'cameos',start:4},soraya:{sheet:'cameos',start:8},'ze-gotinha':{sheet:'cameos',start:12}};
for(const [sheet,definition] of Object.entries(definitions))for(const [row,type] of (definition.actors||[]).entries())runningGroups[type]={sheet,start:row*4};
export const SPRITE_SHEET_COUNT=Object.keys(spriteDefinitions).length;
export const CORE_SPRITE_SHEET_COUNT=11;
export function loadSprites(onProgress=()=>{},{coreOnly=false}={}){
 const base=['hero','cast','cameos','chase','pursuers',...Object.keys(combatDefinitions)];
 const entries=Object.entries(spriteDefinitions).filter(([name])=>(!coreOnly||base.includes(name))&&!sheets.has(name)),total=entries.length;
 if(!total)return Promise.resolve();
 if(activeAttempt)return activeAttempt.coreOnly===coreOnly?activeAttempt.promise:activeAttempt.promise.then(()=>loadSprites(onProgress,{coreOnly}));
 const attempt={images:[],loaded:new Map(),settled:false,coreOnly};
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
export function spriteFrameFor(type,{phase=0,airborne=false,falling=false,landing=false,hurt=false,attacking=false,preparing=false}={}){
 if(type==='flavio'){
  if(hurt)return {sheet:'hero',index:11};
  if(landing)return {sheet:'hero',index:10};
  if(airborne)return {sheet:'hero',index:falling?9:8};
  return {sheet:'hero',index:Math.floor(Math.max(0,phase))%8};
 }
 const running=runningGroups[type];
 if(running&&(!attacking&&!preparing||!actorGroups[type]))return {sheet:running.sheet,index:running.start+Math.floor(Math.max(0,phase))%4};
 const group=actorGroups[type];if(!group)return null;
 return {sheet:'cast',index:group.length===3?group[attacking?2:preparing?1:0]:group[Math.floor(Math.max(0,phase))%group.length]};
}
// Cada atlas tem resolução própria. As poses do Flávio vindas do atlas
// de elenco devem manter a altura aparente dos quadros de corrida.
export function spriteScaleFor(type,sheetName,frames,scale=1){
 const running=runningGroups[type];
 const indices=running&&sheetName===running.sheet?Array.from({length:4},(_,i)=>running.start+i):actorGroups[type]||actorGroups.pf;
 const sourceHeight=Math.max(...indices.map(i=>frames[i]?.height||0));
 return sourceHeight>0?(type==='jacare'?28:type==='joice'?90:94)*scale/sourceHeight:0;
}
// Os atlas originais já mostram Flávio olhando para o avanço (+X).
// Esta informação descreve a arte; não é uma instrução para espelhá-la.
export function spriteFacesRight(type){return type==='flavio';}
export function portraitCropFor(frame){
 // O microfone da Joice e os acessórios laterais ficam fora do recorte antigo.
 // Preservar toda a largura, recortando somente a parte inferior para retrato.
 return {x:frame.x,y:frame.y,width:frame.width,height:frame.height*.76};
}
export function drawSpriteActor(context,{type='flavio',x=0,y=0,scale=1,phase=0,airborne=false,falling=false,landing=false,attacking=false,preparing=false,hurt=false,alpha=1,facing}={}){
 let selected=spriteFrameFor(type,{phase,airborne,falling,landing,attacking,preparing,hurt});
 if(!selected)return false;
 let sheet=sheets.get(selected.sheet);
 // PF/Janones conservam sua identidade do atlas original até a expansão chegar.
 if(!sheet&&actorGroups[type]&&sheets.has('cast')){
  const group=actorGroups[type];selected={sheet:'cast',index:group[Math.floor(Math.max(0,phase))%group.length]};sheet=sheets.get('cast');
 }
 if(!sheet)return false;
 const frame=sheet.frames[selected.index];
 let factor=spriteScaleFor(type,selected.sheet,sheet.frames,scale);
 if(!factor)return false;
 // A pose horizontal conserva proporções; cabe abaixo do ataque alto sem esmagar o rosto.
 if(type==='flavio'&&selected.index===10)factor=Math.min(factor,48*scale/frame.height);
 let dx=x+(frame.x-frame.center)*factor;
 if(type==='jacare')dx=2*x-dx-frame.width*factor;
 let baseline=frame.groundY??frame.y+frame.height;
 if(type==='flavio'&&airborne){
  const offsets=sheet.frames.slice(0,8).map(f=>(f.groundY??f.y+f.height)-(f.anchorY??f.y+f.height));
  const reference=offsets.reduce((a,b)=>a+b,0)/offsets.length;
  baseline=(frame.anchorY??baseline)+reference;
 }
 const dy=y+(frame.y-baseline)*factor;
 context.save();context.globalAlpha*=alpha;context.imageSmoothingEnabled=true;
 // Virar dentro do próprio retângulo conserva tamanho, apoio e limites.
 const target=facing===1||facing===-1?facing:type==='flavio'||type==='jacare'?1:-1;
 if(target!==(spriteFacesRight(type)?1:-1)){context.translate(2*dx+frame.width*factor,0);context.scale(-1,1);}
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

// Cabeças revisadas uma vez nos atlas originais (quadro estável de cada ator).
// [esquerda, topo, largura, altura, eixo do pescoço], relativos ao frame.
// Recortes fixos não seguem as pernas/braços da corrida e não leem pixels em runtime.
const headCrops={
 flavio:[48,3,152,133,86],xandao:[28,1,114,128,65],haddad:[13,0,144,124,83],
 lula:[31,0,117,127,65],joice:[10,0,224,137,82],army:[17,1,128,119,73],
 dilma:[28,0,127,119,65],simone:[32,0,176,127,66],soraya:[19,0,204,132,76],
 'ze-gotinha':[27,0,113,121,62],
 vorcaro:[20,0,144,143,79],jair:[25,0,131,137,71],michelle:[25,0,137,141,70],eduardo:[29,0,129,142,69],
 carlos:[17,0,125,136,73],renan:[17,0,135,139,75],silas:[18,0,133,145,77],magno:[25,0,126,142,71],
 nikolas:[15,0,125,130,66],tarcisio:[28,0,125,136,69],damares:[21,0,173,136,76],bia:[30,0,165,133,67],
 trump:[10,0,156,134,83],milei:[12,0,164,145,78],bolsominion:[18,0,135,125,70],jacare:[0,0,129,90,81],
 boulos:[21,0,127,142,70],dino:[30,0,127,142,68],janones:[22,0,133,144,76],pf:[16,0,137,116,80]
};
const castHeadCrops={xandao:[36,0,100,111,60],haddad:[25,0,133,115,72],lula:[36,0,126,147,69],pf:[16,0,122,114,73],janones:[33,0,126,139,69],army:headCrops.army,joice:[29,0,218,135,76]};
/** Draw only the original head. x/y is the neck anchor; size is head height. */
export function drawSpriteHead(context,{type,x=0,y=0,size=40,phase=0}={}){
 if(!Number.isFinite(size)||size<=0||!Number.isFinite(x)||!Number.isFinite(y))return false;
 const running=runningGroups[type];
 let selected=type==='flavio'?{sheet:'hero',index:0}:running?{sheet:running.sheet,index:running.start}:actorGroups[type]?{sheet:'cast',index:actorGroups[type][0]}:null;
 if(!selected)return false;
 let sheet=sheets.get(selected.sheet),crop=selected.sheet==='cast'?castHeadCrops[type]:headCrops[type];
 if(!sheet&&actorGroups[type]&&sheets.has('cast')){selected={sheet:'cast',index:actorGroups[type][0]};sheet=sheets.get('cast');crop=castHeadCrops[type];}
 const frame=sheet?.frames[selected.index];if(!frame||!crop)return false;
 const [left,top,width,height,neckX]=crop;
 if(left<0||top<0||left+width>frame.width||top+height>frame.height)return false;
 const factor=size/height,dx=x-neckX*factor,dy=y-size,dw=width*factor;
 context.save();context.imageSmoothingEnabled=true;
 // Preserve the hair/hat at the top, taper the lower corners to the neck.
 // The mask removes shoulders, microphones and stray running hands.
 context.beginPath();
 for(const [i,[u,v]] of [[0,0],[1,0],[1,.70],[.83,.88],[.64,1],[.32,1],[.15,.88],[0,.70]].entries()){
  const px=dx+u*dw,py=dy+v*size;if(i)context.lineTo(px,py);else context.moveTo(px,py);
 }
 context.closePath();context.clip();
 context.drawImage(sheet.image,frame.x+left,frame.y+top,width,height,dx,dy,dw,size);
 context.restore();return true;
}

/** One drawImage samples one COMPLETE illustrated pose, including face, torso and shoes. */
export function drawCombatSprite(context,{type,x=0,y=0,alpha=1,...options}={}){
 const geometry=combatGeometryFor(type,options);if(!geometry)return false;
 const sheet=sheets.get(geometry.sheet);if(!sheet)return false;
 const {frame,factor,flip,rect}=geometry;
 context.save();context.globalAlpha*=alpha;context.imageSmoothingEnabled=true;
 context.translate(x,y);if(flip!==1)context.scale(flip,1);
 if(options.hurt){context.shadowColor='#ffd56b';context.shadowBlur=5;}
 context.drawImage(sheet.image,frame.x,frame.y,frame.width,frame.height,rect.x,rect.y,frame.width*factor,frame.height*factor);
 context.restore();return true;
}
