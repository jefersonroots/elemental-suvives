export const ACTIVE_ELEMENTS = ['fogo', 'planta'] as const;
export const ALL_ELEMENTS = ['fogo', 'planta', 'agua'] as const;

export type ActiveElementId = (typeof ACTIVE_ELEMENTS)[number];
export type ElementId = (typeof ALL_ELEMENTS)[number];

export const BEATS: Record<ElementId, ElementId> = {
  fogo: 'planta',
  planta: 'agua',
  agua: 'fogo',
};

export function elementDamageMultiplier(
  attacker: ElementId,
  target: ElementId,
  advantagePct: number,
): number {
  if (BEATS[attacker] === target) {
    return 1 + advantagePct;
  }

  if (BEATS[target] === attacker) {
    return 1 - advantagePct;
  }

  return 1;
}
