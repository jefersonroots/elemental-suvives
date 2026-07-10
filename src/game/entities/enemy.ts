import type { AnimatedSprite } from 'pixi.js';
import type { ActiveElementId } from '../../content/elements';
import type { Poolable } from '../../render/pool';

export type EnemyTier = 1 | 2 | 3 | 'boss';

export interface Enemy extends Poolable {
  id: number;
  x: number;
  y: number;
  radius: number;
  hp: number;
  maxHp: number;
  speed: number;
  contactDamage: number;
  xpValue: number;
  tier: EnemyTier;
  baseScale: number;
  element: ActiveElementId;
  sprite: AnimatedSprite;
  repaint: (enemy: Enemy) => void;
}
