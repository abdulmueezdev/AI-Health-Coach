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
    const b = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Sign up'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 4000));
  
  if (page.url().includes('onboarding')) {
    await page.evaluate(() => {
      Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Next')).click();
    });
    await new Promise(r => setTimeout(r, 1000));
    await page.evaluate(() => {
      Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Next')).click();
    });
    await new Promise(r => setTimeout(r, 1000));
    await page.evaluate(() => {
      Array.from(document.querySelectorAll('button')).find(b => b.type === 'submit').click();
    });
    await new Promise(r => setTimeout(r, 4000));
  }

  await page.goto('http://localhost:3001/workouts', { waitUntil: 'networkidle2' });
  
  await page.evaluate(() => {
    Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Start Workout')).click();
  });
  await new Promise(r => setTimeout(r, 1000));
  
  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).map(b => b.textContent);
  });
  console.log('Buttons:', buttons);
  
  await page.evaluate(() => {
    Array.from(document.querySelectorAll('button')).find(b => b.textContent === 'Complete').click();
  });
  await new Promise(r => setTimeout(r, 2000));
  
  const consoleMsgs = await page.evaluate(() => window.logs || 'No logs');
  console.log(consoleMsgs);
  
  await browser.close();
})();
