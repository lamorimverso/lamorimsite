// Authored, committed attacks. A volley owns one safe contact lane until recovery.
// Curves finish at targetY: sine/bounce use an envelope that vanishes at contact.
const shot=(signature,type,action,approach,extra={})=>Object.freeze({signature,type,action,approach,
 targetY:action==='jump'?24:action==='crouch'?92:24,arcHeight:approach==='drop'?34:approach==='sweep'?10:0,
 mechanic:signature,projectileSpeedScale:1,widthScale:1,burst:1,burstGap:.92,telegraph:1,recover:1.3,...extra});
const s=shot;
const introductions=Object.freeze({
 pf:Object.freeze([
  s('blitz-gate','barrier','jump','sweep',{projectileSpeedScale:.85,recover:1.55}),
  s('cuff-arc','handcuffs','crouch','diagonal',{arcHeight:22,projectileSpeedScale:.9}),
  s('warrant-marker','handcuffs','move','vertical',{telegraph:1.25,recover:1.5}),
  s('double-gate','barrier','jump','sweep',{burst:2,burstGap:1.05}),
  s('overhead-cuffs','handcuffs','jump','drop',{arcHeight:44,telegraph:1.2}),
  s('cuff-sweep','handcuffs','crouch','sweep',{burst:2,burstGap:1.1,recover:1.6})]),
 army:Object.freeze([
  s('flare-ground','signal-flare','jump','diagonal',{arcHeight:12,projectileSpeedScale:.9}),
  s('flare-salvo','signal-flare','jump','drop',{burst:2,burstGap:1.15,arcHeight:48,recover:1.65}),
  s('flare-skyline','signal-flare','crouch','sweep',{widthScale:.85,projectileSpeedScale:1.1}),
  s('flare-pause','signal-flare','jump','drop',{projectileSpeedScale:.75,telegraph:1.3,recover:1.7}),
  s('flare-marker','signal-flare','move','vertical',{telegraph:1.35,recover:1.6}),
  s('flare-triple','signal-flare','crouch','diagonal',{burst:3,burstGap:.85,arcHeight:28,recover:1.7})]),
 janones:Object.freeze([
  s('message-triple','message','jump','diagonal',{burst:3,burstGap:.76,widthScale:.85,recover:1.65}),
  s('message-header','message','crouch','sweep',{burst:2,burstGap:.82,projectileSpeedScale:1.1}),
  s('message-lob','message','jump','drop',{arcHeight:42,projectileSpeedScale:.85}),
  s('message-reply','message','crouch','diagonal',{arcHeight:18,recover:1.6}),
  s('message-pin','message','move','vertical',{telegraph:1.2,recover:1.7}),
  s('message-thread','message','jump','sweep',{burst:3,burstGap:.9,widthScale:.8,recover:1.8})]),
 joice:Object.freeze([
  s('mic-high-note','microphone','crouch','diagonal',{curve:'sine',waveAmplitude:13,waveCycles:1,burst:2,burstGap:1.05}),
  s('mic-held-note','microphone','crouch','sweep',{widthScale:1.2,projectileSpeedScale:.8,recover:1.7}),
  s('mic-low-note','microphone','jump','sweep',{curve:'sine',waveAmplitude:12,waveCycles:1.5}),
  s('mic-stage-marker','microphone','move','vertical',{telegraph:1.25}),
  s('mic-feedback','microphone','jump','diagonal',{curve:'sine',waveAmplitude:20,waveCycles:2,burst:2,burstGap:1.1,recover:1.65}),
  s('mic-encore','microphone','crouch','drop',{arcHeight:40,telegraph:1.15,recover:1.65})]),
 soraya:Object.freeze([
  s('cross-parachute','parachute-cross','jump','drop',{projectileSpeedScale:.75,arcHeight:55,telegraph:1.3}),
  s('cross-high-drift','parachute-cross','crouch','drop',{projectileSpeedScale:.8,arcHeight:42,recover:1.65}),
  s('cross-landing-marker','parachute-cross','move','vertical',{telegraph:1.4,recover:1.6}),
  s('cross-pair','parachute-cross','crouch','diagonal',{burst:2,burstGap:1.2,projectileSpeedScale:.85}),
  s('cross-low-drift','parachute-cross','jump','diagonal',{curve:'sine',waveAmplitude:18,waveCycles:1,projectileSpeedScale:.8}),
  s('cross-drop-pair','parachute-cross','jump','drop',{burst:2,burstGap:1.25,arcHeight:60,recover:1.8})]),
 boulos:Object.freeze([
  s('case-bounce','rolling-case','jump','sweep',{curve:'bounce',waveAmplitude:28,waveCycles:2,projectileSpeedScale:.85}),
  s('case-low-roll','rolling-case','jump','sweep',{widthScale:1.2,projectileSpeedScale:1.1}),
  s('case-overhead','rolling-case','crouch','drop',{arcHeight:48,projectileSpeedScale:.8}),
  s('case-drop-marker','falling-case','move','vertical',{telegraph:1.35,recover:1.7}),
  s('case-double-bounce','rolling-case','jump','diagonal',{curve:'bounce',waveAmplitude:42,waveCycles:3,burst:2,burstGap:1.15,recover:1.75}),
  s('case-high-bounce','rolling-case','crouch','sweep',{curve:'bounce',waveAmplitude:20,waveCycles:2,projectileSpeedScale:.9})]),
 haddad:Object.freeze([
  s('receipt-fan','receipts','crouch','diagonal',{burst:2,burstGap:.95,arcHeight:20,widthScale:.85}),
  s('receipt-low','receipts','jump','sweep',{burst:2,burstGap:1.1,projectileSpeedScale:.9}),
  s('receipt-drop','receipts','jump','drop',{arcHeight:46,recover:1.6}),
  s('tax-stamp-marker','stamp','move','vertical',{telegraph:1.3,recover:1.75}),
  s('tax-stamp-press','stamp','jump','drop',{arcHeight:56,widthScale:1.2,telegraph:1.25,recover:1.8}),
  s('receipt-audit','receipts','crouch','sweep',{burst:3,burstGap:.9,widthScale:.8,recover:1.8})]),
 simone:Object.freeze([
  s('budget-low-row','budget-sheets','jump','sweep',{widthScale:1.2,projectileSpeedScale:.85}),
  s('budget-high-row','budget-sheets','crouch','sweep',{burst:2,burstGap:1.2,projectileSpeedScale:.85}),
  s('budget-column','budget-sheets','move','vertical',{telegraph:1.3,recover:1.65}),
  s('budget-curve','budget-sheets','jump','drop',{arcHeight:32,projectileSpeedScale:1.1}),
  s('budget-revision','budget-sheets','move','vertical',{telegraph:1.1,recover:1.8,widthScale:.85}),
  s('budget-accordion','budget-sheets','crouch','diagonal',{curve:'sine',waveAmplitude:16,waveCycles:2,burst:2,burstGap:1.1})]),
 dino:Object.freeze([
  s('seal-high-press','court-seal','crouch','diagonal',{widthScale:1.25,projectileSpeedScale:.8,recover:1.7}),
  s('seal-verdict-marker','court-seal','move','vertical',{telegraph:1.35,recover:1.8}),
  s('seal-ground-press','court-seal','jump','drop',{arcHeight:52,widthScale:1.2,telegraph:1.2}),
  s('seal-sweep','court-seal','crouch','sweep',{burst:2,burstGap:1.15}),
  s('seal-double-verdict','court-seal','jump','diagonal',{burst:2,burstGap:1.2,arcHeight:26,projectileSpeedScale:.85}),
  s('seal-final-marker','court-seal','move','vertical',{telegraph:1.15,recover:1.9,widthScale:1.25})]),
 xandao:Object.freeze([
  s('hammer-crash','hammer','jump','drop',{arcHeight:60,widthScale:1.2,telegraph:1.3,recover:1.8}),
  s('hammer-double','hammer','jump','diagonal',{burst:2,burstGap:1.15,arcHeight:30,recover:1.7}),
  s('mandado-high','mandado','crouch','sweep',{burst:2,burstGap:.9,widthScale:.85}),
  s('mandado-marker','mandado','move','vertical',{telegraph:1.3,recover:1.6}),
  s('hammer-low-swing','hammer','jump','sweep',{projectileSpeedScale:1.15,recover:1.85}),
  s('mandado-spiral','mandado','crouch','diagonal',{curve:'sine',waveAmplitude:18,waveCycles:1.5,burst:3,burstGap:.95,recover:1.8})]),
 lula:Object.freeze([
  s('l-return-low','lhand','jump','diagonal',{curve:'boomerang',arcHeight:22,projectileSpeedScale:.85,telegraph:1.15,recover:1.7}),
  s('l-return-high','lhand','crouch','sweep',{curve:'boomerang',projectileSpeedScale:.9,recover:1.7}),
  s('l-drop','lhand','jump','drop',{arcHeight:50,widthScale:1.15}),
  s('l-marker','lhand','move','vertical',{telegraph:1.25,recover:1.65}),
  s('l-double-return','lhand','crouch','diagonal',{curve:'boomerang',burst:2,burstGap:1.2,widthScale:.85,recover:1.9}),
  s('l-low-orbit','lhand','jump','sweep',{curve:'sine',waveAmplitude:22,waveCycles:1,projectileSpeedScale:.85})]),
 dilma:Object.freeze([
  s('wind-high-wave','wind','crouch','diagonal',{curve:'sine',waveAmplitude:20,waveCycles:1.5,projectileSpeedScale:.85}),
  s('wind-low-wave','wind','jump','sweep',{curve:'sine',waveAmplitude:22,waveCycles:2,projectileSpeedScale:.9}),
  s('wind-eye-marker','wind','move','vertical',{telegraph:1.35,recover:1.65}),
  s('wind-gust','wind','jump','diagonal',{curve:'sine',waveAmplitude:26,waveCycles:1,gust:Object.freeze({direction:-1,strength:26,duration:.65}),telegraph:1.3,recover:1.8}),
  s('wind-double-front','wind','crouch','sweep',{curve:'sine',waveAmplitude:24,waveCycles:2.5,burst:2,burstGap:1.15,gust:Object.freeze({direction:-1,strength:32,duration:.75}),telegraph:1.35,recover:1.85}),
  s('wind-descending','wind','jump','drop',{curve:'sine',waveAmplitude:30,waveCycles:2,arcHeight:42,projectileSpeedScale:.8})]),
 bossonari:Object.freeze([
  s('bottle-low-lob','cloroquina-prop','jump','drop',{arcHeight:52,projectileSpeedScale:.85,recover:1.65}),
  s('bottle-high-fan','ivermectina-prop','crouch','diagonal',{burst:2,burstGap:1.05,arcHeight:18,widthScale:.85}),
  s('bottle-ground-skid','cloroquina-prop','jump','sweep',{projectileSpeedScale:1.1}),
  s('bottle-spill-marker','ivermectina-prop','move','vertical',{telegraph:1.3,recover:1.8}),
  s('bottle-double-lob','ivermectina-prop','jump','drop',{burst:2,burstGap:1.2,arcHeight:60,recover:1.85}),
  s('bottle-high-spray','cloroquina-prop','crouch','sweep',{burst:3,burstGap:1,widthScale:.8,recover:1.9})]),
 'meme-army':Object.freeze([
  s('ghost-high-pass','meme-ghost','crouch','diagonal',{curve:'sine',waveAmplitude:18,waveCycles:1,widthScale:1.2,projectileSpeedScale:.85}),
  s('ghost-haunt-marker','meme-ghost','move','vertical',{telegraph:1.4,recover:1.8}),
  s('ghost-low-charge','meme-ghost','jump','sweep',{projectileSpeedScale:1.15,telegraph:1.2,recover:1.75}),
  s('ghost-return-marker','meme-ghost','move','vertical',{telegraph:1.15,recover:1.7}),
  s('ghost-double-pass','meme-ghost','jump','diagonal',{curve:'sine',waveAmplitude:28,waveCycles:2,burst:2,burstGap:1.2,recover:1.9}),
  s('ghost-descent','meme-ghost','crouch','drop',{arcHeight:50,projectileSpeedScale:.8,widthScale:1.2,telegraph:1.3})])
});
// Rematches add a new attack to the actor's repertoire, rather than replaying
// the first fight's second phase at higher speed.
const returns=Object.freeze({
 pf:Object.freeze([
  s('blitz-airlock','barrier','jump','drop',{burst:2,burstGap:1.2,arcHeight:54,telegraph:1.3,recover:1.8}),
  s('cuff-coil','handcuffs','crouch','diagonal',{curve:'sine',waveAmplitude:18,waveCycles:2,telegraph:1.15})]),
 army:Object.freeze([
  s('flare-rolling-barrage','signal-flare','jump','sweep',{burst:3,burstGap:1.1,telegraph:1.25,recover:1.85}),
  s('flare-rainbow','signal-flare','crouch','drop',{curve:'sine',waveAmplitude:22,waveCycles:2,arcHeight:52,projectileSpeedScale:.8})]),
 janones:Object.freeze([
  s('message-downpour','message','crouch','drop',{burst:3,burstGap:1,arcHeight:45,telegraph:1.25,recover:1.8}),
  s('message-viral-wave','message','jump','diagonal',{curve:'sine',waveAmplitude:18,waveCycles:2,burst:2,burstGap:1.1})]),
 joice:Object.freeze([
  s('mic-octave','microphone','crouch','drop',{curve:'sine',waveAmplitude:26,waveCycles:2.5,arcHeight:46,telegraph:1.25}),
  s('mic-bass-pulse','microphone','jump','sweep',{curve:'sine',waveAmplitude:30,waveCycles:3,burst:3,burstGap:1.15,recover:1.85})]),
 soraya:Object.freeze([
  s('cross-storm','parachute-cross','crouch','drop',{curve:'sine',waveAmplitude:28,waveCycles:2,burst:2,burstGap:1.25,arcHeight:58,telegraph:1.3}),
  s('cross-low-squadron','parachute-cross','jump','sweep',{burst:3,burstGap:1.15,projectileSpeedScale:.8,recover:1.85})]),
 boulos:Object.freeze([
  s('case-staircase','rolling-case','jump','drop',{curve:'bounce',waveAmplitude:48,waveCycles:4,arcHeight:28,telegraph:1.25}),
  s('case-high-convoy','rolling-case','crouch','diagonal',{curve:'bounce',waveAmplitude:32,waveCycles:3,burst:3,burstGap:1.15,recover:1.85})]),
 haddad:Object.freeze([
  s('tax-stamp-conveyor','stamp','jump','sweep',{curve:'bounce',waveAmplitude:22,waveCycles:2,burst:2,burstGap:1.2,telegraph:1.25}),
  s('receipt-spiral','receipts','crouch','drop',{curve:'sine',waveAmplitude:20,waveCycles:2,arcHeight:42,burst:2,burstGap:1.1})]),
 simone:Object.freeze([
  s('budget-rolled-row','budget-sheets','jump','diagonal',{curve:'sine',waveAmplitude:28,waveCycles:3,burst:2,burstGap:1.15}),
  s('budget-high-stack','budget-sheets','crouch','drop',{arcHeight:55,burst:3,burstGap:1.2,telegraph:1.3,recover:1.85})]),
 dino:Object.freeze([
  s('seal-appeal','court-seal','crouch','drop',{arcHeight:58,burst:2,burstGap:1.2,telegraph:1.35,recover:1.85}),
  s('seal-rolling-verdict','court-seal','jump','sweep',{curve:'bounce',waveAmplitude:30,waveCycles:2,widthScale:1.2,projectileSpeedScale:.85})]),
 xandao:Object.freeze([
  s('hammer-rebound','hammer','jump','sweep',{curve:'bounce',waveAmplitude:38,waveCycles:3,burst:2,burstGap:1.25,telegraph:1.35,recover:1.9}),
  s('mandado-downpour','mandado','crouch','drop',{arcHeight:52,burst:3,burstGap:1.1,widthScale:.85,telegraph:1.25})]),
 lula:Object.freeze([
  s('l-return-descent','lhand','jump','drop',{curve:'boomerang',arcHeight:62,burst:2,burstGap:1.3,telegraph:1.3,recover:1.9}),
  s('l-high-orbit','lhand','crouch','diagonal',{curve:'sine',waveAmplitude:32,waveCycles:3,burst:2,burstGap:1.2})]),
 dilma:Object.freeze([
  s('wind-cyclone','wind','jump','drop',{curve:'sine',waveAmplitude:38,waveCycles:3,arcHeight:36,burst:2,burstGap:1.25,telegraph:1.35,gust:Object.freeze({direction:-1,strength:34,duration:.8}),recover:1.9}),
  s('wind-high-front','wind','crouch','diagonal',{curve:'sine',waveAmplitude:32,waveCycles:3,burst:3,burstGap:1.2,telegraph:1.25,recover:1.9})]),
 bossonari:Object.freeze([
  s('bottle-rebound','cloroquina-prop','jump','diagonal',{curve:'bounce',waveAmplitude:38,waveCycles:3,burst:2,burstGap:1.25,telegraph:1.3}),
  s('bottle-rain','ivermectina-prop','crouch','drop',{arcHeight:58,burst:3,burstGap:1.15,widthScale:.85,recover:1.9})]),
 'meme-army':Object.freeze([
  s('ghost-orbit','meme-ghost','crouch','sweep',{curve:'boomerang',burst:2,burstGap:1.3,telegraph:1.35,recover:1.9}),
  s('ghost-low-swarm','meme-ghost','jump','drop',{curve:'sine',waveAmplitude:36,waveCycles:3,arcHeight:44,burst:3,burstGap:1.25,telegraph:1.3})])
});
const finalPatrols={
 pf:Object.freeze([
  s('blitz-barrier-convoy','barrier','jump','diagonal',{curve:'bounce',waveAmplitude:32,waveCycles:3,burst:3,burstGap:1.2,telegraph:1.35,recover:1.9}),
  s('cuff-high-rain','handcuffs','crouch','drop',{curve:'sine',waveAmplitude:24,waveCycles:3,arcHeight:58,burst:2,burstGap:1.2})]),
 army:Object.freeze([
  s('flare-final-salute','signal-flare','jump','drop',{curve:'sine',waveAmplitude:30,waveCycles:3,arcHeight:60,burst:3,burstGap:1.25,telegraph:1.4,recover:1.9}),
  s('flare-high-battery','signal-flare','crouch','sweep',{curve:'sine',waveAmplitude:20,waveCycles:2,burst:3,burstGap:1.1,telegraph:1.25})])
};
export const BOSS_MECHANICS=Object.freeze(Object.fromEntries(Object.entries(introductions).map(([type,patterns])=>
 [type,Object.freeze([...patterns,...returns[type],...(finalPatrols[type]||returns[type])])])));
// Entries 4/5 are phase-two attacks; 6/7 arrive only on the first rematch.
// Patrols PF/army also have exclusive entries 8/9 on their third appearance.
const orders=Object.freeze([
 Object.freeze([[0,1,2,3],[4,1,5,3,0,2]]),
 Object.freeze([[6,2,7,0,3,1],[7,4,6,5,2,0]]),
 Object.freeze([[8,3,9,1,6,0],[9,5,8,4,7,2]])
]);
export function bossMechanicFor(boss,fired=0){
 const patterns=BOSS_MECHANICS[boss?.type];if(!patterns)return null;
 const rematch=Math.max(0,Math.floor(Number(boss.rematchIndex)||0));
 const phase=Number.isFinite(boss.maxHp)&&boss.maxHp>0&&boss.hp<=boss.maxHp/2?1:0;
 const order=orders[Math.min(rematch,orders.length-1)][phase];
 const index=Math.max(0,Math.floor(Number(fired)||0));
 return {...patterns[order[index%order.length]],encounterPhase:phase+1,rematchIndex:rematch};
}
