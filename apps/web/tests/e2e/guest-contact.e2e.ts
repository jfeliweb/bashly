import { expect, test } from '@playwright/test';

/**
 * E2E test: Guest contact form on event page.
 *
 * Creates an event, enables contact in settings, navigates to guest page,
 * fills and submits the contact form, asserts success.
 * Also verifies the contact section is hidden when contactEnabled = false.
 *
 * Requires: E2E_TEST_USER_EMAIL, E2E_TEST_USER_PASSWORD
 *
 * Run: npm run test:e2e:create-event (or with .env.local)
 *   cd apps/web && dotenv -e .env.local -- playwright test tests/e2e/guest-contact.e2e.ts
 */
test.describe('Guest Contact', () => {
  test('contact section hidden when disabled, visible and submittable when enabled', async ({
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
    const title = `Contact E2E ${Date.now()}`;

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

    // Publish event first so guest page is accessible
    await page.getByRole('button', { name: /Publish Event/i }).click();

    await expect(page.getByText(/Published/i)).toBeVisible({ timeout: 5000 });

    // Get slug from View Guest Page link
    const viewGuestLink = page.getByRole('link', { name: /View Guest Page/i });
    const href = await viewGuestLink.getAttribute('href');
    const slug = href?.match(/\/e\/([a-z0-9-]+)/)?.[1];

    expect(slug).toBeDefined();

    // Visit guest page — contact section should NOT be visible (disabled by default)
    await page.goto(`${root}${localePrefix}/e/${slug}`);

    await expect(page.getByRole('button', { name: /RSVP Now/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Questions\? Contact the Host/i })).toBeHidden();

    // Go to edit, enable contact
    await page.goto(`${root}${localePrefix}/dashboard/events/${eventId}/edit`);

    await expect(page.getByRole('heading', { name: /Edit Event|Tell us about your event/i })).toBeVisible({ timeout: 5000 });

    const contactToggle = page.getByRole('switch', { name: /Allow guests to send you messages/i });
    await contactToggle.click();

    await page.getByRole('button', { name: /Save changes/i }).click();

    await expect(page.getByText(/saved|Changes saved/i)).toBeVisible({ timeout: 5000 });

    // Navigate to guest page
    await page.goto(`${root}${localePrefix}/e/${slug}`);

    // Contact section should now be visible
    await expect(page.getByRole('heading', { name: /Questions\? Contact the Host/i })).toBeVisible();

    // Fill and submit contact form
    await page.getByLabel(/Your Name/i).fill('E2E Guest');
    await page.getByLabel(/Your Email/i).fill('e2e-guest@example.com');
    await page.getByLabel(/Subject/i).fill('E2E Test Question');
    await page.getByLabel(/Message/i).fill('This is an E2E test message to verify the contact form works.');
    await page.getByRole('button', { name: /Send Message/i }).click();

    // Assert success toast
    await expect(page.getByText(/message was sent|sent successfully/i)).toBeVisible({ timeout: 5000 });
  });
});
