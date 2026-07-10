# Guia de Spawn System para jogos no estilo Vampire Survivors

Em jogos no estilo *Vampire Survivors*, os monstros normalmente não ficam previamente colocados no mapa. Um sistema chamado **Spawn System** ou **Spawn Director** decide continuamente:

- quando criar inimigos;
- quantos criar;
- qual tipo criar;
- onde criar;
- quando parar de criar.

A lógica moderna costuma combinar **timeline da partida**, **orçamento de ameaça**, **regras de posicionamento** e **limites de desempenho**.

## 1. Fluxo geral do spawn

A cada pequeno intervalo, por exemplo a cada `0.2` segundo, o sistema executa:

```text
Consultar o tempo da partida
        ↓
Encontrar a fase ativa
        ↓
Calcular quantos inimigos podem existir
        ↓
Escolher o tipo de inimigo
        ↓
Procurar uma posição válida fora da tela
        ↓
Retirar um inimigo do pool
        ↓
Configurar seus atributos
        ↓
Ativá-lo no mundo
```

O sistema não precisa criar monstros em todos os frames. Isso seria desnecessário.

```ts
spawnTimer += deltaTime;

if (spawnTimer >= currentWave.spawnInterval) {
  spawnTimer = 0;
  spawnEnemies();
}
```

## 2. Spawn baseado no tempo da partida

O modelo mais comum em *survivor-like* é uma linha do tempo de dificuldade.

```text
00:00-01:00 -> slimes fracos
01:00-03:00 -> slimes e morcegos
03:00-05:00 -> inimigos rápidos
05:00       -> elite
05:00-08:00 -> grupos maiores
10:00       -> chefe
```

Ela pode ser armazenada em dados:

```ts
interface SpawnPhase {
  startTime: number;
  endTime: number;
  spawnInterval: number;
  spawnAmount: number;
  maxAlive: number;
  enemies: SpawnEntry[];
}

interface SpawnEntry {
  enemyId: string;
  weight: number;
}
```

Exemplo:

```ts
const spawnPhases: SpawnPhase[] = [
  {
    startTime: 0,
    endTime: 60,
    spawnInterval: 1,
    spawnAmount: 2,
    maxAlive: 30,
    enemies: [
      { enemyId: "fire_slime", weight: 80 },
      { enemyId: "fire_bat", weight: 20 }
    ]
  },
  {
    startTime: 60,
    endTime: 180,
    spawnInterval: 0.6,
    spawnAmount: 3,
    maxAlive: 70,
    enemies: [
      { enemyId: "fire_slime", weight: 50 },
      { enemyId: "fire_bat", weight: 35 },
      { enemyId: "fire_beetle", weight: 15 }
    ]
  }
];
```

Isso é **data-driven**: você altera a dificuldade editando os dados, sem reescrever o sistema.

## 3. Escolha dos monstros por peso

Os inimigos geralmente não são selecionados com chances iguais.

```text
Slime:   60
Morcego: 30
Elite:   10
```

Total:

```text
60 + 30 + 10 = 100
```

Portanto:

```text
Slime:   60%
Morcego: 30%
Elite:   10%
```

Uma função simples:

```ts
function chooseWeightedEnemy(entries: SpawnEntry[]): string {
  const totalWeight = entries.reduce(
    (total, entry) => total + entry.weight,
    0
  );

  let roll = Math.random() * totalWeight;

  for (const entry of entries) {
    roll -= entry.weight;

    if (roll <= 0) {
      return entry.enemyId;
    }
  }

  return entries[entries.length - 1].enemyId;
}
```

Isso permite alterar o comportamento da partida gradualmente:

```text
Início:
Slime   90
Morcego 10

Meio:
Slime   40
Morcego 40
Besouro 20

Final:
Morcego 20
Besouro 40
Golem   30
Elite   10
```

## 4. Onde os monstros aparecem

Em um *survivor-like*, o inimigo normalmente aparece:

- fora da câmera;
- perto o suficiente para alcançar o jogador;
- longe o suficiente para não surgir em cima dele.

A técnica mais comum é criar um **anel de spawn** ao redor do jogador ou da câmera.

```text
                 Spawn máximo

          ┌──────────────────────┐
          │    área de spawn     │
          │   ┌──────────────┐   │
          │   │   CÂMERA     │   │
          │   │      P       │   │
          │   └──────────────┘   │
          │    área de spawn     │
          └──────────────────────┘

                 Spawn máximo
```

O monstro aparece entre:

- distância mínima: fora da tela;
- distância máxima: não muito longe da tela.

Exemplo:

```ts
const MIN_SPAWN_DISTANCE = 700;
const MAX_SPAWN_DISTANCE = 950;
```

Escolha por ângulo:

```ts
function getSpawnPosition(playerX: number, playerY: number) {
  const angle = Math.random() * Math.PI * 2;

  const distance =
    MIN_SPAWN_DISTANCE +
    Math.random() * (MAX_SPAWN_DISTANCE - MIN_SPAWN_DISTANCE);

  return {
    x: playerX + Math.cos(angle) * distance,
    y: playerY + Math.sin(angle) * distance
  };
}
```

Essa abordagem cria inimigos em todas as direções.

## 5. Spawn baseado nos limites da câmera

Outra abordagem é escolher uma das quatro bordas:

- `TOP`
- `RIGHT`
- `BOTTOM`
- `LEFT`

Exemplo:

```ts
type SpawnSide = "top" | "right" | "bottom" | "left";

function getSpawnPositionAroundCamera(
  cameraX: number,
  cameraY: number,
  cameraWidth: number,
  cameraHeight: number,
  margin: number
) {
  const sides: SpawnSide[] = ["top", "right", "bottom", "left"];
  const side = sides[Math.floor(Math.random() * sides.length)];

  const left = cameraX - cameraWidth / 2;
  const right = cameraX + cameraWidth / 2;
  const top = cameraY - cameraHeight / 2;
  const bottom = cameraY + cameraHeight / 2;

  switch (side) {
    case "top":
      return {
        x: left + Math.random() * cameraWidth,
        y: top - margin
      };

    case "bottom":
      return {
        x: left + Math.random() * cameraWidth,
        y: bottom + margin
      };

    case "left":
      return {
        x: left - margin,
        y: top + Math.random() * cameraHeight
      };

    case "right":
      return {
        x: right + margin,
        y: top + Math.random() * cameraHeight
      };
  }
}
```

Para o **Elemental Survives**, eu prefiro o sistema de anel, porque ele funciona bem mesmo quando o personagem se move rapidamente.

## 6. Validação da posição

Não basta gerar uma coordenada. O Spawn System deve verificar se ela é válida.

- A posição está fora da tela?
- Não está dentro de uma parede?
- Não está sobre água ou obstáculo proibido?
- Não está perto demais do jogador?
- Não está ocupada por muitos inimigos?
- Existe um caminho até o jogador?

Exemplo:

```ts
function isValidSpawnPosition(position: Point): boolean {
  if (cameraSystem.isVisible(position)) {
    return false;
  }

  if (collisionMap.isBlocked(position)) {
    return false;
  }

  if (enemyDensitySystem.isOvercrowded(position)) {
    return false;
  }

  return true;
}
```

O sistema tenta várias vezes:

```ts
function findValidSpawnPosition(): Point | null {
  const MAX_ATTEMPTS = 10;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const position = getSpawnPosition(
      player.position.x,
      player.position.y
    );

    if (isValidSpawnPosition(position)) {
      return position;
    }
  }

  return null;
}
```

Isso evita loops infinitos quando não há posição disponível.

## 7. Limite de inimigos vivos

O jogo não deve continuar criando inimigos sem limite.

```ts
if (enemyManager.activeCount >= currentPhase.maxAlive) {
  return;
}
```

Exemplo:

```text
0-1 minuto:  máximo 30
1-3 minutos: máximo 70
3-5 minutos: máximo 120
5-10 minutos: máximo 200
```

Esse limite serve tanto para balanceamento quanto para desempenho.

O custo de milhares de entidades depende da arquitetura adotada. Documentações de engines alertam que cada objeto ou nó possui custo de atualização e recomendam medir o desempenho no hardware-alvo.

## 8. Spawn contínuo e spawn em grupos

Existem dois modelos principais.

### Spawn contínuo

```text
2 inimigos por segundo
3 inimigos por segundo
5 inimigos por segundo
```

Bom para manter pressão constante.

```ts
spawnRate = 5;
spawnInterval = 1 / spawnRate;
```

### Spawn em grupos

A cada 5 segundos:

```text
criar 15 morcegos
```

Bom para produzir ondas perceptíveis.

```ts
{
  interval: 5,
  amount: 15,
  formation: "circle"
}
```

Jogos modernos geralmente misturam os dois:

```text
spawn contínuo de inimigos normais
+
grupos especiais
+
elites em horários específicos
+
chefes
```

## 9. Formações de spawn

Nem todos precisam nascer individualmente em posições completamente aleatórias.

Você pode usar formações.

### Círculo

```text
      M   M
   M         M

 M      P      M

   M         M
      M   M
```

### Linha

