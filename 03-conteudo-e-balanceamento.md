# 03 — Conteúdo e Balanceamento

> Documento vivo. Números aqui são **chutes iniciais pra ter algo jogável** — precisam de
> playtest real pra calibrar (mesmo aviso que o AIxi já faz pra XP/evolução). Todo número
> citado deve existir como constante nomeada em `src/content/balance.ts`, nunca hardcoded
> espalhado pelo código.

## Elementos e vantagem de tipo

Ciclo de 3, mesmo espírito do `rps.ts` do AIxi (`BEATS`). A fórmula é **base ± percentual**,
não um multiplicador direto — mais fácil de ler/tunar como "ganha/perde X% contra tal elemento":

```
fogo   vence  planta
planta vence  agua
agua   vence  fogo
```

```
dano(atacante, alvo):
  se atacante == elemento vencedor contra alvo:  dano = base + base * TYPE_ADVANTAGE_PCT
  se atacante == elemento perdedor contra alvo:   dano = base - base * TYPE_ADVANTAGE_PCT
  caso contrário (mesmo elemento / fora do ciclo): dano = base
```

Exemplo com fogo atacando:
- `fogo → fogo` = valor base (neutro)
- `fogo → agua` = base **−** X% (fogo é o elemento perdedor contra água — água vence fogo)
- `fogo → planta` = base **+** X% (fogo é o elemento vencedor contra planta)

`TYPE_ADVANTAGE_PCT` é uma constante única e simétrica em `balance.ts` (chute inicial: **25%**,
equivalente a ×1.25/×0.75). Isso deixa o elemento importante sem transformar uma sequência
ruim de spawns em derrota automática.
Vale nos dois sentidos: arma do herói contra inimigo, e inimigo contra herói (se/quando
inimigos causarem dano elemental).

**Pool ativo por ora**: só **fogo** e **planta** têm arte suficiente (ver
`02-guia-de-arte.md`). Água existe na fórmula/type-chart mas fica **inativa** (não aparece
como herói selecionável nem como elemento de inimigo) até ter sprites próprios.

⚠️ Enquanto água não existir, fogo tende a ser naturalmente favorecido: fogo bate em planta e
fica neutro contra fogo. Para o MVP, compensar isso no balanceamento do herói planta (mais HP,
aura inicial mais segura, melhor controle de área) e manter `TYPE_ADVANTAGE_PCT` baixo. Quando
água entrar, o triângulo fecha e essa compensação deve ser revisada.

## Heróis

**Escolhido no início da run** (não fixo) — essa escolha é a principal fonte de variância de
cada partida: como os inimigos vêm de elemento sorteado (ver "Escala de dificuldade" abaixo),
o mesmo herói pode ter uma run fácil (sorteou muitos inimigos do elemento que ele vence) ou
difícil (sorteou muitos do elemento que o vence) — isso é intencional, dá rejogabilidade.

| Herói | Elemento | Arma inicial | HP base | Velocidade base | Disponível? |
|---|---|---|---|---|---|
| Fogo | fogo | projétil perfurante (foco) | médio-baixo | média-alta | ✅ MVP |
| Planta | planta | aura orbital (vínculo) | alto | baixa | ✅ MVP |
| Água | agua | orbe teleguiado (sabedoria) | médio | média | ⏳ quando tiver arte própria |

Valores exatos de HP/velocidade ficam em `balance.ts` como constantes — a tabela acima é
só a relação *relativa* entre os dois heróis ativos (o que cada um prioriza).
No MVP, Planta precisa ser balanceada como escolha mais estável/defensiva para compensar a
ausência temporária de inimigos de água.

## Armas (5 famílias do MVP)

| Família | Dano base | Cooldown/cadência | Alcance/duração | Escala por nível |
|---|---|---|---|---|
| foco (projétil) | médio | rápido | atravessa até sair da tela | +dano, +velocidade do projétil |
| sabedoria (orbe teleguiado) | médio | médio | persegue até acertar ou expirar | +dano, +nº de orbes simultâneos |
| organizacao (área) | baixo por tick | tick fixo (ex.: a cada 0.5s) | fica X segundos no chão | +raio, +duração |
| vinculo (aura orbital) | baixo por tick | contínuo (contato) | gira permanentemente | +raio de órbita, +nº de orbitais |
| constancia (corrente/DoT) | baixo por tick | tick fixo | dura X segundos no alvo | +duração, +dano por tick |

Cada arma tem **níveis** (ex.: 1 a 5) escolhidos via draft; nível máximo é pré-requisito pra
evolução de arma (fora do escopo do MVP, mas o campo `level` já deve existir na entidade de
arma pra não precisar refatorar depois).

