/**
 * Browser test for consecutive spins - verifies the drift bug fix
 * Tests that spinning multiple times in a row lands at the correct position each time
 */

import { chromium } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';

async function testConsecutiveSpins() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Navigate to the app
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('\n=== TESTING CONSECUTIVE SPINS ===\n');

    // Set up: 6 segments
    console.log('Setting up 6-segment wheel...');
    await page.evaluate(() => {
      const segmentInput = document.querySelector('input[type="number"]');
      if (segmentInput) {
        segmentInput.value = '6';
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

    // Function to calculate expected segment position
    function calculateSegmentPosition(segmentIndex, segmentCount, wheelRotation) {
      const segmentAngle = 360 / segmentCount;
      const segmentCenterAngle = segmentIndex * segmentAngle + segmentAngle / 2 - 90;
      return ((segmentCenterAngle + wheelRotation) % 360 + 360) % 360;
    }

    function normalizeAngle(angle) {
      return ((angle % 360) + 360) % 360;
    }

    function anglesEqual(angle1, angle2, tolerance = 2) {
      const normalized1 = normalizeAngle(angle1);
      const normalized2 = normalizeAngle(angle2);
      const diff = Math.abs(normalized1 - normalized2);
      return Math.min(diff, 360 - diff) <= tolerance;
    }

    // Perform 5 consecutive spins
    const spinCount = 5;
    const results = [];

    for (let i = 0; i < spinCount; i++) {
      console.log(`\n--- SPIN ${i + 1} ---`);

      // Click spin button
      const spinButton = page.locator('button:has-text("SPIN")');
      await spinButton.click();

      // Wait for spin to complete (8 seconds + buffer)
      await page.waitForTimeout(9000);

      // Get final state
      const spinResult = await page.evaluate(() => {
        const svg = document.querySelector('svg[data-component="wheel-segments"]');
        if (!svg) return null;

        const transformStyle = svg.style.transform;
        let rotation = 0;
        if (transformStyle && transformStyle.includes('rotate')) {
          const match = transformStyle.match(/rotate\(([^)]+)deg\)/);
          if (match) {
            rotation = parseFloat(match[1]);
          }
        }

        return {
          rotation,
          normalizedRotation: ((rotation % 360) + 360) % 360,
        };
      });

      if (!spinResult) {
        console.error(`ERROR: Could not get spin result for spin ${i + 1}`);
        break;
      }

      console.log(`  Final rotation: ${spinResult.rotation.toFixed(2)}°`);
      console.log(`  Normalized: ${spinResult.normalizedRotation.toFixed(2)}°`);

      // Check each segment position
      console.log('  Checking segment positions:');
      const segmentCount = 6;
      let closestSegment = null;
      let minDistance = Infinity;

      for (let seg = 0; seg < segmentCount; seg++) {
        const segmentPosition = calculateSegmentPosition(seg, segmentCount, spinResult.rotation);
        const distanceToPointer = Math.min(
          Math.abs(segmentPosition - 270), // -90° normalized = 270°
          360 - Math.abs(segmentPosition - 270)
        );

        console.log(`    Segment ${seg}: at ${segmentPosition.toFixed(2)}° (distance from pointer: ${distanceToPointer.toFixed(2)}°)`);

        if (distanceToPointer < minDistance) {
          minDistance = distanceToPointer;
          closestSegment = seg;
        }
      }

      const isAligned = anglesEqual(calculateSegmentPosition(closestSegment, segmentCount, spinResult.rotation), 270, 3);

      console.log(`  Closest segment: ${closestSegment} (distance: ${minDistance.toFixed(2)}°)`);
      console.log(`  Aligned correctly: ${isAligned ? '✓ YES' : '✗ NO'}`);

      results.push({
        spinNumber: i + 1,
        rotation: spinResult.rotation,
        normalizedRotation: spinResult.normalizedRotation,
        closestSegment,
        distanceFromPointer: minDistance,
        isAligned,
      });
    }

    // Summary
    console.log('\n=== SUMMARY ===\n');
    const allAligned = results.every(r => r.isAligned);
    const maxDeviation = Math.max(...results.map(r => r.distanceFromPointer));

    results.forEach(r => {
      console.log(`Spin ${r.spinNumber}: rotation=${r.rotation.toFixed(2)}°, segment=${r.closestSegment}, deviation=${r.distanceFromPointer.toFixed(2)}° ${r.isAligned ? '✓' : '✗'}`);
    });

    console.log(`\nMax deviation: ${maxDeviation.toFixed(2)}°`);
    console.log(`All spins aligned: ${allAligned ? '✓ YES' : '✗ NO'}`);

    if (allAligned) {
      console.log('\n✓ SUCCESS: All consecutive spins landed correctly!');
    } else {
      console.log('\n✗ FAILURE: Some spins did not land correctly!');
    }

    // Take screenshot
    const screenshotDir = path.join(process.cwd(), 'screenshots', 'consecutive-spins');
    await fs.mkdir(screenshotDir, { recursive: true });
    const screenshotPath = path.join(screenshotDir, 'final-position.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`\nScreenshot saved to: ${screenshotPath}`);

    console.log('\nWaiting 5 seconds for manual inspection...');
    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('Error during consecutive spin test:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
testConsecutiveSpins().catch(console.error);
