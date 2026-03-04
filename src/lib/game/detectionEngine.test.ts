import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkDetection, resetDetectionState } from './detectionEngine';
import type { PlacedImage } from './placementEngine';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makePlaced(overrides: Partial<PlacedImage> = {}): PlacedImage {
  return {
    entryId: 'e1',
    catalogueImageId: 'img-1',
    blobKey: 'blob-1',
    // 100×100 box at (100,100) → center (150,150)
    x: 100,
    y: 100,
    width: 100,
    height: 100,
    found: false,
    ...overrides,
  };
}

beforeEach(() => {
  resetDetectionState();
  vi.restoreAllMocks();
});

// ─── Center mode ──────────────────────────────────────────────────────────────

describe('center mode', () => {
  it('does not mark found when reticle is far from image center', () => {
    const img = makePlaced();
    checkDetection(0, 0, 50, [img], 0.5, 1.0, 'center', 3);
    expect(img.found).toBe(false);
  });

  it('does not mark found when reticle is over image but dwell is insufficient', () => {
    const img = makePlaced();
    // 100ms accumulated, need 300ms
    checkDetection(150, 150, 60, [img], 0.5, 0.1, 'center', 3);
    expect(img.found).toBe(false);
  });

  it('marks found after dwell threshold (300ms) in a single frame', () => {
    const img = makePlaced();
    checkDetection(150, 150, 60, [img], 0.5, 0.4, 'center', 3);
    expect(img.found).toBe(true);
  });

  it('accumulates dwell across multiple frames', () => {
    const img = makePlaced();
    checkDetection(150, 150, 60, [img], 0.5, 0.1, 'center', 3); // 100ms
    expect(img.found).toBe(false);
    checkDetection(150, 150, 60, [img], 0.5, 0.1, 'center', 3); // 200ms
    expect(img.found).toBe(false);
    checkDetection(150, 150, 60, [img], 0.5, 0.11, 'center', 3); // 310ms → found
    expect(img.found).toBe(true);
  });

  it('resets dwell timer when reticle leaves the image', () => {
    const img = makePlaced();
    checkDetection(150, 150, 60, [img], 0.5, 0.2, 'center', 3); // 200ms
    checkDetection(0, 0, 60, [img], 0.5, 0.2, 'center', 3);     // left — reset
    checkDetection(150, 150, 60, [img], 0.5, 0.2, 'center', 3); // 200ms fresh
    expect(img.found).toBe(false);
    checkDetection(150, 150, 60, [img], 0.5, 0.15, 'center', 3); // 350ms → found
    expect(img.found).toBe(true);
  });

  it('returns the entryId of newly found images', () => {
    const img = makePlaced({ entryId: 'my-entry' });
    const found = checkDetection(150, 150, 60, [img], 0.5, 0.4, 'center', 3);
    expect(found).toEqual(['my-entry']);
  });

  it('returns empty array when nothing is newly found', () => {
    const img = makePlaced();
    const found = checkDetection(0, 0, 50, [img], 0.5, 1.0, 'center', 3);
    expect(found).toEqual([]);
  });

  it('skips already-found images entirely', () => {
    const img = makePlaced({ found: true });
    const found = checkDetection(150, 150, 60, [img], 0.5, 1.0, 'center', 3);
    expect(found).toHaveLength(0);
  });

  it('sets foundTime on the placed image using performance.now()', () => {
    vi.spyOn(performance, 'now').mockReturnValue(99999);
    const img = makePlaced();
    checkDetection(150, 150, 60, [img], 0.5, 0.4, 'center', 3);
    expect(img.foundTime).toBe(99999);
  });

  it('detects multiple images in the same frame', () => {
    // Two images, both centered at reticle position
    const a = makePlaced({ entryId: 'e1', x: 100, y: 100, width: 100, height: 100 });
    const b = makePlaced({ entryId: 'e2', x: 100, y: 100, width: 100, height: 100 });
    const found = checkDetection(150, 150, 200, [a, b], 0.5, 0.4, 'center', 3);
    expect(found).toContain('e1');
    expect(found).toContain('e2');
  });

  it('reticle exactly at image edge (boundary radius) is detected', () => {
    const img = makePlaced(); // center at (150, 150)
    // Reticle at (90, 150), radius = 60 → distance = 60 = radius → on boundary
    const found = checkDetection(90, 150, 60, [img], 0.5, 0.4, 'center', 3);
    expect(found).toContain('e1');
  });

  it('reticle just outside image center radius is not detected', () => {
    const img = makePlaced(); // center at (150, 150)
    // Reticle at (89, 150), radius = 60 → distance = 61 > radius
    checkDetection(89, 150, 60, [img], 0.5, 1.0, 'center', 3);
    expect(img.found).toBe(false);
  });
});

// ─── RevealFull mode ──────────────────────────────────────────────────────────

