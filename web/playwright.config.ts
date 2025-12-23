import { defineConfig } from '@playwright/test';

const baseURL = process.env.BASE_URL ?? 'http://127.0.0.1:4173';
const resolverRules = process.env.HOST_RESOLVER_RULES;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: 0,
  reporter: 'line',
  use: {
    baseURL,
    channel: 'chrome',
    headless: true,
    trace: 'retain-on-failure',
    launchOptions: resolverRules ? { args: [`--host-resolver-rules=${resolverRules}`] } : {},
  },
});
