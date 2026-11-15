# HUD vertical dentro da pista

O usuário pediu remover o seletor e a faixa de ajudantes abaixo do jogo e representar essas informações nos cantos superiores da pista, como nas barras indicadas no print de Mega Man.

Usar sobreposição DOM dentro de `.game-viewport`: duas barras segmentadas à esquerda para vida real e munição real do poder, ícone do poder com seletor acessível e escudo com seis marcas, vida real do chefe à direita. Manter Q, E, seletor por toque, acessibilidade e progressão. Nome, nível e descrição do poder ficam no controle/tooltip acessível; recompensa aparece brevemente dentro da pista. A solicitação adicional de munição e reservas acumuladas abaixo substitui essa restrição inicial.

Escolha de implementação: reutilizar os elementos acessíveis existentes como controles sobrepostos. Desenhar todos os controles apenas no Canvas perderia semântica/foco; manter as faixas externas contrariaria a referência. Retratos e ícones reutilizam a arte do jogo. Painéis pequenos nos cantos, sem deslocar a pista ao entrar um chefe, sem cobrir herói ou botão de disparo em 320/390/1440 e 844×390 ampliado.

## Pedido adicional: munição escassa e reservas acumuláveis

O usuário pediu poucos tiros na corrida, um limite nos chefes com recarga somente durante a luta e quando parar de atirar, ajudantes que fornecem munição e escudos, retirada da proteção gratuita e seis partes para formar escudos acumuláveis. Também pediu UX que deixe o personagem e a pista livres.

Parâmetros escolhidos: 6 disparos na corrida, 12 de capacidade no chefe, 1 segundo sem atirar antes da recarga, 1 munição a cada 0,45 segundo. Não há recarga por tempo fora de combate, por troca de poder nem reabastecimento instantâneo ao entrar no chefe. Uma rajada usa uma munição. Cada ajudante fornece 3 munições até a capacidade e 1 parte de escudo. Os colecionáveis antigos de escudo agora são partes, sem proteção imediata. Cada 6 partes soma 1 reserva, preservando o resto; reservas acumulam. E/botão usa 1 reserva para 6 segundos, sem consumir outra enquanto protegendo.

UX: mostrar VIDA/TIROS no canto esquerdo e vida do chefe à direita; escudo em terceira coluna superior, sem faixa abaixo dos medidores nem sobre o corpo ao mover até a borda esquerda. Contador de tiros e de reservas e seis marcas para o próximo escudo. O ícone do poder conserva seletor nativo e Q; descrições e níveis continuam acessíveis. Ao esvaziar no chefe, o botão informa para soltar e recarregar. Não substituir a pista por painel de gestão.
