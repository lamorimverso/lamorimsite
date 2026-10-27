# Tá na hora, Flávio: visual e minigame

Continuação do pedido de melhorar o site existente e acrescentar uma corrida inspirada no jogo offline do Chrome. O usuário pediu Flávio, obstáculos, itens e mudança de cenário Rio → Argentina → EUA.

## Solução

Manter o HTML/JavaScript estático e a publicação atual do GitHub Pages. Acrescentar CSS localizado, um motor de jogo independente e um adaptador Canvas. Um framework exigiria migração e build sem beneficiar esta página; um jogo externo quebraria a experiência integrada. Escolha de implementação: Canvas com desenhos originais e o retrato que já pertence ao projeto.

Layout com tipografia legível, contador em quatro colunas, retrato menor no celular, ações claras e fontes jurídicas recolhidas. Preservar os IDs, a data da contagem, o compartilhamento, os créditos e o comportamento musical existente.

Corrida de 75 segundos: Rio nos primeiros 25, Argentina entre 25 e 50, EUA entre 50 e 75. Pulo por toque, espaço ou seta para cima; obstáculos de chão; passaporte, milhas e notas como bônus fictícios. Colisão encerra a partida; pausa conserva o estado; sair da aba ou da área do jogo pausa. Não iniciar automaticamente. Recorde só no navegador, tolerando armazenamento indisponível. Interface em português, acessível por teclado e com controles fora do Canvas.

## Limites

O roteiro é sátira explicitamente fictícia. Não acrescentar alegações factuais sobre pessoas. Não mudar datas ou explicações jurídicas nesta tarefa. Não adicionar anúncios, rastreadores, bibliotecas de runtime, backend ou mudanças nas outras páginas. Publicar somente os arquivos desta alteração após testes e revisão. Reversão pelo commit anterior.
