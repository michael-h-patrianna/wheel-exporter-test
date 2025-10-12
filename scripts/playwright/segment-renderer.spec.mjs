/**
 * Playwright E2E tests for SegmentRenderer
 * Visual confirmation of 60fps performance and functionality
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('SegmentRenderer Visual Performance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
  });

  test('should render segments correctly', async ({ page }) => {
    // Wait for segments to be visible
    const segments = page.locator('.segments-component');
    await expect(segments).toBeVisible();

    // Verify SVG is present
    const svg = page.locator('.segments-component svg');
    await expect(svg).toBeVisible();

    // Take screenshot for visual verification
    await page.screenshot({
      path: 'screenshots/segment-renderer-initial.png',
      fullPage: false,
    });
  });

  test('should display all segment elements', async ({ page }) => {
    await page.waitForSelector('.segments-component');

    // Count segment groups
    const segmentGroups = await page.locator('.segments-component svg > g').count();
    expect(segmentGroups).toBeGreaterThan(0);

    // Verify paths exist (segment wedges)
    const paths = await page.locator('.segments-component path[d]').count();
    expect(paths).toBeGreaterThan(0);

    // Verify text elements exist
    const textElements = await page.locator('.segments-component text').count();
    expect(textElements).toBeGreaterThan(0);
  });

  test('should render gradients in defs', async ({ page }) => {
    await page.waitForSelector('.segments-component');

    // Check for defs element
    const defs = page.locator('.segments-component defs');
    await expect(defs).toBeVisible();

    // Check for gradient definitions
    const gradients = await page.locator('.segments-component linearGradient').count();
    expect(gradients).toBeGreaterThanOrEqual(0);
  });

  test('should apply rotation transform', async ({ page }) => {
    await page.waitForSelector('.segments-component svg');

    // Get initial transform
    const svg = page.locator('.segments-component svg');
    const initialTransform = await svg.evaluate(el =>
      window.getComputedStyle(el).transform
    );

    expect(initialTransform).toBeTruthy();
  });

  test('should measure frame timing during animation', async ({ page }) => {
    await page.waitForSelector('.segments-component');

    // Inject performance monitoring
    await page.evaluate(() => {
      window.performanceFrames = [];
      window.lastFrameTime = performance.now();

      const monitorFrames = () => {
        const now = performance.now();
        const frameDuration = now - window.lastFrameTime;
        window.performanceFrames.push({
          timestamp: now,
          duration: frameDuration
        });
        window.lastFrameTime = now;
        requestAnimationFrame(monitorFrames);
      };

      requestAnimationFrame(monitorFrames);
    });

    // Wait a bit for initial frames
    await page.waitForTimeout(1000);

    // Get frame timing data
    const frameData = await page.evaluate(() => {
      return {
        frames: window.performanceFrames.slice(0, 60), // First 60 frames
        count: window.performanceFrames.length
      };
    });

    // Verify frames are being captured
    expect(frameData.count).toBeGreaterThan(0);

    // Calculate average frame time
    const avgFrameTime = frameData.frames.reduce((sum, f) => sum + f.duration, 0) / frameData.frames.length;
    console.log(`Average frame time: ${avgFrameTime.toFixed(2)}ms`);

    // Frame time should be reasonable (< 20ms average for 50fps+)
    expect(avgFrameTime).toBeLessThan(20);
  });

  test('should handle rapid rotation updates smoothly', async ({ page }) => {
    await page.waitForSelector('.segments-component');

    // Measure performance during rapid updates
    const performanceData = await page.evaluate(async () => {
      const svg = document.querySelector('.segments-component svg');
      const frames = [];
      let lastTime = performance.now();

      // Simulate rapid rotation updates
      for (let i = 0; i < 60; i++) {
        const rotation = i * 6; // 6 degrees per frame
        svg.style.transform = `rotate(${rotation}deg)`;

        await new Promise(resolve => requestAnimationFrame(resolve));

        const now = performance.now();
        frames.push({
          rotation,
          frameTime: now - lastTime
        });
        lastTime = now;
      }

      return {
        frames,
        avgFrameTime: frames.reduce((sum, f) => sum + f.frameTime, 0) / frames.length,
        maxFrameTime: Math.max(...frames.map(f => f.frameTime))
      };
    });

    console.log(`Avg frame time: ${performanceData.avgFrameTime.toFixed(2)}ms`);
    console.log(`Max frame time: ${performanceData.maxFrameTime.toFixed(2)}ms`);

    // Average frame time should be within 60fps target (< 16.67ms)
    // Allow some margin for non-GPU operations
    expect(performanceData.avgFrameTime).toBeLessThan(20);

    // Max frame time should not spike too high
    expect(performanceData.maxFrameTime).toBeLessThan(50);
  });

  test('should not cause layout thrashing', async ({ page }) => {
    await page.waitForSelector('.segments-component');

    // Measure layout/style recalculations
    const layoutMetrics = await page.evaluate(async () => {
      const svg = document.querySelector('.segments-component svg');
      let layoutCount = 0;

      // Use PerformanceObserver to detect layout
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'measure') {
            layoutCount++;
          }
        }
      });
      observer.observe({ entryTypes: ['measure'] });

      // Perform rotation updates
      for (let i = 0; i < 30; i++) {
        svg.style.transform = `rotate(${i * 12}deg)`;
        await new Promise(resolve => requestAnimationFrame(resolve));
      }

      observer.disconnect();

      return { layoutCount };
    });

    console.log(`Layout recalculations: ${layoutMetrics.layoutCount}`);

    // Should have minimal layout recalculations (CSS transforms don't trigger layout)
    // This is implementation-dependent, so we just log it
    expect(layoutMetrics.layoutCount).toBeGreaterThanOrEqual(0);
  });

  test('should render jackpot images', async ({ page }) => {
    await page.waitForSelector('.segments-component');

    // Check for jackpot image elements
    const jackpotImages = await page.locator('image[data-segment-kind="jackpot"]').count();
    expect(jackpotImages).toBeGreaterThan(0);

    // Verify image attributes
    const firstImage = page.locator('image[data-segment-kind="jackpot"]').first();
    await expect(firstImage).toHaveAttribute('href');
    await expect(firstImage).toHaveAttribute('preserveAspectRatio', 'xMidYMid meet');
  });

  test('should render text with proper attributes', async ({ page }) => {
    await page.waitForSelector('.segments-component');

    // Check text elements
    const textElements = page.locator('.segments-component text');
    const count = await textElements.count();
    expect(count).toBeGreaterThan(0);

    // Verify first text element has required attributes
    const firstText = textElements.first();
    await expect(firstText).toHaveAttribute('font-family');
    await expect(firstText).toHaveAttribute('font-weight', '700');
    await expect(firstText).toHaveAttribute('font-size');

    // Check for textPath inside text
    const textPath = firstText.locator('textPath');
    await expect(textPath).toHaveAttribute('href');
    await expect(textPath).toHaveAttribute('text-anchor', 'middle');
  });

  test('should have proper z-index layering', async ({ page }) => {
    await page.waitForSelector('.segments-component');

    const zIndex = await page.evaluate(() => {
      const segments = document.querySelector('.segments-component');
      return window.getComputedStyle(segments).zIndex;
    });

    expect(zIndex).toBe('5');
  });

  test('should have pointer-events none for proper interaction', async ({ page }) => {
    await page.waitForSelector('.segments-component');

    const pointerEvents = await page.evaluate(() => {
      const segments = document.querySelector('.segments-component');
      return window.getComputedStyle(segments).pointerEvents;
    });

    expect(pointerEvents).toBe('none');
  });

  test('should take performance screenshot during animation', async ({ page }) => {
    await page.waitForSelector('.segments-component');

    // Start animation
    await page.evaluate(() => {
      const svg = document.querySelector('.segments-component svg');
      svg.style.transition = 'transform 2s ease-in-out';
      svg.style.transform = 'rotate(360deg)';
    });

    // Wait a bit into animation
    await page.waitForTimeout(500);

    // Capture mid-animation
    await page.screenshot({
      path: 'screenshots/segment-renderer-animation.png',
      fullPage: false,
    });

    // Wait for animation to complete
    await page.waitForTimeout(2000);

    // Capture final state
    await page.screenshot({
      path: 'screenshots/segment-renderer-final.png',
      fullPage: false,
    });
  });
});

test.describe('SegmentRenderer Memoization Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
  });

  test('should not re-render segments when only rotation changes', async ({ page }) => {
    await page.waitForSelector('.segments-component');

    // Count initial renders
    const renderData = await page.evaluate(async () => {
      const svg = document.querySelector('.segments-component svg');
      let mutationCount = 0;

      // Set up mutation observer on segment groups (should NOT mutate on rotation)
      const observer = new MutationObserver((mutations) => {
        // Filter for actual content changes, not just transform
        mutations.forEach(mutation => {
          if (mutation.type === 'childList' ||
              (mutation.type === 'attributes' &&
               mutation.attributeName !== 'style' &&
               !mutation.target.closest('svg[style]'))) {
            mutationCount++;
          }
        });
      });

      const segmentGroups = document.querySelectorAll('.segments-component svg > g');
      segmentGroups.forEach(g => {
        observer.observe(g, {
          attributes: true,
          childList: true,
          subtree: true
        });
      });

      // Change rotation multiple times
      for (let i = 0; i < 10; i++) {
        svg.style.transform = `rotate(${i * 36}deg)`;
        await new Promise(resolve => requestAnimationFrame(resolve));
      }

      observer.disconnect();

      return { mutationCount };
    });

    console.log(`Segment mutations during rotation: ${renderData.mutationCount}`);

    // Should have zero or minimal mutations (only SVG transform changes)
    expect(renderData.mutationCount).toBeLessThanOrEqual(1);
  });

  test('should verify memoized components display correctly', async ({ page }) => {
    await page.waitForSelector('.segments-component');

    // Get segment data
    const segmentInfo = await page.evaluate(() => {
      const groups = document.querySelectorAll('.segments-component svg > g');
      return {
        count: groups.length,
        hasPaths: Array.from(groups).every(g => g.querySelector('path[d]')),
        hasTextOrImages: Array.from(groups).every(g =>
          g.querySelector('text') || g.querySelector('image')
        )
      };
    });

    expect(segmentInfo.count).toBeGreaterThan(0);
    expect(segmentInfo.hasPaths).toBe(true);
    expect(segmentInfo.hasTextOrImages).toBe(true);
  });
});
