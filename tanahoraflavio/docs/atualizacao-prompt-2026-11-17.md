# Corre, Flávio! — entrega do prompt de jogabilidade

Referência comparativa `8783152`, versão com a fase difícil do jacaré já testada. A revisão pública anterior à integração era `ede05c5`. Esta entrega trata somente do minigame. Ela não altera a contagem regressiva, outras páginas nem serviços externos.

## Diagnóstico e prioridade

| Sintoma | Evidência na referência | Decisão |
|---|---|---|
| Erro terrestre e erro de duelo têm consequências incompatíveis | Um contato terrestre com uma tentativa disponível terminava a corrida. O duelo usava cinco pontos de energia e restaurava energia na transição. | Unificar dois impactos, distinguir forma de postura, testar cura sem ganho de vida e impedir que o mesmo contato debite duas vezes. |
| A barra dá impressão de desaceleração | O deslocamento geométrico era 200 unidades/s, enquanto o avanço inicial do mundo era 270. A pausa da agendagem comum durante terreno agravava a diferença de cadência. | Fazer a mesma distância alimentar mundo e terreno. Conferir o alcance do salto simples na geometria resultante antes de somar ameaças. |
| O fim nem sempre exige mais decisões que o meio | Nas seis amostras de referência, o Rio teve média de 10,5 contatos projetados e o retorno a Brasília teve 5,0 nos primeiros 12 s elegíveis de cada mapa. A pressão medida no HUD não explica sozinha essa distribuição. | Dar identidade a cada sequência e reservar a janela de reação. Medir aberturas, meios e recuperação separadamente. |
| Transição não pede uma ação de travessia | A referência completou as seis amostras de campanha sem entrar em nenhuma fase aérea física. | Usar São Paulo → Argentina como primeira viagem jogável, sem piso invisível ou comando obrigatório de tiro. |

Prioridade usada na integração: dano e leitura de estado; rolagem e apoios; viagem; cadência regional e contrajogo; apresentação e verificação. O primeiro par afeta cada partida e dá base física para os demais. Exercitar combinações em um trecho representativo é menos arriscado do que espalhar um padrão ainda não validado pelos mapas.

## Mapa de ritmo da História

A duração depende de tempo jogado, velocidade e desempenho no chefe. Padrões e intervalos devem ser lidos junto com o relatório medido, não como promessa de partidas idênticas.

| Local | Ensino / desenvolvimento | Clímax / recuperação / saída |
|---|---|---|
| Brasília | Pulo baixo e abaixar isolados. A rede de Ana Elisa ensina a ler marca e a responder com projeção refletida. | Martelos e mandados de Xandão alternam posturas. O próximo horizonte indica o Rio sem tirar controle. |
| Rio de Janeiro | Alternância de pulsos, altura e retaguarda. A nota do microfone não pode ser confundida com decoração. | Joice combina ondas e pausas de silêncio. São Paulo começa em solo firme. |
| São Paulo | Largura útil, passagem baixa e primeiro apoio elevado. Jardineiras de Cortez ensinam a ler quique. | Refletores de Erika fecham a etapa. Reserva limpa para embarque e primeira plataforma. |
| Argentina | A chegada restabelece chão sólido antes dos perseguidores a pé. Soraya alterna posições de pouso. | Vendavais de Dilma exigem posição além de salto ou postura baixa. Saída aponta para a fronteira. |
| Paraguai / Assunção | O Fiscal da Ponte funciona como passagem, com sinais, esquiva e nenhuma exigência de disparo. | Papéis e carimbos de Taxad alternam faixas. Respiro depois de resolver a última marca. |
| Flórida | Bagagem baixa e alta, zonas marcadas e reaproveitamento de deslocamento lateral. | Rotas de orçamento de Simone pedem antecipação e retorno de projétil. |
| Casa Branca | Selos e investidas combinam as respostas já ensinadas. | O Fantasma muda a posição útil e expõe um contra-ataque marcado, sem cobrir a pista com legenda. |
| Retorno a Brasília | Praça e travessia do Povo, seguida de rajadas de Janones. | Gestos em L de Lula combinam ida e retorno. A urna fictícia continua como encerramento. |

## Biblioteca inicial de padrões

| Padrão | Entrada e sinal | Resposta, saída e critério |
|---|---|---|
| Rasante e alto em sequência | Solo com velocidade e direção conhecidas. Projétil ou perseguidor sinalizado, incluindo a borda quando já pode exigir ação. | Pular ou abaixar conforme a faixa. A próxima ameaça reserva o tempo da anterior. Passagem em ambas as larguras sem usar escudo. |
| Marcador lateral | Área ou queda anunciada antes de se tornar ativa e mira fixa depois do aviso. | Sair pelo lado ainda alcançável. Não sobrepor o único corredor a uma segunda obrigação inviável. |
| Passagem baixa | Teto com entrada contrastante e espaço de aproximação; deslize opcional com direcionamento. | Corpo baixo acompanha a geometria. Pés mantêm apoio, e espera sob teto não restaura uma caixa maior sem espaço. |
| Apoio elevado | Borda, topo e vazio usam a mesma posição simulada e a mesma distância do mundo. | Pulo simples suficiente, pouso e saída preservados no redimensionamento. Um pulo duplo conquistado pode ser usado, mas não é a única rota obrigatória. |
| Voo de ligação | Rampa de embarque, referência de origem, subida, corredor sem chão, aproximação e pouso. Avião decorativo não atinge. | Encadear apoios, ler a faixa do avião e escolher pulo ou postura baixa. A única plataforma alcançável e a janela de salto não podem ser bloqueadas ao mesmo tempo. |
| Onda do jacaré | Três ou quatro alvos próximos da posição no aviso, com último corredor calculado e entrada de 0,6 s de proteção. | Deslocar-se lateralmente enquanto completa cinco entradas distintas. Restaurar a forma humana não cancela a onda já anunciada. |
| Duelo refletível | Ameaça nasce do portador, com antecipação e retorno visível ao autor. | Tiro direto age só em projétil hostil. A condição de vitória é devolver ataques, exceto nas passagens desenhadas para esquiva; não no dano de tiro direto ao corpo. |

