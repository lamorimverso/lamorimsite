# Corre, Flávio! — pacote do dossiê de jogabilidade

Data:6/11/2026. Base anterior: `ec75721c7620342554da16f3535204f1a8181e0d`. Escopo: este jogo/site, seus testes e ferramentas de arte; outros sites, bots e n8n preservados. O documento original do dossiê está em [design-raid-elenco-politico-2026-10-30.md](design-raid-elenco-politico-2026-10-30.md). Foram recuperados também os pedidos posteriores de imprevisibilidade, áudio de arquivo sem narração artificial, correção do jacaré, cenários e interface limpa. A íntegra da transcrição não foi disponibilizada.

“AAA” orienta o acabamento e a verificação. Não é certificação, equivalência demonstrada com um jogo comercial nem resultado de playtest humano.

## Entrega funcional

| Pedido | Comportamento entregue | Evidência |
|---|---|---|
| Andar para frente/trás | A/D,←/→ e gesto lateral mantido; corredor70–280, movimento independente da quilometragem; soltar/cancelar/foco limpa intenções | dossier-movement, ux-site |
| Não estragar salto/abaixar | Física610/1750 e buffer120ms; dois dedos; agachar ao pousar; proteção contra click de toque duplicado | ux-core, journey-layout, ux-site |
| Quedas do alto | Alvo fixo no chão, aviso≥1,2s, descida0,4s; no centro há fuga para ambos os lados; borda exige retornar ao corredor | dossier-movement, dossier-campaign |
| Imprevisibilidade com justiça | Frente, retaguarda, rolantes, diagonal e queda vertical; variação por semente; manter reação e travessia saltável, inclusive no resize | attack-directions, pressure-core, pilotos legais |
| Novos chefes | Haddad→Lula→Xandão→Janones→PF. Metas-base9/10/12/9/8. Janones divide mensagens em3blocos; PF combina bloqueios e quedas. Crescimento após ciclo de5 | campaign, dossier-campaign |
| Chefes tardios | Primeiro22km, pelo menos7km após vitória; aguardar Joice/transição, sem fila contínua de encontros | campaign |
| Zé Gotinha/jacaré | Forma baixa quadrúpede com4passadas, sem salto; primeiro↑/toque restaura, segundo salta; respiro2,5s e graças preservadas | jacare-taxad, dossier-art, pilotos |
| Taxaad, Simone, Soraya e Janones | Carimbos/recibos fiscais; adesivo cenográfico; referência à quermesse; mensagensURGENTE e Exército na corrida. Falas só dos oradores catalogados | runner-character-pressure, arte e inspeção |
| Boulos/Dino | Encontráveis com imagens próprias, sem usar rosto daPF | pools do motor, dossier-art |
| Todos os apoios com função |15apoios fictícios com identidade, duração e efeito; aparecem espaçados, sem arma do jogador ou invulnerabilidade empilhada | dossier-allies |
| Personagens animados |5atlas novos com80quadros:15aliados, jacaré, Boulos, Dino, Janones ePF; quatro poses por linha, transparência, pivôs eWebP lossless | dossier-art, art-loading, build-runner-art--check |
| Cenários e transição | Planos contínuos, bordas suaves, marcos, profundidade do chão e detalhes discretos fora da zona de perigo; redução de decoração sem congelar a viagem | journey-scenery, journey-layout |
| Interface limpa | Retrato extra daJoice removido; carregamento comum no botão/leitura assistiva; ajuda recolhida, expansão, contagem grande/compacta e derrota algemada | UX/browser e inspeção da prévia |
| Começar sem esperar todos os extras |4folhas originais liberam a largada;5novas(4.790.118bytesWebP) carregam depois. Erro opcional conserva corrida e ofereceCarregar apoios na ajuda; ninguém vira perigo invisível | art-loading, dossier-allies, ux-site |
| Áudio organizado | Uma fala por vez; Joice em loop idempotente; alerta mantém volume e abaixa voz/música temporariamente; mute/foco/derrota param; retomada correta | dossier-audio, pressure-audio-browser |
| Memes estratégicos |9memes da referência+Joice/Haddad, com vínculo de orador, cooldown e janela segura. Passarinho e Defende meu pai entram apenas como gravações deLula | runner-character-pressure, dados de voz e decodificação |
| Música8bits | Arranjo instrumental já publicado preservado; sem canto, sem voz sintética, sem mudar seu andamento | funk-soundtrack e renderizaçãoOfflineAudioContext |
| Economia e proteção |100passaportes=vida, escudo6s, metros sem pontos artificiais; aliados não substituem proteção;4cenários seguintes continuam em7km | runner-updates, balance, ux-core |

