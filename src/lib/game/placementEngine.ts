import type { HiddenImageEntry, CatalogueImage, Rect } from '../types';

export interface PlacedImage {
  entryId: string;
  catalogueImageId: string;
  blobKey: string;
  x: number;
  y: number;
  width: number;
  height: number;
  found: boolean;
  foundTime?: number; // performance.now() timestamp when found
}

const MAX_ATTEMPTS = 100;
const PADDING = 10;

export function placeHiddenImages(
  entries: HiddenImageEntry[],
  sceneWidth: number,
  sceneHeight: number,
  lookupImage: (id: string) => CatalogueImage | null
): PlacedImage[] {
  const placed: PlacedImage[] = [];

  for (const entry of entries) {
    const imgInfo = lookupImage(entry.catalogueImageId);
    if (!imgInfo) continue;

    // Random scale within range
    const scale =
      entry.scaleRange[0] +
      Math.random() * (entry.scaleRange[1] - entry.scaleRange[0]);

    // Compute pixel dimensions (target ~15% of scene width per image)
    const baseScale = (sceneWidth * 0.15) / imgInfo.width;
    const w = imgInfo.width * baseScale * scale;
    const h = imgInfo.height * baseScale * scale;

    // Determine placement bounds
    let bounds: Rect;
    if (entry.allowedRegion) {
      bounds = {
        x: entry.allowedRegion.x * sceneWidth,
        y: entry.allowedRegion.y * sceneHeight,
        width: entry.allowedRegion.width * sceneWidth,
        height: entry.allowedRegion.height * sceneHeight,
      };
    } else {
      bounds = { x: 0, y: 0, width: sceneWidth, height: sceneHeight };
    }

    let bestX = bounds.x;
    let bestY = bounds.y;
    let foundValid = false;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const tryX = bounds.x + Math.random() * Math.max(0, bounds.width - w);
      const tryY = bounds.y + Math.random() * Math.max(0, bounds.height - h);

      if (!hasOverlap(tryX, tryY, w, h, placed)) {
        bestX = tryX;
        bestY = tryY;
        foundValid = true;
        break;
      }
      bestX = tryX;
      bestY = tryY;
    }

    if (!foundValid) {
      console.warn(`Could not find non-overlapping position for ${imgInfo.name}`);
    }

    placed.push({
      entryId: entry.id,
      catalogueImageId: entry.catalogueImageId,
      blobKey: imgInfo.blobKey,
      x: bestX,
      y: bestY,
      width: w,
      height: h,
      found: false,
    });
  }

  return placed;
}

function hasOverlap(
  x: number,
  y: number,
  w: number,
  h: number,
  placed: PlacedImage[]
): boolean {
  for (const p of placed) {
    if (
      x < p.x + p.width + PADDING &&
      x + w + PADDING > p.x &&
      y < p.y + p.height + PADDING &&
      y + h + PADDING > p.y
    ) {
      return true;
    }
  }
  return false;
}
