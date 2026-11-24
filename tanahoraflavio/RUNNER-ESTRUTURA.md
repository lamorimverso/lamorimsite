# Estrutura do jogo Corre, Flávio! — Endless Runner

Atualizado em 22/11/2026. Este documento descreve a arquitetura atual do minigame e o retorno à corrida automática; não é uma proposta de mudança nos bots ou nos outros sites.

## Como o jogo funciona

- **Modo Infinito:** corrida automática contínua, com cenários cíclicos, obstáculos, perseguições, itens e chefes.
- **Modo História:** corrida automática com sequência de etapas, encontros especiais, confrontos e objetivo final.
- **Jogador:** usa salto, abaixar/deslizar, deslocamento lateral para desviar, tiro e outros recursos disponíveis. A rota **não** depende de manter a tecla de avançar pressionada.
- **Renderização:** HTML/CSS + Canvas 2D; as regras de jogo são executadas em JavaScript ES Modules. Não há servidor de jogo: a execução ocorre no navegador.
- **Ciclo do cenário:** manhã, tarde e noite alternam a cada 6.000 m percorridos (18.000 m por ciclo completo), com transições graduais no céu, sol, lua, estrelas, nuvens e luzes distantes. O avanço usa a distância simulada, não o horário real. A iluminação não altera o piso de colisão nem as regras da corrida.

## Entrada e ciclo principal

```text
index.html
  └── runner-bootstrap.js
        └── runner.mjs (interface, entrada, renderização e ciclo)
              ├── runner-core.mjs (estado, física, pontuação, eventos e confrontos)
              ├── runner-route-data.mjs + runner-stage-director.mjs
              ├── runner-terrain.mjs + runner-body.mjs
              ├── runner-bosses.mjs + runner-boss-mechanics.mjs
              ├── runner-input.mjs + runner-control-map.mjs + runner-gamepad.mjs
              ├── runner-sprites.mjs + runner-scenery.mjs + runner-art.mjs
              └── runner-audio.mjs + runner-voice-director.mjs
```

## Organização por responsabilidade

| Área | Arquivos principais | Responsabilidade |
|---|---|---|
| Página | `index.html`, `game.css`, `control-settings.css` | Estrutura, responsividade, HUD e controles |
| Carregamento | `runner-bootstrap.js` | Carregar o módulo principal e tratar falhas de inicialização |
| Aplicação | `runner.mjs` | Ligar DOM, teclado/toque/gamepad, música, câmera e Canvas |
| Motor | `runner-core.mjs`, `runner-clock.mjs` | Estado, ticks, colisões, placar, vida, obstáculos e progressão |
| Física | `runner-terrain.mjs`, `runner-body.mjs`, `runner-combat-geometry.mjs` | Saltos, deslizes, superfícies, posição e colisões |
| Rotas | `runner-route-data.mjs`, `runner-stage-director.mjs`, `runner-stage-roster.mjs` | Distâncias, fases, eventos e progressão da campanha |
| Chefes | `runner-bosses.mjs`, `runner-boss-profiles.mjs`, `runner-boss-mechanics.mjs`, `runner-platform-boss.mjs` | Encontros e padrões de ataque |
| Personagens e efeitos | `runner-sprites.mjs`, `runner-art.mjs`, `runner-character-art.mjs`, `runner-scenery.mjs`, `runner-campaign-art.mjs` | Desenho de cenários, personagens e efeitos |
| Controles | `runner-input.mjs`, `runner-control-map.mjs`, `runner-control-settings.mjs`, `runner-gamepad.mjs` | Teclado, toque, mouse e controle |
| Áudio | `runner-audio.mjs`, `runner-soundtrack.mjs`, `runner-voice-director.mjs`, `runner-encounter-sounds.mjs` | Efeitos, música, avisos e falas |
| Itens | `runner-supplies.mjs`, `runner-allies.mjs`, `runner-earned-powers.mjs` | Ajudas, munição, proteção e poderes |
| Mídia | `assets/`, `third-party/` | Imagens, sons, recursos e licenças |
| Verificação | `../tests/`, `tests/`, `../tools/version-runner-assets.mjs` | Testes de regressão, controles de versão e ferramentas de geração |

## Manutenção e validação

1. Alterar preferencialmente o módulo responsável, sem modificar o motor e os desenhos ao mesmo tempo.
2. Atualizar as versões de recursos com `node tools/version-runner-assets.mjs` na raiz do repositório.
3. Verificar as versões: `node tools/version-runner-assets.mjs --check`.
4. Executar os testes: `node --test --test-concurrency=1 tests/*.test.* tanahoraflavio/tests/*.test.mjs`; os de navegador dependem de Playwright/Chrome.
5. Verificar o GitHub Actions **Responsive site checks** e o deploy em **pages build and deployment** antes de declarar aprovação.
6. Usar o histórico Git para rollback. A versão descartada do protótipo Mega Man permanece na branch `backup/antes-retorno-runner-2026-11-22`.

A configuração de produção voltou a usar corrida automática nos dois modos. Rotinas de movimento manual podem continuar no motor para testes e confrontos específicos, mas não controlam o avanço padrão da campanha.

## Continuidade do scroll e cadência visual (24/11/2026)

- O caminho de scroll físico não cria a geometria geográfica descartada em cada quadro. Mantém a API de referência e a opção de movimento reduzido.
- O desenho da paisagem amostra os dois últimos passos físicos (120 Hz) com o fator de interpolação do relógio. A posição renderizada permanece entre as posições simuladas, sem extrapolação nem retorno após um redesenho de interface. O motor, os projéteis, o herói e as colisões continuam usando suas coordenadas reais.
- No modo completo, manhã/tarde/noite seguem a distância física mesmo com a rota geográfica retida; a opção reduzida conserva a apresentação anterior.
- Testes adicionais cobrem cadência de 30 a 165 Hz, retomada, redesenho e diferença de iluminação em pixels. Estes testes verificam a matemática e a apresentação; não são uma medição de FPS em dispositivos físicos.
