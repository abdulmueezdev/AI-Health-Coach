const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  console.log('Testing Landing...');
  await page.goto('http://localhost:3001/');
  await page.screenshot({ path: 'screenshots/landing.png' });

  console.log('Testing Signup...');
  await page.goto('http://localhost:3001/signup');
  await page.screenshot({ path: 'screenshots/signup.png' });

  console.log('Filling signup form...');
  await page.type('input[name="email"]', 'testuser2@example.com');
  await page.type('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  
  console.log('Testing Dashboard...');
  // We should be on /dashboard now
  await page.screenshot({ path: 'screenshots/dashboard.png' });

  console.log('Testing Meals...');
  await page.goto('http://localhost:3001/meals');
  await page.screenshot({ path: 'screenshots/meals.png' });

  console.log('Testing Workouts...');
  await page.goto('http://localhost:3001/workouts');
  await page.screenshot({ path: 'screenshots/workouts.png' });

  console.log('Testing Habits...');
  await page.goto('http://localhost:3001/habits');
  await page.screenshot({ path: 'screenshots/habits.png' });

  console.log('Testing Progress...');
  await page.goto('http://localhost:3001/progress');
  await page.screenshot({ path: 'screenshots/progress.png' });

  console.log('Testing Coach...');
  await page.goto('http://localhost:3001/coach');
  await page.screenshot({ path: 'screenshots/coach.png' });

  console.log('Testing Settings...');
  await page.goto('http://localhost:3001/settings');
  await page.screenshot({ path: 'screenshots/settings.png' });

  await browser.close();
  console.log('Done!');
})();
