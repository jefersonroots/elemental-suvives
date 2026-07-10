# 02 — Guia de Arte

> Documento vivo. Regras de produção de pixel art — objetivo é que qualquer peça nova
> (própria ou de um agente de geração de imagem) saia consistente com o que já existe.

## Princípio central: densidade de pixel constante

Um "pixel de arte" (não confundir com pixel de tela) tem **o mesmo tamanho físico** em todo o
jogo — herói, inimigo, projétil, ícone. Isso significa que um inimigo comum, desenhado em
32×32, ocupa **metade** do herói de 64×64 *de propósito*: ele é visualmente menor porque é um
capanga, não porque foi desenhado numa escala diferente por acidente.

**Exibição**: sempre em zoom inteiro (2× ou 3×) com `PIXI.SCALE_MODES.NEAREST` (ou
equivalente v8) — nunca escala fracionária, nunca suavização. Pixel tem que ficar nítido.

## Antes de produzir arte nova

Você não está errado nem precipitado em querer um guia detalhado agora. Para jogo desse tipo,
um guia de arte cedo evita retrabalho. O cuidado é **não produzir arte final demais antes do
micro-loop estar validado**. Primeiro precisamos de assets suficientes para testar:
movimento, ataque, inimigos, XP, level up, feedback e chefe. Depois disso a arte final cresce
com mais segurança.

Regra prática:
- **Agora**: reaproveitar sprites existentes, gerar placeholders limpos, padronizar tamanho,
  paleta e nomes.
- **Depois do teste de 1 minuto**: refinar poderes mais usados e feedback visual.
- **Depois do teste de 3 minutos com chefe**: produzir chefe final, variações de pickups e
  arte dedicada de poderes.
- **Depois do MVP jogável**: arquétipos de inimigo novos, biomas extras, evolução de armas e
  itens permanentes colecionáveis.

## Tabela de tamanhos (canvas de origem)

| Asset | Canvas | Frames | Observação |
|---|---|---|---|
| Herói | **64×64** | usa os estados existentes (`andando`/`idle`/`feliz`/`surpreso`/`triste`/`morte`) | reaproveita `evolution_3` do AIxi |
| Inimigo tier 1 (`egg`) | **24×24** | usa `andando`/`idle` existente | mais fraco, mais frequente |
| Inimigo tier 2 (`evolution_1`) | **32×32** | usa `andando`/`idle` existente | padrão |
| Inimigo tier 3 (`evolution_2`) | **40×40** | usa `andando`/`idle` existente | mais forte, penúltimo antes do chefe |
| Chefe | **96×96** | 4–8 (arte nova, dedicada) | evento, primeiro asset 100% novo de inimigo |
| Projétil pequeno | **16×16** | 1–4 (ou rotação via engine) | dardo, espinho, bolha |
| Orbe / projétil médio | **32×32** | 2–4 | bola de fogo, orbe teleguiado |
| Área / aura | **64 → 128** | 4–8 (pulso) | campos persistentes, cresce com o poder |
| Impacto/explosão (compartilhado) | **32×32** | 5–6 | 1 sheet, tingido por elemento |
| Gema de XP / moeda / cura | **16×16** | 1–2 | pequeno, precisa ler rápido |
| Baú / item no chão | **32×32** | 1–2 | drop de chefe/tier 3 |
| Ícone de upgrade (carta de draft) | **32×32** desenhado, exibido grande | 1 | sem animação |
| Tile de chão | **32×32** | 1 (tileável) | repetição infinita sem costura |

Se o jogo pedir uma sensação mais "chunky" no futuro, a régua toda escala em 1,5× (48/96 em
vez de 32/64) — mas isso reduz quantos inimigos cabem legíveis na tela, o que vai contra o
pilar de "enxame". Decisão fechada por ora: **32/64**.

## Paleta sugerida

Estas cores são ponto de partida para manter identidade visual. Não precisam ser usadas como
limite rígido pixel a pixel, mas cada asset deve respeitar o papel dessas cores: fundo mais
escuro, personagem legível, elemento bem identificável, UI com alto contraste.

### Base do mundo e UI

