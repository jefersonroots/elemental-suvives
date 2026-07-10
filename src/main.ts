import { AnimatedSprite, Application, Assets, Container, Graphics, Sprite, Texture } from 'pixi.js';
import { InputController } from './game/input';
import { FixedStepLoop } from './game/loop';
import {
  applyUpgrade,
  checkLevelUp,
  draftChoices,
  type UpgradeChoice,
} from './game/progression';
import {
  AURA_BASE_DAMAGE,
  AURA_BASE_RADIUS,
  AURA_DAMAGE_PER_LEVEL,
  AURA_RADIUS_PER_LEVEL,
  AbilityController,
  ZONE_BASE_DAMAGE,
  ZONE_BASE_RADIUS,
  ZONE_DAMAGE_PER_LEVEL,
  ZONE_RADIUS_PER_LEVEL,
} from './game/systems/abilities';
import { updateCamera } from './game/systems/camera';
import { updateHeroMovement } from './game/systems/movement';
import {
  resolveHeroEnemyContact,
  resolveHeroGemPickups,
  resolveProjectileEnemyCollisions,
} from './game/systems/collision';
import {
  createDamageNumberDefaults,
  createDamageNumberText,
  updateDamageNumbers,
} from './game/systems/damage-numbers';
import { createEnemyDefaults, separateEnemies, updateEnemies } from './game/systems/enemies';
import { createGemDefaults, updateGems } from './game/systems/pickups';
import { SpawnDirector } from './game/systems/spawn-director';
import {
  AutoFireWeapon,
  FIRE_COOLDOWN_SECONDS,
  PROJECTILE_BASE_COUNT,
  PROJECTILE_BASE_DAMAGE,
  PROJECTILE_BASE_PIERCE,
  createProjectileDefaults,
  updateProjectiles,
} from './game/systems/weapons';
import {
  createWorld,
  rebuildEnemyGrid,
  rebuildProjectileGrid,
  type World,
} from './game/world';
import { ObjectPool } from './render/pool';
import type { DamageNumber } from './game/entities/damage-number';
import type { Enemy } from './game/entities/enemy';
import type { Gem } from './game/entities/gem';
import { setHeroAnimation, type Hero, type HeroAnimationName, type HeroAnimationSet } from './game/entities/hero';
import type { Projectile } from './game/entities/projectile';
import './styles.css';

const VIEW_WIDTH = 640;
const VIEW_HEIGHT = 360;
const INTEGER_SCALE = 2;
const WORLD_TILE_SIZE = 16;
const WORLD_HALF_SIZE = 1024;
const ENEMY_POOL_SIZE = 180;
const GEM_POOL_SIZE = 240;
const PROJECTILE_POOL_SIZE = 96;
const DAMAGE_NUMBER_POOL_SIZE = 160;
const HERO_SPRITE_SCALE = 1;
const HERO_ANIMATION_SPEED = 0.12;
const ENEMY_ANIMATION_SPEED = 0.1;

type EnemyTextureTier = 1 | 2 | 3;
type EnemyTextures = Record<Enemy['element'], Record<EnemyTextureTier, Texture[]>>;
interface PowerTextures {
  auraIcon: Texture;
  projectile: Texture;
  zoneCloud: Texture[];
}

const HERO_ANIMATION_FRAME_PATHS: Record<Hero['element'], Record<HeroAnimationName, string[]>> = {
  fogo: {
    idle: [
      '/heroes/fogo/idle/idle_01.png',
      '/heroes/fogo/idle/idle_02.png',
      '/heroes/fogo/idle/idle_03.png',
      '/heroes/fogo/idle/idle_04.png',
    ],
    andando: [
      '/heroes/fogo/andando/andando_r_01.png',
      '/heroes/fogo/andando/andando_r_02.png',
      '/heroes/fogo/andando/andando_r_03.png',
      '/heroes/fogo/andando/andando_r_04.png',
    ],
    feliz: [
      '/heroes/fogo/feliz/feliz_01.png',
      '/heroes/fogo/feliz/feliz_02.png',
      '/heroes/fogo/feliz/feliz_03.png',
      '/heroes/fogo/feliz/feliz_04.png',
    ],
  },
  planta: {
    idle: ['/heroes/planta/idle/idle_01.png', '/heroes/planta/idle/idle_02.png'],
    andando: [
      '/heroes/planta/andando/andando_r_01.png',
      '/heroes/planta/andando/andando_r_02.png',
      '/heroes/planta/andando/andando_r_03.png',
      '/heroes/planta/andando/andando_r_04.png',
    ],
    feliz: [
      '/heroes/planta/feliz/feliz_01.png',
      '/heroes/planta/feliz/feliz_02.png',
      '/heroes/planta/feliz/feliz_03.png',
      '/heroes/planta/feliz/feliz_04.png',
    ],
  },
};

