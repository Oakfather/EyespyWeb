import { imageCache } from '../images/imageCache';
import { fitToViewport } from './canvasUtils';
import type { Scene, CatalogueImage } from '../types';

/**
 * Render a simplified editor preview of a scene.
 * Shows background, hidden images at representative positions,
 * and a semi-transparent foreground tint overlay.
 */
export async function renderEditorPreview(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  lookupImage: (id: string) => CatalogueImage | null
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
        // Draw placeholder
        ctx.fillStyle = '#2a2a3c';
        ctx.fillRect(0, 0, w, h);
      }
    }
  }

  // Foreground tint overlay (at half opacity so editor can see underneath)
  ctx.globalAlpha = scene.foregroundTintOpacity * 0.4;
  ctx.fillStyle = scene.foregroundTint;
  ctx.fillRect(bgFit.x, bgFit.y, bgFit.width, bgFit.height);
  ctx.globalAlpha = 1;
}
