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

## Segunda entrega — referências aplicadas
- Mega Man X Engine: `src/entities/player_jump.cpp` e `src/gameplay/weapon_get_timeline.h` inspiram controle de altura e informação de recompensas sem alterar o relógio da campanha.
- Rockbot: `character/ai_actions.cpp` inspira o vínculo do aviso com o ataque concreto; `character/classplayer_weapons.cpp` inspira distinguir a evolução real da arma e o nível máximo.
- MegaManJS: `test/integration/tests/jump.js` inspira medir o ápice efetivo de saltos em cenários isolados; `test/system/tests/stage-select.js` reforça a validação de transições como estados observáveis.

Corrigido o salto variável na corrida automática da História (corte de 440 em vez de 260 para manter altura mínima da pista). O Infinito, os duelos e o protótipo manual mantêm suas regras. O HUD prioriza a ameaça concreta e só indica rebatida se a própria ameaça for um projétil rebatível. Recompensas simultâneas e nível máximo são descritos corretamente. Testes verificam alturas em 480/900 px, 30/60/120 passos por segundo, avanço automático e compatibilidade com Infinito. CI é necessário antes de publicação.
