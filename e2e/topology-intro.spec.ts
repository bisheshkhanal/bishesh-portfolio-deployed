import { test, expect } from '@playwright/test';

test.describe('Topology Intro @desktop', () => {
  // 1. Fresh session shows intro overlay
  test('fresh session shows intro overlay', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
    await expect(page.locator('[data-testid="intro-overlay"]')).toBeVisible({
      timeout: 10000,
    });
  });

  // 2. Skip button exits intro
  test('skip button exits intro', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
    await expect(page.locator('[data-testid="intro-overlay"]')).toBeVisible({
      timeout: 10000,
    });
    await page.locator('[data-testid="skip-intro"]').click();
    // Wait for CSS transition (600ms) + buffer
    await page.waitForTimeout(800);
    await expect(page.locator('[data-testid="intro-overlay"]')).toHaveCount(0);
    await expect(page.locator('#hero')).toBeVisible();
  });

  // 3. Session persistence — intro not shown on reload
  test('intro not shown after session mark', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
    await expect(page.locator('[data-testid="intro-overlay"]')).toBeVisible({
      timeout: 10000,
    });
    await page.locator('[data-testid="skip-intro"]').click();
    await page.waitForTimeout(800);
    // Reload — intro should NOT appear
    await page.reload();
    await expect(page.locator('[data-testid="intro-overlay"]')).toHaveCount(0);
    await expect(page.locator('#hero')).toBeVisible();
  });

  // 4. Replay link re-triggers intro
  test('replay link re-triggers intro', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
    await expect(page.locator('[data-testid="intro-overlay"]')).toBeVisible({
      timeout: 10000,
    });
    await page.locator('[data-testid="skip-intro"]').click();
    await page.waitForTimeout(800);
    await expect(page.locator('[data-testid="intro-overlay"]')).toHaveCount(0);
    // Click the Intro replay button in nav
    await page.locator('nav >> text=Intro').click();
    await expect(page.locator('[data-testid="intro-overlay"]')).toBeVisible({
      timeout: 10000,
    });
  });

  // 5. DNA helix hidden during intro
  test('DNA helix hidden during intro', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
    await expect(page.locator('[data-testid="intro-overlay"]')).toBeVisible({
      timeout: 10000,
    });
    const dnaRail = page.locator('[data-testid="dna-rail"]');
    await expect(dnaRail).toHaveCSS('visibility', /hidden/i);
  });

  // 6. DNA helix visible after intro exits
  test('DNA helix visible after intro exits', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
    await expect(page.locator('[data-testid="intro-overlay"]')).toBeVisible({
      timeout: 10000,
    });
    await page.locator('[data-testid="skip-intro"]').click();
    await page.waitForTimeout(800);
    await expect(page.locator('[data-testid="dna-rail"]')).toBeVisible();
  });

  // 7. No #topology section on home page
  test('no topology section on home page', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
    await expect(page.locator('[data-testid="intro-overlay"]')).toBeVisible({
      timeout: 10000,
    });
    await page.locator('[data-testid="skip-intro"]').click();
    await page.waitForTimeout(800);
    await expect(page.locator('#topology')).toHaveCount(0);
    await expect(page.locator('#contact')).toBeVisible();
  });
});

test.describe('Topology Intro @reduced-motion', () => {
  // 8. Reduced-motion bypass — no intro shown
  test('reduced-motion bypasses intro', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
    // Intro should NOT appear for reduced-motion users
    await expect(page.locator('[data-testid="intro-overlay"]')).toHaveCount(0);
    await expect(page.locator('#hero')).toBeVisible();
  });
});
