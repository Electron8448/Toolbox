import { expect, test } from '@playwright/test';

test('mobile homepage fits and the sidebar opens a subcategory', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Browse categories' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize().width);
  await page.getByRole('button', { name: 'Open menu' }).tap();
  const sidebar = page.getByRole('dialog', { name: 'Navigation' });
  await sidebar.locator('summary').filter({ hasText: /^Maths$/ }).tap();
  await sidebar.getByRole('link', { name: 'Fractions', exact: true }).tap();
  await expect(sidebar).toBeHidden();
  await expect(page.getByRole('link', { name: /^Fraction Simplifier/ })).toBeVisible();
});
