/**
 * Wheel Test Helpers
 * Reusable utilities for Playwright E2E tests of the Wheel Exporter
 */

import { Page, Locator, expect } from '@playwright/test';
import path from 'path';

/**
 * Constants
 */
export const THEME_ZIP_PATH = path.resolve(__dirname, '../../../docs/theme.zip');
export const SPIN_ANIMATION_DURATION = 7000; // 6.5s + buffer
export const SHORT_WAIT = 500;
export const MEDIUM_WAIT = 1000;

/**
 * Upload a ZIP file to the wheel viewer
 */
export async function uploadWheelZip(page: Page, zipPath: string = THEME_ZIP_PATH): Promise<void> {
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(zipPath);
}

/**
 * Wait for wheel to load and be visible
 */
export async function waitForWheelLoad(page: Page, timeout: number = 10000): Promise<void> {
  const wheelContainer = page.locator('.wheel-viewer > .wheel-container');
  await expect(wheelContainer).toBeVisible({ timeout });
}

/**
 * Complete upload and wait for load
 */
export async function uploadAndWaitForWheel(page: Page, zipPath: string = THEME_ZIP_PATH): Promise<void> {
  await uploadWheelZip(page, zipPath);
  await waitForWheelLoad(page);
}

/**
 * Get the wheel container element
 */
export function getWheelContainer(page: Page): Locator {
  return page.locator('.wheel-viewer > .wheel-container');
}

/**
 * Get component visibility toggle button by component name
 */
export function getComponentToggle(page: Page, componentName: string): Locator {
  const patterns: Record<string, RegExp> = {
    background: /^background/i,
    header: /^header\s/i,
    wheelBg: /^wheel bg/i,
    segments: /^segments/i,
    wheelTop1: /^wheel top 1/i,
    wheelTop2: /^wheel top 2/i,
    lights: /^lights/i,
    buttonSpin: /^button spin/i,
    center: /^center/i,
    pointer: /^pointer/i,
  };

  const pattern = patterns[componentName];
  if (!pattern) {
    throw new Error(`Unknown component: ${componentName}`);
  }

  return page.getByRole('button', { name: pattern });
}

/**
 * Toggle a component's visibility
 */
export async function toggleComponent(page: Page, componentName: string): Promise<void> {
  const button = getComponentToggle(page, componentName);
  await button.click();
  await page.waitForTimeout(100); // Small delay for state update
}

/**
 * Get the spin button element
 */
export function getSpinButton(page: Page): Locator {
  return page.locator('.button-spin-component');
}

/**
 * Trigger a wheel spin and wait for completion
 */
export async function spinWheel(page: Page, waitForComplete: boolean = true): Promise<void> {
  const spinButton = getSpinButton(page);
  await spinButton.click();

  // Verify spin started
  await expect(page.getByAltText('Spin button spinning')).toBeVisible({ timeout: 1000 });

  if (waitForComplete) {
    // Wait for spin to complete
    await page.waitForTimeout(SPIN_ANIMATION_DURATION);
    await expect(page.getByAltText('Spin button default')).toBeVisible();
  }
}

/**
 * Get the header component element
 */
export function getHeaderComponent(page: Page): Locator {
  return page.locator('.header-component');
}

/**
 * Cycle header state (active → success → fail → active)
 */
export async function cycleHeaderState(page: Page, targetState?: 'active' | 'success' | 'fail'): Promise<void> {
  const header = getHeaderComponent(page);

  if (!targetState) {
    // Just cycle once
    await header.click();
    await page.waitForTimeout(100);
    return;
  }

  // Cycle until we reach the target state
  const maxClicks = 3; // Prevent infinite loop
  for (let i = 0; i < maxClicks; i++) {
    const altText = `header ${targetState}`;
    const isTargetVisible = await page.getByAltText(new RegExp(altText, 'i')).isVisible().catch(() => false);

    if (isTargetVisible) {
      break;
    }

    await header.click();
    await page.waitForTimeout(100);
  }
}

/**
 * Get wheel dimension inputs
 */
export function getWheelDimensionInputs(page: Page) {
  return {
    width: page.getByLabel(/wheel width/i),
    height: page.getByLabel(/wheel height/i),
  };
}

/**
 * Set wheel dimensions
 */
export async function setWheelDimensions(page: Page, width: number, height: number): Promise<void> {
  const { width: widthInput, height: heightInput } = getWheelDimensionInputs(page);
  await widthInput.fill(String(width));
  await heightInput.fill(String(height));
  await page.waitForTimeout(SHORT_WAIT);
}

/**
 * Get segment count input
 */
export function getSegmentCountInput(page: Page): Locator {
  return page.getByLabel(/segments/i);
}

/**
 * Set segment count
 */
export async function setSegmentCount(page: Page, count: number): Promise<void> {
  const input = getSegmentCountInput(page);
  await input.fill(String(count));
  await page.waitForTimeout(SHORT_WAIT);
}

