// Patrulha terrestre contínua com saltos e avanço rápido, mantendo a faixa
// de reação à direita da arena. As trajetórias independem do FPS e da fase
// de ataque: o chefão continua andando enquanto dispara.
function hash(text,seed){for(const ch of text)seed=(Math.imul(seed,31)+ch.charCodeAt(0))>>>0;return seed;}
export function platformBossPose(boss,width=900){
 const age=Math.max(0,Number(boss.age)||0),arrival=boss.phase==='intro'?Math.max(0,1-age/1.1)**3*150:0;
 // Acessibilidade: sem movimento decorativo, mas com combate preservado.
 if(boss.reducedMotion)return {x:width-88+arrival,platformY:0,state:'idle'};
 const t=Math.max(0,age-1.1),seed=Number(boss.flightSeed)||0;
 const stride=t*2.7+(hash(boss.type||'',seed)%628)/100;
 // 76 px de patrulha, com reversão suave e velocidade máxima de 103 px/s.
 // Mesmo no celular, o chefe não invade o corredor do jogador.
 const x=width-94+38*Math.sin(stride)+arrival;
 const velocityX=102.6*Math.cos(stride);
 // Um salto curto a cada 3,1 s. Pouso completo antes do salto seguinte,
 // inclusive durante a carga e o lançamento de projéteis.
 const jumpClock=(t+(hash('jump:'+(boss.type||''),seed)%310)/100)%3.1;
 const jumping=jumpClock>=.65&&jumpClock<1.45;
 const height=({sentinel:72,gunner:78,caster:86,sovereign:82})[boss.classId]||76;
 const platformY=jumping?height*Math.sin(Math.PI*(jumpClock-.65)/.8):0;
 return {x,platformY,state:jumping?'jump':Math.abs(velocityX)>65?'dash':'move',velocityX};
}
