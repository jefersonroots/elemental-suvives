import type { Enemy } from '../entities/enemy';
import type { Gem } from '../entities/gem';
import type { World } from '../world';
import type { ObjectPool } from '../../render/pool';
import { TYPE_ADVANTAGE_PCT } from '../../content/balance';
import { elementDamageMultiplier } from '../../content/elements';
import { spawnDamageNumber } from './damage-numbers';

const CONTACT_PUSH_DISTANCE = 8;

export function resolveProjectileEnemyCollisions(world: World): void {
  for (const projectile of world.projectiles.activeItems()) {
    const enemies = world.enemyGrid.queryCircle(
      projectile.x,
      projectile.y,
      projectile.radius + 14,
    );

    const hit = enemies.find((enemy) => enemy.active && circlesOverlap(projectile, enemy));
    if (!hit) {
      continue;
    }

    const multiplier = elementDamageMultiplier(
      projectile.element,
      hit.element,
      TYPE_ADVANTAGE_PCT,
    );
    const damage = projectile.damage * multiplier;
    hit.hp -= damage;
    hit.sprite.alpha = multiplier > 1 ? 0.35 : 0.55;
    hit.sprite.scale.set(hit.baseScale * (multiplier > 1 ? 1.15 : 1));
    if (world.showEnemyDamageNumbers) {
      spawnDamageNumber(world.damageNumbers, hit.x, hit.y, damage, multiplier);
    }

    if (projectile.pierceRemaining > 0) {
      projectile.pierceRemaining -= 1;
    } else {
      world.projectiles.release(projectile);
    }

    if (hit.hp <= 0) {
      killEnemy(world, hit);
    }
  }
}

export function resolveHeroEnemyContact(world: World): void {
  const touching = world.enemyGrid.queryCircle(
    world.hero.x,
    world.hero.y,
    world.hero.radius + 16,
  );

  for (const enemy of touching) {
    if (!circlesOverlap(world.hero, enemy)) {
      continue;
    }

    const dx = enemy.x - world.hero.x;
    const dy = enemy.y - world.hero.y;
    const distance = Math.hypot(dx, dy) || 1;

    enemy.x += (dx / distance) * CONTACT_PUSH_DISTANCE;
    enemy.y += (dy / distance) * CONTACT_PUSH_DISTANCE;
    enemy.sprite.position.set(Math.round(enemy.x), Math.round(enemy.y));
  }
}

export function resolveHeroGemPickups(world: World): void {
  for (const gem of world.gems.activeItems()) {
    if (!circlesOverlap(world.hero, gem)) {
      continue;
    }

    world.xp += gem.xp;
    world.gems.release(gem);
  }
}

function killEnemy(world: World, enemy: Enemy): void {
  spawnGem(world.gems, enemy.x, enemy.y, enemy.xpValue);
  world.kills += 1;
  world.enemies.release(enemy);
}

function spawnGem(gems: ObjectPool<Gem>, x: number, y: number, xpValue: number): void {
  const gem = gems.acquire();
  if (!gem) {
    return;
  }

  gem.x = x;
  gem.y = y;
  gem.xp = xpValue;
  gem.sprite.position.set(Math.round(gem.x), Math.round(gem.y));
}

function circlesOverlap(
  a: { x: number; y: number; radius: number },
  b: { x: number; y: number; radius: number },
): boolean {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const radius = a.radius + b.radius;
  return dx * dx + dy * dy <= radius * radius;
}
