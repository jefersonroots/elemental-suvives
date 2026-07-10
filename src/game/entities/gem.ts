import type { Graphics } from 'pixi.js';
import type { Poolable } from '../../render/pool';

export interface Gem extends Poolable {
  id: number;
  x: number;
  y: number;
  radius: number;
  xp: number;
  sprite: Graphics;
}
