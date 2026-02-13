import type { RevealShapeConfig } from '../types';

/**
 * Draw the reveal shape using destination-out compositing.
 * This punches a hole in whatever is currently on the canvas.
 * Must be called while globalCompositeOperation is 'destination-out'.
 */
export function drawRevealShape(
  ctx: CanvasRenderingContext2D,
  config: RevealShapeConfig,
  x: number,
  y: number
): void {
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';

  switch (config.type) {
    case 'circle':
      drawCircle(ctx, x, y, config.size, config.falloff);
      break;
    case 'cone':
      drawCone(ctx, x, y, config.size, config.falloff);
      break;
    case 'rect':
      drawRect(ctx, x, y, config.size, config.falloff);
      break;
    default:
      drawCircle(ctx, x, y, config.size, config.falloff);
  }

  ctx.restore();
}

function drawCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  falloff: number
): void {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  const solidStop = Math.max(0, 1 - falloff);
  gradient.addColorStop(0, 'rgba(0,0,0,1)');
  gradient.addColorStop(solidStop, 'rgba(0,0,0,1)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawCone(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  falloff: number
): void {
  // Cone pointing upward from cursor position
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  const solidStop = Math.max(0, 1 - falloff);
  gradient.addColorStop(0, 'rgba(0,0,0,1)');
  gradient.addColorStop(solidStop, 'rgba(0,0,0,1)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, radius, -Math.PI * 0.75, -Math.PI * 0.25);
  ctx.closePath();
  ctx.fill();
}

function drawRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  falloff: number
): void {
  const half = size;
  // Simple rectangle with gradient edges
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, half * 1.4);
  const solidStop = Math.max(0, 1 - falloff);
  gradient.addColorStop(0, 'rgba(0,0,0,1)');
  gradient.addColorStop(solidStop, 'rgba(0,0,0,1)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(x - half, y - half, half * 2, half * 2);
}
