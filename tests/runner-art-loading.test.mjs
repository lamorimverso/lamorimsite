import test from 'node:test';
import assert from 'node:assert/strict';

let moduleId=0;

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
  const hero=image.src.includes('flavio-run');
  image.naturalWidth=size?.width??(hero?1536:1254);
  image.naturalHeight=size?.height??(hero?1024:1254);
  image.onload?.();
 }
 return {sprites,images,timers,load};
}

function drawingContext(){
 const drawn=[],transforms=[];
 return {drawn,transforms,globalAlpha:1,save(){},restore(){},
  translate(...args){transforms.push(['translate',...args]);},
  scale(...args){transforms.push(['scale',...args]);},
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
 for(const image of images.slice(2))load(image);
 await retry;
 const context=drawingContext();
 assert.equal(sprites.drawSpriteActor(context),true);
 assert.equal(context.drawn[0][0],images[2],'a renderização usa a tentativa nova');
 assert.deepEqual(progress,[[1,2],[2,2]]);
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
 for(const image of images.slice(2))load(image);
 await retry;
 const context=drawingContext();
 sprites.drawSpriteActor(context,{type:'xandao'});
 assert.equal(context.drawn[0][0],images[3]);
 assert.deepEqual(progress,[1,2]);
});

test('recortes pré-calculados conservam a orientação original à direita em todas as poses do herói',async t=>{
 const {sprites,images,load}=await browserEvents(t);
 const pending=sprites.loadSprites();
 assert.equal(sprites.loadSprites(),pending,'chamadas simultâneas compartilham a tentativa');
 for(const image of images)load(image);
 await pending;
 const hero=drawingContext();
 assert.equal(sprites.drawSpriteActor(hero,{x:100,y:200}),true);
 assert.deepEqual(hero.drawn[0].slice(1,5),[73,20,425,490]);
 assert.ok(Math.abs(hero.drawn[0][8]-490*94/491)<1e-10);
 assert.deepEqual(hero.transforms,[],'o PNG original já olha para a direita e não pode ser invertido');
 for(const pose of [{phase:4},{airborne:true},{landing:true},{hurt:true}]){
  const context=drawingContext();
  assert.equal(sprites.drawSpriteActor(context,{type:'flavio',x:100,y:200,...pose}),true);
  assert.deepEqual(context.transforms,[],'corrida, salto, aterrissagem e derrota mantêm a direção do atlas');
 }
 const boss=drawingContext();
 assert.equal(sprites.drawSpriteActor(boss,{type:'xandao',attacking:true}),true);
 assert.deepEqual(boss.drawn[0].slice(1,5),[636,66,304,247]);
 assert.ok(Math.abs(boss.drawn[0][8]-247*94/308)<1e-10);
 assert.deepEqual(boss.transforms,[]);
 await sprites.loadSprites();
 assert.equal(images.length,2,'o atlas pronto continua em memória');
});

test('atlas com dimensões incompatíveis é rejeitado e pode ser tentado de novo',async t=>{
 const {sprites,images,load}=await browserEvents(t);
 const first=sprites.loadSprites();
 const firstResult=first.then(()=>null,error=>error);
 load(images[0],{width:10,height:10});
 assert.match((await firstResult).message,/dimens|atlas/i);
 const retry=sprites.loadSprites();
 for(const image of images.slice(2))load(image);
 await retry;
 assert.equal(sprites.drawSpriteActor(drawingContext()),true);
});
