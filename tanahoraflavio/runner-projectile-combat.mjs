import {PLAYER,playerX,visibleWidth} from './runner-run-geometry.mjs?v=6561adb004e2';
import {random,nextSeed} from './runner-random.mjs?v=8de9f87c7593';
import {heroPowerFor} from './runner-earned-powers.mjs?v=9c3a03f65c5f';
import {advanceAmmo} from './runner-supplies.mjs?v=44c67e8a5802';
import {HERO_SHOT_DURATION,DUEL_CHARGE_SECONDS,heroShotPose} from './runner-hero-shot.mjs?v=7aa1e19e9838';
import {playerBodyFor} from './runner-body.mjs?v=57ec474fca38';
import {bossArenaPose,bossCounterWindow} from './runner-bosses.mjs?v=a359288d2758';

export function setAttackRun(run,active){
 run.player.attackHeld=!!active&&run.status==='running'&&!run.player.isJacare&&!run.boss?.traversal;
 if(!run.player.attackHeld)run.player.chargeFor=0;
 return run.player.attackHeld;
}
export function heroMuzzleFor(run,facing=1){
 const {muzzle}=heroShotPose({facing,crouching:run.player.crouching,sliding:run.player.sliding,airborne:run.player.y>0});
 const scale=playerBodyFor(run.player).scale;
 return {x:playerX(run)+PLAYER.width/2+muzzle.x*scale,y:run.player.y-muzzle.y*scale};
}
// A seleção de projéteis só inclui ameaças já lançadas; o chefão tem alvo próprio.
// Zé rival reutiliza trajetória de quique, mas continua sendo um personagem.
const nonProjectileBodies=new Set(['povo','crowd-lane','ze-gotinha-rival','lula-runner','orla-runner','paulista-runner','route-scout','terminal-guard']);
const shootableGroundEnemies=new Set(['pf','janones','army','boulos','dino','orla-runner','paulista-runner','route-scout','terminal-guard','lula-runner']);
const isShootableGroundEnemy=o=>!!o&&!o.projectile&&!o.falling&&!o.groundHazard&&!o.passed&&!o.counted&&!o.destroyed&&shootableGroundEnemies.has(o.type);
// Only explicitly hostile ground fighters receive health. Civic bodies, terrain and warnings remain untouched.
const groundEnemyHealth=o=>['army','dino','boulos'].includes(o.type)?2.4:1;
export function isHostileProjectile(o){
 return !!o?.projectile&&!nonProjectileBodies.has(o.type)&&!o.falling&&!o.groundHazard&&!o.reflected&&!o.destroyed&&
  (o.launched||!o.cast&&!o.storyVolley&&!(o.waitFor>0))&&(!o.passed&&!o.counted||o.returning&&!o.contactHit);
}
export function projectileFlightY(o,x){
 const landingX=(o.laneX??o.targetX+PLAYER.width/2-6)+o.width/2;
 const span=Math.max(1,o.launchX-landingX);
 const u=Math.max(0,Math.min(1,(o.launchX-(x+o.width/2))/span));
 if(!Number.isFinite(u)||!Number.isFinite(o.launchY)||!Number.isFinite(o.targetY))return o.y;
 let y=o.launchY+(o.targetY-o.launchY)*u+Math.sin(Math.PI*u)*(o.arcHeight||0);
 if(o.curve){
  const envelope=Math.sin(Math.PI*u)**2,cycle=Math.sin(u*Math.PI*2*(o.waveCycles||1)),amplitude=o.waveAmplitude||16;
  y+=(o.curve==='bounce'?Math.abs(cycle):cycle)*amplitude*envelope;
  if(o.action==='crouch')y=Math.max(48+o.height/2,y);
  else if(u>=.72)y=Math.min(26,y);
 }
 return y;
}
function projectileAt(o,seconds){
 if(o.cast){
  const c=o.cast,time=c.flightAge+seconds,u=Math.min(1,time/c.flightFor);
  return {x:c.fromX+(c.toX-c.fromX)*u-o.speed*Math.max(0,time-c.flightFor),y:c.fromY+(o.targetY-c.fromY)*u};
 }
 const coasting=o.bossFlight&&!o.returning?Math.min(seconds,o.bossFlight.remaining):0;
 const left=o.x-(o.speed||0)*(seconds-coasting)-(o.bossFlight?.speed||0)*coasting;
 return {x:left+o.width/2,y:o.returning?o.y:projectileFlightY(o,left)};
}
function aimAtProjectile(run,power){
 const center=playerX(run)+PLAYER.width/2;
 const candidates=run.obstacles.filter(isHostileProjectile)
  .sort((a,b)=>Math.abs(a.x+a.width/2-center)-Math.abs(b.x+b.width/2-center));
 for(const target of candidates){
  const facing=target.x+target.width/2<center?-1:1,muzzle=heroMuzzleFor(run,facing);
  if((target.x+target.width/2-muzzle.x)*facing<=0)continue;
  // Procura o primeiro ponto futuro alcançável onde os dois trajetos se cruzam.
  // Amostra a aceleração e a curva já comprometidas do inimigo, sem mirar em seu autor.
  for(let i=1;i<=72;i++){
   const time=i/60,anticipated=projectileAt(target,time);
   if((anticipated.x-muzzle.x)*facing<=0)break;
   if(Math.hypot(anticipated.x-muzzle.x,anticipated.y-muzzle.y)<=time*power.speed){
    const lift=shotLift(power.behavior,Math.min(1,time/Math.max(.15,time)));
    return {...anticipated,y:anticipated.y-lift,facing};
   }
  }
 }
 return null;
}
function shotLift(behavior,progress){
 const envelope=Math.sin(Math.PI*progress);
 return behavior==='lob'?60*envelope:behavior==='arc'?30*envelope:behavior==='heavy'?18*envelope:
  behavior==='bounce'?28*Math.abs(Math.sin(progress*Math.PI*3)):behavior==='orbit'?22*Math.sin(progress*Math.PI*4)*envelope:behavior==='gust'?8*Math.sin(progress*Math.PI*5)*envelope:0;
}
function aimAtBoss(run,power){
 const boss=run.boss;
 if(!boss||boss.traversal||boss.phase==='intro'||boss.hp<=0)return null;
 const muzzle=heroMuzzleFor(run,1);let time=0,pose;
 // Lead the moving platform using the same clock as its visible trajectory.
 for(let i=0;i<5;i++){
  pose=bossArenaPose({...boss,age:boss.age+time,motionClock:(boss.motionClock||0)+time},visibleWidth(run));
  const y=pose.platformY+48;time=Math.hypot(pose.x-muzzle.x,y-muzzle.y)/power.speed;
 }
 return {x:pose.x,y:pose.platformY+48,facing:1};
}
function aimAtGroundEnemy(run){
 if(run.boss)return null;
 const facing=run.manualStory&&run.player.shotFacing<0?-1:1,muzzle=heroMuzzleFor(run,facing);
 const target=run.obstacles.filter(isShootableGroundEnemy).filter(o=>(o.x+o.width/2-muzzle.x)*facing>0)
  .sort((a,b)=>(a.x+a.width/2-b.x-b.width/2)*facing)[0];
 return target?{x:target.x+target.width/2,y:Math.max(14,target.height*.58),facing}:null;
}
export function attackRun(run){
 const b=run.boss,p=run.player,power=heroPowerFor(run),level=run.powerLevels?.[run.activePower]||1;
 const limit=b?.combat&&!b.traversal&&run.activePower==='ivermectina'?3:18;
 const charged=!!b?.combat&&!b.traversal&&p.attackHeld&&(p.chargeFor||0)>=DUEL_CHARGE_SECONDS-1e-8&&run.ammo>=2;
 if(run.status!=='running'||!(run.ammo>0)||p.isJacare||b?.traversal||b?.phase==='intro'||p.attackCooldown>0&&!charged||(run.heroShots?.length||0)>=limit)return false;
 const ammoCost=charged?2:1;
 const target=b?.combat?aimAtBoss(run,power)||aimAtProjectile(run,power):
  run.manualStory?aimAtGroundEnemy(run)||aimAtProjectile(run,power):aimAtProjectile(run,power)||aimAtGroundEnemy(run)||aimAtBoss(run,power);
 p.shotFacing=target?.facing??(run.manualStory?(p.shotFacing<0?-1:1):1);
 const {x,y}=heroMuzzleFor(run,p.shotFacing),targetX=target?.x??x+p.shotFacing*160,targetY=target?.y??y;
 const dx=p.shotFacing*Math.max(1,(targetX-x)*p.shotFacing),dy=targetY-y,distance=Math.max(1,Math.hypot(dx,dy)),angle=Math.atan2(dy,dx);
 for(let i=0;i<power.shots;i++){
  const spread=power.behavior==='fan'?(i-1)*power.spread:0,offset=power.behavior==='stack'?(i-1)*18:power.behavior==='double'?(i-.5)*12:0;
  const vx=Math.cos(angle+spread)*power.speed,vy=Math.sin(angle+spread)*power.speed;
  (run.heroShots??=[]).push({type:run.activePower==='ivermectina'?'hero-ivermectina':power.projectiles?.[i]||power.projectile,powerId:run.activePower,
   behavior:power.behavior,x,y:y+offset,originX:x,originY:y+offset,previousX:x,previousY:y+offset,vx,vy,age:0,flightFor:Math.max(.15,distance/power.speed),
   radius:power.radius+(charged?4:0),cancels:power.cancels+(charged?1:0),damage:power.damage*(1+(level-1)*.12)*(charged?2.1:1),charged,ammoCost});
 }
 run.ammo-=ammoCost;run.ammoIdleFor=0;run.ammoReloadFor=0;
 if(charged){p.chargeFor=0;p.chargedFlashFor=.22;}
 p.attackCooldown=power.cooldown*(1-(level-1)*.06);p.attackFor=HERO_SHOT_DURATION;run.shotsFired=(run.shotsFired||0)+1;return true;
}
function segmentHitsBox(shot,minX,maxX,minY,maxY,radius=0){
 const dx=shot.x-shot.previousX,dy=shot.y-shot.previousY;let near=0,far=1;
 for(const [origin,delta,min,max] of [[shot.previousX,dx,minX-radius,maxX+radius],[shot.previousY,dy,minY-radius,maxY+radius]]){
  if(Math.abs(delta)<1e-8){if(origin<min||origin>max)return false;}
  else{const a=(min-origin)/delta,z=(max-origin)/delta;near=Math.max(near,Math.min(a,z));far=Math.min(far,Math.max(a,z));}
 }return near<=far;
}
function rollBossDamage(run,basis){
 // Sorteio por acerto, separado da IA: FPS e padrões do chefe não alteram o dano.
 const draw=()=>{
  if(run.damageRandomState==null)run.damageRandomState=(random(Math.random)*4294967296)>>>0;
  run.damageRandomState=nextSeed(run.damageRandomState);
  return run.damageRandomState/4294967296;
 };
 const critical=draw()<.14,variation=.85+draw()*.30;
 return {damage:basis*variation*(critical?1.5:1),critical};
}
// Compress high values rather than flatten all heavy normal weapons at 1.55.
// Starter, charged shots and reflected damage keep their established balance.
function directDamageMultiplier(shot){
 const damage=Math.max(.84,shot.damage||1);
 if(shot.charged)return Math.min(3.1,damage);
 return Math.min(2.4,damage<=1.55?damage:1.55+(damage-1.55)*.45);
}
function applyBossHit(boss,hit){
 if(boss.combat&&boss.hurtFor>0)return;
 const previousHp=boss.hp;
 boss.hp=Math.max(0,boss.hp-hit.damage);boss.hitFlashFor=boss.combat?.28:.16;
 if(boss.combat)boss.hurtFor=.28;
 if(previousHp>boss.hp)boss.lastDamage={amount:previousHp-boss.hp,critical:hit.critical===true,remaining:.8};
 if(hit.weakness)boss.weaknessFlashFor=.3;
}
function interceptProjectile(run,shot,o){
 const boss=run.boss;
 if(o.bossAttack&&boss&&!boss.traversal&&(o.owner===boss.type||o.storyVolley&&o.owner==null)){
  // Guarda o bônus na interceptação. O PV continua intocado até a volta física.
  const weakness=boss.weakness&&shot.powerId===boss.weakness;
  const earned=boss.counterReady;
  const basis=boss.combat?2.6:Math.max(2,boss.maxHp*.12);
  const hit=rollBossDamage(run,basis*Math.max(.84,Math.min(1.55,shot.damage||1))*(earned?1+earned.damage*.16:1)*(weakness?1.35:1));
  boss.counterReady=null;
  if(!boss.combat&&!o.counted)boss.remaining=Math.max(0,boss.remaining-1);
  Object.assign(o,{reflected:true,returning:true,passed:true,counted:true,resolved:true,waitFor:0,speed:-510,
   reflection:{boss,...hit,weakness,earnedCounter:!!earned,age:0}});
 }else{o.destroyed=true;o.counted=true;o.passed=true;}
 run.clearedAt={x:o.x+o.width/2,remaining:.25};
}
// Uma sequência comprometida mantém as ameaças reais mesmo após o golpe
// letal e dá tempo de ler a pausa; nenhum novo ataque é preparado por isso.
export function storyVolleyPendingVictory(boss){
 const settle=boss.volleyPattern?.finishBeforeVictory;
 return boss.combat&&settle>0&&(boss.phase==='attack'||
  boss.phase==='recover'&&boss.recover-boss.phaseFor<Math.min(settle,boss.recover));
}
export function advanceReflectedProjectile(run,o,dt){
 const reflected=o.reflection,boss=run.boss;
 if(!boss||reflected.boss!==boss||boss.traversal||boss.hp<=0&&!storyVolleyPendingVictory(boss)){o.destroyed=true;return;}
 reflected.age+=dt;
 if(reflected.age>2){o.destroyed=true;return;}
 const pose=bossArenaPose(boss,visibleWidth(run));
 const x=o.x+o.width/2,dx=pose.x-x,dy=pose.platformY+48-o.y,distance=Math.hypot(dx,dy),pace=610*dt;
 if(distance<=24+pace){
  // Preserve the earned opening consumed at interception through a recent
  // hit's protection. Ordinary returns retain their existing collision rule.
  if(boss.combat&&reflected.earnedCounter&&boss.hurtFor>0)return;
  applyBossHit(boss,reflected);
  o.destroyed=true;return;
 }
 o.x+=dx/distance*pace;o.y+=dy/distance*pace;
}
export function advanceHeroShots(run,dt){
 const p=run.player;p.attackCooldown=Math.max(0,(p.attackCooldown||0)-dt);p.attackFor=Math.max(0,(p.attackFor||0)-dt);
 advanceAmmo(run,dt);
 const charging=run.boss?.combat&&!run.boss.traversal&&run.boss.phase!=='intro'&&p.attackHeld&&!p.isJacare&&run.ammo>=2;
 p.chargeFor=charging?Math.min(DUEL_CHARGE_SECONDS,(p.chargeFor||0)+dt):0;
 p.chargedFlashFor=Math.max(0,(p.chargedFlashFor||0)-dt);
 if(p.attackHeld)attackRun(run);
 run.heroShots=(run.heroShots||[]).filter(shot=>{
  shot.previousX=shot.x;shot.previousY=shot.y;shot.age+=dt;
  if(shot.behavior==='homing'){
   const boss=run.boss,pose=boss?.combat&&!boss.traversal&&boss.hp>0?bossArenaPose(boss,visibleWidth(run)):null;
   const target=pose?{x:pose.x,y:pose.platformY+48}:run.obstacles.filter(isHostileProjectile).sort((a,b)=>Math.hypot(a.x+a.width/2-shot.x,a.y-shot.y)-Math.hypot(b.x+b.width/2-shot.x,b.y-shot.y))[0];
   if(target){const dx=target.x+(target.width||0)/2-shot.x,dy=target.y-shot.y,d=Math.max(1,Math.hypot(dx,dy)),k=Math.min(1,dt*4);shot.vx+=(dx/d*540-shot.vx)*k;shot.vy+=(dy/d*540-shot.vy)*k;}
  }
  if(shot.behavior==='return'&&shot.age>shot.flightFor*1.2&&!shot.returned){shot.vx=-shot.vx;shot.vy=-shot.vy*.5;shot.returned=true;}
  shot.x+=shot.vx*dt;
  const progress=Math.min(1,shot.age/(shot.flightFor||1)),previous=Math.min(1,Math.max(0,shot.age-dt)/(shot.flightFor||1));
  shot.y+=shot.vy*dt+shotLift(shot.behavior,progress)-shotLift(shot.behavior,previous);
  if(shot.age>3||shot.x<-40||shot.x>visibleWidth(run)+40||shot.y<-50||shot.y>360)return false;
  const radius=shot.behavior==='wave'?Math.min(34,shot.radius+shot.age*30):shot.radius||0;
  for(const o of run.obstacles){
   if(!isHostileProjectile(o)||!segmentHitsBox(shot,o.x,o.x+o.width,o.y-o.height/2,o.y+o.height/2,radius))continue;
   interceptProjectile(run,shot,o);
   if(shot.cancels>0){shot.cancels--;continue;}return false;
  }
  if(!run.boss){
   for(const enemy of run.obstacles){
    if(!isShootableGroundEnemy(enemy)||!segmentHitsBox(shot,enemy.x,enemy.x+enemy.width,0,enemy.height,radius))continue;
    // Keep light enemies one-shot with IVER; tougher fighters reward heavier earned powers.
    enemy.hitPoints=Math.max(0,(enemy.hitPoints??groundEnemyHealth(enemy))-Math.max(.1,shot.damage||1));
    run.clearedAt={x:enemy.x+enemy.width/2,remaining:.25};
    if(enemy.hitPoints<=1e-8){
     enemy.destroyed=true;enemy.passed=true;enemy.counted=true;
     run.defeatedEnemies=(run.defeatedEnemies||0)+1;
    }
    return false;
   }
  }
  const boss=run.boss;
  if(boss&&!boss.traversal&&boss.phase!=='intro'&&boss.hp>0){
   const pose=bossArenaPose(boss,visibleWidth(run));
   // The body and deck share the drawn position. A shot is consumed once,
   // including wave/fan powers; rebounding a hostile shot remains stronger.
   if(segmentHitsBox(shot,pose.x-30,pose.x+30,pose.platformY+8,pose.platformY+100,radius)){
    const weakness=boss.weakness===shot.powerId;
    const opening=boss.combat?Math.min(2.2,bossCounterWindow(boss).damage):1;
    const hit=rollBossDamage(run,(boss.combat?1.1:Math.max(1.5,boss.maxHp*.075))*directDamageMultiplier(shot)*(weakness?1.35:1)*opening);
    applyBossHit(boss,{...hit,weakness});return false;
   }
  }
  return true;
 });
}
