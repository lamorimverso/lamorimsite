import test from 'node:test';
import assert from 'node:assert/strict';
import {spriteDefinitions as definitions} from '../tanahoraflavio/runner-sprites.mjs';

let moduleId=0;
const sheetCount=Object.keys(definitions).length;

async function browserEvents(t){
 const images=[],timers=[];
 for(const [name,value] of Object.entries({
  Image:class{
   constructor(){this.onload=null;this.onerror=null;this.naturalWidth=0;this.naturalHeight=0;images.push(this);}
   set src(value){this.url=value;}
   get src(){return this.url;}
  },
  document:{createElement(){throw new Error('A geometria deve vir do manifesto, sem ler Canvas no navegador');}}
 })){
  const original=Object.getOwnPropertyDescriptor(globalThis,name);
  Object.defineProperty(globalThis,name,{configurable:true,writable:true,value});
  t.after(()=>original?Object.defineProperty(globalThis,name,original):delete globalThis[name]);
 }
 t.mock.method(globalThis,'setTimeout',(callback,delay)=>{
  const timer={id:timers.length+1,callback,delay,cleared:false};timers.push(timer);return timer.id;
 });
 t.mock.method(globalThis,'clearTimeout',id=>{const timer=timers.find(item=>item.id===id);if(timer)timer.cleared=true;});
 const sprites=await import(`../tanahoraflavio/runner-sprites.mjs?art-loading-test=${++moduleId}`);
 function load(image,size){
  const definition=Object.values(definitions).find(d=>d.url===image.src);
  image.naturalWidth=size?.width??definition.width;
  image.naturalHeight=size?.height??definition.height;
  image.onload?.();
 }
 return {sprites,images,timers,load};
}

function drawingContext(){
 const drawn=[],transforms=[];
 return {drawn,transforms,globalAlpha:1,save(){},restore(){},
  beginPath(){},moveTo(){},lineTo(){},closePath(){},clip(){},fill(){},stroke(){},quadraticCurveTo(){},
  translate(...args){transforms.push(['translate',...args]);},
  scale(...args){transforms.push(['scale',...args]);},
  rotate(...args){transforms.push(['rotate',...args]);},
  drawImage(...args){drawn.push(args);}};
}

test('imagem que não responde encerra em 15 s e permite carregar novamente',async t=>{
 const {sprites,images,timers,load}=await browserEvents(t);
 const progress=[];
 const first=sprites.loadSprites();
 const firstResult=first.then(()=>null,error=>error);
 const deadline=timers.find(timer=>timer.delay===15000);
 assert.ok(deadline,'o carregamento precisa ter um prazo de 15 segundos');
 const lateLoad=images[0].onload,lateError=images[1].onerror;
 deadline.callback();
 assert.match((await firstResult).message,/15|tempo/i);

 const retry=sprites.loadSprites((count,total)=>progress.push([count,total]));
 assert.notEqual(retry,first);
 lateLoad();lateError();deadline.callback();
 assert.deepEqual(progress,[],'eventos da tentativa encerrada não afetam a nova');
 assert.equal(sprites.drawSpriteActor(drawingContext()),false,'a folha antiga não é instalada');
 for(const image of images.slice(sheetCount))load(image);
 await retry;
 const context=drawingContext();
 assert.equal(sprites.drawSpriteActor(context),true);
 assert.equal(context.drawn[0][0],images[sheetCount],'a renderização usa a tentativa nova');
 assert.deepEqual(progress,Array.from({length:sheetCount},(_,i)=>[i+1,sheetCount]));
 assert.ok(timers.every(timer=>timer.cleared),'não restam prazos ativos após concluir');
});

test('erro de imagem descarta a tentativa incompleta e ignora seus callbacks tardios',async t=>{
 const {sprites,images,load}=await browserEvents(t);
 const first=sprites.loadSprites();
 const firstResult=first.then(()=>null,error=>error);
 const oldLoad=images[1].onload,oldError=images[1].onerror;
 load(images[0]);
 images[1].onerror();
 assert.match((await firstResult).message,/carregar|personagens/i);
 assert.equal(sprites.drawSpriteActor(drawingContext()),false,'uma tentativa incompleta não publica o atlas');

 const progress=[];
 const retry=sprites.loadSprites(count=>progress.push(count));
 oldLoad();oldError();
 assert.deepEqual(progress,[]);
 for(const image of images.slice(sheetCount))load(image);
 await retry;
 const context=drawingContext();
 sprites.drawSpriteActor(context,{type:'xandao'});
 assert.equal(context.drawn[0][0],images[sheetCount+Object.keys(definitions).indexOf('chase')]);
 assert.deepEqual(progress,Array.from({length:sheetCount},(_,i)=>i+1));
});

