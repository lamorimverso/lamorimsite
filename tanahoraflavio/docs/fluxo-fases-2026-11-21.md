# Corrida, fuga e organização das fases

## Problemas reproduzidos

A auditoria inicial executou 84 campanhas completas combinando sete sementes, duas larguras, três taxas de quadros e os dois ritmos. Todas chegaram à urna, mas o avanço nominal da rota ficava parado por até 19,17 segundos fora das arenas. A quilometragem e o piso continuavam avançando, o que produzia a sensação de correr sem sair do lugar.

As causas eram distintas: perseguições começavam no marco do chefão; a transformação podia chegar ao mesmo marco antes de terminar; e uma travessia ou lição aguardava a última ameaça já no ponto de entrada. Uma perseguição nova também podia disputar a preparação de embarque.

## Correção

`runner-stage-director.mjs` concentra o orçamento de avanço da fase e a descrição do objetivo atual. A quilometragem física conserva a velocidade original. O avanço nominal é distribuído pelo tempo que falta para concluir perseguição, transformação, espera entre chefões ou limpeza da entrada de plataformas, antes do respectivo marco.

As perseguições têm uma saída de 4,5 segundos na campanha. A preparação de plataformas e embarque começa antes do ponto de entrada, impede novas ameaças comuns nesse trecho e aguarda apenas as já anunciadas. Uma perseguição pendente espera essa preparação terminar, sem ser descartada. O Infinito também distribui o avanço enquanto o jacaré reserva o encontro local.

Os oito mapas mantêm seu elenco, suas lições, seus marcos, seus controles e a ordem de encontros obrigatórios. O mínimo de 18 segundos entre confrontos e o combate de chefões no chão permanecem. A transformação continua terminando automaticamente; não há nova tecla de recuperação ou pausa.

## Apresentação

O cabeçalho mostra a etapa real: fuga, perseguição, transformação, preparação, plataformas, travessia ou arena. Uma barra discreta ocupa o espaço do cabeçalho existente. O nome do próximo encontro e a instrução ficam disponíveis também em texto acessível. A rota nas configurações resume os tipos de desafio e a saída de cada mapa.

## Verificação

Os testes de regressão reproduzem as esperas, verificam avanço de rota, preservação da perseguição pendente, objetivos por mapa e progresso em novas voltas do Infinito. A matriz de 84 campanhas foi repetida após a reorganização; todas chegaram à urna, e a maior parada residual observada fora de arenas/travessias foi um quadro a 30 Hz (0,033 s).

As verificações de interface em Chrome cobrem os objetivos e o indicador em 390 e 900 pixels, junto da suíte existente e dos replays da experiência.
