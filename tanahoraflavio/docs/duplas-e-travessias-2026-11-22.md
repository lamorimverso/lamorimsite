# Duplas, corrida de 20 km e travessias

## Diagnóstico

A campanha já tinha duplas por mapa, mas usava 18 segundos como intervalo mínimo entre todos os encontros. Isso não garantia 20 km depois de vencer a dupla. Além disso, o dano direto retirava pelo menos 7,5% do PV máximo e a devolução começava em 14,5%: mais PV também aumentava o dano recebido. Na amostra da semente 17, com a recompensa anterior equipada, vários encontros terminavam em 3–8 segundos e mostravam apenas um ou dois padrões.

## Comportamento

- Vencer o segundo vilão de um mapa inicia uma fuga medida de 20.000 metros. A próxima dupla só pode começar depois desse percurso; a introdução e o parceiro da primeira vitória conservam suas reservas anteriores.
- Só o deslocamento na pista entra nessa conta. Duelo e travessia aérea não completam os 20 km. O cenário continua avançando e o cabeçalho mostra a distância restante.
- Preparar o embarque cedo demais não esvazia toda a corrida de obstáculos: a preparação só reserva o final do percurso. Os chefões aguardam o pouso.
- A campanha usa sete plataformas de alturas diferentes, mais curtas, separadas por vãos maiores. O jogador precisa saltar entre apoios reais. Cair no vazio termina a tentativa, inclusive com escudo ou continuação disponível. O modo Infinito preserva o corredor anterior.
- O desenho do vazio remove também a faixa de 12 pixels da margem da pista, que continuava parecendo um piso abaixo das plataformas. Há regressão de pixels usando o cenário e o terreno reais.
- O dano da campanha tem bases absolutas (1,1 no tiro direto e 2,6 na devolução), com os multiplicadores das armas, aberturas, fraquezas e críticos existentes. O breve efeito de acerto de 280 ms impede que um único leque aplique vários impactos simultâneos.
- PV dos confrontos foram calibrados para permitir mais ciclos de ataques e a segunda fase. Rick e Guilherme recebem resistência apropriada às rajadas e às recompensas anteriores. Não há espera artificial para permitir a vitória.

## Validação

- 698 testes locais passaram, seguidos das regressões específicas de campanha, plataformas e Infinito de 35 minutos.
- Matriz de 84 campanhas: sementes 1, 2, 12, 17, 32, 56 e 101; larguras 480/900; 30/60/120 Hz; assistência ligada/desligada. Apenas comandos públicos, com uso dos escudos conquistados naturalmente. Todas chegaram à urna, completaram cinco voos e os sete intervalos de corrida. Menor intervalo medido: 20.000,156 m; maior espera residual do cenário fora de arenas/travessias: um quadro de 30 Hz (0,033 s).
- O piloto de verificação não repete o salto depois de ultrapassar a marca de um ataque aéreo. Essa repetição indevida provocava um salto antecipado ao retornar à plataforma, especialmente a 30 Hz; nenhuma proteção ou alteração de física foi usada para fazê-lo sobreviver.
- Testes de Chrome verificam o aviso de 20 km após a segunda vitória, sua redução com o deslocamento, a viagem sem chão e ausência de transbordamento a 390/900 px. As capturas ficam no artefato do workflow.
