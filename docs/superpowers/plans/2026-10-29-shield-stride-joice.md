# Corrida, escudo e Joice — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Pesquisador independente cuida apenas da mídia; revisão final por contexto novo.

**Goal:** mostrar passada contínua, escudo físico e aparições surpresa da Joice com áudio autêntico verificado.
**Architecture:** manter Canvas e motor; separar passada essencial de efeitos decorativos, reutilizar item vetorial como escudo e ajustar o evento de perseguição existente.
**Tech Stack:** JavaScript ESM, Canvas 2D, Node test, Playwright.
**Spec:** docs/superpowers/specs/2026-10-29-shield-stride-joice-design.md

## Global Constraints

Sem alterações de física/toque/armas; escudo 6 s; ondas com intervalo mínimo 1,15 s; chefes e cinco cenários preservados; áudio verdadeiro somente com fonte e gesto/som.

## Review Focus

- Movimento reduzido mantém pernas legíveis e elimina balanço/poeira decorativos.
- Escudo fica diante do braço, acompanha salto/slide e não cobre o rosto nem modifica opacidade/colisão.
- Joice não se sobrepõe a chefe/transição nem elimina a janela de reação.
- Áudio de arquivo para ao desativar som/ocultar/perder e não compete com narração sintética.
- Aparição e legenda cabem em 320 px/paisagem e não criam painel permanente.

### Task 1: Passada e escudo físico

**Files:** runner.mjs, runner-art.mjs; tests/journey-layout.test.cjs.
**Interface:** drawProtection(ctx,{x,y,crouching,remaining,foreground}); fase da passada continua entregue ao drawActor.
- [x] Testar passagem real por várias poses durante corrida com efeitos reduzidos e sistema; RED no caso congelado.
- [x] Testar pixels opacos do escudo limitado ao objeto, à frente do corpo, nas duas posturas; RED com campo de corpo inteiro.
- [x] Implementar passada essencial e objeto, verificar salto/slide/expiração e opacidade.

### Task 2: Joice e meme

**Files:** runner-core.mjs, runner.mjs, runner-audio.mjs, runner-voice-data.mjs, index.html, assets/audio; tests/joice-surprise.test.mjs, runner-updates.test.mjs, runner-audio.test.mjs, journey-layout.test.cjs.
**Interface:** manter run.raid com warning/active/recovery; ARCHIVE_VOICES.joice se mídia confirmada; audio.event('warning') inicia recorte original.
- [x] RED: primeira janela 18–30 s e repetição 28–48 s, aviso 1,2 s, ondas mais densas e ainda seguras; chefe/transição continuam excluídos.
- [x] Implementar agenda/fator .78 e personagem visível na pista durante aviso; manter ajuda curta recolhida.
- [x] RED→GREEN da curva em 7/14/28 km: frequência/reação crescem com curva mais perceptível, limites preservados; verificar movimento do fundo através do renderer real durante a partida.
- [x] Pesquisar e verificar fonte original/termos/transcrição/corte. Integrar somente candidato aprovado.
- [x] RED→GREEN da reprodução apenas em aviso, sem voz sintética simultânea, interrupções e hash do arquivo.

### Task 3: Verificação e entrega conjunta

- [x] RED→GREEN: retirar botões/barra; tocar/deslizar na pista, dois dedos, cancelamento e teclado; atualizar testes que exigiam os controles agora removidos.
- [x] RED→GREEN: rota/cenário continuam em chefes e Joice, sem alterar marcos/ordem e transições graduais.

- [x] Capturar passada, escudo em pé/salto/slide e Joice em 320/390/paisagem; conferir rosto, objeto e controles.
- [ ] Atualizar versões, executar suíte completa, revisar diff e revisão independente de toda a branch.
- [ ] Resolver achados importantes com RED→GREEN; CI no SHA exato, merge, Pages, hashes e navegador público.
