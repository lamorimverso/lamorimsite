# Modo Batalha — referências e implementação

Referências estudadas: [IKEMEN GO](https://github.com/ikemen-engine/Ikemen-GO), [OpenMugen](https://github.com/humbertodias/openmugen), [OpenKakutou](https://github.com/openkakutou/engine), [Game2D](https://github.com/ioNihal/Game2D). Implementação original: separação entre simulação e desenho, estados de ataque (preparação, ativo, recuperação), caixas de contato, defesa por altura, hit-stop, energia, IA e rounds. Não foram importados código nem sprites desses projetos.

O modo fica em battle/index.html, acessível pelo seletor de modos do runner, sem modificar as regras de corrida. Os personagens e armas usam o catálogo existente do site. O modo tem 23 lutadores selecionáveis, 22 adversários CPU, sete arenas e três dificuldades; os personagens de travessia coletiva não são lutadores. Todos têm golpes básicos e um especial adaptado ao poder do catálogo. O modo não pretende carregar arquivos MUGEN, implementar todos os combos individuais, multiplayer ou oferecer paridade de animações com um motor profissional.

Testes em tests/battle-mode.test.mjs. Sem dependências novas.
