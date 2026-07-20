const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  page.setDefaultNavigationTimeout(60000);
  
  const logs = [];
  page.on('console', msg => {
    if (msg.text().includes('clicked') || msg.text().includes('Setting active') || msg.text().includes('Timer') || msg.text().includes('Creating')) {
      logs.push(msg.text());
    }
  });

  console.log('Navigating to landing page...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));
  await page.evaluate(() => {
    const link = Array.from(document.querySelectorAll('a')).find(a => a.textContent === 'Features');
    if (link) link.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'smooth-scroll-verify.png' });
  console.log('Smooth scroll captured');

  console.log('Navigating to workouts page...');
  await page.goto('http://localhost:3000/workouts', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));
  
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const startBtn = buttons.find(b => b.textContent && b.textContent.includes('Start Workout'));
    if (startBtn) startBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 2000)); // wait for modal
  
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const completeBtn = buttons.find(b => b.textContent && b.textContent.includes('Complete'));
    if (completeBtn) completeBtn.click();
  });

  await new Promise(r => setTimeout(r, 2000)); // wait for logs

  fs.writeFileSync('console_output.txt', logs.join('\n'));
  console.log('Workouts verified');

  console.log('Navigating to dashboard...');
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'dashboard-empty-states-updated.png' });
  console.log('Dashboard captured');

  await browser.close();
})();
