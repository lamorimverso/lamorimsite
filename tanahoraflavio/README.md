# Tá na hora, Flávio! — Contagem regressiva

Site estático em `tanahoraflavio/`, atualmente no repositório público `lamorimverso/lamorimsite`. A contagem termina em **01/02/2027 às 00h (UTC−03:00)**, ao término do mandato parlamentar de 31/01/2027.

## Situação real
- O código-fonte do site está no GitHub. Não afirmar que o domínio personalizado está ativo até o registro, DNS e HTTPS terem sido verificados.
- **Não foi registrado nem configurado** neste projeto um domínio `.com` ou `.com.br`.
- Este diretório faz parte de um repositório que possui outros sites. **Não renomear** `lamorimsite` nem alterar a raiz sem avaliar impactos.
- O site não utiliza servidor próprio nem expõe IP de VPS no HTML. A hospedagem GitHub Pages, no entanto, não garante anonimato do dono da conta GitHub nem de dados de cadastro do domínio.

## Experiência e música
- O contador e aro de porcentagem são calculados no navegador.
- A página verifica se `musica.m4a` está disponível; caso não esteja, disponibiliza o YouTube como alternativa. O player só é carregado e aberto ao tocar em **Tocar música**, sem reprodução automática.
- O navegador pode exigir um gesto para liberar o som. O botão **Tocar música** e o Play do próprio YouTube continuam disponíveis.
- O mesmo botão pausa a música que estiver tocando. O arquivo de áudio local não está incluído neste repositório.
- Se a API ou o vídeo falhar, o quadro vazio é recolhido e o controle fica indisponível; o link original no rodapé permanece acessível.
- Para manter a música tocando sem exibir vídeo, é necessário **um arquivo de áudio devidamente licenciado** e um player HTML `audio`; usar YouTube apenas como fonte invisível de áudio não é a implementação recomendada e contraria regras de exibição do player.

## Minigame: Corre, Flávio!

