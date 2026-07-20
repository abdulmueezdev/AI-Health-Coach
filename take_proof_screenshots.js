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

  // Step 1: Fix 1 - Smooth Scroll
  console.log('Navigating to Landing Page...');
  await page.goto('http://localhost:3001', { waitUntil: 'networkidle2' });
  
  await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a'));
    const featuresLink = links.find(l => l.textContent && l.textContent.includes('Features'));
    if (featuresLink) featuresLink.click();
  });
  
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'features-scroll.png' });
  console.log('Saved features-scroll.png');

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
  
  // Complete Onboarding if we are on /onboarding
  if (page.url().includes('onboarding')) {
    console.log('Completing Onboarding...');
    // There are 3 steps
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
  
  // Fix 4: Dashboard Empty States
  console.log('Taking Dashboard Empty States screenshot...');
  await page.goto('http://localhost:3001/dashboard', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'dashboard-empty.png' });
  console.log('Saved dashboard-empty.png');

  // Fix 3: Recommended Actions
  console.log('Clicking "Extend fast by 30m"...');
  await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a'));
    const mealsLink = links.find(l => l.textContent && l.textContent.includes('Extend fast by 30m'));
    if (mealsLink) mealsLink.click();
  });
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: 'nav-meals.png' });
  console.log('Saved nav-meals.png');

  console.log('Navigating back to /dashboard...');
  await page.goto('http://localhost:3001/dashboard', { waitUntil: 'networkidle2' });
  console.log('Clicking "15m Outdoor walk"...');
  await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a'));
    const workoutsLink = links.find(l => l.textContent && l.textContent.includes('15m Outdoor walk'));
    if (workoutsLink) workoutsLink.click();
  });
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: 'nav-workouts.png' });
  console.log('Saved nav-workouts.png');

  // Fix 2: Workout Timer
  console.log('Navigating to /workouts...');
  await page.goto('http://localhost:3001/workouts', { waitUntil: 'networkidle2' });
  
  console.log('Clicking "Start Workout"...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const startBtn = btns.find(b => b.textContent && b.textContent.includes('Start Workout'));
    if (startBtn) startBtn.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'timer-modal.png' });
  console.log('Saved timer-modal.png');

  console.log('Waiting 5 seconds...');
  await new Promise(r => setTimeout(r, 5500));

  console.log('Clicking "Complete"...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const completeBtn = btns.find(b => b.textContent && b.textContent.includes('Complete Workout') || b.textContent.includes('Complete'));
    if (completeBtn) completeBtn.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'timer-complete.png' });
  console.log('Saved timer-complete.png');

  fs.writeFileSync('browser_console.log', logs.join('\n'));
  console.log('Saved browser_console.log');

  await browser.close();
})();
