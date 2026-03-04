import { type Page } from '@playwright/test';

export const DB_NAME = 'eyespy-db';

/**
 * Deletes the IndexedDB database in the page's browser context.
 * Must be called after page.goto() so the origin is set.
 */
export async function clearProjectDB(page: Page): Promise<void> {
  await page.evaluate((dbName) => {
    return new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase(dbName);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
      // If DB is open, onblocked fires — resolve immediately,
      // the subsequent page.reload() will close the connection
      // and the delete will complete.
      req.onblocked = () => resolve();
    });
  }, DB_NAME);
}

/**
 * Full reset: goto root → clear IDB → reload → wait for home screen.
 * Use in beforeEach for every test that reads/writes project data.
 */
export async function resetAndWaitForHome(page: Page): Promise<void> {
  await page.goto('/');
  await page.waitForSelector('body');
  await clearProjectDB(page);
  await page.reload();
  await waitForHome(page);
}

/**
 * Wait for the home screen to be fully rendered.
 * initExampleContent fetches 4 images, so allow a generous timeout.
 */
export async function waitForHome(page: Page): Promise<void> {
  await page.waitForSelector('div.home', { timeout: 15_000 });
}

/**
 * Navigate to play mode by clicking the first playable scene card.
 * Returns after the HUD is visible (asset loading is complete).
 */
export async function navigateToPlay(page: Page): Promise<void> {
  await page.click('button.scene-preview.playable');
  await page.waitForSelector('div.play-screen', { timeout: 10_000 });
  await page.waitForSelector('span.found-counter', { timeout: 15_000 });
}

/**
 * Navigate to the editor by clicking the edit button on the first scene card.
 */
export async function navigateToEditor(page: Page): Promise<void> {
  await page.click('button.edit-btn');
  await page.waitForSelector('div.editor-layout', { timeout: 10_000 });
}

/**
 * Set the spotlight size slider to the given value.
 * Must be called when the gear menu is open.
 * Uses evaluate() because Playwright fill() doesn't trigger oninput on range inputs.
 */
export async function setSpotlightSize(page: Page, value: number): Promise<void> {
  const slider = page.locator('.menu-slider input[type="range"]');
  await slider.waitFor({ state: 'visible', timeout: 5_000 });
  await slider.evaluate((el: HTMLInputElement, v: number) => {
    el.value = String(v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
}

/**
 * Sweep the canvas in a 4×3 grid with 400ms dwell at each point.
 * With revealSize=200, the max distance from any canvas pixel to the nearest
 * grid point is sqrt(160² + 120²) = 200px — exactly the detection radius.
 * This guarantees all hidden images will be detected regardless of placement.
 *
 * Grid: 4 cols at w×[1/8, 3/8, 5/8, 7/8], 3 rows at h×[1/6, 1/2, 5/6]
 * Max sweep time: 12 points × 400ms = 4.8s
 */
export async function sweepCanvasToComplete(page: Page): Promise<void> {
  const canvasWrapper = page.locator('.game-canvas-wrapper');
  const box = await canvasWrapper.boundingBox();
  if (!box) throw new Error('Canvas wrapper (.game-canvas-wrapper) not found');

  const cols = [
    box.x + box.width * 0.125,
    box.x + box.width * 0.375,
    box.x + box.width * 0.625,
    box.x + box.width * 0.875,
  ];
  const rows = [
    box.y + box.height * (1 / 6),
    box.y + box.height * 0.5,
    box.y + box.height * (5 / 6),
  ];

  // Pre-enter: move just outside canvas so mouseenter fires on first point
  await page.mouse.move(box.x - 5, box.y + box.height / 2);

  for (const row of rows) {
    for (const col of cols) {
      await page.mouse.move(col, row);
      await page.waitForTimeout(400);
      // Early exit if level complete
      const isComplete = await page.locator('div.complete-panel').isVisible();
      if (isComplete) return;
    }
  }
}