| Uso | Cor | Hex | Observação |
|---|---|---|---|
| Fundo profundo | quase preto azulado | `#101018` | base do cenário e telas |
| Sombra fria | roxo escuro | `#211832` | contorno/sombra de UI e objetos |
| Pedra/chão escuro | azul ardósia | `#2C3448` | tiles, bordas, piso |
| Linha clara de UI | lavanda cinza | `#A7A4C8` | divisórias, texto secundário |
| Texto principal | quase branco quente | `#F4F0FF` | HUD e cartas |
| Ouro/recompensa | amarelo ouro | `#F6C85F` | moeda, destaque de recompensa |
| Perigo geral | vermelho coral | `#FF5A5F` | dano, alerta, telegraph perigoso |

### Elementos

| Elemento | Escuro | Médio | Claro | Brilho/efeito |
|---|---|---|---|---|
| Fogo | `#7A1F12` | `#E5522E` | `#FFB347` | `#FFF06A` |
| Planta | `#164A2E` | `#3FA35B` | `#8BE36A` | `#D8FF8F` |
| Água futuro | `#123A66` | `#2F80ED` | `#64D2FF` | `#C8F7FF` |
| Neutro/mágico | `#4B3B78` | `#8C6FE8` | `#D8C7FF` | `#FFFFFF` |

Regras de paleta:
- **Fogo** deve parecer agressivo: laranja, vermelho e amarelo claro em efeitos.
- **Planta** deve parecer estável/defensiva: verde profundo, verde vivo e brilho amarelado.
- **Água** fica planejada, mas não usar ainda em inimigos/heróis até existir sprite próprio.
- **Pickups** não devem competir com elementos: XP azul/ciano, ouro amarelo, cura verde-claro,
  bomba vermelho/laranja, ímã roxo/ciano.
- Evitar assets importantes dominados por bege/marrom, porque somem no chão e confundem com
  itens temporários como biscoito.

## Hierarquia visual em gameplay

Quando a tela estiver cheia, a ordem de leitura deve ser:

1. **Herói**: sempre mais legível que tudo, com contorno/sombra clara o bastante.
2. **Ameaças próximas**: inimigos encostando, telegraphs e chefe.
3. **Projéteis/áreas do jogador**: visíveis, mas sem esconder inimigos.
4. **XP e pickups**: chamativos, mas pequenos.
5. **Chão e decoração**: bonitos de longe, discretos de perto.

Se um asset bonito atrapalha essa ordem, ele precisa ser simplificado.

## Guia rápido de exportação

| Tipo | Formato | Fundo | Margem | Nome sugerido |
|---|---|---|---|---|
| Frame de sprite | PNG | transparente | 1–2 px vazios | `elemento_tier_estado_00.png` |
| Sheet animado | PNG | transparente | frames alinhados | `categoria_nome_sheet.png` |
| Ícone de carta | PNG 32×32 | transparente | objeto centralizado | `icon_nome.png` |
| Tile | PNG 32×32 | sem transparência ou transparente | tileável | `tile_bioma_nome.png` |
| VFX | PNG sheet | transparente | sem cortar brilho | `fx_nome_sheet.png` |

Nunca exportar com fundo branco/preto colado no sprite. Todo asset de personagem, poder,
pickup e VFX deve ter alpha transparente.

## Fase inicial: reaproveitar os sprites do AIxi (heróis E inimigos)

**Decisão de produção pro MVP**: em vez de desenhar arquétipos de inimigo do zero, o jogo
reaproveita os 4 estágios de evolução que o AIxi já tem por elemento — cada estágio vira uma
"unidade" diferente, sem custo de arte nova:

| Estágio no AIxi | Papel no jogo | Por quê |
|---|---|---|
| `evolution_3` (forma final/adulta) | **Herói jogável** | é a forma mais detalhada/poderosa — condiz com ser o personagem do jogador |
| `egg` | Inimigo tier 1 (mais fraco) | forma mais simples, HP baixo, combina com "primeira leva" |
| `evolution_1` | Inimigo tier 2 (médio) | intermediário |
| `evolution_2` | Inimigo tier 3 (mais forte antes do chefe) | mais robusto, penúltimo antes da forma final |

Isso soluciona "poucos personagens" de um jeito diferente do que tínhamos planejado
originalmente (recolor de arquétipos desenhados do zero): aqui a variedade vem de **estágios
já existentes**, e cada elemento contribui com sua própria progressão visual tier 1→2→3→herói.

