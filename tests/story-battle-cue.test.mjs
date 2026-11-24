import test from 'node:test';
import assert from 'node:assert/strict';
import {storyBattleCue,storyRewardText} from '../tanahoraflavio/runner-story-cue.mjs';

const boss={role:'map-boss',name:'Chefão',powerName:'Poder',phase:'attack'};
test('a live hazard overrides the counter and returned projectile without a misleading green cue',()=>{
 assert.deepEqual(storyBattleCue(boss,{attack:{action:'jump'},attackLabel:'Martelo',intercept:true,opening:'ABERTURA',reflected:true}),{label:'Martelo',action:'Rebata ou pule',open:false});
 assert.deepEqual(storyBattleCue(boss,{attack:{action:'crouch'},opening:'ABERTURA'}),{label:'Poder',action:'Abaixe',open:false});
 assert.deepEqual(storyBattleCue(boss,{attack:{action:'move'},opening:'ABERTURA'}),{label:'Poder',action:'Desvie para o lado',open:false});
});
test('intro, ordinary recovery and earned counters are distinct',()=>{
 assert.deepEqual(storyBattleCue({...boss,phase:'intro'}),{label:'Chefão',action:'Prepare-se',open:false});
 assert.deepEqual(storyBattleCue({...boss,phase:'recover'}),{label:'Recuperação',action:'Atire ou recarregue',open:false});
 assert.deepEqual(storyBattleCue({...boss,phase:'recover'},{opening:'ABERTURA'}),{label:'Guarda aberta',action:'Atire no chefão',open:true});
 assert.equal(storyBattleCue(boss),null);
});
test('traversals and endless encounters keep their original roles',()=>{
 assert.deepEqual(storyBattleCue({...boss,name:'O Povo Brasileiro',traversal:true},{attack:{action:'move'},opening:'ABERTURA',intercept:true}),{label:'O Povo Brasileiro',action:'Desvie para o lado',open:false});
 assert.equal(storyBattleCue({phase:'attack'},{attack:{action:'jump'}}),null);
 assert.equal(storyBattleCue(null),null);
});
test('reflection alone and projectile-only defense are distinct',()=>{
 assert.deepEqual(storyBattleCue(boss,{reflected:true}),{label:'Projétil devolvido',action:'Continue desviando',open:true});
 assert.deepEqual(storyBattleCue(boss,{reflected:true,intercept:true}),{label:'Projétil inimigo',action:'Rebata ou desvie',open:false});
});

test('combined rewards announce both unlocks and max level accurately',()=>{
 const skill={name:'Duplo pulo'},power={name:'Cruz de paraquedas',isNew:true,level:1};
 const message=storyRewardText(skill,power,'K');
 assert.match(message,/Duplo pulo.*K de novo no ar/);
 assert.match(message,/PODER CONQUISTADO.*Cruz de paraquedas/);
 assert.match(storyRewardText(null,{...power,isNew:false,upgraded:false,level:3},'K'),/NÍVEL MÁXIMO/);
 assert.match(storyRewardText(null,{...power,isNew:false,upgraded:true,level:2},'K'),/PODER MELHORADO/);
 assert.equal(storyRewardText(null,null,'K'),'');
});
