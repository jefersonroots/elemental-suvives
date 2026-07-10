import type { ElementId } from '../content/elements';

export interface MetaSave {
  gold: number;
  unlockedHeroes: ElementId[];
  permanentUpgrades: Record<string, number>;
}

export interface MetaStore {
  load(): MetaSave;
  save(data: MetaSave): void;
}
