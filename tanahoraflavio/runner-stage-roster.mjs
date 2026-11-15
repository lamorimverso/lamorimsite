// Common pressure belongs to the locality. Named bosses keep their own
// rehearsals and encounters instead of appearing in the global projectile pool.
const roster=(stageId,ground,actor,weapon)=>Object.freeze({
 stageId,ground:Object.freeze(ground),overhead:Object.freeze([Object.freeze({actor,weapon})])
});
export const STORY_ROSTERS=Object.freeze([
 roster('brasilia',['pf','barrier'],'pf','handcuffs'),
 roster('rio',['orla-runner','barrier'],'orla-runner','signal-flare'),
 roster('sao-paulo',['paulista-runner','arrow-panel'],'paulista-runner','arrow-panel'),
 roster('argentina',['route-scout','case'],'route-scout','receipts'),
 roster('paraguai',['army','barrier'],'army','signal-flare'),
 roster('florida',['terminal-guard','case'],'terminal-guard','receipts'),
 roster('casa-branca',['meme-ghost','barrier'],'meme-ghost','meme-ghost'),
 roster('brasilia-final',['lula-runner','ze-gotinha-rival'],'lula-runner','lhand')
]);

export function stageRosterFor(stageId){return STORY_ROSTERS.find(roster=>roster.stageId===stageId)||STORY_ROSTERS[0];}

// The logical actor stays on the projectile for names, sound and identity.
// Both rendering and its physical muzzle use these complete combat figures,
// matching the ground costumes from runner-art's STORY_RUNNER_ART.
export function regionalEmitterFor(type,stageId='brasilia'){
 switch(type){
  case 'orla-runner':return {type:'army',armyVariant:'rio'};
  case 'paulista-runner':return {type:'pf'};
  case 'route-scout':return {type:'army',armyVariant:'argentina'};
  case 'terminal-guard':return {type:'army',armyVariant:'florida'};
  case 'lula-runner':return {type:'lula'};
  case 'ze-gotinha-rival':return {type:'ze-gotinha'};
  case 'meme-ghost':return {type:'meme-army'};
  case 'army':return {type:'army',armyVariant:stageRosterFor(stageId).stageId};
  default:return {type};
 }
}
