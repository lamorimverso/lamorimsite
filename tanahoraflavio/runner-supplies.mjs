// Scarce route ammunition, battle-only idle reload and cumulative earned shields.
export const ROUTE_AMMO=6;
export const BOSS_AMMO=12;
export const RELOAD_DELAY=1;
export const RELOAD_INTERVAL=.45;
export const ammoCapacityFor=run=>run.boss?BOSS_AMMO:ROUTE_AMMO;
export function addAmmo(run,amount=3){
 const before=run.ammo??ROUTE_AMMO;run.ammo=Math.min(ammoCapacityFor(run),before+amount);return run.ammo-before;
}
export function addShieldPart(run){
 run.allyShieldProgress=(run.allyShieldProgress||0)+1;
 if(run.allyShieldProgress>=6){run.reserveShields=(run.reserveShields||0)+Math.floor(run.allyShieldProgress/6);run.allyShieldProgress%=6;}
}
export function advanceAmmo(run,dt){
 run.ammo=Math.min(run.ammo??ROUTE_AMMO,ammoCapacityFor(run));
 if(!run.boss||run.player.attackHeld||run.player.isJacare){run.ammoIdleFor=0;run.ammoReloadFor=0;return;}
 const before=run.ammoIdleFor||0;run.ammoIdleFor=before+dt;
 if(run.ammo>=BOSS_AMMO){run.ammoReloadFor=0;return;}
 const reloadTime=Math.max(0,run.ammoIdleFor-RELOAD_DELAY)-Math.max(0,before-RELOAD_DELAY);
 run.ammoReloadFor=(run.ammoReloadFor||0)+reloadTime;
 while(run.ammoReloadFor>=RELOAD_INTERVAL&&run.ammo<BOSS_AMMO){run.ammo++;run.ammoReloadFor-=RELOAD_INTERVAL;}
}
