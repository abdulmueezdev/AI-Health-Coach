const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'], headless: "new" });
  const page = await browser.newPage();
  
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
  
  await new Promise(r => setTimeout(r, 6000));
  const html = await page.evaluate(() => document.body.innerHTML);
  console.log("URL:", page.url());
  console.log("DOM:", html);
  await browser.close();
})();
