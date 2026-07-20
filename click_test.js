const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: "new"
  });
  const page = await browser.newPage();
  
  // Login first
  await page.goto('http://localhost:3001/signup', { waitUntil: 'networkidle2' });
  await page.type('input[type="email"]', `test_${Date.now()}@test.com`);
  await page.type('input[type="password"]', 'Password123!');
  await page.evaluate(() => {
    Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Sign up')).click();
  });
  await new Promise(r => setTimeout(r, 4000));
  
  if (page.url().includes('onboarding')) {
    await page.evaluate(() => Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Next')).click());
    await new Promise(r => setTimeout(r, 1000));
    await page.evaluate(() => Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Next')).click());
    await new Promise(r => setTimeout(r, 1000));
    await page.evaluate(() => Array.from(document.querySelectorAll('button')).find(b => b.type === 'submit').click());
    await new Promise(r => setTimeout(r, 4000));
  }

  await page.goto('http://localhost:3001/workouts', { waitUntil: 'networkidle2' });
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.evaluate(() => {
    Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Start Workout')).click();
  });
  await new Promise(r => setTimeout(r, 2000));
  
  await page.evaluate(() => {
    console.log("Looking for Complete button...");
    const btns = Array.from(document.querySelectorAll('button'));
    const completeBtn = btns.find(b => b.textContent && b.textContent.includes('Complete'));
    if (completeBtn) {
      console.log("Found Complete button! Text:", completeBtn.textContent);
      completeBtn.click();
    } else {
      console.log("Complete button NOT FOUND!");
    }
  });
  
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'timer-complete-test.png' });
  console.log("Saved timer-complete-test.png");
  
  await browser.close();
})();
