# 00 — Game Design Document

> Documento vivo. Criado a partir do planejamento inicial (ver histórico de decisões no fim).

## Pitch

**Elemental Survivors** é um auto-shooter roguelite (linha *Vampire Survivors*) em pixel art,
onde você controla um dos três elementais (fogo, água, planta) sobrevivendo a enxames
crescentes enquanto monta uma build de poderes elementais. Runs curtas (~10 min), decisões
rápidas de upgrade, e uma tabela de vantagem de tipo que dá leitura tática ao caos do enxame.

## Plataformas

**Navegador é o alvo primário e permanente**, não um marco intermediário. O jogo roda
inteiro em Vite/PIXI no browser (ver `01-arquitetura-tecnica.md`); um invólucro desktop
(Electron/Tauri, marco 7 do roadmap) é só empacotamento por cima do mesmo build web —
nunca uma versão "de verdade" separada da que roda no navegador.

## Pilares de design

Toda decisão de conteúdo/mecânica se mede contra estes pilares:

1. **Poucos personagens, muito poder.** O elenco jogável é fixo (3 elementais). Toda a
   variedade e identidade visual do jogo vive nos **poderes, itens e efeitos** — não em
   desenhar mais personagens. Isso é restrição de produção E princípio de design.
2. **Leitura no caos.** Com centenas de inimigos na tela, o jogador precisa continuar
   entendendo o que está acontecendo: silhuetas fortes, cores por elemento, feedback de dano
   imediato. Nunca sacrificar clareza por volume.
3. **Decisões rápidas, sem pausar o ritmo.** O draft de upgrade é a única pausa deliberada.
   Fora dele, o jogador está sempre se movendo e reagindo — sem menus de gerenciamento pesado
   no meio da run.
4. **Sorte controlada, não injustiça.** O elemento do herói e o elemento dos inimigos criam
   runs imprevisíveis, mas a vantagem elemental precisa ser moderada o bastante para o jogador
   ainda vencer uma run "ruim" com movimento, draft e upgrades bons.

## Gênero e referências

Auto-shooter roguelite / "bullet heaven". A base é *Vampire Survivors*: movimento constante,
armas automáticas, enxame crescente, XP no chão e draft de upgrade. A inspiração de
*Archero 2* entra mais na **clareza das escolhas**: herói escolhido antes da run, vantagens e
desvantagens claras, cartas de upgrade com impacto imediato, chefes como momentos de pico e
progressão permanente simples entre partidas.

O jogo não deve virar uma cópia de sala-a-sala do Archero. A run continua contínua, sem parar
para limpar arenas. A melhoria que queremos trazer é a sensação de "essa escolha mudou minha
build agora", não a estrutura de fases.

## Loop central (moment-to-moment)

```
Escolher herói (fogo ou planta, no MVP) → mover (WASD/setas) → armas atiram sozinhas
→ inimigos (elemento sorteado a cada spawn) morrem → soltam gemas de XP
→ XP enche a barra → level up → draft de 3 cartas (pausa curta) → volta a jogar
→ dificuldade escala com o tempo → chefe aparece em intervalos → sobreviver até o fim
  do timer (vitória da run) OU morrer (fim da run)
```

A escolha do herói no início **não é só estética**: como o elemento de cada inimigo é
sorteado (não fixo), o mesmo herói pode ter uma run mais fácil ou mais difícil dependendo de
que elementos apareceram mais — é a principal fonte de variância/rejogabilidade do MVP.
Essa variância deve ser sentida como "a run saiu diferente", não como punição inevitável.

## Loop de meta-progressão (entre runs)

```
Terminar uma run → ouro acumulado é salvo → tela de fim de run
→ gastar ouro em melhorias permanentes (HP máximo / velocidade de ataque inicial)
  e/ou desbloquear o herói água (quando existir) → próxima run começa mais forte
```

No MVP, as melhorias permanentes são deliberadamente simples: **HP máximo inicial** e
**velocidade de ataque inicial**. Quando houver mais sprites próprios de itens, a direção
futura é aproximar isso de drops de chefe: itens colecionáveis permanentes, com visual próprio,
que destravam upgrades mais memoráveis do que uma loja abstrata de números.

## Controles

