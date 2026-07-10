export interface Poolable {
  active: boolean;
}

export class ObjectPool<T extends Poolable> {
  private readonly items: T[];

  constructor(
    capacity: number,
    private readonly createItem: (index: number) => T,
    private readonly onAcquire?: (item: T) => void,
    private readonly onRelease?: (item: T) => void,
  ) {
    this.items = Array.from({ length: capacity }, (_, index) => this.createItem(index));
  }

  acquire(): T | undefined {
    const item = this.items.find((candidate) => !candidate.active);
    if (!item) {
      return undefined;
    }

    item.active = true;
    this.onAcquire?.(item);
    return item;
  }

  release(item: T): void {
    if (!item.active) {
      return;
    }

    item.active = false;
    this.onRelease?.(item);
  }

  activeItems(): T[] {
    return this.items.filter((item) => item.active);
  }

  activeCount(): number {
    return this.items.reduce((count, item) => count + (item.active ? 1 : 0), 0);
  }
}
