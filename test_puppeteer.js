const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));

  await page.goto('file:///' + __dirname.replace(/\\/g, '/') + '/cafe.html', { waitUntil: 'networkidle0' });
  
  console.log("Page loaded. Clicking a menu item to add to cart...");
  await page.evaluate(() => {
    const btn = document.querySelector('.add-to-cart-btn');
    if (btn) btn.click();
  });

  await new Promise(r => setTimeout(r, 1000));
  await browser.close();
})();
