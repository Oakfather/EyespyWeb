import { test, expect } from '@playwright/test';
import { resetAndWaitForHome, navigateToEditor } from './helpers';

test.describe('Editor screen', () => {
  test.beforeEach(async ({ page }) => {
    await resetAndWaitForHome(page);
    await navigateToEditor(page);
  });

  test('renders editor layout with topbar', async ({ page }) => {
    await expect(page.locator('div.editor-layout')).toBeVisible();
    await expect(page.locator('div.topbar')).toBeVisible();
  });

  test('scene name input is pre-populated with "French Countryside"', async ({ page }) => {
    const nameInput = page.locator('input.scene-name-input');
    await expect(nameInput).toBeVisible();
    await expect(nameInput).toHaveValue('French Countryside');
  });

  test('back button returns to home screen', async ({ page }) => {
    await page.click('div.topbar button.topbar-btn:first-of-type');
    await page.waitForSelector('div.home', { timeout: 10_000 });
    await expect(page.locator('div.home')).toBeVisible();
    expect(page.url()).toMatch(/#\/?$/);
  });

  test('play button navigates to play screen', async ({ page }) => {
    await page.click('button.play-btn');
    await page.waitForSelector('div.play-screen', { timeout: 10_000 });
    await expect(page.locator('div.play-screen')).toBeVisible();
    expect(page.url()).toContain('#/play/');
  });

  test('editing scene name persists after navigating back to home', async ({ page }) => {
    const nameInput = page.locator('input.scene-name-input');
    await nameInput.click({ clickCount: 3 });
    await nameInput.fill('Renamed Scene');
    await nameInput.press('Tab');

    await page.click('div.topbar button.topbar-btn:first-of-type');
    await page.waitForSelector('div.home', { timeout: 10_000 });

    await expect(page.locator('div.scene-card div.scene-name')).toHaveText('Renamed Scene');
  });

  test('topbar contains Back, Export, and Play buttons', async ({ page }) => {
    const topbarBtns = page.locator('div.topbar button.topbar-btn');
    // Back button
    await expect(topbarBtns.first()).toContainText('Back');
    // Export button (second)
    await expect(topbarBtns.nth(1)).toContainText('Export');
    // Play button
    await expect(page.locator('button.play-btn')).toContainText('Play');
  });

  test('full round-trip: editor → play → edit mode → editor → home', async ({ page }) => {
    // Editor → play
    await page.click('button.play-btn');
    await page.waitForSelector('span.found-counter', { timeout: 15_000 });
    expect(page.url()).toContain('#/play/');

    // Play → editor via gear menu Edit Mode
    await page.click('button.gear-btn');
    await page.waitForSelector('div.menu-panel', { timeout: 5_000 });
    await page.locator('div.menu-panel button.menu-item').first().click();

    await page.waitForSelector('div.editor-layout', { timeout: 10_000 });
    expect(page.url()).toContain('#/editor/');

    // Editor → home
    await page.click('div.topbar button.topbar-btn:first-of-type');
    await page.waitForSelector('div.home', { timeout: 10_000 });
    await expect(page.locator('div.home')).toBeVisible();
  });
});
