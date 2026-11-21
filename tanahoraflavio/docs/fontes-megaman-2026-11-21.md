# Arquivos de apoio e adaptação para Corre, Flávio!

## Fontes verificadas

1. [Mega Man Labs, de Molten Gears](https://github.com/MoltenGears/Mega-Man-Labs), revisão `9afb6aa790f88d0097a4aa5e1dd8391127f405d7`. Código MIT. Foram trazidos os estados `idle.gd`, `jump.gd`, `dash.gd`, `move.gd`, `shoot.gd` e `common.gd` para `tools/references/megaman-labs/`, junto da licença original. O README distingue a licença do código das licenças de música e desenhos.
2. [jspicl-megaman-sample, de Agron Kabashi](https://github.com/jspicl/jspicl-megaman-sample), revisão `05e0a42b1414d46caea83dd3c0730b9772db0491`. Código MIT. Os arquivos `player.js`, `actorFactories.js`, `animation.js` e `megaman.js` foram trazidos como referência da separação entre comportamento, criação do personagem e quadros de animação. A versão original exige PICO-8 e transpila JavaScript para Lua; não é executada dentro deste site.

As cópias preservadas são arquivos de desenvolvimento, não dependências executáveis do jogo. O manifesto é `tools/references/megaman-sources.json`. As licenças também estão publicadas em `third-party/megaman-labs.LICENSE.txt` e `third-party/jspicl-megaman.LICENSE.txt`.

## Integração

`runner-platform-boss.mjs` adapta os estados de movimento do Mega Man Labs para o motor JavaScript existente: espera, salto, avanço rápido comprometido e retorno andando. A escala, o corredor lateral e os tempos foram ajustados à tela móvel e às colisões de Corre, Flávio!. A posição é calculada pelo relógio da simulação, preservando o mesmo caminho entre taxas de quadros e permitindo antecipação física dos tiros.

O corpo é desenhado pelos atlas e pelo elenco próprios de Corre, Flávio!: Ana Elisa, Xandão, Rick, Joice e os demais chefões. Flávio continua usando seus desenhos de corrida, salto, agachamento, deslize e disparo. As armas, fraquezas, proteção e recompensas existentes permanecem. Nenhuma imagem, música, ROM ou cartucho de Mega Man foi importado.

Os duelos de campanha passam a acontecer no chão, com sombra no piso, saltos e avanços; a plataforma flutuante permanece disponível para os encontros de travessia e para o modo legado. O tiro carregado e as aberturas de contra-ataque continuam funcionando.

Após uma vitória, há pelo menos 18 segundos de corrida antes de outro encontro obrigatório. A quilometragem física, os obstáculos comuns, os controles e o chão continuam ativos. O avanço nominal da fase é distribuído nesse intervalo, sem prender o personagem nem congelar o cenário em um marco. A primeira entrada, a ordem dos mapas, as travessias e a urna final conservam seus marcos.

O vídeo enviado pelo usuário foi identificado como [COMO FAZER O JOGO DO MEGAMAN! — Yadaa HOW TO](https://www.youtube.com/watch?v=M2UbLyejBQY), um tutorial em Scratch. A página abriu, mas a reprodução permaneceu no carregamento no navegador utilizado; não se alega uma análise visual completa do vídeo. A implementação usa os arquivos de código aberto verificados acima.