### Regra de qualidade para upgrades

Nos primeiros níveis, upgrades devem mudar comportamento visível antes de oferecer bônus
pequenos. Exemplos de bons upgrades iniciais:

- **Projétil extra**: aumenta volume de ataque imediatamente.
- **Perfuração**: faz o jogador posicionar melhor a linha de tiro.
- **Raio maior**: deixa área/orbital mais confortável.
- **Lentidão**: cria controle defensivo.
- **DoT curto**: diferencia armas de veneno/seringa de dano instantâneo.
- **Explosão ao matar**: recompensa matar grupos.
- **Cura ao matar / ao coletar**: cria build de sustain.

Bônus simples como `+5% dano` ou `+5% cooldown` podem existir, mas devem aparecer mais como
refino depois que a arma já ganhou uma mudança perceptível.

## Inimigos (3 tiers × 2 elementos ativos = 6 variações no MVP)

Reaproveitando os estágios do AIxi (ver `02-guia-de-arte.md`) em vez de arquétipos desenhados:

| Tier (estágio AIxi) | HP relativo | Velocidade | Dano de contato | Comportamento |
|---|---|---|---|---|
| Tier 1 (`egg`) | baixo | baixa | baixo | anda reto na direção do herói — o "blob" da leva |
| Tier 2 (`evolution_1`) | médio | média | médio | anda reto, um pouco mais resistente |
| Tier 3 (`evolution_2`) | alto | média-baixa | alto | mais tanque, penúltima ameaça antes do chefe |

Todo tier existe **nos 2 elementos ativos** (fogo, planta) — o elemento de cada spawn é
sorteado (ver abaixo), não fixo por tier. Chefe: versão dedicada (arte nova, ver guia de
arte), HP e dano multiplicados (`BOSS_MULT` em `balance.ts`).

> Elite como categoria separada (do plano original) fica pós-MVP — os 3 tiers já dão a
> progressão de ameaça que um elite cobriria.

## Escala de dificuldade (diretor de spawn)

Curva por tempo de run, não por número de kills (evita farm parado num canto):

- **Taxa de spawn** cresce com o tempo decorrido (ex.: função em degraus a cada ~60s).
- **Mix de tiers** muda com o tempo: cedo majoritariamente tier 1; tier 2 entra depois; tier 3
  só nas fases finais antes do chefe.
- **Elemento do spawn é sorteado** a cada inimigo, dentro do pool ativo (fogo/planta por
  ora) — **independente do elemento do herói**. É essa aleatoriedade que cria a variância de
  partida: o jogador pode ter sorte (enxame majoritariamente do elemento que seu herói vence)
  ou azar (o oposto) na mesma run.
- **Pesos de elemento podem mudar com o tempo**, mas não devem ser totalmente aleatórios. O
  diretor deve evitar sequências longas demais de inimigos desfavoráveis nos primeiros minutos.
  A run pode ficar cruel no fim; no começo ela precisa ensinar.
- **HP dos inimigos comuns** recebe um multiplicador crescente com o tempo (pra continuar
  desafiador mesmo com o jogador mais forte) — separado do HP base do tier.
- **Chefe** aparece em marcos fixos de tempo (ex.: aos 3min e aos 7min numa run de 10min).
  A ocorrência é fixa (mesma run sempre tem chefe nesses marcos), mas **o elemento do chefe
  varia conforme a fase avança** (ex.: primeiro chefe de um elemento, o seguinte de outro).
  ⚠️ **Provisório**: a regra exata de progressão do elemento do chefe (sequência fixa? sorteio
  dentro do pool? incorporar água quando existir?) ainda não está fechada — o próprio design
  reconhece que "isso será melhor pensado no futuro". Não implementar como definitivo; deixar
  fácil de trocar (uma função/tabela isolada em `waves.ts`, não espalhado pelo spawn-director).

Todas essas curvas (taxa de spawn por minuto, mix de tiers por minuto, multiplicador de HP por
minuto, timestamps e elemento de chefe) são tabelas/funções em `src/content/waves.ts`, não
valores soltos no spawn-director.

### Curva de tensão recomendada

Uma run boa alterna pressão e respiro, mesmo sem virar fase por sala:

| Momento | Intenção |
|---|---|
| 0:00–1:00 | ensinar movimento, coleta de XP e primeira escolha de upgrade |
| 1:00–3:00 | aumentar densidade, introduzir mistura elemental com cuidado |
| 3:00 | primeiro chefe/momento de pico |
| 3:30–7:00 | abrir builds, tiers 2 e 3 entram com mais frequência |
| 7:00 | segundo pico ou chefe mais agressivo |
| 7:30–10:00 | pressão alta, pickups emergenciais importam |
| final | chefe final ou encerramento por sobrevivência |

