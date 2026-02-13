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

  // 3a: Tint fill
  ctxB.globalAlpha = state.foregroundTintOpacity;
  ctxB.fillStyle = state.foregroundTint;
  ctxB.fillRect(0, 0, w, h);
  ctxB.globalAlpha = 1;

  // 3b: Foreground image overlay
  if (state.foregroundImage) {
    ctxB.globalCompositeOperation = 'source-over';
    ctxB.drawImage(state.foregroundImage, 0, 0, w, h);
  }

  // --- Layer 4: Punch holes ---
  // Found images get permanent holes
  for (const img of state.hiddenImages) {
    if (img.found) {
      ctxB.globalCompositeOperation = 'destination-out';
      ctxB.fillStyle = 'rgba(0,0,0,1)';
      ctxB.fillRect(img.x, img.y, img.width, img.height);
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
