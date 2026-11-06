# Dossier Pack Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completar funções e acabamento recuperados do dossiê sem regressões da versão publicada.
**Architecture:** Expandir o motorCanvas existente com dados de aliados e ameaças posicionais. Renderizar atlas e telegráficos coerentes com o estado físico, mantendo a trilha e o diretor de vozes.
**Tech Stack:** JavaScriptESM, Canvas2D, WebAudio, NodeTest, Chromium/Playwright em CI, sharp.
**Spec:** docs/superpowers/specs/2026-11-06-dossier-pack-design.md

## Global Constraints

- Escopo somente jogo, ferramentas de arte, testes e documentação.
- Física610/1750, buffer120ms, escudo6s, passaportes100=vida, cenários7km, primeiro chefe22km e intervalo≥7km.
- Sem armas do herói, pausa manual, voz artificial ou atribuição de falas a outro orador.
- Preservar trilha8bits, assistência, controle multitoque, expansão e contagem.

## Review Focus

- Deslocar em direção ao perigo, recuar depois de ultrapassá-lo e girar a tela sem ressuscitar colisões.
- Queda durante salto/transformação e combinação com retaguarda sem rota impossível.
- Dois dedos em ações diferentes; cancelamento/foco limpa movimento e retoma o som correto.
- Coleta com magnetismo mantém escudo, economia e hitbox; cameo ausente no atlas nunca vira outro rosto.
- Fala longa, mute, alertas e falha de mídia não escondem ameaça nem empilham voz.

### Task 1: Movimento e quedas posicionais

**Files:** Modify tanahoraflavio/runner-core.mjs; Create tests/dossier-movement.test.mjs.
**Interfaces:** Produces player.x, moveRun(run,direction), spawnFallingThreat(run,{bossAttack}), falling.age/warningFor/fallFor. Consumes existing advanceRun/resizeRun/jumpRun.
- [ ] Escrever testes de movimento com salto/abaixar, limites/foco, colisão/coleta fora dex120, recuo após evasão e resize.
- [ ] Executar tests/dossier-movement.test.mjs; esperar falhas nas funções e estado ausentes.
- [ ] Implementar eixoX e queda com alvo fixo,1,2s de aviso,0,4s de descida e rotas dos dois lados; adaptar contatos reais e aposentadoria.
- [ ] Executar nova suíte e regressões do motor; esperar zero falhas; commit.

### Task 2: Encontros e elenco funcional

**Files:** Modify runner-core.mjs; Create runner-allies.mjs, tests/dossier-campaign.test.mjs, tests/dossier-allies.test.mjs; update campanha antiga para a ordem ampliada.
**Interfaces:** Consumes movimento/quedaTask1. Produces cinco chefes, ALLIES, allyForStage, collectAlly, advanceAllies, run.ally/run.aid e timers de benefícios.
- [ ] Escrever testes de vitória real dos dois chefes novos, agendamento, escolha por cenário, magnetismo3s/cooldown24s, limpeza limitada, coleta opcional e jacaré.
- [ ] Executar testes novos antes de implementar; esperar falhas de funcionalidades ausentes.
- [ ] Acrescentar Janones/PF e aliados espaçados sem alterar armas dos três chefes existentes; preservar economia e proteções.
- [ ] Executar motor/campanha/aliados; esperar zero falhas; commit.

### Task 3: Arte, comandos, cenários e interface

**Files:** Modify runner.mjs, runner-art.mjs, runner-sprites.mjs, runner-sprite-data.mjs, runner-scenery.mjs, index.html, game.css, tools/build-runner-art.mjs; Create tools/dossier-art-layout.json e tests/dossier-art.test.mjs; assets/allies-motion-[a-d]-v1.* gerados pela tarefa de arte delegada.
**Interfaces:** Consumes Task1/2 state. Produces poses para15aliados+jacaré, gestos laterais, avisos de queda/benefícios e plano de cenário contínuo.
- [ ] Escrever testes funcionais dos novos recortes e browser de comandos laterais/cancelamento, forma/efeitos, estados de carregamento e geometria de aviso.
- [ ] Executar testes antes das alterações e registrar falhas relevantes.
- [ ] Integrar assets/pivôs e desenho, coordenadas reais, gestos e leitura dos novos encontros; retirar retrato extra/carregamento visível abaixo da pista; refinar cenários sem ruído na pista.
- [ ] Executar verificações de arte, versões e browser/CI; inspecionar imagens; commit.

### Task 4: Hierarquia de áudio e retomada

**Files:** Modify runner-audio.mjs, runner-voice-director.mjs, runner.mjs; tests/pressure-audio.test.mjs e tests/dossier-audio.test.mjs.
**Interfaces:** Consumes actor/ally/boss events. Produces mixagem com alerta prioritário e fonte única retomável.
- [ ] Reproduzir alerta abafado pela voz e retomada de Joice; testesRED antes de corrigir.
- [ ] Corrigir prioridade sem cortar falas de igual prioridade, sem speechSynthesis e sem substituir gravações por IA; usar atores reais nos eventos e um som próprio para novas participações.
- [ ] Executar áudio unitário/Chromium e regressões da trilha; esperar zero falhas; commit.

### Task 5: Pack verificado e lançamento

**Files:** Create docs/pack-atualizacao-2026-11-06.md; update README e créditos; registrar revisão e release.
**Interfaces:** Consumes todos os Tasks. Produces matriz pedido→resultado→evidência, testes e versão pública verificada.
- [ ] Rodar pilotos de comandos legais por largura/semente, simulação longa e suíte completa; resolver falhas observadas.
- [ ] Revisão independente de toda a branch; corrigir Critical/Important com regressãoRED→GREEN; registrar limites perceptivos/humanos.
- [ ] Versionar assets, conferir escopo e publicar por PR/CI. Verificar Pages, hashes e interface pública; registrar commit de rollback.
