# Atualização de Corre, Flávio!

| Problema | Correção | Arquivos principais |
| --- | --- | --- |
| Limite lateral fixo e projéteis calculados para o corredor antigo | Limites pela largura útil e pelas poses, posição proporcional após resize e colisão na altura prevista para cada ataque | `runner-core.mjs`, `runner-art.mjs` |
| Restauração do jacaré com um comando | Cinco comandos distintos, progresso visível, transição entre formas, proteção inicial e quedas se a transformação persistir | `runner-core.mjs`, `runner-input.mjs`, `runner.mjs`, `game.css` |
| Teclas retidas fora do jogo e agachamento cancelado por outra fonte | Liberação no documento, limpeza na saída do foco e soma das fontes de agachamento | `runner-input.mjs`, `runner.mjs` |
| Perigos previsíveis e pouca variedade na arena | Bueiros com aviso antes de abrir, padrões por semente, ataques pela frente, retaguarda e pelo alto | `runner-core.mjs`, `runner-art.mjs` |
| Recorte de Joice terminava antes da frase final | Áudio original da Câmara com 12,70 s, recuperação ajustada à duração, fim natural sem cortar a fala | `joice-toc-toc-v2.mp3`, `runner-voice-data.mjs`, `runner-audio.mjs`, `runner-core.mjs` |
| Legendas cobriam a corrida e associação de Simone estava incorreta | Simone Tebet associada ao adesivo “Gostosas do Lula”, avisos funcionais compactos e créditos acessíveis | `runner.mjs`, `runner-core.mjs`, `index.html`, `game.css` |
| Cenários pediam mais profundidade | Luz da rota, neblina discreta entre os planos e transição contínua | `runner-scenery.mjs` |

A corrida mantém os cinco chefões, cinco destinos com 7 km cada, 15 aliados, 80 poses, passaportes, vidas, escudo, placar, reinício e compartilhamento. O jogador continua desviando dos ataques. O áudio v2 foi conferido por reconhecimento local e pela transcrição oficial, com créditos e fonte no [catálogo de áudio](../assets/audio/README.md).

Foram exercitadas 2.000 sequências aleatórias, 400 redimensionamentos e 360 encontros com os cinco chefões. Os testes de navegador reproduziram as falhas de foco e agachamento. A versão com essas correções, `2d3c58ca83a8ab0bbf167bba8274ae1467a67d94`, passou em [306 testes no GitHub Actions](https://github.com/lamorimverso/lamorimsite/actions/runs/42314065286). A execução final com a nova mídia está vinculada ao commit de publicação no GitHub.

O sorteio sem repetição está preparado. A pesquisa encontrou referências às duas obras, mas não encontrou versões 8-bit com autorização de uso verificável. A trilha já disponível é a única ativa. O item mencionado como “caneca/caneta” também ficou sem identificação confirmada. O escudo pode ter alguns pixels recortados na borda direita. A validação de responsividade usa Chromium e simulação de tamanhos de tela. Safari e aparelhos físicos não foram testados.

A base para rollback é `4cf1f9ac476b6d7f9e3c374bdb9554c1ae4c8b66`. Os commits de validação e integração estão na [história do jogo](https://github.com/lamorimverso/lamorimsite/commits/main/tanahoraflavio/).
