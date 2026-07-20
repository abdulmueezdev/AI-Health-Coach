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

  // Step 2: Create Account
  console.log('Navigating to /signup...');
  await page.goto('http://localhost:3001/signup', { waitUntil: 'networkidle2' });
  
  const randomEmail = `testuser_${Date.now()}@example.com`;
  
  await page.type('input[type="text"]', 'Test User').catch(() => {}); 
  await page.type('input[type="email"]', randomEmail);
  await page.type('input[type="password"]', 'Password123!');
  
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const submitBtn = btns.find(b => b.textContent && (b.textContent.includes('Create account') || b.textContent.includes('Sign up')));
    if (submitBtn) submitBtn.click();
  });
  
  console.log('Waiting for auth to complete...');
  await new Promise(r => setTimeout(r, 6000));
  
  if (page.url().includes('onboarding')) {
    console.log('Completing Onboarding...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const nextBtn = btns.find(b => b.textContent && b.textContent.includes('Next'));
      if (nextBtn) nextBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const nextBtn = btns.find(b => b.textContent && b.textContent.includes('Next'));
      if (nextBtn) nextBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const completeBtn = btns.find(b => b.type === 'submit');
      if (completeBtn) completeBtn.click();
    });
    await new Promise(r => setTimeout(r, 4000));
  }
  
  // Fix 2: Workout Timer
  console.log('Navigating to /workouts...');
  await page.goto('http://localhost:3001/workouts', { waitUntil: 'networkidle2' });
  
  // IMPORTANT: Wait for skeleton to disappear
  await new Promise(r => setTimeout(r, 3000));

  console.log('Clicking "Start Workout"...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const startBtn = btns.find(b => b.textContent && b.textContent.includes('Start Workout'));
    if (startBtn) startBtn.click();
    else console.log("START WORKOUT BUTTON NOT FOUND");
  });
  
  // Wait for modal to open
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'timer-modal.png' });
  console.log('Saved timer-modal.png');

  console.log('Waiting 5 seconds...');
  await new Promise(r => setTimeout(r, 5000));

  console.log('Clicking "Complete"...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const completeBtn = btns.find(b => b.textContent === 'Complete');
    if (completeBtn) completeBtn.click();
    else console.log("COMPLETE BUTTON NOT FOUND");
  });
  
  // Wait for createWorkout to finish and modal to close
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: 'timer-complete.png' });
  console.log('Saved timer-complete.png');

  fs.writeFileSync('browser_console.log', logs.join('\n'));
  console.log('Saved browser_console.log');

  await browser.close();
})();
