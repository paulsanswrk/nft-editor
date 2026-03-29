const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText));

  console.log('Navigating to https://nft-editor.mooo.com/ ...');
  try {
    await page.goto('https://nft-editor.mooo.com/', { waitUntil: 'networkidle0', timeout: 30000 });
    
    const content = await page.content();
    const loginHtml = await page.evaluate(() => document.getElementById('login-container')?.innerHTML);
    console.log('Login container innerHTML:', loginHtml);
    
    const globals = await page.evaluate(() => {
       return {
         hasPrimeVue: !!window.PrimeVue,
         hasGoogle: !!window.google,
         hasVue: !!window.__VUE__
       };
    });
    console.log('Globals:', globals);
  } catch (err) {
    console.error('Error during test:', err);
  }

  await browser.close();
  process.exit(0);
})();