/**
 * Assert that an error message is visible
 */
export async function expectErrorMessage(page: Page, message?: string | RegExp): Promise<void> {
  const errorElement = page.locator('.error-message');
  await expect(errorElement).toBeVisible({ timeout: 5000 });

  if (message) {
    if (typeof message === 'string') {
      await expect(errorElement).toContainText(message);
    } else {
      await expect(errorElement).toHaveText(message);
    }
  }
}

/**
 * Check if a component is visible by its image alt text
 */
export async function isComponentVisible(page: Page, altText: string | RegExp): Promise<boolean> {
  try {
    const element = page.getByAltText(altText);
    return await element.isVisible();
  } catch {
    return false;
  }
}

/**
 * Get the segments component
 */
export function getSegmentsComponent(page: Page): Locator {
  return page.locator('.segments-component');
}

/**
 * Get segment rotation value from transform style
 */
export async function getSegmentRotation(page: Page): Promise<number> {
  const segments = getSegmentsComponent(page);
  const style = await segments.getAttribute('style');

  if (!style) return 0;

  // Extract rotation from transform style: rotate(XXXdeg)
  const match = style.match(/rotate\((-?\d+(?:\.\d+)?)deg\)/);
  if (match) {
    return parseFloat(match[1]);
  }

  return 0;
}

/**
 * Assert that segments are rotating (rotation value changes)
 */
export async function expectSegmentsRotating(page: Page): Promise<void> {
  const initialRotation = await getSegmentRotation(page);
  await page.waitForTimeout(MEDIUM_WAIT);
  const currentRotation = await getSegmentRotation(page);

  expect(currentRotation).not.toBe(initialRotation);
}

/**
 * Get wheel information from the UI
 */
export async function getWheelInfo(page: Page) {
  const idElement = page.getByText(/wheel id/i).locator('..');
  const frameSizeElement = page.getByText(/original frame size/i).locator('..');

  const idText = await idElement.textContent();
  const frameSizeText = await frameSizeElement.textContent();

  return {
    id: idText,
    frameSize: frameSizeText,
  };
}

/**
 * Check if the result viewer is visible
 */
export async function isResultViewerVisible(page: Page): Promise<boolean> {
  try {
    const resultViewer = page.locator('.result-viewer');
    return await resultViewer.isVisible();
  } catch {
    return false;
  }
}

/**
 * Get result viewer elements
 */
export function getResultViewerElements(page: Page) {
  return {
    container: page.locator('.result-viewer'),
    header: page.locator('.result-header'),
    rewardRows: page.locator('.result-viewer .reward-row'),
    button: page.locator('.result-button'),
  };
}

/**
 * Assert that result viewer displays correct number of reward rows
 */
export async function expectRewardRowCount(page: Page, count: number): Promise<void> {
  const { rewardRows } = getResultViewerElements(page);
  await expect(rewardRows).toHaveCount(count);
}

/**
 * Get component bounding box
 */
export async function getComponentBounds(locator: Locator) {
  return await locator.boundingBox();
}

/**
 * Calculate aspect ratio from bounding box
 */
export function calculateAspectRatio(box: { width: number; height: number } | null): number {
  if (!box) return 0;
  return box.width / box.height;
}

/**
 * Assert image is loaded (has naturalWidth > 0)
 */
export async function expectImageLoaded(page: Page, altText: string | RegExp): Promise<void> {
  const image = page.getByAltText(altText);
  await expect(image).toBeVisible();

  const naturalWidth = await image.evaluate((img: HTMLImageElement) => img.naturalWidth);
  expect(naturalWidth).toBeGreaterThan(0);
}

/**
 * Get control section elements
 */
export function getControlSections(page: Page) {
  return {
    wheelSettings: page.getByText('Wheel Settings'),
    componentVisibility: page.getByText('Component Visibility'),
    wheelInformation: page.getByText('Wheel Information'),
  };
}

/**
 * Assert that controls are visible
 */
export async function expectControlsVisible(page: Page): Promise<void> {
  const { wheelSettings, componentVisibility } = getControlSections(page);
  await expect(wheelSettings).toBeVisible();
  await expect(componentVisibility).toBeVisible();
}

/**
 * Assert that controls are not visible
 */
export async function expectControlsHidden(page: Page): Promise<void> {
  const { wheelSettings, componentVisibility } = getControlSections(page);
  await expect(wheelSettings).not.toBeVisible();
  await expect(componentVisibility).not.toBeVisible();
}

/**
 * Get page title and description
 */
export async function getPageHeader(page: Page) {
  const title = await page.getByText('Wheel Demo').textContent();
  const description = await page.getByText('Upload a ZIP file exported from the Figma Wheel Plugin').textContent();

  return { title, description };
}

/**
 * Wait for a condition with polling
 */
export async function waitForCondition(
  condition: () => Promise<boolean>,
  timeout: number = 5000,
  pollInterval: number = 100
): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }

  return false;
}
