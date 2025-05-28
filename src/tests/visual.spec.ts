import { test, expect, Page } from '@playwright/test';
import { ImageComparison } from '../utils/image-diff';

test.describe('Visual Tests', () => {
  const timestamp = '2025-05-28 11:09:35';
  const currentUser = 'waseem';
  let imageComparison: ImageComparison;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    imageComparison = new ImageComparison();
    const context = await browser.newContext({
      viewport: { width: 1024, height: 768 }
    });
    page = await context.newPage();
    console.log(`Test setup initialized at ${timestamp} by ${currentUser}`);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('homepage-visual-comparison', async () => {
    console.log(`Starting visual test at ${timestamp}`);
    console.log(`Test running by user: ${currentUser}`);
    console.log('Page dimensions:', await page.viewportSize());

    try {
      await page.goto('https://levatus.ch/fr/');
      await page.waitForLoadState('networkidle');

      await page.addStyleTag({
        content: `
          * {
            max-width: 100% !important;
            overflow-x: hidden !important;
          }
          body {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow-x: hidden !important;
          }
        `
      });

      await autoScroll(page);

      const testName = 'homepage-visual-comparison';
      const diffResult = await imageComparison.compareScreenshots(page, testName);
      const reportPath = imageComparison.generateDiffReport(testName, diffResult);
      
      console.log(`
        Test Results:
        - Timestamp: ${timestamp}
        - User: ${currentUser}
        - Report Path: ${reportPath}
        - Diff Percentage: ${diffResult.diffPercentage.toFixed(2)}%
      `);

      expect(diffResult.diffPercentage).toBeLessThanOrEqual(0.1);

    } catch (error) {
      console.error(`
        Test failed at ${timestamp}
        User: ${currentUser}
        Error: ${error}
      `);
      throw error;
    }
  });
});

async function autoScroll(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.documentElement.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          window.scrollTo(0, scrollHeight);
          resolve();
        }
      }, 100);
    });
  });

  await page.waitForTimeout(1000);
}