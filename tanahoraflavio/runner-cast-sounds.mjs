import {ALLIES} from './runner-allies.mjs?v=181506ec1b3c';
// Original nonverbal cues. These are sound effects, never a substitute for a
// person's voice. The whole cast has three quiet presence variants.
export const SOUND_CAST=Object.freeze(['flavio','jacare','ze-gotinha','army','haddad','lula','pf','xandao','janones','joice','dilma','simone','soraya','boulos','dino','bossonari','meme-army',...ALLIES.map(a=>a.id)]);
const banks=new Map(SOUND_CAST.map((actor,i)=>[actor,Object.freeze({id:'presence-'+actor,variants:Object.freeze(Array.from({length:3},(_,v)=>Object.freeze([
 Object.freeze({delay:0,start:180+i*29+v*17,end:250+i*23+v*31,length:.085+v*.018,wave:i%3===0?'triangle':'sine',volume:.026,attack:.009}),
 Object.freeze({delay:.11+v*.025,start:370+i*19+v*37,end:240+i*31+v*23,length:.11+v*.02,wave:'sine',volume:.024,attack:.012})
 ])))})]));
export function getCastSoundBank(actor){return banks.get(typeof actor==='string'?actor:actor?.type)||null;}
