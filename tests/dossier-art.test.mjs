import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {join} from 'node:path';
import {definitions} from '../tanahoraflavio/runner-sprite-data.mjs';
import {spriteFrameFor,spriteScaleFor} from '../tanahoraflavio/runner-sprites.mjs';
import * as art from '../tanahoraflavio/runner-art.mjs';
const require=createRequire(import.meta.url),sharp=require(join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'','sharp'));
const rows={alliesA:['vorcaro','jair','michelle','eduardo'],alliesB:['carlos','renan','silas','magno'],alliesC:['nikolas','tarcisio','damares','bia'],alliesD:['trump','milei','bolsominion','jacare'],pursuers:['boulos','dino','janones','pf']};
test('novos atores usam suas quatro poses reais, sem trocar identidade por um policial',()=>{
 for(const [sheet,actors] of Object.entries(rows))for(const [row,actor] of actors.entries()){
  assert.deepEqual(Array.from({length:4},(_,phase)=>spriteFrameFor(actor,{phase})),Array.from({length:4},(_,i)=>({sheet,index:row*4+i})),actor);
 }
 assert.equal(spriteFrameFor('personagem-inexistente'),null,'falta de arte não atribui outro rosto');
});
test('novos atlas preservam alpha e recortes limpos com passadas realmente distintas',async()=>{
 for(const [name,actors] of Object.entries(rows)){
  const d=definitions[name];assert.ok(d,'folha integrada: '+name);
  const source=({alliesA:'allies-motion-a-v1',alliesB:'allies-motion-b-v1',alliesC:'allies-motion-c-v1',alliesD:'allies-motion-d-v2',pursuers:'pursuers-motion-v1'})[name];
  const bytes=await readFile(new URL('../tanahoraflavio/assets/'+source+'.webp',import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),d.sha256);
  const {data,info}=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});assert.equal(info.width,d.width);assert.equal(info.height,d.height);
  for(const [row,actor] of actors.entries()){
   const masks=[];for(const f of d.frames.slice(row*4,row*4+4)){
    assert.ok(f.width>0&&f.height>0&&f.x>=0&&f.y>=0&&f.x+f.width<=d.width&&f.y+f.height<=d.height);
    let interior=0,edge=0;for(let y=f.y;y<f.y+f.height;y++)for(let x=f.x;x<f.x+f.width;x++){
     const a=data[(y*info.width+x)*4+3];if(a>16)interior++;if(x===f.x||x===f.x+f.width-1||y===f.y||y===f.y+f.height-1)edge=Math.max(edge,a);
    }assert.ok(interior>100,'recorte contém ator');assert.ok(edge<=8,'margem sem pixel opaco de personagem vizinho');
    const mask=await sharp(bytes).extract({left:f.x,top:f.y+Math.floor(f.height*.65),width:f.width,height:Math.ceil(f.height*.35)}).resize(72,40,{fit:'fill'}).extractChannel(3).raw().toBuffer();
    masks.push(createHash('sha256').update(mask).digest('hex'));
   }assert.ok(new Set(masks).size>=3,actor+' tem passada, não translação da mesma pose');
  }
 }
});
test('jacaré desenhado cabe na forma baixa e mantém proporções',()=>{
 const d=definitions.alliesD;assert.ok(d);const factor=spriteScaleFor('jacare','alliesD',d.frames,1);
 for(const f of d.frames.slice(12,16)){assert.ok(f.height*factor<=30);assert.ok(f.width*factor<=76);assert.ok(f.width/f.height>2.3);}
});
test('aviso da queda usa o mesmo alvo e a mesma altura do objeto físico',()=>{
 assert.equal(typeof art.fallingThreatGeometry,'function');
 const o={x:100,width:56,height:44,y:100,age:.6,warningFor:1.2};let g=art.fallingThreatGeometry(o,246);
 assert.equal(g.centerX,128);assert.equal(g.bodyY,146);assert.equal(g.showBody,false);assert.equal(g.width,56);
 o.age=1.3;g=art.fallingThreatGeometry(o,246);assert.equal(g.showBody,true);assert.equal(g.bodyY,146);
});
