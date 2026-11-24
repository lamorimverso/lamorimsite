# Referências Mega Man X — melhoria incremental da História

## Referências examinadas
- https://github.com/davidluky/megaman-x-engine — MIT para código original; `src/entities/boss_se_fight_loop.h` separa estados e ordem de ataque; `src/gameplay/weapon_get_timeline.h` separa apresentação de recompensa da simulação.
- https://github.com/protoman/rockbot — motor SDL com editor de fases, inimigos, armas e chefes; referência arquitetural, não dependência.
- https://github.com/pomle/megamanjs — referência JavaScript de plataforma; nenhuma dependência incorporada.

Nenhum código, sprite, áudio ou personagem de terceiros foi importado. O motor próprio, a sátira e a corrida automática são preservados.

## Primeira entrega
O HUD usa uma decisão única para o aviso da História: perigo ativo antes de contra-ataque; travessia não vira duelo; entrada e recuperação têm avisos próprios. Não modifica dano, velocidade, cooldown, progressão, armas ou economia. O teste do selo decorativo removido passa a verificar a instrução real e os seletores dos dois modos, mantendo o teste de avanço sem entradas.

## Próximas verificações
- CI completo, replay equivalente em celular/desktop, captura em 390/1440 px.
- Revisar a legibilidade dos avisos e os intervalos de contra-ataque com uma campanha real.
- Medir FPS e latência em aparelhos físicos antes de refatorar.
- Manter as duplas, o intervalo de 100 km e a urna; não reintroduzir movimento manual permanente.