test('recortes pré-calculados conservam a orientação original à direita em todas as poses do herói',async t=>{
 const {sprites,images,load}=await browserEvents(t);
 const pending=sprites.loadSprites();
 assert.equal(sprites.loadSprites(),pending,'chamadas simultâneas compartilham a tentativa');
 for(const image of images)load(image);
 await pending;
 const hero=drawingContext();
 assert.equal(sprites.drawSpriteActor(hero,{x:100,y:200}),true);
 assert.equal(hero.drawn[0][0],images[0]);
 assert.ok(hero.drawn[0][7]>20&&hero.drawn[0][8]>75,'o personagem tem tamanho legível');
 assert.deepEqual(hero.transforms,[],'o PNG original já olha para a direita e não pode ser invertido');
 for(const pose of [{phase:7},{airborne:true},{airborne:true,falling:true},{landing:true},{hurt:true}]){
  const context=drawingContext();
  assert.equal(sprites.drawSpriteActor(context,{type:'flavio',x:100,y:200,...pose}),true);
  if(pose.landing){
   assert.deepEqual(context.transforms[0],['translate',100,200],'a pose mantém o pivô de apoio');
   assert.ok(context.transforms.filter(call=>call[0]==='scale').every(([,x,y])=>x===y&&x>0),'o rig não inverte nem deforma a arte');
   assert.equal(context.drawn.length,4,'usa cabeça, sapatos e item do atlas original');
   assert.ok(context.drawn.every(([image])=>image===images[Object.keys(definitions).indexOf('heroCrouch')]));
  }else{
   assert.deepEqual(context.transforms,[],'corrida, salto e derrota mantêm a direção do atlas');
   assert.equal(context.drawn[0][0],images[0]);
  }
 }
 const boss=drawingContext();
 assert.equal(sprites.drawSpriteActor(boss,{type:'xandao',attacking:true}),true);
 assert.equal(boss.drawn[0][0],images[1]);
 assert.ok(boss.drawn[0][7]>20&&boss.drawn[0][8]>60);
 assert.deepEqual(boss.transforms,[]);
 await sprites.loadSprites();
 assert.equal(images.length,sheetCount,'o atlas pronto continua em memória');
});

test('atlas com dimensões incompatíveis é rejeitado e pode ser tentado de novo',async t=>{
 const {sprites,images,load}=await browserEvents(t);
 const first=sprites.loadSprites();
 const firstResult=first.then(()=>null,error=>error);
 load(images[0],{width:10,height:10});
 assert.match((await firstResult).message,/dimens|atlas/i);
 const retry=sprites.loadSprites();
 for(const image of images.slice(sheetCount))load(image);
 await retry;
 assert.equal(sprites.drawSpriteActor(drawingContext()),true);
});

test('corrida base carrega antes dos apoios e falha opcional não descarta os personagens prontos',async t=>{
 const {sprites,images,load}=await browserEvents(t);
 const core=sprites.loadSprites(()=>{},{coreOnly:true});
 assert.equal(images.length,16,'folhas essenciais incluem combate, agachamento e objetos ilustrados');
 for(const image of images)load(image);await core;
 assert.equal(sprites.drawSpriteActor(drawingContext(),{type:'pf'}),true,'PF usa seu próprio desenho original enquanto a expansão carrega');
 for(const type of ['army-run','army-rio-run','army-argentina-run','army-florida-run','army-casa-branca-run'])assert.equal(sprites.drawCombatSprite(drawingContext(),{type,frame:2}),true,'uniforme inteiro é essencial: '+type);
 const extras=sprites.loadSprites(),error=extras.then(()=>null,e=>e);
 assert.equal(images.length,20,'as quatro folhas de apoio não baixam novamente as dezesseis prontas');
 images[16].onerror();assert.ok(await error);
 assert.equal(sprites.drawSpriteActor(drawingContext(),{type:'flavio'}),true);
 assert.equal(sprites.drawSpriteActor(drawingContext(),{type:'pf'}),true);
 const retry=sprites.loadSprites();for(const image of images.slice(20))load(image);await retry;
 assert.equal(sprites.drawSpriteActor(drawingContext(),{type:'boulos'}),true);
});
test('rostos de todos os chefes normais estão nos atlas essenciais',async t=>{
 const {sprites,images,load}=await browserEvents(t);const pending=sprites.loadSprites(()=>{},{coreOnly:true});for(const image of images)load(image);await pending;
 const c=new Proxy({globalAlpha:1},{get(o,k){return k in o?o[k]:()=>{};}});
 for(const type of ['boulos','dino','pf','janones','haddad','lula','xandao','joice','dilma','simone','soraya'])assert.equal(sprites.drawSpriteHead(c,{type,x:30,y:45,size:40}),true,type+' possui rosto mesmo sem os apoios');
});

test('falha no objeto ilustrado essencial descarta a tentativa inteira e aceita retry',async t=>{
 const {sprites,images,load}=await browserEvents(t),progress=[];
 const first=sprites.loadSprites((n,total)=>progress.push([n,total]),{coreOnly:true}),result=first.catch(error=>error);
 const prop=images.find(image=>image.src.includes('signature-props-a-v1'));
 assert.ok(prop,'algemas são essenciais para a primeira partida');
 for(const image of images)if(image!==prop)load(image);
 assert.equal(sprites.drawSpriteActor(drawingContext()),false,'não publica personagens antes dos objetos essenciais');
 prop.onerror();assert.match((await result).message,/carregar/i);
 assert.equal(sprites.drawIllustratedProp(drawingContext(),{type:'handcuffs'}),false);
 const previous=images.length,retry=sprites.loadSprites(()=>{},{coreOnly:true});
 for(const image of images.slice(previous))load(image);await retry;
 assert.equal(sprites.drawIllustratedProp(drawingContext(),{type:'handcuffs',width:46,height:72}),true);
 assert.equal(sprites.drawSpriteActor(drawingContext()),true);
});
