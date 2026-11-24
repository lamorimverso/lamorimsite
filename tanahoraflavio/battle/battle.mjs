import {ROSTER,STAGES,WIDTH,GROUND,STEP,createBattle,stepBattle} from './battle-core.mjs?v=91c8459d5fed';
import {drawActor,loadSprites,drawSpritePortrait,drawItem} from '../runner-art.mjs?v=dbaac525a595';
import {drawHoverEnemy} from '../runner-boss-art.mjs?v=c0f55e6867c9';
import {drawScenery} from '../runner-scenery.mjs?v=ce0fa6b0d678';
const $=id=>document.getElementById(id),canvas=$('canvas'),c=canvas.getContext('2d'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
let player='flavio',boss='xandao',g=null,raf=0,last=0,acc=0,ready=false,held=new Map(),pressed=[];
const lookup=id=>ROSTER.find(f=>f.id===id);
function info(node,f){node.replaceChildren();const h=document.createElement('strong');h.textContent=f.name;const p=document.createElement('p');p.textContent=f.label+' · '+f.power.name;const d=document.createElement('p');d.textContent=f.power.description;node.append(h,p,d);}
function syncSelection(){for(const button of document.querySelectorAll('.fighter'))button.setAttribute('aria-pressed',String(button.dataset.id===(button.dataset.side==='p'?player:boss)));info($('player-detail'),lookup(player));info($('boss-detail'),lookup(boss));}
function populate(){for(const [side,target] of [['p','players'],['b','bosses']]){for(const f of ROSTER.filter(f=>side==='p'||f.id!=='flavio')){const button=document.createElement('button');button.type='button';button.className='fighter';button.dataset.id=f.id;button.dataset.side=side;const face=document.createElement('canvas');face.width=48;face.height=48;face.setAttribute('aria-hidden','true');const label=document.createElement('span');label.textContent=f.name;button.append(face,label);button.onclick=()=>{if(side==='p')player=f.id;else boss=f.id;syncSelection();};$(target).append(button);try{drawSpritePortrait(face.getContext('2d'),f.id,48,48);}catch{}}}for(const [id,name] of STAGES){const o=document.createElement('option');o.value=id;o.textContent=name;$('stage').append(o);}syncSelection();}
populate();
function refreshPortraits(){for(const button of document.querySelectorAll('.fighter')){const portrait=button.querySelector('canvas');const p=portrait.getContext('2d');p.clearRect(0,0,48,48);if(!drawSpritePortrait(p,button.dataset.id,48,48)){p.save();p.translate(24,46);p.scale(.4,.4);drawHoverEnemy(p,{type:button.dataset.id,platform:false,reducedMotion:true});p.restore();}}}
async function prepare(){try{await loadSprites();ready=true;refreshPortraits();$('status').textContent='Escolha o lutador, o chefão e a arena.';$('start').disabled=false;}catch{$('status').textContent='Não foi possível carregar os desenhos. Recarregue a página.';}}
prepare();
function clear(){held.clear();pressed=[];for(const b of document.querySelectorAll('.touch button'))b.classList.remove('active');}
const mapping={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'jump',ArrowDown:'down',KeyA:'light',KeyS:'heavy',KeyD:'guard',KeyF:'special'};
const actions=new Set(['jump','light','heavy','special']);
function press(source,action){if(held.has(source))return;held.set(source,action);if(actions.has(action))pressed.push(action);}
function release(source){held.delete(source);}
addEventListener('keydown',e=>{if(!g||$('fight').hidden||!mapping[e.code]||e.ctrlKey||e.metaKey||e.altKey)return;e.preventDefault();if(!e.repeat)press(e.code,mapping[e.code]);});
addEventListener('keyup',e=>release(e.code));addEventListener('blur',()=>{clear();last=0;acc=0;});document.addEventListener('visibilitychange',()=>{clear();last=0;acc=0;});
for(const b of document.querySelectorAll('.touch button')){b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);press('touch'+e.pointerId,b.dataset.action);b.classList.add('active');});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,e=>{release('touch'+e.pointerId);b.classList.remove('active');});}
function start(){if(!ready)return;cancelAnimationFrame(raf);clear();g=createBattle({player,boss,stage:$('stage').value,difficulty:$('difficulty').value,seed:Date.now()>>>0});$('select').hidden=true;$('fight').hidden=false;last=0;acc=0;canvas.focus({preventScroll:true});render();raf=requestAnimationFrame(frame);}
$('start').onclick=start;$('rematch').onclick=start;$('select-back').onclick=()=>{cancelAnimationFrame(raf);raf=0;g=null;clear();$('fight').hidden=true;$('select').hidden=false;$('start').focus();};
function frame(now){if(!g)return;if(!last)last=now;acc+=Math.min(.10,(now-last)/1000);last=now;let n=0;while(acc>=STEP&&n++<12){const input={press:pressed.splice(0)};for(const a of held.values())input[a]=true;stepBattle(g,input);acc-=STEP;}render();if(g.status!=='finished')raf=requestAnimationFrame(frame);else clear();}
function actor(f){
 const y=GROUND-f.y,attack=f.move,hit=f.state==='hurt',low=['crouch','guard-low'].includes(f.state),guard=['guard-high','guard-low','blockstun'].includes(f.state),wind=!!attack&&f.age<attack.start,active=!!attack&&f.age>=attack.start&&f.age<attack.start+attack.active;
 c.save();c.globalAlpha=.20;c.fillStyle='#182036';c.beginPath();c.ellipse(f.x,GROUND+3,32,6,0,0,Math.PI*2);c.fill();c.restore();
 c.save();c.translate(f.x,y);const phase=reduced.matches?0:f.state==='walk'?f.walk:g.elapsed*8;
 if(f.def.id==='flavio'){drawActor(c,{type:'flavio',x:0,y:0,scale:1.4,phase,facing:f.face,standing:f.state!=='walk',airborne:f.y>0,crouchPose:low?1:0,attacking:active,preparing:wind,hurt:hit,reducedMotion:reduced.matches});}
 else {c.scale(-f.face,low?.68:1);if(f.state==='walk'&&!reduced.matches)c.translate(0,Math.sin(f.walk*Math.PI/2)*2);drawHoverEnemy(c,{type:f.def.id,platform:false,scale:1.24,phase,preparing:wind,attacking:active,recovering:!!attack&&!wind&&!active,hurt:hit,reducedMotion:reduced.matches,classId:f.def.style,action:attack?.level==='low'?'crouch':'jump',progress:attack?Math.min(1,f.age/(attack.start+attack.active)):0,stageId:g.stage});}
 c.restore();
 if(guard){c.save();c.strokeStyle='#9edbff';c.lineWidth=3;c.globalAlpha=.8;c.beginPath();c.ellipse(f.x+f.face*12,y-(low?44:69),37,low?43:68,0,-1.4,1.4);if(f.face<0){c.translate(2*f.x,0);c.scale(-1,1);}c.stroke();c.restore();}
 if(active&&attack.key!=='special'){c.save();c.strokeStyle='#fff0b6';c.lineWidth=5;c.globalAlpha=.65;c.beginPath();const yy=y-(attack.level==='low'?34:81);c.moveTo(f.x+f.face*22,yy-24);c.quadraticCurveTo(f.x+f.face*attack.reach,yy-28,f.x+f.face*(attack.reach-6),yy+18);c.stroke();c.restore();}
}
function meter(id,value){const el=$(id);el.style.width=value+'%';el.parentElement.setAttribute('aria-valuenow',String(Math.round(value)));}
function render(){
 if(!g)return;const [a,b]=g.fighters;c.setTransform(1,0,0,1,0,0);c.save();c.scale(1,420/300);drawScenery(c,{stage:{id:g.stage},distance:0,width:WIDTH,reducedMotion:true});c.restore();
 for(const f of [a,b])actor(f);
 for(const p of g.projectiles){c.save();c.fillStyle=p.color;c.globalAlpha=.22;c.beginPath();c.ellipse(p.x,GROUND-p.y,p.radius+8,p.radius+8,0,0,Math.PI*2);c.fill();c.restore();drawItem(c,{type:p.type,x:p.x,y:GROUND-p.y,scale:Math.max(.4,p.radius/20)});c.save();c.strokeStyle=p.color;c.lineWidth=2;c.beginPath();c.arc(p.x,GROUND-p.y,p.radius,0,Math.PI*2);c.stroke();c.restore();}
 for(const e of g.effects){c.save();c.globalAlpha=Math.min(1,e.life/.16);c.strokeStyle=e.color||'#fff';c.lineWidth=3;const size=8+(.23-e.life)*95;c.translate(e.x,GROUND-e.y);for(let i=0;i<6;i++){c.rotate(Math.PI/3);c.beginPath();c.moveTo(size*.45,0);c.lineTo(size,0);c.stroke();}c.restore();}
 $('pname').textContent=a.def.name;$('bname').textContent=b.def.name;meter('php',100*a.hp/a.maxHp);meter('bhp',100*b.hp/b.maxHp);meter('pmeter',a.meter);meter('bmeter',b.meter);$('time').textContent=Math.ceil(g.clock);$('round').textContent='ROUND '+g.round;$('pwins').textContent='Rounds: '+g.score[0]+(a.combo>1?' · Combo '+a.combo:'');$('bwins').textContent='Rounds: '+g.score[1];let title='';
 if(g.status==='intro')title='ROUND '+g.round;else if(g.status==='roundover')title=g.result.reason+(g.result.winner===0?' · Você venceu':g.result.winner===1?' · Chefão venceu':' · Empate');else if(g.status==='finished')title=g.score[0]>g.score[1]?'VITÓRIA!':g.score[0]<g.score[1]?'DERROTA':'EMPATE';else if(g.clock>59.4)title='LUTE!';
 if($('banner').textContent!==title)$('banner').textContent=title;
}
