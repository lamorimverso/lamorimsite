> Registro histórico. O roteiro foi atualizado para cinco cenários contínuos no design `2026-10-27-continuous-runner-design.md`.

# Refinamento de UX da contagem e do minigame

Pedido: melhorar mais o web design seguindo UX. A versão atual privilegia o retrato antes do contador no celular, reduz alguns textos a 9–10 px e mantém Recomeçar com mais destaque visual que Pular durante a corrida.

## Direção adotada

Refinar a página estática atual em vez de migrar para framework ou acrescentar seções decorativas. Manter roxo, fundo claro, retrato e humor. Não alterar a física, datas, música, compartilhamento, créditos ou conteúdo jurídico.

- Contador completo visível na primeira tela de 320×568 e 390×844, antes do retrato secundário.
- Tipografia com contraste e espaçamento consistentes; controles com altura mínima de 44 px e rótulos de pelo menos 14 px.
- Durante a partida, Pular é a ação principal e Recomeçar fica abaixo dos controles no celular. Pausa e retomada permanecem explícitas.
- Instruções detalhadas e bônus em uma expansão opcional; dica curta sempre visível.
- Fontes ao lado da contagem no fluxo da página; atalho de teclado para pular a navegação.

## Fases: esclarecimento adicional do usuário

O usuário apontou que as fases pareciam uma só. Manter passagem automática a cada 25 segundos, porém mostrar fase atual, destino e tempo até a próxima etapa. Rio: barreiras e milhas; Argentina: malas e notas; EUA: papéis e passaportes. Cada etapa mantém seu cenário já existente; física do pulo, colisões, pontuação e duração total permanecem iguais.

As decisões de apresentação são escolhas de implementação dentro do pedido de refinamento. Não adicionar dependências, coleta de dados ou mudanças em outras páginas.
