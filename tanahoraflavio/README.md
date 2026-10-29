# Tá na hora, Flávio! — Contagem regressiva

Site estático em `tanahoraflavio/`, atualmente no repositório público `lamorimverso/lamorimsite`. A contagem termina em **01/02/2027 às 00h (UTC−03:00)**, ao término do mandato parlamentar de 31/01/2027.

## Situação real
- O código-fonte do site está no GitHub. Não afirmar que o domínio personalizado está ativo até o registro, DNS e HTTPS terem sido verificados.
- **Não foi registrado nem configurado** neste projeto um domínio `.com` ou `.com.br`.
- Este diretório faz parte de um repositório que possui outros sites. **Não renomear** `lamorimsite` nem alterar a raiz sem avaliar impactos.
- O site não utiliza servidor próprio nem expõe IP de VPS no HTML. A hospedagem GitHub Pages, no entanto, não garante anonimato do dono da conta GitHub nem de dados de cadastro do domínio.

## Experiência

- Contagem regressiva e botão Compartilhar, sem navegação em três abas e sem playlist.
- O jogo oferece efeitos sonoros originais (Web Audio) que podem ser desligados. Não reproduz arquivos musicais.

## Minigame: Corre, Flávio!

- Corrida infinita para teclado e toque, sem pausa manual. Tecla Espaço, ↑, pista ou Pular acionam o salto; ↓/S ou **Abaixar** reduz a altura do personagem, no chão. Segurar durante o salto guarda a intenção até o pouso; a opção tocar para alternar dispensa pressão prolongada. Pular sai do agachamento imediatamente; uma nova pressão no ar pode aguardar o pouso por até120ms, sem salto duplo. Perda de foco/visibilidade limpa intenções pendentes e suspende a simulação.
- Cinco cenários em voltas: Brasília → Rio → Argentina → Flórida → Casa Branca → Brasília. **Cada cenário percorre 7.000 metros (7 km)** e uma volta totaliza **35 km**, excluindo percursos extras de confronto. Os cenários mudam conforme a distância da rota, pausada durante chefões/Joice. A velocidade de deslocamento cresce a cada quilômetro até limite jogável.
- O placar e o recorde mostram **metros percorridos**. Passaportes e bônus não alteram o placar. O recorde usa chave própria no armazenamento para não interpretar pontuações antigas como metros.
- Chefões sorteados sem repetição a cada três: **Xandão, Haddad e Lula**. O primeiro aparece depois de um trecho significativo (a partir de 8.500 metros). Somente os chefões atacam: **Flávio não possui armas nem disparos automáticos**; vence ao desviar da sequência de ataques e continuar vivo.
- **Xandão** alterna martelo baixo (salto) e mandado de papel alto (abaixar). **Haddad** arremessa papéis e **Lula** lança o gesto caricatural de mão em L, alternando ataques altos (abaixar) e baixos (pular). O aviso usa o mesmo padrão do motor e prioriza o ataque que ainda está vindo. A mira é estável durante cada arremesso e nunca persegue o jogador no ar. Cada chefão tem indicador dos ataques já evitados, em vez de barra de HP.
- **Passaporte:** aparece em grupos espaçados de três, menos frequentes que antes; **100 coletados = +1 vida**, repetidamente. O item não concede pontos artificiais e não aparece em excesso.
- **Escudo das Américas:** invisibilidade por **6 segundos**, permitindo atravessar inimigos e projéteis. Outro escudo não nasce quando um efeito já está ativo ou há um escudo próximo.
- **Joice Hasselmann** surge em eventos com **2 s de aviso, 8 s de perseguição intensificada da PF e 2 s de recuperação**, em intervalos sorteados. Não coincide com chefões ou transições de cenário.
- Os desenhos anteriores ficam preservados. Novos atlas cartoon2D usam oito passos de Flávio, salto de subida/descida, slide e derrota; PF, Janones e Exército alternam pernas. Flávio continua olhando à direita. As poses preservam a proporção da arte, com registro de torso e pés. O slide recebe ajuste uniforme de escala para caber abaixo do ataque alto; o rosto não é achatado. A animação não altera colisões. Chefões sinalizam preparo e lançamento sem alternar continuamente as armas.
- Paisagens agora têm três camadas limpas (céu, silhuetas distantes e um monumento por destino), com paralaxe suave e transição entre locais. Os cartazes, sobreposições e caricaturas espalhadas foram retirados para deixar a pista legível, sem criar perigos invisíveis.
- Começa com uma vida. Colisão sem proteção encerra a partida; vidas extras concedem 1,2 s de recuperação após um impacto.
- Relógio fixo de 120 Hz limita recuperação de tempo entre frames; movimento reduzido reduz efeitos decorativos sem interromper jogo e animações essenciais.
- O jogo roda inteiramente no navegador, com testes para física, chefões, coleta, acessibilidade, teclas/toque e celular/desktop. A página e os outros sites/bots do repositório não precisam ser alterados.

### Verificação

Execute `node --test --test-concurrency=1 tests/*.test.*` (dependências de desenvolvimento: `playwright@1.56.1` e `sharp@0.35.5`). Os testes de navegador requerem Playwright e Chromium; para Chrome existente, use PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. A suíte cobre metros, cenários de 7 km, dificuldade crescente, coletas raras, chefões somente ofensivos, pular/abaixar, escudo, movimento reduzido, teclas/toque, armazenamento bloqueado e larguras de 320 a 1440 px.

