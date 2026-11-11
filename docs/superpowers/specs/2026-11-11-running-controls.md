# Corrida, retorno e comandos

Correções solicitadas: perseguidores comuns correndo, sem prancha e com o tamanho original; corrigir o recuo/retorno e a interação com inimigos; configurações só com comandos, também por WASD.

Causas verificadas: obstacle() desviava os personagens de solo para drawHoverEnemy, perdendo quadros de corrida; Flávio não recebia direção de movimento; perseguidores de retaguarda não mudavam sua orientação; a proteção passed mantinha o perseguidor evadido inativo, mas seu desenho ainda podia se sobrepor ao retorno.

Correção localizada: restaurar drawThreat/drawActor para personagens comuns, mantendo escala original ligada à altura do perigo. Chefes continuam com as plataformas e poses de combate já pedidas. Espelhar a imagem dentro do próprio retângulo de desenho, conservando tamanho e envelope ao virar; movimento à esquerda orienta Flávio/jacaré para a esquerda, soltar volta à corrida normal. Preservar a proteção de ameaça ultrapassada e retirar o desenho do perseguidor evadido, sem reviver dano, retirar limites/intervalos de segurança ou recontar chefes.

Comandos: W/↑/Espaço para pular, S/↓ para abaixar, A/D ou setas para mover; seleção de tecla de disparo permanece. O painel de engrenagem contém apenas os comandos e os ajustes de toque/disparo. Ajuda, fontes, efeitos e ritmo ficam em seções recolhidas abaixo do jogo, preservando créditos e opções existentes.

Validar testes que falham antes da correção, renderização real de corrida/orientação/envelope, retorno para inimigo ultrapassado, WASD incluindo repetição/soltura, painel compacto e persistência dos ajustes; regressões e CI antes de publicar.
