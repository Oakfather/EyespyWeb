import { test, expect } from '@playwright/test';
import { resetAndWaitForHome } from './helpers';

test.describe('Home screen', () => {
  test.beforeEach(async ({ page }) => {
    await resetAndWaitForHome(page);
  });

  test('displays EyeSpy title and project name', async ({ page }) => {
    await expect(page.locator('h1.home-title')).toHaveText('EyeSpy');
    await expect(page.locator('p.home-subtitle')).toHaveText('My Project');
  });

  test('shows the import button in an enabled state', async ({ page }) => {
    const importBtn = page.locator('button.import-btn');
    await expect(importBtn).toBeVisible();
    await expect(importBtn).toBeEnabled();
    await expect(importBtn).toHaveText('Import Scene (.eyespy.zip)');
  });

  test('shows one scene card for the example scene', async ({ page }) => {
    await expect(page.locator('div.scenes-grid')).toBeVisible();
    await expect(page.locator('div.scene-card')).toHaveCount(1);
  });

  test('scene card shows "French Countryside" name', async ({ page }) => {
    await expect(page.locator('div.scene-card div.scene-name')).toHaveText('French Countryside');
  });

  test('scene card shows 3 hidden images in meta', async ({ page }) => {
    await expect(page.locator('div.scene-card div.scene-meta')).toHaveText('3 hidden images');
  });

  test('scene preview button has class "playable"', async ({ page }) => {
    await expect(page.locator('div.scene-card button.scene-preview')).toHaveClass(/playable/);
  });

  test('scene card has an edit button', async ({ page }) => {
    await expect(page.locator('div.scene-card button.edit-btn')).toBeVisible();
  });

  test('scene card has a delete button', async ({ page }) => {
    await expect(page.locator('div.scene-card button.delete-btn')).toBeVisible();
  });

  test('deletes scene when delete is confirmed', async ({ page }) => {
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('French Countryside');
      await dialog.accept();
    });
    await page.click('div.scene-card button.delete-btn');
    await expect(page.locator('div.scene-card')).toHaveCount(0, { timeout: 5_000 });
  });

  test('keeps scene when delete is dismissed', async ({ page }) => {
    page.on('dialog', async (dialog) => {
      await dialog.dismiss();
    });
    await page.click('div.scene-card button.delete-btn');
    await expect(page.locator('div.scene-card')).toHaveCount(1, { timeout: 5_000 });
  });

  test('edit button navigates to editor with correct hash', async ({ page }) => {
    await page.click('div.scene-card button.edit-btn');
    await page.waitForSelector('div.editor-layout', { timeout: 10_000 });
    await expect(page.locator('div.editor-layout')).toBeVisible();
    expect(page.url()).toContain('#/editor/');
  });

  test('scene preview click navigates to play screen', async ({ page }) => {
    await page.click('button.scene-preview.playable');
    await page.waitForSelector('div.play-screen', { timeout: 10_000 });
    await expect(page.locator('div.play-screen')).toBeVisible();
    expect(page.url()).toContain('#/play/');
  });
});
