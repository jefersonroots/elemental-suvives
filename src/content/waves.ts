import type { EnemyTier } from '../game/entities/enemy';

export const FIRST_PLAYABLE_MINUTE_SECONDS = 60;
export const FIRST_BOSS_SPAWN_SECONDS = 75;

export interface EnemyStats {
  hp: number;
  speed: number;
  contactDamage: number;
  radius: number;
  xpValue: number;
  tier: EnemyTier;
}

export function enemySpawnRatePerSecond(elapsedSeconds: number): number {
  if (elapsedSeconds < 20) {
    return 1.2;
  }

  if (elapsedSeconds < 45) {
    return 1.8;
  }

  return 2.4;
}

export function enemyStatsForElapsed(elapsedSeconds: number, tier: EnemyTier): EnemyStats {
  const hpBonus = Math.floor(elapsedSeconds / 30);
  const speedBonus = Math.min(elapsedSeconds * 0.15, 12);

  switch (tier) {
    case 2:
      return {
        tier,
        hp: 7 + hpBonus * 2,
        speed: 27 + speedBonus * 0.65,
        contactDamage: 1,
        radius: 15,
        xpValue: 2,
      };
    case 3:
      return {
        tier,
        hp: 11 + hpBonus * 3,
        speed: 42 + speedBonus,
        contactDamage: 2,
        radius: 13,
        xpValue: 3,
      };
    case 'boss':
      return {
        tier,
        hp: 90 + hpBonus * 18,
        speed: 22 + speedBonus * 0.35,
        contactDamage: 2,
        radius: 28,
        xpValue: 14,
      };
    case 1:
    default:
      return {
        tier: 1,
        hp: 3 + hpBonus,
        speed: 34 + speedBonus,
        contactDamage: 1,
        radius: 12,
        xpValue: 1,
      };
  }
}

export function enemyTierForElapsed(elapsedSeconds: number): EnemyTier {
  const roll = Math.random();

  if (elapsedSeconds < 25) {
    return 1;
  }

  if (elapsedSeconds < 55) {
    return roll < 0.78 ? 1 : 2;
  }

  if (elapsedSeconds < 95) {
    if (roll < 0.58) {
      return 1;
    }

    return roll < 0.88 ? 2 : 3;
  }

  if (roll < 0.42) {
    return 1;
  }

  return roll < 0.78 ? 2 : 3;
}
