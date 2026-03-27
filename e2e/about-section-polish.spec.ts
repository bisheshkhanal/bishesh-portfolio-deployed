import { test, expect } from '@playwright/test';

async function enableDNAE2E(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    (window as any).__DNA_E2E__ = true;
  });
}

async function gotoHomeAbout(page: import('@playwright/test').Page) {
  await enableDNAE2E(page);
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const aboutSection = page.locator('#about-section');
  await aboutSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(2000);

  return aboutSection;
}

test('About section renders as vertical stack @desktop', async ({ page }) => {
  const section = await gotoHomeAbout(page);
  await page.waitForTimeout(500);

  await expect(section.locator('h2')).toContainText('About');

  const canvas = section.locator('canvas').first();
  await canvas.waitFor({ timeout: 10000 });

  const panelHeight = await section.locator('[role="button"]').evaluate((element) => {
    return element.getBoundingClientRect().height;
  });
  expect(panelHeight).toBeGreaterThanOrEqual(280);

  const divider = section.locator('.border-t').first();
  await expect(divider).toBeVisible();
});

test('About section has no subheaders @desktop', async ({ page }) => {
  const section = await gotoHomeAbout(page);
  await section.scrollIntoViewIfNeeded();

  await expect(section.getByText('From biological systems')).toHaveCount(0);
  await expect(section.getByText('I build systems that can reason')).toHaveCount(0);
});

test('Scene panel has pointer cursor on hover @desktop', async ({ page }) => {
  const section = await gotoHomeAbout(page);
  await page.waitForTimeout(1000);

  const trigger = section.getByRole('button', { name: 'Expand interactive 3D scene' });
  const cursor = await trigger.evaluate((element) => window.getComputedStyle(element).cursor);

  expect(cursor).toBe('pointer');
});

test('DNA sidebar hidden when portal is fullscreen @desktop', async ({ page }) => {
  const section = await gotoHomeAbout(page);
  await page.waitForTimeout(1000);

  const dnaCanvas = page.locator('[data-testid="dna-canvas"]');
  await dnaCanvas.waitFor({ timeout: 10000 });

  const visibilityBefore = await dnaCanvas.evaluate((element) => {
    return window.getComputedStyle(element).visibility;
  });
  expect(visibilityBefore).not.toBe('hidden');

  const trigger = section.getByRole('button', { name: 'Expand interactive 3D scene' });
  await trigger.click();
  await page.waitForTimeout(600);

  const visibilityAfter = await dnaCanvas.evaluate((element) => {
    return window.getComputedStyle(element).visibility;
  });
  expect(visibilityAfter).toBe('hidden');

  await page.getByRole('button', { name: 'Return to page' }).click();
  await page.waitForTimeout(600);

  const visibilityRestored = await dnaCanvas.evaluate((element) => {
    return window.getComputedStyle(element).visibility;
  });
  expect(visibilityRestored).not.toBe('hidden');
});

test('Portal expands to fullscreen and collapses @desktop', async ({ page }) => {
  const section = await gotoHomeAbout(page);
  await page.waitForTimeout(1000);

  const trigger = section.getByRole('button', { name: 'Expand interactive 3D scene' });
  await trigger.click();
  await page.waitForTimeout(600);

  const dialog = page.getByRole('dialog', { name: 'Interactive 3D scene' });
  await expect(dialog).toBeVisible();

  const state = await dialog.evaluate((element) => {
    const rect = element.getBoundingClientRect();

    return {
      position: window.getComputedStyle(element).position,
      width: rect.width,
      viewportWidth: window.innerWidth,
    };
  });

  expect(state.position).toBe('fixed');
  expect(state.width).toBeGreaterThan(state.viewportWidth * 0.9);

  await page.getByRole('button', { name: 'Return to page' }).click();
  await page.waitForTimeout(600);
  await expect(dialog).not.toBeVisible();
});

test('Rapid clicks on scene panel result in stable state @desktop', async ({ page }) => {
  const section = await gotoHomeAbout(page);
  await page.waitForTimeout(1000);

  const trigger = section.getByRole('button', { name: 'Expand interactive 3D scene' });
  const box = await trigger.boundingBox();

  expect(box).not.toBeNull();

  for (let index = 0; index < 5; index += 1) {
    await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.waitForTimeout(50);
  }
  await page.waitForTimeout(1000);

  const dialog = page.getByRole('dialog', { name: 'Interactive 3D scene' });
  const isOpen = await dialog.isVisible();

  if (isOpen) {
    await expect(page.getByRole('button', { name: 'Return to page' })).toBeVisible();
  } else {
    await expect(trigger).toBeVisible();
  }
});

test('About section mobile layout at 375px @desktop', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });

  const section = await gotoHomeAbout(page);
  await page.waitForTimeout(500);

  const trigger = section.getByRole('button', { name: 'Expand interactive 3D scene' });
  const panelHeight = await trigger.evaluate((element) => element.getBoundingClientRect().height);

  expect(panelHeight).toBeGreaterThanOrEqual(250);
  expect(panelHeight).toBeLessThanOrEqual(350);

  const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
  expect(bodyWidth).toBeLessThanOrEqual(380);
});

test('Portal expands on mobile viewport @desktop', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });

  const section = await gotoHomeAbout(page);
  await page.waitForTimeout(1000);

  const trigger = section.getByRole('button', { name: 'Expand interactive 3D scene' });
  await trigger.click();
  await page.waitForTimeout(600);

  const dialog = page.getByRole('dialog', { name: 'Interactive 3D scene' });
  await expect(dialog).toBeVisible();

  const state = await dialog.evaluate((element) => ({
    position: window.getComputedStyle(element).position,
    width: element.getBoundingClientRect().width,
  }));

  expect(state.position).toBe('fixed');
  expect(state.width).toBeGreaterThan(300);
});
