import type { Projectile } from '../entities/projectile';
import type { Hero } from '../entities/hero';
import type { ObjectPool } from '../../render/pool';
import type { UpgradeState } from '../world';

export const PROJECTILE_BASE_DAMAGE = 1;
export const PROJECTILE_BASE_COUNT = 1;
export const PROJECTILE_BASE_PIERCE = 0;
export const PROJECTILE_SPEED = 150;
const PROJECTILE_LIFE_SECONDS = 1.4;
export const FIRE_COOLDOWN_SECONDS = 0.28;
const SPREAD_RADIANS = 0.18;

export class AutoFireWeapon {
  private cooldownSeconds = 0;

  constructor(private readonly projectiles: ObjectPool<Projectile>) {}

  update(hero: Hero, upgrades: UpgradeState, stepSeconds: number): void {
    this.cooldownSeconds -= stepSeconds;
    if (this.cooldownSeconds > 0) {
      return;
    }

    this.cooldownSeconds += FIRE_COOLDOWN_SECONDS * upgrades.attackSpeedMultiplier;
    this.fire(hero, upgrades);
  }

  private fire(hero: Hero, upgrades: UpgradeState): void {
    const count = Math.min(upgrades.projectileCount, 5);
    const middle = (count - 1) / 2;

    for (let index = 0; index < count; index += 1) {
      const angleOffset = (index - middle) * SPREAD_RADIANS;
      const direction = rotate(hero.facing.x, hero.facing.y, angleOffset);
      this.fireOne(hero, direction.x, direction.y, upgrades);
    }
  }

  private fireOne(
    hero: Hero,
    directionX: number,
    directionY: number,
    upgrades: UpgradeState,
  ): void {
    const projectile = this.projectiles.acquire();
    if (!projectile) {
      return;
    }

    projectile.x = hero.x + directionX * 14;
    projectile.y = hero.y + directionY * 14;
    projectile.vx = directionX * PROJECTILE_SPEED;
    projectile.vy = directionY * PROJECTILE_SPEED;
    projectile.damage = PROJECTILE_BASE_DAMAGE;
    projectile.pierceRemaining = upgrades.projectilePierce;
    projectile.element = hero.element;
    projectile.lifeSeconds = projectile.maxLifeSeconds;
    projectile.sprite.tint = hero.element === 'fogo' ? 0xffffff : 0x8be36a;
    projectile.sprite.rotation = Math.atan2(directionY, directionX) + Math.PI / 2;
    projectile.sprite.position.set(Math.round(projectile.x), Math.round(projectile.y));
  }
}

export function updateProjectiles(
  projectiles: ObjectPool<Projectile>,
  stepSeconds: number,
): void {
  for (const projectile of projectiles.activeItems()) {
    projectile.x += projectile.vx * stepSeconds;
    projectile.y += projectile.vy * stepSeconds;
    projectile.lifeSeconds -= stepSeconds;
    projectile.sprite.position.set(Math.round(projectile.x), Math.round(projectile.y));

    if (projectile.lifeSeconds <= 0) {
      projectiles.release(projectile);
    }
  }
}

export function createProjectileDefaults(id: number, sprite: Projectile['sprite']): Projectile {
  return {
    id,
    active: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    radius: 4,
    damage: 1,
    pierceRemaining: 0,
    element: 'fogo',
    lifeSeconds: 0,
    maxLifeSeconds: PROJECTILE_LIFE_SECONDS,
    sprite,
  };
}

function rotate(x: number, y: number, radians: number): { x: number; y: number } {
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  return {
    x: x * cos - y * sin,
    y: x * sin + y * cos,
  };
}