const ENEMY_IDLE_FRAME_PATHS: Record<Enemy['element'], Record<EnemyTextureTier, string[]>> = {
  fogo: {
    1: [
      '/enemies/fogo/tier1/idle/idle_01.png',
      '/enemies/fogo/tier1/idle/idle_02.png',
      '/enemies/fogo/tier1/idle/idle_03.png',
      '/enemies/fogo/tier1/idle/idle_04.png',
    ],
    2: [
      '/enemies/fogo/tier2/idle/idle_01.png',
      '/enemies/fogo/tier2/idle/idle_02.png',
      '/enemies/fogo/tier2/idle/idle_03.png',
      '/enemies/fogo/tier2/idle/idle_04.png',
    ],
    3: [
      '/enemies/fogo/tier3/idle/idle_01.png',
      '/enemies/fogo/tier3/idle/idle_02.png',
      '/enemies/fogo/tier3/idle/idle_03.png',
      '/enemies/fogo/tier3/idle/idle_04.png',
    ],
  },
  planta: {
    1: [
      '/enemies/planta/tier1/idle/idle_01.png',
      '/enemies/planta/tier1/idle/idle_02.png',
      '/enemies/planta/tier1/idle/idle_03.png',
    ],
    2: [
      '/enemies/planta/tier2/idle/idle_01.png',
      '/enemies/planta/tier2/idle/idle_02.png',
    ],
    3: [
      '/enemies/planta/tier3/idle/idle_01.png',
      '/enemies/planta/tier3/idle/idle_02.png',
    ],
  },
};

const POWER_TEXTURE_PATHS = {
  auraIcon: '/powers/caveira/caveira_doente.png',
  projectile: '/powers/ovo/egg_pixel.png',
  zoneCloud: [
    '/powers/cocozinho/odor_01.png',
    '/powers/cocozinho/odor_02.png',
    '/powers/cocozinho/odor_03.png',
    '/powers/cocozinho/odor_04.png',
    '/powers/cocozinho/odor_05.png',
    '/powers/cocozinho/odor_06.png',
  ],
} as const;

async function loadHeroTextures(): Promise<Record<Hero['element'], HeroAnimationSet>> {
  const paths = [
    ...HERO_ANIMATION_FRAME_PATHS.fogo.idle,
    ...HERO_ANIMATION_FRAME_PATHS.fogo.andando,
    ...HERO_ANIMATION_FRAME_PATHS.fogo.feliz,
    ...HERO_ANIMATION_FRAME_PATHS.planta.idle,
    ...HERO_ANIMATION_FRAME_PATHS.planta.andando,
    ...HERO_ANIMATION_FRAME_PATHS.planta.feliz,
  ];
  const loaded = await Assets.load<Texture>(paths);

  for (const path of paths) {
    loaded[path].source.scaleMode = 'nearest';
  }

  return {
    fogo: {
      idle: HERO_ANIMATION_FRAME_PATHS.fogo.idle.map((path) => loaded[path]),
      andando: HERO_ANIMATION_FRAME_PATHS.fogo.andando.map((path) => loaded[path]),
      feliz: HERO_ANIMATION_FRAME_PATHS.fogo.feliz.map((path) => loaded[path]),
    },
    planta: {
      idle: HERO_ANIMATION_FRAME_PATHS.planta.idle.map((path) => loaded[path]),
      andando: HERO_ANIMATION_FRAME_PATHS.planta.andando.map((path) => loaded[path]),
      feliz: HERO_ANIMATION_FRAME_PATHS.planta.feliz.map((path) => loaded[path]),
    },
  };
}

