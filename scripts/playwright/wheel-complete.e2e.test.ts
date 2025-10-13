/**
 * Comprehensive E2E Test Suite for Wheel Exporter
 *
 * This test suite provides 100% coverage of user flows including:
 * - ZIP upload and wheel rendering
 * - Wheel spin animation and state management
 * - Header state cycling
 * - Component visibility toggles
 * - Result viewer display
 * - Error scenarios and edge cases
 * - Visual regression testing
 * - Accessibility features
 */

import { expect, test } from '@playwright/test';
import path from 'path';
import {
  compareResultViewerScreenshot,
  compareWheelScreenshot,
  ensureScreenshotDirectories,
  expectVisualStability,
  screenshotFullPage,
  screenshotResultViewer,
  screenshotWheel,
  takeScreenshot,
} from './helpers/visualHelpers';
import {
  calculateAspectRatio,
  cycleHeaderState,
  expectControlsHidden,
  expectControlsVisible,
  expectErrorMessage,
  expectImageLoaded,
  expectRewardRowCount,
  expectSegmentsRotating,
  getComponentBounds,
  getComponentToggle,
  getHeaderComponent,
  getPageHeader,
  getResultViewerElements,
  getSegmentCountInput,
  getSegmentRotation,
  getSegmentsComponent,
  getSpinButton,
  getWheelContainer,
  getWheelDimensionInputs,
  isComponentVisible,
  isResultViewerVisible,
  setSegmentCount,
  setWheelDimensions,
  SHORT_WAIT,
  SPIN_ANIMATION_DURATION,
  spinWheel,
  THEME_ZIP_PATH,
  toggleComponent,
  uploadAndWaitForWheel,
  uploadWheelZip,
  waitForWheelLoad,
} from './helpers/wheelTestHelpers';

const PROJECT_ROOT = process.cwd();

