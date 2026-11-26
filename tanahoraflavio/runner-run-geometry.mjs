import {BOSS_ARENA_RESERVE} from './runner-bosses.mjs?v=d257c721afc8';

export const WORLD = Object.freeze({width:900,height:300,ground:246});
// Envelope de todas as poses no atlas a .95 de escala, incluindo o agachamento.
// A mesma margem serve ao jacaré e evita deslocar o herói ao trocar de postura.
export const PLAYER = Object.freeze({x:120,width:34,height:58,visualLeft:-26,visualRight:75});
export const MIN_VIEWPORT_WIDTH=480;
export const visibleWidth = run => Math.max(MIN_VIEWPORT_WIDTH,Math.min(900,Number(run.viewportWidth)||WORLD.width));
// Primeiro contato horizontal usa o mesmo recuo de 3 px da colisão abaixo.
export const playerX = run => Number.isFinite(run.player.x)?run.player.x:PLAYER.x;
export const arenaReserve=run=>run.boss?.traversal?326:BOSS_ARENA_RESERVE;
export const playerBounds = run => ({min:-PLAYER.visualLeft,max:visibleWidth(run)-(run.boss?.combat&&run.boss.phase!=='intro'?arenaReserve(run):PLAYER.visualRight)});
export const frontContact = run => playerX(run)+PLAYER.width-6;
