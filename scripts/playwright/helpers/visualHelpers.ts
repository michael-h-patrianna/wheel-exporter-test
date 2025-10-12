/**
 * Visual Testing Helpers
 * Utilities for screenshot comparison and visual regression testing
 */

import { Page, Locator, expect } from '@playwright/test';
import path from 'path';

/**
 * Screenshot configuration options
 */
export interface ScreenshotOptions {
  /**
   * Name of the screenshot (will be saved as {name}.png)
   */
  name: string;

  /**
   * Directory to save screenshots (relative to screenshots/)
   */
  directory?: string;

  /**
   * Whether to take a full page screenshot
   */
  fullPage?: boolean;

  /**
   * Specific element to screenshot
   */
  locator?: Locator;

  /**
   * Mask elements before taking screenshot (privacy/stability)
   */
  mask?: Locator[];

  /**
   * Animations to disable before screenshot
   */
  animations?: 'disabled' | 'allow';

  /**
   * Wait time before taking screenshot (ms)
   */
  delay?: number;
}

/**
 * Visual comparison thresholds
 */
export const VISUAL_THRESHOLDS = {
  /**
   * Pixel difference threshold (0-1)
   * 0 = exact match, 1 = completely different
   */
  pixelRatio: 0.02, // Allow 2% pixel difference

  /**
   * Threshold for individual pixel color difference (0-1)
   */
  threshold: 0.1, // 10% color difference tolerance
};

/**
 * Get screenshot path
 */
export function getScreenshotPath(name: string, directory?: string): string {
  const baseDir = path.resolve(__dirname, '../../../screenshots');
  const dir = directory ? path.join(baseDir, directory) : baseDir;
  return path.join(dir, `${name}.png`);
}

/**
 * Take a screenshot with standard configuration
 */
export async function takeScreenshot(
  page: Page,
  options: ScreenshotOptions
): Promise<Buffer> {
  const {
    name,
    directory = 'e2e',
    fullPage = false,
    locator,
    mask = [],
    animations = 'disabled',
    delay = 0,
  } = options;

  // Disable animations for consistent screenshots
  if (animations === 'disabled') {
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `,
    });
  }

  // Wait for any specified delay
  if (delay > 0) {
    await page.waitForTimeout(delay);
  }

  const screenshotPath = getScreenshotPath(name, directory);

  if (locator) {
    // Screenshot specific element
    return await locator.screenshot({
      path: screenshotPath,
      mask,
    });
  } else {
    // Screenshot page
    return await page.screenshot({
      path: screenshotPath,
      fullPage,
      mask,
    });
  }
}

/**
 * Compare screenshot with baseline using Playwright's built-in comparison
 */
export async function compareScreenshot(
  page: Page,
  name: string,
  options?: Omit<ScreenshotOptions, 'name'>
): Promise<void> {
  const screenshotOptions = {
    name,
    ...options,
    animations: options?.animations ?? 'disabled',
  };

  // Disable animations for consistent comparison
  if (screenshotOptions.animations === 'disabled') {
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `,
    });
  }

  // Wait for any specified delay
  if (screenshotOptions.delay && screenshotOptions.delay > 0) {
    await page.waitForTimeout(screenshotOptions.delay);
  }

  if (screenshotOptions.locator) {
    await expect(screenshotOptions.locator).toHaveScreenshot(`${name}.png`, {
      maxDiffPixelRatio: VISUAL_THRESHOLDS.pixelRatio,
      threshold: VISUAL_THRESHOLDS.threshold,
      mask: screenshotOptions.mask,
    });
  } else {
    await expect(page).toHaveScreenshot(`${name}.png`, {
      fullPage: screenshotOptions.fullPage ?? false,
      maxDiffPixelRatio: VISUAL_THRESHOLDS.pixelRatio,
      threshold: VISUAL_THRESHOLDS.threshold,
      mask: screenshotOptions.mask,
    });
  }
}

/**
 * Take screenshot of wheel container
 */
