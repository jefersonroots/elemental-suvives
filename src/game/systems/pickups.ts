import type { Gem } from '../entities/gem';
import type { Hero } from '../entities/hero';
import type { ObjectPool } from '../../render/pool';

const GEM_ATTRACT_RADIUS = 54;
const GEM_ATTRACT_SPEED = 120;

export function updateGems(
  gems: ObjectPool<Gem>,
  hero: Hero,
  stepSeconds: number,
): void {
  for (const gem of gems.activeItems()) {
    const dx = hero.x - gem.x;
    const dy = hero.y - gem.y;
    const distance = Math.hypot(dx, dy);

    if (distance > 0 && distance <= GEM_ATTRACT_RADIUS) {
      gem.x += (dx / distance) * GEM_ATTRACT_SPEED * stepSeconds;
      gem.y += (dy / distance) * GEM_ATTRACT_SPEED * stepSeconds;
    }

    gem.sprite.position.set(Math.round(gem.x), Math.round(gem.y));
  }
}

export function createGemDefaults(id: number, sprite: Gem['sprite']): Gem {
  return {
    id,
    active: false,
    x: 0,
    y: 0,
    radius: 5,
    xp: 1,
    sprite,
  };
}
