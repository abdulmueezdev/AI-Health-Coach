const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  page.on('dialog', async dialog => {
    console.log(`[ALERT] Browser alert appeared: "${dialog.message()}"`);
    await dialog.accept();
  });

  console.log('1. Testing Login/Signup...');
  await page.goto('http://localhost:3001/signup');
  await page.type('input[name="email"]', 'test_cto_' + Date.now() + '@example.com');
  await page.type('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  console.log('Successfully signed in and reached:', page.url());

  console.log('\n2. Testing Workouts...');
  await page.goto('http://localhost:3001/workouts');
  await page.waitForSelector('button', { timeout: 5000 });
  
  // Try to click Start Workout. If there are no workouts, click Create Workout and make one
  const createBtn = await page.$x("//button[contains(., 'Create Workout')]");
  if (createBtn.length > 0) {
    await createBtn[0].click();
    await page.waitForSelector('input[placeholder="e.g. Upper Body Power"]');
    await page.type('input[placeholder="e.g. Upper Body Power"]', 'CTO Test Workout');
    await page.type('input[placeholder="45"]', '30');
    const saveBtn = await page.$x("//button[contains(., 'Save Plan')]");
    await saveBtn[0].click();
    await page.waitForTimeout(2000); // wait for save
  }

  // Now click Start Workout
  const startBtn = await page.$x("//button[contains(., 'Start Workout')]");
  if (startBtn.length > 0) {
    console.log('Clicking Start Workout FIRST time...');
    await startBtn[0].click();
    await page.waitForTimeout(1000); // wait for state to update
    
    console.log('Clicking Start Workout SECOND time...');
    await startBtn[0].click();
    await page.waitForTimeout(1000); // wait for alert
  }

  console.log('\n3. Testing Habits...');
  await page.goto('http://localhost:3001/habits');
  await page.waitForSelector('.group', { timeout: 5000 });
  
  const streakBefore = await page.evaluate(() => {
    const el = document.querySelector('.group span.font-fredoka.text-3xl');
    return el ? el.innerText : null;
  });
  console.log('Initial streak:', streakBefore);
  
  const checkmarks = await page.$$('.group button');
  if (checkmarks.length > 0) {
    console.log('Clicking habit checkmark FIRST time...');
    await checkmarks[0].click();
    await page.waitForTimeout(2000);
    
    const streakAfter1 = await page.evaluate(() => {
      const el = document.querySelector('.group span.font-fredoka.text-3xl');
      return el ? el.innerText : null;
    });
    console.log('Streak after first click:', streakAfter1);

    console.log('Clicking habit checkmark SECOND time...');
    await checkmarks[0].click();
    await page.waitForTimeout(2000);
    
    const streakAfter2 = await page.evaluate(() => {
      const el = document.querySelector('.group span.font-fredoka.text-3xl');
      return el ? el.innerText : null;
    });
    console.log('Streak after second click:', streakAfter2);
  }

  console.log('\n4. Testing Settings...');
  const startSettings = Date.now();
  await page.goto('http://localhost:3001/settings');
  await page.waitForSelector('input[name="full_name"]', { timeout: 5000 });
  const endSettings = Date.now();
  
  const settingsInput = await page.$eval('input[name="email"]', el => el.value);
  console.log(`Settings loaded in ${endSettings - startSettings}ms. Data visible? ${settingsInput.includes('@')}`);
  await page.screenshot({ path: 'screenshots/settings_cto_verify.png' });
  console.log('Saved settings_cto_verify.png');

  await browser.close();
  console.log('\nAll tests complete.');
})();
