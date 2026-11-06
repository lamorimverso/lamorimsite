# Correções de Corre, Flávio! — plano de execução

Especificação: [prompt fornecido pelo usuário](prompt-correcao-2026-11-06.md).
Base e rollback: `4cf1f9ac476b6d7f9e3c374bdb9554c1ae4c8b66`.

Manter o motor Canvas e alterações incrementais no jogo e testes associados. A continuação solicitada já autoriza implementar a especificação e publicar na principal após validar. Nenhuma alteração em outro site, bot ou infraestrutura.

1. Motor (`runner-core.mjs`, testes de movimento/jacaré/perigos): reproduzir limites 70..280 e recuperação com um comando; testar antes de corrigir. Criar `playerBounds(run)`, preservar posição proporcional em resize, alvos e tempos reais; cinco chamadas independentes de `jumpRun`, com `player.jacareProgress` e `JACARE_RECOVERY_STEPS=5`. Testar milhares de sementes, bordas, chefões, colisões e rotas reais. Bueiro usa aviso e alvo fixo; não identificar caneca/caneta sem evidência.
2. Entrada/interface (`runner.mjs`, `runner-input.mjs`, `index.html`, `game.css`, testes): bloquear repetição/tecla mantida, conservar multitoque e progresso misto; cinco indicadores discretos. Retirar legendas de faixas, transições e ações; manter atribuições acessíveis e alertas funcionais. Simone é a referência Gostosas do Lula, sem atribuir a ela fala de terceiros.
3. Áudio (`runner-audio.mjs`, `runner-soundtrack.mjs`, catálogo e testes): conferir fontes e duração. Integrar trecho completo da Câmara se recuperável; nunca criar voz. Sorteio sem repetição das faixas realmente disponíveis, sem nomes visíveis; não inventar melodias ou autorização para as duas ausentes. Parada, ducking e uma única trilha preservados.
4. Arte/transição (`runner-art.mjs`, `runner-scenery.mjs`, testes): bueiro reconhecível, metamorfose/progresso, sinais mínimos e profundidade contínua sem legendas. Preservar 15 aliados/80 poses, economia, cinco chefões e 7 km por cenário.
5. Validação/publicação: executar testes Node completos, versões de recursos e regressões; Chromium indisponível localmente, executar suíte completa no CI da branch antes de integrar. Inspecionar prévia com navegador quando disponível. Revisão independente do conjunto. Atualizar main por fast-forward com lease; confirmar Pages e hashes públicos dos arquivos alterados.

## Foco de revisão

- Extremos da arena, sprite agachado/jacaré e resize com perigo em voo.
- Tecla mantida, duas teclas, toque cancelado e alternância teclado/toque.
- Perigos surgindo próximos e aproximação inesperada ao avançar lateralmente.
- Áudio terminando durante troca de fase, mute e perda de foco.
- Arte opcional ausente, derrota/reinício e ausência de legendas redundantes.

## Registro

- Diagnóstico: limite lateral fixo 70..280; restauração instantânea; banners narrativos ainda ativos. Arquivo Joice atual de 5,22449 s, incompleto. Somente uma trilha existente encontrada.
- Baseline: testes Node iniciados; suíte de navegador local bloqueada por executável Chromium ausente. Nenhum browser instalado para contornar a limitação.
