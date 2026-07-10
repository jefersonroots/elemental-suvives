# 01 — Arquitetura Técnica

> Documento vivo. Decisões de engine e estrutura — atualizar quando algo mudar de verdade,
> não a cada detalhe de implementação (isso o código já documenta).

## Stack

- **TypeScript + PIXI.js v8 + Vite.** Web-first: roda no navegador desde o dia 1 via
  `vite dev`/`vite build`. PIXI v8 (mais recente que o v7 usado no AIxi) por render em batch
  mais moderno — sem legado a carregar, repo novo pode partir da versão atual.
- **Sem framework de UI no game loop.** HUD/menus (draft, pausa, fim de run) são overlay
  HTML/CSS por cima do `<canvas>` do PIXI, manipulado direto ou com um helper leve — não
  acoplar o game loop a um framework reativo. Vue pode entrar depois só pras telas de menu,
  se justificar.
- **Persistência**: camada fina sobre `localStorage`, atrás de uma interface `MetaStore`
  (ponto único de swap — mesma filosofia do `JsonStore` do AIxi, mas sem Electron/Node por trás).
- **Desktop/itch.io**: invólucro fica pra um marco posterior (ver `04-roadmap.md`, marco 7).
  Candidatos: Electron (reaproveita o know-how de `electron-builder` + butler já rodado no
  AIxi) ou Tauri (mais leve). Decisão adiada — o jogo tem que rodar bem no navegador primeiro.

## Por que client-side puro (sem main/renderer, sem IPC)

O AIxi é **main-autoritativo**: o processo Node do Electron controla o estado (tick de 15s,
IPC pro renderer só desenhar). Isso funciona pra um pet porque a taxa de atualização é baixa
e a latência de IPC é irrelevante.

Um auto-shooter precisa de ~60 atualizações por segundo com centenas de entidades reagindo a
input em tempo real — IPC entre processos adicionaria latência e complexidade sem benefício
nenhum (não há nada pra proteger de main; é um jogo single-player local). Por isso o jogo é
**um único processo**, rodando inteiramente no contexto do navegador/renderer.

## Loop de jogo

**Timestep fixo com acumulador**, não `deltaTime` direto do `requestAnimationFrame`:

```
acumulador += deltaTimeReal
enquanto acumulador >= PASSO_FIXO:
    atualizar(PASSO_FIXO)   # spawn, física, colisão, dano — determinístico
    acumulador -= PASSO_FIXO
renderizar(alpha = acumulador / PASSO_FIXO)   # interpola posições pro desenho
```

Por quê: em jogos com centenas de entidades e spawn escalando com o tempo, um passo variável
faz o balanceamento (DPS, taxa de spawn) depender do framerate da máquina do jogador. Passo
fixo mantém a run igual em qualquer hardware; a interpolação evita "engasgo" visual.

## Renderização de alta densidade de entidades

Risco técnico nº1 do projeto (ver GDD/roadmap). Três táticas, aplicadas **desde o marco 2**,
não retrofitadas depois:

1. **Atlas empacotado**: toda a arte de um "conjunto" (inimigos, poderes, pickups, fx) entra
   numa única textura via `tools/pack-atlas.mjs` (build step) + um JSON de spritesheet no
   formato que o PIXI lê nativamente (`Spritesheet`). Uma textura → PIXI faz *batching* dos
   draw calls automaticamente. Sem atlas, cada PNG separado é uma textura = um draw call a
   mais por entidade = trava com enxame grande.
2. **Object pooling**: inimigos, projéteis, gemas e partículas de impacto nunca são
   criados/destruídos por frame. Um pool pré-aloca um teto de instâncias por tipo; "matar" uma
   entidade só a devolve ao pool (desativa/reposiciona) para reuso. `render/pool.ts` é o ponto
   único dessa lógica.
3. **`ParticleContainer`** (ou equivalente v8) para os grupos mais numerosos (ex.: enxame de
   inimigos comuns), que sacrifica alguns recursos por entidade (sem árvore de filhos, sem
   máscaras) em troca de throughput muito maior.

## Colisão em massa

