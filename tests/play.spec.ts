import { test, expect } from '@playwright/test';
import { resetAndWaitForHome, navigateToPlay, setSpotlightSize, sweepCanvasToComplete } from './helpers';

test.describe('Play screen', () => {
  test.beforeEach(async ({ page }) => {
    await resetAndWaitForHome(page);
    await navigateToPlay(page);
  });

  test('play screen root is visible', async ({ page }) => {
    await expect(page.locator('div.play-screen')).toBeVisible();
  });

  test('HUD shows found counter, timer, and gear button after loading', async ({ page }) => {
    await expect(page.locator('span.found-counter')).toBeVisible();
    await expect(page.locator('span.timer')).toBeVisible();
    await expect(page.locator('button.gear-btn')).toBeVisible();
    await expect(page.locator('span.found-counter')).toHaveText('Found: 0/3');
    await expect(page.locator('span.timer')).toHaveText(/^\d:\d{2}$/);
  });

  test('gear button opens settings menu panel', async ({ page }) => {
    await expect(page.locator('div.menu-panel')).not.toBeVisible();
    await page.click('button.gear-btn');
    await page.waitForSelector('div.menu-panel', { timeout: 5_000 });
    await expect(page.locator('div.menu-panel')).toBeVisible();
  });

  test('menu panel shows Edit Mode, Restart, and spotlight slider at default 80', async ({ page }) => {
    await page.click('button.gear-btn');
    await page.waitForSelector('div.menu-panel', { timeout: 5_000 });

    const menuItems = page.locator('div.menu-panel button.menu-item');
    await expect(menuItems).toHaveCount(2);
    await expect(menuItems.first()).toContainText('Edit Mode');
    await expect(menuItems.nth(1)).toContainText('Restart');

    const slider = page.locator('.menu-slider input[type="range"]');
    await expect(slider).toBeVisible();
    await expect(slider).toHaveValue('80');
  });

  test('spotlight slider can be set to 200', async ({ page }) => {
    await page.click('button.gear-btn');
    await page.waitForSelector('div.menu-panel', { timeout: 5_000 });

    await setSpotlightSize(page, 200);

    await expect(page.locator('.menu-slider input[type="range"]')).toHaveValue('200');
  });

  test('clicking menu backdrop closes the panel', async ({ page }) => {
    await page.click('button.gear-btn');
    await page.waitForSelector('div.menu-panel', { timeout: 5_000 });

    await page.click('.menu-backdrop', { position: { x: 10, y: 10 } });

    await expect(page.locator('div.menu-panel')).not.toBeVisible({ timeout: 3_000 });
  });

  test('Edit Mode menu item navigates to editor', async ({ page }) => {
    await page.click('button.gear-btn');
    await page.waitForSelector('div.menu-panel', { timeout: 5_000 });

    await page.locator('div.menu-panel button.menu-item').first().click();

    await page.waitForSelector('div.editor-layout', { timeout: 10_000 });
    await expect(page.locator('div.editor-layout')).toBeVisible();
    expect(page.url()).toContain('#/editor/');
  });

  test('Restart button resets found counter to 0/3', async ({ page }) => {
    await page.click('button.gear-btn');
    await page.waitForSelector('div.menu-panel', { timeout: 5_000 });

    await page.locator('div.menu-panel button.menu-item').nth(1).click();

    await expect(page.locator('div.menu-panel')).not.toBeVisible({ timeout: 3_000 });
    await expect(page.locator('span.found-counter')).toHaveText('Found: 0/3');
  });

  test('sweeping canvas reveals all images and shows level complete', async ({ page }) => {
    // Set spotlight to max
    await page.click('button.gear-btn');
    await page.waitForSelector('div.menu-panel', { timeout: 5_000 });
    await setSpotlightSize(page, 200);
    await page.click('.menu-backdrop', { position: { x: 10, y: 10 } });
    await expect(page.locator('div.menu-panel')).not.toBeVisible({ timeout: 3_000 });

    // Sweep canvas — guaranteed to hit all 3 images with 200px radius
    await sweepCanvasToComplete(page);

    // Level complete modal
    await page.waitForSelector('div.complete-panel', { timeout: 10_000 });
    await expect(page.locator('h2.complete-title')).toHaveText('Level Complete!');
    await expect(page.locator('span.found-counter')).toHaveText('Found: 3/3');
  });

  test('Replay button resets game from complete screen', async ({ page }) => {
    await page.click('button.gear-btn');
    await page.waitForSelector('div.menu-panel', { timeout: 5_000 });
    await setSpotlightSize(page, 200);
    await page.click('.menu-backdrop', { position: { x: 10, y: 10 } });
    await expect(page.locator('div.menu-panel')).not.toBeVisible({ timeout: 3_000 });
    await sweepCanvasToComplete(page);
    await page.waitForSelector('div.complete-panel', { timeout: 10_000 });

    const replayBtn = page.locator('button.action-btn.primary');
    await expect(replayBtn).toHaveText('Replay');
    await replayBtn.click();

    await expect(page.locator('div.complete-panel')).not.toBeVisible({ timeout: 5_000 });
    await expect(page.locator('span.found-counter')).toHaveText('Found: 0/3');
  });

  test('Edit button from complete screen navigates to editor', async ({ page }) => {
    await page.click('button.gear-btn');
    await page.waitForSelector('div.menu-panel', { timeout: 5_000 });
    await setSpotlightSize(page, 200);
    await page.click('.menu-backdrop', { position: { x: 10, y: 10 } });
    await expect(page.locator('div.menu-panel')).not.toBeVisible({ timeout: 3_000 });
    await sweepCanvasToComplete(page);
    await page.waitForSelector('div.complete-panel', { timeout: 10_000 });

    // Buttons order: Replay (primary), Edit, Home
    const actionBtns = page.locator('div.complete-panel div.actions button.action-btn');
    await expect(actionBtns).toHaveCount(3);
    await actionBtns.nth(1).click();

    await page.waitForSelector('div.editor-layout', { timeout: 10_000 });
    expect(page.url()).toContain('#/editor/');
  });

  test('Home button from complete screen navigates to home', async ({ page }) => {
    await page.click('button.gear-btn');
    await page.waitForSelector('div.menu-panel', { timeout: 5_000 });
    await setSpotlightSize(page, 200);
    await page.click('.menu-backdrop', { position: { x: 10, y: 10 } });
    await expect(page.locator('div.menu-panel')).not.toBeVisible({ timeout: 3_000 });
    await sweepCanvasToComplete(page);
    await page.waitForSelector('div.complete-panel', { timeout: 10_000 });

    const actionBtns = page.locator('div.complete-panel div.actions button.action-btn');
    await actionBtns.nth(2).click();

    await page.waitForSelector('div.home', { timeout: 10_000 });
    await expect(page.locator('div.home')).toBeVisible();
  });
});