- **Mover**: WASD ou setas (8 direções).
- **Mirar**: mouse dentro do mapa/canvas. O herói se move com teclado, mas a direção do tiro
  segue o mouse para dar mais controle e dinamismo.
- **Atirar**: automático — armas equipadas disparam sozinhas. Armas direcionais usam a mira do
  mouse; armas de área/orbital podem seguir seu próprio padrão.
- **Pausar**: Esc.
- **Draft de upgrade**: mouse/click (ou 1/2/3 no teclado) para escolher a carta.

## Condições de vitória/derrota da run

- **Derrota**: HP do herói chega a 0.
- **"Vitória"**: sobreviver até o timer da run zerar (MVP: ~10 min). Nesse MVP não há tela de
  vitória distinta de sobrevivência — o timer zerado encerra a run com sucesso.

## Elementos e vantagem de tipo

Ciclo simples de 3, espelhando o AIxi: **fogo > planta > água > fogo**. Aplica um percentual
de bônus/penalidade sobre o dano base (fórmula exata em `03-conteudo-e-balanceamento.md`).
**Água existe na regra mas fica inativa** (sem herói nem inimigo de água) até ter sprites
próprios — ver "Personagens jogáveis" e "Inimigos" abaixo.

## Personagens jogáveis

O elenco final é os 3 elementais (compartilhados visualmente com o AIxi, normalizados pro
grid 64×64 deste jogo — usando o **sprite 3 / `evolution_3`** de cada elemento). **No MVP só fogo e
planta estão disponíveis** (água entra quando tiver arte própria). Escolhido **no início da
run**, não fixo — ver o loop central acima sobre por que isso importa.

| Herói | Arma inicial | Personalidade de combate | Disponível? |
|---|---|---|---|
| Fogo | projétil perfurante (foco) | agressivo, alto dano, baixa sustentação | ✅ MVP |
| Planta | aura orbital (vínculo) | defensivo, controla a área ao redor | ✅ MVP |
| Água | orbe teleguiado (sabedoria) | tático, persegue, dano médio constante | ⏳ futuro |

## Inimigos

**Fase inicial**: em vez de arquétipos desenhados do zero, os inimigos reaproveitam os
estágios de evolução que o AIxi já tem por elemento — `egg`/`evolution_1`/`evolution_2` viram
3 tiers de inimigo (o `evolution_3`, forma final, fica reservado pro herói). O elemento de
cada spawn é sorteado dentro do pool ativo (fogo/planta), criando a variância mencionada no
loop central. Detalhes visuais e de stats em `02-guia-de-arte.md` e
`03-conteudo-e-balanceamento.md`. Arquétipos desenhados à mão (blob/voador/bruto/atirador)
ficam como evolução futura, pós-MVP.

Chefes são a exceção: arte **dedicada** desde o MVP (não reaproveitada), aparecem em marcos
fixos de tempo. A regra de qual elemento cada chefe tem conforme a run avança ainda é
provisória — ver nota em `03-conteudo-e-balanceamento.md`.

## Escopo do MVP

Ver `04-roadmap.md` para os marcos. Resumo: escolha entre 2 heróis (fogo/planta), 3 armas,
inimigos reaproveitando 3 estágios do AIxi × 2 elementos, 1 chefe com arte dedicada, run de
~10 min, draft de upgrade, meta-progressão mínima (ouro + melhorias de HP/velocidade de
ataque + desbloqueio do herói água quando existir). Para acelerar testes, as primeiras
habilidades usam assets já existentes em `C:\Users\jefee\Desktop\PROJETOS\AIxiliar\art`
(copo, biscoito, seringa, ícone de morte e cocozinho), antes de receberem arte final.

## Direção de melhoria da ideia inicial

- **Manter o caos de Vampire Survivors**, mas dar mais leitura tática com elementos. O jogador
  deve olhar para a cor/tipo do enxame e entender quando está em vantagem ou desvantagem.
- **Usar Archero 2 como referência de sensação de escolha**, não de estrutura. Cada carta de
  upgrade precisa ser curta, clara e mudar algo visível: mais projéteis, mais área, mais
  cadência, mais sustain, mais controle.
- **Herói inicial como aposta da run.** Escolher fogo ou planta antes de saber o mix de
  inimigos dá personalidade à partida. Às vezes o jogador "acerta o meta" da run; às vezes
  precisa compensar com build.