```text
M M M M M M M
```

### Grupo

```text
M M M
M M M
M M M
```

### Corredor

Inimigos surgem de dois lados:

```text
M M M -> P <- M M M
```

### Cerco incompleto

O jogo cerca o jogador, mas deixa uma rota de fuga.

```text
M M M M M

M       M

M   P

M       M

M M M M M
```

Essa última opção é muito importante: o sistema pode criar pressão sem tornar a situação impossível.

## 10. Orçamento de ameaça

Uma abordagem mais moderna é não pensar apenas em "quantos inimigos", mas em um **Combat Budget** ou **orçamento de combate**.

Cada inimigo possui um custo:

```text
Slime   = 1 ponto
Morcego = 2 pontos
Besouro = 4 pontos
Elite   = 10 pontos
Golem   = 15 pontos
```

Se o orçamento atual for `20`, ele poderia gerar:

```text
20 slimes
```

ou:

```text
10 morcegos
```

ou:

```text
1 elite + 5 morcegos
```

ou:

```text
1 golem + 5 slimes
```

Exemplo de dados:

```ts
interface EnemyDefinition {
  id: string;
  spawnCost: number;
  minimumTime: number;
  maximumSimultaneous: number;
}
```

Director:

```ts
function spawnUsingBudget(budget: number): void {
  let remainingBudget = budget;

  while (remainingBudget > 0) {
    const candidates = getAffordableEnemies(remainingBudget);

    if (candidates.length === 0) {
      break;
    }

    const enemy = chooseWeightedEnemy(candidates);

    spawnEnemy(enemy.id);

    remainingBudget -= enemy.spawnCost;
  }
}
```

Sistemas de direção contemporâneos podem usar um orçamento desse tipo para aumentar o volume de inimigos, introduzir unidades de níveis superiores ou adaptar a intensidade a variáveis como quantidade de jogadores.

## 11. Diretor de dificuldade

O Spawn Director pode analisar a partida:

- tempo;
- nível do jogador;
- DPS aproximado;
- quantidade de mortes por segundo;
- vida atual;
- quantidade de inimigos vivos;
- tempo desde que o jogador recebeu dano.

Mas é importante separar dois modelos.

### Dificuldade determinística

O tempo define tudo:

```text
Minuto 5 sempre possui a mesma onda.
```

Vantagens:

- mais fácil de balancear;
- partidas comparáveis;
- jogador aprende os acontecimentos.

### Dificuldade adaptativa

O jogo reage ao desempenho:

```text
Jogador muito forte   -> mais pressão
Jogador quase morrendo -> pequena redução
```

Vantagens:

- mantém a partida emocionante;
- evita períodos completamente vazios.

Risco:

- o jogador melhora, mas sente que nunca ficou poderoso.

Para o **Elemental Survives**, eu usaria:

```text
80% timeline fixa
20% ajustes do director
```

O jogador precisa perceber que sua build ficou forte. Não é interessante o jogo anular completamente os upgrades aumentando os monstros na mesma proporção.

## 12. Regras para um spawn justo

O Spawn Director deveria possuir regras como:

- nunca aparecer dentro da tela;
- nunca aparecer próximo demais do jogador;
- não criar elite diretamente na direção do movimento;
- não bloquear todas as rotas ao mesmo tempo;
- não empilhar dezenas de inimigos no mesmo ponto;
- não criar inimigo impossível para o momento atual;
- dar aviso visual para inimigos especiais.

Exemplo:

```ts
interface SpawnRules {
  minDistanceFromPlayer: number;
  maxDistanceFromPlayer: number;
  mustBeOutsideCamera: boolean;
  avoidPlayerMovementDirection: boolean;
  maxEnemiesPerCell: number;
}
```

Para chefes ou elites, use uma indicação:

- círculo no chão;
- efeito elemental;
- sombra;
- som;
- contador;
- portal.

Assim, o jogador entende que algo está surgindo e pode reagir.

## 13. Despawn de inimigos distantes

Quando o jogador se move continuamente, alguns inimigos podem ficar muito longe.

Você tem três opções.

### Manter o inimigo

Ele continua perseguindo.

Problema:

- pode acumular muitos objetos distantes.

### Remover o inimigo

```ts
if (distanceFromPlayer > DESPAWN_DISTANCE) {
  enemyPool.release(enemy);
}
```

Problema:

- o jogador pode explorar isso para apagar inimigos.

### Reciclar o inimigo

A alternativa mais comum para mapas infinitos:

```text
Inimigo ficou muito longe
        ↓
desativar
        ↓
reposicionar fora da câmera
        ↓
reativar
```

