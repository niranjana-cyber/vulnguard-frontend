const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Login
  await page.goto('http://localhost:5173/login');
  await page.fill('#username', 'owner');
  await page.fill('#password', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);

  // Employees Page Screenshot
  await page.goto('http://localhost:5173/employees');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'C:/Users/ASUS/.gemini/antigravity-cli/brain/3e50e045-6e3b-458a-9219-309d09f62fb7/employees_page_fixed.png' });

  // Reports Preview Data Screenshot
  await page.goto('http://localhost:5173/reports');
  await page.waitForTimeout(2000);
  await page.click('button:has-text("Preview Data")');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'C:/Users/ASUS/.gemini/antigravity-cli/brain/3e50e045-6e3b-458a-9219-309d09f62fb7/reports_preview_data_fixed.png' });

  await browser.close();
  console.log('SUCCESS: All verification screenshots saved!');
})();
