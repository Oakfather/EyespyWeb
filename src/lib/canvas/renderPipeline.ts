import { drawRevealShape } from './revealShape';
import type { RevealShapeConfig } from '../types';

export interface PlacedImageRender {
  image: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  found: boolean;
}

export interface RenderState {
  backgroundImage: HTMLImageElement | null;
  backgroundFit: { x: number; y: number; width: number; height: number };
  hiddenImages: PlacedImageRender[];
  foregroundTint: string;
  foregroundTintOpacity: number;
  foregroundImage: HTMLImageElement | null;
  revealShape: RevealShapeConfig;
  revealX: number;
  revealY: number;
  revealActive: boolean;
  canvasWidth: number;
  canvasHeight: number;
  allFound: boolean;
}

// Cached offscreen canvases
let offscreenA: HTMLCanvasElement | null = null;
let offscreenB: HTMLCanvasElement | null = null;
let ctxA: CanvasRenderingContext2D | null = null;
let ctxB: CanvasRenderingContext2D | null = null;
let lastW = 0;
let lastH = 0;

function ensureOffscreen(w: number, h: number): void {
  if (w !== lastW || h !== lastH) {
    offscreenA = document.createElement('canvas');
    offscreenA.width = w;
    offscreenA.height = h;
    ctxA = offscreenA.getContext('2d')!;

    offscreenB = document.createElement('canvas');
    offscreenB.width = w;
    offscreenB.height = h;
    ctxB = offscreenB.getContext('2d')!;

    lastW = w;
    lastH = h;
  }
}

export function renderFrame(
  displayCtx: CanvasRenderingContext2D,
  state: RenderState
): void {
  const { canvasWidth: w, canvasHeight: h } = state;
  ensureOffscreen(w, h);
  if (!ctxA || !ctxB || !offscreenA || !offscreenB) return;

  // --- Layer 1-2: Scene content (offscreen A) ---
  ctxA.clearRect(0, 0, w, h);

  // Layer 1: Background
  if (state.backgroundImage) {
    const { x, y, width, height } = state.backgroundFit;
    ctxA.drawImage(state.backgroundImage, x, y, width, height);
  }

  // Layer 2: Hidden images
  for (const img of state.hiddenImages) {
    ctxA.drawImage(img.image, img.x, img.y, img.width, img.height);
  }

  // --- Layer 3: Obscuring layer (offscreen B) ---
  ctxB.clearRect(0, 0, w, h);

  // 3a: Tint fill (0 opacity when all found)
  const tintOpacity = state.allFound ? 0 : state.foregroundTintOpacity;
  ctxB.globalAlpha = tintOpacity;
  ctxB.fillStyle = state.foregroundTint;
  ctxB.fillRect(0, 0, w, h);
  ctxB.globalAlpha = 1;

  // 3b: Foreground image overlay
  if (state.foregroundImage) {
    ctxB.globalCompositeOperation = 'source-over';
    ctxB.drawImage(state.foregroundImage, 0, 0, w, h);
  }

  // --- Layer 4: Punch holes ---
  // Found images get permanent smooth elliptical holes
  for (const img of state.hiddenImages) {
    if (img.found) {
      ctxB.globalCompositeOperation = 'destination-out';
      const cx = img.x + img.width / 2;
      const cy = img.y + img.height / 2;
      // Elliptical radius with padding for soft edge
      const rx = img.width / 2 + 15;
      const ry = img.height / 2 + 15;
      const r = Math.max(rx, ry);

      ctxB.save();
      ctxB.translate(cx, cy);
      ctxB.scale(rx / r, ry / r);
      const gradient = ctxB.createRadialGradient(0, 0, 0, 0, 0, r);
      gradient.addColorStop(0, 'rgba(0,0,0,1)');
      gradient.addColorStop(0.75, 'rgba(0,0,0,1)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctxB.fillStyle = gradient;
      ctxB.beginPath();
      ctxB.arc(0, 0, r, 0, Math.PI * 2);
      ctxB.fill();
      ctxB.restore();
    }
  }

  // Reveal shape hole
  if (state.revealActive) {
    drawRevealShape(ctxB, state.revealShape, state.revealX, state.revealY);
  }

  ctxB.globalCompositeOperation = 'source-over';

  // --- Composite to display ---
  displayCtx.clearRect(0, 0, w, h);
  displayCtx.drawImage(offscreenA, 0, 0);
  displayCtx.drawImage(offscreenB, 0, 0);
}
