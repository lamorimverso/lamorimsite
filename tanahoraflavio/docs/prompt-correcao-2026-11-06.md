# PROMPT MESTRE — CORRE, FLÁVIO!
## Auditoria, correções, expansão de jogabilidade e acabamento avançado

### 1. OBJETIVO E REGRAS OBRIGATÓRIAS

Atue como engenheiro sênior de jogos, programador JavaScript, especialista em Canvas 2D, física de jogos, animação, áudio interativo, arquitetura de software, game design e testes automatizados.

**Projeto:** Corre, Flávio!  
**Repositório:** `lamorimverso/lamorimsite`  
**Branch de destino:** `main`  
**Diretório autorizado:** `tanahoraflavio/`  
**Site:** https://lamorimverso.github.io/lamorimsite/tanahoraflavio/

Referências obrigatórias:

- `docs/design-raid-elenco-politico-2026-10-30.md`
- `docs/pack-atualizacao-2026-11-06.md`
- PR #28 e alterações posteriores da `main`.
- Código-fonte, sprites, catálogos de áudio, testes e documentação já existentes.

**Regra fundamental: corrigir e melhorar sem prejudicar funcionalidades que já funcionam.**

Não modificar outros sites, bots, n8n, VPS, DNS, credenciais, projetos ou serviços.

Não reconstruir o jogo do zero, substituir seu motor sem justificativa técnica ou apagar funcionalidades existentes.

Antes de modificar, comparar os requisitos com o código atual. Identificar o que já foi implementado, o que está incompleto, os bugs reais e as melhorias necessárias.

Executar mudanças incrementais, reversíveis e cobertas por testes.

### 2. MOVIMENTAÇÃO LIVRE DO FLÁVIO — PRIORIDADE CRÍTICA

**Problema:** Flávio possui um espaço de movimentação horizontal muito curto, impedindo que o jogador aproveite toda a área do jogo.

**Correção obrigatória:**

1. Eliminar limites horizontais artificiais do corredor atualmente utilizado.
2. Permitir que Flávio percorra praticamente toda a largura útil e visível da arena, da extremidade esquerda à direita.
3. Manter somente os limites físicos necessários para impedir que o sprite saia da tela.
4. Calcular os limites dinamicamente considerando largura do Canvas, hitbox e tamanho do personagem.
5. Adaptar corretamente a movimentação para desktop, celulares e tablets.
6. Manter movimento contínuo e suave, sem teletransporte ou travamentos.
7. Preservar a corrida automática e a contagem de quilômetros quando Flávio se deslocar lateralmente.
8. Garantir compatibilidade com pular, abaixar, colisões, coleta de itens e animações.
9. Fazer com que inimigos e obstáculos reconheçam a posição horizontal real do protagonista.
10. Preservar posição proporcional quando a janela for redimensionada ou o aparelho mudar de orientação.

**Controles:**

- `A` / `←`: movimentar para a esquerda.
- `D` / `→`: movimentar para a direita.
- `Espaço` / `↑`: pular.
- `↓` / `S`: abaixar.
- Deslizamentos equivalentes no celular, com suporte a multitoque.

O personagem não pode ficar artificialmente preso em uma área estreita enquanto existe espaço disponível.

Não permitir atravessar limites invisíveis, passar por cima de obstáculos sem colisão ou escapar indefinidamente dos perigos ficando parado nas bordas.

### 3. OBSTÁCULOS E BUEIROS IMPREVISÍVEIS

Corrigir a previsibilidade dos obstáculos, incluindo bueiros e outros perigos presentes ou previstos no jogo.

Implementar um gerador de ameaças com aleatoriedade controlada.

**Comportamento obrigatório:**

