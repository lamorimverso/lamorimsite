> Registro histórico. O roteiro foi atualizado para cinco cenários contínuos no design `2026-10-27-continuous-runner-design.md`.

# UX refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Melhorar a leitura inicial, os controles e a navegação da página existente.

**Architecture:** Alterações localizadas no HTML e no CSS adicional. O esclarecimento posterior sobre fases acrescenta identificação no adaptador e seleção de obstáculos/bônus por etapa no motor, preservando a física.

**Tech Stack:** HTML, CSS e Playwright.

**Spec:** `docs/superpowers/specs/2026-10-27-ux-refinement-design.md`

## Global Constraints

- Contador completo na primeira tela de 320×568 e 390×844.
- Controles com altura mínima de 44 px e rótulos de pelo menos 14 px.
- Preservar física, IDs existentes, datas, música e compartilhamento.

## Review Focus

- Refluxo e navegação por teclado, inclusive com zoom.
- Pular deve permanecer acessível em celular durante a corrida.
- Recomeçar não deve disputar a ação principal da partida.
- Conteúdo recolhido deve manter instruções acessíveis.
- Mídia externa não deve deslocar o contador para fora da primeira tela.

### Task 1: Hierarquia e controles

**Files:** Modify `tanahoraflavio/index.html`, `tanahoraflavio/enhancements.css`, `tanahoraflavio/runner-core.mjs`, `tanahoraflavio/runner.mjs`, `tests/site.test.cjs`, `tests/runner.test.mjs`.

**Interfaces:** Mesmos IDs e estados `data-run-state` utilizados pelo jogo; sem novas APIs de runtime.

- [x] Testes primeiro: contador acima da dobra, alvos de toque e atalho de teclado; observar falhas na versão anterior.
- [x] Separar ações e mídia do contador, compactar retrato e reorganizar controles por estado.
- [x] Simplificar instruções por expansão opcional, aproximar fontes da contagem e adicionar atalho de teclado.
- [x] Identificar as três fases e seus obstáculos/bônus próprios, com regressões de motor e integração.
- [x] Executar suíte completa e inspecionar capturas em 320, 390 e 1440 px.

### Task 2: Revisão e publicação

- [x] Revisão independente do diff e eventuais correções.
- [ ] Publicar com proteção contra mudanças concorrentes na branch.
- [ ] Conferir HTML e CSS publicados contra os arquivos testados.

Revisão final: corrigidos conflito de Espaço na ajuda e ordem de foco dos controles, ambos reproduzidos antes do patch e cobertos por regressões. Recursos atualizados usam a mesma identificação de versão para evitar mistura de arquivos em cache.
