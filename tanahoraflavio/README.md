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

- Corrida infinita fictícia e satírica: **Brasília (0–20 s) → Rio (20–40 s) → Argentina (40–60 s) → Flórida (60–80 s) → Casa Branca (a partir de 80 s)**. A pista continua até o jogador perder as vidas; não existe vitória automática ou limite de duração.
- Toque na pista ou em **Pular**; teclado: Espaço ou seta para cima. **P** pausa/retoma e Esc pausa quando a pista está focada. Não há início automático.
- A perseguição começa com a **PF**. Entram **Xandão aos 15 s**, **Janones aos 30 s**, o **“exército do Lula” aos 45 s** e **Lula como perseguidor comum aos 60 s**. Os adversários anteriores continuam aparecendo. A velocidade aumenta e o intervalo entre adversários diminui até um mínimo de 1,35 s nas ondas comuns; todos podem ser saltados.
- **Chefes por pontuação:** 1.500 PF; 3.000 Xandão; 4.500 Janones; 6.000 Exército; 7.500 Haddad; 9.000 Boulos; 10.500 Flávio Dino; 12.000 Lula como **chefe supremo**. Depois a sequência recomeça em níveis superiores, com mais ataques até um máximo de nove por encontro, e intervalos limitados. Os chefes são caricaturas de um jogo de ficção/sátira, sem afirmações de conduta real.
- Colete **chocolate e recibos (+25)**, **mansão (+50)** e **passaportes (+10)**. Os objetos são símbolos da sátira; não constituem alegações factuais.
- O **fantasma** concede **6 segundos de invisibilidade**, permitindo atravessar adversários. Uma nova coleta renova o efeito, sem somar durações. O **escudo +1** guarda **uma chance extra**, consumida automaticamente em uma colisão; há 1,2 s de recuperação para evitar perda imediata. As vantagens aparecem no HUD e seus tempos congelam durante a pausa.
- O jogador começa com **1 vida: bateu, perdeu**. Sem proteção ativa, uma única colisão encerra o jogo. Se conquistou vidas extras, cada colisão consome uma vida; o escudo guardado absorve uma colisão e a invisibilidade temporária permite atravessar obstáculos. Após consumir uma vida extra ou escudo, há **1,2 s de recuperação exclusivamente para evitar uma segunda perda provocada pela mesma barreira**. Reiniciar limpa as vidas extras e vantagens. A corrida pausa ao sair da aba, perder foco ou rolar a pista para fora da tela.
- Os **passaportes** aparecem em trios; **a cada 100 coletados, +1 vida** (100, 200, 300...). Todos são itens fictícios.
- A dificuldade é função da **distância virtual percorrida**, não da taxa de quadros. A velocidade vai de 250 até um limite de 380 unidades/s e o intervalo base das ondas comuns vai de 1,95 até 1,35 s. Há no máximo **um grupo de recompensas por obstáculo**, alinhado ao salto: poder quando devido, depois trio de passaportes, depois item comum. Os intervalos nominais aumentam com a distância: itens comuns de 3,8 até 6,2 s, passaportes de 2,6 até 4,4 s e poderes de 14 até 36 s, além de variação aleatória e espera pela próxima onda. Assim os itens não criam saltos incompatíveis nem sobreposição de bônus.
- Recorde em `localStorage`, somente no navegador. Se o armazenamento estiver bloqueado, o jogo funciona e conserva o recorde durante a sessão.
- `runner-core.mjs` contém a física e as regras sem DOM; `runner.mjs` desenha cenários e controles; `enhancements.css` ajusta o visual da página. Nenhuma dependência de runtime foi adicionada.
- O retrato e o círculo percentual antecedem a contagem na mesma coluna em celular e computador. A frase satírica e a ressalva jurídica ficam nas fontes recolhíveis. A pista mantém os cinco pontos turísticos; ajuda e listas ficam ocultas. Os poderes aparecem apenas quando ativos, sobre a pista, sem deslocar os controles.

### Verificação

`node --test tests/runner.test.mjs tests/balance.test.mjs` executa os testes da física a partir da raiz do repositório. `tests/site.test.cjs` usa Playwright e Chromium para verificar teclado, toque, pausa, armazenamento bloqueado, contador e larguras de 320, 390, 768 e 1440 px. Com Playwright e seu Chromium instalados, execute `node --test tests/*.test.*`. Para um Chromium já disponível, defina `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` com o caminho do executável.

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