describe('revealFull mode', () => {
  it('does not mark found when reticle is far from image', () => {
    const img = makePlaced();
    checkDetection(0, 0, 10, [img], 0.5, 0.016, 'revealFull', 3);
    expect(img.found).toBe(false);
  });

  it('marks found when full coverage is swept in one pass', () => {
    const img = makePlaced(); // 100×100 at (100,100), center (150,150)
    vi.spyOn(performance, 'now').mockReturnValue(1000);
    // Radius 200 covers all 20×20 cells
    checkDetection(150, 150, 200, [img], 0.5, 0.016, 'revealFull', 3);
    expect(img.found).toBe(true);
  });

  it('does not mark found when coverage is below threshold', () => {
    const img = makePlaced({ x: 0, y: 0, width: 200, height: 200 });
    vi.spyOn(performance, 'now').mockReturnValue(1000);
    // Small reticle sweeping only a corner — well below 90% threshold
    checkDetection(5, 5, 10, [img], 0.9, 0.016, 'revealFull', 3);
    expect(img.found).toBe(false);
  });

  it('accumulates coverage across multiple frames', () => {
    const img = makePlaced({ x: 0, y: 0, width: 100, height: 100 });
    let now = 1000;
    vi.spyOn(performance, 'now').mockImplementation(() => now);

    // Image is 100×100, grid is 20×20 (each cell 5×5px).
    // Radius 35 centered at (25,50) covers ~36% of cells (below 50% threshold).
    // Radius 35 centered at (75,50) covers the mirror half.
    // Combined unique coverage ~58% — exceeds 50% threshold.
    checkDetection(25, 50, 35, [img], 0.5, 0.016, 'revealFull', 5);
    expect(img.found).toBe(false); // first sweep ~36%, below threshold

    now = 1500; // still within 5s window
    checkDetection(75, 50, 35, [img], 0.5, 0.016, 'revealFull', 5);
    expect(img.found).toBe(true); // combined ~58%, above threshold
  });

  it('cells expire outside the rolling window', () => {
    const img = makePlaced({ x: 0, y: 0, width: 100, height: 100 });
    let now = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => now);

    // Sweep left corner at t=0 (small reticle, ~5-10% coverage)
    now = 0;
    checkDetection(5, 50, 12, [img], 0.99, 0.016, 'revealFull', 2);
    expect(img.found).toBe(false);

    // Advance past 2s window — those cells should expire
    now = 3000;
    // Sweep right corner — old cells gone, total fresh coverage still ~5-10%
    checkDetection(95, 50, 12, [img], 0.99, 0.016, 'revealFull', 2);
    expect(img.found).toBe(false); // threshold 99% unreached with expired cells
  });

  it('skips already-found images', () => {
    const img = makePlaced({ found: true });
    vi.spyOn(performance, 'now').mockReturnValue(1000);
    const found = checkDetection(150, 150, 200, [img], 0.5, 0.016, 'revealFull', 3);
    expect(found).toHaveLength(0);
  });

  it('sets foundTime when marking found', () => {
    vi.spyOn(performance, 'now').mockReturnValue(42000);
    const img = makePlaced();
    checkDetection(150, 150, 200, [img], 0.5, 0.016, 'revealFull', 3);
    expect(img.foundTime).toBe(42000);
  });

  it('returns the entryId of newly found images', () => {
    vi.spyOn(performance, 'now').mockReturnValue(1000);
    const img = makePlaced({ entryId: 'reveal-entry' });
    const found = checkDetection(150, 150, 200, [img], 0.5, 0.016, 'revealFull', 3);
    expect(found).toContain('reveal-entry');
  });
});

// ─── resetDetectionState ──────────────────────────────────────────────────────

describe('resetDetectionState', () => {
  it('clears dwell timers so detection starts fresh', () => {
    const img = makePlaced();
    checkDetection(150, 150, 60, [img], 0.5, 0.2, 'center', 3); // 200ms accumulated
    resetDetectionState();
    // After reset, need to accumulate 300ms again from zero
    checkDetection(150, 150, 60, [img], 0.5, 0.2, 'center', 3); // only 200ms
    expect(img.found).toBe(false);
    checkDetection(150, 150, 60, [img], 0.5, 0.15, 'center', 3); // 350ms → found
    expect(img.found).toBe(true);
  });

  it('clears revealFull coverage maps so coverage starts fresh', () => {
    const img = makePlaced({ x: 0, y: 0, width: 100, height: 100 });
    let now = 1000;
    vi.spyOn(performance, 'now').mockImplementation(() => now);

    // Sweep left half at t=1000
    checkDetection(15, 50, 20, [img], 0.99, 0.016, 'revealFull', 5);
    expect(img.found).toBe(false);

    resetDetectionState();
    img.found = false; // reset found state too

    // After reset, sweeping left half again → same coverage as fresh start (still < 99%)
    now = 1100;
    checkDetection(15, 50, 20, [img], 0.99, 0.016, 'revealFull', 5);
    expect(img.found).toBe(false);
  });
});
