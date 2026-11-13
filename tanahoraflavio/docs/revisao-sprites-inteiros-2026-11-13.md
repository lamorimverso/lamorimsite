# Personagens inteiros no estilo dos atlas originais

A composição de cabeça recortada com corpo vetorial foi substituída, no combate, por desenhos completos: rosto, cabelo, roupa, braços, mãos, pernas e sapatos pertencem ao mesmo quadro ilustrado. Os novos desenhos usam os atlas originais de Flávio e do elenco como referência.

São seis atlas transparentes, com 96 quadros no total. Eles incluem preparação, lançamento e recuperação dos chefes; Flávio atirando de pé, no salto e agachado; corrida do soldado e de Bossonari; quatro uniformes regionais adicionais. Os demais ciclos completos de corrida e as animações de Flávio e do jacaré foram preservados.

[Ver a animação dos corpos completos](elenco-ilustrado-animado-2026-11-13.webp) · [Comparar os quadros dos chefes](elenco-ilustrado-quadros-2026-11-13.webp)

## Soldados por cenário e país

| Cenário | País | Uniforme |
| --- | --- | --- |
| Brasília | Brasil | Verde militar e capacete |
| Rio de Janeiro | Brasil | Camuflagem de selva e boina verde |
| Argentina | Argentina | Uniforme azul-cinza e capacete |
| Flórida | Estados Unidos | Camuflagem areia, capacete e óculos |
| Casa Branca | Estados Unidos | Guarda de azul, faixa branca e detalhes dourados |

[Ver os cinco uniformes correndo](soldados-por-cenario-2026-11-13.webp)

O uniforme é escolhido no cenário de entrada. Um soldado que ainda está na tela mantém seu uniforme quando o cenário muda. As cinco localidades podem receber soldados após o desbloqueio correspondente; as dimensões físicas e a ação de esquiva do soldado permanecem iguais.

## Integração e verificação

- Cada pose utiliza uma única imagem do personagem inteiro. Cabeça e corpo não são recompostos em camadas no caminho normal de combate.
- Recortes seguem as silhuetas conectadas: mãos que ultrapassam a divisão nominal da grade não são cortadas nem aparecem no quadro vizinho.
- Escala comum por sequência, apoio dos pés e pontos de emissão são calculados previamente. Os atlas fazem parte do carregamento essencial, com prazo, validação de dimensões e nova tentativa após falha.
- Tiros do herói nascem no dispositivo voltado ao alvo. Os pontos dos emissores comuns acompanham a mão do quadro de lançamento. Emissores próximos prolongam a preparação e encurtam o voo mantendo o instante de contato reservado, permitindo concluir um salto anterior.
- Testes verificam quadros inteiros, pixels reais, os dois sentidos de corrida, uniformes por cenário, persistência na transição, preparo/soltura/retorno, efeitos reduzidos e tiros de pé/no ar/agachado.
- Capturas do jogo inspecionadas em celular e computador. As pranchas acima são prévias renderizadas pelo código do jogo, sem alterar a partida.

Reprodução: `node tools/build-combat-art.mjs --check`; prévias opcionais: `node tools/preview-combat-art.mjs` (requer Sharp e Canvas nativo). Os PNGs gerados foram preservados; o jogo carrega as cópias WebP sem perdas. Armas detalhadas, IA, vozes, classes e regras da campanha continuam presentes.
