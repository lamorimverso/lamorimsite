# Corre, Flávio! — qualidade visual, controles e página limpa

O usuário considera os personagens e a jogabilidade abaixo dos jogos de referência e pediu expressamente menos informação no site. Esta rodada melhora a apresentação e a resposta da corrida existente, preservando a sátira e as regras. Não se apresenta aprovação de testes como prova de diversão ou de qualidade artística.

## Evidências

- O atlas do herói tem seis desenhos com poses e acessórios inconsistentes; salto/agachamento vêm de outro atlas. PF, Janones e Exército têm apenas um quadro, movimentado inteiro como um recorte.
- `jumpRun` rejeita um salto solicitado pouco antes do pouso e rejeita pular enquanto abaixado.
- A página repete instruções, cenário, progresso e objetivo em várias faixas. O usuário quer voltar ao visual clean.
- Referências verificadas no projeto: Chrome Dino (estados de animação e simplicidade) e Jetpack Joyride 2 (acabamento de animação/arte). Não copiar assets dessas marcas nem prometer equivalência de produção.

## Direção e alternativas

Direção adotada: cartoon 2D coeso, com a identidade dos personagens escolhidos e interface discreta. É o refinamento mais próximo do jogo existente. Um visual reduzido a silhuetas como o Dino mudaria a identidade; migrar para outra engine não resolve a arte e acrescenta risco. A pergunta opcional sobre direção não recebeu resposta; portanto isto é uma decisão do implementador, não uma preferência atribuída ao usuário. “Veneno” não foi identificado no histórico; cenários e projéteis existentes serão revisados, sem inventar um novo elemento.

## Mudanças

1. **Página:** preservar contagem e Compartilhar, reduzir o cabeçalho e o bloco inicial; uma barra compacta de placar, ícones de som/ampliação/ajustes. Ajuda completa recolhida. Remover do fluxo visível as instruções/objetivo repetidos. Mostrar recorde no fim. Informações acessíveis continuam no DOM. Não ocultar controles essenciais nem sobrepor avisos à pista.
2. **Arte:** dois atlas novos e versionados, mantendo originais. Herói em 4×3: oito passos de corrida; subida, descida, agachamento e derrota. Elenco 4×4: Xandão 0/1/2; PF3/13; Haddad4/5/6; Janones7/14; Lula8/9/10; Exército11/15; Joice12. Mesma paleta, contorno e proporções, transparência real e poses completas. A geração não manteve divisões nominais; recortes explícitos isolam os personagens sem mutilar a arte. Validação visual obrigatória antes de incorporar; se a geração não satisfizer, preservar a arte válida e registrar o limite.
3. **Animação:** registro estável, oito passos do protagonista, dois passos para os três perseguidores; poses do mesmo herói para ações. Não esmagar a pose de agachamento; uma escala uniforme limita a pose baixa a48unidades lógicas em escala1, preservando sua proporção e a leitura dos ataques altos. Dimensões por personagem estáveis; nenhuma alteração da hitbox causada pelo recorte.
4. **Cenários:** módulo Canvas separado com três planos limpos, marcos das cinco cidades e chão mais bem definido. Sem cartazes, textos decorativos ou novas colisões. Paralaxe congelada com movimento reduzido. A pista continua legível sob os personagens.
5. **Controles:** buffer de salto de 120ms apenas para uma nova pressão no ar. Ao pousar nesse intervalo, executar uma vez. Salto enquanto abaixado sai da postura e salta; uma intenção de abaixar mantida continua válida no pouso. Não criar salto duplo nem salto automático por manter a tecla. Limpar intenções na perda de foco.

## Regras e limites

Flávio segue voltado à direita e apenas foge/desvia. Sem ataque, playlist ou pausa manual. Cinco cenários, 7.000m de rota por cenário, 100 passaportes por vida, escudo de6s e chefões tardios preservados. Frase de derrota: “Foi pego pela Polícia Federal!”. Não alterar bots, n8n, outros sites ou regras jurídicas existentes. Sem nova dependência no navegador.

## Conclusão verificável

Regressões reais de buffer/salto, atlas sem vazamento entre células, carregamento e todos os estados da página. Inspecionar capturas320/390/768/1440 e paisagem844×390. Pista/comandos cabem sem rolagem horizontal, avisos não cobrem a corrida. Executar suíte completa e CI no SHA final; publicar e conferir recursos e início na URL pública. Playtest humano e celular físico permanecem não realizados; não declarar qualidade igual à dos exemplos por inferência.
