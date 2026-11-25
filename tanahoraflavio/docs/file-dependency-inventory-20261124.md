# Inventário de arquivos e dependências — Corre, Flávio!

Complementa [architecture-audit-20261124.md](architecture-audit-20261124.md) e a [issue #84](https://github.com/lamorimverso/lamorimsite/issues/84). Base imutável: `790640e4002894eb12b757503e3731afa91f807d`, também confirmada como main na consulta. Nenhuma remoção, movimentação ou mudança de runtime nesta etapa.

## Inventário verificável

Árvore Git recursiva, não truncada: 558 blobs no repositório, dos quais 314 sob `tanahoraflavio/`, somando 144.675.886 bytes (144,68 MB decimais, não representa download do navegador ou tamanho do histórico Git). Extensões: 38 MD, 57 PNG, 11 JSON, 75 WebP, 48 MP3, 75 MJS, 3 CSS, 3 HTML, 2 JS, 2 TXT.

## Organização por função e dependências confirmadas

| Grupo | Entradas ou consumidores | Decisão |
|---|---|---|
| Interface da corrida | index.html → control-settings.css, game.css, page-layout.js, runner-bootstrap.js → runner.mjs (import dinâmico a partir de data-runner) | preservar entradas/URLs e hashes |
| Motor da corrida | runner.mjs → runner-core.mjs → stage-director, body, movement-skills, terrain, stage-roster, ground-rhythm, supplies, earned-powers, route-data, boss-profiles, combat-geometry, visibility, hero-shot, cast-pose, allies, voice-data, bosses, drawn-motion | preservar APIs, reexports, ordem de efeitos |
| Interface e apresentação | runner.mjs → control-map, control-settings, gamepad, combat-hud, movement-audio, clock, input, scenery, art, boss-art, campaign-art, visual-finish, story-cue, presentation-cache, edge-cues, terrain-art, shot-events, voice-director, audio | coordenar com UI e modularização |
| Arena | battle/index.html → battle.css e battle.mjs → battle-core, runner-art, runner-boss-art, runner-scenery | preservar caminhos e validar ambos os modos |
| Atlases | runner-art → runner-sprites → sprite-data, slide-art, hero-actions, combat-sprite-data, signature-sprite-data, campaign-sprite-data, redesign-data, drawn-motion e combat-geometry | dados gerados e originais são dependências |
| Áudio | runner-voice-data → famous-voices, extra-voices, meme-data, archive-voices; créditos em assets/audio/README.md | preservar mídia e procedência |
| Arte original | tools/build-runner-art, build-campaign-art, build-combat-art, build-crouch-art, build-signature-art, build-redesigned-art, build-slide-actions | PNG, manifests JSON e WebP de origem necessários ao build |
| Testes e CI | tests/*.test.*, tanahoraflavio/tests/*.test.mjs, tools/version-runner-assets.mjs, .github/workflows/site-responsive-ci.yml | manter globs e checks; sem mudanças fora do jogo |
| Documentação e licenças | docs/, README.md, RUNNER-ESTRUTURA.md, third-party/ | não confundir ausência de import com ausência de uso |

Dependências de desenvolvimento confirmadas no workflow: Node, Playwright 1.56.1, Sharp 0.35.5, @napi-rs/canvas 0.1.100. O browser usa módulos locais e Canvas; não se deve remover essas dependências dos testes por não aparecerem no HTML. Os geradores leem originais PNG e geram WebP e módulos de dados. Exemplo explícito: build-slide-actions.mjs usa flavio-slide-v4.source.png **e** flavio-acoes-v2.webp; runner-hero-actions-data.mjs usa flavio-acoes-v4.webp no runtime. tests/runner-art-assets.test.mjs compara PNG e WebP.

## Comparação de duplicatas por SHA de blob

Não existem dois blobs de conteúdo idêntico dentro da pasta do jogo. Existem quatro grupos de duplicação exata envolvendo outros caminhos do repositório:

- foto.webp (3498 bytes): também em fimdoforoflaviobosonaro/ e foro-flavio/.
- retrato.webp (3564 bytes): também em fimdoforoflaviobosonaro/. O HTML do jogo referencia este arquivo.
- third-party/jspicl-megaman.LICENSE.txt (1070 bytes): igual a tools/references/jspicl-megaman/LICENCE.md.
- third-party/megaman-labs.LICENSE.txt (1068 bytes): igual a tools/references/megaman-labs/LICENSE.txt.

Manter todos; identidade de bytes não prova que o caminho público ou a atribuição é dispensável. Não alterar os outros sites.

## Fila de investigação — NÃO autoriza remoção

| Candidato | Evidência limitada | O que falta verificar |
|---|---|---|
| foto.webp | HTML principal usa retrato.webp; foto.webp tem cópias em outros sites | referências em todos os textos, URLs externas e histórico |
| assets/audio/joice-toc-toc-v1.mp3 | runner-voice-data e tests/release-assets.test.mjs selecionam v2 | demais manifestos, fallback, créditos e testes |
| assets/flavio-acoes-v3.webp | manifesto de ações usa v4; v2 é entrada do gerador | consumidores, documentação e ferramentas históricas |
| assets/flavio-slide-v3.source.png e .source.json | build-slide-actions usa v4.source.png | geradores anteriores, proveniência e testes |
| assets/combat-original-d-v1.{png,webp}, assets/combat-original-e-v1.{png,webp} | manifesto combat-art-sources usa variantes ivermectina d/e v2 | demais manifests, testes, fallback e documentação |

Busca de código do conector retornou zero resultados inclusive para candidatos conhecidos; isso não comprova ausência de uso. A leitura integral de todos os módulos e testes não foi concluída: limite de chamadas da execução e ambiente local sem resolução DNS para clonar GitHub. Não há arquivo comprovadamente sem uso nesta etapa.

## Plano de organização sem conflito

1. Manter diretórios atuais, criar inventário e separar mentalmente runtime, arte-fonte, recursos gerados, testes e documentação.
2. Próxima etapa: varredura completa em checkout do mesmo SHA, com análise de imports estáticos/dinâmicos, URLs, CSS, JSON, geradores, referências por basename e caminhos computados; conferir usos fora da pasta sem modificá-los.
3. Separar apenas módulos coesos após coordenação das branches de motor/UI; preservar URLs públicas e revisar hashes com a ferramenta atual.
4. Só propor movimentação ou remoção em PR separado quando evidência completa, revisão e regressão aprovadas; preservar licenças, entradas de build e rollback.
5. Executar CI integral conforme workflow vigente. Nenhum merge sem CI aprovada e coordenação explícita na issue #84.

Status: inventário e classificação parcial verificados; auditoria de referências e limpeza não concluídas. Não há alteração executável. O percentual geral da issue não deve ser aumentado por este documento sozinho.
