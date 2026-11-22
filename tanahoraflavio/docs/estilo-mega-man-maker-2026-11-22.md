# Adaptação de plataforma inspirada em Mega Man Maker

Referências consultadas:

- https://megamanmaker.com/
- https://wiki.megamanmaker.com/index.php/Mega_Man — tiro básico com até três projéteis simultâneos, deslize e carga configuráveis.
- https://wiki.megamanmaker.com/index.php/Boss_Door — portões associados à presença de chefes e minichefes.
- https://wiki.megamanmaker.com/index.php/Level_Builder — separação de plataformas, objetos, personagens e confrontos.

Esta implementação adapta a estrutura com código e desenhos vetoriais próprios no motor web do Corre, Flávio! Os personagens e o percurso de 100 km entre duplas continuam os do jogo.

## Comportamento

- Arenas com piso em blocos e portões que fecham durante a entrada do chefão. O estado do combate conserva os limites de movimento e interrompe o avanço da corrida. As travessias do Fiscal e do Povo continuam sem fechar uma arena.
- Após uma vitória intermediária, os portões abrem e a sala desaparece em 650 ms enquanto o percurso e a corrida já avançam. Movimento reduzido evita essa animação decorativa.
- A arma IVER da arena aceita até três tiros simultâneos. Um quarto tiro bloqueado não consome munição nem inicia outro disparo. Carga e poderes conquistados conservam suas funções.
- Soltar a tecla ou botão de salto durante a subida limita a velocidade vertical a 260 na arena; manter conserva o salto completo. Teclado, mouse, gesto vertical de toque e controle compartilham as fontes mantidas. Soltar uma fonte não corta outra ainda pressionada. O toque simples conserva o salto completo.
- Corrida, travessias e saltos descendentes mantêm a física anterior. O treino de plataformas e os apoios aéreos recebem superfícies em blocos, com os mesmos limites físicos. As juntas acompanham a plataforma, inclusive quando ela é recortada pela borda da tela.

## Validação

706 testes locais passaram. A matriz de 84 campanhas de 100 km chegou integralmente à urna, com sete intervalos e cinco voos por campanha, usando apenas comandos públicos e escudos conquistados. A maior espera residual do cenário fora de arenas/travessias continua em um quadro de 30 Hz.

As regressões incluem salto curto/alto a 30/60/120 Hz, limite de tiros e munição, retomada sem pausa, portões de entrada/saída e deslocamento das juntas dos blocos. Chrome verifica o salto por teclado, duas teclas simultâneas, mouse, toque e controle, além de capturar a arena a 390/900 px.