export async function screenshotWheel(
  page: Page,
  name: string,
  options?: { directory?: string; delay?: number }
): Promise<Buffer> {
  const wheelContainer = page.locator('.wheel-viewer > .wheel-container');
  await expect(wheelContainer).toBeVisible();

  return await takeScreenshot(page, {
    name,
    locator: wheelContainer,
    directory: options?.directory ?? 'e2e/wheel',
    delay: options?.delay ?? 500,
  });
}

/**
 * Compare wheel screenshot with baseline
 */
export async function compareWheelScreenshot(
  page: Page,
  name: string,
  options?: { delay?: number }
): Promise<void> {
  const wheelContainer = page.locator('.wheel-viewer > .wheel-container');
  await expect(wheelContainer).toBeVisible();

  await compareScreenshot(page, name, {
    locator: wheelContainer,
    delay: options?.delay ?? 500,
  });
}

/**
 * Take screenshot of result viewer
 */
export async function screenshotResultViewer(
  page: Page,
  name: string,
  options?: { directory?: string; delay?: number }
): Promise<Buffer> {
  const resultViewer = page.locator('.result-viewer');
  await expect(resultViewer).toBeVisible();

  return await takeScreenshot(page, {
    name,
    locator: resultViewer,
    directory: options?.directory ?? 'e2e/results',
    delay: options?.delay ?? 500,
  });
}

/**
 * Compare result viewer screenshot with baseline
 */
export async function compareResultViewerScreenshot(
  page: Page,
  name: string,
  options?: { delay?: number }
): Promise<void> {
  const resultViewer = page.locator('.result-viewer');
  await expect(resultViewer).toBeVisible();

  await compareScreenshot(page, name, {
    locator: resultViewer,
    delay: options?.delay ?? 500,
  });
}

/**
 * Take full page screenshot
 */
export async function screenshotFullPage(
  page: Page,
  name: string,
  options?: { directory?: string; delay?: number }
): Promise<Buffer> {
  return await takeScreenshot(page, {
    name,
    fullPage: true,
    directory: options?.directory ?? 'e2e/fullpage',
    delay: options?.delay ?? 500,
  });
}

/**
 * Capture a sequence of screenshots (for animation testing)
 */
export async function captureAnimationSequence(
  page: Page,
  baseName: string,
  options: {
    duration: number;
    frameCount: number;
    directory?: string;
    locator?: Locator;
  }
): Promise<Buffer[]> {
  const { duration, frameCount, directory, locator } = options;
  const frameDelay = duration / frameCount;
  const screenshots: Buffer[] = [];

  for (let i = 0; i < frameCount; i++) {
    const frameName = `${baseName}-frame-${i.toString().padStart(3, '0')}`;

    const screenshot = await takeScreenshot(page, {
      name: frameName,
      directory: directory ?? 'e2e/animation',
      locator,
      animations: 'allow', // Allow animations for sequence
      delay: 0,
    });

    screenshots.push(screenshot);

    // Wait for next frame (except on last frame)
    if (i < frameCount - 1) {
      await page.waitForTimeout(frameDelay);
    }
  }

  return screenshots;
}

/**
 * Wait for visual stability (no changes for specified time)
 */
export async function waitForVisualStability(
  page: Page,
  locator: Locator,
  options?: {
    timeout?: number;
    pollInterval?: number;
    stableTime?: number;
  }
): Promise<boolean> {
  const {
    timeout = 5000,
    pollInterval = 100,
    stableTime = 500,
  } = options ?? {};

  const startTime = Date.now();
  let lastScreenshot: Buffer | null = null;
  let stableStartTime: number | null = null;

  while (Date.now() - startTime < timeout) {
    const currentScreenshot = await locator.screenshot();

    if (lastScreenshot) {
      const isIdentical = Buffer.compare(lastScreenshot, currentScreenshot) === 0;

      if (isIdentical) {
        // Screenshots match
        if (!stableStartTime) {
          stableStartTime = Date.now();
        } else if (Date.now() - stableStartTime >= stableTime) {
          // Stable for required time
          return true;
        }
      } else {
        // Screenshots don't match, reset stability timer
        stableStartTime = null;
      }
    }

    lastScreenshot = currentScreenshot;
    await page.waitForTimeout(pollInterval);
  }

  return false;
}

