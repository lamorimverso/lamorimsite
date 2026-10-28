# Correção de corrida e sprites aprovados

O usuário pediu usar exatamente a prancha selecionada (image-edit-target-9d42690561f7b45f.png) para substituir os bonecos, corrigir a corrida e dar perigo real aos chefões. Pediu Lula na aparência de 2026. Mantêm-se as regras anteriores de itens, três chefes, cenários e Joice.

Diagnóstico reproduzido: ataques nascem em x=950 mesmo quando a tela lógica mede 480; chefão vivo cessa ataques após a sequência inicial; o loop descarta todos os quadros acima de 250 ms e pode congelar permanentemente; interações não retomam o estado perdido no blur. Os testes de regras anteriores não cobriam esses casos.

Implementação: atlas PNG transparentes gerados por ImageGen a partir da imagem exata, sem simplificar os desenhos. Ciclo de seis quadros do herói; poses de salto, aterrissagem e impacto; três poses por chefe; três perseguidores e Joice. Pré-carregar e validar recortes uma vez, com estado visível de carregamento/erro. Não iniciar física sem desenhos carregados.

Relógio fixo 120 Hz com máximo de 150 ms de recuperação por quadro, sempre renderizando. Suspensão explícita zera o relógio ao retomar. Gesto do usuário retoma foco válido; página oculta continua suspensa. Entradas por pointerdown, sem salto duplicado pelo click compatível, e clique de teclado preservado.

Mundo visível e física compartilham viewportWidth. Inimigos entram pela borda real; ataques surgem na mão do chefe. Chefe vivo continua disparando; aviso precede impacto e intervalos continuam maiores que um salto completo. Energia inicial Xandão 14, Haddad 16, Lula 20; crescimento limitado por rodada. Removem-se perseguidores sem desenho na prancha em favor de PF, Janones e exército, sem alterar os três chefes.

Referências primárias: Dino do Chromium (animações por estado/tempo), tutorial oficial Phaser (sprites e corpos de colisão separados) e Jetpack Joyride 2 da Halfbrick (corrida, armas e chefes). Mantém-se Canvas sem acrescentar engine externo, pois os defeitos localizados estão no agendamento e nas coordenadas, não no integrador de física.

Validação: testes RED→GREEN de relógio, coordenadas e continuidade de ataques; testes de navegador com quadros de 300 ms, blur/retomada, toque e imagens; inspeção visual de animação, mobile e chefes; piloto por várias sementes/taxas. Revisão independente antes de publicar na mesma página, sem afetar os demais sites.
