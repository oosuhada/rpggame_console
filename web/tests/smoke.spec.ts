import { expect, test, type Page } from '@playwright/test';

function watchRuntimeErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
}

test('desktop combat flow, local save, items, and restart work', async ({ page }) => {
  const errors = watchRuntimeErrors(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(page).toHaveTitle(/Avengers RPG Console/);
  await page.getByTestId('button-deploy-hero').click();
  await expect(page.getByTestId('panel-action-dock')).toBeVisible();

  const enemyBefore = await page.getByTestId('value-health-enemy').textContent();
  await page.getByTestId('button-basic-attack').click();
  await expect(page.getByTestId('value-health-enemy')).not.toHaveText(enemyBefore ?? '');

  await page.getByTestId('button-defend').click();
  await expect(page.getByTestId('button-use-medkit')).toBeEnabled();
  await page.getByTestId('button-use-medkit').click();

  await page.getByTestId('button-skill-repulsor-burst').click();
  await expect(page.getByTestId('button-use-energy-cell')).toBeEnabled();
  await page.getByTestId('button-use-energy-cell').click();
  await page.getByTestId('button-save-battle').click();
  await expect.poll(() => page.evaluate(() => Boolean(localStorage.getItem('avengers-rpg-browser-save')))).toBe(true);

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByTestId('button-abandon-run').click();
  await expect(page.getByTestId('button-deploy-hero')).toBeVisible();
  expect(errors).toEqual([]);
});

test('mobile selection and battle stay inside the viewport', async ({ page }) => {
  const errors = watchRuntimeErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByTestId('hero-selection-grid')).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByTestId('button-deploy-hero').click();
  await expect(page.getByTestId('panel-action-dock')).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
