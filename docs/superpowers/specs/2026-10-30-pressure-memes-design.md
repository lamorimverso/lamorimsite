# Corrida com pressão, personagens e áudio contextual

Autorização: pedidos acumulados do usuário: faça todas as correções e continue; manter o site clean e usar áudios semelhantes aos de https://cadeflavio.run/. Continuidade confirmada no main b4293f5 (PR19). O checkout antigo foi preservado; esta revisão parte da versão publicada em worktree separado.

## Experiência
A corrida exige ler perigos altos e baixos, com pressão crescente por tempo e distância, chefes específicos e respiros entre encontros. Joice permanece visível durante dez segundos de perseguição, com cenário escuro avermelhado em transição suave, mais ondas e duas ações. Nada de flashes. Animação de pernas é informação essencial mesmo em reduzir efeitos. Dilma lança vento alto, Simone papéis altos, Soraya microfones altos; personagens correm no palco ao disparar. Zé Gotinha é aliado de recuperação: a coleta remove perigos comuns e abre 2,5s de respiro, sem eliminar chefes. Popcorn é obstáculo baixo.

## Contratos
- Preservar salto610/gravidade1750/buffer120ms, escudo físico6s, passaportes100=1vida, rota contínua5destinos/7km, primeiro chefe22km e seguintes após pelo menos7km de corrida depois da vitória, sem arma/playerattack, sem pausa/botõesPularAbaixar/barra de percurso.
- Pressão q=min(1,.55*distância/40000+.45*tempo/140). Velocidade250→435, intervalo comum1.70→1.12s, reação1.65→.95s; assistência .82 da velocidade.
- Perigos altos cobrem a região acima do slide e acima do pico do salto, com a mesma silhueta visual da colisão. Chefes9/10/12 ataques, +2 por volta até+4; padrões diferentes com repetições e rotação, aviso de próximo ataque coerente, reação1.15→.85s e intervalo1.32→1.04s.
- Joice: aviso1.2s, ativa10s, recuperação2s, recorrência24–36s; relógio continua durante chefes e encontro vencido fica pendente. Nenhuma sobreposição de chefe/Joice. Ondas .98→.90s com reação mínima.85s; preservar intervalo de contatos mínimo.82s e caminhos solucionáveis.
- Áudio: trilha original procedural contínua após gesto inicial, tensão por pressão/chefe/Joice, menor volume durante fala, interromper ao ocultar/derrota/mute. Clips reais curtos, crédito/contexto explícitos; sem atribuição falsa, sem fingir fala inédita. Vozes contextuais sem sobreposição, randomização limitada, silêncio14–22s e segurança antes de falas ambiente. A Joice tem prioridade. Reprodução bloqueada nunca interrompe jogo.
- Placar centralizado3colunas com rótulos acima dos valores e divisórias discretas; derrota/retry organizados, poucos textos. Ajuda/objetivos/fontes em detalhes fechados.

## Validação
Testes reproduzem contratos, políticas triviais devem falhar; piloto que lê a ação continua possível. Eventos não passam fome. Regressão de carregamento de todos atlas, pernas realmente diferentes, áudio real e versões/hashes. Capturas320/390/1440/844paisagem e análise de som com API do navegador. Testes automatizados não substituem playtest humano nem certificam diversão/Safari/aparelho físico.