async function loadEnemyTextures(): Promise<EnemyTextures> {
  const paths = [
    ...ENEMY_IDLE_FRAME_PATHS.fogo[1],
    ...ENEMY_IDLE_FRAME_PATHS.fogo[2],
    ...ENEMY_IDLE_FRAME_PATHS.fogo[3],
    ...ENEMY_IDLE_FRAME_PATHS.planta[1],
    ...ENEMY_IDLE_FRAME_PATHS.planta[2],
    ...ENEMY_IDLE_FRAME_PATHS.planta[3],
  ];
  const loaded = await Assets.load<Texture>(paths);

  for (const path of paths) {
    loaded[path].source.scaleMode = 'nearest';
  }

  return {
    fogo: {
      1: ENEMY_IDLE_FRAME_PATHS.fogo[1].map((path) => loaded[path]),
      2: ENEMY_IDLE_FRAME_PATHS.fogo[2].map((path) => loaded[path]),
      3: ENEMY_IDLE_FRAME_PATHS.fogo[3].map((path) => loaded[path]),
    },
    planta: {
      1: ENEMY_IDLE_FRAME_PATHS.planta[1].map((path) => loaded[path]),
      2: ENEMY_IDLE_FRAME_PATHS.planta[2].map((path) => loaded[path]),
      3: ENEMY_IDLE_FRAME_PATHS.planta[3].map((path) => loaded[path]),
    },
  };
}

async function loadPowerTextures(): Promise<PowerTextures> {
  const paths = [
    POWER_TEXTURE_PATHS.auraIcon,
    POWER_TEXTURE_PATHS.projectile,
    ...POWER_TEXTURE_PATHS.zoneCloud,
  ];
  const loaded = await Assets.load<Texture>(paths);

  for (const path of paths) {
    loaded[path].source.scaleMode = 'nearest';
  }

  return {
    auraIcon: loaded[POWER_TEXTURE_PATHS.auraIcon],
    projectile: loaded[POWER_TEXTURE_PATHS.projectile],
    zoneCloud: POWER_TEXTURE_PATHS.zoneCloud.map((path) => loaded[path]),
  };
}

async function bootstrap(): Promise<void> {
  const [heroTextures, enemyTextures, powerTextures] = await Promise.all([
    loadHeroTextures(),
    loadEnemyTextures(),
    loadPowerTextures(),
  ]);
  const app = new Application();

  await app.init({
    width: VIEW_WIDTH,
    height: VIEW_HEIGHT,
    backgroundColor: 0x101018,
    antialias: false,
    resolution: 1,
    autoDensity: false,
  });

  const root = document.querySelector<HTMLDivElement>('#app');
  if (!root) {
    throw new Error('Missing #app root element.');
  }

  app.canvas.id = 'game-canvas';
  app.canvas.style.width = `${VIEW_WIDTH * INTEGER_SCALE}px`;
  app.canvas.style.height = `${VIEW_HEIGHT * INTEGER_SCALE}px`;
  root.append(app.canvas);

  const worldLayer = new Container();
  app.stage.addChild(worldLayer);

  drawBackground(worldLayer);

  const enemyLayer = new Container();
  const gemLayer = new Container();
  const abilityLayer = new Container();
  const projectileLayer = new Container();
  const damageNumberLayer = new Container();
  const hero = createHero('fogo', heroTextures);
  worldLayer.addChild(gemLayer);
  worldLayer.addChild(abilityLayer);
  worldLayer.addChild(enemyLayer);
  worldLayer.addChild(projectileLayer);
  worldLayer.addChild(damageNumberLayer);
  worldLayer.addChild(hero.sprite);

  const enemies = createEnemyPool(enemyLayer, enemyTextures);
  const gems = createGemPool(gemLayer);
  const projectiles = createProjectilePool(projectileLayer, powerTextures.projectile);
  const damageNumbers = createDamageNumberPool(damageNumberLayer);
  const world = createWorld({
    stage: worldLayer,
    hero,
    enemies,
    gems,
    projectiles,
    damageNumbers,
  });
  const input = new InputController(app.canvas, VIEW_WIDTH, VIEW_HEIGHT);
  const weapon = new AutoFireWeapon(projectiles);
  const spawns = new SpawnDirector(enemies);
  const abilities = new AbilityController(createAbilityVisuals(abilityLayer, powerTextures));
  const hud = createHud(root, world);
  const draftOverlay = createDraftOverlay(root);

  createHeroSelectOverlay(root, (element) => {
    configureHero(world.hero, element, heroTextures);
    world.runState = 'playing';
  });

  const loop = new FixedStepLoop({
    update: (stepSeconds) => {
      updateWorld(world, input, weapon, spawns, abilities, draftOverlay, stepSeconds);
    },
    render: () => {
      updateCamera(world.hero, {
        viewWidth: VIEW_WIDTH,
        viewHeight: VIEW_HEIGHT,
        world: world.stage,
      });
      updateHud(hud, world);
    },
  });

  loop.start();
}

