import type { AnimatedSprite, Graphics, Sprite } from 'pixi.js';
import { TYPE_ADVANTAGE_PCT } from '../../content/balance';
import { elementDamageMultiplier } from '../../content/elements';
import type { Enemy } from '../entities/enemy';
import type { World } from '../world';
import { spawnDamageNumber } from './damage-numbers';

export interface AbilityVisuals {
  aura: Graphics;
  auraIcon: Sprite;
  zone: Graphics;
  zoneCloud: AnimatedSprite;
}

export const AURA_BASE_RADIUS = 34;
export const AURA_RADIUS_PER_LEVEL = 6;
export const AURA_BASE_DAMAGE = 0.45;
export const AURA_DAMAGE_PER_LEVEL = 0.15;
export const AURA_TICK_SECONDS = 0.35;
export const ZONE_BASE_RADIUS = 52;
export const ZONE_RADIUS_PER_LEVEL = 8;
export const ZONE_BASE_DAMAGE = 1.2;
export const ZONE_DAMAGE_PER_LEVEL = 0.35;
export const ZONE_TICK_SECONDS = 1.6;

export class AbilityController {
  private auraCooldown = 0;
  private zoneCooldown = 0;

  constructor(private readonly visuals: AbilityVisuals) {}

  update(world: World, stepSeconds: number): void {
    this.updateAura(world, stepSeconds);
    this.updateZone(world, stepSeconds);
  }

  private updateAura(world: World, stepSeconds: number): void {
    const level = world.upgrades.auraLevel;
    const radius = AURA_BASE_RADIUS + level * AURA_RADIUS_PER_LEVEL;

    this.visuals.aura.visible = level > 0;
    this.visuals.auraIcon.visible = level > 0;
    this.visuals.aura.position.set(Math.round(world.hero.x), Math.round(world.hero.y));
    this.visuals.auraIcon.position.set(
      Math.round(world.hero.x + Math.cos(world.elapsedSeconds * 3) * radius),
      Math.round(world.hero.y + Math.sin(world.elapsedSeconds * 3) * radius),
    );
    this.visuals.aura.scale.set(radius / 32);

    if (level <= 0) {
      return;
    }

    this.auraCooldown -= stepSeconds;
    if (this.auraCooldown > 0) {
      return;
    }

    this.auraCooldown += AURA_TICK_SECONDS;
    for (const enemy of world.enemyGrid.queryCircle(world.hero.x, world.hero.y, radius)) {
      damageEnemy(world, enemy, AURA_BASE_DAMAGE + level * AURA_DAMAGE_PER_LEVEL);
    }
  }

  private updateZone(world: World, stepSeconds: number): void {
    const level = world.upgrades.zoneLevel;
    const radius = ZONE_BASE_RADIUS + level * ZONE_RADIUS_PER_LEVEL;

    this.visuals.zone.visible = level > 0;
    this.visuals.zoneCloud.visible = level > 0;
    this.visuals.zone.position.set(Math.round(world.hero.x), Math.round(world.hero.y));
    this.visuals.zoneCloud.position.set(Math.round(world.hero.x), Math.round(world.hero.y));
    this.visuals.zone.scale.set(level > 0 ? radius / 48 : 1);
    this.visuals.zoneCloud.scale.set(0.11 + level * 0.018);
    this.visuals.zone.alpha = level > 0 ? 0.18 + Math.sin(world.elapsedSeconds * 8) * 0.05 : 0;
    this.visuals.zoneCloud.alpha = level > 0 ? 0.25 + Math.sin(world.elapsedSeconds * 8) * 0.08 : 0;

    if (level <= 0) {
      return;
    }

    this.zoneCooldown -= stepSeconds;
    if (this.zoneCooldown > 0) {
      return;
    }

    this.zoneCooldown += ZONE_TICK_SECONDS;
    this.visuals.zone.alpha = 0.4;

    for (const enemy of world.enemyGrid.queryCircle(world.hero.x, world.hero.y, radius)) {
      damageEnemy(world, enemy, ZONE_BASE_DAMAGE + level * ZONE_DAMAGE_PER_LEVEL);
    }
  }
}

function damageEnemy(world: World, enemy: Enemy, baseDamage: number): void {
  if (!enemy.active) {
    return;
  }

  const multiplier = elementDamageMultiplier(world.hero.element, enemy.element, TYPE_ADVANTAGE_PCT);
  const damage = baseDamage * multiplier;
  enemy.hp -= damage;
  enemy.sprite.alpha = multiplier > 1 ? 0.35 : 0.55;
  enemy.sprite.scale.set(enemy.baseScale * (multiplier > 1 ? 1.12 : 1));
  if (world.showEnemyDamageNumbers) {
    spawnDamageNumber(world.damageNumbers, enemy.x, enemy.y, damage, multiplier);
  }

  if (enemy.hp <= 0) {
    const gem = world.gems.acquire();
    if (gem) {
      gem.x = enemy.x;
      gem.y = enemy.y;
      gem.xp = enemy.xpValue;
      gem.sprite.position.set(Math.round(gem.x), Math.round(gem.y));
    }
    world.kills += 1;
    world.enemies.release(enemy);
  }
}
