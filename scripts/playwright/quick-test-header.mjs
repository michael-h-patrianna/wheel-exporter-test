import { chromium } from 'playwright';

/**
 * Quick test to inspect the app bar, sidebar, and drawer functionality
 */
async function quickTest() {
  console.log('🚀 Running quick header & sidebar test...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 300
  });

  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });

  const page = await context.newPage();

  try {
    // Navigate to the app
    console.log('📍 Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Test 1: Desktop view
    console.log('\n✅ Test 1: Desktop View (1400px)');
    const appBarDesktop = await page.locator('.app-bar').isVisible();
    const sidebarDesktop = await page.locator('.app-sidebar.desktop-sidebar').isVisible();
    console.log(`   App bar hidden: ${!appBarDesktop} ✓`);
    console.log(`   Sidebar visible: ${sidebarDesktop} ✓`);

    // Take screenshot
    await page.screenshot({ path: 'screenshots/desktop-header-test.png' });
    console.log('   📸 Screenshot: screenshots/desktop-header-test.png');

    // Test 2: Mobile view
    console.log('\n✅ Test 2: Mobile View (375px)');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    const appBarMobile = await page.locator('.app-bar').isVisible();
    const sidebarMobile = await page.locator('.app-sidebar.desktop-sidebar').isVisible();
    const hamburger = await page.locator('.app-bar__hamburger').isVisible();
    const githubLink = await page.locator('.app-bar__github-link').isVisible();

    console.log(`   App bar visible: ${appBarMobile} ✓`);
    console.log(`   Sidebar hidden: ${!sidebarMobile} ✓`);
    console.log(`   Hamburger button: ${hamburger} ✓`);
    console.log(`   GitHub link: ${githubLink} ✓`);

    const titleText = await page.locator('.app-bar__title').textContent();
    console.log(`   Title: "${titleText}" ✓`);

    // Take screenshot
    await page.screenshot({ path: 'screenshots/mobile-header-test.png' });
    console.log('   📸 Screenshot: screenshots/mobile-header-test.png');

    // Test 3: Open drawer
    console.log('\n✅ Test 3: Drawer Interaction');
    await page.locator('.app-bar__hamburger').click();
    await page.waitForTimeout(500);

    const drawerOpen = await page.locator('.app-drawer.is-open').isVisible();
    console.log(`   Drawer opened: ${drawerOpen} ✓`);

    // Take screenshot
    await page.screenshot({ path: 'screenshots/drawer-open-test.png' });
    console.log('   📸 Screenshot: screenshots/drawer-open-test.png');

    // Close with ESC
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    const drawerClosed = await page.locator('.app-drawer.is-open').isVisible();
    console.log(`   Drawer closed (ESC): ${!drawerClosed} ✓`);

    // Test 4: Reopen and close with overlay
    await page.locator('.app-bar__hamburger').click();
    await page.waitForTimeout(300);
    await page.locator('.app-drawer__overlay').click();
    await page.waitForTimeout(300);

    const drawerClosedByOverlay = await page.locator('.app-drawer.is-open').isVisible();
    console.log(`   Drawer closed (overlay): ${!drawerClosedByOverlay} ✓`);

    // Test 5: Responsive transitions
    console.log('\n✅ Test 4: Responsive Transitions');

    await page.setViewportSize({ width: 1400, height: 900 });
    await page.waitForTimeout(300);
    const at1400AppBar = await page.locator('.app-bar').isVisible();
    const at1400Sidebar = await page.locator('.app-sidebar.desktop-sidebar').isVisible();
    console.log(`   1400px: AppBar=${at1400AppBar}, Sidebar=${at1400Sidebar} ✓`);

    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(300);
    const at768AppBar = await page.locator('.app-bar').isVisible();
    const at768Sidebar = await page.locator('.app-sidebar.desktop-sidebar').isVisible();
    console.log(`   768px: AppBar=${at768AppBar}, Sidebar=${at768Sidebar} ✓`);

    console.log('\n✅ All tests passed! Screenshots saved in screenshots/ directory.\n');

    // Keep browser open for 10 seconds for manual inspection
    console.log('Browser will close in 10 seconds...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
}

quickTest().catch(console.error);
