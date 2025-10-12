import { chromium } from 'playwright';

/**
 * Test script to inspect the app bar, sidebar, and drawer functionality
 */
async function testHeaderAndSidebar() {
  console.log('🚀 Launching browser to test header and sidebar...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500 // Slow down actions for visibility
  });

  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });

  const page = await context.newPage();

  try {
    // Navigate to the app
    console.log('📍 Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Test 1: Desktop view - Check if app bar is hidden and sidebar is visible
    console.log('\n✅ Test 1: Desktop View (1400px width)');
    console.log('   Checking if app bar is hidden...');
    const appBarDesktop = await page.locator('.app-bar').isVisible();
    console.log(`   - App bar visible: ${appBarDesktop} (should be false)`);

    console.log('   Checking if desktop sidebar is visible...');
    const sidebarDesktop = await page.locator('.app-sidebar.desktop-sidebar').isVisible();
    console.log(`   - Desktop sidebar visible: ${sidebarDesktop} (should be true)`);

    if (sidebarDesktop) {
      console.log('   ✓ Sidebar is properly visible on desktop');

      // Check sidebar contents (use first() to avoid strict mode violations)
      const uploadSection = await page.locator('.app-sidebar.desktop-sidebar .upload-section').isVisible();
      const controlsSection = await page.locator('.app-sidebar.desktop-sidebar .controls-section').isVisible();
      const infoSection = await page.locator('.app-sidebar.desktop-sidebar .info-section').isVisible();

      console.log(`   - Upload section: ${uploadSection}`);
      console.log(`   - Controls section: ${controlsSection}`);
      console.log(`   - Info section: ${infoSection}`);
    }

    await page.waitForTimeout(2000);

    // Test 2: Mobile view - Check if app bar is visible and sidebar is hidden
    console.log('\n✅ Test 2: Mobile View (375px width)');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);

    console.log('   Checking if app bar is visible...');
    const appBarMobile = await page.locator('.app-bar').isVisible();
    console.log(`   - App bar visible: ${appBarMobile} (should be true)`);

    console.log('   Checking if desktop sidebar is hidden...');
    const sidebarMobile = await page.locator('.app-sidebar.desktop-sidebar').isVisible();
    console.log(`   - Desktop sidebar visible: ${sidebarMobile} (should be false)`);

    if (appBarMobile) {
      // Check app bar contents
      const hamburger = await page.locator('.app-bar__hamburger').isVisible();
      const title = await page.locator('.app-bar__title').isVisible();
      const githubLink = await page.locator('.app-bar__github-link').isVisible();

      console.log(`   - Hamburger button: ${hamburger}`);
      console.log(`   - Title: ${title}`);
      console.log(`   - GitHub link: ${githubLink}`);

      if (title) {
        const titleText = await page.locator('.app-bar__title').textContent();
        console.log(`   - Title text: "${titleText}"`);
      }
    }

    await page.waitForTimeout(2000);

    // Test 3: Drawer functionality
    console.log('\n✅ Test 3: Drawer Functionality');
    console.log('   Clicking hamburger menu to open drawer...');

    await page.locator('.app-bar__hamburger').click();
    await page.waitForTimeout(1000);

    const drawerOpen = await page.locator('.app-drawer.is-open').isVisible();
    console.log(`   - Drawer opened: ${drawerOpen} (should be true)`);

    if (drawerOpen) {
      const drawerOverlay = await page.locator('.app-drawer__overlay').isVisible();
      const drawerPanel = await page.locator('.app-drawer__panel').isVisible();
      const closeButton = await page.locator('.app-drawer__close').isVisible();
      const drawerSidebar = await page.locator('.app-drawer__panel .app-sidebar').isVisible();

      console.log(`   - Overlay visible: ${drawerOverlay}`);
      console.log(`   - Panel visible: ${drawerPanel}`);
      console.log(`   - Close button visible: ${closeButton}`);
      console.log(`   - Drawer sidebar visible: ${drawerSidebar}`);

      // Take a screenshot of the open drawer
      await page.screenshot({
        path: 'screenshots/drawer-open.png',
        fullPage: true
      });
      console.log('   📸 Screenshot saved: screenshots/drawer-open.png');

      await page.waitForTimeout(2000);

      // Test closing by clicking close button
      console.log('\n   Testing close button...');
      await page.locator('.app-drawer__close').click();
      await page.waitForTimeout(500);

      const drawerClosedByButton = await page.locator('.app-drawer.is-open').isVisible();
      console.log(`   - Drawer closed: ${!drawerClosedByButton} (should be true)`);

      await page.waitForTimeout(1000);

      // Test opening again and closing by overlay click
      console.log('\n   Testing overlay click to close...');
      await page.locator('.app-bar__hamburger').click();
      await page.waitForTimeout(500);

      const drawerReopened = await page.locator('.app-drawer.is-open').isVisible();
      console.log(`   - Drawer reopened: ${drawerReopened} (should be true)`);

      await page.locator('.app-drawer__overlay').click();
      await page.waitForTimeout(500);

      const drawerClosedByOverlay = await page.locator('.app-drawer.is-open').isVisible();
      console.log(`   - Drawer closed by overlay: ${!drawerClosedByOverlay} (should be true)`);

      await page.waitForTimeout(1000);

      // Test opening again and closing with ESC key
      console.log('\n   Testing ESC key to close...');
      await page.locator('.app-bar__hamburger').click();
      await page.waitForTimeout(500);

      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);

      const drawerClosedByEsc = await page.locator('.app-drawer.is-open').isVisible();
      console.log(`   - Drawer closed by ESC: ${!drawerClosedByEsc} (should be true)`);
    }

    await page.waitForTimeout(2000);

    // Test 4: GitHub link
    console.log('\n✅ Test 4: GitHub Link');
    const githubLinkHref = await page.locator('.app-bar__github-link').getAttribute('href');
    const githubLinkTarget = await page.locator('.app-bar__github-link').getAttribute('target');
    console.log(`   - GitHub link href: ${githubLinkHref}`);
    console.log(`   - Opens in new tab: ${githubLinkTarget === '_blank'}`);

    // Test 5: Responsive transitions
    console.log('\n✅ Test 5: Responsive Transitions');
    console.log('   Testing viewport size changes...');

    // Go to desktop
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.waitForTimeout(1000);
    const appBarAt1400 = await page.locator('.app-bar').isVisible();
    const sidebarAt1400 = await page.locator('.app-sidebar.desktop-sidebar').isVisible();
    console.log(`   - At 1400px: AppBar=${appBarAt1400}, Sidebar=${sidebarAt1400}`);

    // Go to tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    const appBarAt768 = await page.locator('.app-bar').isVisible();
    const sidebarAt768 = await page.locator('.app-sidebar.desktop-sidebar').isVisible();
    console.log(`   - At 768px: AppBar=${appBarAt768}, Sidebar=${sidebarAt768}`);

    // Take final screenshots
    console.log('\n📸 Taking final screenshots...');

    // Desktop view
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: 'screenshots/desktop-view.png',
      fullPage: true
    });
    console.log('   - Desktop view: screenshots/desktop-view.png');

    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: 'screenshots/mobile-view.png',
      fullPage: true
    });
    console.log('   - Mobile view: screenshots/mobile-view.png');

    console.log('\n✅ All tests completed successfully!');
    console.log('   Browser will stay open for manual inspection.');
    console.log('   Press Ctrl+C to close the browser.\n');

    // Keep browser open for manual inspection
    await page.waitForTimeout(300000); // Wait 5 minutes

  } catch (error) {
    console.error('\n❌ Error during testing:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

// Run the test
testHeaderAndSidebar().catch(console.error);
