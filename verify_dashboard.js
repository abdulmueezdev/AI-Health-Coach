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

  console.log('Navigating to /dashboard...');
  await page.goto('http://localhost:3001/dashboard', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 3000));

  await page.screenshot({ path: 'dashboard-final.png' });
  console.log('Saved dashboard-final.png');

  fs.writeFileSync('dashboard_console.log', logs.join('\n'));
  console.log('Saved dashboard_console.log');

  await browser.close();
})();
