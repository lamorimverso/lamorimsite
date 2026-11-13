# Escala, emissão e som dos inimigos

Evidência enviada: PF visualmente com aproximadamente metade da altura de Flávio; Dilma paira enquanto o vendaval já está distante. Escala anterior vinculava arte a height/94 (hitbox44px), produzindo miniatura. Emissões comuns nasciam fora da tela, sem preparação e com gesto inferido por uma distância menor que40px. Som era disparado no agendamento, antes de uma possível espera.

Correção:
- Humanos de solo usam escala visual .95, como Flávio; alturas físicas anteriores preservadas para manter as janelas de salto. Armas, malas e outras ameaças conservam tamanhos próprios. Preservar proporções e orientação.
- Compartilhar a função pura de pose articulada entre desenho e origem de emissão. Emissões comuns altas têm preparação real, lançamento na mão, voo comprometido e recuperação; manter separação temporal entre ameaças e garantir resposta de agachar, inclusive nas bordas.
- A trajetória alta tem duração explícita; campos de animação e tempo de contato vêm do mesmo relógio de simulação. Resize reenquadra pontos sem mudar o prazo. A silhueta não fica ociosa durante o ciclo de lançamento.
- Efeito sonoro uma vez por lançamento efetivo, com perfis originais de três variantes por inimigo. Não inventar falas ou atribuir vozes de outra pessoa. Falas verificadas já existentes conservam fonte/contexto/mute/prioridade.
- Testes de escala por pixels, origem/pose, ciclos, reação, resize, áudio e variantes; regressões, piloto legal, CI e capturas antes de integrar.

O escopo é o jogo tanahoraflavio. Marcos de22km, quatro chefes por cenário, WASD, configurações compactas, jacaré e urna permanecem.

A validação de rotas mostrou que ampliar a hitbox alterava a janela de salto existente. O patch final normaliza a escala visual e preserva as alturas físicas anteriores. Passaportes vinculados seguem o deslocamento real do projétil, incluindo espera e resize.