- Variar localização, direção, intervalos e combinações.
- Evitar ciclos fixos que permitam decorar todas as ameaças.
- Incluir aproximações pela frente, retaguarda, diagonais e objetos em queda.
- Fazer os perigos interagirem com toda a nova largura da arena.
- Criar variações progressivas conforme a distância percorrida.
- Evitar excesso de obstáculos simultâneos.
- Não gerar perigos inevitáveis, colisões instantâneas ou armadilhas impossíveis.
- Sinalizar previamente bueiros e pontos de impacto, sem revelar toda a sequência futura.
- Impedir que um obstáculo nasça dentro da hitbox do personagem.
- Impedir combinações que bloqueiem todas as rotas de fuga.

A imprevisibilidade deve vir das combinações e decisões exigidas, não de injustiças contra o jogador.

Utilizar sementes reproduzíveis para testar os padrões aleatórios. Verificar milhares de sequências e confirmar que existem oportunidades reais de esquiva.

### 4. NOVA MECÂNICA DO JACARÉ — PRIORIDADE CRÍTICA

**Problema:** a transformação em jacaré é muito simples e termina rapidamente.

Substituir a recuperação com um único comando por um verdadeiro minigame.

**Mecânica obrigatória:**

1. Quando Flávio encontrar Zé Gotinha, iniciar a transformação cartunesca em jacaré.
2. Manter a aparência quadrúpede, animações de patas e movimentação apropriada.
3. Durante a transformação, o jacaré não executa o salto normal de Flávio.
4. Exigir **cinco pressionamentos distintos da seta para cima** para completar a recuperação.
5. No celular, utilizar cinco gestos ou toques válidos equivalentes.
6. Manter contador interno de progresso de `0/5` até `5/5`.
7. Não contabilizar uma tecla mantida pressionada como vários comandos.
8. Ignorar repetições automáticas do teclado.
9. Não perder o progresso acidentalmente ao alternar entre teclado e toque.
10. Após o quinto comando válido, executar a animação de retorno para Flávio.

**Desafio adicional:**

Enquanto o jogador tenta recuperar a forma humana, deve desviar dos obstáculos associados ao evento, incluindo os itens mencionados anteriormente como itens de caneca, após confirmar sua identificação no jogo.

Criar uma sequência de perigos visualmente reconhecíveis, com janelas reais de reação, espaço para escapar e dificuldade progressiva.

O personagem precisa conseguir executar os cinco comandos sem sofrer uma colisão inevitável. Ajustar o período de proteção inicial, atualmente documentado em 2,5 segundos, à duração efetiva da nova mecânica.

**Interface:** utilizar feedback visual discreto, como cinco indicadores de progresso. Não criar legendas narrativas grandes.

Preservar a cloroquina fictícia de videogame como elemento de sátira, sem apresentar o item como informação médica verdadeira.

Testar transformação, cinco comandos, colisões, interrupção, retorno ao normal e reentrada no evento.

### 5. SISTEMA MUSICAL — TRÊS TRILHAS 8-BIT ALEATÓRIAS

Integrar e organizar três trilhas instrumentais de fundo:

1. A trilha instrumental 8-bit anterior, atualmente associada a `Solinho do Fora PT`.
2. Uma versão instrumental 8-bit de **Tan na Hora do Jair**.
3. Uma versão instrumental 8-bit de **Tariflávio**.

Verificar os nomes e as referências musicais corretas no histórico e nos arquivos disponíveis. Não inventar melodias nem afirmar que já existem arquivos não encontrados.

Usar gravações ou arranjos com direitos de utilização adequados; quando necessário, criar músicas originais autorizadas em vez de reproduzir composições protegidas sem licença.

**Sistema de reprodução:**

- Seleção aleatória das três trilhas.
- Evitar repetir sempre a mesma.
- Preferir sorteio sem repetição até completar a sequência de três opções.
- Preservar a continuidade sonora durante a corrida.
- Não reiniciar a música por renderização, colisão ou atualização de estado.
- Implementar transições de volume suaves.
- Reduzir temporariamente o volume durante falas e alertas importantes.
- Preservar o controle de ativar/desativar som.
- Evitar reprodução simultânea de trilhas.
- Respeitar as restrições dos navegadores quanto à reprodução automática.

**Proibição:** não mostrar na tela o nome das músicas, título da faixa selecionada ou avisos de mudança de trilha.

