# Viagem contínua, contagem central e encontros — design

Base publicada: `a97cbb0fe33688c1d4f205af1e20172bfe838cb7`. O usuário pediu contagem/retrato grandes e centralizados no topo, transformação ao descer para o formato compacto da imagem recebida, site simétrico e clean, paisagens que entram e saem gradualmente com a viagem, revisão da história/objetivos, escudo visível, derrota com Flávio algemado, chefes tardios em ordem e recortes de falas se possível.

Só uma imagem foi anexada e inspecionada: a referência compacta com contagem acima do jogo. Não atribuir conteúdo a uma segunda imagem não recebida. A pergunta opcional sobre primeira aparição/falas não recebeu resposta;21km e busca em fontes oficiais são decisões provisórias do implementador.

## Direção e alternativas

Manter HTML/CSS/Canvas2D e as identidades existentes. A contagem ganha dois estados do mesmo DOM, interpolados pela rolagem; duplicar contadores prejudicaria acessibilidade/persistência, e trocar engine não resolveria esta apresentação. A viagem terá faixas geográficas contínuas, em vez de substituir um monumento fixo por outro numa dissolvência. Usar desenhos vetoriais existentes para paisagens/escudo; gerar somente a ilustração expressamente pedida do personagem algemado.

## Página

- Retrato grande e números grandes centralizados; mesma largura central da referência, até540px. Título e Compartilhar preservados.
- Wrapper de altura estável; bloco interno sticky encolhe à medida que a página rola. O espaço da seção diminui na tela na mesma proporção da rolagem, sem realimentar o scroll nem deslocar a pista em saltos.
- Em torno do jogo, retrato/contagem assumem o arranjo compacto da referência. Começar a partida conduz a esse alinhamento quando necessário. Voltar ao topo restaura o destaque.
- Placar em três colunas equilibradas; ajuda recolhida; avisos fora da pista. Manter controles tocáveis e ampliação/Escape. Movimento reduzido evita a interpolação decorativa e rolagem animada.

## Viagem

- Cinco destinos,7.000m de rota por cenário e35km por volta preservados. A câmera avança à direita; paisagem/marcos entram pela direita e saem pela esquerda, com três planos.
- Fronteiras geográficas passam gradualmente pela tela; céu/paleta/solo têm transição contínua, sem recorte vertical duro nem troca global instantânea. Marco por local, pista limpa e chão contínuo.
- Geometria derivada da distância de rota, sem sorteio por frame e sem reiniciar na fronteira/volta. Movimento decorativo extra pode usar distância total; congelar progresso geográfico durante encontros continua coerente com a rota.
- Novo renderer `drawJourneyScenery(ctx,{routeDistance,distance,width,reducedMotion})`; função pura de geometria para testes. Não alterar colisões.

## Progressão e narrativa

- História é ficcional/satírica; datas de2026 remetem ao calendário oficial, sem inventar candidaturas, resultados ou fatos criminais.
- Referências confirmadas no TSE: convenções20/07–05/08, propaganda geral16/08,1ºturno04/10, eventual2ºturno25/10, diplomação até18/12. Mostrar contexto curto na ajuda/objetivo existente, não novos painéis na página.
- Ordem padrão dos chefes: Haddad → Lula → Xandão; repetir a ordem nas voltas. Primeiro em22.000m de rota (após21km e fora da transição), seguintes a cada7.000m:29.000/36.000/43.000… Sem sorteio que contradiga a ordem.
- Objetivos identificáveis: Haddad, desviar de5 papéis; Lula, completar3 sequências de ataques altos/baixos (6 ataques); Xandão, superar4 martelos e4 mandados (8 ataques). Preservar intervalos seguros, aviso e as duas ações. Ciclos posteriores podem aumentar o ritmo dentro do limite atual, sem diminuir reação abaixo dos limites existentes.
- Narrativa/progresso devem corresponder aos ataques reais; não contar dano/HP do chefe nem criar arma do protagonista. Textos de evasão/derrota permanecem corretos.

## Escudo, derrota e falas

- Escudo das Américas envolve o corpo com desenho de proteção legível; Flávio permanece visível, sem alfa de invisibilidade. Dura6s e protege como antes, acompanha salto/agachamento, sem tapar ameaças. Sinal de fim suave e sem flashes.
- Derrota: ilustração cartoon do mesmo Flávio com algemas, texto exato “Foi pego pela Polícia Federal!” logo abaixo e resumo/retentativa. Anatomia/identidade/roupa preservadas; não é foto nem alegação factual. Asset transparente novo, preservando os atlas.
- Recortes: pesquisar gravações públicas verificáveis; usar apenas pequenos trechos autênticos, com fonte/contexto e sem clonagem de voz. Falas eventuais sob o botão de som, não playlist. Se não houver arquivo verificável acessível, não inventar áudio nem atribuir voz sintética; relatar limite e manter efeitos existentes.

## Limites e validação

Sem pausa manual, armas de Flávio, playlist ou alterações em bots/n8n/outros sites. Preservar buffer120ms, toque simultâneo,100 passaportes/vida, colisões,5cenários/7km e contagem2027. Validar layout inicial/intermediário/compacto em320/390/768/1440, paisagem, zoom/texto, teclado, movimento reduzido; sequência real de chefes; geometria/pixels de fronteira/volta; escudo e derrota. Revisão independente e CI do SHA exato antes de publicar e conferir recursos/controles públicos. Não tratar testes como playtest humano ou prova de equivalência a jogos comerciais.

Fontes: [Calendário TSE2026](https://www.tse.jus.br/comunicacao/noticias/2026/Marco/eleicoes-2026-confira-as-principais-datas-do-calendario-eleitoral); [W3C, animação de interação](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions); [NN/g, visibilidade do estado](https://www.nngroup.com/articles/visibility-system-status/).
