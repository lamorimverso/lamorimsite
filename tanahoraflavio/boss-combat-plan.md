# Boss arenas implementation plan

**Goal:** Entregar 20 encontros por classes e dificuldade com inimigos em pé em naves e combate ativo de Flávio.
**Architecture:** Catálogo e funções puras em runner-bosses.mjs; integração no motor existente; arte separada em runner-boss-art.mjs com cabeças do atlas e rig vetorial; entradas e HUD no runner.mjs/HTML/CSS.
**Spec:** boss-combat-design.md.

## Constraints
- História com 20 encontros (quatro por cenário); encontro final Fantasma do Comunismo.
- Preservar jacaré de dez segundos, teclas existentes, Infinito e urna 13/22.
- Plataformas e gestos próprios; sem corpo em pose de corrida no emissor.
- Sem dependências novas de runtime; não alterar outros sites/serviços.

## Tasks
- [x] 1. Arte: exportar drawSpriteHead(ctx,{type,x,y,size,phase}); implementar drawHoverEnemy(ctx,{type,x,y,scale,phase,preparing,attacking,hurt,reducedMotion,classId}), drawBossArena(ctx,{width,ground,phase,state,stageIndex,reducedMotion}) em runner-boss-art.mjs. x/y é centro horizontal e nível dos pés na plataforma, coordenadas Canvas. Corpo próprio em pé com joelhos/pés, cabeça original, braços independentes, motores. Fantasma usa silhueta já existente como sprite vetorial especial. Testes de poses/rig/cabeças e renderização.
- [x] 2. Catálogo: runner-bosses.mjs com storyBossAt(index), STORY_ENCOUNTERS=20, classes/dificuldades/padrões, nextStoryBossDistance(index). Testes de 20 encontros, 5 grupos, progressão, final.
- [x] 3. Combate: integrar hp, fases, boss arena pose, attackRun, setAttackRun, projéteis do herói, dano/fim e loops de ataques no runner-core.mjs. Testar primeiro, falhar, implementar, validar controles cancelados, resize e reação.
- [x] 4. UI: botão Disparar por toque/teclado, classe/graduação/vidas, fases, desenho das naves/corpos/tiros. Atualizar textos de História e testes para 20.
- [ ] 5. Revisão e publicação: suíte disponível, Canvas real, CI desktop/mobile, revisão de código, integração e comparação HTTP dos arquivos publicados.

## Review focus
- Encontro não pode encerrar só desviando; morte limpa tiros.
- Tiro não deve atingir chefe durante entrada nem atravessar hitboxes em dt máximo.
- Tecla/botão mantido e cancelamento não prendem disparo depois de foco ou reinício.
- Resize deve preservar tiro e chefe em espaço lógico; preparo permite reação nas bordas.
- Quarto chefe do cenário deve continuar no mesmo ambiente; urna somente após encontro 20.