function updateWorld(
  world: World,
  input: InputController,
  weapon: AutoFireWeapon,
  spawns: SpawnDirector,
  abilities: AbilityController,
  draftOverlay: DraftOverlay,
  stepSeconds: number,
): void {
  if (world.runState !== 'playing') {
    return;
  }

  world.elapsedSeconds += stepSeconds;
  const moveDirection = input.movement();
  updateHeroMovement(world.hero, moveDirection, stepSeconds);
  setHeroAnimation(world.hero, moveDirection.x !== 0 || moveDirection.y !== 0 ? 'andando' : 'idle');
  const aimDirection = input.aimDirection();
  if (aimDirection) {
    world.hero.facing = aimDirection;
  }
  spawns.update(world.hero, world.elapsedSeconds, stepSeconds);
  updateEnemies(world.enemies, world.hero, stepSeconds);
  rebuildEnemyGrid(world);
  separateEnemies(world.enemies, world.enemyGrid);
  rebuildEnemyGrid(world);
  abilities.update(world, stepSeconds);
  rebuildEnemyGrid(world);
  resolveHeroEnemyContact(world);
  weapon.update(world.hero, world.upgrades, stepSeconds);
  updateProjectiles(world.projectiles, stepSeconds);
  rebuildProjectileGrid(world);
  resolveProjectileEnemyCollisions(world);
  updateGems(world.gems, world.hero, stepSeconds);
  resolveHeroGemPickups(world);
  updateDamageNumbers(world.damageNumbers, stepSeconds);

  if (checkLevelUp(world)) {
    openDraft(world, draftOverlay);
  }
}

function drawBackground(world: Container): void {
  const floor = new Graphics();
  floor.rect(
    -WORLD_HALF_SIZE,
    -WORLD_HALF_SIZE,
    WORLD_HALF_SIZE * 2,
    WORLD_HALF_SIZE * 2,
  ).fill(0x101018);

  for (let y = -WORLD_HALF_SIZE; y < WORLD_HALF_SIZE; y += WORLD_TILE_SIZE) {
    for (let x = -WORLD_HALF_SIZE; x < WORLD_HALF_SIZE; x += WORLD_TILE_SIZE) {
      const color = Math.abs(x + y) % 32 === 0 ? 0x151522 : 0x11111b;
      floor.rect(x, y, WORLD_TILE_SIZE, WORLD_TILE_SIZE).fill(color);
    }
  }

  world.addChild(floor);
}

function createHero(
  element: Hero['element'],
  heroTextures: Record<Hero['element'], HeroAnimationSet>,
): Hero {
  const animations = heroTextures[element];
  const hero = new AnimatedSprite(animations.idle);
  hero.anchor.set(0.5);
  hero.scale.set(HERO_SPRITE_SCALE);
  hero.position.set(0, 0);
  hero.animationSpeed = HERO_ANIMATION_SPEED;
  hero.play();

  return {
    x: 0,
    y: 0,
    radius: 14,
    element,
    hp: element === 'planta' ? 8 : 6,
    maxHp: element === 'planta' ? 8 : 6,
    speed: element === 'planta' ? 78 : 92,
    facing: { x: 1, y: 0 },
    sprite: hero,
    animations,
    currentAnimation: 'idle',
  };
}

function configureHero(
  hero: Hero,
  element: Hero['element'],
  heroTextures: Record<Hero['element'], HeroAnimationSet>,
): void {
  hero.element = element;
  hero.maxHp = element === 'planta' ? 8 : 6;
  hero.hp = hero.maxHp;
  hero.speed = element === 'planta' ? 78 : 92;
  hero.animations = heroTextures[element];
  hero.currentAnimation = 'idle';
  hero.sprite.textures = hero.animations.idle;
  hero.sprite.play();
}

