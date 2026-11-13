import test from 'node:test';
import assert from 'node:assert/strict';
import * as bodies from '../tanahoraflavio/runner-body-art.mjs';
import {standingEnemyPose} from '../tanahoraflavio/runner-cast-pose.mjs';
function canvas(){const calls=[];return new Proxy({calls,globalAlpha:1},{get(o,k){if(k in o)return o[k];return(...a)=>calls.push([k,...a]);},set(o,k,v){o[k]=v;calls.push(['set',k,v]);return true;}});}
const cast=['haddad','lula','xandao','pf','army','janones','joice','dilma','simone','soraya','boulos','dino','bossonari','flavio','ze-gotinha','vorcaro','jair','michelle','eduardo','carlos','renan','silas','magno','nikolas','tarcisio','damares','bia','trump','milei','bolsominion'];
test('cada corpo possui roupa e anatomia próprias, com membros preenchidos',()=>{
 const wardrobes=new Set();
 for(const type of cast){const profile=bodies.characterBodyProfile(type);assert.ok(profile,type);wardrobes.add(profile.style);
  const c=canvas();bodies.drawCharacterBody(c,standingEnemyPose({phase:4}),{type,phase:4});
  assert.ok(c.calls.filter(r=>r[0]==='bezierCurveTo').length>=16,type+' precisa de silhuetas completas de torso, membros, mãos e sapatos');
  assert.ok(!c.calls.some(r=>r[0]==='set'&&r[1]==='lineWidth'&&r[2]>=8),type+' não pode usar traços grossos como corpo');
  assert.equal(c.calls.filter(r=>r[0]==='save').length,c.calls.filter(r=>r[0]==='restore').length);
 }
 assert.ok(wardrobes.size>=7,'não é o mesmo terno com cores diferentes');
});
test('corpo sem cabeça nem plataforma articula pernas, tronco e mãos nas ações',()=>{
 for(const type of cast){const poses=[];
  for(const [progress,flags] of [[.1,{preparing:true}],[.9,{preparing:true}],[.7,{attacking:true}],[.7,{recovering:true}]]){
   const c=canvas();bodies.drawCharacterBody(c,standingEnemyPose({phase:5,progress,...flags}),{type,phase:5});poses.push(JSON.stringify(c.calls));
  }
  assert.equal(new Set(poses).size,4,type+' corpo inteiro congelado');
 }
});