**Cobertura de arte hoje**: só **fogo** e **planta** têm os 4 estágios completos. **Água não
tem nenhum sprite ainda** — por isso, na primeira versão jogável, o pool de elementos ativos
(heróis selecionáveis E elementos de inimigo) é **só fogo e planta**. Água entra no jogo
assim que tiver arte própria (não vamos usar o fallback visual do AIxi — que empresta os
sprites de planta pra água — porque no jogo isso criaria dois "inimigos de planta" visualmente
idênticos, mas de elementos diferentes, o que quebra a leitura tática).

Ao portar cada sprite (herói ou inimigo):
- Recortar pelo bounding box de conteúdo real (mesma lógica que o `build-atlas.mjs` do AIxi já
  calcula — `contentW/contentH` no manifesto), não pelo canvas cru.
- Centralizar e escalar pro grid do papel (herói → 64×64; inimigo tier 1/2/3 → ver tabela
  abaixo), mantendo proporção.
- **Herói**: reaproveitar os estados de animação relevantes — `andando` (movimento), `idle`
  (parado), `feliz` (reação de level-up/vitória), `surpreso` (reação de dano), `triste`/`morte`
  (fim de run). Não é necessário portar comer/dormir/etc, que não existem neste jogo.
- **Inimigo**: só precisa do estado `andando` (ou `idle` se o arquétipo ficar parado) como
  animação de movimento. **Sem animação de morte própria** — todo inimigo usa o mesmo
  puff/explosão compartilhado (tingido pela paleta do elemento) ao morrer, independente do
  estágio/elemento de origem.

### Tamanho dos inimigos por tier (usando os estágios do AIxi)

| Tier (estágio AIxi) | Canvas no jogo | Papel |
|---|---|---|
| `egg` | 24×24 | menor e mais fraco, aparece em maior quantidade |
| `evolution_1` | 32×32 | padrão do "inimigo comum" |
| `evolution_2` | 40×40 | mais forte, menos frequente |
| Chefe (dedicado, arte nova) | 96×96 | evento — este sim precisa de arte própria no futuro |

> Nota: como os 3 tiers de inimigo vêm do MESMO recorte de conteúdo (bbox real), a diferença
> de tamanho entre eles é só de **escala de exibição**, não de detalhe do desenho — mantém a
> regra de densidade de pixel constante.

## Pacote de assets do MVP

Esta é a lista concreta para não ficar perdido. Se algo não está aqui, provavelmente não é
necessário antes do primeiro protótipo jogável.

### Heróis

| Asset | Obrigatório? | Origem | Canvas | Estados |
|---|---|---|---|---|
| Herói Fogo | sim | `evolution_3` fogo | 64×64 | `idle`, `andando`, `surpreso`, `feliz`, `morte` |
| Herói Planta | sim | `evolution_3` planta | 64×64 | `idle`, `andando`, `surpreso`, `feliz`, `morte` |
| Herói Água | futuro | arte nova | 64×64 | mesmos estados |

Prioridade: primeiro fazer Fogo jogável. Planta entra quando seleção de herói existir.

### Inimigos comuns

| Inimigo | Obrigatório? | Origem | Canvas | Papel |
|---|---|---|---|---|
| Fogo `egg` | sim | sprite existente | 24×24 | inimigo fraco |
| Planta `egg` | sim | sprite existente | 24×24 | inimigo fraco |
| Fogo `evolution_1` | MVP completo | sprite existente | 32×32 | inimigo médio |
| Planta `evolution_1` | MVP completo | sprite existente | 32×32 | inimigo médio |
| Fogo `evolution_2` | MVP completo | sprite existente | 40×40 | inimigo forte |
| Planta `evolution_2` | MVP completo | sprite existente | 40×40 | inimigo forte |
| Água tiers 1–3 | futuro | arte nova | 24/32/40 | fecha triângulo elemental |

Inimigos comuns precisam de pouca animação. `andando` resolve quase tudo; `idle` pode ser
fallback. Não produzir animação de ataque/morte própria no MVP.

### Chefe

| Asset | Obrigatório? | Canvas | Frames | Direção |
|---|---|---|---|---|
| Chefe 1 | sim, mas pode ser simples | 96×96 | 4–8 | silhueta grande, leitura imediata |
| Telegraph do chefe | sim | 64–128 | 2–4 | aviso de área/ataque antes do dano |
| Drop/recompensa de chefe | opcional no MVP | 32×32 | 1–2 | baú, fragmento ou item temporário |

