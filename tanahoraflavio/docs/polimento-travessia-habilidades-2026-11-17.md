# Polimento, travessias e habilidades

Oito objetos principais têm quatro poses ilustradas, com contornos e materiais próximos aos personagens: algemas, microfone, martelo, mandado, recibos, planilhas, cruz com paraquedas e mão em L. A saída do ataque ficou menor e o rastro acompanha a direção do voo.

[Comparação das algemas no disparo real da PF](pf-handcuffs-browser-2026-11-16.png) · [Objetos animados](signature-props-animated-2026-11-16.webp).

## Jogabilidade

- **Deslizar:** abaixe enquanto avança. O impulso dura até 0,85 s; solte ou troque a direção para preparar outro.
- **Passagens baixas:** a abertura visível cabe à postura agachada. Um aviso aparece na borda da tela antes do obstáculo entrar.
- **Vãos e plataformas:** o chão realmente termina. Salte e pouse no apoio elevado; colisão e desenho compartilham a mesma geometria.
- **Duplo pulo:** vença Soraya na História ou cinco chefes no Infinito. Aperte o comando de pular novamente no ar. Cada pouso recupera o segundo salto.
- **Dificuldade adaptada:** depois dessa conquista, surgem vãos mais largos e apoios mais altos, com a mesma antecedência de aviso.
- **Aliados:** cada item temporário válido dá um escudo à frente por 3 s, além da ajuda própria, munição e uma parte de reserva. Outra coleta renova os 3 s. Seis ajudas continuam guardando um escudo para ativar manualmente.

Os escudos protegem contra ataques; é preciso saltar os vãos. A proteção de um aliado não encurta um escudo manual que ainda tenha mais tempo.

[Deslize no jogo](travessia-390-passagem-2026-11-16.png) · [Salto e apoio](travessia-1365-salto-2026-11-16.png).

## Fluidez

A interface atualiza textos e medidores apenas quando seus valores mudam. O perfil comparativo mediu cerca de 98% menos alterações repetidas no DOM, mantendo o resultado da simulação. Isso reduz trabalho da interface; não equivale a uma garantia de FPS em todos os aparelhos.

Referências consultadas: [post indicado no Reddit](https://www.reddit.com/r/aigamedev/comments/1x7zsw0/tips_starter_prompt_to_improve_your_games/) e [otimização de Canvas na MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas).
