# Revisão de corpos completos e armas proporcionais

O print mostrava uma cabeça ilustrada sobre um corpo genérico de torso plano e braços/pernas feitos com linhas grossas. A existência de movimento não demonstrava que o corpo estivesse desenhado com o mesmo acabamento da cabeça.

## Corpos

- Membros passaram a ser formas fechadas com volume, luz e sombra: braço, antebraço, palma, dedos, coxas, joelhos, panturrilhas e sapatos.
- Roupas têm silhuetas e acabamento próprios: blazer ajustado, blusa, casaco longo, colete, terno, roupa tática, uniforme, toga, traje real e mascote. Há lapelas, punhos, bolsos, botões, cintos, costuras e dobras.
- A mesma estrutura atende chefes nas naves, disparo de Flávio e corredores especiais; as cabeças e os ciclos de corrida dos atlas permanecem disponíveis. Bossonari preserva o rosto ficcional e ganha olhos, sobrancelhas, nariz e boca desenhados.
- Preparação, lançamento e recuperação articulam as partes do corpo. Os pés continuam apoiados no convés durante a conjuração.

[Prancha animada do elenco completo de 32 personagens/formas](elenco-corpos-2026-11-13.webp)

## Armas e projéteis

Dezenove tipos receberam desenhos completos com materiais e partes reconhecíveis: metal e fechos das algemas, cabo/cabeça do martelo, grade/cabo do microfone, folhas e selos, planilhas, celular e mensagens, mãos com dedos, líquido/tampa/rótulo dos frascos, tecido/cordas da cruz com paraquedas, carimbo, barreiras, malas, pipoca e vendaval.

O código não estica mais o desenho pronto em apenas um eixo para preencher ataques altos. As proporções são construídas com cabos, correntes, páginas, antebraço e outras peças adequadas à dimensão do ataque. A tipografia, os dedos e as tampas mantêm proporções próprias. A renderização é vetorial e permanece nítida quando ampliada.

[Prancha animada das armas em três tamanhos](armas-detalhadas-2026-11-13.webp)

As pranchas são renderizações do código de desenho, destinadas à inspeção visual; não são gravações de uma partida. Não fazem parte do carregamento inicial do jogo.

## Verificação

- Testes de corpo excluem cabeça, nave e partículas da medição.
- Verificados corpos em escalas 0,6 / 1 / 2,5 e armas com larguras 16 / 46 / 138.
- Teste de navegador também usa dimensões reais do motor: mão 60×46, frascos 52×38, mala 40×30 e altura 84 dos ataques que pedem abaixar. Mede limites dos pixels e ocupação da altura do objeto.
- Animação interna é verificada sem os efeitos auxiliares. Movimento reduzido, equilíbrio do contexto Canvas, alinhamento e recortes continuam cobertos.
- Suíte completa: 504 testes aprovados. Verificações nativas de arte: 46 aprovadas. Piloto legal: 20/20 campanhas completas.
- Revisão independente de código e pranchas concluída. A asserção antiga que exigia deformação vertical foi substituída por construção proporcional e medições de limites reais no navegador.

Esta alteração é visual: mantém IA, controles, vozes, tempos, posições físicas, classes, progressão, 20 encontros, primeiro chefe aos 22 km, jacaré por 10 segundos e urna final. Avaliação de gosto artístico e conforto em aparelhos físicos continua distinta de validação automática.
