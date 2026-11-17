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
// One announced beat per release. Overrides describe facing/height/lane,
// while the common timing/counter belongs to the whole authored sequence.
const zone=(laneOffset=0,gap)=>({action:'move',approach:'vertical',targetY:24,arcHeight:0,laneOffset,gap});
const low=(extra={})=>({action:'jump',approach:'sweep',targetY:24,arcHeight:10,...extra});
const high=(extra={})=>({action:'crouch',approach:'diagonal',targetY:92,arcHeight:0,...extra});
const wave=(size,cycles=1)=>({curve:'sine',waveAmplitude:size,waveCycles:cycles});
const roll=(size=24,cycles=2)=>({curve:'bounce',waveAmplitude:size,waveCycles:cycles});
const gust=(direction,strength=26,duration=.7)=>Object.freeze({direction,strength,duration});
const chain=(signature,type,beats,extra={})=>{
 const sequence=Object.freeze(beats.map(x=>Object.freeze(x)));
 return s(signature,type,sequence[0].action,sequence[0].approach,{...sequence[0],burstMode:'sequence',sequence,
  burst:sequence.length,burstGap:1.08,telegraph:1.24,recover:1.66,...extra});
};
const late=(signature,type,beats,extra={})=>chain(signature,type,beats,{telegraph:1.14,recover:1.58,...extra});
const newBosses=Object.freeze({
 'ana-elisa':Object.freeze([
  chain('network-link-intro','network-panel',[zone(-24),low(wave(18))]),
  s('network-low-data','network-panel','jump','sweep',wave(18)),
  s('network-top-row','network-panel','crouch','diagonal',wave(14)),
  chain('network-zigzag','network-panel',[zone(24),zone(-24),zone(0)]),
  late('network-reverse-links','network-panel',[zone(0),zone(27),zone(-27)]),
  s('network-link-rain','network-panel','jump','drop',{...wave(24,2),arcHeight:42}),
  late('network-four-corners','network-panel',[zone(-23),zone(20),zone(-20),zone(25)]),
  late('network-mid-row','network-panel',[high(wave(22,2)),low(),high()])]),
 rick:Object.freeze([
  chain('pulse-six-count','signal-pulse',[low(),high(),low(),high(),low(),high()],{burstGap:.98,finishBeforeVictory:.85}),
  s('pulse-ping','signal-pulse','jump','sweep',wave(13)),
  s('pulse-high-ping','signal-pulse','crouch','diagonal',wave(20)),
  chain('pulse-pair','signal-pulse',[high(),low()]),
  late('pulse-six-reverse','signal-pulse',[high(),low(),high(),low(),high(),low()],{burstGap:.96}),
  s('pulse-downbeat','signal-pulse','jump','drop',{...wave(23,2),arcHeight:38}),
  late('pulse-six-accent','signal-pulse',[low(wave(24)),high({gap:1.12}),low(),high(wave(26,2)),low(),high()],{burstGap:.96}),
  late('pulse-six-echo','signal-pulse',[high(wave(24)),low(),high(),low({gap:1.13}),high(),low(wave(27,2))],{burstGap:.95})]),
 sofia:Object.freeze([
  chain('arrow-panel-call','arrow-panel',[low(),high(),zone(0)]),
  s('arrow-feint-low','arrow-panel','jump','sweep',{projectileSpeedScale:1.1}),
  s('arrow-top-turn','arrow-panel','crouch','diagonal',wave(18)),
  chain('arrow-late-left','arrow-panel',[high(),zone(-20),low()]),
  late('arrow-reordered-panel','arrow-panel',[zone(18),low(),high({gap:1.17})]),
  s('arrow-panel-ray','arrow-panel','crouch','drop',{arcHeight:42}),
  late('arrow-center-turn','arrow-panel',[zone(0),high(),low()]),
  late('arrow-cycle-fast','arrow-panel',[low(),zone(15),high(),low()])]),
 guilherme:Object.freeze([
  chain('planters-alternate','garden-box',[low(roll(28)),high(),low(roll(34,3))]),
  s('planter-high-vine','garden-box','crouch','diagonal',{...wave(14),widthScale:1.1}),
  s('planter-drop-zone','garden-box','move','vertical',{telegraph:1.35}),
  s('planter-rolling-pot','garden-box','jump','sweep',{...roll(31),widthScale:1.18}),
  late('planters-mirror-bed','garden-box',[high(),low(roll(32,3)),high(),low(roll(39,3))]),
  s('planter-double-stack','garden-box','crouch','drop',{arcHeight:44,burst:2,burstGap:1.15}),
  late('planters-long-row','garden-box',[low(roll(39,3)),high(),low(roll(36,4)),high()]),
  late('planters-pot-hop','garden-box',[high(),low(roll(37,3)),high()])]),
 erika:Object.freeze([
  chain('spotlight-stage-intro','stage-spotlight',[zone(-25),high(wave(17)),zone(25)]),
  s('spotlight-balcony','stage-spotlight','crouch','diagonal',{...wave(17),widthScale:1.2}),
  s('spotlight-floor','stage-spotlight','jump','sweep',wave(20,2)),
  chain('spotlight-cross-right','stage-spotlight',[zone(24),zone(-24)]),
  late('spotlight-cross-encore','stage-spotlight',[zone(28),zone(-28),zone(0)]),
  s('spotlight-curtain','stage-spotlight','jump','drop',{arcHeight:52,widthScale:1.15}),
  late('spotlight-cross-triple','stage-spotlight',[zone(0),zone(-26),zone(26)]),
  late('spotlight-stage-wave','stage-spotlight',[high(wave(22)),low(wave(22,2))])]),
 'renato-freitas':Object.freeze([
  chain('signs-spin-low-high','rotating-sign',[low(roll(23)),high(wave(21,2)),zone(0)]),
  chain('signs-switched-post','rotating-sign',[zone(22),low(),high(wave(21,2))]),
  chain('signs-pinwheel','rotating-sign',[high(wave(27,2)),zone(-22),low(roll(25))]),
  chain('signs-loose-arrow','rotating-sign',[low(roll(22)),zone(-18)]),
  late('signs-half-turn','rotating-sign',[zone(-24),high(wave(27)),low(roll(28,3))]),
  late('signs-rapid-turn','rotating-sign',[high(wave(29,3)),low(roll(29,3)),zone(24)]),
  late('signs-reverse-turn','rotating-sign',[zone(23),high(wave(25)),low(roll(32,3))]),
  late('signs-triple-mark','rotating-sign',[zone(20),zone(-20),zone(0)])]),
 jones:Object.freeze([
  chain('debate-switch-sides','debate-card',[high({gust:gust(-1)}),low({gust:gust(1)})],{burstGap:1.13}),
  s('debate-floor-point','debate-card','jump','sweep',wave(15)),
  s('debate-topic-mark','debate-card','move','vertical',{telegraph:1.36}),
  chain('debate-crossed-terms','debate-card',[low({gust:gust(1)}),high({gust:gust(-1)})]),
  late('debate-interruption','debate-card',[low({gust:gust(1,30),...wave(25)}),high({gust:gust(-1,30),...wave(24,2)})]),
  s('debate-long-reply','debate-card','crouch','drop',{arcHeight:38,burst:2,burstGap:1.12}),
  late('debate-open-microphone','debate-card',[high({gust:gust(-1,30)}),low({gust:gust(1,30)})]),
  late('debate-shifting-topic','debate-card',[low({gust:gust(1,33)}),high({gust:gust(-1,33)}),low({gust:gust(1,31)})])]),
 maestro:Object.freeze([
  chain('baton-rubato','baton-wave',[low({...wave(31,2),gap:1.21}),high(wave(26)),low(wave(32,2))]),
  s('baton-high-practice','baton-wave','crouch','diagonal',wave(24,2)),
  s('baton-low-practice','baton-wave','jump','sweep',wave(24,2)),
  chain('baton-syncopation','baton-wave',[high({...wave(25,2),gap:1.26}),low(wave(31,3))]),
  late('baton-late-cadenza','baton-wave',[high({...wave(34,2),gap:1.19}),low(wave(36,3)),high(wave(24,3))]),
  s('baton-stage-dot','baton-wave','move','vertical',{telegraph:1.24}),
  late('baton-contratempo','baton-wave',[low({...wave(37,3),gap:1.3}),high(wave(38,3)),low(wave(28,3))]),
  late('baton-pause-and-resume','baton-wave',[high({...wave(27,3),gap:1.28}),low(wave(36,3)),high(wave(27,3))])]),
 capita:Object.freeze([
  chain('flag-three-winds','wind-flag',[high({gust:gust(1)}),low({gust:gust(-1)}),high({gust:gust(1)})]),
  s('flag-low-drift','wind-flag','jump','sweep',wave(22,2)),
  s('flag-high-drift','wind-flag','crouch','diagonal',wave(25,2)),
  chain('flag-sides-reversed','wind-flag',[low({gust:gust(-1)}),high({gust:gust(1)}),low({gust:gust(-1)})]),
  late('flag-crosswinds','wind-flag',[low({gust:gust(-1,31),...wave(30,2)}),high({gust:gust(1,33)}),low({gust:gust(-1,29)})]),
  s('flag-marker','wind-flag','move','vertical',{telegraph:1.35}),
  late('flag-storm-directions','wind-flag',[high({gust:gust(1,30),...wave(26,3)}),low({gust:gust(-1,34)}),high({gust:gust(1,34)})]),
  late('flag-strong-reversal','wind-flag',[low({gust:gust(-1,33)}),high({gust:gust(1,34),...wave(28,2)}),low({gust:gust(-1,34)})])]),
 fiscal:Object.freeze([
  chain('inspection-road-gates','inspection-gate',[zone(-20),low(),zone(20)]),
  chain('inspection-high-then-low','inspection-gate',[high(),low()]),
  chain('inspection-road-check','inspection-gate',[zone(20),zone(-20)]),
  chain('inspection-two-locks','inspection-gate',[low(),zone(0)]),
  late('inspection-tight-corridor','inspection-gate',[zone(20),high(),zone(-20)]),
  late('inspection-close-and-open','inspection-gate',[high(),low(),zone(0)]),
  late('inspection-check-reverse','inspection-gate',[zone(0),high(),low()]),
  late('inspection-corridor-reversed','inspection-gate',[zone(19),low(),zone(-19)])]),
 povo:Object.freeze([
  chain('square-clear-lanes','crowd-lane',[zone(-22),zone(24),zone(0)]),
  chain('square-neighbor-lanes','crowd-lane',[zone(21),zone(-21),zone(0)]),
  chain('square-center-first','crowd-lane',[zone(0),zone(-24),zone(24)]),
  chain('square-neighbor-cross','crowd-lane',[zone(22),zone(0),zone(-22)]),
  late('square-lanes-reversed','crowd-lane',[zone(0),zone(26),zone(-26)]),
  late('square-shifting-traffic','crowd-lane',[zone(-20),zone(20),zone(-20)]),
  late('square-lanes-late','crowd-lane',[zone(0),zone(25),zone(-25)]),
  late('square-three-turns','crowd-lane',[zone(-24),zone(0),zone(24)])])
});
export const BOSS_MECHANICS=Object.freeze({...Object.fromEntries(Object.entries(introductions).map(([type,patterns])=>
 [type,Object.freeze([...patterns,...returns[type],...(finalPatrols[type]||returns[type])])])),...newBosses});