O primeiro chefe não precisa ter arte complexa, mas precisa ter **forma diferente dos inimigos
comuns**. Ele pode ser uma versão maior e mais ameaçadora inspirada nos elementos, desde que
não pareça só um `evolution_2` escalado.

### Pickups

| Pickup | Obrigatório? | Canvas | Cor sugerida | Observação |
|---|---|---|---|---|
| Gema de XP pequena | sim | 16×16 | ciano/azul | drop comum |
| Gema de XP grande | recomendado | 16×16 | ciano claro/branco | drop de tier forte/chefe |
| Ouro | MVP meta | 16×16 | amarelo ouro | moeda ou cristal dourado |
| Cura | MVP meta | 16×16 | verde claro/branco | coração, folha ou cruz estilizada |
| Ímã | MVP meta | 16×16 ou 24×24 | roxo/ciano | precisa ler como coleta global |
| Bomba | MVP meta | 16×16 ou 24×24 | vermelho/laranja | pickup de emergência |

### VFX obrigatórios

| VFX | Obrigatório? | Canvas | Frames | Uso |
|---|---|---|---|---|
| Hit flash | sim | runtime/tint | 1 | inimigo pisca ao tomar dano |
| Impacto pequeno | sim | 32×32 | 4–6 | projétil acertando |
| Morte/puff | sim | 32×32 | 5–6 | todo inimigo comum |
| Level up | recomendado | 64×64 ou tela | 4–8 | onda curta no herói |
| Telegraph de área | sim para chefe | 64–128 | 2–4 | aviso antes de ataque perigoso |
| Coleta de XP | recomendado | 16×16 | 2–4 | brilho/trilha quando gema é puxada |

### Chão e cenário

| Asset | Obrigatório? | Canvas | Observação |
|---|---|---|---|
| Tile base de chão | sim | 32×32 | repetição infinita sem costura |
| Variações de chão | recomendado | 32×32 | 2–4 tiles para quebrar repetição |
| Decoração pequena | futuro | 16×16/32×32 | pedras, folhas, marcas no chão |
| Obstáculos sólidos | fora do MVP | 32×32/64×64 | só se o design pedir colisão de cenário |

No MVP, o mapa pode ser quase vazio. Cenário demais atrapalha leitura do enxame.

### UI e cartas

| Asset/UI | Obrigatório? | Tamanho | Observação |
|---|---|---|---|
| Ícone de arma/poder | sim | 32×32 | aparece grande na carta |
| Moldura de carta | HTML/CSS | flexível | não precisa ser sprite |
| Ícone de elemento | recomendado | 16×16/24×24 | fogo, planta, água futuro |
| Barra de HP | HTML/CSS | flexível | cor clara e legível |
| Barra de XP | HTML/CSS | flexível | azul/ciano |
| Slots de arma | recomendado | 32×32 cada | mostram build atual |

## Evolução futura: arquétipos desenhados (pós-MVP)

Quando fizer sentido investir em arte de inimigo dedicada (não mais emprestada do AIxi), a
estratégia original continua válida como próximo passo: **poucos arquétipos desenhados à mão
(blob/voador/bruto/atirador), exportados em paleta por elemento** — 1 desenho gera N inimigos
distintos. Regras de acabamento pra quando isso acontecer:
- Paleta desenhada à mão por versão, não gerada por `tint` de runtime (tint só pro flash
  branco de dano).
- Silhueta forte + 1 ponto de leitura, reconhecível em miniatura no meio do enxame.
- Continua sem animação de morte própria — mesmo puff compartilhado.

### Arquétipos futuros de monstro

Não criar estes antes do MVP precisar deles. Eles entram quando `egg`/`evolution_1`/
`evolution_2` já não forem suficientes para variedade.

| Arquétipo | Canvas | Silhueta | Comportamento | Variação elemental |
|---|---|---|---|---|
| Blob | 32×32 | corpo redondo/baixo | anda direto até o herói | cor e detalhe do elemento |
| Voador | 32×32 | asas ou flutuação clara | move mais rápido, menos HP | asa de fogo/folha/gota |
| Bruto | 48×48 | ombros/corpo largo | lento, muito HP, contato forte | chifres, casca, vapor |
| Atirador | 40×40 | corpo com "boca"/canhão | para e dispara projétil | projétil do elemento |
| Invocador | 48×48 | cajado/núcleo visível | chama inimigos pequenos | aura do elemento |

