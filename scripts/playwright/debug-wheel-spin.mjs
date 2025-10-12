/**
 * Debug test to investigate wheel spinning bug
 *
 * Expected behavior:
 * 1. Wheel spins and overshoots target segment
 * 2. Wheel bounces back to settle at center of target segment
 * 3. Spin button becomes clickable again
 *
 * Reported bug:
 * - Wheel overshoots but gets stuck
 * - State never changes, spin button stays disabled
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const themeZipPath = path.join(__dirname, '../../docs/theme.zip');

async function debugWheelSpin() {
  console.log('🔍 Starting wheel spin debug test...\n');

  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to app
    console.log('📱 Navigating to app...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Upload theme
    console.log('📦 Uploading theme.zip...');
    const fileInput = await page.locator('input[type="file"]');
    await fileInput.setInputFiles(themeZipPath);
    await page.waitForTimeout(3000);

    // Log initial state
    console.log('\n📊 Initial State:');
    // Find the actual spin button (button element with class button-spin-component)
    const spinButton = await page.locator('button.button-spin-component');
    const isDisabled = await spinButton.evaluate(el => el.disabled || el.getAttribute('disabled') !== null);
    console.log(`  - Spin button disabled: ${isDisabled}`);

    // Get initial rotation - target the SVG inside segments-component
    const segmentSVG = await page.locator('.segments-component svg').first();
    const initialTransform = await segmentSVG.evaluate(el => {
      const transform = window.getComputedStyle(el).transform;
      return transform;
    });
    console.log(`  - Initial transform: ${initialTransform}`);

    // Click spin button
    console.log('\n🎯 Clicking spin button...');

    // Check if button is actually clickable
    const buttonClass = await spinButton.getAttribute('class');
    const buttonDisabledBefore = await spinButton.evaluate(el => el.disabled);
    console.log(`  - Button class: ${buttonClass}`);
    console.log(`  - Button disabled before click: ${buttonDisabledBefore}`);

    await spinButton.click();
    console.log('  - Click executed');
    await page.waitForTimeout(500);

    const buttonDisabledAfter = await spinButton.evaluate(el => el.disabled);
    console.log(`  - Button disabled after click: ${buttonDisabledAfter}`);

    // Monitor state changes over time
    console.log('\n⏱️  Monitoring wheel state over 10 seconds:\n');

    for (let i = 0; i <= 10; i++) {
      await page.waitForTimeout(1000);

      // Check button state
      const buttonDisabled = await spinButton.evaluate(el =>
        el.disabled || el.getAttribute('disabled') !== null
      );

      // Check transform
      const currentTransform = await segmentSVG.evaluate(el => {
        return window.getComputedStyle(el).transform;
      });

      // Check transition property AND wheelState data attribute
      const { transition, wheelState, targetRot } = await page.evaluate(() => {
        const svg = document.querySelector('.segments-component svg');
        if (!svg) return { transition: 'not found', wheelState: 'not found', targetRot: 'N/A' };

        const transition = window.getComputedStyle(svg).transition;
        const wheelState = svg.getAttribute('data-wheel-state') || 'not set';
        const targetRot = svg.getAttribute('data-target-rotation') || 'N/A';

        return { transition, wheelState, targetRot };
      });

      // Try to extract rotation angle from matrix
      let rotation = 'unknown';
      if (currentTransform !== 'none') {
        try {
          const match = currentTransform.match(/matrix\(([^)]+)\)/);
          if (match) {
            const values = match[1].split(',').map(v => parseFloat(v.trim()));
            const a = values[0];
            const b = values[1];
            const angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
            rotation = `${angle}°`;
          }
        } catch (e) {
          rotation = 'parse error';
        }
      }

      console.log(`  T+${i}s: State: ${wheelState}, Target: ${targetRot}°, Current: ${rotation}, Button disabled: ${buttonDisabled}, Transition: ${transition.substring(0, 50)}...`);
    }

    console.log('\n🔄 Testing second spin...');

    // Wait a bit to ensure we're in COMPLETE state
    await page.waitForTimeout(1000);

    // Check button state before second spin
    const buttonEnabledBefore = await spinButton.evaluate(el => !el.disabled);
    console.log(`  - Button enabled before 2nd spin: ${buttonEnabledBefore}`);

    // Try to click again
    if (buttonEnabledBefore) {
      console.log('  - Clicking spin button for 2nd spin...');
      await spinButton.click();
      await page.waitForTimeout(500);

      const buttonDisabledAfter2 = await spinButton.evaluate(el => el.disabled);
      console.log(`  - Button disabled after 2nd click: ${buttonDisabledAfter2}`);

      // Check if state changed
      const { wheelState: state2, targetRot: target2 } = await page.evaluate(() => {
        const svg = document.querySelector('.segments-component svg');
        if (!svg) return { wheelState: 'not found', targetRot: 'N/A' };
        return {
          wheelState: svg.getAttribute('data-wheel-state') || 'not set',
          targetRot: svg.getAttribute('data-target-rotation') || 'N/A'
        };
      });

      console.log(`  - 2nd spin state: ${state2}, target: ${target2}°`);

      // Monitor for 5 seconds
      console.log('\n⏱️  Monitoring 2nd spin:\n');
      for (let i = 0; i <= 5; i++) {
        await page.waitForTimeout(1000);

        const { wheelState: stateCheck, targetRot: targetCheck } = await page.evaluate(() => {
          const svg = document.querySelector('.segments-component svg');
          if (!svg) return { wheelState: 'not found', targetRot: 'N/A' };
          return {
            wheelState: svg.getAttribute('data-wheel-state') || 'not set',
            targetRot: svg.getAttribute('data-target-rotation') || 'N/A'
          };
        });

        console.log(`  T+${i}s: State: ${stateCheck}, Target: ${targetCheck}°`);
      }
    } else {
      console.log('  ❌ Button still disabled after COMPLETE state!');
    }

    console.log('\n✅ Debug test complete.');
    // Don't wait, just close

  } catch (error) {
    console.error('\n❌ Error during debug test:', error);
  } finally {
    await browser.close();
  }
}

debugWheelSpin().catch(console.error);
