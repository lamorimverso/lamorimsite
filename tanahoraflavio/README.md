# Tá na hora, Flávio! — Contagem regressiva

Site estático em `tanahoraflavio/`, atualmente no repositório público `lamorimverso/lamorimsite`. A contagem termina em **01/02/2027 às 00h (UTC−03:00)**, ao término do mandato parlamentar de 31/01/2027.

## Situação real
- O código-fonte do site está no GitHub. Não afirmar que o domínio personalizado está ativo até o registro, DNS e HTTPS terem sido verificados.
- **Não foi registrado nem configurado** neste projeto um domínio `.com` ou `.com.br`.
- Este diretório faz parte de um repositório que possui outros sites. **Não renomear** `lamorimsite` nem alterar a raiz sem avaliar impactos.
- O site não utiliza servidor próprio nem expõe IP de VPS no HTML. A hospedagem GitHub Pages, no entanto, não garante anonimato do dono da conta GitHub nem de dados de cadastro do domínio.

## Experiência

- Contagem e retrato grandes centralizados no topo; ao descer, o mesmo bloco se transforma no cabeçalho compacto acima do jogo. Compartilhar preservado, sem navegação em abas nem playlist.
- Efeitos sonoros originais e um recorte curto de arquivo de Haddad, identificados na ajuda e controlados pelo botão de som. Nenhuma gravação musical nem imitação de voz.

## Minigame: Corre, Flávio!

