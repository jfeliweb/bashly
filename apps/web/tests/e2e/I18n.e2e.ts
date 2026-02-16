import { expect, test } from '@playwright/test';

test.describe('I18n', () => {
  test.describe('Language Switching', () => {
    test('should switch language from English to French using dropdown and verify text on the homepage', async ({ page }) => {
      await page.goto('/');

      await expect(page.getByText('The perfect SaaS template to build')).toBeVisible();

      await page.getByRole('button', { name: 'lang-switcher' }).click();
      await page.getByText('Français').click();

      await expect(page.getByText('Le parfait SaaS template pour construire')).toBeVisible();
    });

    test('should switch language from English to French using URL and verify text on the sign-in page', async ({ page }) => {
      await page.goto('/sign-in');

      await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();

      await page.goto('/fr/sign-in');

      await expect(page.getByRole('heading', { name: 'Se connecter' })).toBeVisible();
    });
  });
});