**Grid espacial uniforme** (`game/spatial-grid.ts`): o mundo é dividido em células de tamanho
fixo; cada entidade é indexada pela célula que ocupa. Testes de colisão (projétil×inimigo,
herói×inimigo, herói×pickup) só comparam entidades na mesma célula/vizinhas — evita o custo
O(n²) de comparar todo mundo com todo mundo. Hitboxes simples: círculo para a maioria,
AABB onde fizer sentido (áreas/auras).

## Estrutura de pastas

```
elemental-survivors/
  index.html · package.json · vite.config.ts · tsconfig.json
  src/
    main.ts                 # boot do PIXI + arranca o loop
    game/
      loop.ts               # timestep fixo + acumulador
      world.ts              # registro de entidades + pools
      spatial-grid.ts        # hashing p/ colisão em massa
      systems/               # movement, spawn-director, collision, weapons, pickups, camera, damage
      entities/               # hero, enemy, projectile, pickup, gem
    content/
      elements.ts            # type chart fogo>planta>agua>fogo
      weapons.ts              # famílias de arma
      enemies.ts               # tiers reaproveitados: egg/evolution_1/evolution_2 × elemento
      waves.ts                  # diretor de spawn / escala por tempo / sorteio de elemento
      balance.ts                 # constantes tunáveis
    render/  atlas.ts (carrega atlas empacotado) · pool.ts (sprite pooling)
    ui/      hud/ · draft/ · pause/ · run-end/
    storage/ meta-store.ts    # localStorage abstraído
  art/       heroes/ enemies/ powers/ pickups/ fx/ tiles/ ui/    # fonte pixel art
  tools/     pack-atlas.mjs    # empacota art/ -> spritesheet PIXI (build step)
  public/
```

## Sistemas (visão geral, `game/systems/`)

Cada sistema opera sobre o `world` (registro central de entidades) uma vez por passo fixo:

- **movement** — aplica velocidade/direção ao herói (input) e inimigos (perseguição simples).
- **spawn-director** — decide quando/onde spawnar inimigos, lendo `content/waves.ts`; escolhe
  tier (`egg`/`evolution_1`/`evolution_2`) e elemento dentro do pool ativo; spawna num anel
  fora da tela visível; despawna quem fica longe demais do herói.
- **weapons** — cada arma equipada tem seu próprio cooldown/comportamento (mira, dispara,
  orbita); consulta `content/weapons.ts` pros parâmetros.
- **collision** — usa o `spatial-grid` para resolver projétil×inimigo, herói×inimigo,
  herói×pickup; aplica `content/elements.ts` pro multiplicador de dano.
- **damage** — aplica dano/HP, dispara flash de hit, spawna número de dano, mata (devolve ao
  pool) e solta drop quando HP zera.
- **pickups** — atração por ímã, coleta de gema/ouro/cura ao encostar.
- **camera** — segue o herói, converte coordenadas de mundo para tela.

## Persistência (`storage/meta-store.ts`)

Interface pequena e explícita, no espírito do `JsonStore` do AIxi mas sem versão/migração
complexa no MVP (adicionar se o save crescer):

```ts
interface MetaSave {
  gold: number
  unlockedHeroes: ElementId[]
  permanentUpgrades: Record<string, number>
}
interface MetaStore {
  load(): MetaSave
  save(data: MetaSave): void
}
```

Implementação inicial: `localStorage.getItem/setItem` com `JSON.parse/stringify` e fallback
pros defaults se corrompido/ausente — mesmo espírito defensivo do `JsonStore`.

## Ferramentas de build

- `tools/pack-atlas.mjs`: lê `art/<categoria>/**/*.png`, empacota numa textura por categoria
  + gera o JSON de spritesheet do PIXI. Roda como prebuild (`npm run build`) e sob demanda em
  dev (`npm run pack-atlas`). Não é o `build-atlas.mjs` do AIxi (aquele copia PNGs soltos +
  bbox; aqui precisamos de atlas real por causa do volume de entidades).

## Decisões em aberto

- Invólucro desktop (Electron vs Tauri) — adiado pro marco 7.
- Se/quando trocar `localStorage` por `IndexedDB` (só se o save crescer além de config simples).
- Se telas de menu (draft, pausa) ganham um framework leve ou continuam DOM puro.