function createEnemyPool(layer: Container, enemyTextures: EnemyTextures): ObjectPool<Enemy> {
  return new ObjectPool<Enemy>(
    ENEMY_POOL_SIZE,
    (id) => {
      const sprite = createEnemySprite(enemyTextures.fogo[1]);
      layer.addChild(sprite);
      const enemy = createEnemyDefaults(id, sprite);
      enemy.repaint = (target) => repaintEnemySprite(target, enemyTextures);
      return enemy;
    },
    (enemy) => {
      enemy.sprite.visible = true;
      enemy.sprite.alpha = 1;
      enemy.sprite.play();
      repaintEnemySprite(enemy, enemyTextures);
    },
    (enemy) => {
      enemy.sprite.visible = false;
      enemy.sprite.position.set(0, 0);
      enemy.sprite.stop();
    },
  );
}

function createGemPool(layer: Container): ObjectPool<Gem> {
  return new ObjectPool<Gem>(
    GEM_POOL_SIZE,
    (id) => {
      const sprite = createGemGraphic();
      layer.addChild(sprite);
      return createGemDefaults(id, sprite);
    },
    (gem) => {
      gem.sprite.visible = true;
    },
    (gem) => {
      gem.sprite.visible = false;
      gem.sprite.position.set(0, 0);
    },
  );
}

function createProjectilePool(layer: Container, projectileTexture: Texture): ObjectPool<Projectile> {
  return new ObjectPool<Projectile>(
    PROJECTILE_POOL_SIZE,
    (id) => {
      const sprite = createProjectileSprite(projectileTexture);
      layer.addChild(sprite);
      return createProjectileDefaults(id, sprite);
    },
    (projectile) => {
      projectile.sprite.visible = true;
    },
    (projectile) => {
      projectile.sprite.visible = false;
      projectile.sprite.position.set(0, 0);
    },
  );
}

function createDamageNumberPool(layer: Container): ObjectPool<DamageNumber> {
  return new ObjectPool<DamageNumber>(
    DAMAGE_NUMBER_POOL_SIZE,
    (id) => {
      const text = createDamageNumberText();
      layer.addChild(text);
      return createDamageNumberDefaults(id, text);
    },
    (damageNumber) => {
      damageNumber.text.visible = true;
    },
    (damageNumber) => {
      damageNumber.text.visible = false;
      damageNumber.text.position.set(0, 0);
    },
  );
}

function createEnemySprite(textures: Texture[]): AnimatedSprite {
  const enemy = new AnimatedSprite(textures);
  enemy.anchor.set(0.5);
  enemy.animationSpeed = ENEMY_ANIMATION_SPEED;
  enemy.visible = false;
  enemy.play();
  return enemy;
}

function repaintEnemySprite(enemy: Enemy, enemyTextures: EnemyTextures): void {
  const textureTier = enemy.tier === 'boss' ? 3 : enemy.tier;
  enemy.sprite.textures = enemyTextures[enemy.element][textureTier];
  enemy.baseScale = enemyScaleForTier(enemy.tier);
  enemy.sprite.scale.set(enemy.baseScale);
  enemy.sprite.tint = 0xffffff;
  enemy.sprite.animationSpeed = enemy.tier === 'boss' ? ENEMY_ANIMATION_SPEED * 0.7 : ENEMY_ANIMATION_SPEED;
  enemy.sprite.play();
}

function enemyScaleForTier(tier: Enemy['tier']): number {
  switch (tier) {
    case 'boss':
      return 2.4;
    case 3:
    case 2:
    case 1:
    default:
      return 1;
  }
}

function createGemGraphic(): Graphics {
  const gem = new Graphics();
  gem.poly([0, -6, 5, -1, 3, 5, -3, 5, -5, -1]).fill(0x64d2ff);
  gem.poly([0, -3, 2, 0, 0, 3, -2, 0]).fill(0xc8f7ff);
  gem.visible = false;
  return gem;
}

