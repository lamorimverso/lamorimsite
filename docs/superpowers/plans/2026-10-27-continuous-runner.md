# Consolidação da corrida contínua — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox syntax for tracking.

**Goal:** concluir e publicar o refinamento de UX e o percurso contínuo mais recente.
**Architecture:** combinar alterações locais sobre o mesmo commit de origem; manter HTML/CSS e canvas estáticos.
**Tech Stack:** HTML, CSS, JavaScript ES modules, node:test e Playwright.
**Spec:** docs/superpowers/specs/2026-10-27-continuous-runner-design.md

## Global Constraints
- Brasília → Rio → Argentina → Flórida → Casa Branca, a cada 20 s; sem São Paulo e sem vitória automática.
- Preservar contador, datas, música, compartilhamento, créditos e outras páginas.
- Nenhuma nova dependência de runtime.

## Review Focus
- Continuidade de tempo, placar e personagem nas transições e depois de 80 s.
- Física e tempo em taxas de quadros baixas e aba suspensa.
- Alvos de toque, ordem de foco e ajuda por teclado.
- Ausência de overflow em 320 px e rota compreensível com cinco destinos.
- Publicação sem substituir alterações concorrentes ou arquivos de outras páginas.

### Task 1: Consolidar e validar
**Files:** tanahoraflavio/index.html, enhancements.css, runner-core.mjs, runner.mjs, README.md; tests/runner.test.mjs e tests/site.test.cjs.
**Interfaces:** stageAt(seconds), SCENE_SECONDS=20, STAGES com cinco cenários; mesmos IDs e controles existentes.
- [x] Recuperar snapshots e registrar o escopo final.
- [x] Executar regressões de percurso contínuo contra a versão de três fases e observar as falhas.
- [x] Consolidar os cinco cenários com o layout e controles preparados.
- [x] Executar node --test tests/*.test.*; 24 testes passaram, zero falhas.
- [x] Inspecionar prévia desktop e verificar layout móvel por testes automatizados; revisar diff.

### Task 2: Publicar e conferir
**Files:** os mesmos arquivos e registros de design/plano.
**Interfaces:** árvore base 5f6d7d2cf7101270fcff7885435fba047d1854ba; GitHub Pages do repositório existente.
- [x] Revisão independente do conjunto final: aprovada, sem falhas críticas ou importantes; 24 testes passaram também na revisão.
- [ ] Criar commit preservando a árvore completa e publicar com expected_sha.
- [ ] Confirmar execução Pages e comparar arquivos publicados com os testados.

## Registro da retomada
- Regra aplicada: a última instrução de corrida contínua com cinco cenários substitui o roteiro anterior de três fases; uma corrida que encerrasse aos 75 s contrariaria o pedido.
- RED→GREEN: percurso, continuidade e tempo em baixa taxa de quadros falharam contra a versão anterior e passaram na consolidação.
- Ajuste no teste de integração: esperar o primeiro ponto real antes de verificar sua preservação; alterar apenas o relógio não produz distância.
- A revisão independente deixou publicação e resultado remoto para a conferência desta etapa. Não foram executados testes com leitor de tela nem em dispositivo físico; os testes móveis usam emulação. A música externa permaneceu com a implementação existente.
