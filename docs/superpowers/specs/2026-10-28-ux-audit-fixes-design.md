# Refinamento aprovado da auditoria UX — Corre, Flávio!

O usuário aprovou a execução de todas as correções da auditoria em 28/10/2026. A implementação mantém o projeto existente e publica a atualização após testes e revisão. A auditoria é a referência de problemas; este documento fixa as decisões técnicas necessárias para executá-la.

## Requisitos preservados
- Manter os desenhos escolhidos, orientação do herói para a direita e proporções próprias dos personagens.
- Flávio somente corre, pula e abaixa. Não incluir armas, ataque do jogador, playlist, três links de navegação ou botão manual de pausa.
- Manter Compartilhar, a contagem até 01/02/2027 em Brasília, cinco destinos, 7.000 m de rota por cenário, metros totais, velocidade crescente, 100 passaportes por vida e Escudo das Américas por seis segundos.
- Xandão usa martelo e mandados; Haddad papéis; Lula gesto em L. Primeiro chefe continua por distância, após o trecho inicial. Evento de Joice/PF permanece temporário.
- Preservar a frase de derrota Foi pego pela Polícia Federal!; acrescentar uma dica curta de evasão.
- Alterar somente o jogo, seus testes, ferramentas e documentação; não tocar nos demais sites, bots ou serviços.

## Abordagem e decisões
A alternativa de reconstruir o site foi descartada pelo requisito de continuidade. Corrigir apenas os textos deixaria os defeitos de controle e equilíbrio. Será feito refinamento incremental da lógica, interface e recursos gráficos existentes, sem trocar a tecnologia.

### Lógica
`createRun(options={})` aceita `assisted` booleano, padrão false. A assistência reduz deslocamento e aproximação a 82% e não muda contabilidade nem alcance do salto. A dificuldade normal continua crescente e limitada.

`crouchRun` guarda `player.crouchHeld`; só muda a postura no chão. A intenção é reaplicada ao pousar e removida ao soltar/cancelar/perder foco. `bossAttackFor(type,fired)` exporta `{type,action}`, com `action` jump ou crouch: Xandão alterna martelo/mandado; os outros alternam alturas usando as armas existentes, começando alto. O mesmo método alimenta a dica visual e o projétil.

Perigos novos e suas coletas têm `speed` próprio, calculado para uma janela de aproximação consistente entre larguras. Para chefes, lançamento até contato de aproximadamente 1,35 a 1,00 s conforme a dificuldade; para inimigos comuns, primeira visibilidade até contato de aproximadamente 1,85 a 1,10 s. Assistência alonga as janelas proporcionalmente. Objetos manuais sem speed mantêm compatibilidade com a velocidade do mundo.

Coletas ligadas a ataques altos ficam em y=18, alcançáveis ao abaixar; as ligadas a salto continuam em y=100. Grupos continuam com três passaportes. Intervalo base de passaporte 5,2 s, crescendo até 6,4 s, além do alinhamento com obstáculos. Calibração inicial: piloto legal deve obter a primeira vida entre 150 e 330 s em sequências verificadas; não apresentar isso como resultado de humanos. Guardar `run.lastHit={type,action}` no impacto.

### Interface
Substituir as camadas CSS antigas por uma folha focada no estado atual. Manter coluna única e permitir largura de jogo até 900 px no desktop, com a contagem centralizada em até 540 px. Mostrar progresso compacto da etapa e diferenciar rota de metros totais nos encontros.

Adicionar dica breve antes de começar e um painel recolhido Como jogar e ajustes, junto ao jogo. Incluir modo de agachamento segurar/alternar, assistência opcional e redução de efeitos, disponíveis antes de iniciar; lembrar preferências locais com tolerância a armazenamento bloqueado. O som lembra a escolha e permanece opcional. Ampliar/recolher o jogo oferece mais espaço, sem pausar; Escape somente fecha a ampliação.

Avisos de chefão usam o mesmo action do motor. Mensagem de derrota preserva a frase pedida e explica o tipo de evasão. Preferências de movimento do sistema são respeitadas, com opção explícita de reduzir mais efeitos. Não prometer conformidade WCAG integral.

### Recursos e publicação
Converter atlas para WebP sem perdas e pré-calcular recortes a partir dos PNG originais. Manter originais como fontes, identidade visual e escalas. Carregamento de imagens tem limite de 15 s, ignora callbacks tardios e permite nova tentativa. Bootstrap independente cobre falha de importação/inicialização e oferece recarregar após 12 s.

Gerar versões dos recursos pelo hash SHA-256 do conteúdo, incluindo imports e referências no HTML; validar no CI. A limpeza elimina apenas recursos comprovadamente sem uso. Revisar colisões permissivas com testes e captura; não ampliar caixas automaticamente para cobrir todo o sprite.

## Validação
Testes de regressão de lógica, entrada, padrões, aproximação, coletas naturais, preferências e erros; navegador em 320/390/768/1440 px, retrato/paisagem e movimento reduzido; revisão independente; CI em branch antes de integrar; implantação GitHub Pages e conferência pública. Testes com pessoas e medições de campo ficam como limite explícito, pois não podem ser fabricados nesta execução.
