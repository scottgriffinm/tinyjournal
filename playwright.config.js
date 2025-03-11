import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

export default defineConfig({
  testDir: './tests', // Location of tests
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000', // Change as needed
    headless: true,  // Run tests in headless mode
    viewport: { width: 1280, height: 720 },
  },
  workers: 1, // Run tests sequentially (helps with debugging DB issues)
  timeout: 30000, // Increase timeout if DB queries are slow
});