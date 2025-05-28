import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

export interface DiffResult {
  diffCount: number;
  diffPercentage: number;
  diffPath: string;
}

export class ImageComparison {
  constructor(
    private readonly snapshotsDir: string = './snapshots',
    private readonly resultsDir: string = './test-results',
    private readonly diffDir: string = './test-results/diff'
  ) {
    // Create directories if they don't exist
    [this.snapshotsDir, this.resultsDir, this.diffDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async compareScreenshots(
    page: Page,
    testName: string,
    threshold: number = 0.1
  ): Promise<DiffResult> {
    const timestamp = '2025-05-28 11:09:35';
    const baselinePath = path.join(this.snapshotsDir, `${testName}.png`);
    const currentPath = path.join(this.resultsDir, `${testName}.png`);
    const diffPath = path.join(this.diffDir, `${testName}-diff.png`);

    // Take current screenshot
    await page.screenshot({
      path: currentPath,
      fullPage: true
    });

    // If no baseline exists, copy current as baseline
    if (!fs.existsSync(baselinePath)) {
      fs.copyFileSync(currentPath, baselinePath);
      console.log(`Created baseline image at ${timestamp}`);
      return { diffCount: 0, diffPercentage: 0, diffPath };
    }

    // Read images
    const baseline = PNG.sync.read(fs.readFileSync(baselinePath));
    const current = PNG.sync.read(fs.readFileSync(currentPath));

    // Create diff PNG
    const { width, height } = baseline;
    const diff = new PNG({ width, height });

    // Compare images
    const diffCount = pixelmatch(
      baseline.data,
      current.data,
      diff.data,
      width,
      height,
      { threshold }
    );

    // Calculate diff percentage
    const totalPixels = width * height;
    const diffPercentage = (diffCount / totalPixels) * 100;

    // Save diff image
    fs.writeFileSync(diffPath, PNG.sync.write(diff));

    console.log(`
      Image comparison at ${timestamp}:
      - Diff pixels: ${diffCount}
      - Diff percentage: ${diffPercentage.toFixed(2)}%
      - Diff image saved to: ${diffPath}
    `);

    return { diffCount, diffPercentage, diffPath };
  }

  generateDiffReport(testName: string, diffResult: DiffResult): string {
    const reportPath = path.join(this.resultsDir, `${testName}-report.html`);
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Visual Regression Test Report - ${testName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .image-container { display: flex; gap: 20px; margin-top: 20px; }
          .image-box { flex: 1; }
          img { max-width: 100%; border: 1px solid #ccc; }
          .diff-info { 
            background: ${diffResult.diffPercentage > 0 ? '#ffe6e6' : '#e6ffe6'};
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <h1>Visual Regression Test Report</h1>
        <div class="diff-info">
          <p>Test: ${testName}</p>
          <p>Timestamp: 2025-05-28 11:09:35</p>
          <p>User: waseem</p>
          <p>Diff Pixels: ${diffResult.diffCount}</p>
          <p>Diff Percentage: ${diffResult.diffPercentage.toFixed(2)}%</p>
        </div>
        <div class="image-container">
          <div class="image-box">
            <h3>Baseline</h3>
            <img src="../snapshots/${testName}.png" alt="Baseline">
          </div>
          <div class="image-box">
            <h3>Current</h3>
            <img src="${testName}.png" alt="Current">
          </div>
          <div class="image-box">
            <h3>Diff</h3>
            <img src="diff/${testName}-diff.png" alt="Diff">
          </div>
        </div>
      </body>
      </html>
    `;

    fs.writeFileSync(reportPath, html);
    return reportPath;
  }
}