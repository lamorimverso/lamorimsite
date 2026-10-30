# Corre, Flávio! — Direção de game design: Raid, elencos e combate de evasão

**Data:** 30/10/2026. **Base de inspeção:** `651c95d0f47e7bfa944b2b1d2f2347d6070d298d`. **Status:** especificação e catálogo; não pressupõe que as adições estejam implementadas.

## Escopo e regras de preservação

- Alterar somente `tanahoraflavio/`, testes associados e documentação; preservar outros sites, bots e n8n.
- Corrida lateral automática e contínua; Flávio escapa, sem ataque direto. Distância continua crescendo mesmo quando o personagem recua visualmente na pista.
- Preservar salto, abaixar, escudo de 6 s, passaportes (100 = 1 vida), Zé Gotinha, cenário em 7 km, recorde em metros, 120 Hz e assistência.
- Uma caricatura ou uma fala contextual não implica endosso, participação de pessoa real ou imputação de crime. Todo o jogo continua satírico e fictício.
- Não usar gravações sintetizadas na voz de pessoas reais fingindo serem documentos; usar trechos originais verificáveis e com permissões adequadas, ou substituir por texto / efeitos não-imitativos.

## Diagnóstico do código atual

1. `runner-audio.mjs`: na fase `warning` chama um trecho de Joice de aproximadamente 5,224 s; o `raid` permanece 10 s ativos depois do aviso de 1,2 s. O trecho é executado uma vez e não ocupa toda a perseguição. A música sintética continua, mas a voz de Joice não. Proposta de bugfix localizada: reprodução em loop **somente enquanto o raid está ativo**, parada imediata em `recovery`, derrota, mute, perda de foco ou cancelamento. Evitar empilhar instâncias.
2. `runner-core.mjs`: o herói usa referência horizontal fixa (PLAYER.x=120). A entrada lateral não existe. Adicionar deslocamento de eixo X exige revisar detecção de contato, cálculo de reação, gerador, posicionamento de itens, resize e UI. Não colocar gesto lateral isolado antes de adaptar os sistemas.
3. A `PURSUERS` registra Boulos e Flávio Dino, porém os POOLS verificados não os escolhem na corrida comum. O catálogo não equivale a personagem efetivamente encontrado.
4. Os chefes atuais do motor são Haddad, Lula e Xandão; Janones é perseguidor comum e PF é um grupo/instituição no jogo. Não descrevê-los como chefões já implementados.
5. Há repertório limitado de gravações verificadas, não há áudio individual original para todos os atores propostos. Não fingir que existe.

## Todos os personagens identificados no código de corrida

| Classe atual | Personagens e elementos | Observação |
|---|---|---|
| Jogável | Flávio | Automático; salto e agachamento |
| Chefões ativos | Haddad, Lula, Xandão (caricatura de Alexandre de Moraes) | 9, 10 e 12 ataques-base |
| Perseguidores de percurso | PF, Janones, Exército | Encontrados nos POOLS |
| Figuras como perigos altos | Dilma Rousseff, Simone Tebet, Soraya Thronicke | Vento, papéis, microfones |
| Evento especial | Joice Hasselmann | Perseguição com PF baixa e microfones altos |
| Aliado e vantagens | Zé Gotinha, escudo das Américas, passaportes | Mascote/itens, não políticos |
| Elementos cênicos / obstáculos | Barreiras, malas e balde Popcorn | Não são políticos |
| Registrados mas não selecionados nos POOLS verificados | Guilherme Boulos, Flávio Dino | Exige integração real antes de anunciar presença |

## Expansão proposta de elenco e função única

**Protagonista:** Flávio continua como corredor, sem dano ofensivo.

**Chefões / ameaças narrativas (propostas, não publicadas):**
- André Janones: `URGENTE`, ondas em duas alturas, com avisos que mudam de direção; objetivo: sobreviver a três blocos de mensagens, sem silenciar alerta crítico. Arquivo do bordão 'Pessoal, urgente' já consta do jogo, sujeito a direitos.
- Lula: manter gestos em L; fase nova introduz duplas com inversão anunciada, sem alterar falas de arquivo.
- Polícia Federal: representar **equipe fictícia de perseguição**, não uma pessoa; objetivo de evasão de barreiras baixas, cones altos e vãos visíveis; áudio institucional somente se houver fonte pública autorizada, caso contrário SFX original.
- Xandão (Alexandre de Moraes): martelo baixo / mandado alto, depois ondas de três com abertura verificável; meta de ataques desviados, não HP.
- Haddad: preservar papel atual; diferenciar rajadas, lançamento alto e duração.
- Joice: evento de pressão próprio, **não** substituir chefes.

