export class InputHandler {
  x = 0;
  y = 0;
  isActive = false;

  private canvas: HTMLCanvasElement | null = null;
  private abortController: AbortController | null = null;

  attach(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.abortController = new AbortController();
    const opts = { signal: this.abortController.signal };

    canvas.addEventListener('mousemove', this.handleMouse, opts);
    canvas.addEventListener('mouseenter', () => { this.isActive = true; }, opts);
    canvas.addEventListener('mouseleave', () => { this.isActive = false; }, opts);

    canvas.addEventListener('touchstart', this.handleTouch, { ...opts, passive: false });
    canvas.addEventListener('touchmove', this.handleTouch, { ...opts, passive: false });
    canvas.addEventListener('touchend', () => { this.isActive = false; }, opts);
    canvas.addEventListener('touchcancel', () => { this.isActive = false; }, opts);
  }

  detach(): void {
    this.abortController?.abort();
    this.abortController = null;
    this.canvas = null;
  }

  private handleMouse = (e: MouseEvent): void => {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    this.x = e.clientX - rect.left;
    this.y = e.clientY - rect.top;
    this.isActive = true;
  };

  private handleTouch = (e: TouchEvent): void => {
    e.preventDefault();
    if (!this.canvas || !e.touches.length) return;
    const rect = this.canvas.getBoundingClientRect();
    const touch = e.touches[0];
    this.x = touch.clientX - rect.left;
    this.y = touch.clientY - rect.top;
    this.isActive = true;
  };
}
