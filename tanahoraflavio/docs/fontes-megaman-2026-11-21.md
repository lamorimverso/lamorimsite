# Arquivos de apoio e adaptação para Corre, Flávio!

## Fontes verificadas

1. [Mega Man Labs, de Molten Gears](https://github.com/MoltenGears/Mega-Man-Labs), revisão `9afb6aa790f88d0097a4aa5e1dd8391127f405d7`. Código MIT. Foram trazidos os estados `idle.gd`, `jump.gd`, `dash.gd`, `move.gd`, `shoot.gd` e `common.gd` para `tools/references/megaman-labs/`, junto da licença original. O README distingue a licença do código das licenças de música e desenhos.
2. [jspicl-megaman-sample, de Agron Kabashi](https://github.com/jspicl/jspicl-megaman-sample), revisão `05e0a42b1414d46caea83dd3c0730b9772db0491`. Código MIT. Os arquivos `player.js`, `actorFactories.js`, `animation.js` e `megaman.js` foram trazidos como referência da separação entre comportamento, criação do personagem e quadros de animação. A versão original exige PICO-8 e transpila JavaScript para Lua; não é executada dentro deste site.

As cópias preservadas são arquivos de desenvolvimento, não dependências executáveis do jogo. O manifesto é `tools/references/megaman-sources.json`. As licenças também estão publicadas em `third-party/megaman-labs.LICENSE.txt` e `third-party/jspicl-megaman.LICENSE.txt`.

## Integração

`runner-platform-boss.mjs` foi inicialmente adaptado a partir dos estados do Mega Man Labs para o motor JavaScript existente. A revisão seguinte substituiu a sequência de espera/avanço/retorno por uma patrulha original contínua, com reversão suave, saltos e sinal visual de velocidade; o código anterior não foi reaproveitado nessa nova rotina. A escala, o corredor lateral e os tempos foram ajustados à tela móvel e às colisões de Corre, Flávio!. A posição é calculada pelo relógio da simulação, preservando o mesmo caminho entre taxas de quadros e permitindo antecipação física dos tiros.

O corpo é desenhado pelos atlas e pelo elenco próprios de Corre, Flávio!: Ana Elisa, Xandão, Rick, Joice e os demais chefões. Flávio continua usando seus desenhos de corrida, salto, agachamento, deslize e disparo. As armas, fraquezas, proteção e recompensas existentes permanecem. Nenhuma imagem, música, ROM ou cartucho de Mega Man foi importado.

Os duelos de campanha passam a acontecer no chão, com sombra no piso, saltos e avanços; a plataforma flutuante permanece disponível para os encontros de travessia e para o modo legado. O tiro carregado e as aberturas de contra-ataque continuam funcionando.

Após uma vitória, há pelo menos 18 segundos de corrida antes de outro encontro obrigatório. A quilometragem física, os obstáculos comuns, os controles e o chão continuam ativos. O avanço nominal da fase é distribuído nesse intervalo, sem prender o personagem nem congelar o cenário em um marco. A primeira entrada, a ordem dos mapas, as travessias e a urna final conservam seus marcos.

O vídeo enviado pelo usuário foi identificado como [COMO FAZER O JOGO DO MEGAMAN! — Yadaa HOW TO](https://www.youtube.com/watch?v=M2UbLyejBQY), um tutorial em Scratch. A página abriu, mas a reprodução permaneceu no carregamento no navegador utilizado; não se alega uma análise visual completa do vídeo. A implementação usa os arquivos de código aberto verificados acima.

## Ampliação da pesquisa — 23/11/2026

- [bakudas/megaman-clone-raylib](https://github.com/bakudas/megaman-clone-raylib): referência **conceitual** para câmera com olhar à frente, controle horizontal, salto com *buffer*, dash curto, deslizamento na parede e plataformas atravessáveis. O projeto usa Python 3.13 + raylib, enquanto Corre, Flávio! mantém JavaScript/Canvas. Na inspeção realizada não havia arquivo `LICENSE` na raiz; nenhum código foi importado.
- [metasprite/xplusplus](https://github.com/metasprite/xplusplus): referência conceitual para precisão de controle e separação entre o motor e os conteúdos do jogo. O projeto informa licença MIT para código C e Lua.
- [protoman/rockbot](https://github.com/protoman/rockbot): arquitetura de níveis, armas e chefões, apenas como referência de projeto. Código GPL-2.0, portanto **não copiado** ao jogo.
- [MoltenGears/Mega-Man-Labs](https://github.com/MoltenGears/Mega-Man-Labs): referência MIT já documentada acima, preservada nos arquivos de desenvolvimento existentes.

### Mudanças aplicadas nesta revisão

- O chefão terrestre patrulha continuamente dentro de uma faixa segura do cenário, com reversão de direção e saltos. O disparo e o movimento usam os mesmos cálculos da simulação para permanecer sincronizados.
- Mantém o aviso de lançamento, os padrões de armas, os tempos de esquiva, a barra de vida, o cálculo real de dano, as fraquezas e as recompensas.
- Remove apenas a **etiqueta numérica flutuante de PV**, não o dano real nem o feedback de impacto. A vida restante continua na barra.
- Preserva o modo História manual e o modo Infinito automático; nenhuma arte, ROM ou música de Mega Man foi incorporada.