Regra: arquétipo deve ser reconhecido pela **silhueta**, elemento pela **cor/detalhe**. Se a
cor for removida e o jogador não souber se é bruto ou voador, o desenho falhou.

### Chefes futuros

| Chefe | Canvas | Ideia visual | Mecânica |
|---|---|---|---|
| Chefe Fogo | 96×96 | núcleo/chifres/chamas grandes | investida ou explosões em área |
| Chefe Planta | 96×96 | raízes/copa/casca grossa | prende área, invoca brotos |
| Chefe Água futuro | 96×96 | corpo fluido/orbe central | projéteis curvos ou ondas |

Checklist visual de chefe:
1. Ocupa mais espaço que qualquer inimigo comum.
2. Tem ponto focal claro: olho, núcleo, boca, cristal ou símbolo.
3. Tem telegraph próprio antes do ataque forte.
4. Tem efeito de morte/recompensa mais chamativo que inimigo comum.
5. Não depende de texto para o jogador entender que é chefe.

## Poderes / armas: onde a arte se concentra

5 famílias, mapeadas conceitualmente nas 5 categorias de XP do AIxi (não há dependência de
código — é só herança de linguagem visual/temática):

| Família | Arquétipo de arma | Tamanho | Comportamento |
|---|---|---|---|
| foco | projétil perfurante | 16×16 | viaja reto, atravessa inimigos |
| sabedoria | orbe teleguiado | 32×32 | persegue o inimigo mais próximo |
| organizacao | zona/área | 64→128 | fica no chão, pulsa, dano contínuo em raio |
| vinculo | aura/familiar orbital | 32×32 | gira ao redor do herói |
| constancia | corrente/dano contínuo | 16×16 (segmento tileável) | "tica" dano ao longo do tempo |

Regras:
- Poucos frames (2–6) por arma — o efeito precisa ler em movimento rápido, não em detalhe
  parado.
- Cores vivas e alto contraste — pensar em **blend aditivo** (glow) desde o desenho: áreas
  claras/saturadas funcionam melhor com aditivo do que gradientes suaves.
- **Impacto/explosão compartilhado** entre armas (mesmo sheet do impacto de inimigo, ou um
  próprio de arma — decidir na produção), só variando a cor por elemento.
- Cada arma tem 1 variante por elemento reaproveitando o mesmo sheet-base + paleta, igual aos
  inimigos.

## Habilidades placeholder (fase de testes)

Antes de existir arte dedicada de poder (seção acima), o MVP usa **itens já desenhados no
AIxiliar** como ícone/visual temporário de cada habilidade em teste. Fonte inicial:
`C:\Users\jefee\Desktop\PROJETOS\AIxiliar\art`.

| Item | Uso placeholder sugerido | Comportamento de teste |
|---|---|---|
| Copo | habilidade de sustain/controle | projétil ou área pequena que reduz velocidade dos inimigos atingidos |
| Biscoito | habilidade de dano simples | projétil rápido, bom para testar cadência e colisão |
| Seringa | habilidade de perfuração ou veneno | projétil em linha reta com DoT curto |
| Ícone de morte | habilidade de burst | explosão pequena ou execute em inimigos com HP baixo |
| Cocozinho | habilidade de zona | área no chão que causa dano por tick enquanto o inimigo pisa |

Regra: estes ícones são **temporários**, só pra ter algo visual nos primeiros testes de
gameplay (marcos 2–4 do roadmap) — não seguem a tabela de tamanho/produção de poder "de
verdade" (a da seção anterior). Substituir por arte de poder dedicada assim que o slice
jogável validar a mecânica.

Como placeholders, eles não precisam respeitar perfeitamente a fantasia elemental. A função
principal é destravar teste de gameplay: cooldown, mira automática, dano em área, DoT, colisão
e leitura visual no caos.

## Guia de poderes e assets necessários

Cada poder deve ter pelo menos:
1. **Ícone de carta** 32×32.
2. **Sprite ativo** usado no gameplay.
3. **VFX de impacto** ou regra clara de reaproveitamento do impacto compartilhado.
4. **Cor/variante elemental**, quando o poder causar dano elemental.

