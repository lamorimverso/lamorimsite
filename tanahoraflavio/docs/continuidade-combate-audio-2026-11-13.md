# Continuação: animação, IA, variedade e áudio

Base: `76c496c85e71a82a6a180c35c7fb663527fadc4e`. Pedidos: deixar de usar armas percebidas como uma imagem rígida, variar decisões/mira dos chefes, equilibrar áudio do elenco e reduzir repetição dos confrontos.

## Alterações

- Partes internas de 15 famílias de armas se articulam: algemas/corrente, dobra e movimento das folhas, envelope, dedo/polegar, líquido/tampa dos frascos, martelo/cabo, paraquedas, microfone/cabo, carimbo e malas. Efeitos reduzidos mantêm apresentação estável.
- A IA escolhe quando começa a preparação. Depois da abertura didática, considera postura, posição lateral, movimento e permanência no lugar, com escolhas reproduzíveis e limite de repetição entre rajadas. Cada rajada conserva a ação anunciada. A mira física é comprometida no lançamento; nenhum projétil passa a perseguir o jogador em voo.
- Quedas localizadas mantêm alvo anunciado, arma e silhueta correspondentes. Curvas variam sem mudar a faixa esquivável no contato.
- Sentinela, Artilheiro, Conjurador e Soberano possuem trajetórias e silhuetas de gestos diferentes. Cadência se intensifica por etapa e fase 2; efeitos reduzidos estabilizam a nave.
- Recuperação vale ×2. Aberturas por classe valem ×3: início da recuperação do Artilheiro/Soberano e fim da preparação do Conjurador. O bônus fica no tiro quando ele é disparado, para o tempo de viagem não invalidar o que foi anunciado na tela. O jogador continua podendo segurar o disparo.
- Doze recortes novos, dois para cada um de seis chefes, com fonte, data, contexto, seleção de locutor, hashes e legendas. Volume normalizado e escolha sem repetição adjacente.
- Três efeitos não verbais por personagem/formato (32), volume baixo, intervalo global e prioridade dos alertas. Aliados passam pelo seu evento individual, sem disparar uma fala de outro personagem.

## Cobertura e limites

Fala/meme de arquivo em 10/13 tipos de chefão. PF, Bossonari e Fantasma possuem efeitos próprios, sem fala atribuída. Aliados, herói e jacaré têm efeitos, mas continuam sem fala própria. **Efeitos para todo o elenco não equivalem a vozes para todo o elenco.** Há transcrição automática conferida no original e nos recortes, mas nenhuma alegação de audição humana nesta sessão.

Preservados: 20 confrontos, quatro por cenário; primeiro chefe após 22 km; História/Infinito; jacaré por dez segundos; controles configuráveis; urna final. Testes automáticos e campanhas legais não substituem avaliação de diversão com jogadores e aparelhos físicos.

## Evidências

Testes novos reproduziram geometria rígida, falta de adaptação, repetição de silhuetas, ausência de arquivos/seleção de voz, reprodução do meme errado em coleta de aliado, bônus impossível por tempo de voo e queda desenhada com outra arma. Cada falha foi vista antes da correção e passou depois. Testes de navegador decodificam os 12 arquivos e medem sinal/pico. A validação final e o commit publicado estão no PR desta alteração.

Referências que já fundamentam o projeto: [Mike Stout, Enemy Attacks and Telegraphing](https://www.gamedeveloper.com/design/enemy-attacks-and-telegraphing), [Godot, Creating the Enemy](https://docs.godotengine.org/en/stable/getting_started/first_2d_game/04.creating_the_enemy.html), [Microsoft XAG 103](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/103). A aplicação aqui é anunciar antes do dano, manter a leitura visual sem áudio e validar decisões em combate real.

Validação final local: **480/480 testes aprovados**, **20/20 campanhas completas** pelo piloto legal. Capturas no navegador em390/1440px para as quatro classes e o Fantasma final, sem erros de página. Os12 recortes decodificam e apresentam sinal; maior pico medido0,653 (escala0–1). Revisão independente concluída; correções de bônus e arma em queda verificadas por novos testes.
