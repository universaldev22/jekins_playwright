import { PlaywrightTestConfig } from '@playwright/test';
import path from 'path';

const config: PlaywrightTestConfig = {
  testDir: './src/tests',
  timeout: 30000,
  expect: {
    timeout: 5000,
    toMatchSnapshot: {
      maxDiffPixels: 100,
      threshold: 0.1,
    }
  },
  use: {
    viewport: {
      width: 1024,
      height: 768,
    },
    screenshot: {
      mode: 'on',
      fullPage: true,
    },
    baseURL: 'https://levatus.ch/fr/',
    actionTimeout: 2000,
    navigationTimeout: 30000,
  },
  snapshotPathTemplate: '{snapshotDir}/{testFilePath}/{arg}{ext}',
  snapshotDir: './snapshots',
  outputDir: './test-results',
  reporter: [
    ['list'],
    ['html', { outputFolder: './test-report' }]
  ],
  testMatch: '**/*.spec.ts',
  preserveOutput: 'always',
  workers: 1
};

export default config;