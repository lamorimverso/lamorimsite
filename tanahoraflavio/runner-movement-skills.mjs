// Movement progression is scoped to one run, including optional practice.
const BASIC=Object.freeze({id:'basic',maxAirJumps:0,airJumpVelocity:430});
const DOUBLE=Object.freeze({id:'double-jump',maxAirJumps:1,airJumpVelocity:430});
export const createMovementSkills=()=>({doubleJump:false});
export const movementProfileFor=run=>run.movementSkills?.doubleJump?DOUBLE:BASIC;
export function rewardMovementVictory(run,boss){
 const eligible=run.mode==='story'?boss.type==='soraya':run.bossesDefeated>=5;
 if(!eligible||boss.traversal||run.movementSkills.doubleJump)return false;
 run.movementSkills.doubleJump=true;
 run.lastSkillReward={id:'double-jump',name:'Duplo pulo',sourceBoss:boss.type,remaining:6};
 return run.lastSkillReward;
}