function createAbilityVisuals(
  layer: Container,
  powerTextures: PowerTextures,
): { aura: Graphics; auraIcon: Sprite; zone: Graphics; zoneCloud: AnimatedSprite } {
  const zone = new Graphics();
  zone.circle(0, 0, 48).stroke({ width: 2, color: 0x8be36a, alpha: 0.9 });
  zone.circle(0, 0, 42).fill({ color: 0x3fa35b, alpha: 0.18 });
  zone.visible = false;

  const zoneCloud = new AnimatedSprite(powerTextures.zoneCloud);
  zoneCloud.anchor.set(0.5);
  zoneCloud.animationSpeed = 0.12;
  zoneCloud.alpha = 0.25;
  zoneCloud.visible = false;
  zoneCloud.play();

  const aura = new Graphics();
  aura.circle(0, 0, 32).stroke({ width: 2, color: 0xffb347, alpha: 0.9 });
  aura.visible = false;

  const auraIcon = new Sprite(powerTextures.auraIcon);
  auraIcon.anchor.set(0.5);
  auraIcon.scale.set(0.045);
  auraIcon.visible = false;

  layer.addChild(zone);
  layer.addChild(zoneCloud);
  layer.addChild(aura);
  layer.addChild(auraIcon);

  return { aura, auraIcon, zone, zoneCloud };
}

function createProjectileSprite(texture: Texture): Sprite {
  const projectile = new Sprite(texture);
  projectile.anchor.set(0.5);
  projectile.scale.set(0.035);
  projectile.visible = false;
  return projectile;
}

interface HudElements {
  root: HTMLDivElement;
  status: HTMLSpanElement;
  xpFill: HTMLDivElement;
  toggleDamage: HTMLButtonElement;
  metrics: HTMLSpanElement;
  stats: HTMLDivElement;
}

function createHud(root: HTMLDivElement, world: World): HudElements {
  const container = document.createElement('div');
  container.className = 'status-card';

  const title = document.createElement('strong');
  title.textContent = 'Elemental Survivors';

  const status = document.createElement('span');

  const xpBar = document.createElement('div');
  xpBar.className = 'xp-bar';
  const xpFill = document.createElement('div');
  xpBar.append(xpFill);

  const toggleDamage = document.createElement('button');
  toggleDamage.className = 'hud-toggle';
  toggleDamage.type = 'button';
  toggleDamage.addEventListener('click', () => {
    world.showEnemyDamageNumbers = !world.showEnemyDamageNumbers;
  });

  const metrics = document.createElement('span');
  const stats = document.createElement('div');
  stats.className = 'stats-panel';

  container.append(title, status, xpBar, toggleDamage, metrics, stats);
  root.append(container);

  return {
    root: container,
    status,
    xpFill,
    toggleDamage,
    metrics,
    stats,
  };
}

function updateHud(hud: HudElements, world: World): void {
  const nearbyProjectiles = world.projectileGrid.queryCircle(
    world.hero.x,
    world.hero.y,
    96,
  ).length;

  const xpPct = Math.max(0, Math.min(100, (world.xp / world.xpToNext) * 100));

  hud.status.textContent = `Marco 5: ${world.hero.element.toUpperCase()} - level ${world.level} - estado ${world.runState}`;
  hud.xpFill.style.width = `${xpPct}%`;
  hud.toggleDamage.textContent = `Mostrar dano no inimigo: ${
    world.showEnemyDamageNumbers ? 'ON' : 'OFF'
  }`;
  hud.toggleDamage.classList.toggle('active', world.showEnemyDamageNumbers);
  hud.metrics.textContent = `Tempo ${world.elapsedSeconds.toFixed(1)}s - inimigos ${world.enemies.activeCount()} - projéteis ${world.projectiles.activeCount()} - kills ${world.kills} - XP ${world.xp}/${world.xpToNext} - perto ${nearbyProjectiles}`;
  hud.stats.innerHTML = renderStatsPanel(world);
  hud.root.dataset.damageNumbers = world.showEnemyDamageNumbers ? 'on' : 'off';
}