### 6. ÁUDIO COMPLETO DO MEME “TOC, TOC”

**Problema:** o áudio da Joice foi anteriormente documentado como um recorte curto. O usuário quer o trecho completo do meme.

**Exigência:**

Utilizar a sequência integral pretendida, começando em “toc, toc” e terminando na parte “É a Polícia Federal”.

Não cortar a frase final e não substituí-la por voz sintetizada.

Antes da integração:

- Conferir o arquivo original e a gravação de referência.
- Verificar a duração real do trecho completo.
- Confirmar a atribuição e o contexto do áudio.
- Verificar autorização de uso e preservar créditos.
- Garantir que a reprodução não seja encerrada prematuramente por timers ou transições de estado.

**Integração com a perseguição de Joice:**

Ajustar a duração da sequência ou a programação da fala para que o trecho possa terminar de maneira natural durante o evento.

Não empilhar múltiplas instâncias do áudio.

Ao perder a partida, desativar som ou abandonar o evento, aplicar a regra correta de parada.

A prioridade deve ser:

**Alertas importantes > falas dos personagens > música de fundo.**

Preservar também os memes de arquivo já associados a Lula, Janones, Haddad e aos demais personagens com fontes verificadas.

Não utilizar um áudio de uma pessoa como se fosse fala de outra.

### 7. CORRIGIR TODOS OS NOMES DOS PERSONAGENS

Revisar o elenco completo e comparar a identidade de cada personagem com o dossiê e as instruções posteriores do usuário.

**Correção específica obrigatória:**

**Simone Tebet é a personagem associada ao meme “Gostosas do Lula”.**

Não confundir com outra personagem, não atribuir a frase como fala autêntica de Simone e não continuar utilizando um rótulo divergente quando houver instrução expressa posterior.

Revisar também:

- Flávio — protagonista.
- Jair — participação e referência musical.
- Taxad — Fernando Haddad.
- Xandão — Alexandre de Moraes.
- Lula — ataques com gesto em L.
- Janones — mensagens URGENTE e Exército do Lula.
- Joice — evento especial da Polícia Federal.
- Simone Tebet — referência “Gostosas do Lula”.
- Soraya Thronicke — referência ao padre de festa junina.
- Dilma — perigos e animações próprias.
- Zé Gotinha — transformação em jacaré.
- PF — equipe fictícia de perseguição.
- Boulos e Dino — aparições e imagens próprias.

Auditar o catálogo completo dos 15 apoios já definidos: Vorcaro, Jair, Michelle, Eduardo, Carlos, Renan, Silas, Magno, Nikolas, Tarcísio, Damares, Bia, Trump, Milei e figurante genérico.

Não mudar nomes ou identidades sem evidências.

### 8. REMOVER LEGENDAS DESNECESSÁRIAS

Limpar a interface do jogo.

**Remover textos visíveis que anunciem:**

- Nomes de músicas.
- Mudanças de faixas.
- Mudanças de cenário.
- Ações engraçadas ou constrangedoras dos personagens.
- Descrições narrativas redundantes.
- Textos que expliquem o meme antes de ele acontecer.
- Legendas decorativas que ocupem a área da corrida.

Preservar apenas informações realmente importantes para jogar:

- Distância em metros.
- Vidas e passaportes.
- Estado essencial de proteção.
- Avisos visuais mínimos de perigo.
- Progresso funcional do jacaré.
- Objetivos necessários para vencer um chefão.

Não substituir legendas grandes por outras legendas grandes.

Preservar a acessibilidade com rótulos técnicos e descrições disponíveis para tecnologias assistivas, sem poluir o Canvas.

### 9. CHEFÕES MAIS COMPLEXOS E IMPREVISÍVEIS

Preservar e aprimorar os cinco encontros existentes:

**Haddad / Taxad:** papéis, recibos e carimbos fiscais fictícios, com diferentes alturas, ritmos e sequências.

**Lula:** mão em L e combinações de ataques com alternância de direção e altura.

