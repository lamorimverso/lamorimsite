# Retrato e equilíbrio — plano de implementação

> Execução nesta sessão, com regressões antes das correções e revisão final.

**Goal:** destacar o retrato e tornar os itens compatíveis com os saltos.
**Architecture:** HTML/CSS estáticos e motor JavaScript existente, sem dependências novas.
**Tech Stack:** HTML, CSS, ES modules, node:test, Playwright no CI.
**Spec:** docs/superpowers/specs/2026-10-27-portrait-balance-design.md

## Restrições

- Preservar hospedagem, controles, dados locais, contagem, música e compartilhamento.
- Uma vida inicial; +1 a cada 100 passaportes; oito chefes em ciclos infinitos.
- Preservar IDs e a mesma coluna no celular e desktop.

## Foco da revisão

- Poderes duplicados, coleta no quadro da colisão, pausa e reinício.
- Grupos alcançáveis por um salto sem itens sobrepostos.
- Largura de 320 px, ampliação de texto e movimento reduzido.
- Nenhuma referência antiga de cache para os módulos modificados.
- Publicação precisa corresponder ao commit testado, sem sobrescrever mudanças alheias.

## Tarefas

- [ ] 1. Adicionar regressões para um grupo por obstáculo, alinhamento e frequência limitada dos poderes; executar e confirmar falhas.
- [ ] 2. Corrigir o agendamento em runner-core.mjs; verificar regressões, piloto determinístico e testes existentes.
- [ ] 3. Consolidar minimal.css, colocar retrato antes da contagem, compactar ações e mostrar somente poderes ativos; atualizar testes de hierarquia para o pedido atual.
- [ ] 4. Conferir no navegador, executar suíte completa no CI, revisar o diff, integrar e confirmar GitHub Pages.

Progresso inicial: baseline do motor passou em 33 testes. Fontes atuais recuperadas do commit 0c1873445565453e4077e7f93bbeaf98b89b1acf em clone isolado.
