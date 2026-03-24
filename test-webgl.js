const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error(`Browser Error: ${msg.text()}`);
    }
  });
  
  page.on('pageerror', error => {
    console.error(`Page Error: ${error.message}`);
  });

  await page.goto('http://localhost:5174');
  await page.waitForTimeout(3000);
  
  console.log('Test finished');
  await browser.close();
})();