### Poderes placeholder do MVP

| Poder teste | Placeholder | Canvas ativo | Papel no jogo | VFX necessário |
|---|---|---|---|---|
| Disparo simples | Biscoito | 16×16 | projétil rápido para testar mira/cadência | impacto pequeno |
| Copo lento | Copo | 16×16 ou 24×24 | projétil/área pequena que aplica lentidão | splash pequeno |
| Seringa perfurante | Seringa | 16×16, alongado | linha reta, perfura e aplica DoT curto | hit fino + tick |
| Marca da morte | Ícone de morte | 24×24/32×32 | explosão ou execute em alvo com HP baixo | burst circular |
| Poça perigosa | Cocozinho | 32×32 ou área 64×64 | zona no chão com dano por tick | pulso de área |

### Versões finais sugeridas

| Família | Poder final sugerido | Visual | Comportamento | Elementos |
|---|---|---|---|---|
| foco | Lança elemental | dardo/chama/espinho/agulha | projétil reto perfurante | fogo/planta/água |
| sabedoria | Orbe perseguidor | esfera brilhante com núcleo | busca inimigo próximo | fogo/planta/água |
| organizacao | Zona ritual | círculo/runa no chão | dano por tick em área | fogo/planta/água |
| vinculo | Satélite familiar | pequena folha/chama/orbe orbitando | gira ao redor do herói | fogo/planta/água |
| constancia | Marca/veneno | partícula presa no inimigo | DoT por alguns segundos | fogo/planta/água |

### Como desenhar cada família

- **Projétil perfurante**: silhueta comprida, ponta clara, cauda curta. Deve apontar na
  direção do movimento. Melhor canvas: 16×16 ou 24×16.
- **Orbe teleguiado**: forma circular com núcleo claro e borda do elemento. Pode ter 2–4
  frames de pulso. Melhor canvas: 32×32.
- **Zona/área**: círculo baixo no chão, com borda mais forte que o centro para não esconder
  inimigos. Melhor canvas: 64×64 no nível 1, podendo escalar visualmente até 128×128.
- **Orbital**: objeto pequeno e muito legível, com rastro sutil. Melhor canvas: 24×24 ou 32×32.
- **DoT/marca**: símbolo pequeno sobre o inimigo ou partícula colada nele. Melhor canvas:
  16×16, com variação de cor por elemento.

### Cores por poder elemental

| Elemento | Projétil | Área | Impacto |
|---|---|---|---|
| Fogo | núcleo amarelo, borda laranja/vermelha | círculo laranja com centro escuro | faísca amarela/vermelha |
| Planta | núcleo verde claro, borda verde escuro | folhas/espinhos no aro | partículas verdes/amarelas |
| Água futuro | núcleo branco/ciano, borda azul | ondulação azul clara | gotículas/círculo ciano |

Não usar só `tint` em tudo como solução final. `Tint` serve para protótipo, flash de dano e
variações temporárias. Asset final deve ter pequenos detalhes próprios por elemento.

## Outros assets

- **Pickups**: gema de XP (16×16, com brilho pulsante), moeda/ouro, cura, ímã (efeito visual
  de "puxão"), bomba (limpa a tela — precisa de um efeito de tela cheia notável).
- **Tiles de chão**: 1–2 biomas no MVP, 32×32, tileáveis sem costura visível em repetição.
- **VFX compartilhados**: rastro de dano, telegrafo de spawn (aviso antes do inimigo aparecer),
  onda de level-up (feedback de "subiu de nível" na hora), círculo de coleta do ímã.
- **HUD/UI**: segue o tema "dark crystal" do AIxi por consistência de marca entre os dois
  projetos, mas é HTML/CSS (não sprite) — ver `01-arquitetura-tecnica.md`.
- **Fonte bitmap**: números de dano e textos do HUD em fonte pixel própria — precisa ser
  legível em qualquer zoom (2×/3×).

## Checklist de produção por peça nova

Ao pedir/gerar uma arma nova, seguir esta lista (evita retrabalho de integração):
1. Ícone de carta de draft (32×32, estático).
2. Sheet de "viagem"/comportamento ativo (o projétil/área/aura em si).
3. Confirmar se reaproveita o impacto compartilhado ou precisa de um próprio.
4. Exportar variante por elemento (paleta), se a arma for elemental.
5. Verificar contra a tabela de tamanhos acima — nunca inventar um canvas novo sem necessidade.