## Aliados

São papéis de sátira, não afirmações sobre relações reais.

| Apoio | Função |
|---|---|
| Vorcaro | Atrai só passaportes próximos por3s; cooldown24s |
| Jair | Indicação temporária de rota |
| Michelle | Destaca a ameaça imediata |
| Eduardo | Mostra a próxima janela da perseguição deJoice |
| Carlos | Indica ações das próximas ameaças já programadas |
| Renan | Destaca passaporte próximo |
| Silas | Incentivo visual/sonoro, sem escudo físico |
| Magno | Antecipa a próxima ação, inclusive do chefe |
| Nikolas | Reduz suavemente decoração, preservando movimento e alertas |
| Tarcísio | Indica próximo destino |
| Damares | Amplia o aviso de queda enquanto ativa |
| Bia | Meta opcional de3coletas; completada, ímã por1,5s; nenhum passaporte artificial |
| Trump | NaFlórida/Casa Branca, alonga telegráfico por5s |
| Milei | NaArgentina, remove um obstáculo cenográfico, sem atingir pessoas/chefes |
| Figurante genérico | Destaca coleta; nenhuma fala real lhe é atribuída |

## Decisões técnicas e seus custos

- ManterCanvas preserva os comandos, o site e as regressões. O acabamento perceptivo ainda precisa ser avaliado por jogadores.
- A travessia mínima180 e o aviso visível mantêm o salto possível ao avançar/reduzir a pista. Em resize, uma ameaça pode aguardar antes de continuar o voo para preservar o prazo; a posição daquele instante não salta.
- Queda mira a posição real comprometida. Não há saída para fora da arena; nas bordas a alternativa é retornar. Isso impede uma posição fixa eliminar todas as quedas.
- A ediçãoD-v2 deixa o jacaré baixo e quadrúpede. Houve variação pequena em personagens novos do rascunhoD-v1; nenhum desenho anterior publicado foi substituído por outro rosto.
- A nova arte carrega em segundo plano. Quando extras falham, a corrida base continua com seus personagens originais e os apoios novos aguardam o retry.

## Limites explícitos

- Não houve playtest com6–8pessoas, aparelhos físicos, Safari, audição humana comparativa ou comprovação de diversão/qualidadeAAA.
- Não se inventou áudio para cada figura. A rodada extra não produziu novos trechos revisados deDilma, Simone, Soraya ouMoraes. Um candidatoEBC deTebet foi isolado para conferência, fora do jogo; autorização comercial não foi presumida. Estes personagens usam efeitos/legendas próprios quando não existe gravação integrada.
- Janones tem atribuição contextual e as ressalvas do catálogo de arquivo; não há perícia de identidade acústica. Lula imitandoEduardo continua identificado comoLula.
- O elenco secundário rotulado “opcional/estudo” no dossiê não é anunciado como implementado.
- Vacinas não transformam pessoas em jacarés. O antídoto é um objeto imaginário da sátira; a ajuda preserva o contexto daOMS, sem instrução de uso de medicamento.

## Validação e versão

Em 6/11/2026, a suíte completa passou: **264 testes, 264 aprovados, nenhuma falha, cancelamento ou omissão**, em 68,0 segundos no Chromium 141 headless. Inclui execução real de controles, Canvas e áudio; não equivale a teste em aparelhos físicos.

Versões de importação e arte lossless foram verificadas. A revisão independente e os dados de publicação serão acrescentados após sua conclusão.

Rollback de conteúdo: commit-base `ec75721c7620342554da16f3535204f1a8181e0d`, sem reverter outros projetos. Nenhuma alteração deDNS, VPS ou credenciais foi feita.
