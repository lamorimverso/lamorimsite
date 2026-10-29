# Comandos simultâneos — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** permitir saltar com outro dedo enquanto Abaixar continua pressionado.
**Architecture:** corrigir apenas o filtro de entrada em `bindJump`; preservar motor, alvos e eventos de compatibilidade existentes.
**Tech Stack:** JavaScriptESM, Canvas2D, Node test, Playwright/Chromium.
**Spec:** docs/superpowers/specs/2026-10-29-touch-continuation-design.md

## Global Constraints

- Site clean, sem novas faixas/textos; preservar contagem e Compartilhar.
- Flávio só foge/desvia; sem ataque, playlist ou pausa manual.
- Buffer120ms; cinco cenários de7.000m;100 passaportes por vida; escudo6s.
- Preservar arte e regras publicadas; não alterar outros sites/bots.
- Publicação após suíte completa e CI no SHA final.

## Review Focus

- Segundo dedo deve iniciar salto mesmo com o contato primário ainda em Abaixar.
- Soltar o dedo de salto não pode soltar a intenção do primeiro dedo.
- Um toque/click de compatibilidade não pode executar dois saltos.
- Mouse secundário e contatos não primários de outros dispositivos mantêm o filtro existente.
- Blur, cancelamento e rotação não podem deixar comandos presos ou interromper a retomada.

### Task1: Toque simultâneo

**Files:** runner.mjs; tests/ux-site.test.cjs; README.md.
**Interfaces:** `bindJump(target)` aceita o contato secundário quando `pointerType === 'touch'`; `jumpRun(run)` continua retornando true apenas na decolagem imediata. Nenhuma nova API pública.

- [x] Escrever dois testes nativos para segundo dedo em Pular/pista; executar antes de corrigir. Esperado: ambos falham com velocidade não positiva na segunda pressão.
- [x] Alterar o filtro de `pointerdown` somente para admitir toque não primário; executar os testes até pousar e liberar Abaixar. Esperado: ambos passam.
- [x] Verificar regressões de mouse, toque único/cancelamento/foco e rotação sem introduzir nova interface.
- [x] Atualizar README e versões; executar suíte completa serial. Esperado: todos passam e `--check` aprova.
- [ ] Revisão independente, CI do SHA exato, publicação e conferência pública.
