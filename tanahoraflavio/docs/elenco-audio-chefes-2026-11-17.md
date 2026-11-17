# Corre, Flávio! — revisão de elenco, áudio e chefes

Base comparativa `f1b3131`, último commit do PR #59 na auditoria. Trabalho em três fases. Esta revisão é do minigame e não modifica a publicação, a contagem regressiva, a transformação do jacaré nem o percurso aéreo.

## 1. Diagnóstico

| Área | Evidência na base |
| --- | --- |
| Arte | Dez figuras vetoriais usavam o mesmo corpo e gestos definidos pela classe. Para Ana Elisa e Rick, a máscara da área do corpo era idêntica sem cor. A multidão do Povo erguia os próprios pés com a oscilação do corpo. |
| Áudio | Os onze atores da revisão não tinham uma entrada própria. Seus lançamentos recorriam a avisos genéricos de altura e queda. O Fiscal, Renato e O Povo são passagens nas quais um bloqueio não é um ferimento. |
| Chefes | Uma abertura de reflexão comum já podia aparecer cedo, mas a abertura conquistada ao ler a arma característica demorava muito em parte da campanha. No piloto agressivo, Rick podia cair antes de completar os seis pulsos. Haddad e Simone podiam perder antes de exibir a abertura característica. |

## 2. Elenco e áudio

Ana Elisa, Rick, Guilherme Cortez, Erika e Fiscal receberam nova silhueta, traje, poses de ação e retrato. O pacote também cobre os cinco opcionais, Renato, Jones, Maestro, Sofia e Capitã. O Povo Brasileiro tem cinco corpos apoiados no chão e gestos que acompanham a abertura da passagem. As poses essenciais permanecem distintas sem os movimentos decorativos.

Os onze ganharam efeitos próprios de entrada e de ação. Os sons seguem o aviso e o lançamento reais da jogabilidade. Nas passagens, o fechamento de uma oportunidade tem som diferente de dano. As gravações existentes continuam intactas e nenhuma voz foi inventada. Silenciar mantém todos os sinais visuais, as regras e os controles.

O comparativo de arte usa o mesmo enquadramento, classe e ação nas duas revisões. Para reproduzir, execute `node tools/preview-campaign-cast.mjs <checkout-base> <checkout-candidato> <pasta-saida>` com `@napi-rs/canvas` e `sharp`. Joice e Soraya aparecem como referências do atlas existente. O roteiro não altera os atlas nem grava arquivos dentro do aplicativo.

## 3. Progressão dos chefes

Brasília e São Paulo apresentam a janela especial mais cedo sem perder a mistura de marca e projétil. No Rio, Rick termina a sequência já anunciada e a pausa, mesmo que a energia chegue a zero antes. Na Argentina, Dilma ensina a rajada mais cedo. No Paraguai, o carimbo de Haddad vem antes do segundo conjunto de papéis. Na Flórida, Simone alterna fileira baixa, coluna e fileira alta. Casa Branca e retorno a Brasília mantêm os encontros já diferenciados. Não houve aumento global de energia ou corte global dos prazos de aviso.

### Primeira abertura especial conquistada

Tempos de simulação em segundos, com a semente 17, 120 passos por segundo e esquivas do piloto. Não são o tempo do primeiro projétil rebatível nem o tempo de uma vitória humana.

| Chefe | Largura lógica 480, base → revisão | Largura lógica 900, base → revisão |
| --- | ---: | ---: |
| Ana Elisa | 19,48 → 5,06 | 20,06 → 5,28 |
| Erika | 16,82 → 6,14 | 17,41 → 6,25 |
| Dilma | 13,65 → 3,62 | 14,26 → 3,77 |
| Haddad | 14,68 → 4,75 | 16,04 → 4,80 |
| Simone | 10,83 → 5,58 | 11,34 → 5,76 |

Nas seis corridas completas comparáveis, com três sementes e duas larguras, Rick lançou quatro pulsos na base e seis na revisão. Haddad e Simone passaram de nenhuma abertura característica observada para uma abertura observada nas seis corridas. As travessias continuam sem exigência de disparo e os opcionais continuam fora da sequência obrigatória.

Os testes verificam também que uma continuação por passaportes libera tanto a rajada de Rick quanto os projéteis descartados em outros duelos, sem contá-los como esquiva. O impacto usa o autor real do projétil, não a identidade do chefe que estiver na tela. A mão dos chefes redesenhados chega à origem física antes do lançamento, sem deslocá-la.

Para a regressão de rota, execute `node tools/check-story-campaign.mjs`. As 20 corridas locais fizeram a lição em São Paulo, concluíram o voo e chegaram à urna. A percepção de dificuldade, a audição em aparelhos físicos e a taxa de quadros em celulares não são inferidas dessas simulações.
