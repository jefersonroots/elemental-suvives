import type { AnimatedSprite, Texture } from 'pixi.js';
import type { ActiveElementId } from '../../content/elements';
import type { Vec2 } from '../vector';

export type HeroAnimationName = 'idle' | 'andando' | 'feliz';

export type HeroAnimationSet = Record<HeroAnimationName, Texture[]>;

export interface Hero {
  x: number;
  y: number;
  radius: number;
  element: ActiveElementId;
  hp: number;
  maxHp: number;
  speed: number;
  facing: Vec2;
  sprite: AnimatedSprite;
  animations: HeroAnimationSet;
  currentAnimation: HeroAnimationName;
}

export function setHeroAnimation(hero: Hero, name: HeroAnimationName): void {
  if (hero.currentAnimation === name) {
    return;
  }

  hero.currentAnimation = name;
  hero.sprite.textures = hero.animations[name];
  hero.sprite.gotoAndPlay(0);
}
