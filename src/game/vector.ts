export interface Vec2 {
  x: number;
  y: number;
}

export const ZERO: Vec2 = { x: 0, y: 0 };

export function length(v: Vec2): number {
  return Math.hypot(v.x, v.y);
}

export function normalize(v: Vec2): Vec2 {
  const magnitude = length(v);
  if (magnitude === 0) {
    return ZERO;
  }

  return {
    x: v.x / magnitude,
    y: v.y / magnitude,
  };
}

export function scale(v: Vec2, amount: number): Vec2 {
  return {
    x: v.x * amount,
    y: v.y * amount,
  };
}
