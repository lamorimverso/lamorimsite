import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {join} from 'node:path';
import {definitions} from '../tanahoraflavio/runner-sprite-data.mjs';
import {spriteFrameFor} from '../tanahoraflavio/runner-sprites.mjs';
const require=createRequire(import.meta.url),sharp=require(join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'','sharp'));
const actors={cameos:['dilma','simone','soraya','ze-gotinha'],chase:['haddad','lula','xandao','joice']};
test('oito personagens alternam quatro desenhos reais de corrida sem trocar de identidade',()=>{
 for(const [sheet,names] of Object.entries(actors))for(const [row,type] of names.entries()){
  const selected=Array.from({length:4},(_,phase)=>spriteFrameFor(type,{phase}));
  assert.deepEqual(selected,Array.from({length:4},(_,i)=>({sheet,index:row*4+i})));
 }
});
test('atlas extras são lossless e as silhuetas das pernas mudam entre as quatro poses',async()=>{
 for(const name of ['cameos','chase']){
  const def=definitions[name];assert.ok(def,'atlas '+name+' no manifesto');
  const source=new URL('../tanahoraflavio/assets/'+name+'-motion-v1.png',import.meta.url),encoded=new URL('../tanahoraflavio/assets/'+name+'-motion-v1.webp',import.meta.url);
  const [png,webp]=await Promise.all([readFile(source),readFile(encoded)]);
  assert.equal(createHash('sha256').update(webp).digest('hex'),def.sha256);
  const [a,b]=await Promise.all([sharp(png).ensureAlpha().raw().toBuffer(),sharp(webp).ensureAlpha().raw().toBuffer()]);for(let i=0;i<a.length;i+=4){assert.equal(a[i+3],b[i+3]);if(a[i+3]===0)continue;for(let c=0;c<3;c++)assert.equal(a[i+c],b[i+c],'cor visível preservada');}
  for(let row=0;row<4;row++){
   const masks=[];for(const f of def.frames.slice(row*4,row*4+4)){
    const y=f.y+Math.floor(f.height*.65),height=f.y+f.height-y;
    const bytes=await sharp(png).extract({left:f.x,top:y,width:f.width,height}).resize(72,40,{fit:'fill'}).extractChannel(3).raw().toBuffer();
    masks.push(createHash('sha256').update(Buffer.from([...bytes].map(alpha=>alpha>16?255:0))).digest('hex'));
   }assert.ok(new Set(masks).size>=3,'pernas não são só translação do mesmo desenho');
  }
 }
});
test('poses específicas de ataque dos chefes permanecem no atlas de ação',()=>{
 for(const type of ['haddad','lula','xandao'])for(const pose of [{attacking:true},{preparing:true}])assert.equal(spriteFrameFor(type,pose).sheet,'cast');
});