## XP e progressão de run

- Gemas de XP soltadas por inimigos mortos (valor pode variar por tier: `evolution_2` e chefe
  soltam mais).
- Coleta de XP precisa ter magnetismo leve desde cedo. O raio de atração base deve ser pequeno
  o bastante para o jogador ainda se mover até as gemas, mas gostoso o bastante para evitar
  fricção excessiva.
- Curva de XP necessário por nível: crescente (ex.: geométrica leve) — evita nivelar rápido
  demais nos minutos finais.
- **Draft de upgrade**: 3 cartas por level-up, sorteadas entre: nova arma (se ainda não tem
  as 3 do MVP), subir nível de arma existente, upgrade passivo (dano/velocidade/área/HP máx).
  Sem repetir a mesma arma já no nível máximo na oferta.

### Feedback de dano e elemento

- Dano em vantagem elemental deve aparecer com cor/ênfase diferente do dano neutro.
- Dano em desvantagem deve ser legível, mas sem parecer bug ou erro do jogador.
- Inimigo atingido deve piscar rapidamente e, quando apropriado, receber knockback curto.
- Morte precisa ter efeito compartilhado claro, com cor ligada ao elemento do inimigo.
- Som de hit, coleta de XP, level up e morte de chefe são obrigatórios para o primeiro
  playtest sério, mesmo que sejam sons simples temporários.

## Pickups

| Pickup | Efeito | Frequência |
|---|---|---|
| Gema de XP | soma XP | todo inimigo morto |
| Ouro | soma à meta-progressão (persistente) | drop ocasional, mais comum em tier 3/chefe |
| Cura | recupera HP | drop raro |
| Ímã | puxa todas as gemas na tela até o herói | drop raro, efeito instantâneo |
| Bomba | dano em área na tela toda | drop bem raro (situação de aperto) |

## Meta-progressão (entre runs)

- **Ouro** persiste via `MetaStore` (ver arquitetura técnica).
- **Melhorias permanentes do MVP** (2, pra manter escopo pequeno): **+HP máximo inicial** e
  **+velocidade de ataque inicial** (cadência das armas, não velocidade de movimento).
- **Desbloqueio de herói**: custa ouro acumulado; libera o herói água quando ele entrar no
  jogo (pool ativo do MVP é só fogo/planta — ver seção de Heróis).

> **Nota pro futuro** (registrado, não implementar ainda): assim que houver mais sprites
> disponíveis, as melhorias permanentes devem migrar de "comprar com ouro genérico" para
> **itens colecionáveis dropados por chefes** — cada item é um upgrade permanente específico
> (visual + efeito), em vez de um número comprado numa loja abstrata. Ouro genérico fica como
> mecanismo de transição do MVP.
> Exemplos futuros: coração/relíquia de HP, ampulheta ou engrenagem de velocidade de ataque,
> amuleto elemental, fragmento de chefe. Cada um deve ter sprite próprio antes de virar sistema
> definitivo.

## Regras de anti-frustração (aprendidas com o AIxi)

O AIxi tem um histórico de ajustar decay/recompensa depois que o usuário sentiu "o pet dorme
demais" — o princípio geral (números devem ser sentidos jogando, não só calculados) vale aqui:
- Run não pode "morrer de surpresa" sem telegraph — todo dano de área/projétil de inimigo
  precisa de aviso visual mínimo antes de acertar.
- Escala de dificuldade não pode ultrapassar o crescimento de poder do jogador médio nos
  primeiros ~2 minutos (janela de aprendizado sem punição pesada).
- Todo número desta tabela é ponto de partida — ajustar após primeiro playtest do marco 5
  (conteúdo completo do MVP).

## Onde os números vivem no código

```ts
// src/content/balance.ts — única fonte de verdade pros números tunáveis
export const ACTIVE_ELEMENTS = ['fogo', 'planta'] as const // 'agua' entra quando tiver arte
export const HERO_BASE = { fogo: {...}, planta: {...} } // agua adicionado quando ativo
export const WEAPON_BASE = { foco: {...}, sabedoria: {...}, ... }
export const ENEMY_TIER_BASE = { egg: {...}, evolution_1: {...}, evolution_2: {...} }
export const BOSS_MULT = ...
export const TYPE_ADVANTAGE_PCT = 0.25 // ±25% — base+PCT se vencedor, base-PCT se perdedor
```
