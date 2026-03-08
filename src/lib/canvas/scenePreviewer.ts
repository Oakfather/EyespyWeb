import { imageCache } from '../images/imageCache';
import { fitToViewport } from './canvasUtils';
import type { Scene, CatalogueImage } from '../types';

/** Normalized position (0..1) of a hidden image within the bgFit area. */
export interface PreviewPlacement {
  entryId: string;
  blobKey: string;
  nx: number;  // left edge, 0..1 within bgFit width
  ny: number;  // top edge,  0..1 within bgFit height
  nw: number;  // width as fraction of bgFit width
  nh: number;  // height as fraction of bgFit height
}

/**
 * Render a simplified editor preview of a scene.
 * Shows background, hidden images at preview positions,
 * and a semi-transparent foreground tint overlay.
 */
export async function renderEditorPreview(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  lookupImage: (id: string) => CatalogueImage | null,
  placements: PreviewPlacement[] = []
): Promise<void> {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  if (w === 0 || h === 0) return;

  ctx.clearRect(0, 0, w, h);

  // Dark background
  ctx.fillStyle = '#12121e';
  ctx.fillRect(0, 0, w, h);

  // Background image
  let bgFit = { x: 0, y: 0, width: w, height: h };
  if (scene.backgroundImageId) {
    const bgInfo = lookupImage(scene.backgroundImageId);
    if (bgInfo) {
      try {
        const bgImg = await imageCache.get(bgInfo.blobKey);
        bgFit = fitToViewport(w, h, bgImg.naturalWidth, bgImg.naturalHeight);
        ctx.drawImage(bgImg, bgFit.x, bgFit.y, bgFit.width, bgFit.height);
      } catch {
        ctx.fillStyle = '#2a2a3c';
        ctx.fillRect(0, 0, w, h);
      }
    }
  }

  // Hidden images at preview positions (drawn before tint so tint covers them)
  for (const p of placements) {
    const px = bgFit.x + p.nx * bgFit.width;
    const py = bgFit.y + p.ny * bgFit.height;
    const pw = p.nw * bgFit.width;
    const ph = p.nh * bgFit.width; // both dimensions relative to width to preserve aspect ratio
    try {
      const img = await imageCache.get(p.blobKey);
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.7)';
      ctx.shadowBlur = 6;
      ctx.drawImage(img, px, py, pw, ph);
      ctx.restore();
      // Subtle highlight outline
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 1;
      ctx.strokeRect(px, py, pw, ph);
    } catch {
      // Image not yet cached — skip silently
    }
  }

  // Foreground tint overlay (at reduced opacity so editor can see underneath)
  ctx.globalAlpha = scene.foregroundTintOpacity * 0.4;
  ctx.fillStyle = scene.foregroundTint;
  ctx.fillRect(bgFit.x, bgFit.y, bgFit.width, bgFit.height);
  ctx.globalAlpha = 1;
}
