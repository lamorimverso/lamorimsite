# Auditoria de arquitetura — Corre, Flávio!

## Linha de base (24/11/2026)

Commit publicado: `2ff8cc054aae2c605645a0d114772c70a0ea72ce`. PR 83 integrado; CI 45418671815 e deploy 45420261801 com sucesso. A árvore Git consultada não estava truncada.

A pasta `tanahoraflavio/` contém 313 arquivos e 7 subdiretórios: assets, assets/audio, assets/redesign, battle, docs, tests e third-party. Inventário por extensão: 75 MJS, 2 JS, 3 CSS, 3 HTML, 37 MD, 11 JSON, 2 TXT, 57 PNG, 75 WebP e 48 MP3. A árvore do repositório inclui 140 arquivos sob tests/ e tanahoraflavio/tests/ (não necessariamente 140 suítes).

## Entradas e dependências confirmadas

- `index.html`: game.css, control-settings.css, page-layout.js, runner-bootstrap.js e data-runner apontando para runner.mjs, todos com hashes versionados. Mantém a URL pública e o link battle/.
- `runner-bootstrap.js`: importa dinamicamente a URL de data-runner, oferece recuperação após falha/timeout de 12 s; não é código morto.
- `runner.mjs`: integra Canvas, relógio, controles, HUD, áudio e motor. Consome runner-core, runner-art, runner-scenery, runner-clock, runner-control-map, runner-gamepad, runner-combat-hud e outros módulos já separados.
- `runner-core.mjs`: estado e regras, importações de terreno, corpo, rotas, chefes, poderes, suprimentos e geometria; também reexporta APIs usadas por consumidores. Preservar API e ordem de efeitos.
- `battle/index.html`: battle.css e battle.mjs versionados. battle.mjs importa battle-core e reutiliza runner-art, runner-boss-art e runner-scenery; alterações nessas dependências exigem testes dos dois modos.
- `runner-redesign-data.mjs`: dados exportados e URLs de imagens via new URL(..., import.meta.url); tamanho não demonstra duplicação. Não mover sem revisar caminhos e geradores.
- `third-party/` e `tools/references/`: preservar atribuições/licenças e verificar usos antes de propor exclusão.

## Prioridades de manutenção

| Arquivo | Bytes na árvore Git |
|---|---:|
| runner-redesign-data.mjs | 109226 |
| runner-core.mjs | 103330 |
| runner.mjs | 73424 |
| game.css | 49204 |
| runner-scenery.mjs | 37722 |

Separar módulos por responsabilidade e dependências reais, sem impor limite arbitrário de linhas. Dados gerados devem ser avaliados separadamente do código de aplicação. A formatação compacta de battle.css e battle.mjs merece revisão independente de mudanças funcionais.

## Risco de versionamento identificado

`tools/version-runner-assets.mjs` percorre os arquivos JS/MJS/CSS imediatamente abaixo da raiz do jogo, resolve imports relativos estáticos recursivamente, calcula SHA-256 de 12 caracteres e atualiza atributos src/href/data-runner do index.html da raiz. Rejeita ciclos e caminhos fora da raiz. Não percorre automaticamente todas as subpastas nem o HTML de battle; a importação dinâmica e URLs via new URL também não são cobertas pela expressão de imports estáticos. Antes de mover módulos, ampliar a cobertura com testes direcionados e preservar os hashes existentes quando o conteúdo não mudar. Confirmar como os geradores gerenciam as URLs de mídia; não substituir hashes manualmente sem validar.

## Validação exigida

O workflow .github/workflows/site-responsive-ci.yml usa Node 22, Playwright, Sharp e Canvas; executa verificação de versões, teste de toque, suíte integral, replay comparativo e capturas de desktop/mobile. Não enfraquecer essas verificações. Testar cada PR, verificar diff e deploy antes de integrar a próxima etapa. Não mover testes compartilhados sem atualizar globs, imports e CI.

## Sequência proposta

1. Completar mapa de referências, imports dinâmicos, assets, geradores e testes; distinguir código ativo, legado e candidatos ainda não comprovados.
2. Melhorar versionamento de entradas aninhadas com regressão automatizada.
3. Organizar módulos coesos incrementalmente, mantendo entradas e URLs públicas.
4. Extrair responsabilidades do motor/UI e revisar estilos; manter comportamento, acessibilidade e controles.
5. Remover apenas arquivos comprovadamente redundantes, preservando licenças e rollback Git.
6. Executar CI integral e confirmar publicação final.

Esta auditoria é inicial, não declara arquivos mortos, não altera código executável e não considera o mapeamento de dependências completo. Acompanhar na issue #84.
