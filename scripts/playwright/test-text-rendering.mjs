#!/usr/bin/env node

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');

async function testTextRendering() {
  console.log('🎨 Testing segment text rendering...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to the app
    console.log('📍 Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Upload the ZIP file
    const zipPath = join(projectRoot, 'docs/wheel-theme.zip');
    if (!existsSync(zipPath)) {
      throw new Error(`ZIP file not found: ${zipPath}`);
    }

    console.log('📦 Uploading theme ZIP...');
    const fileInput = await page.locator('input[type="file"]');
    await fileInput.setInputFiles(zipPath);
    await page.waitForTimeout(2000);

    // Check if segments are rendered
    console.log('🔍 Checking for segment rendering...');
    const segments = await page.locator('path[d^="M"]').count();
    console.log(`   Found ${segments} path elements`);

    // Check for text elements
    console.log('🔍 Checking for text elements...');
    const textElements = await page.locator('text').count();
    console.log(`   Found ${textElements} text elements`);

    // Check for textPath elements (text following arcs)
    const textPaths = await page.locator('textPath').count();
    console.log(`   Found ${textPaths} textPath elements`);

    // Take a screenshot
    const screenshotPath = join(projectRoot, 'screenshots/text-rendering-test.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`\n📸 Screenshot saved to: ${screenshotPath}`);

    // Check for specific text content
    const loremCount = await page.locator('textPath:has-text("Lorem")').count();
    const ipsumCount = await page.locator('textPath:has-text("Ipsum")').count();
    const noCount = await page.locator('textPath:has-text("NO")').count();
    const winCount = await page.locator('textPath:has-text("WIN")').count();

    console.log('\n📊 Text content found:');
    console.log(`   - "Lorem": ${loremCount}`);
    console.log(`   - "Ipsum": ${ipsumCount}`);
    console.log(`   - "NO": ${noCount}`);
    console.log(`   - "WIN": ${winCount}`);

    if (textPaths > 0) {
      console.log('\n✅ Text rendering is working! Text elements are following arc paths.');
    } else {
      console.log('\n⚠️  Warning: No textPath elements found. Text might not be rendering correctly.');
    }

    // Keep browser open for inspection
    console.log('\n👁️  Browser kept open for inspection. Press Ctrl+C to close.');
    await page.waitForTimeout(60000); // Wait 60 seconds

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

testTextRendering().catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});
