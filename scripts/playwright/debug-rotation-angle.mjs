/**
 * Debug script to visualize actual wheel rotation behavior
 * This will help us understand the coordinate system
 */

import { chromium } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';

async function debugRotation() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Navigate to the app
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('\n=== DEBUGGING WHEEL ROTATION COORDINATE SYSTEM ===\n');

    // Test case 1: 3 segments, winning segment 0
    console.log('TEST CASE 1: 3 segments, winning segment index 0');
    console.log('Expected behavior: Segment 0 should end at pointer position\n');

    // Set up test configuration
    await page.evaluate(() => {
      // Find the segment count input and set it to 3
      const segmentInput = document.querySelector('input[type="number"]');
      if (segmentInput) {
        segmentInput.value = '3';
        segmentInput.dispatchEvent(new Event('input', { bubbles: true }));
        segmentInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    await page.waitForTimeout(500);

    // Generate prize table
    const generateButton = page.locator('button:has-text("Generate Prize Table")');
    if (await generateButton.count() > 0) {
      await generateButton.click();
      await page.waitForTimeout(1000);
    }

    // Get initial state
    const initialState = await page.evaluate(() => {
      const svg = document.querySelector('svg[data-component="wheel-segments"]');
      if (!svg) return null;

      const transform = window.getComputedStyle(svg).transform;

      // Get all segment paths
      const paths = Array.from(document.querySelectorAll('path[d]'));

      return {
        svgTransform: transform,
        segmentCount: paths.length,
        wheelState: svg.dataset.wheelState || 'unknown'
      };
    });

    console.log('Initial State:', initialState);

    // Click spin button
    console.log('\nClicking SPIN button...');
    const spinButton = page.locator('button:has-text("SPIN")');
    await spinButton.click();

    // Wait for spin to complete (8 seconds + buffer)
    await page.waitForTimeout(9000);

    // Get final state
    const finalState = await page.evaluate(() => {
      const svg = document.querySelector('svg[data-component="wheel-segments"]');
      if (!svg) return null;

      const transform = window.getComputedStyle(svg).transform;
      const transformStyle = svg.style.transform;

      // Parse rotation from transform
      let rotation = 0;
      if (transformStyle && transformStyle.includes('rotate')) {
        const match = transformStyle.match(/rotate\(([^)]+)deg\)/);
        if (match) {
          rotation = parseFloat(match[1]);
        }
      }

      // Get pointer position
      const pointer = document.querySelector('.pointer-component');
      let pointerInfo = null;
      if (pointer) {
        const rect = pointer.getBoundingClientRect();
        const style = window.getComputedStyle(pointer);
        pointerInfo = {
          left: style.left,
          top: style.top,
          width: rect.width,
          height: rect.height,
          centerX: rect.left + rect.width / 2,
          centerY: rect.top + rect.height / 2
        };
      }

      // Get wheel center
      const centerElement = document.querySelector('.center-component') ||
                           document.querySelector('svg[data-component="wheel-segments"]');
      let centerInfo = null;
      if (centerElement) {
        const rect = centerElement.getBoundingClientRect();
        centerInfo = {
          centerX: rect.left + rect.width / 2,
          centerY: rect.top + rect.height / 2
        };
      }

      return {
        computedTransform: transform,
        styleTransform: transformStyle,
        finalRotation: rotation,
        normalizedRotation: ((rotation % 360) + 360) % 360,
        pointerInfo,
        centerInfo,
        wheelState: svg.dataset.wheelState || 'unknown'
      };
    });

    console.log('\nFinal State after spin:');
    if (!finalState) {
      console.log('  ERROR: Could not find wheel SVG element!');
      console.log('  Checking what elements are available...');
      const available = await page.evaluate(() => {
        return {
          allSvgs: document.querySelectorAll('svg').length,
          wheelContainer: !!document.querySelector('.wheel-container'),
          wheelViewer: !!document.querySelector('.wheel-viewer'),
          segmentRenderer: !!document.querySelector('svg'),
        };
      });
      console.log('  Available elements:', available);
      return;
    }
    console.log('  Rotation:', finalState.finalRotation, 'degrees');
    console.log('  Normalized:', finalState.normalizedRotation, 'degrees');
    console.log('  Wheel State:', finalState.wheelState);
    console.log('  Pointer:', finalState.pointerInfo);
    console.log('  Center:', finalState.centerInfo);

    // Calculate angle from center to pointer
    if (finalState.pointerInfo && finalState.centerInfo) {
      const dx = finalState.pointerInfo.centerX - finalState.centerInfo.centerX;
      const dy = finalState.pointerInfo.centerY - finalState.centerInfo.centerY;
      const angleRad = Math.atan2(dy, dx);
      const angleDeg = (angleRad * 180 / Math.PI + 360) % 360;

      console.log('\n  Calculated pointer angle from center:');
      console.log('    dx:', dx.toFixed(2), 'dy:', dy.toFixed(2));
      console.log('    Angle (0° = right, 90° = down):', angleDeg.toFixed(2), 'degrees');

      // Convert to wheel coordinate system (0° = top)
      const wheelAngle = (angleDeg - 90 + 360) % 360;
      console.log('    Angle (0° = top):', wheelAngle.toFixed(2), 'degrees');
    }

    // Now calculate which segment should be at the pointer
    const segmentAngle = 360 / 3;
    console.log('\n  Segment angle:', segmentAngle, 'degrees');
    console.log('  Segment 0 center (before rotation):', (0 * segmentAngle + segmentAngle / 2 - 90), 'degrees');
    console.log('  Segment 0 center (after rotation):',
      ((0 * segmentAngle + segmentAngle / 2 - 90 + finalState.finalRotation) % 360 + 360) % 360,
      'degrees');

    console.log('\n  Segment 1 center (before rotation):', (1 * segmentAngle + segmentAngle / 2 - 90), 'degrees');
    console.log('  Segment 1 center (after rotation):',
      ((1 * segmentAngle + segmentAngle / 2 - 90 + finalState.finalRotation) % 360 + 360) % 360,
      'degrees');

    console.log('\n  Segment 2 center (before rotation):', (2 * segmentAngle + segmentAngle / 2 - 90), 'degrees');
    console.log('  Segment 2 center (after rotation):',
      ((2 * segmentAngle + segmentAngle / 2 - 90 + finalState.finalRotation) % 360 + 360) % 360,
      'degrees');

    // Take a screenshot
    const screenshotDir = path.join(process.cwd(), 'screenshots', 'rotation-debug');
    await fs.mkdir(screenshotDir, { recursive: true });
    const screenshotPath = path.join(screenshotDir, 'final-position.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log('\n  Screenshot saved to:', screenshotPath);

    console.log('\n=== WAITING 10 seconds for manual inspection ===');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('Error during rotation debug:', error);
  } finally {
    await browser.close();
  }
}

// Run the debug
debugRotation().catch(console.error);