**Xandão:** martelo e mandados, com ataques sucessivos e padrões que exigem diferentes esquivas.

**Janones:** mensagens URGENTE e três blocos de pressão, com intervalos, direções e desafios diferentes.

**Polícia Federal:** perseguição fictícia com bloqueios, perigos descendentes e necessidade de reposicionamento pela arena.

Cada chefão deve ter uma identidade visual, mecânica e sonora própria.

Preservar o sistema de metas por evasão. Flávio continua fugindo e desviando, sem ganhar armas ou comandos ofensivos.

Manter a progressão já prevista: primeiro chefão após aproximadamente 22 km, intervalos de corrida entre confrontos e aumento gradual da dificuldade.

Evitar confrontos repetitivos, padrões óbvios e ataques impossíveis.

### 10. PERSONAGENS, ALIADOS E ANIMAÇÕES

Preservar o pacote já integrado de 15 aliados e 80 poses adicionais.

Auditar se todos os personagens realmente possuem função dentro da jogabilidade, não apenas uma imagem decorativa.

Verificar:

- Animações de corrida, agachamento e salto.
- Deslocamento lateral.
- Mudança de direção e orientação.
- Contato com o chão.
- Animações do jacaré.
- Estados de dano e derrota.
- Ativação e término de bônus.
- Carregamento assíncrono dos sprites.
- Recuperação em caso de falha de carregamento.

Evitar personagens deslizando sem animar, aparecendo com o rosto errado ou entrando fora da área visível.

Não acrescentar grandes quantidades de itens, passaportes ou aliados de uma só vez.

Preservar o equilíbrio dos bônus e a regra de 100 passaportes para uma vida, bem como o Escudo das Américas de seis segundos.

### 11. CENÁRIOS E TRANSIÇÕES MAIS ELABORADOS

Preservar os cinco ambientes já definidos:

1. Brasília.
2. Rio de Janeiro.
3. Argentina.
4. Flórida.
5. Casa Branca.

Manter cenários extensos, com a referência anterior de 7 km por etapa.

Melhorar profundidade, paralaxe, ambientação, iluminação, movimento de elementos do fundo e transições suaves.

As mudanças de cenário devem acontecer visualmente, sem interromper a corrida e sem legendas explicativas.

Melhorar a aparência das transições para que não pareçam apenas uma troca repentina de imagem.

Manter o fundo legível, evitando que monumentos ou objetos decorativos escondam perigos reais.

Não introduzir efeitos pesados que causem travamentos em celulares.

### 12. FÍSICA, CONTROLES E COLISÕES

Auditar os módulos existentes, principalmente o motor de física e o controle de entradas.

Conferir:

- Salto e pouso.
- Agachamento solicitado ainda no ar.
- Agachamento mantido depois do pouso enquanto o botão estiver pressionado.
- Liberação correta quando o botão for solto.
- Salto utilizando dois dedos no celular.
- Detecção de gestos verticais e horizontais.
- Cancelamento de toque.
- Mudança de foco.
- Redimensionamento e mudança de orientação.
- Colisões laterais com hitboxes adequadas.
- Colisões com objetos que caem do alto.
- Proteção contra duplo acionamento por evento de toque e clique.
- Limpeza de estados ao morrer ou reiniciar.

A movimentação precisa responder imediatamente, sem depender da taxa de quadros.

Não introduzir salto duplo, ataques do protagonista ou pausa manual.

Preservar a suspensão automática segura quando a página perder visibilidade.

### 13. DESEMPENHO E QUALIDADE

Melhorar o acabamento com padrões profissionais, mas sem declarar que o jogo se tornou AAA apenas por passar em testes.

Prioridades técnicas:

- Reduzir operações desnecessárias por quadro.
- Evitar criar arrays e objetos excessivos no loop principal.
- Evitar vazamentos de memória e listeners duplicados.
- Evitar temporizadores que sobrevivam ao encerramento da partida.
- Reutilizar recursos gráficos quando possível.
- Manter sincronismo de física e animação.
- Preservar carregamento gradual dos sprites.
- Impedir travamentos quando algum áudio ou imagem falhar.
- Corrigir erros silenciosos e promessas rejeitadas.
- Verificar desempenho em dispositivos modestos.