- Corrida infinita para teclado e toque, sem pausa manual. Tecla Espaço, ↑, pista ou Pular acionam o salto; ↓/S ou **Abaixar** reduz a altura do personagem, no chão. Segurar durante o salto guarda a intenção até o pouso; a opção tocar para alternar dispensa pressão prolongada. Pular sai do agachamento imediatamente; no celular, outro dedo pode saltar em Pular ou na pista enquanto Abaixar continua pressionado. Uma nova pressão no ar pode aguardar o pouso por até120ms, sem salto duplo. Perda de foco/visibilidade limpa intenções pendentes e suspende a simulação.
- Cinco cenários em voltas: Brasília → Rio → Argentina → Flórida → Casa Branca → Brasília. **Cada cenário percorre 7.000 metros (7 km)** e uma volta totaliza **35 km**, incluindo os encontros. A paisagem continua passando durante chefões/Joice, sem congelar a rota. A pressão combina distância e tempo (q=min(1,.55*d/40000+.45*t/140)); velocidade250→435, reação comum1.65→.95s e chefe1.15→.85s. Contatos são separados por pelo menos.82s.
- O placar e o recorde mostram **metros percorridos**. Passaportes e bônus não alteram o placar. O recorde usa chave própria no armazenamento para não interpretar pontuações antigas como metros.
- Chefes em ordem **Haddad → Lula → Xandão**, repetida. Primeiro a partir de **22.000 metros de rota**; cada vitória reserva pelo menos **7 km de corrida** até o seguinte, fora de transições/eventos. Haddad exige9papéis, Lula10gestos em L e Xandão12martelos/mandados. A cada volta, somam-se2ataques, até+4. **Flávio só desvia; não possui armas.**
- Chefes usam padrões próprios com ações repetidas, e a sequência muda nas voltas seguintes. O aviso consulta a mesma fonte do motor e prioriza o ataque em voo. Perigos altos são colunas visíveis que exigem abaixar; não é possível saltar sobre elas. Cada chefe mostra ataques evitados, em vez de HP.
- **Passaporte:** aparece em grupos espaçados de três, menos frequentes que antes; **100 coletados = +1 vida**, repetidamente. O item não concede pontos artificiais e não aparece em excesso.
- **Escudo das Américas:** proteção por **6 segundos**, representada por um objeto sólido azul/dourado diante do braço, com o desenho das Américas. Flávio permanece visível; acompanha salto/agachamento. Outro escudo não nasce quando um efeito já está ativo ou há um escudo próximo.
- **Jacaré de videogame (sátira):** ao coletar Zé Gotinha, Flávio adquire forma de jacaré **somente no desenho do jogo**; enquanto estiver transformado não pula. A primeira entrada de salto (↑/Espaço/toque na pista) ativa o item cartunesco denominado "cloroquina de videogame" e devolve a forma normal, sem pular; a entrada seguinte salta. A coleta continua removendo obstáculos comuns e preserva os 2,5 s de respiro para evitar aprisionar o jogador. **Não é efeito real de vacinas nem uso médico da cloroquina.** Vacinação não transforma ninguém em jacaré e cloroquina não reverte vacinas nem trata a Covid-19 (OMS: https://www.who.int/news-room/questions-and-answers/item/coronavirus-disease-%28covid-19%29-hydroxychloroquine).
- **Memes de cenário:** o chefão Haddad exibe recibos com marca "TAXA" (Taxad); Janones pode anunciar áudio de arquivo "Pessoal, urgente" quando aparecer no percurso; Simone usa a legenda do adesivo "Gostosas com Lula" e Soraya faz referência a "padre de festa junina" (Padre Kelmon). São referências documentadas a memes ou adesivos; não foram criadas falas atribuídas a Simone ou Soraya.
- **Daniel Vorcaro:** registrado apenas como futuro aliado satírico no catálogo técnico `docs/design-raid-elenco-politico-2026-10-30.md`. O "Crédito Relâmpago" ainda **não** está implementado em runtime. Não atribuir como fato uma parceria concreta com Flávio ou crimes.
- **Joice Hasselmann:** aviso1,2s, perseguição10s, recuperação2s. Primeira18–30s, recorrência24–36s; relógio continua durante chefes e fica pendente. Mais ondas (gap.98→.90s), PF baixa e microfones altos, personagem correndo durante a fase ativa e atmosfera vinho/vermelha que entra/sai gradualmente, sem flashes. Não sobrepõe chefes. Áudio real da Câmara creditado na ajuda.
- Os desenhos anteriores são preservados. Dois atlas extras com4poses por personagem (Dilma, Simone, Soraya, ZéGotinha, Haddad, Lula, Xandão e Joice) usam PNGs originais e WebP lossless, recortes/pivôs explícitos. PF, Janones e Exército mantêm2poses. Movimento reduzido retira decoração e conserva a passada essencial; Flávio continua olhando àdireita.
- Paisagens em três planos de coordenadas contínuas: o próximo lugar entra pela direita, os monumentos passam e saem pela esquerda; cores/fronteiras se misturam numa faixa espacial, sem reset em7km/35km. O chão é contínuo e não cria colisões. Movimento reduzido fixa posições decorativas e dissolve a identidade do destino nos1000m finais.
- Derrota com ilustração nova de Flávio algemado e a legenda exata “Foi pego pela Polícia Federal!” abaixo, preservando causa do impacto e nova tentativa. Os atlas originais continuam intactos.
- Começa com uma vida. Colisão sem proteção encerra a partida; vidas extras concedem 1,2 s de recuperação após um impacto.
- Relógio fixo de 120 Hz limita recuperação de tempo entre frames; movimento reduzido reduz efeitos decorativos sem interromper jogo e animações essenciais.
- O jogo roda inteiramente no navegador, com testes para física, chefões, coleta, acessibilidade, teclas/toque e celular/desktop. A página e os outros sites/bots do repositório não precisam ser alterados.

### Verificação

Execute `node --test --test-concurrency=1 tests/*.test.*` (dependências de desenvolvimento: `playwright@1.56.1` e `sharp@0.35.5`). Os testes de navegador requerem Playwright e Chromium; para Chrome existente, use PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. A suíte cobre metros, cenários de 7 km, dificuldade crescente, coletas raras, chefões somente ofensivos, pular/abaixar, escudo, movimento reduzido, teclas/toque, armazenamento bloqueado e larguras de 320 a 1440 px.

### Refinamento de UX — 28/10/2026

- A rota compacta distingue os 7 km da etapa dos metros totais percorridos em encontros. Ajuda e ajustes ficam recolhidos junto ao jogo.
- Botão Expandir/Recolher alterna entre a pista ampliada e compacta sem pausar; Escape recolhe. Sem playlist, cabeçalho com três links ou ataques do jogador.
- A forma de abaixar, os efeitos reduzidos, o ritmo mais tranquilo e o som lembram a escolha local. Armazenamento bloqueado não impede jogar. O ritmo tranquilo afeta a próxima tentativa.
- Perigos têm velocidade de aproximação própria para harmonizar a janela de reação entre telas. Coletas acompanham essa velocidade e aparecem na ação de evasão correspondente.
- Calibração inicial dos passaportes usa um piloto de testes com comandos reais, sem teleporte nem imunidade: aproximadamente quatro minutos até a primeira vida nas sequências examinadas. Isso não equivale a um playtest humano.
- HTML antigo em cache recebe atualização compatível; imagens têm tempo limite e tentativa nova; um bootstrap independente oferece recarregar se o módulo falhar. Os recortes são gerados antecipadamente, sem varredura de pixels em runtime. A rodada29/10 usa caixas explícitas em tools/runner-art-layout.json porque as figuras geradas não obedecem perfeitamente à grade nominal; os testes verificam integridade, margens e ausência de personagens vizinhos.
- As colisões continuam permissivas em relação às partes extremas dos sprites. A geometria física e a escala da arte são avaliadas em regressões e inspeção de poses; não se amplia a hitbox para cobrir toda a caricatura.

### Apresentação e viagem —29/10/2026

- Contagem grande e retrato central no topo; `page-layout.js` coordena a transformação no cabeçalho compacto, sem duplicar IDs nem realimentar a rolagem. Ao iniciar, pista/comandos são alinhados à tela; em telas baixas parte do cabeçalho pode sair naturalmente do campo de visão para caber a partida.
- Som, ampliação e ajuda em controles discretos. Ajustes recolhidos; objetivo repetido oculto; recorde aparece no fim. Placar e progresso essenciais preservados.
- `drawJourneyScenery` usa distância de rota sem limite para a geografia e distância total para chão/nuvens. Três planos (.14/.18/.22px por metro), marco aos2500m de cada segmento e fronteiras suaves2200m; alpha/estado do Canvas preservados.
- Novos PNGs flavio-motion-v2/characters-motion-v2 foram gerados por imagem a partir dos personagens anteriores, com revisão de anatomia, transparência e recortes. As escolhas visuais não equivalem a validação com jogadores nem prova de qualidade igual às referências.
- Controles de ajuste aguardam seus eventos estarem ligados antes de aceitar interação, evitando perder escolhas feitas enquanto o módulo carrega.
- Fases ficcionais inspiradas no calendárioTSE2026 aparecem no progresso existente; ajuda explica roteiro/ordem/objetivos e referencia o calendário. Não se afirmam candidaturas/resultados reais nem fatos sobre as personagens.
- Áudio contextual:9memes curtos da referência indicada pelo usuário, além de Joice/Haddad. Diretor limita repetição e usa silêncio14–22s; falas ambiente só em janelas seguras. Trilha original em WebAudio acompanha pressão/chefes/Joice, abaixa sob a fala, para no mute/derrota/aba oculta. Fontes e limites em assets/audio/README.md.

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

- Direção final Endless Runner: sem botões Pular/Abaixar nem barra de percurso. Toque/deslize para cima na pista pula; deslize para baixo e segure abaixa; solte para levantar. Modo alternar responde a novo deslize para baixo. Dois dedos e teclado permanecem. Cena contínua em encontros; curva de frequência/reação distância/(distância+10.000), mantendo limites de velocidade e colisão. Nota de foro/STF retirada conforme print.

## Papéis desta revisão

| Elemento | Ação ou recompensa |
|---|---|
| Dilma / vento | Abaixe da coluna de vento. |
| Simone / papéis | Abaixe da parede de papéis. |
| Soraya / microfones | Abaixe da coluna de microfones. |
| Popcorn | Pule o balde de pipoca baixo. |
| Zé Gotinha | Recolha para limpar perigos comuns e ganhar2,5s de respiro; não elimina chefes. |
| Vozes de arquivo | Sinalizam largada, marcos, coleta, vitória e surpresa; sem alterar colisões. |

Auditoria e comparação mensurável: [revisão de30/10](../docs/auditoria-gameplay-2026-10-30.md). Não se afirma equivalência comercial com jogos de referência, diversão comprovada ou compatibilidade em aparelhos físicos/Safari.

Ao redimensionar, `resizeRun` preserva o prazo dos perigos futuros, a fração percorrida no voo e as coletas associadas. Perigos já em contato permanecem no lugar. Isso mantém a reação calibrada ao girar/recolher a pista, sem teleporte de colisões ou mudança na física do herói.