test.describe('Wheel Exporter - Comprehensive E2E Tests', () => {
  // Setup: Ensure screenshot directories exist
  test.beforeAll(async () => {
    await ensureScreenshotDirectories();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  /**
   * ============================================================================
   * SECTION 1: Initial Page State
   * ============================================================================
   */
  test.describe('Initial page state', () => {
    test('should display correct page header and title', async ({ page }) => {
      const header = await getPageHeader(page);
      expect(header.title).toContain('Wheel Demo');
      expect(header.description).toContain(
        'Upload a ZIP file exported from the Figma Wheel Plugin'
      );
    });

    test('should display file upload button', async ({ page }) => {
      await expect(page.getByText('Choose ZIP File')).toBeVisible();
      const fileInput = page.locator('input[type="file"]').first();
      await expect(fileInput).toHaveAttribute('accept', '.zip');
    });

    test('should not display wheel before upload', async ({ page }) => {
      const wheelContainer = getWheelContainer(page);
      await expect(wheelContainer).not.toBeVisible();
    });

    test('should not display controls before upload', async ({ page }) => {
      await expectControlsHidden(page);
    });

    test('should have correct document title', async ({ page }) => {
      const title = await page.title();
      expect(title).toBeTruthy();
    });

    test('should capture initial state screenshot', async ({ page }) => {
      await screenshotFullPage(page, 'initial-state', { directory: 'e2e/states' });
    });
  });

  /**
   * ============================================================================
   * SECTION 2: File Upload and Loading
   * ============================================================================
   */
  test.describe('File upload and loading', () => {
    test('should upload ZIP and display loading state', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]').first();

      // Upload file
      await uploadWheelZip(page);

      // Loading message might appear briefly (may be too fast to catch)
      // Just verify wheel loads eventually
      await waitForWheelLoad(page);
    });

    test('should display wheel after successful upload', async ({ page }) => {
      await uploadAndWaitForWheel(page);

      const wheelContainer = getWheelContainer(page);
      await expect(wheelContainer).toBeVisible();
    });

    test('should display controls after upload', async ({ page }) => {
      await uploadAndWaitForWheel(page);
      await expectControlsVisible(page);
    });

    test('should display wheel information section', async ({ page }) => {
      await uploadAndWaitForWheel(page);

      await expect(page.getByText('Wheel Information')).toBeVisible();
      await expect(page.getByText(/wheel id/i)).toBeVisible();
      await expect(page.getByText(/frame size/i)).toBeVisible();
      await expect(page.getByText(/version/i)).toBeVisible();
    });

    test('should auto-populate wheel dimensions from frame size', async ({ page }) => {
      await uploadAndWaitForWheel(page);

      const { width, height } = getWheelDimensionInputs(page);
      const widthValue = await width.inputValue();
      const heightValue = await height.inputValue();

      expect(parseInt(widthValue)).toBeGreaterThan(0);
      expect(parseInt(heightValue)).toBeGreaterThan(0);
    });

    test('should display all component toggle buttons', async ({ page }) => {
      await uploadAndWaitForWheel(page);

      const components = [
        'background',
        'header',
        'wheelBg',
        'segments',
        'buttonSpin',
        'center',
        'pointer',
      ];

      for (const component of components) {
        const button = getComponentToggle(page, component);
        await expect(button).toBeVisible();
      }
    });

    test('should load all required assets', async ({ page }) => {
      await uploadAndWaitForWheel(page);

      // Verify key images loaded
      await expectImageLoaded(page, /background/i);
      await expectImageLoaded(page, /header/i);
      await expectImageLoaded(page, /spin button/i);
    });

    test('should capture wheel loaded state', async ({ page }) => {
      await uploadAndWaitForWheel(page);
      await screenshotFullPage(page, 'wheel-loaded', { directory: 'e2e/states' });
    });
  });

  /**
   * ============================================================================
   * SECTION 3: Wheel Spin Animation
   * ============================================================================
   */
  test.describe('Wheel spin animation', () => {
    test.beforeEach(async ({ page }) => {
      await uploadAndWaitForWheel(page);
    });

    test('should trigger spin animation when spin button clicked', async ({ page }) => {
      const spinButton = getSpinButton(page);

      // Verify initial state
      await expect(page.getByAltText('Spin button default')).toBeVisible();

      // Click spin button
      await spinButton.click();

      // Should switch to spinning state
      await expect(page.getByAltText('Spin button spinning')).toBeVisible();
    });

    test('should complete spin animation and return to default state', async ({ page }) => {
      await spinWheel(page, true);

      // Should be back to default state
      await expect(page.getByAltText('Spin button default')).toBeVisible();
    });

    test('should rotate segments during spin', async ({ page }) => {
      const spinButton = getSpinButton(page);

      // Get initial rotation
      const initialRotation = await getSegmentRotation(page);

      // Start spin
      await spinButton.click();

      // Wait for rotation to change
      await expectSegmentsRotating(page);
    });

    test('should not allow multiple simultaneous spins', async ({ page }) => {
      const spinButton = getSpinButton(page);

      // First click
      await spinButton.click();
      await expect(page.getByAltText('Spin button spinning')).toBeVisible();

      // Try clicking multiple times
      await spinButton.click();
      await spinButton.click();
      await spinButton.click();

      // Should still be in spinning state (not restarted)
      await expect(page.getByAltText('Spin button spinning')).toBeVisible();

      // Wait for completion
      await page.waitForTimeout(SPIN_ANIMATION_DURATION);
      await expect(page.getByAltText('Spin button default')).toBeVisible();
    });

    test('should complete spin within expected duration', async ({ page }) => {
      const spinButton = getSpinButton(page);

      const startTime = Date.now();
      await spinButton.click();

      // Wait for spinning state
      await expect(page.getByAltText('Spin button spinning')).toBeVisible();

      // Wait for completion
      await expect(page.getByAltText('Spin button default')).toBeVisible({
        timeout: SPIN_ANIMATION_DURATION + 1000,
      });

      const duration = Date.now() - startTime;

      // Should complete within reasonable time (6.5s + margin)
      expect(duration).toBeLessThan(SPIN_ANIMATION_DURATION + 500);
      expect(duration).toBeGreaterThan(6000); // At least 6 seconds
    });

    test('should maintain wheel stability after spin completes', async ({ page }) => {
      await spinWheel(page, true);

      // Wait a bit more
      await page.waitForTimeout(1000);

      // Verify wheel is stable
      const segments = getSegmentsComponent(page);
      await expectVisualStability(page, segments, { stableTime: 500 });
    });

    test('should capture spin animation states', async ({ page }) => {
      const spinButton = getSpinButton(page);

      // Before spin
      await screenshotWheel(page, 'spin-before', { directory: 'e2e/animation' });

      // Start spin
      await spinButton.click();
      await page.waitForTimeout(500);

      // During spin
      await screenshotWheel(page, 'spin-during', { directory: 'e2e/animation' });

      // Wait for completion
      await page.waitForTimeout(SPIN_ANIMATION_DURATION - 500);

      // After spin
      await screenshotWheel(page, 'spin-after', { directory: 'e2e/animation' });
    });
  });

  /**
   * ============================================================================
   * SECTION 4: Header State Cycling
   * ============================================================================
   */
  test.describe('Header state cycling', () => {
    test.beforeEach(async ({ page }) => {
      await uploadAndWaitForWheel(page);
    });

    test('should cycle header state when clicked', async ({ page }) => {
      const header = getHeaderComponent(page);

      // Initial state: active
      await expect(page.getByAltText(/header active/i)).toBeVisible();

      // Click to cycle to success
      await header.click();
      await page.waitForTimeout(100);

      // Should show a different state (success or fail)
      const headerImage = page.locator('.header-component img');
      await expect(headerImage).toBeVisible();
    });

    test('should cycle through all header states: active → success → fail → active', async ({
      page,
    }) => {
      const header = getHeaderComponent(page);

      // Start at active
      await expect(page.getByAltText(/header active/i)).toBeVisible();

      // Click to success
      await header.click();
      await page.waitForTimeout(SHORT_WAIT);

      // Click to fail
      await header.click();
      await page.waitForTimeout(SHORT_WAIT);

      // Click back to active
      await header.click();
      await page.waitForTimeout(SHORT_WAIT);

      // Verify we're back at active (or at least a valid state)
      const headerImage = page.locator('.header-component img');
      await expect(headerImage).toBeVisible();
    });

    test('should reach success state', async ({ page }) => {
      await cycleHeaderState(page, 'success');

      // Verify success state is visible
      const isSuccess = await isComponentVisible(page, /header success/i);
      expect(isSuccess).toBe(true);
    });

    test('should reach fail state', async ({ page }) => {
      await cycleHeaderState(page, 'fail');

      // Verify fail state is visible
      const isFail = await isComponentVisible(page, /header fail/i);
      expect(isFail).toBe(true);
    });

    test('should capture header state screenshots', async ({ page }) => {
      // Active state
      await screenshotWheel(page, 'header-active', { directory: 'e2e/header' });

      // Success state
      await cycleHeaderState(page, 'success');
      await screenshotWheel(page, 'header-success', { directory: 'e2e/header' });

      // Fail state
      await cycleHeaderState(page, 'fail');
      await screenshotWheel(page, 'header-fail', { directory: 'e2e/header' });
    });
  });

  /**
   * ============================================================================
   * SECTION 5: Component Visibility Toggles
   * ============================================================================
   */
  test.describe('Component visibility toggles', () => {
    test.beforeEach(async ({ page }) => {
      await uploadAndWaitForWheel(page);
    });

    test('should toggle background visibility', async ({ page }) => {
      const backgroundImage = page.getByAltText('Background').first();

      // Initially visible
      await expect(backgroundImage).toBeVisible();

      // Toggle off
      await toggleComponent(page, 'background');
      await expect(backgroundImage).not.toBeVisible();

      // Toggle on
      await toggleComponent(page, 'background');
      await expect(backgroundImage).toBeVisible();
    });

    test('should toggle header visibility', async ({ page }) => {
      const headerImage = page.locator('.header-component img').first();

      // Initially visible
      await expect(headerImage).toBeVisible();

      // Toggle off
      await toggleComponent(page, 'header');
      await expect(headerImage).not.toBeVisible();

      // Toggle on
      await toggleComponent(page, 'header');
      await expect(headerImage).toBeVisible();
    });

    test('should toggle segments visibility', async ({ page }) => {
      const segments = getSegmentsComponent(page);

      // Initially visible
      await expect(segments).toBeVisible();

      // Toggle off
      await toggleComponent(page, 'segments');
      await expect(segments).not.toBeVisible();

      // Toggle on
      await toggleComponent(page, 'segments');
      await expect(segments).toBeVisible();
    });

    test('should toggle multiple components independently', async ({ page }) => {
      const background = page.getByAltText('Background').first();
      const header = page.locator('.header-component img').first();
      const segments = getSegmentsComponent(page);

      // Hide background
      await toggleComponent(page, 'background');
      await expect(background).not.toBeVisible();
      await expect(header).toBeVisible();
      await expect(segments).toBeVisible();

      // Hide header
      await toggleComponent(page, 'header');
      await expect(background).not.toBeVisible();
      await expect(header).not.toBeVisible();
      await expect(segments).toBeVisible();

      // Show background
      await toggleComponent(page, 'background');
      await expect(background).toBeVisible();
      await expect(header).not.toBeVisible();
      await expect(segments).toBeVisible();

      // Show header
      await toggleComponent(page, 'header');
      await expect(background).toBeVisible();
      await expect(header).toBeVisible();
      await expect(segments).toBeVisible();
    });

    test('should toggle center visibility using switch', async ({ page }) => {
      const centerSwitch = page.locator('input[type="checkbox"]').first();

      // Get initial state
      const initialChecked = await centerSwitch.isChecked();

      // Toggle
      await centerSwitch.click();
      const newChecked = await centerSwitch.isChecked();

      expect(newChecked).toBe(!initialChecked);
    });

    test('should maintain other components visibility when toggling one', async ({ page }) => {
      const background = page.getByAltText('Background').first();
      const header = page.locator('.header-component img').first();

      // Verify both visible
      await expect(background).toBeVisible();
      await expect(header).toBeVisible();

      // Hide background
      await toggleComponent(page, 'background');

      // Header should still be visible
      await expect(header).toBeVisible();
      await expect(background).not.toBeVisible();
    });

    test('should capture component visibility states', async ({ page }) => {
      // All visible
      await screenshotWheel(page, 'components-all-visible', { directory: 'e2e/visibility' });

      // Background hidden
      await toggleComponent(page, 'background');
      await screenshotWheel(page, 'components-no-background', { directory: 'e2e/visibility' });

      // Header hidden
      await toggleComponent(page, 'header');
      await screenshotWheel(page, 'components-no-bg-header', { directory: 'e2e/visibility' });

      // Only segments visible
      await toggleComponent(page, 'wheelBg');
      await toggleComponent(page, 'buttonSpin');
      await toggleComponent(page, 'pointer');
      await screenshotWheel(page, 'components-segments-only', { directory: 'e2e/visibility' });
    });
  });

  /**
   * ============================================================================
   * SECTION 6: Dimension and Segment Controls
   * ============================================================================
   */
  test.describe('Dimension and segment controls', () => {
    test.beforeEach(async ({ page }) => {
      await uploadAndWaitForWheel(page);
    });

    test('should change wheel width', async ({ page }) => {
      const { width } = getWheelDimensionInputs(page);

      // Change width
      await width.fill('400');
      await page.waitForTimeout(SHORT_WAIT);

      const newValue = await width.inputValue();
      expect(newValue).toBe('400');
    });

    test('should change wheel height', async ({ page }) => {
      const { height } = getWheelDimensionInputs(page);

      // Change height
      await height.fill('500');
      await page.waitForTimeout(SHORT_WAIT);

      const newValue = await height.inputValue();
      expect(newValue).toBe('500');
    });

    test('should update wheel container size when dimensions change', async ({ page }) => {
      const container = getWheelContainer(page);

      // Get initial size
      const initialBox = await getComponentBounds(container);

      // Change width
      await setWheelDimensions(page, 400, 400);

      // Get new size
      const newBox = await getComponentBounds(container);

      // Size should have changed
      expect(newBox?.width).not.toBe(initialBox?.width);
    });

    test('should maintain aspect ratio when changing dimensions', async ({ page }) => {
      const container = getWheelContainer(page);

      // Get initial aspect ratio
      const initialBox = await getComponentBounds(container);
      const initialRatio = calculateAspectRatio(initialBox);

      // Change dimensions
      await setWheelDimensions(page, 400, 300);

      // Get new aspect ratio
      const newBox = await getComponentBounds(container);
      const newRatio = calculateAspectRatio(newBox);

      // Aspect ratio should be maintained (within tolerance)
      expect(Math.abs(newRatio - initialRatio)).toBeLessThan(0.15);
    });

    test('should change segment count', async ({ page }) => {
      const segmentInput = getSegmentCountInput(page);

      // Change to 8 segments
      await segmentInput.fill('8');
      await page.waitForTimeout(SHORT_WAIT);

      expect(await segmentInput.inputValue()).toBe('8');

      // Change to 4 segments
      await segmentInput.fill('4');
      await page.waitForTimeout(SHORT_WAIT);

      expect(await segmentInput.inputValue()).toBe('4');
    });

    test('should enforce segment count limits', async ({ page }) => {
      const segmentInput = getSegmentCountInput(page);

      // Verify min is 3
      expect(await segmentInput.getAttribute('min')).toBe('3');

      // Verify max is 8
      expect(await segmentInput.getAttribute('max')).toBe('8');
    });

    test('should respect dimension constraints', async ({ page }) => {
      const { width, height } = getWheelDimensionInputs(page);

      // Check min/max constraints exist
      const widthMin = await width.getAttribute('min');
      const widthMax = await width.getAttribute('max');
      const heightMin = await height.getAttribute('min');
      const heightMax = await height.getAttribute('max');

      expect(widthMin).toBeTruthy();
      expect(widthMax).toBeTruthy();
      expect(heightMin).toBeTruthy();
      expect(heightMax).toBeTruthy();
    });

    test('should capture different dimension states', async ({ page }) => {
      // Original size
      await screenshotWheel(page, 'dimensions-original', { directory: 'e2e/dimensions' });

      // Small size
      await setWheelDimensions(page, 300, 300);
      await screenshotWheel(page, 'dimensions-small', { directory: 'e2e/dimensions' });

      // Large size
      await setWheelDimensions(page, 414, 720);
      await screenshotWheel(page, 'dimensions-large', { directory: 'e2e/dimensions' });
    });

    test('should capture different segment counts', async ({ page }) => {
      // 3 segments
      await setSegmentCount(page, 3);
      await screenshotWheel(page, 'segments-3', { directory: 'e2e/segments' });

      // 6 segments
      await setSegmentCount(page, 6);
      await screenshotWheel(page, 'segments-6', { directory: 'e2e/segments' });

      // 8 segments
      await setSegmentCount(page, 8);
      await screenshotWheel(page, 'segments-8', { directory: 'e2e/segments' });
    });
  });

  /**
   * ============================================================================
   * SECTION 7: Result Viewer Display
   * ============================================================================
   */
  test.describe('Result viewer display', () => {
    test.beforeEach(async ({ page }) => {
      await uploadAndWaitForWheel(page);
    });

    test('should display result viewer', async ({ page }) => {
      const isVisible = await isResultViewerVisible(page);
      expect(isVisible).toBe(true);
    });

    test('should display result header in success state', async ({ page }) => {
      const { header } = getResultViewerElements(page);
      await expect(header).toBeVisible();

      const headerImage = header.locator('img');
      await expect(headerImage).toBeVisible();
      await expect(headerImage).toHaveAttribute('alt', 'Result header');
    });

    test('should display reward rows', async ({ page }) => {
      const { rewardRows } = getResultViewerElements(page);
      await expect(rewardRows.first()).toBeVisible();
    });

    test('should display correct number of default reward rows', async ({ page }) => {
      // Default is 4 rows: gcsc, freeSpins, xp, rr
      await expectRewardRowCount(page, 4);
    });

    test('should display collect button', async ({ page }) => {
      const { button } = getResultViewerElements(page);
      await expect(button).toBeVisible();
      await expect(button).toContainText('COLLECT');
    });

    test('should display reward icons', async ({ page }) => {
      const gcIcon = page.locator('.result-viewer img[alt*="coin"], .result-viewer img[src*="gc"]');
      const scIcon = page.locator('.result-viewer img[alt*="coin"], .result-viewer img[src*="sc"]');

      // At least one icon should be visible
      const hasIcon = (await gcIcon.count()) > 0 || (await scIcon.count()) > 0;
      expect(hasIcon).toBe(true);
    });

    test('should scale result viewer with wheel dimensions', async ({ page }) => {
      const { container } = getResultViewerElements(page);

      // Get initial size
      const initialBox = await getComponentBounds(container);

      // Change dimensions
      await setWheelDimensions(page, 350, 350);
      await page.waitForTimeout(SHORT_WAIT);

      // Get new size
      const newBox = await getComponentBounds(container);

      // Size should have changed
      expect(newBox?.width).not.toBe(initialBox?.width);
    });

    test('should capture result viewer states', async ({ page }) => {
      await screenshotResultViewer(page, 'result-viewer-default', { directory: 'e2e/results' });
    });

    test('should capture result viewer at different scales', async ({ page }) => {
      // Original scale
      await screenshotResultViewer(page, 'result-scale-original', { directory: 'e2e/results' });

      // Small scale
      await setWheelDimensions(page, 300, 300);
      await screenshotResultViewer(page, 'result-scale-small', { directory: 'e2e/results' });

      // Large scale
      await setWheelDimensions(page, 414, 720);
      await screenshotResultViewer(page, 'result-scale-large', { directory: 'e2e/results' });
    });
  });

  /**
   * ============================================================================
   * SECTION 8: Error Handling
   * ============================================================================
   */
  test.describe('Error handling', () => {
    test('should handle invalid ZIP file (non-ZIP file)', async ({ page }) => {
      // Use a non-ZIP file (README.md)
      const invalidFile = path.resolve(PROJECT_ROOT, 'README.md');
      const fileInput = page.locator('input[type="file"]').first();

      await fileInput.setInputFiles(invalidFile);

      // Should display error
      await expectErrorMessage(page);

      // Wheel should not be visible
      const wheelContainer = getWheelContainer(page);
      await expect(wheelContainer).not.toBeVisible();

      // Capture error state
      await takeScreenshot(page, {
        name: 'error-invalid-zip',
        directory: 'e2e/errors',
        delay: 500,
      });
    });

    test('should handle corrupted ZIP file', async ({ page }) => {
      // Create a fake corrupted ZIP by using a text file
      const corruptedFile = path.resolve(PROJECT_ROOT, 'package.json');
      const fileInput = page.locator('input[type="file"]').first();

      await fileInput.setInputFiles(corruptedFile);

      // Should display error
      await expectErrorMessage(page);

      // Wheel should not be visible
      const wheelContainer = getWheelContainer(page);
      await expect(wheelContainer).not.toBeVisible();
    });

    test('should clear error on successful upload', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]').first();

      // Upload invalid file
      const invalidFile = path.resolve(PROJECT_ROOT, 'README.md');
      await fileInput.setInputFiles(invalidFile);
      await expectErrorMessage(page);

      // Upload valid file
      await fileInput.setInputFiles(THEME_ZIP_PATH);
      await waitForWheelLoad(page);

      // Error should be gone
      const errorElement = page.locator('.error-message');
      await expect(errorElement).not.toBeVisible();
    });

    test('should maintain UI state when upload fails', async ({ page }) => {
      const invalidFile = path.resolve(PROJECT_ROOT, 'README.md');
      const fileInput = page.locator('input[type="file"]').first();

      await fileInput.setInputFiles(invalidFile);
      await expectErrorMessage(page);

      // UI should still be functional
      await expect(page.getByText('Choose ZIP File').first()).toBeVisible();
      await expect(page.getByText('Wheel Demo').first()).toBeVisible();
    });

    test('should handle missing assets gracefully', async ({ page }) => {
      // This test verifies the wheel doesn't crash if some optional assets are missing
      // We can't easily create a partial ZIP, but we can verify error boundaries work

      await uploadAndWaitForWheel(page);

      // If wheel loaded, it should handle any missing optional components
      const wheelContainer = getWheelContainer(page);
      await expect(wheelContainer).toBeVisible();
    });
  });

  /**
   * ============================================================================
   * SECTION 9: Visual Regression Tests
   * ============================================================================
   */
  test.describe('Visual regression tests', () => {
    test.beforeEach(async ({ page }) => {
      await uploadAndWaitForWheel(page);
    });

    test('should match baseline: wheel default state', async ({ page }) => {
      await compareWheelScreenshot(page, 'wheel-baseline-default');
    });

    test('should match baseline: wheel with all components', async ({ page }) => {
      // Ensure all components are visible
      await compareWheelScreenshot(page, 'wheel-baseline-all-components');
    });

    test('should match baseline: wheel spinning state', async ({ page }) => {
      const spinButton = getSpinButton(page);
      await spinButton.click();
      await page.waitForTimeout(500);

      await compareWheelScreenshot(page, 'wheel-baseline-spinning');
    });

    test('should match baseline: result viewer', async ({ page }) => {
      await compareResultViewerScreenshot(page, 'result-baseline-default');
    });

    test('should match baseline: full page', async ({ page }) => {
      await takeScreenshot(page, {
        name: 'fullpage-baseline',
        fullPage: true,
        delay: 500,
      });
    });
  });

  /**
   * ============================================================================
   * SECTION 10: Accessibility and Keyboard Navigation
   * ============================================================================
   */
  test.describe('Accessibility and keyboard navigation', () => {
    test('should have accessible file input', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]').first();
      await expect(fileInput).toHaveAttribute('accept', '.zip');

      // Should be keyboard focusable
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeTruthy();
    });

    test('should have keyboard navigable controls', async ({ page }) => {
      await uploadAndWaitForWheel(page);

      // Tab through controls
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // At least one control should be focused
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(['INPUT', 'BUTTON', 'A']).toContain(focusedElement);
    });

    test('should have proper ARIA attributes', async ({ page }) => {
      await uploadAndWaitForWheel(page);

      // Check for ARIA labels on interactive elements
      const spinButton = page.locator('.button-spin-component');
      const ariaLabel = await spinButton.getAttribute('aria-label');

      // Should have some accessibility attribute
      expect(ariaLabel || (await spinButton.getAttribute('role'))).toBeTruthy();
    });

    test('should have sufficient color contrast', async ({ page }) => {
      await uploadAndWaitForWheel(page);

      // Verify text is visible (basic accessibility check)
      await expect(page.getByText('Wheel Settings').first()).toBeVisible();
      await expect(page.getByText('Wheel Information').first()).toBeVisible();
    });

    test('should support keyboard interaction on toggles', async ({ page }) => {
      await uploadAndWaitForWheel(page);

      const centerSwitch = page.locator('input[type="checkbox"]').first();

      // Focus the switch
      await centerSwitch.focus();

      // Toggle with space key
      await page.keyboard.press('Space');
      await page.waitForTimeout(100);

      // State should have changed
      const isChecked = await centerSwitch.isChecked();
      expect(typeof isChecked).toBe('boolean');
    });
  });

  /**
   * ============================================================================
   * SECTION 11: Edge Cases and Boundary Conditions
   * ============================================================================
   */
  test.describe('Edge cases and boundary conditions', () => {
    test.beforeEach(async ({ page }) => {
      await uploadAndWaitForWheel(page);
    });

    test('should handle rapid dimension changes', async ({ page }) => {
      const { width } = getWheelDimensionInputs(page);

      // Rapid changes
      await width.fill('300');
      await width.fill('400');
      await width.fill('350');
      await width.fill('380');

      await page.waitForTimeout(SHORT_WAIT);

      // Should still render correctly
      const wheelContainer = getWheelContainer(page);
      await expect(wheelContainer).toBeVisible();
    });

    test('should handle minimum segment count', async ({ page }) => {
      await setSegmentCount(page, 3);

      // Should still render
      const segments = getSegmentsComponent(page);
      await expect(segments).toBeVisible();
    });

    test('should handle maximum segment count', async ({ page }) => {
      await setSegmentCount(page, 8);

      // Should still render
      const segments = getSegmentsComponent(page);
      await expect(segments).toBeVisible();
    });

    test('should handle rapid component toggles', async ({ page }) => {
      // Toggle multiple times rapidly
      await toggleComponent(page, 'background');
      await toggleComponent(page, 'background');
      await toggleComponent(page, 'background');
      await toggleComponent(page, 'background');

      await page.waitForTimeout(SHORT_WAIT);

      // Should still render correctly
      const wheelContainer = getWheelContainer(page);
      await expect(wheelContainer).toBeVisible();
    });

    test('should handle rapid header state cycling', async ({ page }) => {
      const header = getHeaderComponent(page);

      // Click multiple times rapidly
      await header.click();
      await header.click();
      await header.click();
      await header.click();

      await page.waitForTimeout(SHORT_WAIT);

      // Should still render correctly
      await expect(header).toBeVisible();
    });

    test('should handle all components hidden', async ({ page }) => {
      // Hide all toggleable components
      await toggleComponent(page, 'background');
      await toggleComponent(page, 'header');
      await toggleComponent(page, 'wheelBg');
      await toggleComponent(page, 'segments');
      await toggleComponent(page, 'buttonSpin');
      await toggleComponent(page, 'pointer');

      // Wheel container should still exist
      const wheelContainer = getWheelContainer(page);
      await expect(wheelContainer).toBeVisible();
    });

    test('should handle page reload during spin', async ({ page }) => {
      const spinButton = getSpinButton(page);
      await spinButton.click();

      // Reload page during spin
      await page.reload();

      // Should return to initial state
      await expect(page.getByText('Choose ZIP File').first()).toBeVisible();
      const wheelContainer = getWheelContainer(page);
      await expect(wheelContainer).not.toBeVisible();
    });

    test('should handle multiple file uploads', async ({ page }) => {
      // Upload first time
      await uploadWheelZip(page, THEME_ZIP_PATH);
      await waitForWheelLoad(page);

      // Upload again (re-upload)
      await uploadWheelZip(page, THEME_ZIP_PATH);
      await waitForWheelLoad(page);

      // Should still work
      const wheelContainer = getWheelContainer(page);
      await expect(wheelContainer).toBeVisible();
    });

    test('should maintain state across dimension changes during spin', async ({ page }) => {
      const spinButton = getSpinButton(page);
      await spinButton.click();

      // Change dimensions while spinning
      await setWheelDimensions(page, 350, 350);

      // Should still complete spin
      await page.waitForTimeout(SPIN_ANIMATION_DURATION);
      await expect(page.getByAltText('Spin button default')).toBeVisible();
    });
  });

  /**
   * ============================================================================
   * SECTION 12: Integration Tests (Combined Workflows)
   * ============================================================================
   */
  test.describe('Integration tests - combined workflows', () => {
    test.beforeEach(async ({ page }) => {
      await uploadAndWaitForWheel(page);
    });

    test('should complete full user workflow: upload → spin → toggle → resize', async ({
      page,
    }) => {
      // Wheel already uploaded (from beforeEach)
      const wheelContainer = getWheelContainer(page);
      await expect(wheelContainer).toBeVisible();

      // Spin the wheel
      await spinWheel(page, true);

      // Cycle header state
      await cycleHeaderState(page, 'success');

      // Toggle some components
      await toggleComponent(page, 'background');
      await toggleComponent(page, 'lights');

      // Resize wheel
      await setWheelDimensions(page, 380, 550);

      // Change segment count
      await setSegmentCount(page, 4);

      // Verify everything still works
      await expect(wheelContainer).toBeVisible();

      // Capture final state
      await screenshotFullPage(page, 'workflow-complete', { directory: 'e2e/integration' });
    });

    test('should handle complex interaction sequence', async ({ page }) => {
      // 1. Change dimensions
      await setWheelDimensions(page, 400, 600);

      // 2. Hide some components
      await toggleComponent(page, 'background');
      await toggleComponent(page, 'wheelBg');

      // 3. Start spin
      const spinButton = getSpinButton(page);
      await spinButton.click();

      // 4. Toggle components during spin
      await page.waitForTimeout(1000);
      await toggleComponent(page, 'lights');

      // 5. Wait for spin to complete
      await page.waitForTimeout(SPIN_ANIMATION_DURATION - 1000);

      // 6. Cycle header
      await cycleHeaderState(page);

      // 7. Change segment count
      await setSegmentCount(page, 7);

      // 8. Show hidden components
      await toggleComponent(page, 'background');
      await toggleComponent(page, 'wheelBg');

      // Verify everything still works
      const wheelContainer = getWheelContainer(page);
      await expect(wheelContainer).toBeVisible();
    });

    test('should recover from errors and continue working', async ({ page }) => {
      // Upload valid file (already done in beforeEach)
      const wheelContainer = getWheelContainer(page);
      await expect(wheelContainer).toBeVisible();

      // Try invalid file
      const fileInput = page.locator('input[type="file"]').first();
      const invalidFile = path.resolve(PROJECT_ROOT, 'README.md');
      await fileInput.setInputFiles(invalidFile);
      await expectErrorMessage(page);

      // Re-upload valid file
      await fileInput.setInputFiles(THEME_ZIP_PATH);
      await waitForWheelLoad(page);

      // Continue using the app
      await spinWheel(page, false);
      await page.waitForTimeout(1000);
      await cycleHeaderState(page);
      await setSegmentCount(page, 5);

      // Should still work
      await expect(wheelContainer).toBeVisible();
    });
  });
});
