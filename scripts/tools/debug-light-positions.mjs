/**
 * Debug script to check light bulb positioning in browser
 *
 * This script will:
 * 1. Check the actual positions of light bulbs in the DOM
 * 2. Compare with expected theme data positions
 * 3. Measure wrapper sizes and offsets
 */

import { chromium } from 'playwright';

async function debugLightPositions() {
  console.log('🔍 Starting light position debug...\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1400, height: 900 });

  try {
    console.log('📖 Loading page...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

    // Wait for wheel to load
    await page.waitForSelector('.wheel-container', { timeout: 10000 });
    await page.waitForTimeout(2000); // Let animations settle

    console.log('\n📊 Analyzing light bulb positions...\n');

    const analysis = await page.evaluate(() => {
      const results = [];

      // Get all light bulb wrappers
      const bulbs = document.querySelectorAll('.light-bulb__wrapper');

      // Get container info
      const container = document.querySelector('.animated-lights-renderer');
      const wheelContainer = document.querySelector('.wheel-container');

      const containerInfo = {
        containerRect: container?.getBoundingClientRect() || null,
        wheelRect: wheelContainer?.getBoundingClientRect() || null,
      };

      bulbs.forEach((bulb, index) => {
        const rect = bulb.getBoundingClientRect();
        const styles = window.getComputedStyle(bulb);
        const bulbCore = bulb.querySelector('.light-bulb__bulb');
        const bulbCoreStyles = bulbCore ? window.getComputedStyle(bulbCore) : null;
        const outerGlow = bulb.querySelector('.light-bulb__glow-outer');
        const outerGlowStyles = outerGlow ? window.getComputedStyle(outerGlow) : null;

        results.push({
          index,
          position: {
            left: styles.left,
            top: styles.top,
            transform: styles.transform,
          },
          wrapper: {
            width: styles.width,
            height: styles.height,
          },
          bulbCore: bulbCoreStyles ? {
            width: bulbCoreStyles.width,
            height: bulbCoreStyles.height,
            top: bulbCoreStyles.top,
            left: bulbCoreStyles.left,
          } : null,
          outerGlow: outerGlowStyles ? {
            width: outerGlowStyles.width,
            height: outerGlowStyles.height,
            top: outerGlowStyles.top,
            left: outerGlowStyles.left,
          } : null,
          boundingRect: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
          },
          dataset: {
            bulbIndex: bulb.dataset.bulbIndex,
          },
        });
      });

      return { bulbs: results, container: containerInfo };
    });

    console.log(`Found ${analysis.bulbs.length} light bulbs\n`);
    console.log('Container info:');
    console.log('  Animated lights renderer:', analysis.container.containerRect);
    console.log('  Wheel container:', analysis.container.wheelRect);
    console.log('');

    // Show first 3 bulbs in detail
    analysis.bulbs.slice(0, 3).forEach(bulb => {
      console.log(`\n🔦 Bulb #${bulb.index}:`);
      console.log(`  Position: left=${bulb.position.left}, top=${bulb.position.top}`);
      console.log(`  Transform: ${bulb.position.transform}`);
      console.log(`  Wrapper: ${bulb.wrapper.width} x ${bulb.wrapper.height}`);
      if (bulb.bulbCore) {
        console.log(`  Bulb core: ${bulb.bulbCore.width} x ${bulb.bulbCore.height} at (${bulb.bulbCore.left}, ${bulb.bulbCore.top})`);
      }
      if (bulb.outerGlow) {
        console.log(`  Outer glow: ${bulb.outerGlow.width} x ${bulb.outerGlow.height} at (${bulb.outerGlow.left}, ${bulb.outerGlow.top})`);
      }
      console.log(`  Bounding rect: (${bulb.boundingRect.x.toFixed(2)}, ${bulb.boundingRect.y.toFixed(2)})`);
    });

    // Expected theme positions (from theme.zip)
    const themePositions = [
      { x: 328, y: 311 },
      { x: 317.109375, y: 365.7197265625 },
      { x: 286.1201171875, y: 412.1201171875 },
    ];

    const frameSize = { width: 366, height: 576 };
    const displaySize = analysis.container.wheelRect;
    const scale = displaySize.width / frameSize.width;

    console.log(`\n\n📐 Scale calculation:`);
    console.log(`  Frame size: ${frameSize.width}x${frameSize.height}`);
    console.log(`  Display size: ${displaySize.width.toFixed(2)}x${displaySize.height.toFixed(2)}`);
    console.log(`  Scale: ${scale.toFixed(4)}`);

    console.log(`\n\n🎯 Position comparison (first 3 bulbs):`);
    themePositions.forEach((theme, i) => {
      const expectedX = theme.x * scale;
      const expectedY = theme.y * scale;
      const bulb = analysis.bulbs[i];
      const actualLeft = parseFloat(bulb.position.left);
      const actualTop = parseFloat(bulb.position.top);

      console.log(`\n  Bulb #${i}:`);
      console.log(`    Theme position: (${theme.x}, ${theme.y})`);
      console.log(`    Expected scaled: (${expectedX.toFixed(2)}, ${expectedY.toFixed(2)})`);
      console.log(`    Actual CSS left/top: (${actualLeft.toFixed(2)}, ${actualTop.toFixed(2)})`);
      console.log(`    Difference: (${(actualLeft - expectedX).toFixed(2)}, ${(actualTop - expectedY).toFixed(2)})`);
      console.log(`    Transform: ${bulb.position.transform}`);
    });

    console.log('\n\n✅ Analysis complete!');
    console.log('Check the positions above to see if there are any offsets.\n');

    // Keep browser open for inspection
    console.log('Browser kept open for manual inspection. Close it to exit.');
    await new Promise(() => {}); // Keep alive

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugLightPositions().catch(console.error);