É preciso tomar cuidado para não transformar um inimigo quase morto em um inimigo novo sem explicação. Uma regra possível:

```text
reciclar apenas inimigos que nunca receberam dano
```

ou:

```text
inimigos danificados permanecem;
inimigos intactos podem ser reciclados
```

## 14. Object Pooling

Tecnicamente, spawn não deveria significar necessariamente:

```ts
const enemy = new Enemy();
```

e morte não deveria significar sempre:

```ts
enemy.destroy();
```

Em *survivor-likes*, isso aconteceria milhares de vezes e poderia causar pausas do Garbage Collector.

Em vez disso:

```text
Enemy Pool

inativos: 500 inimigos
ativos:   100 inimigos
```

Quando precisa criar:

```ts
const enemy = enemyPool.acquire();
enemy.activate(definition, position);
```

Quando morre:

```ts
enemy.deactivate();
enemyPool.release(enemy);
```

Object pooling é uma técnica reconhecida para reduzir alocações repetidas e pausas relacionadas à coleta de lixo; a própria documentação de desempenho do Godot cita pooling como abordagem comum para esse problema.

A criação tradicional de entidades ainda existe nos motores, por exemplo, a Unreal instancia Actors com `SpawnActor()`, mas jogos com grande rotatividade frequentemente adicionam uma camada de gerenciamento ou pooling sobre a criação básica.

## 15. Estrutura recomendada para seu projeto

```text
game/
├── systems/
│   ├── SpawnSystem.ts
│   ├── SpawnDirector.ts
│   ├── SpawnPositionSystem.ts
│   ├── EnemyDensitySystem.ts
│   └── DifficultySystem.ts
│
├── pools/
│   └── EnemyPool.ts
│
├── data/
│   ├── enemies.ts
│   ├── spawn-phases.ts
│   ├── formations.ts
│   └── difficulty-curve.ts
│
└── entities/
    └── Enemy.ts
```

Responsabilidades:

### SpawnSystem

Executa os pedidos de spawn.

### SpawnDirector

Decide quando, quanto e qual inimigo.

### SpawnPositionSystem

Encontra uma posição válida.

### EnemyDensitySystem

Evita acumulação em um único local.

### DifficultySystem

Calcula modificadores de dificuldade.

### EnemyPool

Entrega e recolhe instâncias.

## 16. Exemplo integrado

```ts
class SpawnSystem {
  private timer = 0;

  constructor(
    private readonly director: SpawnDirector,
    private readonly positionSystem: SpawnPositionSystem,
    private readonly enemyPool: EnemyPool,
    private readonly enemyManager: EnemyManager
  ) {}

  update(deltaTime: number, gameTime: number): void {
    const phase = this.director.getPhase(gameTime);

    if (!phase) {
      return;
    }

    if (this.enemyManager.activeCount >= phase.maxAlive) {
      return;
    }

    this.timer += deltaTime;

    if (this.timer < phase.spawnInterval) {
      return;
    }

    this.timer -= phase.spawnInterval;

    const availableSlots =
      phase.maxAlive - this.enemyManager.activeCount;

    const amount = Math.min(
      phase.spawnAmount,
      availableSlots
    );

    for (let index = 0; index < amount; index++) {
      this.spawnOne(phase);
    }
  }

  private spawnOne(phase: SpawnPhase): void {
    const enemyId = chooseWeightedEnemy(phase.enemies);
    const position = this.positionSystem.findValidPosition();

    if (!position) {
      return;
    }

    const enemy = this.enemyPool.acquire(enemyId);

    if (!enemy) {
      return;
    }

    enemy.activate({
      definitionId: enemyId,
      position
    });

    this.enemyManager.add(enemy);
  }
}
```

## Modelo ideal para o Elemental Survives

Eu estruturaria cada partida assim:

```text
Timeline fixa
        +
tabela ponderada de inimigos
        +
anel de spawn fora da câmera
        +
limite de inimigos vivos
        +
orçamento de ameaça
        +
eventos especiais
        +
object pooling
```

Exemplo:

```text
0-2 minutos
Inimigos básicos, orçamento baixo.

2-4 minutos
Mais densidade e primeiro inimigo rápido.

4-5 minutos
Formações elementais e cerco parcial.

5 minutos
Primeira elite.

5-8 minutos
Mistura de inimigos e aumento do orçamento.

8 minutos
Evento elemental do mapa.

10 minutos
Chefe.
```

Assim, o spawn deixa de ser apenas "criar inimigos aleatoriamente" e passa a funcionar como o ritmo central da partida. Ele controla pressão, variedade, dificuldade, descanso e momentos marcantes.
