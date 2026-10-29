# UX audit fixes implementation plan

> **For agentic workers:** use task-scoped execution and the approved design. Execute every verification and record progress. Independent file sets may be delegated; one whole-branch review precedes integration.

**Goal:** corrigir os problemas reproduzidos da auditoria, refinar UX e publicar o jogo preservando o histórico aprovado.

**Architecture:** manter Canvas e ES modules. Lógica expõe ações de ameaça e estado de entrada; interface consome esses estados. Ferramentas de geração produzem atlas e hashes determinísticos.

**Tech Stack:** JavaScript/Node, HTML/CSS, Canvas, sharp para gerar arte, Playwright para regressão; GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-10-28-ux-audit-fixes-design.md`.

## Global Constraints
- Manter desenhos, orientação à direita, 7.000 m por cenário, 100 passaportes por vida, escudo de seis segundos e primeiro chefe tardio.
- Nenhuma arma/ataque do jogador, playlist, navegação retirada ou pausa manual.
- Compartilhar e a frase de derrota permanecem. Nenhum outro site ou serviço pode mudar.

## Review Focus
- Toque mantido antes do pouso, cancelamento e retomada de foco não podem perder ou prender postura.
- Troca de orientação não pode criar dano instantâneo ou coletas com velocidade incompatível.
- Assistência, ajustes e som não podem impedir jogo quando armazenamento está bloqueado.
- Importações ou imagens lentas/falhas devem resultar em recuperação, sem carregar eternamente.
- Instruções, caixas de colisão e padrões de chefe devem concordar; informações não podem cobrir a pista.

### Task 1: Lógica, justiça e economia
**Files:** `tanahoraflavio/runner-core.mjs`, testes de lógica existentes e `tests/ux-core.test.mjs`.
**Interfaces:** `createRun({assisted})`, `bossAttackFor(type,fired)`, `crouchRun(run,active)`, `run.lastHit`, perigos/coletas `speed`.
- [ ] Escrever e executar testes novos: intenção antes do pouso, soltar/cancelar, mistura de ações de cada chefe, mesma janela em 480/612/900, coletas coerentes, metadados de impacto e piloto legal de 150–330 s.
- [ ] Confirmar falhas pelo comportamento ausente; implementar decisões da spec sem mudar regras preservadas.
- [ ] Executar `node --test tests/*.test.mjs`; Expected: todas as verificações de lógica aprovadas.

### Task 2: Recursos leves e carregamento recuperável
**Files:** `runner-sprites.mjs`, novo `runner-sprite-data.mjs`, `assets/*.webp`, `tools/build-runner-art.mjs`, testes de arte/carregamento.
**Interfaces:** manter `drawSpriteActor`, `loadSprites(onProgress)`, `spriteFrameFor`, `spriteScaleFor`; manifesto interno com frames e URLs.
- [ ] Escrever testes de atlas/recortes e de timeout sem callback tardio; confirmar falha.
- [ ] Gerar WebP sem perdas e manifesto; eliminar varredura em runtime; manter PNG originais e funções públicas.
- [ ] Executar testes de sprites e arte e comparar pixels visíveis; Expected: imagens equivalentes, bytes menores, carregamento finito e nova tentativa funcional.

### Task 3: Interface, controles e feedback
**Files:** `index.html`, `runner.mjs`, `runner-audio.mjs`, nova `game.css`, novo `runner-bootstrap.js`, `tests/site.test.cjs`, novos testes de UX.
**Interfaces:** consumir campos da Task 1 e loader da Task 2; data attributes preservados para testes. Preferências locais toleram falhas.
- [ ] Escrever testes de navegador para dicas, agachar mantido, preferências, progresso, derrota, ampliar e falha de bootstrap; confirmar falhas.
- [ ] Implementar apresentação focada, ajuda recolhida, opções, janela de avisos, retomada e feedback; remover somente CSS substituído.
- [ ] Executar testes de navegador com Chromium disponível e revisar capturas; Expected: controles e conteúdo utilizáveis sem overflow, com erros recuperáveis.

### Task 4: Versões, regressão e revisão
**Files:** `tools/version-runner-assets.mjs`, `tests/release-assets.test.mjs`, workflow de CI e documentação.
**Interfaces:** referências relativas em HTML/imports recebem hashes reais e estáveis, sem mudança em outros sites.
- [ ] Escrever teste que detecta recurso alterado sem hash correspondente; confirmar falha.
- [ ] Gerar/validar hashes e atualizar CI; executar `node --test tests/*.test.*` e verificação de hashes; Expected: tudo aprovado.
- [ ] Solicitar revisão independente do diff completo e resolver achados importantes com regressões.

### Task 5: Integração e publicação
**Files:** somente os aprovados nas tarefas anteriores.
- [ ] Subir branch e abrir PR com resumo e testes; aguardar CI aprovado no SHA exato.
- [ ] Integrar com proteção de SHA e acompanhar implantação do mesmo commit.
- [ ] Conferir URL pública, abertura, pulo/abaixar, ausência de músicas e erros; registrar resultado sem alegar playtest humano.
