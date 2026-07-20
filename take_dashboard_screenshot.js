const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle2' });
  
  await new Promise(r => setTimeout(r, 2000));
  
  const html = await page.content();
  console.log(html.substring(0, 500));
  
  await page.screenshot({ path: 'dashboard-empty-states.png', fullPage: true });
  
  await browser.close();
})();
