# Qualidade e apresentação limpa — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** melhorar arte/animação e resposta dos controles, reduzindo a informação visível na página existente.
**Architecture:** manter Canvas e o motor atual; separar cenários; gerar novos atlas sem substituir os fontes anteriores; integrar no renderer e consolidar o CSS atual.
**Tech Stack:** HTML/CSS, JavaScriptESM, Canvas2D, Node test, Playwright e sharp de desenvolvimento.
**Spec:** docs/superpowers/specs/2026-10-29-quality-clean-design.md

## Global Constraints

- Personagens e regras do jogo preservados conforme a spec; nenhuma arma do protagonista/playlist/pausa manual.
- Buffer120ms; 7.000m/cenário; 100 passaportes/vida; escudo6s.
- Publicação apenas após suíte completa no SHA final. GitHub Pages permanece o destino.

## Review Focus

- Salto atrasado não sobrevive a blur/reinício e não dispara duas vezes.
- Mudança de postura/animação não modifica colisões nem desloca os pés.
- Células do atlas não vazam e poses de agachamento não recebem dupla compressão.
- Interface compacta mantém ajuda/ajustes acessíveis e controles visíveis em320px/paisagem.
- Importações versionadas e recuperação de HTML em cache continuam funcionando.

### Task1: Resposta do salto

**Files:** runner-core.mjs; tests/game-feel.test.mjs.
**Interfaces:** `jumpRun(run):boolean` continua indicando salto imediato; `clearRunInput(run)` limpa intenções/buffer; `advanceRun` consome o buffer uma vez ao pousar.
- [ ] Teste RED: solicitar salto a70ms do pouso e confirmar novo salto; solicitação a250ms expira; postura abaixada pode saltar; limpar entrada impede salto pendente.
- [ ] Implementar buffer de120ms e limpeza, preservando física/colisão/economia.
- [ ] Executar testes do motor e teste novo. Esperado: todos aprovados.

### Task2: Arte e animações

**Files:** assets/flavio-motion-v2.png e .webp; assets/characters-motion-v2.png e .webp; tools/build-runner-art.mjs; runner-sprites.mjs; runner-sprite-data.mjs; tests/runner-art-assets.test.mjs; tests/runner-sprite-geometry.test.mjs.
**Interfaces:** API `drawSpriteActor/loadSprites` preservada, nova opção `falling`; herói4×3 e elenco4×4 conforme spec.
- [ ] Gerar e inspecionar atlas usando os desenhos existentes como referência; manter originais.
- [ ] Antes do renderer, teste RED: seleção de oito passos e poses do herói no mesmo atlas; PF alterna passos.
- [ ] Atualizar geração/manifesto/seleção e registro. Executar gerador e verificações de pixel/recorte.

### Task3: Página e apresentação

**Files:** index.html; game.css; runner.mjs; novo runner-scenery.mjs; tests/clean-game.test.cjs.
**Interfaces:** `drawScenery(ctx,{stage,distance,width,reducedMotion})`; IDs existentes mantidos para acessibilidade e recuperação.
- [ ] Teste RED de navegador: pista e início visíveis na tela390×844; objetivo/recorde/duplicatas recolhidos; ajuda abre; inicia/salta/abaixa/reinicia sem erro.
- [ ] Enxugar HTML/CSS sem esconder comandos; integrar atlas, buffer e cenário; mostrar mensagens somente quando relevantes.
- [ ] Inspecionar320/390/768/1440, paisagem, encontros e derrota. Esperado: sem overflow, avisos fora da pista, desenhos completos e ajuda funcional.

### Task4: Verificação, revisão e publicação

**Files:** tools/version-runner-assets.mjs (executar); README; documentação da rodada.
- [ ] Gerar versões de conteúdo; suíte completa serial; revisão independente da diferença inteira.
- [ ] Corrigir achados relevantes com RED→GREEN; confirmar CI do SHA exato.
- [ ] Integrar/publicar no GitHub Pages e verificar recursos/controles na URL pública.
- [ ] Relatar mudanças e limites sem afirmar playtest humano ou igualdade de qualidade comprovada.
