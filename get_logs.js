const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  
  console.log('Navigating to login');
  await page.goto('http://localhost:3001/login');
  
  console.log('Typing credentials');
  await page.type('input[type="email"]', 'test@example.com');
  await page.type('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  console.log('Waiting 3 seconds');
  await new Promise(r => setTimeout(r, 3000));
  
  console.log('Navigating to dashboard');
  await page.goto('http://localhost:3001/dashboard');
  
  console.log('Waiting 5 seconds for network requests');
  await new Promise(r => setTimeout(r, 5000));
  
  await browser.close();
})();
