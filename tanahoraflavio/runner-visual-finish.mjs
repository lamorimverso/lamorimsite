// Original presentation polish; deterministic, bounded work, never mutates simulation.
const clamp=n=>Math.max(0,Math.min(1,Number(n)||0));
const wrap=(n,span)=>((n%span)+span)%span;
const tones=Object.freeze({
 brasilia:['#edc88a','#537b87'],rio:['#83d7d3','#326d7a'],'sao-paulo':['#afc7e9','#455e86'],
 argentina:['#efc5a0','#7d91ac'],paraguai:['#e7b9a8','#587d71'],florida:['#f1b8c5','#617ba8'],
 'casa-branca':['#d1dfef','#526e8b'],'brasilia-final':['#efbfa0','#766a9d']
});
export function drawJourneyFinish(c,{width=900,ground=246,distance=0,stageId='brasilia',flight=false,reducedMotion=false}={}){
 if(!(width>0)||!Number.isFinite(ground))return;
 const [light,shade]=tones[stageId]||tones.brasilia;
 const travel=reducedMotion?0:Number(distance)||0;
 c.save();
 try{
  // Soft sky tint and fine atmospheric linework; no full-screen flashing.
  const tint=c.createLinearGradient(0,0,0,154);
  tint.addColorStop(0,shade+'19');tint.addColorStop(.62,light+'12');tint.addColorStop(1,light+'00');
  c.fillStyle=tint;c.fillRect(0,0,width,154);
  if(flight)return;
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
