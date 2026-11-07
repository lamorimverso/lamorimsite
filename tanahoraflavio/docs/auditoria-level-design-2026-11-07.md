# Auditoria de level design — 07/11/2026

## Problema e correção

Antes: a chuva de ampolas era formada por duas ou três quedas com posições fixadas a 160 unidades umas das outras e temporizadores idênticos. Isso produzia perigos pareados e repetitivos.

Agora: sorteio de pontos por toda a largura visível, separação mínima de 150 unidades, pequena variação da mira inicial e momentos de impacto independentes, mas com sinais antecipados. Os alvos não acompanham o jogador após o aviso. Preservados dez segundos de jacaré, comandos, física, escudos, chefões e demais perigos.

## Prioridades de design propostas, sem implementação nesta mudança

1. **Alta: leitura dos sinais no celular.** Avaliar contraste, tamanho das marcas no chão e informação visual temporal em sessões com pessoas reais.
2. **Alta: tutorial contextual sem interromper a corrida.** Ensinar deslize lateral na primeira chuva, salto nos obstáculos baixos e abaixar diante dos altos.
3. **Alta: balanceamento por dados.** Instrumentar métricas anônimas de motivo da derrota, tempo de reação e ações usadas antes de cogitar dificuldade adaptativa.
4. **Média: gramática de padrões.** Variar combinações de ataques frontais, altos, da retaguarda e quedas usando restrições de rota, em vez de sorteio sem limites.
5. **Média: feedback e acessibilidade.** Sons opcionais por categoria, modos de movimento reduzido e validação de colisões coerentes com os desenhos.

## Base bibliográfica / técnica

- Compton & Mateas (2006), *Procedural Level Design for Platform Games*: https://ojs.aaai.org/index.php/AIIDE/article/view/18755
- Smith, Whitehead & Mateas (2010), *Tanagra*: https://ojs.aaai.org/index.php/AIIDE/article/view/12379
- Fisher & Kulshreshth (2024), *Exploring Dynamic Difficulty Adjustment Methods*: https://www.mdpi.com/2813-2084/3/2/12
- *Enemy Attacks and Telegraphing*, Game Developer: https://www.gamedeveloper.com/design/enemy-attacks-and-telegraphing
- Discussão de desenvolvedores de geração procedural: https://www.reddit.com/r/gamedev/comments/1djk5hi

Simulações determinísticas ajudam a verificar segurança técnica, mas não demonstram diversão ou dificuldade ideal sem playtesting humano.
