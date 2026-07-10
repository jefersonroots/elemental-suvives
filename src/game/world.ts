import type { Container } from 'pixi.js';
import type { ObjectPool } from '../render/pool';
import { SpatialGrid } from './spatial-grid';
import type { DamageNumber } from './entities/damage-number';
import type { Enemy } from './entities/enemy';
import type { Gem } from './entities/gem';
import type { Hero } from './entities/hero';
import type { Projectile } from './entities/projectile';

export interface World {
  elapsedSeconds: number;
  runState: 'hero-select' | 'playing' | 'draft';
  stage: Container;
  hero: Hero;
  enemies: ObjectPool<Enemy>;
  gems: ObjectPool<Gem>;
  projectiles: ObjectPool<Projectile>;
  damageNumbers: ObjectPool<DamageNumber>;
  projectileGrid: SpatialGrid<Projectile>;
  enemyGrid: SpatialGrid<Enemy>;
  kills: number;
  xp: number;
  level: number;
  xpToNext: number;
  pendingLevelUps: number;
  upgrades: UpgradeState;
  showEnemyDamageNumbers: boolean;
}

export interface UpgradeState {
  projectileCount: number;
  projectilePierce: number;
  attackSpeedMultiplier: number;
  auraLevel: number;
  zoneLevel: number;
}

export interface CreateWorldOptions {
  stage: Container;
  hero: Hero;
  enemies: ObjectPool<Enemy>;
  gems: ObjectPool<Gem>;
  projectiles: ObjectPool<Projectile>;
  damageNumbers: ObjectPool<DamageNumber>;
}

export function createWorld(options: CreateWorldOptions): World {
  return {
    elapsedSeconds: 0,
    runState: 'hero-select',
    stage: options.stage,
    hero: options.hero,
    enemies: options.enemies,
    gems: options.gems,
    projectiles: options.projectiles,
    damageNumbers: options.damageNumbers,
    projectileGrid: new SpatialGrid<Projectile>(32),
    enemyGrid: new SpatialGrid<Enemy>(32),
    kills: 0,
    xp: 0,
    level: 1,
    xpToNext: 8,
    pendingLevelUps: 0,
    upgrades: {
      projectileCount: 1,
      projectilePierce: 0,
      attackSpeedMultiplier: 1,
      auraLevel: 0,
      zoneLevel: 0,
    },
    showEnemyDamageNumbers: false,
  };
}

export function rebuildProjectileGrid(world: World): void {
  world.projectileGrid.clear();

  for (const projectile of world.projectiles.activeItems()) {
    world.projectileGrid.insert({
      id: projectile.id,
      value: projectile,
      x: projectile.x,
      y: projectile.y,
      radius: projectile.radius,
    });
  }
}

export function rebuildEnemyGrid(world: World): void {
  world.enemyGrid.clear();

  for (const enemy of world.enemies.activeItems()) {
    world.enemyGrid.insert({
      id: enemy.id,
      value: enemy,
      x: enemy.x,
      y: enemy.y,
      radius: enemy.radius,
    });
  }
}
