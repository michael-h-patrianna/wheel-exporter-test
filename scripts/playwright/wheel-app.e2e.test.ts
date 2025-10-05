/**
 * End-to-end tests for Wheel Exporter Test application
 * Tests full user workflows with real browser interactions
 */

import { test, expect } from '@playwright/test';
import path from 'path';

const THEME_ZIP_PATH = path.resolve(__dirname, '../../docs/theme.zip');

test.describe('Wheel Exporter Test E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Initial page load', () => {
    test('should display app header and upload button', async ({ page }) => {
      await expect(page.getByText('Wheel Demo')).toBeVisible();
      await expect(page.getByText('Upload a ZIP file exported from the Figma Wheel Plugin')).toBeVisible();
      await expect(page.getByText('Choose ZIP File')).toBeVisible();
    });

    test('should not display wheel viewer before upload', async ({ page }) => {
      const wheelViewer = page.locator('.wheel-viewer > .wheel-container');
      await expect(wheelViewer).not.toBeVisible();
    });

    test('should not display controls before upload', async ({ page }) => {
      await expect(page.getByText('Wheel Settings')).not.toBeVisible();
      await expect(page.getByText('Component Visibility')).not.toBeVisible();
    });
  });

  test.describe('File upload workflow', () => {
    test('should upload ZIP file and display wheel', async ({ page }) => {
      // Upload the theme ZIP file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(THEME_ZIP_PATH);

      // Wait for wheel to be displayed (loading may be too fast to catch)
      await expect(page.locator('.wheel-viewer > .wheel-container')).toBeVisible({ timeout: 10000 });

      // Check that controls are now visible
      await expect(page.getByText('Wheel Settings')).toBeVisible();
      await expect(page.getByText('Component Visibility')).toBeVisible();
    });

    test('should display wheel information after upload', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(THEME_ZIP_PATH);

      await expect(page.locator('.wheel-viewer > .wheel-container')).toBeVisible({ timeout: 10000 });

      // Check for wheel information display
      await expect(page.getByText(/wheel id/i)).toBeVisible();
      await expect(page.getByText(/original frame size/i)).toBeVisible();
    });

    test('should auto-set dimensions to match frame size', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(THEME_ZIP_PATH);

      await expect(page.locator('.wheel-viewer > .wheel-container')).toBeVisible({ timeout: 10000 });

      // Check dimension inputs have been populated
      const widthInput = page.getByLabel(/wheel width/i);
      const heightInput = page.getByLabel(/wheel height/i);

      const width = await widthInput.inputValue();
      const height = await heightInput.inputValue();

      // Should have numeric values
      expect(parseInt(width)).toBeGreaterThan(0);
      expect(parseInt(height)).toBeGreaterThan(0);
    });
  });

  test.describe('Wheel controls', () => {
    test.beforeEach(async ({ page }) => {
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(THEME_ZIP_PATH);
      await expect(page.locator('.wheel-viewer > .wheel-container')).toBeVisible({ timeout: 10000 });
    });

    test('should allow changing wheel dimensions', async ({ page }) => {
      const widthInput = page.getByLabel(/wheel width/i);
      const heightInput = page.getByLabel(/wheel height/i);

      // Change width
      await widthInput.fill('600');
      expect(await widthInput.inputValue()).toBe('600');

      // Change height
      await heightInput.fill('450');
      expect(await heightInput.inputValue()).toBe('450');
    });

    test('should allow changing segment count', async ({ page }) => {
      const segmentInput = page.getByLabel(/segments/i);

      // Change to 8 segments
      await segmentInput.fill('8');
      expect(await segmentInput.inputValue()).toBe('8');

      // Change to 4 segments
      await segmentInput.fill('4');
      expect(await segmentInput.inputValue()).toBe('4');
    });

    test('should enforce segment count limits (3-8)', async ({ page }) => {
      const segmentInput = page.getByLabel(/segments/i);

      // Verify min is 3
      expect(await segmentInput.getAttribute('min')).toBe('3');

      // Verify max is 8
      expect(await segmentInput.getAttribute('max')).toBe('8');
    });

    test('should render wheel with updated dimensions', async ({ page }) => {
      const widthInput = page.getByLabel(/wheel width/i);

      // Get initial container size
      const container = page.locator('.wheel-viewer > .wheel-container');
      const initialBox = await container.boundingBox();

      // Change width
      await widthInput.fill('400');

      // Wait for re-render
      await page.waitForTimeout(500);

      // Get new container size
      const newBox = await container.boundingBox();

      // Size should have changed
      expect(newBox?.width).not.toBe(initialBox?.width);
    });
  });

  test.describe('Component visibility toggles', () => {
    test.beforeEach(async ({ page }) => {
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(THEME_ZIP_PATH);
      await expect(page.locator('.wheel-viewer > .wheel-container')).toBeVisible({ timeout: 10000 });
    });

    test('should display component toggle buttons', async ({ page }) => {
      await expect(page.getByRole('button', { name: /^background/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /^header \W/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /^segments/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /^wheel bg/i })).toBeVisible();
    });

    test('should toggle component visibility when clicked', async ({ page }) => {
      const backgroundButton = page.getByRole('button', { name: /background/i });
      const backgroundImage = page.getByAltText('Background');

      // Initially visible
      await expect(backgroundImage).toBeVisible();

      // Click to hide
      await backgroundButton.click();
      await expect(backgroundImage).not.toBeVisible();

      // Click to show
      await backgroundButton.click();
      await expect(backgroundImage).toBeVisible();
    });

    test('should toggle multiple components independently', async ({ page }) => {
      const backgroundButton = page.getByRole('button', { name: /background/i });
      const headerButton = page.getByRole('button', { name: /^header$/i });

      const backgroundImage = page.getByAltText('Background');
      const headerImage = page.getByAltText(/header active/i);

      // Hide background
      await backgroundButton.click();
      await expect(backgroundImage).not.toBeVisible();
      await expect(headerImage).toBeVisible(); // Header still visible

      // Hide header
      await headerButton.click();
      await expect(backgroundImage).not.toBeVisible(); // Background still hidden
      await expect(headerImage).not.toBeVisible(); // Header now hidden

      // Show background
      await backgroundButton.click();
      await expect(backgroundImage).toBeVisible(); // Background shown
      await expect(headerImage).not.toBeVisible(); // Header still hidden
    });
  });

  test.describe('Wheel interactions', () => {
    test.beforeEach(async ({ page }) => {
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(THEME_ZIP_PATH);
      await expect(page.locator('.wheel-viewer > .wheel-container')).toBeVisible({ timeout: 10000 });
    });

    test('should cycle header state when clicked', async ({ page }) => {
      const headerComponent = page.locator('.header-component');

      // Click header to cycle states
      await headerComponent.click();
      await page.waitForTimeout(100);

      // Header should exist and be clickable
      await expect(headerComponent).toBeVisible();
    });

    test('should trigger spin animation when spin button clicked', async ({ page }) => {
      const spinButton = page.locator('.button-spin-component');

      // Initially should have default state
      await expect(page.getByAltText('Spin button default')).toBeVisible();

      // Click spin button
      await spinButton.click();

      // Should switch to spinning state
      await expect(page.getByAltText('Spin button spinning')).toBeVisible();

      // Wait for animation to complete (6.5s)
      await page.waitForTimeout(7000);

      // Should return to default state
      await expect(page.getByAltText('Spin button default')).toBeVisible();
    });

    test('should rotate segments during spin animation', async ({ page }) => {
      const segmentsComponent = page.locator('.segments-component');
      const spinButton = page.locator('.button-spin-component');

      // Get initial rotation style
      const initialTransform = await segmentsComponent.getAttribute('style');

      // Click spin button
      await spinButton.click();

      // Wait a moment for rotation to start
      await page.waitForTimeout(1000);

      // Get current rotation style
      const spinningTransform = await segmentsComponent.getAttribute('style');

      // Transform should have changed (rotation in progress)
      expect(spinningTransform).not.toBe(initialTransform);
    });

    test('should not allow multiple simultaneous spins', async ({ page }) => {
      const spinButton = page.locator('.button-spin-component');

      // First click
      await spinButton.click();
      await expect(page.getByAltText('Spin button spinning')).toBeVisible();

      // Try clicking again immediately
      await spinButton.click();
      await spinButton.click();

      // Should still be in spinning state (not restarted)
      await expect(page.getByAltText('Spin button spinning')).toBeVisible();
    });
  });

  test.describe('Visual rendering', () => {
    test.beforeEach(async ({ page }) => {
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(THEME_ZIP_PATH);
      await expect(page.locator('.wheel-viewer > .wheel-container')).toBeVisible({ timeout: 10000 });
    });

    test('should render background image', async ({ page }) => {
      const backgroundImage = page.getByAltText('Background');
      await expect(backgroundImage).toBeVisible();

      // Verify image has loaded
      const naturalWidth = await backgroundImage.evaluate((img: HTMLImageElement) => img.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);
    });

    test('should render segments SVG', async ({ page }) => {
      const segmentsComponent = page.locator('.segments-component');
      await expect(segmentsComponent).toBeVisible();

      // Check SVG exists
      const svg = segmentsComponent.locator('svg');
      await expect(svg).toBeVisible();
    });

    test('should render all visible layers in correct order', async ({ page }) => {
      // All key components should be visible
      await expect(page.getByAltText('Background')).toBeVisible();
      await expect(page.locator('.segments-component')).toBeVisible();
      await expect(page.getByAltText(/header active/i)).toBeVisible();
      await expect(page.getByAltText(/spin button default/i)).toBeVisible();
    });
  });

  test.describe('Error handling', () => {
    test('should handle invalid ZIP file gracefully', async ({ page }) => {
      // Create a temporary text file as invalid ZIP
      const invalidFile = path.resolve(__dirname, '../../README.md');

      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(invalidFile);

      // Should display error message
      await expect(page.locator('.error-message')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Responsive behavior', () => {
    test('should maintain aspect ratio when resizing', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(THEME_ZIP_PATH);
      await expect(page.locator('.wheel-viewer > .wheel-container')).toBeVisible({ timeout: 10000 });

      const container = page.locator('.wheel-viewer > .wheel-container');

      // Get initial dimensions
      const initialBox = await container.boundingBox();
      const initialRatio = initialBox ? initialBox.width / initialBox.height : 0;

      // Change only width
      const widthInput = page.getByLabel(/wheel width/i);
      await widthInput.fill('400');
      await page.waitForTimeout(500);

      // Get new dimensions
      const newBox = await container.boundingBox();
      const newRatio = newBox ? newBox.width / newBox.height : 0;

      // Aspect ratio should be maintained (within tolerance)
      expect(Math.abs(newRatio - initialRatio)).toBeLessThan(0.1);
    });
  });

  test.describe('Accessibility', () => {
    test('should have accessible file input', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]');

      await expect(fileInput).toHaveAttribute('accept', '.zip');
    });

    test('should have keyboard navigable controls', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(THEME_ZIP_PATH);
      await expect(page.locator('.wheel-viewer > .wheel-container')).toBeVisible({ timeout: 10000 });

      // Tab through controls
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // At least one control should be focused
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(['INPUT', 'BUTTON']).toContain(focusedElement);
    });

    test('should have proper ARIA labels', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(THEME_ZIP_PATH);
      await expect(page.locator('.wheel-viewer > .wheel-container')).toBeVisible({ timeout: 10000 });

      // Check for ARIA attributes
      const spinButton = page.locator('[role="button"][aria-label*="Spin"]');
      await expect(spinButton).toBeVisible();
    });
  });
});
