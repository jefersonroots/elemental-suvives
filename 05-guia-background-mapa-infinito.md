# 05 - Guia de Background e Mapa Infinito

Este guia define como criar e implementar o background da primeira fase do jogo, usando como
referencia visual a imagem `.concept-art/background.png`: ruinas noturnas, cristais elementais,
vegetacao brilhante, pedras antigas e um altar central.

O objetivo nao e usar uma imagem gigante como mapa. O objetivo e transformar essa direcao de
arte em pecas reutilizaveis, para criar a sensacao de mapa infinito como em jogos estilo
Vampire Survivors.

## Ideia central

O mapa deve parecer infinito, mas tecnicamente ele sera montado em volta do jogador.

Em vez de desenhar um mundo enorme, o jogo deve:

- dividir o mundo em chunks;
- gerar somente os chunks perto da camera;
- reciclar ou esconder chunks muito distantes;
- usar uma seed por coordenada de chunk, para que o mesmo lugar possa ser recriado igual se o
  jogador voltar.

Para o jogador, isso cria a sensacao de exploracao continua. Para o motor, mantem o custo baixo.

## Nome da fase inicial

**Fase 1: Ruinas Elementais Noturnas**

Tema:

- floresta/ruina escura;
- pedras antigas;
- cristais magicos;
- pequenas fontes de luz azul, verde e vermelho;
- vegetacao bioluminescente;
- altar central de spawn do heroi.

Essa fase combina bem com o sistema elemental atual:

- fogo: cristais/vermelhos, brasas, altares;
- planta: musgo, folhas, raizes, brilho verde;
- agua futura: poas, fontes, cristais azuis.

## Estrutura visual por camadas

### Camada 1 - Chao base

Funcao: dar leitura, contraste e continuidade.

Regras:

- deve ser escuro e pouco contrastado;
- nao pode competir com inimigos, projeteis ou gemas de XP;
- deve ter variacao suficiente para nao parecer um tabuleiro repetido;
- deve ser desenhado abaixo de tudo.

Assets sugeridos:

- tile de terra escura;
- tile de pedra rachada;
- tile com musgo baixo;
- tile com pequenas marcas de caminho;
- tile de sombra mais profunda.

Tamanhos sugeridos:

- `16x16`: ideal para pixel art mais granular;
- `32x32`: ideal se os sprites do cenario tiverem mais detalhe;
- evitar tiles maiores no comeco, porque dificulta variar o chao.

Primeira implementacao recomendada:

- manter o grid visual atual como base temporaria;
- trocar aos poucos por tiles desenhados;
- gerar variacao por posicao usando uma funcao deterministica.

### Camada 2 - Detalhes pequenos

Funcao: quebrar repeticao sem atrapalhar gameplay.

Esses detalhes nao devem ter colisao no primeiro momento.

Assets sugeridos:

- pedras pequenas;
- pedrinhas quebradas;
- rachaduras;
- mato baixo;
- fungos brilhantes;
- folhas no chao;
- pontos de luz magica;
- mini cristais;
- ossos pequenos;
- raizes finas.

Tamanhos sugeridos:

- `8x8` para brilhos e pedrinhas;
- `16x16` para mato, fungos e cristais pequenos;
- `24x24` para pedras medias;
- `32x32` apenas para detalhes que precisam aparecer bem.

Densidade inicial:

- 8 a 16 detalhes pequenos por chunk;
- evitar colocar muitos perto do centro da tela se atrapalhar a leitura;
- usar alpha/brilho com cuidado, porque muitos brilhos podem cansar.

### Camada 3 - Props grandes

Funcao: criar identidade da fase.

No primeiro momento, props grandes tambem podem ser apenas decorativos. Colisao pode vir depois,
quando o gameplay ja estiver equilibrado.

Assets sugeridos:

- coluna quebrada;
- arco de ruina;
- altar elemental;
- cristal grande azul;
- cristal grande vermelho;
- pedra coberta de musgo;
- raiz grande;
- fonte pequena;
- circulo ritual no chao;
- tumulo/obelisco;
- parede quebrada baixa.

Tamanhos sugeridos:

- `32x32` para pedras, cristais pequenos e pilares baixos;
- `48x48` para colunas e altares medios;
- `64x64` para cristais grandes, arcos e fontes;
- `96x64` ou `96x96` para estruturas raras, como portal ou altar de chefe.

Densidade inicial:

- 0 a 3 props grandes por chunk;
- props grandes devem ser raros o bastante para serem lembrados;
- nao colocar muitos objetos grandes grudados no jogador, para nao parecer poluido.

### Camada 4 - Marcos especiais

Funcao: dar orientacao e momentos memoraveis.

Esses pontos podem ser fixos ou gerados por regra especial.

Exemplos:

- altar central no `0,0`, onde a run comeca;
- arena de chefe em uma regiao futura;
- portal quebrado;
- circulo ritual;
- cristal elemental raro;
- fonte de cura futura;
- bau futuro;
- entrada de ruina.

Primeira implementacao:

- criar somente o altar central;
- depois adicionar 1 ou 2 marcos raros longe do centro;
- evitar transformar o mapa em labirinto.

## Chunks

Um chunk e um pedaco quadrado do mundo.

Configuracao recomendada:

- tamanho do tile: `16px`;
- tamanho do chunk: `256x256px`;
- cada chunk contem `16x16` tiles;
- manter ativos os chunks em um raio de 2 a 3 chunks ao redor da camera.

Exemplo:

- jogador esta no chunk `(0, 0)`;
- renderizar de `(-2, -2)` ate `(2, 2)`;
- total: 25 chunks ativos;
- quando o jogador muda de chunk, gerar os novos e remover os distantes.

Isso e barato e suficiente para a camera atual.

## Geracao deterministica

Cada chunk deve usar uma seed baseada em sua coordenada.

Exemplo conceitual:

```ts
const seed = hash(`${chunkX}:${chunkY}:ruinas-elementais`);
```

Com isso:

- o chunk `(4, -2)` sempre tera decoracao parecida;
- se o jogador sair e voltar, o lugar nao muda do nada;
- o mapa parece persistente sem salvar todos os objetos.

## Regras de distribuicao

### Chao

- sempre preencher tudo;
- variar tiles por ruido leve;
- criar manchas de musgo ou pedra, nao alternancia aleatoria demais.

Boa sensacao:

- 70% terra/pedra escura;
- 15% pedra rachada;
- 10% musgo baixo;
- 5% detalhes de caminho.

### Detalhes pequenos

- posicionar com chance por tile ou por pontos aleatorios;
- nao repetir o mesmo asset varias vezes lado a lado;
- usar mais detalhes nas bordas do chunk e menos no centro da camera.

### Props grandes

- usar poucos;
- deixar espaco livre em volta;
- evitar bloquear spawn, projeteis e movimento no MVP;
- quando houver colisao futura, manter area de passagem clara.

### Marcos especiais

- altar central deve ser fixo no mundo;
- chefes podem ter arena fixa por tempo/fase;
- pontos raros podem aparecer por distancia minima do centro.

## Paleta sugerida

Base escura:

- quase preto azulado: `#080d18`;
- azul noite: `#101827`;
- pedra fria: `#1c2638`;
- pedra media: `#2c3448`;

Luzes frias:

- azul cristal: `#2f8cff`;
- ciano magico: `#36f5ff`;
- brilho claro: `#b9fbff`;

Planta/bioluminescencia:

- verde profundo: `#12382c`;
- verde musgo: `#2f7d4c`;
- verde neon suave: `#49f2a1`;

Fogo/cristal vermelho:

- vermelho escuro: `#5b1624`;
- vermelho cristal: `#ff3f5f`;
- laranja quente: `#ff9b3d`;

Regras de uso:

- chao deve ficar nas cores escuras;
- brilhos devem ocupar pouca area;
- azul/ciano pode ser a luz principal da fase;
- vermelho deve destacar pontos de fogo, nao dominar tudo;
- verde deve aparecer em vegetacao e musgo.

## Leitura de gameplay

O background nunca pode atrapalhar:

- projeteis;
- inimigos;
- gemas de XP;
- numeros de dano;
- area das habilidades;
- boss telegraphs futuros.

Regras praticas:

