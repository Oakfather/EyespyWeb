import { describe, it, expect } from 'vitest';
import { placeHiddenImages } from './placementEngine';
import type { HiddenImageEntry, CatalogueImage } from '$lib/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeEntry(overrides: Partial<HiddenImageEntry> = {}): HiddenImageEntry {
  return {
    id: 'e1',
    catalogueImageId: 'img-1',
    scaleRange: [1, 1],
    allowedRegion: null,
    rotation: 0,
    vfxConfig: { growScale: 1.4, wiggleAngle: 12, duration: 700 },
    ...overrides,
  };
}

function makeImage(overrides: Partial<CatalogueImage> = {}): CatalogueImage {
  return {
    id: 'img-1',
    name: 'test.png',
    blobKey: 'blob-1',
    folderPath: '',
    width: 200,
    height: 150,
    thumbnailDataUrl: '',
    ...overrides,
  };
}

const PADDING = 10;
const SCENE_W = 1200;
const SCENE_H = 900;

// ─── Basic placement ──────────────────────────────────────────────────────────

describe('placeHiddenImages — basics', () => {
  it('returns empty array when there are no entries', () => {
    expect(placeHiddenImages([], SCENE_W, SCENE_H, () => null)).toHaveLength(0);
  });

  it('skips entry when the catalogue image is not found', () => {
    const result = placeHiddenImages([makeEntry()], SCENE_W, SCENE_H, () => null);
    expect(result).toHaveLength(0);
  });

  it('places one image and returns one result', () => {
    const img = makeImage();
    const result = placeHiddenImages([makeEntry()], SCENE_W, SCENE_H, () => img);
    expect(result).toHaveLength(1);
  });

  it('copies entryId, catalogueImageId, and blobKey from source', () => {
    const img = makeImage({ id: 'img-1', blobKey: 'my-blob' });
    const entry = makeEntry({ id: 'my-entry', catalogueImageId: 'img-1' });
    const [p] = placeHiddenImages([entry], SCENE_W, SCENE_H, () => img);
    expect(p.entryId).toBe('my-entry');
    expect(p.catalogueImageId).toBe('img-1');
    expect(p.blobKey).toBe('my-blob');
  });

  it('all placed images start with found = false', () => {
    const img = makeImage();
    const entries = [makeEntry({ id: 'e1' }), makeEntry({ id: 'e2' })];
    const results = placeHiddenImages(entries, SCENE_W, SCENE_H, () => img);
    expect(results.every((p) => p.found === false)).toBe(true);
  });

  it('places all entries even when some catalogue lookups fail', () => {
    const img = makeImage({ id: 'img-good' });
    const entries = [
      makeEntry({ id: 'e1', catalogueImageId: 'img-good' }),
      makeEntry({ id: 'e2', catalogueImageId: 'img-missing' }),
      makeEntry({ id: 'e3', catalogueImageId: 'img-good' }),
    ];
    const lookup = (id: string) => (id === 'img-good' ? img : null);
    const result = placeHiddenImages(entries, SCENE_W, SCENE_H, lookup);
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.entryId)).toEqual(['e1', 'e3']);
  });
});

// ─── Bounds ───────────────────────────────────────────────────────────────────

describe('placeHiddenImages — bounds', () => {
  it('placed image stays fully within canvas bounds', () => {
    const img = makeImage();
    for (let i = 0; i < 30; i++) {
      const [p] = placeHiddenImages([makeEntry()], SCENE_W, SCENE_H, () => img);
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.x + p.width).toBeLessThanOrEqual(SCENE_W + 0.01);
      expect(p.y + p.height).toBeLessThanOrEqual(SCENE_H + 0.01);
    }
  });

  it('respects allowedRegion — image placed within region bounds', () => {
    const img = makeImage();
    // Bottom-right quadrant: x=[0.5,1], y=[0.5,1]
    const entry = makeEntry({ allowedRegion: { x: 0.5, y: 0.5, width: 0.5, height: 0.5 }, scaleRange: [0.1, 0.1] });
    for (let i = 0; i < 20; i++) {
      const [p] = placeHiddenImages([entry], SCENE_W, SCENE_H, () => img);
      expect(p.x).toBeGreaterThanOrEqual(SCENE_W * 0.5 - 0.01);
      expect(p.y).toBeGreaterThanOrEqual(SCENE_H * 0.5 - 0.01);
      expect(p.x + p.width).toBeLessThanOrEqual(SCENE_W + 0.01);
      expect(p.y + p.height).toBeLessThanOrEqual(SCENE_H + 0.01);
    }
  });
});

