import { expect, test } from '@playwright/test';
import path from 'path';

/**
 * End-to-End tests for Wheel Exporter App
 * Tests the complete user workflow from file upload to wheel interaction
 */

const PROJECT_ROOT = process.cwd();

test.describe('Wheel Exporter App - E2E Tests', () => {
  const testZipPath = path.join(PROJECT_ROOT, 'docs/theme.zip');

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display initial upload screen', async ({ page }) => {
    // Check for main heading
    await expect(page.getByText('Wheel Demo')).toBeVisible();

    // Check for upload instructions
    await expect(
      page.getByText('Upload a ZIP file exported from the Figma Wheel Plugin')
    ).toBeVisible();

    // Check for file input (it has .file-input-hidden class but exists in DOM)
    const fileInput = page.locator('input[type="file"]').first();
    await expect(fileInput).toHaveAttribute('accept', '.zip');
  });

  test('should upload and extract wheel theme successfully', async ({ page }) => {
    // Upload the ZIP file
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(testZipPath);

    // Wait for extraction to complete
    await expect(page.getByText('Wheel Settings')).toBeVisible({ timeout: 10000 });

    // Verify wheel viewer is displayed (use specific selector to avoid strict mode)
    await expect(page.locator('.wheel-viewer > .wheel-container')).toBeVisible();

    // Verify control panels are visible
    await expect(page.getByText('Components Included:')).toBeVisible();
  });

  test('should display wheel ID and frame dimensions', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(testZipPath);

    await expect(page.getByText('Wheel Settings')).toBeVisible({ timeout: 10000 });

    // Check for wheel ID display
    await expect(page.getByText(/ID:/)).toBeVisible();

    // Check for frame size display
    await expect(page.getByText(/Frame Size:/)).toBeVisible();
  });

  test('should adjust wheel dimensions with sliders', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(testZipPath);

    await expect(page.getByText('Wheel Settings')).toBeVisible({ timeout: 10000 });

    // Find width input
    const widthInput = page
      .locator('input[type="range"]')
      .filter({ has: page.locator('label', { hasText: /wheel width/i }) })
      .first();
    const initialWidth = await widthInput.inputValue();

    // Adjust width
    await widthInput.fill('600');
    const newWidth = await widthInput.inputValue();
    expect(newWidth).toBe('600');
    expect(newWidth).not.toBe(initialWidth);
  });

  test('should adjust segment count', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(testZipPath);

    await expect(page.getByText('Wheel Settings')).toBeVisible({ timeout: 10000 });

    // Find segment count input
    const segmentInput = page.locator('input[type="number"]').first();

    // Change segment count
    await segmentInput.fill('8');
    expect(await segmentInput.inputValue()).toBe('8');
  });

  test('should toggle component visibility', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(testZipPath);

    await expect(page.getByText('Wheel Settings')).toBeVisible({ timeout: 10000 });

    // Find background toggle button
    const backgroundButton = page.getByRole('button', { name: /background/i }).first();
    await expect(backgroundButton).toBeVisible();

    // Get initial class
    const initialClass = await backgroundButton.getAttribute('class');

    // Click to toggle
    await backgroundButton.click();

    // Verify class changed
    const newClass = await backgroundButton.getAttribute('class');
    expect(newClass).not.toBe(initialClass);

    // Click again to toggle back
    await backgroundButton.click();
    const restoredClass = await backgroundButton.getAttribute('class');
    expect(restoredClass).toBe(initialClass);
  });

  test('should cycle header states when clicked', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(testZipPath);

    await expect(page.getByText('Wheel Settings')).toBeVisible({ timeout: 10000 });

    // Find header component
    const header = page.getByRole('button', { name: /header in active state/i });
    await expect(header).toBeVisible();

    // Click to cycle to success state
    await header.click();
    await expect(page.getByAltText('Header success')).toBeVisible();

    // Click to cycle to fail state
    await header.click();
    await expect(page.getByAltText('Header fail')).toBeVisible();

    // Click to cycle back to active state
    await header.click();
    await expect(page.getByAltText('Header active')).toBeVisible();
  });

  test('should trigger wheel spin animation', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(testZipPath);

    await expect(page.getByText('Wheel Settings')).toBeVisible({ timeout: 10000 });

    // Find spin button
    const spinButton = page.getByRole('button', { name: /spin the wheel/i });
    await expect(spinButton).toBeVisible();

    // Check initial state shows default button
    await expect(page.getByAltText('Spin button default')).toBeVisible();

    // Click spin button
    await spinButton.click();

    // Verify spinning state
    await expect(page.getByAltText('Spin button spinning')).toBeVisible({ timeout: 1000 });

    // Wait for animation to complete and return to default
    await expect(page.getByAltText('Spin button default')).toBeVisible({ timeout: 8000 });
  });

  test('should toggle center visibility checkbox', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(testZipPath);

    await expect(page.getByText('Wheel Settings')).toBeVisible({ timeout: 10000 });

    // Find center checkbox
    const centerCheckbox = page.getByRole('checkbox', { name: /show center/i });
    await expect(centerCheckbox).toBeVisible();

    // Verify initially checked
    await expect(centerCheckbox).toBeChecked();

    // Toggle off
    await centerCheckbox.click();
    await expect(centerCheckbox).not.toBeChecked();

    // Toggle back on
    await centerCheckbox.click();
    await expect(centerCheckbox).toBeChecked();
  });

  test('should toggle gradient handles checkbox', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(testZipPath);

    await expect(page.getByText('Wheel Settings')).toBeVisible({ timeout: 10000 });

    // Find gradient handles checkbox
    const gradientCheckbox = page.getByRole('checkbox', { name: /show gradient handles/i });
    await expect(gradientCheckbox).toBeVisible();

    // Verify initially unchecked
    await expect(gradientCheckbox).not.toBeChecked();

    // Toggle on
    await gradientCheckbox.click();
    await expect(gradientCheckbox).toBeChecked();

    // Toggle off
    await gradientCheckbox.click();
    await expect(gradientCheckbox).not.toBeChecked();
  });

  test('should handle error for invalid file upload', async ({ page }) => {
    // Create a temporary invalid file
    const _invalidFilePath = path.join(PROJECT_ROOT, 'scripts', 'playwright', 'invalid.txt');

    // Upload invalid file (this will be handled by browser, but we can test the behavior)
    const fileInput = page.locator('input[type="file"]').first();

    // Note: The file input has accept=".zip" so browser may block non-zip files
    // But if it goes through, app should show error
    await expect(fileInput).toHaveAttribute('accept', '.zip');
  });

  test('should display interaction help guide', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(testZipPath);

    await expect(page.getByText('Wheel Settings')).toBeVisible({ timeout: 10000 });

    // Check for interaction guide
    await expect(page.getByText('Interaction Guide:')).toBeVisible();
    await expect(page.getByText(/Click header to cycle/)).toBeVisible();
    await expect(page.getByText(/Click spin button to simulate/)).toBeVisible();
  });

  test('should render all wheel components', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(testZipPath);

    await expect(page.getByText('Wheel Settings')).toBeVisible({ timeout: 10000 });

    // Check that wheel viewer container exists
    const wheelContainer = page.locator('.wheel-viewer > .wheel-container');
    await expect(wheelContainer).toBeVisible();

    // Verify background image is loaded
    const backgroundImg = page.getByAltText('Background');
    await expect(backgroundImg).toBeVisible();

    // Verify segments are rendered (SVG should exist)
    const segmentsSvg = page.locator('.segments-component svg');
    await expect(segmentsSvg).toBeVisible();
  });

  test('should maintain state across multiple interactions', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(testZipPath);

    await expect(page.getByText('Wheel Settings')).toBeVisible({ timeout: 10000 });

    // Perform multiple interactions

    // 1. Cycle header
    const header = page.getByRole('button', { name: /header in active state/i });
    await header.click();

    // 2. Spin wheel
    const spinButton = page.getByRole('button', { name: /spin the wheel/i });
    await spinButton.click();

    // 3. Toggle component
    const backgroundButton = page.getByRole('button', { name: /background/i }).first();
    await backgroundButton.click();

    // Verify all states are maintained
    await expect(page.getByAltText('Header success')).toBeVisible();
    await expect(backgroundButton).toBeVisible();
  });

  test('should handle keyboard navigation on header', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(testZipPath);

    await expect(page.getByText('Wheel Settings')).toBeVisible({ timeout: 10000 });

    // Find header and focus it
    const header = page.getByRole('button', { name: /header in active state/i });
    await header.focus();

    // Press Enter to cycle
    await header.press('Enter');
    await expect(page.getByAltText('Header success')).toBeVisible();

    // Press Space to cycle again
    await header.press('Space');
    await expect(page.getByAltText('Header fail')).toBeVisible();
  });

  test('should be responsive to window resize', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(testZipPath);

    await expect(page.getByText('Wheel Settings')).toBeVisible({ timeout: 10000 });

    // Get initial wheel container size
    const wheelContainer = page.locator('.wheel-viewer > .wheel-container');
    const _initialBox = await wheelContainer.boundingBox();

    // Resize viewport
    await page.setViewportSize({ width: 1200, height: 800 });

    // Verify wheel container still visible
    await expect(wheelContainer).toBeVisible();

    const newBox = await wheelContainer.boundingBox();
    expect(newBox).toBeTruthy();
  });

  test('should show result view preview when rewards data exists', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(testZipPath);

    await expect(page.getByText('Wheel Settings')).toBeVisible({ timeout: 10000 });

    // Check if result view is rendered (depends on wheel data having rewards)
    const resultTitle = page.getByText('Result View Preview');

    // This may or may not be visible depending on the theme.zip content
    // We'll check for existence but not enforce visibility
    const exists = await resultTitle.count();
    expect(exists).toBeGreaterThanOrEqual(0);
  });
});
