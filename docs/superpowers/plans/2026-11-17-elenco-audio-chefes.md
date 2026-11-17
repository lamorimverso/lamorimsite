# Elenco, áudio e chefes — plano de implementação

> Para quem implementa: executar por fase, com teste de regressão antes do patch e validação da integração antes de avançar. Base verificada `f1b3131` (PR #59).

**Objetivo.** Dar aos personagens novos o acabamento visual e sonoro do elenco de referência e equilibrar as decisões dos chefes ao longo da História.

**Arquitetura.** Estender a arte original em Canvas e os bancos Web Audio locais. Separar a apresentação da geometria física. Usar padrões autorais dos encontros para ajustar cadência, sem mudar a ordem da rota.

**Especificação.** Super-prompt de jogabilidade e [mapa de ritmo e fichas da revisão anterior](../../../tanahoraflavio/docs/ritmo-campanha-2026-11-17.md).

## Limites e casos de revisão

- Preservar os 17 encontros obrigatórios e os 5 opcionais, a travessia sem tiros de Fiscal/Povo, a conclusão da História e a separação entre Jones e Janones. Não restaurar chefe removido.
- Não alterar dano, jacaré, trajeto aéreo, controles, preferências, site fora do minigame nem produção. Nenhuma gravação sem atribuição. Avisos visuais permanecem mesmo sem áudio.
- Verificar em largura compacta e ampla, movimento reduzido, um personagem em preparação/soltura/recuperação, som desativado, transição sem áudio pendente e reflexão durante abertura.

## Fase 1 — auditoria

- [x] Rastrear o caminho de arte, atlas, retrato e pose para o elenco da campanha.
- [x] Localizar os atores sem entrada ou banco de áudio de lançamento.
- [x] Medir as primeiras decisões, latência de contra-ataque e recuperação dos encontros por fase na base.

## Fase 2 — arte, movimento e áudio

- [x] Testar a diferenciação de silhueta e poses sem cor e os extremos de posição. Refazer os dez chefes vetoriais — Ana Elisa, Rick, Guilherme, Erika, Fiscal, Renato, Jones, Maestro, Sofia e Capitã — e dar gestos próprios à multidão do Povo.
- [x] Testar e adicionar onze identidades sonoras originais não vocais. Separar entrada, impacto do lançamento e avisos de travessia conforme o papel. Manter ganhos e prioridade dos eventos, sem voz falsa ou camada duplicada.
- [x] Validar localmente as poses e a lógica de áudio. Incluir em CI as verificações de Canvas, Web Audio nativo e travessia em Chrome. O resultado do CI é registrado no PR.

## Fase 3 — chefes por fase e integração

- [x] Criar regressões para aberturas e os contra-ataques cujo teste comparativo apontar problemas. Distribuir decisões, não igualar vida nem cortar indiscriminadamente os avisos.
- [x] Validar progressão e primeiro contra-ataque nas duas larguras e campanha completa. Registrar comparação, limitações e cobertura por encontro em `tanahoraflavio/docs/elenco-audio-chefes-2026-11-17.md`. Entrega Git sem publicar.
