# Checklist crítica de jogabilidade, personagens e áudio

Atualizada em 13/11/2026. Escopo: somente o jogo `tanahoraflavio`. Base da auditoria: `ecf555d3a4322ae78a9677cebc72072ab65de6c7`.

Esta lista distingue defeitos reproduzidos, verificações automáticas e avaliação qualitativa. Testes aprovados não demonstram diversão ideal nem ausência universal de erros. As gravações de fala são recursos diferentes dos efeitos de disparo.

## 1. Defeitos reproduzidos e tratados nesta alteração

| Prioridade | Evidência antes da correção | Alteração | Critério de aceite |
|---|---|---|---|
| P1 — desaparecimento dos perseguidores | `obstacle()` retornava sem desenhar um inimigo de solo com `passed=true`, mesmo no centro da tela | Desenho e animação continuam depois da esquiva | O ator permanece desenhado até alcançar a borda de saída |
| P1 — retaguarda cortada | O motor removia a ameaça em `playerX + PLAYER.width + 80` | Limpeza usa a largura do campo, sentido do movimento e margem visual | Com Flávio no meio, o perseguidor alcança o lado oposto da tela |
| P2 — arte larga cortada | Remoção à esquerda usava a caixa física e apenas20 px de folga | Margem de128 px protege a arte que excede o colisor | Personagens largos não somem parcialmente visíveis; objetos saídos são removidos |
| P2 — alertas falsos | Sombra de queda e aviso de retaguarda podiam acompanhar objetos já evadidos | Avisos consultam `passed/counted`; arte continua independente | Não anunciar como novo perigo o que já foi resolvido |
| P2 — saída instantânea de aparição | Emissor temporário era removido ao terminar o relógio, ainda parado na nave | Últimos0,3 s da recuperação deslocam a nave para fora da tela | Aparição sai pela borda antes de encerrar; origem do projétil já lançado permanece comprometida |
| P2 — identidade sob falha de rede | Boulos/Dino dependiam do atlas opcional; chefões podiam usar cabeça neutra se esse download falhasse | Atlas `pursuers` passa a integrar a carga essencial | Rostos dos chefes estão disponíveis mesmo quando os apoios opcionais falham |
| P2 — fala fora de cena | Uma fala de chefe enfileirada ainda tocava depois de sua saída ou troca | Vínculo com a instância do chefe é validado antes de tocar | Remover ou substituir o chefe cancela a pendência, inclusive pelo mesmo tipo |
| P2 — Joice sem fala no chefão | Recorte existente era usado só na perseguição especial | Recorte também é elegível no encontro de Joice | Evento de chefe Joice seleciona o áudio correto com prioridade inferior à perseguição |
| P2 — falha tratada como áudio tocado | Rejeição assíncrona de `Audio.play()` consumia o cooldown e descartava a fala | Falha ativa devolve a reserva; até uma repetição dentro da validade original | Sem tentativa a cada frame, sem ressuscitar áudio após reset, mute ou troca de cena |
| P3 — documentação contraditória | README ainda dizia Joice parcial e interrupção em recuperação | Texto alinhado ao recorte integral e comportamento atual | Catálogo, créditos e documentação descrevem o mesmo recurso |

A ampliação da visibilidade não reativa colisões de ameaças já evadidas. Elas deixam de reservar novos intervalos de perigo. Quedas, bueiros, coletas consumidas, tiros que acertam e encerramentos de arena têm ciclos próprios; não devem permanecer para sempre só por ainda haver espaço de tela.

Trade-off de carga: `pursuers-motion-v1.webp` já existia e tem934.368 bytes. Ele agora precisa terminar antes da largada. O pacote total não aumenta, mas mais dados passam a ser essenciais; medir tempo real em conexão móvel continua pendente.

## 2. Elenco e animação

### Verificações existentes, executadas novamente nesta auditoria

- [x] Corpos e passadas dos perseguidores de solo: PF, Janones, Exército, Fantasma, Bossonari, Boulos, Dino, Xandão, Haddad, Lula, Dilma, Simone e Soraya.
- [x] Quatro quadros dos apoios e poses dos personagens/formas: Flávio, Joice, Zé Gotinha, jacaré e15 aliados.
- [x] Total de32 personagens/formas conferidos por renderização; isso não significa32 vozes.
- [x] Cabeça/corpo e mudança de preparação, disparo e recuperação nos20 encontros.
- [x] Flávio dispara em pé, saltando e no slide, com braço, recuo e retorno; orientação e boca do tiro conferidas.
- [x] Espelhamento preserva o envelope do desenho e a orientação ao recuar/retomar.
- [x] Movimento reduzido preserva ações essenciais e elimina balanços decorativos previstos.
- [x] Erro, timeout, dimensões inválidas e nova tentativa de carregamento possuem regressões.

### Pendências de acabamento e experiência