## Comparação nas mesmas condições

Comparação no motor a 120 passos/s, sementes 7, 17 e 417, duas larguras lógicas de 480 e 900. A coluna de contatos mede projeções a até 0,7 s pela posição do piloto e descarta marcadores locais que não cruzam seu corpo. As ações contam início de comando, não a dificuldade percebida. Cada linha resume os primeiros 12 s terrestres elegíveis por mapa, excluindo duelos, terreno especial e jacaré; a última coluna é a média da maior lacuna de cada amostra. Para meio e clímax, veja as janelas adicionais no [anexo de ritmo e fichas dos chefes](ritmo-campanha-2026-11-17.md).

| Mapa | Contatos projetados | Inícios de comandos | Maior lacuna média (s) |
|---|---:|---:|---:|
| Brasília | 5,0 → 6,0 | 5,0 → 5,8 | 3,0 → 3,0 |
| Rio | 10,5 → 10,3 | 11,0 → 10,2 | 1,9 → 1,8 |
| São Paulo | 9,7 → 10,0 | 10,2 → 10,0 | 2,2 → 2,0 |
| Argentina | 9,7 → 9,8 | 9,7 → 10,2 | 2,0 → 2,0 |
| Paraguai | 7,5 → 8,5 | 8,0 → 9,0 | 2,7 → 2,6 |
| Flórida | 8,7 → 8,8 | 8,8 → 8,5 | 2,6 → 2,8 |
| Casa Branca | 8,5 → 8,0 | 8,5 → 7,7 | 2,8 → 3,4 |
| Retorno a Brasília | 5,0 → 5,2 | 5,2 → 4,7 | 4,8 → 5,0 |

Nas seis amostras comparáveis, a versão-base teve 0 s de travessia física. O candidato teve 20,8–20,9 s, com dois avisos de ataques aéreos por passagem e ao menos 5 pousos por corrida. As 20/20 simulações da campanha concluíram a lição, o voo e a urna. O comparativo direto no motor da semente 17 ficou em 30 passos/s: ballot, 20,9 s de voo, 60 passos/s: ballot, 20,9 s de voo, 120 passos/s: ballot, 20,8 s de voo. São passos de simulação, não FPS da tela.

| Parâmetro | Base | Candidato / verificação |
|---|---|---|
| Rolagem de terreno e mundo | 200 versus 270 unidades/s no início | Mesma distância por passo; apoio não se reposiciona por uma segunda rolagem. |
| Regra de impactos normais | Primeiro na pista ou cinco pontos nos duelos com restauração | Dois na pista e no duelo; Rachadinha rara e sem sobrecura. |
| Tolerância de borda / buffer | 0 / 120 ms | 80 / 120 ms; uma entrada normal não vira dois saltos. |
| Travessia SP–Argentina | Sem passagem física | 20,8–20,9 s na amostra; via suspensa com rampa, cinco apoios, aviso, vão e pouso. |
| Perfil de simulação em Node | Passo JS, sem renderização | P95 entre 0,006–0,012 ms nos seis replays; não é orçamento de FPS do aparelho. |

A revisão medida é `9774c89`. O relatório do navegador registra o commit analisado no CI e inclui capturas de pista, duelo e viagem em desktop e celular. Para o trecho de viagem, a imagem-base é a aproximação terrestre de São Paulo, pois o corredor aéreo não existia.

## Polimento e limites de medição

Pés, apoios e colisão usam referências estáveis. Baixar sem deslizar não emite raspagem. O pouso usa o apoio real. A marca do próximo destino aparece antes da divisa e continua no fundo, sem parar o jogo. Controles de movimento reduzido, som e remapeamento não são substituídos pelo acabamento. A tolerância após a borda é de 80 ms. O buffer já existente de 120 ms continua separado e não dispara recuperação do jacaré.

A técnica de tolerância de entrada documentada pela Maddy Thorson em *Celeste & Forgiveness* é uma referência de desenho, não uma especificação de física importada. Os valores aqui precisam ser validados nesta pista e permanecem independentes dos FPS. [Referência](https://maddymakesgames.com/articles/celeste_and_forgiveness/index.html)

O relatório do piloto conta inícios de comandos e contatos projetados pelo motor, não a compreensão ou diversão de uma pessoa. O perfil do Chrome registra trabalho síncrono de simulação, DOM e Canvas em ambiente de CI. Não prova 60 FPS em aparelho físico, latência de entrada ou ausência de picos do compositor. O teste com iniciantes e jogadores familiarizados permanece pendente por falta de participantes nesta sessão.

## Reprodução e retorno

- `node tools/check-runner-experience.mjs <checkout>` mede seis corridas com as mesmas sementes e larguras e grava JSON em stdout. O segundo argumento `--rates` compara 30, 60 e 120 passos. Não há telemetria em produção.
- `node tools/check-story-campaign.mjs` percorre a História até a urna usando comandos reais e escudos conquistados, sem injetar vida ou teleporte.
- `node tools/capture-runner-experience.cjs <checkout-base> <checkout-candidato> <saída>` usa Chrome headless e gera imagens e JSON de 30/60/120 frames de referência. `site-responsive-ci.yml` executa o replay após a suíte principal.
- Para desfazer o candidato antes de publicar, manter a `main` intacta. Depois de uma eventual integração e publicação, reverter o merge correspondente, preservando o restante do histórico. Não reescrever o ramo público.
