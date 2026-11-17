# Corre, Flávio! — aceite do super-prompt

Esta revisão reúne a jogabilidade do #59, o acabamento do #60 e a checagem final. A base anterior à eventual integração pública é `ede05c5e765770dfdff6e10d08f2937adfacf712`.

**Correção pela captura do usuário.** O teto retangular cinza com faixa listrada e a seta junto dele foram retirados da partida nos dois modos. A geração não cria o obstáculo nem sua colisão. O Canvas também não pinta mais aquele teto. Agachamento e deslize continuam disponíveis no chão e sobre os apoios.

**Deslize com ↓ + →.** Antes, a velocidade mudava, mas o Canvas inclinava a mesma pose de agachamento. Agora o corpo tem animação própria com a perna da frente estendida e as solas na altura do apoio, inclusive ao disparar. Soltar frente volta ao agachamento; soltar baixo volta à corrida. O desenho não altera a física nem os atalhos configurados. [Comparação desenhada pelo Canvas do jogo](flavio-posturas-2026-11-17.webp).

**Travessia entre destinos.** Os dois primeiros cenários continuam terrestres. O terceiro ensina a barra em solo firme (São Paulo na História, Argentina no Infinito). A partir da sua saída, o jogo embarca na troca de estado, distrito ou país, não no meio de uma fase. O retorno da Casa Branca a Brasília também é um voo. A História não reinicia a rota no final e o Infinito continua as saídas geográficas nas voltas seguintes. Cada viagem tem rampa, plataformas sobre vazio e avisos de aproximação visual e sonoro para aviões armados. O avião de passagem não ataca. Passaportes comuns ficam em dois apoios seguros, sem novas curas ou escudos. Ao desembarcar, o jogador continua com a forma que tinha, sem precisar disparar ou usar salto duplo.

| Requisito | Verificação e referência |
| --- | --- |
| Dano, forma, postura, Rachadinha, continuação e jacaré | `runner-damage`, `jacare-recovery`, `jacare-volley`, `boss-quality` e o teste de antecipação na suíte legada. Um projétil sem lançamento não dá dano, o primeiro acerto machuca e outro acerto válido encerra a tentativa. |
| Mundo, barras, avisos, pouso e viagem | `terrain-world-clock`, `terrain-traversal`, `air-transfer` e o replay no navegador. A simulação permite chegar machucado, com salto simples, sem disparo obrigatório e sem cura na chegada. |
| Progresso, dificuldade, leitura e composição | [Mapa por fase, biblioteca de padrões e fichas dos chefes](ritmo-campanha-2026-11-17.md), [parâmetros e comparação da jogabilidade](atualizacao-prompt-2026-11-17.md) e o teste longo abaixo. |
| Elenco, reflexão, controle e áudio | [Comparação de animações, sons e aberturas](elenco-audio-chefes-2026-11-17.md). As regressões mantêm a diferença entre tiro direto e reflexão e testam a etapa do Povo em tela móvel. |

## Corrida longa no Infinito

Use `node tools/check-endless-release.mjs` para repetir o ensaio. Cada corrida começou do zero e durou 35 minutos de tempo ativo simulado, com os comandos públicos do piloto e só escudos coletados na partida. Em cada configuração, rodar o relógio real do jogo com marcas de 30, 60 ou 120 quadros simulados produziu o mesmo estado final e os mesmos contadores nas janelas amostradas. As distintas larguras receberam sementes diferentes para diversificar a amostra, não para atribuir diferenças à largura.

| Largura lógica e semente | Ainda em jogo aos 35 min | Chefes concluídos | Voltas completas | Pousos concluídos | Decisões perto do teto |
| --- | --- | ---: | ---: | ---: | ---: |
| 480 / 17 | 3 de 3 cadências | 38 | 6 | 39 | 6 formas de ameaça terrestre observadas |
| 900 / 417 | 3 de 3 cadências | 38 | 6 | 39 | 5 formas de ameaça terrestre observadas |

A velocidade final do mundo foi 534,751 unidades lógicas/s nas seis corridas, próxima do teto de 535. As formas observadas foram frente, retaguarda, queda, marca, rolante e emissão alta. Todas as seis completaram o treino e pousaram em cada uma das 39 saídas após os dois primeiros cenários. O comando também registra as três janelas de 30 s, sem juntar terreno, pista comum e duelo na mesma contagem. Na História, as 20 corridas de `node tools/check-story-campaign.mjs` concluíram os cinco voos na ordem da rota, com 100 pousos ao todo.

A amostragem local dos passos do núcleo em Node teve P95 de 0,0032–0,0080 ms e P99 de 0,0051–0,0253 ms, nas condições do ensaio. O relatório também registra o heap do processo inteiro a cada cinco minutos. Isso **não** mede pintura, som, compositor, memória do navegador, latência física do controle ou FPS de um celular. A comparação no Chrome desktop e celular usa os replays guardados pela suíte, sem afirmar FPS físico. O playtest com participantes continua pendente.

## Ponto de retorno e publicação

Antes de integrar, preserve a revisão pública indicada acima. Se a atualização vier a ser publicada e houver regressão confirmada, reverta o merge correspondente sem reescrever a `main`. A publicação é separada da preparação e da validação desta revisão.