- [ ] **P2 — uniformidade de arte.** Exército/Bossonari usam corpos vetoriais e Bossonari tem rosto mais simples que os atlas ilustrados. Eles são visíveis e animados, mas a consistência estética ainda precisa de revisão; presença de pixels não prova acabamento equivalente.
- [ ] **P2 — continuidade entre aparições consecutivas.** O jogo mantém um emissor comum principal; a substituição por outro emissor antes do fim do ciclo anterior ainda merece teste visual específico. A saída natural foi tratada; uma fila completa de emissores não foi implementada nesta alteração.
- [ ] **P2 — transições de encerramento.** Início/fim de arena e transformação podem limpar objetos por regra. Avaliar se precisam de dissolução/retirada visual em vez de limpeza imediata, sem manter dano antigo na arena nova.
- [ ] **P2 — percepção das colisões.** Caixas menores favorecem a esquiva, mas não são idênticas à silhueta. Medição na fase0: PF~78 ×81 px versus colisão28 ×44; Fantasma~104 ×90 versus40 ×44; herói~75 ×81 versus26 ×50. Não ampliar hitboxes automaticamente: isso já altera janelas de salto. Validar contatos com pessoas jogando e imagens de colisão.
- [ ] **P2 — equilíbrio humano.** Avaliar leitura, repetição, ritmo e dificuldade das quatro classes com jogadores iniciantes e experientes. Piloto automatizado comprova rotas conhecidas, não a sensação de justiça ou diversão.

## 3. Cobertura real de fala

Há11 arquivos MP3 catalogados, com11 SHA-256 conferidos. Integridade do arquivo não é confirmação acústica independente do locutor. Os54 padrões de disparo são efeitos não verbais; não completam a dublagem.

| Tipo de chefão | Fala/meme vinculado após esta correção | Efeito de disparo | Estado |
|---|---|---|---|
| Haddad | 1 recorte próprio catalogado | Sim | Integrado |
| Janones | 2 memes contextualizados; identidade acústica não certificada nesta auditoria | Sim | Integrado com ressalva de atribuição |
| Lula | 6 memes no chefão | Sim | Integrado; imitação de Eduardo não conta como voz de Eduardo |
| Joice | 1 recorte próprio, também na perseguição especial | Sim | Integração de chefão corrigida |
| PF | Nenhum | Sim | Pendente: voz ficcional identificada como tal, ou material autorizado/contextualizado |
| Xandão | Nenhum | Sim | Pendente |
| Dilma | Nenhum | Sim | Pendente |
| Soraya | Nenhum | Sim | Pendente |
| Boulos | Nenhum | Sim | Pendente |
| Dino | Nenhum | Sim | Pendente |
| Simone | Nenhum | Sim | Pendente |
| Bossonari | Nenhum; identidade ficcional própria | Sim | Pendente: definir e gravar voz ficcional |
| Fantasma do Comunismo | Nenhum; identidade ficcional própria | Sim | Pendente: definir e gravar voz ficcional |

Cobertura de algum recorte de fala/meme: **4/13 tipos de chefe, em7/20 encontros**. Antes da correção de Joice eram3/13 tipos e6/20 encontros. Não significa quatro pessoas com autenticidade vocal nova certificada.

**Sem fala própria e sem integração individual de agendamento:** Vorcaro, Jair, Michelle, Eduardo, Carlos, Renan, Silas, Magno, Nikolas, Tarcísio, Damares, Bia, Trump, Milei e apoiador fictício. Coleta de aliado usa efeito genérico. Flávio e jacaré também não possuem fala própria. Zé Gotinha aciona uma pergunta dita por Lula, identificada no catálogo; não é voz do mascote.

### Checklist para completar as vozes

- [ ] Selecionar vários trechos curtos por personagem real, com locutor, data, transcrição e contexto conferidos.
- [ ] Ouvir cada recorte final e o original; registrar início/fim e hash. Não chamar legenda ou nome do arquivo de prova de locutor.
- [ ] Conferir condições de uso do recurso no jogo e crédito de cada fonte.
- [ ] Integrar eventos individuais dos15 aliados: apenas acrescentar MP3 ao catálogo não os faz tocar.
- [ ] Definir vozes explicitamente ficcionais para personagens sem locutor real; preservar a distinção entre ficção e gravação de arquivo.
- [ ] Verificar anti-repetição, cooldown, mute, prioridade dos alertas, legendas e fallback sob falha de rede.
- [ ] Audicionar a mixagem: música, fala, disparo e alerta em fone e alto-falante de celular.

### Fontes oficiais candidatas encontradas; nenhum recorte novo pronto nesta rodada

