# Continuação — comandos simultâneos no celular

O usuário pediu continuar as correções de qualidade do jogo e manter o site clean. A revisão anterior já está publicada em `f140def3fc46f9b3517a3fca6d29c7471a5e7755`; esta rodada parte dela, sem repetir a arte ou acrescentar informações à página.

## Defeito reproduzido

O motor permite sair do agachamento com um salto e reaplicar a intenção mantida ao pousar. A interface, porém, descarta todo `pointerdown` com `isPrimary === false`. No navegador, o segundo dedo é um contato não primário. Dois testes com contatos de toque nativos do Chromium falharam: segurar Abaixar com um dedo e tocar Pular ou a pista com outro não inicia o salto.

## Direção

Aceitar contatos de toque independentes nos alvos de salto, preservando o filtro de botão principal e a proteção contra eventos de compatibilidade duplicados. É uma correção no adaptador de entrada existente; mudar o motor, exigir que o jogador solte Abaixar ou criar outro botão não resolve o contrato atual. Esta escolha é do implementador dentro da autorização para corrigir a jogabilidade.

Sem mudança no layout, arte, colisões, buffer de120ms, cinco cenários de7.000m,100 passaportes por vida, escudo de6s ou três chefes. Flávio continua só fugindo/desviando; sem ataque, playlist ou pausa manual.

## Verificação

Usar eventos de toque nativos para segurar Abaixar, saltar com outro dedo, soltar apenas o dedo de salto, pousar abaixado e finalmente liberar Abaixar. Cobrir Pular e pista; manter testes de salto único, cancelamento, teclado e foco. Conferir rotação/ampliação na interface existente. Suíte completa e CI no SHA final antes de publicar e conferir a página pública.

Referência primária: [W3C Pointer Events — primary pointer](https://www.w3.org/TR/pointerevents3/#the-primary-pointer). O primeiro contato é primário; ignorar contatos não primários implementa interação de apenas um ponteiro.