- evitar props com silhueta parecida com inimigos;
- evitar vermelho/laranja muito forte perto de projeteis de fogo;
- evitar azul muito forte perto de gemas de XP;
- manter o centro da tela mais limpo que as bordas;
- reduzir contraste de assets decorativos se eles chamarem atencao demais.

## Como implementar no projeto

### Passo 1 - Sistema simples de chunks

Criar um sistema dedicado, por exemplo:

```text
src/game/systems/background.ts
```

Responsabilidades:

- descobrir em qual chunk o heroi esta;
- manter um mapa de chunks ativos;
- gerar chunks novos;
- remover chunks distantes;
- desenhar chao e decoracoes em containers separados.

### Passo 2 - Separar containers

Dentro do `worldLayer`, a ordem ideal sera:

```text
backgroundGroundLayer
backgroundDetailLayer
gemLayer
abilityLayer
enemyLayer
projectileLayer
damageNumberLayer
hero
```

Observacao: props grandes que devem ficar atras do heroi podem ficar no detalhe. Props que
precisam aparecer na frente do heroi devem ter uma camada propria no futuro.

### Passo 3 - Comecar com graphics/code art

Antes de ter tiles finais, podemos gerar por codigo:

- quadrados/tiles escuros;
- pedras pequenas;
- cristais simples;
- manchas de musgo;
- pontos de brilho.

Isso valida o sistema sem bloquear na arte.

### Passo 4 - Substituir por sprites

Quando os assets estiverem prontos:

- colocar tiles em `art/background/tiles`;
- colocar props em `art/background/props`;
- empacotar em atlas;
- trocar os `Graphics` por `Sprite`.

## Estrutura de pastas sugerida

```text
art/
  background/
    tiles/
      ground_dark_01.png
      ground_dark_02.png
      stone_cracked_01.png
      moss_01.png
    details/
      pebble_01.png
      grass_glow_01.png
      mushroom_blue_01.png
      root_small_01.png
    props/
      crystal_blue_large_01.png
      crystal_red_large_01.png
      ruin_column_01.png
      ruin_arch_01.png
      altar_center_01.png
      fountain_small_01.png
```

## Lista inicial de assets para produzir

Prioridade alta:

- 4 tiles de chao escuro `16x16`;
- 2 tiles de pedra rachada `16x16`;
- 2 tiles de musgo baixo `16x16`;
- 3 pedras pequenas `8x8` ou `16x16`;
- 3 tufos de mato brilhante `16x16`;
- 2 cristais pequenos azuis `16x16`;
- 2 cristais pequenos vermelhos `16x16`;
- 1 altar central `64x64`;
- 1 coluna quebrada `32x48`;
- 1 pedra grande com musgo `32x32`.

Prioridade media:

- arco de ruina `64x64`;
- fonte pequena `64x64`;
- circulo ritual de chao `64x64`;
- poa azul brilhante `48x32`;
- raiz grande `64x32`;
- cogumelos luminosos `16x16`.

Prioridade futura:

- portal de chefe;
- arena de chefe;
- props com colisao;
- variações por bioma;
- assets especificos de agua quando o elemento agua entrar.

## O que nao fazer agora

- Nao criar uma imagem unica gigante de background.
- Nao colocar parede/labirinto com colisao antes do combate estar equilibrado.
- Nao usar props grandes demais em excesso.
- Nao criar muitos biomas antes da primeira fase estar boa.
- Nao gastar tempo com parallax complexo agora.

## Definicao de pronto da primeira versao

A primeira versao do background infinito estara pronta quando:

- o jogador puder andar em qualquer direcao sem chegar no fim visual do mapa;
- o chao nao parecer uma grade simples repetida;
- houver props e detalhes suficientes para lembrar ruinas magicas;
- o altar central existir no inicio da run;
- inimigos, projeteis e XP continuarem mais legiveis que o cenario;
- o jogo continuar leve com muitos inimigos em tela.

## Caminho recomendado

1. Implementar chunks com arte gerada por codigo.
2. Adicionar altar central em `0,0`.
3. Adicionar decoracao pequena procedural.
4. Adicionar props grandes raros.
5. Validar leitura em gameplay.
6. Substituir graphics por sprites finais aos poucos.
7. So depois pensar em colisao de cenario e novos biomas.

