# Corrida, escudo físico e Joice

Complemento ao desenho de viagem de 29/10. Pedido explícito: pernas em movimento, um objeto de escudo em vez da aura do print e Joice aparecendo de surpresa com o meme original.

## Decisões de implementação

Reutilizar as oito poses desenhadas de corrida: o problema confirmado é que a preferência de movimento reduzido congela também a passada. A passada comunica a corrida e continua ativa; poeira, balanço e deslocamentos decorativos continuam reduzidos. Cadência de um quadro por 24 metros, sem afetar física, orientação, salto ou slide.

Desenhar um escudo azul/dourado sólido diante do braço e tronco, com o desenho das Américas já existente. Sem contorno ao redor do corpo, sem campo transparente e sem alterar a opacidade de Flávio. O objeto acompanha altura do salto e postura baixa; proteção mantém seis segundos e colisões atuais.

Joice entra pela direita da pista, sem contagem prévia. Primeiro evento em 18–30 segundos elegíveis e seguintes em 28–48 segundos; valores escolhidos pelo implementador para permitir conhecer os controles. Sua chegada dá 1,2 segundo de aviso antes de oito segundos de ondas da PF, mais frequentes, respeitando o mínimo existente de 1,15 segundo entre ondas. Recuperação de dois segundos. Sem coincidir com chefes ou transições; não é um obstáculo com colisão. Texto curto fora da pista, sem novo painel permanente. Com movimento reduzido, entrada/saída decorativa não se anima.

Recorte original “toc toc” somente de gravação pública verificada, com fonte, contexto e créditos na ajuda existente; não atribuir narração sintética à Joice. Som desligado, derrota e aba oculta interrompem reprodução. Se não houver mídia utilizável, registrar a limitação concreta em vez de fabricar voz.

Pedido adicional durante a execução: Joice deve produzir efeito real, dificuldade crescer perceptivelmente e cenário passar. Intensificar a curva contínua de frequência/reação usando distância/(distância+10.000), mantendo os limites atuais de velocidade e intervalo. A cada 7 km a velocidade aumenta, o intervalo cai e o tempo de aproximação diminui; sem salto abrupto nos marcos. Verificar a integração real do fundo móvel já implementado na viagem, além dos testes de geometria. Não anunciar o código local como publicado.

## Abordagens consideradas

Conservar a aura foi descartado pelo pedido explícito. Uma nova ilustração do herói poderia mudar identidade e não resolveria o congelamento pelo ajuste de movimento. Reutilizar poses e o objeto vetorial permite corrigir a causa, preservar a arte e verificar o movimento real. Uma aparição sem qualquer tempo de reação foi descartada: a surpresa é a chegada da personagem, com janela curta para responder ao perigo.

## Limites preservados

Direção final do usuário durante a execução: retirar botões Pular/Abaixar e barra de progresso abaixo da pista. Controles móveis na pista: toque para pular, deslize para cima para pular, deslize para baixo e segure para abaixar; solte para levantar (ou deslize novamente no modo alternar). Outro dedo pode pular enquanto o primeiro abaixa; teclado preservado. Mostrar instrução curta só antes da partida/ajuda. Remover os elementos, não deixar botões escondidos que recebam foco.

Modelo Endless Runner: os cinco ambientes formam uma única paisagem contínua. Rota e cenário avançam também em encontros; esta instrução final substitui a antiga pausa da rota durante chefões/Joice. Metros totais e rota passam a avançar juntos; chefes mantêm ordem/marcos e intervalos de segurança. Sem trocar a tela abruptamente.

Prints adicionais inspecionados: remover o parágrafo inferior sobre foro/STF e seu link. No botão de tamanho, manter duas apresentações da mesma partida, expandida/recolhida, com rótulos visíveis “Expandir”/“Recolher” e ícones correspondentes. Alternar não reinicia nem pausa a corrida; Escape recolhe. Preservar alinhamento e comandos em telas pequenas.

Jogo/site existentes em GitHub Pages; sem migração, pausa manual, armas do protagonista ou playlist. Cinco cenários de 7 km, chefes Haddad/Lula/Xandão aos 22/29/36 km, 100 passaportes por vida e toque simultâneo permanecem. A revisão e publicação pendentes da viagem fazem parte da entrega conjunta.
