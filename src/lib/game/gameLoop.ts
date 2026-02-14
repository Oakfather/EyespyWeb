export class GameLoop {
  private rafId = 0;
  private lastTime = 0;
  private running = false;
  private onUpdate: (dt: number) => void;
  private onRender: () => void;

  constructor(onUpdate: (dt: number) => void, onRender: () => void) {
    this.onUpdate = onUpdate;
    this.onRender = onRender;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  private tick = (now: number): void => {
    if (!this.running) return;
    const dt = Math.min((now - this.lastTime) / 1000, 0.1); // Cap at 100ms
    this.lastTime = now;
    this.onUpdate(dt);
    this.onRender();
    this.rafId = requestAnimationFrame(this.tick);
  };
}
