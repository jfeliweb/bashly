import { expect, test } from '@playwright/test';

/**
 * E2E test: sign in and create an event via the dashboard (3-step form).
 *
 * Requires authenticated test user. Set in env (e.g. .env.local or CI):
 *   E2E_TEST_USER_EMAIL
 *   E2E_TEST_USER_PASSWORD
 *
 * Run from command line (from repo root or apps/web):
 *   cd apps/web && npm run test:e2e -- tests/e2e/CreateEvent.e2e.ts
 * With env from .env.local:
 *   cd apps/web && npm run test:e2e:create-event
 * Or:
 *   npx playwright test tests/e2e/CreateEvent.e2e.ts
 */
test.describe('Create Event', () => {
  test('sign in and create an event through the 3-step form', async ({
    page,
    baseURL,
  }) => {
    const email = process.env.E2E_TEST_USER_EMAIL;
    const password = process.env.E2E_TEST_USER_PASSWORD;

    // Skip when credentials not set (e.g. CI without E2E user)
    test.skip(!email || !password, 'E2E_TEST_USER_EMAIL and E2E_TEST_USER_PASSWORD must be set');

    const root = baseURL ?? 'http://localhost:3000';
    const localePrefix = '/en';

    // Sign in
    await page.goto(`${root}${localePrefix}/sign-in`);
    await page.getByLabel('Email').fill(email!);
    await page.getByLabel('Password').fill(password!);
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Wait for redirect to dashboard (or dashboard events list); allow time for auth round-trip
    const dashboardUrlRegex = /\/(en\/)?dashboard(\/)?(\?.*)?$/;
    try {
      await expect(page).toHaveURL(dashboardUrlRegex, { timeout: 15000 });
    } catch {
      const errorEl = page.locator('[class*="bg-destructive"]').first();
      const errText = (await errorEl.textContent())?.trim();
      throw new Error(
        errText
          ? `Sign-in failed: ${errText} (check E2E_TEST_USER_EMAIL / E2E_TEST_USER_PASSWORD and email verification)`
          : 'Sign-in failed: no redirect and no error message (check credentials and that the app is running)',
      );
    }

    await page.goto(`${root}${localePrefix}/dashboard/events/new`);

    // Step 1: Choose event type (e.g. Sweet 16)
    await expect(
      page.getByRole('heading', { name: /What are you celebrating\?/i }),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Sweet 16' }).click();

    // Step 2: Fill event details
    await expect(
      page.getByRole('heading', { name: /Tell us about your event/i }),
    ).toBeVisible();

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const dateStr = futureDate.toISOString().slice(0, 10);
    const title = `E2E Event ${Date.now()}`;

    await page.getByLabel('Event Name').fill(title);
    await page.getByLabel('Date').fill(dateStr);
    await page.getByLabel('Time').fill('18:00');
    await page.getByLabel('Venue Name').fill('Test Venue');
    await page.getByLabel('Venue Address').fill('123 Test St');
    await page.getByRole('button', { name: 'Next →' }).click();

    // Step 3: Set features and create
    await expect(
      page.getByRole('heading', { name: /Set up your features/i }),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Create Event' }).click();

    // Expect redirect to event detail page
    await expect(page).toHaveURL(/\/(en\/)?dashboard\/events\/[a-f0-9-]+$/);
    await expect(page.getByText(title)).toBeVisible();
  });
});
