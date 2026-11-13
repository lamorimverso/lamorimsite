# Tiro do herói e elenco visível

Pedido: animação corporal de Flávio atirando e todos os personagens desenhados e animados, mantendo os controles e o jogo existente.

Diagnóstico confirmado: `character()` não passa estado de tiro ao desenho; só sobrepõe uma linha e clarão à corrida. `spriteFrameFor('flavio')` ignora attacking. Bossonari e meme-army não têm sprite e caem em drawActor sem retorno tratado no caminho de perseguição de solo. Exército alterna dois quadros de elenco sem ciclo completo das pernas.

Abordagens: ampliar atlas com novos bitmaps exige reconstruir arte aprovada; substituir todo elenco seria desnecessário. A alteração escolhida pelo implementador preserva atlas e rostos existentes, acrescenta corpo articulado de disparo com pernas originais e desenho articulado localizado para as lacunas de solo. Não altera hitboxes, limites, dano, cadência, marcos ou áudio.

Tiro: braço estendido na soltura, recuo e recuperação durante 0,22s; orientação segue o disparo, incluindo recuo, salto e slide. A boca do disparo compartilha geometria com o motor. Corrida normal retorna após o ciclo. Movimento reduzido elimina balanço decorativo, preservando estados essenciais de ação.

Elenco: testar todos os inimigos e apoios nos caminhos reais de desenho; personagens especiais permanecem reconhecíveis, sem substituir rosto por outra identidade. Completar animação das pernas do Exército. Conferir corpos e cabeças dos chefes e quadros de corrida por pixels, além dos recortes.

Validação: reproduzir falhas com Canvas real, teste de integração do estado de tiro, suíte de regressão, 2.000 rotas e 20 campanhas; CI desktop/mobile e capturas de tiro e elenco antes de publicar.
