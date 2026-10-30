# Corre, Flávio! — revisão de jogabilidade e UX

30/10/2026. Base publicada: PR19 / b4293f5. Escopo: este site e este jogo; nenhum bot/outro site alterado.

## O que já funciona
A rota contínua em cinco destinos, controle de salto/slide sem armas, escudo físico, passaportes com vida extra, quadro de derrota algemado, transformação gradual da contagem e ajuda recolhida constituem uma base coerente. Preservados física610/1750, buffer120ms, proteção6s e gestos de dois dedos.

## Problemas e correções

| Evidência na base | Consequência | Correção |
|---|---|---|
| Perigos comuns e Joice sempre pedem salto. Só-salto cronometrado passa90/90ensaios300s. | Pouca decisão; surpresa vira repetição. | Altos/baixos, primeiras altas após10s, limite de repetição; Dilma/Simone/Soraya com fontes visíveis. |
| Chefes5/6/8 com alternância fixa. | Padrão decorável e confrontos curtos. | Padrões próprios,9/10/12ataques, rotação e aumento nas voltas; aviso ligado ao ataque real. |
| Só1–2Joices em1800s, espera vencida até1494s. | Evento praticamente desaparece. | Relógio continua durante chefe; pedido vencido tem prioridade, sem sobreposição. |
| A primeira implementação de altas permitia saltar por cima. | Mudança de ação ainda dispensável. | Colunas altas visíveis cobrem até120px (chefe132px), com48px livres para o slide, acima do pico; slide passa por baixo. Regressão com salto otimizado. |
| Metas maiores com marcos fixos acumulavam chefes. | Quase só eventos no fim de uma corrida longa. | Cada vitória abre pelo menos7km de corrida; primeiro22km, ordem preservada. Próximas distâncias deixam de ser fixas29/36km. |
| Vários perseguidores usavam um só desenho de corrida. | Balanço do corpo não comunica passada. | Oito personagens com4poses novas de pernas e pivôs/escala estáveis; PNGs antigos preservados. |
| Som concentrado nas coletas. | Pouca continuidade e tensão. | Trilha original contínua e dinâmica, efeitos alto/baixo e9memes curtos da referência; silêncio e prioridade. |
| Joice desaparecia pouco após o aviso. | Personagem e efeito pareciam não agir. | Permanece10s, cenário escuro avermelhado e ondas mistas mais rápidas;2s de recuperação. |
| Rotação de900→480 mantinha a velocidade de perigos antigos; janela visível caía a0,417s. | Dificuldade inesperada ao virar/recolher. | Reenquadrar ondas futuras mantendo prazos, voo e coletas; contatos já iniciados ficam intactos. |
| Rótulos e valores espalhados. | Leitura e simetria fracas. | Três colunas centralizadas de até540px, rótulos acima, divisórias discretas; detalhes/fontes recolhidos. |

## Propósito dos elementos

| Elemento | Papel mecânico |
|---|---|
| Flávio | Correr, saltar e abaixar; sem ataques. |
| PF, Janones, Exército, barreiras e malas | Perigos baixos, pedem salto. |
| Dilma | Lança coluna de vento alta. |
| Simone Tebet | Lança parede de papéis alta. |
| Soraya Thronicke | Lança microfones altos. |
| Zé Gotinha | Recolhido, limpa perigos comuns e abre2,5s de respiro; não elimina chefes. |
| Popcorn | Balde baixo para saltar. |
| Haddad, Lula, Xandão | Sequências distintas de esquiva; maior duração exige mais que um escudo. |
| Joice | Pico temporário de10s com PF baixa/microfones altos e atmosfera própria. |
| Passaportes / escudo |100=+1vida / proteção6s. |
| Vozes / trilha | Feedback de largada, coletas, marcos, vitória e ameaça; não geram dano invisível. |

## Pesquisa aplicada