### Refinamento de UX — 28/10/2026

- A rota compacta distingue os 7 km da etapa dos metros totais percorridos em encontros. Ajuda e ajustes ficam recolhidos junto ao jogo.
- Botão Ampliar aumenta a pista sem pausar; Escape recolhe. Sem playlist, cabeçalho com três links ou ataques do jogador.
- A forma de abaixar, os efeitos reduzidos, o ritmo mais tranquilo e o som lembram a escolha local. Armazenamento bloqueado não impede jogar. O ritmo tranquilo afeta a próxima tentativa.
- Perigos têm velocidade de aproximação própria para harmonizar a janela de reação entre telas. Coletas acompanham essa velocidade e aparecem na ação de evasão correspondente.
- Calibração inicial dos passaportes usa um piloto de testes com comandos reais, sem teleporte nem imunidade: aproximadamente quatro minutos até a primeira vida nas sequências examinadas. Isso não equivale a um playtest humano.
- HTML antigo em cache recebe atualização compatível; imagens têm tempo limite e tentativa nova; um bootstrap independente oferece recarregar se o módulo falhar. Os recortes são gerados antecipadamente, sem varredura de pixels em runtime. A rodada29/10 usa caixas explícitas em tools/runner-art-layout.json porque as figuras geradas não obedecem perfeitamente à grade nominal; os testes verificam integridade, margens e ausência de personagens vizinhos.
- As colisões continuam permissivas em relação às partes extremas dos sprites. A geometria física e a escala da arte são avaliadas em regressões e inspeção de poses; não se amplia a hitbox para cobrir toda a caricatura.

### Apresentação limpa e qualidade —29/10/2026

- Contagem compacta ao lado do retrato, sem marca duplicada no cabeçalho. Pista e início cabem na primeira tela móvel.
- Som, ampliação e ajuda em controles discretos. Ajustes recolhidos; objetivo repetido oculto; recorde aparece no fim. Placar e progresso essenciais preservados.
- Cenários vetoriais em runner-scenery.mjs: paletas coesas, arquitetura com contornos discretos, três planos e pista definida. Sem cartazes nem texto decorativo.
- Novos PNGs flavio-motion-v2/characters-motion-v2 foram gerados por imagem a partir dos personagens anteriores, com revisão de anatomia, transparência e recortes. As escolhas visuais não equivalem a validação com jogadores nem prova de qualidade igual às referências.
- Controles de ajuste aguardam seus eventos estarem ligados antes de aceitar interação, evitando perder escolhas feitas enquanto o módulo carrega.

Para regenerar a arte: `node tools/build-runner-art.mjs`. Para atualizar versões após qualquer mudança de recurso: `node tools/version-runner-assets.mjs`. O CI usa as verificações `--check`; uma mudança na dependência invalida o import e o HTML automaticamente. O CSS atual está concentrado em `game.css`.

### Referências de implementação

- [Dino do Chromium: estados e quadros da animação](https://chromium.googlesource.com/chromium/src/+/refs/heads/main/components/neterror/resources/dino_game/trex.ts).
- [Tutorial oficial Phaser: sprites, carregamento e colisões](https://docs.phaser.io/phaser/getting-started/making-your-first-phaser-game).
- [Jetpack Joyride 2, Halfbrick: referências de ação e chefes](https://www.halfbrick.com/games/jetpack-joyride-2).

## Próxima etapa: domínio próprio
1. Confirmar **a grafia** antes de pagar: a marca atual é `tanahoraflavio`, enquanto `tanahroaflavio` apareceu na solicitação original.
2. Registrar o domínio e habilitar renovação automática, privacidade de registro (se oferecida) e autenticação multifator no registrador.
3. Criar um **repositório exclusivo** `tanahoraflavio` contendo `index.html` e `retrato.webp` na raiz, evitando afetar as outras páginas de `lamorimsite`.
4. Ativar GitHub Pages nesse repositório e adicionar o domínio em **Settings → Pages → Custom domain** **antes** de publicar o DNS. Verificar propriedade do domínio na conta GitHub.
5. Configurar DNS conforme instruções oficiais do GitHub Pages para domínio apex / `www`. Usar **somente os endereços GitHub Pages**, nunca o IP da residência ou da VPS.
6. Ativar **Enforce HTTPS** quando estiver disponível, confirmar certificado válido e redirecionamento HTTPS.
7. Se usar Cloudflare como DNS/proxy, habilitar proteção adequada ao plano e validar cuidadosamente HTTPS, cache e origem; não divulgar registros DNS apontando para servidores particulares.
8. Não criar arquivo `CNAME` antes de possuir e confirmar o domínio, para não quebrar a publicação atual ou expor o endereço a tomada indevida.

Links oficiais: [GitHub Pages — custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

## Limitações de segurança
A página não possui backend, banco ou senhas embutidas. Evite incluir identificadores pessoais e chaves no código público. O domínio e o GitHub públicos ainda podem revelar o responsável pelo projeto. Uma configuração de DNS e CSP não oferece invulnerabilidade.

## Contexto jurídico
O fim do mandato não transfere automaticamente todos os processos para outra instância. Veja a [decisão do STF](https://noticias.stf.jus.br/postsnoticias/acoes-contra-autoridades-permanecem-no-stf-mesmo-apos-saida-do-cargo/).