| Personagem | Fonte | Trabalho ainda necessário |
|---|---|---|
| Soraya | [Discurso no Senado,01/02/2025](https://www12.senado.leg.br/radio/1/noticia/2025/02/01/discurso-da-candidata-soraya-thronicke) | Selecionar trecho, ouvir, transcrever e validar uso |
| Simone | [Rádio Senado,30/05/2024](https://www12.senado.leg.br/radio/1/pautas-femininas/2024/05/30/simone-tebet-fala-sobre-avancos-e-desafios-dos-direitos-das-mulheres) | Selecionar trecho, ouvir, transcrever e validar uso |
| Dino | [Despedida do Senado,21/02/2024](https://www12.senado.leg.br/radio/1/noticia/2024/02/21/em-despedida-do-senado-flavio-dino-defende-harmonia-entre-poderes) | Matéria tem repórter e sonoras; extrair somente a voz correta, com contexto |
| Dilma | [Posse no Congresso,01/01/2015](https://www12.senado.leg.br/noticias/audios/2015/01/dilma-rousseff-toma-posse-e-faz-discurso-no-congresso-nacional) | Escolher passagem curta da íntegra, ouvir e validar uso |
| Boulos | [Arquivo Sonoro da Câmara,2023](https://imagem.camara.leg.br/internet/audio/lista.asp?numLegislatura=57&txtDt1=01%2F01%2F2023&txtDt2=31%2F12%2F2023&txtOrador=Guilherme+Boulos) | Selecionar registro individual e conferir orador/trecho |
| Moraes | [Pronunciamento no STF,02/09/2025](https://noticias.stf.jus.br/postsnoticias/ap-2668-ministro-alexandre-de-moraes-destaca-independencia-do-stf-e-realizacao-de-um-julgamento-tecnico-e-transparente/) | Verificar mídia, trecho, áudio e condições de uso |

Os [termos da Radioagência Senado](https://www12.senado.leg.br/radioagencia/termos-de-uso) devem ser conferidos no contexto do uso pretendido. Encontrar um download público não demonstra, sozinho, que o recorte já foi validado para o jogo.

## 4. Pesquisa aplicada à jogabilidade

| Fonte primária consultada | Princípio relevante | Comparação com o jogo |
|---|---|---|
| [Godot: Creating the enemy](https://docs.godotengine.org/en/stable/getting_started/first_2d_game/04.creating_the_enemy.html) | Exemplo de inimigos animados removidos quando saem da tela | O desaparecimento era vinculado ao herói, não à saída. Esta alteração separa passagem, desenho e remoção; o jogo continua em Canvas, sem adotar Godot |
| [Maddy Thorson: Celeste & Forgiveness](https://www.maddymakesgames.com/articles/celeste_and_forgiveness/) | Janelas de entrada e posicionamento que favorecem a intenção do jogador, incluindo jump buffering | Preservar salto armazenado e hitboxes tolerantes; voltar não reativa armadilha já resolvida. Não copiar mecânicas de plataformas que o jogo não possui |
| [Mike Stout: Enemy Attacks and Telegraphing](https://www.gamedeveloper.com/design/enemy-attacks-and-telegraphing) | Em jogos de esquiva, preparação, gestos e efeitos devem comunicar o ataque antes do dano | Preservar preparação/lançamento/recuperação e intervalos; não mostrar avisos de ameaça ativa depois da esquiva |
| [Microsoft XAG103](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/103) | Informação importante em mais de um canal sensorial; som não substitui indicação visual | Manter gestos, sinais e texto quando o som está desligado; falas de ambientação não podem esconder alertas. Há recursos existentes, mas não se declara conformidade integral à diretriz |

A consulta ao artigo Tanagra no portal AAAI foi bloqueada nesta rodada; ele não foi usado como evidência nova. Uma palestra catalogada no GDC Vault foi localizada, mas não foi assistida integralmente nem usada como prova de qualidade.

## 5. Checklist de validação antes de chamar o acabamento de concluído

- [x] Reproduzir os defeitos em testes que falham antes do patch.
- [x] Conferir sprites/cabeças,32 personagens/formas e20 chefes com Canvas real.
- [x] Conferir controles, salto armazenado, retorno e cancelamento nas regressões existentes.
- [x] Simular2.000 sequências com entradas legais e campanhas completas pelo piloto existente.
- [x] Conferir os11 hashes dos arquivos de fala e distinguir fala de SFX.
- [x] CI de navegador desta alteração: 445/445 testes aprovados, incluindo travessia completa em desktop/celular e falha de apoios.
- [x] Capturas desta alteração em 390 px e 900 px conferidas: Flávio no centro, perseguidores e objeto dos dois lados, permanecendo até a borda.
- [ ] Jogar campanha inteira manualmente, com teclado e toque, observando dificuldade, repetição e fadiga.
- [ ] Validar Safari/iOS e Android em aparelhos físicos; Chrome headless não substitui esse teste.
- [ ] Medir frames e tempo de carregamento em aparelho modesto e conexão lenta, incluindo novo atlas essencial.
- [ ] Testar multitoque real, rotação com impacto próximo, retorno de aba, fone desconectado e falha de áudio real.
- [ ] Avaliar legibilidade/contraste e identificação do locutor com pessoas que usam recursos de acessibilidade.
- [ ] Finalizar vozes ausentes e revisão de uniformidade artística; essas pendências não foram apagadas pelos testes.

Verificação local: 352/352 testes; campanhas completas: 20/20; CI: 445/445 no código `b3bbb8fe1161e2aa7fad03617ad249eb19ede08c`. A conferência posterior dos arquivos publicados fica registrada no [PR38](https://github.com/lamorimverso/lamorimsite/pull/38). Esta checklist preserva pendências explícitas; não é um certificado de jogo sem erros.
