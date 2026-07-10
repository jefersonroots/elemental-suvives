import type { Enemy } from '../entities/enemy';
import type { Hero } from '../entities/hero';
import type { ObjectPool } from '../../render/pool';
import { ACTIVE_ELEMENTS, type ActiveElementId } from '../../content/elements';
import {
  FIRST_BOSS_SPAWN_SECONDS,
  enemySpawnRatePerSecond,
  enemyStatsForElapsed,
  enemyTierForElapsed,
} from '../../content/waves';

const SPAWN_RING_MIN = 410;
const SPAWN_RING_RANDOM = 120;

export class SpawnDirector {
  private spawnBudget = 0;
  private nextElementIndex = 0;
  private firstBossSpawned = false;

  constructor(private readonly enemies: ObjectPool<Enemy>) {}

  update(hero: Hero, elapsedSeconds: number, stepSeconds: number): void {
    if (!this.firstBossSpawned && elapsedSeconds >= FIRST_BOSS_SPAWN_SECONDS) {
      this.firstBossSpawned = true;
      this.spawnEnemy(hero, elapsedSeconds, 'boss');
    }

    this.spawnBudget += enemySpawnRatePerSecond(elapsedSeconds) * stepSeconds;

    while (this.spawnBudget >= 1) {
      this.spawnBudget -= 1;
      this.spawnEnemy(hero, elapsedSeconds, enemyTierForElapsed(elapsedSeconds));
    }
  }

  private spawnEnemy(
    hero: Hero,
    elapsedSeconds: number,
    tier: Enemy['tier'],
  ): void {
    const enemy = this.enemies.acquire();
    if (!enemy) {
      return;
    }

    const angle = Math.random() * Math.PI * 2;
    const distance = SPAWN_RING_MIN + Math.random() * SPAWN_RING_RANDOM;
    const stats = enemyStatsForElapsed(elapsedSeconds, tier);
    const element = this.nextElement();

    enemy.x = hero.x + Math.cos(angle) * distance;
    enemy.y = hero.y + Math.sin(angle) * distance;
    enemy.element = element;
    enemy.tier = stats.tier;
    enemy.radius = stats.radius;
    enemy.maxHp = stats.hp;
    enemy.hp = stats.hp;
    enemy.speed = stats.speed;
    enemy.contactDamage = stats.contactDamage;
    enemy.xpValue = stats.xpValue;
    enemy.sprite.position.set(Math.round(enemy.x), Math.round(enemy.y));
    enemy.sprite.tint = element === 'fogo' ? 0xffffff : 0x8be36a;
    enemy.repaint(enemy);
  }

  private nextElement(): ActiveElementId {
    const element = ACTIVE_ELEMENTS[this.nextElementIndex % ACTIVE_ELEMENTS.length];
    this.nextElementIndex += 1;
    return element;
  }
}