- Corrida infinita para teclado e toque, sem pausa manual. Espaço, ↑, pista ou botão Pular acionam o salto. A simulação e seus temporizadores são suspensos quando a página perde foco ou a pista sai da tela, retomando automaticamente.
- Cinco cenários em voltas: Brasília → Rio → Argentina → Flórida → Casa Branca → Brasília. Cada destino corresponde a 5.000 unidades da rota. Os encontros seguram a progressão do cenário, enquanto personagem, distância total e pontos continuam avançando. Transições usam fusão e parallax; com movimento reduzido, a troca é direta.
- Três chefões sorteados sem repetição por rodada: **Xandão, Haddad e Lula**, com o primeiro encontro após aproximadamente 34 segundos de percurso (a partir de 8.500 unidades de distância). Pontos coletados não antecipam encontros. Xandão lança carimbos/ondas; Haddad lança documentos; Lula lança ondas do megafone. Os ataques são anunciados, saltáveis e limitados por intervalos seguros. Saem da posição real do chefão em cada largura de tela; enquanto tiver energia, ele continua atacando. Energia inicial: Xandão 14, Haddad 16 e Lula 20, com aumento limitado por rodada.
- Inimigos comuns e obstáculos são sorteados conforme o destino. Chefões não são reaproveitados como ondas comuns. Os personagens usam atlas PNG transparentes gerados a partir da prancha selecionada pelo usuário, com seis quadros de corrida, salto, aterrissagem, impacto e três poses por chefão. Lula usa a aparência solicitada de 2026. Os perseguidores da prancha são PF, Janones e exército.
- **Passaporte:** +10 pontos e progresso para uma vida extra a cada 100 (100, 200...). Grupos de três ficam alinhados ao salto, sem exigir desvios incompatíveis.
- **Escudo das Américas:** invisibilidade por **6 segundos**, permitindo atravessar inimigos e ataques. Contador e desenho do escudo indicam o efeito. Outro escudo não nasce enquanto houver um ativo ou já em trânsito. Não concede uma colisão guardada.
- **Bíblia evangélica:** coletada em encontros com chefe, fortalece os próximos **três disparos**, com **dano 3** cada. Munição restante é indicada e pode ser usada no chefe seguinte. Sem cargas, o disparo automático simbólico de ivermectina tem **dano 1**. Tiros não removem os obstáculos; é necessário desviar.
- **Não há** fantasma, Constituição, proteção guardada de uma colisão ou coletas de chocolate, recibo e mansão. Todos os coletáveis têm finalidade visível. Armas são símbolos de um jogo satírico, sem recomendação médica.
- **Joice Hasselmann** é uma personagem caricatural. Em intervalos sorteados de 35–60 segundos de jogo comum, ela anuncia uma perseguição: **2 s de aviso**, **8 s de ondas mais frequentes da PF** e **2 s de retorno gradual**. Não se sobrepõe a chefões nem a transições. O intervalo espera quando essas situações estão ocupadas.
- Os chefões lançam projéteis em trajetória reta da mão em direção à posição habitual do Flávio na pista. Acertar a personagem causa perda de vida; o jogador pode desviar saltando. A mira não acompanha o salto em tempo real, para não causar ataques impossíveis de evitar.
- Sons curtos e originais (Web Audio) são acionados por salto, arremesso, coleta, colisão, entrada e vitória contra chefão. O controle Som pode silenciá-los; sem gesto inicial ou suporte do navegador, a corrida continua normalmente.
- A seção recolhida **Playlist de músicas das eleições de 2026** oferece quatro faixas identificadas: Rap do Silva, Bota Pra Virar, Vem com Fé e A Vingança do Povo. Vídeos são selecionados por gesto no player visível do YouTube, sem baixar, extrair ou hospedar áudio. Abrir a playlist pausa a música da contagem. Reprodução e anúncios dependem das condições do YouTube e titulares.
- O meme tem três batidas sintetizadas e narração genérica do navegador; não usa gravação ou imitação da voz da pessoa retratada. O botão Som liga/desliga esse áudio. Legendas permanecem disponíveis e falhas de áudio não impedem jogar. Sair da aba ou reiniciar interrompe a narração.
- As falas são roteiro ficcional com referência documental e data: [denúncia do MP-RJ em 2020](https://www.mprj.mp.br/web/guest/visualizar?noticiaId=96203) e [decisão do STF de 2021 anulando quatro RIFs](https://portal.stf.jus.br/noticias/verNoticiaDetalhe.asp?idConteudo=477496). Denúncia não equivale a condenação; a sátira da PF não descreve uma operação real.
- Começa com **1 vida**. Uma colisão sem proteção encerra a partida. Após gastar uma vida extra já conquistada, 1,2 s de recuperação evitam dano duplicado da mesma barreira. Reiniciar limpa vidas extras, poderes, munição e eventos.
- Quadros atrasados não congelam o jogo: relógio fixo de 120 Hz com recuperação limitada a 150 ms por quadro. Retomar a aba descarta o tempo oculto. Um novo gesto retoma foco válido, e pointerdown evita atraso/duplicação dos controles no celular.
- Os desenhos são pré-carregados antes de liberar Começar corrida. Falha no carregamento oferece nova tentativa, sem iniciar uma partida sem personagens.
- Recorde em localStorage, sem impedir o jogo quando esse armazenamento estiver bloqueado.
- Arquitetura sem dependências de runtime: runner-core.mjs (regras), runner-art.mjs (itens e perigos), runner-sprites.mjs (atlas/animações), runner-clock.mjs (relógio), runner-audio.mjs (áudio opcional), runner.mjs (Canvas/DOM) e minimal.css (página). Versões dos módulos e estilos impedem misturar caches antigos.
- Os endereços foro-flavio/ e fimdoforoflaviobosonaro/ redirecionam para esta página. A raiz e os demais sites são independentes.

### Verificação

Execute node --test tests/*.test.*. Os testes de navegador requerem Playwright e Chromium; para Chrome existente, use PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. A suíte cobre física, coletas, sorteio, duração dos eventos, escudo, munição, movimento reduzido, teclado/toque, armazenamento bloqueado, contador, música e larguras de 320 a 1440 px.

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
