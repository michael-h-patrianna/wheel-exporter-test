import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  await page.waitForSelector('.wheel-container');
  await page.waitForTimeout(1000);

  const data = await page.evaluate(() => {
    const bulbs = Array.from(document.querySelectorAll('.light-bulb__wrapper'));
    const wheelContainer = document.querySelector('.wheel-container');
    const wheelRect = wheelContainer?.getBoundingClientRect();

    return {
      scale: wheelRect?.width / 366,
      bulbs: bulbs.slice(0, 3).map((el, i) => {
        const styles = getComputedStyle(el);
        const bulbCore = el.querySelector('.light-bulb__bulb');
        const coreStyles = bulbCore ? getComputedStyle(bulbCore) : null;

        return {
          index: i,
          left: styles.left,
          top: styles.top,
          width: styles.width,
          height: styles.height,
          transform: styles.transform,
          bulbCore: coreStyles ? {
            width: coreStyles.width,
            height: coreStyles.height,
            top: coreStyles.top,
            left: coreStyles.left,
          } : null
        };
      })
    };
  });

  const themePositions = [
    { x: 328, y: 311 },
    { x: 317.109375, y: 365.7197265625 },
    { x: 286.1201171875, y: 412.1201171875 },
  ];

  console.log(`\nScale: ${data.scale?.toFixed(4) || 'unknown'}\n`);

  data.bulbs.forEach((bulb, i) => {
    const expected = {
      x: themePositions[i].x * data.scale,
      y: themePositions[i].y * data.scale
    };

    console.log(`Bulb #${i}:`);
    console.log(`  Theme: (${themePositions[i].x}, ${themePositions[i].y})`);
    console.log(`  Expected scaled: (${expected.x.toFixed(2)}, ${expected.y.toFixed(2)})`);
    console.log(`  Actual CSS: left=${bulb.left}, top=${bulb.top}`);
    console.log(`  Wrapper: ${bulb.width} x ${bulb.height}`);
    console.log(`  Transform: ${bulb.transform}`);
    if (bulb.bulbCore) {
      console.log(`  Core: ${bulb.bulbCore.width} at (${bulb.bulbCore.left}, ${bulb.bulbCore.top})`);
    }
    console.log('');
  });

  await browser.close();
})();
