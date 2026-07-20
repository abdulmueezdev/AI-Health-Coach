const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: 'new', 
    args: ['--no-sandbox'],
    executablePath: '/usr/bin/google-chrome' 
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  await page.goto('http://localhost:3001/signup');
  await new Promise(r => setTimeout(r, 2000));
  
  const randomEmail = `test${Date.now()}@test.com`;
  
  await page.type('input[name="email"]', randomEmail);
  await page.type('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  await new Promise(r => setTimeout(r, 4000));
  
  await page.goto('http://localhost:3001/dashboard');
  
  await new Promise(r => setTimeout(r, 5000));
  
  await page.screenshot({ path: '/home/alucard/.gemini/antigravity/brain/e4fa1729-f203-4ab8-b386-95aa534b7deb/dashboard_empty_cards_v1.0.6.1.png' });
  console.log("Saved dashboard screenshot");
  
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('15m Outdoor walk')) {
      await b.click();
      console.log("Clicked 15m outdoor walk");
      break;
    }
  }
  
  await new Promise(r => setTimeout(r, 4000));
  await page.screenshot({ path: '/home/alucard/.gemini/antigravity/brain/e4fa1729-f203-4ab8-b386-95aa534b7deb/workout_created_v1.0.6.1.png' });
  console.log("Saved workout screenshot");
  
  await browser.close();
})();
