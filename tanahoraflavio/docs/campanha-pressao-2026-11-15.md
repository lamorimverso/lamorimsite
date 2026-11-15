# Campanha e animação — 15 de novembro de 2026

A continuação usa o backup da conversa e a versão publicada na PR54. A História mantém oito mapas e 17 encontros obrigatórios, com Santiago Peña como aliado no Paraguai.

| Mapa | Ordem dos encontros obrigatórios | Inimigos comuns |
| --- | --- | --- |
| Brasília | Ana Elisa → Xandão | PF e barreiras |
| Rio | Rick Azevedo → Joice | Patrulha da orla e barreiras |
| São Paulo | Guilherme Cortez → Erika Hilton | Patrulha paulista e painéis |
| Argentina | Soraya → Dilma | Patrulha da rota e malas |
| Paraguai | Fiscal da Ponte (travessia) → Haddad/Taxad | Exército e barreiras |
| Flórida | Boulos → Simone Tebet | Guardas do terminal e malas |
| Casa Branca | Dino → Fantasma do Comunismo | Fantasmas e barreiras |
| Volta a Brasília | O Povo Brasileiro (travessia) → Janones → Presidente Lula | Lula e Zé Gotinha |

Os rivais opcionais e os poderes próprios de cada chefe continuam disponíveis. Os tiros normais interceptam projéteis; para ferir o chefe é necessário devolver seu ataque. Travessias continuam sem dano por tiro.

## Toc, toc e dificuldade

A entrada especial da Joice é garantida em cada mapa da História, em cada destino do Infinito e a cada nova volta. Quando um confronto, transformação ou intervalo de recuperação ocupa a entrada, a rota reserva espaço antes da transição e realiza o encontro pendente. O áudio e os dez segundos ativos são preservados.

A velocidade e a pressão aumentam mais cedo e continuam crescendo com distância e tempo. Há mais entradas pela retaguarda, ameaças laterais e ondas tardias próximas. Os chefes aceleram conforme posição na campanha, categoria, fase e revanche. Os limites de reação e os espaços necessários para escapar de ataques em direções opostas continuam protegidos.

Os atacantes comuns usam figurino, arma e projétil da localidade. Chefes de outros mapas deixam de entrar no sorteio desses ataques comuns; seus confrontos próprios continuam na hierarquia.

## Flávio abaixado

O novo atlas transparente tem oito poses de corpo inteiro: quatro abaixado e quatro atirando abaixado. Ombros, braços, pernas dobradas e pés formam uma figura contínua. O desenho mantém a roupa roxa e amarela, o telefone e a arma IVER. A saída do tiro acompanha o cano nos dois sentidos; altura física e passagem sob ataques altos são preservadas.

[Prévia das poses em tamanho de jogo](flavio-crouch-review-2026-11-15.webp). A origem e os hashes estão em `../assets/flavio-crouch-v1.source.json`.

## Validação

- Vinte campanhas completas com decisões legais: todas concluídas e com Joice presente nos oito mapas.
- Dois mil percursos legais para verificar que a pressão não combina contatos inevitáveis em direções opostas.
- Verificação real no navegador dos oito atacantes regionais e dos avisos da Joice, em celular e desktop.
- 29 testes de renderização Canvas e revisão independente da animação, carregamento e geometria do disparo.
- Regressões específicas para transformação atravessando o horário da Joice, prioridade antes do chefe e reserva antes da troca de mapa.
