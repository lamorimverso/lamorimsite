import {HERO_POWERS} from '../runner-earned-powers.mjs?v=9c3a03f65c5f';
import {bossProfileFor} from '../runner-boss-profiles.mjs?v=740e8ab135c4';
export const WIDTH=900,GROUND=344,STEP=1/120,ROUND_SECONDS=60;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const names={'flavio':'Flávio',pf:'Blitz da PF',army:'Patrulha',janones:'Janones',joice:'Joice',soraya:'Soraya',boulos:'Boulos',haddad:'Haddad · Taxad',simone:'Simone Tebet',dino:'Dino',xandao:'Xandão',lula:'Lula',dilma:'Dilma',bossonari:'Bossonari','meme-army':'Fantasma do Comunismo','ana-elisa':'Ana Elisa',rick:'Rick Azevedo',sofia:'Sofia Favero',guilherme:'Guilherme Cortez',erika:'Erika Hilton',jones:'Jones Manoel',maestro:'Maestro da Maré',capita:'Capitã dos Ventos'};
const classes={sentinel:{hp:112,speed:205,jump:475,force:1.03,label:'Defesa'},gunner:{hp:94,speed:275,jump:550,force:.92,label:'Velocidade'},caster:{hp:100,speed:225,jump:515,force:1.05,label:'Alcance'},sovereign:{hp:118,speed:190,jump:465,force:1.18,label:'Força'},balanced:{hp:100,speed:245,jump:525,force:1,label:'Equilibrado'}};
export const ROSTER=Object.freeze(Object.entries(names).map(([id,name])=>{
 const profile=bossProfileFor(id),style=profile?.classId||'balanced',p=HERO_POWERS[id==='flavio'?'ivermectina':id];
 return Object.freeze({id,name,style,...classes[style],power:p,rank:profile?.rank||1});
}));
export const STAGES=Object.freeze([['brasilia','Brasília'],['rio','Rio de Janeiro'],['sao-paulo','São Paulo'],['argentina','Argentina'],['paraguai','Paraguai'],['florida','Flórida'],['casa-branca','Casa Branca']]);
const lookup=id=>ROSTER.find(f=>f.id===id);
export function randomMatchup(random=Math.random){
 const choose=list=>{const r=Number(random());return list[Math.min(list.length-1,Math.max(0,Math.floor((Number.isFinite(r)?r:0)*list.length)))];};
 const player=choose(ROSTER).id;
 const boss=choose(ROSTER.filter(f=>f.id!=='flavio'&&f.id!==player)).id;
 return {player,boss,stage:choose(STAGES)[0]};
}
export function createBattle({player='flavio',boss='xandao',stage='brasilia',difficulty='normal',seed=17}={}){
 const p=lookup(player),b=lookup(boss);
 if(!p||!b||boss==='flavio')throw Error('Lutador inválido');
 const fight={playerId:player,bossId:boss,stage:STAGES.some(s=>s[0]===stage)?stage:'brasilia',difficulty:['easy','normal','hard'].includes(difficulty)?difficulty:'normal',seed:seed>>>0,round:0,score:[0,0],clock:ROUND_SECONDS,status:'intro',phaseFor:0,elapsed:0,projectiles:[],effects:[],result:null,aiFor:0,aiInput:{},hitStop:0};
 newRound(fight);return fight;
}
function fighter(def,x,face,bossFactor){
 const maxHp=Math.round(def.hp*bossFactor);
 return {def,x,y:0,vx:0,vy:0,face,hp:maxHp,maxHp,meter:35,state:'idle',age:0,move:null,hit:false,stun:0,guard:0,buffer:[],combo:0,comboFor:0,walk:0};
}
function newRound(g){
 g.round++;g.status='intro';g.phaseFor=1.3;g.clock=ROUND_SECONDS;g.projectiles=[];g.effects=[];g.result=null;g.hitStop=0;g.aiFor=0;g.aiInput={};
 g.fighters=[fighter(lookup(g.playerId),235,1,1),fighter(lookup(g.bossId),665,-1,{easy:.90,normal:1.10,hard:1.22}[g.difficulty])];
}
const rng=g=>{g.seed=(Math.imul(g.seed,1664525)+1013904223)>>>0;return g.seed/4294967296;};
const moves={light:{start:.085,active:.09,recover:.19,damage:7,reach:78,level:'mid'},heavy:{start:.19,active:.11,recover:.34,damage:13,reach:111,level:'high'},low:{start:.14,active:.1,recover:.29,damage:10,reach:94,level:'low'},air:{start:.10,active:.14,recover:.24,damage:10,reach:91,level:'high'},special:{start:.30,active:.08,recover:.43,damage:0,reach:0,level:'mid'}};
const duration=m=>m.start+m.active+m.recover;
export function queueAction(f,action){
 if(['light','heavy','special','jump'].includes(action)&&!f.buffer.some(b=>b.action===action))f.buffer.push({action,ttl:.23});
}
function startMove(f,key){
 if(key==='special'&&f.meter<30)return false;
 if(key==='special')f.meter-=30;
 f.move={...moves[key],key};f.state='attack';f.age=0;f.hit=false;f.connected=false;f.guard=0;return true;
}
function body(f){const h=f.state==='crouch'||f.state==='guard-low'?77:126;return {left:f.x-26,right:f.x+26,bottom:f.y,top:f.y+h};}
const intersects=(a,b)=>a.left<b.right&&a.right>b.left&&a.bottom<b.top&&a.top>b.bottom;
function addEffect(g,x,y,kind,color){g.effects.push({x,y,kind,color,life:.23});if(g.effects.length>30)g.effects.shift();}
function resolveHit(g,from,to,damage,level,face,kind='strike'){
 if(to.hp<=0)return false;
 const front=face===to.face*-1,guardState=to.state==='blockstun'?to.guardState:to.state;
 const blocked=front&&to.y===0&&(guardState==='guard-low'?level!=='high':guardState==='guard-high'&&level!=='low');
 to.guardState=blocked?guardState:null;
 const amount=Math.max(1,Math.round(damage*from.def.force*(blocked?.19:1)));
 to.hp=Math.max(0,to.hp-amount);from.meter=clamp(from.meter+(blocked?3:9),0,100);to.meter=clamp(to.meter+(blocked?5:7),0,100);
 to.stun=blocked?.15:kind==='special'?.34:.24;to.move=null;to.state=blocked?'blockstun':'hurt';to.vx=face*(blocked?100:180);to.age=0;
 if(!blocked){from.combo=from.comboFor>0?from.combo+1:1;from.comboFor=.78;}
 addEffect(g,to.x,to.y+76,blocked?'guard':'hit',blocked?'#80e7ff':'#ffe49e');g.hitStop=blocked?.025:.045;
 return !blocked;
}
function launch(g,f,opponent){
 const p=f.def.power,behavior=p.behavior,count=Math.min(3,p.shots||1),speed=clamp(p.speed*.71,295,620);
 for(let i=0;i<count;i++){
  const offset=i-(count-1)/2;
  g.projectiles.push({owner:f,face:f.face,x:f.x+f.face*40,launchX:f.x+f.face*40,y:f.y+66+offset*17,originY:f.y+66,vx:f.face*speed,vy:['arc','lob'].includes(behavior)?190:0,age:0,life:behavior==='return'?1.8:1.65,behavior,radius:clamp((p.radius||5)*1.25,11,27),damage:Math.max(5,Math.round((10+p.damage*4)/Math.sqrt(count))),color:p.color||'#dab7ff',type:p.projectiles?.[i]||p.projectile,offset,hit:false});
 }
 if(g.projectiles.length>32)g.projectiles.splice(0,g.projectiles.length-32);
 addEffect(g,f.x+f.face*40,f.y+66,'cast',p.color);
}
function updateFighter(g,f,o,input,dt){
 f.comboFor=Math.max(0,f.comboFor-dt);if(!f.comboFor)f.combo=0;
 f.buffer=f.buffer.filter(b=>(b.ttl-=dt)>0);
 for(const action of input.press||[])queueAction(f,action);
 const grounded=f.y<=0;
 const axis=(input.right?1:0)-(input.left?1:0);
 if(!f.move&&f.stun<=0)f.face=o.x>=f.x?1:-1;
 if(f.stun>0){f.stun=Math.max(0,f.stun-dt);f.vx*=Math.exp(-9*dt);if(!f.stun){f.state='idle';f.vx=0;}}
 else if(f.move){
  const m=f.move,old=f.age;f.age+=dt;f.vx*=Math.exp(-12*dt);
  if(!f.hit&&old<m.start+m.active&&f.age>=m.start){
   if(m.key==='special'){f.hit=true;launch(g,f,o);}
   else {
    const rect={left:Math.min(f.x+f.face*12,f.x+f.face*m.reach),right:Math.max(f.x+f.face*12,f.x+f.face*m.reach),bottom:f.y+(m.level==='low'?0:32),top:f.y+(m.level==='low'?58:126)};
    if(intersects(rect,body(o))){f.hit=true;f.connected=resolveHit(g,f,o,m.damage,m.level,f.face);}
   }
  }
  // A connected light may link into a heavy during the recovery, not indefinitely.
  const link=f.connected&&m.key==='light'&&f.age>=m.start+m.active?f.buffer.findIndex(b=>b.action==='heavy'):-1;
  if(link>=0){f.buffer.splice(link,1);startMove(f,'heavy');}
  else if(f.age>=duration(m)){f.move=null;f.state='idle';}
 }else{
  const next=f.buffer.shift()?.action;
  const guard=input.guard||axis===-f.face;
  if(next==='jump'&&grounded){f.vy=f.def.jump;f.state='jump';f.vx=axis*f.def.speed;}
  else if(next&&next!=='jump'&&startMove(f,next==='heavy'?!grounded?'air':input.down?'low':'heavy':next==='light'&&!grounded?'air':next)){f.vx=0;}
  else if(!grounded){f.state='jump';f.vx=axis*f.def.speed*.8;}
  else if(input.down){f.state=guard?'guard-low':'crouch';f.vx=0;}
  else if(guard&&(input.guard||Math.abs(o.x-f.x)<170)){f.state='guard-high';f.vx=input.guard?0:axis*f.def.speed*.52;}
  else {f.state=axis?'walk':'idle';f.vx=axis*f.def.speed;}
 }
 f.x=clamp(f.x+f.vx*dt,42,WIDTH-42);if(Math.abs(f.vx)>1)f.walk+=Math.abs(f.vx)*dt/17;
 f.y=Math.max(0,f.y+f.vy*dt);if(f.y>0)f.vy-=1400*dt;else f.vy=0;
}
function updateProjectiles(g,dt){
 for(const p of g.projectiles){
  p.age+=dt;p.life-=dt;
  const o=g.fighters.find(f=>f!==p.owner);
  if(p.behavior==='homing')p.y+=clamp(o.y+62-p.y,-160*dt,160*dt);
  else if(['wave','orbit','ghost','gust'].includes(p.behavior))p.y=p.originY+Math.sin(p.age*9+p.offset)*22;
  else if(['arc','lob','bounce'].includes(p.behavior)){p.y+=p.vy*dt;p.vy-=480*dt;if(p.y<15){p.y=15;if(p.behavior==='bounce')p.vy=160;else p.life=0;}}
  else if(p.behavior==='return'&&p.age>.66)p.vx=-p.face*Math.abs(p.vx);
  p.x+=p.vx*dt;
  const b=body(o),r=p.radius;
  if(!p.hit&&p.life>0&&intersects({left:p.x-r,right:p.x+r,bottom:p.y-r,top:p.y+r},b)){resolveHit(g,p.owner,o,p.damage,p.y<45?'low':'mid',Math.sign(p.vx),'special');p.hit=true;p.life=0;}
 }
 // Opposing projectiles cancel on contact, leaving neither fighter damaged.
 for(let i=0;i<g.projectiles.length;i++)for(let j=i+1;j<g.projectiles.length;j++){const a=g.projectiles[i],b=g.projectiles[j];if(a.life>0&&b.life>0&&a.owner!==b.owner&&Math.hypot(a.x-b.x,a.y-b.y)<a.radius+b.radius){a.life=b.life=0;addEffect(g,(a.x+b.x)/2,(a.y+b.y)/2,'guard','#d3e9ff');}}
 g.projectiles=g.projectiles.filter(p=>p.life>0&&p.x>-80&&p.x<WIDTH+80);
}
function cpu(g,b,p,dt){
 g.aiFor-=dt;if(g.aiFor>0)return {...g.aiInput,press:[]};
 const hard=g.difficulty==='hard',easy=g.difficulty==='easy',distance=Math.abs(p.x-b.x),toward=p.x>b.x?'right':'left';
 g.aiFor=(hard?.13:easy?.33:.22)+rng(g)*.13;
 const chance=rng(g),input={press:[]};
 if(b.stun>0||b.move){g.aiInput=input;return input;}
 if(p.move&&p.age<p.move.start+.06&&distance<145&&chance<(hard?.74:easy?.25:.48)){input.guard=true;input.down=p.move.level==='low';}
 else if(distance>165&&b.meter>=30&&chance<(hard?.63:.36)){input.press=['special'];}
 else if(distance>90){input[toward]=true;if(distance>210&&chance<.22)input.press=['jump'];}
 else if(chance<.16){input.guard=true;}
 else if(chance<.58){input.press=['light'];}
 else {input.down=chance>.83;input.press=['heavy'];}
 g.aiInput={...input,press:[]};return input;
}
function conclude(g){
 const [a,b]=g.fighters;
 const delta=a.hp/a.maxHp-b.hp/b.maxHp;
 const winner=Math.abs(delta)<1e-9?-1:delta>0?0:1;
 if(winner>=0)g.score[winner]++;
 g.result={winner,reason:a.hp<=0||b.hp<=0?'K.O.':'TEMPO'};
 g.status='roundover';g.phaseFor=2.1;
 // A bounded deciding round: tied scores after four rounds finish as a draw.
 if(g.score.some(n=>n>=2)||g.round>=4){g.status='finished';}
}
export function stepBattle(g,input={},dt=STEP,{cpuInput}={}){
 if(g.status==='finished')return g;
 dt=clamp(Number.isFinite(dt)?dt:STEP,0,.05);g.elapsed+=dt;
 if(g.status!=='fight'){g.phaseFor-=dt;if(g.phaseFor<=0){if(g.status==='intro')g.status='fight';else newRound(g);}return g;}
 for(const e of g.effects)e.life-=dt;g.effects=g.effects.filter(e=>e.life>0);
 // Buffer button edges even in hit-stop, but no extra simulation time passes.
 if(g.hitStop>0){for(const a of input.press||[])queueAction(g.fighters[0],a);g.hitStop=Math.max(0,g.hitStop-dt);return g;}
 const [a,b]=g.fighters;g.clock=Math.max(0,g.clock-dt);
 updateFighter(g,a,b,input,dt);if(b.hp>0)updateFighter(g,b,a,cpuInput??cpu(g,b,a,dt),dt);
 // Pushboxes stop grounded bodies crossing; jumping can cross and reverse facing.
 if(Math.abs(a.y-b.y)<85&&Math.abs(a.x-b.x)<54){const sign=a.x<=b.x?1:-1,mid=(a.x+b.x)/2,left=clamp(mid-27,42,WIDTH-96);a.x=sign>0?left:left+54;b.x=sign>0?left+54:left;}
 updateProjectiles(g,dt);
 if(a.hp<=0||b.hp<=0||g.clock<=0)conclude(g);
 return g;
}
