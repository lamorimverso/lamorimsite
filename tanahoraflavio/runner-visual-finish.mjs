// Original presentation polish; deterministic, bounded work, never mutates simulation.
const clamp=n=>Math.max(0,Math.min(1,Number(n)||0));
const wrap=(n,span)=>((n%span)+span)%span;
const tones=Object.freeze({
 brasilia:['#edc88a','#537b87'],rio:['#83d7d3','#326d7a'],'sao-paulo':['#afc7e9','#455e86'],
 argentina:['#efc5a0','#7d91ac'],paraguai:['#e7b9a8','#587d71'],florida:['#f1b8c5','#617ba8'],
 'casa-branca':['#d1dfef','#526e8b'],'brasilia-final':['#efbfa0','#766a9d']
});
// Repeating local scenery is driven by actual distance, independent of the
// campaign's slower geographic clock. The original geographic layers still
// determine when each city arrives; no game event is moved by this animation.
export function localParallaxFor({width=900,distance=0,reducedMotion=false}={}){
 const travel=reducedMotion?0:Math.max(0,Number.isFinite(distance)?distance:0);
 return [[.075,148],[.145,112]].map(([scale,spacing])=>{
  const offset=travel*scale,first=Math.floor(offset/spacing)-1;
  return {scale,tiles:Array.from({length:Math.ceil(Math.max(0,width)/spacing)+3},(_,i)=>{
   const index=first+i;return {index,x:index*spacing-offset};
  })};
 });
}
function mixHex(a,b,t){
 return '#'+[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-t)+parseInt(b.slice(i,i+2),16)*t).toString(16).padStart(2,'0')).join('');
}
export function journeyFinishTones(stageId,transition){
 const from=tones[transition?.from?.id]||tones[stageId]||tones.brasilia;
 const to=tones[transition?.to?.id]||from;
 const progress=clamp(transition?.progress??1);
 return from.map((color,i)=>mixHex(color,to[i],progress));
}
function drawPassingDetails(c,{width,ground,travel,reducedMotion,light,shade}){
 const layers=localParallaxFor({width,distance:travel,reducedMotion});
 c.save();try{
  // Two lightweight bands of silhouette detail, drawn as batched paths.
  // Existing regional landmarks and enemies retain the foreground.
  c.fillStyle=shade+'24';c.beginPath();
  for(const {index,x} of layers[0].tiles){
   const h=8+((index%3+3)%3)*4;
   c.moveTo(x-24,ground-12);c.lineTo(x-24,ground-12-h);
   c.lineTo(x-4,ground-15-h);c.lineTo(x+14,ground-12-h);
   c.lineTo(x+14,ground-12);c.closePath();
  }
  c.fill();
  c.strokeStyle=shade+'52';c.lineWidth=1.5;c.beginPath();
  for(const {x} of layers[1].tiles){
   c.moveTo(x,ground-12);c.lineTo(x,ground-30);c.lineTo(x+8,ground-32);
   c.moveTo(x+17,ground-12);c.lineTo(x+17,ground-16);c.lineTo(x+43,ground-16);c.lineTo(x+43,ground-12);
  }
  c.stroke();
  c.fillStyle=light+'8a';c.beginPath();
  for(const {x} of layers[1].tiles)c.rect(x+5,ground-33,6,2);
  c.fill();
 }finally{c.restore();}
}
export function drawJourneyFinish(c,{width=900,ground=246,distance=0,stageId='brasilia',transition,flight=false,reducedMotion=false}={}){
 if(!(width>0)||!Number.isFinite(ground))return;
 const [light,shade]=journeyFinishTones(stageId,transition);
 const travel=reducedMotion?0:Number(distance)||0;
 c.save();
 try{
  // Soft sky tint and fine atmospheric linework; no full-screen flashing.
  const tint=c.createLinearGradient(0,0,0,154);
  tint.addColorStop(0,shade+'19');tint.addColorStop(.62,light+'12');tint.addColorStop(1,light+'00');
  c.fillStyle=tint;c.fillRect(0,0,width,154);
  if(flight)return;
  drawPassingDetails(c,{width,ground,travel,reducedMotion,light,shade});
  // Foreground detail scrolls at a different rate from the city. All below the collision floor.
  c.fillStyle=shade+'22';c.fillRect(0,ground+39,width,15);
  c.fillStyle=light+'65';c.fillRect(0,ground+39,width,1);
  c.beginPath();c.strokeStyle=shade+'38';c.lineWidth=1;
  const shift=wrap(travel*.68,76);
  for(let x=-shift-76;x<width+76;x+=76){c.moveTo(x,ground+41);c.lineTo(x-13,ground+54);}
  c.stroke();
 }finally{c.restore();}
}
// Readable silhouette and tell animation. Effects remain behind the authored figure.
export function drawBossAccent(c,{x,y,ground=246,color='#9577b6',action='jump',preparing=false,attacking=false,recovering=false,enraged=false,progress=0,reducedMotion=false}={}){
 if(!Number.isFinite(x)||!Number.isFinite(y))return;
 const u=clamp(progress),p=reducedMotion?.5:u;
 c.save();
 try{
  c.strokeStyle=color;c.fillStyle=color;
  c.globalAlpha*=enraged?.34:.21;
  // Grounded contact halo stays at the physical shadow, never a false hitbox.
  c.beginPath();c.ellipse(x,ground+2,30,4,0,0,Math.PI*2);c.fill();
  if(!preparing&&!attacking&&!recovering)return;
  c.globalAlpha*=preparing?(.55+.45*p):attacking?(1-.7*p):(.7-.4*p);
  c.lineWidth=preparing?2:1.5;
  c.beginPath();
  const r=28+(reducedMotion?0:p*7);
  if(action==='move'){
   c.moveTo(x-r,y-36);c.lineTo(x-r,y-61);c.lineTo(x-r+14,y-61);
   c.moveTo(x+r,y-36);c.lineTo(x+r,y-61);c.lineTo(x+r-14,y-61);
  }else if(action==='crouch'){
   c.moveTo(x-r,y-79);c.quadraticCurveTo(x,y-99,x+r,y-79);
  }else{
   c.moveTo(x-r,y-20);c.quadraticCurveTo(x,y-9,x+r,y-20);
  }
  c.stroke();
  if(enraged){
   c.globalAlpha*=.7;c.beginPath();c.arc(x,y-51,42,-2.65,-.49);c.stroke();
  }
 }finally{c.restore();}
}
export function drawImpactFinish(c,{x,y,remaining,critical=false,reducedMotion=false}={}){
 if(!Number.isFinite(x)||!Number.isFinite(y)||!(remaining>0))return;
 const t=1-clamp(remaining/.25);
 c.save();try{
  c.globalAlpha*=1-t;c.strokeStyle=critical?'#dba052':'#ecdfb4';c.lineWidth=1.6;
  const r=reducedMotion?8:5+14*t;
  c.beginPath();for(let i=0;i<6;i++){const a=i*Math.PI/3;c.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r);c.lineTo(x+Math.cos(a)*(r+5),y+Math.sin(a)*(r+5));}c.stroke();
 }finally{c.restore();}
}
export function campaignResultText(run,score){
 const number=n=>Number(n||0).toLocaleString('pt-BR');
 return 'Código 13 confirmado! '+number(run.bossesDefeated)+' etapas concluídas · '+number(score)+' m percorridos · '+number(run.passports)+' passaportes.';
}
