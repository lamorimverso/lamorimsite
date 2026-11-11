# Arenas, classes e combate — 11/11/2026

## Decisões confirmadas
- Quatro grandes chefões em cada um dos cinco cenários: 20 confrontos.
- Flávio também ataca. Preservar salto, agachamento, movimento lateral, jacaré, modos e urna.
- Inimigos em pé sobre plataformas voadoras; posturas e gestos de conjuração. A imagem enviada é referência de postura, não substitui o Fantasma do Comunismo final.
- Inspiração em ciclos legíveis de batalha de plataforma; personagens, armas e cenários existentes continuam originais do projeto.

## Implementação escolhida
Manter o motor Canvas e adicionar um catálogo de 20 encontros e uma camada de combate. Cada cenário tem quatro graduações de dificuldade e quatro classes (sentinela, artilheiro, conjurador, soberano). Reutilizar identidades existentes em encontros com padrões e graduação distintos; o encontro 20 é o Fantasma do Comunismo.

Chefes têm entrada, preparação, ataque e recuperação, pontos de vida, segunda fase abaixo da metade da vida e recuperação vulnerável. Ataques continuam esquiváveis; vencer depende de acertar o chefe, não de apenas sobreviver a uma contagem. Disparo por J/Z ou botão de toque mantido; tiros comprometem a mira ao nascer, possuem intervalo e são descartados ao sair, perder foco ou terminar encontro.

A progressão da História contém encontros nos marcos 1200, 2900, 4600 e 6300 m de cada trecho de 7 km. Durante a arena a geografia fica no cenário do confronto, enquanto a simulação, animações e pista continuam ativas. A urna é liberada após a vitória 20. O Infinito conserva sua sequência de rivais e também recebe combate.

## Arte e experiência
Corpos articulados em pé, pés sobre nave visível, motores animados, braços com pivôs e gesto de lançamento. Reutilizar recortes de cabeça dos atlas existentes para preservar os rostos; não usar poses de corrida como corpo do chefe. A referência de cartola orienta apenas postura e mãos. HUD indica classe, graduação, vida do jogador e vida do chefe. Arena possui sinais de preparação, mudança de fase e recuperação.

## Validação e limites
Testar catálogo 5×4, último chefe, dificuldade, dano e intervalo de tiro, impossibilidade de vencer só desviando, vitória e limpeza, mira/colisão, resize, comandos/controles cancelados, retorno ao corredor e urna. Atualizar testes antigos de seis confrontos para o contrato de 20 sem suprimir cobertura. Testar UI em desktop e celular no CI e comparar a versão publicada. Não alterar outros sites ou serviços.
