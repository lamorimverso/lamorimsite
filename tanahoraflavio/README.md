# Tá na hora, Flávio! — Contagem regressiva

Site estático em `tanahoraflavio/`, atualmente no repositório público `lamorimverso/lamorimsite`. A contagem termina em **01/02/2027 às 00h (UTC−03:00)**, ao término do mandato parlamentar de 31/01/2027.

## Situação real
- O código-fonte do site está no GitHub. Não afirmar que o domínio personalizado está ativo até o registro, DNS e HTTPS terem sido verificados.
- **Não foi registrado nem configurado** neste projeto um domínio `.com` ou `.com.br`.
- Este diretório faz parte de um repositório que possui outros sites. **Não renomear** `lamorimsite` nem alterar a raiz sem avaliar impactos.
- O site não utiliza servidor próprio nem expõe IP de VPS no HTML. A hospedagem GitHub Pages, no entanto, não garante anonimato do dono da conta GitHub nem de dados de cadastro do domínio.

## Experiência e música
- O contador e aro de porcentagem são calculados no navegador.
- A página verifica se `musica.m4a` está disponível; caso não esteja, carrega o player visível do YouTube como alternativa.
- O navegador pode bloquear a reprodução automática com som. O botão **Tocar música** e o Play do próprio YouTube continuam disponíveis.
- O mesmo botão pausa a música que estiver tocando. O arquivo de áudio local não está incluído neste repositório.
- Se a API ou o vídeo falhar, o quadro vazio é recolhido e o controle fica indisponível; o link original no rodapé permanece acessível.
- Para manter a música tocando sem exibir vídeo, é necessário **um arquivo de áudio devidamente licenciado** e um player HTML `audio`; usar YouTube apenas como fonte invisível de áudio não é a implementação recomendada e contraria regras de exibição do player.

## Minigame: Corre, Flávio!

- Corrida fictícia e satírica: **Rio (0–25 s) → Argentina (25–50 s) → EUA (50–75 s)**. Completar 75 segundos encerra a rota com vitória.
- Toque na pista ou em **Pular**; teclado: Espaço ou seta para cima. **P** pausa/retoma e Esc pausa quando a pista está focada. Não há início automático.
- A perseguição começa com a **PF**. Entram **Xandão aos 15 s**, **Janones aos 30 s**, o **“exército do Lula” aos 45 s** e **Lula como chefe aos 60 s**. Os adversários anteriores continuam aparecendo. A velocidade aumenta e o intervalo entre adversários diminui até um mínimo de 1,1 s; todos podem ser saltados.
- Colete **chocolate e recibos (+25)** ou **mansão e passaporte (+50)**. Os objetos são símbolos da sátira; não constituem alegações factuais.
- O **fantasma** concede **6 segundos de invisibilidade**, permitindo atravessar adversários. Uma nova coleta renova o efeito, sem somar durações. O **escudo +1** guarda **uma chance extra**, consumida automaticamente em uma colisão; há 1,2 s de recuperação para evitar perda imediata. As vantagens aparecem no HUD e seus tempos congelam durante a pausa.
- Colisão sem proteção mostra **“Pego pela Polícia Federal!”**, encerra a fuga fictícia e permite tentar novamente. Reiniciar limpa os efeitos e a chance guardada. A corrida pausa ao sair da aba, perder foco ou rolar a pista para fora da tela.
- Recorde em `localStorage`, somente no navegador. Se o armazenamento estiver bloqueado, o jogo funciona e conserva o recorde durante a sessão.
- `runner-core.mjs` contém a física e as regras sem DOM; `runner.mjs` desenha cenários e controles; `enhancements.css` ajusta o visual da página. Nenhuma dependência de runtime foi adicionada.
- A frase satírica sobre foro e desemprego fica junto à contagem, abaixo do seu subtítulo. A ressalva jurídica permanece disponível nas fontes.

### Verificação

`node --test tests/runner.test.mjs` executa os testes da física a partir da raiz do repositório. `tests/site.test.cjs` usa Playwright e Chromium para verificar teclado, toque, pausa, armazenamento bloqueado, contador e larguras de 320, 390, 768 e 1440 px. Com Playwright e seu Chromium instalados, execute `node --test tests/*.test.*`. Para um Chromium já disponível, defina `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` com o caminho do executável.

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
