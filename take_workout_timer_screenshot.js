const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  await page.goto('http://localhost:3000/workouts', { waitUntil: 'networkidle2' });
  
  await new Promise(r => setTimeout(r, 2000));
  
  // Wait for the Start Workout button and click it
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const startBtn = buttons.find(b => b.textContent && b.textContent.includes('Start Workout'));
    if (startBtn) startBtn.click();
  });
  
  // wait 2 seconds for modal to pop up
  await new Promise(r => setTimeout(r, 2000));
  
  await page.screenshot({ path: 'workout-timer.png' });
  
  await browser.close();
})();
