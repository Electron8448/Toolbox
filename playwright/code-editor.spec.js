import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

test('Code Editor formats, saves drafts, previews and exports a page', async ({ page }) => {
  await page.goto('/developer-tools/utilities');
  await page.getByRole('link', { name: /^Code Editor/ }).click();
  const panel = page.getByRole('tabpanel');
  const select = async name => page.getByRole('tab', { name }).click();
  const insert = async text => {
    await panel.locator('.monaco-editor').click({ position: { x: 90, y: 12 } });
    await page.keyboard.insertText(text);
  };

  await insert('<h1>Before</h1>');
  await select('styles.css');
  await insert('h1{color:green;}');
  await page.getByRole('button', { name: 'Format', exact: true }).click();
  await expect(panel.locator('textarea[name="css"]')).toHaveValue(/color: green/);
  await page.getByRole('button', { name: 'Find', exact: true }).click();
  await expect(panel.locator('.find-widget')).toBeVisible();
  await page.keyboard.press('Escape');

  await select('script.js');
  await insert("const heading = document.querySelector('h1');\nheading.textContent = 'After';");
  await page.reload();
  await expect(panel.locator('.monaco-editor')).toBeVisible();
  await expect(panel.locator('textarea[name="html"]')).toHaveValue('<h1>Before</h1>');
  await page.getByRole('button', { name: 'Run preview' }).click();

  const frame = page.locator('iframe[title="Document preview"]');
  await expect(frame).toHaveAttribute('sandbox', 'allow-scripts');
  const heading = frame.contentFrame().getByRole('heading', { name: 'After' });
  await expect(heading).toBeVisible();
  await expect(heading).toHaveCSS('color', 'rgb(0, 128, 0)');

  const pending = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download HTML' }).click();
  const download = await pending;
  expect(download.suggestedFilename()).toBe('index.html');
  expect(await readFile(await download.path(), 'utf8')).toContain('<h1>Before</h1>');
});
