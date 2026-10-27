# Corre, Flávio! — perseguição e vantagens

Continuação dos últimos pedidos do usuário na conversa “Melhorar site e minigame”. O código publicado em `5f6d7d2` ainda contém a frase no título, obstáculos genéricos e nenhum efeito temporário.

## Decisões

Evoluir os módulos Canvas existentes é a alteração de menor impacto. Migrar para uma biblioteca de jogos ou substituir o site exigiria reconstruir controles, música e contagem sem resolver uma necessidade nova. A implementação mantém HTML/CSS/ES modules e a rota Rio → Argentina → EUA com vitória em 75 segundos.

- Mover a frase “de perder o foro privilegiado e ficar desempregado!” do título para abaixo de “Contagem para o fim do mandato”. Manter a ressalva jurídica existente.
- Introduzir adversários em cinco faixas: PF (0 s), Xandão (15 s), Janones (30 s), “exército do Lula” (45 s) e Lula como chefe (60 s). Mostrar o nível atual e desenhar caricaturas originais identificadas na pista.
- Aumentar gradualmente a velocidade e reduzir o intervalo entre obstáculos, com limite mínimo de 1,1 s entre chegadas. Os adversários permanecem obstáculos saltáveis de chão.
- Coletar chocolate (+25), mansão (+50), recibo (+25) e passaporte (+50). São objetos simbólicos da sátira, sem acrescentar alegações factuais.
- Invisibilidade permite atravessar adversários por 6 segundos de corrida; pausa congela o efeito. Uma chance extra protege de uma colisão, com 1,2 s de recuperação para evitar perda imediata. Guardar no máximo uma chance e renovar, sem acumular, a invisibilidade.
- Distribuir invisibilidade e chance extra regularmente entre os itens de pontos. Mostrar os efeitos no placar e anunciar coleta/captura sem atualizar leitores de tela a cada frame.
- Colisão sem proteção mostra “Pego pela Polícia Federal!” e permite recomeçar. Explicitar que captura, personagens e roteiro pertencem à ficção do jogo.

## Preservação e validação

Não alterar datas, música, compartilhamento, outras páginas ou hospedagem. Manter teclado, toque, pausa automática e armazenamento defensivo. Reiniciar limpa todas as vantagens. Verificar colisões simultâneas, expiração e pausa dos efeitos, surgimento de adversários, retomada e layouts de 320/390/768/1440 px. Reverter pelo commit anterior se necessário.
