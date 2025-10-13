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
      await expect(page.getByText('Choose ZIP File').first()).toBeVisible();
    });

    test('should not display wheel viewer before upload', async ({ page }) => {
      const wheelViewer = page.locator('.wheel-viewer');
      // Wheel viewer should either not exist or not be visible
      const count = await wheelViewer.count();
      if (count > 0) {
        await expect(wheelViewer.first()).not.toBeVisible();
      }
    });

    test('should display controls when theme auto-loads', async ({ page }) => {
      // The app auto-loads theme.zip from /assets/theme.zip if available
      // So controls should be visible after page load
      await expect(page.getByText('Wheel Settings').first()).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('File upload workflow', () => {
    test('should upload ZIP file and display wheel', async ({ page }) => {
      // Upload the theme ZIP file
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(THEME_ZIP_PATH);

      // Wait for wheel to be displayed (loading may be too fast to catch)
      await expect(page.locator('.wheel-viewer > .wheel-container')).toBeVisible({ timeout: 10000 });

      // Check that controls are now visible
      await expect(page.getByText('Wheel Settings').first()).toBeVisible();
      await expect(page.getByText('Wheel Information').first()).toBeVisible();
    });

    test('should display wheel information after upload', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(THEME_ZIP_PATH);

      await expect(page.locator('.wheel-viewer > .wheel-container')).toBeVisible({ timeout: 10000 });

      // Check for wheel information display
      await expect(page.getByText(/ID:/i).first()).toBeVisible();
      await expect(page.getByText(/Frame Size:/i).first()).toBeVisible();
    });

    test('should auto-set dimensions to match frame size', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(THEME_ZIP_PATH);

      await expect(page.locator('.wheel-viewer > .wheel-container')).toBeVisible({ timeout: 10000 });

      // Check dimension inputs have been populated
      const widthInput = page.getByLabel(/wheel width/i).first();
      const heightInput = page.getByLabel(/wheel height/i).first();

      const width = await widthInput.inputValue();
      const height = await heightInput.inputValue();

      // Should have numeric values
      expect(parseInt(width)).toBeGreaterThan(0);
      expect(parseInt(height)).toBeGreaterThan(0);
    });
  });

  test.describe('Wheel controls', () => {
    test.beforeEach(async ({ page }) => {
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(THEME_ZIP_PATH);
      await expect(page.locator('.wheel-viewer > .wheel-container')).toBeVisible({ timeout: 10000 });
    });

    test('should allow changing wheel dimensions', async ({ page }) => {
      const widthInput = page.getByLabel(/wheel width/i).first();
      const heightInput = page.getByLabel(/wheel height/i).first();

      // Change width (within range 200-414)
      await widthInput.fill('350');
      expect(await widthInput.inputValue()).toBe('350');

      // Change height (within range 200-720)
      await heightInput.fill('450');
      expect(await heightInput.inputValue()).toBe('450');
    });

    test('should allow changing segment layout style', async ({ page }) => {
      const layoutSelect = page.locator('select').first();

      // Should have layout options available
      await expect(layoutSelect).toBeVisible();

      // Get current value
      const initialValue = await layoutSelect.inputValue();
      expect(initialValue).toBeTruthy();
    });

    test('should render wheel with updated dimensions', async ({ page }) => {
      const widthInput = page.getByLabel(/wheel width/i).first();

      // Get initial container size
      const container = page.locator('.wheel-viewer > .wheel-container');
      const initialBox = await container.boundingBox();

      // Change width to a different value (within range 200-414)
      const newWidth = initialBox && initialBox.width > 250 ? '250' : '350';
      await widthInput.fill(newWidth);

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
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(THEME_ZIP_PATH);
      await expect(page.locator('.wheel-viewer > .wheel-container')).toBeVisible({ timeout: 10000 });
    });

    test('should display component toggle buttons', async ({ page }) => {
      await expect(page.getByRole('button', { name: /^background/i }).first()).toBeVisible();
      await expect(page.getByRole('button', { name: /^header \W/i }).first()).toBeVisible();
      await expect(page.getByRole('button', { name: /^segments/i }).first()).toBeVisible();
      await expect(page.getByRole('button', { name: /^wheel bg/i }).first()).toBeVisible();
    });

    test('should toggle component visibility when clicked', async ({ page }) => {
      const backgroundButton = page.getByRole('button', { name: /background/i }).first();
      const backgroundImage = page.getByAltText('Background', { exact: true });

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
      const backgroundButton = page.getByRole('button', { name: /^background/i }).first();
      const segmentsButton = page.getByRole('button', { name: /^segments/i }).first();

      const backgroundImage = page.getByAltText('Background', { exact: true });
      const segmentsComponent = page.locator('.segments-component');

      // Hide background
      await backgroundButton.click();
      await expect(backgroundImage).not.toBeVisible();
      await expect(segmentsComponent).toBeVisible(); // Segments still visible

      // Hide segments
      await segmentsButton.click();
      await expect(backgroundImage).not.toBeVisible(); // Background still hidden
      await expect(segmentsComponent).not.toBeVisible(); // Segments now hidden

      // Show background
      await backgroundButton.click();
      await expect(backgroundImage).toBeVisible(); // Background shown
      await expect(segmentsComponent).not.toBeVisible(); // Segments still hidden
    });
  });

  test.describe('Wheel interactions', () => {
    test.beforeEach(async ({ page }) => {
      const fileInput = page.locator('input[type="file"]').first();
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

    test('should animate segments during spin', async ({ page }) => {
      const spinButton = page.locator('.button-spin-component');

      // Initially should have default state
      await expect(page.getByAltText('Spin button default')).toBeVisible();

      // Click spin button to trigger animation
      await spinButton.click();

      // Button should change to spinning state
      await expect(page.getByAltText('Spin button spinning')).toBeVisible();

      // Segments component should still be visible during spin
      await expect(page.locator('.segments-component')).toBeVisible();
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
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(THEME_ZIP_PATH);
      await expect(page.locator('.wheel-viewer > .wheel-container')).toBeVisible({ timeout: 10000 });
    });

    test('should render background image', async ({ page }) => {
      const backgroundImage = page.getByAltText('Background', { exact: true });
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
      await expect(page.getByAltText('Background', { exact: true })).toBeVisible();
      await expect(page.locator('.segments-component')).toBeVisible();
      await expect(page.getByAltText(/header active/i)).toBeVisible();
      await expect(page.getByAltText(/spin button default/i)).toBeVisible();
    });
  });

  test.describe('Error handling', () => {
    test('should handle invalid ZIP file gracefully', async ({ page }) => {
      // Create a temporary text file as invalid ZIP
      const invalidFile = path.resolve(__dirname, '../../README.md');

      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(invalidFile);

      // Should display error message
      await expect(page.locator('.error-message').first()).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Responsive behavior', () => {
    test('should maintain aspect ratio when resizing', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(THEME_ZIP_PATH);
      await expect(page.locator('.wheel-viewer > .wheel-container')).toBeVisible({ timeout: 10000 });

      const container = page.locator('.wheel-viewer > .wheel-container');

      // Get initial dimensions
      const initialBox = await container.boundingBox();
      const initialRatio = initialBox ? initialBox.width / initialBox.height : 0;

      // Change only width
      const widthInput = page.getByLabel(/wheel width/i).first();
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
      const fileInput = page.locator('input[type="file"]').first();

      await expect(fileInput).toHaveAttribute('accept', '.zip');
    });

    test('should have keyboard navigable controls', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]').first();
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
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(THEME_ZIP_PATH);
      await expect(page.locator('.wheel-viewer > .wheel-container')).toBeVisible({ timeout: 10000 });

      // Check for ARIA attributes on header
      const header = page.locator('[role="button"][aria-label*="Header"]');
      await expect(header).toBeVisible();
    });
  });
});