/**
 * Assert visual stability of an element
 */
export async function expectVisualStability(
  page: Page,
  locator: Locator,
  options?: {
    timeout?: number;
    stableTime?: number;
  }
): Promise<void> {
  const isStable = await waitForVisualStability(page, locator, options);
  expect(isStable).toBe(true);
}

/**
 * Get element dimensions
 */
export async function getElementDimensions(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error('Element not found or not visible');
  }

  return {
    width: Math.round(box.width),
    height: Math.round(box.height),
    x: Math.round(box.x),
    y: Math.round(box.y),
  };
}

/**
 * Assert element dimensions match expected values (within tolerance)
 */
export async function expectDimensions(
  locator: Locator,
  expected: { width: number; height: number },
  tolerance: number = 2
): Promise<void> {
  const actual = await getElementDimensions(locator);

  expect(Math.abs(actual.width - expected.width)).toBeLessThanOrEqual(tolerance);
  expect(Math.abs(actual.height - expected.height)).toBeLessThanOrEqual(tolerance);
}

/**
 * Assert element aspect ratio matches expected ratio (within tolerance)
 */
export async function expectAspectRatio(
  locator: Locator,
  expectedRatio: number,
  tolerance: number = 0.05
): Promise<void> {
  const { width, height } = await getElementDimensions(locator);
  const actualRatio = width / height;
  const diff = Math.abs(actualRatio - expectedRatio);

  expect(diff).toBeLessThanOrEqual(tolerance);
}

/**
 * Create screenshots directory structure
 */
export async function ensureScreenshotDirectories(): Promise<void> {
  const fs = await import('fs/promises');
  const baseDir = path.resolve(__dirname, '../../../screenshots');

  const dirs = [
    baseDir,
    path.join(baseDir, 'e2e'),
    path.join(baseDir, 'e2e/wheel'),
    path.join(baseDir, 'e2e/results'),
    path.join(baseDir, 'e2e/fullpage'),
    path.join(baseDir, 'e2e/animation'),
    path.join(baseDir, 'e2e/errors'),
  ];

  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
  }
}

/**
 * Check if two colors are visually similar
 */
export function areColorsSimilar(
  color1: string,
  color2: string,
  tolerance: number = 10
): boolean {
  // Simple hex color comparison
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');

  if (hex1.length !== 6 || hex2.length !== 6) {
    return color1 === color2; // Fallback to exact match
  }

  const r1 = parseInt(hex1.substring(0, 2), 16);
  const g1 = parseInt(hex1.substring(2, 4), 16);
  const b1 = parseInt(hex1.substring(4, 6), 16);

  const r2 = parseInt(hex2.substring(0, 2), 16);
  const g2 = parseInt(hex2.substring(2, 4), 16);
  const b2 = parseInt(hex2.substring(4, 6), 16);

  const diff = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
  return diff <= tolerance * 3; // tolerance per channel
}

/**
 * Verify gradient rendering
 */
export async function expectGradientRendered(
  locator: Locator,
  expectedColors: string[]
): Promise<void> {
  await expect(locator).toBeVisible();

  const backgroundImage = await locator.evaluate((el) => {
    return window.getComputedStyle(el).backgroundImage;
  });

  // Check if it's a gradient
  expect(backgroundImage).toMatch(/linear-gradient|gradient/i);

  // Check if expected colors are present in gradient
  for (const color of expectedColors) {
    const hexMatch = color.match(/#[0-9a-f]{6}/i);
    if (hexMatch) {
      expect(backgroundImage.toLowerCase()).toContain(hexMatch[0].toLowerCase());
    }
  }
}
