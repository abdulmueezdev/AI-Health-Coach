const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  const logs = [];
  page.on('console', msg => {
    if (msg.text().includes('clicked') || msg.text().includes('Setting active') || msg.text().includes('Timer') || msg.text().includes('Creating')) {
      logs.push(msg.text());
    }
  });

  // 1. Verify Smooth Scroll
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    const link = Array.from(document.querySelectorAll('a')).find(a => a.textContent === 'Features');
    if (link) link.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'smooth-scroll-verify.png' });

  // 2. Verify Timer and Console Logs
  await page.goto('http://localhost:3000/workouts', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const startBtn = buttons.find(b => b.textContent && b.textContent.includes('Start Workout'));
    if (startBtn) startBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 1000)); // wait for modal
  
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const completeBtn = buttons.find(b => b.textContent && b.textContent.includes('Complete'));
    if (completeBtn) completeBtn.click();
  });

  await new Promise(r => setTimeout(r, 1000)); // wait for logs

  fs.writeFileSync('console_output.txt', logs.join('\n'));

  // 3. Verify Dashboard Empty States
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'dashboard-empty-states-updated.png' });

  await browser.close();
})();
