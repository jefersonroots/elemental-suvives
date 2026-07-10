import type { Sprite } from 'pixi.js';
import type { ActiveElementId } from '../../content/elements';
import type { Poolable } from '../../render/pool';

export interface Projectile extends Poolable {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  pierceRemaining: number;
  element: ActiveElementId;
  lifeSeconds: number;
  maxLifeSeconds: number;
  sprite: Sprite;
}
