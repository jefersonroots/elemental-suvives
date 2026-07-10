import type { Text } from 'pixi.js';
import type { Poolable } from '../../render/pool';

export interface DamageNumber extends Poolable {
  id: number;
  x: number;
  y: number;
  vy: number;
  lifeSeconds: number;
  maxLifeSeconds: number;
  text: Text;
}
