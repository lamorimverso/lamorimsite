# Corre, Flávio! — pacote do dossiê

Base: ec75721c7620342554da16f3535204f1a8181e0d. Autorização: pedido de implementar o dossiê, reiterado em 06/11/2026. O documento original recuperado é [design-raid-elenco-politico-2026-10-30.md](../../design-raid-elenco-politico-2026-10-30.md); buscas também recuperaram os pedidos posteriores de imprevisibilidade, áudio sem narração artificial, jacaré e apresentação limpa. A transcrição integral da conversa não foi disponibilizada; não se apresenta este documento como transcrição.

## Direção e limites

Continuar com JavaScript/Canvas/WebAudio, sem migração de motor. A reconstrução em outro motor custaria compatibilidade e descartaria física e regressões úteis; apenas polir a aparência deixaria as funções do dossiê incompletas. A opção adotada é uma expansão modular da base existente. “AAA” é referência de acabamento, legibilidade, controle e validação, não certificação ou promessa de equivalência comercial.

Somente o jogo, ferramentas de arte, testes associados e documentação. Preservar os outros sites/bots/n8n. Corrida automática, sem ataque do herói nem pausa manual; metros reais de jogo, 7.000 m por destino, cinco destinos, primeiro chefe em 22 km, pelo menos 7 km após cada vitória, passaportes100=vida, escudo6s, física610/1750, buffer120ms e assistência. Preservar a trilha instrumental8bits publicada e todos os controles existentes.

## Jogabilidade

- Acrescentar `player.x` e `moveRun(run, direction)` no corredor70–280, velocidade230 unidades/s. A/D e ←/→; deslize lateral mantido até soltar, multitoque com salto/abaixar. Limpar todas as intenções em blur/cancelamento. Posição horizontal é independente da quilometragem.
- Colisões, coletas, avisos, lançamentos, retaguarda e resize usam a posição real. Um perigo já ultrapassado não volta a causar dano ao recuar. Manter os prazos dos perigos no resize.
- Quedas verticais com alvo comprometido, aviso mínimo1,2s, descida0,4s, duas posições de fuga no corredor e desenho correspondente à colisão. Introduzir durante Joice e blitz da PF, sem sobrepor outra ameaça a uma janela fisicamente incompatível. Manter os ataques diagonais/retaguarda/rolantes já existentes.
- Chefes: Haddad→Lula→Xandão→Janones→PF. Os três existentes conservam suas armas e improvisação. Janones tem nove mensagens em três blocos; PF tem oito bloqueios, incluindo quedas. Contador mede evasões concluídas, sem HP ofensivo; aviso usa o ataque efetivamente planejado.
- Jacaré: forma baixa com quatro desenhos de passada, sem salto; primeiro↑/toque restaura, segundo salta. Preservar respiro2,5s, graça de entrada/retorno e escudo independente. O texto de comédia deixa claro o antídoto imaginário; contexto de saúde recolhido na ajuda, sem instrução de uso.

## Elenco e propósitos

Taxaad mantém recibos/carimbos; Janones chama Exército do Lula; Simone usa adesivo cenográfico, não fala atribuída; Soraya tem referência visual de quermesse. Dilma, Boulos e Dino devem ser efetivamente encontráveis com suas identidades existentes. Elenco secundário marcado como opcional no dossiê não vira promessa de inclusão.

Aliados aparecem espaçados, um efeito por vez, sem arma do protagonista nem invulnerabilidade acumulável. Vorcaro atrai somente passaportes próximos por3s, cooldown24s. Jair indica rota; Michelle destaca perigo; Eduardo antecipa evento; Carlos organiza previsão de ameaças; Renan orienta coleta; Silas fornece incentivo visual/sonoro sem proteção; Magno prevê ataque; Nikolas reduz decoração; Tarcísio mostra destino; Damares destaca o aviso de queda; Bia oferece objetivo opcional de coleta; Trump amplia telegráfico na Flórida/Casa Branca; Milei remove um obstáculo cenográfico na Argentina; figurante genérico destaca coleta. Todos têm identidade visual própria e descrição breve; nenhuma aparição é prova de relação política real.

## Apresentação, som e desempenho

Quatro atlas novos transparentes, quatro poses por linha, recortes/pivôs explícitos e WebP lossless; originais preservados. Não reutilizar o desenho da PF como rosto de outro personagem. Jacaré conserva sua largura visível na física. Cenários com planos contínuos, marcos, fronteiras suaves e detalhes discretos fora da zona de perigo; efeito reduzido conserva os sinais essenciais.

Remover retrato extra da Joice abaixo da pista; estado de carregamento no botão e leitura assistiva; erros com recuperação clara. Manter controles discretos, ajuda recolhida, contagem grande/compacta, expansão e derrota algemada. Falas identificadas podem ter legenda discreta dentro da pista.

Áudio: alerta crítico acima de voz temática acima de música; uma fala por vez, cooldown e atribuição correta. Joice faz loop somente na perseguição e para/retoma com foco/mute/derrota. Retirar a atenuação atual dos alertas quando uma voz toca. Não inventar nem sintetizar falas de pessoas reais: personagens sem clipe verificado recebem efeitos próprios e legenda; ausência de gravação fica documentada.

## Verificação e publicação

Testes de comandos, coletas, transformação, retorno após foco, resize, limites, queda e vitória para todos os chefes. Piloto de comandos legais em múltiplas larguras/sementes, sem imunidade/teleporte. Arte: transparência/recortes/pivôs e passagem de pernas distintas; carregar/repetir em falha. Chromium/CI para teclado/toque, som e layouts320–1440. Inspeção visual do jogo publicado e hashes dos arquivos. Publicar apenas após regressões resolvidas; rollback pelo commit-base. Playtest humano6–8pessoas, Safari/aparelhos físicos e comparação auditiva humana não podem ser declarados realizados sem evidência.

Referências primárias verificadas nesta retomada: [Riot, legibilidade e hierarquia](https://www.leagueoflegends.com/en-us/news/dev/clarity-in-league/), [Maddy Thorson, tolerância dos comandos](https://www.maddymakesgames.com/articles/celeste_and_forgiveness/index.html), [OMS, hidroxicloroquina](https://www.who.int/news-room/questions-and-answers/item/coronavirus-disease-(covid-19)-hydroxychloroquine). As constantes são decisões locais, não valores prescritos por esses textos.
