import { normalize, type Vec2 } from './vector';

const KEY_TO_AXIS: Record<string, Vec2> = {
  ArrowUp: { x: 0, y: -1 },
  KeyW: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  KeyS: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  KeyA: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  KeyD: { x: 1, y: 0 },
};

export class InputController {
  private readonly pressed = new Set<string>();
  private pointerInsideCanvas = false;
  private pointerViewPosition: Vec2 = { x: 0, y: 0 };

  constructor(
    canvas: HTMLCanvasElement,
    private readonly viewWidth: number,
    private readonly viewHeight: number,
    target: Window = window,
  ) {
    target.addEventListener('keydown', (event) => {
      if (event.code in KEY_TO_AXIS) {
        event.preventDefault();
        this.pressed.add(event.code);
      }
    });

    target.addEventListener('keyup', (event) => {
      this.pressed.delete(event.code);
    });

    target.addEventListener('blur', () => {
      this.pressed.clear();
      this.pointerInsideCanvas = false;
    });

    canvas.addEventListener('pointermove', (event) => {
      const rect = canvas.getBoundingClientRect();
      this.pointerViewPosition = {
        x: ((event.clientX - rect.left) / rect.width) * this.viewWidth,
        y: ((event.clientY - rect.top) / rect.height) * this.viewHeight,
      };
      this.pointerInsideCanvas = true;
    });

    canvas.addEventListener('pointerenter', () => {
      this.pointerInsideCanvas = true;
    });

    canvas.addEventListener('pointerleave', () => {
      this.pointerInsideCanvas = false;
    });
  }

  movement(): Vec2 {
    let x = 0;
    let y = 0;

    for (const code of this.pressed) {
      const axis = KEY_TO_AXIS[code];
      if (axis) {
        x += axis.x;
        y += axis.y;
      }
    }

    return normalize({ x, y });
  }

  aimDirection(): Vec2 | undefined {
    if (!this.pointerInsideCanvas) {
      return undefined;
    }

    const direction = normalize({
      x: this.pointerViewPosition.x - this.viewWidth / 2,
      y: this.pointerViewPosition.y - this.viewHeight / 2,
    });

    if (direction.x === 0 && direction.y === 0) {
      return undefined;
    }

    return direction;
  }
}
