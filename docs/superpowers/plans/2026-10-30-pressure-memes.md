# Pressure and Memes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Corrida com progressão real, personagens úteis e vozes de memes contextuais no estilo da referência.
**Architecture:** Motor puro calcula encontros; renderer consome ações e fases. Diretor de vozes separado da reprodução e trilha procedural. Atlas novos preservam os PNGs antigos.
**Tech Stack:** JavaScript ESM/Canvas/WebAudio, Node test, Playwright, sharp.
**Spec:** docs/superpowers/specs/2026-10-30-pressure-memes-design.md

## Global Constraints
Preservar todos os contratos da spec; não tocar bots, outros sites, n8n. Usar base publicada b4293f5. Publicação já autorizada pelo usuário. Não recriar controles ou pausa removidos.

## Review Focus
- Corrida longa e eventos vencidos: Joice deve voltar sem sobrepor chefes.
- Mudança de tela/assistência e reação: contatos continuam justos e piloto legal funciona.
- Áudio em bloqueio/rejeição/mute/foco: não travar ou deixar trilha em segundo plano.
- Atlas extras lentos/falhando: retry atômico e contagem correta.
- Reduzir efeitos: leitura de perigos/poses de corrida permanece, sem flashes.

### Task 1: Motor de pressão e papéis
**Files:** runner-core.mjs; tests/pressure-core.test.mjs; contratos legados específicos.
**Interfaces:** difficultyAt(distance,elapsed=0) expõe pressure; bossAttackFor(type,fired,round=0); run.cameo/type/remaining e pickup ze-gotinha.
- [x] Escrever testes de pressão tempo/distância, mix de ações, padrões, Joice pendente, aliado e contratos de reação. Executar RED.
- [x] Implementar spec, medir contatos e políticas com simulações determinísticas. Atualizar apenas expectativas legadas substituídas pela spec, preservar física. GREEN e commit.

### Task 2: Áudio contextual
**Files:** runner-soundtrack.mjs; runner-voice-director.mjs; runner-meme-data.mjs; runner-audio.mjs; runner-voice-data.mjs; audio assets; tests/pressure-audio.test.mjs.
**Interfaces:** soundtrack.update({active,pressure,boss,raid,ducked})/stop; audio.background(state), voice(name,{priority}), onVoice(clip); director.event(kind,run)/update(run,{safe})/reset.
- [x] Testar notas contínuas, parada/duck sem backlog, prioridade, silêncio/contexto e falhas de mídia. RED.
- [x] Integrar clips públicos verificados e trilha original, sem síntese fingindo pessoas. GREEN e commit.

### Task 3: Movimento, atmosfera e UI
**Files:** novos assets PNG/WebP/layout/source; tools/build-runner-art.mjs; runner-sprites/art/scenery/mjs; HTML/game.css; tests/pressure-art.test.mjs/journey-layout.test.cjs.
**Interfaces:** SPRITE_SHEET_COUNT; drawRaidAtmosphere/raidMoodFor; 4poses/ator com pivô estável, ataques antigos preservados.
- [x] Testes RED de novos quadros, carregamento, placar e Joice persistente/vermelha.
- [x] Integrar novos atlas, ameaças/pickup, mixer/diretor, legenda curta fora da pista, HUDlimpo e ajuda contextual. GREEN.
- [x] Verificação visual/navegador/som e suíte completa; atualizar versões/README/relatório de evidências. Commit.

### Task 4: Revisão e publicação
- [x] Revisão independente única de toda branch, corrigir importantes com regressão RED→GREEN e suíte verde.
- [ ] Publicar árvore exata via GitHub, verificar CI head/PR/main e Pages, hashes públicos e UI pública. Reportar resultado com URL real e limitações reais.