- [Valve — AI Systems of Left4Dead,2009](https://cdn.fastly.steamstatic.com/apps/valve/2009/ai_systems_of_l4d_mike_booth.pdf): ritmo com construção de tensão e alívio, variação de encontros.
- [Maddy Thorson — Celeste & Forgiveness](https://www.maddymakesgames.com/articles/celeste_and_forgiveness/index.html): preservar tolerância e intenção dos comandos. Buffer existente mantido.
- [Riot — Clarity in League](https://www.leagueoflegends.com/en-us/news/dev/clarity-in-league/): hierarquia de ameaças, silhuetas legíveis, pouco ruído visual/sonoro. Atmosfera atrás dos atores; instruções fora da pista; fala ambiente só em janela segura.
- [Referência de áudio indicada pelo usuário](https://cadeflavio.run/): arquivos curtos de memes, reproduzidos contextualmente. Não foi copiada a interface ou a lógica desse jogo. [Créditos e contexto](../tanahoraflavio/assets/audio/README.md).

Os valores de velocidade/intervalos são decisões calibradas para este motor, não recomendações numéricas universais das pesquisas. Pressão q=min(1,.55*d/40000+.45*t/140); velocidade250→435, reação comum1,65→0,95s; chefe1,15→0,85s; contatos separados por pelo menos0,82s. Assistência preservada.

## Evidência de validação

- Piloto de duas ações com comandos reais, sem teleporte/imunidade:90/90corridas600s, zero impactos,234–249passaportes,11–13chefes e12–14Joices. Prova caminhos executáveis e economia alcançável.
- Piloto só-salto0,26s antes do contato:0/90corridas sobrevivem300s; perdas entre16,958–22,567s por altas. Piloto adaptativo só-salto:0/30.
- Calendário instrumentado com proteção infinita para isolar agendamento:40–42Joices/1800s contra1–2na base. Não é prova de sobrevivência legal.
-12ensaios de contatos em larguras480/612/900: menor separação observada0,900s e aproximação0,850s;9–11ondas porJoice completa. Casos sintéticos no limite0,82s executáveis.
- Atlas: fontesPNG preservadas; WebP mantém todo alfa e RGB visível;4poses por personagem; carregamento atômico e retry com4folhas.
- Áudio: hashes/durações, decodificação dos nove arquivos e sinal musical real no navegador; mute e perda de foco silenciam. Sem audição humana nesta sessão.
- Suíte final local:212/212aprovados,0falhas/cancelamentos/ignorados. Inclui teclado/toque, contagem, cenários, derrota, modo expandido, som real e resize. CI/publicação registrados no PR de lançamento.

## Limites e próximos critérios humanos

Não houve playtest humano, validação em aparelho físico ou Safari. Solucionabilidade automática não comprova diversão, reconhecimento perfeito das caricaturas ou dificuldade ideal para todos. Calibrar após observar mortes, compreensão dos avisos e leitura de perigos com jogadores reais. O conjunto de memes é finito; “faz-o-l” ficou fora por orador não identificado, e não foi localizado áudio confiável de popcorn. Os trechos são arquivos reais/edições de memes, sem novas falas atribuídas às pessoas. Nenhuma licença livre/comercial foi confirmada para os nove arquivos da referência.

## Revisão independente e decisões

Uma revisão independente de toda a branch encontrou um problema importante: janela de reação ao redimensionar a pista com ameaças em voo. Corrigido com regressão de resize real900→480 normal/assistido, preservação de trajetória/coletas nos dois sentidos e piloto legal com rotações repetidas. A correção mantém os prazos das ondas futuras e não reposiciona perigos cujo contato já começou. Nenhum Critical ou Minor adicional confirmado.

Decisão de7km após cada vitória: chefes longos tornavam os antigos marcos uma fila quase contínua. Preservados primeiro22km e ordem; o custo é variar o quilômetro dos seguintes. Diversão/reconhecimento/qualidade perceptiva do som ficam pendentes de jogadores/escuta humana; medir fisicamente e ouvir pode exigir nova calibração. Aparelhos físicos/Safari também permanecem sem validação. Créditos/contextos e ressalvas não constituem licença comercial nem perícia acústica. Publicação/CI/bytes serão conferidos como etapa de lançamento; não foram inferidos da revisão local.
