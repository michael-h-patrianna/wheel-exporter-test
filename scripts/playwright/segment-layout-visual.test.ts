import { expect, test } from '@playwright/test';
import { compareWheelScreenshot } from './helpers/visualHelpers';
import { selectSegmentLayout, uploadAndWaitForWheel } from './helpers/wheelTestHelpers';

const LAYOUT_STABILIZATION_DELAY = 300;

test.describe('Segment layout visual regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await uploadAndWaitForWheel(page);
  });

  test('compact layout rendering matches baseline', async ({ page }) => {
    await selectSegmentLayout(page, 'compact');
    await page.waitForTimeout(LAYOUT_STABILIZATION_DELAY);

    const compactGroup = page.locator('svg > g[data-layout-type="compact"]').first();
    await expect(compactGroup).toBeVisible();

    const compactPrimary = page.locator('[data-layout-variant="compact-primary"]').first();
    await expect(compactPrimary).toBeVisible();

    await compareWheelScreenshot(page, 'segment-layout-compact', { delay: 200 });
  });

  test('icon badge layout rendering matches baseline', async ({ page }) => {
    await selectSegmentLayout(page, 'icon-badge');
    await page.waitForTimeout(LAYOUT_STABILIZATION_DELAY);

    const badgeGroup = page.locator('svg > g[data-layout-type="icon-badge"]').first();
    await expect(badgeGroup).toBeVisible();

    const badgeCircle = page.locator('[data-layout-variant="icon-badge"]').first();
    await expect(badgeCircle).toBeVisible();

    await compareWheelScreenshot(page, 'segment-layout-icon-badge', { delay: 200 });
  });
});
