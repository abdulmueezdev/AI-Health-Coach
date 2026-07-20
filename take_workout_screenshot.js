const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // First we need to login
  await page.goto('http://localhost:3001/login');
  await new Promise(r => setTimeout(r, 1000));
  await page.type('input[type="email"]', 'abdulmueezshahid550@gmail.com');
  await page.type('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 2000));

  await page.goto('http://localhost:3001/workouts');
  await new Promise(r => setTimeout(r, 2000));
  
  await page.screenshot({ path: '/home/alucard/.gemini/antigravity/brain/e4fa1729-f203-4ab8-b386-95aa534b7deb/workout.png', fullPage: true });

  await browser.close();
  console.log('Done');
})();
