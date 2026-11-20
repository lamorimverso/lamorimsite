// Register complete drawings on a common cell without assembling body parts.
import sharp from 'sharp';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {combatDefinitions} from '../tanahoraflavio/runner-combat-sprite-data.mjs';
const root=new URL('../',import.meta.url),check=process.argv.includes('--check');
const sources=JSON.parse(await readFile(new URL('tools/redesign-art-sources.json',root),'utf8'));
async function output(path,bytes){
 const url=new URL(path,root);
 if(check){if(!(await readFile(url)).equals(Buffer.from(bytes)))throw Error('Redesigned art out of date: '+path);}
 else await writeFile(url,bytes);
}
function components(data,width,height){
 const seen=new Uint8Array(width*height),parts=[];
 for(let start=0;start<width*height;start++){
  if(seen[start]||data[start*4+3]<=64)continue;
  const stack=[start];seen[start]=1;let area=0,x0=width,y0=height,x1=0,y1=0;
  while(stack.length){
   const pixel=stack.pop(),x=pixel%width,y=Math.floor(pixel/width);area++;
   x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);
   for(const n of [pixel-1,pixel+1,pixel-width,pixel+width])if(n>=0&&n<width*height&&!seen[n]&&Math.abs(n%width-x)<=1&&data[n*4+3]>64){seen[n]=1;stack.push(n);}
  }
  if(area>150)parts.push({x0,y0,x1,y1,area});
 }
 return parts;
}
const definitions=[],campaignActors={};
for(const source of sources){
 const input=await readFile(new URL('tanahoraflavio/assets/redesign/'+source.input,root));
 const {data,info:{width,height}}=await sharp(input).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const rows=source.actors.length,parts=components(data,width,height),drawings=[];
 for(let row=0;row<rows;row++)for(let col=0;col<8;col++){
  const candidates=parts.filter(p=>Math.floor((p.x0+p.x1)/2/(width/8))===col&&Math.floor((p.y0+p.y1)/2/(height/rows))===row).sort((a,b)=>b.area-a.area);
  if(!candidates.length)throw Error('Missing full figure '+source.name+'/'+row+'/'+col);
  const selected=source.actors[row]==='povo'?candidates.filter(p=>p.area>900):candidates.slice(0,1);
  const x0=Math.max(0,Math.min(...selected.map(p=>p.x0))-2),y0=Math.max(0,Math.min(...selected.map(p=>p.y0))-2);
  const x1=Math.min(width-1,Math.max(...selected.map(p=>p.x1))+2),y1=Math.min(height-1,Math.max(...selected.map(p=>p.y1))+2);
  drawings.push({row,col,input,rect:{left:x0,top:y0,width:x1-x0+1,height:y1-y0+1},center:(col+.5)*width/8,ground:Math.max(...selected.map(p=>p.y1))+1});
 }
 // The hero already has dedicated approved artwork. Keep his actual pixels,
 // proportions and barrel anchors while updating the rest of these sheets.
 for(const item of source.preserve||[]){
  const bytes=await readFile(new URL('tanahoraflavio/assets/'+item.file,root));
  const frames=combatDefinitions[source.name].frames;
  for(let col=0;col<8;col++){
   const f=frames[item.sourceRow*4+Math.floor(col/2)],index=item.row*8+col;
   drawings[index]={row:item.row,col,input:bytes,rect:{left:f.x,top:f.y,width:f.width,height:f.height},center:f.center,ground:f.groundY,muzzle:f.muzzle};
  }
 }
 const placements=[],frames=[],layout=[];let packedHeight=0,packedWidth=0;
 for(let row=0;row<rows;row++){
  const group=drawings.filter(d=>d.row===row),type=source.actors[row],run=source.kind==='run'||type.endsWith('-run')||type==='flavio-air-shot';
  const ground=Math.max(...group.map(d=>d.ground));
  const ascent=Math.max(...group.map(d=>(run?ground:d.ground)-d.rect.top));
  const descent=Math.max(4,...group.map(d=>d.rect.top+d.rect.height-(run?ground:d.ground)));
  layout.push({y:packedHeight,ground,ascent,run});
  packedWidth=Math.max(packedWidth,group.reduce((n,d)=>n+d.rect.width+8,0)+8);
  packedHeight+=ascent+descent+8;
 }
 let cursor=4;
 for(const d of drawings){
  const {row,col,rect}=d,type=source.actors[row],run=source.kind==='run'||type.endsWith('-run')||type==='flavio-air-shot';
  if(col===0)cursor=4;
  const floor=run?layout[row].ground:d.ground;
  const left=cursor,top=layout[row].y+4+layout[row].ascent+rect.top-floor;
  cursor+=rect.width+8;
  placements.push({input:await sharp(d.input).extract(rect).png().toBuffer(),left,top});
  const center=left+d.center-rect.left,groundY=layout[row].y+4+layout[row].ascent;
  const muzzle=d.muzzle?{x:left+d.muzzle.x-rect.left,y:top+d.muzzle.y-rect.top}:
   {x:left+rect.width*(col===4||col===5?.06:.24),y:top+rect.height*(type==='meme-army'?.33:.48)};
  const headHeight=Math.round(rect.height*.49),headWidth=Math.min(rect.width,Math.round(headHeight*1.1));
  frames.push({x:left,y:top,width:rect.width,height:rect.height,center,groundY,muzzle,
   head:{left:Math.max(0,Math.min(rect.width-headWidth,Math.round(center-left-headWidth*.53))),top:0,width:headWidth,height:headHeight,neckX:headWidth*.52}});
 }
 const ordered=[];
 const running=row=>source.kind==='run'||source.actors[row].endsWith('-run')||source.actors[row]==='flavio-air-shot';
 for(let row=0;row<rows;row++)for(let key=0;key<4;key++)ordered.push({...frames[row*8+(running(row)?[0,2,4,6]:[0,3,4,6])[key]],next:rows*4+row*4+key});
 for(let row=0;row<rows;row++)for(let key=0;key<4;key++)ordered.push(frames[row*8+(running(row)?[1,3,5,7]:[1,2,5,7])[key]]);
 const packedPath='tanahoraflavio/assets/redesign/'+source.name.toLowerCase()+'.webp';
 // Explicit metadata-only mode is useful after pose ordering changes. It does
 // not re-encode pixels and is valid only for unchanged packed dimensions.
 let bytes;
 if(process.argv.includes('--metadata-only')){
  bytes=await readFile(new URL(packedPath,root));const info=await sharp(bytes).metadata();
  if(info.width!==packedWidth||info.height!==packedHeight)throw Error('Rebuild image before metadata: '+source.name);
 }else bytes=await sharp({create:{width:packedWidth,height:packedHeight,channels:4,background:'#00000000'}}).composite(placements).webp({quality:94,alphaQuality:100,effort:6}).toBuffer();
 const sha256=createHash('sha256').update(bytes).digest('hex'),file='redesign/'+source.name.toLowerCase()+'.webp';
 await output('tanahoraflavio/assets/'+file,bytes);
 definitions.push(`${source.name}:{url:new URL('./assets/${file}',import.meta.url).href+'?v=${sha256.slice(0,12)}',width:${packedWidth},height:${packedHeight},sha256:'${sha256}',redesigned:true,frames:${JSON.stringify(ordered)}}`);
 if(source.kind==='campaign')for(const [row,type] of source.actors.entries()){
  const group=[...ordered.slice(row*4,row*4+4),...ordered.slice(rows*4+row*4,rows*4+row*4+4)],neutral=group[0],head=neutral.head;
  campaignActors[type]={sheet:source.name,row,height:Math.max(...group.map(f=>f.groundY-f.y)),logicalHeight:type==='povo'?105:110,portrait:type==='povo'?{x:neutral.x,y:neutral.y,width:neutral.width,height:neutral.height}:{x:neutral.x+head.left,y:neutral.y,width:head.width,height:head.height}};
 }
 console.log(source.name,ordered.length,'complete frames,',bytes.length,'bytes');
}
await output('tanahoraflavio/runner-redesign-data.mjs',`// Generated by tools/build-redesigned-art.mjs. Canonical poses plus drawn inbetweens.\nexport const redesignDefinitions={${definitions.join(',\n')}};\nexport const redesignedCampaignActors=${JSON.stringify(campaignActors,null,2)};\n`);