**Aliados e participações satíricas (propostas):**
- Jair Bolsonaro: grito de incentivo / bônus visual temporário de indicação de rota; não combate, não dano.
- Michelle Bolsonaro: bônus temporário de visibilidade do próximo perigo por poucos segundos.
- Eduardo Bolsonaro: bônus único de antecipação de um evento (sem blindar contra colisão).
- Carlos Bolsonaro: reorganiza momentaneamente a indicação de obstáculos; sem apagar perigos.
- Renan Bolsonaro: interação rara de coleta, sem acrescentar botão.
- Silas Malafaia: comentário contextual e escudo-sonoro **apenas cosmético**; não confundir fala com proteção real.
- Magno Malta: bônus de previsão do próximo ataque, semelhante a indicação de direção.
- Nikolas Ferreira: reduz por um trecho as distrações no HUD; identidade audiovisual própria.
- Tarcísio de Freitas: marcador visual de rota e próximo cenário; não modifica distância.
- Damares Alves: evento visual/voz contextual; sem poder de dano.
- Bia Kicis: marcador temporário de objetivo alternativo.
- Donald Trump: aparição na etapa Flórida/Casa Branca com um único benefício ocasional de telegráfico ampliado, nunca invulnerabilidade permanente.
- Javier Milei: cameo na Argentina com **motosserra-símbolo satírica** que remove um obstáculo comum à frente, sem atingir pessoas. A motosserra como símbolo político é documentalmente verificável.
- 'Bolsominions': figurantes genéricos estilizados; **não** lhes atribuir falas reais nem tratá-los como uma organização específica.
- 'Família Bolsonaro': usar pessoas nominadas acima; não criar figura indistinta com falas atribuídas a toda a família.

**Elenco secundário opcional (estudo antes de inclusão):** Geraldo Alckmin, Gleisi Hoffmann, Marina Silva, Hugo Motta, Arthur Lira, Rodrigo Pacheco, Ciro Gomes, Flávio Dino e Guilherme Boulos. Não introduzir todos ao mesmo tempo nem atribuir ataques/opiniões sem decisão narrativa.

A classificação entre amigo e antagonista é uma **convenção de gameplay**, não descrição definitiva de alianças políticas reais. Ela pode mudar por episódio. O ator tem papel mecânico próprio, independentemente de sua posição ideológica.

## Raid JOICE / Toc Toc Tox — requisitos

- Manter tempo base documentado: 1,2 s aviso + 10 s ativo + 2 s recuperação. Trilha/ambiente presente durante todas as fases e voz de arquivo tocando por todo o **período ativo**, repetida somente se necessário e apenas enquanto a raid estiver viva, respeitando mute/foco. Em nenhuma hipótese repetir áudio depois da derrota.
- '10x mais difícil' = alvo de **intensidade perceptiva**, não `velocidade * 10` nem `spawnRate * 10`. Medir aumento em ações necessárias, complexidade de leitura e decisões; limites atuais de reação não podem ser multiplicados cegamente por dez.
- Durante a raid: perseguição e perigos que **caem do alto**, sombreamento progressivo vermelho/vinho, ataque baixo/alto, sinal visual da posição do impacto, sons de aproximação e controle adicional para esquivar lateralmente.
- Movimento no eixo X (frente/atrás): permitir posicionamento limitado dentro da largura da arena enquanto mundo continua andando; teclas A/D ou ←/→ e deslize lateral **somente depois** de redesenhar colisões, câmera, spawning, HUD, resize e previsibilidade no toque. Compatibilizar com swipe vertical de pular/abaixar e com multitoque.
- Mecânica de queda: tipo `falling`, telegráfico de sombra no chão, x-alvo comprometido antes de cair, tempo de reação calibrado; colisão pelo eixo X e Y; nunca aparecer diretamente na hitbox sem aviso. Implementar teste de alcançabilidade para pelo menos duas rotas de fuga por onda quando permitido.
- Sem interferência de legibilidade por filtros, sem lampejos, efeito reduzido disponível. Joice não invade confronto de chefe.
- Respeitar feedback de áudio com prioridade `alerta de ataque > voz temática > música`.

## Padrões de chefes distintos

