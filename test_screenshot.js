const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  // Set dark mode preferred color scheme
  await page.emulateMediaFeatures([
    { name: 'prefers-color-scheme', value: 'dark' }
  ]);
  
  await page.goto('http://localhost:3000/settings', { waitUntil: 'networkidle0' });
  
  // Ensure dark mode is active by setting localStorage and injecting the class
  await page.evaluate(() => {
    localStorage.setItem('theme', 'dark');
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
  });
  
  // Wait a moment for transitions
  await new Promise(r => setTimeout(r, 500));
  
  await page.screenshot({ path: 'settings-dark-mode.png', fullPage: true });
  await browser.close();
  console.log('Screenshot saved to settings-dark-mode.png');
})();
