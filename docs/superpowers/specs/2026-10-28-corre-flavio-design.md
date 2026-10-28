# Corre, Flávio! — atualização aprovada

O usuário aprovou a proposta e pediu implementação e publicação com todas as correções da conversa.

## Comportamento
- Corrida contínua, teclado e toque, uma vida inicial; 100 passaportes dão uma vida. Sem pausa manual; suspender internamente quando a página estiver oculta.
- Cinco destinos em voltas: Brasília, Rio, Argentina, Flórida e Casa Branca. Avanço da rota por distância; a corrida e a pontuação continuam durante os encontros.
- Três chefões: Xandão, Haddad e Lula. Sorteio sem repetição até enfrentar os três; ataques próprios, anunciados e saltáveis. Encontros nos trechos 1, 3 e 5, com ponto de entrada variável.
- Inimigos e intervalos aleatórios, limitados pela dificuldade e pelo tempo necessário para completar um salto. Itens seguem o arco do salto sobre o perigo.
- Coletáveis: passaporte; Escudo das Américas, que dá invisibilidade por 6 segundos; Bíblia, que fortalece os próximos três disparos (dano 3). Ivermectina é o disparo básico automático (dano 1).
- Remover fantasma, Constituição, escudo de uma colisão e coletas de chocolate, recibo e mansão. Não gerar outro escudo durante o efeito, nem Bíblia sem chefe ou enquanto já houver cargas.
- Joice Hasselmann é uma personagem caricatural de eventos. Sortear intervalos de 35–60 s; aviso de 2 s com três batidas e o meme da PF; ondas mais frequentes por 8 s; retorno de 2 s ao ritmo normal. Não sobrepor com chefes ou transições. Legendas funcionam sem áudio; áudio opcional e iniciado por gesto.
- Falas ficcionais com fatos históricos identificados por fonte e data: denúncia do MPRJ em 2020 e anulação de quatro RIFs pelo STF em 2021, sem tratar acusação como condenação ou atribuir fala autêntica a Joice.
- Visual de cartum 2D coerente para protagonista, inimigos, Joice e chefes, com rostos, acessórios e silhuetas próprios; corrida, salto, aterrissagem, ataque e impacto visíveis. Preservar o estilo minimalista do restante do site e os cinco pontos turísticos.

## Abordagem
Evoluir o Canvas e o motor puro existentes, sem novas dependências de produção. Separar desenho de personagens em módulo próprio; não recortar a prancha conceitual como sprites. É mais leve e mantém os desenhos nítidos no celular. A prancha foi referência de aparência, não um atlas de animação pronto.

## Publicação e limites
Atualizar somente o minigame, suas instruções, testes e documentação no repositório existente. Os dois endereços antigos já redirecionam para a página canônica; verificar esses redirecionamentos. Preservar raiz, políticas, contador, música e demais páginas. Publicar atomicamente sobre a revisão remota verificada, sem sobrescrever trabalho concorrente.
