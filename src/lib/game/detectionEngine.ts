import type { DetectionMode } from '$lib/types';
import type { PlacedImage } from './placementEngine';

const DWELL_TIME_MS = 300;
const GRID_RES = 20; // 20×20 coverage grid per image for revealFull mode

// --- center mode state ---
const dwellTimers = new Map<string, number>();

// --- revealFull mode state ---
// Maps entryId -> (cellIndex -> last-visited timestamp in ms)
const coverageMaps = new Map<string, Map<number, number>>();

export function resetDetectionState(): void {
  dwellTimers.clear();
  coverageMaps.clear();
}

// Keep the old name as an alias so existing callers compile
export const resetDwellTimers = resetDetectionState;

export function checkDetection(
  revealX: number,
  revealY: number,
  revealRadius: number,
  placedImages: PlacedImage[],
  threshold: number,
  dt: number,
  mode: DetectionMode = 'center',
  revealWindowSecs: number = 3
): string[] {
  const newlyFound: string[] = [];
  const now = performance.now();

  for (const img of placedImages) {
    if (img.found) continue;

    const imgCx = img.x + img.width / 2;
    const imgCy = img.y + img.height / 2;

    if (mode === 'center') {
      checkCenter(img, revealX, revealY, revealRadius, imgCx, imgCy, dt, newlyFound);
    } else {
      checkRevealFull(img, revealX, revealY, revealRadius, threshold, revealWindowSecs, now, newlyFound);
    }
  }

  return newlyFound;
}

// ---- center mode --------------------------------------------------------
// Marks found when the reticle circle overlaps the image's center point.
function checkCenter(
  img: PlacedImage,
  revealX: number,
  revealY: number,
  revealRadius: number,
  imgCx: number,
  imgCy: number,
  dt: number,
  newlyFound: string[]
): void {
  const dist = Math.sqrt((revealX - imgCx) ** 2 + (revealY - imgCy) ** 2);

  if (dist <= revealRadius) {
    const current = (dwellTimers.get(img.entryId) ?? 0) + dt * 1000;
    if (current >= DWELL_TIME_MS) {
      img.found = true;
      newlyFound.push(img.entryId);
      dwellTimers.delete(img.entryId);
    } else {
      dwellTimers.set(img.entryId, current);
    }
  } else {
    dwellTimers.delete(img.entryId);
  }
}

// ---- revealFull mode ----------------------------------------------------
// Marks found when the fraction of the image area swept by the reticle
// over the last revealWindowSecs reaches the threshold.
function checkRevealFull(
  img: PlacedImage,
  revealX: number,
  revealY: number,
  revealRadius: number,
  threshold: number,
  revealWindowSecs: number,
  now: number,
  newlyFound: string[]
): void {
  const windowMs = revealWindowSecs * 1000;

  if (!coverageMaps.has(img.entryId)) {
    coverageMaps.set(img.entryId, new Map());
  }
  const covMap = coverageMaps.get(img.entryId)!;

  const cellW = img.width / GRID_RES;
  const cellH = img.height / GRID_RES;

  // Mark cells touched by the current reticle position
  for (let row = 0; row < GRID_RES; row++) {
    for (let col = 0; col < GRID_RES; col++) {
      const cx = img.x + (col + 0.5) * cellW;
      const cy = img.y + (row + 0.5) * cellH;
      const dist = Math.sqrt((revealX - cx) ** 2 + (revealY - cy) ** 2);
      if (dist <= revealRadius) {
        covMap.set(row * GRID_RES + col, now);
      }
    }
  }

  // Prune cells outside the rolling window
  for (const [cell, t] of covMap) {
    if (now - t > windowMs) covMap.delete(cell);
  }

  // Check if enough has been revealed
  const coverage = covMap.size / (GRID_RES * GRID_RES);
  if (coverage >= threshold) {
    img.found = true;
    newlyFound.push(img.entryId);
    coverageMaps.delete(img.entryId);
  }
}
