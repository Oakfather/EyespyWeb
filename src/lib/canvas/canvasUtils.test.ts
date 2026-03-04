import { describe, it, expect } from 'vitest';
import { fitToViewport, coverToViewport, sceneToCanvas, canvasToScene } from './canvasUtils';

// ─── fitToViewport (contain / letterbox) ────────────────────────────────────

describe('fitToViewport', () => {
  it('square image in square canvas — fills exactly, no offset', () => {
    expect(fitToViewport(100, 100, 100, 100)).toEqual({ x: 0, y: 0, width: 100, height: 100, scale: 1 });
  });

  it('wide image in square canvas — scale limited by width, vertical bars', () => {
    // 200×100 image in 100×100 canvas → scale = 0.5 → 100×50 centered vertically
    const r = fitToViewport(100, 100, 200, 100);
    expect(r.scale).toBeCloseTo(0.5);
    expect(r.x).toBeCloseTo(0);
    expect(r.y).toBeCloseTo(25);
    expect(r.width).toBeCloseTo(100);
    expect(r.height).toBeCloseTo(50);
  });

  it('tall image in square canvas — scale limited by height, horizontal bars', () => {
    // 100×200 image in 100×100 canvas → scale = 0.5 → 50×100 centered horizontally
    const r = fitToViewport(100, 100, 100, 200);
    expect(r.scale).toBeCloseTo(0.5);
    expect(r.x).toBeCloseTo(25);
    expect(r.y).toBeCloseTo(0);
    expect(r.width).toBeCloseTo(50);
    expect(r.height).toBeCloseTo(100);
  });

  it('image always stays fully inside the canvas', () => {
    const cases: [number, number, number, number][] = [
      [800, 600, 1920, 1080],
      [1920, 1080, 800, 600],
      [400, 400, 1000, 200],
      [1000, 200, 400, 400],
      [375, 812, 2048, 2048], // mobile portrait
    ];
    for (const [cw, ch, iw, ih] of cases) {
      const r = fitToViewport(cw, ch, iw, ih);
      expect(r.x).toBeGreaterThanOrEqual(-0.001);
      expect(r.y).toBeGreaterThanOrEqual(-0.001);
      expect(r.x + r.width).toBeLessThanOrEqual(cw + 0.001);
      expect(r.y + r.height).toBeLessThanOrEqual(ch + 0.001);
    }
  });

  it('image is centered within the canvas', () => {
    const r = fitToViewport(800, 600, 1920, 1080);
    expect(r.x).toBeCloseTo((800 - r.width) / 2);
    expect(r.y).toBeCloseTo((600 - r.height) / 2);
  });
});

// ─── coverToViewport (cover / no bars) ──────────────────────────────────────

describe('coverToViewport', () => {
  it('square image in square canvas — fills exactly, no offset', () => {
    expect(coverToViewport(100, 100, 100, 100)).toEqual({ x: 0, y: 0, width: 100, height: 100, scale: 1 });
  });

  it('wide image in square canvas — scale driven by height, image overflows horizontally', () => {
    // 200×100 image in 100×100 canvas → scale = 1 → 200×100 centered → x = -50
    const r = coverToViewport(100, 100, 200, 100);
    expect(r.scale).toBeCloseTo(1);
    expect(r.x).toBeCloseTo(-50);
    expect(r.y).toBeCloseTo(0);
    expect(r.width).toBeCloseTo(200);
    expect(r.height).toBeCloseTo(100);
  });

  it('tall image in square canvas — scale driven by width, image overflows vertically', () => {
    // 100×200 image in 100×100 canvas → scale = 1 → 100×200 centered → y = -50
    const r = coverToViewport(100, 100, 100, 200);
    expect(r.scale).toBeCloseTo(1);
    expect(r.x).toBeCloseTo(0);
    expect(r.y).toBeCloseTo(-50);
    expect(r.width).toBeCloseTo(100);
    expect(r.height).toBeCloseTo(200);
  });

  it('canvas is always fully covered — no bars', () => {
    const cases: [number, number, number, number][] = [
      [800, 600, 1920, 1080],
      [1920, 1080, 800, 600],
      [400, 400, 1000, 200],
      [1000, 200, 400, 400],
      [375, 812, 2048, 2048],
    ];
    for (const [cw, ch, iw, ih] of cases) {
      const r = coverToViewport(cw, ch, iw, ih);
      expect(r.x).toBeLessThanOrEqual(0.001);
      expect(r.y).toBeLessThanOrEqual(0.001);
      expect(r.x + r.width).toBeGreaterThanOrEqual(cw - 0.001);
      expect(r.y + r.height).toBeGreaterThanOrEqual(ch - 0.001);
    }
  });

  it('cover uses a strictly larger scale than contain for non-square images', () => {
    const [cw, ch, iw, ih] = [800, 600, 1920, 1080];
    const contain = fitToViewport(cw, ch, iw, ih);
    const cover = coverToViewport(cw, ch, iw, ih);
    expect(cover.scale).toBeGreaterThanOrEqual(contain.scale);
  });
});

// ─── Coordinate round-trips ──────────────────────────────────────────────────

describe('sceneToCanvas / canvasToScene', () => {
  // 400×300 image in 800×600 canvas → scale=2, fills exactly, x=0 y=0
  const fit = fitToViewport(800, 600, 400, 300);

  it('scene (0,0) maps to the fit origin', () => {
    const r = sceneToCanvas(0, 0, fit);
    expect(r.x).toBeCloseTo(fit.x);
    expect(r.y).toBeCloseTo(fit.y);
  });

  it('scene (1,1) maps to the far corner of the fit rect', () => {
    const r = sceneToCanvas(1, 1, fit);
    expect(r.x).toBeCloseTo(fit.x + fit.width);
    expect(r.y).toBeCloseTo(fit.y + fit.height);
  });

  it('scene (0.5, 0.5) maps to center of the fit rect', () => {
    const r = sceneToCanvas(0.5, 0.5, fit);
    expect(r.x).toBeCloseTo(fit.x + fit.width / 2);
    expect(r.y).toBeCloseTo(fit.y + fit.height / 2);
  });

  it('canvas → scene → canvas round-trip', () => {
    const pairs = [[350, 250], [0, 0], [800, 600], [100, 500]];
    for (const [cx, cy] of pairs) {
      const scene = canvasToScene(cx, cy, fit);
      const back = sceneToCanvas(scene.x, scene.y, fit);
      expect(back.x).toBeCloseTo(cx);
      expect(back.y).toBeCloseTo(cy);
    }
  });

  it('scene → canvas → scene round-trip', () => {
    const pairs = [[0.3, 0.7], [0, 0], [1, 1], [0.5, 0.5]];
    for (const [sx, sy] of pairs) {
      const canvas = sceneToCanvas(sx, sy, fit);
      const back = canvasToScene(canvas.x, canvas.y, fit);
      expect(back.x).toBeCloseTo(sx);
      expect(back.y).toBeCloseTo(sy);
    }
  });
});
