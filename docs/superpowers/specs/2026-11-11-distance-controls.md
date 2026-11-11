# Distância do chefão e controle de disparo

Correção solicitada: chefão após atingir a quilometragem combinada (aproximadamente 22 km), botão Disparar e troca da tecla nas configurações.

A campanha existente começava em 1.200 m. Acrescentar 20.800 m de corrida de abertura antes de seus marcos, fazendo o primeiro confronto começar aos 22.000 m de rota. Manter os 20 encontros, os intervalos entre eles e os cinco cenários da campanha. A abertura estende Brasília; depois dela, cada segmento de campanha continua com 7 km. Não antecipar chefes por tempo. Perseguição/jacaré já em andamento podem adiar, nunca antecipar o confronto.

Separar a coordenada de rota da coordenada da campanha. A renderização usa coordenada contínua durante a abertura: segmentos anteriores ao primeiro são Brasília, mantendo parallax e sem teleporte de cenário. Medidor de metros conserva toda a corrida.

Manter o botão Disparar visível durante a corrida, desabilitado quando não há confronto ou durante jacaré, com explicação acessível. Nas configurações, permitir J/Z padrão, F, K, L, X ou C. Guardar preferência local, refletir a tecla em HUD/aria-label e cancelar tiro mantido ao trocar o ajuste. Não capturar atalhos em campos, selects ou combinações do navegador.

Escolha técnica: mudança localizada no agendamento, coordenada da campanha e mapeamento de disparo. Alterar apenas o modo padrão deixaria a História incorreta; reestruturar encontros ou cenários descartaria trabalho aprovado.

Validação: fronteira dos 22 km, início sem chefe, progressão 5×4, continuidade do fundo, toque, remapeamento e persistência, cancelamento de tecla, storage inválido, regressões e CI. Publicar após checks e comparar arquivos públicos.
