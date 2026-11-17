const {test,before,after}=require('node:test');
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path');
const {chromium}=require('playwright');let browser,server,base;
before(async()=>{
 const root=path.resolve(__dirname,'..');
 server=http.createServer(async(req,res)=>{try{
  const requested=new URL(req.url,'http://localhost').pathname;
  if(requested.endsWith('/__art-review.html')){res.setHeader('Content-Type','text/html');res.end('<!doctype html><title>Illustrated signature review</title>');return;}
  const file=path.resolve(root,'.'+requested);if(!file.startsWith(root+path.sep))throw Error('outside');
  res.setHeader('Content-Type',path.extname(file)==='.mjs'?'text/javascript':'image/webp');res.end(await fs.readFile(file));
 }catch{res.writeHead(404);res.end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));base=`http://127.0.0.1:${server.address().port}/tanahoraflavio/`;
 browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
});
after(async()=>{await browser?.close();await new Promise(r=>server?.close(r));});

test('real projectile renderer uses all four complete signature poses at gameplay size in both directions',async()=>{
 const page=await browser.newPage();try{
  await page.goto(base+'__art-review.html');
  const rows=await page.evaluate(async()=>{
   const art=await import('./runner-art.mjs'),artSource=await(await fetch('./runner-art.mjs')).text();
   const weaponPath=artSource.match(/from ["']([^"']*runner-weapon-art[^"']*)["']/)[1];
   const weaponSource=await(await fetch(weaponPath)).text(),spritePath=weaponSource.match(/from ["']([^"']*runner-sprites[^"']*)["']/)[1];
   const sprites=await import(spritePath);await sprites.loadSprites(()=>{},{coreOnly:true});
   const rows=[];
   for(const type of ['handcuffs','microphone','hammer','mandado','receipts','budget-sheets','parachute-cross','lhand'])for(const height of [44,72,84])for(const facing of [-1,1]){
    const poses=[],still=[];
    for(let frame=0;frame<4;frame++)for(const reducedMotion of [false,true]){
     const canvas=document.createElement('canvas');canvas.width=200;canvas.height=200;const c=canvas.getContext('2d');
     c.translate(100,100);c.scale(facing,1);
     let images=0;const original=c.drawImage.bind(c);c.drawImage=(...args)=>{images++;return original(...args);};
     art.drawProjectile(c,{type,x:-23,y:0,width:46,height,speed:0,launchX:0,projectile:true,launched:true,cast:{flightAge:frame*.06}},0,frame*1.44,{reducedMotion});
     const pixels=c.getImageData(0,0,200,200).data;let filled=0,hash=2166136261;
     for(let i=0;i<pixels.length;i++){hash=Math.imul(hash^pixels[i],16777619);if(i%4===3&&pixels[i]>100)filled++;}
     (reducedMotion?still:poses).push({hash,filled,images});
    }
    rows.push({type,height,facing,poses,still});
   }return rows;
  });
  for(const row of rows){
   assert.ok(row.poses.every(p=>p.images===1&&p.filled>140),JSON.stringify(row));
   assert.equal(new Set(row.poses.map(p=>p.hash)).size,4,JSON.stringify(row));
   assert.equal(new Set(row.still.map(p=>p.hash)).size,1,JSON.stringify(row));
  }
 }finally{await page.close();}
});

test('runtime lossless sheets retain source alpha and each complete pose has distinct source pixels',async()=>{
 const sharp=require('sharp'),crypto=require('node:crypto');
 const {signatureDefinitions}=await import('../tanahoraflavio/runner-signature-sprite-data.mjs');
 for(const d of Object.values(signatureDefinitions)){
  const source=await sharp(new URL(d.url).pathname.replace(/\.webp$/,'.png')).ensureAlpha().raw().toBuffer();
  const runtime=await sharp(new URL(d.url).pathname).ensureAlpha().raw().toBuffer();
  const input=await fs.readFile(new URL(d.url));assert.equal(crypto.createHash('sha256').update(input).digest('hex'),d.sha256);
  for(let i=3;i<source.length;i+=4)assert.equal(runtime[i],source[i],'source alpha changed at '+i);
  for(let row=0;row<4;row++){
   const hashes=[];
   for(const f of d.frames.slice(row*4,row*4+4)){
    const bytes=await sharp(new URL(d.url).pathname).extract({left:f.x,top:f.y,width:f.width,height:f.height}).raw().toBuffer();
    hashes.push(crypto.createHash('sha256').update(bytes).digest('hex'));
   }
   assert.equal(new Set(hashes).size,4,'four distinct complete drawings');
  }
 }
});

test('offscreen illustrated bodies draw the complete source pixels without overlays or material changes',async()=>{
 const page=await browser.newPage();try{
  await page.goto(base+'__art-review.html');
  const comparisons=await page.evaluate(async()=>{
   const weaponSource=await(await fetch('./runner-weapon-art.mjs')).text();
   const sprites=await import(weaponSource.match(/from ["']([^"']*runner-sprites[^"']*)["']/)[1]);
   const {signatureDefinitions,signatureProps}=await import('./runner-signature-sprite-data.mjs');
   await sprites.loadSprites(()=>{},{coreOnly:true});
   const images={};for(const [name,d] of Object.entries(signatureDefinitions)){const image=new Image();image.src=d.url;await image.decode();images[name]=image;}
   const results=[];
   for(const [type,prop] of Object.entries(signatureProps))for(let pose=0;pose<4;pose++){
    const contexts=[0,1].map(()=>{const canvas=document.createElement('canvas');canvas.width=640;canvas.height=480;const c=canvas.getContext('2d');c.translate(320,400);return c;});
    sprites.drawIllustratedProp(contexts[0],{type,width:prop.width,height:prop.height,phase:pose*1.44});
    const f=signatureDefinitions[prop.sheet].frames[prop.start+pose];
    contexts[1].drawImage(images[prop.sheet],f.x,f.y,f.width,f.height,-f.width/2,-prop.height/2-f.height/2,f.width,f.height);
    const [a,b]=contexts.map(c=>c.getImageData(0,0,640,480).data);let changed=0;
    for(let i=0;i<a.length;i++)if(a[i]!==b[i])changed++;
    results.push({type,pose,changed});
   }return results;
  });
  assert.equal(comparisons.length,32);
  for(const row of comparisons)assert.equal(row.changed,0,JSON.stringify(row));
 }finally{await page.close();}
});
