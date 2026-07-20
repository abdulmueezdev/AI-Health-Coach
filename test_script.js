const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  await page.goto('http://localhost:3000/workouts', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));
  await page.evaluate(() => {
    console.log('DOM has', document.querySelectorAll('button').length, 'buttons');
    document.querySelectorAll('button').forEach(b => console.log('Btn:', b.textContent));
  });
  await browser.close();
})();
