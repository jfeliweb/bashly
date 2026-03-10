import { expect, test } from '@playwright/test';

/**
 * E2E test: RSVP form on guest event page.
 *
 * Creates an event, publishes it, navigates to guest page,
 * fills and submits the RSVP form, asserts success.
 * Submits a second RSVP with different email and verifies both exist (no overwrite).
 *
 * Requires: E2E_TEST_USER_EMAIL, E2E_TEST_USER_PASSWORD
 *
 * Run: cd apps/web && npm run test:e2e:guest-rsvp
 */
test.describe('Guest RSVP', () => {
  test('RSVP form submits successfully and multiple guests create separate rows', async ({
    page,
    baseURL,
  }) => {
    const email = process.env.E2E_TEST_USER_EMAIL;
    const password = process.env.E2E_TEST_USER_PASSWORD;

    expect(email, 'E2E_TEST_USER_EMAIL must be set').toBeDefined();
    expect(password, 'E2E_TEST_USER_PASSWORD must be set').toBeDefined();
    expect(baseURL, 'baseURL must be set').toBeDefined();

    const root = baseURL as string;
    const localePrefix = '/en';

    // Sign in
    await page.goto(`${root}${localePrefix}/sign-in`);
    await page.getByLabel('Email').fill(email!);
    await page.getByLabel('Password').fill(password!);
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page).toHaveURL(/\/(en\/)?dashboard(\/)?/, { timeout: 15000 });

    // Create event
    await page.goto(`${root}${localePrefix}/dashboard/events/new`);
    await page.getByRole('button', { name: 'Sweet 16' }).click();

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const dateStr = futureDate.toISOString().slice(0, 10);
    const title = `RSVP E2E ${Date.now()}`;

    await page.getByLabel('Event Name').fill(title);
    await page.getByLabel('Date').fill(dateStr);
    await page.getByLabel('Time').fill('18:00');
    await page.getByLabel('Venue Name').fill('Test Venue');
    await page.getByRole('button', { name: 'Next →' }).click();
    await page.getByRole('button', { name: 'Create Event' }).click();

    await expect(page).toHaveURL(/\/(en\/)?dashboard\/events\/[a-f0-9-]+$/);

    const eventUrl = page.url();
    const eventId = eventUrl.split('/events/')[1]?.split('/')[0]?.split('?')[0] ?? eventUrl.split('/').pop();

    expect(eventId).toBeDefined();

    // Publish event
    await page.getByRole('button', { name: /Publish Event/i }).click();

    await expect(page.getByText(/Published/i)).toBeVisible({ timeout: 5000 });

    // Get slug from View Guest Page link
    const viewGuestLink = page.getByRole('link', { name: /View Guest Page/i });
    const href = await viewGuestLink.getAttribute('href');
    const slug = href?.match(/\/e\/([a-z0-9-]+)/)?.[1];

    expect(slug).toBeDefined();

    // Visit guest page
    await page.goto(`${root}${localePrefix}/e/${slug}`);

    await expect(page.getByRole('button', { name: /RSVP Now/i })).toBeVisible();

    // First RSVP
    await page.getByRole('button', { name: /RSVP Now/i }).click();

    await page.getByLabel(/Name/i).fill('E2E Guest One');
    await page.getByLabel(/Email/i).fill('e2e-rsvp-1@example.com');
    await page.getByLabel(/\+1s|plus ones/i).fill('1');
    await page.getByRole('button', { name: /Confirm RSVP/i }).click();

    await expect(page.getByText(/You're on the list|on the list/i)).toBeVisible({ timeout: 5000 });

    await page.getByRole('button', { name: /Done/i }).click();

    // Second RSVP (different email — should create new row, not overwrite)
    await page.getByRole('button', { name: /RSVP Now/i }).click();

    await page.getByLabel(/Name/i).fill('E2E Guest Two');
    await page.getByLabel(/Email/i).fill('e2e-rsvp-2@example.com');
    await page.getByLabel(/\+1s|plus ones/i).fill('0');
    await page.getByRole('button', { name: /Confirm RSVP/i }).click();

    await expect(page.getByText(/You're on the list|on the list/i)).toBeVisible({ timeout: 5000 });

    // Verify both RSVPs exist via dashboard RSVP count
    await page.goto(`${root}${localePrefix}/dashboard/events/${eventId}`);

    await expect(page.locator('[aria-labelledby="stats-heading"]')).toContainText('2');
  });

  test('RSVP form works in mobile viewport', async ({ page, baseURL }) => {
    const slug = process.env.GUEST_EVENT_SLUG;

    expect(slug, 'GUEST_EVENT_SLUG must be set').toBeDefined();
    expect(baseURL, 'baseURL must be set').toBeDefined();

    const root = baseURL as string;
    const localePrefix = '/en';

    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${root}${localePrefix}/e/${slug}`);

    await expect(page.getByRole('button', { name: /RSVP Now/i })).toBeVisible();

    await page.getByRole('button', { name: /RSVP Now/i }).click();

    await page.getByLabel(/Name/i).fill('Mobile E2E Guest');
    await page.getByLabel(/Email/i).fill(`mobile-e2e-${Date.now()}@example.com`);
    await page.getByRole('button', { name: /Confirm RSVP/i }).click();

    await expect(page.getByText(/You're on the list|on the list/i)).toBeVisible({ timeout: 5000 });
  });
});
