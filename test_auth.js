const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'], headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  console.log('Navigating to login...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });

  // Try to find the sign up button / tab
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const signupBtn = btns.find(b => b.textContent && b.textContent.includes('Sign up'));
    if (signupBtn) signupBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Fill email and password
  const randomEmail = `testuser_${Date.now()}@example.com`;
  await page.type('input[type="email"]', randomEmail);
  await page.type('input[type="password"]', 'password123');
  
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const submitBtn = btns.find(b => b.textContent && b.textContent.includes('Create account') || b.textContent.includes('Sign up'));
    if (submitBtn) submitBtn.click();
  });
  
  console.log('Submitted signup. Waiting for navigation...');
  await new Promise(r => setTimeout(r, 5000));
  
  console.log('Current URL:', page.url());
  await browser.close();
})();
