import { expect, test, type Locator, type Page } from '@playwright/test';

const evidenceDir = '.sisyphus/evidence/final-qa';

async function enableDNAE2E(page: Page) {
  await page.addInitScript(() => {
    (window as Window & { __DNA_E2E__?: boolean }).__DNA_E2E__ = true;
  });
}

async function gotoAboutSection(page: Page) {
  await enableDNAE2E(page);
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const aboutSection = page.locator('#about-section');
  await aboutSection.scrollIntoViewIfNeeded();
  await expect(aboutSection.getByRole('heading', { name: 'About' })).toBeVisible();
  await page.waitForTimeout(1500);

  return aboutSection;
}

function portalTrigger(scope: Locator) {
  return scope.getByRole('button', { name: 'Expand interactive 3D scene' });
}

function portalDialog(page: Page) {
  return page.getByRole('dialog', { name: 'Interactive 3D scene' });
}

function returnButton(page: Page) {
  return page.getByRole('button', { name: 'Return to page' });
}

async function dnaVisibility(page: Page) {
  const dnaCanvas = page.locator('[data-testid="dna-canvas"]');
  await expect(dnaCanvas).toHaveCount(1);
  return dnaCanvas.evaluate((element) => window.getComputedStyle(element).visibility);
}

test('Scenario 1: layout vertical stack @desktop', async ({ page }) => {
  const aboutSection = await gotoAboutSection(page);
  const trigger = portalTrigger(aboutSection);
  const textBlock = aboutSection.locator('.max-w-2xl').first();

  await expect(textBlock).toBeVisible();

  const [textBox, triggerBox] = await Promise.all([
    textBlock.boundingBox(),
    trigger.boundingBox(),
  ]);

  expect(textBox).not.toBeNull();
  expect(triggerBox).not.toBeNull();
  expect(triggerBox!.height).toBeGreaterThanOrEqual(280);
  expect(triggerBox!.y).toBeGreaterThan(textBox!.y + textBox!.height - 4);

  await page.screenshot({ path: `${evidenceDir}/layout.png`, fullPage: true });
});

test('Scenario 2: DNA sidebar hidden when portal is fullscreen @desktop', async ({ page }) => {
  const aboutSection = await gotoAboutSection(page);
  const trigger = portalTrigger(aboutSection);

  expect(await dnaVisibility(page)).not.toBe('hidden');
  await trigger.click();
  await page.waitForTimeout(600);
  await expect(portalDialog(page)).toBeVisible();
  expect(await dnaVisibility(page)).toBe('hidden');
  await page.screenshot({ path: `${evidenceDir}/dna-hidden.png`, fullPage: true });

  await returnButton(page).click();
  await page.waitForTimeout(600);
  await expect(trigger).toBeVisible();
  expect(await dnaVisibility(page)).not.toBe('hidden');
  await page.screenshot({ path: `${evidenceDir}/dna-restored.png`, fullPage: true });
});

test('Scenario 3: portal expand and collapse @desktop', async ({ page }) => {
  const aboutSection = await gotoAboutSection(page);
  const trigger = portalTrigger(aboutSection);

  await trigger.click();
  await page.waitForTimeout(600);

  const dialog = portalDialog(page);
  await expect(dialog).toBeVisible();
  const fullscreenState = await dialog.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);

    return {
      position: style.position,
      width: rect.width,
      viewportWidth: window.innerWidth,
    };
  });

  expect(fullscreenState.position).toBe('fixed');
  expect(fullscreenState.width).toBeGreaterThanOrEqual(fullscreenState.viewportWidth - 2);
  await page.screenshot({ path: `${evidenceDir}/portal-fullscreen.png`, fullPage: true });

  await returnButton(page).click();
  await page.waitForTimeout(600);
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeVisible();
  await page.screenshot({ path: `${evidenceDir}/portal-collapsed.png`, fullPage: true });
});

test('Scenario 4: cursor pointer on hover @desktop', async ({ page }) => {
  const aboutSection = await gotoAboutSection(page);
  const trigger = portalTrigger(aboutSection);

  await trigger.hover();
  const cursor = await trigger.evaluate((element) => window.getComputedStyle(element).cursor);
  expect(cursor).toBe('pointer');
});

test('Scenario 5: mobile layout at 375px @desktop', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const aboutSection = await gotoAboutSection(page);
  const trigger = portalTrigger(aboutSection);

  const [panelHeight, overflowState] = await Promise.all([
    trigger.evaluate((element) => element.getBoundingClientRect().height),
    page.evaluate(() => ({
      body: document.body.scrollWidth,
      doc: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
    })),
  ]);

  expect(panelHeight).toBeGreaterThanOrEqual(250);
  expect(panelHeight).toBeLessThanOrEqual(350);
  expect(Math.max(overflowState.body, overflowState.doc)).toBeLessThanOrEqual(overflowState.viewport + 1);
  await page.screenshot({ path: `${evidenceDir}/mobile-layout.png`, fullPage: true });
});

test('Scenario 6: cross-task integration @desktop', async ({ page }) => {
  const aboutSection = await gotoAboutSection(page);
  const trigger = portalTrigger(aboutSection);

  const previewHeight = await trigger.evaluate((element) => element.getBoundingClientRect().height);
  expect(previewHeight).toBeGreaterThanOrEqual(280);

  expect(await dnaVisibility(page)).not.toBe('hidden');
  await trigger.click();
  await page.waitForTimeout(600);
  await expect(portalDialog(page)).toBeVisible();
  expect(await dnaVisibility(page)).toBe('hidden');

  await returnButton(page).click();
  await page.waitForTimeout(600);
  await expect(portalDialog(page)).not.toBeVisible();
  await expect(trigger).toBeVisible();
  expect(await dnaVisibility(page)).not.toBe('hidden');
});
