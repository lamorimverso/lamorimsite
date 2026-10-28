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

- Corrida infinita para teclado e toque, sem pausa manual. Tecla Espaço, ↑, pista ou Pular acionam o salto; ↓/S ou **segurar Abaixar** reduz a altura do personagem, no chão. Agachar impede o salto enquanto o comando estiver pressionado. A simulação suspende ao perder foco ou visibilidade.
- Cinco cenários em voltas: Brasília → Rio → Argentina → Flórida → Casa Branca → Brasília. **Cada cenário percorre 7.000 metros (7 km)** e uma volta totaliza **35 km**, excluindo percursos extras de confronto. Os cenários mudam conforme a distância da rota, pausada durante chefões/Joice. A velocidade de deslocamento cresce a cada quilômetro até limite jogável.
- O placar e o recorde mostram **metros percorridos**. Passaportes e bônus não alteram o placar. O recorde usa chave própria no armazenamento para não interpretar pontuações antigas como metros.
- Chefões sorteados sem repetição a cada três: **Xandão, Haddad e Lula**. O primeiro aparece depois de um trecho significativo (a partir de 8.500 metros). Somente os chefões atacam: **Flávio não possui armas nem disparos automáticos**; vence ao desviar da sequência de ataques e continuar vivo.
- **Xandão** alterna martelo baixo (salto) e mandado de papel alto (abaixar). **Haddad** arremessa papéis altos e **Lula** lança o gesto caricatural de mão em L, também alto. A mira é estável durante cada arremesso e nunca persegue o jogador no ar. Cada chefão tem indicador dos ataques já evitados, em vez de barra de HP.
- **Passaporte:** aparece em grupos espaçados de três, menos frequentes que antes; **100 coletados = +1 vida**, repetidamente. O item não concede pontos artificiais e não aparece em excesso.
- **Escudo das Américas:** invisibilidade por **6 segundos**, permitindo atravessar inimigos e projéteis. Outro escudo não nasce quando um efeito já está ativo ou há um escudo próximo.
- **Joice Hasselmann** surge em eventos com **2 s de aviso, 8 s de perseguição intensificada da PF e 2 s de recuperação**, em intervalos sorteados. Não coincide com chefões ou transições de cenário.
- Personagens originais mantêm seus atlas PNG: Flávio corre olhando à direita, com animação de corrida/salto/impacto e agachamento em Canvas. Perseguidores e chefões têm balanço de movimento sem afetar colisões.
- Paisagens utilizam transições suaves e parallax, com cartazes ilustrados e referências satíricas à Papuda, Papudinha, Jair, ivermectina, Covid-19 e “Chupetinha”. São caricaturas históricas/fictícias, **não afirmações sobre situação prisional atual** ou orientação médica. Cenários não criam perigos invisíveis.
- Começa com uma vida. Colisão sem proteção encerra a partida; vidas extras concedem 1,2 s de recuperação após um impacto.
- Relógio fixo de 120 Hz limita recuperação de tempo entre frames; movimento reduzido reduz efeitos decorativos sem interromper jogo e animações essenciais.
- O jogo roda inteiramente no navegador, com testes para física, chefões, coleta, acessibilidade, teclas/toque e celular/desktop. A página e os outros sites/bots do repositório não precisam ser alterados.

### Verificação

Execute node --test tests/*.test.*. Os testes de navegador requerem Playwright e Chromium; para Chrome existente, use PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. A suíte cobre metros, cenários de 7 km, dificuldade crescente, coletas raras, chefões somente ofensivos, pular/abaixar, escudo, movimento reduzido, teclas/toque, armazenamento bloqueado e larguras de 320 a 1440 px.

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

Links oficiais: [GitHub Pages — custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site); [YouTube IFrame Player](https://developers.google.com/youtube/iframe_api_reference); [Chromium — autoplay](https://developer.chrome.com/blog/autoplay).

## Limitações de segurança
A página não possui backend, banco ou senhas embutidas. Evite incluir identificadores pessoais e chaves no código público. Recursos externos, como YouTube, poderão processar dados do visitante após o clique no player. O domínio e o GitHub públicos ainda podem revelar o responsável pelo projeto. Uma configuração de DNS e CSP não oferece invulnerabilidade.

## Contexto jurídico
O fim do mandato não transfere automaticamente todos os processos para outra instância. Veja a [decisão do STF](https://noticias.stf.jus.br/postsnoticias/acoes-contra-autoridades-permanecem-no-stf-mesmo-apos-saida-do-cargo/).