| Personagem | Encontro exclusivo | Sinal de ameaça | Objetivo |
|---|---|---|---|
| Janones (novo) | Chamadas 'urgente', papel/mensagem altos e baixos | Bolha com direção e som curto | Sobreviver a 3 ondas sem perder o tempo de reação |
| Lula (existente, ampliar) | Mão em L e duplas alternadas | Gesto e altura visível | Superar a sequência com ação correta |
| PF (novo como equipe) | Bloqueios escalonados e perigo descendente | Sirene/indicador no solo | Escapar da blitz até encerrar o temporizador |
| Xandão (existente, ampliar) | Martelo + mandado, sequência final mista | Posição da arma e silhueta | Desviar de N ataques; não atacar |
| Haddad (existente) | Papéis com ritmo de lançamento próprio | Folhas altas/baixas distintas | Desviar da rajada até a fuga |

## Falas de arquivo

- O repositório já possui 9 memes curtos e arquivos identificados de Joice/Haddad. Não usar o mesmo recorte para representar outra pessoa.
- Para cada personagem, antes de integrar: localizar gravação original, data, orador, transcrição revisada, contexto, titular de direitos, termos de uso e permissão de recorte; registrar no catálogo com URL e hash.
- Evitar frases falsas geradas por IA na voz de políticos. Se falta áudio verificável, usar legenda explicitamente ficcional e efeito sonoro original, sem locução imitativa.
- Limitar aleatoriedade a `speakerIds` efetivamente autorizados, com cooldown, sem falas simultâneas, e sem interromper o sinal crítico.
- Fontes de partida: `tanahoraflavio/assets/audio/README.md`; STF (discursos oficiais de Moraes); Congresso em Foco (Janones 'Pessoal, urgente'); arquivo da Câmara (Joice); Reuters/CNN (motosserra de Milei). Link de notícia não implica direito de reutilizar áudio.

## Etapas de implementação seguras

1. **Bug localizado e regressão:** loop restrito do recorte Joice, parar corretamente; verificar audioStart/active/recovery/mute/foco/game-over, volume e reentrância. Não alterar outros sistemas.
2. **Movimento lateral:** introduzir `player.x` opcional mantendo o valor padrão, adaptar hitboxes e tempo de contato, testes de giro, entrada multi-toque, travas da arena e compatibilidade; só então habilitar o gesto horizontal.
3. **Quedas do alto:** sistema `falling` e aviso posicional com testes de colisão e resolução.
4. **Padrões e pressão raid:** fases e pressão, telegráficos, combinação de ameaças, coleta em segurança e recuperação, instrumentando métricas de perigo.
5. **Novos chefes:** Janones e PF como encontros com metas e padrões próprios; não alterar os três chefes atuais regressivamente.
6. **Aliados:** implementar no máximo 2–3 por lote, com cooldown, sem tornar a corrida trivial e sem esconder perigos.
7. **Áudio de arquivo:** pesquisa e licenças individualizadas, catálogo, assets autorizados e prioridade sonora.
8. **Playtest e release:** 6–8 pessoas, dispositivos físicos, Safari, 30/60 FPS, partida longa, reprodução, proteção e CI. Não publicar alterações não verificadas.

## Critérios de aceite mínimos

- Joice toca continuamente apenas durante a raid (ou faz fallback musical claro), cessa em mute/derrota/perda de foco/recovery. Sem duas fontes concorrentes.
- '10x' não introduz colisão garantida: todas as ondas passam por um verificador de trajetória legal e players de teste com comandos reais.
- Entradas esquerda/direita, salto e abaixar coexistem sem perda de comandos. HUD não encobre a pista.
- Cada chefe mostra objetivo, avisos e uma prova funcional de vitória por evasão.
- Todo cameo tem função ou justifica aparição narrativa breve; não há NPC sem propósito.
- Toda voz possui metadados rastreáveis ou é excluída.
- Nada modifica bots, n8n, outros sites, dados existentes ou o repositório fora dos arquivos deste jogo.

## Referências consultadas

- Jogo e áudio existentes: `tanahoraflavio/README.md` e `tanahoraflavio/assets/audio/README.md` no commit-base.
- `https://www.gamedeveloper.com/game-platforms/designing-for-difficulty-readability-in-arpgs` — legibilidade de chefes e telegráficos.
- `https://www.congressoemfoco.com.br/noticia/123195/pessoal-urgente--audios-de-janones-no-exercito-do-lula-viram-meme` — atribuição e contexto de fala do Janones.
- `https://portal.stf.jus.br/textos/verTexto.asp?pagina=AlexandreMoraesDiscursos&servico=bibliotecaConsultaProdutoBibliotecaPastaMinistro` — discursos primários.
- `https://www.cnnbrasil.com.br/internacional/javier-milei-o-candidato-motosserra-desafia-a-esquerda-e-a-direita-da-argentina/` — origem do símbolo.
- `https://www.leagueoflegends.com/en-us/news/dev/clarity-in-league/` — prioridade de sinais.
