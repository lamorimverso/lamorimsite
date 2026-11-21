# Combate de ação nos chefões

O pedido foi adaptar a jogabilidade de Mega Man aos duelos de Flávio. As referências consultadas foram a [descrição oficial da Capcom](https://news.capcomusa.com/mega_man/blog/2018/02/19/mega-man-legacy-collection-1-2-slide-on-to-nintendo-switch-on-may-22nd/), o [manual disponibilizado pela Sega](https://manuals.sega.com/megadrivemini/pdf/MEGA_MAN.pdf) e as [dicas de Mega Man 11 do representante da Capcom](https://blog.playstation.com/archive/2018/10/02/expert-tips-for-conquering-mega-man-11s-opening-block-man-stage/). Elas fundamentam o conjunto mover, saltar, deslizar e atirar; chefões com sinais e padrões próprios; tiro carregado; fraquezas e poderes adquiridos.

## Adaptação implementada

- O cenário para durante o duelo. Os controles continuam ativos, e os pés acompanham o deslocamento manual. A corrida automática retorna ao vencer.
- A faixa horizontal disponível no menor mundo lógico passa de 128 para 212 pixels. As plataformas inimigas ocupam o corredor direito para preservar a distância de reação.
- Abaixar junto com esquerda ou direita executa um deslize. Segurar os controles não repete o deslize indefinidamente; é preciso soltar e iniciar outra ação.
- A mira prioriza o chefão durante os duelos. Uma interceptação ainda pode ocorrer se o projétil inimigo cruzar fisicamente o tiro. Os tiros fora das arenas continuam buscando ameaças comuns.
- Segurar o botão de disparo mantém os tiros e concentra uma carga automática a cada 1,1 segundo. Essa é uma adaptação ao controle de toque e ao disparo contínuo já existente, em vez de exigir outro botão. O tiro carregado custa duas munições, tem área maior, dano maior e atravessa mais uma ameaça. Soltar interrompe a carga e permite a recarga de munição.
- Desviar da sequência completa conquista uma abertura. O bônus agora vale também para tiros diretos que atingem o corpo durante a abertura, além das devoluções já existentes. Fraquezas de armas e variação de dano por acerto permanecem.
- Os dois primeiros padrões apresentam o chefe. Depois, a ordem de padrões completos varia pela semente da partida. Uma sequência anunciada mantém sua ordem, arma, faixa e tempo; não muda conforme a postura do jogador.

As travessias do Fiscal, Povo e Renato preservam suas regras de corrida e evasão. A mudança não usa código, áudio ou imagens da Capcom. Os personagens, armas e desenhos continuam sendo os do jogo de Flávio.

## Validação

Testes do motor cobrem arena, animação por deslocamento, deslize bilateral, prioridade do alvo, custo e temporização da carga em 30/60/120 Hz, cancelamento, abertura de dano e variação de padrões. A suíte existente verifica a campanha, as esquivas, a continuação, os poderes e a retomada da corrida. Testes em Chrome exercitam teclado e tela móvel, além dos replays de campanha.
