import { imageCache } from '../images/imageCache';
import { fitToViewport, sceneToCanvas } from './canvasUtils';
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

  // Hidden images at representative positions (evenly distributed)
  const entryCount = scene.hiddenEntries.length;
  for (let i = 0; i < entryCount; i++) {
    const entry = scene.hiddenEntries[i];
    const imgInfo = lookupImage(entry.catalogueImageId);
    if (!imgInfo) continue;

    // Compute a grid-like representative position
    const cols = Math.ceil(Math.sqrt(entryCount));
    const row = Math.floor(i / cols);
    const col = i % cols;
    const rows = Math.ceil(entryCount / cols);

    const normX = (col + 0.5) / cols;
    const normY = (row + 0.5) / rows;

    const midScale = (entry.scaleRange[0] + entry.scaleRange[1]) / 2;
    const imgW = imgInfo.width * midScale * bgFit.width / (imgInfo.width * 3);
    const imgH = imgInfo.height * midScale * bgFit.height / (imgInfo.height * 3);

    const pos = sceneToCanvas(normX, normY, { ...bgFit, scale: 1 });
    const drawX = pos.x - imgW / 2;
    const drawY = pos.y - imgH / 2;

    try {
      const img = await imageCache.get(imgInfo.blobKey);
      ctx.globalAlpha = 0.7;
      ctx.drawImage(img, drawX, drawY, imgW, imgH);
      ctx.globalAlpha = 1;
    } catch {
      // Placeholder rectangle
      ctx.fillStyle = 'rgba(124, 111, 245, 0.3)';
      ctx.fillRect(drawX, drawY, imgW, imgH);
    }

    // Number badge
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.arc(drawX + imgW, drawY, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${i + 1}`, drawX + imgW, drawY);
  }

  // Foreground tint overlay (at half opacity so editor can see underneath)
  ctx.globalAlpha = scene.foregroundTintOpacity * 0.4;
  ctx.fillStyle = scene.foregroundTint;
  ctx.fillRect(bgFit.x, bgFit.y, bgFit.width, bgFit.height);
  ctx.globalAlpha = 1;
}
