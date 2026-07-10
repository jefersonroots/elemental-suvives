export const FIXED_STEP_SECONDS = 1 / 60;

const MAX_FRAME_SECONDS = 0.25;

export interface FixedStepLoopOptions {
  update(stepSeconds: number): void;
  render(alpha: number): void;
}

export class FixedStepLoop {
  private accumulatorSeconds = 0;
  private lastTimestampMs = 0;
  private rafId = 0;
  private running = false;

  constructor(private readonly options: FixedStepLoopOptions) {}

  start(): void {
    if (this.running) {
      return;
    }

    this.running = true;
    this.lastTimestampMs = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  private readonly tick = (timestampMs: number): void => {
    if (!this.running) {
      return;
    }

    const frameSeconds = Math.min(
      (timestampMs - this.lastTimestampMs) / 1000,
      MAX_FRAME_SECONDS,
    );
    this.lastTimestampMs = timestampMs;
    this.accumulatorSeconds += frameSeconds;

    while (this.accumulatorSeconds >= FIXED_STEP_SECONDS) {
      this.options.update(FIXED_STEP_SECONDS);
      this.accumulatorSeconds -= FIXED_STEP_SECONDS;
    }

    this.options.render(this.accumulatorSeconds / FIXED_STEP_SECONDS);
    this.rafId = requestAnimationFrame(this.tick);
  };
}
