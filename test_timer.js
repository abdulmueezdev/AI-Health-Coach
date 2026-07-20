const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: "new"
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  let logs = [];
  page.on('console', msg => {
    logs.push(`[${msg.type()}] ${msg.text()}`);
    console.log(`PAGE LOG: ${msg.text()}`);
  });

  // Login
  await page.goto('http://localhost:3001/signup', { waitUntil: 'networkidle2' });
  const randomEmail = `testuser_${Date.now()}@example.com`;
  await page.type('input[type="email"]', randomEmail);
  await page.type('input[type="password"]', 'Password123!');
  await page.evaluate(() => {
    Array.from(document.querySelectorAll('button')).find(b => b.textContent && (b.textContent.includes('Create account') || b.textContent.includes('Sign up'))).click();
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

  console.log('Taking Dashboard Empty States screenshot...');
  await page.goto('http://localhost:3001/dashboard', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'dashboard-empty.png' });

  // Workout Timer Test
  await page.goto('http://localhost:3001/workouts', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 3000)); // wait for skeleton

  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.includes('Start Workout'));
    if (b) b.click();
    else console.log("START WORKOUT BUTTON NOT FOUND");
  });

  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'timer-modal.png' });
  console.log("Saved timer-modal.png");

  await new Promise(r => setTimeout(r, 5000));

  await page.evaluate(() => {
    // Specifically target the complete button by looking for exact match
    const b = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent === 'Complete');
    if (b) b.click();
    else console.log("COMPLETE BUTTON NOT FOUND");
  });

  await new Promise(r => setTimeout(r, 3000)); // wait for createWorkout to finish
  await page.screenshot({ path: 'timer-complete.png' });
  console.log("Saved timer-complete.png");

  fs.writeFileSync('browser_console.log', logs.join('\n'));
  await browser.close();
})();
