# Consolidação da contagem e da corrida contínua

Retomada autorizada pelo usuário: continuar o projeto anterior, preservando a última orientação: uma corrida, com mudanças de cenário, e retirada de São Paulo.

## Experiência
- Percurso: Brasília → Rio → Argentina → Flórida → Casa Branca; cada transição ocorre após 20 segundos efetivos, sem reiniciar tempo, pontuação ou personagem. O último cenário permanece até a colisão.
- Consolidar o refinamento de UX já preparado: contador antes do retrato no celular, controles com pelo menos 44 px, Pular em destaque, ordem de foco visual, ajuda recolhida e fontes próximas ao contador.
- Preservar data, percentual, compartilhamento, créditos e música existentes. Manter páginas vizinhas e redirecionamentos intactos.

## Abordagens
Reutilizar o HTML/CSS e o motor canvas existentes mantém a implantação e evita dependências novas. Manter a versão antiga de três fases encerraria a corrida aos 75 s e contrariaria a última instrução. Reescrever em um framework não traz benefício a este escopo.

## Decisões técnicas
Mesclar as duas cópias locais a partir do mesmo commit publicado 5f6d7d2, em uma worktree isolada. Preservar os cinco desenhos de cenário já preparados e aplicar a identificação clara da UX a cenários, sem chamá-los de fases independentes. Manter subpassos de 1/120 s e pausa de proteção acima de 250 ms. Publicar uma única árvore no GitHub, com atualização condicionada ao commit remoto esperado.

## Validação
Testes de física, transições, continuidade, teclado, toque, pausa, recorde bloqueado, contador, layout em 320/390/768/1440 px e ordem de foco. Inspecionar visualmente a prévia e confirmar a publicação Pages.
