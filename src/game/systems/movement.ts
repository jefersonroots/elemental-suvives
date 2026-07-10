import type { Hero } from '../entities/hero';
import { scale, type Vec2 } from '../vector';

export function updateHeroMovement(hero: Hero, direction: Vec2, stepSeconds: number): void {
  const velocity = scale(direction, hero.speed);

  hero.x += velocity.x * stepSeconds;
  hero.y += velocity.y * stepSeconds;

  hero.sprite.position.set(Math.round(hero.x), Math.round(hero.y));
}
