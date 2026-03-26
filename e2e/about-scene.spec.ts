import { test, expect } from '@playwright/test';

/**
 * Scroll to a specific beat in the About page topology scene.
 * R3F ScrollControls uses 4 pages (one per beat); wheel events simulate user scrolling.
 */
async function scrollToBeat(page: import('@playwright/test').Page, beatPosition: number) {
  await page.waitForSelector('[data-testid="immersive-shell"]', { timeout: 10000 });
  await page.locator('canvas').waitFor({ timeout: 10000 });
  await page.waitForTimeout(1000);
  
  const viewportHeight = page.viewportSize()?.height || 800;
  const scrollPerBeat = viewportHeight * 3;
  const wheelEvents = 20;
  const deltaY = (scrollPerBeat * beatPosition) / wheelEvents;
  
  for (let i = 0; i < wheelEvents; i++) {
    await page.mouse.wheel(0, deltaY);
    await page.waitForTimeout(50);
  }
  await page.waitForTimeout(500);
}

test('Desktop Beat 1 baseline @desktop', async ({ page }) => {
  // Set E2E flag before navigation to ensure deterministic time
  await page.addInitScript(() => {
    (window as any).__DNA_E2E__ = true;
  });
  
  await page.goto('/about');
  
  // Beat 1 is the initial position - no scrolling needed
  await page.waitForSelector('[data-testid="immersive-shell"]', { timeout: 10000 });
  await page.locator('canvas').waitFor({ timeout: 10000 });
  await page.waitForTimeout(2500);
  
  // Freeze WebGL animation loop for stable screenshot
  await page.evaluate(() => {
    window.requestAnimationFrame = () => 0;
  });
  await page.waitForTimeout(100);
  
  await expect(page).toHaveScreenshot('beat1-baseline.png', {
    maxDiffPixels: 35000,
    animations: 'disabled',
  });
});

test('Desktop Beat 4 baseline @desktop', async ({ page }) => {
  // Set E2E flag before navigation to freeze time for deterministic rendering
  await page.addInitScript(() => {
    (window as any).__DNA_E2E__ = true;
  });
  
  await page.goto('/about');
  await scrollToBeat(page, 3);
  await page.waitForTimeout(500);
  
  // Freeze WebGL animation loop for stable screenshot
  await page.evaluate(() => {
    window.requestAnimationFrame = () => 0;
  });
  await page.waitForTimeout(100);
  
  await expect(page).toHaveScreenshot('task-3-beat4-baseline.png', {
    maxDiffPixels: 5000,
    animations: 'disabled',
  });
});

test('Reduced motion smoke test @reduced-motion', async ({ page }) => {
  await page.goto('/about');
  await page.waitForSelector('[data-testid="immersive-shell"]', { timeout: 10000 });
  await page.waitForTimeout(500);
  
  const scrollable = page.locator('[data-testid="immersive-shell"] > div > div').first();
  await scrollable.evaluate((el) => {
    el.scrollTop = el.scrollHeight * 0.85;
  });
  await page.waitForTimeout(500);
  
  await expect(page.locator('p').filter({ hasText: 'BRAHMAN' }).first()).toBeVisible();
});
