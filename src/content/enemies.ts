export const ENEMY_TIERS = ['egg', 'evolution_1', 'evolution_2'] as const;

export type EnemyTier = (typeof ENEMY_TIERS)[number];
