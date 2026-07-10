export interface SpatialItem<T> {
  id: number;
  value: T;
  x: number;
  y: number;
  radius: number;
}

export class SpatialGrid<T> {
  private readonly cells = new Map<string, SpatialItem<T>[]>();

  constructor(readonly cellSize: number) {}

  clear(): void {
    this.cells.clear();
  }

  insert(item: SpatialItem<T>): void {
    const minCellX = this.toCell(item.x - item.radius);
    const maxCellX = this.toCell(item.x + item.radius);
    const minCellY = this.toCell(item.y - item.radius);
    const maxCellY = this.toCell(item.y + item.radius);

    for (let y = minCellY; y <= maxCellY; y += 1) {
      for (let x = minCellX; x <= maxCellX; x += 1) {
        const key = this.key(x, y);
        const cell = this.cells.get(key);
        if (cell) {
          cell.push(item);
        } else {
          this.cells.set(key, [item]);
        }
      }
    }
  }

  queryCircle(x: number, y: number, radius: number): T[] {
    const found = new Map<number, T>();
    const minCellX = this.toCell(x - radius);
    const maxCellX = this.toCell(x + radius);
    const minCellY = this.toCell(y - radius);
    const maxCellY = this.toCell(y + radius);
    const radiusSq = radius * radius;

    for (let cellY = minCellY; cellY <= maxCellY; cellY += 1) {
      for (let cellX = minCellX; cellX <= maxCellX; cellX += 1) {
        const cell = this.cells.get(this.key(cellX, cellY));
        if (!cell) {
          continue;
        }

        for (const item of cell) {
          const dx = item.x - x;
          const dy = item.y - y;
          if (dx * dx + dy * dy <= radiusSq) {
            found.set(item.id, item.value);
          }
        }
      }
    }

    return [...found.values()];
  }

  occupiedCellCount(): number {
    return this.cells.size;
  }

  private toCell(value: number): number {
    return Math.floor(value / this.cellSize);
  }

  private key(x: number, y: number): string {
    return `${x}:${y}`;
  }
}
