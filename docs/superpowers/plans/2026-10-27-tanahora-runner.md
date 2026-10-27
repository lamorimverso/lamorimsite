# Visual e minigame — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar o visual limpo e a corrida Rio → Argentina → EUA na página existente.

**Architecture:** Motor determinístico separado do Canvas e da interface. CSS adicional e inserções localizadas no HTML preservam contador e música.

**Tech Stack:** HTML, CSS, JavaScript ES modules, Canvas 2D, node:test e Playwright para verificação.

**Spec:** `docs/superpowers/specs/2026-10-27-tanahora-runner-design.md`

## Global Constraints

- Sem dependências de runtime ou backend; publicação existente no GitHub Pages.
- Rio: 0–25 s; Argentina: 25–50 s; EUA: 50–75 s; vitória em 75 s.
- Não alterar outras páginas, a data da contagem nem a lógica musical.
- Sem início automático; teclado e toque; pausa ao perder visibilidade.

## Review Focus

- Aba oculta ou intervalo grande de frames: não avançar a corrida injustamente.
- Toque e teclado em botões: uma ação não pode provocar duas partidas ou dois pulos.
- Armazenamento bloqueado ou corrompido: o jogo deve continuar utilizável.
- Tela de 320 px e zoom: conteúdo legível, sem vazamento horizontal.
- Falha de mídia externa: contador e jogo devem continuar funcionando.

### Task 1: Motor de corrida

**Files:** Create `tanahoraflavio/runner-core.mjs`, `tests/runner.test.mjs`.

**Interfaces:** `createRun()`, `startRun(run)`, `jumpRun(run)`, `togglePause(run)`, `advanceRun(run, seconds, rng)`, `stageAt(seconds)`, `scoreFor(run)`; estado independente do DOM.

- [x] Escrever e executar testes de progressão, pulo sem repetição no ar, colisão, coleta única, pausa, fases e vitória; falhar pela ausência do motor.
- [x] Implementar física em coordenadas fixas, intervalos de obstáculos alcançáveis e duração de frame limitada.
- [x] Executar `node --test tests/runner.test.mjs`; esperar zero falhas.

### Task 2: Página e Canvas

**Files:** Modify `tanahoraflavio/index.html`, `tanahoraflavio/README.md`; create `tanahoraflavio/enhancements.css`, `tanahoraflavio/runner.mjs`, `tests/site.test.cjs`.

**Interfaces:** Consome o motor de Task 1; os IDs antigos continuam disponíveis; controles nativos expõem iniciar, pular, pausar e recomeçar.

- [x] Executar testes de navegador na revisão anterior e observar ausência do jogo.
- [x] Inserir layout responsivo e pista com cenários, personagem, obstáculos e itens; guardar recorde defensivamente.
- [x] Verificar toque, teclado, pausa/retomada, armazenamento bloqueado, fontes, contador e widths 320/390/768/1440 com `node --test tests/*.test.*`.
- [x] Inspecionar screenshots de desktop e celular e corrigir defeitos encontrados.

### Task 3: Revisão e publicação

- [x] Revisar o diff e receber revisão independente do jogo e suas integrações.
- [x] Corrigir problemas importantes com regressões executáveis; repetir a suíte após mudanças.
- [ ] Publicar um commit atômico apenas dos arquivos da tarefa, conferindo SHA atual para não perder mudanças concorrentes.
- [ ] Confirmar a execução do GitHub Pages e os arquivos servidos na URL pública.
