import test from 'node:test';
import assert from 'node:assert/strict';
import {createRun,startRun,advanceRun,jumpRun,PLAYER} from '../tanahoraflavio/runner-core.mjs';
import {ELECTION_TRACKS,playlistEmbedUrl} from '../tanahoraflavio/runner-playlist.mjs';

const step=(r,n)=>{for(let i=0;i<n&&r.status==='running';i++)advanceRun(r,1/120,()=>0);};
function bossRun(){
 const r=createRun();startRun(r);r.viewportWidth=480;r.nextRaid=Infinity;
 r.bossBag=['xandao'];r.nextBossAt=0;
 advanceRun(r,1/120,()=>0);
 r.boss.nextShot=100;r.boss.nextAttack=0;
 advanceRun(r,1/120,()=>0);
 return r;
}
test('primeiro chefe só chega depois de um trecho substancial de corrida',()=>{
 const r=createRun();startRun(r);r.nextRaid=Infinity;r.nextObstacle=1e8;
 r.nextPassport=r.nextPower=r.nextPickup=1e8;r.shieldFor=100;
 advanceRun(r,1/120,()=>0);
 assert.equal(r.nextBossAt,8500);
 step(r,120*25);
 assert.equal(r.boss,null,'sem chefão antes dos 25 segundos iniciais');
 step(r,120*18);
 assert.ok(r.boss,'o chefão deve aparecer depois do período inicial');
});
test('objeto sai da mão do chefão e viaja em linha reta até o Flávio',()=>{
 const r=bossRun(),shot=r.obstacles.at(-1);
 assert.ok(shot.bossAttack&&shot.projectile);
 assert.equal(shot.targetX,PLAYER.x+PLAYER.width/2);
 assert.equal(shot.targetY,PLAYER.height/2);
 assert.equal(shot.y,77);
 const initialX=shot.x;step(r,24);
 assert.ok(shot.x<initialX,'o disparo deve mover-se da direita para a esquerda');
 assert.ok(shot.y<77,'o ataque deve aproximar-se da altura real do jogador');
 const progress=(shot.launchX-(shot.x+shot.width/2))/(shot.launchX-shot.targetX);
 assert.ok(Math.abs(shot.y-(shot.launchY+(shot.targetY-shot.launchY)*progress))<.0001);
});
test('projétil acertando tira vida e derruba jogador desprotegido',()=>{
 const r=bossRun();step(r,120*2);
 assert.equal(r.status,'over');
 assert.equal(r.lives,0);
});
test('o salto depois do lançamento realmente evita o projétil direcionado',()=>{
 const r=bossRun();
 step(r,72);assert.equal(r.status,'running');
 assert.equal(jumpRun(r),true);
 step(r,78);
 assert.equal(r.status,'running');
});
test('o Escudo das Américas protege contra projéteis sem dano',()=>{
 const r=bossRun();r.shieldFor=6;
 step(r,120*2);
 assert.equal(r.status,'running');
 assert.equal(r.lives,1);
});
test('playlist contém escolhas reais sem hospedagem ou links arbitrários',()=>{
 assert.deepEqual(ELECTION_TRACKS.slice(0,4).map(t=>t.id),['lula','bota','flavio','renan']);
 assert.equal(ELECTION_TRACKS.length,13);
 assert.equal(playlistEmbedUrl('__unknown__'),null);
 for(const track of ELECTION_TRACKS){
  const url=new URL(playlistEmbedUrl(track.id));
  assert.equal(url.hostname,'www.youtube-nocookie.com');
  assert.ok(url.pathname.endsWith('/'+track.video));
  assert.equal(url.searchParams.get('autoplay'),'1');
  if(track.start!==undefined)assert.equal(url.searchParams.get('start'),String(track.start));
 }
});
