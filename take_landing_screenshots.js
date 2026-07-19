const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  // We want full page, so we can just use fullPage: true in screenshot
  await page.setViewport({ width: 1280, height: 800 });

  console.log('Navigating to landing page...');
  await page.goto('http://localhost:3001/');
  
  // Wait for animations
  await new Promise(r => setTimeout(r, 1000));

  // Take light mode screenshot
  console.log('Capturing Light Mode...');
  await page.screenshot({ path: 'screenshots/landing_light.png', fullPage: true });

  // Toggle Dark Mode
  console.log('Toggling Dark Mode...');
  // Click the theme toggle button. We know it has a sun/moon icon. Let's just click the button inside the ThemeToggle component.
  // The ThemeToggle component has a button that opens a dropdown, and then we click "Dark".
  // Actually, we can just inject a class if the dropdown is hard to click
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
  });
  
  await new Promise(r => setTimeout(r, 500));

  // Take dark mode screenshot
  console.log('Capturing Dark Mode...');
  await page.screenshot({ path: 'screenshots/landing_dark.png', fullPage: true });

  await browser.close();
  console.log('Done!');
})();
