# Corre, Flávio! Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Publicar as regras, visuais e eventos aprovados para o jogo existente.
**Architecture:** Manter motor puro em runner-core.mjs, desenho em runner-art.mjs, integração DOM/áudio em runner.mjs. Atualizar o HTML/CSS da página sem alterar os demais sites.
**Tech Stack:** JavaScript ESM, Canvas 2D, HTML/CSS, Node test runner e Playwright existente.
**Spec:** docs/superpowers/specs/2026-10-28-corre-flavio-design.md

## Global Constraints
- Sem dependências novas em produção, backend ou alteração na raiz do site.
- Escudo das Américas: invisibilidade por 6 s; somente uma vida inicial; vida extra a cada 100 passaportes.
- Bíblia: três disparos de dano 3; ataque básico dano 1. Fantasma e Constituição removidos.
- Joice: aviso 2 s, evento 8 s, recuperação 2 s, intervalo aleatório 35–60 s; sem empilhar com chefes.
- Preservar teclado/toque, movimento reduzido, áudio opcional e suspensão de aba oculta.

## Review Focus
- Coleta no mesmo frame de colisão protege imediatamente; expiração não deixa escudo de impacto oculto.
- Sorteio em muitas voltas não repete chefe antes do fim da rodada nem trava a progressão.
- Evento disparado perto de chefe/transição espera uma janela segura, sem apertar os saltos além do limite.
- Suspensão da aba congela temporizadores e interrompe fala; reiniciar limpa efeitos e áudio antigos.
- Telas de 320 px e áudio indisponível mantêm legenda, controles e pista utilizáveis.

### Task 1: Regras e sorteios
**Files:** runner-core.mjs, tests/runner-updates.test.mjs, tests/runner.test.mjs, tests/balance.test.mjs.
**Interfaces:** createRun/startRun/jumpRun/advanceRun preservados; estado shieldFor, bibleCharges, routeDistance, bossBag, raid, nextRaid. stageAt e stageTransitionAt recebem relógio virtual da rota em segundos; bossAtRound calcula atributos do chefe escolhido.
- [ ] Escrever testes de coleta útil, escudo, munição, sorteio, encontros, rota e eventos; observar falhas no código atual.
- [ ] Implementar as regras e atualizar testes antigos cujo contrato foi substituído pela especificação.
- [ ] Executar testes de física/balanço, inclusive piloto com várias sementes e diferentes taxas de quadros. Esperado: todos passam e os saltos permanecem viáveis.
- [ ] Registrar progresso e commit local.

### Task 2: Aparência, instruções e áudio
**Files:** runner-art.mjs, runner.mjs, index.html, minimal.css, tests/site.test.cjs (todos dentro de tanahoraflavio salvo os testes).
**Interfaces:** renderização consome estado do motor; áudio reage somente à mudança de estado de raid, sem iniciar requisições externas; desenhos usam o mesmo contexto Canvas.
- [ ] Atualizar testes de navegador para escudo/munição, narradora, som e ciclo de destinos; observar falhas nas novas expectativas.
- [ ] Implementar caricaturas e ataques próprios, indicador de efeito/munição, Joice com legenda/fonte e controle de som.
- [ ] Atualizar instruções e versões dos módulos/estilos para evitar mistura de caches antigos.
- [ ] Executar suíte completa e inspecionar visualmente celular/desktop na prévia gerenciada. Esperado: controles, contador e música preservados; zero erros JS.
- [ ] Registrar progresso e commit local.

### Task 3: Revisão e publicação
**Files:** README.md do jogo, documentação do plano e somente os arquivos de produto/testes alterados.
- [ ] Documentar regras reais e validação; obter revisão independente da mudança conforme executing-plans.
- [ ] Corrigir achados relevantes com testes; executar verificações finais e revisar diff.
- [ ] Criar árvore/commit remoto preservando a árvore base; atualizar main com expected_sha e sem force.
- [ ] Verificar a publicação, módulos novos e os dois redirecionamentos. Esperado: conteúdo novo disponível na URL pública.
