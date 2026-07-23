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

  // Threat Intel Page
  await page.goto('http://localhost:5173/threat-intel');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'C:/Users/ASUS/.gemini/antigravity-cli/brain/3e50e045-6e3b-458a-9219-309d09f62fb7/threat_intel_search.png' });

  // Vulnerabilities Page
  await page.goto('http://localhost:5173/vulnerabilities');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'C:/Users/ASUS/.gemini/antigravity-cli/brain/3e50e045-6e3b-458a-9219-309d09f62fb7/vulnerabilities_remediation.png' });

  // Reports Page
  await page.goto('http://localhost:5173/reports');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'C:/Users/ASUS/.gemini/antigravity-cli/brain/3e50e045-6e3b-458a-9219-309d09f62fb7/executive_pdf_reports.png' });

  await browser.close();
  console.log('SUCCESS: All 3 screenshots saved successfully!');
})();