- **Chefes como marcos fixos.** Inimigos comuns são sorteados proceduralmente; chefes entram
  em tempos definidos para criar picos previsíveis e bons momentos de recompensa.
- **Elementos futuros expandem o jogo sem refazer a base.** Água entra quando tiver sprites,
  completando o ciclo fogo > planta > água > fogo. Outros elementos só devem ser considerados
  depois que esse triângulo estiver divertido.

## Mecânicas que precisam de refinamento

Estas são as mecânicas que mais definem se o jogo vai ficar gostoso. Antes de expandir
conteúdo, elas precisam ser testadas e refinadas em runs curtas.

1. **Loop de combate de 30 segundos.** Mover, desviar, juntar inimigos, ver arma acertando,
   pegar XP e subir de nível precisa ser divertido quase imediatamente. Se esse micro-loop não
   funcionar, mais armas, chefes ou meta-progressão não resolvem.
2. **Draft de upgrades com escolhas visíveis.** Evitar que as primeiras cartas sejam só
   números pequenos como "+5% dano". Priorizar upgrades que mudam a leitura da run: mais
   projéteis, maior área, perfuração, lentidão, DoT, cura ao matar, explosão ao matar.
3. **Vantagem elemental com feedback claro.** O elemento deve importar, mas não decidir tudo.
   Usar diferença moderada de dano e feedback visual forte para mostrar vantagem/desvantagem.
4. **Seleção de herói com identidade real.** Fogo e Planta não podem ser só sprites
   diferentes: Fogo deve parecer agressivo e arriscado; Planta deve parecer defensiva, estável
   e boa em controle de área.
5. **Spawn procedural controlado.** A run deve variar sem parecer injusta. O diretor de spawn
   pode sortear elementos, mas precisa controlar pesos por tempo para criar curva de tensão.
6. **Chefes como picos de memória da run.** Cada chefe deve testar uma ideia clara: perseguir,
   invocar, criar zonas perigosas, mudar elemento ou forçar movimento.

## O que ainda falta para o modelo funcionar

- **Magnetismo/XP gostoso.** Coletar gemas precisa ter prazer físico: raio de atração,
  aceleração até o herói, som curto e barra de XP respondendo rápido.
- **Feedback de impacto.** Inimigo precisa piscar ao tomar dano, mostrar número de dano,
  sofrer knockback leve quando fizer sentido e morrer com efeito compartilhado legível.
- **Curva de tensão.** A run não deve só aumentar inimigos linearmente. Precisa alternar
  pressão, alívio curto, elite/chefe, recompensa e nova pressão.
- **Armas com identidade forte.** O MVP deve ter pelo menos 3 comportamentos realmente
  diferentes: projétil/linha, área no chão e orbital/controle ao redor do herói.
- **Pickups emergenciais.** Cura, ímã e bomba criam viradas pequenas e ajudam o jogador a
  sobreviver a momentos ruins sem depender só de números.
- **Tela de seleção de herói.** Deve mostrar elemento, estilo de combate, vantagem/desvantagem
  e arma inicial de forma simples antes da run começar.
- **Objetivo claro de run.** Direção recomendada: sobreviver ao timer e enfrentar um chefe
  final no fim. O timer cria tensão; o chefe final dá clímax.

## Prioridade de protótipo

A prioridade é fazer **1 minuto perfeito** antes de tentar uma run completa de 10 minutos:
herói controlável, 1 arma, inimigos, XP, level up e 3 upgrades interessantes. Quando esse
minuto estiver divertido, expandir para 3 minutos com chefe. Só depois disso vale fechar a
run longa, meta-progressão e conteúdo extra.

## Fora de escopo (por ora)

- Evolução de arma (upgrade de arma nível-máx + passivo específico → forma evoluída).
- Múltiplos biomas/mapas.
- Roster grande de inimigos ou chefes múltiplos.
- Multiplayer, em qualquer forma.
- Tie-in com o XP/evolução do pet AIxi — os projetos só compartilham sprites por ora.

## Relação com o projeto AIxi

Repositório **separado e independente**. Compartilhamento é só de **arte** (os 3 elementais
como heróis; efeitos/itens novos podem eventualmente voltar pro AIxi). Sem dependência de
código, sem IPC, sem save compartilhado.
