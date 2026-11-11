# Correção de combate e level design por comparação com referências

Pedido: pesquisar estudos, análises e fóruns, comparar com o jogo e corrigir a experiência solicitada. Escopo: somente Corre, Flávio!, suas fontes, testes e documentação. Manter Canvas, personagens, 20 encontros, cinco cenários, jacaré de dez segundos, urna e Infinito. Não copiar personagens/recursos de Mega Man.

## Diagnóstico e escolha
A auditoria anterior validou regras, mas não a expressividade dos movimentos. O padrão de ação ignora a classe em boa parte dos ataques; o rig troca instantaneamente entre poses fixas; o Fantasma é chamado com phase=0 e reducedMotion=true; o seletor abre no Infinito, longe da campanha solicitada. Os corredores são sorteados como no Infinito, sem preparação específica para o chefe seguinte.

Reescrever como outro jogo teria risco elevado e perderia mecânicas existentes. Acrescentar apenas efeitos não resolveria os padrões iguais. A escolha técnica desta rodada é corrigir catálogo, apresentação e aproximação no motor atual, preservando o restante.

## Critérios de aceitação
- História é a seleção inicial; Infinito permanece selecionável e com suas regras.
- Quatro classes exigem sequências diferentes: leitura de ataque único; rajadas no mesmo nível; reposicionamento; combinação dos três. A segunda fase reforça padrões conhecidos, sem retirar avisos e reservas de reação.
- Preparação, lançamento e recuperação têm movimento articulado contínuo e poses diferentes por ação. O aviso pendente também prepara o corpo e não oculta um lançamento real de outra rajada.
- Fantasma preserva chapéu vermelho/pernas e ganha movimento e gestos próprios, com pernas apoiadas na nave. Efeitos reduzidos conservam a informação por poses estáticas.
- Posição animada da nave compartilhada por desenho, mira e hitbox. Entrada suave e voo limitado à tela.
- Antes de cada chefe: um exemplo de sua arma, isolado; depois corredor sem novos perigos. Sem novos tutoriais ou interrupções. Esta cadência é uma escolha de projeto, não uma fórmula cientificamente comprovada.
- Testes do motor, comandos, renderização real, capturas e CI. Não confundir vitória automatizada com avaliação humana de diversão.

## Referências lidas e aplicação
| Fonte primária | O que sustenta | Comparação/aplicação |
|---|---|---|
| [Khalifa, Silva e Togelius, 2019](https://akhalifa.com/documents/level-design-patterns.pdf), análise exploratória de mais de 30 jogos 2D; [texto dos autores](https://www.gamedeveloper.com/design/level-design-patterns-in-2d-games) | Antecipação, zona segura, combinação e variação de ritmo são padrões descritivos, não garantias de qualidade | O corredor aleatório não ensina a arma seguinte: acrescentar ensaio isolado e aproximação sem novos perigos |
| [Mike Stout, Boss Battle Design and Structure](https://www.gamedeveloper.com/design/boss-battle-design-and-structure) | Chefes como teste de habilidades e marcos de tensão e alívio | Diferenciar a exigência das classes, preservar recuperação útil |
| [Capcom, Impact Man, 2018](https://news.capcomusa.com/mega_man/blog/2018/08/31/impact-man-piles-in-to-mega-man-11) | Exemplo concreto de ligação entre tema da fase, inimigos e ações do chefe; preparação de investida e transformação | Usar as próprias armas e identidades existentes no corredor e no confronto; tornar preparação e lançamento visíveis |
| [Desenvolvedor de Death’s Gambit, Readability](https://www.gamedeveloper.com/game-platforms/designing-for-difficulty-readability-in-arpgs) | Gestos, sinais e resultados consistentes ajudam a reconhecer a resposta adequada | Poses diferentes para salto, agachamento e deslocamento; não ocultar lançamento por outra munição pendente |
| [Hicks et al., DiGRA 2018](https://dl.digra.org/index.php/dl/article/view/936/) | Framework de feedback baseado em questionário com 17 desenvolvedores e análise de dois jogos | Relacionar feedback ao estado real; não interpretar o estudo como comprovação de que mais partículas melhoram este jogo |
| [Discussão r/gamedev, junho/2023](https://www.reddit.com/r/gamedev/comments/13zsyob) | Relatos defendem antecipação, dificuldade progressiva, ataques ligados à região e testes com jogadores | Orientação prática secundária em força de evidência; não tratar votos, opiniões ou alegação profissional como estudo controlado |

Limites de acesso: a discussão do fórum foi obtida nos resultados de busca; a abertura direta retornou bloqueio. O PDF de slides GDC Boss Up excedeu o limite de leitura; só o resumo da sessão foi consultado, sem atribuir detalhes da palestra. Nenhuma dessas fontes estabelece tempos ideais para este jogo: os valores serão validados por simulação e inspeção visual, e ainda precisam de playtest humano.
