import type { Container } from 'pixi.js';
import type { Hero } from '../entities/hero';

export interface CameraOptions {
  viewWidth: number;
  viewHeight: number;
  world: Container;
}

export function updateCamera(hero: Hero, options: CameraOptions): void {
  options.world.position.set(
    Math.round(options.viewWidth / 2 - hero.x),
    Math.round(options.viewHeight / 2 - hero.y),
  );
}
