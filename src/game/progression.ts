import type { World } from './world';

export type UpgradeId =
  | 'projectile-count'
  | 'projectile-pierce'
  | 'attack-speed'
  | 'aura'
  | 'zone';

export interface UpgradeChoice {
  id: UpgradeId;
  title: string;
  description: string;
  iconPath: string;
}

const UPGRADE_LIBRARY: Record<UpgradeId, UpgradeChoice> = {
  'projectile-count': {
    id: 'projectile-count',
    title: 'Projetil extra',
    description: 'Dispara mais um projetil em leque.',
    iconPath: '/powers/ovo/egg_pixel.png',
  },
  'projectile-pierce': {
    id: 'projectile-pierce',
    title: 'Perfuracao',
    description: 'Projeteis atravessam mais um inimigo.',
    iconPath: '/powers/injecao/icone_injecao.png',
  },
  'attack-speed': {
    id: 'attack-speed',
    title: 'Cadencia',
    description: 'Atira mais rapido.',
    iconPath: '/powers/injecao/icone_injecao.png',
  },
  aura: {
    id: 'aura',
    title: 'Aura orbital',
    description: 'Dano constante perto do heroi.',
    iconPath: '/powers/caveira/caveira_doente.png',
  },
  zone: {
    id: 'zone',
    title: 'Pulso de zona',
    description: 'Emite uma area de dano periodicamente.',
    iconPath: '/powers/cocozinho/odor_01.png',
  },
};

export function checkLevelUp(world: World): boolean {
  let leveled = false;

  while (world.xp >= world.xpToNext) {
    world.xp -= world.xpToNext;
    world.level += 1;
    world.pendingLevelUps += 1;
    world.xpToNext = xpRequiredForLevel(world.level);
    leveled = true;
  }

  return leveled;
}

export function xpRequiredForLevel(level: number): number {
  return Math.floor(8 + level * 4 + level ** 1.35);
}

export function draftChoices(world: World): UpgradeChoice[] {
  const candidates = availableUpgrades(world);
  const rotated = rotate(candidates, world.level + world.kills);
  return rotated.slice(0, 3).map((id) => UPGRADE_LIBRARY[id]);
}

export function applyUpgrade(world: World, id: UpgradeId): void {
  switch (id) {
    case 'projectile-count':
      world.upgrades.projectileCount += 1;
      break;
    case 'projectile-pierce':
      world.upgrades.projectilePierce += 1;
      break;
    case 'attack-speed':
      world.upgrades.attackSpeedMultiplier *= 0.88;
      break;
    case 'aura':
      world.upgrades.auraLevel += 1;
      break;
    case 'zone':
      world.upgrades.zoneLevel += 1;
      break;
  }

  world.pendingLevelUps = Math.max(0, world.pendingLevelUps - 1);
}

function availableUpgrades(world: World): UpgradeId[] {
  const upgrades: UpgradeId[] = ['projectile-count', 'projectile-pierce', 'attack-speed'];

  if (world.upgrades.auraLevel < 5) {
    upgrades.push('aura');
  }

  if (world.upgrades.zoneLevel < 5) {
    upgrades.push('zone');
  }

  return upgrades;
}

function rotate<T>(items: T[], offset: number): T[] {
  if (items.length === 0) {
    return [];
  }

  const start = offset % items.length;
  return [...items.slice(start), ...items.slice(0, start)];
}
