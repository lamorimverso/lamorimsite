# Runner sprites and stability Implementation Plan
> Use superpowers:executing-plans. O usuário pediu execução e publicação das correções.
Goal: substituir os desenhos e corrigir corrida/chefes no site existente.
Spec: docs/superpowers/specs/2026-10-28-runner-stability-design.md
Architecture: motor puro preservado, relógio extraído, atlas e renderização separados, Canvas/DOM integrados.
Tech Stack: JS ESM, Canvas 2D, PNG, Node e Playwright.

## Constraints
Escudo das Américas 6 s; Bíblia três tiros; três chefes sem repetição; Joice 2/8/2 s; nenhuma nova dependência de produção; manter site e URLs.

## Tasks
- [ ] Reproduzir em testes o freeze por quadros atrasados, retorno de foco e coordenadas fora da tela.
- [ ] Implementar runner-clock.mjs e alinhar viewportWidth no core e renderer; manter ataques enquanto chefe estiver vivo.
- [ ] Integrar os dois atlas da referência, seus estados/poses e pré-carregamento com erro recuperável.
- [ ] Validar unitários, Chrome com baixa cadência, toque e falha de assets; comparar visualmente imagens e jogo.
- [ ] Revisar, corrigir achados e publicar atomicamente após CI verde; verificar página real e aliases.

## Review Focus
Imagem não carregada não inicia partida invisível; 300 ms por frame não congela nem gera trabalho ilimitado; interação retoma blur sem acelerar aba oculta; projéteis partem da posição real do chefe; invulnerabilidade continua exclusivamente temporária.
