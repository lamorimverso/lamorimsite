// Browser review through the actual projectile renderer, before/after sheet load.
import {chromium} from 'playwright';
import http from 'node:http';
import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
const root=fileURLToPath(new URL('../',import.meta.url));
const server=http.createServer(async(req,res)=>{try{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname.endsWith('/__review.html')){res.setHeader('Content-Type','text/html');res.end('<!doctype html><style>body{margin:0;background:#edf2f5}</style>');return;}
 const file=path.resolve(root,'.'+url.pathname);if(!file.startsWith(root))throw Error('outside');
 res.setHeader('Content-Type',file.endsWith('.mjs')?'text/javascript':'image/webp');res.end(await readFile(file));
}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
try{
 const page=await browser.newPage({viewport:{width:1000,height:520},deviceScaleFactor:1});
 await page.goto(`http://127.0.0.1:${server.address().port}/tanahoraflavio/__review.html`);
 await page.evaluate(async()=>{
  const art=await import('./runner-art.mjs'),artSource=await(await fetch('./runner-art.mjs')).text();
  const weaponPath=artSource.match(/from ["']([^"']*runner-weapon-art[^"']*)["']/)[1],weaponSource=await(await fetch(weaponPath)).text();
  const sprites=await import(weaponSource.match(/from ["']([^"']*runner-sprites[^"']*)["']/)[1]);
  const old=[];
  for(let frame=0;frame<4;frame++){
   const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=520;const c=canvas.getContext('2d');
   for(const [row,height] of [72,84].entries())art.drawProjectile(c,{type:'handcuffs',x:185,y:0,width:46,height,launched:true,projectile:true,speed:0,launchX:208,cast:{flightAge:frame*.06}},195+row*190,frame*1.44);
   old.push(canvas);
  }
  await sprites.loadSprites(()=>{},{coreOnly:true});
  for(let frame=0;frame<4;frame++){
   const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=520;canvas.id='frame-'+frame;canvas.style.display=frame?'none':'block';document.body.append(canvas);const c=canvas.getContext('2d');
   c.fillStyle='#edf2f5';c.fillRect(0,0,1000,520);c.fillStyle='#293548';c.font='bold 23px system-ui';c.fillText('PF + handcuffs · actual projectile renderer',24,34);
   c.font='14px system-ui';c.fillText('Original character · actual 46×72 / 46×84 envelopes · uniform illustrated scale · '+frame*60+' ms',24,60);
   c.font='bold 17px system-ui';c.fillText('Before: vector body',30,98);c.fillText('After: complete illustrated pose',380,98);
   for(const [row,height] of [72,84].entries()){
    const y=195+row*190;
    sprites.drawCombatSprite(c,{type:'pf',x:85,y:y+42,scale:1,frame:2});
    sprites.drawCombatSprite(c,{type:'pf',x:435,y:y+42,scale:1,frame:2});
    art.drawProjectile(c,{type:'handcuffs',x:535,y:0,width:46,height,launched:true,projectile:true,speed:0,launchX:558,cast:{flightAge:frame*.06}},y,frame*1.44);
    c.fillStyle='#63778b';c.font='14px system-ui';c.fillText('46×'+height+' px',650,y+7);
    c.save();c.translate(840,y+42);c.scale(2,2);art.drawProjectile(c,{type:'handcuffs',x:-23,y:0,width:46,height,launched:true,projectile:true,speed:0,launchX:0,cast:{flightAge:frame*.06}},0,frame*1.44);c.restore();
    c.fillText('2× detail',805,y+102);
   }
   c.drawImage(old[frame],0,0);
  }
 });
 const pages=[];
 for(let frame=0;frame<4;frame++){
  await page.evaluate(frame=>{for(let i=0;i<4;i++)document.getElementById('frame-'+i).style.display=i===frame?'block':'none';},frame);
  const bytes=await page.screenshot();
  if(frame===0)await writeFile(path.join(root,'tanahoraflavio/docs/pf-handcuffs-browser-2026-11-16.png'),bytes);
  pages.push(await sharp(bytes).ensureAlpha().raw().toBuffer());
 }
 await sharp(Buffer.concat(pages),{raw:{width:1000,height:2080,channels:4,pageHeight:520}}).webp({lossless:true,loop:0,delay:60}).toFile(path.join(root,'tanahoraflavio/docs/pf-handcuffs-browser-animated-2026-11-16.webp'));
 console.log('Saved actual browser PF projectile comparison at 46×72 / 46×84.');
}finally{await browser.close();await new Promise(r=>server.close(r));}