Evitar dependências novas sem necessidade comprovada.

### 14. TESTES AUTOMATIZADOS OBRIGATÓRIOS

Antes de publicar, criar ou atualizar testes que comprovem:

**Movimento:** Flávio alcança toda a largura útil do Canvas, sem sair da tela nem ficar preso em corredor curto.

**Obstáculos:** padrões imprevisíveis, porém vencíveis; distribuição válida e ausência de colisão inevitável.

**Jacaré:** cinco comandos independentes, proteção contra repetição automática, progresso correto e retorno somente após concluir.

**Áudio:** três trilhas selecionadas aleatoriamente, sem sobreposição; trecho completo de “toc, toc” com término correto.

**Interface:** inexistência das legendas proibidas e preservação dos elementos essenciais.

**Personagens:** nomes e identidades corretos, especialmente Simone e “Gostosas do Lula”.

**Chefões:** todas as cinco sequências funcionam, variam os padrões e permitem esquiva.

**Regressão:** passaportes, escudo, vidas, Joice, controles, cenários, carregamento, vitória, derrota, compartilhamento e reinício continuam funcionando.

Testar desktop e layouts móveis, incluindo dimensões representativas de 390 × 844 e 1440 × 900, paisagem, retrato e variações de zoom.

Executar a suíte completa existente, sem desabilitar testes que falharem. Quando possível, realizar testes reais em navegadores e dispositivos físicos, inclusive Safari.

### 15. PLANO DE IMPLEMENTAÇÃO E PUBLICAÇÃO

Trabalhar nesta ordem:

**Fase 1 — Diagnóstico:** identificar os módulos e versões atuais, comparar com os documentos e reproduzir os problemas.

**Fase 2 — Correção crítica:** ampliar movimentação horizontal, adaptar colisões, corrigir controles e melhorar o gerador de obstáculos.

**Fase 3 — Jacaré:** implementar cinco comandos, perigos específicos e animações de recuperação.

**Fase 4 — Áudio:** integrar trilhas autorizadas, seleção aleatória e recorte completo da Joice, sem quebrar a mixagem.

**Fase 5 — Identidade e interface:** corrigir nomes, associações de personagens e eliminar legendas desnecessárias.

**Fase 6 — Game design:** aprimorar chefões, dificuldade, cenários, transições e acabamento.

**Fase 7 — Validação:** executar testes novos e regressivos, revisar bugs, efeitos colaterais, desempenho e responsividade.

**Fase 8 — Publicação:** integrar somente os arquivos autorizados na `main`, após validação e com ponto de rollback identificado. Verificar a versão realmente publicada no GitHub Pages, não apenas a compilação local.

### 16. RESULTADO EXIGIDO

Entregar um relatório final contendo:

1. Problemas encontrados e suas causas.
2. Correções aplicadas, com arquivos e commits.
3. Novas funcionalidades implementadas.
4. Funcionalidades anteriores preservadas.
5. Testes executados e resultados reais.
6. Limitações, pendências e riscos restantes.
7. Commit de rollback.
8. Confirmação de que o site público corresponde ao código validado.

Não declarar como concluída uma funcionalidade que ainda esteja incompleta.

Não confundir testes automatizados aprovados com experiência perfeita de jogabilidade.

**OBJETIVO FINAL:**

Transformar Corre, Flávio! em um jogo de corrida satírico com movimentação livre por toda a arena visível, obstáculos imprevisíveis e justos, chefões variados, minigame elaborado do jacaré, três trilhas 8-bit aleatórias, meme “toc, toc” completo, personagens corretamente identificados, interface limpa, animações fluidas e transições de alta qualidade.

Tudo isso **sem destruir, simplificar indevidamente ou prejudicar o que já funciona**, e sem modificar outros projetos.
