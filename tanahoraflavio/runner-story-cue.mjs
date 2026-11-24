// Presentation only: one phase-aware instruction, no changes to damage or timers.
const dodge=action=>({jump:'Pule',crouch:'Abaixe',move:'Desvie para o lado'})[action]||'Observe e desvie';
export function storyBattleCue(boss,{attack=null,attackLabel,intercept=false,reflected=false,opening=null}={}){
 if(!boss?.role)return null;
 const cue=(label,action,open=false)=>({label,action,open});
 // Traversal is never presented as a damage duel.
 if(boss.traversal)return cue(boss.name,attack?dodge(attack.action):'Atravesse a passagem');
 // A pending or active hazard takes precedence over any simultaneous reward.
 if(attack)return cue(attackLabel||boss.powerName||'Ataque',intercept?'Rebata ou '+dodge(attack.action).toLocaleLowerCase('pt-BR'):dodge(attack.action));
 if(intercept)return cue('Projétil inimigo','Rebata ou desvie');
 if(reflected)return cue('Projétil devolvido','Continue desviando',true);
 if(opening)return cue('Guarda aberta','Atire no chefão',true);
 if(boss.phase==='intro')return cue(boss.name,'Prepare-se');
 if(boss.phase==='recover')return cue('Recuperação','Atire ou recarregue');
 return null;
}

// Keep simultaneous unlocks visible; never promise an unlock the motor did not grant.
export function storyRewardText(skill,power,jumpLabel){
 const parts=[];
 if(skill)parts.push('HABILIDADE CONQUISTADA · '+skill.name+' · '+jumpLabel+' de novo no ar');
 if(power)parts.push((power.isNew?'PODER CONQUISTADO · ':power.upgraded?'PODER MELHORADO · ':'PODER NO NÍVEL MÁXIMO · ')+power.name+' · nível '+power.level);
 return parts.join(' | ');
}