function renderStatsPanel(world: World): string {
  const currentCooldown = FIRE_COOLDOWN_SECONDS * world.upgrades.attackSpeedMultiplier;
  const currentAuraDamage =
    world.upgrades.auraLevel > 0
      ? AURA_BASE_DAMAGE + world.upgrades.auraLevel * AURA_DAMAGE_PER_LEVEL
      : 0;
  const currentAuraRadius =
    world.upgrades.auraLevel > 0
      ? AURA_BASE_RADIUS + world.upgrades.auraLevel * AURA_RADIUS_PER_LEVEL
      : 0;
  const currentZoneDamage =
    world.upgrades.zoneLevel > 0
      ? ZONE_BASE_DAMAGE + world.upgrades.zoneLevel * ZONE_DAMAGE_PER_LEVEL
      : 0;
  const currentZoneRadius =
    world.upgrades.zoneLevel > 0
      ? ZONE_BASE_RADIUS + world.upgrades.zoneLevel * ZONE_RADIUS_PER_LEVEL
      : 0;

  const rows = [
    statRow('HP', world.hero.maxHp, world.hero.hp),
    statRow('Velocidade', world.hero.element === 'planta' ? 78 : 92, world.hero.speed),
    statRow('Dano projétil', PROJECTILE_BASE_DAMAGE, PROJECTILE_BASE_DAMAGE),
    statRow('Projéteis', PROJECTILE_BASE_COUNT, Math.min(world.upgrades.projectileCount, 5)),
    statRow('Perfuração', PROJECTILE_BASE_PIERCE, world.upgrades.projectilePierce),
    statRow('Cooldown tiro', FIRE_COOLDOWN_SECONDS, currentCooldown, 's', true),
    statRow('Aura dano', 0, currentAuraDamage),
    statRow('Aura raio', 0, currentAuraRadius),
    statRow('Zona dano', 0, currentZoneDamage),
    statRow('Zona raio', 0, currentZoneRadius),
  ];

  return `
    <strong>Valores base -> atual</strong>
    <div class="stats-grid">
      <span></span><span>Base</span><span>Atual</span>
      ${rows.join('')}
    </div>
  `;
}

function statRow(
  label: string,
  base: number,
  current: number,
  suffix = '',
  lowerIsBetter = false,
): string {
  const changed = Math.abs(base - current) > 0.001;
  const better = lowerIsBetter ? current < base : current > base;
  const className = changed ? (better ? 'better' : 'changed') : '';

  return `
    <span>${label}</span>
    <span>${formatStat(base)}${suffix}</span>
    <span class="${className}">${formatStat(current)}${suffix}</span>
  `;
}

function formatStat(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

interface DraftOverlay {
  element: HTMLDivElement;
}

function createHeroSelectOverlay(
  root: HTMLDivElement,
  onSelect: (element: Hero['element']) => void,
): void {
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.innerHTML = `
    <section class="panel">
      <h1>Escolha o herói</h1>
      <div class="card-grid">
        <button class="choice-card" data-hero="fogo">
          <strong>Fogo</strong>
          <span>Dano agressivo, velocidade maior.</span>
        </button>
        <button class="choice-card" data-hero="planta">
          <strong>Planta</strong>
          <span>Mais HP, estilo defensivo.</span>
        </button>
      </div>
    </section>
  `;

  overlay.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const button = target.closest<HTMLButtonElement>('[data-hero]');
    if (!button) {
      return;
    }

    const hero = button.dataset.hero;
    if (hero !== 'fogo' && hero !== 'planta') {
      return;
    }

    onSelect(hero);
    overlay.remove();
  });

  root.append(overlay);
}

function createDraftOverlay(root: HTMLDivElement): DraftOverlay {
  const element = document.createElement('div');
  element.className = 'overlay hidden';
  root.append(element);
  return { element };
}

function openDraft(world: World, overlay: DraftOverlay): void {
  world.runState = 'draft';
  setHeroAnimation(world.hero, 'feliz');
  const choices = draftChoices(world);
  overlay.element.classList.remove('hidden');
  overlay.element.innerHTML = `
    <section class="panel">
      <h1>Level ${world.level}</h1>
      <div class="card-grid">
        ${choices.map(renderChoice).join('')}
      </div>
    </section>
  `;

  overlay.element.onclick = (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const button = target.closest<HTMLButtonElement>('[data-upgrade]');
    if (!button) {
      return;
    }

    const id = button.dataset.upgrade;
    const choice = choices.find((candidate) => candidate.id === id);
    if (!choice) {
      return;
    }

    applyUpgrade(world, choice.id);

    if (world.pendingLevelUps > 0) {
      openDraft(world, overlay);
      return;
    }

    overlay.element.classList.add('hidden');
    overlay.element.innerHTML = '';
    world.runState = 'playing';
  };
}

function renderChoice(choice: UpgradeChoice): string {
  return `
    <button class="choice-card upgrade-card" data-upgrade="${choice.id}">
      <img class="choice-icon" src="${choice.iconPath}" alt="" aria-hidden="true">
      <strong>${choice.title}</strong>
      <span>${choice.description}</span>
    </button>
  `;
}

bootstrap().catch((error: unknown) => {
  console.error(error);
});
