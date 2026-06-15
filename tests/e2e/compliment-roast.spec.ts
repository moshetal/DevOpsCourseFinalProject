import { test, expect } from '@playwright/test';

// Five validations mixing positive/negative and assert(hard)/verify(soft).
test.describe('Compliment-o-Roast', () => {
  // 1. Positive · assert — the page and its controls load.
  test('page loads with input and both buttons', async ({ page }) => {
    await page.goto('./');
    await expect(page).toHaveTitle('Compliment-o-Roast');
    await expect(page.locator('#nameInput')).toBeVisible();
    await expect(page.getByRole('button', { name: /Compliment/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Roast/ })).toBeVisible();
  });

  // 2. Positive · assert — Compliment returns a green result containing the name.
  test('compliment produces a green result containing the name', async ({ page }) => {
    await page.goto('./');
    await page.locator('#nameInput').fill('Dor');
    await page.getByRole('button', { name: /Compliment/ }).click();
    const box = page.locator('.result-box');
    await expect(box).toBeVisible();
    await expect(box).toHaveClass(/result-compliment/);
    await expect(box.locator('.result-text')).toContainText('Dor');
  });

  // 3. Positive · assert — Roast returns a red result containing the name.
  test('roast produces a red result containing the name', async ({ page }) => {
    await page.goto('./');
    await page.locator('#nameInput').fill('Amit');
    await page.getByRole('button', { name: /Roast/ }).click();
    const box = page.locator('.result-box');
    await expect(box).toBeVisible();
    await expect(box).toHaveClass(/result-roast/);
    await expect(box.locator('.result-text')).toContainText('Amit');
  });

  // 4. Negative · assert — submitting an empty name shows the error and no result.
  test('empty name shows an error message', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: /Compliment/ }).click();
    const error = page.locator('#errorBox');
    await expect(error).toBeVisible();
    await expect(error).toContainText('Please enter a name first.');
    await expect(page.locator('.result-box')).toHaveCount(0);
  });

  // 5. Verify · soft — secondary UI: GitHub link + badge are present (non-blocking).
  test('github link and badge are present', async ({ page }) => {
    await page.goto('./');
    await expect.soft(page.locator('.footer a')).toHaveAttribute('href', /github\.com/);
    await expect.soft(page.locator('.badge')).toContainText('MTA DevOps Final Project');
  });
});
