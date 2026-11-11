# Auditoria de jogabilidade e fidelidade — 11/11/2026

## Escopo
Comparação com os pedidos disponíveis nesta conversa e com `boss-combat-design.md`: quatro confrontos em cada um dos cinco cenários, classes/dificuldades, inimigos em pé em plataformas voadoras, gestos de conjuração, Flávio atacando, Fantasma do Comunismo final, jacaré de dez segundos e urna 13/22. A imagem de cartola é referência de postura, conforme esclarecimento do usuário.

## Falhas reproduzidas e correções
| Falha confirmada | Causa | Correção e prova |
|---|---|---|
| Último disparo reservado saía durante a fase anunciada como recuperação | O relógio da fase começava no agendamento, antes do lançamento real | A recuperação aguarda a saída dos disparos e a animação de lançamento. Teste percorre 20 encontros em 480 e 900 px e verifica cada novo lançamento |
| Disparo para trás nascia à direita e atravessava visualmente o próprio personagem | Origem e efeito da mão tinham coordenada fixa à direita | A origem e o desenho compartilham `heroMuzzleFor` e o sentido do disparo, preservando os sprites existentes |
| J/Z não funcionavam com o botão Disparar focado | Filtro de elementos interativos bloqueava também o próprio controle do jogo | Exceção limitada a J/Z no botão de ataque; campos e outros controles preservam seu comportamento |
| No Infinito, acertar o chefe reduzia vida sem informar o valor | HUD exibia somente a meta alternativa de esquivas | PV restante é mostrado ao lado do contador de esquivas, sem retirar a vitória por evasão |

Os quatro testes em `tests/game-design-audit.test.mjs` falharam antes das correções e passaram depois. Os dois testes de interface executam os trechos reais dos respectivos handlers/HUD; o CI também valida o botão focado e a redução de PV no navegador.

## Pedidos conferidos
| Pedido | Evidência disponível |
|---|---|
| 20 confrontos, quatro por cenário | Catálogo `runner-bosses.mjs`, testes de catálogo, progressão, todos os encontros e urna |
| Classes e dificuldade progressiva | Quatro classes, graduação por cenário, PV e intervalos graduais; teste diferencia rajadas de artilheiro e alvos de conjurador |
| Inimigos em pé nas naves | Rig com pés no convés, cabeças originais e braços independentes; testes de geometria e renderização Canvas nativa |
| Preparação, disparo, recuperação e segunda fase | Máquina de fases, gestos distintos e sinalização visual; regressão de lançamento/recuperação acrescentada nesta rodada |
| Ataque de Flávio | Intervalo de tiro, mira comprometida, colisão varrida, energia, cancelamento de comandos, J/Z e toque |
| Fantasma como chefe final | Encontro 20 usa `meme-army` e nome Fantasma do Comunismo; Bossonari continua separado |
| Jacaré por dez segundos | Testes de duração, retorno, ampolas, distribuição e caminhos de evasão |
| Urna 13/22 | Testes do motor e interface para vitória, prisão fictícia e reinício |
| Corrida, cenários e transições | Regressões de movimento, colisão, proporção em resize, cenas e continuidade |
| Som e carregamento | Regressões existentes de seleção de trilhas, mixagem, mute, falhas de áudio e imagens; nenhum áudio novo foi inventado |

## Validação desta rodada
- **278 testes locais aprovados**, incluindo Canvas nativo, os quatro casos novos e regressões existentes que não exigem Chromium.
- O piloto de entradas legais já existente foi aplicado aos 20 encontros em duas larguras: **40/40 vitórias**, sem escudo, imunidade nem vidas adicionais. A mudança de fase não removeu a possibilidade de vitória.
- Versões dos recursos e `git diff --check` aprovados.
- A versão publicada foi aberta no navegador: largada, movimento, derrota e interface foram observados; nenhum erro de console foi retornado nessa inspeção. O controle manual temporizado pela extensão não foi usado como prova de campanha completa.
- O CI executa os testes desktop/celular e gera capturas das arenas em 390 e 1440 px; o resultado é registrado no PR antes da integração.

## Limites das conclusões
Testes e renderizações confirmam os casos descritos; não provam ausência universal de bugs, qualidade AAA, diversão ou desempenho em todos os dispositivos. Não houve nesta rodada campanha inteira jogada manualmente, teste em aparelho físico/Safari nem avaliação auditiva humana de todas as trilhas. Não se atribui às correções nenhuma dessas validações.

Base anterior da alteração: `b3b2ee80529a52cb646ab61c688db5a7007d2dd2`. A alteração fica restrita ao jogo e seus testes; outros sites e serviços não são modificados.
