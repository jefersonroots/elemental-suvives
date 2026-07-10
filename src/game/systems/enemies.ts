import type { Enemy } from '../entities/enemy';
import type { Hero } from '../entities/hero';
import type { ObjectPool } from '../../render/pool';
import type { SpatialGrid } from '../spatial-grid';
import { normalize } from '../vector';

const DESPAWN_DISTANCE = 900;
const SEPARATION_QUERY_RADIUS = 72;
const SEPARATION_STRENGTH = 0.55;

export function updateEnemies(
  enemies: ObjectPool<Enemy>,
  hero: Hero,
  stepSeconds: number,
): void {
  for (const enemy of enemies.activeItems()) {
    const direction = normalize({
      x: hero.x - enemy.x,
      y: hero.y - enemy.y,
    });

    enemy.x += direction.x * enemy.speed * stepSeconds;
    enemy.y += direction.y * enemy.speed * stepSeconds;
    enemy.sprite.alpha = Math.min(1, enemy.sprite.alpha + stepSeconds * 8);
    const scale = Math.max(enemy.baseScale, enemy.sprite.scale.x - stepSeconds * 3);
    enemy.sprite.scale.set(scale);
    enemy.sprite.position.set(Math.round(enemy.x), Math.round(enemy.y));

    const dx = enemy.x - hero.x;
    const dy = enemy.y - hero.y;
    if (dx * dx + dy * dy > DESPAWN_DISTANCE * DESPAWN_DISTANCE) {
      enemies.release(enemy);
    }
  }
}

export function separateEnemies(enemies: ObjectPool<Enemy>, enemyGrid: SpatialGrid<Enemy>): void {
  for (const enemy of enemies.activeItems()) {
    const nearby = enemyGrid.queryCircle(enemy.x, enemy.y, SEPARATION_QUERY_RADIUS);

    for (const other of nearby) {
      if (other.id === enemy.id || !other.active) {
        continue;
      }

      const dx = enemy.x - other.x;
      const dy = enemy.y - other.y;
      const distance = Math.hypot(dx, dy) || 1;
      const minimumDistance = enemy.radius + other.radius;

      if (distance >= minimumDistance) {
        continue;
      }

      const overlap = minimumDistance - distance;
      const push = overlap * SEPARATION_STRENGTH;

      enemy.x += (dx / distance) * push;
      enemy.y += (dy / distance) * push;
    }

    enemy.sprite.position.set(Math.round(enemy.x), Math.round(enemy.y));
  }
}

export function createEnemyDefaults(id: number, sprite: Enemy['sprite']): Enemy {
  return {
    id,
    active: false,
    x: 0,
    y: 0,
    radius: 12,
    hp: 3,
    maxHp: 3,
    speed: 34,
    contactDamage: 1,
    xpValue: 1,
    tier: 1,
    baseScale: 0.1,
    element: 'fogo',
    sprite,
    repaint: () => undefined,
  };
}
