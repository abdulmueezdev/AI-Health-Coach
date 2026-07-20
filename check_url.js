const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'], headless: "new" });
  const page = await browser.newPage();
  await page.goto('http://localhost:3001/dashboard', { waitUntil: 'networkidle2' });
  console.log('URL for dashboard:', page.url());
  await browser.close();
})();