## Ordem recomendada de produção

### Etapa 1 — Protótipo de 1 minuto

- [ ] Herói Fogo 64×64, `idle` e `andando`.
- [ ] Inimigo Fogo `egg` 24×24.
- [ ] Inimigo Planta `egg` 24×24.
- [ ] 1 projétil placeholder 16×16.
- [ ] Gema de XP 16×16.
- [ ] Impacto pequeno 32×32.
- [ ] Puff de morte 32×32.
- [ ] Tile de chão base 32×32.
- [ ] Ícones de 3 upgrades 32×32.

### Etapa 2 — Protótipo de 3 minutos

- [ ] Herói Planta 64×64.
- [ ] Tela/cartas com ícones de elemento.
- [ ] Inimigos `evolution_1` de fogo/planta 32×32.
- [ ] 3 poderes placeholder jogáveis.
- [ ] Cura, ímã e bomba.
- [ ] Telegraph de chefe.
- [ ] Chefe 1 96×96 simples.

### Etapa 3 — MVP completo

- [ ] Inimigos `evolution_2` de fogo/planta 40×40.
- [ ] Chefe 1 refinado.
- [ ] VFX de level up.
- [ ] VFX de coleta de XP.
- [ ] Ícones finais das armas do MVP.
- [ ] Variações de chão.
- [ ] HUD visual refinado.

### Etapa 4 — Pós-MVP

- [ ] Água: herói, egg, evolution_1, evolution_2.
- [ ] Poderes finais por elemento.
- [ ] Arquétipos dedicados de inimigo.
- [ ] Itens permanentes dropados por chefes.
- [ ] Biomas adicionais.

## Regras anti-retrabalho

- Não criar animação complexa para inimigo comum antes de validar gameplay.
- Não criar água reaproveitando planta; isso quebra leitura elemental.
- Não fazer chefe só escalando inimigo comum. Mesmo simples, chefe precisa de silhueta própria.
- Não criar tile de chão muito contrastado. O chão não pode competir com XP, inimigos e VFX.
- Não usar muitos efeitos brancos grandes ao mesmo tempo. Branco deve indicar pico: hit,
  level up, morte de chefe ou brilho importante.
- Não criar 10 armas antes de 3 armas ficarem boas. Três poderes fortes valem mais que dez
  parecidos.
- Não deixar placeholder virar final sem revisão. Placeholder serve para testar mecânica,
  não para fechar linguagem visual.

## Prompt-base para pedir/gerar assets

Quando for pedir uma imagem nova, usar esta estrutura:

```text
Pixel art para jogo top-down auto-shooter, fundo transparente, canvas [TAMANHO],
zoom nítido sem suavização, silhueta forte, poucos detalhes, paleta [ELEMENTO],
legível em tamanho pequeno, estilo consistente com criaturas elementais fofas porém de combate.
Asset: [NOME].
Uso no jogo: [HERÓI/INIMIGO/PROJÉTIL/PICKUP/VFX/UI].
Frames: [QUANTIDADE] em sheet horizontal, todos alinhados, sem sombra projetada fora do canvas.
Evitar: fundo, blur, gradiente suave, excesso de partículas, texto dentro do sprite.
```

Exemplo:

```text
Pixel art para jogo top-down auto-shooter, fundo transparente, canvas 32x32,
zoom nítido sem suavização, silhueta forte, poucos detalhes, paleta fogo
(vermelho escuro, laranja, amarelo claro), legível em tamanho pequeno.
Asset: impacto pequeno de projétil de fogo.
Uso no jogo: VFX de hit.
Frames: 5 em sheet horizontal, explosão curta do centro para fora.
Evitar: fundo, blur, fumaça realista, excesso de partículas, texto.
```

## Pipeline

Arte fonte entra em `art/<categoria>/` (heroes/enemies/powers/pickups/fx/tiles/ui) como PNGs
individuais por frame. `tools/pack-atlas.mjs` empacota em atlas + JSON de spritesheet do PIXI
(ver `01-arquitetura-tecnica.md`) — diferente do pipeline do AIxi, que só copia PNGs soltos.