// Na História, a primeira sequência já apresenta a assinatura do chefe.
// Os repertórios do Infinito e das revanches não herdam essas aberturas.
const campaignOpenings=Object.freeze({
 dilma:s('wind-opening-gust','wind','crouch','diagonal',{
  ...wave(20,1.5),projectileSpeedScale:.85,gust:gust(-1,21,.64)}),
 haddad:chain('tax-audit-opening','receipts',[
  high({arcHeight:20,widthScale:.85}),{...zone(0),type:'stamp'}],{telegraph:1.15}),
 simone:chain('budget-opening-grid','budget-sheets',[
  low({widthScale:1.2}),zone(0),high({widthScale:1.1})],{telegraph:1.15})
});
// The tell and the counter belong to the attack, not to the boss class.
// An evasive volley must finish without any physical hit, even behind a shield.
const counter=(applies,label,counterHint,{delay=0,window=.94,damage=3.8,trigger='evade'}={})=>
 Object.freeze({applies,label,counterHint,delay,window,damage,trigger});
const counters=Object.freeze({
 pf:counter(p=>p.type==='barrier','BLITZ ABERTA','Pule todas as barreiras',{damage:4.1}),
 army:counter(p=>p.burst>1,'FIM DA SALVA','Desvie de toda a salva',{delay:.12,damage:4.2}),
 janones:counter(p=>p.burst===3,'FIM DA RAJADA','Desvie das três mensagens',{window:1.06,damage:4.3}),
 joice:counter(p=>p.action==='crouch','SEM VOZ','Abaixe até a nota passar',{delay:.14,damage:3.5}),
 soraya:counter(p=>p.approach==='drop','POUSOU','Desvie e espere a cruz pousar',{delay:.18,damage:4.2}),
 boulos:counter(p=>p.curve==='bounce'&&p.action==='jump','MALA PASSOU','Pule a mala até o último quique',{damage:4.2}),
 haddad:counter(p=>p.type==='stamp'||p.sequence?.some(beat=>beat.type==='stamp'),'CARIMBO BAIXOU','Escape do carimbo TAXA',{delay:.13,damage:4.4}),
 simone:counter(p=>p.approach==='vertical'||p.sequence?.some(beat=>beat.approach==='vertical'),'COLUNA LIVRE','Saia da coluna travada',{damage:4.4}),
 dino:counter(p=>p.action==='move'||p.approach==='drop','SELO NO CHÃO','Desvie e espere o selo baixar',{delay:.24,damage:4.4}),
 xandao:counter(p=>p.type==='hammer'&&p.burst<=2,'MARTELO BAIXOU','Pule a martelada e espere',{delay:.22,damage:4.5}),
 lula:counter(p=>p.curve==='boomerang','O L VOLTOU','Desvie na ida e espere o retorno',{trigger:'return',window:1.1,damage:4.5}),
 dilma:counter(p=>!!p.gust,'CALMARIA','Desvie da rajada até o vento parar',{trigger:'gust',delay:.18,damage:4.6}),
 bossonari:counter(p=>p.type==='ivermectina-prop','FRASCOS EM PAUSA','Desvie dos dois tipos seguidos',{trigger:'alternate',window:1.06,damage:4.8}),
 'meme-army':counter(p=>p.action==='move'||p.signature==='ghost-low-charge','RECUOU','Escape da marca ou da investida',{delay:.25,window:.95,damage:4.9}),
 'ana-elisa':counter(p=>p.signature==='network-link-intro'||p.sequence?.every(step=>step.action==='move'),'REDE APAGADA','Desvie das marcas e dos painéis',{delay:.11,damage:4.4}),
 rick:counter(p=>p.burst===6,'SÉTIMO TEMPO','Conte seis pulsos e espere a pausa',{delay:.35,window:1.16,damage:5.4}),
 sofia:counter(p=>p.burstMode==='sequence','PAINEL LIVRE','Siga a ordem das setas',{delay:.11,damage:4.5}),
 guilherme:counter(p=>p.sequence?.some(step=>step.curve==='bounce'),'ÚLTIMO VASO','Alterne salto e agachamento',{delay:.15,damage:4.7}),
 erika:counter(p=>p.signature==='spotlight-stage-intro'||p.sequence?.every(step=>step.action==='move'),'PALCO ESCURO','Desvie das marcas e dos refletores',{delay:.18,damage:4.9}),
 'renato-freitas':counter(p=>p.burstMode==='sequence','PLACAS LIBERADAS','Desvie até o fim do giro',{trigger:'clear-only',delay:.18}),
 jones:counter(p=>p.sequence?.every(step=>!!step.gust),'FIM DO DEBATE','Desvie nos dois sentidos',{delay:.19,damage:4.9}),
 maestro:counter(p=>p.sequence?.some(step=>step.gap>.95),'FIM DA FINTA','A batuta atrasa uma batida',{delay:.12,damage:4.8}),
 capita:counter(p=>p.sequence?.every(step=>!!step.gust),'BANDEIRAS BAIXAS','Desvie nas três mudanças de vento',{trigger:'gust',delay:.19,damage:5}),
 fiscal:counter(p=>p.burstMode==='sequence','PASSAGEM LIBERADA','Passe por todas as cancelas',{trigger:'clear-only'}),
 povo:counter(p=>p.burstMode==='sequence','PRAÇA LIVRE','Ceda espaço às faixas marcadas',{trigger:'clear-only'})
});

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
 const firstDuel=index===0&&rematch===0&&phase===0&&boss.role==='map-boss';
 const pattern=(firstDuel?campaignOpenings[boss.type]:null)||patterns[order[index%order.length]%patterns.length],rule=counters[boss.type];
 const stage=Math.max(0,Number(boss.stageIndex)||0),rank=Math.max(1,Number(boss.rank)||1);
 const pressure=stage*.055+(rank-1)*.035+Math.min(rematch,2)*.065+phase*.15;
 const contactFor=Math.max(.82,1.11/(pattern.projectileSpeedScale||1)-pressure*.5);
 const opening=rule?.applies(pattern)?{label:rule.label,delay:rule.delay,trigger:rule.trigger,damage:rule.damage,
  window:Math.max(.68,rule.window-pressure*.42)}:null;
 const recover=Math.max(.62,pattern.recover*.72-pressure*.48,opening?opening.delay+opening.window+.08:0);
 return {...pattern,encounterPhase:phase+1,rematchIndex:rematch,contactFor,recover,
  telegraph:Math.max(.62,pattern.telegraph-pressure*.86),burstGap:Math.max(.78,pattern.burstGap-pressure*.35),
  counter:opening,counterHint:opening?rule.counterHint:null};
}
