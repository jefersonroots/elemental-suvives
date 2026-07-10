import { Text, TextStyle } from 'pixi.js';
import type { DamageNumber } from '../entities/damage-number';
import type { ObjectPool } from '../../render/pool';

const DAMAGE_NUMBER_LIFE_SECONDS = 0.55;
const DAMAGE_NUMBER_SPEED = -22;

export function createDamageNumberDefaults(id: number, text: Text): DamageNumber {
  return {
    id,
    active: false,
    x: 0,
    y: 0,
    vy: DAMAGE_NUMBER_SPEED,
    lifeSeconds: 0,
    maxLifeSeconds: DAMAGE_NUMBER_LIFE_SECONDS,
    text,
  };
}

export function createDamageNumberText(): Text {
  const text = new Text({
    text: '',
    style: new TextStyle({
      fontFamily: 'monospace',
      fontSize: 8,
      fontWeight: '700',
      fill: '#fff06a',
      stroke: { color: '#101018', width: 2 },
    }),
  });
  text.anchor.set(0.5);
  text.visible = false;
  return text;
}

export function spawnDamageNumber(
  pool: ObjectPool<DamageNumber>,
  x: number,
  y: number,
  amount: number,
  multiplier: number,
): void {
  const damageNumber = pool.acquire();
  if (!damageNumber) {
    return;
  }

  damageNumber.x = x;
  damageNumber.y = y - 12;
  damageNumber.lifeSeconds = damageNumber.maxLifeSeconds;
  damageNumber.text.text = amount.toFixed(amount >= 10 ? 0 : 1);
  damageNumber.text.style.fill = multiplier > 1 ? '#fff06a' : multiplier < 1 ? '#a7a4c8' : '#f4f0ff';
  damageNumber.text.alpha = 1;
  damageNumber.text.position.set(Math.round(damageNumber.x), Math.round(damageNumber.y));
}

export function updateDamageNumbers(
  pool: ObjectPool<DamageNumber>,
  stepSeconds: number,
): void {
  for (const damageNumber of pool.activeItems()) {
    damageNumber.y += damageNumber.vy * stepSeconds;
    damageNumber.lifeSeconds -= stepSeconds;
    damageNumber.text.alpha = Math.max(0, damageNumber.lifeSeconds / damageNumber.maxLifeSeconds);
    damageNumber.text.position.set(Math.round(damageNumber.x), Math.round(damageNumber.y));

    if (damageNumber.lifeSeconds <= 0) {
      pool.release(damageNumber);
    }
  }
}
