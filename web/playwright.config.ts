import { defineConfig } from '@playwright/test';

const baseURL = process.env.BASE_URL ?? 'http://127.0.0.1:4173/rpg_console/';
const resolverRules = process.env.HOST_RESOLVER_RULES;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: 0,
  reporter: 'line',
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: 'npm run preview',
        url: baseURL,
        reuseExistingServer: true,
      },
  use: {
    baseURL,
    channel: 'chrome',
    headless: true,
    trace: 'retain-on-failure',
    launchOptions: resolverRules ? { args: [`--host-resolver-rules=${resolverRules}`] } : {},
  },
});
