const {test,before,after}=require('node:test');
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path');
const {chromium}=require('playwright');let browser,server,base;
before(async()=>{const root=path.resolve(__dirname,'..');server=http.createServer(async(req,res)=>{try{let file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!file.startsWith(root+path.sep))throw Error('outside');if((await fs.stat(file)).isDirectory())file=path.join(file,'index.html');res.setHeader('Content-Type',({'.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.html':'text/html','.webp':'image/webp','.mp3':'audio/mpeg'})[path.extname(file)]||'application/octet-stream');res.end(await fs.readFile(file));}catch{res.writeHead(404);res.end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));base=`http://127.0.0.1:${server.address().port}/tanahoraflavio/`;browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});});
after(async()=>{await browser?.close();await new Promise(r=>server?.close(r));});
test('corpos inteiros continuam preenchidos e animados sem contar cabeça, nave ou partículas',async()=>{
 const page=await browser.newPage();try{await page.goto(base);const rows=await page.evaluate(async()=>{
  const {drawCharacterBody}=await import('./runner-body-art.mjs'),{standingEnemyPose}=await import('./runner-cast-pose.mjs');
  const cast=['haddad','lula','xandao','pf','army','janones','joice','dilma','simone','soraya','boulos','dino','bossonari','flavio','ze-gotinha','vorcaro','jair','michelle','eduardo','carlos','renan','silas','magno','nikolas','tarcisio','damares','bia','trump','milei','bolsominion'];
  const rows=[];for(const type of cast)for(const scale of [.6,1,2.5]){const frames=[];for(const progress of [.1,.9]){const c=document.createElement('canvas');c.width=500;c.height=380;const ctx=c.getContext('2d');ctx.translate(250,310);ctx.scale(scale,scale);drawCharacterBody(ctx,standingEnemyPose({phase:4,preparing:true,action:'crouch',progress}),{type,phase:4});frames.push(ctx.getImageData(0,0,500,380).data);}
   let filled=0,changed=0;for(let i=3;i<frames[0].length;i+=4){if(frames[0][i]>150)filled++;if(frames[0][i]!==frames[1][i]||frames[0][i-1]!==frames[1][i-1])changed++;}rows.push({type,scale,filled,changed});}return rows;
 });for(const row of rows){assert.ok(row.filled>700*row.scale**2,JSON.stringify(row));assert.ok(row.changed>60*row.scale**2,JSON.stringify(row));}}finally{await page.close();}
});
test('23 famílias de armas têm desenho e movimento interno em três tamanhos reais',async()=>{
 const page=await browser.newPage();try{await page.goto(base);const rows=await page.evaluate(async()=>{
  const {drawCompleteWeapon,COMPLETE_WEAPONS}=await import('./runner-weapon-art.mjs');const rows=[];
  for(const type of COMPLETE_WEAPONS)for(const width of [16,46,138]){const frames=[];for(const phase of [0,7]){const c=document.createElement('canvas');c.width=512;c.height=512;const ctx=c.getContext('2d');ctx.translate(256,400);drawCompleteWeapon(ctx,{type,width,height:width*1.8,phase});frames.push(ctx.getImageData(0,0,512,512).data);}let filled=0,changed=0;for(let i=3;i<frames[0].length;i+=4){if(frames[0][i]>150)filled++;if(frames[0][i]!==frames[1][i]||frames[0][i-1]!==frames[1][i-1])changed++;}rows.push({type,width,filled,changed});}return rows;
 });assert.equal(rows.length,69);for(const row of rows){assert.ok(row.filled>row.width**2*.07,JSON.stringify(row));assert.ok(row.changed>2,JSON.stringify(row));}}finally{await page.close();}
});


test('armas nas proporções reais do motor ocupam a altura anunciada e ficam junto da colisão',async()=>{
 const page=await browser.newPage();try{await page.goto(base);const rows=await page.evaluate(async()=>{
  const {drawCompleteWeapon,COMPLETE_WEAPONS}=await import('./runner-weapon-art.mjs');
  const sizes={hammer:[46,44],mandado:[42,44],microphone:[46,40],handcuffs:[46,40],barrier:[44,32],stamp:[44,36],message:[44,36],lhand:[60,46],receipts:[44,40],'paper-gate':[44,40],'budget-sheets':[46,42],'parachute-cross':[46,44],'cloroquina-prop':[52,38],'ivermectina-prop':[52,38],'rolling-case':[40,30],'falling-case':[36,36],case:[34,28],popcorn:[40,35],wind:[46,44],'court-seal':[44,44],'signal-flare':[38,42],'terere-gourd':[44,44],'harp-note':[42,44]};
  const rows=[];for(const type of COMPLETE_WEAPONS)for(const tall of [false,true]){
   const [width,natural]=sizes[type],height=tall?84:natural,c=document.createElement('canvas');c.width=400;c.height=240;const ctx=c.getContext('2d');ctx.translate(200,180);drawCompleteWeapon(ctx,{type,width,height,phase:5});
   const data=ctx.getImageData(0,0,c.width,c.height).data;let minY=Infinity,maxY=-Infinity,minX=Infinity,maxX=-Infinity;
   for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(data[(y*c.width+x)*4+3]>100){minY=Math.min(minY,y);maxY=Math.max(maxY,y);minX=Math.min(minX,x);maxX=Math.max(maxX,x);}
   rows.push({type,width,height,tall,minY,maxY,minX,maxX,visibleHeight:maxY-minY+1});
  }return rows;
 });for(const row of rows){assert.ok(row.minY>=180-row.height-15&&row.maxY<=188,JSON.stringify(row));assert.ok(row.minX>=200-row.width&&row.maxX<=200+row.width,JSON.stringify(row));assert.ok(row.visibleHeight>=(row.tall?row.height-14:row.height*.55),JSON.stringify(row));}}finally{await page.close();}
});
