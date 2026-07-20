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
  
  console.log("Navigating to signup...");
  await page.goto('http://localhost:3001/signup');
  await new Promise(r => setTimeout(r, 2000));
  
  const randomEmail = `test${Date.now()}@test.com`;
  
  console.log("Signing up...");
  await page.type('input[name="name"]', 'TestUser');
  await page.type('input[name="email"]', randomEmail);
  await page.type('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  await new Promise(r => setTimeout(r, 4000));
  
  console.log("Going to onboarding...");
  await page.goto('http://localhost:3001/onboarding');
  await new Promise(r => setTimeout(r, 2000));
  
  // Step 1: Next
  console.log("Onboarding step 1...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const nextBtn = btns.find(b => b.textContent.includes('Next'));
    if(nextBtn) nextBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  
  // Step 2: inputs
  console.log("Onboarding step 2...");
  await page.evaluate(() => {
    const inputs = document.querySelectorAll('input[type="number"]');
    if(inputs.length >= 3) {
      inputs[0].value = '180';
      inputs[1].value = '160';
      inputs[2].value = '70';
      inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
      inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
      inputs[2].dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const nextBtn = btns.find(b => b.textContent.includes('Next'));
    if(nextBtn) nextBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  
  // Step 3: display name
  console.log("Onboarding step 3...");
  await page.evaluate(() => {
    const textInput = document.querySelector('input[type="text"]');
    if(textInput) {
      textInput.value = 'TestUser';
      textInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const btns = Array.from(document.querySelectorAll('button'));
    const completeBtn = btns.find(b => b.textContent.includes('Complete'));
    if(completeBtn) completeBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 4000));
  
  console.log("Going to dashboard...");
  await page.goto('http://localhost:3001/dashboard');
  await new Promise(r => setTimeout(r, 5000));
  
  await page.screenshot({ path: '/home/alucard/.gemini/antigravity/brain/e4fa1729-f203-4ab8-b386-95aa534b7deb/dashboard_greeting.png' });
  console.log("Saved dashboard screenshot");
  
  const html2 = await page.content();
  fs.writeFileSync('dashboard.html', html2);
  
  await browser.close();
})();