// ─── Scale ────────────────────────────────────────────────────────────────────

describe('placeHiddenImages — scale', () => {
  it('with scaleRange [1,1] all placements produce the same size', () => {
    const img = makeImage({ width: 200, height: 100 });
    const entry = makeEntry({ scaleRange: [1, 1] });
    const sizes = new Set<string>();
    for (let i = 0; i < 10; i++) {
      const [p] = placeHiddenImages([entry], SCENE_W, SCENE_H, () => img);
      sizes.add(`${p.width.toFixed(2)}x${p.height.toFixed(2)}`);
    }
    expect(sizes.size).toBe(1);
  });

  it('scaleRange produces variation in placed size', () => {
    const img = makeImage({ width: 200, height: 100 });
    const entry = makeEntry({ scaleRange: [0.5, 2.0] });
    const widths = new Set<number>();
    for (let i = 0; i < 50; i++) {
      const [p] = placeHiddenImages([entry], SCENE_W, SCENE_H, () => img);
      widths.add(Math.round(p.width));
    }
    expect(widths.size).toBeGreaterThan(1);
  });

  it('placed size is within the expected scale bounds', () => {
    // baseScale = (sceneWidth * 0.15) / imgWidth = (1200 * 0.15) / 200 = 0.9
    // with scaleRange [0.5, 1.5]: multiplier in [0.5, 1.5]
    // expected width: 200 * 0.9 * 0.5 = 90  to  200 * 0.9 * 1.5 = 270
    const img = makeImage({ width: 200, height: 100 });
    const entry = makeEntry({ scaleRange: [0.5, 1.5] });
    for (let i = 0; i < 40; i++) {
      const [p] = placeHiddenImages([entry], SCENE_W, SCENE_H, () => img);
      expect(p.width).toBeGreaterThanOrEqual(89);
      expect(p.width).toBeLessThanOrEqual(271);
    }
  });

  it('aspect ratio is preserved after scaling', () => {
    const img = makeImage({ width: 300, height: 200 });
    const entry = makeEntry({ scaleRange: [0.5, 1.5] });
    for (let i = 0; i < 20; i++) {
      const [p] = placeHiddenImages([entry], SCENE_W, SCENE_H, () => img);
      expect(p.width / p.height).toBeCloseTo(300 / 200, 5);
    }
  });
});

// ─── No-overlap ───────────────────────────────────────────────────────────────

describe('placeHiddenImages — overlap prevention', () => {
  it('multiple images do not overlap (respects PADDING)', () => {
    const lookup = (id: string): CatalogueImage => ({
      id,
      name: `${id}.png`,
      blobKey: id,
      folderPath: '',
      width: 100,
      height: 100,
      thumbnailDataUrl: '',
    });

    const entries: HiddenImageEntry[] = Array.from({ length: 6 }, (_, i) => ({
      id: `e${i}`,
      catalogueImageId: `img-${i}`,
      scaleRange: [1, 1],
      allowedRegion: null,
      rotation: 0,
      vfxConfig: { growScale: 1.4, wiggleAngle: 12, duration: 700 },
    }));

    const results = placeHiddenImages(entries, SCENE_W, SCENE_H, lookup);
    expect(results.length).toBeGreaterThan(0);

    for (let i = 0; i < results.length; i++) {
      for (let j = i + 1; j < results.length; j++) {
        const a = results[i];
        const b = results[j];
        const noOverlap =
          a.x + a.width + PADDING <= b.x ||
          b.x + b.width + PADDING <= a.x ||
          a.y + a.height + PADDING <= b.y ||
          b.y + b.height + PADDING <= a.y;
        expect(noOverlap, `images ${i} and ${j} overlap`).toBe(true);
      }
    }
  });

  it('preserves entry order in output', () => {
    const img = makeImage();
    const entries = [
      makeEntry({ id: 'e1', catalogueImageId: 'img-1' }),
      makeEntry({ id: 'e2', catalogueImageId: 'img-1' }),
      makeEntry({ id: 'e3', catalogueImageId: 'img-1' }),
    ];
    const results = placeHiddenImages(entries, SCENE_W, SCENE_H, () => img);
    expect(results.map((r) => r.entryId)).toEqual(['e1', 'e2', 'e3']);
  });
});
