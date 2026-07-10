export const STARTER_WEAPON_IDS = ['foco'] as const;

export type WeaponId = (typeof STARTER_WEAPON_IDS)[number];
